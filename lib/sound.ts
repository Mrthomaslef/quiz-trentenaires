// Synthétiseur Web Audio API ultra-léger (zéro fichier externe, latence 0ms) pour l'ambiance plateau TV du 7TER

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playCorrectSound(enabled = true) {
  if (!enabled) return;
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + i * 0.075);
    gain.gain.setValueAtTime(0.001, now + i * 0.075);
    gain.gain.exponentialRampToValueAtTime(0.18, now + i * 0.075 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.075 + 0.28);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.075);
    osc.stop(now + i * 0.075 + 0.3);
  });
}

export function playWrongSound(enabled = true) {
  if (!enabled) return;
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  const freqs = [220, 185];
  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, now + i * 0.14);
    gain.gain.setValueAtTime(0.12, now + i * 0.14);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.14 + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.14);
    osc.stop(now + i * 0.14 + 0.24);
  });
}

export function playPointSound(enabled = true) {
  if (!enabled) return;
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(587.33, now);
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.22);
}

export function playTickSound(enabled = true, urgent = false) {
  if (!enabled) return;
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(urgent ? 880 : 440, now);
  gain.gain.setValueAtTime(urgent ? 0.1 : 0.04, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.07);
}

export function playLockSound(enabled = true) {
  if (!enabled) return;
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(660, now);
  osc.frequency.exponentialRampToValueAtTime(990, now + 0.08);
  gain.gain.setValueAtTime(0.14, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.12);
}

export function playCountdownBeep(enabled = true, isGo = false) {
  if (!enabled) return;
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(isGo ? 1046.5 : 523.25, now);
  gain.gain.setValueAtTime(isGo ? 0.18 : 0.11, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + (isGo ? 0.25 : 0.12));
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + (isGo ? 0.26 : 0.13));
}

export function playSuspenseSound(enabled = true, step = 1) {
  if (!enabled) return;
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;

  // Transposition fidèle au palier en cours (comme le thème principal)
  const transpose = step <= 5 ? 0 : Math.min(7, step - 5);
  const rootMidi = 48 + transpose; // Do3 (C3) de base

  // 1. Impact grave de timbale / sous-basse ("DOUUUM" du losange orange)
  const boomOsc = ctx.createOscillator();
  const boomGain = ctx.createGain();
  boomOsc.type = 'sine';
  boomOsc.frequency.setValueAtTime(105, now);
  boomOsc.frequency.exponentialRampToValueAtTime(34, now + 0.55);
  boomGain.gain.setValueAtTime(0.24, now);
  boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
  boomOsc.connect(boomGain);
  boomGain.connect(ctx.destination);
  boomOsc.start(now);
  boomOsc.stop(now + 0.62);

  // 2. Accord dramatique « C'est votre dernier mot ? » (Do mineur + Lab + Si bécarre tendu)
  // Intervalle signature de Keith & Matthew Strachan : fondamentale, tierce mineure, quinte, sixte mineure (Lab)
  const chordSemitones = [0, 3, 7, 8, 14]; // C3, Eb3, G3, Ab3, D4
  chordSemitones.forEach((semi, idx) => {
    const freq = 440 * Math.pow(2, (rootMidi + semi - 69) / 12);
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(freq * 0.997, now);
    osc2.frequency.setValueAtTime(freq * 1.003, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(320, now + 0.85);
    filter.Q.setValueAtTime(2.0, now);

    const startOffset = idx * 0.015;
    gain.gain.setValueAtTime(0.001, now + startOffset);
    gain.gain.linearRampToValueAtTime(0.055, now + startOffset + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now + startOffset);
    osc2.start(now + startOffset);
    osc1.stop(now + 0.95);
    osc2.stop(now + 0.95);
  });

  // 3. Tintement cristallin en demi-ton (Sol5 -> Lab5 -> Sol5) avec écho plateau TV
  const bellNotes = [
    { semi: 19, delay: 0.0, vol: 0.065 },  // Sol4
    { semi: 20, delay: 0.11, vol: 0.075 }, // Lab4 (demi-ton angoissant)
    { semi: 19, delay: 0.24, vol: 0.045 }, // Sol4 (écho)
  ];
  bellNotes.forEach(({ semi, delay, vol }) => {
    const freq = 440 * Math.pow(2, (rootMidi + 12 + semi - 69) / 12);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + delay);
    gain.gain.setValueAtTime(0.001, now + delay);
    gain.gain.linearRampToValueAtTime(vol, now + delay + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + delay);
    osc.stop(now + delay + 0.48);
  });
}

