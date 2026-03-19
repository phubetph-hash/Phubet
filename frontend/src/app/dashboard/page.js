'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StudentDashboard from '@/components/student/StudentDashboard';
import { USER_ROLES } from '@/lib/constants';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('advisor_system_user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Redirect based on role
      switch (parsedUser.role) {
        case USER_ROLES.STUDENT:
          // Stay on this page (Student Dashboard)
          break;
        case USER_ROLES.ADVISOR:
          router.push('/advisor/dashboard');
          break;
        case USER_ROLES.ADMIN:
          router.push('/admin/dashboard');
          break;
        default:
          router.push('/login');
      }
    } else {
      router.push('/login');
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  // Only show Student Dashboard for students
  if (user.role === USER_ROLES.STUDENT) {
    return <StudentDashboard />;
  }

  return null; // Will redirect to appropriate dashboard
}