// Error Messages ภาษาไทยสำหรับระบบ
export const ERROR_MESSAGES = {
  // Network & Authentication Errors
  NETWORK_ERROR: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
  UNAUTHORIZED: 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้ กรุณาเข้าสู่ระบบใหม่',
  FORBIDDEN: 'คุณไม่มีสิทธิ์ในการดำเนินการนี้',
  SESSION_EXPIRED: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่',
  
  // Login & Registration
  LOGIN_FAILED: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง',
  EMAIL_NOT_FOUND: 'ไม่พบผู้ใช้ที่มีอีเมลนี้ในระบบ',
  INVALID_PASSWORD: 'รหัสผ่านไม่ถูกต้อง',
  ACCOUNT_LOCKED: 'บัญชีของคุณถูกล็อก กรุณาติดต่อผู้ดูแลระบบ',
  ACCOUNT_SUSPENDED: 'บัญชีของคุณถูกระงับ กรุณาติดต่อผู้ดูแลระบบ',
  ACCOUNT_DELETED: 'บัญชีของคุณถูกลบแล้ว กรุณาติดต่อผู้ดูแลระบบ',
  REGISTRATION_FAILED: 'ไม่สามารถสมัครสมาชิกได้ กรุณาตรวจสอบข้อมูลและลองใหม่',
  EMAIL_ALREADY_EXISTS: 'อีเมลนี้มีผู้ใช้แล้ว กรุณาใช้อีเมลอื่น',
  
  // Requests
  REQUEST_CREATE_FAILED: 'ไม่สามารถส่งคำขอได้ กรุณาตรวจสอบข้อมูลและลองใหม่',
  REQUEST_UPDATE_FAILED: 'ไม่สามารถอัปเดตคำขอได้ กรุณาลองใหม่',
  REQUEST_DELETE_FAILED: 'ไม่สามารถยกเลิกคำขอได้ กรุณาลองใหม่',
  CANCEL_REQUEST_FAILED: 'ไม่สามารถยกเลิกคำขอได้ กรุณาลองใหม่',
  REQUEST_NOT_FOUND: 'ไม่พบคำขอนี้ในระบบ',
  REQUEST_ALREADY_PROCESSED: 'คำขอนี้ได้รับการดำเนินการแล้ว',
  DUPLICATE_REQUEST: 'คุณได้ส่งคำขอไปยังอาจารย์ท่านนี้แล้ว',
  PENDING_LIMIT_REACHED: 'คุณมีคำขอรอดำเนินการครบ 5 คำขอแล้ว กรุณารอการตอบกลับหรือยกเลิกคำขอเก่า',
  ADVISOR_CAPACITY_FULL: 'อาจารย์ท่านนี้รับนิสิตครบจำนวนแล้ว กรุณาเลือกอาจารย์ท่านอื่น',
  REQUEST_EXPIRED: 'คำขอนี้หมดอายุแล้ว กรุณาส่งคำขอใหม่',
  
  // File Upload & Download
  FILE_UPLOAD_FAILED: 'ไม่สามารถอัปโหลดไฟล์ได้ กรุณาตรวจสอบไฟล์และลองใหม่',
  FILE_TOO_LARGE: 'ขนาดไฟล์ใหญ่เกินไป (สูงสุด 10MB)',
  INVALID_FILE_TYPE: 'ประเภทไฟล์ไม่ถูกต้อง กรุณาเลือกไฟล์ PDF, DOC, DOCX, หรือรูปภาพ',
  FILE_NOT_FOUND: 'ไม่พบไฟล์ที่ต้องการ',
  FILE_DOWNLOAD_FAILED: 'ไม่สามารถดาวน์โหลดไฟล์ได้ กรุณาลองใหม่',
  
  // Validation Errors
  REQUIRED_FIELD: 'กรุณากรอกข้อมูลให้ครบถ้วน',
  INVALID_EMAIL: 'รูปแบบอีเมลไม่ถูกต้อง',
  PASSWORD_TOO_SHORT: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร',
  PROJECT_TITLE_TOO_SHORT: 'ชื่อโครงงานต้องมีความยาวอย่างน้อย 10 ตัวอักษร',
  PROJECT_DESCRIPTION_TOO_SHORT: 'รายละเอียดโครงงานต้องมีความยาวอย่างน้อย 50 ตัวอักษร',
  INVALID_PHONE: 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง',
  INVALID_STUDENT_ID: 'รหัสนิสิตต้องมี 10 หลัก',
  
  // Data Loading Errors
  LOAD_DATA_FAILED: 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่',
  LOAD_ADVISORS_FAILED: 'ไม่สามารถโหลดรายชื่ออาจารย์ได้ กรุณาลองใหม่',
  LOAD_REQUESTS_FAILED: 'ไม่สามารถโหลดรายการคำขอได้ กรุณาลองใหม่',
  LOAD_PROFILE_FAILED: 'ไม่สามารถโหลดข้อมูลโปรไฟล์ได้ กรุณาลองใหม่',
  
  // Admin & User Management
  ACCESS_DENIED: 'คุณไม่มีสิทธิ์ในการเข้าถึงข้อมูลนี้',
  INVALID_INPUT: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่',
  
  // Server Errors
  SERVER_ERROR: 'เซิร์ฟเวอร์ไม่สามารถดำเนินการได้ กรุณาลองใหม่ในภายหลัง',
  SERVICE_UNAVAILABLE: 'ระบบไม่สามารถใช้งานได้ในขณะนี้ กรุณาลองใหม่ในภายหลัง',
  TIMEOUT_ERROR: 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่',
  
  // Generic
  UNKNOWN_ERROR: 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่หรือติดต่อผู้ดูแลระบบ',
  OPERATION_FAILED: 'การดำเนินการไม่สำเร็จ กรุณาลองใหม่',
  PLEASE_TRY_AGAIN: 'กรุณาลองใหม่อีกครั้ง',
  CONTACT_ADMIN: 'หากปัญหายังคงอยู่ กรุณาติดต่อผู้ดูแลระบบ',
};

