'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { handleError } from '@/lib/errorHandler';
import { useNotifications } from '@/contexts/NotificationContext';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, WARNING_MESSAGES } from '@/lib/errorMessages';

export default function MasterDataManagement() {
  const router = useRouter();
  const { showToast, showModal } = useNotifications();
  const [activeTab, setActiveTab] = useState('faculties');
  const [data, setData] = useState({
    faculties: [],
    departments: [],
    programs: [],
    expertises: [],
    academic_terms: []
  });
  const [departmentsMap, setDepartmentsMap] = useState({});
  const [facultiesMap, setFacultiesMap] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // แสดง 10 รายการต่อหน้า

  // Auto-generate term names when year or term number changes
  useEffect(() => {
    loadData();
    setCurrentPage(1); // Reset to first page when changing tabs
  }, [activeTab]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const endpoint = `/api/helpers/${activeTab}`;
      const response = await apiClient.get(endpoint);

      if (response.success || response.status === 'ok') {
        setData(prev => ({
          ...prev,
          [activeTab]: response.data || []
        }));
      }

      // Load departments mapping if needed for programs tab
      if (activeTab === 'programs' && Object.keys(departmentsMap).length === 0) {
        const deptResponse = await apiClient.get('/api/helpers/departments');
        if (deptResponse.success || deptResponse.status === 'ok') {
          const mapping = {};
          deptResponse.data.forEach(dept => {
            mapping[dept.department_id] = dept.department_name_th;
          });
          setDepartmentsMap(mapping);
        }
      }

      // Load faculties mapping if needed for departments tab
      if (activeTab === 'departments' && Object.keys(facultiesMap).length === 0) {
        const facultiesResponse = await apiClient.get('/api/helpers/faculties');
        if (facultiesResponse.success || facultiesResponse.status === 'ok') {
          const mapping = {};
          facultiesResponse.data.forEach(faculty => {
            mapping[faculty.faculty_id] = faculty.faculty_name_th;
          });
          setFacultiesMap(mapping);
        }
      }
    } catch (error) {
      const errorMessage = handleError(error, 'Load Master Data');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({});
    setShowForm(true);
  };

  const handleEdit = async (item) => {
    setEditingItem(item);
    
    // Convert database format to form format for academic_terms
    if (activeTab === 'academic_terms') {
      // Convert "2567/2568" -> 2567 and "ต้น" -> 1
      const termMap = { 'ต้น': 1, 'ปลาย': 2, 'ฤดูร้อน': 3 };
      const academicYear = item.academic_year?.split('/')[0];
      const termNumber = termMap[item.term] || 1;
      
      setFormData({
        academic_term_id: item.academic_term_id,
        term_year: parseInt(academicYear) || 2567,
        term_number: termNumber
      });
    } else {
      setFormData(item);
    }
    
    // Load related data for dropdowns
    await loadRelatedData();
    
    setShowForm(true);
  };

  const loadRelatedData = async () => {
    try {
      // Load faculties for departments form
      if ((activeTab === 'departments' || activeTab === 'programs') && data.faculties.length === 0) {
        const facultiesResponse = await apiClient.get('/api/helpers/faculties');
        if (facultiesResponse.success || facultiesResponse.status === 'ok') {
          setData(prev => ({
            ...prev,
            faculties: facultiesResponse.data || []
          }));
        }
      }

      // Load departments for programs form
      if (activeTab === 'programs' && data.departments.length === 0) {
        const deptResponse = await apiClient.get('/api/helpers/departments');
        if (deptResponse.success || deptResponse.status === 'ok') {
          setData(prev => ({
            ...prev,
            departments: deptResponse.data || []
          }));
        }
      }
    } catch (error) {
      console.error('Error loading related data:', error);
    }
  };

  const executeDelete = async (item) => {
    try {
      let endpoint, idField;
      
      // Map tab names to API endpoints and ID fields  
      const tabMapping = {
        'faculties': { endpoint: 'faculty', idField: 'faculty_id' },
        'departments': { endpoint: 'department', idField: 'department_id' },
        'programs': { endpoint: 'program', idField: 'program_id' },
        'expertises': { endpoint: 'expertise', idField: 'expertise_id' },
        'academic_terms': { endpoint: 'academic_terms', idField: 'academic_term_id' }
      };
      
      const mapping = tabMapping[activeTab];
      endpoint = `/api/admin/master-data/${mapping.endpoint}`;
      idField = mapping.idField;
      
      // For academic_terms, send term_id instead of academic_term_id
      const deletePayload = activeTab === 'academic_terms'
        ? { term_id: item[idField] }
        : { [idField]: item[idField] };
      
      const response = await apiClient.request(endpoint, {
        method: 'DELETE',
        body: JSON.stringify(deletePayload)
      });
      
      if (response.success) {
        showToast({ message: SUCCESS_MESSAGES.ITEM_DELETED, type: 'success' });
        await loadData(); // Reload data
      } else {
        throw new Error(response.message || 'Failed to delete item');
      }
    } catch (error) {
      const errorMessage = handleError(error, 'Delete Item');
      // Show detailed error message for dependency issues
      if (error.message && (
          error.message.includes('cannot delete') || 
          error.message.includes('foreign key constraint') ||
          error.message.includes('Cannot delete or update a parent row')
        )) {
        const dependencyMessage = getDependencyMessage(activeTab, error.message);
        showToast({ message: dependencyMessage, type: 'error' });
      } else {
        showToast({ message: errorMessage, type: 'error' });
      }
    }
  };

  const handleDelete = (item) => {
    showModal({
      title: 'ยืนยันการลบ',
      message: WARNING_MESSAGES.DELETE_CONFIRM,
      type: 'warning',
      actions: [
        {
          label: 'ลบ',
          variant: 'danger',
          onClick: () => {
            void executeDelete(item);
          },
        },
        {
          label: 'ยกเลิก',
          variant: 'secondary',
          onClick: () => {},
        },
      ],
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    try {
      let endpoint, idField;
      
      // Map tab names to API endpoints and ID fields
      const tabMapping = {
        'faculties': { endpoint: 'faculty', idField: 'faculty_id' },
        'departments': { endpoint: 'department', idField: 'department_id' },
        'programs': { endpoint: 'program', idField: 'program_id' },
        'expertises': { endpoint: 'expertise', idField: 'expertise_id' },
        'academic_terms': { endpoint: 'academic_terms', idField: 'academic_term_id' }
      };
      
      const mapping = tabMapping[activeTab];
      endpoint = `/api/admin/master-data/${mapping.endpoint}`;
      idField = mapping.idField;
      
      let response;
      if (editingItem) {
        // Update existing item
        // For academic_terms, send term_id instead of academic_term_id
        const payload = activeTab === 'academic_terms' 
          ? { term_id: editingItem[idField], ...formData }
          : { [idField]: editingItem[idField], ...formData };
          
        response = await apiClient.put(endpoint, payload);
      } else {
        // Create new item
        response = await apiClient.post(endpoint, formData);
      }
      
      if (response.success) {
        showToast({ message: editingItem ? SUCCESS_MESSAGES.ITEM_UPDATED : SUCCESS_MESSAGES.ITEM_CREATED, type: 'success' });
        await loadData(); // Reload data
        setShowForm(false);
        setFormData({});
        setEditingItem(null);
      } else {
        throw new Error(response.message || 'Failed to save item');
      }
    } catch (error) {
      const errorMessage = handleError(error, 'Save Item');
      showToast({ message: errorMessage, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  // Pagination logic
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data[activeTab].slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(data[activeTab].length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getTableHeaders = () => {
    switch (activeTab) {
      case 'faculties':
        return ['รหัส', 'ชื่อคณะ', 'การดำเนินการ'];
      case 'departments':
        return ['รหัส', 'ชื่อภาควิชา', 'คณะ', 'การดำเนินการ'];
      case 'programs':
        return ['รหัส', 'ชื่อสาขา', 'ภาควิชา', 'การดำเนินการ'];
      case 'expertises':
        return ['รหัส', 'ชื่อความเชี่ยวชาญ', 'การดำเนินการ'];
      case 'academic_terms':
        return ['รหัส', 'ปีการศึกษา', 'รายละเอียด', 'การดำเนินการ'];
      default:
        return [];
    }
  };

  const getFormFields = () => {
    switch (activeTab) {
      case 'faculties':
        return [
          { name: 'faculty_name_th', label: 'ชื่อคณะ', type: 'text', required: true },
        ];
      case 'departments':
        return [
          { name: 'department_name_th', label: 'ชื่อภาควิชา', type: 'text', required: true },
          { name: 'faculty_id', label: 'คณะ', type: 'select', required: true, options: data.faculties },
        ];
      case 'programs':
        return [
          { name: 'program_name_th', label: 'ชื่อสาขา', type: 'text', required: true },
          { name: 'department_id', label: 'ภาควิชา', type: 'select', required: true, options: data.departments },
        ];
      case 'expertises':
        return [
          { name: 'expertise_name_th', label: 'ชื่อความเชี่ยวชาญ', type: 'text', required: true },
        ];
      case 'academic_terms':
        return [
          { name: 'term_year', label: 'ปีการศึกษา', type: 'number', required: true, info: 'ปี พ.ศ. เช่น 2567' },
          { name: 'term_number', label: 'ภาคเรียน', type: 'select', required: true, options: [
            { value: 1, label: '1 - ภาคต้น' },
            { value: 2, label: '2 - ภาคปลาย' },
            { value: 3, label: '3 - ภาคฤดูร้อน' }
          ]},
        ];
      default:
        return [];
    }
  };

  const getDisplayName = (item) => {
    switch (activeTab) {
      case 'faculties':
        return item.faculty_name_th || item.faculty_name || item.name_th || item.name;
      case 'departments':
        return item.department_name_th || item.department_name || item.name_th || item.name;
      case 'programs':
        return item.program_name_th || item.program_name || item.name_th || item.name;
      case 'expertises':
        return item.expertise_name_th || item.expertise_name || item.name_th || item.name;
      case 'academic_terms':
        // Extract first year from "2567/2568" -> "2567" or keep as is if just "2567"
        const year = item.academic_year ? item.academic_year.split('/')[0] : '-';
        return year;
      default:
        return '';
    }
  };

  const getDependencyMessage = (tab, errorMessage) => {
    const suggestions = {
      'faculties': 'กรุณาลบภาควิชาทั้งหมดในคณะนี้ก่อน แล้วจึงลบคณะ',
      'departments': 'กรุณาลบสาขาวิชาทั้งหมดในภาควิชานี้ก่อน แล้วจึงลบภาควิชา', 
      'programs': 'กรุณาไปที่หน้าจัดการผู้ใช้ แล้วย้ายอาจารย์และนักศึกษาที่อยู่ในสาขานี้ไปสาขาอื่น',
      'expertises': 'กรุณาไปที่หน้าจัดการผู้ใช้ แล้วแก้ไขข้อมูลความเชี่ยวชาญของอาจารย์',
      'academic_terms': 'กรุณาตรวจสอบว่ามีข้อมูลคำขอหรือผู้ใช้ที่เกี่ยวข้องกับปีการศึกษานี้'
    };

    let message;
    
    // Handle specific error messages
    if (errorMessage.includes('Cannot delete program that has students')) {
      message = '❌ ไม่สามารถลบสาขาวิชาได้\n\n🔍 เหตุผล: มีนักศึกษาที่อยู่ในสาขานี้';
    } else if (errorMessage.includes('Cannot delete program that has advisors')) {
      message = '❌ ไม่สามารถลบสาขาวิชาได้\n\n🔍 เหตุผล: มีอาจารย์ที่อยู่ในสาขานี้';
    } else if (errorMessage.includes('advisor_program_id') || errorMessage.includes('program_id')) {
      message = '❌ ไม่สามารถลบสาขาวิชาได้\n\n🔍 เหตุผล: มีอาจารย์หรือนักศึกษาที่อยู่ในสาขานี้';
    } else if (errorMessage.includes('foreign key constraint') || errorMessage.includes('Cannot delete or update a parent row')) {
      const itemNames = {
        'faculties': 'คณะ',
        'departments': 'ภาควิชา', 
        'programs': 'สาขาวิชา',
        'expertises': 'ความเชี่ยวชาญ',
        'academic_terms': 'ปีการศึกษา'
      };
      message = `❌ ไม่สามารถลบ${itemNames[tab] || 'ข้อมูล'}ได้\n\n🔍 เหตุผล: มีข้อมูลอื่นที่เกี่ยวข้องกับรายการนี้`;
    } else {
      message = handleError({ message: errorMessage }, 'Delete Item');
    }
    
    const suggestion = suggestions[tab] || 'กรุณาตรวจสอบข้อมูลที่เกี่ยวข้องก่อน';
    
    return `${message}\n\n💡 วิธีแก้ไข: ${suggestion}`;
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium mb-2">เกิดข้อผิดพลาด</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={() => loadData()}
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
              <h1 className="text-2xl font-bold text-gray-900">จัดการข้อมูลพื้นฐาน</h1>
              <p className="text-gray-600">จัดการข้อมูลคณะ, ภาควิชา, ความเชี่ยวชาญ, และปีการศึกษา</p>
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
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'faculties', name: 'คณะ' },
                { id: 'departments', name: 'ภาควิชา' },
                { id: 'expertises', name: 'ความเชี่ยวชาญ' },
                { id: 'academic_terms', name: 'ปีการศึกษา' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {activeTab === 'faculties' && 'คณะ'}
                {activeTab === 'departments' && 'ภาควิชา'}
                {activeTab === 'expertises' && 'ความเชี่ยวชาญ'}
                {activeTab === 'academic_terms' && 'ปีการศึกษา'}
              </h3>
              <button
                onClick={handleAdd}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                เพิ่มใหม่
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {getTableHeaders().map((header, index) => (
                      <th
                        key={index}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getPaginatedData().map((item, index) => {
                    const actualIndex = (currentPage - 1) * itemsPerPage + index;
                    return (
                    <tr key={item[`${activeTab.slice(0, -1)}_id`] || item.academic_term_id || item.id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {actualIndex + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getDisplayName(item)}
                      </td>
                      {activeTab === 'departments' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {facultiesMap[item.faculty_id] || `คณะ ID: ${item.faculty_id}` || '-'}
                        </td>
                      )}
                      {activeTab === 'programs' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {departmentsMap[item.department_id] || `ภาควิชา ID: ${item.department_id}` || '-'}
                        </td>
                      )}
                      {activeTab === 'academic_terms' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.term === 'ต้น' ? 'ภาคต้น' : item.term === 'ปลาย' ? 'ภาคปลาย' : item.term === 'ฤดูร้อน' ? 'ภาคฤดูร้อน' : item.term}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="text-red-600 hover:text-red-900"
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ก่อนหน้า
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ถัดไป
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      แสดง <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> ถึง{' '}
                      <span className="font-medium">{Math.min(currentPage * itemsPerPage, data[activeTab].length)}</span> จาก{' '}
                      <span className="font-medium">{data[activeTab].length}</span> รายการ
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => handlePageChange(i + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === i + 1
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
            </>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-600/50 p-4 md:items-center">
          <div className="w-full max-w-2xl rounded-md border bg-white p-5 shadow-lg">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingItem ? 'แก้ไขข้อมูล' : 'เพิ่มข้อมูลใหม่'}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                {getFormFields().map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label} {field.required && '*'}
                      {field.info && (
                        <span className="ml-2 text-xs text-gray-500 font-normal">({field.info})</span>
                      )}
                    </label>
                    {field.type === 'select' ? (
                      <select
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={handleInputChange}
                        required={field.required}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">เลือก{field.label}</option>
                        {field.options?.map((option) => {
                          let optionKey, optionValue, optionLabel;
                          
                          if (field.name === 'faculty_id') {
                            optionKey = option.faculty_id;
                            optionValue = option.faculty_id;
                            optionLabel = option.faculty_name_th || option.faculty_name;
                          } else if (field.name === 'department_id') {
                            optionKey = option.department_id;
                            optionValue = option.department_id;
                            optionLabel = option.department_name_th || option.department_name;
                          } else if (field.name === 'term_number') {
                            // For term_number select
                            optionKey = option.value;
                            optionValue = option.value;
                            optionLabel = option.label;
                          } else {
                            // Fallback for other types
                            const baseName = field.name.replace('_id', '');
                            optionKey = option[`${baseName}_id`];
                            optionValue = option[`${baseName}_id`];
                            optionLabel = option[`${baseName}_name_th`] || option[`${baseName}_name`];
                          }
                          
                          return (
                            <option key={optionKey} value={optionValue}>
                              {optionLabel}
                            </option>
                          );
                        })}
                      </select>
                    ) : field.type === 'checkbox' ? (
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name={field.name}
                          checked={formData[field.name] || false}
                          onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.checked ? 1 : 0 }))}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">เป็นภาคเรียนปัจจุบัน</span>
                      </label>
                    ) : (
                      <input
                        type={field.type}
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={handleInputChange}
                        required={field.required}
                        readOnly={field.readonly}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                          field.readonly ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : ''
                        }`}
                      />
                    )}
                  </div>
                ))}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
