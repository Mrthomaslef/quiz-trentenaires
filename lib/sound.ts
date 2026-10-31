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
// SYNTHÉTISEUR « ELECTRO-QUIZ SHOW & SUSPENSE MOBILE » 🎮🔥
// Pensé spécifiquement pour être ULTRA-ENTRAÎNANT sur haut-parleur de mobile
// tout en gardant le suspens iconique des grands quiz (style Kahoot! × QVGDM) :
// 1. Beat Electro-Pop / Funky Quiz punchy (~125 BPM) : Kick net sur tous les
//    temps + Clap/Snare claquant sur 2 & 4 + Charleston & Woodblock Horloge
// 2. Basse Synthé Funky en sauts d'octaves (parfaitement audible sur téléphone)
//    sur la progression à suspens : Do mineur -> Lab Majeur -> Fa mineur -> Sol 7
// 3. Accords "Quiz Show Stabs" syncopés (rythmique 3+3+2 ultra-entraînante)
// 4. Mélodie "Hook" Marimba-Synthé & Lead Suspense (motif Do - Mib - Sol - Lab - Sol)
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
    masterCompressor.threshold.setValueAtTime(-12, ctx.currentTime);
    masterCompressor.knee.setValueAtTime(10, ctx.currentTime);
    masterCompressor.ratio.setValueAtTime(3.5, ctx.currentTime);
    masterCompressor.attack.setValueAtTime(0.003, ctx.currentTime);
    masterCompressor.release.setValueAtTime(0.15, ctx.currentTime);
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

// Gardé pour compatibilité avec playFinalAnswerSuspenseSound
function triggerOriginalHeartbeat(
  ctx: AudioContext,
  time: number,
  isFirstBeat: boolean,
  intensityMultiplier = 1
) {
  const out = getMasterOutput(ctx);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(isFirstBeat ? 110 : 85, time);
  osc.frequency.exponentialRampToValueAtTime(42, time + 0.16);
  gain.gain.setValueAtTime(0.001, time);
  gain.gain.linearRampToValueAtTime(
    (isFirstBeat ? 0.24 : 0.16) * intensityMultiplier,
    time + 0.01
  );
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
  osc.connect(gain);
  gain.connect(out);
  osc.start(time);
  osc.stop(time + 0.2);
}

// 1. Kick Electro-Quiz Punchy (avec attaque médium claire pour haut-parleur mobile)
function triggerQuizKick(
  ctx: AudioContext,
  out: AudioNode,
  time: number,
  isMainBeat = true
) {
  // Corps du kick (180 Hz -> 52 Hz)
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(isMainBeat ? 185 : 150, time);
  osc.frequency.exponentialRampToValueAtTime(52, time + 0.09);

  const vol = isMainBeat ? 0.28 : 0.18;
  gain.gain.setValueAtTime(0.001, time);
  gain.gain.linearRampToValueAtTime(vol, time + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

  osc.connect(gain);
  gain.connect(out);
  osc.start(time);
  osc.stop(time + 0.16);

  // "Punch" haut-grave/médium (triangle) pour ressortir net sur iPhone / Android
  const clickOsc = ctx.createOscillator();
  const clickGain = ctx.createGain();
  clickOsc.type = 'triangle';
  clickOsc.frequency.setValueAtTime(720, time);
  clickOsc.frequency.exponentialRampToValueAtTime(110, time + 0.025);
  clickGain.gain.setValueAtTime(isMainBeat ? 0.12 : 0.07, time);
  clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

  clickOsc.connect(clickGain);
  clickGain.connect(out);
  clickOsc.start(time);
  clickOsc.stop(time + 0.035);
}

// 2. Clap / Snare Pop-Quiz claquant sur les temps 2 et 4 (+ roulements de suspense)
function triggerQuizClapSnare(
  ctx: AudioContext,
  out: AudioNode,
  time: number,
  velocity = 1
) {
  // Tonique de caisse claire (pop snare body)
  const bodyOsc = ctx.createOscillator();
  const bodyGain = ctx.createGain();
  bodyOsc.type = 'triangle';
  bodyOsc.frequency.setValueAtTime(240, time);
  bodyOsc.frequency.exponentialRampToValueAtTime(115, time + 0.06);
  bodyGain.gain.setValueAtTime(0.001, time);
  bodyGain.gain.linearRampToValueAtTime(0.15 * velocity, time + 0.003);
  bodyGain.gain.exponentialRampToValueAtTime(0.001, time + 0.07);
  bodyOsc.connect(bodyGain);
  bodyGain.connect(out);
  bodyOsc.start(time);
  bodyOsc.stop(time + 0.075);

  // Clap brillant (bruit blanc filtré passe-bande)
  const noise = ctx.createBufferSource();
  noise.buffer = getWhiteNoiseBuffer(ctx);
  const filter = ctx.createBiquadFilter();
  const nGain = ctx.createGain();

  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1950, time);
  filter.Q.setValueAtTime(1.8, time);

  nGain.gain.setValueAtTime(0.001, time);
  nGain.gain.linearRampToValueAtTime(0.14 * velocity, time + 0.004);
  nGain.gain.exponentialRampToValueAtTime(0.0008, time + 0.11);

  noise.connect(filter);
  filter.connect(nGain);
  nGain.connect(out);
  noise.start(time, (time * 0.9) % 1.5, 0.12);
  noise.stop(time + 0.12);
}

