// Registers the offline service worker on the production site only (absolute base path, e.g. GitHub Pages).
if ('serviceWorker' in navigator && import.meta.env.PROD && import.meta.env.BASE_URL.startsWith('/')) {
  addEventListener('load', () => {
    navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js').catch(() => { /* offline support is optional */ });
  }, { once: true });
}
