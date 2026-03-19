'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { handleError } from '@/lib/errorHandler';
import { formatDate } from '@/lib/utils';

export default function AdvisorStudents() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeRequests: 0,
    completedProjects: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [markingComplete, setMarkingComplete] = useState(null);

  useEffect(() => {
    loadUserData();
    loadStudentsData();
  }, []);

  const loadUserData = () => {
    const userData = localStorage.getItem('advisor_system_user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push('/login');
    }
  };

  const loadStudentsData = async () => {
    try {
      setIsLoading(true);

      // Load all approved and completed requests to get students
      const [approvedResponse, completedResponse] = await Promise.all([
        apiClient.get('/api/requests/list?status=อนุมัติ'),
        apiClient.get('/api/requests/list?status=เสร็จสิ้น')
      ]);
      
      if (approvedResponse.success || completedResponse.success) {
        const approvedRequests = approvedResponse.success ? approvedResponse.data : [];
        const completedRequests = completedResponse.success ? completedResponse.data : [];
        const allRequests = [...approvedRequests, ...completedRequests];
        
        // Group requests by student
        const studentMap = new Map();
        allRequests.forEach(request => {
          if (!studentMap.has(request.student_id)) {
            studentMap.set(request.student_id, {
              student_id: request.student_id,
              student_name: request.student_name,
              projects: [],
              latest_request_date: request.created_at,
              total_projects: 0,
            });
          }
          
          const student = studentMap.get(request.student_id);
          student.projects.push(request);
          student.total_projects++;
          
          // Update latest request date
          if (new Date(request.created_at) > new Date(student.latest_request_date)) {
            student.latest_request_date = request.created_at;
          }
        });

        const studentsArray = Array.from(studentMap.values());
        setStudents(studentsArray);
        
        // Calculate stats
        setStats({
          totalStudents: studentsArray.length,
          activeRequests: approvedRequests.length,
          completedProjects: completedRequests.length,
        });
      }
    } catch (error) {
      const errorMessage = handleError(error, 'Load Students');
      console.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.student_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedStatus === 'all') {
      return matchesSearch;
    }
    
    return matchesSearch && student.projects.some(p => p.status === selectedStatus);
  });

  const getStatusBadge = (status) => {
    const statusColors = {
      'อนุมัติ': 'bg-green-100 text-green-800',
      'เสร็จสิ้น': 'bg-blue-100 text-blue-800',
      'ยกเลิก': 'bg-red-100 text-red-800',
    };
    
    const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800';
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {status}
      </span>
    );
  };

  const handleMarkComplete = async (requestId) => {
    try {
      setMarkingComplete(requestId);
      const response = await apiClient.post(`/api/requests/mark-complete?id=${requestId}`);
      
      if (response.success) {
        // Reset filter to show all projects so user can see the completed one
        setSelectedStatus('all');
        // Reload students data
        await loadStudentsData();
      }
    } catch (error) {
      const errorMessage = handleError(error, 'Mark Complete');
      console.error(errorMessage);
    } finally {
      setMarkingComplete(null);
    }
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
              <h1 className="text-2xl font-bold text-gray-900">นิสิตที่ปรึกษา</h1>
              <p className="text-gray-600">รายชื่อนิสิตที่อยู่ภายใต้การดูแล</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/advisor/requests')}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                จัดการคำขอ
              </button>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">นิสิตทั้งหมด</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">โครงงานที่กำลังดำเนินการ</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeRequests}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">โครงงานที่เสร็จสิ้น</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.completedProjects}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ค้นหานิสิต
                </label>
                <input
                  type="text"
                  placeholder="ค้นหาชื่อหรือรหัสนิสิต..."
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
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="อนุมัติ">กำลังดำเนินการ</option>
                  <option value="เสร็จสิ้น">เสร็จสิ้นแล้ว</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              รายชื่อนิสิต ({filteredStudents.length} คน)
            </h3>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">ยังไม่มีนิสิต</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'ไม่พบนิสิตที่ตรงกับการค้นหา' : 'ยังไม่มีนิสิตที่อยู่ภายใต้การดูแล'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <div key={student.student_id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">
                            {student.student_name}
                          </h4>
                          <p className="text-sm text-gray-500">รหัส: {student.student_id}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">
                          โครงงาน ({student.total_projects} โครงงาน)
                        </h5>
                        <div className="space-y-2">
                          {student.projects.map((project) => (
                            <div key={project.request_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {project.project_title || 'ไม่ระบุชื่อโครงงาน'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  วันที่ส่งคำขอ: {formatDate(project.created_at)}
                                </p>
                              </div>
                              <div className="ml-4 flex items-center space-x-2">
                                <div>
                                  {getStatusBadge(project.status)}
                                </div>
                                {project.status === 'อนุมัติ' && (
                                  <button
                                    onClick={() => handleMarkComplete(project.request_id)}
                                    disabled={markingComplete === project.request_id}
                                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
                                  >
                                    {markingComplete === project.request_id ? 'กำลัง...' : 'เสร็จสิ้น'}
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-6 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">ครั้งล่าสุด</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(student.latest_request_date)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Card */}
        {filteredStudents.length > 0 && (
          <div className="mt-8 bg-indigo-50 rounded-lg p-6">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-medium text-indigo-900">สรุปข้อมูล</h3>
                <p className="text-sm text-indigo-700 mt-1">
                  ปัจจุบันคุณดูแลนิสิตทั้งหมด {stats.totalStudents} คน 
                  มีโครงงานที่กำลังดำเนินการ {stats.activeRequests} โครงงาน 
                  และเสร็จสิ้นแล้ว {stats.completedProjects} โครงงาน
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}