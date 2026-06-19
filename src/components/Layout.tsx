import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a', color: '#eee', fontFamily: 'system-ui, sans-serif' }}>
      <Navbar />
      <main style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