// 3. Groove d'Horloge Woodblock + Charleston Electro (Tic-Tac-Tsss entraînant)
function triggerQuizClockHat(
  ctx: AudioContext,
  out: AudioNode,
  time: number,
  step16: number
) {
  const isOffbeatOpenHat = step16 % 4 === 2; // Le fameux contretemps "Tsss" qui fait danser !
  const isBeat = step16 % 4 === 0;

  // A. Woodblock / Clave de chronomètre de quiz (donne le côté jeu télé / app mobile)
  if (step16 % 2 === 0) {
    const wbOsc = ctx.createOscillator();
    const wbGain = ctx.createGain();
    wbOsc.type = 'sine';
    // Alternance TIC (aigu) / TAC (grave)
    wbOsc.frequency.setValueAtTime(step16 % 4 === 0 ? 1180 : 885, time);
    wbGain.gain.setValueAtTime(0.001, time);
    wbGain.gain.linearRampToValueAtTime(isBeat ? 0.055 : 0.04, time + 0.002);
    wbGain.gain.exponentialRampToValueAtTime(0.0008, time + 0.032);
    wbOsc.connect(wbGain);
    wbGain.connect(out);
    wbOsc.start(time);
    wbOsc.stop(time + 0.036);
  }

  // B. Hi-Hat Electro (fermé sur les 16es, ouvert sur le contretemps "2, 6, 10, 14")
  const noise = ctx.createBufferSource();
  noise.buffer = getWhiteNoiseBuffer(ctx);
  const hpFilter = ctx.createBiquadFilter();
  hpFilter.type = 'highpass';
  hpFilter.frequency.setValueAtTime(6200, time);

  const hGain = ctx.createGain();
  const peak = isOffbeatOpenHat ? 0.065 : isBeat ? 0.035 : 0.022;
  const decay = isOffbeatOpenHat ? 0.085 : 0.024;

  hGain.gain.setValueAtTime(0.001, time);
  hGain.gain.linearRampToValueAtTime(peak, time + 0.002);
  hGain.gain.exponentialRampToValueAtTime(0.0005, time + decay);

  noise.connect(hpFilter);
  hpFilter.connect(hGain);
  hGain.connect(out);

  noise.start(time, (time * 1.3) % 1.5, decay + 0.01);
  noise.stop(time + decay + 0.01);
}

// 4. Basse Synthé Funky & Rebondissante (riche en médiums pour être entendue sur mobile !)
function triggerBouncyQuizBass(
  ctx: AudioContext,
  out: AudioNode,
  time: number,
  midiNote: number,
  isHighOctave: boolean
) {
  const oscSaw = ctx.createOscillator();
  const oscSquare = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  // On joue en registre C2-C3 + harmonique C3-C4 pour percer sur les petits haut-parleurs
  const freq = midiToFreq(midiNote + 12); // Transposé d'une octave pour un rendu mobile ultra-net
  oscSaw.type = 'sawtooth';
  oscSquare.type = 'square';

  oscSaw.frequency.setValueAtTime(freq, time);
  oscSquare.frequency.setValueAtTime(freq * 0.5, time); // Sous-octave

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(isHighOctave ? 1650 : 1150, time);
  filter.frequency.exponentialRampToValueAtTime(260, time + 0.11);
  filter.Q.setValueAtTime(3.2, time);

  const vol = isHighOctave ? 0.115 : 0.135;
  gain.gain.setValueAtTime(0.001, time);
  gain.gain.linearRampToValueAtTime(vol, time + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.115);

  oscSaw.connect(filter);
  oscSquare.connect(filter);
  filter.connect(gain);
  gain.connect(out);

  oscSaw.start(time);
  oscSquare.start(time);
  oscSaw.stop(time + 0.125);
  oscSquare.stop(time + 0.125);
}

