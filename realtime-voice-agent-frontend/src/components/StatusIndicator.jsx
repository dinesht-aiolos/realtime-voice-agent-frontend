/**
 * src/components/StatusIndicator.jsx
 * ─────────────────────────────────────
 * Pulsing badge that shows the current agent state.
 */

import { STATUS } from "../hooks/useVoiceAgent";

const CONFIG = {
  [STATUS.IDLE]:       { label: "Idle",        color: "bg-gray-400",   pulse: false },
  [STATUS.CONNECTING]: { label: "Connecting…", color: "bg-yellow-400", pulse: true  },
  [STATUS.READY]:      { label: "Ready",       color: "bg-green-400",  pulse: false },
  [STATUS.LISTENING]:  { label: "Listening…",  color: "bg-blue-500",   pulse: true  },
  [STATUS.THINKING]:   { label: "Thinking…",   color: "bg-purple-500", pulse: true  },
  [STATUS.SPEAKING]:   { label: "Speaking…",   color: "bg-orange-400", pulse: true  },
  [STATUS.ERROR]:      { label: "Error",       color: "bg-red-500",    pulse: false },
};

export function StatusIndicator({ status }) {
  const { label, color, pulse } = CONFIG[status] || CONFIG[STATUS.IDLE];

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-3 w-3">
        {pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-3 w-3 ${color}`} />
      </span>
      <span className="text-sm font-medium text-gray-600">{label}</span>
    </div>
  );
}