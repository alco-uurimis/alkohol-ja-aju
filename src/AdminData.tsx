import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import ResultsChart, { type ResultItem } from './components/ResultsChart';
import { adminQuestions } from './adminLabels';

type AdminData = { ok: true; n: number; excluded: number; lastUpdated: string; fields: Record<string, Record<string, number>>; answered: Record<string, number> };
const endpoint = 'https://alkohol-ja-aju.vercel.app/api/admin-data';

function items(key: string, counts: Record<string, number>): ResultItem[] {
  const order = Object.keys(adminQuestions[key]?.codes ?? {});
  return Object.entries(counts)
    .map(([code, count]) => ({ code, label: adminQuestions[key]?.codes[code] ?? code, count }))
    .sort((a, b) => (order.indexOf(a.code) < 0 ? 99 : order.indexOf(a.code)) - (order.indexOf(b.code) < 0 ? 99 : order.indexOf(b.code)));
}

/** Uncensored results for the signed-in, allow-listed admin. Access is enforced on the server, not here. */
export default function AdminData() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!supabase) { setReady(true); return; }
    supabase.auth.getSession().then(({ data: d }) => { setSession(d.session); setReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setData(null); return; }
    let alive = true;
    setError('');
    fetch(endpoint, { headers: { Authorization: `Bearer ${session.access_token}` }, cache: 'no-store' })
      .then(async r => {
        const body = await r.json().catch(() => null);
        if (r.status === 403) throw new Error('Этот аккаунт не в списке администраторов.');
        if (r.status === 401) throw new Error('Сессия истекла. Войди снова.');
        if (!r.ok || !body?.ok) throw new Error(body?.error === 'upstream_failed_or_script_outdated' ? 'Google Apps Script нужно обновить до версии 10 и развернуть заново.' : 'Данные сейчас получить не удалось.');
        return body as AdminData;
      })
      .then(d => { if (alive) setData(d); })
      .catch(e => { if (alive) setError(e instanceof Error ? e.message : 'Ошибка.'); });
    return () => { alive = false; };
  }, [session]);

  const signIn = () => supabase?.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + location.pathname } });

  if (!supabase) return null;
  return (
    <section className="admin-card admin-data">
      <p className="admin-kicker">ПОЛНЫЕ ДАННЫЕ БЕЗ СКРЫТИЯ</p>
      <h2>Просмотр по аккаунту Google</h2>
      {!ready ? <p>Загрузка…</p> : !session ? (
        <>
          <p>Войди аккаунтом администратора. Сервер сам проверит, что аккаунт в списке. Здесь показаны все категории, даже с 1–4 ответами. Не публикуй и не пересылай эти цифры.</p>
          <button type="button" className="admin-signin" onClick={signIn}>Войти через Google</button>
        </>
      ) : (
        <>
          <p className="admin-who">Вы вошли как {session.user.email} · <button type="button" className="admin-link" onClick={() => supabase?.auth.signOut()}>Выйти</button></p>
          {error && <p role="alert" className="admin-error">{error}</p>}
          {!data && !error && <p>Загрузка данных…</p>}
          {data && (
            <>
              <p className="admin-meta">Валидных ответов: <b>{data.n}</b> · Исключено (старые схемы и без согласия): {data.excluded} · Обновлено {new Date(data.lastUpdated).toLocaleString('ru-RU')}</p>
              <div className="admin-grid">
                {Object.keys(adminQuestions).filter(k => data.fields[k] && Object.keys(data.fields[k]).length > 0).map(k => {
                  const base = adminQuestions[k].multi ? data.n : (data.answered[k] ?? data.n);
                  return (
                    <div className="admin-q" key={k}>
                      <h3>{adminQuestions[k].title}</h3>
                      <ResultsChart items={items(k, data.fields[k])} total={base} ariaLabel={adminQuestions[k].title} countWord="отв." />
                      <p className="result-base">{adminQuestions[k].multi ? `Доля от всех участников (${data.n}); можно выбрать несколько.` : `Ответили ${data.answered[k] ?? 0} из ${data.n}.`}</p>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
