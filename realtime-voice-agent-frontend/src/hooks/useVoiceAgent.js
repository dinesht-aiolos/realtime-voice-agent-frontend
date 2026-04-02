// /**
//  * src/hooks/useVoiceAgent.js
//  * Final version — 24kHz AudioContext for both mic and playback.
//  * Matches official Deepgram Voice Agent API docs exactly.
//  */

// import { useState, useRef, useCallback } from "react";

// const BACKEND_WS_URL = "ws://localhost:8000/ws";
// const SAMPLE_RATE    = 24000; // Both input and output per Deepgram docs

// export const STATUS = {
//   IDLE:       "idle",
//   CONNECTING: "connecting",
//   READY:      "ready",
//   LISTENING:  "listening",
//   THINKING:   "thinking",
//   SPEAKING:   "speaking",
//   ERROR:      "error",
// };

// const WS_CLOSE_MESSAGES = {
//   1001: "Server went away.",
//   1006: "Backend not reachable — is your Python server running on port 8000?",
//   1008: "Auth failed — check DEEPGRAM_API_KEY in your Python .env",
//   1011: "Server error — check Python terminal.",
// };

// export function useVoiceAgent() {
//   const [status,   setStatus]   = useState(STATUS.IDLE);
//   const [messages, setMessages] = useState([]);
//   const [error,    setError]    = useState(null);

//   const wsRef          = useRef(null);
//   const audioCtxRef    = useRef(null);  // Single 24kHz AudioContext
//   const workletNodeRef = useRef(null);
//   const streamRef      = useRef(null);
//   const audioQueueRef  = useRef([]);
//   const isPlayingRef   = useRef(false);
//   const statusRef      = useRef(STATUS.IDLE);

//   const updateStatus = useCallback((s) => {
//     statusRef.current = s;
//     setStatus(s);
//   }, []);

//   const addMessage = useCallback((role, content) => {
//     setMessages(prev => [
//       ...prev,
//       { id: Date.now() + Math.random(), role, content, ts: new Date() },
//     ]);
//   }, []);

//   // ── Playback ────────────────────────────────────────────────────────────────
//   const playNext = useCallback(() => {
//     const ctx = audioCtxRef.current;
//     if (!ctx || audioQueueRef.current.length === 0) {
//       isPlayingRef.current = false;
//       return;
//     }
//     isPlayingRef.current = true;
//     const chunk = audioQueueRef.current.shift();

//     const float32 = new Float32Array(chunk.length);
//     for (let i = 0; i < chunk.length; i++) {
//       float32[i] = chunk[i] / (chunk[i] < 0 ? 32768 : 32767);
//     }

//     const buf = ctx.createBuffer(1, float32.length, SAMPLE_RATE);
//     buf.copyToChannel(float32, 0);

//     const src = ctx.createBufferSource();
//     src.buffer  = buf;
//     src.connect(ctx.destination);
//     src.onended = playNext;
//     src.start();
//   }, []);

//   const enqueueAudio = useCallback((int16) => {
//     audioQueueRef.current.push(int16);
//     if (!isPlayingRef.current) playNext();
//   }, [playNext]);

//   // ── Microphone ──────────────────────────────────────────────────────────────
//   const startMicrophone = useCallback(async (ws) => {
//     const ctx = audioCtxRef.current;
//     if (ctx.state === "suspended") await ctx.resume();

//     await ctx.audioWorklet.addModule("/mic-processor.js");

//     const stream = await navigator.mediaDevices.getUserMedia({
//       audio: {
//         sampleRate:       SAMPLE_RATE,
//         channelCount:     1,
//         echoCancellation: true,
//         noiseSuppression: true,
//         autoGainControl:  true,
//       },
//     });
//     streamRef.current = stream;

//     const source  = ctx.createMediaStreamSource(stream);
//     const worklet = new AudioWorkletNode(ctx, "mic-processor");
//     workletNodeRef.current = worklet;

//     worklet.port.onmessage = (e) => {
//       if (ws.readyState === WebSocket.OPEN) ws.send(e.data);
//     };

//     source.connect(worklet);
//   }, []);

