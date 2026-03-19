'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { handleError } from '@/lib/errorHandler';
import { validateForm, VALIDATION_RULES } from '@/lib/validation';
import { SUCCESS_MESSAGES } from '@/lib/constants';

export default function RegisterForm({ userType = 'student' }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    prefix: '',
    first_name: '',
    last_name: '',
    // Student specific fields
    student_id: '',
    program_id: '',
    // Advisor specific fields
    academic_rank_id: '',
    academic_degree_id: '',
    expertise_ids: [],
    project_capacity: 5,
    // Common fields
    faculty_id: '',
    department_id: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [masterData, setMasterData] = useState({
    faculties: [],
    departments: [],
    programs: [],
    expertises: [],
    academic_ranks: [],
    academic_degrees: [],
  });

  // Load master data
  useEffect(() => {
    loadMasterData();
  }, []);

  const loadMasterData = async () => {
    try {
      const [faculties, expertises, academic_ranks, academic_degrees] = await Promise.all([
        apiClient.get('/api/helpers/faculties'),
        apiClient.get('/api/helpers/expertises'),
        apiClient.get('/api/helpers/academic_ranks'),
        apiClient.get('/api/helpers/academic_degrees'),
      ]);

      setMasterData(prev => ({
        ...prev,
        faculties: faculties.data || [],
        expertises: expertises.data || [],
        academic_ranks: academic_ranks.data || [],
        academic_degrees: academic_degrees.data || [],
      }));
    } catch (error) {
      console.error('Error loading master data:', error);
    }
  };

  // Load departments when faculty changes
  useEffect(() => {
    if (formData.faculty_id) {
      loadDepartments(formData.faculty_id);
    } else {
      setMasterData(prev => ({ ...prev, departments: [] }));
      setFormData(prev => ({ ...prev, department_id: '', program_id: '' }));
    }
  }, [formData.faculty_id]);

  // Load programs when department changes
  useEffect(() => {
    if (formData.department_id) {
      loadPrograms(formData.department_id);
    } else {
      setMasterData(prev => ({ ...prev, programs: [] }));
      setFormData(prev => ({ ...prev, program_id: '' }));
    }
  }, [formData.department_id]);

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
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      const currentIds = formData[name] || [];
      if (checked) {
        setFormData(prev => ({
          ...prev,
          [name]: [...currentIds, parseInt(value)]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: currentIds.filter(id => id !== parseInt(value))
        }));
      }
    } else {
      setFormData(prev => ({
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form based on user type
    const validationRules = {
      email: VALIDATION_RULES.email,
      password: VALIDATION_RULES.password,
      confirmPassword: {
        ...VALIDATION_RULES.confirmPassword,
        validator: (value) => VALIDATION_RULES.confirmPassword.validator(value, formData)
      },
      prefix: { required: true, label: 'คำนำหน้า', validator: (value) => ({ isValid: value.trim().length > 0, message: null }) },
      first_name: { required: true, label: 'ชื่อ', validator: (value) => ({ isValid: value.trim().length > 0, message: null }) },
      last_name: { required: true, label: 'นามสกุล', validator: (value) => ({ isValid: value.trim().length > 0, message: null }) },
      faculty_id: { required: true, label: 'คณะ', validator: (value) => ({ isValid: value, message: null }) },
      department_id: { required: true, label: 'ภาควิชา', validator: (value) => ({ isValid: value, message: null }) },
    };

    if (userType === 'student') {
      validationRules.student_id = VALIDATION_RULES.student_id;
    } else if (userType === 'advisor') {
      validationRules.academic_rank_id = { required: true, label: 'ตำแหน่งทางวิชาการ', validator: (value) => ({ isValid: value, message: null }) };

      validationRules.expertise_ids = { required: true, label: 'ความเชี่ยวชาญ', validator: (value) => ({ isValid: value.length > 0, message: 'กรุณาเลือกความเชี่ยวชาญอย่างน้อย 1 ข้อ' }) };
    }
    
    const validation = validateForm(formData, validationRules);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const endpoint = userType === 'student' ? '/api/students/create' : '/api/advisors/create';
      
      // Prepare data based on user type
      const submitData = { ...formData };
      if (userType === 'student' || userType === 'advisor') {
        // Auto-select first program from selected department to keep API compatibility.
        if (masterData.programs.length > 0) {
          submitData.program_id = masterData.programs[0].program_id;
        } else {
          // If no programs available, set to 1 as default
          submitData.program_id = 1;
        }
      }
      
      const response = await apiClient.post(endpoint, submitData);
      
      console.log('Registration response:', response);
      
      if (response.success || response.status === 'ok') {
        // Show success state
        setIsSuccess(true);
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          router.push('/login?registered=true');
        }, 2000);
      } else {
        console.log('Registration failed - response not successful:', response);
        setErrors({ general: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' });
      }
    } catch (error) {
      console.error('Registration error details:', error);
      const errorMessage = handleError(error, 'Register');
      
      // Show detailed error if available
      let detailedError = errorMessage;
      if (error.data && error.data.error) {
        detailedError = error.data.error;
      }
      if (error.data && error.data.trace) {
        console.error('Error trace:', error.data.trace);
      }
      
      setErrors({ general: detailedError });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Card Container */}
      <div className="bg-white rounded-2xl shadow-lg p-5 md:p-7">
        {/* Header */}
        <div className="mb-5 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            สร้างบัญชีผู้ใช้
          </h2>
          <p className="text-sm text-gray-600">
            กรุณากรอกข้อมูลให้ครบถ้วน
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 ${isSuccess ? 'opacity-50 pointer-events-none' : ''}`}>
            {/* Student ID / IC ID (Student only) */}
            {userType === 'student' && (
              <div>
                <label htmlFor="student_id" className="block text-sm font-medium text-gray-700 mb-2">
                  รหัสนิสิต *
                </label>
                <input
                  id="student_id"
                  name="student_id"
                  type="text"
                  required
                  inputMode="numeric"
                  maxLength={10}
                  className={`appearance-none block w-full px-4 py-3 border ${
                    errors.student_id ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                  placeholder="6540204545"
                  value={formData.student_id}
                  onChange={handleInputChange}
                />
                {errors.student_id && (
                  <p className="mt-2 text-sm text-red-600">{errors.student_id}</p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                อีเมล *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none block w-full px-4 py-3 border ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleInputChange}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                รหัสผ่าน *
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`appearance-none block w-full px-4 py-3 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                ยืนยันรหัสผ่าน *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`appearance-none block w-full px-4 py-3 border ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Name Section Divider */}
            <div className="pt-2 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">ข้อมูลส่วนตัว</h3>
            </div>

            {/* Prefix */}
            <div>
              <label htmlFor="prefix" className="block text-sm font-medium text-gray-700 mb-2">
                คำนำหน้า *
              </label>
              <select
                id="prefix"
                name="prefix"
                required
                className={`block w-full px-4 py-3 border ${
                  errors.prefix ? 'border-red-300' : 'border-gray-300'
                } bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                value={formData.prefix}
                onChange={handleInputChange}
              >
                <option key="empty" value="">เลือกคำนำหน้า</option>
                <option key="นาย" value="นาย">นาย</option>
                <option key="นางสาว" value="นางสาว">นางสาว</option>
                <option key="นาง" value="นาง">นาง</option>
                {userType === 'advisor' && (
                  <>
                    <option key="อ." value="อ.">อ.</option>
                    <option key="ผศ." value="ผศ.">ผศ.</option>
                    <option key="รศ." value="รศ.">รศ.</option>
                    <option key="ศ." value="ศ.">ศ.</option>
                    <option key="ดร." value="ดร.">ดร.</option>
                    <option key="อ.ดร." value="อ.ดร.">อ.ดร.</option>
                    <option key="ผศ.ดร." value="ผศ.ดร.">ผศ.ดร.</option>
                    <option key="รศ.ดร." value="รศ.ดร.">รศ.ดร.</option>
                    <option key="ศ.ดร." value="ศ.ดร.">ศ.ดร.</option>
                  </>
                )}
              </select>
              {errors.prefix && (
                <p className="mt-2 text-sm text-red-600">{errors.prefix}</p>
              )}
            </div>

            {/* First Name */}
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                ชื่อ *
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                autoComplete="given-name"
                required
                className={`appearance-none block w-full px-4 py-3 border ${
                  errors.first_name ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                placeholder="ชื่อ"
                value={formData.first_name}
                onChange={handleInputChange}
              />
              {errors.first_name && (
                <p className="mt-2 text-sm text-red-600">{errors.first_name}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                นามสกุล *
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                autoComplete="family-name"
                required
                className={`appearance-none block w-full px-4 py-3 border ${
                  errors.last_name ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                placeholder="นามสกุล"
                value={formData.last_name}
                onChange={handleInputChange}
              />
              {errors.last_name && (
                <p className="mt-2 text-sm text-red-600">{errors.last_name}</p>
              )}
            </div>

            {/* Academic Information Section Divider */}
            <div className="pt-2 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">ข้อมูลการศึกษา</h3>
            </div>

            {/* Faculty */}
            <div>
              <label htmlFor="faculty_id" className="block text-sm font-medium text-gray-700 mb-2">
                คณะ *
              </label>
              <select
                id="faculty_id"
                name="faculty_id"
                required
                className={`block w-full px-4 py-3 border ${
                  errors.faculty_id ? 'border-red-300' : 'border-gray-300'
                } bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                value={formData.faculty_id}
                onChange={handleInputChange}
              >
                <option key="empty-faculty" value="">เลือกคณะ</option>
                {masterData.faculties.map(faculty => (
                  <option key={faculty.faculty_id} value={faculty.faculty_id}>
                    {faculty.faculty_name_th || faculty.faculty_name}
                  </option>
                ))}
              </select>
              {errors.faculty_id && (
                <p className="mt-1 text-sm text-red-600">{errors.faculty_id}</p>
              )}
            </div>

            {/* Department */}
            <div>
              <label htmlFor="department_id" className="block text-sm font-medium text-gray-700 mb-2">
                ภาควิชา *
              </label>
              <select
                id="department_id"
                name="department_id"
                required
                disabled={!formData.faculty_id}
                className={`block w-full px-4 py-3 border ${
                  errors.department_id ? 'border-red-300' : 'border-gray-300'
                } bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed`}
                value={formData.department_id}
                onChange={handleInputChange}
              >
                <option key="empty-department" value="">เลือกภาควิชา</option>
                {masterData.departments.map(department => (
                  <option key={department.department_id} value={department.department_id}>
                    {department.department_name_th || department.department_name}
                  </option>
                ))}
              </select>
              {errors.department_id && (
                <p className="mt-2 text-sm text-red-600">{errors.department_id}</p>
              )}
            </div>

            {/* Academic Rank (Advisor only) */}
            {userType === 'advisor' && (
              <div>
                <label htmlFor="academic_rank_id" className="block text-sm font-medium text-gray-700 mb-2">
                  ตำแหน่งทางวิชาการ *
                </label>
                <select
                  id="academic_rank_id"
                  name="academic_rank_id"
                  required
                  className={`block w-full px-4 py-3 border ${
                    errors.academic_rank_id ? 'border-red-300' : 'border-gray-300'
                  } bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                  value={formData.academic_rank_id}
                  onChange={handleInputChange}
                >
                  <option key="empty-rank" value="">เลือกตำแหน่งทางวิชาการ</option>
                  {masterData.academic_ranks.map(rank => (
                    <option key={rank.academic_rank_id} value={rank.academic_rank_id}>
                      {rank.rank_name_th || rank.rank_name}
                    </option>
                  ))}
                </select>
                {errors.academic_rank_id && (
                  <p className="mt-2 text-sm text-red-600">{errors.academic_rank_id}</p>
                )}
              </div>
            )}



            {/* Capacity (Advisor only) */}
            {userType === 'advisor' && (
              <div>
                <label htmlFor="project_capacity" className="block text-sm font-medium text-gray-700 mb-2">
                  จำนวนนิสิตที่รับได้ *
                </label>
                <input
                  id="project_capacity"
                  name="project_capacity"
                  type="number"
                  min="1"
                  max="20"
                  required
                  className={`appearance-none block w-full px-4 py-3 border ${
                    errors.project_capacity ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                  placeholder="5"
                  value={formData.project_capacity}
                  onChange={handleInputChange}
                />
                {errors.project_capacity && (
                  <p className="mt-2 text-sm text-red-600">{errors.project_capacity}</p>
                )}
              </div>
            )}
          </div>

          {/* Expertise (Advisor only) */}
          {userType === 'advisor' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                ความเชี่ยวชาญ *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {masterData.expertises.map(expertise => (
                  <label key={expertise.expertise_id} className="flex items-center p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      name="expertise_ids"
                      value={expertise.expertise_id}
                      checked={formData.expertise_ids.includes(parseInt(expertise.expertise_id))}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2.5 text-sm text-gray-700 leading-tight">
                      {expertise.expertise_name_th || expertise.expertise_name}
                    </span>
                  </label>
                ))}
              </div>
              {errors.expertise_ids && (
                <p className="mt-2 text-sm text-red-600">{errors.expertise_ids}</p>
              )}
            </div>
          )}

          {errors.general && (
            <div className="rounded-xl bg-red-50 p-4 border border-red-200">
              <div className="text-sm text-red-700">{errors.general}</div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังลงทะเบียน...
                </>
              ) : (
                'ลงทะเบียน'
              )}
            </button>
          </div>

          {/* Login Link */}
          <div className="text-center pt-2">
            <p className="text-sm text-gray-600">
              มีบัญชีแล้ว?{' '}
              <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                เข้าสู่ระบบ
              </a>
            </p>
          </div>

          {isSuccess && (
            <div className="rounded-xl bg-green-50 p-4 border border-green-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    สมัครสมาชิกสำเร็จ!
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>ระบบจะนำท่านไปยังหน้าเข้าสู่ระบบภายใน 2 วินาที...</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
