export type Tab = 'friends' | 'users' | 'requests' | 'profile';
export type Screen = 'welcome' | 'register' | 'app';
export type Theme = 'light' | 'dark';

export interface Profile {
  id: string;
  name: string;
  username: string;
  age: number;
  gender: string;
  mobile: string;
  email?: string;
  avatar_url?: string;
}

export interface DirectoryUser {
  id: string;
  name: string;
  username: string;
  age: number;
  gender?: string;
  mobile?: string;
  online: boolean;
  avatar_url?: string;
}

export interface Message {
  id?: string;
  from: string; // 'me' or a user id
  text: string;
  t: number;
}

export interface Db {
  me?: Profile;
  session?: boolean;
  friends: DirectoryUser[];
  sent: string[]; // target user IDs where current user sent request
  incoming: DirectoryUser[]; // users who sent request to current user
  messages: Record<string, Message[]>;
  unreadCounts: Record<string, number>;
  chatClears?: Record<string, number>;
}

export interface UiState {
  tab: Tab;
  chat: string | null;
  q: string;
}

export interface ToastItem {
  id: number;
  msg: string;
}