declare module 'luckysheet' {
  interface LuckysheetOptions {
    container: HTMLElement;
    title: string;
    lang: string;
    data: Array<{
      name: string;
      color: string;
      status: number;
      order: number;
      data: any[];
      config: Record<string, any>;
      index: number;
      scrollLeft: number;
      scrollTop: number;
      defaultRowHeight: number;
      defaultColWidth: number;
      showGridLines: number;
      column: number;
      row: number;
      celldata: any[];
    }>;
  }

  interface Luckysheet {
    create: (options: LuckysheetOptions) => void;
  }

  const luckysheet: Luckysheet;
  export default luckysheet;
}

declare module 'luckysheet/dist/luckysheet.umd.js' {
  const luckysheet: any;
  export default luckysheet;
} 