// Jingle dramatique complet au moment de verrouiller « Oui, c'est mon dernier mot ! »
export function playFinalAnswerJingle(enabled = true, step = 1) {
  if (!enabled) return;
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;

  const transpose = step <= 5 ? 0 : Math.min(7, step - 5);
  const rootMidi = 48 + transpose; // Do3 + transposition du palier
  const duration = 1.72;

  // 1. Grand coup de gong / timbale de verrouillage ("BWOOOONG" d'entrée de suspense)
  const gongOsc = ctx.createOscillator();
  const gongGain = ctx.createGain();
  gongOsc.type = 'sine';
  gongOsc.frequency.setValueAtTime(125, now);
  gongOsc.frequency.exponentialRampToValueAtTime(30, now + 0.9);
  gongGain.gain.setValueAtTime(0.28, now);
  gongGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
  gongOsc.connect(gongGain);
  gongGain.connect(ctx.destination);
  gongOsc.start(now);
  gongOsc.stop(now + 1.05);

  // 2. Nappe symphonique de suspense en crescendo (cluster mineur / 7e diminuée qui gonfle)
  // Do3, Mib3, Fa#3, Sol3, Lab3, Si3 -> tension maximale avant révélation verte/rouge
  const clusterSemitones = [-12, 0, 3, 6, 7, 8, 11];
  clusterSemitones.forEach((semi) => {
    const startFreq = 440 * Math.pow(2, (rootMidi + semi - 69) / 12);
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    // Léger désaccordage orchestral + infime montée de tension en fin de jingle
    osc1.frequency.setValueAtTime(startFreq * 0.996, now);
    osc2.frequency.setValueAtTime(startFreq * 1.004, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(260, now);
    filter.frequency.exponentialRampToValueAtTime(2200, now + duration - 0.12);
    filter.Q.setValueAtTime(2.8, now);

    // Enveloppe en crescendo dramatique jusqu'au verdict
    gain.gain.setValueAtTime(0.025, now);
    gain.gain.linearRampToValueAtTime(0.045, now + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.095, now + duration - 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration + 0.05);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration + 0.08);
    osc2.stop(now + duration + 0.08);
  });

  // 3. Battements de cœur qui s'intensifient pendant le suspense ("LUB-DUB... LUB-DUB... LUB-DUB")
  const heartbeats = [
    { t: 0.12, first: true, vol: 0.22 },
    { t: 0.30, first: false, vol: 0.15 },
    { t: 0.68, first: true, vol: 0.25 },
    { t: 0.85, first: false, vol: 0.18 },
    { t: 1.20, first: true, vol: 0.28 },
    { t: 1.35, first: false, vol: 0.21 },
  ];
  heartbeats.forEach(({ t, first, vol }) => {
    const hbOsc = ctx.createOscillator();
    const hbGain = ctx.createGain();
    hbOsc.type = 'sine';
    hbOsc.frequency.setValueAtTime(first ? 72 : 58, now + t);
    hbOsc.frequency.exponentialRampToValueAtTime(28, now + t + 0.16);
    hbGain.gain.setValueAtTime(0.001, now + t);
    hbGain.gain.linearRampToValueAtTime(vol, now + t + 0.015);
    hbGain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.19);
    hbOsc.connect(hbGain);
    hbGain.connect(ctx.destination);
    hbOsc.start(now + t);
    hbOsc.stop(now + t + 0.21);
  });

  // 4. Motif cristallin ascendant de verrouillage (Do5 -> Mib5 -> Sol5 -> Lab5 -> Si5 suspendu)
  const stingNotes = [
    { semi: 12, t: 0.0, vol: 0.075 },  // Do4
    { semi: 15, t: 0.14, vol: 0.065 }, // Mib4
    { semi: 19, t: 0.28, vol: 0.075 }, // Sol4
    { semi: 20, t: 0.62, vol: 0.085 }, // Lab4 (tension QVGDM)
    { semi: 23, t: 1.08, vol: 0.095 }, // Si4 bécarre (note sensible suspendue avant verdict)
  ];
  stingNotes.forEach(({ semi, t, vol }) => {
    const freq = 440 * Math.pow(2, (rootMidi + 12 + semi - 69) / 12);
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, now + t);
    osc2.frequency.setValueAtTime(freq * 2, now + t);
    gain.gain.setValueAtTime(0.001, now + t);
    gain.gain.linearRampToValueAtTime(vol, now + t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.42);
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    osc1.start(now + t);
    osc2.start(now + t);
    osc1.stop(now + t + 0.45);
    osc2.stop(now + t + 0.45);
  });
}

