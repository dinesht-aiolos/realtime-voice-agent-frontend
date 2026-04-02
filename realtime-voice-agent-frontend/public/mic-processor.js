/**
 * mic-processor.js
 * ─────────────────
 * AudioWorklet that runs in a separate thread.
 * Converts mic Float32 samples → Int16 PCM bytes
 * and posts them to the main thread for Deepgram.
 *
 * Place this file in: public/mic-processor.js
 * (Vite serves everything in /public at the root URL)
 */
class MicProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const float32 = input[0];

    // Convert Float32 [-1, 1] → Int16 [-32768, 32767]
    const int16 = new Int16Array(float32.length);
    for (let i = 0; i < float32.length; i++) {
      const clamped = Math.max(-1, Math.min(1, float32[i]));
      int16[i] = clamped < 0
        ? clamped * 32768
        : clamped * 32767;
    }

    // Post raw bytes to main thread (zero-copy transfer)
    this.port.postMessage(int16.buffer, [int16.buffer]);

    return true; // Keep processor alive
  }
}

registerProcessor("mic-processor", MicProcessor); 