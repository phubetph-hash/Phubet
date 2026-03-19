# พจนานุกรมข้อมูล (Data Dictionary)
## ระบบยื่นคำขออาจารย์ที่ปรึกษาโครงงานสำหรับนิสิต (Project Advisor System)

---

## ตารางที่ X-1 ตารางฐานข้อมูลระบบ

| ลำดับ | ตาราง | คำอธิบาย |
|---|---|---|
| 1 | faculty | ตารางคณะ |
| 2 | department | ตารางภาควิชา |
| 3 | program | ตารางสาขาวิชา |
| 4 | academic_degree | ตารางวุฒิการศึกษา |
| 5 | academic_rank | ตารางตำแหน่งทางวิชาการ |
| 6 | academic_term | ตารางภาคการศึกษา |
| 7 | expertise | ตารางความเชี่ยวชาญ |
| 8 | student | ตารางนิสิต |
| 9 | advisor | ตารางอาจารย์ที่ปรึกษา |
| 10 | administrator | ตารางผู้ดูแลระบบ |
| 11 | advisor_expertise | ตารางความเชี่ยวชาญของอาจารย์ |
| 12 | request | ตารางคำขอ |
| 13 | student_advisor | ตารางการมอบหมายอาจารย์ที่ปรึกษา |
| 14 | notifications | ตารางการแจ้งเตือน |
| 15 | user_status | ตารางสถานะผู้ใช้งาน |
| 16 | password_reset_tokens | ตารางโทเค็นรีเซ็ตรหัสผ่าน |
| 17 | auth_accounts | ตารางบัญชีผู้ใช้งาน (มุมมองสำหรับการยืนยันตัวตน) |
| 18 | file_counter | ตารางนับจำนวนไฟล์ |

---

## ตารางที่ X-2 ตารางคณะ (faculty)

| ลำดับ | ชื่อ Attribute | ชนิดข้อมูล | PK/FK | ตารางอ้างอิง | คำอธิบาย |
|---|---|---|---|---|---|
| 1 | faculty_id | INT(11) | PK | - | รหัสคณะ |
| 2 | faculty_name | VARCHAR(100) | - | - | ชื่อคณะ |
| 3 | created_at | TIMESTAMP | - | - | วันที่สร้างข้อมูล |
| 4 | updated_at | TIMESTAMP | - | - | วันที่แก้ไขข้อมูลล่าสุด |

---

## ตารางที่ X-3 ตารางภาควิชา (department)

| ลำดับ | ชื่อ Attribute | ชนิดข้อมูล | PK/FK | ตารางอ้างอิง | คำอธิบาย |
|---|---|---|---|---|---|
| 1 | department_id | INT(11) | PK | - | รหัสภาควิชา |
| 2 | department_name | VARCHAR(100) | - | - | ชื่อภาควิชา |
| 3 | faculty_id | INT(11) | FK | faculty | รหัสคณะ |
| 4 | created_at | TIMESTAMP | - | - | วันที่สร้างข้อมูล |
| 5 | updated_at | TIMESTAMP | - | - | วันที่แก้ไขข้อมูลล่าสุด |

---

## ตารางที่ X-4 ตารางสาขาวิชา (program)

| ลำดับ | ชื่อ Attribute | ชนิดข้อมูล | PK/FK | ตารางอ้างอิง | คำอธิบาย |
|---|---|---|---|---|---|
| 1 | program_id | INT(11) | PK | - | รหัสสาขาวิชา |
| 2 | program_name | VARCHAR(100) | - | - | ชื่อสาขาวิชา |
| 3 | department_id | INT(11) | FK | department | รหัสภาควิชา |
| 4 | created_at | TIMESTAMP | - | - | วันที่สร้างข้อมูล |
| 5 | updated_at | TIMESTAMP | - | - | วันที่แก้ไขข้อมูลล่าสุด |

---

## ตารางที่ X-5 ตารางวุฒิการศึกษา (academic_degree)

