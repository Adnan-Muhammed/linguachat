import { useVideoCallContext } from './VideoCallProvider';

export default function IncomingCallModal() {
  const { status, callInfo, acceptCall, rejectCall } = useVideoCallContext();

  if (status !== 'ringing' || !callInfo || callInfo.isCaller) return null;

  return (
    <div className="vc-overlay">
      <div className="vc-incoming-card">
        <div className="vc-incoming-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 7l-7 5 7 5V7z"></path>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </svg>
        </div>
        <h3>Incoming Video Call</h3>
        <p>{callInfo.peerName} is calling you...</p>
        <div className="vc-incoming-actions">
          <button className="vc-reject-btn" onClick={rejectCall}>Decline</button>
          <button className="vc-accept-btn" onClick={acceptCall}>Answer</button>
        </div>
      </div>
    </div>
  );
}
