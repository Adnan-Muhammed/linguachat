import { useApp } from '@/context/AppContext';
import { matches } from '@/lib/utils';
import Avatar from '../ui/Avatar';
import EmptyState from '../ui/EmptyState';
import ListShell from '../layout/ListShell';

function UserAction({ id }: { id: string }) {
  const { db, openChat, go, sendFriendRequest, cancelFriendRequest } = useApp();
  const isFriend = db.friends.some((f) => f.id === id);
  const isIncoming = db.incoming.some((inc) => inc.id === id);
  const isSent = db.sent.includes(id);

  if (isFriend)
    return <button className="btn ghost sm" onClick={() => openChat(id)}>Message</button>;
  if (isIncoming)
    return <button className="btn sm" onClick={() => go('requests')}>Respond</button>;
  if (isSent)
    return <button className="btn ghost sm" onClick={() => cancelFriendRequest(id)}>Invitation sent</button>;
  return <button className="btn sm" onClick={() => sendFriendRequest(id)}>Invite</button>;
}

export default function UsersList() {
  const { ui, allUsers } = useApp();
  const users = allUsers.filter((u) => matches(u, ui.q));

  return (
    <ListShell title="Users" search>
      {users.length ? (
        users.map((u) => (
          <div key={u.id} className="item">
            <Avatar user={u} dot />
            <div className="meta">
              <div className="nm">{u.name}</div>
              <div className="sb">@{u.username} · {u.age} · {u.online ? 'Online' : 'Offline'}</div>
            </div>
            <UserAction id={u.id} />
          </div>
        ))
      ) : (
        <EmptyState text="No matches" />
      )}
    </ListShell>
  );
}