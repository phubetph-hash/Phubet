'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/contexts/NotificationContext';
import { formatDate, getRelativeTime } from '@/lib/utils';

export default function NotificationsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterRead, setFilterRead] = useState('all');
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getNotificationIcon,
  } = useNotifications();

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [notifications, filterType, filterRead]);

  const loadUserData = () => {
    const userData = localStorage.getItem('advisor_system_user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push('/login');
    }
  };

  const filterNotifications = () => {
    let filtered = [...notifications];

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(n => n.type === filterType);
    }

    // Filter by read status
    if (filterRead === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    } else if (filterRead === 'read') {
      filtered = filtered.filter(n => n.isRead);
    }

    setFilteredNotifications(filtered);
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const getTypeLabel = (type) => {
    const typeLabels = {
      'request_approved': 'อนุมัติคำขอ',
      'request_rejected': 'ปฏิเสธคำขอ',
      'new_request': 'คำขอใหม่',
      'system_maintenance': 'บำรุงรักษาระบบ',
      'profile_updated': 'อัปเดตโปรไฟล์',
      'system_info': 'ข้อมูลระบบ',
    };
    return typeLabels[type] || type;
  };

  const getTypeBadge = (type) => {
    const typeColors = {
      'request_approved': 'bg-green-100 text-green-800',
      'request_rejected': 'bg-red-100 text-red-800',
      'new_request': 'bg-blue-100 text-blue-800',
      'system_maintenance': 'bg-yellow-100 text-yellow-800',
      'profile_updated': 'bg-purple-100 text-purple-800',
      'system_info': 'bg-gray-100 text-gray-800',
    };
    
    const colorClass = typeColors[type] || 'bg-gray-100 text-gray-800';
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {getTypeLabel(type)}
      </span>
    );
  };

  const clearFilters = () => {
    setFilterType('all');
    setFilterRead('all');
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
              <h1 className="text-2xl font-bold text-gray-900">การแจ้งเตือน</h1>
              <p className="text-gray-600">
                ดูการแจ้งเตือนทั้งหมด {unreadCount > 0 && `(${unreadCount} รายการใหม่)`}
              </p>
            </div>
            <div className="flex space-x-4">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  อ่านทั้งหมด
                </button>
              )}
              <button
                onClick={() => router.back()}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                กลับ
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">ตัวกรอง</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                ล้างตัวกรอง
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ประเภทการแจ้งเตือน
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="request_approved">อนุมัติคำขอ</option>
                  <option value="request_rejected">ปฏิเสธคำขอ</option>
                  <option value="new_request">คำขอใหม่</option>
                  <option value="system_maintenance">บำรุงรักษาระบบ</option>
                  <option value="profile_updated">อัปเดตโปรไฟล์</option>
                  <option value="system_info">ข้อมูลระบบ</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  สถานะการอ่าน
                </label>
                <select
                  value={filterRead}
                  onChange={(e) => setFilterRead(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="unread">ยังไม่อ่าน</option>
                  <option value="read">อ่านแล้ว</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              การแจ้งเตือนทั้งหมด ({filteredNotifications.length} รายการ)
            </h3>
          </div>

          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {filterType !== 'all' || filterRead !== 'all' 
                  ? 'ไม่พบการแจ้งเตือนที่ตรงกับเงื่อนไข' 
                  : 'ไม่มีการแจ้งเตือน'
                }
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {filterType !== 'all' || filterRead !== 'all' 
                  ? 'ลองปรับเปลี่ยนตัวกรองการค้นหา'
                  : 'การแจ้งเตือนใหม่จะแสดงที่นี่'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification, index) => (
                <div
                  key={`notification-${notification.id}-${index}`}
                  className={`p-6 hover:bg-gray-50 cursor-pointer border-l-4 transition-colors ${
                    notification.isRead 
                      ? 'border-transparent' 
                      : 'border-indigo-500 bg-indigo-50'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className={`text-lg font-medium ${
                            notification.isRead ? 'text-gray-700' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </h4>
                          {getTypeBadge(notification.type)}
                        </div>
                        
                        <p className={`text-sm mb-3 ${
                          notification.isRead ? 'text-gray-600' : 'text-gray-800'
                        }`}>
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{formatDate(notification.createdAt)}</span>
                            <span>•</span>
                            <span>{getRelativeTime(notification.createdAt)}</span>
                            {!notification.isRead && (
                              <>
                                <span>•</span>
                                <div className="flex items-center">
                                  <div className="w-2 h-2 bg-indigo-600 rounded-full mr-1"></div>
                                  <span className="text-indigo-600 font-medium">ใหม่</span>
                                </div>
                              </>
                            )}
                          </div>
                          
                          {notification.actionUrl && (
                            <span className="text-sm text-indigo-600 font-medium">
                              คลิกเพื่อดูรายละเอียด →
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-6 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="ลบการแจ้งเตือน"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
              <h3 className="text-lg font-medium text-blue-900">เกี่ยวกับการแจ้งเตือน</h3>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• การแจ้งเตือนจะถูกส่งเมื่อมีการเปลี่ยนแปลงสถานะคำขอ</li>
                <li>• คุณจะได้รับการแจ้งเตือนเมื่อมีคำขอใหม่หรือการอัปเดตโปรไฟล์</li>
                <li>• ระบบจะแจ้งเตือนเกี่ยวกับการบำรุงรักษาและการอัปเดต</li>
                <li>• การแจ้งเตือนที่ไม่ได้อ่านจะมีสีเน้นเพื่อให้เห็นได้ชัดเจน</li>
                <li>• คุณสามารถลบการแจ้งเตือนที่ไม่ต้องการได้</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}