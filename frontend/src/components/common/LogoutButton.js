'use client';

import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { useNotifications } from '@/contexts/NotificationContext';

export default function LogoutButton({ className = '' }) {
  const router = useRouter();
  const { showModal } = useNotifications();

  const handleConfirmLogout = async () => {
    try {
      await apiClient.post('/api/auth/logout', {});
    } catch (_) {
      // Continue local cleanup even if server logout fails.
    }

    try {
      localStorage.removeItem('advisor_system_user');
    } catch (_) {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth-changed'));
    }

    router.push('/login');
  };

  const handleLogout = () => {
    showModal({
      title: 'ยืนยันการออกจากระบบ',
      message: 'คุณต้องการออกจากระบบหรือไม่?',
      type: 'warning',
      actions: [
        {
          label: 'ออกจากระบบ',
          variant: 'danger',
          onClick: handleConfirmLogout,
        },
        {
          label: 'ยกเลิก',
          variant: 'secondary',
          onClick: () => {}, // Just close the modal
        },
      ],
    });
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={`inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded ${className}`}
    >
      ออกจากระบบ
    </button>
  );
}


