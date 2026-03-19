'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import apiClient from '@/lib/api';
import { handleError } from '@/lib/errorHandler';
import { validateForm, VALIDATION_RULES } from '@/lib/validation';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/errorMessages';
import FileUploadComponent from '@/components/common/FileUploadComponent';

export default function CreateRequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [advisors, setAdvisors] = useState([]);
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  const [formData, setFormData] = useState({
    project_title: '',
    project_description: '',
    advisor_id: '',
    academic_term_id: '',
    proposal_file: null,
  });
  const [academicTerms, setAcademicTerms] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdRequestId, setCreatedRequestId] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const submittedRef = useRef(false);

  const loadInitialData = useCallback(() => {
    loadUserData();
    loadAdvisors();
    loadAcademicTerms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadInitialData();
    
    // Check if advisor_id is passed via URL
    const advisorId = searchParams.get('advisor_id');
    if (advisorId) {
      setFormData(prev => ({
        ...prev,
        advisor_id: advisorId
      }));
    }
  }, [searchParams, loadInitialData]);

  useEffect(() => {
    if (formData.advisor_id && advisors.length > 0) {
      const advisor = advisors.find(a => a.advisor_id === parseInt(formData.advisor_id));
      setSelectedAdvisor(advisor);
    }
  }, [formData.advisor_id, advisors]);

  const loadUserData = () => {
    const userData = localStorage.getItem('advisor_system_user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push('/login');
    }
  };

  const loadAdvisors = async () => {
    try {
      const response = await apiClient.get('/api/advisors/list');
      if (response.success) {
        // Filter only advisors with available capacity
        const availableAdvisors = response.data.filter(advisor => 
          advisor.available_capacity > 0
        );
        setAdvisors(availableAdvisors);
      }
    } catch (error) {
      console.error('Error loading advisors:', error);
    }
  };

  const loadAcademicTerms = async () => {
    try {
      const response = await apiClient.get('/api/helpers/academic_terms');
      if (response.success) {
        setAcademicTerms(response.data);
        // Set current term as default
        const currentTerm = response.data.find(term => term.is_current);
        if (currentTerm) {
          setFormData(prev => ({
            ...prev,
            academic_term_id: currentTerm.academic_term_id
          }));
        }
      }
    } catch (error) {
      console.error('Error loading academic terms:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
    
    // Prevent duplicate submission with multiple checks
    if (isSubmitting || isSuccess || submittedRef.current) {
      return;
    }
    
    // Mark as being submitted
    submittedRef.current = true;

    // Validate form
    const validation = validateForm(formData, {
      project_title: { 
        required: true, 
        label: 'ชื่อโครงงาน',
        validator: (value) => ({ 
          isValid: value.trim().length >= 10, 
          message: 'ชื่อโครงงานต้องมีความยาวอย่างน้อย 10 ตัวอักษร' 
        }) 
      },
      project_description: { 
        required: true, 
        label: 'รายละเอียดโครงงาน',
        validator: (value) => ({ 
          isValid: value.trim().length >= 50, 
          message: 'รายละเอียดโครงงานต้องมีความยาวอย่างน้อย 50 ตัวอักษร' 
        }) 
      },
      advisor_id: { 
        required: true, 
        label: 'อาจารย์ที่ปรึกษา',
        validator: (value) => ({ 
          isValid: value !== '', 
          message: null 
        }) 
      },
      academic_term_id: { 
        required: true, 
        label: 'ภาคการศึกษา',
        validator: (value) => ({ 
          isValid: value !== '', 
          message: null 
        }) 
      },
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Prepare request data with uploaded file
      const requestData = {
        ...formData,
        student_id: user.user_id,
        project_detail: formData.project_description,
        proposal_file: uploadedFiles.length > 0 ? uploadedFiles[0].filename : null
      };

      const response = await apiClient.post('/api/requests/create', requestData);
      
      console.log('Create request response:', response);

      if (response.success || response.status === 'ok') {
        console.log('Request created successfully, ID:', response.data.request_id);
        setCreatedRequestId(response.data.request_id);
        setIsSuccess(true);
        console.log(SUCCESS_MESSAGES.CREATE);
        
        // Reset form data
        setFormData({
          advisor_id: '',
          academic_term_id: '',
          project_title: '',
          project_description: ''
        });
        setUploadedFiles([]);
        
        // Show success message and redirect after a short delay
        console.log('Setting timeout for redirect...');
        setTimeout(() => {
          console.log('Redirecting to requests page...');
          router.push('/student/requests?success=created');
        }, 500);
      } else {
        console.error('Request creation failed:', response);
        // Set error state
        setErrors({ general: response.message || ERROR_MESSAGES.CREATE_REQUEST_FAILED });
      }
    } catch (error) {
      const errorMessage = handleError(error, 'Create Request');
      setErrors({ general: errorMessage });
      // Reset submission flag on error so user can try again
      submittedRef.current = false;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
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
              <h1 className="text-2xl font-bold text-gray-900">ส่งคำขอที่ปรึกษาโครงงาน</h1>
              <p className="text-gray-600">กรอกข้อมูลโครงงานและเลือกอาจารย์ที่ปรึกษา</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/student/dashboard')}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                กลับแดชบอร์ด
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        <form 
          onSubmit={handleSubmit} 
          className="space-y-8"
          style={{ pointerEvents: (isSubmitting || isSuccess) ? 'none' : 'auto' }}
        >
          {/* General Error */}
          {errors.general && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{errors.general}</div>
            </div>
          )}

          {/* Success Message */}
          {createdRequestId && (
            <div className="rounded-md bg-green-50 p-4 border border-green-200">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div className="text-sm text-green-700">
                  <p className="font-medium">ส่งคำขอสำเร็จแล้ว!</p>
                  <p>คุณสามารถอัปโหลดเอกสารประกอบเพิ่มเติมได้ด้านล่าง</p>
                </div>
              </div>
            </div>
          )}

          {/* Project Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">ข้อมูลโครงงาน</h2>
            
            <div className="space-y-6">
              {/* Project Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อโครงงาน *
                </label>
                <input
                  type="text"
                  name="project_title"
                  value={formData.project_title}
                  onChange={handleInputChange}
                  placeholder="ระบุชื่อโครงงานที่ต้องการทำ (อย่างน้อย 10 ตัวอักษร)"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.project_title ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.project_title && (
                  <p className="mt-1 text-sm text-red-600">{errors.project_title}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  ตัวอย่าง: ระบบจัดการคลังสินค้าออนไลน์, แอปพลิเคชันจองห้องประชุม
                </p>
              </div>

              {/* Project Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  รายละเอียดโครงงาน *
                </label>
                <textarea
                  name="project_description"
                  value={formData.project_description}
                  onChange={handleInputChange}
                  rows={6}
                  placeholder="อธิบายรายละเอียดโครงงานที่ต้องการทำ วัตถุประสงค์ ขอบเขต และเทคโนโลยีที่จะใช้ (อย่างน้อย 50 ตัวอักษร)"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.project_description ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.project_description && (
                  <p className="mt-1 text-sm text-red-600">{errors.project_description}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  อธิบายให้ละเอียดเพื่อให้อาจารย์เข้าใจโครงงานของคุณ
                </p>
              </div>

              {/* Academic Term */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ภาคการศึกษา *
                </label>
                <select
                  name="academic_term_id"
                  value={formData.academic_term_id}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.academic_term_id ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">เลือกภาคการศึกษา</option>
                  {academicTerms.map(term => (
                    <option key={term.academic_term_id} value={term.academic_term_id}>
                      {term.term_name} ปีการศึกษา {term.academic_year}
                      {term.is_current && ' (ปัจจุบัน)'}
                    </option>
                  ))}
                </select>
                {errors.academic_term_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.academic_term_id}</p>
                )}
              </div>
            </div>
          </div>

          {/* Advisor Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">เลือกอาจารย์ที่ปรึกษา</h2>
            
            {/* Selected Advisor Preview */}
            {selectedAdvisor && (
              <div className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <h3 className="text-sm font-medium text-indigo-900 mb-2">อาจารย์ที่เลือก:</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-indigo-900">
                      {selectedAdvisor.academic_rank_name} {selectedAdvisor.first_name} {selectedAdvisor.last_name}
                    </p>
                    <p className="text-sm text-indigo-700">
                      {selectedAdvisor.faculty_name} • {selectedAdvisor.department_name}
                    </p>
                    <p className="text-xs text-indigo-600 mt-1">
                      ความเชี่ยวชาญ: {selectedAdvisor.expertises?.map(exp => exp.expertise_name_th).join(', ') || 'ไม่ระบุ'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-indigo-700">ว่างรับ</p>
                    <p className="font-medium text-indigo-900">
                      {selectedAdvisor.available_capacity}/{selectedAdvisor.capacity} คน
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Advisor Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                อาจารย์ที่ปรึกษา *
              </label>
              <select
                name="advisor_id"
                value={formData.advisor_id}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.advisor_id ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">เลือกอาจารย์ที่ปรึกษา</option>
                {advisors.map(advisor => (
                  <option key={advisor.advisor_id} value={advisor.advisor_id}>
                    {advisor.academic_rank_name} {advisor.first_name} {advisor.last_name} 
                    (ว่าง {advisor.available_capacity}/{advisor.capacity})
                  </option>
                ))}
              </select>
              {errors.advisor_id && (
                <p className="mt-1 text-sm text-red-600">{errors.advisor_id}</p>
              )}
              {advisors.length === 0 && (
                <p className="mt-1 text-sm text-yellow-600">
                  ขณะนี้ยังไม่มีอาจารย์ที่ว่างรับนิสิตใหม่
                </p>
              )}
            </div>

            {/* Available Advisors List */}
            {advisors.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">อาจารย์ที่ว่างรับนิสิต:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {advisors.slice(0, 6).map(advisor => (
                    <div
                      key={advisor.advisor_id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        formData.advisor_id === advisor.advisor_id.toString()
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => handleInputChange({ target: { name: 'advisor_id', value: advisor.advisor_id.toString() } })}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {advisor.academic_rank_name} {advisor.first_name} {advisor.last_name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {advisor.faculty_name}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            ความเชี่ยวชาญ: {advisor.expertises?.slice(0, 2).map(exp => exp.expertise_name_th).join(', ') || 'ไม่ระบุ'}
                          </p>
                        </div>
                        <div className="ml-3 text-right">
                          <p className="text-xs text-gray-500">ว่าง</p>
                          <p className="text-sm font-medium text-green-600">
                            {advisor.available_capacity}/{advisor.capacity}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {advisors.length > 6 && (
                  <p className="text-xs text-gray-500 mt-2">
                    และอีก {advisors.length - 6} ท่าน...
                  </p>
                )}
              </div>
            )}
          </div>

          {/* File Upload Section - Show after request is created or for editing */}
          {createdRequestId && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">เอกสารประกอบคำขอ</h2>
              <p className="text-gray-600 mb-6">
                อัปโหลดเอกสารประกอบคำขอ เช่น ร่างโครงการ เอกสารอ้างอิง หรือไฟล์เพิ่มเติม
              </p>
              
              <FileUploadComponent 
                requestId={createdRequestId}
                onFilesChange={(files) => setUploadedFiles(files)}
              />
            </div>
          )}

          {/* Action button after upload - Fixed at bottom */}
          {createdRequestId && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-10">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex justify-center">
                  <button
                    onClick={() => router.push('/student/requests?success=created')}
                    className="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 transition-colors font-medium"
                  >
                    เสร็จสิ้น - ไปดูคำขอของฉัน
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* File Upload Section */}
          {!createdRequestId && (
            <div className="border-t pt-8">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เอกสารประกอบคำขอ (ไม่บังคับ)
                </label>
                <p className="text-sm text-gray-600 mb-4">
                  อัปโหลดเอกสารประกอบคำขอ เช่น ร่างโครงการ เอกสารอ้างอิง หรือไฟล์เพิ่มเติม
                </p>
                
                <FileUploadComponent 
                  requestId={null}
                  onFilesChange={(files) => setUploadedFiles(files)}
                />
              </div>
            </div>
          )}

          {/* Submit Button - Fixed at bottom */}
          {!createdRequestId && !isSuccess && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-10">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => router.push('/student/dashboard')}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || isSuccess || advisors.length === 0}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'กำลังส่งคำขอ...' : isSuccess ? 'ส่งสำเร็จแล้ว' : 'ส่งคำขอ'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {isSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    ส่งคำขอสำเร็จ!
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>คำขอของคุณได้รับการส่งแล้ว รหัสคำขอ: {createdRequestId}</p>
                    <p>กำลังนำคุณไปยังหน้ารายการคำขอ...</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Help Section */}
        <div className="mt-8 bg-yellow-50 rounded-lg p-6">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-yellow-600 mt-1 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-medium text-yellow-900">คำแนะนำการส่งคำขอ</h3>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                <li>• เขียนชื่อโครงงานให้ชัดเจนและสื่อความหมาย</li>
                <li>• อธิบายรายละเอียดโครงงานให้ครบถ้วน รวมถึงวัตถุประสงค์และเทคโนโลยีที่ใช้</li>
                <li>• เลือกอาจารย์ที่มีความเชี่ยวชาญตรงกับโครงงานของคุณ</li>
                <li>• คำขอที่ส่งแล้วสามารถดูสถานะได้ในหน้า &quot;คำขอของฉัน&quot;</li>
                <li>• หากคำขอถูกปฏิเสธ คุณสามารถส่งคำขอใหม่ได้</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}