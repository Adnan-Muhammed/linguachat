import { Fragment, useEffect, useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatTime } from '@/lib/utils';
import { Icons } from '../Icons';
import Avatar from '../ui/Avatar';

export default function ChatPanel({ friendId }: { friendId: string }) {
  const { db, allUsers, typingId, closeChat, sendMessage, clearChat } = useApp();
  
  // Find target friend either in db.friends or allUsers
  const u = db.friends.find((f) => f.id === friendId) || allUsers.find((f) => f.id === friendId);
  const msgs = (u && db.messages[u.id]) || [];
  const [text, setText] = useState('');
  const [clearing, setClearing] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs.length, typingId]);

  if (!u) return null;

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    sendMessage(u.id, t);
    setText('');
  };

  const handleClear = async () => {
    if (clearing) return;
    if (window.confirm("Clear this chat?\n\nAll messages in this conversation will be cleared from your view. The other person will still have their messages.")) {
      setClearing(true);
      await clearChat(u.id);
      setClearing(false);
    }
  };

  return ( 
    <>
      <header className="chead">
        <button className="iconbtn back" onClick={closeChat} aria-label="Back">{Icons.back}</button>
        <Avatar user={u} /> 
        <div className="meta">
          <div className="nm">{u.name}</div>
          <div className="sb">@{u.username}</div>
        </div>
        <button 
          className="iconbtn" 
          onClick={handleClear} 
          disabled={clearing} 
          aria-label="Clear Chat" 
          title="Clear Chat"
          style={{ marginLeft: 'auto', opacity: clearing ? 0.5 : 1 }}
        >
          {Icons.trash}
        </button>
      </header>

      <div className="msgs" ref={listRef}>
        {msgs.length === 0 && <div className="day">Say hi 👋</div>}
        {msgs.map((m, i) => {
          const d = new Date(m.t).toDateString();
          const showDay = i === 0 || d !== new Date(msgs[i - 1].t).toDateString();
          return (
            <Fragment key={m.id || `${m.t}-${i}`}>
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