// ============================================================================
// EFFET SONORE DRAMATIQUE DE VALIDATION ("OUI, C'EST MON DERNIER MOT !")
// Coup de gong grave + battements de cœur accélérés + montée orchestrale sous tension
// ============================================================================
export function playFinalAnswerSuspenseSound(
  enabled = true,
  durationMs = 2400,
  step = 1
) {
  if (!enabled) return;
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime;
  const durationSec = Math.max(1.2, durationMs / 1000);
  const transpose = step <= 5 ? 0 : Math.min(7, step - 5);
  const baseRoot = 440 * Math.pow(2, (36 + transpose - 69) / 12); // C2 transposé

  // 1. Impact initial "LOCK" (timbale grave + accord cristallin verrouillé)
  const impactOsc = ctx.createOscillator();
  const impactGain = ctx.createGain();
  impactOsc.type = 'sine';
  impactOsc.frequency.setValueAtTime(130, now);
  impactOsc.frequency.exponentialRampToValueAtTime(34, now + 0.65);
  impactGain.gain.setValueAtTime(0.28, now);
  impactGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
  impactOsc.connect(impactGain);
  impactGain.connect(ctx.destination);
  impactOsc.start(now);
  impactOsc.stop(now + 0.72);

  // Accord métallique court du verrouillage orange (Do - Sol - Lab - Do)
  [1, 1.5, 1.587, 2].forEach((ratio, idx) => {
    const ping = ctx.createOscillator();
    const pingGain = ctx.createGain();
    ping.type = 'triangle';
    ping.frequency.setValueAtTime(baseRoot * 4 * ratio, now + idx * 0.03);
    pingGain.gain.setValueAtTime(0.08, now + idx * 0.03);
    pingGain.gain.exponentialRampToValueAtTime(
      0.001,
      now + idx * 0.03 + 0.45
    );
    ping.connect(pingGain);
    pingGain.connect(ctx.destination);
    ping.start(now + idx * 0.03);
    ping.stop(now + idx * 0.03 + 0.48);
  });

  // 2. Nappe de tension (Riser) qui monte en fréquence et en intensité jusqu'au verdict
  const riserOsc1 = ctx.createOscillator();
  const riserOsc2 = ctx.createOscillator();
  const riserFilter = ctx.createBiquadFilter();
  const riserGain = ctx.createGain();

  riserOsc1.type = 'sawtooth';
  riserOsc2.type = 'sawtooth';
  riserOsc1.frequency.setValueAtTime(baseRoot * 2, now);
  riserOsc1.frequency.exponentialRampToValueAtTime(
    baseRoot * 2.12, // montée d'un demi-ton angoissant
    now + durationSec
  );
  riserOsc2.frequency.setValueAtTime(baseRoot * 3.01, now);
  riserOsc2.frequency.exponentialRampToValueAtTime(
    baseRoot * 3.18,
    now + durationSec
  );

  riserFilter.type = 'lowpass';
  riserFilter.frequency.setValueAtTime(220, now);
  riserFilter.frequency.exponentialRampToValueAtTime(2200, now + durationSec);
  riserFilter.Q.setValueAtTime(4.0, now);

  riserGain.gain.setValueAtTime(0.01, now);
  riserGain.gain.linearRampToValueAtTime(0.14, now + durationSec * 0.88);
  riserGain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

  riserOsc1.connect(riserFilter);
  riserOsc2.connect(riserFilter);
  riserFilter.connect(riserGain);
  riserGain.connect(ctx.destination);

  riserOsc1.start(now);
  riserOsc2.start(now);
  riserOsc1.stop(now + durationSec + 0.04);
  riserOsc2.stop(now + durationSec + 0.04);

  // 3. Battements de cœur "LUB-DUB" qui s'accélèrent pendant le suspense
  const beatOffsets = [0.15, 0.72, 1.22, 1.65, 2.02, 2.34, 2.62, 2.88];
  beatOffsets.forEach((offset) => {
    if (offset >= durationSec - 0.15) return;
    triggerOriginalHeartbeat(ctx, now + offset, true);
    if (offset + 0.16 < durationSec - 0.05) {
      triggerOriginalHeartbeat(ctx, now + offset + 0.16, false);
    }
  });
}

export function playJokerSound(enabled = true) {
  if (!enabled) return;
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  const notes = [440, 554.37, 659.25, 880]; // Arpège A majeur
  notes.forEach((f, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(f, now + idx * 0.055);
    gain.gain.setValueAtTime(0.12, now + idx * 0.055);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.055 + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + idx * 0.055);
    osc.stop(now + idx * 0.055 + 0.2);
  });
}

// ============================================================================
// SYNTHÉTISEUR « QUI VEUT GAGNER DES MILLIONS » — SUSPENSE & HAUTE TENSION 🎬
// Architecture sonore sombre et cinématique (Keith & Matthew Strachan) :
// 1. Grand Impact Abyssal ("BOOOOOM" sub-bass + gong métallique sombre)
// 2. Bourdon (Drone) respirant par LFO avec frottements de demi-tons & tritons
// 3. Double battement de cœur humain ("LUB-DUB") lourd, viscéral et oppressant
// 4. Tic-tac d'horloge mécanique stéréo + impulsion sonar dans l'espace
// 5. Ostinato sombre hypnotique sur la cellule de tension (Sol - Lab - Sol - Fa#)
// 6. Nappes de cordes en trémolo Hitchcockien (dissonances de seconde mineure)
// 7. Riser d'aspiration en fin de boucle + surtension en mode "Dernier mot ?"
// ============================================================================

