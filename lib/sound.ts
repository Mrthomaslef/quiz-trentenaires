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

export function playSuspenseSound(enabled = true) {
  if (!enabled) return;
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  // Note grave dramatique style "C'est votre dernier mot ?"
  const freqs = [146.83, 220]; // D3 + A3
  freqs.forEach((f) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(f, now);
    gain.gain.setValueAtTime(0.11, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.48);
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
// SYNTHÉTISEUR « QUI VEUT GAGNER DES MILLIONS » — THÈME ORIGINAL TV 🎬
// Reproduction fidèle de l'ambiance sonore originale de Keith & Matthew Strachan :
// 1. Le grand impact grave "DOUUUUUM" + Bourdon (Drone) sombre continu en Do mineur
// 2. Le double battement de cœur humain ("BOUM-boum ... BOUM-boum")
// 3. L'arpège horloge hypnotique en doubles-croches avec écho (synthé cristallin)
// 4. Les nappes de Cordes & Chœurs dramatiques sur les demi-tons (Sol -> Lab -> Sol,
//    Do -> Mib -> Sol -> Lab -> Do -> Si bécarre -> Sol)
// 5. Transposition progressive par demi-ton selon le palier (exactement comme à la TV)
// ============================================================================

let millionsInterval: ReturnType<typeof setInterval> | null = null;
let millionsStepIndex = 0;
let millionsCurrentStep = 1; // 1..15

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// 1. Impact dramatique "DOUUUUUM" + Bourdon grave (Drone cinématique du plateau TV)
function triggerOriginalDronePad(
  ctx: AudioContext,
  time: number,
  rootMidi: number,
  duration: number,
  isImpactBar: boolean
) {
  // Sous-basse profonde (C1) + Quinte (G1) + Octave (C2)
  const oscSub = ctx.createOscillator();
  const oscFifth = ctx.createOscillator();
  const oscPad = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  const rootFreq = midiToFreq(rootMidi); // ex: C2 (65.4 Hz)
  oscSub.type = 'sine';
  oscFifth.type = 'sawtooth';
  oscPad.type = 'sawtooth';

  oscSub.frequency.setValueAtTime(rootFreq * 0.5, time); // C1 profond
  oscFifth.frequency.setValueAtTime(rootFreq * 1.5, time); // G2
  oscPad.frequency.setValueAtTime(rootFreq * 1.003, time); // C2 detuned

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(isImpactBar ? 420 : 240, time);
  filter.frequency.exponentialRampToValueAtTime(140, time + duration);
  filter.Q.setValueAtTime(2.5, time);

  gain.gain.setValueAtTime(0.001, time);
  gain.gain.linearRampToValueAtTime(isImpactBar ? 0.13 : 0.08, time + 0.06);
  gain.gain.setValueAtTime(0.065, time + duration * 0.6);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

  oscSub.connect(gain);
  oscFifth.connect(filter);
  oscPad.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  // En début de boucle : le fameux coup de gong/timbale grave de lancement de question
  if (isImpactBar) {
    const boomOsc = ctx.createOscillator();
    const boomGain = ctx.createGain();
    boomOsc.type = 'sine';
    boomOsc.frequency.setValueAtTime(110, time);
    boomOsc.frequency.exponentialRampToValueAtTime(32, time + 0.65);
    boomGain.gain.setValueAtTime(0.22, time);
    boomGain.gain.exponentialRampToValueAtTime(0.001, time + 0.75);
    boomOsc.connect(boomGain);
    boomGain.connect(ctx.destination);
    boomOsc.start(time);
    boomOsc.stop(time + 0.78);
  }

  oscSub.start(time);
  oscFifth.start(time);
  oscPad.start(time);
  oscSub.stop(time + duration + 0.05);
  oscFifth.stop(time + duration + 0.05);
  oscPad.stop(time + duration + 0.05);
}

// 2. Le vrai double battement de cœur sourd ("LUB - DUB") de Qui veut gagner des millions
function triggerOriginalHeartbeat(
  ctx: AudioContext,
  time: number,
  isFirstBeat: boolean
) {
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(isFirstBeat ? 68 : 56, time);
  osc.frequency.exponentialRampToValueAtTime(28, time + 0.22);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(120, time);

  gain.gain.setValueAtTime(0.001, time);
  gain.gain.linearRampToValueAtTime(isFirstBeat ? 0.24 : 0.16, time + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.26);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(time);
  osc.stop(time + 0.28);
}

// 3. L'arpège horloge cristallin & tendu (avec double note d'écho façon délai stéréo)
function triggerOriginalClockPulse(
  ctx: AudioContext,
  time: number,
  midiNote: number,
  isAccent: boolean
) {
  const playPluck = (startTime: number, vol: number) => {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    const freq = midiToFreq(midiNote);
    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, startTime);
    osc2.frequency.setValueAtTime(freq * 2, startTime); // Harmonique cristalline à l'octave

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq * 1.5, startTime);
    filter.Q.setValueAtTime(1.8, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(vol, startTime + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0008, startTime + 0.14);

    osc1.connect(gain);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + 0.15);
    osc2.stop(startTime + 0.15);
  };

  // Note directe + léger écho à 240ms comme dans le mix TV original
  playPluck(time, isAccent ? 0.055 : 0.032);
  playPluck(time + 0.24, isAccent ? 0.018 : 0.01);
}

