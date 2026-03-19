'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { handleError } from '@/lib/errorHandler';
import { useNotifications } from '@/contexts/NotificationContext';
import { validateForm, VALIDATION_RULES } from '@/lib/validation';
import { SUCCESS_MESSAGES } from '@/lib/errorMessages';

export default function ChangePasswordForm() {
  const router = useRouter();
  const { showToast } = useNotifications();
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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
      current_password: { required: true, label: 'รหัสผ่านปัจจุบัน', validator: (value) => ({ isValid: value.trim().length > 0, message: null }) },
      new_password: VALIDATION_RULES.password,
      confirm_password: {
        required: true,
        label: 'ยืนยันรหัสผ่านใหม่',
        validator: (value) => ({
          isValid: value === formData.new_password,
          message: value !== formData.new_password ? 'รหัสผ่านไม่ตรงกัน' : null
        })
      },
    });
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      // Determine API endpoint based on current route/role
      const currentPath = window.location.pathname;
      const endpoint = currentPath.startsWith('/advisor') ? '/api/advisors/change-password' : '/api/students/change-password';
      
      const response = await apiClient.put(endpoint, {
        current_password: formData.current_password,
        new_password: formData.new_password,
      });
      
      if (response.success) {
        // Show success message
        showToast({ message: SUCCESS_MESSAGES.PASSWORD_CHANGED, type: 'success' });
        
        // Reset form
        setFormData({
          current_password: '',
          new_password: '',
          confirm_password: '',
        });
        
        // Redirect to profile
        router.push('/profile');
      }
    } catch (error) {
      const errorMessage = handleError(error, 'Change Password');
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">เปลี่ยนรหัสผ่าน</h1>
              <p className="text-gray-600">เปลี่ยนรหัสผ่านของคุณ</p>
            </div>
            <button
              onClick={() => router.push('/profile')}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              กลับโปรไฟล์
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div>
              <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-1">
                รหัสผ่านปัจจุบัน *
              </label>
              <input
                id="current_password"
                name="current_password"
                type="password"
                autoComplete="current-password"
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.current_password ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="รหัสผ่านปัจจุบัน"
                value={formData.current_password}
                onChange={handleInputChange}
              />
              {errors.current_password && (
                <p className="mt-1 text-sm text-red-600">{errors.current_password}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-1">
                รหัสผ่านใหม่ *
              </label>
              <input
                id="new_password"
                name="new_password"
                type="password"
                autoComplete="new-password"
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.new_password ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="รหัสผ่านใหม่"
                value={formData.new_password}
                onChange={handleInputChange}
              />
              {errors.new_password && (
                <p className="mt-1 text-sm text-red-600">{errors.new_password}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">
                ยืนยันรหัสผ่านใหม่ *
              </label>
              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                autoComplete="new-password"
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.confirm_password ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="ยืนยันรหัสผ่านใหม่"
                value={formData.confirm_password}
                onChange={handleInputChange}
              />
              {errors.confirm_password && (
                <p className="mt-1 text-sm text-red-600">{errors.confirm_password}</p>
              )}
            </div>

            {errors.general && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{errors.general}</div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.push('/profile')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
