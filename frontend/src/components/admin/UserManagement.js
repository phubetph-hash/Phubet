'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { handleError } from '@/lib/errorHandler';
import { formatDate } from '@/lib/utils';
import { USER_ROLE_LABELS } from '@/lib/constants';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, WARNING_MESSAGES } from '@/lib/errorMessages';
import { useNotifications } from '@/contexts/NotificationContext';

export default function UserManagement() {
  const router = useRouter();
  const { showToast } = useNotifications();
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    role: 'all',
    q: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(''); // 'delete', 'suspend', 'activate'
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Call the real API
      const params = { ...filters };
      const response = await apiClient.get('/api/admin/users/list', params);
      
      if (response.success) {
        setUsers(response.data || []);
      } else {
        throw new Error(response.message || 'Failed to load users');
      }
    } catch (error) {
      console.error('Load Users Error:', error);
      
      if (error.status === 401) {
        showToast({ message: ERROR_MESSAGES.ACCESS_DENIED, type: 'error' });
        window.location.href = '/login';
        return;
      }
      
      const errorMessage = handleError(error, 'Load Users');
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

  const handleViewDetail = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setActionType('delete');
    setShowActionModal(true);
  };

  const handleSuspend = (user) => {
    setSelectedUser(user);
    setActionType('suspend');
    setShowActionModal(true);
  };

  const handleActivate = (user) => {
    setSelectedUser(user);
    setActionType('activate');
    setShowActionModal(true);
  };

  const handleActionSubmit = async () => {
    if (!selectedUser) return;

    console.log('Selected User:', selectedUser);
    console.log('Action Type:', actionType);

    setIsSubmitting(true);
    
    try {
      let response;
      
      switch (actionType) {
        case 'delete':
          response = await apiClient.delete('/api/admin/users/delete', {
            user_id: selectedUser.user_id,
            role: selectedUser.role
          });
          break;
          
        case 'suspend':
          response = await apiClient.put('/api/admin/users/status', {
            user_id: selectedUser.user_id,
            role: selectedUser.role,
            status: 'suspended'
          });
          break;
          
        case 'activate':
          response = await apiClient.put('/api/admin/users/status', {
            user_id: selectedUser.user_id,
            role: selectedUser.role,
            status: 'active'
          });
          break;
          
        default:
          throw new Error('Invalid action type');
      }
      
      if (response.success) {
        showToast({ message: SUCCESS_MESSAGES.OPERATION_SUCCESS, type: 'success' });
        await loadUsers(); // Reload the users list
      } else {
        throw new Error(response.message || ERROR_MESSAGES.OPERATION_FAILED);
      }
      
      setShowActionModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('User Action Error:', error);
      
      if (error.status === 401) {
        showToast({ message: ERROR_MESSAGES.ACCESS_DENIED, type: 'error' });
        window.location.href = '/login';
      } else if (error.message === 'Invalid JSON input') {
        showToast({ message: ERROR_MESSAGES.INVALID_INPUT, type: 'warning' });
      } else {
        const errorMessage = handleError(error, 'User Action');
        showToast({ message: errorMessage, type: 'error' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const colorClass = status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    const text = status === 'active' ? 'ใช้งานได้' : 'ถูกระงับ';
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {text}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const colorClass = {
      student: 'bg-blue-100 text-blue-800',
      advisor: 'bg-green-100 text-green-800',
      administrator: 'bg-purple-100 text-purple-800',
    }[role] || 'bg-gray-100 text-gray-800';
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {USER_ROLE_LABELS[role] || role}
      </span>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium mb-2">เกิดข้อผิดพลาด</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={() => loadUsers()}
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
              <h1 className="text-2xl font-bold text-gray-900">จัดการผู้ใช้งาน</h1>
              <p className="text-gray-600">จัดการบัญชีนิสิต, อาจารย์ที่ปรึกษา, และผู้ดูแลระบบ</p>
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
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">ตัวกรอง</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ประเภทผู้ใช้งาน
              </label>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">ทั้งหมด</option>
                <option value="student">นิสิต</option>
                <option value="advisor">อาจารย์ที่ปรึกษา</option>
                <option value="administrator">ผู้ดูแลระบบ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ค้นหา
              </label>
              <input
                type="text"
                placeholder="ชื่อ, นามสกุล, อีเมล..."
                value={filters.q}
                onChange={(e) => handleFilterChange('q', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              ผู้ใช้งานทั้งหมด ({users.length} คน)
            </h3>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">ไม่พบผู้ใช้งาน</h3>
              <p className="mt-1 text-sm text-gray-500">ลองปรับเปลี่ยนตัวกรองการค้นหา</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ผู้ใช้งาน
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ประเภท
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      สถานะ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      วันที่สมัคร
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      การดำเนินการ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user, index) => (
                    <tr key={`${user.email}-${index}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            {user.role === 'student' && user.student_id && (
                              <div className="text-xs text-gray-400">รหัสนิสิต: {user.student_id}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewDetail(user)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            ดู
                          </button>
                          {user.status === 'active' ? (
                            <button
                              onClick={() => handleSuspend(user)}
                              className="text-red-600 hover:text-red-900"
                            >
                              ระงับ
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivate(user)}
                              className="text-green-600 hover:text-green-900"
                            >
                              เปิดใช้งาน
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(user)}
                            className="text-red-600 hover:text-red-900"
                          >
                            ลบ
                          </button>
                        </div>
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
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-600/50 p-4 md:items-center">
          <div className="w-full max-w-2xl rounded-md border bg-white p-5 shadow-lg">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">รายละเอียดผู้ใช้งาน</h3>
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
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">ชื่อ-นามสกุล</dt>
                    <dd className="text-sm text-gray-900">{selectedUser.first_name} {selectedUser.last_name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">อีเมล</dt>
                    <dd className="text-sm text-gray-900">{selectedUser.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">ประเภท</dt>
                    <dd className="text-sm text-gray-900">{getRoleBadge(selectedUser.role)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">สถานะ</dt>
                    <dd className="text-sm text-gray-900">{getStatusBadge(selectedUser.status)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">วันที่สมัคร</dt>
                    <dd className="text-sm text-gray-900">{formatDate(selectedUser.created_at)}</dd>
                  </div>
                </div>

                {selectedUser.role === 'student' && (
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-md font-medium text-gray-900 mb-2">ข้อมูลการศึกษา</h4>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">รหัสนิสิต</dt>
                        <dd className="text-sm text-gray-900">{selectedUser.student_id || 'ไม่ระบุ'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">คณะ</dt>
                        <dd className="text-sm text-gray-900">{selectedUser.faculty_name || 'ไม่ระบุ'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">ภาควิชา</dt>
                        <dd className="text-sm text-gray-900">{selectedUser.department_name || 'ไม่ระบุ'}</dd>
                      </div>
                    </div>
                  </div>
                )}

                {selectedUser.role === 'advisor' && (
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-md font-medium text-gray-900 mb-2">ข้อมูลทางวิชาการ</h4>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">ตำแหน่งทางวิชาการ</dt>
                        <dd className="text-sm text-gray-900">{selectedUser.academic_rank_name || 'ไม่ระบุ'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">คณะ</dt>
                        <dd className="text-sm text-gray-900">{selectedUser.faculty_name || 'ไม่ระบุ'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">ภาควิชา</dt>
                        <dd className="text-sm text-gray-900">{selectedUser.department_name || 'ไม่ระบุ'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">จำนวนนิสิตที่รับได้</dt>
                        <dd className="text-sm text-gray-900">{selectedUser.capacity || 0}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">นิสิตปัจจุบัน</dt>
                        <dd className="text-sm text-gray-900">{selectedUser.current_students || 0}</dd>
                      </div>
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
      {showActionModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-600/50 p-4 md:items-center">
          <div className="w-full max-w-md rounded-md border bg-white p-5 shadow-lg">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {actionType === 'delete' && 'ลบผู้ใช้งาน'}
                  {actionType === 'suspend' && 'ระงับผู้ใช้งาน'}
                  {actionType === 'activate' && 'เปิดใช้งานผู้ใช้งาน'}
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
                  <h4 className="text-sm font-medium text-gray-900 mb-2">ข้อมูลผู้ใช้งาน</h4>
                  <p className="text-sm text-gray-600">
                    <strong>ชื่อ:</strong> {selectedUser.first_name} {selectedUser.last_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>อีเมล:</strong> {selectedUser.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>ประเภท:</strong> {USER_ROLE_LABELS[selectedUser.role]}
                  </p>
                </div>

                {actionType === 'delete' && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">
                      คุณแน่ใจหรือไม่ที่จะลบผู้ใช้งานนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้
                    </p>
                  </div>
                )}

                {actionType === 'suspend' && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">
                      ผู้ใช้งานจะไม่สามารถเข้าสู่ระบบได้จนกว่าจะเปิดใช้งานใหม่
                    </p>
                  </div>
                )}

                {actionType === 'activate' && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-800">
                      ผู้ใช้งานจะสามารถเข้าสู่ระบบได้ปกติ
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
                  disabled={isSubmitting}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors disabled:opacity-50 ${
                    actionType === 'delete' || actionType === 'suspend'
                      ? 'bg-red-600 hover:bg-red-700'
                      : actionType === 'activate'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isSubmitting ? 'กำลังดำเนินการ...' : 'ยืนยัน'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
