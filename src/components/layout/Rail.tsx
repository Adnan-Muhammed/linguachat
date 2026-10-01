import { useApp } from '@/context/AppContext';
import { Icons } from '../Icons';
import Avatar from '../ui/Avatar';
import NavButtons from './NavButtons';

export default function Rail() {
  const { db, toggleTheme } = useApp();
  const me = db.me;
  if (!me) return null;

  return (
    <aside className="rail" id="rail">
      <div className="logo">{Icons.logo}</div>
      <NavButtons />
      <div className="sp" />
      <button className="nav" onClick={toggleTheme} aria-label="Toggle theme">{Icons.moon}</button>
      <Avatar user={me} title={me.name} style={{ width: 40, height: 40, fontSize: 14, marginTop: 6 }} />
    </aside>
  );
}