Tech Stack
- Vite | template npm run dev ได้ทันที ตรงเกณฑ์ขั้นต่ำ ไม่ต้องมี backend จึงไม่ใช้ Next.js |
- React | หน้าจอเปลี่ยนตาม state บ่อย (loading/error, รายการ Task, ปุ่ม Done) เพื่อความลื่นไหลเป็น spa |
- React Router | ส่งข้อความไปกับ redirect ได้ด้วย Navigate state และใช้ทำ RequireRole ครอบ route |
- Context + sessionStorage | state ที่แชร์ข้ามหน้ามีแค่ผู้ใช้ที่ login จึงไม่ต้องใช้ Redux และอยู่รอดหลัง refresh จึงพิมพ์ URL ทดสอบได้

Database
- PostgreSQL | ตาราง users, projects, tasks มี index 2 ตัว สำหรับหน้า Employee และหน้า Admin