import React, { useEffect, useRef } from 'react';
import { BellOff, CheckCheck } from 'lucide-react';
import { useData } from '../context/DataContext';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationPanel({ onClose }) {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useData();
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute right-0 top-12 w-80 max-w-[90vw] card p-2 z-50 animate-slide-up">
      <div className="flex items-center justify-between px-2 py-1.5">
        <p className="font-display font-semibold text-sm">Notifications</p>
        {notifications.length > 0 && (
          <button onClick={markAllNotificationsRead} className="text-xs text-moss-600 flex items-center gap-1 hover:underline">
            <CheckCheck size={13} /> Mark all read
          </button>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-ink-300 gap-2">
            <BellOff size={22} />
            <p className="text-xs">No notifications yet.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={`w-full text-left px-2.5 py-2.5 rounded-lg text-sm mb-1 transition-colors ${
                n.read ? 'opacity-60' : 'bg-ink-50 dark:bg-ink-700'
              } hover:bg-ink-50 dark:hover:bg-ink-700`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-ink-800 dark:text-paper">{n.title}</p>
                {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-moss-500 shrink-0" />}
              </div>
              <p className="text-xs text-ink-400 dark:text-ink-200 mt-0.5">{n.message}</p>
              <p className="text-[10px] text-ink-300 mt-1">{timeAgo(n.created_at)}</p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
