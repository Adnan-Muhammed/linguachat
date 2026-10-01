import { Fragment, useEffect, useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { getUser } from '@/lib/data';
import { formatTime } from '@/lib/utils';
import { Icons } from '../Icons';
import Avatar from '../ui/Avatar';

export default function ChatPanel({ friendId }: { friendId: string }) {
  const { db, typingId, closeChat, sendMessage } = useApp();
  const u = getUser(friendId);
  const msgs = db.messages[u.id] || [];
  const [text, setText] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs.length, typingId]);

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    sendMessage(u.id, t);
    setText('');
  };

  return (
    <>
      <header className="chead">
        <button className="iconbtn back" onClick={closeChat} aria-label="Back">{Icons.back}</button>
        <Avatar user={u} dot />
        <div className="meta">
          <div className="nm">{u.name}</div>
          <div className="sb">@{u.username} · {u.online ? 'Online' : 'Offline'}</div>
        </div>
      </header>

      <div className="msgs" ref={listRef}>
        {msgs.length === 0 && <div className="day">Say hi 👋</div>}
        {msgs.map((m, i) => {
          const d = new Date(m.t).toDateString();
          const showDay = i === 0 || d !== new Date(msgs[i - 1].t).toDateString();
          return (
            <Fragment key={`${m.t}-${i}`}>
              {showDay && <div className="day">{d === new Date().toDateString() ? 'Today' : d}</div>}
              <div className={`msg ${m.from === 'me' ? 'out' : 'in'}`}>
                {m.text}
                <time>{formatTime(m.t)}</time>
              </div>
            </Fragment>
          );
        })}
        {typingId === u.id && <div className="typing">{u.name.split(' ')[0]} is typing…</div>}
      </div>

      <div className="composer">
        <input
          placeholder="Message"
          aria-label="Message"
          autoComplete="off"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); submit(); }
          }}
        />
        <button className="send" onClick={submit} aria-label="Send">{Icons.send}</button>
      </div>
    </>
  );
}