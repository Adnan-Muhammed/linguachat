import { useApp } from '@/context/AppContext';
import { Icons } from '../Icons';
import Rail from './Rail';
import ListPanel from './ListPanel';
import MainPanel from './MainPanel';
import BottomNav from './BottomNav';
 
export default function AppShell() {
  const { ui, go } = useApp();
  return (
    <div id="app" data-tab={ui.tab} data-chat={ui.chat ? 'open' : ''}>
      <Rail />
      <section className="list" id="list"><ListPanel /></section>
      <section className="main" id="main"><MainPanel /></section>
      <button className="fab" onClick={() => go('users')} aria-label="Find people">{Icons.plus}</button>
      <BottomNav />
    </div>
  );
}