'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import apiClient from '@/lib/api';
import { handleError } from '@/lib/errorHandler';
import { useNotifications } from '@/contexts/NotificationContext';
import { formatDate } from '@/lib/utils';
import { REQUEST_STATUS_COLORS } from '@/lib/constants';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, WARNING_MESSAGES } from '@/lib/errorMessages';

export default function StudentRequests() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast, showModal } = useNotifications();
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const loadUserDataAndRequests = useCallback(() => {
    loadUserData();
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadUserDataAndRequests();
    
    if (searchParams.get('success') === 'created') {
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, [searchParams, loadUserDataAndRequests]);

  useEffect(() => {
    filterRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requests, statusFilter, searchTerm]);

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
      
      // Load requests directly - API will filter by student_id from session
      const requestsResponse = await apiClient.get('/api/requests/list');
      
      if (requestsResponse.success) {
        const studentRequests = requestsResponse.data || [];
        setRequests(studentRequests);
      }
    } catch (error) {
      const errorMessage = handleError(error, 'Load Requests');
      console.error(errorMessage);
      // If authentication fails, redirect to login
      if (error.message?.includes('authenticated') || error.message?.includes('Unauthorized')) {
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = requests;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(request =>
        request.project_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.advisor_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
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
      default:
        return null;
    }
  };

  const getRequestStats = () => {
    return {
      total: requests.length,
      pending: requests.filter(r => r.status === 'รอดำเนินการ').length,
      approved: requests.filter(r => r.status === 'อนุมัติ').length,
      rejected: requests.filter(r => r.status === 'ปฏิเสธ').length,
    };
  };

  const executeCancelRequest = async (requestId) => {
    try {
      const response = await apiClient.delete(`/api/requests/detail?id=${requestId}`);
      
      if (response.success) {
        // Remove request from list
        setRequests(prev => prev.filter(req => req.request_id !== requestId));
        showToast({ message: SUCCESS_MESSAGES.REQUEST_CANCELLED, type: 'success' });
      } else {
        // Use specific error message or fallback to default
        const errorMsg = response.message || ERROR_MESSAGES.REQUEST_DELETE_FAILED;
        showToast({ message: errorMsg, type: 'error' });
      }
    } catch (error) {
      const errorMessage = handleError(error, 'Cancel Request');
      showToast({ message: errorMessage || ERROR_MESSAGES.REQUEST_DELETE_FAILED, type: 'error' });
    }
  };

  const handleCancelRequest = (requestId) => {
    showModal({
      title: 'ยืนยันการยกเลิกคำขอ',
      message: WARNING_MESSAGES.CANCEL_REQUEST_CONFIRM,
      type: 'warning',
      actions: [
        {
          label: 'ยกเลิกคำขอ',
          variant: 'danger',
          onClick: () => {
            void executeCancelRequest(requestId);
          },
        },
        {
          label: 'กลับไปแก้ไข',
          variant: 'secondary',
          onClick: () => {},
        },
      ],
    });
  };

  const handleViewDetails = async (request) => {
    try {
      // Fetch full request details
      const response = await apiClient.get(`/api/requests/detail?id=${request.request_id}`);
      if (response.success) {
        setSelectedRequest(response.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      const errorMessage = handleError(error, 'View Request Details');
      showToast({ message: errorMessage || ERROR_MESSAGES.LOAD_DATA_FAILED, type: 'error' });
    }
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
              <h1 className="text-2xl font-bold text-gray-900">คำขอของฉัน</h1>
              <p className="text-gray-600">ดูสถานะคำขอที่ปรึกษาโครงงานทั้งหมด</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/student/create-request')}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                ส่งคำขอใหม่
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
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 rounded-md bg-green-50 p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  ส่งคำขอสำเร็จ! รอการพิจารณาจากอาจารย์ที่ปรึกษา
                </p>
              </div>
            </div>
          </div>
        )}

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ค้นหาคำขอ
                </label>
                <input
                  type="text"
                  placeholder="ค้นหาชื่อโครงงานหรืออาจารย์..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  กรองตามสถานะ
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="รอดำเนินการ">รอการอนุมัติ</option>
                  <option value="อนุมัติ">ได้รับอนุมัติ</option>
                  <option value="ปฏิเสธ">ถูกปฏิเสธ</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              รายการคำขอ ({filteredRequests.length} รายการ)
            </h3>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm || statusFilter !== 'all' ? 'ไม่พบคำขอที่ตรงกับเงื่อนไข' : 'ยังไม่มีคำขอ'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'ลองเปลี่ยนเงื่อนไขการค้นหาหรือตัวกรอง' 
                  : 'เริ่มต้นด้วยการส่งคำขอแรกของคุณ'
                }
              </p>
              {(!searchTerm && statusFilter === 'all') && (
                <button
                  onClick={() => router.push('/student/create-request')}
                  className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  ส่งคำขอใหม่
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <div key={request.request_id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getStatusIcon(request.status)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                          {request.project_title || 'ไม่ระบุชื่อโครงงาน'}
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <p className="mb-1">
                              <span className="font-medium">อาจารย์ที่ปรึกษา:</span> {request.advisor_name || 'ไม่ระบุ'}
                            </p>
                            <p className="mb-1">
                              <span className="font-medium">ภาคการศึกษา:</span> {request.term} ปีการศึกษา {request.academic_year}
                            </p>
                          </div>
                          <div>
                            <p className="mb-1">
                              <span className="font-medium">วันที่ส่งคำขอ:</span> {formatDate(request.created_at)}
                            </p>
                            {request.approve_date && (
                              <p className="mb-1">
                                <span className="font-medium">วันที่ตอบกลับ:</span> {formatDate(request.approve_date)}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {request.project_detail && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-600 break-words">
                              <span className="font-medium">รายละเอียด:</span>{' '}
                              {request.project_detail.length > 150 
                                ? `${request.project_detail.substring(0, 150)}...` 
                                : request.project_detail
                              }
                            </p>
                          </div>
                        )}
                        
                        {request.status === 'ปฏิเสธ' && request.rejection_reason && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-800 break-words">
                              <span className="font-medium">เหตุผลที่ปฏิเสธ:</span> {request.rejection_reason}
                            </p>
                          </div>
                        )}

                        {request.status === 'ปฏิเสธ' && request.suggestion && (
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <p className="text-sm text-blue-800 break-words">
                              <span className="font-medium">ข้อเสนอแนะ:</span> {request.suggestion}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-6 flex-shrink-0 text-right flex flex-col items-end space-y-2">
                      <div className="mb-2">
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-xs text-gray-500">
                        ID: {request.request_id}
                      </p>
                      
                      {/* Action Buttons - Moved to right side */}
                      <div className="flex flex-col gap-2 mt-2">
                        <button
                          onClick={() => handleViewDetails(request)}
                          className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap"
                        >
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          ดูรายละเอียด
                        </button>
                        
                        {request.status === 'ปฏิเสธ' && (
                          <button
                            onClick={() => router.push(`/student/create-request?copy_from=${request.request_id}`)}
                            className="inline-flex items-center justify-center px-4 py-2 border border-green-300 shadow-sm text-sm font-medium rounded text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 whitespace-nowrap"
                          >
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            ส่งคำขอใหม่
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        {requests.length > 0 && (
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-blue-600 mt-1 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-medium text-blue-900">ข้อมูลเพิ่มเติม</h3>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• คำขอจะถูกส่งไปยังอาจารย์ที่ปรึกษาที่คุณเลือก</li>
                  <li>• อาจารย์จะพิจารณาและให้ผลตอบกลับภายในระยะเวลาที่กำหนด</li>
                  <li>• หากได้รับการอนุมัติ คุณจะสามารถเริ่มทำโครงงานได้</li>
                  <li>• หากถูกปฏิเสธ คุณสามารถดูเหตุผลและส่งคำขอใหม่ได้</li>
                  <li>• ระบบจะส่งการแจ้งเตือนเมื่อมีการอัพเดทสถานะคำขอ</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 md:items-center" onClick={() => setShowDetailModal(false)}>
            <div className="w-full max-w-4xl rounded-md border bg-white p-5 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">รายละเอียดคำขอ</h3>
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
              {/* Status */}
              <div className="flex items-center justify-between pb-4 border-b">
                <span className="text-sm font-medium text-gray-500">สถานะ:</span>
                {getStatusBadge(selectedRequest.status)}
              </div>

              {/* Request Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">รหัสคำขอ</p>
                  <p className="mt-1 text-sm text-gray-900">{selectedRequest.request_id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">วันที่ส่งคำขอ</p>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(selectedRequest.submit_date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">อาจารย์ที่ปรึกษา</p>
                  <p className="mt-1 text-sm text-gray-900">{selectedRequest.advisor_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">ปีการศึกษา</p>
                  <p className="mt-1 text-sm text-gray-900">{selectedRequest.academic_year} ภาคเรียน{selectedRequest.term}</p>
                </div>
              </div>

              {/* Project Title */}
              {selectedRequest.project_title && (
                <div>
                  <p className="text-sm font-medium text-gray-500">ชื่อโครงงาน</p>
                  <p className="mt-1 text-sm text-gray-900">{selectedRequest.project_title}</p>
                </div>
              )}

              {/* Project Detail */}
              {selectedRequest.project_detail && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">รายละเอียดโครงงาน</p>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">{selectedRequest.project_detail}</p>
                </div>
              )}

              {/* File */}
              {selectedRequest.proposal_file && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">ไฟล์โครงงาน</p>
                  <button
                    onClick={() => window.open(apiClient.getFullUrl(`/api/requests/download-file?request_id=${selectedRequest.request_id}`), '_blank')}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    ดาวน์โหลด ({selectedRequest.original_filename || selectedRequest.proposal_file})
                  </button>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedRequest.status === 'ปฏิเสธ' && selectedRequest.rejection_reason && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm font-medium text-red-900 mb-1">เหตุผลที่ปฏิเสธ</p>
                  <p className="text-sm text-red-800 break-words whitespace-pre-wrap">{selectedRequest.rejection_reason}</p>
                </div>
              )}

              {/* Suggestion */}
              {selectedRequest.status === 'ปฏิเสธ' && selectedRequest.suggestion && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm font-medium text-blue-900 mb-1">ข้อเสนอแนะ</p>
                  <p className="text-sm text-blue-800 break-words whitespace-pre-wrap">{selectedRequest.suggestion}</p>
                </div>
              )}

              {/* Approve Date */}
              {selectedRequest.status === 'อนุมัติ' && selectedRequest.approve_date && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm font-medium text-green-900">วันที่อนุมัติ: {formatDate(selectedRequest.approve_date)}</p>
                </div>
              )}

              {/* Expire Date */}
              {selectedRequest.expire_date && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm font-medium text-yellow-900">วันหมดอายุ: {formatDate(selectedRequest.expire_date)}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}