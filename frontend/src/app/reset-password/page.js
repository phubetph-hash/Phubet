'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import apiClient from '@/lib/api';
import { handleError } from '@/lib/errorHandler';
import { validateForm, VALIDATION_RULES } from '@/lib/validation';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null

  if (!token) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e0e7ff_0%,_#f8fafc_42%,_#eef2ff_100%)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[80vh] max-w-5xl items-center justify-center">
          <div className="w-full max-w-lg rounded-[28px] border border-white/70 bg-white/90 p-8 shadow-[0_24px_80px_rgba(79,70,229,0.14)] backdrop-blur xl:p-10">
            <h2 className="text-center text-3xl font-extrabold tracking-tight text-slate-900">
              ไม่พบ Token สำหรับรีเซ็ตรหัสผ่าน
            </h2>
            <p className="mt-3 text-center text-sm leading-6 text-slate-600">
              กรุณาตรวจสอบลิงก์ที่ได้รับทางอีเมล หรือ{' '}
              <a href="/login" className="font-semibold text-indigo-600 transition-colors hover:text-indigo-500">
                กลับไปหน้าเข้าสู่ระบบ
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateForm(formData, {
      password: VALIDATION_RULES.password,
      confirmPassword: {
        required: true,
        custom: value => value === formData.password ? true : 'รหัสผ่านไม่ตรงกัน'
      }
    });
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const requestData = {
        token,
        password: formData.password
      };

      const response = await apiClient.post('/api/auth/reset-password', requestData);

      const isSuccess = response?.success === true || response?.status === 'ok';
      if (isSuccess) {
        setStatus('success');
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        const fallbackMessage = 'ไม่สามารถตั้งรหัสผ่านใหม่ได้';
        const message =
          (response && typeof response === 'object' && response.message) ||
          (typeof response === 'string' ? response : fallbackMessage);

        throw new Error(message);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = handleError(error, 'ตั้งรหัสผ่านใหม่');
      setErrors({ general: errorMessage });
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e0e7ff_0%,_#f8fafc_42%,_#eef2ff_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[85vh] max-w-6xl items-center justify-center">
        <div className="w-full max-w-xl">
          <div className="mx-auto w-full rounded-[32px] border border-white/70 bg-white/88 p-6 shadow-[0_30px_90px_rgba(79,70,229,0.16)] backdrop-blur sm:p-8">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                ตั้งรหัสผ่านใหม่
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                กรุณากรอกรหัสผ่านใหม่ของคุณให้ครบทั้งสองช่อง
              </p>
            </div>

            {status === 'success' && (
              <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.2 7.2a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.42l2.293 2.294 6.493-6.494a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-emerald-900">
                      ตั้งรหัสผ่านใหม่สำเร็จ
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-emerald-700">
                      กำลังนำคุณกลับไปยังหน้าเข้าสู่ระบบ...
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-900">
                  รหัสผ่านใหม่
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className={`block w-full rounded-2xl border bg-white px-4 py-3.5 text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:outline-none focus:ring-4 ${
                    errors.password
                      ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
                      : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
                  }`}
                  placeholder="กรอกรหัสผ่านใหม่"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-rose-600">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-slate-900">
                  ยืนยันรหัสผ่านใหม่
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className={`block w-full rounded-2xl border bg-white px-4 py-3.5 text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:outline-none focus:ring-4 ${
                    errors.confirmPassword
                      ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
                      : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
                  }`}
                  placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-rose-600">{errors.confirmPassword}</p>
                )}
              </div>

              {errors.general && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                  <div className="text-sm leading-6 text-rose-700">{errors.general}</div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || status === 'success'}
                  className="group relative flex w-full justify-center rounded-2xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(79,70,229,0.28)] transition-all hover:bg-indigo-700 hover:shadow-[0_18px_38px_rgba(79,70,229,0.34)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="-ml-1 mr-3 h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      กำลังบันทึก...
                    </div>
                  ) : (
                    'ตั้งรหัสผ่านใหม่'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}