const users = [
  { id: 1, username: 'admin', name: 'Admin', role: 'admin' },
  { id: 2, username: 'somchai', name: 'Somchai', role: 'employee' },
  { id: 3, username: 'suda', name: 'Suda', role: 'employee' },
];

const tasks = [
  { id: 1, title: 'ออกแบบหน้า Login', status: 'To Do', assignedTo: 2 },
  { id: 2, title: 'ทำ Route Guard', status: 'Done', assignedTo: 2 },
  { id: 3, title: 'เขียน README', status: 'To Do', assignedTo: 2 },
  { id: 4, title: 'เขียน Mock API', status: 'To Do', assignedTo: 3 },
  { id: 5, title: 'ออกแบบ Database', status: 'To Do', assignedTo: 3 },
];
let nextId = 6;

function delay() {
  return new Promise((resolve) => setTimeout(resolve, 500));
}

function findUser(userId) {
  const user = users.find((u) => u.id === userId);
  if (!user) throw new Error('ไม่พบผู้ใช้');
  return user;
}

export async function login(username) {
  await delay();
  const user = users.find((u) => u.username === username.trim());
  if (!user) throw new Error('ไม่พบ username นี้ในระบบ');
  return user;
}

export async function getEmployees() {
  await delay();
  return users.filter((u) => u.role === 'employee');
}

export async function getTasks(userId) {
  await delay();
  const user = findUser(userId);
  const result = user.role === 'admin' ? tasks : tasks.filter((t) => t.assignedTo === user.id);
  return result.map((t) => ({ ...t }));
}

export async function createTask(userId, title, assignedTo) {
  await delay();
  const user = findUser(userId);
  if (user.role !== 'admin') throw new Error('เฉพาะ Admin เท่านั้น');
  if (!title.trim()) throw new Error('กรุณากรอกชื่อ Task');
  if (!users.some((u) => u.id === assignedTo && u.role === 'employee')) {
    throw new Error('กรุณาเลือกผู้รับผิดชอบ');
  }

  const task = { id: nextId++, title: title.trim(), status: 'To Do', assignedTo };
  tasks.push(task);
  return { ...task };
}

export async function updateStatus(userId, taskId, status) {
  await delay();
  const user = findUser(userId);
  const task = tasks.find((t) => t.id === taskId);
  if (!task) throw new Error('ไม่พบ Task');
  if (status !== 'To Do' && status !== 'Done') throw new Error('สถานะไม่ถูกต้อง');

  if (user.role !== 'admin') {
    if (task.assignedTo !== user.id) throw new Error('ไม่ใช่ Task ของคุณ');
    if (task.status !== 'To Do' || status !== 'Done') {
      throw new Error('เปลี่ยนได้เฉพาะ To Do → Done');
    }
  }

  task.status = status;
  return { ...task };
}
