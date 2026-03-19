'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StudentProfile from '@/components/student/StudentProfile';
import AdvisorProfile from '@/components/advisor/AdvisorProfile';

export default function ProfilePage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('advisor_system_user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserRole(user.role);
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

  // Render appropriate profile component based on user role
  if (userRole === 'student') {
    return <StudentProfile />;
  } else if (userRole === 'advisor') {
    return <AdvisorProfile />;
  } else {
    // For admin or other roles, redirect to appropriate dashboard
    router.push('/admin/dashboard');
    return null;
  }
}