'use client';
import { useEffect } from 'react';
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
  useEffect(() => {
    // Only push a trap state if one doesn't exist to prevent infinite history loops
    if (!window.history.state?.trap) {
      window.history.pushState({ trap: true }, '', window.location.href);
    }

    const handlePopState = () => {
      // Prompt user natively
      const confirmExit = window.confirm('Do you want to go back?');

      if (confirmExit) {
        // YES -> go back to the original previous history entry
        window.history.back();
      } else {
        // NO -> trap the back button again to stay on the app
        window.history.pushState({ trap: true }, '', window.location.href);
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <AppProvider>
      <Screens />
      <Toasts />
    </AppProvider>
  );
}