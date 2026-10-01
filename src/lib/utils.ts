export const initials = (n: string): string =>
  n.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

export const hue = (s: string): number => {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
};

export const formatTime = (t: number): string =>
  new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const matches = (
  u: { name: string; username: string },
  q: string
): boolean => !q || (u.name + u.username).toLowerCase().includes(q.toLowerCase());

export const USERNAME_RE = /^[a-zA-Z0-9_.]{3,20}$/;
export const MOBILE_RE = /^\+?[\d\s-]{7,16}$/;
export const GENDERS = ['Female', 'Male', 'Non-binary', 'Prefer not to say'] as const;