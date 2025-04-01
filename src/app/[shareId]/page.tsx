'use client';

import Spreadsheet from '@/components/Spreadsheet';

export default function SharedSpreadsheet({ params }: { params: { shareId: string } }) {
  return <Spreadsheet shareId={params.shareId} />;
} 