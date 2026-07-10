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
