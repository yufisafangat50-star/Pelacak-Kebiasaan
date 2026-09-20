/**
 * Lightweight web audio chime synthesizer for tactile completion feedback
 * Uses native Web Audio API without requiring any external audio files
 */
let audioCtx: AudioContext | null = null;

export function playCompletionSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // Two-tone pleasant chord (E5 -> B5)
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now); // E5
    osc1.frequency.exponentialRampToValueAtTime(987.77, now + 0.12); // B5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(329.63, now); // E4
    osc2.frequency.setValueAtTime(493.88, now + 0.12); // B4

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(audioCtx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.28);
    osc2.stop(now + 0.28);
  } catch {
    // Gracefully ignore audio errors if not permitted
  }
}

// Ambient Brown Noise Generator
let noiseNode: ScriptProcessorNode | null = null;

export function startBrownNoise() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (noiseNode) return; // already playing

    const bufferSize = 4096;
    noiseNode = audioCtx.createScriptProcessor(bufferSize, 1, 1);
    let lastOut = 0;
    
    noiseNode.onaudioprocess = function(e) {
      const output = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // (compensate gain)
      }
    };
    
    noiseNode.connect(audioCtx.destination);
  } catch (e) {
    console.error('Brown noise playback failed', e);
  }
}

export function stopBrownNoise() {
  try {
    if (noiseNode && audioCtx) {
      noiseNode.disconnect();
      noiseNode = null;
    }
  } catch {
    // Gracefully ignore audio errors if not permitted
  }
}
