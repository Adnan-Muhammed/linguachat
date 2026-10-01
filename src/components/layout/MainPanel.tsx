import { useApp } from '@/context/AppContext';
import { Icons } from '../Icons';
import EmptyState from '../ui/EmptyState';
import ChatPanel from '../chat/ChatPanel';
import ProfilePanel from '../profile/ProfilePanel';

export default function MainPanel() {
  const { ui } = useApp();
  if (ui.tab === 'profile') return <ProfilePanel />;
  if (ui.chat) return <ChatPanel key={ui.chat} friendId={ui.chat} />;
  return (
    <EmptyState
      icon={Icons.friends}
      title="Pick a conversation"
      text="Choose a friend on the left to start chatting."
    />
  );
}