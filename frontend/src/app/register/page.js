'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const RegisterForm = dynamic(
  () => import('@/components/forms/RegisterForm'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    )
  }
);

export default function RegisterPage() {
  const [userType, setUserType] = useState('student');

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* User Type Selection */}
        <div className="text-center mb-6">
          <p className="text-gray-600 mb-4">เลือกประเภทบัญชีที่ต้องการสมัคร</p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <button
              onClick={() => setUserType('student')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                userType === 'student'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              สำหรับนิสิต
            </button>
            <button
              onClick={() => setUserType('advisor')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                userType === 'advisor'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              สำหรับอาจารย์ที่ปรึกษา
            </button>
          </div>
        </div>

        {/* Registration Form */}
        <RegisterForm userType={userType} />
      </div>
    </div>
  );
}