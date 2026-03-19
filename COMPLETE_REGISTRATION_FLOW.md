# 📊 โครงสร้างและขั้นตอนการสมัครสมาชิก - Project Advisor System

## 🏗️ **โครงสร้างไฟล์ระบบ**

### 📂 **Frontend Structure (Next.js)**
```
frontend/src/
├── app/
│   ├── layout.js                     # Layout หลัก + NotificationProvider
│   ├── page.js                      # หน้าแรก (Home) มีปุ่ม Login/Register  
│   ├── login/page.js                # หน้า Login
│   ├── register/page.js             # หน้า Register (เลือกประเภทผู้ใช้)
│   ├── admin/                       # หน้าเฉพาะแอดมิน
│   ├── advisor/                     # หน้าเฉพาะอาจารย์
│   └── student/                     # หน้าเฉพาะนิสิต
│
├── components/
│   ├── forms/
│   │   ├── LoginForm.js            # ฟอร์มเข้าสู่ระบบ
│   │   └── RegisterForm.js         # ฟอร์มสมัครสมาชิก (แยกตามประเภท)
│   ├── admin/                      # Components แอดมิน
│   ├── advisor/                    # Components อาจารย์
│   └── student/                    # Components นิสิต
│
├── lib/
│   ├── api.js                      # API Client สำหรับเรียก Backend
│   ├── validation.js               # Validation Rules
│   ├── errorHandler.js             # Error Handling
│   └── constants.js                # ค่าคงที่
│
└── contexts/
    └── NotificationContext.js       # Context สำหรับ Notifications
```

### 📂 **Backend Structure (PHP)**
```
backend/
├── config.php                      # การตั้งค่าฐานข้อมูล + CORS
├── connect.php                     # การเชื่อมต่อฐานข้อมูล MySQL
├── middleware/
│   ├── auth.php                    # ตรวจสอบ Authentication
│   └── rate_limit.php              # จำกัดจำนวนการเรียก API
│
├── api/
│   ├── auth/
│   │   ├── login.php              # เข้าสู่ระบบ
│   │   ├── logout.php             # ออกจากระบบ
│   │   └── check-session.php      # ตรวจสอบ Session
│   │
│   ├── students/
│   │   └── create.php             # สมัครสมาชิกนิสิต
│   │
│   ├── advisors/
│   │   └── create.php             # สมัครสมาชิกอาจารย์
│   │
│   └── helpers/                   # APIs ข้อมูลพื้นฐาน
│       ├── faculties.php          # ข้อมูลคณะ
│       ├── departments.php        # ข้อมูลภาควิชา
│       ├── programs.php           # ข้อมูลสาขา
│       ├── expertises.php         # ข้อมูลความเชี่ยวชาญ
│       ├── academic_ranks.php     # ตำแหน่งทางวิชาการ
│       └── academic_degrees.php   # วุฒิการศึกษา
└── uploads/                       # โฟลเดอร์อัปโหลดไฟล์
```

### 🗄️ **Database Structure (MySQL)**
```
advisordb (Database)
├── Tables สำหรับผู้ใช้:
│   ├── student                    # ข้อมูลนิสิต
│   ├── advisor                    # ข้อมูลอาจารย์
│   ├── administrator              # ข้อมูลแอดมิน
│   └── auth_accounts (VIEW)       # View รวมข้อมูล Authentication
│
├── Tables ข้อมูลพื้นฐาน:
│   ├── faculty                    # คณะ
│   ├── department                 # ภาควิชา
│   ├── program                    # สาขา/หลักสูตร
│   ├── expertise                  # ความเชี่ยวชาญ
│   ├── academic_rank              # ตำแหน่งทางวิชาการ
│   ├── academic_degree            # วุฒิการศึกษา
│   └── academic_term              # ปีการศึกษา
│
├── Tables การทำงาน:
│   ├── request                    # คำขอที่ปรึกษา
│   ├── advisor_expertise          # ความเชี่ยวชาญของอาจารย์ (Many-to-Many)
│   └── student_advisor            # ความสัมพันธ์นิสิต-อาจารย์
│
└── Views:
    ├── auth_accounts              # View สำหรับ Authentication
    └── advisor_capacity_view      # View สำหรับความจุอาจารย์
```

---

## 🚀 **ขั้นตอนการสมัครสมาชิก**

### 📋 **Step 1: เข้าสู่หน้าสมัครสมาชิก**

1. **เริ่มจากหน้าแรก:** `http://localhost:3000`
   - คลิกปุ่ม **"ลงทะเบียน"** (สีเขียว)

2. **หรือไปตรงๆ:** `http://localhost:3000/register`

3. **หน้า Register จะแสดง:**
   ```
   ┌─────────────────────────┐
   │      สมัครสมาชิก         │
   │ เลือกประเภทบัญชีที่ต้องการสมัคร │
   │                         │
   │ [สำหรับนิสิต] [สำหรับอาจารย์] │
   └─────────────────────────┘
   ```

---

### 👨‍🎓 **Step 2A: สมัครสำหรับนิสิต (Student Registration)**

