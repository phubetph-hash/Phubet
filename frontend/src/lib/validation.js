/**
 * Validation utilities for Student Advisor System
 * Client-side validation functions
 */

/**
 * Email validation
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Phone number validation (Thai format)
 */
export function validatePhone(phone) {
  const phoneRegex = /^(\+66|0)[0-9]{8,9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Password validation
 */
export function validatePassword(password) {
  return {
    isValid: password.length >= 6,
    message: password.length < 6 ? 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' : null
  };
}

/**
 * Confirm password validation
 */
export function validateConfirmPassword(password, confirmPassword) {
  return {
    isValid: password === confirmPassword,
    message: password !== confirmPassword ? 'รหัสผ่านไม่ตรงกัน' : null
  };
}

/**
 * Required field validation
 */
export function validateRequired(value, fieldName) {
  const stringValue = value ? String(value) : '';
  return {
    isValid: stringValue && stringValue.trim().length > 0,
    message: !stringValue || stringValue.trim().length === 0 ? `กรุณากรอก${fieldName}` : null
  };
}

/**
 * File validation
 */
export function validateFile(file, options = {}) {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['application/pdf'],
    fieldName = 'ไฟล์'
  } = options;
  
  const errors = [];
  
  if (!file) {
    errors.push(`กรุณาเลือก${fieldName}`);
    return { isValid: false, errors };
  }
  
  if (file.size > maxSize) {
    errors.push(`ขนาด${fieldName}ใหญ่เกินไป (สูงสุด ${Math.round(maxSize / 1024 / 1024)}MB)`);
  }
  
  if (!allowedTypes.includes(file.type)) {
    errors.push(`ประเภท${fieldName}ไม่ถูกต้อง (เฉพาะ PDF)`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Student ID validation
 */
export function validateStudentId(studentId) {
  const studentIdRegex = /^[0-9]{10}$/;
  return {
    isValid: studentIdRegex.test(studentId),
    message: !studentIdRegex.test(studentId) ? 'รหัสนิสิตต้องเป็นตัวเลข 10 หลัก' : null
  };
}

/**
 * Academic year validation
 */
export function validateAcademicYear(year) {
  const currentYear = new Date().getFullYear();
  const yearRegex = /^[0-9]{4}$/;
  
  if (!yearRegex.test(year)) {
    return {
      isValid: false,
      message: 'ปีการศึกษาต้องเป็นตัวเลข 4 หลัก'
    };
  }
  
  const yearNum = parseInt(year);
  if (yearNum < 2020 || yearNum > currentYear + 1) {
    return {
      isValid: false,
      message: `ปีการศึกษาต้องอยู่ระหว่าง 2020-${currentYear + 1}`
    };
  }
  
  return { isValid: true, message: null };
}

/**
 * Project title validation
 */
export function validateProjectTitle(title) {
  const minLength = 10;
  const maxLength = 200;
  
  if (!title || title.trim().length < minLength) {
    return {
      isValid: false,
      message: `ชื่อโครงการต้องมีอย่างน้อย ${minLength} ตัวอักษร`
    };
  }
  
  if (title.trim().length > maxLength) {
    return {
      isValid: false,
      message: `ชื่อโครงการต้องไม่เกิน ${maxLength} ตัวอักษร`
    };
  }
  
  return { isValid: true, message: null };
}

/**
 * Project detail validation
 */
export function validateProjectDetail(detail) {
  const minLength = 50;
  const maxLength = 1000;
  
  if (!detail || detail.trim().length < minLength) {
    return {
      isValid: false,
      message: `รายละเอียดโครงการต้องมีอย่างน้อย ${minLength} ตัวอักษร`
    };
  }
  
  if (detail.trim().length > maxLength) {
    return {
      isValid: false,
      message: `รายละเอียดโครงการต้องไม่เกิน ${maxLength} ตัวอักษร`
    };
  }
  
  return { isValid: true, message: null };
}

/**
 * Form validation helper
 */
export function validateForm(formData, rules) {
  const errors = {};
  let isValid = true;
  
  Object.keys(rules).forEach(field => {
    const value = formData[field];
    const rule = rules[field];
    
    // Skip if rule is undefined or null
    if (!rule) {
      return;
    }
    
    if (rule.required && !validateRequired(value, rule.label).isValid) {
      errors[field] = validateRequired(value, rule.label).message;
      isValid = false;
      return;
    }
    
    if (value && rule.validator) {
      const result = rule.validator(value);
      if (!result.isValid) {
        errors[field] = result.message;
        isValid = false;
      }
    }
  });
  
  return { isValid, errors };
}

/**
 * Common validation rules
 */
export const VALIDATION_RULES = {
  email: {
    required: true,
    label: 'อีเมล',
    validator: (value) => ({
      isValid: validateEmail(value),
      message: validateEmail(value) ? null : 'รูปแบบอีเมลไม่ถูกต้อง'
    })
  },
  password: {
    required: true,
    label: 'รหัสผ่าน',
    validator: validatePassword
  },
  confirmPassword: {
    required: true,
    label: 'ยืนยันรหัสผ่าน',
    validator: (value, formData) => validateConfirmPassword(formData.password, value)
  },
  phone: {
    required: true,
    label: 'เบอร์โทรศัพท์',
    validator: (value) => ({
      isValid: validatePhone(value),
      message: validatePhone(value) ? null : 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง'
    })
  },
  studentId: {
    required: true,
    label: 'รหัสนิสิต',
    validator: validateStudentId
  },
  projectTitle: {
    required: true,
    label: 'ชื่อโครงการ',
    validator: validateProjectTitle
  },
  projectDetail: {
    required: true,
    label: 'รายละเอียดโครงการ',
    validator: validateProjectDetail
  }
};
