import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RequireRole({ role, children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    return (
      <Navigate
        to={`/${user.role}`}
        replace
        state={{ message: `คุณไม่มีสิทธิ์เข้าหน้า /${role}` }}
      />
    );
  }

  return children;
}
