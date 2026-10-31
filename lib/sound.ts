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
// SYNTHÉTISEUR « QUI VEUT GAGNER DES MILLIONS » — VERSION ZOUK ANTILLAIS 🌴
// Combine :
// 1. Le vrai thème mélodique officiel de l'émission (tenues dramatiques :
//    Do - Mib - SOL——— Lab—— Sol | Fa - Mib - RÉ——— Mib - Fa - Sol |
//    Do - Mib - SOL—— Lab—— DO——— | SI——— Lab - SOL————)
// 2. Le fameux battement de cœur "BOUM-boum" + l'arpège horloge de suspense
//    (C - Eb - G - C) typique du plateau TV, joué au Steel-Pan / Marimba
// 3. Le groove Zouk Antillais en accompagnement (Basse ronde, Ti-bwa doux et
//    accords contretemps Zouk) sans jamais couvrir la mélodie !
// ============================================================================

let zoukInterval: ReturnType<typeof setInterval> | null = null;
let zoukStepIndex = 0;
let zoukCurrentPallet = 1; // 1..15 (module la tonalité par demi-ton comme dans l'émission)

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// 1. Le fameux "BOUM-boum" (battement de cœur / timbale QVGDM) + Kick Zouk
function triggerMillionsHeartbeatKick(
  ctx: AudioContext,
  time: number,
  isHeavyDownbeat: boolean
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(isHeavyDownbeat ? 98 : 82, time);
  osc.frequency.exponentialRampToValueAtTime(36, time + 0.18);
  gain.gain.setValueAtTime(isHeavyDownbeat ? 0.24 : 0.14, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.24);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(time);
  osc.stop(time + 0.25);
}

// 2. Nappe dramatique grave "DOUUUM" de début de mesure (ambiance plateau QVGDM)
function triggerMillionsSuspensePad(
  ctx: AudioContext,
  time: number,
  rootMidi: number,
  duration: number
) {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  const freq = midiToFreq(rootMidi);
  osc1.type = 'sawtooth';
  osc2.type = 'triangle';
  osc1.frequency.setValueAtTime(freq, time);
  osc2.frequency.setValueAtTime(freq * 1.5, time); // Quinte dramatique

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(320, time);
  filter.frequency.linearRampToValueAtTime(520, time + duration * 0.5);
  filter.frequency.exponentialRampToValueAtTime(220, time + duration);

  gain.gain.setValueAtTime(0.001, time);
  gain.gain.linearRampToValueAtTime(0.055, time + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(time);
  osc2.start(time);
  osc1.stop(time + duration + 0.02);
  osc2.stop(time + duration + 0.02);
}

// 3. L'arpège horloge hypnotique de "Qui veut gagner des millions" (en Steel-Pan / Kalimb-Zouk)
function triggerMillionsClockArpeggio(
  ctx: AudioContext,
  time: number,
  midiNote: number,
  accent: boolean
) {
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  const freq = midiToFreq(midiNote);
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, time);

  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(freq * 2, time);
  filter.Q.setValueAtTime(2.2, time);

  gain.gain.setValueAtTime(accent ? 0.055 : 0.032, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.11);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start(time);
  osc.stop(time + 0.12);
}

// 4. Ti-bwa / Shaker Zouk très doux en arrière-plan
function triggerZoukTiBwa(
  ctx: AudioContext,
  time: number,
  accent: boolean
) {
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(accent ? 1450 : 1080, time);
  osc.frequency.exponentialRampToValueAtTime(460, time + 0.03);

  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1400, time);
  filter.Q.setValueAtTime(4.0, time);

  gain.gain.setValueAtTime(accent ? 0.038 : 0.018, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start(time);
  osc.stop(time + 0.045);
}

// 5. Basse Zouk ronde et chantante
function triggerZoukBass(
  ctx: AudioContext,
  time: number,
  midiNote: number,
  duration = 0.24
) {
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(midiToFreq(midiNote), time);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(310, time);
  filter.frequency.exponentialRampToValueAtTime(130, time + duration);

  gain.gain.setValueAtTime(0.11, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start(time);
  osc.stop(time + duration + 0.01);
}

// 6. Mélodie principale officielle de "Qui veut gagner des millions"
//    (Cordes dramatiques + Cuivres Zouk, avec vraies tenues longues pour qu'on
//    reconnaisse immédiatement l'air de l'émission !)
function triggerMillionsMainThemeLead(
  ctx: AudioContext,
  time: number,
  midiNote: number,
  durationSeconds: number
) {
  const oscMain = ctx.createOscillator();
  const oscChorus = ctx.createOscillator();
  const oscOctave = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  const baseFreq = midiToFreq(midiNote);
  oscMain.type = 'sawtooth';
  oscChorus.type = 'sawtooth';
  oscOctave.type = 'triangle';

  oscMain.frequency.setValueAtTime(baseFreq, time);
  oscChorus.frequency.setValueAtTime(baseFreq * 1.005, time); // Effet ensemble de cordes/choeur
  oscOctave.frequency.setValueAtTime(baseFreq * 0.5, time); // Corps grave

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2200, time);
  filter.frequency.exponentialRampToValueAtTime(
    900,
    time + Math.max(0.2, durationSeconds)
  );

  // Attaque franche puis tenue chantante façon générique TV
  gain.gain.setValueAtTime(0.001, time);
  gain.gain.linearRampToValueAtTime(0.145, time + 0.025);
  gain.gain.setValueAtTime(0.13, time + Math.max(0.05, durationSeconds * 0.65));
  gain.gain.exponentialRampToValueAtTime(0.001, time + durationSeconds);

  oscMain.connect(filter);
  oscChorus.connect(filter);
  oscOctave.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  oscMain.start(time);
  oscChorus.start(time);
  oscOctave.start(time);
  oscMain.stop(time + durationSeconds + 0.02);
  oscChorus.stop(time + durationSeconds + 0.02);
  oscOctave.stop(time + durationSeconds + 0.02);
}

