'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchWithToken } from '@/lib/api';
import { useNotifications } from '@/contexts/NotificationContext';
import { Button, Card, CardContent, Typography, Box, Chip, Alert } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

export default function RequestDetail() {
  const params = useParams();
  const router = useRouter();
  const { showToast, showModal } = useNotifications();
  const [request, setRequest] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push(`/login?redirect=/student/request-detail/${params.id}`);
        return;
      }
      setIsAuthenticated(true);
    };
    checkAuth();
  }, [router, params.id]);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchRequest = async () => {
      try {
        const response = await fetchWithToken(`/api/requests/detail?id=${params.id}`);
        if (!response.success) {
          throw new Error(response.message || 'Failed to fetch request details');
        }
        setRequest(response.data);
      } catch (err) {
        console.error('Error fetching request:', err);
        setError(err.message || 'Failed to load request details');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchRequest();
    }
  }, [params.id, isAuthenticated]);

  const executeCancel = async () => {
    try {
      const response = await fetchWithToken(`/api/requests/update-status?id=${params.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'ยกเลิก'
        })
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to cancel request');
      }

      showToast({ message: 'ยกเลิกคำขอสำเร็จ', type: 'success' });
      router.push('/student/dashboard');
    } catch (err) {
      console.error('Error canceling request:', err);
      showToast({ message: err.message || 'ไม่สามารถยกเลิกคำขอได้', type: 'error' });
    }
  };

  const handleCancel = () => {
    showModal({
      title: 'ยืนยันการยกเลิกคำขอ',
      message: 'คุณต้องการยกเลิกคำขอนี้ใช่หรือไม่?',
      type: 'warning',
      actions: [
        {
          label: 'ยืนยันยกเลิก',
          variant: 'danger',
          onClick: () => {
            void executeCancel();
          },
        },
        {
          label: 'กลับไปแก้ไข',
          variant: 'secondary',
          onClick: () => {},
        },
      ],
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'รอดำเนินการ':
        return 'warning';
      case 'อนุมัติ':
        return 'success';
      case 'ปฏิเสธ':
        return 'error';
      case 'ยกเลิก':
        return 'default';
      default:
        return 'default';
    }
  };

  // Show loading while checking auth
  if (!isAuthenticated || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!request) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        ไม่พบข้อมูลคำขอ
      </Alert>
    );
  }

  return (
    <Card sx={{ m: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h1">
            รายละเอียดคำขอ
          </Typography>
          <Chip
            label={request.status}
            color={getStatusColor(request.status)}
            variant="outlined"
          />
        </Box>

        <Typography variant="subtitle1" gutterBottom>
          <strong>อาจารย์ที่ปรึกษา:</strong> {request.advisor_name}
        </Typography>

        <Typography variant="body1" gutterBottom>
          <strong>นิสิต:</strong> {request.student_name}
        </Typography>

        <Typography variant="body1" gutterBottom>
          <strong>คณะ:</strong> {request.faculty_name_th}
        </Typography>

        <Typography variant="body1" gutterBottom>
          <strong>ภาควิชา:</strong> {request.department_name_th}
        </Typography>

        <Typography variant="body1" gutterBottom>
          <strong>สาขา:</strong> {request.program_name_th}
        </Typography>

        <Typography variant="body1" gutterBottom>
          <strong>ปีการศึกษา:</strong> {request.academic_year} ภาคการศึกษาที่ {request.term}
        </Typography>

        {request.rejection_reason && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="subtitle2">เหตุผลที่ปฏิเสธ:</Typography>
            {request.rejection_reason}
          </Alert>
        )}

        {request.suggestion && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="subtitle2">ข้อเสนอแนะ:</Typography>
            {request.suggestion}
          </Alert>
        )}

        {request.status === 'รอดำเนินการ' && (
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              color="error"
              onClick={handleCancel}
            >
              ยกเลิกคำขอ
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}