let millionsInterval: ReturnType<typeof setInterval> | null = null;
let millionsStepIndex = 0;
let millionsCurrentStep = 1; // 1..15
let millionsSuspenseLocked = false; // true quand une réponse orange attend "Dernier mot ?"
let masterCompressor: DynamicsCompressorNode | null = null;
let noiseBufferCache: AudioBuffer | null = null;

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function getMasterOutput(ctx: AudioContext): AudioNode {
  if (!masterCompressor || masterCompressor.context !== ctx) {
    masterCompressor = ctx.createDynamicsCompressor();
    masterCompressor.threshold.setValueAtTime(-14, ctx.currentTime);
    masterCompressor.knee.setValueAtTime(12, ctx.currentTime);
    masterCompressor.ratio.setValueAtTime(4, ctx.currentTime);
    masterCompressor.attack.setValueAtTime(0.004, ctx.currentTime);
    masterCompressor.release.setValueAtTime(0.18, ctx.currentTime);
    masterCompressor.connect(ctx.destination);
  }
  return masterCompressor;
}

function getWhiteNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (noiseBufferCache && noiseBufferCache.sampleRate === ctx.sampleRate) {
    return noiseBufferCache;
  }
  const length = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  noiseBufferCache = buffer;
  return buffer;
}

// 1. Grand Impact Cinématique ("DOUUUUUM" + Gong Sombre) & Bourdon Abyssal Respirant
function triggerDarkSuspenseDroneAndImpact(
  ctx: AudioContext,
  out: AudioNode,
  time: number,
  rootMidi: number,
  tensionMidiOffset: number,
  duration: number,
  impactIntensity: 'heavy' | 'medium' | 'none'
) {
  const rootFreq = midiToFreq(rootMidi); // C2 (65.4 Hz)
  const tensionFreq = midiToFreq(rootMidi + tensionMidiOffset);

  // Bourdon continu sombre : Sous-basse C1 + Fondamentale C2 + Note de tension (Sol2 / Lab2 / Fa#2)
  const oscSub = ctx.createOscillator();
  const oscRoot = ctx.createOscillator();
  const oscTension = ctx.createOscillator();
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  oscSub.type = 'sine';
  oscRoot.type = 'sawtooth';
  oscTension.type = 'sawtooth';

  oscSub.frequency.setValueAtTime(rootFreq * 0.5, time); // C1 abyssal (32.7 Hz)
  oscRoot.frequency.setValueAtTime(rootFreq * 0.998, time);
  oscTension.frequency.setValueAtTime(tensionFreq * 1.003, time);

  // LFO lent qui fait "respirer" et gronder le filtre passe-bas
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(millionsSuspenseLocked ? 4.4 : 2.2, time);
  lfoGain.gain.setValueAtTime(60, time);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(
    impactIntensity === 'heavy' ? 330 : 180,
    time
  );
  filter.frequency.exponentialRampToValueAtTime(115, time + duration);
  filter.Q.setValueAtTime(3.4, time);

  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);

  const dronePeak = millionsSuspenseLocked ? 0.14 : 0.11;
  gain.gain.setValueAtTime(0.001, time);
  gain.gain.linearRampToValueAtTime(dronePeak, time + 0.08);
  gain.gain.setValueAtTime(dronePeak * 0.85, time + duration * 0.75);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

  oscSub.connect(gain);
  oscRoot.connect(filter);
  oscTension.connect(filter);
  filter.connect(gain);
  gain.connect(out);

  oscSub.start(time);
  oscRoot.start(time);
  oscTension.start(time);
  lfo.start(time);

  const stopAt = time + duration + 0.05;
  oscSub.stop(stopAt);
  oscRoot.stop(stopAt);
  oscTension.stop(stopAt);
  lfo.stop(stopAt);

  // Impact de gong / timbale cinématique ("BOOOOOM")
  if (impactIntensity !== 'none') {
    const isHeavy = impactIntensity === 'heavy';

    // A. Chute sub-bass sismique (108 Hz -> 26 Hz)
    const boomOsc = ctx.createOscillator();
    const boomGain = ctx.createGain();
    boomOsc.type = 'sine';
    boomOsc.frequency.setValueAtTime(isHeavy ? 108 : 84, time);
    boomOsc.frequency.exponentialRampToValueAtTime(
      26,
      time + (isHeavy ? 1.2 : 0.78)
    );
    boomGain.gain.setValueAtTime(isHeavy ? 0.34 : 0.22, time);
    boomGain.gain.exponentialRampToValueAtTime(
      0.001,
      time + (isHeavy ? 1.3 : 0.85)
    );
    boomOsc.connect(boomGain);
    boomGain.connect(out);
    boomOsc.start(time);
    boomOsc.stop(time + (isHeavy ? 1.35 : 0.9));

    // B. Résonance métallique sombre de gong de plateau TV (harmoniques inharmoniques filtrées)
    if (isHeavy) {
      const gongRatios = [1.5, 2.12, 2.83]; // Quinte + Tierce mineure/Triton métallique
      gongRatios.forEach((ratio) => {
        const gOsc = ctx.createOscillator();
        const gFilter = ctx.createBiquadFilter();
        const gGain = ctx.createGain();

        gOsc.type = 'triangle';
        gOsc.frequency.setValueAtTime(rootFreq * ratio, time);

        gFilter.type = 'bandpass';
        gFilter.frequency.setValueAtTime(rootFreq * ratio, time);
        gFilter.Q.setValueAtTime(4.5, time);

        gGain.gain.setValueAtTime(0.001, time);
        gGain.gain.linearRampToValueAtTime(0.048, time + 0.02);
        gGain.gain.exponentialRampToValueAtTime(0.0008, time + 1.85);

        gOsc.connect(gFilter);
        gFilter.connect(gGain);
        gGain.connect(out);
        gOsc.start(time);
        gOsc.stop(time + 1.9);
      });
    }
  }
}

