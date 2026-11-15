import { useEffect } from 'react';
import AdminData from './AdminData';
import { adminLang, setAdminLang } from './adminI18n';

/** Admin page. Everything here, viewing and deleting, requires signing in with an allow-listed Google account. */
export default function AdminDashboard() {
  useEffect(() => { document.documentElement.lang = adminLang; document.title = adminLang === 'et' ? 'Alkohol ja aju — haldus' : 'Алкоголь и мозг — администрирование'; }, []);
  return (
    <main className="admin">
      <div className="admin-top">
        <a href="../" className="admin-brand">alkohol ja aju</a>
        <div className="admin-lang" role="group" aria-label={adminLang === 'et' ? 'Keel' : 'Язык'}>
          <button type="button" aria-pressed={adminLang === 'ru'} onClick={() => adminLang !== 'ru' && setAdminLang('ru')}>RU</button>
          <button type="button" aria-pressed={adminLang === 'et'} onClick={() => adminLang !== 'et' && setAdminLang('et')}>ET</button>
        </div>
      </div>
      <AdminData />
    </main>
  );
}
