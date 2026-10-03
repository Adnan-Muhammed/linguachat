'use client';
import { AppProvider, useApp } from '@/context/AppContext';
import WelcomeScreen from './screens/WelcomeScreen';
import RegisterScreen from './screens/RegisterScreen';
import AppShell from './layout/AppShell';
import Toasts from './ui/Toasts';
import Spinner from './ui/Spinner';

function Screens() {
  const { screen, loading } = useApp();
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw' }}>
        <Spinner size={48} color="var(--acc)" />
      </div>
    );
  }

  if (screen === 'app') return <AppShell />;
  if (screen === 'register') return <RegisterScreen />;
  return <WelcomeScreen />;
}

export default function LinguaChatApp() {
  return (
    <AppProvider>
      <Screens />
      <Toasts />
    </AppProvider>
  );
}