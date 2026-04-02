
/**
 * src/components/VoiceAgent.jsx
 * ───────────────────────────────
 * Main voice agent UI.
 *
 * Layout:
 *  ┌─────────────────────────────┐
 *  │  Header + status badge      │
 *  ├─────────────────────────────┤
 *  │  Transcript (scrollable)    │
 *  │  (messages appear here)     │
 *  ├─────────────────────────────┤
 *  │  Start / Stop button        │
 *  └─────────────────────────────┘
 */

import { useEffect, useRef } from "react";
import { useVoiceAgent, STATUS } from "../hooks/useVoiceAgent";
import { StatusIndicator }       from "./StatusIndicator";
import { MessageBubble }         from "./MessageBubble";

export function VoiceAgent() {
  const { status, messages, error, start, stop } = useVoiceAgent();
  const bottomRef = useRef(null);

  const isActive = status !== STATUS.IDLE && status !== STATUS.ERROR;

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col"
           style={{ height: "600px" }}>

        {/* ── Header ── */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Voice Assistant</h1>
            <p className="text-xs text-gray-400 mt-0.5">Powered by Deepgram</p>
          </div>
          <StatusIndicator status={status} />
        </div>

        {/* ── Transcript ── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                <MicIcon className="w-8 h-8 text-indigo-500" />
              </div>
              <p className="text-gray-500 text-sm">
                {status === STATUS.IDLE
                  ? "Press Start to begin your conversation"
                  : "Initializing…"}
              </p>
            </div>
          ) : (
            <>
              {messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} />
              ))}

              {/* Typing indicator while agent is thinking */}
              {status === STATUS.THINKING && (
                <div className="flex justify-start mb-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                    <span className="text-white text-xs font-bold">AI</span>
                  </div>
                  <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3">
                    <TypingDots />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-100">
            <p className="text-sm text-red-600 text-center">{error}</p>
          </div>
        )}

        {/* ── Controls ── */}
        <div className="px-6 py-5 border-t border-gray-100 bg-white">
          {!isActive ? (
            <button
              onClick={start}
              className="w-full py-3.5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 active:scale-95
                         text-white font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-2"
            >
              <MicIcon className="w-5 h-5" />
              Start Conversation
            </button>
          ) : (
            <button
              onClick={stop}
              className="w-full py-3.5 rounded-2xl bg-red-500 hover:bg-red-600 active:scale-95
                         text-white font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-2"
            >
              <StopIcon className="w-5 h-5" />
              End Conversation
            </button>
          )}

          {/* Status hint below button */}
          <p className="text-center text-xs text-gray-400 mt-2">
            {status === STATUS.LISTENING && "Listening — speak now"}
            {status === STATUS.THINKING  && "Agent is thinking…"}
            {status === STATUS.SPEAKING  && "Agent is speaking — you can interrupt"}
            {status === STATUS.READY     && "Ready — say something"}
            {status === STATUS.CONNECTING && "Connecting to Deepgram…"}
          </p>
        </div>

      </div>
    </div>
  );
}

// ── Inline SVG icons ──────────────────────────────────────────────────────────

function MicIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="9"  y1="22" x2="15" y2="22" />
    </svg>
  );
}

function StopIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  );
}

function TypingDots() {
  return (
    <div className="flex gap-1 items-center h-4">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}



