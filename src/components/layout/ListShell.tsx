import type { ReactNode } from 'react';
import { useApp } from '@/context/AppContext';

interface ListShellProps {
  title: string;
  search?: boolean;
  children: ReactNode;
}

export default function ListShell({ title, search, children }: ListShellProps) {
  const { ui, setQuery } = useApp();
  return (
    <>
      <div className="lhead"><h2>{title}</h2></div>
      <div className="sheet">
        {search && (
          <input
            className="search"
            placeholder="Search"
            aria-label="Search"
            value={ui.q}
            onChange={(e) => setQuery(e.target.value)}
          />
        )}
        <div className="lbody">{children}</div>
      </div>
    </>
  );
}