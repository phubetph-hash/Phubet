'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { handleError } from '@/lib/errorHandler';

export default function StudentAdvisorsBrowse() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [advisors, setAdvisors] = useState([]);
  const [filteredAdvisors, setFilteredAdvisors] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [expertises, setExpertises] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name');

  const loadInitialData = useCallback(() => {
    loadUserData();
    loadAdvisors();
    loadFilterData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    filterAdvisors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advisors, searchTerm, selectedFaculty, selectedDepartment, selectedExpertise, availabilityFilter, sortBy]);

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
      setIsLoading(true);
      const response = await apiClient.get('/api/advisors/list');
      
      if (response.success) {
        setAdvisors(response.data || []);
      }
    } catch (error) {
      const errorMessage = handleError(error, 'Load Advisors');
      console.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFilterData = async () => {
    try {
      const [facultiesRes, departmentsRes, expertisesRes] = await Promise.all([
        apiClient.get('/api/helpers/faculties'),
        apiClient.get('/api/helpers/departments'),
        apiClient.get('/api/helpers/expertises'),
      ]);

      if (facultiesRes.success) setFaculties(facultiesRes.data || []);
      if (departmentsRes.success) setDepartments(departmentsRes.data || []);
      if (expertisesRes.success) setExpertises(expertisesRes.data || []);
    } catch (error) {
      console.error('Error loading filter data:', error);
    }
  };

  const filterAdvisors = () => {
    let filtered = [...advisors];

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(advisor => {
        const fullName = `${advisor.prefix || ''} ${advisor.first_name || ''} ${advisor.last_name || ''}`.trim();
        const expertiseNames = advisor.expertises?.map(exp => exp.expertise_name_th).join(' ') || '';
        
        return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               expertiseNames.toLowerCase().includes(searchTerm.toLowerCase()) ||
               advisor.faculty_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               advisor.department_name?.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // Faculty filter
    if (selectedFaculty) {
      filtered = filtered.filter(advisor => advisor.faculty_name === selectedFaculty);
    }

    // Department filter
    if (selectedDepartment) {
      filtered = filtered.filter(advisor => advisor.department_name === selectedDepartment);
    }

    // Expertise filter
    if (selectedExpertise) {
      filtered = filtered.filter(advisor => 
        advisor.expertises?.some(exp => exp.expertise_name_th === selectedExpertise)
      );
    }

    // Availability filter
    if (availabilityFilter === 'available') {
      filtered = filtered.filter(advisor => advisor.available_capacity > 0);
    } else if (availabilityFilter === 'unavailable') {
      filtered = filtered.filter(advisor => advisor.available_capacity <= 0);
    }

    // Sort
    filtered.sort((a, b) => {
      const getFullName = (advisor) => `${advisor.prefix || ''} ${advisor.first_name || ''} ${advisor.last_name || ''}`.trim();
      
      switch (sortBy) {
        case 'name':
          return getFullName(a).localeCompare(getFullName(b));
        case 'faculty':
          return (a.faculty_name || '').localeCompare(b.faculty_name || '');
        case 'department':
          return (a.department_name || '').localeCompare(b.department_name || '');
        case 'expertise':
          const aExp = a.expertises?.[0]?.expertise_name_th || '';
          const bExp = b.expertises?.[0]?.expertise_name_th || '';
          return aExp.localeCompare(bExp);
        case 'availability':
          return b.available_capacity - a.available_capacity;
        default:
          return 0;
      }
    });

    setFilteredAdvisors(filtered);
  };

  const getUniqueValues = (key) => {
    const values = new Set();
    advisors.forEach(advisor => {
      if (key === 'faculty_name') {
        if (advisor.faculty_name) values.add(advisor.faculty_name);
      } else if (key === 'department_name') {
        if (advisor.department_name) values.add(advisor.department_name);
      } else if (key === 'expertise') {
        if (advisor.expertises && Array.isArray(advisor.expertises)) {
          advisor.expertises.forEach(exp => {
            if (exp.expertise_name_th) values.add(exp.expertise_name_th);
          });
        }
      }
    });
    return Array.from(values).sort();
  };

  const getFilteredDepartments = () => {
    if (!selectedFaculty) return getUniqueValues('department_name');
    return getUniqueValues('department_name').filter(dept => {
      return advisors.some(advisor => 
        advisor.faculty_name === selectedFaculty && 
        advisor.department_name === dept
      );
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedFaculty('');
    setSelectedDepartment('');
    setSelectedExpertise('');
    setAvailabilityFilter('all');
    setSortBy('name');
  };

  const resolveProfileImageUrl = (advisor) => {
    const rawImage =
      advisor?.image ||
      advisor?.profile_image ||
      advisor?.avatar ||
      advisor?.image_url ||
      advisor?.profile_image_url ||
      '';

    if (!rawImage || typeof rawImage !== 'string') return '';
    if (rawImage.startsWith('http://') || rawImage.startsWith('https://')) return rawImage;

    const baseUrl = apiClient.baseURL || '';
    return `${baseUrl}${rawImage}`;
  };

  const getAvailabilityBadge = (isAvailable) => {
    return isAvailable ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></div>
        รับนิสิตใหม่
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-1"></div>
        ไม่รับนิสิตใหม่
      </span>
    );
  };

  const getAdvisorStats = () => {
    return {
      total: advisors.length,
      available: advisors.filter(a => a.available_capacity > 0).length,
      unavailable: advisors.filter(a => a.available_capacity <= 0).length,
      filtered: filteredAdvisors.length,
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const stats = getAdvisorStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ค้นหาอาจารย์ที่ปรึกษา</h1>
              <p className="text-gray-600">เลือกอาจารย์ที่ปรึกษาที่เหมาะสมกับโครงงานของคุณ</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/student/create-request')}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                ส่งคำขอ
              </button>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">อาจารย์ทั้งหมด</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">รับนิสิตใหม่</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.available}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">ไม่รับนิสิตใหม่</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.unavailable}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">ผลการค้นหา</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.filtered}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">ตัวกรองการค้นหา</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                ล้างตัวกรอง
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ค้นหา
                </label>
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ, ความเชียวชาญ, คณะ, ภาควิชา..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  คณะ
                </label>
                <select
                  value={selectedFaculty}
                  onChange={(e) => {
                    setSelectedFaculty(e.target.value);
                    setSelectedDepartment(''); // Reset department when faculty changes
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">ทุกคณะ</option>
                  {getUniqueValues('faculty_name').map((facultyName) => (
                    <option key={facultyName} value={facultyName}>
                      {facultyName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ภาควิชา
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">ทุกภาควิชา</option>
                  {getFilteredDepartments().map((departmentName) => (
                    <option key={departmentName} value={departmentName}>
                      {departmentName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ความเชียวชาญ
                </label>
                <select
                  value={selectedExpertise}
                  onChange={(e) => setSelectedExpertise(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">ทุกความเชี่ยวชาญ</option>
                  {getUniqueValues('expertise').map((expertiseName) => (
                    <option key={expertiseName} value={expertiseName}>
                      {expertiseName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  สถานะ
                </label>
                <select
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="available">รับนิสิตใหม่</option>
                  <option value="unavailable">ไม่รับนิสิตใหม่</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เรียงลำดับตาม
              </label>
              <div className="flex space-x-4">
                {[
                  { value: 'name', label: 'ชื่อ' },
                  { value: 'faculty', label: 'คณะ' },
                  { value: 'department', label: 'ภาควิชา' },
                  { value: 'expertise', label: 'ความเชียวชาญ' },
                  { value: 'availability', label: 'สถานะการรับนิสิต' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      sortBy === option.value
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Advisors Grid */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              รายชื่ออาจารย์ ({filteredAdvisors.length} คน)
            </h3>
          </div>

          {filteredAdvisors.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">ไม่พบอาจารย์ที่ตรงกับเงื่อนไข</h3>
              <p className="mt-1 text-sm text-gray-500">ลองปรับเปลี่ยนเงื่อนไขการค้นหา</p>
              <button
                onClick={clearFilters}
                className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                ล้างตัวกรอง
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredAdvisors.map((advisor) => {
                const fullName = `${advisor.prefix || ''} ${advisor.first_name || ''} ${advisor.last_name || ''}`.trim();
                const isAvailable = advisor.available_capacity > 0;
                const expertiseNames = advisor.expertises?.map(exp => exp.expertise_name_th).join(', ') || 'ไม่ระบุ';
                const firstChar = fullName ? fullName.charAt(0) : 'A';
                const profileImageUrl = resolveProfileImageUrl(advisor);
                
                return (
                <div key={advisor.advisor_id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center">
                        {profileImageUrl ? (
                          <img
                            src={profileImageUrl}
                            alt={`รูปโปรไฟล์ ${fullName || 'อาจารย์ที่ปรึกษา'}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-indigo-600 font-semibold text-lg">
                            {firstChar}
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {fullName || 'ไม่ระบุชื่อ'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {advisor.academic_rank_name} {advisor.academic_degree_name}
                        </p>
                      </div>
                    </div>
                    {getAvailabilityBadge(isAvailable ? 1 : 0)}
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 flex-1">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H7m2 0v-9a2 2 0 012-2h2a2 2 0 012 2v9M7 7h.01M7 3h.01" />
                      </svg>
                      <span className="font-medium">คณะ:</span>
                      <span className="ml-1">{advisor.faculty_name || 'ไม่ระบุ'}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span className="font-medium">ภาควิชา:</span>
                      <span className="ml-1">{advisor.department_name || 'ไม่ระบุ'}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span className="font-medium">ความเชี่ยวชาญ:</span>
                      <span className="ml-1 break-words">{expertiseNames}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="font-medium">รับนิสิตได้:</span>
                      <span className="ml-1">{advisor.available_capacity || 0} คน (เต็ม {advisor.project_capacity || 0} คน)</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {isAvailable ? (
                      <button
                        onClick={() => router.push(`/student/create-request?advisor_id=${advisor.advisor_id}`)}
                        className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                      >
                        ส่งคำขอ
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full bg-gray-300 text-gray-500 px-4 py-2 rounded-md cursor-not-allowed"
                      >
                        ไม่รับนิสิตใหม่
                      </button>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-blue-600 mt-1 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-medium text-blue-900">คำแนะนำการเลือกอาจารย์ที่ปรึกษา</h3>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• เลือกอาจารย์ที่มีความเชียวชาญตรงกับหัวข้อโครงงานของคุณ</li>
                <li>• พิจารณาคณะและภาควิชาที่เกี่ยวข้องกับสาขาวิชาของคุณ</li>
                <li>• ตัวเลขจำนวนนิสิตแสดงถึงความคุ้นเคยในการดูแลนิสิต</li>
                <li>• อาจารย์ที่แสดงสถานะ &quot;รับนิสิตใหม่&quot; เท่านั้นที่สามารถส่งคำขอได้</li>
                <li>• ควรเตรียมรายละเอียดโครงงานให้ชัดเจนก่อนส่งคำขอ</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}