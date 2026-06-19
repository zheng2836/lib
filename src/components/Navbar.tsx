import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '1rem 2rem', background: '#1a1a2e', color: '#fff',
    }}>
      <Link to="/" style={{ color: '#e94560', fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none' }}>
        📚 图书馆
      </Link>
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>书架</Link>
        <Link to="/admin" style={{ color: '#aaa', textDecoration: 'none' }}>管理</Link>
      </div>
    </nav>
  );
}
