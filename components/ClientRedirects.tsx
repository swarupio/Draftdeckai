'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function ClientRedirects() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Guard clause: stop if pathname is null (prevents potential crashes)
    if (!pathname) return;

    // 1. Logic-based redirects
    if (pathname === '/old') {
      router.replace('/new');
    }

    // 2. Auth protection
    if (pathname.startsWith('/dashboard')) {
      const isLoggedIn = false; // Replace with your real auth logic
      if (!isLoggedIn) {
        router.replace('/login');
      }
    }
  }, [pathname, router]);

  return null; // This component is for logic only, it does not render UI
}