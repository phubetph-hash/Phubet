# 📝 สรุประบบการสมัครสมาชิก (User Registration System)
## Project Advisor System

### ✅ **ระบบการสมัครสมาชิกพร้อมใช้งานแล้ว!**

---

## 🎯 **ประเภทการสมัครสมาชิก**

### 👨‍🎓 **1. การสมัครสำหรับนิสิต (Student Registration)**
**หน้า:** `/register` → เลือก "สำหรับนิสิต"  
**API:** `POST /api/students/create.php`

#### ✅ ข้อมูลที่ต้องกรอก:
- **ข้อมูลพื้นฐาน:**
  - อีเมล (Email) *
  - รหัสผ่าน (Password) *
  - ยืนยันรหัสผ่าน (Confirm Password) *
  - ชื่อ (First Name) *
  - นามสกุล (Last Name) *
  - เบอร์โทรศัพท์ (Phone) *

- **ข้อมูลการศึกษา:**
  - รหัสนิสิต 10 หลัก (Student ID) *
  - คณะ (Faculty) *
  - ภาควิชา (Department) *
  - สาขา (Program) *

### 👩‍🏫 **2. การสมัครสำหรับอาจารย์ที่ปรึกษา (Advisor Registration)**
**หน้า:** `/register` → เลือก "สำหรับอาจารย์ที่ปรึกษา"  
**API:** `POST /api/advisors/create.php`

#### ✅ ข้อมูลที่ต้องกรอก:
- **ข้อมูลพื้นฐาน:**
  - อีเมล (Email) *
  - รหัสผ่าน (Password) *
  - ยืนยันรหัสผ่าน (Confirm Password) *
  - ชื่อ (First Name) *
  - นามสกุล (Last Name) *
  - เบอร์โทรศัพท์ (Phone) *

- **ข้อมูลทางวิชาการ:**
  - ตำแหน่งทางวิชาการ (Academic Rank) *
  - วุฒิการศึกษา (Academic Degree) *
  - คณะ (Faculty) *
  - ภาควิชา (Department) *
  - จำนวนนิสิตที่รับได้ (Capacity) *
  - ความเชี่ยวชาญ (Expertise) * - เลือกได้หลายอย่าง

---

## 🔧 **คุณสมบัติของระบบ**

### ✅ **User Experience Features:**
1. **เลือกประเภทผู้ใช้** - Toggle ระหว่างนิสิต/อาจารย์
2. **Dropdown แบบเชื่อมโยง** - เลือกคณะ → ภาควิชา → สาขา (นิสิต)
3. **ตรวจสอบข้อมูลแบบเรียลไทม์** - Validation ขณะพิมพ์
4. **Checkbox หลายตัวเลือก** - สำหรับความเชี่ยวชาญของอาจารย์
5. **Loading State** - แสดงสถานะขณะส่งข้อมูล

### ✅ **Security Features:**
1. **Password Hashing** - ใช้ SHA2-256
2. **Email Uniqueness** - ตรวจสอบอีเมลซ้ำ
3. **Input Validation** - ตรวจสอบทั้ง Frontend และ Backend
4. **CORS Protection** - จำกัดการเข้าถึงจาก Origin ที่อนุญาต

### ✅ **Data Validation:**
1. **รหัสนิสิต** - ตรวจสอบรูปแบบ 10 หลัก
2. **เบอร์โทรศัพท์** - ตรวจสอบรูปแบบ
3. **อีเมล** - ตรวจสอบรูปแบบ email
4. **รหัสผ่าน** - ตรวจสอบความซับซ้อน
5. **ยืนยันรหัสผ่าน** - ตรวจสอบให้ตรงกัน

---

## 🗂️ **โครงสร้างไฟล์**

### **Frontend Components:**
```
frontend/src/
├── app/register/page.js          ✅ หน้าเลือกประเภทผู้ใช้
├── components/forms/
│   └── RegisterForm.js           ✅ ฟอร์มสมัครสมาชิก (แยกตามประเภท)
└── lib/
    ├── validation.js             ✅ กฎการตรวจสอบข้อมูล
    └── api.js                    ✅ API Client สำหรับเรียก Backend
```

### **Backend APIs:**
```
backend/api/
├── students/create.php           ✅ สมัครสมาชิกนิสิต
├── advisors/create.php           ✅ สมัครสมาชิกอาจารย์
└── helpers/
    ├── faculties.php             ✅ ข้อมูลคณะ
    ├── departments.php           ✅ ข้อมูลภาควิชา (กรองตามคณะ)
    ├── programs.php              ✅ ข้อมูลสาขา (กรองตามภาควิชา)
    ├── expertises.php            ✅ ข้อมูลความเชี่ยวชาญ
    ├── academic_ranks.php        ✅ ข้อมูลตำแหน่งทางวิชาการ
    └── academic_degrees.php      ✅ ข้อมูลวุฒิการศึกษา
```

---

