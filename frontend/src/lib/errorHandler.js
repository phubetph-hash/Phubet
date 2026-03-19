/**
 * Error Handler for Student Advisor System
 * Centralized error handling and user-friendly error messages
 */

import { ApiError } from './api.js';
import { getErrorMessage as getThaiErrorMessage, ERROR_MESSAGES } from './errorMessages.js';

/**
 * Get user-friendly error message based on error type
 */
export function getErrorMessage(error, operation = '') {
  // Use the enhanced error message handler
  return getThaiErrorMessage(error, operation);
}

/**
 * Check if error is a specific type
 */
export function isErrorType(error, type) {
  if (error instanceof ApiError) {
    return error.status === type;
  }
  return false;
}

/**
 * Check if error is authentication related
 */
export function isAuthError(error) {
  return isErrorType(error, 401) || isErrorType(error, 403);
}

/**
 * Check if error is validation related
 */
export function isValidationError(error) {
  return isErrorType(error, 400) || isErrorType(error, 422);
}

/**
 * Check if error is network related
 */
export function isNetworkError(error) {
  return error.name === 'TypeError' && error.message.includes('fetch');
}

/**
 * Log error for debugging
 */
export function logError(error, context = '') {
  const isLoginContext = String(context || '').toLowerCase().includes('login');
  const isExpectedInvalidCredential = isLoginContext && isInvalidCredentialError(error);

  if (isExpectedInvalidCredential) {
    // Expected validation case: keep console clean for wrong email/password.
    return;
  }

  const serializedError = serializeErrorForConsole(error);
  console.error(`[Error Handler] ${context}: ${serializedError}`);
}

function serializeErrorForConsole(error) {
  const payload = {
    name: error?.name || 'Error',
    message: error?.message || '',
    status: error?.status ?? error?.response?.status ?? null,
    data: error?.data ?? error?.response?.data ?? null,
  };

  if (error?.stack) {
    payload.stack = error.stack;
  }

  try {
    return JSON.stringify(payload, null, 2);
  } catch {
    return String(error?.message || ERROR_MESSAGES.UNKNOWN_ERROR);
  }
}

function isInvalidCredentialError(error) {
  const message = String(error?.message || '').toLowerCase();
  const errorCode = String(error?.data?.error_code || '').toLowerCase();

  return (
    errorCode === 'invalid_credentials' ||
    message.includes('invalid credentials') ||
    message.includes('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
  );
}

/**
 * Handle error and return user-friendly message
 */
export function handleError(error, context = '') {
  logError(error, context);

  // Login failure should show credential message, not session-expired message.
  if (isInvalidCredentialError(error)) {
    return getErrorMessage(error, context) || ERROR_MESSAGES.LOGIN_FAILED;
  }
  
  // Handle ONLY 401 (session expired) by redirecting to login
  // 403 (forbidden) should just show error, not logout
  if (isErrorType(error, 401)) {
    // Clear user data from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('advisor_system_user');
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    }
    
    return ERROR_MESSAGES.SESSION_EXPIRED;
  }
  
  // Get error message with fallback
  const errorMessage = getErrorMessage(error, context);
  
  // Always return a valid message, never undefined
  return errorMessage || ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Create error handler hook for React components
 */
export function useErrorHandler() {
  const onError = (error, context = '') => {
    const message = handleError(error, context);
    
    // You can add toast notification here
    // toast.error(message);
    
    return message;
  };
  
  return { handleError: onError };
}