// 7. Accord Guitare/Clavier Zouk sur le contretemps
function triggerZoukChordSkank(
  ctx: AudioContext,
  time: number,
  midiChord: number[]
) {
  midiChord.forEach((note) => {
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(midiToFreq(note), time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, time);

    gain.gain.setValueAtTime(0.032, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + 0.15);
  });
}

// ============================================================================
// PARTITION EXACTE DE « QUI VEUT GAGNER DES MILLIONS » (64 pas = 4 mesures)
// ============================================================================
// Mesure 1 : Cm  (Do - Mib - SOL———— Lab——— Sol)
// Mesure 2 : Fm  (Fa - Mib - RÉ———— Mib - Fa - Sol)
// Mesure 3 : Ab  (Do - Mib - SOL——— Lab——— DO(aigu)———)
// Mesure 4 : G7  (SI———— Lab - SOL————————) -> Suspense iconique QVGDM !
const BAR_BASS_ROOTS = [36, 41, 44, 43]; // C2, F2, Ab2, G2
const BAR_CHORDS = [
  [60, 63, 67], // Cm (Do - Mib - Sol)
  [60, 65, 68], // Fm (Do - Fa - Lab)
  [60, 63, 68], // Ab (Do - Mib - Lab)
  [59, 62, 67], // G7 (Si - Ré - Sol : la sensible Si bécarre de QVGDM !)
];

// Arpège horloge de suspense QVGDM (16 doubles-croches par mesure)
const BAR_CLOCK_ARPEGGIOS: number[][] = [
  // Mesure 1 (Cm) : Do - Mib - Sol - Do5 - Sol - Mib - Do - Sol ...
  [60, 63, 67, 72, 67, 63, 60, 67, 60, 63, 68, 72, 68, 63, 60, 67],
  // Mesure 2 (Fm -> G) : Do - Fa - Lab - Do5 - Lab - Fa - Ré - Sol ...
  [60, 65, 68, 72, 68, 65, 62, 67, 59, 62, 67, 71, 67, 62, 59, 67],
  // Mesure 3 (Cm -> Ab) : Do - Mib - Sol - Do5 - Lab - Do5 - Mib5 - Do5 ...
  [60, 63, 67, 72, 67, 63, 68, 72, 68, 63, 68, 72, 75, 72, 68, 63],
  // Mesure 4 (G7 suspense) : Si - Ré - Sol - Si4 - Sol - Fa - Ré - Si3 ...
  [59, 62, 67, 71, 67, 62, 59, 67, 59, 62, 65, 68, 67, 62, 59, 55],
];

// Chaque événement mélodique = { step: 0..63, note: MIDI, lengthSteps: durée en doubles-croches }
const MILLIONS_THEME_EVENTS: {
  step: number;
  note: number;
  lengthSteps: number;
}[] = [
  // --- MESURE 1 (Cm) : Do - Mib - SOL—————— Lab———— Sol ---
  { step: 0, note: 60, lengthSteps: 2 },  // Do4
  { step: 2, note: 63, lengthSteps: 2 },  // Mib4
  { step: 4, note: 67, lengthSteps: 6 },  // SOL4 (tenue signature !)
  { step: 10, note: 68, lengthSteps: 4 }, // Lab4 (demi-ton dramatique !)
  { step: 14, note: 67, lengthSteps: 2 }, // Sol4

  // --- MESURE 2 (Fm -> G) : Fa - Mib - RÉ—————— Mib - Fa - Sol ---
  { step: 16, note: 65, lengthSteps: 2 }, // Fa4
  { step: 18, note: 63, lengthSteps: 2 }, // Mib4
  { step: 20, note: 62, lengthSteps: 6 }, // RÉ4 (tenue dramatique !)
  { step: 26, note: 63, lengthSteps: 2 }, // Mib4
  { step: 28, note: 65, lengthSteps: 2 }, // Fa4
  { step: 30, note: 67, lengthSteps: 2 }, // Sol4

  // --- MESURE 3 (Ascension QVGDM) : Do - Mib - SOL———— Lab———— DO5———— ---
  { step: 32, note: 60, lengthSteps: 2 }, // Do4
  { step: 34, note: 63, lengthSteps: 2 }, // Mib4
  { step: 36, note: 67, lengthSteps: 4 }, // SOL4
  { step: 40, note: 68, lengthSteps: 4 }, // LAB4
  { step: 44, note: 72, lengthSteps: 4 }, // DO5 (sommet dramatique !)

  // --- MESURE 4 (Suspense G7 iconique) : SI4—————— Lab4 - SOL4———————— ---
  { step: 48, note: 71, lengthSteps: 6 }, // SI4 (tension maximale QVGDM !)
  { step: 54, note: 68, lengthSteps: 2 }, // Lab4
  { step: 56, note: 67, lengthSteps: 8 }, // SOL4 (longue tenue finale avant le BOUM !)
];

