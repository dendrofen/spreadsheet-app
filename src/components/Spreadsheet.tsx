'use client';

import React, { useEffect, useRef } from 'react';
import 'luckysheet/dist/plugins/css/pluginsCss.css';
import 'luckysheet/dist/plugins/plugins.css';
import 'luckysheet/dist/css/luckysheet.css';
import 'luckysheet/dist/assets/iconfont/iconfont.css';
import LuckysheetScript from './LuckysheetScript';

declare global {
  interface Window {
    luckysheet: any;
  }
}

export default function Spreadsheet() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initLuckysheet = () => {
      if (!containerRef.current) {
        console.error('Container ref not found');
        return;
      }

      if (!window.luckysheet) {
        console.error('Luckysheet not loaded');
        return;
      }

      try {
        window.luckysheet.create({
          container: containerRef.current.id,
          title: 'My Spreadsheet',
          lang: 'en',
          data: [
            {
              name: 'Sheet1',
              color: '',
              status: 1,
              order: 0,
              data: [],
              config: {},
              index: 0,
              scrollLeft: 0,
              scrollTop: 0,
              defaultRowHeight: 19,
              defaultColWidth: 73,
              showGridLines: 1,
              column: 60,
              row: 84,
              celldata: [],
            },
          ],
        });
      } catch (error) {
        console.error('Error initializing Luckysheet:', error);
      }
    };

    // Listen for the custom event when scripts are loaded
    const handleScriptsLoaded = () => {
      console.log('Scripts loaded, initializing Luckysheet');
      initLuckysheet();
    };

    window.addEventListener('luckysheet-ready', handleScriptsLoaded);

    // Cleanup
    return () => {
      window.removeEventListener('luckysheet-ready', handleScriptsLoaded);
    };
  }, []);

  return (
    <>
      <LuckysheetScript />
      <div className="w-full h-[calc(100vh-4rem)]">
        <div id="luckysheet-container" ref={containerRef} className="w-full h-full" />
      </div>
    </>
  );
} 