import type { ReactNode } from 'react';
import { useApp } from '@/context/AppContext';
import type { Tab } from '@/types';
import { Icons } from '../Icons';

const ITEMS: [Tab, string, ReactNode][] = [
  ['friends', 'Friends', Icons.friends],
  ['users', 'Users', Icons.users],
  ['requests', 'Requests', Icons.bell],
  ['tutor', 'Tutor', Icons.tutor],
  ['profile', 'Profile', Icons.profile],
];

export default function NavButtons() {
  const { ui, db, go } = useApp();
  const n = db.incoming.length;
  
  const totalUnread = Object.values(db.unreadCounts || {}).reduce((a, b) => a + b, 0);

  return (
    <>
      {ITEMS.map(([key, label, icon]) => (
        <button
          key={key}
          className={`nav ${ui.tab === key ? 'active' : ''}`}
          onClick={() => go(key)}
          aria-label={label}
          title={label}
        >
          {icon}
          <span className="lbl">{label}</span>
          {key === 'requests' && n > 0 && <b className="badge">{n}</b>}
          {key === 'friends' && totalUnread > 0 && <b className="badge">{totalUnread}</b>}
        </button>
      ))}
    </>
  );
}
