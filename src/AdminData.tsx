import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import ResultsChart, { type ResultItem } from './components/ResultsChart';
import { adminQuestions } from './adminLabels';

type AdminData = { ok: true; n: number; excluded: number; lastUpdated: string; fields: Record<string, Record<string, number>>; answered: Record<string, number> };
const endpoint = 'https://alkohol-ja-aju.vercel.app/api/admin-data';

/** Turn the server's error code into something the admin can act on. */
function explain(status: number, code?: string): string {
  const tail = ` (HTTP ${status}${code ? `, ${code}` : ''})`;
  switch (code) {
    case 'unauthorised': return 'Сессия истекла или токен не принят. Выйдите и войдите снова.' + tail;
    case 'forbidden': return 'Этот аккаунт не в списке администраторов (ADMIN_EMAILS в Vercel).' + tail;
    case 'admin_not_configured': return 'На сервере не заданы ADMIN_EMAILS, SUPABASE_URL или SUPABASE_ANON_KEY. Добавьте их в Vercel и сделайте Redeploy.' + tail;
    case 'auth_unreachable': return 'Сервер не смог проверить вход в Supabase. Проверьте SUPABASE_URL.' + tail;
    case 'summary_not_configured': return 'В Vercel не заданы SHEET_WEBHOOK_URL или SHEET_WEBHOOK_SECRET.' + tail;
    case 'summary_url_invalid': return 'SHEET_WEBHOOK_URL в Vercel должен быть адресом script.google.com/.../exec.' + tail;
    case 'upstream_failed_or_script_outdated': return 'Google-скрипт ответил ошибкой или устарел. Вставьте код версии 10 и разверните «Новую версию» того же развёртывания.' + tail;
    case 'summary_unreachable': return 'Сервер не смог связаться с Google Apps Script (таймаут или неверный адрес).' + tail;
    default: return (status === 404 ? 'API /api/admin-data не найден: деплой в Vercel ещё не обновился (нужен коммит faf936b или новее).' : 'Данные сейчас получить не удалось.') + tail;
  }
}

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
        if (r.ok && body?.ok) return body as AdminData;
        throw new Error(explain(r.status, body?.error));
      }, () => { throw new Error('Не удалось связаться с сервером alkohol-ja-aju.vercel.app. Проверьте интернет или что деплой в Vercel завершился.'); })
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
