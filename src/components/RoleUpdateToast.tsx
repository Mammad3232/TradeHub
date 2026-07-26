import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

/**
 * Renders a full-screen overlay + centered toast when the backend fires a
 * "RoleUpdated" SignalR event targeting this user's active session.
 *
 * The NotificationContext already handles:
 *   - setting roleUpdateToast with the message string
 *   - clearing localStorage & navigating to /login after 3 s
 *
 * This component is purely presentational – it just reads roleUpdateToast
 * from context and shows the UI.
 */
export const RoleUpdateToast: React.FC = () => {
  const { roleUpdateToast } = useNotifications();

  if (!roleUpdateToast) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300"
      aria-live="assertive"
      role="alert"
    >
      {/* Card */}
      <div className="mx-4 max-w-md w-full bg-slate-900 border-2 border-amber-500/70 rounded-2xl shadow-2xl shadow-amber-500/10 p-6 flex flex-col items-center gap-4 animate-in zoom-in-95 duration-300">
        {/* Icon ring */}
        <div className="p-4 rounded-full bg-amber-500/10 border border-amber-500/30">
          <ShieldAlert className="w-8 h-8 text-amber-400" />
        </div>

        {/* Title */}
        <h2 className="text-lg font-bold text-white text-center leading-snug">
          Account Permissions Updated
        </h2>

        {/* Message */}
        <p className="text-sm text-slate-300 text-center leading-relaxed">
          {roleUpdateToast}
        </p>

        {/* Auto-logout progress hint */}
        <div className="w-full">
          <p className="text-xs text-slate-500 text-center mb-2">
            Logging you out automatically…
          </p>
          {/* Animated progress bar — drains in ~3 s matching the context timeout */}
          <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full"
              style={{
                animation: 'drain 3s linear forwards',
              }}
            />
          </div>
        </div>
      </div>

      {/* Inline keyframe – tailwind can't define arbitrary keyframes inline */}
      <style>{`
        @keyframes drain {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
};
