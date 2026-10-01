import { useApp } from '@/context/AppContext';
import { getUser } from '@/lib/data';
import { matches } from '@/lib/utils';
import { Icons } from '../Icons';
import Avatar from '../ui/Avatar';
import EmptyState from '../ui/EmptyState';
import ListShell from '../layout/ListShell';

export default function FriendsList() {
  const { db, ui, openChat, go } = useApp();
  const friends = db.friends.map((id) => getUser(id)).filter((u) => matches(u, ui.q));

  return (
    <ListShell title="Friends" search={db.friends.length > 0}>
      {!db.friends.length ? (
        <EmptyState icon={Icons.friends} title="No friends yet" text="Find people in Users and send them an invitation.">
          <button className="btn" onClick={() => go('users')}>Find people</button>
        </EmptyState>
      ) : friends.length ? (
        friends.map((u) => {
          const last = (db.messages[u.id] || []).slice(-1)[0];
          return (
            <div key={u.id} className={`item ${ui.chat === u.id ? 'sel' : ''}`} onClick={() => openChat(u.id)}>
              <Avatar user={u} dot />
              <div className="meta">
                <div className="nm">{u.name}</div>
                <div className="sb">{last ? last.text : '@' + u.username} · {u.online ? 'Online' : 'Offline'}</div>
              </div>
              <button
                className="btn ghost sm"
                onClick={(e) => { e.stopPropagation(); openChat(u.id); }}
              >
                Message
              </button>
            </div>
          );
        })
      ) : (
        <EmptyState text="No matches" />
      )}
    </ListShell>
  );
}