'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import LuckysheetScript from './LuckysheetScript';
import Header from './Header';
import Toolbar from './Toolbar';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type LuckysheetInstance = {
  create: (options: LuckysheetOptions) => void;
  getAllSheets: () => any[];
  setData: (data: any[]) => void;
  importExcel: (file: File) => Promise<void>;
  exportExcel: () => void;
  on: (event: string, handler: () => void) => void;
  off: (event: string, handler: () => void) => void;
};

declare global {
  var luckysheet: LuckysheetInstance | undefined;
}

interface LuckysheetOptions {
  container: string;
  title: string;
  lang: string;
  data: Sheet[];
  showinfobar: boolean;
}

interface Sheet {
  name: string;
  color: string;
  status: number;
  order: number;
  data: any[];
  config: {
    row: number;
    column: number;
    total: number;
  };
  index: number;
  scrollLeft: number;
  scrollTop: number;
  defaultRowHeight: number;
  defaultColWidth: number;
  showGridLines: number;
  celldata: any[];
}

interface SpreadsheetProps {
  shareId?: string;
}

const DEFAULT_SHEET: Sheet = {
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
};

const JSONBLOB_API = 'https://jsonblob.com/api/jsonBlob';

export default function Spreadsheet({ shareId }: SpreadsheetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;
  const [currentBlobId, setCurrentBlobId] = useState<string | null>(shareId || null);
  const [isSharing, setIsSharing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLuckysheetReady, setIsLuckysheetReady] = useState(false);
  const router = useRouter();

  const showError = useCallback((message: string) => {
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
    });
  }, []);

  const showSuccess = useCallback((message: string) => {
    toast.success(message, {
      duration: 3000,
      position: 'top-right',
    });
  }, []);

  const handleLuckysheetReady = useCallback(() => {
    setIsLuckysheetReady(true);
  }, []);

  useEffect(() => {
    window.addEventListener('luckysheet-ready', handleLuckysheetReady);

    if (window.luckysheet) {
      setIsLuckysheetReady(true);
    }

    return () => {
      window.removeEventListener('luckysheet-ready', handleLuckysheetReady);
    };
  }, [handleLuckysheetReady]);

  const fetchSharedData = useCallback(async (id: string) => {
    const response = await fetch(`${JSONBLOB_API}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch shared data');
    return response.json();
  }, []);

  const initLuckysheet = useCallback(async () => {
    if (!isLuckysheetReady || !containerRef.current) return;

    try {
      const options: LuckysheetOptions = {
        container: 'luckysheet-container',
        title: 'Spreadsheet',
        lang: 'en',
        data: [DEFAULT_SHEET],
        showinfobar: false,
      };
      
      if (shareId) {
        try {
          const sharedData = await fetchSharedData(shareId);
          options.data = sharedData;
          setCurrentBlobId(shareId);
        } catch (error) {
          console.info('Failed to load shared spreadsheet:', error);
          showError('Failed to load shared spreadsheet. Starting with a new one.');
        }
      }

      window.luckysheet.create(options);

      // Add error event listener for Luckysheet after a short delay to ensure it's initialized
      setTimeout(() => {
        try {
          if (window.luckysheet?.on) {
            window.luckysheet.on('error', (error: any) => {
              console.info('Luckysheet error:', error);
              if (error.message?.includes('缓存操作失败')) {
                showError('Failed to save changes. Please try again.');
              }
            });
          }
        } catch (error) {
          console.info('Failed to add Luckysheet error listener:', error);
        }
      }, 100);
    } catch (error) {
      console.info('Failed to initialize spreadsheet:', error);
      showError('Failed to initialize spreadsheet');
    }
  }, [isLuckysheetReady, shareId, fetchSharedData, showError]);

  useEffect(() => {
    initLuckysheet();
  }, [initLuckysheet]);

  const handleShare = useCallback(async () => {
    try {
      setIsSharing(true);
      
      const data = window.luckysheet.getAllSheets();
      const response = await fetch(JSONBLOB_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create blob');
      
      const blobId = response.headers.get('Location')?.split('/').pop();
      if (!blobId) throw new Error('No blob ID received');
      
      setCurrentBlobId(blobId);
      router.push(`/${blobId}`);
      showSuccess('Spreadsheet shared successfully!');
    } catch (error) {
      console.info('Failed to share spreadsheet:', error);
      showError('Failed to share spreadsheet');
    } finally {
      setIsSharing(false);
    }
  }, [router, showError, showSuccess]);

  const handleUpdate = useCallback(async () => {
    if (!currentBlobId) return;
    
    try {
      setIsUpdating(true);
      
      const data = window.luckysheet.getAllSheets();
      const response = await fetch(`${JSONBLOB_API}/${currentBlobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update blob');
      
      showSuccess('Changes saved successfully');
    } catch (error) {
      console.info('Failed to update spreadsheet:', error);
      showError('Failed to save changes. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  }, [currentBlobId, showError, showSuccess]);

  // Add auto-save functionality
  useEffect(() => {
    if (!currentBlobId) return;

    const autoSaveInterval = setInterval(() => {
      handleUpdate();
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [currentBlobId, handleUpdate]);

  const handleDelete = useCallback(async () => {
    if (!currentBlobId) return;
    
    try {
      const response = await fetch(`${JSONBLOB_API}/${currentBlobId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete blob');
      
      setCurrentBlobId(null);
      router.push('/');
      showSuccess('Spreadsheet deleted successfully');
    } catch (error) {
      console.info('Failed to delete spreadsheet:', error);
      showError('Failed to delete spreadsheet');
    }
  }, [currentBlobId, router, showError, showSuccess]);

  const handleImport = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      await window.luckysheet.importExcel(file);
      event.target.value = ''; // Reset file input
      showSuccess('File imported successfully');
    } catch (error) {
      console.info('Failed to import file:', error);
      showError('Failed to import file');
    }
  }, [showError, showSuccess]);

  const handleExport = useCallback(() => {
    try {
      window.luckysheet.exportExcel();
      showSuccess('File exported successfully');
    } catch (error) {
      console.info('Failed to export file:', error);
      showError('Failed to export file');
    }
  }, [showError, showSuccess]);

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
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden relative">
          <div id="luckysheet-container" ref={containerRef} className="w-full h-[600px]" />
        </div>
      </div>
    </div>
  );
} 