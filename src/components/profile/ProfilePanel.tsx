import { useState } from 'react';
import ProfileView from './ProfileView';
import ProfileEdit from './ProfileEdit';

export default function ProfilePanel() {
  const [editing, setEditing] = useState(false);
  return editing
    ? <ProfileEdit onDone={() => setEditing(false)} />
    : <ProfileView onEdit={() => setEditing(true)} />;
}