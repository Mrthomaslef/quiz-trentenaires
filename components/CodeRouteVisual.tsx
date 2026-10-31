'use client';

import React from 'react';
import type { CodeRouteVisualConfig } from '@/lib/code-route-questions';

interface CodeRouteVisualProps {
  visual: CodeRouteVisualConfig;
  className?: string;
}

/**
 * Rendu vectoriel haute fidélité de scènes de conduite, d'intersections,
 * de panneaux officiels du Code de la route français et de tableaux de bord.
 * Garantit 100% d'images nettes, instantanées et hors-ligne.
 */
export default function CodeRouteVisual({
  visual,
  className = '',
}: CodeRouteVisualProps) {
  const { sceneType } = visual;

  // ---------------------------------------------------------------------------
  // 1. SCÈNES TABLEAU DE BORD & VOYANTS
  // ---------------------------------------------------------------------------
  if (
    sceneType === 'dash_voyant_huile_rouge' ||
    sceneType === 'dash_voyant_liquide_refroidissement' ||
    sceneType === 'dash_feux_brouillard_arriere_pluie' ||
    sceneType === 'dash_feux_route_eblouissement'
  ) {
    return (
      <svg
        viewBox="0 0 640 360"
        className={`w-full h-full select-none ${className}`}
        role="img"
        aria-label={visual.caption}
      >
        <defs>
          <linearGradient id="dashBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#060d1f" />
            <stop offset="60%" stopColor="#0a1428" />
            <stop offset="100%" stopColor="#020611" />
          </linearGradient>
          <radialGradient id="redGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="blueGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Fond habitacle / pare-brise de nuit */}
        <rect width="640" height="360" fill="url(#dashBg)" />

        {/* Vue pare-brise supérieure (si scène feux / pluie) */}
        {(sceneType === 'dash_feux_brouillard_arriere_pluie' ||
          sceneType === 'dash_feux_route_eblouissement') && (
          <g>
            {/* Route de nuit en haut */}
            <polygon
              points="240,30 400,30 560,155 80,155"
              fill="#111827"
              stroke="#334155"
              strokeWidth="1"
            />
            <line
              x1="320"
              y1="35"
              x2="320"
              y2="155"
              stroke="#e2e8f0"
              strokeWidth="3"
              strokeDasharray="12 10"
            />
            {/* Voiture en face si feux de route */}
            {sceneType === 'dash_feux_route_eblouissement' && (
              <g>
                <circle cx="290" cy="70" r="18" fill="#fef08a" opacity="0.35" />
                <circle cx="310" cy="70" r="18" fill="#fef08a" opacity="0.35" />
                <rect
                  x="284"
                  y="56"
                  width="32"
                  height="20"
                  rx="4"
                  fill="#334155"
                />
                <circle cx="290" cy="70" r="4" fill="#ffffff" />
                <circle cx="310" cy="70" r="4" fill="#ffffff" />
                {/* Faisceau éblouissant bleu/blanc */}
                <polygon
                  points="200,155 440,155 370,60 270,60"
                  fill="#60a5fa"
                  opacity="0.18"
                />
              </g>
            )}
            {/* Pluie si forte pluie */}
            {sceneType === 'dash_feux_brouillard_arriere_pluie' && (
              <g stroke="#7dd3fc" strokeWidth="1.5" opacity="0.55">
                <line x1="120" y1="20" x2="105" y2="55" />
                <line x1="190" y1="30" x2="175" y2="65" />
                <line x1="260" y1="15" x2="245" y2="50" />
                <line x1="350" y1="25" x2="335" y2="60" />
                <line x1="430" y1="18" x2="415" y2="53" />
                <line x1="510" y1="32" x2="495" y2="67" />
                <line x1="160" y1="80" x2="145" y2="115" />
                <line x1="290" y1="90" x2="275" y2="125" />
                <line x1="470" y1="85" x2="455" y2="120" />
              </g>
            )}
          </g>
        )}

        {/* Casquette du combiné d'instruments */}
        <path
          d="M 30 340 Q 90 130 320 130 Q 550 130 610 340 Z"
          fill="#0b1324"
          stroke="#1e293b"
          strokeWidth="4"
        />

        {/* Cadran Gauche : Compte-tours */}
        <circle
          cx="155"
          cy="245"
          r="78"
          fill="#050b16"
          stroke="#334155"
          strokeWidth="4"
        />
        <circle
          cx="155"
          cy="245"
          r="68"
          fill="none"
          stroke="#1e293b"
          strokeWidth="6"
          strokeDasharray="8 6"
        />
        <text
          x="155"
          y="212"
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="11"
          fontWeight="bold"
        >
          RPM x1000
        </text>
        <line
          x1="155"
          y1="245"
          x2="195"
          y2="198"
          stroke="#ef4444"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle cx="155" cy="245" r="7" fill="#cbd5e1" />

        {/* Cadran Droit : Tachymètre (Vitesse) */}
        <circle
          cx="485"
          cy="245"
          r="78"
          fill="#050b16"
          stroke="#334155"
          strokeWidth="4"
        />
        <circle
          cx="485"
          cy="245"
          r="68"
          fill="none"
          stroke="#1e293b"
          strokeWidth="6"
          strokeDasharray="8 6"
        />
        <text
          x="485"
          y="210"
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="11"
          fontWeight="bold"
        >
          km/h
        </text>
        <text
          x="485"
          y="278"
          textAnchor="middle"
          fill="#38bdf8"
          fontSize="22"
          fontWeight="900"
        >
          {visual.speedKmh ?? 80}
        </text>
        <line
          x1="485"
          y1="245"
          x2="528"
          y2="202"
          stroke="#ef4444"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle cx="485" cy="245" r="7" fill="#cbd5e1" />

        {/* Écran Central Ordinateur de Bord */}
        <rect
          x="248"
          y="162"
          width="144"
          height="158"
          rx="14"
          fill="#071022"
          stroke="#3b82f6"
          strokeOpacity="0.4"
          strokeWidth="2"
        />

        {/* Contenu spécifique du voyant central */}
        {sceneType === 'dash_voyant_huile_rouge' && (
          <g>
            <circle cx="320" cy="232" r="56" fill="url(#redGlow)" />
            {/* Dessin vectoriel officiel de la burette d'huile rouge */}
            <path
              d="M 282 236 L 302 222 L 336 222 L 342 230 L 362 220 L 366 225 L 344 242 L 282 242 Z"
              fill="none"
              stroke="#ef4444"
              strokeWidth="4.5"
              strokeLinejoin="round"
            />
            {/* Poignée et bouchon de la burette */}
            <path
              d="M 282 234 C 270 234 268 220 282 220 L 292 220"
              fill="none"
              stroke="#ef4444"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <line
              x1="312"
              y1="214"
              x2="326"
              y2="214"
              stroke="#ef4444"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <line
              x1="319"
              y1="214"
              x2="319"
              y2="222"
              stroke="#ef4444"
              strokeWidth="4"
            />
            {/* Goutte d'huile qui tombe */}
            <path
              d="M 366 232 C 362 240 362 246 366 248 C 370 246 370 240 366 232 Z"
              fill="#ef4444"
            />
            <rect
              x="262"
              y="278"
              width="116"
              height="24"
              rx="6"
              fill="#ef4444"
              fillOpacity="0.2"
              stroke="#ef4444"
            />
            <text
              x="320"
              y="294"
              textAnchor="middle"
              fill="#fca5a5"
              fontSize="11"
              fontWeight="900"
            >
              ALERTE ROUGE
            </text>
          </g>
        )}

        {sceneType === 'dash_voyant_liquide_refroidissement' && (
          <g>
            <circle cx="320" cy="230" r="56" fill="url(#redGlow)" />
            {/* Thermomètre rouge */}
            <line
              x1="320"
              y1="192"
              x2="320"
              y2="236"
              stroke="#ef4444"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <circle cx="320" cy="240" r="8" fill="#ef4444" />
            <line
              x1="320"
              y1="200"
              x2="332"
              y2="200"
              stroke="#ef4444"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <line
              x1="320"
              y1="211"
              x2="332"
              y2="211"
              stroke="#ef4444"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <line
              x1="320"
              y1="222"
              x2="332"
              y2="222"
              stroke="#ef4444"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Vagues de liquide */}
            <path
              d="M 284 252 Q 293 246 302 252 T 320 252 T 338 252 T 356 252"
              fill="none"
              stroke="#ef4444"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M 288 263 Q 297 257 306 263 T 324 263 T 342 263 T 352 263"
              fill="none"
              stroke="#ef4444"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <text
              x="320"
              y="296"
              textAnchor="middle"
              fill="#f87171"
              fontSize="12"
              fontWeight="900"
            >
              TEMP. 120°C MAX
            </text>
          </g>
        )}

        {sceneType === 'dash_feux_brouillard_arriere_pluie' && (
          <g>
            {/* Voyant Vert Feux de brouillard AVANT */}
            <g transform="translate(262, 185)">
              <rect
                x="0"
                y="0"
                width="52"
                height="48"
                rx="8"
                fill="#064e3b"
                stroke="#34d399"
                strokeWidth="2"
              />
              <path
                d="M 28 12 C 18 12 18 36 28 36 Z"
                fill="none"
                stroke="#34d399"
                strokeWidth="3"
              />
              <line x1="8" y1="18" x2="18" y2="22" stroke="#34d399" strokeWidth="2.5" />
              <line x1="8" y1="26" x2="18" y2="30" stroke="#34d399" strokeWidth="2.5" />
              <line x1="8" y1="34" x2="18" y2="38" stroke="#34d399" strokeWidth="2.5" />
              <path
                d="M 13 12 Q 16 24 13 38"
                fill="none"
                stroke="#34d399"
                strokeWidth="2"
              />
              <text
                x="26"
                y="62"
                textAnchor="middle"
                fill="#6ee7b7"
                fontSize="9"
                fontWeight="bold"
              >
                AVANT (Vert)
              </text>
            </g>

            {/* Voyant Orange Feux de brouillard ARRIÈRE */}
            <g transform="translate(326, 185)">
              <rect
                x="0"
                y="0"
                width="52"
                height="48"
                rx="8"
                fill="#78350f"
                stroke="#fbbf24"
                strokeWidth="2"
              />
              <path
                d="M 22 12 C 32 12 32 36 22 36 Z"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="3"
              />
              <line x1="34" y1="16" x2="45" y2="16" stroke="#fbbf24" strokeWidth="2.5" />
              <line x1="34" y1="24" x2="45" y2="24" stroke="#fbbf24" strokeWidth="2.5" />
              <line x1="34" y1="32" x2="45" y2="32" stroke="#fbbf24" strokeWidth="2.5" />
              <path
                d="M 39 11 Q 36 24 39 37"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="2"
              />
              <text
                x="26"
                y="62"
                textAnchor="middle"
                fill="#fcd34d"
                fontSize="9"
                fontWeight="bold"
              >
                ARRIÈRE (Orange)
              </text>
            </g>

            <text
              x="320"
              y="286"
              textAnchor="middle"
              fill="#bae6fd"
              fontSize="11"
              fontWeight="bold"
            >
              PLUIE FORTE DE NUIT
            </text>
          </g>
        )}

        {sceneType === 'dash_feux_route_eblouissement' && (
          <g>
            <circle cx="320" cy="228" r="52" fill="url(#blueGlow)" />
            {/* Voyant Bleu Feux de Route */}
            <path
              d="M 322 204 C 344 204 344 248 322 248 Z"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="4.5"
            />
            <line x1="292" y1="208" x2="314" y2="208" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
            <line x1="290" y1="217" x2="314" y2="217" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
            <line x1="290" y1="226" x2="314" y2="226" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
            <line x1="290" y1="235" x2="314" y2="235" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
            <line x1="292" y1="244" x2="314" y2="244" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
            <text
              x="320"
              y="290"
              textAnchor="middle"
              fill="#60a5fa"
              fontSize="11"
              fontWeight="900"
            >
              FEUX DE ROUTE (BLEU)
            </text>
          </g>
        )}
      </svg>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. SCHÉMAS SÉCURITÉ ROUTIÈRE (DISTANCE D'ARRÊT / ALCOOLÉMIE)
  // ---------------------------------------------------------------------------
  if (sceneType === 'conduite_distance_arret_100kmh') {
    return (
      <svg
        viewBox="0 0 640 360"
        className={`w-full h-full select-none ${className}`}
        role="img"
        aria-label={visual.caption}
      >
        <rect width="640" height="360" fill="#0c1938" />
        {/* Ciel & décor */}
        <rect width="640" height="150" fill="#1e3a8a" />
        {/* Route horizontale vue de profil */}
        <rect x="0" y="150" width="640" height="130" fill="#334155" />
        <line
          x1="0"
          y1="215"
          x2="640"
          y2="215"
          stroke="#f8fafc"
          strokeWidth="4"
          strokeDasharray="24 18"
        />

        {/* Zone 1 : Temps de réaction (1s) */}
        <rect
          x="110"
          y="158"
          width="160"
          height="48"
          rx="6"
          fill="#facc15"
          fillOpacity="0.28"
          stroke="#facc15"
          strokeWidth="2"
        />
        <text
          x="190"
          y="180"
          textAnchor="middle"
          fill="#fef08a"
          fontSize="13"
          fontWeight="900"
        >
          1. Temps de réaction (1 s)
        </text>
        <text
          x="190"
          y="198"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="12"
          fontWeight="bold"
        >
          9 × 3 = 27 m
        </text>

        {/* Zone 2 : Distance de freinage */}
        <rect
          x="275"
          y="158"
          width="265"
          height="48"
          rx="6"
          fill="#ef4444"
          fillOpacity="0.28"
          stroke="#f87171"
          strokeWidth="2"
        />
        <text
          x="407"
          y="180"
          textAnchor="middle"
          fill="#fca5a5"
          fontSize="13"
          fontWeight="900"
        >
          2. Distance de freinage
        </text>
        <text
          x="407"
          y="198"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="12"
          fontWeight="bold"
        >
          Chaussée sèche
        </text>

        {/* Voiture bleue à gauche lancée à 90 km/h */}
        <g transform="translate(30, 222)">
          <rect x="0" y="12" width="76" height="24" rx="6" fill="#38bdf8" />
          <path d="M 14 12 L 26 0 L 56 0 L 66 12 Z" fill="#0284c7" />
          <circle cx="18" cy="36" r="8" fill="#0f172a" stroke="#cbd5e1" strokeWidth="3" />
          <circle cx="58" cy="36" r="8" fill="#0f172a" stroke="#cbd5e1" strokeWidth="3" />
          <text
            x="38"
            y="-10"
            textAnchor="middle"
            fill="#facc15"
            fontSize="14"
            fontWeight="900"
          >
            90 km/h
          </text>
        </g>

        {/* Obstacle au bout à droite */}
        <g transform="translate(555, 212)">
          <polygon points="20,0 40,42 0,42" fill="#f97316" stroke="#ffffff" strokeWidth="2" />
          <line x1="9" y1="24" x2="31" y2="24" stroke="#ffffff" strokeWidth="4" />
        </g>

        {/* Accolade Distance totale d'arrêt */}
        <rect
          x="110"
          y="292"
          width="430"
          height="46"
          rx="10"
          fill="#091532"
          stroke="#facc15"
          strokeWidth="2.5"
        />
        <text
          x="325"
          y="320"
          textAnchor="middle"
          fill="#facc15"
          fontSize="17"
          fontWeight="900"
        >
          DISTANCE D’ARRÊT TOTALE À 90 KM/H = ? MÈTRES
        </text>
      </svg>
    );
  }

  if (sceneType === 'conduite_alcool_verre_equivalent') {
    return (
      <svg
        viewBox="0 0 640 360"
        className={`w-full h-full select-none ${className}`}
        role="img"
        aria-label={visual.caption}
      >
        <rect width="640" height="360" fill="#081430" />
        <text
          x="320"
          y="42"
          textAnchor="middle"
          fill="#facc15"
          fontSize="18"
          fontWeight="900"
        >
          DOSES STANDARD SERVIES EN BAR / CAFÉ
        </text>

        {/* Carte 1 : Demi de bière */}
        <g transform="translate(55, 65)">
          <rect
            x="0"
            y="0"
            width="155"
            height="215"
            rx="16"
            fill="#0f2350"
            stroke="#fbbf24"
            strokeWidth="2.5"
          />
          {/* Chope de bière */}
          <rect x="48" y="45" width="52" height="78" rx="6" fill="#f59e0b" stroke="#fef3c7" strokeWidth="3" />
          <path d="M 46 45 Q 74 30 102 45 Z" fill="#ffffff" />
          <path d="M 100 58 L 116 58 L 116 102 L 100 102" fill="none" stroke="#fef3c7" strokeWidth="4" />
          <text x="77" y="155" textAnchor="middle" fill="#ffffff" fontSize="15" fontWeight="900">
            Bière (5°)
          </text>
          <text x="77" y="178" textAnchor="middle" fill="#fde047" fontSize="14" fontWeight="bold">
            25 cl (1 demi)
          </text>
        </g>

        {/* Carte 2 : Ballon de vin */}
        <g transform="translate(242, 65)">
          <rect
            x="0"
            y="0"
            width="155"
            height="215"
            rx="16"
            fill="#0f2350"
            stroke="#f43f5e"
            strokeWidth="2.5"
          />
          {/* Verre à pied */}
          <path
            d="M 50 42 C 48 85 106 85 104 42 Z"
            fill="#be123c"
            stroke="#ffe4e6"
            strokeWidth="3"
          />
          <line x1="77" y1="78" x2="77" y2="122" stroke="#ffe4e6" strokeWidth="4" />
          <line x1="56" y1="122" x2="98" y2="122" stroke="#ffe4e6" strokeWidth="4" strokeLinecap="round" />
          <text x="77" y="155" textAnchor="middle" fill="#ffffff" fontSize="15" fontWeight="900">
            Vin (12°)
          </text>
          <text x="77" y="178" textAnchor="middle" fill="#fda4af" fontSize="14" fontWeight="bold">
            10 à 12 cl
          </text>
        </g>

        {/* Carte 3 : Whisky */}
        <g transform="translate(430, 65)">
          <rect
            x="0"
            y="0"
            width="155"
            height="215"
            rx="16"
            fill="#0f2350"
            stroke="#38bdf8"
            strokeWidth="2.5"
          />
          {/* Verre bas */}
          <polygon
            points="48,60 106,60 100,122 54,122"
            fill="none"
            stroke="#e0f2fe"
            strokeWidth="3"
          />
          <polygon points="52,92 102,92 99,120 55,120" fill="#d97706" />
          <text x="77" y="155" textAnchor="middle" fill="#ffffff" fontSize="15" fontWeight="900">
            Whisky (40°)
          </text>
          <text x="77" y="178" textAnchor="middle" fill="#7dd3fc" fontSize="14" fontWeight="bold">
            3 cl (dose bar)
          </text>
        </g>

        <rect
          x="95"
          y="296"
          width="450"
          height="42"
          rx="10"
          fill="#040b1e"
          stroke="#38bdf8"
          strokeWidth="1.5"
        />
        <text
          x="320"
          y="322"
          textAnchor="middle"
          fill="#e2e8f0"
          fontSize="14"
          fontWeight="bold"
        >
          Quel verre contient la plus grande quantité d’alcool pur ?
        </text>
      </svg>
    );
  }

  // ---------------------------------------------------------------------------
  // 3. SCÈNES ROUTIÈRES ET PANNEAUX OFFICIELS EN SITUATION
  // ---------------------------------------------------------------------------
  const isNightScene = sceneType === 'auto_tunnel_diodes_bleues';
  const isRainScene = sceneType === 'auto_pluie_vitesse_110';
  const isMotorway =
    sceneType.startsWith('auto_') && sceneType !== 'auto_voie_detresse_echappatoire';

  return (
    <svg
      viewBox="0 0 640 360"
      className={`w-full h-full select-none ${className}`}
      role="img"
      aria-label={visual.caption}
    >
      <defs>
        <linearGradient id="skyDay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isRainScene ? '#334155' : '#1d4ed8'} />
          <stop offset="100%" stopColor={isRainScene ? '#64748b' : '#7dd3fc'} />
        </linearGradient>
        <linearGradient id="asphalt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#15803d" />
          <stop offset="100%" stopColor="#14532d" />
        </linearGradient>
      </defs>

      {/* CIEL OU VOÛTE DE TUNNEL */}
      {isNightScene ? (
        <rect width="640" height="360" fill="#090d16" />
      ) : (
        <rect width="640" height="150" fill="url(#skyDay)" />
      )}

      {/* Nuages (hors tunnel) */}
      {!isNightScene && (
        <g fill="#ffffff" opacity={isRainScene ? 0.35 : 0.75}>
          <ellipse cx="120" cy="48" rx="45" ry="16" />
          <ellipse cx="145" cy="42" rx="35" ry="18" />
          <ellipse cx="500" cy="55" rx="50" ry="15" />
        </g>
      )}

      {/* Sol / Accotements herbeux ou urbains */}
      {!isNightScene && <rect x="0" y="148" width="640" height="212" fill="url(#grass)" />}

      {/* CHAUSSÉE PRINCIPALE EN PERSPECTIVE */}
      <polygon
        points="235,148 405,148 610,360 30,360"
        fill="url(#asphalt)"
        stroke="#475569"
        strokeWidth="2"
      />

      {/* BORDURES DE TROTTOIR OU LIGNES DE RIVE */}
      {sceneType === 'stat_trottoir_ligne_jaune_continue' ? (
        <>
          {/* Trottoir de droite */}
          <polygon points="405,148 445,148 640,360 580,360" fill="#64748b" />
          {/* Ligne JAUNE CONTINUE sur la bordure du trottoir */}
          <line
            x1="405"
            y1="148"
            x2="580"
            y2="360"
            stroke="#facc15"
            strokeWidth="10"
          />
        </>
      ) : sceneType === 'stat_trottoir_ligne_jaune_discontinue' ? (
        <>
          <polygon points="405,148 445,148 640,360 580,360" fill="#64748b" />
          {/* Ligne JAUNE DISCONTINUE sur la bordure du trottoir */}
          <line
            x1="405"
            y1="148"
            x2="580"
            y2="360"
            stroke="#facc15"
            strokeWidth="10"
            strokeDasharray="24 18"
          />
          {/* Passager qui attend sur le trottoir */}
          <circle cx="515" cy="225" r="9" fill="#fde047" />
          <rect x="507" y="235" width="16" height="28" rx="4" fill="#38bdf8" />
        </>
      ) : (
        <>
          <line x1="235" y1="148" x2="35" y2="360" stroke="#e2e8f0" strokeWidth="4" />
          <line
            x1="405"
            y1="148"
            x2="605"
            y2="360"
            stroke="#e2e8f0"
            strokeWidth="4"
            strokeDasharray={isMotorway ? '28 12' : undefined}
          />
        </>
      )}

      {/* MARQUAGE AXIAL CENTRAL SELON LA SCÈNE */}
      {sceneType === 'depass_ligne_mixte_pointilles_mon_cote' ? (
        <g>
          {/* Continue à gauche, Pointillés à droite (de notre côté) */}
          <line x1="316" y1="150" x2="308" y2="360" stroke="#ffffff" strokeWidth="5" />
          <line
            x1="325"
            y1="150"
            x2="326"
            y2="360"
            stroke="#facc15"
            strokeWidth="5"
            strokeDasharray="22 14"
          />
          {/* Voiture lente devant nous sur notre voie */}
          <g transform="translate(350, 215)">
            <rect x="0" y="10" width="54" height="32" rx="6" fill="#38bdf8" />
            <rect x="8" y="2" width="38" height="14" rx="4" fill="#0284c7" />
            <rect x="4" y="20" width="10" height="6" fill="#ef4444" />
            <rect x="40" y="20" width="10" height="6" fill="#ef4444" />
          </g>
        </g>
      ) : sceneType === 'depass_ligne_mixte_continue_mon_cote' ? (
        <g>
          {/* Pointillés à gauche, Continue à droite (de notre côté !) */}
          <line
            x1="314"
            y1="150"
            x2="306"
            y2="360"
            stroke="#ffffff"
            strokeWidth="5"
            strokeDasharray="22 14"
          />
          <line x1="324" y1="150" x2="324" y2="360" stroke="#facc15" strokeWidth="6" />
          {/* Voiture devant nous */}
          <g transform="translate(350, 215)">
            <rect x="0" y="10" width="54" height="32" rx="6" fill="#f97316" />
            <rect x="8" y="2" width="38" height="14" rx="4" fill="#c2410c" />
            <rect x="4" y="20" width="10" height="6" fill="#ef4444" />
            <rect x="40" y="20" width="10" height="6" fill="#ef4444" />
          </g>
        </g>
      ) : sceneType === 'depass_ligne_dissuasion_autoroute' ? (
        <g>
          {/* Tirets très rapprochés (Ligne de dissuasion) */}
          <line
            x1="320"
            y1="150"
            x2="320"
            y2="360"
            stroke="#ffffff"
            strokeWidth="5"
            strokeDasharray="18 6"
          />
          {/* Tracteur très lent devant */}
          <g transform="translate(348, 210)">
            <rect x="10" y="4" width="34" height="28" rx="4" fill="#16a34a" />
            <circle cx="8" cy="32" r="12" fill="#0f172a" stroke="#facc15" strokeWidth="4" />
            <circle cx="46" cy="32" r="12" fill="#0f172a" stroke="#facc15" strokeWidth="4" />
            <circle cx="27" cy="2" r="4" fill="#f59e0b" />
          </g>
        </g>
      ) : (
        <line
          x1="320"
          y1="150"
          x2="320"
          y2="360"
          stroke="#ffffff"
          strokeWidth="4"
          strokeDasharray="22 16"
        />
      )}

      {/* ------------------------------------------------------------------- */}
      {/* SCÈNES SPÉCIFIQUES D'INTERSECTIONS, DE CROISEMENT OU D'AUTOROUTE     */}
      {/* ------------------------------------------------------------------- */}

      {/* Route transversale pour les scènes d'intersections */}
      {sceneType.startsWith('inter_') && sceneType !== 'inter_rond_point_vs_giratoire' && (
        <g>
          <polygon points="0,205 640,205 640,268 0,268" fill="#293548" />
          <line
            x1="0"
            y1="236"
            x2="640"
            y2="236"
            stroke="#cbd5e1"
            strokeWidth="2"
            strokeDasharray="14 12"
          />
        </g>
      )}

      {/* Inter 1 : Priorité à droite classique avec voiture rouge à droite */}
      {sceneType === 'inter_priorite_droite_classique' && (
        <g>
          {/* Voiture rouge arrivant de la rue de droite */}
          <g transform="translate(455, 212)">
            <rect x="0" y="8" width="68" height="26" rx="6" fill="#ef4444" stroke="#fee2e2" strokeWidth="1.5" />
            <polygon points="14,8 26,0 52,0 60,8" fill="#b91c1c" />
            <circle cx="16" cy="34" r="8" fill="#0f172a" stroke="#e2e8f0" strokeWidth="3" />
            <circle cx="52" cy="34" r="8" fill="#0f172a" stroke="#e2e8f0" strokeWidth="3" />
            <circle cx="4" cy="20" r="4" fill="#fef08a" />
          </g>
          {/* Panneau AB1 (Priorité à droite) à droite */}
          <g transform="translate(495, 115)">
            <rect x="36" y="65" width="6" height="80" fill="#94a3b8" />
            <polygon
              points="39,0 78,68 0,68"
              fill="#ffffff"
              stroke="#ef4444"
              strokeWidth="8"
              strokeLinejoin="round"
            />
            <line x1="25" y1="34" x2="53" y2="60" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
            <line x1="53" y1="34" x2="25" y2="60" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
          </g>
        </g>
      )}

      {/* Inter 2 : Carrefour à sens giratoire */}
      {sceneType === 'inter_rond_point_vs_giratoire' && (
        <g>
          {/* Îlot central rond vert */}
          <ellipse
            cx="320"
            cy="210"
            rx="95"
            ry="34"
            fill="#15803d"
            stroke="#e2e8f0"
            strokeWidth="5"
          />
          {/* Ligne Cédez-le-passage à l'entrée */}
          <line
            x1="320"
            y1="278"
            x2="495"
            y2="278"
            stroke="#ffffff"
            strokeWidth="7"
            strokeDasharray="14 8"
          />
          {/* Voiture bleue déjà engagée sur l'anneau venant de gauche */}
          <g transform="translate(185, 222)">
            <rect x="0" y="8" width="66" height="26" rx="6" fill="#38bdf8" />
            <polygon points="12,8 22,0 48,0 56,8" fill="#0284c7" />
            <circle cx="15" cy="34" r="7" fill="#0f172a" stroke="#e2e8f0" strokeWidth="2.5" />
            <circle cx="51" cy="34" r="7" fill="#0f172a" stroke="#e2e8f0" strokeWidth="2.5" />
            {/* Clignotant actif */}
            <circle cx="62" cy="22" r="5" fill="#f59e0b" />
          </g>
          {/* Panneau AB25 Carrefour à sens giratoire */}
          <g transform="translate(495, 125)">
            <rect x="36" y="65" width="6" height="85" fill="#94a3b8" />
            <polygon
              points="39,0 78,68 0,68"
              fill="#ffffff"
              stroke="#ef4444"
              strokeWidth="8"
              strokeLinejoin="round"
            />
            <circle
              cx="39"
              cy="45"
              r="14"
              fill="none"
              stroke="#0f172a"
              strokeWidth="4.5"
              strokeDasharray="18 8"
            />
          </g>
        </g>
      )}

      {/* Inter 3 : Panneau STOP et ligne blanche continue */}
      {sceneType === 'inter_stop_ligne_continue' && (
        <g>
          {/* Ligne d'effet du STOP (blanche continue épaisse) */}
          <line x1="320" y1="275" x2="515" y2="275" stroke="#ffffff" strokeWidth="10" />
          {/* Panneau STOP octogonal AB4 */}
          <g transform="translate(490, 110)">
            <rect x="37" y="75" width="6" height="90" fill="#94a3b8" />
            <polygon
              points="24,0 56,0 80,24 80,56 56,80 24,80 0,56 0,24"
              fill="#dc2626"
              stroke="#ffffff"
              strokeWidth="4"
            />
            <text
              x="40"
              y="49"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="24"
              fontWeight="900"
            >
              STOP
            </text>
          </g>
        </g>
      )}

      {/* Inter 4 : Feu jaune clignotant + Panneau Cédez le passage dessous */}
      {sceneType === 'inter_feu_jaune_clignotant_panneau' && (
        <g>
          {/* Voiture arrivant de la gauche */}
          <g transform="translate(115, 215)">
            <rect x="0" y="8" width="66" height="24" rx="6" fill="#e2e8f0" />
            <circle cx="15" cy="32" r="7" fill="#0f172a" stroke="#94a3b8" strokeWidth="2.5" />
            <circle cx="51" cy="32" r="7" fill="#0f172a" stroke="#94a3b8" strokeWidth="2.5" />
          </g>
          {/* Feu tricolore + Panneau AB3a Cédez-le-passage */}
          <g transform="translate(495, 75)">
            <rect x="27" y="90" width="6" height="125" fill="#94a3b8" />
            <rect
              x="8"
              y="0"
              width="44"
              height="96"
              rx="10"
              fill="#0f172a"
              stroke="#e2e8f0"
              strokeWidth="2.5"
            />
            <circle cx="30" cy="20" r="10" fill="#3f1d1d" />
            {/* Feu JAUNE CLIGNOTANT actif */}
            <circle cx="30" cy="48" r="12" fill="#facc15" />
            <line x1="6" y1="48" x2="0" y2="48" stroke="#facc15" strokeWidth="3" />
            <line x1="54" y1="48" x2="60" y2="48" stroke="#facc15" strokeWidth="3" />
            <circle cx="30" cy="76" r="10" fill="#143326" />
            {/* Panneau Cédez le passage (triangle pointe en bas) fixé sous le feu */}
            <polygon
              points="0,106 60,106 30,158"
              fill="#ffffff"
              stroke="#ef4444"
              strokeWidth="7"
              strokeLinejoin="round"
            />
          </g>
        </g>
      )}

      {/* Inter 5 : Feu rouge + Flèche jaune clignotante à droite */}
      {sceneType === 'inter_feu_rouge_fleche_clignotante_droite' && (
        <g>
          {/* Passage piétons avec piéton engagé à droite */}
          <g fill="#ffffff">
            <rect x="520" y="212" width="10" height="45" />
            <rect x="540" y="212" width="10" height="45" />
            <rect x="560" y="212" width="10" height="45" />
          </g>
          <circle cx="545" cy="202" r="7" fill="#fde047" />
          <rect x="539" y="210" width="12" height="22" rx="3" fill="#ec4899" />

          {/* Feu tricolore au ROUGE + Flèche clignotante droite */}
          <g transform="translate(465, 82)">
            <rect x="27" y="95" width="6" height="120" fill="#94a3b8" />
            <rect
              x="8"
              y="0"
              width="44"
              height="96"
              rx="10"
              fill="#0f172a"
              stroke="#e2e8f0"
              strokeWidth="2.5"
            />
            <circle cx="30" cy="20" r="12" fill="#ef4444" />
            <circle cx="30" cy="48" r="10" fill="#423613" />
            <circle cx="30" cy="76" r="10" fill="#143326" />
            {/* Boîtier latéral flèche droite */}
            <rect
              x="54"
              y="60"
              width="34"
              height="34"
              rx="6"
              fill="#0f172a"
              stroke="#facc15"
              strokeWidth="2"
            />
            <path
              d="M 60 77 L 80 77 M 73 70 L 81 77 L 73 84"
              fill="none"
              stroke="#facc15"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </g>
      )}

      {/* Inter 6 : Feu vert, tourner à gauche avec voiture en face */}
      {sceneType === 'inter_feu_vert_tourner_gauche_en_face' && (
        <g>
          {/* Voiture arrivant en face tout droit */}
          <g transform="translate(268, 175)">
            <rect x="0" y="10" width="44" height="28" rx="6" fill="#f8fafc" />
            <rect x="6" y="2" width="32" height="12" rx="3" fill="#475569" />
            <circle cx="9" cy="24" r="4" fill="#fef08a" />
            <circle cx="35" cy="24" r="4" fill="#fef08a" />
          </g>
          {/* Flèche de notre trajectoire tourne-à-gauche */}
          <path
            d="M 365 330 Q 365 235 210 235"
            fill="none"
            stroke="#facc15"
            strokeWidth="5"
            strokeDasharray="10 6"
          />
          <polygon points="210,227 192,235 210,243" fill="#facc15" />

          {/* Feu VERT à droite */}
          <g transform="translate(495, 85)">
            <rect x="27" y="95" width="6" height="120" fill="#94a3b8" />
            <rect
              x="8"
              y="0"
              width="44"
              height="96"
              rx="10"
              fill="#0f172a"
              stroke="#e2e8f0"
              strokeWidth="2.5"
            />
            <circle cx="30" cy="20" r="10" fill="#3f1d1d" />
            <circle cx="30" cy="48" r="10" fill="#423613" />
            <circle cx="30" cy="76" r="12" fill="#22c55e" />
          </g>
        </g>
      )}

      {/* Inter 7 : Véhicule prioritaire SAMU avec gyrophare */}
      {sceneType === 'inter_vehicule_prioritaire_gyrophare' && (
        <g>
          {/* Ambulance SAMU arrivant de droite */}
          <g transform="translate(425, 200)">
            <rect
              x="0"
              y="6"
              width="86"
              height="38"
              rx="6"
              fill="#ffffff"
              stroke="#ef4444"
              strokeWidth="2.5"
            />
            <rect x="8" y="12" width="22" height="14" rx="2" fill="#38bdf8" />
            <text x="56" y="30" textAnchor="middle" fill="#dc2626" fontSize="13" fontWeight="900">
              SAMU
            </text>
            {/* Gyrophare bleu étincelant */}
            <circle cx="30" cy="0" r="14" fill="#3b82f6" opacity="0.45" />
            <rect x="25" y="0" width="10" height="6" rx="2" fill="#2563eb" />
            <circle cx="18" cy="44" r="8" fill="#0f172a" stroke="#cbd5e1" strokeWidth="3" />
            <circle cx="68" cy="44" r="8" fill="#0f172a" stroke="#cbd5e1" strokeWidth="3" />
          </g>
          {/* Notre feu vert */}
          <g transform="translate(525, 85)">
            <rect x="19" y="76" width="5" height="110" fill="#94a3b8" />
            <rect x="4" y="0" width="36" height="78" rx="8" fill="#0f172a" stroke="#e2e8f0" strokeWidth="2" />
            <circle cx="22" cy="60" r="10" fill="#22c55e" />
          </g>
        </g>
      )}

      {/* Inter 8 : Route prioritaire avec panonceau schéma M9c */}
      {sceneType === 'inter_route_prioritaire_panonceau_schema' && (
        <g transform="translate(475, 78)">
          <rect x="42" y="135" width="6" height="100" fill="#94a3b8" />
          {/* Losange jaune AB6 */}
          <polygon
            points="45,0 90,45 45,90 0,45"
            fill="#ffffff"
            stroke="#0f172a"
            strokeWidth="3"
          />
          <polygon points="45,12 78,45 45,78 12,45" fill="#facc15" />
          {/* Panonceau schéma M9c dessous */}
          <rect
            x="10"
            y="96"
            width="70"
            height="54"
            rx="4"
            fill="#ffffff"
            stroke="#0f172a"
            strokeWidth="2.5"
          />
          {/* Trait épais qui vient du bas et tourne à gauche */}
          <path
            d="M 45 144 L 45 122 L 18 122"
            fill="none"
            stroke="#0f172a"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Traits fins en haut et à droite */}
          <line x1="45" y1="122" x2="45" y2="102" stroke="#0f172a" strokeWidth="2.5" />
          <line x1="45" y1="122" x2="72" y2="122" stroke="#0f172a" strokeWidth="2.5" />
        </g>
      )}

      {/* Dépassement Cycliste 1m50 hors agglomération */}
      {sceneType === 'depass_cycliste_hors_agglo_1m50' && (
        <g>
          {/* Cycliste à droite */}
          <g transform="translate(435, 215)">
            <circle cx="14" cy="48" r="11" fill="none" stroke="#e2e8f0" strokeWidth="3" />
            <circle cx="46" cy="48" r="11" fill="none" stroke="#e2e8f0" strokeWidth="3" />
            <line x1="14" y1="48" x2="30" y2="30" stroke="#facc15" strokeWidth="3" />
            <line x1="30" y1="30" x2="46" y2="48" stroke="#facc15" strokeWidth="3" />
            <circle cx="28" cy="12" r="8" fill="#38bdf8" />
            <rect x="22" y="20" width="14" height="16" rx="4" fill="#ef4444" />
          </g>
          {/* Flèche de distance latérale */}
          <line
            x1="330"
            y1="255"
            x2="430"
            y2="255"
            stroke="#facc15"
            strokeWidth="4"
            strokeDasharray="6 4"
          />
          <rect x="338" y="226" width="84" height="24" rx="6" fill="#040b1e" stroke="#facc15" strokeWidth="2" />
          <text x="380" y="242" textAnchor="middle" fill="#facc15" fontSize="12" fontWeight="900">
            ? mètres min.
          </text>
        </g>
      )}

      {/* Croisement en forte pente montagne */}
      {sceneType === 'croisement_pente_montant_vs_descendant' && (
        <g>
          {/* Paroi rocheuse à gauche */}
          <polygon points="0,60 190,148 45,360 0,360" fill="#475569" />
          {/* Véhicule qui MONTE face à nous */}
          <g transform="translate(275, 200)">
            <rect x="0" y="12" width="58" height="32" rx="6" fill="#facc15" />
            <rect x="8" y="2" width="42" height="14" rx="4" fill="#ca8a04" />
            <circle cx="11" cy="28" r="5" fill="#ffffff" />
            <circle cx="47" cy="28" r="5" fill="#ffffff" />
            <text x="29" y="-6" textAnchor="middle" fill="#fef08a" fontSize="11" fontWeight="900">
              MONTE ↑
            </text>
          </g>
          {/* Panneau descente 10% à droite */}
          <g transform="translate(490, 115)">
            <rect x="36" y="65" width="6" height="80" fill="#94a3b8" />
            <polygon
              points="39,0 78,68 0,68"
              fill="#ffffff"
              stroke="#ef4444"
              strokeWidth="8"
              strokeLinejoin="round"
            />
            <polygon points="15,62 63,62 15,38" fill="#0f172a" />
            <text x="45" y="46" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="900">
              10 %
            </text>
          </g>
        </g>
      )}

      {/* Tramway à l'arrêt avec voyageurs */}
      {sceneType === 'depass_tramway_arret_voyageurs' && (
        <g>
          {/* Rails de tramway */}
          <line x1="295" y1="148" x2="220" y2="360" stroke="#94a3b8" strokeWidth="3" />
          <line x1="340" y1="148" x2="310" y2="360" stroke="#94a3b8" strokeWidth="3" />
          {/* Rame de tramway arrêtée */}
          <rect
            x="245"
            y="152"
            width="105"
            height="110"
            rx="12"
            fill="#0ea5e9"
            stroke="#e0f2fe"
            strokeWidth="3"
          />
          <rect x="258" y="168" width="78" height="34" rx="4" fill="#0f172a" />
          <text x="297" y="222" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="900">
            TRAMWAY
          </text>
          {/* Piétons qui traversent notre voie pour monter */}
          <circle cx="385" cy="235" r="8" fill="#fde047" />
          <rect x="378" y="244" width="14" height="26" rx="4" fill="#f43f5e" />
          <circle cx="418" cy="242" r="8" fill="#fde047" />
          <rect x="411" y="251" width="14" height="26" rx="4" fill="#a855f7" />
        </g>
      )}

      {/* Autoroute : Distances de sécurité 2 traits BAU */}
      {sceneType === 'auto_distances_securite_2_traits' && (
        <g>
          {/* Voiture devant nous */}
          <g transform="translate(345, 182)">
            <rect x="0" y="8" width="46" height="26" rx="5" fill="#e2e8f0" />
            <rect x="4" y="16" width="9" height="5" fill="#ef4444" />
            <rect x="33" y="16" width="9" height="5" fill="#ef4444" />
          </g>
          {/* Mise en évidence des 2 traits de la BAU à droite */}
          <line x1="432" y1="185" x2="472" y2="232" stroke="#facc15" strokeWidth="8" />
          <line x1="498" y1="262" x2="548" y2="320" stroke="#facc15" strokeWidth="8" />
          <rect x="425" y="140" width="150" height="30" rx="6" fill="#040b1e" stroke="#facc15" strokeWidth="2" />
          <text x="500" y="159" textAnchor="middle" fill="#facc15" fontSize="12" fontWeight="900">
            Traits BAU (39 m chacun)
          </text>
        </g>
      )}

      {/* Autoroute sous la pluie */}
      {sceneType === 'auto_pluie_vitesse_110' && (
        <g>
          <g stroke="#bae6fd" strokeWidth="2" opacity="0.65">
            <line x1="90" y1="30" x2="70" y2="95" />
            <line x1="180" y1="50" x2="160" y2="115" />
            <line x1="280" y1="25" x2="260" y2="90" />
            <line x1="390" y1="40" x2="370" y2="105" />
            <line x1="490" y1="30" x2="470" y2="95" />
            <line x1="560" y1="60" x2="540" y2="125" />
          </g>
          {/* Panneau bleu Autoroute C207 à droite */}
          <g transform="translate(495, 110)">
            <rect x="32" y="72" width="6" height="80" fill="#94a3b8" />
            <rect
              x="0"
              y="0"
              width="70"
              height="72"
              rx="6"
              fill="#1d4ed8"
              stroke="#ffffff"
              strokeWidth="3"
            />
            <line x1="24" y1="10" x2="18" y2="64" stroke="#ffffff" strokeWidth="5" />
            <line x1="46" y1="10" x2="52" y2="64" stroke="#ffffff" strokeWidth="5" />
            <line x1="8" y1="32" x2="62" y2="32" stroke="#ffffff" strokeWidth="4" />
          </g>
        </g>
      )}

      {/* Autoroute : Bande d'Arrêt d'Urgence (BAU) */}
      {sceneType === 'auto_bande_arret_urgence' && (
        <g>
          {/* Zone BAU colorée à droite */}
          <polygon
            points="405,148 455,148 640,360 605,360"
            fill="#f59e0b"
            fillOpacity="0.28"
          />
          <rect x="445" y="210" width="165" height="36" rx="8" fill="#040b1e" stroke="#facc15" strokeWidth="2" />
          <text x="527" y="233" textAnchor="middle" fill="#facc15" fontSize="13" fontWeight="900">
            BAU (Arrêt d’urgence)
          </text>
        </g>
      )}

      {/* Tunnel routier avec diodes bleues */}
      {sceneType === 'auto_tunnel_diodes_bleues' && (
        <g>
          {/* Arche du tunnel */}
          <path
            d="M 20 360 Q 40 30 320 30 Q 600 30 620 360"
            fill="none"
            stroke="#475569"
            strokeWidth="18"
          />
          {/* Diodes bleues d'espacement sur la paroi droite */}
          <circle cx="430" cy="175" r="10" fill="#3b82f6" opacity="0.45" />
          <circle cx="430" cy="175" r="5" fill="#60a5fa" />
          <circle cx="490" cy="230" r="13" fill="#3b82f6" opacity="0.45" />
          <circle cx="490" cy="230" r="6" fill="#60a5fa" />
          <circle cx="565" cy="300" r="16" fill="#3b82f6" opacity="0.45" />
          <circle cx="565" cy="300" r="7" fill="#60a5fa" />
          {/* Voiture devant */}
          <g transform="translate(335, 185)">
            <rect x="0" y="8" width="48" height="28" rx="6" fill="#94a3b8" />
            <rect x="4" y="18" width="10" height="6" fill="#ef4444" />
            <rect x="34" y="18" width="10" height="6" fill="#ef4444" />
          </g>
        </g>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* RENDU DES GRANDS PANNEAUX OFFICIELS AU PREMIER PLAN DROIT           */}
      {/* ------------------------------------------------------------------- */}

      {/* C18 : Priorité par rapport à la circulation venant en sens inverse */}
      {sceneType === 'sign_c18_priorite_sens_inverse' && (
        <g transform="translate(450, 72)">
          <rect x="46" y="100" width="8" height="135" fill="#94a3b8" />
          <rect
            x="0"
            y="0"
            width="100"
            height="100"
            rx="10"
            fill="#1d4ed8"
            stroke="#ffffff"
            strokeWidth="5"
          />
          {/* Flèche rouge descendante à gauche */}
          <line x1="32" y1="20" x2="32" y2="75" stroke="#ef4444" strokeWidth="9" />
          <polygon points="18,68 46,68 32,86" fill="#ef4444" />
          {/* Flèche blanche montante à droite */}
          <line x1="68" y1="82" x2="68" y2="27" stroke="#ffffff" strokeWidth="10" />
          <polygon points="52,34 84,34 68,14" fill="#ffffff" />
        </g>
      )}

      {/* B15 : Cédez le passage à la circulation venant en sens inverse */}
      {sceneType === 'sign_b15_cedez_passage_sens_inverse' && (
        <g transform="translate(445, 68)">
          <rect x="50" y="106" width="8" height="135" fill="#94a3b8" />
          <circle
            cx="54"
            cy="54"
            r="52"
            fill="#ffffff"
            stroke="#dc2626"
            strokeWidth="12"
          />
          {/* Flèche noire descendante à gauche */}
          <line x1="37" y1="26" x2="37" y2="74" stroke="#0f172a" strokeWidth="8" />
          <polygon points="25,68 49,68 37,84" fill="#0f172a" />
          {/* Flèche rouge montante à droite (notre sens soumis à restriction) */}
          <line x1="71" y1="82" x2="71" y2="34" stroke="#dc2626" strokeWidth="8" />
          <polygon points="59,40 83,40 71,24" fill="#dc2626" />
        </g>
      )}

      {/* B21-1 : Obligation de tourner à droite AVANT le panneau */}
      {sceneType === 'sign_b21_1_obligation_droite' && (
        <g transform="translate(445, 68)">
          <rect x="50" y="106" width="8" height="135" fill="#94a3b8" />
          <circle
            cx="54"
            cy="54"
            r="52"
            fill="#1d4ed8"
            stroke="#ffffff"
            strokeWidth="5"
          />
          <line x1="22" y1="54" x2="74" y2="54" stroke="#ffffff" strokeWidth="11" strokeLinecap="round" />
          <polygon points="66,34 90,54 66,74" fill="#ffffff" />
        </g>
      )}

      {/* Entrée d'agglomération + B14 (70 km/h) sur le même support */}
      {sceneType === 'sign_b14_vitesse_50_entree_agglo' && (
        <g transform="translate(425, 52)">
          <rect x="66" y="150" width="8" height="115" fill="#94a3b8" />
          {/* Panneau rond 70 en haut */}
          <circle
            cx="70"
            cy="44"
            r="42"
            fill="#ffffff"
            stroke="#dc2626"
            strokeWidth="10"
          />
          <text x="70" y="57" textAnchor="middle" fill="#0f172a" fontSize="36" fontWeight="900">
            70
          </text>
          {/* Panneau rectangulaire d'entrée d'agglomération dessous */}
          <rect
            x="0"
            y="96"
            width="140"
            height="52"
            rx="5"
            fill="#ffffff"
            stroke="#dc2626"
            strokeWidth="5"
          />
          <text x="70" y="128" textAnchor="middle" fill="#0f172a" fontSize="18" fontWeight="900">
            7TER-VILLE
          </text>
        </g>
      )}

      {/* Danger A1c + Panonceau d'étendue M2 (↑ 3 km ↑) */}
      {sceneType === 'sign_a14_danger_avec_panonceau_etendue' && (
        <g transform="translate(445, 55)">
          <rect x="48" y="140" width="8" height="120" fill="#94a3b8" />
          <polygon
            points="52,0 104,90 0,90"
            fill="#ffffff"
            stroke="#dc2626"
            strokeWidth="10"
            strokeLinejoin="round"
          />
          {/* Zigzag succession de virages */}
          <path
            d="M 52 76 L 42 58 L 62 46 L 48 28"
            fill="none"
            stroke="#0f172a"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Panonceau M2 avec flèches d'étendue */}
          <rect
            x="6"
            y="100"
            width="92"
            height="38"
            rx="4"
            fill="#ffffff"
            stroke="#0f172a"
            strokeWidth="2.5"
          />
          <text x="52" y="125" textAnchor="middle" fill="#0f172a" fontSize="18" fontWeight="900">
            ↑ 3 km ↑
          </text>
        </g>
      )}

      {/* A13b : Passage piétons danger hors agglomération */}
      {sceneType === 'sign_a13b_passage_pietons_danger' && (
        <g transform="translate(445, 68)">
          <rect x="48" y="92" width="8" height="145" fill="#94a3b8" />
          <polygon
            points="52,0 104,90 0,90"
            fill="#ffffff"
            stroke="#dc2626"
            strokeWidth="10"
            strokeLinejoin="round"
          />
          <circle cx="52" cy="40" r="6" fill="#0f172a" />
          <line x1="52" y1="46" x2="52" y2="64" stroke="#0f172a" strokeWidth="5" />
          <line x1="52" y1="64" x2="42" y2="78" stroke="#0f172a" strokeWidth="4" />
          <line x1="52" y1="64" x2="62" y2="78" stroke="#0f172a" strokeWidth="4" />
          <line x1="32" y1="82" x2="72" y2="82" stroke="#0f172a" strokeWidth="3" strokeDasharray="6 4" />
        </g>
      )}

      {/* AB7 : Fin de route prioritaire */}
      {sceneType === 'sign_ab6_fin_route_prioritaire' && (
        <g transform="translate(445, 68)">
          <rect x="50" y="106" width="8" height="135" fill="#94a3b8" />
          <polygon
            points="54,0 108,54 54,108 0,54"
            fill="#ffffff"
            stroke="#0f172a"
            strokeWidth="3"
          />
          <polygon points="54,14 94,54 54,94 14,54" fill="#facc15" stroke="#0f172a" strokeWidth="2" />
          {/* Barre noire diagonale de fin de priorité */}
          <line x1="22" y1="86" x2="86" y2="22" stroke="#0f172a" strokeWidth="12" />
        </g>
      )}

      {/* B1 : Sens interdit */}
      {sceneType === 'sign_b1_sens_interdit' && (
        <g transform="translate(445, 68)">
          <rect x="50" y="106" width="8" height="135" fill="#94a3b8" />
          <circle
            cx="54"
            cy="54"
            r="52"
            fill="#dc2626"
            stroke="#ffffff"
            strokeWidth="4"
          />
          <rect x="16" y="42" width="76" height="24" rx="2" fill="#ffffff" />
        </g>
      )}

      {/* B3 : Interdiction de dépasser */}
      {sceneType === 'sign_b3_interdiction_depasser' && (
        <g transform="translate(445, 68)">
          <rect x="50" y="106" width="8" height="135" fill="#94a3b8" />
          <circle
            cx="54"
            cy="54"
            r="52"
            fill="#ffffff"
            stroke="#dc2626"
            strokeWidth="11"
          />
          {/* Voiture rouge à gauche */}
          <rect x="20" y="50" width="28" height="16" rx="3" fill="#dc2626" />
          <polygon points="24,50 28,42 40,42 44,50" fill="#dc2626" />
          {/* Voiture noire à droite */}
          <rect x="56" y="50" width="28" height="16" rx="3" fill="#0f172a" />
          <polygon points="60,50 64,42 76,42 80,50" fill="#0f172a" />
        </g>
      )}

      {/* C12 vs B21b : Sens unique carré vs Obligation tout droit rond */}
      {sceneType === 'sign_c12_sens_unique' && (
        <g transform="translate(385, 72)">
          {/* Panneau C12 Carré à gauche */}
          <g transform="translate(0, 0)">
            <rect x="38" y="88" width="6" height="120" fill="#94a3b8" />
            <rect
              x="0"
              y="0"
              width="84"
              height="84"
              rx="8"
              fill="#1d4ed8"
              stroke="#ffffff"
              strokeWidth="4"
            />
            <line x1="42" y1="70" x2="42" y2="26" stroke="#ffffff" strokeWidth="12" />
            <polygon points="24,32 60,32 42,12" fill="#ffffff" />
            <text x="42" y="104" textAnchor="middle" fill="#fef08a" fontSize="12" fontWeight="900">
              C12 (Carré)
            </text>
          </g>
          {/* Panneau B21b Rond à droite */}
          <g transform="translate(115, 0)">
            <rect x="38" y="88" width="6" height="120" fill="#94a3b8" />
            <circle
              cx="42"
              cy="42"
              r="42"
              fill="#1d4ed8"
              stroke="#ffffff"
              strokeWidth="4"
            />
            <line x1="42" y1="70" x2="42" y2="26" stroke="#ffffff" strokeWidth="10" />
            <polygon points="26,32 58,32 42,14" fill="#ffffff" />
            <text x="42" y="104" textAnchor="middle" fill="#7dd3fc" fontSize="12" fontWeight="900">
              B21b (Rond)
            </text>
          </g>
        </g>
      )}

      {/* AK5 : Travaux temporaire (fond jaune) */}
      {sceneType === 'sign_ak5_travaux_temporaire' && (
        <g transform="translate(445, 68)">
          <rect x="48" y="92" width="8" height="145" fill="#94a3b8" />
          <polygon
            points="52,0 104,90 0,90"
            fill="#facc15"
            stroke="#dc2626"
            strokeWidth="10"
            strokeLinejoin="round"
          />
          {/* Ouvrier + tas de terre */}
          <circle cx="42" cy="38" r="6" fill="#0f172a" />
          <line x1="42" y1="44" x2="38" y2="66" stroke="#0f172a" strokeWidth="5" />
          <line x1="34" y1="54" x2="62" y2="68" stroke="#0f172a" strokeWidth="4" />
          <polygon points="56,78 82,78 69,62" fill="#0f172a" />
        </g>
      )}

      {/* J4 : Balise de virage à chevrons bleus et blancs */}
      {sceneType === 'sign_j4_balise_virage' && (
        <g transform="translate(405, 95)">
          <rect x="30" y="65" width="8" height="120" fill="#94a3b8" />
          <rect x="132" y="65" width="8" height="120" fill="#94a3b8" />
          <rect
            x="0"
            y="0"
            width="170"
            height="66"
            rx="6"
            fill="#1d4ed8"
            stroke="#ffffff"
            strokeWidth="4"
          />
          {/* 3 Chevrons blancs pointant vers la gauche */}
          <polyline
            points="55,10 25,33 55,56"
            fill="none"
            stroke="#ffffff"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points="100,10 70,33 100,56"
            fill="none"
            stroke="#ffffff"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points="145,10 115,33 145,56"
            fill="none"
            stroke="#ffffff"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}

      {/* A7 + Balise J10 (Passage à niveau avec barrières à 150 m = 3 bandes rouges) */}
      {sceneType === 'sign_a7_passage_niveau_barriere' && (
        <g transform="translate(445, 45)">
          <rect x="48" y="92" width="8" height="175" fill="#94a3b8" />
          <polygon
            points="52,0 104,90 0,90"
            fill="#ffffff"
            stroke="#dc2626"
            strokeWidth="10"
            strokeLinejoin="round"
          />
          {/* Barrière noire dans le triangle */}
          <line x1="24" y1="62" x2="80" y2="62" stroke="#0f172a" strokeWidth="5" />
          <line x1="24" y1="74" x2="80" y2="74" stroke="#0f172a" strokeWidth="5" />
          <line x1="34" y1="54" x2="34" y2="82" stroke="#0f172a" strokeWidth="5" />
          <line x1="52" y1="54" x2="52" y2="82" stroke="#0f172a" strokeWidth="5" />
          <line x1="70" y1="54" x2="70" y2="82" stroke="#0f172a" strokeWidth="5" />
          {/* Balise J10 blanche à 3 barres rouges dessous */}
          <rect
            x="34"
            y="102"
            width="36"
            height="92"
            fill="#ffffff"
            stroke="#0f172a"
            strokeWidth="2.5"
          />
          <line x1="36" y1="126" x2="68" y2="112" stroke="#dc2626" strokeWidth="7" />
          <line x1="36" y1="152" x2="68" y2="138" stroke="#dc2626" strokeWidth="7" />
          <line x1="36" y1="178" x2="68" y2="164" stroke="#dc2626" strokeWidth="7" />
        </g>
      )}

      {/* B2a : Interdiction de tourner à gauche */}
      {sceneType === 'sign_b2a_interdit_tourner_gauche' && (
        <g transform="translate(445, 68)">
          <rect x="50" y="106" width="8" height="135" fill="#94a3b8" />
          <circle
            cx="54"
            cy="54"
            r="52"
            fill="#ffffff"
            stroke="#dc2626"
            strokeWidth="11"
          />
          <path
            d="M 64 80 L 64 42 L 32 42"
            fill="none"
            stroke="#0f172a"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polygon points="36,28 18,42 36,56" fill="#0f172a" />
          <line x1="18" y1="18" x2="90" y2="90" stroke="#dc2626" strokeWidth="10" />
        </g>
      )}

      {/* B6a1 : Stationnement interdit (1 barre oblique) */}
      {sceneType === 'stat_b6a1_interdit_stationner' && (
        <g transform="translate(445, 68)">
          <rect x="50" y="106" width="8" height="135" fill="#94a3b8" />
          <circle
            cx="54"
            cy="54"
            r="52"
            fill="#1d4ed8"
            stroke="#dc2626"
            strokeWidth="12"
          />
          <line x1="18" y1="18" x2="90" y2="90" stroke="#dc2626" strokeWidth="12" />
        </g>
      )}

      {/* B6d : Arrêt ET stationnement interdits (Croix X rouge) */}
      {sceneType === 'stat_b6d_arret_et_stationnement_interdits' && (
        <g transform="translate(445, 68)">
          <rect x="50" y="106" width="8" height="135" fill="#94a3b8" />
          <circle
            cx="54"
            cy="54"
            r="52"
            fill="#1d4ed8"
            stroke="#dc2626"
            strokeWidth="12"
          />
          <line x1="18" y1="18" x2="90" y2="90" stroke="#dc2626" strokeWidth="12" />
          <line x1="90" y1="18" x2="18" y2="90" stroke="#dc2626" strokeWidth="12" />
        </g>
      )}

      {/* B6b3 : Stationnement alterné semi-mensuel 1-15 / 16-31 */}
      {sceneType === 'stat_semi_mensuel_1_15_16_31' && (
        <g transform="translate(445, 68)">
          <rect x="50" y="106" width="8" height="135" fill="#94a3b8" />
          <circle
            cx="54"
            cy="54"
            r="52"
            fill="#1d4ed8"
            stroke="#dc2626"
            strokeWidth="12"
          />
          <text x="30" y="45" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="900">
            1-15
          </text>
          <text x="76" y="75" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="900">
            16-31
          </text>
          <line x1="18" y1="18" x2="90" y2="90" stroke="#dc2626" strokeWidth="11" />
        </g>
      )}

      {/* B52 : Zone de rencontre 20 km/h */}
      {sceneType === 'circ_zone_rencontre_20kmh' && (
        <g transform="translate(440, 68)">
          <rect x="50" y="104" width="8" height="135" fill="#94a3b8" />
          <rect
            x="0"
            y="0"
            width="108"
            height="104"
            rx="10"
            fill="#1d4ed8"
            stroke="#ffffff"
            strokeWidth="5"
          />
          {/* Cercle 20 km/h en bas à droite du panneau */}
          <circle cx="76" cy="72" r="20" fill="#ffffff" stroke="#dc2626" strokeWidth="5" />
          <text x="76" y="78" textAnchor="middle" fill="#0f172a" fontSize="16" fontWeight="900">
            20
          </text>
          {/* Piéton + voiture stylisés */}
          <circle cx="30" cy="32" r="6" fill="#ffffff" />
          <line x1="30" y1="38" x2="30" y2="58" stroke="#ffffff" strokeWidth="5" />
          <rect x="46" y="24" width="38" height="16" rx="4" fill="#ffffff" />
        </g>
      )}

      {/* C13a : Impasse / Voie sans issue */}
      {sceneType === 'sign_c13a_impasse' && (
        <g transform="translate(445, 68)">
          <rect x="46" y="100" width="8" height="135" fill="#94a3b8" />
          <rect
            x="0"
            y="0"
            width="100"
            height="100"
            rx="10"
            fill="#1d4ed8"
            stroke="#ffffff"
            strokeWidth="5"
          />
          <rect x="41" y="34" width="18" height="52" fill="#ffffff" />
          <rect x="20" y="16" width="60" height="18" fill="#dc2626" stroke="#ffffff" strokeWidth="3" />
        </g>
      )}

      {/* C24c : Voie de détresse à droite */}
      {sceneType === 'auto_voie_detresse_echappatoire' && (
        <g transform="translate(440, 64)">
          <rect x="50" y="108" width="8" height="135" fill="#94a3b8" />
          <rect
            x="0"
            y="0"
            width="108"
            height="108"
            rx="8"
            fill="#1d4ed8"
            stroke="#ffffff"
            strokeWidth="5"
          />
          {/* Tronc blanc et branche vers damier rouge/blanc */}
          <line x1="34" y1="94" x2="34" y2="16" stroke="#ffffff" strokeWidth="12" />
          <path d="M 34 72 L 74 42 L 74 24" fill="none" stroke="#ffffff" strokeWidth="12" />
          {/* Damier rouge et blanc au bout de la voie de détresse */}
          <rect x="60" y="14" width="28" height="20" fill="#ffffff" />
          <rect x="60" y="14" width="14" height="10" fill="#dc2626" />
          <rect x="74" y="24" width="14" height="10" fill="#dc2626" />
        </g>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* COCKPIT VUE CONDUCTEUR (VOLANT, RÉTROVISEUR & COMPTEUR)             */}
      {/* ------------------------------------------------------------------- */}
      {/* Rétroviseur intérieur en haut au centre */}
      <g transform="translate(245, 6)">
        <rect x="68" y="0" width="14" height="10" fill="#0f172a" />
        <rect
          x="0"
          y="8"
          width="150"
          height="28"
          rx="12"
          fill="#1e293b"
          stroke="#475569"
          strokeWidth="2.5"
        />
        <text x="75" y="26" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="bold">
          RÉTROVISEUR INTÉRIEUR
        </text>
      </g>

      {/* Planche de bord & Compteur de vitesse en bas */}
      <path d="M 0 360 L 90 326 L 550 326 L 640 360 Z" fill="#091020" stroke="#1e293b" strokeWidth="2" />
      {typeof visual.speedKmh === 'number' && (
        <g transform="translate(265, 314)">
          <rect
            x="0"
            y="0"
            width="110"
            height="38"
            rx="10"
            fill="#040b1e"
            stroke="#38bdf8"
            strokeWidth="2"
          />
          <text x="55" y="24" textAnchor="middle" fill="#38bdf8" fontSize="16" fontWeight="900">
            {visual.speedKmh} km/h
          </text>
        </g>
      )}
    </svg>
  );
}