| ลำดับ | ชื่อ Attribute | ชนิดข้อมูล | PK/FK | ตารางอ้างอิง | คำอธิบาย |
|---|---|---|---|---|---|
| 1 | academic_degree_id | INT(11) | PK | - | รหัสวุฒิการศึกษา |
| 2 | degree_code | VARCHAR(20) | - | - | รหัสย่อวุฒิการศึกษา |
| 3 | degree_name_th | VARCHAR(100) | - | - | ชื่อวุฒิการศึกษาภาษาไทย |
| 4 | degree_name_en | VARCHAR(100) | - | - | ชื่อวุฒิการศึกษาภาษาอังกฤษ |
| 5 | sort_order | TINYINT(4) | - | - | ลำดับการแสดงผล |
| 6 | is_active | TINYINT(1) | - | - | สถานะการใช้งาน (1=ใช้งาน, 0=ไม่ใช้งาน) |
| 7 | created_at | TIMESTAMP | - | - | วันที่สร้างข้อมูล |
| 8 | updated_at | TIMESTAMP | - | - | วันที่แก้ไขข้อมูลล่าสุด |

---

## ตารางที่ X-6 ตารางตำแหน่งทางวิชาการ (academic_rank)

| ลำดับ | ชื่อ Attribute | ชนิดข้อมูล | PK/FK | ตารางอ้างอิง | คำอธิบาย |
|---|---|---|---|---|---|
| 1 | academic_rank_id | INT(11) | PK | - | รหัสตำแหน่งทางวิชาการ |
| 2 | rank_code | VARCHAR(20) | - | - | รหัสย่อตำแหน่ง |
| 3 | rank_name_th | VARCHAR(100) | - | - | ชื่อตำแหน่งทางวิชาการภาษาไทย |
| 4 | rank_name_en | VARCHAR(100) | - | - | ชื่อตำแหน่งทางวิชาการภาษาอังกฤษ |
| 5 | sort_order | TINYINT(4) | - | - | ลำดับการแสดงผล |
| 6 | is_active | TINYINT(1) | - | - | สถานะการใช้งาน (1=ใช้งาน, 0=ไม่ใช้งาน) |
| 7 | created_at | TIMESTAMP | - | - | วันที่สร้างข้อมูล |
| 8 | updated_at | TIMESTAMP | - | - | วันที่แก้ไขข้อมูลล่าสุด |

---

## ตารางที่ X-7 ตารางภาคการศึกษา (academic_term)

| ลำดับ | ชื่อ Attribute | ชนิดข้อมูล | PK/FK | ตารางอ้างอิง | คำอธิบาย |
|---|---|---|---|---|---|
| 1 | academic_term_id | INT(11) | PK | - | รหัสภาคการศึกษา |
| 2 | academic_year | VARCHAR(9) | - | - | ปีการศึกษา (เช่น 2566-2567) |
| 3 | term | ENUM('1','2','ฤดูร้อน') | - | - | ภาคการศึกษา |
| 4 | created_at | TIMESTAMP | - | - | วันที่สร้างข้อมูล |
| 5 | updated_at | TIMESTAMP | - | - | วันที่แก้ไขข้อมูลล่าสุด |

---

## ตารางที่ X-8 ตารางความเชี่ยวชาญ (expertise)

| ลำดับ | ชื่อ Attribute | ชนิดข้อมูล | PK/FK | ตารางอ้างอิง | คำอธิบาย |
|---|---|---|---|---|---|
| 1 | expertise_id | INT(11) | PK | - | รหัสความเชี่ยวชาญ |
| 2 | expertise_name | VARCHAR(255) | - | - | ชื่อความเชี่ยวชาญ |
| 3 | created_at | TIMESTAMP | - | - | วันที่สร้างข้อมูล |
| 4 | updated_at | TIMESTAMP | - | - | วันที่แก้ไขข้อมูลล่าสุด |

---

## ตารางที่ X-9 ตารางนิสิต (student)