export const SUCCESS_MESSAGES = {
  // Login & Registration
  LOGIN_SUCCESS: 'เข้าสู่ระบบสำเร็จ',
  REGISTRATION_SUCCESS: 'สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ',
  LOGOUT_SUCCESS: 'ออกจากระบบสำเร็จ',
  
  // Requests
  REQUEST_CREATED: 'ส่งคำขอสำเร็จ รอการพิจารณาจากอาจารย์ที่ปรึกษา',
  REQUEST_UPDATED: 'อัปเดตคำขอสำเร็จ',
  REQUEST_CANCELLED: 'ยกเลิกคำขอสำเร็จ',
  REQUEST_APPROVED: 'อนุมัติคำขอสำเร็จ',
  REQUEST_REJECTED: 'ปฏิเสธคำขอสำเร็จ',
  
  // File Operations
  FILE_UPLOADED: 'อัปโหลดไฟล์สำเร็จ',
  FILE_DELETED: 'ลบไฟล์สำเร็จ',
  
  // Profile
  PROFILE_UPDATED: 'อัปเดตโปรไฟล์สำเร็จ',
  PASSWORD_CHANGED: 'เปลี่ยนรหัสผ่านสำเร็จ',
  
  // Admin Operations
  ITEM_DELETED: 'ลบรายการสำเร็จ',
  ITEM_UPDATED: 'อัปเดตรายการสำเร็จ',
  ITEM_CREATED: 'สร้างรายการสำเร็จ',
  OPERATION_SUCCESS: 'ดำเนินการสำเร็จ',
  
  // Generic
  SAVE_SUCCESS: 'บันทึกข้อมูลสำเร็จ',
  DELETE_SUCCESS: 'ลบข้อมูลสำเร็จ',
  UPDATE_SUCCESS: 'อัปเดตข้อมูลสำเร็จ',
};

