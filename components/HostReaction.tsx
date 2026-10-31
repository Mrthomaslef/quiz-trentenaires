'use client';

import React, { useEffect } from 'react';

export type HostExpression =
  | 'neutral'
  | 'suspense'
  | 'happy'
  | 'sad'
  | 'ecstatic'
  | 'cheque';

// Sur GitHub Pages l'app est servie sous /quiz-trentenaires : un <img> brut
// ne reçoit pas le basePath de Next automatiquement.
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

const HOST_FRAMES: Record<HostExpression, string> = {
  neutral: `${BASE_PATH}/host/neutral.png`,
  suspense: `${BASE_PATH}/host/suspense.png`,
  happy: `${BASE_PATH}/host/happy.png`,
  sad: `${BASE_PATH}/host/sad.png`,
  ecstatic: `${BASE_PATH}/host/ecstatic.png`,
  cheque: `${BASE_PATH}/host/cheque.png`,
};

interface HostReactionProps {
  expression: HostExpression;
  line: string;
  /** Suspense en cours après « dernier mot » : zoom FMV progressif. */
  isSuspenseLock?: boolean;
  suspenseStage?: 0 | 1 | 2;
  /** 'sidebar' : colonne pyramide (paysage/desktop) · 'inline' : au-dessus de la question (portrait). */
  variant?: 'sidebar' | 'inline';
  className?: string;
}

/**
 * Tête de l'animateur façon cinématique FMV pixelisée (années 90) :
 * change d'expression avec un « pop » à chaque réaction du plateau.
 */
export default function HostReaction({
  expression,
  line,
  isSuspenseLock = false,
  suspenseStage = 0,
  variant = 'sidebar',
  className = '',
}: HostReactionProps) {
  const isInline = variant === 'inline';
  // Précharge toutes les expressions pour que le changement soit instantané
  useEffect(() => {
    Object.values(HOST_FRAMES).forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const suspenseZoom = isSuspenseLock
    ? suspenseStage === 0
      ? 1.08
      : suspenseStage === 1
      ? 1.18
      : 1.3
    : 1;

  const moodAnim =
    expression === 'ecstatic'
      ? 'animate-host-jump'
      : expression === 'sad'
      ? 'animate-host-sad'
      : isSuspenseLock && suspenseStage === 2
      ? 'animate-host-tremble'
      : 'animate-host-idle';

  const frameTone =
    expression === 'happy' || expression === 'ecstatic'
      ? 'border-emerald-300 shadow-[0_0_18px_rgba(52,211,153,0.55)]'
      : expression === 'sad'
      ? 'border-rose-400 shadow-[0_0_18px_rgba(244,63,94,0.5)]'
      : expression === 'suspense'
      ? 'border-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.5)]'
      : 'border-yellow-400/70 shadow-[0_0_12px_rgba(250,204,21,0.25)]';

  return (
    <div
      className={`shrink-0 flex items-center gap-2 lg:gap-2.5 ${
        isInline ? '' : 'border-b border-blue-500/30 pb-1.5 lg:pb-2 mb-1.5'
      } ${className}`}
    >
      {/* Écran CRT de l'animateur */}
      <div
        className={`relative shrink-0 ${
          isInline
            ? 'h-20 w-20 xs:h-24 xs:w-24'
            : 'h-20 w-20 ls:h-16 ls:w-16 sm:h-24 sm:w-24 lg:h-32 lg:w-32'
        } overflow-hidden rounded-lg border-2 bg-[#0a1a5c] transition-[border-color,box-shadow] duration-300 ${frameTone}`}
      >
        <div
          key={expression}
          className="absolute inset-0 animate-host-pop"
        >
          <div
            className="absolute inset-0"
            style={{
              transform: `scale(${suspenseZoom})`,
              transformOrigin: '50% 42%',
              transition: 'transform 700ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <div className={`absolute inset-0 ${moodAnim}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={HOST_FRAMES[expression]}
                alt="L'animateur réagit"
                draggable={false}
                className="h-full w-full select-none object-cover [image-rendering:pixelated]"
              />
            </div>
          </div>
        </div>

        {/* Overlays FMV : scanlines, vignette, scintillement */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 host-crt-scanlines" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 host-crt-vignette" />
        <div
          key={`flash-${expression}`}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 animate-host-flash"
        />
        <span className="pointer-events-none absolute left-1 top-0.5 flex items-center gap-0.5 font-mono text-[8px] lg:text-[9px] font-black uppercase tracking-wider text-rose-400/90">
          <span className="h-1 w-1 rounded-full bg-rose-500 animate-pulse" />
          Live
        </span>
      </div>

      {/* Bulle de réplique */}
      <div
        key={line}
        className="relative min-w-0 flex-1 rounded-lg border border-yellow-400/40 bg-[#040b1e]/90 px-2 py-1 lg:px-2.5 lg:py-1.5 animate-host-bubble"
      >
        <span
          aria-hidden="true"
          className="absolute -left-[5px] top-1/2 -translate-y-1/2 h-2 w-2 rotate-45 border-b border-l border-yellow-400/40 bg-[#040b1e]"
        />
        <p
          className={`${
            isInline ? 'text-xs xs:text-sm' : 'text-[10px] ls:text-[9px] lg:text-xs'
          } font-black italic leading-tight text-yellow-200`}
        >
          {line}
        </p>
      </div>
    </div>
  );
}
