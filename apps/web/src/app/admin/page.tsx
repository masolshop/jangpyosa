'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRootPage() {
  const router = useRouter();

  useEffect(() => {
    // /admin으로 접근 시 자동으로 /admin/sales로 리다이렉트
    router.replace('/admin/sales');
  }, [router]);

  return null; // 리다이렉트만 수행
}
