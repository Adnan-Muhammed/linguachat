import { useApp } from '@/context/AppContext';
import Avatar from '../ui/Avatar';

export default function ProfileView({ onEdit }: { onEdit: () => void }) {
  const { db, toggleTheme, logout } = useApp();
  const me = db.me;
  if (!me) return null;

  return (
    <div className="pwrap">
      <div className="pcard">
        <div className="phero">
          <Avatar user={me} big />
          <h2>{me.name}</h2>
          <span>@{me.username}</span>
        </div>
        <div className="rows">
          <div className="prow"><span>Age</span>{me.age}</div>
          <div className="prow"><span>Gender</span>{me.gender}</div>
          <div className="prow"><span>Mobile</span>{me.mobile}</div>
        </div>
        <div className="pacts">
          <button className="btn" onClick={onEdit}>Edit profile</button>
          <button className="btn ghost" onClick={toggleTheme}>Switch theme</button>
          <button className="btn danger" onClick={logout}>Log out</button>
        </div>
      </div>
    </div>
  );
}