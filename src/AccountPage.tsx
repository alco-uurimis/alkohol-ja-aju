import { useEffect, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { accountClient, googleIsEnabled, readOAuthReturn } from './auth/googleAccount';
import './entry-pages.css';

type Lang = 'et' | 'ru';
type Notice = 'unconfigured' | 'googleUnavailable' | 'cancelled' | 'signInFailed' | 'signOutFailed';
const languageKey = 'alkohol-ja-aju:language';

function readLanguage(): Lang {
  const explicit = new URLSearchParams(location.search).get('lang');
  if (explicit === 'et' || explicit === 'ru') return explicit;
  try { return localStorage.getItem(languageKey) === 'ru' ? 'ru' : 'et'; }
  catch { return 'et'; }
}

// Reuse the exchange across React mounts. Each authorization code is valid once.
let initialSession: Promise<{ session: Session | null; notice?: Notice }> | undefined;

function initializeSession() {
  if (initialSession) return initialSession;
  initialSession = (async () => {
    const callback = readOAuthReturn(location.href);
    if (callback.hasOAuthParams) history.replaceState(null, '', callback.cleanUrl);
    if (!accountClient) return { session: null, notice: 'unconfigured' as const };
    if (callback.code && !callback.error) {
      const { data, error } = await accountClient.auth.exchangeCodeForSession(callback.code);
      if (!error && data.session) return { session: data.session };
    }
    const { data, error } = await accountClient.auth.getSession();
    const notice: Notice | undefined = callback.error === 'access_denied' ? 'cancelled'
      : callback.hasOAuthParams || error ? 'signInFailed' : undefined;
    return { session: data.session, notice };
  })();
  return initialSession;
}

export default function AccountPage() {
  const [lang, setLang] = useState<Lang>(readLanguage);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>();
  const noticeRef = useRef<HTMLParagraphElement>(null);
  const ru = lang === 'ru';
  const title = ru ? 'Аккаунт' : 'Konto';
  const messages: Record<Notice, string> = ru ? {
    unconfigured: 'Вход пока не настроен.',
    googleUnavailable: 'Вход через Google пока не подключён. Учебные материалы доступны без аккаунта.',
    cancelled: 'Вход отменён. Можно попробовать снова.',
    signInFailed: 'Не удалось войти. Начни вход заново в этом браузере.',
    signOutFailed: 'Не удалось выйти. Проверь подключение и попробуй ещё раз.',
  } : {
    unconfigured: 'Sisselogimine pole veel seadistatud.',
    googleUnavailable: 'Google’iga sisselogimine pole veel ühendatud. Õppematerjalid on saadaval ka kontota.',
    cancelled: 'Sisselogimine katkestati. Võid uuesti proovida.',
    signInFailed: 'Sisselogimine ebaõnnestus. Alusta uuesti selles brauseris.',
    signOutFailed: 'Väljalogimine ebaõnnestus. Kontrolli ühendust ja proovi uuesti.',
  };

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = title + ' — ' + (ru ? 'Алкоголь и мозг' : 'Alkohol ja aju');
    try { localStorage.setItem(languageKey, lang); } catch {}
  }, [lang, ru, title]);

  useEffect(() => {
    let active = true;
    const { data } = accountClient?.auth.onAuthStateChange((event, nextSession) => {
      if (active && event !== 'INITIAL_SESSION') setSession(nextSession);
    }) ?? {};
    initializeSession().then(result => {
      if (!active) return;
      setSession(result.session);
      setNotice(result.notice);
    }).catch(() => {
      if (active) setNotice('signInFailed');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
      data?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => { if (notice) noticeRef.current?.focus(); }, [notice]);

  async function signIn() {
    if (!accountClient || busy) return;
    setBusy(true);
    setNotice(undefined);
    try {
      if (!await googleIsEnabled()) {
        setNotice('googleUnavailable');
        return;
      }
      const { data, error } = await accountClient.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: new URL('./', location.href).href, skipBrowserRedirect: true },
      });
      if (error || !data.url) throw error ?? new Error('Missing OAuth URL');
      location.assign(data.url);
    } catch {
      setNotice('signInFailed');
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    if (!accountClient || busy) return;
    setBusy(true);
    setNotice(undefined);
    try {
      const { error } = await accountClient.auth.signOut({ scope: 'local' });
      if (error) throw error;
      setSession(null);
    } catch {
      setNotice('signOutFailed');
    } finally {
      setBusy(false);
    }
  }

  function switchLanguage(next: Lang) {
    const url = new URL(location.href);
    url.searchParams.set('lang', next);
    history.replaceState(null, '', url);
    setLang(next);
  }

  return <div className="entry-page">
    <header className="entry-header">
      <a href="../" className="entry-brand"><img src="../logo-mark.svg" alt="" /><span>{ru ? 'Алкоголь и мозг' : 'Alkohol ja aju'}</span></a>
      <div className="entry-language" role="group" aria-label={ru ? 'Язык' : 'Keel'}>
        <button type="button" className={!ru ? 'active' : ''} aria-pressed={!ru} onClick={() => switchLanguage('et')}>ET</button>
        <button type="button" className={ru ? 'active' : ''} aria-pressed={ru} onClick={() => switchLanguage('ru')}>RU</button>
      </div>
    </header>
    <main>
      <div className="entry-hero"><h1>{title}</h1></div>
      <section className="lesson-panel account-panel" aria-busy={loading || busy}>
        {loading ? <p role="status">{ru ? 'Проверяем вход…' : 'Kontrollime sisselogimist…'}</p>
          : session ? <>
            <h2>{ru ? 'Ты вошёл в аккаунт' : 'Oled sisse logitud'}</h2>
            <p>{session.user.email}</p>
            <button className="button" type="button" onClick={signOut} disabled={busy}>{ru ? 'Выйти' : 'Logi välja'}</button>
          </> : <>
            <h2>{ru ? 'Войти или создать аккаунт' : 'Logi sisse või loo konto'}</h2>
            <p>{ru ? 'При первом входе через Google будет создан аккаунт. Для уроков и исследовательского опроса вход не требуется.' : 'Esimesel Google’iga sisselogimisel luuakse konto. Õppetükid ja uurimisküsitlus on saadaval ka kontota.'}</p>
            <button className="button primary" type="button" onClick={signIn} disabled={!accountClient || busy}>
              {busy ? (ru ? 'Подключаемся…' : 'Ühendame…') : (ru ? 'Продолжить с Google' : 'Jätka Google’iga')}
            </button>
          </>}
        {notice && <p role="alert" ref={noticeRef} tabIndex={-1}>{messages[notice]}</p>}
        <p><a href="../data-policy/">{ru ? 'Данные и приватность' : 'Andmed ja privaatsus'}</a></p>
      </section>
      <a className="entry-back" href="../">{ru ? '← На главную' : '← Avalehele'}</a>
    </main>
  </div>;
}
