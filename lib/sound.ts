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
// Mélange le thème dramatique en Do mineur (Cm - Ab - Fm - G7) avec le groove
// Zouk (Kick 4x4, Ti-bwa caribéen 3-3-2, Basse syncopée & Synth-Brass Zouk)
// ============================================================================

let zoukInterval: ReturnType<typeof setInterval> | null = null;
let zoukStepIndex = 0;
let zoukCurrentPallet = 1; // 1..15 (module la tonalité par demi-ton comme dans l'émission)

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function triggerZoukKick(ctx: AudioContext, time: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(115, time);
  osc.frequency.exponentialRampToValueAtTime(42, time + 0.11);
  gain.gain.setValueAtTime(0.22, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(time);
  osc.stop(time + 0.23);
}

function triggerZoukTiBwa(
  ctx: AudioContext,
  time: number,
  accent: boolean
) {
  // Rimshot / Ti-bwa boisé typique du Zouk + léger bruit de shaker
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(accent ? 1480 : 1120, time);
  osc.frequency.exponentialRampToValueAtTime(420, time + 0.035);

  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1350, time);
  filter.Q.setValueAtTime(3.5, time);

  gain.gain.setValueAtTime(accent ? 0.09 : 0.045, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start(time);
  osc.stop(time + 0.055);
}

function triggerZoukBass(ctx: AudioContext, time: number, midiNote: number) {
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(midiToFreq(midiNote), time);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(360, time);
  filter.frequency.exponentialRampToValueAtTime(140, time + 0.18);

  gain.gain.setValueAtTime(0.14, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.21);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start(time);
  osc.stop(time + 0.22);
}

function triggerMillionsZoukLead(
  ctx: AudioContext,
  time: number,
  midiNote: number,
  duration = 0.22,
  isBrass = false
) {
  // Double oscillateur légèrement désaccordé (effet Chorus Guitare/Cuivres Zouk 90s)
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  const baseFreq = midiToFreq(midiNote);
  osc1.type = isBrass ? 'sawtooth' : 'triangle';
  osc2.type = 'sine';
  osc1.frequency.setValueAtTime(baseFreq, time);
  osc2.frequency.setValueAtTime(baseFreq * 1.004, time);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(isBrass ? 1900 : 1400, time);
  filter.frequency.exponentialRampToValueAtTime(650, time + duration);

  gain.gain.setValueAtTime(0.001, time);
  gain.gain.linearRampToValueAtTime(isBrass ? 0.075 : 0.065, time + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(time);
  osc2.start(time);
  osc1.stop(time + duration + 0.01);
  osc2.stop(time + duration + 0.01);
}

function triggerZoukChordSkank(
  ctx: AudioContext,
  time: number,
  midiChord: number[]
) {
  // Accord guitare/clavier Zouk sur le contretemps
  midiChord.forEach((note) => {
    triggerMillionsZoukLead(ctx, time, note, 0.13, false);
  });
}

// Progression de 4 mesures (64 doubles-croches) sur les accords de Qui Veut Gagner Des Millions :
// Mesure 1 : Cm  (Do - Mib - Sol)
// Mesure 2 : Ab  (Lab - Do - Mib)
// Mesure 3 : Fm  (Fa - Lab - Do)
// Mesure 4 : G7  (Sol - Si - Ré - Fa) -> tension dramatique !
const BAR_BASS_ROOTS = [36, 44, 41, 43]; // C2, Ab2, F2, G2
const BAR_CHORDS = [
  [60, 63, 67], // Cm
  [60, 63, 68], // Ab
  [60, 65, 68], // Fm
  [59, 62, 67], // G majeur/7 (sensible Si bécarre typique du thème de QVGDM !)
];

// Mélodie reconnaissable de "Qui veut gagner des millions" syncopée à la sauce Zouk (sur 64 pas)
const MILLIONS_ZOUK_MELODY: (number | null)[] = [
  // Mesure 1 (Cm) : Do - Ré - Mib - Sol ... Do - Mib - Sol - Lab - Sol
  72, null, 74, 75, null, 79, null, 75, 72, null, 75, 79, null, 80, 79, null,
  // Mesure 2 (Ab) : Lab - Sol - Fa - Mib ... Do - Mib - Lab - Sol
  80, null, 79, 77, null, 75, null, 72, 75, null, 80, 79, null, 75, 72, null,
  // Mesure 3 (Fm) : Fa - Sol - Lab - Do ... Lab - Sol - Fa - Mib
  77, null, 79, 80, null, 84, null, 80, 79, null, 77, 75, null, 74, 72, null,
  // Mesure 4 (G7 suspense !) : Si - Do - Ré - Sol ... Fa - Mib - Ré - Si
  71, null, 72, 74, null, 79, null, 77, 75, null, 74, 71, 74, null, 79, null,
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

  // Tempo Zouk solaire : ~105 BPM -> 1 double-croche = 142ms
  const STEP_MS = 142;

  zoukInterval = setInterval(() => {
    const audio = getCtx();
    if (!audio) return;
    const now = audio.currentTime;

    const pos64 = zoukStepIndex % 64;
    const pos16 = pos64 % 16;
    const barIdx = Math.floor(pos64 / 16);

    // Modulation de tension façon "Qui veut gagner des millions" (+1 demi-ton après palier 5, +2 après palier 10)
    const transpose =
      zoukCurrentPallet > 10
        ? 2
        : zoukCurrentPallet > 5
        ? 1
        : 0;

    // 1. Kick Zouk sur tous les temps (0, 4, 8, 12) + rebond sur le 15
    if (pos16 % 4 === 0 || pos16 === 15) {
      triggerZoukKick(audio, now);
    }

    // 2. Pattern Ti-Bwa / Rimshot Caribéen (3-3-2 : steps 0, 3, 6, 8, 11, 14)
    const isTiBwaAccent =
      pos16 === 0 ||
      pos16 === 3 ||
      pos16 === 6 ||
      pos16 === 8 ||
      pos16 === 11 ||
      pos16 === 14;
    if (isTiBwaAccent || pos16 % 2 === 1) {
      triggerZoukTiBwa(audio, now, isTiBwaAccent);
    }

    // 3. Basse Zouk rebondissante sur les accords de Qui Veut Gagner Des Millions
    const rootNote = BAR_BASS_ROOTS[barIdx] + transpose;
    if (pos16 === 0 || pos16 === 8) {
      triggerZoukBass(audio, now, rootNote);
    } else if (pos16 === 3 || pos16 === 11) {
      triggerZoukBass(audio, now, rootNote + 7); // Quinte
    } else if (pos16 === 6 || pos16 === 14) {
      triggerZoukBass(audio, now, rootNote + 12); // Octave Zouk
    }

    // 4. Accords "Cocotte / Skank Zouk" sur les contretemps (steps 2, 6, 10, 14)
    if (pos16 === 2 || pos16 === 6 || pos16 === 10 || pos16 === 14) {
      const chord = BAR_CHORDS[barIdx].map((n) => n + transpose);
      triggerZoukChordSkank(audio, now, chord);
    }

    // 5. Thème mélodique de "Qui veut gagner des millions" en Synth-Cuivres Zouk
    const melodyNote = MILLIONS_ZOUK_MELODY[pos64];
    if (melodyNote !== null) {
      triggerMillionsZoukLead(audio, now, melodyNote + transpose, 0.24, true);
    }

    zoukStepIndex += 1;
  }, STEP_MS);
}

export function stopMillionsZoukMusic() {
  if (zoukInterval) {
    clearInterval(zoukInterval);
    zoukInterval = null;
  }
}



