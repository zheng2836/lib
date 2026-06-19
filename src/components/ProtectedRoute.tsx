import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface Props { children: React.ReactNode; }

export default function ProtectedRoute({ children }: Props) {
  const { authed, loading } = useAuth();
  if (loading) return <p style={{ textAlign: 'center', padding: '2rem', color: '#555' }}>验证中...</p>;
  if (!authed) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}
