'use client';

import React, { useEffect, useRef, useState } from 'react';
import LuckysheetScript from './LuckysheetScript';
import Header from './Header';
import Toolbar from './Toolbar';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    luckysheet: any;
  }
}

interface SpreadsheetProps {
  shareId?: string;
}

export default function Spreadsheet({ shareId }: SpreadsheetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;
  const [currentBlobId, setCurrentBlobId] = useState<string | null>(shareId || null);
  const [isSharing, setIsSharing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLuckysheetReady, setIsLuckysheetReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerId = 'luckysheet-container';
  const router = useRouter();

  useEffect(() => {
    const handleLuckysheetReady = () => {
      setIsLuckysheetReady(true);
    };

    window.addEventListener('luckysheet-ready', handleLuckysheetReady);

    if (window.luckysheet) {
      setIsLuckysheetReady(true);
    }

    return () => {
      window.removeEventListener('luckysheet-ready', handleLuckysheetReady);
    };
  }, []);

  useEffect(() => {
    const initLuckysheet = async () => {
      if (!isLuckysheetReady || !containerRef.current) return;

      try {
        const options = {
          container: containerId,
          title: 'Spreadsheet',
          lang: 'en',
          data: [
            {
              name: 'Sheet1',
              color: '',
              status: 1,
              order: 0,
              data: [],
              config: {
                row: 84,
                column: 60,
                total: 84 * 60
              },
              index: 0,
              scrollLeft: 0,
              scrollTop: 0,
              defaultRowHeight: 19,
              defaultColWidth: 73,
              showGridLines: 1,
              celldata: [],
            },
          ],
          showinfobar: false,
        };
        
        if (shareId) {
          try {
            const response = await fetch(`https://jsonblob.com/api/jsonBlob/${shareId}`);
            if (!response.ok) throw new Error('Failed to fetch shared data');
            const sharedData = await response.json();
            options.data = sharedData;
            setCurrentBlobId(shareId);
          } catch (error) {
            console.info('Failed to load shared spreadsheet:', error);
            setError('Failed to load shared spreadsheet. Starting with a new one.');
          }
        }

        window.luckysheet.create(options);
      } catch (error) {
        console.info('Failed to initialize spreadsheet:', error);
        setError('Failed to initialize spreadsheet');
      }
    };

    initLuckysheet();
  }, [isLuckysheetReady, containerId, shareId]);

  const handleShare = async () => {
    try {
      setIsSharing(true);
      setError(null);
      const data = window.luckysheet.getAllSheets();
      const response = await fetch('https://jsonblob.com/api/jsonBlob', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create blob');
      
      const blobId = response.headers.get('Location')?.split('/').pop();
      if (!blobId) throw new Error('No blob ID received');
      
      setCurrentBlobId(blobId);
      router.push(`/${blobId}`);
    } catch (error) {
      console.info('Failed to share spreadsheet:', error);
      setError('Failed to share spreadsheet');
    } finally {
      setIsSharing(false);
    }
  };

  const handleUpdate = async () => {
    if (!currentBlobId) return;
    
    try {
      setIsUpdating(true);
      setError(null);
      const data = window.luckysheet.getAllSheets();
      const response = await fetch(`https://jsonblob.com/api/jsonBlob/${currentBlobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update blob');
    } catch (error) {
      console.info('Failed to update spreadsheet:', error);
      setError('Failed to update spreadsheet');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!currentBlobId) return;
    
    try {
      setError(null);
      const response = await fetch(`https://jsonblob.com/api/jsonBlob/${currentBlobId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete blob');
      
      setCurrentBlobId(null);
      router.push('/');
    } catch (error) {
      console.info('Failed to delete spreadsheet:', error);
      setError('Failed to delete spreadsheet');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      setError(null);
      await window.luckysheet.importExcel(file);
      event.target.value = ''; // Reset file input
    } catch (error) {
      console.info('Failed to import file:', error);
      setError('Failed to import file');
    }
  };

  const handleExport = () => {
    try {
      setError(null);
      window.luckysheet.exportExcel();
    } catch (error) {
      console.info('Failed to export file:', error);
      setError('Failed to export file');
    }
  };

  return (
    <div className="size-full bg-gray-50">
      <LuckysheetScript />
      <Header
        currentBlobId={currentBlobId}
        isSharing={isSharing}
        isUpdating={isUpdating}
        onShare={handleShare}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
      <Toolbar
        onImport={handleImport}
        onExport={handleExport}
        fileInputRef={fileInputRef}
      />
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden relative">
          <div id={containerId} ref={containerRef} className="w-full h-[600px]" />
        </div>
      </div>
    </div>
  );
} 