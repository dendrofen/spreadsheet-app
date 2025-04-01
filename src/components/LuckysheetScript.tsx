'use client';

import React, { useEffect } from 'react';

declare global {
  interface Window {
    $: any;
    jQuery: any;
    luckysheet: any;
  }
}

export default function LuckysheetScript() {
  useEffect(() => {
    const loadScripts = async () => {
      try {
        // Load jQuery and make it globally available
        const jQuery = await import('jquery');
        window.$ = jQuery.default;
        window.jQuery = jQuery.default;
        console.log('jQuery loaded and initialized globally');
        
        // Load jQuery mousewheel and ensure it's properly initialized
        const mousewheel = await import('jquery-mousewheel');
        if (mousewheel.default) {
          mousewheel.default(window.$);
        }
        console.log('jQuery mousewheel loaded and initialized');
        
        // Load Luckysheet UMD file directly
        const luckysheetModule = await import('luckysheet/dist/luckysheet.umd.js');
        window.luckysheet = luckysheetModule.default;
        console.log('Luckysheet loaded and initialized globally');
        
        // Dispatch custom event when all scripts are loaded
        window.dispatchEvent(new Event('luckysheet-ready'));
      } catch (error) {
        console.error('Error loading scripts:', error);
      }
    };

    loadScripts();
  }, []);

  return null; // No need to render anything
} 