// 5. Accords "Quiz Show Synth Stabs" sur la rythmique entraînante 3+3+2 (style Kahoot!)
function triggerQuizChordStab(
  ctx: AudioContext,
  out: AudioNode,
  time: number,
  chordMidiNotes: number[],
  isAccent: boolean
) {
  chordMidiNotes.forEach((midi) => {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    const freq = midiToFreq(midi);
    osc1.type = 'sawtooth';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(freq * 0.998, time);
    osc2.frequency.setValueAtTime(freq * 1.003, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isAccent ? 2400 : 1700, time);
    filter.frequency.exponentialRampToValueAtTime(600, time + 0.13);
    filter.Q.setValueAtTime(1.8, time);

    const vol = isAccent ? 0.042 : 0.03;
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0008, time + 0.14);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(out);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + 0.15);
    osc2.stop(time + 0.15);
  });
}

// 6. Mélodie Principale "Marimba-Synth Hook" (Entraînante + Suspense QVGDM avec écho)
function triggerQuizMelodyHook(
  ctx: AudioContext,
  out: AudioNode,
  time: number,
  midiNote: number,
  durationSeconds: number,
  isTensionNote: boolean
) {
  const playNote = (startTime: number, peakGain: number, dur: number, pan: number) => {
    const oscMain = ctx.createOscillator();
    const oscHarm = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    const freq = midiToFreq(midiNote);
    oscMain.type = isTensionNote ? 'sawtooth' : 'triangle';
    oscHarm.type = 'sine';
    oscMain.frequency.setValueAtTime(freq, startTime);
    // Harmonique brillante de marimba/synthé à l'octave
    oscHarm.frequency.setValueAtTime(freq * 2, startTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3200, startTime);
    filter.frequency.exponentialRampToValueAtTime(900, startTime + dur);
    filter.Q.setValueAtTime(2.0, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.008);
    gain.gain.setValueAtTime(peakGain * 0.7, startTime + dur * 0.45);
    gain.gain.exponentialRampToValueAtTime(0.0008, startTime + dur);

    oscMain.connect(filter);
    oscHarm.connect(filter);
    filter.connect(gain);

    if (typeof ctx.createStereoPanner === 'function') {
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(pan, startTime);
      gain.connect(panner);
      panner.connect(out);
    } else {
      gain.connect(out);
    }

    oscMain.start(startTime);
    oscHarm.start(startTime);
    oscMain.stop(startTime + dur + 0.02);
    oscHarm.stop(startTime + dur + 0.02);
  };

  // Note principale bien présente + rebond d'écho stéréo entraînant
  playNote(time, isTensionNote ? 0.115 : 0.095, durationSeconds, -0.15);
  playNote(
    time + 0.175,
    isTensionNote ? 0.038 : 0.028,
    Math.min(0.16, durationSeconds * 0.7),
    0.25
  );
}

// ============================================================================
// PARTITION « ELECTRO-QUIZ SHOW » (64 PAS — Cm -> Ab -> Fm -> G7)
// ============================================================================

// Basse rebondissante en sauts d'octaves (façon Disco-Funk / Kahoot! / Synthwave Quiz)
const BOUNCY_BASS_PROGRESSION: number[][] = [
  // Mesure 1 : Do mineur (Cm) — rebond Do2 / Do3 + passage Sol2 / Lab2
  [36, 48, 36, 48, 36, 48, 43, 48, 36, 48, 36, 48, 39, 43, 44, 43],
  // Mesure 2 : La bémol Majeur (Ab) — groove lumineux mais tendu
  [32, 44, 32, 44, 32, 44, 39, 44, 32, 44, 32, 44, 39, 44, 43, 39],
  // Mesure 3 : Fa mineur (Fm) — montée d'enjeu
  [29, 41, 29, 41, 29, 41, 36, 41, 29, 41, 32, 44, 36, 48, 44, 41],
  // Mesure 4 : Sol 7 (G7 suspense) — tension maximale & relance rythmique vers Do !
  [31, 43, 31, 43, 31, 43, 38, 43, 31, 43, 35, 47, 38, 41, 43, 47],
];