// 4. Cordes & Chœurs dramatiques du thème original (attaque lente cinématique + vibrato tendu)
function triggerOriginalSymphonicChoirLead(
  ctx: AudioContext,
  time: number,
  midiNote: number,
  durationSeconds: number
) {
  const oscStrings1 = ctx.createOscillator();
  const oscStrings2 = ctx.createOscillator();
  const oscChoir = ctx.createOscillator();
  const oscLowOctave = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  const baseFreq = midiToFreq(midiNote);
  oscStrings1.type = 'sawtooth';
  oscStrings2.type = 'sawtooth';
  oscChoir.type = 'triangle';
  oscLowOctave.type = 'sawtooth';

  // Ensemble symphonique légèrement désaccordé (effet orchestre + chœur)
  oscStrings1.frequency.setValueAtTime(baseFreq * 0.997, time);
  oscStrings2.frequency.setValueAtTime(baseFreq * 1.003, time);
  oscChoir.frequency.setValueAtTime(baseFreq, time);
  oscLowOctave.frequency.setValueAtTime(baseFreq * 0.5, time);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(950, time);
  filter.frequency.linearRampToValueAtTime(
    1850,
    time + Math.min(0.35, durationSeconds * 0.45)
  );
  filter.frequency.exponentialRampToValueAtTime(
    750,
    time + Math.max(0.25, durationSeconds)
  );

  // Enveloppe d'archet de cordes / chœur dramatique (gonflement progressif)
  const attackTime = Math.min(0.12, durationSeconds * 0.25);
  gain.gain.setValueAtTime(0.001, time);
  gain.gain.linearRampToValueAtTime(0.115, time + attackTime);
  gain.gain.setValueAtTime(0.105, time + Math.max(attackTime, durationSeconds * 0.72));
  gain.gain.exponentialRampToValueAtTime(0.001, time + durationSeconds);

  oscStrings1.connect(filter);
  oscStrings2.connect(filter);
  oscChoir.connect(filter);
  oscLowOctave.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  oscStrings1.start(time);
  oscStrings2.start(time);
  oscChoir.start(time);
  oscLowOctave.start(time);

  oscStrings1.stop(time + durationSeconds + 0.04);
  oscStrings2.stop(time + durationSeconds + 0.04);
  oscChoir.stop(time + durationSeconds + 0.04);
  oscLowOctave.stop(time + durationSeconds + 0.04);
}

// ============================================================================
// PARTITION EXACTE DU THÈME ORIGINAL DE KEITH & MATTHEW STRACHAN (64 pas)
// ============================================================================
// Le vrai thème de réflexion de "Qui veut gagner des millions" repose sur une
// pédale hypnotique de Do (C2) avec l'arpège d'horloge (Cm -> Fm/C -> Ab/C -> G7/C)
// et la mélodie dramatique en demi-tons :
const BAR_BASS_PEDAL = [36, 36, 36, 36]; // Pédale grave de Do (C2) sur les 4 mesures comme dans l'original !

// L'arpège horloge exact de l'émission (ostinato 16 notes par mesure)
const ORIGINAL_CLOCK_OSTINATO: number[][] = [
  // Mesure 1 (Cm) : Do4 - Sol4 - Mib4 - Do4 (×4)
  [60, 67, 63, 60, 60, 67, 63, 60, 60, 68, 63, 60, 60, 67, 63, 60],
  // Mesure 2 (Fm/C -> Cm) : Do4 - Lab4 - Fa4 - Do4 -> Do4 - Sol4 - Mib4 - Ré4
  [60, 68, 65, 60, 60, 68, 65, 60, 60, 67, 62, 60, 59, 67, 62, 59],
  // Mesure 3 (Cm -> Ab) : Do4 - Sol4 - Mib4 - Do5 -> Lab4 - Do5 - Mib5 - Do5
  [60, 67, 63, 72, 60, 67, 63, 72, 63, 68, 72, 75, 63, 68, 72, 68],
  // Mesure 4 (G7sus/C -> G7) : Si3 - Sol4 - Fa4 - Ré4 (tension maximale)
  [59, 67, 65, 62, 59, 67, 65, 62, 59, 68, 65, 62, 59, 67, 62, 55],
];

