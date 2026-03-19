'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '@/lib/api';
import InAppToast from '@/components/common/InAppToast';
import ConfirmModal from '@/components/common/ConfirmModal';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [authKey, setAuthKey] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [modal, setModal] = useState(null);

  const getStoredAuthKey = () => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('advisor_system_user');
      if (!raw) return null;
      const user = JSON.parse(raw);
      if (!user?.id || !user?.role) return null;
      return `${user.role}:${user.id}`;
    } catch (_) {
      return null;
    }
  };

  useEffect(() => {
    const syncAuthKey = () => {
      setAuthKey(getStoredAuthKey());
    };

    syncAuthKey();
    window.addEventListener('auth-changed', syncAuthKey);
    window.addEventListener('storage', syncAuthKey);

    return () => {
      window.removeEventListener('auth-changed', syncAuthKey);
      window.removeEventListener('storage', syncAuthKey);
    };
  }, []);

  const dismissToast = (toastId) => {
    setToasts(prev => prev.filter(toast => toast.id !== toastId));
  };

  const dismissModal = () => {
    setModal(null);
  };

  const showModal = ({ title, message, type = 'info', actions = [] }) => {
    setModal({ title, message, type, actions });
  };

  const showToast = ({ title, message, type = 'info', duration = 4000, actions = [] }) => {
    const toastId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const toast = { id: toastId, title, message, type, actions };

    setToasts(prev => [...prev, toast].slice(-4));

    if (duration > 0) {
      window.setTimeout(() => {
        dismissToast(toastId);
      }, duration);
    }
  };

  useEffect(() => {
    // Prevent cross-account notification leakage in client state.
    setNotifications([]);
    setUnreadCount(0);
    setToasts([]);

    if (!authKey) {
      setIsLoading(false);
      return;
    }

    loadNotifications();

    const interval = setInterval(() => {
      checkForNewNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [authKey]);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      
      // Call real API to get notifications
      const response = await apiClient.get('/api/notifications/list');
      
      if (response.success) {
        // Ensure unique notifications by id
        const notifData = response.data || [];
        const uniqueMap = new Map();
        notifData.forEach(n => {
          if (!uniqueMap.has(n.id)) {
            uniqueMap.set(n.id, n);
          }
        });
        
        setNotifications(Array.from(uniqueMap.values()));
        setUnreadCount(response.unreadCount || 0);
      } else {
        // Fallback to empty array if API fails
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      // Handle 401 specifically - clear stale auth data
      if (error.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('advisor_system_user');
          window.dispatchEvent(new Event('auth-changed'));
        }
        setAuthKey(null);
      } else {
        console.error('Error loading notifications:', error);
      }
      
      // Set empty state on error
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const checkForNewNotifications = async () => {
    try {
      // Check for new unread notifications
      const response = await apiClient.get('/api/notifications/list?unread_only=true&limit=10');
      
      if (response.success) {
        const newNotifications = response.data || [];

        let newestItem = null;
        let hasNew = false;

        // Use latest state to avoid stale closure when polling.
        setNotifications(prev => {
          const existingIds = new Set(prev.map(n => n.id));
          const genuinelyNew = newNotifications.filter(n => !existingIds.has(n.id));
          hasNew = genuinelyNew.length > 0;
          newestItem = genuinelyNew[0] || null;

          if (!hasNew) {
            return prev;
          }

          const combined = [...genuinelyNew, ...prev];
          const uniqueMap = new Map();
          combined.forEach(n => {
            if (!uniqueMap.has(n.id)) {
              uniqueMap.set(n.id, n);
            }
          });
          return Array.from(uniqueMap.values());
        });

        if (hasNew) {
          setUnreadCount(response.unreadCount || 0);

          if (newestItem) {
            showToast({
              title: newestItem.title || 'การแจ้งเตือนใหม่',
              message: newestItem.message || 'มีรายการแจ้งเตือนใหม่',
              type: 'info',
            });
          }
        }
      }
    } catch (error) {
      // Handle 401 silently - session expired during polling
      if (error.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('advisor_system_user');
          window.dispatchEvent(new Event('auth-changed'));
        }
        setAuthKey(null);
      } else {
        console.error('Error checking for new notifications:', error);
      }
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      // Optimistically update UI
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Call API to mark as read
      await apiClient.patch('/api/notifications/mark-read', {
        notification_id: notificationId
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Reload notifications to sync with server
      loadNotifications();
    }
  };

  const markAllAsRead = async () => {
    try {
      // Optimistically update UI
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      setUnreadCount(0);
      
      // Call API to mark all as read
      await apiClient.patch('/api/notifications/mark-read', {
        mark_all: true
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Reload notifications to sync with server
      loadNotifications();
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const notification = notifications.find(n => n.id === notificationId);
      
      // Optimistically update UI
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      // Call API to delete
      await apiClient.delete(`/api/notifications/delete?id=${notificationId}`);
    } catch (error) {
      if (error?.status === 404) {
        // Item may already be deleted by another refresh/session; keep UI state.
        return;
      }
      console.error('Error deleting notification:', error);
      // Reload notifications to sync with server
      loadNotifications();
    }
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      isRead: false,
      createdAt: new Date().toISOString(),
      actionUrl: null,
      metadata: {},
      ...notification,
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    showToast({
      title: newNotification.title || 'การแจ้งเตือนใหม่',
      message: newNotification.message || 'มีรายการแจ้งเตือนใหม่',
      type: 'info',
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'request_approved':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'request_rejected':
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'new_request':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'system_maintenance':
        return (
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'profile_updated':
        return (
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const value = {
    notifications,
    unreadCount,
    isLoading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    getNotificationIcon,
    showToast,
    showModal,
    dismissModal,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-3">
        {toasts.map(toast => (
          <InAppToast key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>
      {modal && <ConfirmModal modal={modal} onDismiss={dismissModal} />}
    </NotificationContext.Provider>
  );
};