// Accords de synthé rythmiques (joués en rythmique 3+3+2 sur chaque mesure)
const QUIZ_CHORD_PROGRESSION: number[][] = [
  [60, 63, 67], // Mesure 1 : Cm (Do4 - Mib4 - Sol4)
  [60, 63, 68], // Mesure 2 : Ab (Do4 - Mib4 - Lab4 -> le demi-ton de suspense !)
  [60, 65, 68], // Mesure 3 : Fm (Do4 - Fa4 - Lab4)
  [59, 65, 67], // Mesure 4 : G7 (Si3 - Fa4 - Sol4 -> tension de dominante !)
];

// Arpège Marimba-Pluck rapide en arrière-plan (donne la vitesse et l'énergie du chrono)
const QUIZ_FAST_ARPEGGIO: number[][] = [
  [60, 63, 67, 72, 67, 63, 68, 67, 60, 63, 67, 72, 68, 67, 63, 67], // Cm
  [60, 63, 68, 72, 68, 63, 67, 68, 60, 63, 68, 75, 72, 68, 67, 63], // Ab
  [60, 65, 68, 72, 68, 65, 68, 72, 60, 65, 68, 77, 75, 72, 68, 65], // Fm
  [59, 62, 67, 71, 68, 67, 65, 62, 59, 65, 67, 71, 72, 71, 68, 67], // G7
];