//   // ── Message handler ─────────────────────────────────────────────────────────
//   const handleMessage = useCallback((event) => {
//     if (event.data instanceof ArrayBuffer) {
//       enqueueAudio(new Int16Array(event.data)); return;
//     }
//     if (event.data instanceof Blob) {
//       event.data.arrayBuffer().then(buf => enqueueAudio(new Int16Array(buf))); return;
//     }

//     let msg;
//     try { msg = JSON.parse(event.data); } catch { return; }
//     console.log("[Deepgram]", msg.type, msg);

//     switch (msg.type) {
//       case "SettingsApplied":
//         updateStatus(STATUS.READY);
//         break;
//       case "ConversationText":
//         addMessage(msg.role, msg.content);
//         if (msg.role === "user") updateStatus(STATUS.THINKING);
//         break;
//       case "UserStartedSpeaking":
//         updateStatus(STATUS.LISTENING);
//         audioQueueRef.current = [];
//         isPlayingRef.current  = false;
//         break;
//       case "AgentThinking":
//         updateStatus(STATUS.THINKING);
//         break;
//       case "AgentStartedSpeaking":
//         updateStatus(STATUS.SPEAKING);
//         break;
//       case "AgentAudioDone":
//         // After all audio played, go back to listening
//         setTimeout(() => {
//           if (statusRef.current === STATUS.SPEAKING) {
//             updateStatus(STATUS.READY);
//           }
//         }, 500);
//         break;
//       case "Welcome":
//         break;
//       case "Error":
//         console.error("[Deepgram Error]", msg);
//         setError(msg.description || "Deepgram error");
//         updateStatus(STATUS.ERROR);
//         break;
//       default:
//         break;
//     }
//   }, [addMessage, updateStatus, enqueueAudio]);

//   // ── Start ───────────────────────────────────────────────────────────────────
//   const start = useCallback(async () => {
//     try {
//       updateStatus(STATUS.CONNECTING);
//       setMessages([]);
//       setError(null);
//       audioQueueRef.current = [];
//       isPlayingRef.current  = false;

//       // Single AudioContext at 24kHz (matches Deepgram docs)
//       const ctx = new AudioContext({ sampleRate: SAMPLE_RATE });
//       audioCtxRef.current = ctx;

//       const ws = new WebSocket(BACKEND_WS_URL);
//       ws.binaryType = "arraybuffer";
//       wsRef.current = ws;

//       ws.onopen = async () => {
//         console.log("[Backend] Connected");
//         // Send trigger — server replaces with correct full settings
//         ws.send(JSON.stringify({ type: "Settings" }));
//         await startMicrophone(ws);
//       };

//       ws.onmessage = handleMessage;
//       ws.onerror   = () => console.error("[Backend] onerror — see onclose");

//       ws.onclose = (e) => {
//         console.log(`[Backend] Closed — code: ${e.code} reason: "${e.reason}"`);
//         if (statusRef.current !== STATUS.IDLE) {
//           const msg = WS_CLOSE_MESSAGES[e.code]
//             ?? (e.code !== 1000 ? `Connection closed (code ${e.code})` : null);
//           if (msg) { setError(msg); updateStatus(STATUS.ERROR); }
//           else        updateStatus(STATUS.IDLE);
//         }
//       };

//     } catch (err) {
//       console.error("[VoiceAgent] Start error:", err);
//       setError(err.message);
//       updateStatus(STATUS.ERROR);
//     }
//   }, [handleMessage, startMicrophone, updateStatus]);

//   // ── Stop ────────────────────────────────────────────────────────────────────
//   const stop = useCallback(() => {
//     updateStatus(STATUS.IDLE);

//     streamRef.current?.getTracks().forEach(t => t.stop());
//     streamRef.current = null;

//     workletNodeRef.current?.disconnect();
//     workletNodeRef.current = null;

//     wsRef.current?.close(1000, "User ended session");
//     wsRef.current = null;

//     audioCtxRef.current?.close();
//     audioCtxRef.current = null;

//     audioQueueRef.current = [];
//     isPlayingRef.current  = false;
//   }, [updateStatus]);

//   return { status, messages, error, start, stop };
// }


