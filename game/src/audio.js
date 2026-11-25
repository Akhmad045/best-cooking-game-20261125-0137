// Bumbu & Api — every sound is synthesized with WebAudio: no audio files, no network.
// A short blip, a thock, a sizzle and a little jingle, all from one tiny helper.

let context = null;
let muted = false;

export function setMuted(value) {
  muted = value;
}

/** The AudioContext only exists after the player has interacted with the page. */
export function ensureAudio() {
  if (!context) {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      context = new AudioContextClass();
    } catch {
      context = null;
    }
  }
  if (context && context.state === 'suspended') context.resume().catch(() => {});
  return context;
}

function tone({ frequency = 440, end = null, duration = 0.12, type = 'sine', volume = 0.15, when = 0 }) {
  if (muted) return;
  const audio = ensureAudio();
  if (!audio) return;
  const start = audio.currentTime + when;
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  if (end !== null) oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, end), start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(audio.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function noise({ duration = 0.2, volume = 0.12, frequency = 1800, when = 0 }) {
  if (muted) return;
  const audio = ensureAudio();
  if (!audio) return;
  const start = audio.currentTime + when;
  const length = Math.max(1, Math.floor(audio.sampleRate * duration));
  const buffer = audio.createBuffer(1, length, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  const source = audio.createBufferSource();
  source.buffer = buffer;
  const filter = audio.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = frequency;
  const gain = audio.createGain();
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.connect(filter).connect(gain).connect(audio.destination);
  source.start(start);
}

/** One named game event, one sound. */
export function playSound(event) {
  switch (event) {
    case 'add':
      tone({ frequency: 620, end: 880, duration: 0.08, type: 'triangle', volume: 0.12 });
      break;
    case 'board':
      tone({ frequency: 300, duration: 0.07, type: 'square', volume: 0.07 });
      break;
    case 'chop':
      noise({ duration: 0.07, volume: 0.2, frequency: 900 });
      tone({ frequency: 180, end: 90, duration: 0.08, type: 'square', volume: 0.1 });
      break;
    case 'cook':
      noise({ duration: 0.5, volume: 0.08, frequency: 3200 });
      tone({ frequency: 220, end: 440, duration: 0.25, type: 'sawtooth', volume: 0.05 });
      break;
    case 'done':
      tone({ frequency: 880, duration: 0.12, type: 'triangle', volume: 0.14 });
      tone({ frequency: 1174, duration: 0.16, type: 'triangle', volume: 0.14, when: 0.1 });
      break;
    case 'plate':
      tone({ frequency: 740, end: 990, duration: 0.1, type: 'triangle', volume: 0.12 });
      break;
    case 'serve':
      tone({ frequency: 523, duration: 0.1, type: 'triangle', volume: 0.15 });
      tone({ frequency: 659, duration: 0.1, type: 'triangle', volume: 0.15, when: 0.09 });
      tone({ frequency: 784, duration: 0.18, type: 'triangle', volume: 0.15, when: 0.18 });
      break;
    case 'order':
      tone({ frequency: 1046, duration: 0.09, type: 'sine', volume: 0.08 });
      break;
    case 'walkout':
      tone({ frequency: 330, end: 165, duration: 0.35, type: 'sawtooth', volume: 0.1 });
      break;
    case 'burnt':
      noise({ duration: 0.4, volume: 0.14, frequency: 500 });
      tone({ frequency: 140, end: 70, duration: 0.4, type: 'sawtooth', volume: 0.1 });
      break;
    case 'wrong':
      tone({ frequency: 220, end: 180, duration: 0.15, type: 'square', volume: 0.08 });
      break;
    case 'trash':
      noise({ duration: 0.15, volume: 0.12, frequency: 700 });
      break;
    case 'start':
      tone({ frequency: 392, duration: 0.1, type: 'triangle', volume: 0.14 });
      tone({ frequency: 523, duration: 0.1, type: 'triangle', volume: 0.14, when: 0.09 });
      tone({ frequency: 659, duration: 0.2, type: 'triangle', volume: 0.14, when: 0.18 });
      break;
    case 'best':
    case 'over':
      tone({ frequency: 523, duration: 0.14, type: 'triangle', volume: 0.15 });
      tone({ frequency: 659, duration: 0.14, type: 'triangle', volume: 0.15, when: 0.12 });
      tone({ frequency: 784, duration: 0.14, type: 'triangle', volume: 0.15, when: 0.24 });
      tone({ frequency: 1046, duration: 0.3, type: 'triangle', volume: 0.15, when: 0.36 });
      break;
    default:
      break;
  }
}
