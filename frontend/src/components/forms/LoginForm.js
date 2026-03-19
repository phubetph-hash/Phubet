'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import apiClient from '@/lib/api';
import { handleError } from '@/lib/errorHandler';
import { validateForm, VALIDATION_RULES } from '@/lib/validation';
import { SUCCESS_MESSAGES } from '@/lib/constants';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordStatus, setForgotPasswordStatus] = useState(null); // 'success', 'error', null

  useEffect(() => {
    const registered = searchParams.get('registered');
    if (registered === 'true') {
      setShowSuccessMessage(true);
      // Hide message after 5 seconds
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail) {
      setForgotPasswordStatus({ type: 'error', message: 'กรุณากรอกอีเมล' });
      return;
    }

    const emailValidation = validateForm({ email: forgotPasswordEmail }, {
      email: VALIDATION_RULES.email
    });

    if (!emailValidation.isValid) {
      setForgotPasswordStatus({ 
        type: 'error', 
        message: emailValidation.errors.email || 'อีเมลไม่ถูกต้อง' 
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post('/api/auth/forgot-password', { 
        email: forgotPasswordEmail 
      });

      const successMessage =
        (response && typeof response === 'object' && response.message)
          ? response.message
          : 'ส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว';

      setForgotPasswordStatus({
        type: 'success',
        message: successMessage
      });

      // ปิด modal หลังจาก 3 วินาที
      setTimeout(() => {
        setShowForgotPasswordModal(false);
        setForgotPasswordStatus(null);
        setForgotPasswordEmail('');
      }, 3000);
    } catch (error) {
      const errorMessage = handleError(error, 'Forgot Password');
      setForgotPasswordStatus({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateForm(formData, {
      email: VALIDATION_RULES.email,
      password: VALIDATION_RULES.password,
    });
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const response = await apiClient.post('/api/auth/login', formData);

      // Accept both { status: 'ok' } and { success: true }
      const isSuccess = response?.success === true || response?.status === 'ok';
      if (!isSuccess) {
        throw new Error(response?.message || 'Login failed');
      }

      const payload = response.data || {};

      // Normalize role naming from backend
      const role = payload.role === 'admin' ? 'administrator' : payload.role;

      // Persist minimal user session snapshot
      localStorage.setItem('advisor_system_user', JSON.stringify({
        id: payload.user_id,
        email: payload.email,
        role,
        name: payload.name,
      }));

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-changed'));
      }

      // Redirect by role
      switch (role) {
        case 'student':
          router.push('/dashboard');
          break;
        case 'advisor':
          router.push('/advisor/dashboard');
          break;
        case 'administrator':
          router.push('/admin/dashboard');
          break;
        default:
          router.push('/dashboard');
      }

      console.log(SUCCESS_MESSAGES.LOGIN);
    } catch (error) {
      const errorMessage = handleError(error, 'Login');
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            เข้าสู่ระบบ
          </h2>
          <p className="text-sm text-gray-600">
            ระบบยื่นคำขอเป็นนิสิตที่ปรึกษาโครงงาน
          </p>
        </div>
        
        {showSuccessMessage && (
          <div className="rounded-lg bg-green-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  สมัครสมาชิกสำเร็จ!
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>คุณได้สมัครสมาชิกเรียบร้อยแล้ว กรุณาเข้าสู่ระบบด้วย email และรหัสผ่านที่ได้สมัครไว้</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
              อีเมล
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              suppressHydrationWarning
              required
              className={`appearance-none block w-full px-4 py-3 border ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              } rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm`}
              placeholder="example@email.com"
              value={formData.email}
              onChange={handleInputChange}
              onInvalid={(e) => e.target.setCustomValidity('กรุณากรอกอีเมลให้ถูกต้อง')}
              onInput={(e) => e.target.setCustomValidity('')}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
              รหัสผ่าน
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              suppressHydrationWarning
              required
              className={`appearance-none block w-full px-4 py-3 border ${
                errors.password ? 'border-red-300' : 'border-gray-300'
              } rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm`}
              placeholder="กรอกรหัสผ่าน"
              value={formData.password}
              onChange={handleInputChange}
              onInvalid={(e) => e.target.setCustomValidity('กรุณากรอกรหัสผ่าน')}
              onInput={(e) => e.target.setCustomValidity('')}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {errors.general && (
            <div className="rounded-lg bg-red-50 p-4">
              <div className="text-sm text-red-700">{errors.general}</div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input 
                type="checkbox" 
                suppressHydrationWarning
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">จำฉันไว้</span>
            </label>
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setShowForgotPasswordModal(true)}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              ลืมรหัสผ่าน?
            </button>
          </div>

          <div>
            <button
              type="submit"
              suppressHydrationWarning
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังเข้าสู่ระบบ...
                </div>
              ) : (
                'เข้าสู่ระบบ'
              )}
            </button>
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              ยังไม่มีบัญชีผู้ใช้? {' '}
              <a 
                href="/register" 
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                ลงทะเบียน
              </a>
            </p>
          </div>
        </form>

        {/* Forgot Password Modal */}
        {showForgotPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                setShowForgotPasswordModal(false);
                setForgotPasswordStatus(null);
                setForgotPasswordEmail('');
              }}
            ></div>

            {/* Modal */}
            <div className="relative w-full max-w-lg p-4 mx-auto">
              <div className="relative bg-white rounded-xl shadow-lg">
                <form onSubmit={handleForgotPassword}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 w-full text-center sm:mt-0 sm:text-left">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                          ลืมรหัสผ่าน
                        </h3>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            กรุณากรอกอีเมลที่ใช้ในการลงทะเบียน เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้คุณ
                          </p>
                          <div className="mt-4">
                            <input
                              type="email"
                              name="forgotPasswordEmail"
                              value={forgotPasswordEmail}
                              onChange={(e) => setForgotPasswordEmail(e.target.value)}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              placeholder="กรอกอีเมลของคุณ"
                              required
                              onInvalid={(e) => e.target.setCustomValidity('กรุณากรอกอีเมลให้ถูกต้อง')}
                              onInput={(e) => e.target.setCustomValidity('')}
                            />
                          </div>
                          {forgotPasswordStatus && (
                            <div className={`mt-2 rounded-md ${
                              forgotPasswordStatus.type === 'success' ? 'bg-green-50' : 'bg-red-50'
                            } p-4`}>
                              <div className={`text-sm ${
                                forgotPasswordStatus.type === 'success' ? 'text-green-700' : 'text-red-700'
                              }`}>
                                {forgotPasswordStatus.message}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="relative inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                    >
                      {isLoading && (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {isLoading ? 'กำลังส่ง...' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPasswordModal(false);
                        setForgotPasswordStatus(null);
                        setForgotPasswordEmail('');
                      }}
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
