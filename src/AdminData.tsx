import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import ResultsChart, { type ResultItem } from './components/ResultsChart';
import { adminQuestions } from './adminLabels';
import { AdminReport, PrePostCard, type PrePostSummary } from './AdminReport';
import { A, adminLang, adminLocale, setAdminLang } from './adminI18n';

type AdminData = { ok: true; n: number; excluded: number; lastUpdated: string; fields: Record<string, Record<string, number>>; answered: Record<string, number>; prepost?: PrePostSummary; source?: 'sheet' | 'supabase' };
const endpoint = 'https://alkohol-ja-aju.vercel.app/api/admin-data';
const DELETE_ENDPOINT = 'https://alkohol-ja-aju.vercel.app/api/admin-delete-response';

/** Turn the server's error code into something the admin can act on. */
function explain(status: number, code?: string): string {
  const tail = ` (HTTP ${status}${code ? `, ${code}` : ''})`;
  switch (code) {
    case 'unauthorised': return A('Сессия истекла или токен не принят. Выйдите и войдите снова.') + tail;
    case 'forbidden': return A('Этот аккаунт не в списке администраторов (ADMIN_EMAILS в Vercel).') + tail;
    case 'admin_not_configured': return A('На сервере не заданы ADMIN_EMAILS, SUPABASE_URL или SUPABASE_ANON_KEY. Добавьте их в Vercel и сделайте Redeploy.') + tail;
    case 'auth_unreachable': return A('Сервер не смог проверить вход в Supabase. Проверьте SUPABASE_URL.') + tail;
    case 'summary_not_configured': return A('В Vercel не заданы SHEET_WEBHOOK_URL или SHEET_WEBHOOK_SECRET.') + tail;
    case 'summary_url_invalid': return A('SHEET_WEBHOOK_URL в Vercel должен быть адресом script.google.com/.../exec.') + tail;
    case 'upstream_failed_or_script_outdated': return A('Google-скрипт ответил ошибкой или устарел. Вставьте код версии 10 и разверните «Новую версию» того же развёртывания.') + tail;
    case 'summary_unreachable': return A('Сервер не смог связаться с Google Apps Script (таймаут или неверный адрес).') + tail;
    default: return (status === 404 ? A('API /api/admin-data не найден: деплой в Vercel ещё не обновился (нужен коммит faf936b или новее).') : A('Данные сейчас получить не удалось.')) + tail;
  }
}

function items(key: string, counts: Record<string, number>): ResultItem[] {
  const order = Object.keys(adminQuestions[key]?.codes ?? {});
  return Object.entries(counts)
    .map(([code, count]) => ({ code, label: adminQuestions[key]?.codes[code] ?? code, count }))
    .sort((a, b) => (order.indexOf(a.code) < 0 ? 99 : order.indexOf(a.code)) - (order.indexOf(b.code) < 0 ? 99 : order.indexOf(b.code)));
}

