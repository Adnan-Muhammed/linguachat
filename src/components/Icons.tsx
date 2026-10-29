import type { ReactNode } from 'react';

const S = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24">{children}</svg>
);

export const Icons = {
  friends: <S><path d="M21 12a8 8 0 0 1-11.8 7L3 21l2-5.5A8 8 0 1 1 21 12z" /></S>,
  users: <S><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.5-4 3-6 6.5-6s6 2 6.5 6M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5c2 .6 3.2 2.4 3.5 5.5" /></S>,
  bell: <S><path d="M6 17V11a6 6 0 1 1 12 0v6l2 2H4zM10 21h4" /></S>,
  tutor: <S><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z" /></S>,
  structures: <S><path d="M5 4h14a2 2 0 0 1 2 2v14l-4-3H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM7 9h10M7 13h7" /></S>,
  translate: <S><path d="M4 7h13M10.5 4v3c0 5-2.5 8-6.5 10M6 11c1.2 2.2 3 3.8 5 5M15 14l3-7 3 7M16.2 12h3.6" /></S>,
  edit: <S><path d="m4 16.5-.8 4.3 4.3-.8L20 7.5 16.5 4 4 16.5zM14.8 5.7l3.5 3.5" /></S>,
  message: <S><path d="M4 4h16v13H9l-5 4V4z" /></S>,
  profile: <S><circle cx="12" cy="8" r="4" /><path d="M4 21c1-5 4-7 8-7s7 2 8 7" /></S>,
  send: <S><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" /></S>,
  back: <S><path d="m15 5-7 7 7 7" /></S>,
  moon: <S><path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z" /></S>,
  plus: <S><path d="M12 5v14M5 12h14" /></S>,
  logo: <S><path d="M3 12c3-5 6-5 9 0s6 5 9 0M3 18c3-5 6-5 9 0s6 5 9 0M3 6c3-5 6-5 9 0s6 5 9 0" /></S>,
  trash: <S><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" /></S>,
};
