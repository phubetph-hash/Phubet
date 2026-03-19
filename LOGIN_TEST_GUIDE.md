# 🔐 Project Advisor System - Login Testing Guide

ระบบใช้ **Session-based Authentication** ด้วย email + password ที่เก็บใน MySQL database

## 📋 Test Accounts (จากฐานข้อมูล advisordb)

**Password สำหรับทั้งหมด: `123456`**

---

## 👨‍💼 ADMIN Account

| Email | Password | Role | Name |
|-------|----------|------|------|
| `admin@ku.th` | `123456` | Admin | Admin User |

**การ Login:**
1. เปิด http://localhost/project-advisor-system/frontend หรือ http://localhost:3000
2. หน้า Login ให้กรอก:
   - Email: `admin@ku.th`
   - Password: `123456`
3. กด "เข้าสู่ระบบ"
4. ✅ ควรไปหน้า **Admin Dashboard** (/admin/dashboard)

**ที่สามารถทำได้:**
- 📊 ดู Dashboard สถิติ
- 👥 User Management - เพิ่ม/แก้/ลบ/รีเซ็ตรหัส
- 🎓 Master Data Management - จัดการ Faculty/Department/Program/Expertise

---

## 👨‍🏫 ADVISOR Accounts (อาจารย์)

| No | Email | Password | Name | Rank | Capacity |
|----|----|----------|------|------|----------|
| 1 | `somsak.s@ku.th` | `123456` | สมศักดิ์ สอนดี | ผศ.ดร. | 3 |
| 2 | `malai.k@ku.th` | `123456` | มาลัย เก่งมาก | รศ.ดร. | 5 |
| 3 | `prasert.c@ku.th` | `123456` | ประเสริฐ ฉลาดสุด | ศ.ดร. | 2 |
| 4 | `patipat.si@ku.th` | `123456` | ปฏิพัทธ์ สิทธิ์ประเสริฐ | อาจารย์ | 4 |
| 5 | `malee.k2@ku.th` | `123456` | มาลี ขยันสอน | ผศ.ดร. | 3 |

**การ Login:**
1. กรอก Email: `somsak.s@ku.th` (หรืออีกคนใดก็ได้ตามตาราข้างบน)
2. กรอก Password: `123456`
3. กด "เข้าสู่ระบบ"
4. ✅ ควรไปหน้า **Advisor Dashboard** (/advisor/dashboard)

**ที่สามารถทำได้:**
- 📊 ดู Dashboard - สถิติ/ความจุ/สถานะคำขอ
- 📋 Manage Requests - เห็นรายการคำขอจากนิสิต, อนุมัติ/ปฏิเสธ
- 👤 Profile - แก้ไขข้อมูลส่วนตัว (Rank/Degree/Expertise/Capacity/Phone)

---

## 👨‍🎓 STUDENT Accounts (นิสิต)

| No | Student ID | Email | Password | Name |
|----|----|----|----------|------|
| 1 | 61123456789 | `somchai.j@ku.th` | `123456` | สมชาย ใจดี |
| 2 | 61234567890 | `somying.r@ku.th` | `123456` | สมหญิง รักเรียน |
| 3 | 61345678901 | `wichai.k@ku.th` | `123456` | วิชัย เก่งมาก |
| 4 | 61456789012 | `malee.k@ku.th` | `123456` | มาลี ขยันเรียน |
| 5 | 61567890123 | `phubet.ph@ku.th` | `123456` | นายภูเบศ โพติยะ |

**การ Login:**
1. กรอก Email: `somchai.j@ku.th` (หรืออีกคนใดก็ได้ตามตาราข้างบน)
2. กรอก Password: `123456`
3. กด "เข้าสู่ระบบ"
4. ✅ ควรไปหน้า **Student Dashboard** (/student/dashboard)

**ที่สามารถทำได้:**
- 📊 ดู Dashboard - สถิติ/สถานะคำขอ
- 👨‍🏫 Browse Advisors - ค้นหา/ค้นหาเพื่อเลือกอาจารย์ที่ปรึกษา
- 📝 Submit Request - ส่งคำขอหารือกับอาจารย์ + อัปโหลด PDF proposal
- 📋 Request Status - ตรวจสอบสถานะคำขอทั้งหมด

---

## 🚀 วิธี Login ผ่าน Frontend

### Step 1: เปิด Login Page
```
Frontend URL: http://localhost:3000
Backend URL: http://localhost/project-advisor-system/backend
```

### Step 2: กรอกรหัสผ่าน
- **Email address field:** ใส่ email จากตารางข้างบน
- **Password field:** ใส่ `123456`

