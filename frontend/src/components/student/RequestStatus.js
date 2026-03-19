'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { handleError } from '@/lib/errorHandler';
import { useNotifications } from '@/contexts/NotificationContext';
import { formatDate, getRelativeTime } from '@/lib/utils';
import { REQUEST_STATUS, REQUEST_STATUS_COLORS } from '@/lib/constants';

export default function RequestStatus() {
  const router = useRouter();
  const { showToast } = useNotifications();
  const [requests, setRequests] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login?redirect=/request-status');
          return;
        }
        setIsAuthenticated(true);
      } catch (error) {
        router.push('/login?redirect=/request-status');
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadRequestsCallback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, isAuthenticated]);

  const loadRequestsCallback = useCallback(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = {
        ...filters,
        limit: 50, // Load more requests for status page
      };

      const response = await apiClient.get('/api/requests/list', params);

      if (response.success) {
        setRequests(response.data);
      }
    } catch (error) {
      const errorMessage = handleError(error, 'Load Requests');
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
  };

  const handleViewDetail = async (requestId) => {
    try {
      const response = await apiClient.get(`/api/requests/detail?id=${requestId}`);
      
      if (response.success) {
        setSelectedRequest(response.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      const errorMessage = handleError(error, 'Load Request Detail');
      showToast({ message: errorMessage, type: 'error' });
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'รอดำเนินการ':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'อนุมัติ':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'ปฏิเสธ':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'หมดอายุ':
        return (
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  const getStatusDescription = (status) => {
    switch (status) {
      case 'รอดำเนินการ':
        return 'อาจารย์ที่ปรึกษากำลังพิจารณาคำขอของคุณ';
      case 'อนุมัติ':
        return 'คำขอของคุณได้รับการอนุมัติแล้ว';
      case 'ปฏิเสธ':
        return 'คำขอของคุณถูกปฏิเสธ';
      case 'หมดอายุ':
        return 'คำขอหมดอายุแล้ว';
      default:
        return 'สถานะไม่ทราบ';
    }
  };

  // Show loading while checking auth
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium mb-2">เกิดข้อผิดพลาด</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={() => loadRequests()}
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
              <h1 className="text-2xl font-bold text-gray-900">สถานะคำขอ</h1>
              <p className="text-gray-600">ติดตามสถานะคำขอของคุณ</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/advisor')}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                ส่งคำขอใหม่
              </button>
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
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">ตัวกรอง</h3>
          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                สถานะ
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">ทั้งหมด</option>
                <option value="รอดำเนินการ">รอดำเนินการ</option>
                <option value="อนุมัติ">อนุมัติ</option>
                <option value="ปฏิเสธ">ปฏิเสธ</option>
                <option value="หมดอายุ">หมดอายุ</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              คำขอของคุณ ({requests.length} รายการ)
            </h3>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">ยังไม่มีคำขอ</h3>
              <p className="mt-1 text-sm text-gray-500">เริ่มต้นด้วยการส่งคำขอหาอาจารย์ที่ปรึกษา</p>
              <div className="mt-6">
                <button
                  onClick={() => router.push('/advisor')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  ส่งคำขอใหม่
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {requests.map((request) => (
                <div key={request.request_id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {/* Status Icon */}
                      <div className="flex-shrink-0">
                        {getStatusIcon(request.status)}
                      </div>

                      {/* Request Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-lg font-medium text-gray-900">
                            {request.project_title || 'ไม่ระบุชื่อโครงการ'}
                          </h4>
                          {getStatusBadge(request.status)}
                        </div>
                        
                        <div className="mt-2 text-sm text-gray-600">
                          <p><strong>อาจารย์ที่ปรึกษา:</strong> {request.advisor_name || 'ไม่ระบุ'}</p>
                          <p><strong>ปีการศึกษา:</strong> {request.academic_year} ภาคเรียนที่ {request.term}</p>
                          <p><strong>วันที่ส่ง:</strong> {formatDate(request.created_at)}</p>
                          {request.updated_at && request.updated_at !== request.created_at && (
                            <p><strong>อัปเดตล่าสุด:</strong> {getRelativeTime(request.updated_at)}</p>
                          )}
                        </div>

                        {request.status === 'ปฏิเสธ' && request.rejection_reason && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-800">
                              <strong>เหตุผลที่ปฏิเสธ:</strong> {request.rejection_reason}
                            </p>
                          </div>
                        )}

                        {request.status === 'ปฏิเสธ' && request.suggestion && (
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <p className="text-sm text-blue-800">
                              <strong>ข้อเสนอแนะ:</strong> {request.suggestion}
                            </p>
                          </div>
                        )}

                        <div className="mt-3">
                          <p className="text-sm text-gray-500">
                            {getStatusDescription(request.status)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewDetail(request.request_id)}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        ดูรายละเอียด
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-600/50 p-4 md:items-center">
          <div className="w-full max-w-3xl rounded-md border bg-white p-5 shadow-lg">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
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

              <div className="space-y-4">
                {/* Basic Info */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">ข้อมูลพื้นฐาน</h4>
                  <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">ชื่อโครงการ</dt>
                      <dd className="text-sm text-gray-900">{selectedRequest.project_title || 'ไม่ระบุ'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">อาจารย์ที่ปรึกษา</dt>
                      <dd className="text-sm text-gray-900">{selectedRequest.advisor_name || 'ไม่ระบุ'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">ปีการศึกษา</dt>
                      <dd className="text-sm text-gray-900">
                        {selectedRequest.academic_year} ภาคเรียนที่ {selectedRequest.term}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">สถานะ</dt>
                      <dd className="text-sm text-gray-900">{getStatusBadge(selectedRequest.status)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">วันที่ส่ง</dt>
                      <dd className="text-sm text-gray-900">{formatDate(selectedRequest.created_at)}</dd>
                    </div>
                    {selectedRequest.updated_at && selectedRequest.updated_at !== selectedRequest.created_at && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">อัปเดตล่าสุด</dt>
                        <dd className="text-sm text-gray-900">{formatDate(selectedRequest.updated_at)}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Project Detail */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">รายละเอียดโครงการ</h4>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {selectedRequest.project_detail || 'ไม่ระบุ'}
                  </p>
                </div>

                {/* File */}
                {selectedRequest.file_path && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-2">ไฟล์โครงการ</h4>
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_BASE_URL}${selectedRequest.file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      ดูไฟล์ PDF
                    </a>
                  </div>
                )}

                {/* Rejection Reason */}
                {selectedRequest.status === 'ปฏิเสธ' && selectedRequest.rejection_reason && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-2">เหตุผลที่ปฏิเสธ</h4>
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-800">{selectedRequest.rejection_reason}</p>
                    </div>
                  </div>
                )}

                {/* Suggestion */}
                {selectedRequest.status === 'ปฏิเสธ' && selectedRequest.suggestion && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-2">ข้อเสนอแนะ</h4>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-800">{selectedRequest.suggestion}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4">
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
