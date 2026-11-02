const fs = require('fs');
const path = require('path');

const audioDir = path.join(__dirname, '..', 'public', 'audio');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

function writeWavFile(filepath, sampleRate, numChannels, samples) {
  const byteRate = sampleRate * numChannels * 2;
  const blockAlign = numChannels * 2;
  const dataLength = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataLength);

  // RIFF identifier
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write('WAVE', 8);

  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataLength, 40);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.floor(s < 0 ? s * 0x8000 : s * 0x7FFF), offset);
    offset += 2;
  }

  fs.writeFileSync(filepath, buffer);
  console.log(`Generated: ${filepath} (${buffer.length} bytes)`);
}

// 1. Ambient Loop: 8 seconds seamless stereo drone / pad (F# minor / ambient space drone)
// Using fundamental frequencies ~110Hz, 165Hz, 220Hz with soft LFO chorus
const sampleRate = 44100;
const loopDuration = 8.0; // 8 seconds loop
const loopSamplesCount = Math.floor(sampleRate * loopDuration);
const ambientSamples = new Float32Array(loopSamplesCount * 2); // stereo interleaved

for (let i = 0; i < loopSamplesCount; i++) {
  const t = i / sampleRate;
  const progress = i / loopSamplesCount;
  // Perfect loop phase: frequencies are integer multiples of (1 / loopDuration) = 0.125 Hz
  // Base chord: D2 (73.42Hz), A2 (110Hz), F#3 (185Hz), C#4 (277.18Hz) rounded to loop boundary
  const f1 = 73.5; // ~73.5 Hz (588 cycles in 8s)
  const f2 = 110.0; // 880 cycles in 8s
  const f3 = 183.75; // 1470 cycles in 8s
  const f4 = 275.625; // 2205 cycles in 8s

  // LFO modulates amplitude gently
  const lfo1 = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.25 * t);
  const lfo2 = 0.5 + 0.5 * Math.cos(2 * Math.PI * 0.375 * t);

  const wave1 = Math.sin(2 * Math.PI * f1 * t) * 0.28;
  const wave2 = Math.sin(2 * Math.PI * f2 * t + 0.5) * 0.22;
  const wave3 = Math.sin(2 * Math.PI * f3 * t + 1.2) * 0.14 * lfo1;
  const wave4 = Math.sin(2 * Math.PI * f4 * t + 2.1) * 0.08 * lfo2;

  // Pinkish warm noise
  const noise = (Math.random() * 2 - 1) * 0.008;

  const left = (wave1 + wave2 * 0.8 + wave3 * 1.1 + wave4 * 0.7 + noise) * 0.45;
  const right = (wave1 + wave2 * 1.1 + wave3 * 0.7 + wave4 * 1.0 + noise) * 0.45;

  ambientSamples[i * 2] = left;
  ambientSamples[i * 2 + 1] = right;
}

// 2. Hover Tick: Crisp, high-tech micro-click (haptic tick) ~25ms
const tickDuration = 0.025;
const tickCount = Math.floor(sampleRate * tickDuration);
const tickSamples = new Float32Array(tickCount * 2);

for (let i = 0; i < tickCount; i++) {
  const t = i / sampleRate;
  const env = Math.exp(-t * 220); // rapid exponential decay
  // high frequency tick (2800 Hz) + impulse
  const freq = 3200 - t * 40000;
  const osc = Math.sin(2 * Math.PI * Math.max(800, freq) * t);
  const noise = (Math.random() * 2 - 1) * 0.3;
  const val = (osc * 0.7 + noise * 0.3) * env * 0.5;

  tickSamples[i * 2] = val;
  tickSamples[i * 2 + 1] = val;
}

// 3. Menu Open: Futuristic dual-tone rising soft chime (~180ms)
const menuDuration = 0.18;
const menuCount = Math.floor(sampleRate * menuDuration);
const menuSamples = new Float32Array(menuCount * 2);

for (let i = 0; i < menuCount; i++) {
  const t = i / sampleRate;
  const env = Math.sin(Math.min(1, t / 0.02) * Math.PI * 0.5) * Math.exp(-t * 16);
  // Pitch sweep from 440 to 880 Hz
  const pitch = 520 + (t / menuDuration) * 440;
  const wave1 = Math.sin(2 * Math.PI * pitch * t);
  const wave2 = Math.sin(2 * Math.PI * (pitch * 1.5) * t) * 0.4;
  const val = (wave1 + wave2) * env * 0.45;

  // Stereo width pan from center to sides
  menuSamples[i * 2] = val * (0.8 + 0.2 * Math.sin(t * 20));
  menuSamples[i * 2 + 1] = val * (0.8 - 0.2 * Math.sin(t * 20));
}

// Write WAVs
writeWavFile(path.join(audioDir, 'ambient-loop.wav'), sampleRate, 2, ambientSamples);
writeWavFile(path.join(audioDir, 'hover-tick.wav'), sampleRate, 2, tickSamples);
writeWavFile(path.join(audioDir, 'menu-open.wav'), sampleRate, 2, menuSamples);

// Also copy or write as .mp3 fallback file names so either extension resolves!
fs.copyFileSync(path.join(audioDir, 'ambient-loop.wav'), path.join(audioDir, 'ambient-loop.mp3'));
fs.copyFileSync(path.join(audioDir, 'hover-tick.wav'), path.join(audioDir, 'hover-tick.mp3'));
fs.copyFileSync(path.join(audioDir, 'menu-open.wav'), path.join(audioDir, 'menu-open.mp3'));

console.log('All audio assets successfully created in public/audio/');
