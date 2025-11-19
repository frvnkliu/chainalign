import { Outlet, Link } from 'react-router-dom';

export default function Layout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{
        borderBottom: '3px solid black',
        padding: '1rem 2rem',
        display: 'flex',
        gap: '2rem',
      }}>
        <Link to="/">HOME</Link>
        <Link to="/setup">SETUP</Link>
        <Link to="/compare">COMPARE</Link>
      </nav>

      <main style={{ flex: 1, padding: '2rem' }}>
        <Outlet />
      </main>
    </div>
  );
}