// Mélodie "Hook" ultra-accrocheuse combinant l'énergie d'un jeu mobile et le thème QVGDM
const QUIZ_MELODY_HOOK_EVENTS: {
  step: number;
  note: number;
  lengthSteps: number;
  tension?: boolean;
}[] = [
  // Mesure 1 (Cm) : Do - Mib - Sol ! Lab - Sol ! (rythmé et rebondissant)
  { step: 0, note: 72, lengthSteps: 2 },                  // Do5
  { step: 2, note: 75, lengthSteps: 2 },                  // Mib5
  { step: 4, note: 79, lengthSteps: 3 },                  // Sol5
  { step: 7, note: 80, lengthSteps: 3, tension: true },   // Lab5 (syncope de suspense !)
  { step: 10, note: 79, lengthSteps: 2 },                 // Sol5
  { step: 12, note: 75, lengthSteps: 2 },                 // Mib5
  { step: 14, note: 79, lengthSteps: 2 },                 // Sol5

  // Mesure 2 (Ab) : Réponse mélodique entraînante Lab - Sol - Fa - Mib - Sol
  { step: 16, note: 80, lengthSteps: 3, tension: true },  // Lab5
  { step: 19, note: 79, lengthSteps: 3 },                 // Sol5
  { step: 22, note: 77, lengthSteps: 2 },                 // Fa5
  { step: 24, note: 75, lengthSteps: 2 },                 // Mib5
  { step: 26, note: 77, lengthSteps: 2 },                 // Fa5
  { step: 28, note: 79, lengthSteps: 2 },                 // Sol5
  { step: 30, note: 75, lengthSteps: 2 },                 // Mib5

  // Mesure 3 (Fm) : La grande montée QVGDM en version électro-quiz (Do - Fa - Lab - Do6 !)
  { step: 32, note: 72, lengthSteps: 2 },                 // Do5
  { step: 34, note: 77, lengthSteps: 2 },                 // Fa5
  { step: 36, note: 80, lengthSteps: 3, tension: true },  // Lab5
  { step: 39, note: 79, lengthSteps: 3 },                 // Sol5
  { step: 42, note: 80, lengthSteps: 2, tension: true },  // Lab5
  { step: 44, note: 84, lengthSteps: 4, tension: true },  // Do6 (sommet !)

  // Mesure 4 (G7 Turnaround) : Descente/Relance de suspense Si - Lab - Sol - Fa# - Sol - Si !
  { step: 48, note: 83, lengthSteps: 3, tension: true },  // Si5 bécarre
  { step: 51, note: 80, lengthSteps: 3, tension: true },  // Lab5
  { step: 54, note: 79, lengthSteps: 2 },                 // Sol5
  { step: 56, note: 78, lengthSteps: 2, tension: true },  // Fa#5 (triton !)
  { step: 58, note: 79, lengthSteps: 2 },                 // Sol5
  { step: 60, note: 80, lengthSteps: 2, tension: true },  // Lab5
  { step: 62, note: 83, lengthSteps: 2, tension: true },  // Si5 (relance vers Do5 !)
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

  // Tempo Electro-Quiz ultra-entraînant (~125 BPM -> 1 double-croche = 120ms)
  const STEP_MS = 120;
  const STEP_SEC = STEP_MS / 1000;

  const playQuizGrooveTick = () => {
    const audio = getCtx();
    if (!audio) return;
    const out = getMasterOutput(audio);
    const now = audio.currentTime;

    const pos64 = millionsStepIndex % 64;
    const pos16 = pos64 % 16;
    const barIdx = Math.floor(pos64 / 16);

    // Transposition progressive par demi-ton selon le palier (monte la pression !)
    const transpose =
      millionsCurrentStep <= 5
        ? 0
        : Math.min(7, millionsCurrentStep - 5);

    const intensity =
      1 +
      Math.max(0, millionsCurrentStep - 5) * 0.03 +
      (millionsSuspenseLocked ? 0.2 : 0);

    // 1. KICK ELECTRO-QUIZ : 4-on-the-floor (0, 4, 8, 12) + rebonds funky (6, 14)
    if (pos16 % 4 === 0) {
      triggerQuizKick(audio, out, now, true);
    } else if (pos16 === 6 || pos16 === 14) {
      triggerQuizKick(audio, out, now, false);
    }

    // 2. CLAP / SNARE sur les temps 2 et 4 (pas 4 et 12) + roulement final sur la mesure 4
    if (pos16 === 4 || pos16 === 12) {
      triggerQuizClapSnare(audio, out, now, 0.95 * intensity);
    } else if (pos16 === 15 && barIdx % 2 === 1) {
      triggerQuizClapSnare(audio, out, now, 0.45 * intensity);
    } else if (barIdx === 3 && pos16 >= 12) {
      // Petit break/roulement de caisse claire super entraînant en fin de boucle !
      const rollVel = (0.45 + (pos16 - 12) * 0.16) * intensity;
      triggerQuizClapSnare(audio, out, now, rollVel);
    }

    // 3. CHARLESTON + WOODBLOCK HORLOGE sur chaque double-croche
    triggerQuizClockHat(audio, out, now, pos16);

    // 4. BASSE SYNTHÉ FUNKY EN OCTAVES (audible même sur petit haut-parleur mobile)
    const bassNote = BOUNCY_BASS_PROGRESSION[barIdx][pos16] + transpose;
    triggerBouncyQuizBass(audio, out, now, bassNote, pos16 % 2 === 1);

    // 5. ACCORDS "QUIZ SHOW STABS" sur la rythmique syncopée 3+3+2 (pas 0, 3, 6, 8, 11, 14)
    if (
      pos16 === 0 ||
      pos16 === 3 ||
      pos16 === 6 ||
      pos16 === 8 ||
      pos16 === 11 ||
      pos16 === 14
    ) {
      const chordNotes = QUIZ_CHORD_PROGRESSION[barIdx].map((n) => n + transpose);
      triggerQuizChordStab(
        audio,
        out,
        now,
        chordNotes,
        pos16 === 0 || pos16 === 8
      );
    }

    // 6. ARPÈGE PLUCK RAPIDE EN DOUBLES-CROCHES (énergie + compte à rebours)
    const arpNote = QUIZ_FAST_ARPEGGIO[barIdx][pos16] + transpose;
    triggerQuizMelodyHook(audio, out, now, arpNote, STEP_SEC * 0.85, false);

    // 7. MÉLODIE "HOOK" PRINCIPALE (Entraînante + Suspense QVGDM)
    const hookEv = QUIZ_MELODY_HOOK_EVENTS.find((ev) => ev.step === pos64);
    if (hookEv) {
      triggerQuizMelodyHook(
        audio,
        out,
        now,
        hookEv.note + transpose,
        hookEv.lengthSteps * STEP_SEC * 0.92,
        Boolean(hookEv.tension)
      );
    }

    millionsStepIndex += 1;
  };

  playQuizGrooveTick();
  millionsInterval = setInterval(playQuizGrooveTick, STEP_MS);
}

export function stopMillionsZoukMusic() {
  millionsSuspenseLocked = false;
  if (millionsInterval) {
    clearInterval(millionsInterval);
    millionsInterval = null;
  }
}