### Step 3: ส่ง Login
- กด "เข้าสู่ระบบ" บัตตัน
- ระบบจะเรียก POST `/api/auth/login` ไปยัง backend

### Step 4: Redirect ตาม Role
| Role | Route | Page |
|------|-------|------|
| Admin | `/admin/dashboard` | Admin Dashboard |
| Advisor | `/advisor/dashboard` | Advisor Dashboard |
| Student | `/student/dashboard` | Student Dashboard |

---

## ✅ การตรวจสอบ Login สำเร็จ

1. ✅ URL เปลี่ยนไปตาม role (dashboard)
2. ✅ เห็นชื่อผู้ใช้ในเมนู/header
3. ✅ localStorage มี `advisor_system_user` (ตรวจ DevTools > Storage > localStorage)
4. ✅ Cookie มี `PHPSESSID` (session)
5. ✅ ปุ่ม "ออกจากระบบ" สามารถคลิกได้ และกระบวนการ logout ทำงาน

---

## 🔄 Logout Test

1. หลังจาก login สำเร็จ ดูปุ่ม "ออกจากระบบ" หรือ "Logout"
2. กดปุ่มนั้น
3. ✅ ควรกลับไปหน้า `/login` หรือ `/`
4. ✅ localStorage ต้องว่างเปล่า
5. ✅ Session cookie ต้องถูกลบ
6. ✅ กลับไปหน้า dashboard ด้วยการกด back browser ควรปฏิเสธและไปที่ login

---

## 🔧 Troubleshooting

### ❌ "Invalid Email or Password"
- ❓ ตรวจว่า email กรอกถูกต้องหรือไม่ (มีตัว **)
- ❓ ตรวจว่า password คือ `123456` (ไม่มีเว้นที่)
- ❓ ตรวจว่า database import แล้ว (advisordb)

### ❌ CORS Error / "No 'Access-Control-Allow-Origin' header"
- ✅ ตรวจ backend `.htaccess` มี CORS headers
- ✅ ตรวจ `.env.local` ว่า `NEXT_PUBLIC_API_BASE_URL` ชี้ไปยัง backend ถูกต้อง
- ✅ ตรวจว่า backend/middleware/cors.php มี `header('Access-Control-Allow-Origin: *')`

### ❌ Session ไม่อยู่ / Redirect ไป login บ่อยๆ
- ✅ ตรวจ backend cookie settings (httpOnly/Secure/SameSite)
- ✅ ตรวจ `backend/middleware/auth.php` ว่าโปรแกรมบัตเสสสำหรับ session
- ✅ ตรวจว่า XAMPP MySQL กำลังทำงาน

### ❌ "Cannot read property 'avatar'"
- ✅ API response ไม่สมบูรณ์ ตรวจ `/api/auth/login` ว่าคืนค่าตรง schema

---

## 📝 Database Hash Password

ทั้งหมด test account ใช้ password hash เดียวกัน:
```
8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92
```

Hash นี้แปลง plain text password `123456` ด้วย SHA256

หากต้องการเปลี่ยน password ใหม่:
1. คำนวณ SHA256 ของ plain password ใหม่
2. UPDATE database ด้วย SQL:
   ```sql
   UPDATE administrator SET password = 'NEW_SHA256_HASH' WHERE email = 'admin@ku.th';
   -- หรือ
   UPDATE advisor SET password = 'NEW_SHA256_HASH' WHERE email = 'somsak.s@ku.th';
   ```

---

## 📱 Test Sequence แนะนำ

### Day 1: Basic Login
- [ ] Login Advisor 1: somsak.s@ku.th
- [ ] ดู Advisor Dashboard
- [ ] Logout และกลับไปหน้า login
- [ ] Login Student 1: somchai.j@ku.th
- [ ] ดู Student Dashboard
- [ ] Logout

### Day 2: Admin Management
- [ ] Login Admin: admin@ku.th
- [ ] ดู Admin Dashboard
- [ ] ไปหน้า User Management ค้นหา advisor/student
- [ ] ไปหน้า Master Data เพิ่ม/แก้ Faculty/Department

### Day 3: Advisor Workflow
- [ ] Login Advisor: somsak.s@ku.th
- [ ] ดูหน้า Manage Requests
- [ ] Edit Profile

### Day 4: Student Workflow
- [ ] Login Student: somchai.j@ku.th
- [ ] Browse Advisors ค้นหา
- [ ] Submit Request + Upload
- [ ] ดู Request Status

---

**✨ Good luck with testing! 🎉**
