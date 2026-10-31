'use client';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Icons } from '../Icons';
import Rail from './Rail';
import ListPanel from './ListPanel';
import MainPanel from './MainPanel';
import BottomNav from './BottomNav';
import TutorDashboard from '../screens/TutorDashboard';
 
export default function AppShell() {
  const { ui, go } = useApp();
  const pathname = usePathname();
  const tutorRoute = pathname.startsWith('/tutor/');
  return (
    <div id="app" data-tab={tutorRoute ? 'tutor' : ui.tab} data-chat={ui.chat ? 'open' : ''} data-tutor-route={tutorRoute ? 'open' : undefined}>
      <Rail />
      <section className="list" id="list"><ListPanel /></section>
      <section className="main" id="main">{tutorRoute ? <TutorDashboard /> : <MainPanel />}</section>
      {ui.tab === 'friends' && <button className="fab" onClick={() => go('users')} aria-label="Find people">{Icons.plus}</button>}
      {!tutorRoute && <BottomNav />}
    </div>
  );
}