/** Uncensored results for the signed-in, allow-listed admin. Access is enforced on the server, not here. */
async function download(token: string, table: 'responses' | 'prepost') {
  try {
    const r = await fetch(`https://alkohol-ja-aju.vercel.app/api/admin-export?table=${table}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
    if (!r.ok) { alert(A('Не удалось скачать (Supabase недоступен или деплой ещё не обновился).')); return; }
    const url = URL.createObjectURL(await r.blob());
    const a = document.createElement('a');
    a.href = url; a.download = (r.headers.get('content-disposition')?.match(/filename="([^"]+)"/)?.[1]) ?? `${table}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch { alert(A('Не удалось связаться с сервером.')); }
}

type Health = { ok: boolean; primary?: string; telegram?: { ok: boolean; reason: string }; sheet?: { ok: boolean; reason: string }; supabase?: { ok: boolean; reason: string }; detail?: string };
function DeliveryCheck({ token }: { token: string }) {
  const [st, setSt] = useState<Health | 'err' | 'busy' | null>(null);
  const check = () => {
    setSt('busy');
    fetch('https://alkohol-ja-aju.vercel.app/api/research-health', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
      .then(r => r.json()).then(b => setSt(b as Health), () => setSt('err'));
  };
  const row = (name: string, x?: { ok: boolean; reason: string }) => x && <li key={name}>{x.ok ? '✅' : '⚠️'} {name}: <code>{x.reason}</code></li>;
  return (
    <div className="admin-q admin-delivery">
      <h3>{A('Состояние сохранения ответов')}</h3>
      <button type="button" className="admin-link" onClick={check} disabled={st === 'busy'}>{st === 'busy' ? A('Проверяю…') : A('Проверить Supabase, таблицу и Telegram')}</button>
      {st === 'err' && <p role="alert" className="admin-error">{A('Не удалось получить ответ сервера.')}</p>}
      {st && st !== 'err' && st !== 'busy' && (st.detail
        ? <p className="admin-meta">{A('Сервер не признал вас администратором для полной проверки.')}</p>
        : <><p className="admin-meta">{A('Основное хранилище: ')}<b>{st.primary === 'supabase' ? 'Supabase' : A('Google-таблица')}</b>{A('. Общий результат: ')}<b>{st.ok ? A('всё работает') : A('есть проблема')}</b>.</p><ul>{row('Supabase', st.supabase)}{row(A('Google-таблица'), st.sheet)}{row('Telegram', st.telegram)}</ul></>)}
    </div>
  );
}

/** Turns the raw field-by-field list into one sentence when the cause is simply missing rows. */
function gapHint(diffs: string[]) {
  const n = diffs.find(d => d.startsWith('n: '))?.match(/sheet=(\d+) supabase=(\d+)/);
  if (!n) return null;
  const gap = Number(n[1]) - Number(n[2]);
  const en = diffs.find(d => d.startsWith('fields.language.en: '))?.match(/sheet=(\d+) supabase=(\d+)/);
  const enGap = en ? Number(en[1]) - Number(en[2]) : 0;
  if (gap <= 0) return <p className="admin-meta">{A('В Supabase на ')}{-gap}{A(' ответ(а) больше, чем в таблице: скорее всего, в таблице удалили строку вручную. Сверьте и удалите лишнее в Supabase через «Удалить ответ».')}</p>;
  return (
    <div className="admin-gap" role="note">
      <p><b>{A('В таблице на ')}{gap}{A(' ответ(а) больше, чем в Supabase.')}</b>{A(' Остальные расхождения ниже — это те же ')}{gap}{A(' ответ(а), разложенные по вопросам.')}
{enGap === gap ? A(' Все недостающие ответы — на английском: они пришли, когда база ещё не принимала язык «en» (до SQL-миграции), и сохранились только в таблице.') : A(' Обычно это ответы, пришедшие до включения копии или до SQL-миграции.')}</p>
      <p>{A('Как исправить: скачайте лист Responses из Google-таблицы в CSV и снова запустите ')}<code>scripts/backfill-supabase.mjs … --apply</code>{A('. Скрипт добавит только недостающие строки, повторы база пропустит.')}</p>
    </div>
  );
}

type StatRow = { day: string; event: string; key: string; lang: string; count: number };
const SECTION_NAMES: Record<string, string> = { valik: A('Выбор формата'), aju: A('Влияние на мозг'), infograafika: A('Схемы'), teadmised: A('Научная база'), malu: A('Память'), tahelepanu: A('Внимание'), labor: A('Мини-игры'), avasta: A('Графики'), viktoriin: A('Миф или факт'), samoprov: A('Самопроверка'), obsuzhdenie: A('Обсуждение'), tegevus: A('Что делать'), klassiruum: A('Для урока') };
const SECTION_ORDER = Object.keys(SECTION_NAMES);

/** Cookie-free usage counters: daily totals only (see lib/analytics.ts and docs/supabase-analytics.sql). */
function UsageStats({ token }: { token: string }) {
  const [days, setDays] = useState(30);
  const [st, setSt] = useState<{ configured: boolean; rows: StatRow[] } | 'err' | 'busy' | null>(null);
  const load = (d: number) => {
    setDays(d); setSt('busy');
    fetch(`https://alkohol-ja-aju.vercel.app/api/admin-data?stats=${d}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
      .then(r => r.json()).then(b => setSt(b?.ok ? b : 'err'), () => setSt('err'));
  };
  const sum = (rows: StatRow[], f: (r: StatRow) => boolean) => rows.filter(f).reduce((a, r) => a + r.count, 0);
  const by = (rows: StatRow[], event: string) => { const m = new Map<string, number>(); for (const r of rows) if (r.event === event) m.set(r.key, (m.get(r.key) ?? 0) + r.count); return m; };
  const bars = (entries: [string, number][], label: (k: string) => string) => {
    const max = Math.max(1, ...entries.map(([, n]) => n));
    return <div className="usage-bars">{entries.map(([k, n]) => <div key={k}><span>{label(k)}</span><i style={{ width: `${(n / max) * 100}%` }} /><b>{n}</b></div>)}</div>;
  };
  let body = null;
  if (st === 'err') body = <p role="alert" className="admin-error">{A('Не удалось получить данные (деплой ещё не обновился?).')}</p>;
  else if (st && st !== 'busy') {
    if (!st.configured) body = <p className="admin-meta">{A('Счётчики выключены: выполните ')}<code>docs/supabase-analytics.sql</code>{A(' в Supabase (и нужен SUPABASE_SERVICE_ROLE_KEY в Vercel).')}</p>;
    else if (st.rows.length === 0) body = <p className="admin-meta">{A('За этот период данных пока нет. Счётчики начинают копиться после выполнения SQL и деплоя.')}</p>;
    else {
      const rows = st.rows;
      const home = sum(rows, r => r.event === 'page' && r.key === 'home');
      const pages = [...by(rows, 'page')].sort((a, b) => b[1] - a[1]).slice(0, 12);
      const sections = SECTION_ORDER.map(k => [k, by(rows, 'section').get(k) ?? 0] as [string, number]);
      const langs = (['et', 'ru', 'en'] as const).map(l => [l, sum(rows, r => r.event === 'page' && r.lang === l)] as [string, number]);
      const done: [string, number][] = [[A('Викторина завершена'), sum(rows, r => r.event === 'quiz')], [A('Мини-игры (любая)'), sum(rows, r => r.event === 'game')], [A('Опыт «одна задача или две»'), sum(rows, r => r.event === 'explore' && r.key === 'dual-task')], [A('Задание «наблюдение/связь/причина»'), sum(rows, r => r.event === 'explore' && r.key === 'evidence-sort')], [A('Опрос отправлен'), sum(rows, r => r.event === 'survey')], [A('Проверка «до»'), sum(rows, r => r.event === 'check' && r.key === 'pre')], [A('Проверка «после»'), sum(rows, r => r.event === 'check' && r.key === 'post')], [A('Обратная связь'), sum(rows, r => r.event === 'feedback')]];
      body = <>
        <p className="admin-meta">{A('Открытий главной: ')}<b>{home}</b>{A(' · всех страниц: ')}<b>{sum(rows, r => r.event === 'page')}</b>{A(' (каждая страница считается не чаще раза за сеанс).')}</p>
        <h4>{A('До какого раздела главной доходят')}</h4>
        {bars(sections, k => SECTION_NAMES[k])}
        <p className="result-base">{A('Раздел засчитывается, когда его заметная часть была на экране. Падение к концу страницы — нормально; резкий провал на одном разделе — повод его упростить.')}</p>
        <h4>{A('Страницы')}</h4>{bars(pages, k => k)}
        <h4>{A('Язык')}</h4>{bars(langs, k => k.toUpperCase())}
        <h4>{A('Завершённые действия')}</h4>{bars(done, k => k)}
      </>;
    }
  }
  return (
    <div className="admin-q admin-usage">
      <h3>{A('Посещаемость (без cookie)')}</h3>
      <p className="admin-meta">{A('Только суммы за день: без cookie, IP-адресов и идентификаторов. Посетители с запретом отслеживания в браузере и те, кто отключил учёт на странице «Данные и приватность», не считаются.')}</p>
      <div className="usage-range">{[7, 30, 90].map(d => <button key={d} type="button" className="admin-link" aria-pressed={days === d && !!st && st !== 'busy'} onClick={() => load(d)} disabled={st === 'busy'}>{d}{A(' дней')}</button>)}</div>
      {st === 'busy' && <p className="admin-meta">{A('Загрузка…')}</p>}
      {body}
    </div>
  );
}

type Parity = { admin: string[]; public: string[] } | { error: string } | null;
function MirrorStatus({ token }: { token: string }) {
  const [st, setSt] = useState<{ configured: boolean; responses: number | null; prepost: number | null; parity: Parity } | 'err' | 'busy' | null>(null);
  const check = () => {
    setSt('busy');
    fetch('https://alkohol-ja-aju.vercel.app/api/admin-mirror-status', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
      .then(r => r.json()).then(b => setSt(b?.ok ? b : 'err'), () => setSt('err'));
  };
  const line = (label: string, diffs: string[]) => diffs.length === 0
    ? <p className="admin-meta">{label}: <b>{A('совпадает полностью')}</b></p>
    : <div className="admin-meta">{label}: <b>{A('расхождений ')}{diffs.length}</b><ul>{diffs.slice(0, 8).map(d => <li key={d}><code>{d}</code></li>)}</ul>{diffs.length > 8 && <p>{A('…и ещё ')}{diffs.length - 8}</p>}</div>;
  return (
    <div className="admin-q admin-mirror">
      <h3>{A('Копия в Supabase')}</h3>
      <p className="admin-meta">{A('Проверка, дали бы таблица и Supabase одинаковые цифры. Сайт по-прежнему берёт данные из таблицы.')}</p>
      <button type="button" className="admin-link" onClick={check} disabled={st === 'busy'}>{st === 'busy' ? A('Сверяю…') : A('Сверить с таблицей')}</button>
      <p className="admin-meta">{A('Резервная копия (CSV, те же колонки, что в таблице). Делайте её раз в месяц и храните в закрытом месте.')}</p>
      <button type="button" className="admin-link" onClick={() => download(token, 'responses')}>{A('Скачать ответы')}</button>{' · '}
      <button type="button" className="admin-link" onClick={() => download(token, 'prepost')}>{A('Скачать «до/после»')}</button>
      {st === 'err' && <p role="alert" className="admin-error">{A('Не удалось получить данные (деплой ещё не обновился?).')}</p>}
      {st && st !== 'err' && st !== 'busy' && (!st.configured
        ? <p className="admin-meta">{A('Копия выключена: нет SUPABASE_SERVICE_ROLE_KEY в Vercel.')}</p>
        : st.responses === null
          ? <p role="alert" className="admin-error">{A('Supabase не ответил или таблицы не созданы.')}</p>
          : <>
              <p className="admin-meta">{A('Строк в Supabase: ответов ')}<b>{st.responses}</b>{A(', проверок «до/после» ')}<b>{st.prepost}</b>.</p>
              {st.parity && 'error' in st.parity
                ? <p className="admin-meta">{A('Сравнить с таблицей не удалось: ')}{st.parity.error === 'sheet_unavailable_or_script_outdated' ? A('таблица не ответила или Apps Script не обновлён до версии 13.') : st.parity.error}</p>
                : st.parity && <>{gapHint(st.parity.admin)}{line(A('Сводка для админа'), st.parity.admin)}{line(A('Публичная сводка'), st.parity.public)}</>}
            </>)}
    </div>
  );
}

export default function AdminData() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [responseId, setResponseId] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState<{ ok: boolean; text: string } | null>(null);

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
      }, () => { throw new Error(A('Не удалось связаться с сервером alkohol-ja-aju.vercel.app. Проверьте интернет или что деплой в Vercel завершился.')); })
      .then(d => { if (alive) setData(d); })
      .catch(e => { if (alive) setError(e instanceof Error ? e.message : A('Ошибка.')); });
    return () => { alive = false; };
  }, [session, reload]);

  const remove = async () => {
    if (!session) return;
    setDeleting(true); setDeleteMsg(null);
    try {
      const r = await fetch(DELETE_ENDPOINT, { method: 'POST', headers: { Authorization: `Bearer ${session.access_token}`, 'content-type': 'application/json' }, body: JSON.stringify({ responseId: responseId.trim() }) });
      const body = await r.json().catch(() => null);
      if (r.ok && body?.ok) {
        setDeleteMsg(body.deleted ? { ok: body.mirror !== 'failed' && body.sheet !== 'failed', text: body.sheet === 'failed' ? A('Ответ {0} удалён из Supabase, но из Google-таблицы удалить не удалось (Apps Script недоступен или не обновлён). Удалите строку в таблице вручную.', responseId.trim()) : body.mirror === 'failed' ? A('Ответ {0} удалён из таблицы, но копию в Supabase удалить не удалось. Удалите строку вручную в Table Editor (research_responses).', responseId.trim()) : A('Ответ {0} удалён.', responseId.trim()) } : { ok: false, text: A('Такого ответа в таблице нет. Проверьте ID.') });
        if (body.deleted) { setResponseId(''); setReload(v => v + 1); }
      } else if (body?.error === 'invalid_response_id') setDeleteMsg({ ok: false, text: A('ID должен выглядеть как research_… (латиница, цифры, _ и -).') });
      else setDeleteMsg({ ok: false, text: explain(r.status, body?.error === 'delete_upstream_failed_or_script_outdated' ? 'upstream_failed_or_script_outdated' : body?.error).replace(A('версии 10'), A('версии 11')) });
    } catch { setDeleteMsg({ ok: false, text: A('Не удалось связаться с сервером.') }); }
    finally { setDeleting(false); setConfirming(false); }
  };

  const signIn = () => supabase?.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + location.pathname } });

  if (!supabase) return (
    <section className="admin-card">
      <p className="admin-kicker">{A('ВХОД НЕ НАСТРОЕН')}</p>
      <h1>{A('В этой сборке сайта нет ключей Supabase')}</h1>
      <p>{A('Добавьте переменные VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY (GitHub → Settings → Secrets and variables → Actions → Variables) и перезапустите деплой сайта.')}</p>
    </section>
  );
  return (
    <section className="admin-card admin-data">
      <p className="admin-kicker">{A('ПОЛНЫЕ ДАННЫЕ БЕЗ СКРЫТИЯ')}</p>
      <h1 className="admin-title">{A('Просмотр по аккаунту Google')}</h1>
      {!ready ? <p>{A('Загрузка…')}</p> : !session ? (
        <>
          <p>{A('Войди аккаунтом администратора. Сервер сам проверит, что аккаунт в списке. Здесь показаны все категории, даже с 1–4 ответами. Не публикуй и не пересылай эти цифры.')}</p>
          <button type="button" className="admin-signin" onClick={signIn}>{A('Войти через Google')}</button>
        </>
      ) : (
        <>
          <p className="admin-who">{A('Вы вошли как ')}{session.user.email} · <button type="button" className="admin-link" onClick={() => supabase?.auth.signOut()}>{A('Выйти')}</button></p>
          {error && <p role="alert" className="admin-error">{error}</p>}
          {!data && !error && <p>{A('Загрузка данных…')}</p>}
          {data && (
            <>
              <p className="admin-meta">{A('Валидных ответов: ')}<b>{data.n}</b>{A(' · Исключено (старые схемы и без согласия): ')}{data.excluded}{A(' · Обновлено ')}{new Date(data.lastUpdated).toLocaleString(adminLocale)}{A(' · Источник: ')}{data.source === 'supabase' ? 'Supabase' : A('Google-таблица')}</p>
              <div className="admin-grid">
                {Object.keys(adminQuestions).filter(k => data.fields[k] && Object.keys(data.fields[k]).length > 0).map(k => {
                  const base = adminQuestions[k].multi ? data.n : (data.answered[k] ?? data.n);
                  return (
                    <div className="admin-q" key={k}>
                      <h3>{adminQuestions[k].title}</h3>
                      <ResultsChart items={items(k, data.fields[k])} total={base} ariaLabel={adminQuestions[k].title} countWord={A('отв.')} />
                      <p className="result-base">{adminQuestions[k].multi ? A('Доля от всех участников ({0}); можно выбрать несколько.', data.n) : A('Ответили {0} из {1}.', data.answered[k] ?? 0, data.n)}</p>
                    </div>
                  );
                })}
              </div>
              <UsageStats token={session.access_token} />
              <DeliveryCheck token={session.access_token} />
              <MirrorStatus token={session.access_token} />
              <PrePostCard data={data.prepost} />
              <div className="admin-report-toggle"><button type="button" className="admin-signin" aria-expanded={showReport} onClick={() => setShowReport(v => !v)}>{showReport ? A('Скрыть отчёт') : A('Сформировать отчёт (PDF)')}</button></div>
              {showReport && <AdminReport data={data} />}
              <div className="admin-delete">
                <h3>{A('Удалить ответ')}</h3>
                <p>{A('Укажите ID ответа из столбца response_id в таблице Responses. Удаление строки необратимо; восстановить её можно только через историю версий Google Sheets.')}</p>
                <label htmlFor="admin-response-id">{A('ID ответа')}</label>
                <input id="admin-response-id" type="text" inputMode="text" autoComplete="off" spellCheck={false} placeholder="research_…" value={responseId} onChange={e => { setResponseId(e.target.value); setConfirming(false); setDeleteMsg(null); }} />
                {!confirming ? (
                  <button type="button" className="admin-danger" disabled={!responseId.trim() || deleting} onClick={() => setConfirming(true)}>{A('Удалить…')}</button>
                ) : (
                  <div className="admin-confirm" role="alert">
                    <span>{A('Удалить ответ ')}<b>{responseId.trim()}</b>{A(' навсегда?')}</span>
                    <button type="button" className="admin-danger" disabled={deleting} onClick={remove}>{deleting ? A('Удаляю…') : A('Да, удалить')}</button>
                    <button type="button" className="admin-link" disabled={deleting} onClick={() => setConfirming(false)}>{A('Отмена')}</button>
                  </div>
                )}
                {deleteMsg && <p role="status" className={deleteMsg.ok ? 'admin-ok' : 'admin-error'}>{deleteMsg.text}</p>}
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
