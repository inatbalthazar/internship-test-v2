import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import * as api from '../api/mockApi';

export default function AdminPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    Promise.all([api.getTasks(user.id), api.getEmployees()])
      .then(([taskList, employeeList]) => {
        setTasks(taskList);
        setEmployees(employeeList);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user.id]);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    try {
      const task = await api.createTask(user.id, title, Number(assignedTo));
      setTasks((prev) => [...prev, task]);
      setTitle('');
      setAssignedTo('');
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  }

  function employeeName(id) {
    return employees.find((e) => e.id === id)?.name ?? '-';
  }

  return (
    <div className="page">
      <Header title="Admin" />

      <h2>สร้าง Task</h2>
      <form onSubmit={handleCreate}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="ชื่อ Task"
          disabled={creating}
        />
        <select
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          disabled={creating}
        >
          <option value="">-- ผู้รับผิดชอบ --</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
        <button type="submit" disabled={creating}>
          {creating ? 'กำลังสร้าง...' : 'สร้าง'}
        </button>
      </form>
      {createError && <p className="error">{createError}</p>}

      <h2>Task ทั้งหมด</h2>
      {loading && <p>กำลังโหลด...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <table>
          <thead>
            <tr>
              <th>ชื่อ Task</th>
              <th>ผู้รับผิดชอบ</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id}>
                <td>{t.title}</td>
                <td>{employeeName(t.assignedTo)}</td>
                <td>{t.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
