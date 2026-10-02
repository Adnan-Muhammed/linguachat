import { useApp } from '@/context/AppContext';
import { Icons } from '../Icons';
import Avatar from '../ui/Avatar';
import EmptyState from '../ui/EmptyState';
import ListShell from '../layout/ListShell';

export default function RequestsList() {
  const { db, acceptFriendRequest, rejectFriendRequest } = useApp();

  return (
    <ListShell title="Friend requests">
      {db.incoming.length ? (
        db.incoming.map((u) => {
          return (
            <div key={u.id} className="reqcard">
              <div className="top">
                <Avatar user={u} />
                <div>
                  <div className="nm"><b>{u.name}</b></div>
                  <div className="sb">wants to connect with you.</div>
                </div>
              </div>
              <div className="acts">
                <button className="btn sm" onClick={() => acceptFriendRequest(u.id)}>Accept</button>
                <button className="btn ghost sm" onClick={() => rejectFriendRequest(u.id)}>Reject</button>
              </div>
            </div>
          );
        })
      ) : (
        <EmptyState icon={Icons.bell} title="All caught up" text="New friend requests will show up here." />
      )}
    </ListShell>
  );
}