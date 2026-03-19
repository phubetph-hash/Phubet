'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LogoutButton from '@/components/common/LogoutButton';
import NotificationBell from '@/components/common/NotificationBell';
import apiClient from '@/lib/api';
import { handleError } from '@/lib/errorHandler';
import { formatDate, getRelativeTime } from '@/lib/utils';
import { REQUEST_STATUS, REQUEST_STATUS_COLORS } from '@/lib/constants';

export default function AdvisorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    currentStudents: 0,
    availableCapacity: 0,
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
    loadDashboardData();
  }, []);

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
      
      // Load advisor profile (no ID needed, will use session)
      const profileResponse = await apiClient.get('/api/advisors/get');
      if (profileResponse.success) {
        setProfile(profileResponse.data);
      }
      
      // Load recent requests (will auto-filter by advisor_id from session)
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
          currentStudents: profileResponse.data?.current_students || 0,
          availableCapacity: profileResponse.data?.available_capacity || 0,
        };
        setStats(stats);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // If authentication fails, redirect to login
      if (error.message?.includes('authenticated') || error.message?.includes('id is required')) {
        router.push('/login');
      }
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

  const getCapacityPercentage = () => {
    if (!profile) return 0;
    return Math.round((profile.current_students / profile.capacity) * 100);
  };

  const getCapacityColor = () => {
    const percentage = getCapacityPercentage();
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
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
              <h1 className="text-2xl font-bold text-gray-900">แดชบอร์ดอาจารย์ที่ปรึกษา</h1>
              <p className="text-gray-600">สวัสดี, {profile?.academic_rank_name} {profile?.first_name} {profile?.last_name}</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/advisor/requests')}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                จัดการคำขอ
              </button>
              <button
                onClick={() => router.push('/advisor/profile')}
                className="bg-white text-indigo-600 border border-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-50 transition-colors"
              >
                จัดการโปรไฟล์
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
          {/* Total Requests */}
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

          {/* Pending Requests */}
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

          {/* Current Students */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">นิสิตปัจจุบัน</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.currentStudents}</p>
              </div>
            </div>
          </div>

          {/* Available Capacity */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">ว่างรับ</p>
                <p className={`text-2xl font-semibold ${getCapacityColor()}`}>{stats.availableCapacity}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Capacity Overview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">ภาพรวมการรับนิสิต</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">จำนวนนิสิตปัจจุบัน</span>
                <span className="text-sm font-medium text-gray-900">
                  {profile?.current_students || 0} / {profile?.capacity || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${getCapacityPercentage()}%`
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>0</span>
                <span className={getCapacityColor()}>{getCapacityPercentage()}%</span>
                <span>{profile?.capacity || 0}</span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">ว่างรับ:</span>
                  <span className={`text-sm font-medium ${getCapacityColor()}`}>
                    {profile?.available_capacity || 0} คน
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Requests */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">คำขอล่าสุด</h3>
              <button
                onClick={() => router.push('/advisor/requests')}
                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
              >
                ดูทั้งหมด
              </button>
            </div>
            
            {recentRequests.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">ยังไม่มีคำขอ</h3>
                <p className="mt-1 text-sm text-gray-500">คำขอใหม่จะแสดงที่นี่</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentRequests.map((request) => (
                  <div key={request.request_id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {request.project_title || 'ไม่ระบุชื่อโครงการ'}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          จาก: {request.student_name || 'ไม่ระบุ'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {getRelativeTime(request.created_at)}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">การดำเนินการด่วน</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/advisor/requests')}
              className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <svg className="w-6 h-6 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <div className="text-sm font-medium text-gray-900">จัดการคำขอ</div>
                  <div className="text-xs text-gray-500">อนุมัติ/ปฏิเสธคำขอ</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push('/advisor/profile')}
              className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <svg className="w-6 h-6 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div>
                  <div className="text-sm font-medium text-gray-900">จัดการโปรไฟล์</div>
                  <div className="text-xs text-gray-500">แก้ไขข้อมูลส่วนตัว</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push('/advisor/students')}
              className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <svg className="w-6 h-6 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <div>
                  <div className="text-sm font-medium text-gray-900">นิสิตที่ปรึกษา</div>
                  <div className="text-xs text-gray-500">ดูรายชื่อนิสิต</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