| ลำดับ | ชื่อ Attribute | ชนิดข้อมูล | PK/FK | ตารางอ้างอิง | คำอธิบาย |
|---|---|---|---|---|---|
| 1 | student_id | VARCHAR(20) | PK | - | รหัสนิสิต |
| 2 | prefix | VARCHAR(10) | - | - | คำนำหน้าชื่อ |
| 3 | first_name | VARCHAR(50) | - | - | ชื่อ |
| 4 | last_name | VARCHAR(50) | - | - | นามสกุล |
| 5 | image | VARCHAR(255) | - | - | รูปโปรไฟล์ |
| 6 | email | VARCHAR(191) | - | - | อีเมล |
| 7 | password | VARCHAR(255) | - | - | รหัสผ่าน (hashed) |
| 8 | faculty_id | INT(11) | FK | faculty | รหัสคณะ |
| 9 | department_id | INT(11) | FK | department | รหัสภาควิชา |
| 10 | program_id | INT(11) | FK | program | รหัสสาขาวิชา |
| 11 | created_at | TIMESTAMP | - | - | วันที่สร้างข้อมูล |
| 12 | updated_at | TIMESTAMP | - | - | วันที่แก้ไขข้อมูลล่าสุด |

---

## ตารางที่ X-10 ตารางอาจารย์ที่ปรึกษา (advisor)

| ลำดับ | ชื่อ Attribute | ชนิดข้อมูล | PK/FK | ตารางอ้างอิง | คำอธิบาย |
|---|---|---|---|---|---|
| 1 | advisor_id | INT(11) | PK | - | รหัสอาจารย์ที่ปรึกษา |
| 2 | prefix | VARCHAR(10) | - | - | คำนำหน้าชื่อ |
| 3 | first_name | VARCHAR(50) | - | - | ชื่อ |
| 4 | last_name | VARCHAR(50) | - | - | นามสกุล |
| 5 | image | VARCHAR(255) | - | - | รูปโปรไฟล์ |
| 6 | academic_rank_id | INT(11) | FK | academic_rank | รหัสตำแหน่งทางวิชาการ |
| 7 | academic_degree_id | INT(11) | FK | academic_degree | รหัสวุฒิการศึกษา |
| 8 | phone | VARCHAR(20) | - | - | เบอร์โทรศัพท์ |
| 9 | email | VARCHAR(191) | - | - | อีเมล |
| 10 | password | VARCHAR(255) | - | - | รหัสผ่าน (hashed) |
| 11 | project_capacity | INT(11) | - | - | จำนวนนิสิตที่รับได้ |
| 12 | faculty_id | INT(11) | FK | faculty | รหัสคณะ |
| 13 | department_id | INT(11) | FK | department | รหัสภาควิชา |
| 14 | program_id | INT(11) | FK | program | รหัสสาขาวิชา |
| 15 | interests | TEXT | - | - | ความสนใจของอาจารย์ |
| 16 | created_at | TIMESTAMP | - | - | วันที่สร้างข้อมูล |
| 17 | updated_at | TIMESTAMP | - | - | วันที่แก้ไขข้อมูลล่าสุด |

---

## ตารางที่ X-11 ตารางผู้ดูแลระบบ (administrator)

| ลำดับ | ชื่อ Attribute | ชนิดข้อมูล | PK/FK | ตารางอ้างอิง | คำอธิบาย |
|---|---|---|---|---|---|
| 1 | admin_id | INT(11) | PK | - | รหัสผู้ดูแลระบบ |
| 2 | prefix | VARCHAR(10) | - | - | คำนำหน้าชื่อ |
| 3 | first_name | VARCHAR(50) | - | - | ชื่อ |
| 4 | last_name | VARCHAR(50) | - | - | นามสกุล |
| 5 | image | VARCHAR(255) | - | - | รูปโปรไฟล์ |
| 6 | email | VARCHAR(191) | - | - | อีเมล |
| 7 | password | VARCHAR(255) | - | - | รหัสผ่าน (hashed) |
| 8 | created_at | TIMESTAMP | - | - | วันที่สร้างข้อมูล |
| 9 | updated_at | TIMESTAMP | - | - | วันที่แก้ไขข้อมูลล่าสุด |

