import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  text?: string;
  children?: ReactNode;
}

export default function EmptyState({ icon, title, text, children }: EmptyStateProps) {
  return (
    <div className="empty">
      {icon}
      {title && <h3>{title}</h3>}
      {text && <p>{text}</p>}
      {children}
    </div>
  );
}