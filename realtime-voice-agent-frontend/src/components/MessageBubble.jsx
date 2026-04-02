

/**
 * src/components/MessageBubble.jsx
 * ──────────────────────────────────
 * Single message bubble — user on right, agent on left.
 */

export function MessageBubble({ message }) {
  const isUser  = message.role === "user";
  const isAgent = message.role === "assistant";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      {/* Agent avatar */}
      {isAgent && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center mr-2 mt-1">
          <span className="text-white text-xs font-bold">AI</span>
        </div>
      )}

      {/* Bubble */}
      <div
        className={`
          max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
          ${isUser
            ? "bg-indigo-500 text-white rounded-br-sm"
            : "bg-white text-gray-800 rounded-bl-sm border border-gray-100 shadow-sm"
          }
        `}
      >
        {message.content}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center ml-2 mt-1">
          <span className="text-gray-600 text-xs font-bold">You</span>
        </div>
      )}
    </div>
  );
}