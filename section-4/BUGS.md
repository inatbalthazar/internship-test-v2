# Bugs

เลขบรรทัดนับจากโค้ดในโจทย์

| # | ไฟล์:บรรทัด | ประเภท | ความรุนแรง | ปัญหา | วิธีแก้ | วิธีพิสูจน์ |
|---|---|---|---|---|---|---|
| 1 | tasks.js:78 | security | critical | DELETE ไม่มี `authenticate` ทำให้ `req.user` เป็น undefined เลยข้ามเงื่อนไข admin ไป ใครก็ลบได้ | ใส่ `authenticate` | ทำ: `DELETE /api/tasks/3` แบบไม่มี token → โค้ดเดิมได้: 204 → ที่ถูกต้องคือ: 401 |
| 2 | tasks.js:53 | logic | high | ใช้ `\|\|` แทน `&&` Employee เจ้าของ task โดน 403 และ Admin แก้ task คนอื่นไม่ได้ | `!isAdmin && !isOwner` | ทำ: Employee เจ้าของ task #3 ส่ง PATCH `{ status: "Done" }` → โค้ดเดิมได้: 403 → ที่ถูกต้องคือ: 200 |
| 3 | tasks.js:21-22 | logic | high | Employee ที่ไม่ส่ง projectId ได้ SQL ที่มี `AND` แต่ไม่มี `WHERE` เลย error | เก็บเงื่อนไขใน array แล้ว join ด้วย AND | ทำ: Employee ส่ง `GET /api/tasks` → โค้ดเดิมได้: 500 → ที่ถูกต้องคือ: 200 เห็นเฉพาะ task ตัวเอง |
| 4 | tasks.js:66 | async | high | INSERT audit_log ไม่มี `await` ถ้าพังก็ยังตอบ 200 และไม่มี log | ใส่ `await` | ทำ: ทำให้ตาราง audit_log ใช้ไม่ได้แล้วส่ง PATCH → โค้ดเดิมได้: 200 แต่ไม่มี log → ที่ถูกต้องคือ: 500 |
| 5 | EmployeeTasks.jsx:31-33 | UI | high | แก้ object ใน state ตรงๆ แล้ว set array เดิม React ไม่ render ใหม่ | ใช้ `prev.map` สร้าง array ใหม่ | ทำ: กด "เปลี่ยนเป็น Done" → โค้ดเดิมได้: ยังเป็น To Do จนรอ 10 วินาที → ที่ถูกต้องคือ: เป็น Done ทันที |
| 6 | EmployeeTasks.jsx:37-39 | logic | high | ถ้า server บันทึกไม่สำเร็จ หน้าจอยังโชว์ Done | ใน catch คืนค่า task เดิม | ทำ: ปิด server แล้วกด Done → โค้ดเดิมได้: ขึ้น error แต่แถวยังเป็น Done → ที่ถูกต้องคือ: กลับเป็น To Do |
| 7 | EmployeeTasks.jsx:21-24 | async | high | ไม่ clear interval ออกจากหน้าแล้วยังดึงข้อมูลต่อ | `return () => clearInterval(timer)` | ทำ: เปิดหน้าแล้วไปหน้าอื่น ดู Network → โค้ดเดิมได้: ยังมี request ทุก 10 วิ → ที่ถูกต้องคือ: หยุด |
| 8 | tasks.js:9-10, 36 | validation | medium | ไม่ตรวจ `page` และ `id` ถ้าส่ง `page=0` หรือ id `abc` จะไปพังที่ DB | ตรวจก่อน ถ้าไม่ถูกตอบ 400 | ทำ: `GET /api/tasks?page=0` → โค้ดเดิมได้: 500 → ที่ถูกต้องคือ: 400 |
| 9 | EmployeeTasks.jsx:14-18 | async | medium | โหลดครั้งแรกไม่มี catch ถ้า API พัง loading ค้างตลอด (และ deps ควรเป็น `[token]`) | ใส่ catch / finally | ทำ: ปิด server แล้วเปิดหน้า → โค้ดเดิมได้: "กำลังโหลด..." ค้าง → ที่ถูกต้องคือ: ขึ้น error |
| 10 | tasks.js:83 | async | medium | DELETE ไม่มี try/catch ถ้า DB error request จะค้าง | ใส่ try/catch | ทำ: Admin ส่ง `DELETE /api/tasks/abc` → โค้ดเดิมได้: ค้างไม่ตอบ → ที่ถูกต้องคือ: 500 |
| 11 | tasks.js:57 | logic | low | เช็กแค่ Done → To Do Employee จึงส่ง To Do → To Do ได้ และเกิด log ทั้งที่ไม่ได้เปลี่ยน | ให้ผ่านเฉพาะ To Do → Done | ทำ: Employee ส่ง `{ status: "To Do" }` กับ task ที่เป็น To Do → โค้ดเดิมได้: 200 → ที่ถูกต้องคือ: 409 |
| 12 | EmployeeTasks.jsx:55 | UI | low | ใช้ index เป็น key กับรายการที่กรองได้ | `key={t.id}` | ทำ: เปลี่ยน filter แล้วดูใน React DevTools → โค้ดเดิมได้: `<li>` ถูกใช้ซ้ำกับ task คนละตัว → ที่ถูกต้องคือ: แยกตาม id |

## จุดที่สงสัย

- **tasks.js:22, 25 ต่อค่าเข้า SQL ตรงๆ** ดูเหมือน SQL injection แต่ `req.user.id` มาจาก token และ `offset` คำนวณเป็นตัวเลขเสมอ จึงไม่น่าโดน แต่ตอนแก้ข้อ 3 ก็เปลี่ยนเป็น parameter ไปด้วย
- **tasks.js:18 `$${params.length}`** ดูเหมือนพิมพ์ `$` เกิน แต่ถูกแล้ว ตัวแรกคือ `$1` ของ PostgreSQL
- **tasks.js:51 `task.assigned_to === req.user.id`** ถ้าฝั่งหนึ่งเป็น string อีกฝั่งเป็น number จะไม่เท่ากัน ไม่แน่ใจชนิดข้อมูล เลยใส่ `Number()` กันไว้
- **UPDATE กับ INSERT log ควรอยู่ใน transaction เดียวกัน** แต่ไม่รู้ว่า `db` ทำ transaction ยังไง เลยแค่ใส่ `await`
