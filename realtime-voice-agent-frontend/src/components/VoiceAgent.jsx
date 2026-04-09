
// // /**
// //  * src/components/VoiceAgent.jsx
// //  * ───────────────────────────────
// //  * Main voice agent UI.
// //  *
// //  * Layout:
// //  *  ┌─────────────────────────────┐
// //  *  │  Header + status badge      │
// //  *  ├─────────────────────────────┤
// //  *  │  Transcript (scrollable)    │
// //  *  │  (messages appear here)     │
// //  *  ├─────────────────────────────┤
// //  *  │  Start / Stop button        │
// //  *  └─────────────────────────────┘
// //  */

// // import { useEffect, useRef } from "react";
// // import { useVoiceAgent, STATUS } from "../hooks/useVoiceAgent";
// // import { StatusIndicator }       from "./StatusIndicator";
// // import { MessageBubble }         from "./MessageBubble";

// // export function VoiceAgent() {
// //   const { status, messages, error, start, stop } = useVoiceAgent();
// //   const bottomRef = useRef(null);

// //   const isActive = status !== STATUS.IDLE && status !== STATUS.ERROR;

// //   // Auto-scroll to latest message
// //   useEffect(() => {
// //     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
// //   }, [messages]);

// //   return (
// //     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
// //       <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col"
// //            style={{ height: "600px" }}>

// //         {/* ── Header ── */}
// //         <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
// //           <div>
// //             <h1 className="text-lg font-semibold text-gray-900">Voice Assistant</h1>
// //             <p className="text-xs text-gray-400 mt-0.5">Powered by Deepgram</p>
// //           </div>
// //           <StatusIndicator status={status} />
// //         </div>

// //         {/* ── Transcript ── */}
// //         <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50">
// //           {messages.length === 0 ? (
// //             <div className="h-full flex flex-col items-center justify-center text-center">
// //               <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
// //                 <MicIcon className="w-8 h-8 text-indigo-500" />
// //               </div>
// //               <p className="text-gray-500 text-sm">
// //                 {status === STATUS.IDLE
// //                   ? "Press Start to begin your conversation"
// //                   : "Initializing…"}
// //               </p>
// //             </div>
// //           ) : (
// //             <>
// //               {messages.map(msg => (
// //                 <MessageBubble key={msg.id} message={msg} />
// //               ))}

// //               {/* Typing indicator while agent is thinking */}
// //               {status === STATUS.THINKING && (
// //                 <div className="flex justify-start mb-3">
// //                   <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
// //                     <span className="text-white text-xs font-bold">AI</span>
// //                   </div>
// //                   <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3">
// //                     <TypingDots />
// //                   </div>
// //                 </div>
// //               )}

// //               <div ref={bottomRef} />
// //             </>
// //           )}
// //         </div>

// //         {/* ── Error banner ── */}
// //         {error && (
// //           <div className="px-4 py-2 bg-red-50 border-t border-red-100">
// //             <p className="text-sm text-red-600 text-center">{error}</p>
// //           </div>
// //         )}

// //         {/* ── Controls ── */}
// //         <div className="px-6 py-5 border-t border-gray-100 bg-white">
// //           {!isActive ? (
// //             <button
// //               onClick={start}
// //               className="w-full py-3.5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 active:scale-95
// //                          text-white font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-2"
// //             >
// //               <MicIcon className="w-5 h-5" />
// //               Start Conversation
// //             </button>
// //           ) : (
// //             <button
// //               onClick={stop}
// //               className="w-full py-3.5 rounded-2xl bg-red-500 hover:bg-red-600 active:scale-95
// //                          text-white font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-2"
// //             >
// //               <StopIcon className="w-5 h-5" />
// //               End Conversation
// //             </button>
// //           )}

// //           {/* Status hint below button */}
// //           <p className="text-center text-xs text-gray-400 mt-2">
// //             {status === STATUS.LISTENING && "Listening — speak now"}
// //             {status === STATUS.THINKING  && "Agent is thinking…"}
// //             {status === STATUS.SPEAKING  && "Agent is speaking — you can interrupt"}
// //             {status === STATUS.READY     && "Ready — say something"}
// //             {status === STATUS.CONNECTING && "Connecting to Deepgram…"}
// //           </p>
// //         </div>

// //       </div>
// //     </div>
// //   );
// // }

// // // ── Inline SVG icons ──────────────────────────────────────────────────────────

// // function MicIcon({ className }) {
// //   return (
// //     <svg className={className} viewBox="0 0 24 24" fill="none"
// //          stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
// //       <rect x="9" y="2" width="6" height="12" rx="3" />
// //       <path d="M5 10a7 7 0 0 0 14 0" />
// //       <line x1="12" y1="19" x2="12" y2="22" />
// //       <line x1="9"  y1="22" x2="15" y2="22" />
// //     </svg>
// //   );
// // }

// // function StopIcon({ className }) {
// //   return (
// //     <svg className={className} viewBox="0 0 24 24" fill="currentColor">
// //       <rect x="4" y="4" width="16" height="16" rx="2" />
// //     </svg>
// //   );
// // }