/**
 * src/hooks/useVoiceAgent.js
 *
 * Audio playback fix: instead of playing chunks sequentially via onended,
 * we schedule each chunk on the AudioContext timeline so they play
 * back-to-back with zero gap — like the official Deepgram demo.
 */

import { useState, useRef, useCallback } from "react";

const BACKEND_WS_URL = "ws://localhost:8000/ws";
const SAMPLE_RATE    = 24000;

export const STATUS = {
  IDLE:       "idle",
  CONNECTING: "connecting",
  READY:      "ready",
  LISTENING:  "listening",
  THINKING:   "thinking",
  SPEAKING:   "speaking",
  ERROR:      "error",
};

const WS_CLOSE_MESSAGES = {
  1001: "Server went away.",
  1006: "Backend not reachable — is your Python server running on port 8000?",
  1008: "Auth failed — check DEEPGRAM_API_KEY in your Python .env",
  1011: "Server error — check Python terminal.",
};

export function useVoiceAgent() {
  const [status,   setStatus]   = useState(STATUS.IDLE);
  const [messages, setMessages] = useState([]);
  const [error,    setError]    = useState(null);

  const wsRef             = useRef(null);
  const audioCtxRef       = useRef(null);
  const workletNodeRef    = useRef(null);
  const streamRef         = useRef(null);
  const statusRef         = useRef(STATUS.IDLE);

  // ── Scheduled playback refs ─────────────────────────────────────────────────
  // nextPlayTimeRef tracks when the next audio chunk should start.
  // This eliminates gaps — each chunk is scheduled to start exactly
  // when the previous one ends.
  const nextPlayTimeRef   = useRef(0);
  const scheduledSrcsRef  = useRef([]); // For barge-in cancellation

  const updateStatus = useCallback((s) => {
    statusRef.current = s;
    setStatus(s);
  }, []);

  const addMessage = useCallback((role, content) => {
    setMessages(prev => [
      ...prev,
      { id: Date.now() + Math.random(), role, content, ts: new Date() },
    ]);
  }, []);

  // ── Cancel all scheduled audio (barge-in) ───────────────────────────────────
  const clearScheduledAudio = useCallback(() => {
    scheduledSrcsRef.current.forEach(src => {
      try { src.stop(); src.disconnect(); } catch (_) {}
    });
    scheduledSrcsRef.current = [];
    nextPlayTimeRef.current  = 0; // Reset timeline
  }, []);

  // ── Enqueue and schedule an audio chunk ─────────────────────────────────────
  const enqueueAudio = useCallback((int16) => {
    const ctx = audioCtxRef.current;
    if (!ctx || int16.length === 0) return;

    // Int16 → Float32
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / (int16[i] < 0 ? 32768 : 32767);
    }

    // Create audio buffer
    const buf = ctx.createBuffer(1, float32.length, SAMPLE_RATE);
    buf.copyToChannel(float32, 0);

    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);

    // Schedule: start right after previous chunk ends (no gap)
    const now = ctx.currentTime;
    if (nextPlayTimeRef.current < now) {
      nextPlayTimeRef.current = now; // catch up if we fell behind
    }
    src.start(nextPlayTimeRef.current);
    nextPlayTimeRef.current += buf.duration; // advance timeline

    // Track for cancellation
    scheduledSrcsRef.current.push(src);
    src.onended = () => {
      // Remove from tracking list when done
      scheduledSrcsRef.current = scheduledSrcsRef.current.filter(s => s !== src);
    };
  }, []);

  // ── Microphone ──────────────────────────────────────────────────────────────
  const startMicrophone = useCallback(async (ws) => {
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") await ctx.resume();

    await ctx.audioWorklet.addModule("/mic-processor.js");

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate:       SAMPLE_RATE,
        channelCount:     1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl:  true,
      },
    });
    streamRef.current = stream;

    const source  = ctx.createMediaStreamSource(stream);
    const worklet = new AudioWorkletNode(ctx, "mic-processor");
    workletNodeRef.current = worklet;

    worklet.port.onmessage = (e) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(e.data);
    };

    source.connect(worklet);
    // NOT connected to destination — prevents echo
  }, []);

  // ── WebSocket message handler ────────────────────────────────────────────────
  const handleMessage = useCallback((event) => {
    // Binary = TTS audio chunk from Deepgram
    if (event.data instanceof ArrayBuffer) {
      enqueueAudio(new Int16Array(event.data));
      return;
    }
    if (event.data instanceof Blob) {
      event.data.arrayBuffer().then(buf => enqueueAudio(new Int16Array(buf)));
      return;
    }

    let msg;
    try { msg = JSON.parse(event.data); } catch { return; }
    console.log("[Deepgram]", msg.type, msg);

    switch (msg.type) {

      case "SettingsApplied":
        updateStatus(STATUS.READY);
        break;

      case "ConversationText":
        addMessage(msg.role, msg.content);
        if (msg.role === "user") updateStatus(STATUS.THINKING);
        break;

      case "UserStartedSpeaking":
        // User is interrupting — cancel all scheduled audio immediately
        clearScheduledAudio();
        updateStatus(STATUS.LISTENING);
        break;

      case "AgentThinking":
        updateStatus(STATUS.THINKING);
        break;

      case "AgentStartedSpeaking":
        updateStatus(STATUS.SPEAKING);
        break;

      case "AgentAudioDone":
        // All audio has been received — playback will finish on its own
        // Transition to READY after playback ends
        const remaining = nextPlayTimeRef.current - (audioCtxRef.current?.currentTime ?? 0);
        const delay = Math.max(0, remaining * 1000);
        setTimeout(() => {
          if (statusRef.current === STATUS.SPEAKING) {
            updateStatus(STATUS.READY);
          }
        }, delay + 200);
        break;

      case "Welcome":
        break;

      case "Error":
        console.error("[Deepgram Error]", msg);
        setError(msg.description || "Deepgram error");
        updateStatus(STATUS.ERROR);
        break;

      default:
        break;
    }
  }, [addMessage, updateStatus, enqueueAudio, clearScheduledAudio]);

  // ── Start session ───────────────────────────────────────────────────────────
  const start = useCallback(async () => {
    try {
      updateStatus(STATUS.CONNECTING);
      setMessages([]);
      setError(null);
      nextPlayTimeRef.current  = 0;
      scheduledSrcsRef.current = [];

      // AudioContext must be created inside a user gesture
      const ctx = new AudioContext({ sampleRate: SAMPLE_RATE });
      audioCtxRef.current = ctx;

      const ws = new WebSocket(BACKEND_WS_URL);
      ws.binaryType = "arraybuffer";
      wsRef.current = ws;

      ws.onopen = async () => {
        console.log("[Backend] Connected");
        ws.send(JSON.stringify({ type: "Settings" })); // Server replaces with full settings
        await startMicrophone(ws);
      };

      ws.onmessage = handleMessage;
      ws.onerror   = () => console.error("[Backend] onerror — see onclose");

      ws.onclose = (e) => {
        console.log(`[Backend] Closed — code: ${e.code} reason: "${e.reason}"`);
        if (statusRef.current !== STATUS.IDLE) {
          const msg = WS_CLOSE_MESSAGES[e.code]
            ?? (e.code !== 1000 ? `Connection closed (code ${e.code})` : null);
          if (msg) { setError(msg); updateStatus(STATUS.ERROR); }
          else        updateStatus(STATUS.IDLE);
        }
      };

    } catch (err) {
      console.error("[VoiceAgent] Start error:", err);
      setError(err.message);
      updateStatus(STATUS.ERROR);
    }
  }, [handleMessage, startMicrophone, updateStatus]);

  // ── Stop session ────────────────────────────────────────────────────────────
  const stop = useCallback(() => {
    updateStatus(STATUS.IDLE);

    clearScheduledAudio();

    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;

    workletNodeRef.current?.disconnect();
    workletNodeRef.current = null;

    wsRef.current?.close(1000, "User ended session");
    wsRef.current = null;

    audioCtxRef.current?.close();
    audioCtxRef.current = null;
  }, [updateStatus, clearScheduledAudio]);

  return { status, messages, error, start, stop };
}