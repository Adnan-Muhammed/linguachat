import { useApp } from '@/context/AppContext';
import { matches } from '@/lib/utils';
import { Icons } from '../Icons';
import Avatar from '../ui/Avatar';
import EmptyState from '../ui/EmptyState';
import ListShell from '../layout/ListShell';
import VideoCallButton from '@/features/video-call/VideoCallButton';

export default function FriendsList() {
  const { db, ui, openChat, go } = useApp();
  const friends = db.friends.filter((u) => matches(u, ui.q));

  return (
    <ListShell title="Friends" search={db.friends.length > 0}>
      {!db.friends.length ? (
        <EmptyState icon={Icons.friends} title="No friends yet" text="Find people in Users and send them an invitation.">
          <button className="btn" onClick={() => go('users')}>Find people</button>
        </EmptyState>
      ) : friends.length ? ( 
        friends.map((u) => {
          const last = (db.messages[u.id] || []).slice(-1)[0];
          const unreadCount = db.unreadCounts?.[u.id] || 0;
          return (
            <div key={u.id} className={`item ${ui.chat === u.id ? 'sel' : ''}`} onClick={() => openChat(u.id)}>
              <Avatar user={u} />
              <div className="meta"> 
                <div className="nm">{u.name}</div>
                <div className="sb">
                  {last ? last.text : '@' + u.username}
                </div>
              </div> 
              <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
                <VideoCallButton friendId={u.id} />
                <button
                  className="btn ghost sm"
                  style={{ margin: 0 }}
                  onClick={(e) => { e.stopPropagation(); openChat(u.id); }}
                >
                  <span style={{ position: 'relative' }}>
                    {unreadCount > 0 && (
                      <b className="badge" style={{ 
                        top: '-6px', 
                        left: '-8px', 
                        right: 'auto',
                        background: '#25D366', 
                        color: '#fff',
                        width: '16px',
                        minWidth: '16px',
                        height: '16px',
                        fontSize: '10px',
                        padding: 0
                      }}>
                        {unreadCount}
                      </b>
                    )}
                    Message
                  </span>
                </button>
              </div>
            </div>
          );
        })
      ) : (
        <EmptyState text="No matches" />
      )}
    </ListShell>
  );
}