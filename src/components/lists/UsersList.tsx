import { useApp } from '@/context/AppContext';
import { matches } from '@/lib/utils';
import Avatar from '../ui/Avatar';
import EmptyState from '../ui/EmptyState';
import ListShell from '../layout/ListShell';
import Spinner from '../ui/Spinner';

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
  const { ui, allUsers, isFetchingUsers } = useApp();
  const users = allUsers.filter((u) => matches(u, ui.q));

  return (
    <ListShell title="Users" search> 
      {isFetchingUsers ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
          <Spinner size={32} color="var(--acc)" />
        </div>
      ) : users.length ? (
        users.map((u) => (
          <div key={u.id} className="item">
            <Avatar user={u} />
            <div className="meta"> 
              <div className="nm">{u.name}</div>
              <div className="sb">@{u.username} · {u.age}</div>
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