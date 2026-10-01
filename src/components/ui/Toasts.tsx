import { useApp } from '@/context/AppContext';

export default function Toasts() {
  const { toasts } = useApp();
  return (
    <div id="toasts" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="toast">{t.msg}</div>
      ))}
    </div>
  );
}