export function setMillionsZoukStep(step: number) {
  zoukCurrentPallet = Math.max(1, Math.min(15, step));
}

export function startMillionsZoukMusic(enabled = true, step = 1) {
  stopMillionsZoukMusic();
  if (!enabled) return;
  const ctx = getCtx();
  if (!ctx) return;

  zoukCurrentPallet = step;
  zoukStepIndex = 0;

  // Tempo dramatique & Zouk : ~98 BPM -> 1 double-croche = 152ms
  const STEP_MS = 152;
  const STEP_SEC = STEP_MS / 1000;

  const playZoukTick = () => {
    const audio = getCtx();
    if (!audio) return;
    const now = audio.currentTime;

    const pos64 = zoukStepIndex % 64;
    const pos16 = pos64 % 16;
    const barIdx = Math.floor(pos64 / 16);

    // Modulation de tension façon "Qui veut gagner des millions" (+1 demi-ton par palier à partir du palier 6)
    const transpose =
      zoukCurrentPallet > 10
        ? 2
        : zoukCurrentPallet > 5
        ? 1
        : 0;

    const rootNote = BAR_BASS_ROOTS[barIdx] + transpose;

    // 1. Nappe dramatique QVGDM en début de mesure ("DOUUUM")
    if (pos16 === 0) {
      triggerMillionsSuspensePad(audio, now, rootNote, STEP_SEC * 14);
    }

    // 2. Battement de cœur QVGDM ("BOUM-boum") + Kick Zouk sur les temps
    if (pos16 === 0 || pos16 === 8) {
      triggerMillionsHeartbeatKick(audio, now, true);
    } else if (pos16 === 3 || pos16 === 4 || pos16 === 12) {
      triggerMillionsHeartbeatKick(audio, now, false);
    }

    // 3. Arpège horloge hypnotique de "Qui veut gagner des millions" (en continu)
    const arpNote = BAR_CLOCK_ARPEGGIOS[barIdx][pos16] + transpose;
    triggerMillionsClockArpeggio(audio, now, arpNote, pos16 % 4 === 0);

    // 4. Groove Zouk doux (Ti-bwa 3-3-2 + Basse Zouk + Accords contretemps)
    const isTiBwaAccent =
      pos16 === 0 ||
      pos16 === 3 ||
      pos16 === 6 ||
      pos16 === 8 ||
      pos16 === 11 ||
      pos16 === 14;
    if (isTiBwaAccent) {
      triggerZoukTiBwa(audio, now, pos16 === 3 || pos16 === 11);
    }

    if (pos16 === 0 || pos16 === 8) {
      triggerZoukBass(audio, now, rootNote, 0.28);
    } else if (pos16 === 3 || pos16 === 11) {
      triggerZoukBass(audio, now, rootNote + 7, 0.2); // Quinte Zouk
    } else if (pos16 === 6 || pos16 === 14) {
      triggerZoukBass(audio, now, rootNote + 12, 0.18); // Octave Zouk
    }

    if (pos16 === 2 || pos16 === 6 || pos16 === 10 || pos16 === 14) {
      const chord = BAR_CHORDS[barIdx].map((n) => n + transpose);
      triggerZoukChordSkank(audio, now, chord);
    }

    // 5. THÈME MÉLODIQUE OFFICIEL DE « QUI VEUT GAGNER DES MILLIONS » au premier plan !
    const melodyEvent = MILLIONS_THEME_EVENTS.find((ev) => ev.step === pos64);
    if (melodyEvent) {
      triggerMillionsMainThemeLead(
        audio,
        now,
        melodyEvent.note + transpose,
        melodyEvent.lengthSteps * STEP_SEC * 0.94
      );
    }

    zoukStepIndex += 1;
  };

  playZoukTick();
  zoukInterval = setInterval(playZoukTick, STEP_MS);
}

export function stopMillionsZoukMusic() {
  if (zoukInterval) {
    clearInterval(zoukInterval);
    zoukInterval = null;
  }
}



