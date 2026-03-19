'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { handleError } from '@/lib/errorHandler';
import { formatDate } from '@/lib/utils';

export default function AdminReports() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [selectedReport, setSelectedReport] = useState('overview');
  const [reportData, setReportData] = useState({});
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
    loadReportData();
  }, [selectedReport, dateRange]);

  const loadUserData = () => {
    const userData = localStorage.getItem('advisor_system_user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push('/login');
    }
  };

  const loadReportData = async () => {
    try {
      setIsLoading(true);
      
      // Load real report data from APIs
      const [usersRes, requestsRes, advisorsRes] = await Promise.all([
        apiClient.get('/api/admin/users/list?role=all'),
        apiClient.get('/api/requests/list?admin=true'),
        apiClient.get('/api/advisors/list')
      ]);
      
      // Calculate stats from real data
      const allUsers = usersRes.success ? usersRes.data : [];
      const allRequests = requestsRes.success ? requestsRes.data : [];
      const allAdvisors = advisorsRes.success ? advisorsRes.data : [];
      
      const students = allUsers.filter(u => u.role === 'student');
      const advisors = allUsers.filter(u => u.role === 'advisor');
      
      const reportData = {
        overview: {
          totalStudents: students.length,
          totalAdvisors: advisors.length,
          totalRequests: allRequests.length,
          pendingRequests: allRequests.filter(r => r.status === 'รอดำเนินการ').length,
          approvedRequests: allRequests.filter(r => r.status === 'อนุมัติ').length,
          rejectedRequests: allRequests.filter(r => r.status === 'ปฏิเสธ').length,
          requestsByMonth: generateMonthlyData(allRequests),
          topAdvisors: generateTopAdvisors(allRequests, allAdvisors.slice(0, 3)),
        },
        advisors: allAdvisors.map(advisor => ({
          advisor_id: advisor.advisor_id,
          name: `${advisor.academic_rank_name || ''} ${advisor.first_name || ''} ${advisor.last_name || ''}`.trim(),
          faculty: advisor.faculty_name || '-',
          department: advisor.department_name || '-',
          totalRequests: allRequests.filter(r => r.advisor_id === advisor.advisor_id).length,
          approvedRequests: allRequests.filter(r => r.advisor_id === advisor.advisor_id && r.status === 'อนุมัติ').length,
          rejectedRequests: allRequests.filter(r => r.advisor_id === advisor.advisor_id && r.status === 'ปฏิเสธ').length,
          currentStudents: advisor.current_students || 0,
          capacity: advisor.capacity || 0,
          approvalRate: calculateApprovalRate(allRequests.filter(r => r.advisor_id === advisor.advisor_id)),
        })),
        students: students.map(student => ({
          student_id: student.student_id || student.user_id,
          name: student.name || `${student.first_name || ''} ${student.last_name || ''}`.trim(),
          faculty: student.faculty_name || '-',
          program: student.program_name || '-',
          totalRequests: allRequests.filter(r => r.student_id === student.student_id).length,
          approvedRequests: allRequests.filter(r => r.student_id === student.student_id && r.status === 'อนุมัติ').length,
          rejectedRequests: allRequests.filter(r => r.student_id === student.student_id && r.status === 'ปฏิเสธ').length,
          currentAdvisor: getCurrentAdvisor(allRequests, student.student_id),
        })),
        faculties: generateFacultyData(students, allAdvisors, allRequests),
      };

      setReportData(reportData);
    } catch (error) {
      const errorMessage = handleError(error, 'Load Report Data');
      console.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions for report calculations
  const generateMonthlyData = (requests) => {
    const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const monthCounts = {};
    
    requests.forEach(request => {
      if (request.created_at) {
        const month = new Date(request.created_at).getMonth();
        const monthName = monthNames[month];
        monthCounts[monthName] = (monthCounts[monthName] || 0) + 1;
      }
    });
    
    return Object.entries(monthCounts).map(([month, count]) => ({ month, count }));
  };

  const generateTopAdvisors = (requests, advisors) => {
    return advisors.map(advisor => {
      const advisorRequests = requests.filter(r => r.advisor_id === advisor.advisor_id);
      const approvalRate = calculateApprovalRate(advisorRequests);
      return {
        name: `${advisor.academic_rank_name || ''} ${advisor.first_name || ''} ${advisor.last_name || ''}`.trim(),
        requestCount: advisorRequests.length,
        approvalRate: approvalRate
      };
    });
  };

  const calculateApprovalRate = (requests) => {
    if (requests.length === 0) return 0;
    const approved = requests.filter(r => r.status === 'อนุมัติ').length;
    return Math.round((approved / requests.length) * 100);
  };

  const getCurrentAdvisor = (requests, studentId) => {
    const approvedRequest = requests.find(r => r.student_id === studentId && r.status === 'อนุมัติ');
    return approvedRequest ? approvedRequest.advisor_name : '-';
  };

  const generateFacultyData = (students, advisors, requests) => {
    const facultyMap = {};

    const studentFacultyById = new Map(
      students.map(student => [student.student_id || student.user_id, student.faculty_name || 'ไม่ระบุคณะ'])
    );
    
    students.forEach(student => {
      const facultyName = student.faculty_name || 'ไม่ระบุคณะ';
      if (!facultyMap[facultyName]) {
        facultyMap[facultyName] = {
          faculty_name: facultyName,
          totalStudents: 0,
          totalAdvisors: 0,
          totalRequests: 0,
          approvedRequests: 0,
          rejectedRequests: 0,
          approvalRate: 0,
        };
      }

      facultyMap[facultyName].totalStudents++;
    });

    advisors.forEach(advisor => {
      const facultyName = advisor.faculty_name || 'ไม่ระบุคณะ';
      if (!facultyMap[facultyName]) {
        facultyMap[facultyName] = {
          faculty_name: facultyName,
          totalStudents: 0,
          totalAdvisors: 0,
          totalRequests: 0,
          approvedRequests: 0,
          rejectedRequests: 0,
          approvalRate: 0,
        };
      }

      facultyMap[facultyName].totalAdvisors++;
    });

    requests.forEach(request => {
      const facultyName = studentFacultyById.get(request.student_id) || 'ไม่ระบุคณะ';
      if (!facultyMap[facultyName]) {
        facultyMap[facultyName] = {
          faculty_name: facultyName,
          totalStudents: 0,
          totalAdvisors: 0,
          totalRequests: 0,
          approvedRequests: 0,
          rejectedRequests: 0,
          approvalRate: 0,
        };
      }

      facultyMap[facultyName].totalRequests++;
      if (request.status === 'อนุมัติ') {
        facultyMap[facultyName].approvedRequests++;
      } else if (request.status === 'ปฏิเสธ') {
        facultyMap[facultyName].rejectedRequests++;
      }
    });

    // Calculate approval rates
    Object.values(facultyMap).forEach(faculty => {
      if (faculty.totalRequests > 0) {
        faculty.approvalRate = Math.round((faculty.approvedRequests / faculty.totalRequests) * 100);
      }
    });

    return Object.values(facultyMap);
  };

  const renderOverviewReport = () => {
    const data = reportData.overview || {};
    
    return (
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-600">นิสิตทั้งหมด</p>
                <p className="text-2xl font-semibold text-blue-900">{data.totalStudents || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-600">อาจารย์ที่ปรึกษา</p>
                <p className="text-2xl font-semibold text-green-900">{data.totalAdvisors || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-indigo-600">คำขอทั้งหมด</p>
                <p className="text-2xl font-semibold text-indigo-900">{data.totalRequests || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-yellow-600">อัตราอนุมัติ</p>
                <p className="text-2xl font-semibold text-yellow-900">
                  {data.totalRequests ? Math.round((data.approvedRequests / data.totalRequests) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Requests by Month */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">คำขอรายเดือน</h3>
            <div className="space-y-3">
              {(data.requestsByMonth || []).map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-12 text-sm text-gray-600">{item.month}</div>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${(item.count / 25) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-8 text-sm text-gray-900">{item.count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Advisors */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">อาจารย์ที่ได้รับความนิยม</h3>
            <div className="space-y-4">
              {(data.topAdvisors || []).map((advisor, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-indigo-600">{index + 1}</span>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{advisor.name}</div>
                      <div className="text-xs text-gray-500">{advisor.requestCount} คำขอ</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">{advisor.approvalRate}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAdvisorsReport = () => {
    const data = reportData.advisors || [];
    
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">รายงานอาจารย์ที่ปรึกษา</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  อาจารย์
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  คำขอทั้งหมด
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  อนุมัติ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ปฏิเสธ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  อัตราอนุมัติ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  นิสิตปัจจุบัน/ความจุ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((advisor) => (
                <tr key={advisor.advisor_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{advisor.name}</div>
                    <div className="text-sm text-gray-500">{advisor.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {advisor.totalRequests}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {advisor.approvedRequests}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {advisor.rejectedRequests}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {advisor.approvalRate}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {advisor.currentStudents}/{advisor.capacity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderFacultiesReport = () => {
    const data = reportData.faculties || [];
    
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">รายงานตามคณะ</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  คณะ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  นิสิต
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  อาจารย์
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  คำขอทั้งหมด
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  อนุมัติ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  อัตราอนุมัติ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((faculty, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{faculty.faculty_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {faculty.totalStudents}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {faculty.totalAdvisors}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {faculty.totalRequests}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {faculty.approvedRequests}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${faculty.approvalRate}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="ml-2 text-sm text-gray-900">{faculty.approvalRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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
              <h1 className="text-2xl font-bold text-gray-900">รายงานและสถิติ</h1>
              <p className="text-gray-600">ดูรายงานและสถิติการใช้งานระบบ</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                กลับแดชบอร์ด
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              {/* Report Type Tabs */}
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                {[
                  { id: 'overview', label: 'ภาพรวม' },
                  { id: 'advisors', label: 'อาจารย์' },
                  { id: 'faculties', label: 'คณะ' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedReport(tab.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      selectedReport === tab.id
                        ? 'bg-white text-indigo-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Date Range */}
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    วันที่เริ่มต้น
                  </label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    วันที่สิ้นสุด
                  </label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="min-h-96">
          {selectedReport === 'overview' && renderOverviewReport()}
          {selectedReport === 'advisors' && renderAdvisorsReport()}
          {selectedReport === 'faculties' && renderFacultiesReport()}
        </div>
      </div>
    </div>
  );
}