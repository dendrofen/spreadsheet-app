'use client';

import React from 'react';
import Spreadsheet from '@/components/Spreadsheet';

interface PageProps {
  params: Promise<{ shareId: string }>;
}

export default function Page({ params }: PageProps) {
  const { shareId } = React.use(params);
  
  return <Spreadsheet shareId={shareId} />;
} 