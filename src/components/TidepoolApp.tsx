'use client';
import { AppProvider, useApp } from '@/context/AppContext';
import WelcomeScreen from './screens/WelcomeScreen';
import RegisterScreen from './screens/RegisterScreen';
import AppShell from './layout/AppShell';
import Toasts from './ui/Toasts';

function Screens() {
  const { screen } = useApp();
  if (screen === 'app') return <AppShell />;
  if (screen === 'register') return <RegisterScreen />;
  return <WelcomeScreen />;
}

export default function TidepoolApp() {
  return (
    <AppProvider>
      <Screens />
      <Toasts />
    </AppProvider>
  );
}