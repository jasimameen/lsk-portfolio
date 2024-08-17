declare module 'react-mic' {
    import { ComponentType } from 'react';
  
    interface ReactMicProps {
      record: boolean;
      className?: string;
      strokeColor?: string;
      backgroundColor?: string;
    }
  
    export const ReactMic: ComponentType<ReactMicProps>;
  }
  