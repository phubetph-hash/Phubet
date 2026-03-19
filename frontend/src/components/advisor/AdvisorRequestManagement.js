'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { handleError } from '@/lib/errorHandler';
import { useNotifications } from '@/contexts/NotificationContext';
import { formatDate, getRelativeTime } from '@/lib/utils';
import { REQUEST_STATUS, REQUEST_STATUS_COLORS } from '@/lib/constants';
import { SUCCESS_MESSAGES, WARNING_MESSAGES } from '@/lib/errorMessages';

export default function AdvisorRequestManagement() {
  const router = useRouter();
  const { showToast, showModal } = useNotifications();
  const [requests, setRequests] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(''); // 'approve' or 'reject'
  const [actionData, setActionData] = useState({
    rejection_reason: '',
    suggestion: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadRequests();
  }, [filters]);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = {
        ...filters,
        limit: 50,
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

  const handleApprove = (request) => {
    showModal({
      title: 'ยืนยันการอนุมัติ',
      message: WARNING_MESSAGES.APPROVE_REQUEST_CONFIRM,
      type: 'warning',
      actions: [
        {
          label: 'อนุมัติ',
          variant: 'primary',
          onClick: () => {
            setSelectedRequest(request);
            setActionType('approve');
            setActionData({ rejection_reason: '', suggestion: '' });
            setShowActionModal(true);
          },
        },
        {
          label: 'ยกเลิก',
          variant: 'secondary',
          onClick: () => {},
        },
      ],
    });
  };

  const handleReject = (request) => {
    showModal({
      title: 'ยืนยันการปฏิเสธ',
      message: WARNING_MESSAGES.REJECT_REQUEST_CONFIRM,
      type: 'warning',
      actions: [
        {
          label: 'ปฏิเสธ',
          variant: 'danger',
          onClick: () => {
            setSelectedRequest(request);
            setActionType('reject');
            setActionData({ rejection_reason: '', suggestion: '' });
            setShowActionModal(true);
          },
        },
        {
          label: 'ยกเลิก',
          variant: 'secondary',
          onClick: () => {},
        },
      ],
    });
  };

  const handleDownloadFile = async (requestId) => {
    try {
      // Use the correct API URL from apiClient
      const baseUrl = apiClient.getFullUrl('');
      const response = await fetch(`${baseUrl}/api/requests/download-file?request_id=${requestId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/pdf,application/*',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Download error:', errorData);
        showToast({ message: 'ไม่สามารถเปิดไฟล์ได้: ' + (errorData.message || 'เกิดข้อผิดพลาด'), type: 'error' });
        return;
      }

      // สร้าง blob และเปิดใน tab ใหม่
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // ลบ URL object หลังจากใช้งานเสร็จ
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);

    } catch (error) {
      console.error('Download file error:', error);
      showToast({ message: ERROR_MESSAGES.FILE_DOWNLOAD_FAILED, type: 'error' });
    }
  };

  const handleActionSubmit = async () => {
    if (!selectedRequest) return;

    setIsSubmitting(true);
    
    try {
      const response = await apiClient.put(`/api/requests/update-status?id=${selectedRequest.request_id}`, {
        status: actionType === 'approve' ? 'อนุมัติ' : 'ปฏิเสธ',
        rejection_reason: actionType === 'reject' ? actionData.rejection_reason : null,
        suggestion: actionType === 'reject' ? actionData.suggestion : null,
      });

      if (response.success) {
        // Reload requests
        await loadRequests();
        setShowActionModal(false);
        setSelectedRequest(null);
        setActionData({ rejection_reason: '', suggestion: '' });
        
        // Show success message using Thai error messages
        const successMessage = actionType === 'approve' 
          ? SUCCESS_MESSAGES.REQUEST_APPROVED 
          : SUCCESS_MESSAGES.REQUEST_REJECTED;
        showToast({ message: successMessage, type: 'success' });
      }
    } catch (error) {
      const errorMessage = handleError(error, 'Update Request Status');
      showToast({ message: errorMessage, type: 'error' });
    } finally {
      setIsSubmitting(false);
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
      default:
        return (
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

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
              <h1 className="text-2xl font-bold text-gray-900">จัดการคำขอ</h1>
              <p className="text-gray-600">อนุมัติหรือปฏิเสธคำขอจากนิสิต</p>
            </div>
            <div className="flex space-x-4">
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
              </select>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              คำขอทั้งหมด ({requests.length} รายการ)
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
              <p className="mt-1 text-sm text-gray-500">คำขอใหม่จะแสดงที่นี่</p>
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
                          <p><strong>นิสิต:</strong> {request.student_name || 'ไม่ระบุ'}</p>
                          <p><strong>รหัสนิสิต:</strong> {request.student_id || 'ไม่ระบุ'}</p>
                          <p><strong>ปีการศึกษา:</strong> {request.academic_year} ภาคเรียนที่ {request.term}</p>
                          <p><strong>วันที่ส่ง:</strong> {formatDate(request.created_at)}</p>
                          {request.updated_at && request.updated_at !== request.created_at && (
                            <p><strong>อัปเดตล่าสุด:</strong> {getRelativeTime(request.updated_at)}</p>
                          )}
                          {request.proposal_file && (
                            <div className="flex items-center mt-2" title={request.original_filename || request.proposal_file}>
                              <svg className="w-4 h-4 text-green-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="text-green-600 font-medium">{request.original_filename || 'มีไฟล์แนบ'}</span>
                            </div>
                          )}
                        </div>

                        {request.status === 'ปฏิเสธ' && request.rejection_reason && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-800 break-words">
                              <strong>เหตุผลที่ปฏิเสธ:</strong> {request.rejection_reason}
                            </p>
                          </div>
                        )}

                        {request.status === 'ปฏิเสธ' && request.suggestion && (
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <p className="text-sm text-blue-800 break-words">
                              <strong>ข้อเสนอแนะ:</strong> {request.suggestion}
                            </p>
                          </div>
                        )}
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
                      
                      {request.status === 'รอดำเนินการ' && (
                        <>
                          <button
                            onClick={() => handleApprove(request)}
                            className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm font-medium"
                          >
                            อนุมัติ
                          </button>
                          <button
                            onClick={() => handleReject(request)}
                            className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 text-sm font-medium"
                          >
                            ปฏิเสธ
                          </button>
                        </>
                      )}
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
                      <dt className="text-sm font-medium text-gray-500">นิสิต</dt>
                      <dd className="text-sm text-gray-900">{selectedRequest.student_name || 'ไม่ระบุ'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">รหัสนิสิต</dt>
                      <dd className="text-sm text-gray-900">{selectedRequest.student_id || 'ไม่ระบุ'}</dd>
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
                  </dl>
                </div>

                {/* Project Detail */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">รายละเอียดโครงการ</h4>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">
                    {selectedRequest.project_detail || 'ไม่ระบุ'}
                  </p>
                </div>

                {/* File */}
                {selectedRequest.proposal_file && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-2">ไฟล์โครงการ</h4>
                    <button
                      onClick={() => handleDownloadFile(selectedRequest.request_id)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      ดูไฟล์ ({selectedRequest.original_filename || selectedRequest.proposal_file})
                    </button>
                  </div>
                )}

                {/* Rejection Reason */}
                {selectedRequest.status === 'ปฏิเสธ' && selectedRequest.rejection_reason && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-2">เหตุผลที่ปฏิเสธ</h4>
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-800 break-words whitespace-pre-wrap">{selectedRequest.rejection_reason}</p>
                    </div>
                  </div>
                )}

                {/* Suggestion */}
                {selectedRequest.status === 'ปฏิเสธ' && selectedRequest.suggestion && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-2">ข้อเสนอแนะ</h4>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-800 break-words whitespace-pre-wrap">{selectedRequest.suggestion}</p>
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

      {/* Action Modal */}
      {showActionModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-600/50 p-4 md:items-center">
          <div className="w-full max-w-2xl rounded-md border bg-white p-5 shadow-lg">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {actionType === 'approve' ? 'อนุมัติคำขอ' : 'ปฏิเสธคำขอ'}
                </h3>
                <button
                  onClick={() => setShowActionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-md">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">ข้อมูลคำขอ</h4>
                  <p className="text-sm text-gray-600">
                    <strong>ชื่อโครงการ:</strong> {selectedRequest.project_title || 'ไม่ระบุ'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>นิสิต:</strong> {selectedRequest.student_name || 'ไม่ระบุ'}
                  </p>
                </div>

                {actionType === 'reject' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        เหตุผลที่ปฏิเสธ *
                      </label>
                      <textarea
                        value={actionData.rejection_reason}
                        onChange={(e) => setActionData(prev => ({ ...prev, rejection_reason: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="ระบุเหตุผลที่ปฏิเสธคำขอ"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ข้อเสนอแนะ (ไม่บังคับ)
                      </label>
                      <textarea
                        value={actionData.suggestion}
                        onChange={(e) => setActionData(prev => ({ ...prev, suggestion: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="ให้ข้อเสนอแนะเพื่อช่วยให้นิสิตปรับปรุง"
                      />
                    </div>
                  </>
                )}

                {actionType === 'approve' && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-800">
                      คุณกำลังจะอนุมัติคำขอนี้ เมื่ออนุมัติแล้ว คำขออื่นๆ ของนิสิตคนนี้จะถูกยกเลิกอัตโนมัติ
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowActionModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleActionSubmit}
                  disabled={isSubmitting || (actionType === 'reject' && !actionData.rejection_reason.trim())}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    actionType === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {isSubmitting ? 'กำลังดำเนินการ...' : (actionType === 'approve' ? 'อนุมัติ' : 'ปฏิเสธ')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