// Helper function to get user-friendly error message
export const getErrorMessage = (error, operation = '') => {
  // Handle null or undefined error
  if (!error) {
    return ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  if (typeof error === 'string') {
    const translated = translateErrorCode(error);
    return translated || ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  if (error?.response) {
    const status = error.response.status;
    const data = error.response.data;

    // Check for specific error messages from backend
    if (data?.message) {
      const translated = translateErrorCode(data.message);
      if (translated && translated !== data.message) {
        return translated;
      }
      // If translation exists but same as input, return the message
      if (translated) {
        return translated;
      }
    }

    // HTTP status code mapping
    switch (status) {
      case 400:
        return ERROR_MESSAGES.OPERATION_FAILED;
      case 401:
        return ERROR_MESSAGES.SESSION_EXPIRED;
      case 403:
        return ERROR_MESSAGES.FORBIDDEN;
      case 404:
        return operation.includes('Request') 
          ? ERROR_MESSAGES.REQUEST_NOT_FOUND 
          : ERROR_MESSAGES.LOAD_DATA_FAILED;
      case 422:
        return ERROR_MESSAGES.REQUIRED_FIELD;
      case 429:
        return 'คำขอมากเกินไป กรุณารอสักครู่แล้วลองใหม่';
      case 500:
        return ERROR_MESSAGES.SERVER_ERROR;
      case 503:
        return ERROR_MESSAGES.SERVICE_UNAVAILABLE;
      default:
        return ERROR_MESSAGES.UNKNOWN_ERROR;
    }
  }

  if (error?.message) {
    if (error.message.includes('Network Error') || error.message.includes('fetch')) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    if (error.message.includes('timeout')) {
      return ERROR_MESSAGES.TIMEOUT_ERROR;
    }
    // Return the error message itself if it's meaningful
    if (error.message && error.message.length > 0) {
      return error.message;
    }
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR;
};

// Translate backend error codes to Thai messages
const translateErrorCode = (errorCode) => {
  // Handle null, undefined, or empty string
  if (!errorCode || errorCode === '') {
    return ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  const translations = {
    // Authentication
    'invalid credentials': ERROR_MESSAGES.LOGIN_FAILED,
    'user not found': ERROR_MESSAGES.EMAIL_NOT_FOUND,
    'unauthorized': ERROR_MESSAGES.UNAUTHORIZED,
    'not authenticated': ERROR_MESSAGES.SESSION_EXPIRED,
    'authentication required': ERROR_MESSAGES.SESSION_EXPIRED,
    'forbidden': ERROR_MESSAGES.FORBIDDEN,
    'account_suspended': ERROR_MESSAGES.ACCOUNT_SUSPENDED,
    'account_deleted': ERROR_MESSAGES.ACCOUNT_DELETED,
    'บัญชีของคุณถูกระงับ': ERROR_MESSAGES.ACCOUNT_SUSPENDED,
    'บัญชีของคุณถูกลบแล้ว': ERROR_MESSAGES.ACCOUNT_DELETED,
      'อีเมลหรือรหัสผ่านไม่ถูกต้อง': ERROR_MESSAGES.LOGIN_FAILED,
      'invalid_credentials': ERROR_MESSAGES.LOGIN_FAILED,
    
    // Requests
    'missing required fields': ERROR_MESSAGES.REQUIRED_FIELD,
    'pending limit reached': ERROR_MESSAGES.PENDING_LIMIT_REACHED,
    'duplicate pending request': ERROR_MESSAGES.DUPLICATE_REQUEST,
    'advisor capacity full': ERROR_MESSAGES.ADVISOR_CAPACITY_FULL,
    'advisor not found': 'ไม่พบข้อมูลอาจารย์ที่ปรึกษา',
    'request not found': ERROR_MESSAGES.REQUEST_NOT_FOUND,
    'request not pending or not found': 'ไม่พบคำขอที่รอดำเนินการ',
    'invalid status': 'สถานะคำขอไม่ถูกต้อง',
    'rejection_reason required when rejecting': 'กรุณาระบุเหตุผลในการปฏิเสธ',
    
    // File operations
    'file upload failed': ERROR_MESSAGES.FILE_UPLOAD_FAILED,
    'file too large': ERROR_MESSAGES.FILE_TOO_LARGE,
    'invalid file type': ERROR_MESSAGES.INVALID_FILE_TYPE,
    'file not found': ERROR_MESSAGES.FILE_NOT_FOUND,
    
    // Master data dependencies
    'cannot delete department that has programs': 'ไม่สามารถลบภาควิชาได้ เนื่องจากมีสาขาวิชาที่อยู่ภายใต้ภาควิชานี้ กรุณาลบสาขาวิชาก่อน',
    'cannot delete faculty that has departments': 'ไม่สามารถลบคณะได้ เนื่องจากมีภาควิชาที่อยู่ภายใต้คณะนี้ กรุณาลบภาควิชาก่อน',
    'cannot delete program that has advisors': 'ไม่สามารถลบสาขาวิชาได้ เนื่องจากมีอาจารย์ที่อยู่ในสาขานี้ กรุณาย้ายอาจารย์ก่อน',
    'cannot delete program that has students': 'ไม่สามารถลบสาขาวิชาได้ เนื่องจากมีนักศึกษาที่อยู่ในสาขานี้ กรุณาย้ายนักศึกษาก่อน',
    'cannot delete expertise that is assigned': 'ไม่สามารถลบความเชี่ยวชาญได้ เนื่องจากมีอาจารย์ที่มีความเชี่ยวชาญนี้ กรุณาแก้ไขข้อมูลอาจารย์ก่อน',
    
    // Database constraint errors
    'foreign key constraint fails': 'ไม่สามารถลบข้อมูลได้ เนื่องจากมีข้อมูลอื่นที่เกี่ยวข้อง',
    'cannot delete or update a parent row': 'ไม่สามารถลบข้อมูลได้ เนื่องจากมีข้อมูลอื่นที่อ้างอิงข้อมูลนี้อยู่',
    'advisor_program_id': 'มีอาจารย์ที่อยู่ในสาขานี้ กรุณาย้ายอาจารย์ไปสาขาอื่นก่อน',
    'program_id`: references `program': 'มีอาจารย์ที่อยู่ในสาขานี้ กรุณาย้ายอาจารย์ไปสาขาอื่นก่อน',
    'no file attached': 'ไม่มีไฟล์แนบในคำขอนี้',
    'file not found on server': 'ไม่พบไฟล์ในเซิร์ฟเวอร์',
    
    // Validation
    'email already exists': ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
    'invalid email format': ERROR_MESSAGES.INVALID_EMAIL,
    'password too short': ERROR_MESSAGES.PASSWORD_TOO_SHORT,
    
    // Generic
    'method not allowed': 'การดำเนินการไม่ได้รับอนุญาต',
    'server error': ERROR_MESSAGES.SERVER_ERROR,
    'database error': 'เกิดข้อผิดพลาดในฐานข้อมูล กรุณาลองใหม่',
    'connection failed': ERROR_MESSAGES.NETWORK_ERROR,
  };

  // Try exact match first
  const lowerCode = (errorCode || '').toLowerCase();
  const exact = translations[lowerCode];
  if (exact) return exact;

  // Try partial match
  for (const [key, message] of Object.entries(translations)) {
    if (lowerCode.includes(key)) {
      return message;
    }
  }

  // Return original if it's a meaningful message, otherwise return unknown error
  if (errorCode && errorCode.length > 0 && errorCode !== 'undefined') {
    return errorCode;
  }
  
  return ERROR_MESSAGES.UNKNOWN_ERROR;
};

// Validation error messages
export const VALIDATION_MESSAGES = {
  required: (field) => `กรุณากรอก${field}`,
  email: 'กรุณากรอกอีเมลให้ถูกต้อง',
  minLength: (field, min) => `${field}ต้องมีความยาวอย่างน้อย ${min} ตัวอักษร`,
  maxLength: (field, max) => `${field}ต้องมีความยาวไม่เกิน ${max} ตัวอักษร`,
  phone: 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (เช่น 0812345678)',
  studentId: 'รหัสนิสิตต้องมี 10 หลัก',
  password: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร',
  confirmPassword: 'รหัสผ่านไม่ตรงกัน',
};

// Warning messages
export const WARNING_MESSAGES = {
  UNSAVED_CHANGES: 'มีการแก้ไขที่ยังไม่ได้บันทึก คุณต้องการออกจากหน้านี้หรือไม่?',
  DELETE_CONFIRM: 'คุณแน่ใจหรือไม่ที่จะลบข้อมูลนี้? การดำเนินการนี้ไม่สามารถยกเลิกได้',
  CANCEL_REQUEST_CONFIRM: 'คุณแน่ใจหรือไม่ที่ต้องการยกเลิกคำขอนี้?',
  APPROVE_REQUEST_CONFIRM: 'คุณแน่ใจหรือไม่ที่ต้องการอนุมัติคำขอนี้? เมื่ออนุมัติแล้วจะยกเลิกคำขออื่นๆ ของนิสิตคนนี้อัตโนมัติ',
  REJECT_REQUEST_CONFIRM: 'คุณแน่ใจหรือไม่ที่ต้องการปฏิเสธคำขอนี้?',
  LOGOUT_CONFIRM: 'คุณต้องการออกจากระบบหรือไม่?',
};

const errorMessageCatalog = {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION_MESSAGES,
  WARNING_MESSAGES,
  getErrorMessage,
};

export default errorMessageCatalog;