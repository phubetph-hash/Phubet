'use client';

import { useParams } from 'next/navigation';
import AdvisorDetail from '@/components/student/AdvisorDetail';

export default function AdvisorDetailPage() {
  const params = useParams();
  const advisorId = params.id;

  return <AdvisorDetail advisorId={advisorId} />;
}