# Comprehensive Test Suite
## Project Advisor System - Complete Feature Testing

### Overview
This test suite covers all implemented features:
1. **Admin User Management APIs** - Complete CRUD operations for user management
2. **Admin Master Data APIs** - Complete CRUD operations for master data management
3. **Frontend API Integration** - All frontend components integrated with backend APIs

---

## 🔧 Admin User Management APIs Testing

### Prerequisites
- Admin user logged in with session authentication
- XAMPP server running with MySQL and Apache
- Database `advisordb` properly configured

### Test Cases

#### TC001: Admin User List API
**Endpoint:** `GET /api/admin/users/list.php`
**Expected Result:** Returns paginated list of all users (students, advisors, administrators)

```bash
# Test Command (use browser or Postman):
GET http://localhost/project-advisor-system/backend/api/admin/users/list.php
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "user_id": "...",
      "name": "...",
      "email": "...", 
      "role": "student|advisor|admin",
      "status": "active|inactive",
      "faculty_name": "...",
      "department_name": "...",
      "created_at": "..."
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 20
}
```

#### TC002: Admin User Detail API
**Endpoint:** `GET /api/admin/users/detail.php?user_id=1&role=student`

**Test Steps:**
1. Get a valid user_id from the list API
2. Call detail API with user_id and role
3. Verify detailed user information is returned

**Expected Response:** Complete user profile with role-specific fields

#### TC003: Admin User Update API
**Endpoint:** `PUT /api/admin/users/update.php`

**Test Data:**
```json
{
  "user_id": "1",
  "role": "student",
  "first_name": "Updated Name",
  "email": "updated@example.com",
  "status": "active"
}
```

**Expected Result:** User information updated successfully

#### TC004: Admin User Delete API
**Endpoint:** `DELETE /api/admin/users/delete.php`

**Test Data:**
```json
{
  "user_id": "1",
  "role": "student"
}
```

**Expected Result:** User deleted with referential integrity checks

#### TC005: Admin Password Reset API
**Endpoint:** `POST /api/admin/users/reset-password.php`

**Test Data:**
```json
{
  "user_id": "1",
  "role": "student",
  "new_password": "newpassword123"
}
```

**Expected Result:** Password updated successfully

#### TC006: Admin User Status API
**Endpoint:** `PUT /api/admin/users/status.php`

**Test Data:**
```json
{
  "user_id": "1",
  "role": "student",
  "status": "inactive"
}
```

**Expected Result:** User status updated successfully

---

## 📊 Admin Master Data APIs Testing

### Test Cases

#### TC007: Faculty Management
**Create Faculty:**
```bash
POST /api/admin/master-data/faculty.php
Content-Type: application/json

{
  "faculty_name": "คณะวิทยาศาสตร์ใหม่",
  "description": "คณะใหม่สำหรับทดสอบ"
}
```

**Update Faculty:**
```bash
PUT /api/admin/master-data/faculty.php
Content-Type: application/json

{
  "faculty_id": "1",
  "faculty_name": "คณะวิทยาศาสตร์อัพเดต",
  "description": "คำอธิบายใหม่"
}
```

**Delete Faculty:**
```bash
DELETE /api/admin/master-data/faculty.php
Content-Type: application/json

{
  "faculty_id": "1"
}
```

#### TC008: Department Management
**Create Department:**
```bash
POST /api/admin/master-data/department.php

{
  "department_name": "ภาควิชาใหม่",
  "faculty_id": "1",
  "description": "ภาควิชาทดสอบ"
}
```

**Validation Test:** Try creating department with invalid faculty_id (should fail)

#### TC009: Program Management
**Create Program:**
```bash
POST /api/admin/master-data/program.php

{
  "program_name": "หลักสูตรใหม่",
  "degree_level": "ปริญญาตรี",
  "department_id": "1"
}
```

#### TC010: Expertise Management
**Create Expertise:**
```bash
POST /api/admin/master-data/expertise.php

{
  "expertise_name": "ความเชี่ยวชาญใหม่",
  "description": "คำอธิบาย"
}
```

#### TC011: Academic Terms Management
**Create Academic Term:**
```bash
POST /api/admin/master-data/academic_terms.php

{
  "term_name": "ภาคต้น",
  "academic_year": "2567",
  "start_date": "2024-08-01",
  "end_date": "2024-12-15",
  "is_active": true
}
```

---

## 🌐 Frontend Integration Testing

### Test Environment Setup
1. Start frontend development server:
```bash
cd frontend
npm run dev
```
2. Access: http://localhost:3000
3. Ensure backend APIs are running

### Test Cases

#### TC012: Admin Interface Testing
**Steps:**
1. Login as admin user
2. Navigate to `/admin/dashboard`
3. Click "จัดการผู้ใช้งาน" (User Management)
4. Test all CRUD operations:
   - View user list
   - Edit user details
   - Delete user
   - Reset password
   - Change user status

**Expected Result:** All operations work without errors

