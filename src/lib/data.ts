import type { DirectoryUser } from '@/types';

export const USERS: DirectoryUser[] = [
  { id: 'u1', name: 'Rahul Nair', username: 'rahul_n', age: 27, online: true },
  { id: 'u2', name: 'Ahmed Khan', username: 'ahmedk', age: 31, online: false },
  { id: 'u3', name: 'Arjun Menon', username: 'arjun.m', age: 24, online: true },
  { id: 'u4', name: 'Fathima Noor', username: 'fathima', age: 26, online: true },
  { id: 'u5', name: 'Sarah Collins', username: 'sarahc', age: 29, online: false },
  { id: 'u6', name: 'Daniel Reyes', username: 'dan_reyes', age: 33, online: true },
];

export const REPLIES: string[] = [
  'Sounds good!',
  'Haha, nice 😄',
  'Let me check and get back to you.',
  'Can we talk later today?',
  'Perfect, see you then.',
  'Really? Tell me more.',
];

export const getUser = (id: string): DirectoryUser =>
  USERS.find((u) => u.id === id)!;