import type { CSSProperties } from 'react';
import { hue, initials } from '@/lib/utils';

interface AvatarProps {
  user: { name: string; online?: boolean };
  big?: boolean;
  dot?: boolean;
  style?: CSSProperties;
  title?: string;
}

export default function Avatar({ user, big, dot, style, title }: AvatarProps) {
  return (
    <div
      className={`av ${big ? 'lg' : ''}`}
      style={{ background: `hsl(${hue(user.name)} 45% 40%)`, ...style }}
      title={title}
    >
      {initials(user.name)}
      {dot && <i className={`dot ${user.online ? 'on' : ''}`} />}
    </div>
  );
}