---

## ตารางที่ X-12 ตารางความเชี่ยวชาญของอาจารย์ (advisor_expertise)

| ลำดับ | ชื่อ Attribute | ชนิดข้อมูล | PK/FK | ตารางอ้างอิง | คำอธิบาย |
|---|---|---|---|---|---|
| 1 | advisor_id | INT(11) | PK/FK | advisor | รหัสอาจารย์ที่ปรึกษา |
| 2 | expertise_id | INT(11) | PK/FK | expertise | รหัสความเชี่ยวชาญ |

---

## ตารางที่ X-13 ตารางคำขอ (request)

| ลำดับ | ชื่อ Attribute | ชนิดข้อมูล | PK/FK | ตารางอ้างอิง | คำอธิบาย |
|---|---|---|---|---|---|
| 1 | request_id | INT(11) | PK | - | รหัสคำขอ |
| 2 | student_id | VARCHAR(20) | FK | student | รหัสนิสิต |
| 3 | advisor_id | INT(11) | FK | advisor | รหัสอาจารย์ที่ปรึกษา |
| 4 | academic_term_id | INT(11) | FK | academic_term | รหัสภาคการศึกษา |
| 5 | submit_date | DATE | - | - | วันที่ยื่นคำขอ |
| 6 | project_title | VARCHAR(255) | - | - | ชื่อโครงงาน |
| 7 | project_detail | TEXT | - | - | รายละเอียดโครงงาน |
| 8 | proposal_file | VARCHAR(255) | - | - | ชื่อไฟล์ proposal ที่อัปโหลด |
| 9 | original_filename | VARCHAR(255) | - | - | ชื่อไฟล์ต้นฉบับ |
| 10 | status | ENUM('รอพิจารณา','อนุมัติ','ปฏิเสธ','ยกเลิก','หมดอายุ','เสร็จสิ้น') | - | - | สถานะคำขอ |
| 11 | approve_date | DATE | - | - | วันที่อนุมัติ |
| 12 | complete_date | DATE | - | - | วันที่เสร็จสิ้น |
| 13 | expire_date | DATE | - | - | วันที่หมดอายุ |
| 14 | suggestion | TEXT | - | - | ข้อเสนอแนะจากอาจารย์ |
| 15 | rejection_reason | TEXT | - | - | เหตุผลการปฏิเสธ |
| 16 | created_at | TIMESTAMP | - | - | วันที่สร้างข้อมูล |
| 17 | updated_at | TIMESTAMP | - | - | วันที่แก้ไขข้อมูลล่าสุด |

---

## ตารางที่ X-14 ตารางการมอบหมายอาจารย์ที่ปรึกษา (student_advisor)

| ลำดับ | ชื่อ Attribute | ชนิดข้อมูล | PK/FK | ตารางอ้างอิง | คำอธิบาย |
|---|---|---|---|---|---|
| 1 | student_id | VARCHAR(20) | PK/FK | student | รหัสนิสิต |
| 2 | advisor_id | INT(11) | FK | advisor | รหัสอาจารย์ที่ปรึกษา |
| 3 | assigned_at | DATETIME | - | - | วันที่และเวลาที่มอบหมาย |
| 4 | ended_at | DATETIME | - | - | วันที่และเวลาที่สิ้นสุดการมอบหมาย |

---

## ตารางที่ X-15 ตารางการแจ้งเตือน (notifications)

