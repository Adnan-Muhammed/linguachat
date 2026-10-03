import type { CSSProperties } from 'react';
import { hue, initials } from '@/lib/utils';

interface AvatarProps {
  user: { name: string; online?: boolean; avatar_url?: string };
  big?: boolean;
  dot?: boolean;
  style?: CSSProperties;
  title?: string;
}

export default function Avatar({ user, big, dot, style, title }: AvatarProps) {
  return (
    <div
      className={`av ${big ? 'lg' : ''}`}
      style={{
        background: user.avatar_url
          ? `url(${user.avatar_url}) center/cover`
          : `hsl(${hue(user.name)} 45% 40%)`,
        ...style,
      }}
      title={title}
    >
      {user.avatar_url ? null : initials(user.name)}
      {dot && <i className={`dot ${user.online ? 'on' : ''}`} />}
    </div>
  );
}