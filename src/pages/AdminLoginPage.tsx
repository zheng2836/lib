import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function AdminLoginPage() {
  const { authed, loading, doLogin } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (loading) return <p style={{ textAlign: 'center', padding: '4rem', color: '#555' }}>验证中...</p>;
  if (authed) { navigate('/admin/panel', { replace: true }); return null; }

  const handleSubmit = async () => {
    setError('');
    const ok = await doLogin(password);
    if (ok) navigate('/admin/panel');
    else setError('密码错误');
  };

  return (
    <div style={{ maxWidth: 400, margin: '4rem auto', textAlign: 'center' }}>
      <h2 style={{ marginBottom: '2rem' }}>管理员登录</h2>
      <div style={{ background: '#1e1e32', borderRadius: 12, padding: '2rem', border: '1px solid #2a2a4a' }}>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="请输入管理密码"
          style={{
            width: '100%', padding: '0.75rem', background: '#0f0f1a',
            border: '1px solid #2a2a4a', borderRadius: 6, color: '#eee',
            fontSize: '1rem', outline: 'none', boxSizing: 'border-box',
          }}
        />
        {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: '0.75rem 0 0' }}>{error}</p>}
        <button
          onClick={handleSubmit}
          style={{
            marginTop: '1rem', width: '100%', padding: '0.75rem',
            background: '#e94560', color: '#fff', border: 'none',
            borderRadius: 8, cursor: 'pointer', fontSize: '1rem',
          }}
        >登录</button>
      </div>
    </div>
  );
}
