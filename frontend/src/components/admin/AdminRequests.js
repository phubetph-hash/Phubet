'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { handleError } from '@/lib/errorHandler';
import { formatDate } from '@/lib/utils';
import { REQUEST_STATUS_COLORS } from '@/lib/constants';

export default function AdminRequests() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    advisor: '',
    faculty: '',
    search: '',
  });
  const [advisors, setAdvisors] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  
  useEffect(() => {
    loadUserData();
    loadRequests();
    loadFilterData();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, filters]);

  const loadUserData = () => {
    const userData = localStorage.getItem('advisor_system_user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push('/login');
    }
  };

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      
      // Load requests from real API
      const requestsResponse = await apiClient.get('/api/requests/list?admin=true');
      
      if (requestsResponse.success) {
        setRequests(requestsResponse.data || []);
      } else {
        // If API fails, show empty array
        setRequests([]);
      }
      
    } catch (error) {
      const errorMessage = handleError(error, 'Load Requests');
      console.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFilterData = async () => {
    try {
      const [advisorsRes, facultiesRes] = await Promise.all([
        apiClient.get('/api/advisors/list'),
        apiClient.get('/api/helpers/faculties'),
      ]);

      if (advisorsRes.success) setAdvisors(advisorsRes.data || []);
      if (facultiesRes.success) setFaculties(facultiesRes.data || []);
    } catch (error) {
      console.error('Error loading filter data:', error);
    }
  };

  const filterRequests = () => {
    let filtered = [...requests];

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(request => request.status === filters.status);
    }

    // Advisor filter
    if (filters.advisor) {
      filtered = filtered.filter(request => 
        request.advisor_name?.toLowerCase().includes(filters.advisor.toLowerCase())
      );
    }

    // Faculty filter
    if (filters.faculty) {
      filtered = filtered.filter(request =>
        request.faculty_name?.toLowerCase().includes(filters.faculty.toLowerCase())
      );
    }

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(request =>
        request.student_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        request.project_title?.toLowerCase().includes(filters.search.toLowerCase()) ||
        request.advisor_name?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      advisor: '',
      faculty: '',
      search: '',
    });
  };

  const handleViewDetail = async (request) => {
    try {
      // Load detailed request information
      const detailResponse = await apiClient.get(`/api/requests/detail`, { id: request.request_id });
      
      if (detailResponse.success && detailResponse.data) {
        // Use detailed data from API with complete information
        setSelectedRequest({
          ...request, // Keep original data as fallback
          ...detailResponse.data // Override with detailed data
        });
      } else {
        // Fallback to basic request data
        setSelectedRequest(request);
      }
      
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error loading request details:', error);
      // Fallback to basic request data with enhanced fields
      setSelectedRequest({
        ...request,
        student_email: request.student_email || request.email || 'ไม่ระบุ',
        program_name_th: request.program_name_th || request.program_name || 'ไม่ระบุ',
        department_name_th: request.department_name_th || request.department_name || 'ไม่ระบุ',
        faculty_name_th: request.faculty_name_th || request.faculty_name || 'ไม่ระบุ'
      });
      setShowDetailModal(true);
    }
  };

  const getStatusBadge = (status) => {
    const colorClass = REQUEST_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {status}
      </span>
    );
  };

  const getRequestStats = () => {
    return {
      total: requests.length,
      pending: requests.filter(r => r.status === 'รอดำเนินการ').length,
      approved: requests.filter(r => r.status === 'อนุมัติ').length,
      rejected: requests.filter(r => r.status === 'ปฏิเสธ').length,
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const stats = getRequestStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">จัดการคำขอทั้งหมด</h1>
              <p className="text-gray-600">ติดตามและจัดการคำขอที่ปรึกษาโครงงานทั้งหมด</p>
            </div>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              กลับแดชบอร์ด
            </button>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">คำขอทั้งหมด</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">รอการอนุมัติ</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
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
                <p className="text-sm font-medium text-gray-500">ได้รับอนุมัติ</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.approved}</p>
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
                <p className="text-sm font-medium text-gray-500">ถูกปฏิเสธ</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.rejected}</p>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ค้นหา
                </label>
                <input
                  type="text"
                  placeholder="ชื่อนิสิต, ชื่อโครงงาน, อาจารย์..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  สถานะ
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="รอดำเนินการ">รอการอนุมัติ</option>
                  <option value="อนุมัติ">ได้รับอนุมัติ</option>
                  <option value="ปฏิเสธ">ถูกปฏิเสธ</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  อาจารย์ที่ปรึกษา
                </label>
                <input
                  type="text"
                  placeholder="ชื่ออาจารย์..."
                  value={filters.advisor}
                  onChange={(e) => handleFilterChange('advisor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  คณะ
                </label>
                <input
                  type="text"
                  placeholder="ชื่อคณะ..."
                  value={filters.faculty}
                  onChange={(e) => handleFilterChange('faculty', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              คำขอทั้งหมด ({filteredRequests.length} รายการ)
            </h3>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">ไม่พบคำขอ</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filters.search || filters.status !== 'all' || filters.advisor || filters.faculty
                  ? 'ไม่พบคำขอที่ตรงกับเงื่อนไขการค้นหา'
                  : 'ยังไม่มีคำขอในระบบ'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      นิสิต
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      โครงงาน
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      อาจารย์ที่ปรึกษา
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      สถานะ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      วันที่ส่ง
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      การดำเนินการ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr key={request.request_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {request.student_name ? request.student_name.charAt(0) : 'S'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {request.student_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.student_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {request.project_title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.faculty_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {request.advisor_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.department_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(request.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewDetail(request)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          ดูรายละเอียด
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-600/50 p-4 md:items-center">
          <div className="w-full max-w-4xl rounded-md border bg-white p-5 shadow-lg">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">รายละเอียดคำขอ</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Student Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-900 mb-3">ข้อมูลนิสิต</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">ชื่อ-นามสกุล</dt>
                      <dd className="text-sm text-gray-900">{selectedRequest.student_name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">รหัสนิสิต</dt>
                      <dd className="text-sm text-gray-900">{selectedRequest.student_id}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">อีเมล</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedRequest.student_email || selectedRequest.email || 'ไม่ระบุ'}</dd>
                    </div>
                  </div>
                </div>

                {/* Project Info */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-900 mb-3">ข้อมูลโครงงาน</h4>
                  <div className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">ชื่อโครงงาน</dt>
                      <dd className="text-sm text-gray-900">{selectedRequest.project_title}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">รายละเอียดโครงงาน</dt>
                      <dd className="text-sm text-gray-900">{selectedRequest.project_detail}</dd>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">ภาคเรียน</dt>
                        <dd className="text-sm text-gray-900">
                          {selectedRequest.term ? `ภาคเรียน${selectedRequest.term}` : 
                           selectedRequest.semester ? `ภาคเรียน${selectedRequest.semester}` : 
                           'ไม่ระบุ'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">ปีการศึกษา</dt>
                        <dd className="text-sm text-gray-900">{selectedRequest.academic_year}</dd>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advisor Info */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-900 mb-3">ข้อมูลอาจารย์ที่ปรึกษา</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">ชื่อ-นามสกุล</dt>
                      <dd className="text-sm text-gray-900">{selectedRequest.advisor_name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">อีเมล</dt>
                      <dd className="text-sm text-gray-900">{selectedRequest.advisor_email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">ภาควิชา</dt>
                      <dd className="text-sm text-gray-900">{selectedRequest.department_name || selectedRequest.department_name_th || 'ไม่ระบุ'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">คณะ</dt>
                      <dd className="text-sm text-gray-900">{selectedRequest.faculty_name || selectedRequest.faculty_name_th || 'ไม่ระบุ'}</dd>
                    </div>
                  </div>
                </div>

                {/* Status Info */}
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-900 mb-3">สถานะคำขอ</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">สถานะปัจจุบัน</dt>
                      <dd className="text-sm text-gray-900">{getStatusBadge(selectedRequest.status)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">วันที่ส่งคำขอ</dt>
                      <dd className="text-sm text-gray-900">{formatDate(selectedRequest.created_at)}</dd>
                    </div>
                    {selectedRequest.approve_date && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">วันที่ตอบกลับ</dt>
                        <dd className="text-sm text-gray-900">{formatDate(selectedRequest.approve_date)}</dd>
                      </div>
                    )}
                    {selectedRequest.suggestion && (
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">ข้อเสนอแนะ</dt>
                        <dd className="text-sm text-gray-900 mt-1 p-3 bg-white rounded border">
                          {selectedRequest.suggestion}
                        </dd>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}