#### TC013: Master Data Interface Testing
**Steps:**
1. Navigate to `/admin/master-data`
2. Test each tab (Faculty, Department, Program, Expertise, Academic Terms)
3. For each tab:
   - Create new record
   - Edit existing record
   - Delete record
   - Verify validation messages

**Expected Result:** All CRUD operations function correctly

#### TC014: Student Dashboard Integration
**Steps:**
1. Login as student
2. Navigate to student dashboard
3. Verify data loads from real APIs:
   - Student profile information
   - Request statistics
   - Recent requests list
4. Test quick actions (Create request, View requests, etc.)

**Expected Result:** Dashboard shows real data from backend

#### TC015: Advisor Dashboard Integration
**Steps:**
1. Login as advisor
2. Navigate to advisor dashboard
3. Verify data loads from real APIs:
   - Advisor profile information
   - Request statistics
   - Capacity information
   - Recent requests
4. Test navigation to other sections

**Expected Result:** Dashboard shows real data from backend

---

## 🔍 Database Schema Validation

### Test Cases

#### TC016: Database Field Name Consistency
**Query to verify fields exist:**
```sql
-- Check student table
DESCRIBE student;

-- Check advisor table  
DESCRIBE advisor;

-- Check administrator table
DESCRIBE administrator;

-- Check faculty table
DESCRIBE faculty;

-- Check department table
DESCRIBE department;

-- Check program table
DESCRIBE program;
```

**Expected Result:** All referenced fields exist in database tables

#### TC017: Referential Integrity Testing
**Test Steps:**
1. Try to delete faculty with existing departments (should fail)
2. Try to delete department with existing programs (should fail)
3. Try to create department with invalid faculty_id (should fail)
4. Try to create program with invalid department_id (should fail)

**Expected Result:** Database maintains referential integrity

---

## 🚨 Error Handling Testing

### Test Cases

#### TC018: Authentication Testing
**Steps:**
1. Access admin APIs without login session
2. Access with invalid session
3. Access with non-admin role

**Expected Result:** Proper authentication errors returned

#### TC019: Validation Testing
**Steps:**
1. Submit empty required fields
2. Submit invalid email formats
3. Submit duplicate records where not allowed
4. Submit invalid foreign key references

**Expected Result:** Proper validation errors returned

#### TC020: Database Error Handling
**Steps:**
1. Stop MySQL service
2. Try to access any API
3. Restart MySQL and test again

**Expected Result:** Graceful error handling and recovery

---

## 📋 Test Execution Checklist

### Pre-Testing Setup
- [ ] XAMPP server running (Apache + MySQL)
- [ ] Database `advisordb` imported and configured
- [ ] Backend files in correct location
- [ ] Frontend development server running
- [ ] Test user accounts available for each role

### Admin User Management APIs
- [ ] TC001: User List API
- [ ] TC002: User Detail API  
- [ ] TC003: User Update API
- [ ] TC004: User Delete API
- [ ] TC005: Password Reset API
- [ ] TC006: User Status API

### Admin Master Data APIs
- [ ] TC007: Faculty Management (Create/Update/Delete)
- [ ] TC008: Department Management
- [ ] TC009: Program Management
- [ ] TC010: Expertise Management
- [ ] TC011: Academic Terms Management

### Frontend Integration
- [ ] TC012: Admin Interface Testing
- [ ] TC013: Master Data Interface Testing
- [ ] TC014: Student Dashboard Integration
- [ ] TC015: Advisor Dashboard Integration

### Database & Error Handling
- [ ] TC016: Database Schema Validation
- [ ] TC017: Referential Integrity Testing
- [ ] TC018: Authentication Testing
- [ ] TC019: Validation Testing
- [ ] TC020: Database Error Handling

### Final Integration Tests
- [ ] End-to-end user workflows
- [ ] Cross-role functionality
- [ ] Performance under load
- [ ] Browser compatibility
- [ ] Mobile responsiveness

---

## 🎯 Success Criteria

### All tests should pass with:
1. **No database schema errors** - All field references match actual database columns
2. **Proper authentication** - All admin features require admin session
3. **Complete CRUD operations** - Create, Read, Update, Delete work for all entities
4. **Data validation** - Invalid inputs are properly rejected
5. **Error handling** - Graceful error messages for all failure scenarios
6. **Frontend-backend integration** - All UI operations successfully communicate with APIs
7. **Referential integrity** - Database relationships maintained correctly

### Performance Benchmarks:
- API response time < 2 seconds
- Page load time < 3 seconds
- No memory leaks during extended use
- Proper handling of concurrent users

---

## 📝 Test Results Recording

Create a test results log with:
- Test case ID
- Test date/time
- Tester name
- Pass/Fail status
- Notes/Issues found
- Screenshots for UI tests

**Example:**
```
TC001 | 2024-01-20 14:30 | Tester Name | PASS | User list loads correctly with 15 records
TC002 | 2024-01-20 14:35 | Tester Name | FAIL | Error: phone field missing for admin users
```

This comprehensive test suite ensures all implemented features work correctly and are properly integrated.