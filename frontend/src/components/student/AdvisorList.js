'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { handleError } from '@/lib/errorHandler';
import { formatDate } from '@/lib/utils';
import { PAGINATION, BUSINESS_RULES } from '@/lib/constants';

export default function AdvisorList() {
  const router = useRouter();
  const [advisors, setAdvisors] = useState([]);
  const [filters, setFilters] = useState({
    q: '',
    expertise_id: '',
    program_id: '',
    faculty_id: '',
    available_only: false,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGINATION.DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });
  const [masterData, setMasterData] = useState({
    faculties: [],
    departments: [],
    programs: [],
    expertises: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadInitialData = useCallback(() => {
    loadMasterData();
    loadAdvisors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    loadAdvisors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.page, pagination.limit]);

  const loadMasterData = async () => {
    try {
      const [faculties, expertises] = await Promise.all([
        apiClient.get('/api/helpers/faculties'),
        apiClient.get('/api/helpers/expertises'),
      ]);

      setMasterData(prev => ({
        ...prev,
        faculties: faculties.data || [],
        expertises: expertises.data || [],
      }));
    } catch (error) {
      console.error('Error loading master data:', error);
    }
  };

  const loadAdvisors = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      };

      const response = await apiClient.get('/api/advisors/list', params);

      if (response.success) {
        setAdvisors(response.data);
        setPagination(prev => ({
          ...prev,
          total: response.pagination.total,
          totalPages: response.pagination.total_pages,
        }));
      }
    } catch (error) {
      const errorMessage = handleError(error, 'Load Advisors');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
    setPagination(prev => ({
      ...prev,
      page: 1, // Reset to first page when filtering
    }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleViewProfile = (advisorId) => {
    router.push(`/advisor/${advisorId}`);
  };

  const getCapacityColor = (current, max) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getCapacityText = (current, max) => {
    if (current >= max) return 'เต็ม';
    return `${current}/${max}`;
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium mb-2">เกิดข้อผิดพลาด</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={() => loadAdvisors()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            ลองใหม่
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
              <h1 className="text-2xl font-bold text-gray-900">อาจารย์ที่ปรึกษา</h1>
              <p className="text-gray-600">ค้นหาและเลือกอาจารย์ที่ปรึกษาที่เหมาะสม</p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              กลับแดชบอร์ด
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">ตัวกรองการค้นหา</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ค้นหา
              </label>
              <input
                type="text"
                placeholder="ชื่ออาจารย์, ความเชี่ยวชาญ..."
                value={filters.q}
                onChange={(e) => handleFilterChange('q', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Faculty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                คณะ
              </label>
              <select
                value={filters.faculty_id}
                onChange={(e) => handleFilterChange('faculty_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">ทุกคณะ</option>
                {masterData.faculties.map(faculty => (
                  <option key={faculty.faculty_id} value={faculty.faculty_id}>
                    {faculty.faculty_name_th}
                  </option>
                ))}
              </select>
            </div>

            {/* Expertise */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ความเชี่ยวชาญ
              </label>
              <select
                value={filters.expertise_id}
                onChange={(e) => handleFilterChange('expertise_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">ทุกความเชี่ยวชาญ</option>
                {masterData.expertises.map(expertise => (
                  <option key={expertise.expertise_id} value={expertise.expertise_id}>
                    {expertise.expertise_name_th}
                  </option>
                ))}
              </select>
            </div>

            {/* Available Only */}
            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.available_only}
                  onChange={(e) => handleFilterChange('available_only', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">ว่างรับนิสิตเท่านั้น</span>
              </label>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => setFilters({
                  q: '',
                  expertise_id: '',
                  program_id: '',
                  faculty_id: '',
                  available_only: false,
                })}
                className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                ล้างตัวกรอง
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                ผลการค้นหา ({pagination.total} คน)
              </h3>
              <div className="text-sm text-gray-500">
                หน้า {pagination.page} จาก {pagination.totalPages}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : advisors.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">ไม่พบอาจารย์ที่ปรึกษา</h3>
              <p className="mt-1 text-sm text-gray-500">ลองปรับเปลี่ยนตัวกรองการค้นหา</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {advisors.map((advisor) => (
                <div key={advisor.advisor_id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="h-16 w-16 rounded-full bg-indigo-500 flex items-center justify-center">
                          <span className="text-xl font-medium text-white">
                            {advisor.first_name.charAt(0)}{advisor.last_name.charAt(0)}
                          </span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-lg font-medium text-gray-900">
                            {advisor.academic_rank_name} {advisor.first_name} {advisor.last_name}
                          </h4>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {advisor.academic_degree_name}
                          </span>
                        </div>
                        
                        <div className="mt-1 text-sm text-gray-500">
                          {advisor.faculty_name} - {advisor.department_name}
                        </div>

                        {/* Expertise */}
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {advisor.expertises?.map((expertise) => (
                              <span
                                key={expertise.expertise_id}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                              >
                                {expertise.expertise_name_th}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Capacity */}
                        <div className="mt-2 flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">จำนวนนิสิต:</span>
                            <span className={`text-sm font-medium ${getCapacityColor(advisor.current_students, advisor.capacity)}`}>
                              {getCapacityText(advisor.current_students, advisor.capacity)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">ว่างรับ:</span>
                            <span className="text-sm font-medium text-green-600">
                              {advisor.available_capacity} คน
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewProfile(advisor.advisor_id)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                      >
                        ดูรายละเอียด
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  แสดง {((pagination.page - 1) * pagination.limit) + 1} ถึง {Math.min(pagination.page * pagination.limit, pagination.total)} จาก {pagination.total} รายการ
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ก่อนหน้า
                  </button>
                  
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          pagination.page === page
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ถัดไป
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