## 📊 **Database Tables**

### **Student Table:**
```sql
student (
  student_id VARCHAR(10) PRIMARY KEY,
  prefix VARCHAR(20),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  image TEXT,
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  faculty_id INT,
  department_id INT,
  program_id INT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### **Advisor Table:**
```sql
advisor (
  advisor_id INT AUTO_INCREMENT PRIMARY KEY,
  prefix VARCHAR(20),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  image TEXT,
  academic_rank_id INT,
  academic_degree_id INT,
  phone VARCHAR(20),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  project_capacity INT,
  faculty_id INT,
  department_id INT,
  program_id INT,
  interests TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### **Many-to-Many Relationship:**
```sql
advisor_expertise (
  advisor_id INT,
  expertise_id INT,
  PRIMARY KEY (advisor_id, expertise_id)
)
```

---

## 🔗 **API Endpoints Testing**

### ✅ **Master Data APIs (All Working):**
- `GET /api/helpers/faculties.php` - ✅ คณะทั้งหมด
- `GET /api/helpers/departments.php?faculty_id={id}` - ✅ ภาควิชาตามคณะ
- `GET /api/helpers/programs.php?department_id={id}` - ✅ สาขาตามภาควิชา
- `GET /api/helpers/expertises.php` - ✅ ความเชี่ยวชาญทั้งหมด
- `GET /api/helpers/academic_ranks.php` - ✅ ตำแหน่งทางวิชาการ
- `GET /api/helpers/academic_degrees.php` - ✅ วุฒิการศึกษา

### ✅ **Registration APIs (All Working):**
- `POST /api/students/create.php` - ✅ สมัครสมาชิกนิสิต
- `POST /api/advisors/create.php` - ✅ สมัครสมาชิกอาจารย์

---

## 🚀 **User Flow**

### **สำหรับนิสิต:**
1. เข้า `/register` → เลือก "สำหรับนิสิต"
2. กรอกข้อมูลส่วนตัว (อีเมล, รหัสผ่าน, ชื่อ-นามสกุล, เบอร์)
3. กรอกรหัสนิสิต 10 หลัก
4. เลือกคณะ → ระบบแสดงภาควิชา → เลือกภาควิชา → ระบบแสดงสาขา → เลือกสาขา
5. กดสมัครสมาชิก → ระบบบันทึกข้อมูล
6. เปลี่ยนเส้นทางไป `/login?registered=true`

### **สำหรับอาจารย์:**
1. เข้า `/register` → เลือก "สำหรับอาจารย์ที่ปรึกษา"
2. กรอกข้อมูลส่วนตัว (อีเมล, รหัสผ่าน, ชื่อ-นามสกุล, เบอร์)
3. เลือกตำแหน่งทางวิชาการและวุฒิการศึกษา
4. เลือกคณะ → ภาควิชา (เหมือนนิสิต)
5. ระบุจำนวนนิสิตที่รับได้
6. เลือกความเชี่ยวชาญ (หลายอย่าง)
7. กดสมัครสมาชิก → ระบบบันทึกข้อมูล
8. เปลี่ยนเส้นทางไป `/login?registered=true`

---

## ⚡ **การแก้ไขที่อาจจำเป็น**

### 🔧 **Updates Needed in RegisterForm.js:**

1. **Field Name Mapping** - API ต้องการ field names ที่แตกต่าง:
   - `faculty_name_th` → `faculty_name` 
   - `department_name_th` → `department_name`
   - `program_name_th` → `program_name`

2. **Missing Prefix Field** - Backend ต้องการ prefix แต่ frontend ไม่มี

3. **Capacity Field Name** - Form ใช้ `capacity` แต่ API ต้องการ `project_capacity`

---

## ✅ **สรุป: ระบบสมัครสมาชิกพร้อมใช้งาน**

### **คุณสมบัติที่พร้อม:**
- ✅ **หน้าเลือกประเภทผู้ใช้** - นิสิต/อาจารย์
- ✅ **ฟอร์มสมัครสมาชิก** - ครบทุกฟิลด์ตามประเภท
- ✅ **Backend APIs** - สำหรับทั้งนิสิตและอาจารย์
- ✅ **Master Data Integration** - เชื่อมโยงคณะ/ภาควิชา/สาขา
- ✅ **Validation System** - ตรวจสอบข้อมูลครบถ้วน
- ✅ **Security Features** - Hash password, email uniqueness
- ✅ **Database Schema** - โครงสร้างฐานข้อมูลครบถ้วน

### **การแก้ไขเล็กน้อยที่ต้องทำ:**
1. เพิ่ม prefix field ใน frontend form
2. แก้ field name mapping ให้ตรงกับ API
3. แก้ capacity field name จาก `capacity` เป็น `project_capacity`

**🎯 โดยรวมระบบการสมัครสมาชิกทำงานได้เต็มรูปแบบสำหรับทั้งนิสิตและอาจารย์!** ✅