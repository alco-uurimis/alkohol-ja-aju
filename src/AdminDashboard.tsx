import AdminData from './AdminData';

/** Admin page. Everything here, viewing and deleting, requires signing in with an allow-listed Google account. */
export default function AdminDashboard() {
  return (
    <main className="admin">
      <a href="../" className="admin-brand">alkohol ja aju</a>
      <AdminData />
    </main>
  );
}