// 2. Double battement de cœur humain sous haute pression ("LUB - DUB")
function triggerOriginalHeartbeat(
  ctx: AudioContext,
  time: number,
  isFirstBeat: boolean,
  intensityMultiplier = 1
) {
  const out = getMasterOutput(ctx);

  // Onde sub-cardiaque profonde
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(isFirstBeat ? 76 : 62, time);
  osc.frequency.exponentialRampToValueAtTime(isFirstBeat ? 29 : 25, time + 0.23);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(135, time);

  const baseAmp = (isFirstBeat ? 0.28 : 0.19) * intensityMultiplier;
  gain.gain.setValueAtTime(0.001, time);
  gain.gain.linearRampToValueAtTime(baseAmp, time + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.26);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(out);

  osc.start(time);
  osc.stop(time + 0.28);

  // Impact sourd de valve cardiaque pour rendre le battement viscéral
  const thudOsc = ctx.createOscillator();
  const thudGain = ctx.createGain();
  thudOsc.type = 'triangle';
  thudOsc.frequency.setValueAtTime(isFirstBeat ? 125 : 98, time);
  thudOsc.frequency.exponentialRampToValueAtTime(40, time + 0.055);
  thudGain.gain.setValueAtTime(0.07 * intensityMultiplier, time);
  thudGain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
  thudOsc.connect(thudGain);
  thudGain.connect(out);
  thudOsc.start(time);
  thudOsc.stop(time + 0.065);
}

// 3. Tic-Tac d'horloge mécanique implacable (Chronomètre stéréo de suspense)
function triggerSuspenseClockTick(
  ctx: AudioContext,
  out: AudioNode,
  time: number,
  isTick: boolean,
  isAccent: boolean
) {
  const noise = ctx.createBufferSource();
  noise.buffer = getWhiteNoiseBuffer(ctx);

  const bandpass = ctx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.setValueAtTime(isTick ? 3100 : 2250, time);
  bandpass.Q.setValueAtTime(9.0, time);

  const gain = ctx.createGain();
  const peak = isAccent ? 0.055 : 0.032;
  gain.gain.setValueAtTime(0.001, time);
  gain.gain.linearRampToValueAtTime(peak, time + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0005, time + 0.028);

  noise.connect(bandpass);
  bandpass.connect(gain);

  if (typeof ctx.createStereoPanner === 'function') {
    const panner = ctx.createStereoPanner();
    panner.pan.setValueAtTime(isTick ? -0.35 : 0.35, time);
    gain.connect(panner);
    panner.connect(out);
  } else {
    gain.connect(out);
  }

  noise.start(time, time % 1.5, 0.035);
  noise.stop(time + 0.035);
}

// 4. Ostinato sombre hypnotique avec délai stéréo (cellule de demi-ton Sol - Lab - Sol - Fa#)
function triggerDarkSuspenseOstinato(
  ctx: AudioContext,
  out: AudioNode,
  time: number,
  midiNote: number,
  isHalfStepTension: boolean,
  isDownbeat: boolean
) {
  const playPulse = (startTime: number, vol: number, panVal: number) => {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    const freq = midiToFreq(midiNote);
    osc1.type = 'sine';
    osc2.type = isHalfStepTension ? 'sawtooth' : 'triangle';
    osc1.frequency.setValueAtTime(freq, startTime);
    osc2.frequency.setValueAtTime(
      isHalfStepTension ? freq * 1.004 : freq * 2,
      startTime
    );

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(
      isHalfStepTension ? freq * 2.6 : freq * 1.9,
      startTime
    );
    filter.frequency.exponentialRampToValueAtTime(freq * 0.9, startTime + 0.14);
    filter.Q.setValueAtTime(2.4, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(vol, startTime + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0006, startTime + 0.15);

    osc1.connect(gain);
    osc2.connect(filter);
    filter.connect(gain);

    if (typeof ctx.createStereoPanner === 'function') {
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(panVal, startTime);
      gain.connect(panner);
      panner.connect(out);
    } else {
      gain.connect(out);
    }

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + 0.16);
    osc2.stop(startTime + 0.16);
  };

  const mainVol = isDownbeat
    ? 0.048
    : isHalfStepTension
    ? 0.044
    : 0.026;

  // Note principale + double écho sombre ping-pong dans l'espace du plateau
  playPulse(time, mainVol, -0.2);
  playPulse(time + 0.232, mainVol * 0.36, 0.28);
  if (isHalfStepTension || isDownbeat) {
    playPulse(time + 0.464, mainVol * 0.14, -0.32);
  }
}