| ลำดับ | ชื่อ Attribute | ชนิดข้อมูล | PK/FK | ตารางอ้างอิง | คำอธิบาย |
|---|---|---|---|---|---|
| 1 | notification_id | INT(11) | PK | - | รหัสการแจ้งเตือน |
| 2 | user_id | VARCHAR(20) | - | - | รหัสผู้ใช้งานที่รับการแจ้งเตือน |
| 3 | user_role | VARCHAR(20) | - | - | บทบาทของผู้ใช้งาน (student/advisor/admin) |
| 4 | type | VARCHAR(50) | - | - | ประเภทการแจ้งเตือน |
| 5 | title | VARCHAR(255) | - | - | หัวข้อการแจ้งเตือน |
| 6 | message | TEXT | - | - | ข้อความแจ้งเตือน |
| 7 | is_read | TINYINT(1) | - | - | สถานะการอ่าน (0=ยังไม่อ่าน, 1=อ่านแล้ว) |
| 8 | action_url | VARCHAR(255) | - | - | URL ที่เชื่อมโยงกับการแจ้งเตือน |
| 9 | metadata | LONGTEXT | - | - | ข้อมูลเพิ่มเติม (JSON) |
| 10 | created_at | TIMESTAMP | - | - | วันที่สร้างการแจ้งเตือน |
| 11 | read_at | TIMESTAMP | - | - | วันที่และเวลาที่อ่าน |

---

## ตารางที่ X-16 ตารางสถานะผู้ใช้งาน (user_status)

| ลำดับ | ชื่อ Attribute | ชนิดข้อมูล | PK/FK | ตารางอ้างอิง | คำอธิบาย |
|---|---|---|---|---|---|
| 1 | role | ENUM('student','advisor','admin') | PK | - | บทบาทของผู้ใช้งาน |
| 2 | user_id | VARCHAR(20) | PK | - | รหัสผู้ใช้งาน |
| 3 | status | ENUM('active','suspended','deleted') | - | - | สถานะบัญชีผู้ใช้งาน |
| 4 | updated_at | TIMESTAMP | - | - | วันที่แก้ไขสถานะล่าสุด |

---

## ตารางที่ X-17 ตารางโทเค็นรีเซ็ตรหัสผ่าน (password_reset_tokens)

| ลำดับ | ชื่อ Attribute | ชนิดข้อมูล | PK/FK | ตารางอ้างอิง | คำอธิบาย |
|---|---|---|---|---|---|
| 1 | token_id | BIGINT(20) UNSIGNED | PK | - | รหัสโทเค็น |
| 2 | user_id | VARCHAR(20) | - | - | รหัสผู้ใช้งาน |
| 3 | token | VARCHAR(64) | - | - | โทเค็นสำหรับรีเซ็ตรหัสผ่าน |
| 4 | expires_at | DATETIME | - | - | วันที่และเวลาที่โทเค็นหมดอายุ |
| 5 | created_at | TIMESTAMP | - | - | วันที่สร้างโทเค็น |

---

## ตารางที่ X-18 ตารางบัญชีผู้ใช้งาน (auth_accounts)

| ลำดับ | ชื่อ Attribute | ชนิดข้อมูล | PK/FK | ตารางอ้างอิง | คำอธิบาย |
|---|---|---|---|---|---|
| 1 | role | VARCHAR(7) | - | - | บทบาทของผู้ใช้งาน (student/advisor/admin) |
| 2 | user_id | VARCHAR(20) | - | - | รหัสผู้ใช้งาน |
| 3 | email | VARCHAR(191) | - | - | อีเมล |
| 4 | password_hash | VARCHAR(255) | - | - | รหัสผ่านที่เข้ารหัสแล้ว |
| 5 | name | VARCHAR(101) | - | - | ชื่อ-นามสกุลของผู้ใช้งาน |

---

## ตารางที่ X-19 ตารางนับจำนวนไฟล์ (file_counter)

| ลำดับ | ชื่อ Attribute | ชนิดข้อมูล | PK/FK | ตารางอ้างอิง | คำอธิบาย |
|---|---|---|---|---|---|
| 1 | id | TINYINT(4) | PK | - | รหัสตัวนับ |
| 2 | counter_value | INT(11) | - | - | ค่าตัวนับไฟล์ปัจจุบัน |
| 3 | updated_at | TIMESTAMP | - | - | วันที่แก้ไขล่าสุด |
