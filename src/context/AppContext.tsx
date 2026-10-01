'use client';
import {
  createContext, useCallback, useContext, useEffect, useState, type ReactNode,
} from 'react';
import { REPLIES, getUser } from '@/lib/data';
import type {
  Db, Message, Profile, Screen, Tab, Theme, ToastItem, UiState,
} from '@/types';

const KEY = 'tidepool.v1';
const EMPTY_DB: Db = { friends: [], sent: [], incoming: [], messages: {} };
const FRESH_UI: UiState = { tab: 'friends', chat: null, q: '' };

export interface AppContextValue {
  db: Db;
  ui: UiState;
  screen: Screen;
  theme: Theme;
  toasts: ToastItem[];
  typingId: string | null;
  toast: (msg: string) => void;
  toggleTheme: () => void;
  handleGoogleLogin: () => void;
  registerUser: (me: Profile) => void;
  logout: () => void;
  go: (tab: Tab) => void;
  openChat: (id: string) => void;
  closeChat: () => void;
  setQuery: (q: string) => void;
  sendFriendRequest: (id: string) => void;
  acceptFriendRequest: (id: string) => void;
  rejectFriendRequest: (id: string) => void;
  sendMessage: (id: string, text: string) => void;
  saveProfile: (data: Omit<Profile, 'id'>) => void;
}

const AppCtx = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}

function load(): Db {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...EMPTY_DB, ...JSON.parse(raw) } : EMPTY_DB;
  } catch {
    return EMPTY_DB;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false); // localStorage exists only on the client
  const [db, setDb] = useState<Db>(EMPTY_DB);
  const [screen, setScreen] = useState<Screen>('welcome');
  const [ui, setUi] = useState<UiState>(FRESH_UI);
  const [theme, setTheme] = useState<Theme>('light');
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [typingId, setTypingId] = useState<string | null>(null);

  /* ----- boot ----- */
  useEffect(() => {
    const saved = load();
    setDb(saved);
    const storedTheme = localStorage.getItem('tidepool.theme') as Theme | null;
    setTheme(
      storedTheme || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light')
    );
    setScreen(saved.me && saved.session ? 'app' : 'welcome');
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(db));
  }, [db, ready]);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('tidepool.theme', theme);
  }, [theme, ready]);

  /* ----- helpers ----- */
  const toast = useCallback((msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2500);
  }, []);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  const first = (id: string) => getUser(id).name.split(' ')[0];

  const pushMsg = (id: string, msg: Message) =>
    setDb((d) => ({
      ...d,
      messages: { ...d.messages, [id]: [...(d.messages[id] || []), msg] },
    }));

  /* ----- auth ----- */
  const handleGoogleLogin = () => {
    if (db.me) {
      setDb((d) => ({ ...d, session: true }));
      toast('Welcome back, ' + db.me.name.split(' ')[0]);
      setUi(FRESH_UI);
      setScreen('app');
    } else {
      setScreen('register');
    }
  };

  const registerUser = (me: Profile) => {
    setDb({ me, session: true, friends: [], sent: [], incoming: ['u1', 'u5'], messages: {} });
    toast('Profile saved');
    setUi(FRESH_UI);
    setScreen('app');
  };

  const logout = () => {
    setDb((d) => ({ ...d, session: false }));
    toast('Logged out');
    setScreen('welcome');
  };

  /* ----- navigation ----- */
  const go = (tab: Tab) => setUi({ tab, chat: null, q: '' });
  const openChat = (id: string) => setUi((u) => ({ ...u, chat: id, tab: 'friends' }));
  const closeChat = () => setUi((u) => ({ ...u, chat: null }));
  const setQuery = (q: string) => setUi((u) => ({ ...u, q }));

  /* ----- friends ----- */
  const sendFriendRequest = (id: string) => {
    if (db.sent.includes(id)) return;
    setDb((d) => ({ ...d, sent: [...d.sent, id] }));
    toast('Invitation sent to ' + first(id));
  };

  const acceptFriendRequest = (id: string) => {
    setDb((d) => {
      const already = d.friends.includes(id);
      return {
        ...d,
        incoming: d.incoming.filter((x) => x !== id),
        friends: already ? d.friends : [...d.friends, id],
        messages: already
          ? d.messages
          : {
              ...d.messages,
              [id]: [
                ...(d.messages[id] || []),
                { from: id, text: 'Hey! Thanks for accepting 👋', t: Date.now() },
              ],
            },
      };
    });
    toast(first(id) + ' is now your friend');
  };

  const rejectFriendRequest = (id: string) => {
    setDb((d) => ({ ...d, incoming: d.incoming.filter((x) => x !== id) }));
    toast('Request removed');
  };

  /* ----- chat ----- */
  const sendMessage = (id: string, text: string) => {
    pushMsg(id, { from: 'me', text, t: Date.now() });
    setTypingId(id);
    setTimeout(() => {
      pushMsg(id, {
        from: id,
        text: REPLIES[Math.floor(Math.random() * REPLIES.length)],
        t: Date.now(),
      });
      setTypingId((t) => (t === id ? null : t));
    }, 1400);
  };

  /* ----- profile ----- */
  const saveProfile = (data: Omit<Profile, 'id'>) => {
    setDb((d) => (d.me ? { ...d, me: { ...d.me, ...data } } : d));
    toast('Profile updated');
  };

  if (!ready) return null;

  return (
    <AppCtx.Provider
      value={{
        db, ui, screen, theme, toasts, typingId,
        toast, toggleTheme, handleGoogleLogin, registerUser, logout,
        go, openChat, closeChat, setQuery,
        sendFriendRequest, acceptFriendRequest, rejectFriendRequest,
        sendMessage, saveProfile,
      }}
    >
      {children}
    </AppCtx.Provider>
  );
}