// 5. Cordes en Trémolo Hitchcockien & Dissonance de Demi-Ton (Tension psychologique)
function triggerTremoloSuspenseStrings(
  ctx: AudioContext,
  out: AudioNode,
  time: number,
  mainMidi: number,
  rubMidi: number | null, // Note de frottement dissonant (ex: Sol4 + Lab4 simultanés !)
  durationSeconds: number,
  crescendoEnd = false
) {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const oscSubStr = ctx.createOscillator();
  const tremoloLfo = ctx.createOscillator();
  const tremoloDepth = ctx.createGain();
  const tremoloNode = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  const envGain = ctx.createGain();

  const mainFreq = midiToFreq(mainMidi);
  osc1.type = 'sawtooth';
  osc2.type = 'sawtooth';
  oscSubStr.type = 'triangle';

  osc1.frequency.setValueAtTime(mainFreq * 0.996, time);
  osc2.frequency.setValueAtTime(
    rubMidi !== null ? midiToFreq(rubMidi) * 1.003 : mainFreq * 1.004,
    time
  );
  oscSubStr.frequency.setValueAtTime(mainFreq * 0.5, time);

  // Effet d'archet en trémolo rapide (7.2 Hz -> 10.5 Hz) typique des scènes de haute tension
  tremoloNode.gain.setValueAtTime(0.78, time);
  tremoloLfo.type = 'sine';
  tremoloLfo.frequency.setValueAtTime(7.2, time);
  if (crescendoEnd) {
    tremoloLfo.frequency.linearRampToValueAtTime(10.5, time + durationSeconds);
  }
  tremoloDepth.gain.setValueAtTime(0.24, time);
  tremoloLfo.connect(tremoloDepth);
  tremoloDepth.connect(tremoloNode.gain);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(620, time);
  filter.frequency.linearRampToValueAtTime(
    crescendoEnd ? 2100 : 1350,
    time + durationSeconds * (crescendoEnd ? 0.9 : 0.55)
  );
  if (!crescendoEnd) {
    filter.frequency.exponentialRampToValueAtTime(520, time + durationSeconds);
  }
  filter.Q.setValueAtTime(2.2, time);

  // Attaque très progressive (gonflement angoissant venu de l'ombre)
  const attackTime = Math.min(0.45, durationSeconds * 0.38);
  const peakGain = crescendoEnd ? 0.095 : 0.072;
  envGain.gain.setValueAtTime(0.001, time);
  envGain.gain.linearRampToValueAtTime(peakGain, time + attackTime);
  if (crescendoEnd) {
    envGain.gain.linearRampToValueAtTime(
      peakGain * 1.25,
      time + durationSeconds * 0.92
    );
  } else {
    envGain.gain.setValueAtTime(peakGain * 0.9, time + durationSeconds * 0.72);
  }
  envGain.gain.exponentialRampToValueAtTime(0.001, time + durationSeconds);

  osc1.connect(filter);
  osc2.connect(filter);
  oscSubStr.connect(filter);
  filter.connect(tremoloNode);
  tremoloNode.connect(envGain);
  envGain.connect(out);

  osc1.start(time);
  osc2.start(time);
  oscSubStr.start(time);
  tremoloLfo.start(time);

  const stopTime = time + durationSeconds + 0.04;
  osc1.stop(stopTime);
  osc2.stop(stopTime);
  oscSubStr.stop(stopTime);
  tremoloLfo.stop(stopTime);
}

