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
}

export interface DirectoryUser {
  id: string;
  name: string;
  username: string;
  age: number;
  online: boolean;
}

export interface Message {
  from: string; // 'me' or a user id
  text: string;
  t: number;
}

export interface Db {
  me?: Profile;
  session?: boolean;
  friends: string[];
  sent: string[];
  incoming: string[];
  messages: Record<string, Message[]>;
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