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
    // We use a history state index to track the direction of navigation.
    // idx: 0 is the base app state
    // idx: 1 is the trap state
    let currentIndex = window.history.state?.idx;

    if (currentIndex === undefined) {
      // First time loading the app. Mark this state as base (idx 0).
      window.history.replaceState({ ...window.history.state, idx: 0 }, '');
      // Push the trap state (idx 1).
      window.history.pushState({ ...window.history.state, idx: 1 }, '');
      currentIndex = 1;
    } else if (currentIndex === 0) {
      // App remounted on the base state (e.g. via Forward navigation). Re-arm trap.
      window.history.pushState({ ...window.history.state, idx: 1 }, '');
      currentIndex = 1;
    }

    const handlePopState = (e: PopStateEvent) => {
      const newIdx = e.state?.idx;

      if (newIdx === 0 && currentIndex === 1) {
        // User pressed Browser Back (Trap -> Base)
        const confirmExit = window.confirm('Do you want to go back?');

        if (confirmExit) {
          // OK -> allow the back navigation to continue to external history
          currentIndex = -1;
          window.history.back();
        } else {
          // CANCEL -> stay in the app by going forward to the trap state
          // Using forward() instead of pushState() preserves the exact history stack
          // and prevents the bug where the second Back immediately navigates away.
          window.history.forward();
        }
      } else if (newIdx !== undefined) {
        // Navigated within our known states (e.g., Forward restored the trap)
        currentIndex = newIdx;
        
        if (currentIndex === 0) {
          // We arrived at the base state without triggering the back trap 
          // (e.g., user navigated Forward from an external site into the app).
          // We re-arm the trap seamlessly.
          window.history.pushState({ ...window.history.state, idx: 1 }, '');
          currentIndex = 1;
        }
      } else {
        // Navigated outside of our known states
        currentIndex = -1;
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