// 6. Riser d'aspiration cinématique en fin de cycle (fait monter la pression avant le BOOOOM)
function triggerSuspenseRiser(
  ctx: AudioContext,
  out: AudioNode,
  time: number,
  rootMidi: number,
  durationSeconds: number
) {
  // A. Glissando ascendant sourd d'un triton vers l'octave (Fa#3 -> Do4)
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(midiToFreq(rootMidi + 18), time); // Fa#3
  osc.frequency.exponentialRampToValueAtTime(
    midiToFreq(rootMidi + 24), // Do4
    time + durationSeconds
  );

  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(280, time);
  filter.frequency.exponentialRampToValueAtTime(1600, time + durationSeconds);
  filter.Q.setValueAtTime(3.5, time);

  gain.gain.setValueAtTime(0.001, time);
  gain.gain.exponentialRampToValueAtTime(0.075, time + durationSeconds * 0.92);
  gain.gain.exponentialRampToValueAtTime(0.001, time + durationSeconds);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(out);

  osc.start(time);
  osc.stop(time + durationSeconds + 0.03);

  // B. Souffle inversé (Reverse Cymbal / Timbale Roll) en bruit blanc filtré
  const noise = ctx.createBufferSource();
  noise.buffer = getWhiteNoiseBuffer(ctx);
  const nFilter = ctx.createBiquadFilter();
  const nGain = ctx.createGain();

  nFilter.type = 'bandpass';
  nFilter.frequency.setValueAtTime(350, time);
  nFilter.frequency.exponentialRampToValueAtTime(2400, time + durationSeconds);
  nFilter.Q.setValueAtTime(4.0, time);

  nGain.gain.setValueAtTime(0.0005, time);
  nGain.gain.exponentialRampToValueAtTime(0.055, time + durationSeconds * 0.94);
  nGain.gain.exponentialRampToValueAtTime(0.001, time + durationSeconds);

  noise.connect(nFilter);
  nFilter.connect(nGain);
  nGain.connect(out);

  noise.start(time, 0, Math.min(1.95, durationSeconds));
  noise.stop(time + durationSeconds + 0.02);
}

// ============================================================================
// PARTITION DE HAUTE TENSION (64 PAS — PÉDALE DE DO MINEUR, DEMI-TONS & TRITONS)
// ============================================================================
const BAR_BASS_PEDAL = [36, 36, 36, 36];
const BAR_TENSION_OFFSET = [7, 8, 6, 7]; // Sol2 -> Lab2 (demi-ton) -> Fa#2 (triton) -> Sol2

// Ostinato sombre obsédant articulé autour du frottement Sol4 (67) <-> Lab4 (68) <-> Fa#4 (66)
const DARK_SUSPENSE_OSTINATO: number[][] = [
  // Mesure 1 (Cm abyssal) : le motif obsédant Do - Sol - Lab - Sol
  [48, 55, 67, 68, 67, 55, 63, 67, 48, 55, 68, 67, 66, 67, 63, 55],
  // Mesure 2 (Fm/C -> Ddim/C) : montée d'angoisse sur Lab - Sol - Fa# - Sol
  [48, 56, 68, 67, 68, 65, 68, 67, 48, 56, 68, 66, 67, 62, 63, 55],
  // Mesure 3 (Cm/Ab -> F#dim7) : tension chromatique aiguë Do5 - Si4 - Lab4 - Sol4 - Fa#4
  [48, 55, 67, 68, 72, 71, 68, 67, 48, 54, 66, 68, 67, 66, 63, 55],
  // Mesure 4 (G7b9/C — falaise de tension maximale avant le BOOOOM)
  [47, 55, 68, 67, 65, 68, 67, 66, 47, 56, 68, 71, 68, 67, 66, 59],
];

// Nappes de cordes en trémolo : phrases lentes, espacées de silences angoissants,
// avec frottements de seconde mineure (rubNote) comme dans un thriller
const SUSPENSE_STRING_SWELLS: {
  step: number;
  note: number;
  rubNote: number | null;
  lengthSteps: number;
  crescendoEnd?: boolean;
}[] = [
  // Mesure 1 : Gonflement lent sur Sol4 puis glissement glaçant d'un demi-ton sur Lab4
  { step: 2, note: 67, rubNote: null, lengthSteps: 8 },
  { step: 10, note: 68, rubNote: 67, lengthSteps: 6 }, // Frottement Sol4 + Lab4 !

  // Mesure 2 : Descente sur Fa#4 (triton) -> Sol4, puis silence tendu (seul le cœur bat)
  { step: 16, note: 67, rubNote: 66, lengthSteps: 6 },
  { step: 22, note: 62, rubNote: 63, lengthSteps: 6 }, // Ré4 + Mib4 sombre

  // Mesure 3 : Montée fatidique de QVGDM (Sol4 -> Lab4 -> Do5)
  { step: 32, note: 67, rubNote: null, lengthSteps: 6 },
  { step: 38, note: 68, rubNote: 67, lengthSteps: 6 },
  { step: 44, note: 72, rubNote: 71, lengthSteps: 4 }, // Do5 + Si4

  // Mesure 4 : Accord de suspense G7b9 en trémolo accéléré jusqu'au gouffre final
  { step: 48, note: 71, rubNote: 68, lengthSteps: 8 },
  { step: 56, note: 68, rubNote: 67, lengthSteps: 8, crescendoEnd: true },
];

export function setMillionsZoukStep(step: number) {
  millionsCurrentStep = Math.max(1, Math.min(15, step));
}

export function setMillionsSuspenseLocked(locked: boolean) {
  millionsSuspenseLocked = locked;
}

