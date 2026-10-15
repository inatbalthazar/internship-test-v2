import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import * as api from '../api/mockApi';

export default function EmployeePage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    api
      .getTasks(user.id)
      .then(setTasks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user.id]);

  async function markDone(taskId) {
    setUpdatingId(taskId);
    setError('');
    try {
      const updated = await api.updateStatus(user.id, taskId, 'Done');
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="page">
      <Header title="Task ของฉัน" />

      {loading && <p>กำลังโหลด...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && tasks.length === 0 && <p>ยังไม่มี Task</p>}

      <ul>
        {tasks.map((t) => (
          <li key={t.id}>
            {t.title} — {t.status}{' '}
            {t.status === 'To Do' && (
              <button onClick={() => markDone(t.id)} disabled={updatingId === t.id}>
                {updatingId === t.id ? 'กำลังบันทึก...' : 'Done'}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