// La mélodie dramatique officielle (Cordes & Chœurs) :
// 1re partie : le fameux motif de suspense (Do - Mib - SOL———— Lab———— Sol———— | Fa - Mib - RÉ————)
// 2e partie  : la montée emblématique (Do - Mib - SOL—— Lab—— DO5———— | SI4———— Lab4 - SOL4————)
const ORIGINAL_THEME_MELODY: {
  step: number;
  note: number;
  lengthSteps: number;
}[] = [
  // Mesure 1 (Cm) : Do - Mib - SOL—————— Lab———— Sol
  { step: 0, note: 60, lengthSteps: 2 },  // Do4
  { step: 2, note: 63, lengthSteps: 2 },  // Mib4
  { step: 4, note: 67, lengthSteps: 6 },  // SOL4 (longue tenue dramatique)
  { step: 10, note: 68, lengthSteps: 4 }, // Lab4 (le demi-ton angoissant de QVGDM)
  { step: 14, note: 67, lengthSteps: 2 }, // Sol4

  // Mesure 2 (Fm/C -> G) : Fa - Mib - RÉ—————— Mib - Fa - Sol
  { step: 16, note: 65, lengthSteps: 2 }, // Fa4
  { step: 18, note: 63, lengthSteps: 2 }, // Mib4
  { step: 20, note: 62, lengthSteps: 6 }, // RÉ4 (tenue suspendue)
  { step: 26, note: 63, lengthSteps: 2 }, // Mib4
  { step: 28, note: 65, lengthSteps: 2 }, // Fa4
  { step: 30, note: 67, lengthSteps: 2 }, // Sol4

  // Mesure 3 (Montée du générique) : Do - Mib - SOL———— Lab———— DO5————
  { step: 32, note: 60, lengthSteps: 2 }, // Do4
  { step: 34, note: 63, lengthSteps: 2 }, // Mib4
  { step: 36, note: 67, lengthSteps: 4 }, // SOL4
  { step: 40, note: 68, lengthSteps: 4 }, // LAB4
  { step: 44, note: 72, lengthSteps: 4 }, // DO5 (sommet des chœurs)

  // Mesure 4 (Tension G7 iconique) : SI4—————— Lab4 - SOL4————————
  { step: 48, note: 71, lengthSteps: 6 }, // SI4 bécarre
  { step: 54, note: 68, lengthSteps: 2 }, // Lab4
  { step: 56, note: 67, lengthSteps: 8 }, // SOL4 (tenue finale avant le BOUM)
];

export function setMillionsZoukStep(step: number) {
  millionsCurrentStep = Math.max(1, Math.min(15, step));
}

export function startMillionsZoukMusic(enabled = true, step = 1) {
  stopMillionsZoukMusic();
  if (!enabled) return;
  const ctx = getCtx();
  if (!ctx) return;

  millionsCurrentStep = step;
  millionsStepIndex = 0;

  // Tempo officiel du plateau TV (~92 BPM -> 1 double-croche = 162ms)
  const STEP_MS = 162;
  const STEP_SEC = STEP_MS / 1000;

  const playOriginalTick = () => {
    const audio = getCtx();
    if (!audio) return;
    const now = audio.currentTime;

    const pos64 = millionsStepIndex % 64;
    const pos16 = pos64 % 16;
    const barIdx = Math.floor(pos64 / 16);

    // Transposition fidèle à l'émission : à partir du palier 6, la musique monte d'un demi-ton par question !
    const transpose =
      millionsCurrentStep <= 5
        ? 0
        : Math.min(7, millionsCurrentStep - 5);

    const rootNote = BAR_BASS_PEDAL[barIdx] + transpose;

    // 1. Bourdon sombre ("DOUUUUUM") en début de chaque mesure
    if (pos16 === 0) {
      triggerOriginalDronePad(
        audio,
        now,
        rootNote,
        STEP_SEC * 15.5,
        barIdx === 0 || barIdx === 2
      );
    }

    // 2. Battement de cœur humain ("LUB-DUB") sur les temps 1 (pas 0 & 2) et 3 (pas 8 & 10)
    if (pos16 === 0 || pos16 === 8) {
      triggerOriginalHeartbeat(audio, now, true);
    } else if (pos16 === 2 || pos16 === 10) {
      triggerOriginalHeartbeat(audio, now, false);
    }

    // 3. L'arpège horloge hypnotique de "Qui veut gagner des millions"
    const arpNote = ORIGINAL_CLOCK_OSTINATO[barIdx][pos16] + transpose;
    triggerOriginalClockPulse(audio, now, arpNote, pos16 % 4 === 0);

    // 4. Mélodie dramatique officielle (Cordes & Chœurs)
    const melodyEvent = ORIGINAL_THEME_MELODY.find((ev) => ev.step === pos64);
    if (melodyEvent) {
      triggerOriginalSymphonicChoirLead(
        audio,
        now,
        melodyEvent.note + transpose,
        melodyEvent.lengthSteps * STEP_SEC * 0.96
      );
    }

    millionsStepIndex += 1;
  };

  playOriginalTick();
  millionsInterval = setInterval(playOriginalTick, STEP_MS);
}

export function stopMillionsZoukMusic() {
  if (millionsInterval) {
    clearInterval(millionsInterval);
    millionsInterval = null;
  }
}



