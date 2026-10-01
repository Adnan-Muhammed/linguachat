import { useApp } from '@/context/AppContext';
import { USERS } from '@/lib/data';
import { matches } from '@/lib/utils';
import Avatar from '../ui/Avatar';
import EmptyState from '../ui/EmptyState';
import ListShell from '../layout/ListShell';

function UserAction({ id }: { id: string }) {
  const { db, openChat, go, sendFriendRequest } = useApp();
  if (db.friends.includes(id))
    return <button className="btn ghost sm" onClick={() => openChat(id)}>Message</button>;
  if (db.incoming.includes(id))
    return <button className="btn sm" onClick={() => go('requests')}>Respond</button>;
  if (db.sent.includes(id))
    return <button className="btn ghost sm" disabled>Invitation sent</button>;
  return <button className="btn sm" onClick={() => sendFriendRequest(id)}>Invite</button>;
}

export default function UsersList() {
  const { ui } = useApp();
  const users = USERS.filter((u) => matches(u, ui.q));

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