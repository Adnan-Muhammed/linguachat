

'use client';
import {
  createContext, useCallback, useContext, useEffect, useState, useRef, type ReactNode,
} from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  getCurrentProfile, createOrUpdateProfile,
} from '@/actions/profile';
import {
  fetchUsersList, fetchSentRequests, fetchIncomingRequests,
  respondFriendRequestAction, sendFriendRequestAction, fetchFriends,
} from '@/actions/friends';
import {
  fetchMessages, sendMessageAction,
} from '@/actions/messages';
import { signOutAction } from '@/actions/auth';
import type {
  Db, DirectoryUser, Message, Profile, Screen, Tab, Theme, ToastItem, UiState,
} from '@/types';

const EMPTY_DB: Db = { friends: [], sent: [], incoming: [], messages: {} };
const FRESH_UI: UiState = { tab: 'friends', chat: null, q: '' };

export interface AppContextValue {
  db: Db;
  ui: UiState;
  screen: Screen;
  theme: Theme;
  toasts: ToastItem[];
  typingId: string | null;
  loading: boolean;
  toast: (msg: string) => void;
  toggleTheme: () => void;
  handleGoogleLogin: () => Promise<void>;
  registerUser: (me: Profile) => Promise<void>;
  logout: () => Promise<void>;
  go: (tab: Tab) => void;
  openChat: (id: string) => void;
  closeChat: () => void;
  setQuery: (q: string) => void; 
  sendFriendRequest: (id: string) => Promise<void>;
  acceptFriendRequest: (id: string) => Promise<void>;
  rejectFriendRequest: (id: string) => Promise<void>;
  sendMessage: (id: string, text: string) => Promise<void>;
  saveProfile: (data: Omit<Profile, 'id'>) => Promise<void>;
  allUsers: DirectoryUser[];
  refreshData: () => Promise<void>;
}

