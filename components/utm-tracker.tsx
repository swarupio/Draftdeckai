'use client';

import { useUTMCapture } from '@/hooks/useUTMCapture';

export function UTMTracker() {
  useUTMCapture();
  return null; // This component doesn't render any UI, it just tracks
}