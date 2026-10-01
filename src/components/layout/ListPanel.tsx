import { useApp } from '@/context/AppContext';
import FriendsList from '../lists/FriendsList';
import UsersList from '../lists/UsersList';
import RequestsList from '../lists/RequestsList';

export default function ListPanel() {
  const { ui } = useApp();
  if (ui.tab === 'friends') return <FriendsList />;
  if (ui.tab === 'users') return <UsersList />;
  if (ui.tab === 'requests') return <RequestsList />;
  return null; // profile tab: CSS hides the list column
}