export function startMillionsZoukMusic(enabled = true, step = 1) {
  stopMillionsZoukMusic();
  if (!enabled) return;
  const ctx = getCtx();
  if (!ctx) return;

  millionsCurrentStep = step;
  millionsStepIndex = 0;

  // Tempo tendu de plateau TV (~95 BPM -> 1 double-croche = 158ms)
  const STEP_MS = 158;
  const STEP_SEC = STEP_MS / 1000;

  const playSuspenseTick = () => {
    const audio = getCtx();
    if (!audio) return;
    const out = getMasterOutput(audio);
    const now = audio.currentTime;

    const pos64 = millionsStepIndex % 64;
    const pos16 = pos64 % 16;
    const barIdx = Math.floor(pos64 / 16);

    // Transposition progressive par demi-ton selon le palier (exactement comme à la TV)
    const transpose =
      millionsCurrentStep <= 5
        ? 0
        : Math.min(7, millionsCurrentStep - 5);

    const highStakesFactor =
      1 +
      Math.max(0, millionsCurrentStep - 5) * 0.04 +
      (millionsSuspenseLocked ? 0.25 : 0);

    const rootNote = BAR_BASS_PEDAL[barIdx] + transpose;
    const tensionOffset = BAR_TENSION_OFFSET[barIdx];

    // 1. Grand Impact ("DOUUUUUM") + Bourdon abyssal respirant à chaque mesure
    if (pos16 === 0) {
      const impactType =
        barIdx === 0 ? 'heavy' : barIdx === 2 ? 'medium' : 'none';
      triggerDarkSuspenseDroneAndImpact(
        audio,
        out,
        now,
        rootNote,
        tensionOffset,
        STEP_SEC * 15.8,
        impactType
      );
    }

    // 2. Battement de cœur humain ("LUB-DUB") avec écart physiologique réaliste (pas 0 & 3, 8 & 11)
    // En mode "C'est votre dernier mot ?" ou paliers > 10, ajout d'un 3e battement d'adrénaline (pas 13 & 15)
    if (pos16 === 0 || pos16 === 8) {
      triggerOriginalHeartbeat(audio, now, true, highStakesFactor);
    } else if (pos16 === 3 || pos16 === 11) {
      triggerOriginalHeartbeat(audio, now, false, highStakesFactor);
    } else if (
      (millionsSuspenseLocked || millionsCurrentStep >= 11 || barIdx === 3) &&
      pos16 === 13
    ) {
      triggerOriginalHeartbeat(audio, now, true, highStakesFactor * 0.85);
    } else if (
      (millionsSuspenseLocked || millionsCurrentStep >= 11 || barIdx === 3) &&
      pos16 === 15
    ) {
      triggerOriginalHeartbeat(audio, now, false, highStakesFactor * 0.85);
    }

    // 3. Tic-Tac mécanique de chronomètre stéréo (croches en temps normal, doubles-croches sous haute tension)
    const playFastTicks =
      millionsSuspenseLocked || millionsCurrentStep >= 10 || barIdx === 3;
    if (pos16 % 2 === 0 || playFastTicks) {
      triggerSuspenseClockTick(
        audio,
        out,
        now,
        pos16 % 4 < 2,
        pos16 % 4 === 0
      );
    }

    // 4. Ostinato sombre hypnotique (cellule de demi-ton Sol - Lab - Sol - Fa#)
    const arpMidi = DARK_SUSPENSE_OSTINATO[barIdx][pos16] + transpose;
    const rawPitchClass = DARK_SUSPENSE_OSTINATO[barIdx][pos16] % 12;
    const isHalfStepOrTritone =
      rawPitchClass === 8 || rawPitchClass === 6 || rawPitchClass === 11; // Lab, Fa#, Si
    triggerDarkSuspenseOstinato(
      audio,
      out,
      now,
      arpMidi,
      isHalfStepOrTritone,
      pos16 % 4 === 0
    );

    // 5. Cordes en trémolo Hitchcockien & frottements de seconde mineure
    const stringEvent = SUSPENSE_STRING_SWELLS.find((ev) => ev.step === pos64);
    if (stringEvent) {
      triggerTremoloSuspenseStrings(
        audio,
        out,
        now,
        stringEvent.note + transpose,
        stringEvent.rubNote !== null ? stringEvent.rubNote + transpose : null,
        stringEvent.lengthSteps * STEP_SEC * 0.98,
        Boolean(stringEvent.crescendoEnd)
      );
    }

    // 6. Riser d'aspiration cinématique sur les 12 derniers pas avant le grand BOOOOM
    if (pos64 === 52) {
      triggerSuspenseRiser(audio, out, now, rootNote, 12 * STEP_SEC);
    }

    millionsStepIndex += 1;
  };

  playSuspenseTick();
  millionsInterval = setInterval(playSuspenseTick, STEP_MS);
}

export function stopMillionsZoukMusic() {
  millionsSuspenseLocked = false;
  if (millionsInterval) {
    clearInterval(millionsInterval);
    millionsInterval = null;
  }
}



