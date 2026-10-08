import { useEffect, useRef } from 'react';
import { useVideoCallContext } from './VideoCallProvider';

export default function VideoCallScreen() {
  const {
    status,
    callInfo,
    localStream,
    remoteStream,
    isMuted,
    isCameraOff,
    endCall,
    toggleMute,
    toggleCamera
  } = useVideoCallContext();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(e => console.error('Local video play error:', e));
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(e => console.error('Remote video play error:', e));
    }
  }, [remoteStream]);

  if (status !== 'calling' && status !== 'connected') return null;

  const showWait = status === 'calling' && !remoteStream;

  return (
    <div className="vc-screen">
      <div className="vc-remote-container">
        {remoteStream ? (
          <video ref={remoteVideoRef} className="vc-remote-video" autoPlay playsInline />
        ) : showWait ? (
          <div className="vc-waiting">
            <div className="vc-pulse-ring"></div>
            Calling...
          </div>
        ) : null}
        <div className="vc-peer-name">{callInfo?.peerName || 'Unknown'}</div>
        {status === 'calling' && <div className="vc-call-status">Connecting...</div>}
      </div>

      {localStream && (
        <div className="vc-local-container">
          <video ref={localVideoRef} className="vc-local-video" autoPlay playsInline muted />
          {isCameraOff && <div className="vc-camera-off-overlay">Camera Off</div>}
        </div>
      )}

      <div className="vc-controls">
        <button className={`vc-control-btn ${isMuted ? 'vc-active' : ''}`} onClick={toggleMute} title={isMuted ? "Unmute" : "Mute"}>
          {isMuted ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
          )}
        </button>
        
        <button className="vc-control-btn vc-end-btn" onClick={endCall} title="End Call">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path><line x1="23" y1="1" x2="1" y2="23"></line></svg>
        </button>

        <button className={`vc-control-btn ${isCameraOff ? 'vc-active' : ''}`} onClick={toggleCamera} title={isCameraOff ? "Turn Camera On" : "Turn Camera Off"}>
          {isCameraOff ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M21 17.27V7a2 2 0 0 0-2-2H8.73M23 7l-7 5 7 5V7zM3 3H2v14a2 2 0 0 0 2 2h14v-1"></path></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 7l-7 5 7 5V7z"></path><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
          )}
        </button>
      </div>
    </div>
  );
}
