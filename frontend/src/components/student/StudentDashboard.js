'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import LogoutButton from '@/components/common/LogoutButton';
import NotificationBell from '@/components/common/NotificationBell';
import apiClient from '@/lib/api';
import { handleError } from '@/lib/errorHandler';
import { formatDate, getRelativeTime } from '@/lib/utils';
import { REQUEST_STATUS, REQUEST_STATUS_COLORS } from '@/lib/constants';

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserDataCallback = useCallback(() => {
    loadUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboardDataCallback = useCallback(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    loadUserDataCallback();
    loadDashboardDataCallback();
  }, [loadUserDataCallback, loadDashboardDataCallback]);

  const loadUserData = () => {
    const userData = localStorage.getItem('advisor_system_user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push('/login');
    }
  };

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load student profile
      const profileResponse = await apiClient.get('/api/students/get');
      
      // Update user state with profile data
      if (profileResponse.success && profileResponse.data) {
        setUser(prev => ({
          ...prev,
          name: `${profileResponse.data.first_name} ${profileResponse.data.last_name}`,
          firstName: profileResponse.data.first_name,
          lastName: profileResponse.data.last_name,
          prefix: profileResponse.data.prefix
        }));
      }
      
      // Load recent requests
      const requestsResponse = await apiClient.get('/api/requests/list?limit=5');
      
      if (requestsResponse.success) {
        setRecentRequests(requestsResponse.data);
        
        // Calculate stats
        const requests = requestsResponse.data;
        const stats = {
          totalRequests: requests.length,
          pendingRequests: requests.filter(r => r.status === 'รอดำเนินการ').length,
          approvedRequests: requests.filter(r => r.status === 'อนุมัติ').length,
          rejectedRequests: requests.filter(r => r.status === 'ปฏิเสธ').length,
        };
        setStats(stats);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
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
              <h1 className="text-2xl font-bold text-gray-900">แดชบอร์ด</h1>
              <p className="text-gray-600">สวัสดี, {user?.name}</p>
            </div>
            <div className="flex space-x-4 items-center">
              <button
                onClick={() => router.push('/student/create-request')}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                ส่งคำขอใหม่
              </button>
              <button
                onClick={() => router.push('/student/advisors')}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                ค้นหาอาจารย์
              </button>
              <button
                onClick={() => router.push('/student/requests')}
                className="bg-white text-indigo-600 border border-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-50 transition-colors"
              >
                ดูคำขอของฉัน
              </button>
              <NotificationBell />
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                <p className="text-2xl font-semibold text-gray-900">{stats.totalRequests}</p>
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
                <p className="text-sm font-medium text-gray-500">รอดำเนินการ</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingRequests}</p>
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
                <p className="text-sm font-medium text-gray-500">อนุมัติ</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.approvedRequests}</p>
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
                <p className="text-sm font-medium text-gray-500">ปฏิเสธ</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.rejectedRequests}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Requests */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">คำขอล่าสุด</h3>
          </div>
          <div className="overflow-hidden">
            {recentRequests.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">ยังไม่มีคำขอ</h3>
                <p className="mt-1 text-sm text-gray-500">เริ่มต้นด้วยการส่งคำขอหาอาจารย์ที่ปรึกษา</p>
                <div className="mt-6 space-x-4">
                  <button
                    onClick={() => router.push('/student/create-request')}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    ส่งคำขอใหม่
                  </button>
                  <button
                    onClick={() => router.push('/student/advisors')}
                    className="inline-flex items-center px-4 py-2 border border-indigo-600 shadow-sm text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
                  >
                    ค้นหาอาจารย์
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        อาจารย์ที่ปรึกษา
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ชื่อโครงการ
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
                    {recentRequests.map((request) => (
                      <tr key={request.request_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                                <span className="text-sm font-medium text-white">
                                  {request.advisor_name ? request.advisor_name.charAt(0) : 'A'}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {request.advisor_name || 'ไม่ระบุ'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {request.advisor_title || 'อาจารย์'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 truncate max-w-xs">
                            {request.project_title || 'ไม่ระบุ'}
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
                            onClick={() => router.push(`/student/requests`)}
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

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">การดำเนินการด่วน</h3>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/student/create-request')}
                className="w-full text-left p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">ส่งคำขอใหม่</span>
                </div>
              </button>
              <button
                onClick={() => router.push('/student/advisors')}
                className="w-full text-left p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">ค้นหาอาจารย์ที่ปรึกษา</span>
                </div>
              </button>
              <button
                onClick={() => router.push('/student/requests')}
                className="w-full text-left p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">ดูคำขอของฉัน</span>
                </div>
              </button>
              <button
                onClick={() => router.push('/profile')}
                className="w-full text-left p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">จัดการโปรไฟล์</span>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">ข้อมูลสำคัญ</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">คำขอที่รอดำเนินการ:</span>
                <span className="text-sm font-medium text-gray-900">{stats.pendingRequests}/5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">คำขอที่อนุมัติ:</span>
                <span className="text-sm font-medium text-gray-900">{stats.approvedRequests}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">คำขอที่ปฏิเสธ:</span>
                <span className="text-sm font-medium text-gray-900">{stats.rejectedRequests}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
