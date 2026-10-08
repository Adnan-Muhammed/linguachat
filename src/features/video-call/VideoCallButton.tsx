import { useVideoCallContext } from './VideoCallProvider';
import { useApp } from '@/context/AppContext';

export default function VideoCallButton({ friendId }: { friendId: string }) {
  const { startCall, status } = useVideoCallContext();
  const { allUsers, db } = useApp();

  const friend = db.friends.find(f => f.id === friendId) || allUsers.find(u => u.id === friendId);

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (friend) {
      startCall(friend.id, friend.name);
    }
  };

  return (
    <button
      className="btn ghost sm"
      style={{ margin: 0, marginRight: '8px' }}
      onClick={handleCall}
      disabled={status !== 'idle'}
      title="Video Call"
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
          <path d="M23 7l-7 5 7 5V7z"></path>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
        </svg>
        Call
      </span>
    </button>
  );
}
