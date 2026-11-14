import { Component, type ReactNode } from 'react';

const text = {
  et: { title: 'Midagi läks valesti', body: 'Leht ei õnnestunud kuvada. Värskenda lehte; kui viga kordub, proovi hiljem uuesti.', button: 'Värskenda' },
  ru: { title: 'Что-то пошло не так', body: 'Не удалось показать страницу. Обновите её; если ошибка повторится, попробуйте позже.', button: 'Обновить' },
  en: { title: 'Something went wrong', body: 'The page could not be shown. Reload it; if the problem repeats, try again later.', button: 'Reload' },
} as const;

const pageLang = (): keyof typeof text => { const l = document.documentElement.lang; return l === 'ru' || l === 'en' ? l : 'et'; };

/** Last line of defence: a render error shows a short message and a reload button instead of a blank page. Nothing is sent anywhere. */
export default class ErrorBoundary extends Component<{ children: ReactNode; silent?: boolean }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: unknown) { console.error('Render error', error); }
  render() {
    if (!this.state.failed) return this.props.children;
    if (this.props.silent) return null; // optional extras (search, account, effects) may fail without hiding the page
    const t = text[pageLang()];
    return (
      <div role="alert" style={{ maxWidth: 520, margin: '20vh auto', padding: '0 20px', font: '16px/1.5 system-ui, sans-serif', color: '#171b37' }}>
        <h1 style={{ fontSize: '1.4rem', margin: '0 0 8px' }}>{t.title}</h1>
        <p>{t.body}</p>
        <button type="button" onClick={() => location.reload()} style={{ minHeight: 44, padding: '0 18px', border: 0, borderRadius: 12, background: '#171b37', color: '#fff', font: 'inherit', fontWeight: 700, cursor: 'pointer' }}>{t.button}</button>
      </div>
    );
  }
}
