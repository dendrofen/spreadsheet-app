'use client';

import { useEffect } from 'react';

// Import all required CSS
import 'luckysheet/dist/plugins/css/pluginsCss.css';
import 'luckysheet/dist/plugins/plugins.css';
import 'luckysheet/dist/css/luckysheet.css';
import 'luckysheet/dist/assets/iconfont/iconfont.css';

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
        if (luckysheetModule.default) {
          window.luckysheet = luckysheetModule.default;
          console.log('Luckysheet loaded and initialized globally');
          
          // Dispatch custom event when all scripts are loaded
          window.dispatchEvent(new Event('luckysheet-ready'));
        } else {
          throw new Error('Luckysheet module not properly loaded');
        }
      } catch (error) {
        console.error('Error loading scripts:', error);
      }
    };

    loadScripts();
  }, []);

  return null; // No need to render anything
} 