#### **📝 ข้อมูลที่ต้องกรอก:**
1. **ข้อมูลส่วนตัว:**
   - 🔸 **คำนำหน้า** - เลือก: นาย/นางสาว/นาง
   - 🔸 **ชื่อ** - ชื่อจริง
   - 🔸 **นามสกุล** - นามสกุลจริง
   - 🔸 **อีเมล** - ต้องไม่ซ้ำในระบบ
   - 🔸 **รหัสผ่าน** - มีความซับซ้อนตามกฎ
   - 🔸 **ยืนยันรหัสผ่าน** - ต้องตรงกับรหัสผ่าน
   - 🔸 **เบอร์โทรศัพท์** - รูปแบบที่ถูกต้อง

2. **ข้อมูลการศึกษา:**
   - 🔸 **รหัสนิสิต** - 10 หลัก (เช่น 1234567890)
   - 🔸 **คณะ** - เลือกจาก Dropdown
   - 🔸 **ภาควิชา** - เลือกตามคณะที่เลือก
   - 🔸 **สาขา** - เลือกตามภาควิชาที่เลือก

#### **⚡ Flow การเลือกคณะ-ภาควิชา-สาขา:**
```
เลือกคณะ → API โหลดภาควิชา → เลือกภาควิชา → API โหลดสาขา → เลือกสาขา
```

#### **🔄 API Calls ที่เกิดขึ้น:**
```javascript
// 1. โหลดข้อมูลพื้นฐาน
GET /api/helpers/faculties.php
GET /api/helpers/expertises.php
GET /api/helpers/academic_ranks.php
GET /api/helpers/academic_degrees.php

// 2. เมื่อเลือกคณะ
GET /api/helpers/departments.php?faculty_id={id}

// 3. เมื่อเลือกภาควิชา  
GET /api/helpers/programs.php?department_id={id}

// 4. ส่งข้อมูลสมัครสมาชิก
POST /api/students/create.php
{
  "prefix": "นาย",
  "first_name": "สมชาย",
  "last_name": "ใจดี", 
  "email": "student@example.com",
  "password": "password123",
  "phone": "0812345678",
  "student_id": "1234567890",
  "faculty_id": 1,
  "department_id": 2,
  "program_id": 3
}
```

---

### 👩‍🏫 **Step 2B: สมัครสำหรับอาจารย์ (Advisor Registration)**

#### **📝 ข้อมูลที่ต้องกรอก:**
1. **ข้อมูลส่วนตัว:**
   - 🔸 **คำนำหน้า** - เลือก: นาย/นางสาว/นาง/อ./ผศ./รศ./ศ./ดร./อ.ดร./ผศ.ดร./รศ.ดร./ศ.ดร.
   - 🔸 **ชื่อ** - ชื่อจริง
   - 🔸 **นามสกุล** - นามสกุลจริง
   - 🔸 **อีเมล** - ต้องไม่ซ้ำในระบบ
   - 🔸 **รหัสผ่าน** - มีความซับซ้อนตามกฎ
   - 🔸 **ยืนยันรหัสผ่าน** - ต้องตรงกับรหัสผ่าน
   - 🔸 **เบอร์โทรศัพท์** - รูปแบบที่ถูกต้อง

2. **ข้อมูลทางวิชาการ:**
   - 🔸 **ตำแหน่งทางวิชาการ** - เลือก: อาจารย์/ผศ./รศ./ศ. (มีทั้งที่มี ดร. และไม่มี)
   - 🔸 **วุฒิการศึกษา** - เลือก: วท.บ./วท.ม./บธ.ม./ศศ.ม./ดร.
   - 🔸 **คณะ** - เลือกจาก Dropdown
   - 🔸 **ภาควิชา** - เลือกตามคณะที่เลือก

3. **ข้อมูลการรับนิสิต:**
   - 🔸 **จำนวนนิสิตที่รับได้** - ระบุเป็นตัวเลข (1-20)
   - 🔸 **ความเชี่ยวชาญ** - เลือกได้หลายอย่าง (Checkbox)

#### **🔄 API Calls ที่เกิดขึ้น:**
```javascript
// 1. โหลดข้อมูลพื้นฐาน (เหมือนนิสิต + เพิ่ม)
GET /api/helpers/faculties.php
GET /api/helpers/departments.php?faculty_id={id}
GET /api/helpers/expertises.php
GET /api/helpers/academic_ranks.php  
GET /api/helpers/academic_degrees.php

// 2. ส่งข้อมูลสมัครสมาชิก
POST /api/advisors/create.php
{
  "prefix": "ผศ.ดร.", 
  "first_name": "สมศรี",
  "last_name": "ใจดี",
  "email": "advisor@example.com",
  "password": "password123",
  "phone": "0812345678",
  "academic_rank_id": 6,
  "academic_degree_id": 6,
  "faculty_id": 1,
  "department_id": 2,
  "project_capacity": 8,
  "expertise_ids": [1, 3, 5]
}
```

---

## 🔐 **ระบบ Authentication และ Security**