// // function TypingDots() {
// //   return (
// //     <div className="flex gap-1 items-center h-4">
// //       {[0, 1, 2].map(i => (
// //         <span
// //           key={i}
// //           className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
// //           style={{ animationDelay: `${i * 0.15}s` }}
// //         />
// //       ))}
// //     </div>
// //   );
// // }






// import { useEffect, useRef, useState } from "react";
// import { useVoiceAgent, STATUS } from "../hooks/useVoiceAgent";
// import { StatusIndicator } from "./StatusIndicator";
// import { MessageBubble } from "./MessageBubble";

// export function VoiceAgent() {
//   const [provider, setProvider] = useState("deepgram");

//   const { status, messages, error, start, stop } =
//     useVoiceAgent(provider);

//   const bottomRef = useRef(null);

//   const isActive =
//     status !== STATUS.IDLE && status !== STATUS.ERROR;

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
//       <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl flex flex-col"
//            style={{ height: "600px" }}>

//         {/* HEADER */}
//         <div className="px-6 py-4 border-b flex items-center justify-between">

//           <div>
//             <h1 className="text-lg font-semibold">Voice Assistant</h1>
//             <p className="text-xs text-gray-400">
//               Powered by {provider}
//             </p>
//           </div>

//           {/* 🔥 Dropdown */}
//           <select
//             value={provider}
//             disabled={isActive}
//             onChange={(e) => setProvider(e.target.value)}
//             className="text-sm border rounded px-2 py-1"
//           >
//             <option value="deepgram">Deepgram</option>
//             <option value="azure">Azure</option>
//           </select>

//           <StatusIndicator status={status} />
//         </div>

//         {/* CHAT */}
//         <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
//           {messages.map((msg) => (
//             <MessageBubble key={msg.id} message={msg} />
//           ))}
//           <div ref={bottomRef} />
//         </div>

//         {/* ERROR */}
//         {error && (
//           <div className="p-2 bg-red-100 text-red-600 text-center">
//             {error}
//           </div>
//         )}

//         {/* CONTROLS */}
//         <div className="p-4 border-t">
//           {!isActive ? (
//             <button onClick={start} className="w-full bg-indigo-500 text-white py-2 rounded">
//               Start
//             </button>
//           ) : (
//             <button onClick={stop} className="w-full bg-red-500 text-white py-2 rounded">
//               Stop
//             </button>
//           )}
//         </div>

//       </div>
//     </div>
//   );
// }



import { useEffect, useRef, useState } from "react";
import { useVoiceAgent, STATUS } from "../hooks/useVoiceAgent";
import { StatusIndicator } from "./StatusIndicator";
import { MessageBubble } from "./MessageBubble";

export function VoiceAgent() {
  const [provider, setProvider] = useState("deepgram");

  const { status, messages, error, start, stop } =
    useVoiceAgent(provider);

  const bottomRef = useRef(null);

  const isActive =
    status !== STATUS.IDLE && status !== STATUS.ERROR;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100 flex items-center justify-center p-3 sm:p-6">
      
      {/* MAIN CARD */}
      <div className="w-full max-w-2xl h-[90vh] sm:h-[650px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden">

        {/* HEADER */}
        <div className="px-5 py-4 border-b flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
              🎙️ Voice Assistant
            </h1>
            <p className="text-xs text-gray-400">
              Powered by {provider}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Provider Dropdown */}
            <select
              value={provider}
              disabled={isActive}
              onChange={(e) => setProvider(e.target.value)}
              className="text-xs sm:text-sm border rounded-lg px-2 py-1 bg-gray-50 hover:bg-gray-100 transition"
            >
              <option value="deepgram">Deepgram</option>
              <option value="azure">Azure</option>
              <option value="cartesia">Cartesia</option>
            </select>

            <StatusIndicator status={status} />
          </div>
        </div>

        {/* CHAT AREA */}
        <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4 animate-pulse">
                🎤
              </div>
              <p className="text-gray-500 text-sm">
                {status === STATUS.IDLE
                  ? "Start a conversation"
                  : "Initializing..."}
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}

              {/* Thinking Animation */}
              {status === STATUS.THINKING && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs">
                    AI
                  </div>
                  <div className="bg-white px-3 py-2 rounded-xl shadow-sm flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* ERROR */}
        {error && (
          <div className="px-4 py-2 bg-red-50 text-red-600 text-sm text-center border-t">
            ⚠️ {error}
          </div>
        )}

        {/* CONTROLS */}
        <div className="px-5 py-4 border-t bg-white sticky bottom-0">
          {!isActive ? (
            <button
              onClick={start}
              className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 active:scale-95
                         text-white font-semibold transition-all duration-150 shadow-md"
            >
              🎤 Start Conversation
            </button>
          ) : (
            <button
              onClick={stop}
              className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 active:scale-95
                         text-white font-semibold transition-all duration-150 shadow-md"
            >
              ⏹ Stop Conversation
            </button>
          )}

          {/* STATUS TEXT */}
          <p className="text-center text-xs text-gray-400 mt-2">
            {status === STATUS.LISTENING && "🎧 Listening..."}
            {status === STATUS.THINKING && "🤔 Thinking..."}
            {status === STATUS.SPEAKING && "🔊 Speaking..."}
            {status === STATUS.CONNECTING && "🔌 Connecting..."}
          </p>
        </div>
      </div>
    </div>
  );
}
