import { createContext, useContext, ReactNode } from 'react';
import { useVideoCall } from './useVideoCall';

const VideoCallContext = createContext<ReturnType<typeof useVideoCall> | null>(null);

export function useVideoCallContext() {
  const ctx = useContext(VideoCallContext);
  if (!ctx) throw new Error('useVideoCallContext must be used within a VideoCallProvider');
  return ctx;
}

export function VideoCallProvider({ children }: { children: ReactNode }) {
  const videoCall = useVideoCall();
  return (
    <VideoCallContext.Provider value={videoCall}>
      {children}
    </VideoCallContext.Provider>
  );
}
