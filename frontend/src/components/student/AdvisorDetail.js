'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { handleError } from '@/lib/errorHandler';
import { formatDate } from '@/lib/utils';
import { BUSINESS_RULES } from '@/lib/constants';

export default function AdvisorDetail({ advisorId }) {
  const router = useRouter();
  const [advisor, setAdvisor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAdvisorDetailCallback = useCallback(() => {
    if (advisorId) {
      loadAdvisorDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advisorId]);

  useEffect(() => {
    loadAdvisorDetailCallback();
  }, [loadAdvisorDetailCallback]);

  const loadAdvisorDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.get(`/api/advisors/get?id=${advisorId}`);

      if (response.success) {
        setAdvisor(response.data);
      } else {
        setError('ไม่พบข้อมูลอาจารย์ที่ปรึกษา');
      }
    } catch (error) {
      const errorMessage = handleError(error, 'Load Advisor Detail');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };



  const getCapacityColor = (current, max) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getCapacityText = (current, max) => {
    if (current >= max) return 'เต็ม';
    return `${current}/${max}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium mb-2">เกิดข้อผิดพลาด</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={() => router.push('/advisor')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            กลับไปรายการอาจารย์
          </button>
        </div>
      </div>
    );
  }

  if (!advisor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-lg font-medium mb-2">ไม่พบข้อมูลอาจารย์ที่ปรึกษา</div>
          <button
            onClick={() => router.push('/advisor')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            กลับไปรายการอาจารย์
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
              <h1 className="text-2xl font-bold text-gray-900">
                {advisor.academic_rank_name} {advisor.first_name} {advisor.last_name}
              </h1>
              <p className="text-gray-600">{advisor.faculty_name} - {advisor.department_name}</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/advisor')}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                กลับไปรายการอาจารย์
              </button>
              <button
                onClick={() => router.push(`/student/create-request?advisor_id=${advisor.advisor_id}`)}
                disabled={advisor.available_capacity <= 0}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {advisor.available_capacity <= 0 ? 'ไม่ว่างรับนิสิต' : 'ส่งคำขอ'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">ข้อมูลอาจารย์ที่ปรึกษา</h2>
              
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">ข้อมูลพื้นฐาน</h3>
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">ชื่อ-นามสกุล</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {advisor.academic_rank_name} {advisor.first_name} {advisor.last_name}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">ตำแหน่งทางวิชาการ</dt>
                      <dd className="mt-1 text-sm text-gray-900">{advisor.academic_rank_name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">วุฒิการศึกษา</dt>
                      <dd className="mt-1 text-sm text-gray-900">{advisor.academic_degree_name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">เบอร์โทรศัพท์</dt>
                      <dd className="mt-1 text-sm text-gray-900">{advisor.phone || 'ไม่ระบุ'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">อีเมล</dt>
                      <dd className="mt-1 text-sm text-gray-900">{advisor.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">คณะ-ภาควิชา</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {advisor.faculty_name} - {advisor.department_name}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Expertise */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">ความเชี่ยวชาญ</h3>
                  <div className="flex flex-wrap gap-2">
                    {advisor.expertises?.map((expertise) => (
                      <span
                        key={expertise.expertise_id}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                      >
                        {expertise.expertise_name_th}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Capacity */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">จำนวนนิสิตที่รับได้</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">จำนวนนิสิตปัจจุบัน</span>
                      <span className={`text-sm font-medium ${getCapacityColor(advisor.current_students, advisor.capacity)}`}>
                        {getCapacityText(advisor.current_students, advisor.capacity)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min((advisor.current_students / advisor.capacity) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      ว่างรับ: <span className="font-medium text-green-600">{advisor.available_capacity} คน</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">ข้อมูลสรุป</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">ตำแหน่ง:</span>
                  <span className="text-sm font-medium text-gray-900">{advisor.academic_rank_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">วุฒิ:</span>
                  <span className="text-sm font-medium text-gray-900">{advisor.academic_degree_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">จำนวนนิสิต:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {advisor.current_students}/{advisor.capacity}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">ว่างรับ:</span>
                  <span className="text-sm font-medium text-green-600">
                    {advisor.available_capacity} คน
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">ความเชี่ยวชาญ:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {advisor.expertises?.length || 0} ด้าน
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">การดำเนินการ</h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push(`/student/create-request?advisor_id=${advisor.advisor_id}`)}
                  disabled={advisor.available_capacity <= 0}
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {advisor.available_capacity <= 0 ? 'ไม่ว่างรับนิสิต' : 'ส่งคำขอเป็นที่ปรึกษา'}
                </button>
                <button
                  onClick={() => router.push('/advisor')}
                  className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                >
                  กลับไปรายการอาจารย์
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
