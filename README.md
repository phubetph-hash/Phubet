# Project Advisor System

ระบบยื่นคำขออาจารย์ที่ปรึกษาโครงงานสำหรับนิสิต

## Overview
Project Advisor System เป็นเว็บแอปสำหรับจัดการกระบวนการขออาจารย์ที่ปรึกษา โดยรองรับผู้ใช้งาน 3 บทบาท:
- Student: ค้นหาอาจารย์ ส่งคำขอ ติดตามสถานะ
- Advisor: จัดการคำขอ ปรับข้อมูลโปรไฟล์และความเชี่ยวชาญ
- Admin: จัดการผู้ใช้งานและข้อมูล Master Data

## Tech Stack
- Frontend: Next.js 15, React 19
- Backend: PHP 8.2 (XAMPP/Apache)
- Database: MariaDB/MySQL
- Mail: PHPMailer

## Project Structure
```text
project-advisor-system4/
|- frontend/                 # Next.js app
|- backend/                  # PHP APIs, middleware, helpers
|- uploads/                  # Uploaded files (proposal/profile image)
|- advisordb.sql             # Database schema + seed data
|- Doc/                      # Project documents
`- sql_updates/              # Additional SQL updates
```

## Prerequisites
- Node.js 18+ (recommended 18 or 20)
- npm
- XAMPP (Apache + MySQL)
- Windows (current development environment)

## Local Setup
1. Start Apache and MySQL from XAMPP Control Panel.
2. Import database file `advisordb.sql` into MySQL.
3. Verify database credentials in `backend/config.php`.
4. Install frontend dependencies.

## Database Setup
- Default DB used by project: `advisordb` (or `AdvisorDB` in `backend/config.php`)
- Import:
```bash
# Example using mysql CLI
mysql -u root -p < advisordb.sql
```

## Backend Setup (PHP + Apache)
Backend runs under XAMPP document root path:
- `http://localhost/project-advisor-system4/backend`

Important files:
- `backend/config.php` (DB + global CORS/CSRF bootstrap)
- `backend/middleware/cors.php`
- `backend/middleware/csrf.php`

## Frontend Setup (Next.js)
Install dependencies:
```bash
cd frontend
npm install
```

Create/update environment file `frontend/.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost/project-advisor-system4/backend
```

Run development server:
```bash
cd frontend
npm run dev
```

Open:
- `http://localhost:3000`
- If port 3000 is already used, Next.js will run on `http://localhost:3001`

## Build for Production
```bash
cd frontend
npm run build
npm run start
```

## Authentication
- Session-based authentication
- Login endpoint: `POST /api/auth/login`
- Session cookie: `PHPSESSID`

## Common Scripts
Frontend (`frontend/package.json`):
- `npm run dev` - Start dev server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run lint

## Test Accounts and Guides
- Login test guide: `LOGIN_TEST_GUIDE.md`
- Presentation script: `PRESENTATION_VIDEO_SCRIPT.md`
- Testing guide: `TESTING_GUIDE.md`

## Troubleshooting
### MySQL shutdown unexpectedly
If MySQL fails to start in XAMPP:
- Check `C:\xampp\mysql\data\mysql_error.log`
- Verify port `3306` is not blocked
- Restore corrupted system table files from `C:\xampp\mysql\backup\mysql\` if needed
- Ensure orphaned/corrupt databases are removed or repaired

### CORS issues
- Confirm `NEXT_PUBLIC_API_BASE_URL` points to backend URL
- Confirm CORS middleware is active in `backend/config.php`

### Session lost / auto-logout
- Confirm MySQL is running
- Check browser cookie for `PHPSESSID`
- Verify backend auth middleware behavior in `backend/middleware/auth.php`
วิดีโอนำเสนอโครงงานวิทยาการคอมพิวเตอร์
https://drive.google.com/file/d/1xyd6qoQuvfO2Hm_-9GfnzBLy6h7Q3CMX/view?usp=sharing

## Notes
- Some development docs and UI text are in Thai language.
- Uploaded files and profile images are stored under `uploads/`.
## วิดีโอนำเสนอโครงงานวิทยาการคอมพิวเตอร์
- https://drive.google.com/file/d/1xyd6qoQuvfO2Hm_-9GfnzBLy6h7Q3CMX/view?usp=sharing