const AppCtx = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [db, setDb] = useState<Db>(EMPTY_DB);
  const [allUsers, setAllUsers] = useState<DirectoryUser[]>([]);
  const [screen, setScreen] = useState<Screen>('welcome');
  const [ui, setUi] = useState<UiState>(FRESH_UI);
  const [theme, setTheme] = useState<Theme>('light');
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [typingId, setTypingId] = useState<string | null>(null);

  const supabase = createClient();

  const loadData = useCallback(async () => {
    try {
      const profile = await getCurrentProfile();
      if (!profile) {
        setScreen('welcome');
        setLoading(false);
        return;
      }

      setScreen('app');
      const [users, sentReqs, incomingReqs, friendsList] = await Promise.all([
        fetchUsersList(),
        fetchSentRequests(),
        fetchIncomingRequests(),
        fetchFriends(),
      ]);

      setAllUsers(users);
      setDb((prev) => ({
        ...prev,
        me: profile,
        session: true,
        friends: friendsList,
        sent: sentReqs,
        incoming: incomingReqs,
        messages: prev.messages || {}, // Fixed: Do not overwrite existing messages
      }));
    } catch (e) {
      console.error('Failed loading data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ----- helpers ----- */
  const toast = useCallback((msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2500);
  }, []);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  useEffect(() => {
    const storedTheme = localStorage.getItem('tidepool.theme') as Theme | null;
    // eslint-disable-next-line
    setTheme(
      storedTheme || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light')
    );

    const params = new URLSearchParams(window.location.search);
    const screenParam = params.get('screen') as Screen | null;

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const profile = await getCurrentProfile();
        if (!profile) {
          setScreen('register');
          setDb((d) => ({ ...d, session: true, me: profile || undefined }));
          setLoading(false);
        } else {
          await loadData();
          setUi((u) => ({ ...u, tab: 'friends' }));
        }
      } else {
        setScreen('welcome');
        setLoading(false);
      }
      setReady(true);
      
      if (screenParam) {
        const url = new URL(window.location.href);
        url.searchParams.delete('screen');
        window.history.replaceState({}, document.title, url.toString());
      }
    });
  }, [loadData, supabase]);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('tidepool.theme', theme);
  }, [theme, ready]);

  // Realtime message subscription when chatting
  useEffect(() => {
    if (!ui.chat || !db.me?.id) return;
    const friendId = ui.chat;

    if (!db.messages[friendId]) {
      fetchMessages(friendId).then((msgs) => {
        setDb((d) => ({
          ...d,
          messages: { ...d.messages, [friendId]: msgs },
        }));
      });
    }

    const channel = supabase
      .channel(`chat:${ui.chat}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${db.me.id}`,
        },
        (payload) => {
          if (payload.new.sender_id === friendId) {
            const newMsg: Message = {
              id: payload.new.id,
              from: friendId,
              text: payload.new.content,
              t: new Date(payload.new.created_at).getTime(),
            };
            setDb((d) => ({
              ...d,
              messages: {
                ...d.messages,
                [friendId]: [...(d.messages[friendId] || []), newMsg],
              },
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.chat, db.me?.id, supabase]);

  // 🚀 Fixed: Realtime friend requests subscription
  const allUsersRef = useRef<DirectoryUser[]>([]);
  useEffect(() => {
    allUsersRef.current = allUsers;
  }, [allUsers]);

  useEffect(() => {
    if (!db.me?.id) return;
    const myId = db.me.id;

    const channel = supabase
      .channel('friend_requests_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'friend_requests',
          filter: `receiver_id=eq.${myId}` // Only listen to requests coming to ME
        },
        (payload) => {
          const senderId = payload.new.sender_id;
          const senderUser = allUsersRef.current.find((u) => u.id === senderId);
          if (senderUser) {
            setDb((d) => {
              if (d.incoming.some(u => u.id === senderId)) return d;
              return { ...d, incoming: [...d.incoming, senderUser] };
            });
            toast('You have a new friend request from ' + senderUser.name.split(' ')[0]);
          } else {
             // Fallback
             fetchIncomingRequests().then(reqs => setDb(d => ({...d, incoming: reqs})));
             toast('You have a new friend request!');
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'friend_requests',
        },
        (payload) => {
          if (payload.new.status === 'accepted') {
            if (payload.new.sender_id === myId) {
              const receiverId = payload.new.receiver_id;
              const receiverUser = allUsersRef.current.find((u) => u.id === receiverId);
              
              if (receiverUser) {
                setDb((d) => {
                  if (d.friends.some(f => f.id === receiverId)) return d;
                  return {
                    ...d,
                    sent: d.sent.filter(id => id !== receiverId),
                    friends: [...d.friends, receiverUser]
                  };
                });
                toast('Your friend request was accepted!');
              } else {
                fetchFriends().then(f => setDb(d => ({...d, friends: f})));
                toast('Your friend request was accepted!');
              }
            } else if (payload.new.receiver_id === myId) {
              const senderId = payload.new.sender_id;
              const senderUser = allUsersRef.current.find((u) => u.id === senderId);

              if (senderUser) {
                setDb((d) => {
                  if (d.friends.some(f => f.id === senderId)) return d;
                  return {
                    ...d,
                    incoming: d.incoming.filter(u => u.id !== senderId),
                    friends: [...d.friends, senderUser]
                  };
                });
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [db.me?.id, supabase, toast]);

  /* ----- auth ----- */
  const handleGoogleLogin = async () => {
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
        queryParams: { prompt: 'select_account' },
      },
    });
    if (error) toast('Login failed: ' + error.message);
  };

  const registerUser = async (meData: Profile) => {
    try {
      await createOrUpdateProfile(meData);
      toast('Profile saved');
      await loadData();
      setUi(FRESH_UI);
      setScreen('app');
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      await signOutAction();
    } catch (e) {
      console.error('Logout error:', e);
    }
    
    const currentTheme = localStorage.getItem('tidepool.theme');
    localStorage.clear();
    sessionStorage.clear();
    if (currentTheme) localStorage.setItem('tidepool.theme', currentTheme);
    
    setDb(EMPTY_DB);
    setUi(FRESH_UI);
    setTypingId(null);
    setAllUsers([]);
    setToasts([]);
    toast('Logged out');
    setScreen('welcome');
    window.location.replace('/');
  };

  /* ----- navigation ----- */
  const go = (tab: Tab) => setUi({ tab, chat: null, q: '' });
  const openChat = (id: string) => setUi((u) => ({ ...u, chat: id, tab: 'friends' }));
  const closeChat = () => setUi((u) => ({ ...u, chat: null }));
  const setQuery = (q: string) => setUi((u) => ({ ...u, q }));

  /* ----- friends ----- */
  const sendFriendRequest = async (id: string) => {
    if (db.sent.includes(id)) return;
    try {
      await sendFriendRequestAction(id);
      setDb((d) => ({ ...d, sent: [...d.sent, id] }));
      const targetUser = allUsers.find((u) => u.id === id);
      toast('Invitation sent to ' + (targetUser ? targetUser.name.split(' ')[0] : 'user'));
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Failed to send request');
    }
  };

  const acceptFriendRequest = async (id: string) => {
    try {
      await respondFriendRequestAction(id, 'accepted');
      const targetUser = db.incoming.find((u) => u.id === id);
      toast((targetUser ? targetUser.name.split(' ')[0] : 'User') + ' is now your friend');
      // The realtime UPDATE event will handle updating the lists automatically
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Failed to accept request');
    }
  };

  const rejectFriendRequest = async (id: string) => {
    try {
      await respondFriendRequestAction(id, 'rejected');
      setDb((d) => ({ ...d, incoming: d.incoming.filter((x) => x.id !== id) }));
      toast('Request removed');
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Failed to reject request');
    }
  };

  // Realtime Profiles (New Users) subscription
  useEffect(() => {
    const channel = supabase
      .channel('public:profiles_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          const newUser = payload.new as DirectoryUser;
          
          // ബാക്ക്ഗ്രൗണ്ടിൽ പുതിയ യൂസറെ allUsers ലിസ്റ്റിലേക്ക് ആഡ് ചെയ്യുന്നു (നോട്ടിഫിക്കേഷൻ ഇല്ലാതെ)
          setAllUsers((prevUsers) => {
            // യൂസർ ഇതിനകം ലിസ്റ്റിൽ ഉണ്ടോ എന്ന് പരിശോധിക്കുന്നു (ഡ്യൂപ്ലിക്കേഷൻ ഒഴിവാക്കാൻ)
            if (prevUsers.some((u) => u.id === newUser.id)) return prevUsers;
            
            return [...prevUsers, newUser];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  /* ----- chat ----- */
  const sendMessage = async (id: string, text: string) => {
    try {
      const sentMsg = await sendMessageAction(id, text);
      if (sentMsg) {
        setDb((d) => ({
          ...d,
          messages: { ...d.messages, [id]: [...(d.messages[id] || []), sentMsg] },
        }));
      }
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Failed to send message');
    }
  };

  /* ----- profile ----- */
  const saveProfile = async (data: Omit<Profile, 'id'>) => {
    try {
      await createOrUpdateProfile(data);
      setDb((d) => (d.me ? { ...d, me: { ...d.me, ...data } } : d));
      toast('Profile updated');
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Failed to update profile');
    }
  };

  if (!ready) return null;

  return (
    <AppCtx.Provider
      value={{ 
        db, ui, screen, theme, toasts, typingId, loading,
        toast, toggleTheme, handleGoogleLogin, registerUser, logout,
        go, openChat, closeChat, setQuery,
        sendFriendRequest, acceptFriendRequest, rejectFriendRequest,
        sendMessage, saveProfile, allUsers, refreshData: loadData,
      }}
    >
      {children}
    </AppCtx.Provider>
  );
}