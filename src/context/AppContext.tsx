

'use client';
import {
  createContext, useCallback, useContext, useEffect, useMemo, useState, useRef, type ReactNode,
} from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  getCurrentProfile, createOrUpdateProfile,
} from '@/actions/profile';
import {
  fetchUsersList, fetchSentRequests, fetchIncomingRequests,
  respondFriendRequestAction, sendFriendRequestAction, fetchFriends, cancelFriendRequestAction
} from '@/actions/friends';
import {
  fetchMessages, clearChatAction
} from '@/actions/messages';
import { signOutAction } from '@/actions/auth';
import type {
  Db, DirectoryUser, Message, Profile, Screen, Tab, Theme, ToastItem, UiState,
} from '@/types';
import Spinner from '@/components/ui/Spinner';

const EMPTY_DB: Db = { friends: [], sent: [], incoming: [], messages: {}, unreadCounts: {} };
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
  cancelFriendRequest: (id: string) => Promise<void>;
  sendMessage: (id: string, text: string) => Promise<void>;
  saveProfile: (data: Omit<Profile, 'id'>) => Promise<void>;
  clearChat: (id: string) => Promise<void>;
  allUsers: DirectoryUser[];
  refreshData: () => Promise<void>;
  isFetchingUsers: boolean;
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
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);

  // Stable reference prevents Realtime subscription churn on re-renders
  const supabase = useMemo(() => createClient(), []);

  const loadData = useCallback(async (existingProfile?: Profile | null) => {
    try {
      const profile = existingProfile !== undefined ? existingProfile : await getCurrentProfile();
      if (!profile) {
        setScreen('welcome');
        setLoading(false);
        return;
      }

      setScreen('app');
      let unreadCounts = {};
      try {
        const stored = localStorage.getItem(`linguachat.unread.${profile.id}`);
        if (stored) {
          unreadCounts = JSON.parse(stored);
        }
      } catch (e) {
        console.error('Failed to parse unread counts', e);
      }

      const friendsList = await fetchFriends();

      setDb((prev) => ({
        ...prev,
        me: profile,
        session: true,
        friends: friendsList,
        messages: prev.messages || {}, // Fixed: Do not overwrite existing messages
        unreadCounts,
      }));
      setLoading(false);

      // Background Load
      Promise.all([
        fetchSentRequests(),
        fetchIncomingRequests(),
      ]).then(([sentReqs, incomingReqs]) => {
        setDb((prev) => ({
          ...prev,
          sent: sentReqs,
          incoming: incomingReqs,
        }));
      }).catch(e => console.error('Failed loading background data:', e));

    } catch (e) {
      console.error('Failed loading data:', e);
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
    const storedTheme = localStorage.getItem('linguachat.theme') as Theme | null;
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
          const googleMe: Partial<Profile> = {
            id: user.id,
            name: user.user_metadata?.full_name || user.user_metadata?.name || '',
            email: user.email,
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
          };
          setDb((d) => ({ ...d, session: true, me: googleMe as Profile }));
          setLoading(false);
        } else {
          await loadData(profile);
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
    localStorage.setItem('linguachat.theme', theme);
  }, [theme, ready]);

  useEffect(() => {
    if (db.me?.id && db.unreadCounts) {
      localStorage.setItem(`linguachat.unread.${db.me.id}`, JSON.stringify(db.unreadCounts));
    }
  }, [db.unreadCounts, db.me?.id]);

  const uiChatRef = useRef(ui.chat);
  useEffect(() => { uiChatRef.current = ui.chat; }, [ui.chat]);

  // Global messages Realtime subscription
  useEffect(() => {
    if (!db.me?.id) return;
    const myId = db.me.id;

    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${myId}`,
        },
        (payload) => {
          const msg = payload.new;
          const senderId = msg.sender_id;

          if (uiChatRef.current === senderId) {
            // Chat is currently open
            const newMsg: Message = {
              id: msg.id,
              from: senderId,
              text: msg.content,
              t: new Date(msg.created_at).getTime(),
            };
            setDb((d) => {
              const msgTime = new Date(msg.created_at).getTime();
              if (d.chatClears?.[senderId] && msgTime <= d.chatClears[senderId]) return d;

              const existingMsgs = d.messages[senderId] || [];
              if (existingMsgs.some((m) => m.id === msg.id)) return d;
              return {
                ...d,
                messages: {
                  ...d.messages,
                  [senderId]: [...existingMsgs, newMsg],
                },
              };
            });
          } else {
            // Chat is NOT open, increment unread count and add message for preview
            const newMsg: Message = {
              id: msg.id,
              from: senderId,
              text: msg.content,
              t: new Date(msg.created_at).getTime(),
            };

            setDb((d) => {
              const msgTime = new Date(msg.created_at).getTime();
              if (d.chatClears?.[senderId] && msgTime <= d.chatClears[senderId]) return d;

              const existingMsgs = d.messages[senderId] || [];
              if (existingMsgs.some((m) => m.id === msg.id)) return d;
              return {
                ...d,
                messages: {
                  ...d.messages,
                  [senderId]: [...existingMsgs, newMsg],
                },
                unreadCounts: {
                  ...d.unreadCounts,
                  [senderId]: (d.unreadCounts?.[senderId] || 0) + 1,
                }
              };
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [db.me?.id, supabase]);

  // When a chat is opened
  useEffect(() => {
    if (!ui.chat || !db.me?.id) return;
    const friendId = ui.chat;

    if (!db.messages[friendId]) {
      fetchMessages(friendId).then(({ msgs, clearedAt }) => {
        setDb((d) => ({
          ...d,
          messages: { ...d.messages, [friendId]: msgs },
          chatClears: clearedAt ? { ...d.chatClears, [friendId]: clearedAt } : d.chatClears,
        }));
      });
    }

    // Mark as read immediately when chat is opened
    setDb((d) => {
      if (!d.unreadCounts[friendId]) return d; // already 0
      return {
        ...d,
        unreadCounts: { ...d.unreadCounts, [friendId]: 0 }
      };
    });
    
  }, [ui.chat, db.me?.id]);

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
          } else if (payload.new.status === 'rejected' || payload.new.status === 'cancelled') {
            if (payload.new.sender_id === myId) {
              setDb((d) => ({ ...d, sent: d.sent.filter(id => id !== payload.new.receiver_id) }));
            } else if (payload.new.receiver_id === myId) {
              setDb((d) => ({ ...d, incoming: d.incoming.filter(u => u.id !== payload.new.sender_id) }));
            }
          } else if (payload.new.status === 'pending') {
            if (payload.new.sender_id === myId) {
              setDb((d) => ({ ...d, sent: Array.from(new Set([...d.sent, payload.new.receiver_id])) }));
            } else if (payload.new.receiver_id === myId) {
              const senderUser = allUsersRef.current.find((u) => u.id === payload.new.sender_id);
              if (senderUser) {
                setDb((d) => {
                  if (d.incoming.some(u => u.id === payload.new.sender_id)) return d;
                  return { ...d, incoming: [...d.incoming, senderUser] };
                });
                toast('You have a new friend request from ' + senderUser.name.split(' ')[0]);
              } else {
                fetchIncomingRequests().then(reqs => setDb(d => ({...d, incoming: reqs})));
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
      await loadData(meData);
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
    
    const currentTheme = localStorage.getItem('linguachat.theme');
    localStorage.clear();
    sessionStorage.clear();
    if (currentTheme) localStorage.setItem('linguachat.theme', currentTheme);
    
    setDb(EMPTY_DB);
    setUi(FRESH_UI);
    setTypingId(null);
    setAllUsers([]);
    usersFetchedRef.current = false;
    setToasts([]);
    toast('Logged out');
    setScreen('welcome');
    window.location.replace('/');
  };

  const usersFetchedRef = useRef(false);

  /* ----- navigation ----- */
  const go = (tab: Tab) => {
    setUi({ tab, chat: null, q: '' });
    if (tab === 'users' && !usersFetchedRef.current) {
      usersFetchedRef.current = true;
      setIsFetchingUsers(true);
      fetchUsersList().then(users => {
        setAllUsers(users);
        setIsFetchingUsers(false);
      }).catch(e => {
        usersFetchedRef.current = false;
        setIsFetchingUsers(false);
        console.error('Failed to fetch users:', e);
      });
    }
  };
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

  const cancelFriendRequest = async (id: string) => {
    try {
      await cancelFriendRequestAction(id);
      setDb((d) => ({ ...d, sent: d.sent.filter((x) => x !== id) }));
      toast('Request cancelled');
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Failed to cancel request');
    }
  };

  // Realtime Profiles (New Users) subscription
  useEffect(() => {
    if (!db.me?.id) return;

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
          if (payload.new.id === db.me?.id) return;

          const newProfile = payload.new;
          
          const newUser: DirectoryUser = {
            id: newProfile.id,
            name: newProfile.name,
            username: newProfile.username,
            age: Number(newProfile.age),
            gender: newProfile.gender,
            mobile: newProfile.mobile,
            avatar_url: newProfile.avatar_url,
            online: true,
          };
          
          setAllUsers((prevUsers) => {
            if (prevUsers.some((u) => u.id === newUser.id)) return prevUsers;
            return [...prevUsers, newUser];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, db.me?.id]);

  /* ----- chat ----- */
  const clearChat = async (id: string) => {
    try {
      await clearChatAction(id);
      setDb((d) => ({
        ...d,
        messages: { ...d.messages, [id]: [] },
        chatClears: { ...d.chatClears, [id]: Date.now() },
      }));
      toast('Chat cleared');
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Failed to clear chat');
    }
  };

  const sendMessage = async (id: string, text: string) => {
    if (!db.me?.id) return;

    // Optimistic UI: show message instantly before DB confirms
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const optimisticMsg: Message = { id: tempId, from: 'me', text, t: Date.now() };

    setDb((d) => ({
      ...d,
      messages: { ...d.messages, [id]: [...(d.messages[id] || []), optimisticMsg] },
    }));

    try {
      // Direct browser client insert — skips Vercel serverless function
      const { data, error } = await supabase
        .from('messages')
        .insert({ sender_id: db.me!.id, receiver_id: id, content: text })
        .select('id, content, created_at')
        .single();

      if (error || !data) throw new Error(error?.message || 'Failed to send message');

      // Replace temp message with confirmed DB message
      const confirmedMsg: Message = {
        id: data.id,
        from: 'me',
        text: data.content,
        t: new Date(data.created_at).getTime(),
      };
      setDb((d) => ({
        ...d,
        messages: {
          ...d.messages,
          [id]: (d.messages[id] || []).map((m) => m.id === tempId ? confirmedMsg : m),
        },
      }));
    } catch (e: unknown) {
      // Remove optimistic message on failure
      setDb((d) => ({
        ...d,
        messages: {
          ...d.messages,
          [id]: (d.messages[id] || []).filter((m) => m.id !== tempId),
        },
      }));
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

  const ctxValue = useMemo<AppContextValue>(() => ({
    db, ui, screen, theme, toasts, typingId, loading,
    toast, toggleTheme, handleGoogleLogin, registerUser, logout,
    go, openChat, closeChat, setQuery,
    sendFriendRequest, acceptFriendRequest, rejectFriendRequest, cancelFriendRequest,
    sendMessage, saveProfile, clearChat, allUsers, refreshData: loadData, isFetchingUsers,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [
    db, ui, screen, theme, toasts, typingId, loading,
    allUsers, isFetchingUsers,
    // stable callbacks (useCallback or defined once)
    toast, toggleTheme, loadData,
  ]);

  if (!ready) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw' }}>
        <Spinner size={48} color="var(--acc)" />
      </div>
    );
  }

  return (
    <AppCtx.Provider value={ctxValue}> 
      {children}
    </AppCtx.Provider>
  );
}