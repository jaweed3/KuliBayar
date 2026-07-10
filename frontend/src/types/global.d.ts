interface Window {
  ethereum?: {
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on: (event: string, callback: (...args: any[]) => void) => void;
    removeListener: (event: string, callback: (...args: any[]) => void) => void;
  };
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'iconify-icon': {
        icon?: string;
        class?: string;
        width?: string | number;
        height?: string | number;
        [key: string]: any;
      };
    }
  }
}

export {};
