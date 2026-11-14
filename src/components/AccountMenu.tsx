import { useEffect, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import './account.css';

type Lang = 'et' | 'ru' | 'en';
const t = {
  signIn: { et: 'Logi sisse', ru: 'Войти', en: 'Log in' },
  signUp: { et: 'Loo konto', ru: 'Создать аккаунт', en: 'Create an account' },
  signOut: { et: 'Logi välja', ru: 'Выйти', en: 'Log out' },
  google: { et: 'Jätka Google’iga', ru: 'Продолжить с Google', en: 'Continue with Google' },
  or: { et: 'või e-posti teel', ru: 'или по e-mail', en: 'or by e-mail' },
  email: { et: 'E-post', ru: 'E-mail', en: 'E-mail' },
  password: { et: 'Parool (vähemalt 8 märki)', ru: 'Пароль (минимум 8 символов)', en: 'Password (at least 8 characters)' },
  close: { et: 'Sulge', ru: 'Закрыть', en: 'Close' },
  haveAcc: { et: 'Konto on juba olemas? Logi sisse', ru: 'Уже есть аккаунт? Войти', en: 'Already have an account? Log in' },
  noAcc: { et: 'Kontot pole? Loo konto', ru: 'Нет аккаунта? Создать', en: 'No account? Create one' },
  confirm: { et: 'Saatsime kinnituslingi. Ava e-kiri ja kinnita aadress.', ru: 'Мы отправили ссылку подтверждения. Откройте письмо и подтвердите адрес.', en: 'We sent a confirmation link. Open the e-mail and confirm the address.' },
  failed: { et: 'Ei õnnestunud. Kontrolli andmeid ja proovi uuesti.', ru: 'Не получилось. Проверьте данные и попробуйте снова.', en: 'It did not work. Check the details and try again.' },
  privacy: {
    et: 'Konto on valikuline ega ole seotud uurimisküsitlusega: küsitluse vastuseid kontoga ei seota.',
    ru: 'Аккаунт необязателен и не связан с исследовательским опросом: ответы опроса с аккаунтом не связываются.',
    en: 'An account is optional and is not linked to the research survey: survey answers are not linked to an account.',
  },
} as const;

const pageLang = (): Lang => (document.documentElement.lang === 'ru' ? 'ru' : document.documentElement.lang === 'en' ? 'en' : 'et');

export default function AccountMenu() {
  const client = supabase;
  const [lang, setLang] = useState<Lang>(pageLang);
  const [session, setSession] = useState<Session | null>(null);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [mode, setMode] = useState<'in' | 'up'>('up');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [host, setHost] = useState<Element | null>(null);
  const [menuHost, setMenuHost] = useState<Element | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const observer = new MutationObserver(() => setLang(pageLang()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    setLang(pageLang());
    // The header is rendered by App after this component mounts; wait for it.
    const find = () => {
      setHost(document.querySelector('.header-actions'));
      const groups = document.querySelector<HTMLElement>('#navigation .nav-groups');
      if (!groups) return;
      let el = groups.querySelector<HTMLElement>(':scope > .account__host-menu');
      if (!el) { el = document.createElement('div'); el.className = 'account__host-menu'; groups.insertBefore(el, groups.firstChild); }
      setMenuHost(el);
    };
    find();
    const retry = setTimeout(find, 150);
    return () => { observer.disconnect(); clearTimeout(retry); };
  }, []);

  useEffect(() => {
    if (!client) return;
    client.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = client.auth.onAuthStateChange((event, next) => {
      setSession(next);
      if (event === 'SIGNED_IN') {
        // Drop the ?code=… left by the OAuth redirect.
        const clean = new URL(location.href);
        if (clean.searchParams.has('code')) {
          clean.searchParams.delete('code');
          history.replaceState(null, '', clean.pathname + clean.search + clean.hash);
        }
        setOpen(false);
      }
    });
    return () => data.subscription.unsubscribe();
  }, [client]);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open, host]);

  useEffect(() => {
    if (!client) return;
    const url = new URL(location.href);
    const fragment = new URLSearchParams(url.hash.slice(1));
    if (!url.searchParams.has("error") && !url.searchParams.has("error_code") && !fragment.has("error") && !fragment.has("error_code")) return;
    for (const key of ["error", "error_code", "error_description", "code"]) url.searchParams.delete(key);
    if (fragment.has("error") || fragment.has("error_code")) url.hash = "";
    history.replaceState(history.state, "", url);
    setMsg({ ok: false, text: t.failed[pageLang()] });
    setOpen(true);
  }, [client]);

  if (!client || !host) return null;
  const L = (k: keyof typeof t) => t[k][lang];
  const redirectTo = location.origin + location.pathname;

  const google = async () => {
    setBusy(true); setMsg(null);
    try {
      const { error } = await client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
      if (error) throw error;
    } catch {
      setMsg({ ok: false, text: L('failed') });
      setBusy(false);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      const { data, error } = mode === 'up'
        ? await client.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo, data: { language: lang } } })
        : await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setPassword('');
      if (mode === 'up' && !data.session) setMsg({ ok: true, text: L('confirm') });
    } catch {
      setMsg({ ok: false, text: L('failed') });
    } finally { setBusy(false); }
  };

  const fullName = session?.user.user_metadata?.full_name;
  const name = (typeof fullName === 'string' && fullName.trim()) || session?.user.email || L('signOut');
  const trigger = session
    ? <div className="account account--bar">
        <button type="button" className="account__avatar" aria-expanded={menu} aria-label={name} onClick={() => setMenu(v => !v)}>{name.charAt(0).toUpperCase()}</button>
        {menu && <div className="account__menu" role="menu">
          <span className="account__email">{session.user.email}</span>
          <button type="button" role="menuitem" onClick={() => { setMenu(false); void client.auth.signOut(); }}>{L('signOut')}</button>
        </div>}
      </div>
    : <button type="button" className="account__signin account__signin--bar" onClick={() => { setMode('up'); setMsg(null); setOpen(true); }}>{L('signIn')}</button>;

  const menuItem = session
    ? <div className="account-menuitem">
        <span className="account-menuitem__email">{session.user.email}</span>
        <button type="button" onClick={() => void client.auth.signOut()}>{L('signOut')}</button>
      </div>
    : <button type="button" className="account-menuitem account-menuitem__signin" onClick={() => { setMode('up'); setMsg(null); setOpen(true); }}>{L('signIn')}</button>;

  return <>
    {createPortal(trigger, host, 'account')}
    {menuHost && createPortal(menuItem, menuHost, 'account-m')}
    {createPortal(
      <dialog ref={dialog} className="account-dialog" aria-label={L(mode === 'up' ? 'signUp' : 'signIn')} onClose={() => setOpen(false)} onClick={e => { if (e.target === dialog.current) setOpen(false); }}>
        <button type="button" className="account-dialog__close" aria-label={L('close')} onClick={() => setOpen(false)}>×</button>
        <h2>{L(mode === 'up' ? 'signUp' : 'signIn')}</h2>
        <button type="button" className="account-dialog__google" disabled={busy} onClick={google}>{L('google')}</button>
        <p className="account-dialog__or">{L('or')}</p>
        <form onSubmit={submit}>
          <label>{L('email')}<input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></label>
          <label>{L('password')}<input type="password" required minLength={mode === 'up' ? 8 : undefined} autoComplete={mode === 'up' ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)} /></label>
          <button type="submit" className="account-dialog__submit" disabled={busy}>{L(mode === 'up' ? 'signUp' : 'signIn')}</button>
        </form>
        {msg && <p role="status" className={msg.ok ? 'account-dialog__msg' : 'account-dialog__msg account-dialog__msg--err'}>{msg.text}</p>}
        <button type="button" className="account-dialog__switch" onClick={() => { setMode(m => m === 'up' ? 'in' : 'up'); setMsg(null); }}>{L(mode === 'up' ? 'haveAcc' : 'noAcc')}</button>
        <p className="account-dialog__privacy">{L('privacy')}</p>
      </dialog>,
      document.body,
    )}
  </>;
}
