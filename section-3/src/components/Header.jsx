import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header({ title }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const message = location.state?.message;

  return (
    <header>
      <div className="header-row">
        <h1>{title}</h1>
        <div>
          {user.name} <button onClick={logout}>Logout</button>
        </div>
      </div>
      {message && <p className="notice">{message}</p>}
    </header>
  );
}
