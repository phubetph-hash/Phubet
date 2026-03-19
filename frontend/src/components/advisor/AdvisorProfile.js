'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { handleError } from '@/lib/errorHandler';
import { validateForm, VALIDATION_RULES } from '@/lib/validation';
import { SUCCESS_MESSAGES } from '@/lib/constants';
import ProfileImageUploader from '@/components/common/ProfileImageUploader';

export default function AdvisorProfile() {
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
    academic_ranks: [],
    academic_degrees: [],
    expertises: [],
  });

  useEffect(() => {
    loadUserData();
    loadProfile();
    loadMasterData();
  }, []);

  const loadUserData = () => {
    const userData = localStorage.getItem('advisor_system_user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push('/login');
    }
  };

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/api/advisors/get');
      
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
      const [faculties, academic_ranks, academic_degrees, expertises] = await Promise.all([
        apiClient.get('/api/helpers/faculties'),
        apiClient.get('/api/helpers/academic_ranks'),
        apiClient.get('/api/helpers/academic_degrees'),
        apiClient.get('/api/helpers/expertises'),
      ]);

      setMasterData(prev => ({
        ...prev,
        faculties: faculties.data || [],
        academic_ranks: academic_ranks.data || [],
        academic_degrees: academic_degrees.data || [],
        expertises: expertises.data || [],
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      const currentIds = profile[name] || [];
      if (checked) {
        setProfile(prev => ({
          ...prev,
          [name]: [...currentIds, parseInt(value)]
        }));
      } else {
        setProfile(prev => ({
          ...prev,
          [name]: currentIds.filter(id => id !== parseInt(value))
        }));
      }
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
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

      academic_rank_id: { required: true, label: 'ตำแหน่งทางวิชาการ', validator: (value) => ({ isValid: value, message: null }) },

      capacity: { required: true, label: 'จำนวนนิสิตที่รับได้', validator: (value) => ({ isValid: value > 0 && value <= 20, message: 'จำนวนนิสิตต้องอยู่ระหว่าง 1-20 คน' }) },
      expertise_ids: { required: true, label: 'ความเชี่ยวชาญ', validator: (value) => ({ isValid: Array.isArray(value) && value.length > 0, message: 'กรุณาเลือกความเชี่ยวชาญอย่างน้อย 1 ข้อ' }) },
    });
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    setIsSaving(true);
    setErrors({});
    
    try {
      const response = await apiClient.put('/api/advisors/update', profile);
      
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
              <h1 className="text-2xl font-bold text-gray-900">โปรไฟล์อาจารย์ที่ปรึกษา</h1>
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
                onClick={() => router.push('/advisor/dashboard')}
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
                    <p className="text-sm font-medium text-gray-500">รหัสอาจารย์</p>
                    <p className="text-sm text-gray-900">{profile?.advisor_id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">อีเมล</p>
                    <p className="text-sm text-gray-900 break-words">{profile?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">คณะ</p>
                    <p className="text-sm text-gray-900">{profile?.faculty_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">ตำแหน่งทางวิชาการ</p>
                    <p className="text-sm text-gray-900">{profile?.academic_rank_name}</p>
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

            {/* Capacity Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">การรับนิสิต</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">จำนวนนิสิตปัจจุบัน:</span>
                  <span className="text-sm font-medium text-gray-900">{profile.current_students || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">จำนวนที่รับได้:</span>
                  <span className="text-sm font-medium text-gray-900">{profile.capacity || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">ว่างรับ:</span>
                  <span className="text-sm font-medium text-green-600">{profile.available_capacity || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(((profile.current_students || 0) / (profile.capacity || 1)) * 100, 100)}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">การดำเนินการ</h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/advisor/change-password')}
                  className="w-full text-left p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
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



                    {/* Email */}
                    <div>
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
                  <h3 className="text-lg font-medium text-gray-900 mb-4">ข้อมูลทางวิชาการ</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Academic Rank */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ตำแหน่งทางวิชาการ *
                      </label>
                      <select
                        name="academic_rank_id"
                        value={profile.academic_rank_id || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.academic_rank_id ? 'border-red-300' : 'border-gray-300'
                        } ${!isEditing ? 'bg-gray-100' : ''}`}
                      >
                        <option value="">เลือกตำแหน่งทางวิชาการ</option>
                        {masterData.academic_ranks.map(rank => (
                          <option key={rank.academic_rank_id} value={rank.academic_rank_id}>
                            {rank.rank_name_th}
                          </option>
                        ))}
                      </select>
                      {errors.academic_rank_id && (
                        <p className="mt-1 text-sm text-red-600">{errors.academic_rank_id}</p>
                      )}
                    </div>



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
                        <option value="">เลือกคณะ</option>
                        {masterData.faculties.map(faculty => (
                          <option key={faculty.faculty_id} value={faculty.faculty_id}>
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
                        <option value="">เลือกภาควิชา</option>
                        {masterData.departments.map(department => (
                          <option key={department.department_id} value={department.department_id}>
                            {department.department_name_th}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Capacity */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">การรับนิสิต</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        จำนวนนิสิตที่รับได้ *
                      </label>
                      <input
                        type="number"
                        name="capacity"
                        min="1"
                        max="20"
                        value={profile.capacity || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.capacity ? 'border-red-300' : 'border-gray-300'
                        } ${!isEditing ? 'bg-gray-100' : ''}`}
                      />
                      {errors.capacity && (
                        <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">จำนวนนิสิตที่รับได้ (1-20 คน)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        นิสิตปัจจุบัน
                      </label>
                      <input
                        type="text"
                        value={profile.current_students || 0}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Expertise */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">ความเชี่ยวชาญ *</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {masterData.expertises.map(expertise => (
                      <label key={expertise.expertise_id} className="flex items-center">
                        <input
                          type="checkbox"
                          name="expertise_ids"
                          value={expertise.expertise_id}
                          checked={profile.expertise_ids?.includes(parseInt(expertise.expertise_id)) || false}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {expertise.expertise_name_th}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.expertise_ids && (
                    <p className="mt-1 text-sm text-red-600">{errors.expertise_ids}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
