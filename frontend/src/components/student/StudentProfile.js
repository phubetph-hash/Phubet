'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { handleError } from '@/lib/errorHandler';
import { validateForm, VALIDATION_RULES } from '@/lib/validation';
import { SUCCESS_MESSAGES } from '@/lib/constants';
import ProfileImageUploader from '@/components/common/ProfileImageUploader';

export default function StudentProfile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [masterData, setMasterData] = useState({
    faculties: [],
    departments: [],
    programs: [],
  });

  const loadUserDataCallback = useCallback(() => {
    const userData = localStorage.getItem('advisor_system_user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    loadUserDataCallback();
    loadProfile();
    loadMasterData();
  }, [loadUserDataCallback]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/api/students/get');
      
      if (response.success) {
        setProfile(response.data);
      }
    } catch (error) {
      const errorMessage = handleError(error, 'Load Profile');
      console.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMasterData = async () => {
    try {
      const [faculties] = await Promise.all([
        apiClient.get('/api/helpers/faculties'),
      ]);

      setMasterData(prev => ({
        ...prev,
        faculties: faculties.data || [],
      }));
    } catch (error) {
      console.error('Error loading master data:', error);
    }
  };

  // Load departments when faculty changes
  useEffect(() => {
    if (profile?.faculty_id) {
      loadDepartments(profile.faculty_id);
    }
  }, [profile?.faculty_id]);

  // Load programs when department changes
  useEffect(() => {
    if (profile?.department_id) {
      loadPrograms(profile.department_id);
    }
  }, [profile?.department_id]);

  const loadDepartments = async (facultyId) => {
    try {
      const response = await apiClient.get(`/api/helpers/departments?faculty_id=${facultyId}`);
      setMasterData(prev => ({
        ...prev,
        departments: response.data || [],
      }));
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const loadPrograms = async (departmentId) => {
    try {
      const response = await apiClient.get(`/api/helpers/programs?department_id=${departmentId}`);
      setMasterData(prev => ({
        ...prev,
        programs: response.data || [],
      }));
    } catch (error) {
      console.error('Error loading programs:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
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

  const handleSave = async () => {
    // Validate form
    const validation = validateForm(profile, {
      first_name: { required: true, label: 'ชื่อ', validator: (value) => ({ isValid: value.trim().length > 0, message: null }) },
      last_name: { required: true, label: 'นามสกุล', validator: (value) => ({ isValid: value.trim().length > 0, message: null }) },
    });
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    setIsSaving(true);
    setErrors({});
    
    try {
      const response = await apiClient.put('/api/students/update', profile);
      
      if (response.success) {
        // Update user data in localStorage
        const updatedUser = {
          ...user,
          name: `${profile.first_name} ${profile.last_name}`
        };
        localStorage.setItem('advisor_system_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        setIsEditing(false);
        console.log(SUCCESS_MESSAGES.UPDATE);
      }
    } catch (error) {
      const errorMessage = handleError(error, 'Update Profile');
      setErrors({ general: errorMessage });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    // Reload profile to reset changes
    loadProfile();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium mb-2">ไม่พบข้อมูลโปรไฟล์</div>
          <button
            onClick={() => router.push('/login')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            กลับไปเข้าสู่ระบบ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">โปรไฟล์</h1>
              <p className="text-gray-600">จัดการข้อมูลส่วนตัวของคุณ</p>
            </div>
            <div className="flex space-x-4">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  แก้ไขข้อมูล
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancel}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
                  </button>
                </div>
              )}
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                กลับแดชบอร์ด
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Image Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">รูปโปรไฟล์</h2>
              <ProfileImageUploader
                currentImage={profile?.image}
                onImageUpdate={(newImageUrl) => {
                  setProfile(prev => ({ ...prev, image: newImageUrl }));
                }}
              />
              
              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">รหัสนิสิต</p>
                    <p className="text-sm text-gray-900">{profile?.student_id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">อีเมล</p>
                    <p className="text-sm text-gray-900">{profile?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">คณะ</p>
                    <p className="text-sm text-gray-900">{profile?.faculty_name}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">ข้อมูลบัญชี</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">อีเมล:</span>
                  <span className="text-sm font-medium text-gray-900">{profile.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">สถานะ:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ใช้งานได้
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">วันที่สมัคร:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(profile.created_at).toLocaleDateString('th-TH')}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">การดำเนินการ</h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/profile/change-password')}
                  className="w-full text-left p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">เปลี่ยนรหัสผ่าน</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">ข้อมูลส่วนตัว</h2>
              
              {errors.general && (
                <div className="mb-4 rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">{errors.general}</div>
                </div>
              )}

              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">ข้อมูลพื้นฐาน</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* First Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ชื่อ *
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        value={profile.first_name || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.first_name ? 'border-red-300' : 'border-gray-300'
                        } ${!isEditing ? 'bg-gray-100' : ''}`}
                      />
                      {errors.first_name && (
                        <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                      )}
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        นามสกุล *
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        value={profile.last_name || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.last_name ? 'border-red-300' : 'border-gray-300'
                        } ${!isEditing ? 'bg-gray-100' : ''}`}
                      />
                      {errors.last_name && (
                        <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                      )}
                    </div>

                    {/* Student ID */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        รหัสนิสิต
                      </label>
                      <input
                        type="text"
                        name="student_id"
                        value={profile.student_id || ''}
                        readOnly
                        className="w-full px-3 py-2 border rounded-md bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed"
                      />

                    </div>



                    {/* Email */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        อีเมล
                      </label>
                      <input
                        type="email"
                        value={profile.email || ''}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">ไม่สามารถแก้ไขอีเมลได้</p>
                    </div>
                  </div>
                </div>

                {/* Academic Info */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">ข้อมูลการศึกษา</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Faculty */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        คณะ
                      </label>
                      <select
                        name="faculty_id"
                        value={profile.faculty_id || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                          !isEditing ? 'bg-gray-100' : ''
                        }`}
                      >
                        <option key="faculty-default" value="">เลือกคณะ</option>
                        {masterData.faculties.map((faculty, index) => (
                          <option key={`faculty-${faculty.faculty_id || index}`} value={faculty.faculty_id}>
                            {faculty.faculty_name_th}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Department */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ภาควิชา
                      </label>
                      <select
                        name="department_id"
                        value={profile.department_id || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing || !profile.faculty_id}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                          !isEditing || !profile.faculty_id ? 'bg-gray-100' : ''
                        }`}
                      >
                        <option key="department-default" value="">เลือกภาควิชา</option>
                        {masterData.departments.map((department, index) => (
                          <option key={`department-${department.department_id || index}`} value={department.department_id}>
                            {department.department_name_th}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Program */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        สาขา
                      </label>
                      <select
                        name="program_id"
                        value={profile.program_id || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing || !profile.department_id}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                          !isEditing || !profile.department_id ? 'bg-gray-100' : ''
                        }`}
                      >
                        <option key="program-default" value="">เลือกสาขา</option>
                        {masterData.programs.map((program, index) => (
                          <option key={`program-${program.program_id || index}`} value={program.program_id}>
                            {program.program_name_th}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
