/**
 * Constants for Student Advisor System
 * Centralized configuration and constants
 */

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
  },
  
  // Students
  STUDENTS: {
    CREATE: '/api/students/create',
    GET: '/api/students/get',
    UPDATE: '/api/students/update',
  },
  
  // Advisors
  ADVISORS: {
    CREATE: '/api/advisors/create',
    GET: '/api/advisors/get',
    LIST: '/api/advisors/list',
    UPDATE: '/api/advisors/update',
  },
  
  // Requests
  REQUESTS: {
    CREATE: '/api/requests/create',
    LIST: '/api/requests/list',
    DETAIL: '/api/requests/detail',
    UPDATE_STATUS: '/api/requests/update-status',
    UPLOAD_FILE: '/api/requests/upload-file',
  },
  
  // Master Data
  MASTER: {
    FACULTIES: '/api/helpers/faculties',
    DEPARTMENTS: '/api/helpers/departments',
    PROGRAMS: '/api/helpers/programs',
    EXPERTISES: '/api/helpers/expertises',
    ACADEMIC_TERMS: '/api/helpers/academic_terms',
  },
  
  // Admin (to be implemented)
  ADMIN: {
    USERS: '/api/admin/users',
    USER_DETAIL: '/api/admin/users/:id',
    USER_UPDATE: '/api/admin/users/:id',
    USER_DELETE: '/api/admin/users/:id',
    USER_RESET_PASSWORD: '/api/admin/users/:id/reset-password',
    USER_STATUS: '/api/admin/users/:id/status',
  },
};

// Request Status
export const REQUEST_STATUS = {
  PENDING: 'รอดำเนินการ',
  APPROVED: 'อนุมัติ',
  REJECTED: 'ปฏิเสธ',
  EXPIRED: 'หมดอายุ',
  CANCELLED: 'ยกเลิก',
};

// Request Status Colors
export const REQUEST_STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  EXPIRED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

// User Roles
export const USER_ROLES = {
  STUDENT: 'student',
  ADVISOR: 'advisor',
  ADMIN: 'administrator',
};

// User Role Labels
export const USER_ROLE_LABELS = {
  student: 'นิสิต',
  advisor: 'อาจารย์ที่ปรึกษา',
  admin: 'ผู้ดูแลระบบ',
  administrator: 'ผู้ดูแลระบบ',
  STUDENT: 'นิสิต',
  ADVISOR: 'อาจารย์ที่ปรึกษา',
  ADMIN: 'ผู้ดูแลระบบ',
};

// Academic Ranks
export const ACADEMIC_RANKS = {
  LECT: 'อาจารย์',
  ASST: 'ผู้ช่วยศาสตราจารย์',
  ASSOC: 'รองศาสตราจารย์',
  PROF: 'ศาสตราจารย์',
};

// Academic Degrees
export const ACADEMIC_DEGREES = {
  BACHELOR: 'ปริญญาตรี',
  MASTER: 'ปริญญาโท',
  DOCTOR: 'ปริญญาเอก',
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE) || 5242880, // 5MB
  ALLOWED_TYPES: (process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES || 'application/pdf').split(','),
  MAX_SIZE_MB: Math.round((parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE) || 5242880) / 1024 / 1024),
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: parseInt(process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE) || 10,
  MAX_PAGE_SIZE: parseInt(process.env.NEXT_PUBLIC_MAX_PAGE_SIZE) || 50,
  PAGE_SIZE_OPTIONS: [10, 20, 50],
};

// Business Rules
export const BUSINESS_RULES = {
  MAX_PENDING_REQUESTS: 5,
  REQUEST_EXPIRY_DAYS: 7,
  ADVISOR_MIN_CAPACITY: 1,
  ADVISOR_MAX_CAPACITY: 20,
};

// Form Validation
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 50,
  MIN_STUDENT_ID_LENGTH: 10,
  MAX_STUDENT_ID_LENGTH: 10,
  MIN_PHONE_LENGTH: 9,
  MAX_PHONE_LENGTH: 12,
  MIN_PROJECT_TITLE_LENGTH: 10,
  MAX_PROJECT_TITLE_LENGTH: 200,
  MIN_PROJECT_DETAIL_LENGTH: 50,
  MAX_PROJECT_DETAIL_LENGTH: 1000,
};

// UI Constants
export const UI = {
  TOAST_DURATION: 5000,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
  MODAL_ANIMATION_DURATION: 300,
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
  API: 'YYYY-MM-DD',
  API_WITH_TIME: 'YYYY-MM-DD HH:mm:ss',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  USER: 'advisor_system_user',
  THEME: 'advisor_system_theme',
  LANGUAGE: 'advisor_system_language',
  FILTERS: 'advisor_system_filters',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK: 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
  UNAUTHORIZED: 'กรุณาเข้าสู่ระบบก่อนใช้งาน',
  FORBIDDEN: 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้',
  NOT_FOUND: 'ไม่พบข้อมูลที่ต้องการ',
  VALIDATION: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่',
  SERVER: 'เกิดข้อผิดพลาดภายในระบบ',
  UNKNOWN: 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'เข้าสู่ระบบสำเร็จ',
  LOGOUT: 'ออกจากระบบสำเร็จ',
  REGISTER: 'สมัครสมาชิกสำเร็จ',
  UPDATE: 'อัปเดตข้อมูลสำเร็จ',
  DELETE: 'ลบข้อมูลสำเร็จ',
  SUBMIT_REQUEST: 'ส่งคำขอสำเร็จ',
  APPROVE_REQUEST: 'อนุมัติคำขอสำเร็จ',
  REJECT_REQUEST: 'ปฏิเสธคำขอสำเร็จ',
  UPLOAD_FILE: 'อัปโหลดไฟล์สำเร็จ',
};

// Loading States
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

// Filter Options
export const FILTER_OPTIONS = {
  REQUEST_STATUS: [
    { value: 'all', label: 'ทั้งหมด' },
    { value: 'pending', label: 'รอดำเนินการ' },
    { value: 'approved', label: 'อนุมัติ' },
    { value: 'rejected', label: 'ปฏิเสธ' },
    { value: 'expired', label: 'หมดอายุ' },
  ],
  USER_ROLE: [
    { value: 'all', label: 'ทั้งหมด' },
    { value: 'student', label: 'นิสิต' },
    { value: 'advisor', label: 'อาจารย์ที่ปรึกษา' },
  ],
  SORT_OPTIONS: [
    { value: 'created_at_desc', label: 'วันที่สร้าง (ใหม่สุด)' },
    { value: 'created_at_asc', label: 'วันที่สร้าง (เก่าสุด)' },
    { value: 'name_asc', label: 'ชื่อ (A-Z)' },
    { value: 'name_desc', label: 'ชื่อ (Z-A)' },
  ],
};
