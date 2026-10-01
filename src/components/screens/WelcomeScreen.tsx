import { useApp } from '@/context/AppContext';
import { Icons } from '../Icons';
import ThemeToggle from '../ui/ThemeToggle';

export default function WelcomeScreen() {
  const { handleGoogleLogin } = useApp();
  return (
    <section id="welcome" className="screen">
      <ThemeToggle />
      <div className="card">
        <div className="logo">{Icons.logo}</div>
        <h1>Tidepool</h1>
        <p className="tag">Talk with the people you actually know.</p>
        <button className="gbtn" onClick={handleGoogleLogin}>
          <svg viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.6a4.8 4.8 0 0 1-2.1 3.1v2.6h3.4C20.9 17.9 22 15.3 22 12.2z" />
            <path fill="#34A853" d="M12 22c2.8 0 5.1-.9 6.8-2.5l-3.4-2.6c-.9.6-2.1 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H2.9v2.7A10 10 0 0 0 12 22z" />
            <path fill="#FBBC05" d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.3H2.9a10 10 0 0 0 0 9.4z" />
            <path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.9 1.5l2.9-2.9A10 10 0 0 0 2.9 7.3L6.4 10C7.2 7.7 9.4 5.9 12 5.9z" />
          </svg>
          Continue with Google
        </button>
      </div>
    </section>
  );
}