### 🛡️ **Security Features:**

1. **Password Hashing:**
   ```php
   // ใช้ SHA2-256 ในฐานข้อมูล
   SELECT SHA2('password123', 256) AS hashed_password
   ```

2. **Email Uniqueness Check:**
   ```php
   // ตรวจสอบในทุก role ผ่าน auth_accounts view
   SELECT COUNT(*) FROM auth_accounts WHERE email = 'user@example.com'
   ```

3. **Input Validation:**
   - Frontend: JavaScript validation + UI feedback
   - Backend: PHP validation + SQL injection prevention

4. **Rate Limiting:**
   ```php
   // จำกัด 20 requests ต่อ 60 วินาทีต่อ IP
   rate_limit('auth_login', 20, 60);
   ```

### 🔑 **Authentication Flow:**

#### **Registration Process:**
```
1. User กรอกฟอร์ม → 2. Frontend Validation → 3. API Call → 4. Backend Validation 
→ 5. Password Hashing → 6. บันทึกในฐานข้อมูล → 7. Redirect ไป Login
```

#### **Login Process:**
```
1. User กรอก Email/Password → 2. POST /api/auth/login.php → 3. ตรวจสอบจาก auth_accounts
→ 4. Hash password และเปรียบเทียบ → 5. สร้าง PHP Session → 6. Return user data
→ 7. Frontend บันทึกใน localStorage → 8. Redirect ตาม role
```

#### **Session Management:**
```php
// PHP Session Variables
$_SESSION['role'] = 'student|advisor|admin';
$_SESSION['user_id'] = '1234567890';
$_SESSION['email'] = 'user@example.com';

// Frontend localStorage
{
  "id": "1234567890",
  "email": "user@example.com", 
  "role": "student",
  "name": "ชื่อ นามสกุล"
}
```

---

## 🔄 **Role-Based Redirection:**

### **หลังจาก Login สำเร็จ:**
```javascript
switch (role) {
  case 'student':
    router.push('/dashboard');           // นิสิต → Student Dashboard
    break;
  case 'advisor': 
    router.push('/advisor/dashboard');   // อาจารย์ → Advisor Dashboard
    break;
  case 'administrator':
    router.push('/admin/dashboard');     // แอดมิน → Admin Dashboard
    break;
  default:
    router.push('/dashboard');           // Default → Student Dashboard
}
```

---

## 📱 **User Interface Flow:**

### **การสมัครสมาชิก:**
```
หน้าแรก → คลิก "ลงทะเบียน" → เลือกประเภทผู้ใช้ → กรอกฟอร์ม → สมัครสำเร็จ → ไปหน้า Login
```

### **การเข้าสู่ระบบ:**
```  
หน้าแรก → คลิก "เข้าสู่ระบบ" → กรอก Email/Password → Login สำเร็จ → Dashboard ตาม Role
```

### **Responsive Design:**
- ✅ **Mobile-First:** ออกแบบสำหรับมือถือก่อน
- ✅ **Tailwind CSS:** ใช้ Utility Classes
- ✅ **Grid/Flexbox:** Layout ที่ยืดหยุ่น
- ✅ **Form Validation:** Real-time feedback

---

## 🔧 **การตั้งค่าระบบ:**

### **Database Setup:**
1. Import `advisordb.sql` เข้า MySQL
2. Tables และ Views จะถูกสร้างอัตโนมัติ
3. ข้อมูลพื้นฐาน (คณะ, ภาควิชา, ฯลฯ) จะถูกเพิ่มเข้าไป

### **Backend Setup:**
1. Configure `config.php` สำหรับฐานข้อมูล
2. ตั้งค่า CORS สำหรับ Frontend
3. Apache/Nginx ต้องรองรับ PHP

### **Frontend Setup:**
1. `npm install` สำหรับ dependencies
2. `npm run dev` สำหรับ development server
3. Environment variables ใน `.env.local`

---

## ✅ **สรุป: ระบบสมัครสมาชิกที่สมบูรณ์**

### **🎯 Features พร้อมใช้งาน:**
- ✅ **หน้าสมัครสมาชิก** - เลือกประเภทผู้ใช้
- ✅ **ฟอร์มนิสิต** - ครบทุกฟิลด์ + Validation
- ✅ **ฟอร์มอาจารย์** - ครบทุกฟิลด์ + Multiple Selection
- ✅ **Master Data Integration** - คณะ/ภาควิชา/สาขา แบบเชื่อมโยง
- ✅ **Security** - Password hashing, Email uniqueness, Rate limiting  
- ✅ **Authentication** - Session-based login system
- ✅ **Role Management** - Student/Advisor/Admin roles
- ✅ **Database Schema** - ครบถ้วนทุก table และ relationship

### **📍 URLs สำคัญ:**
- **หน้าแรก:** `http://localhost:3000`
- **สมัครสมาชิก:** `http://localhost:3000/register`
- **เข้าสู่ระบบ:** `http://localhost:3000/login`

**🎊 ระบบสมัครสมาชิกพร้อมใช้งานครบถ้วน 100%!**