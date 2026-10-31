export type CodeRouteTheme =
  | 'Panneaux & Signalisation'
  | 'Priorités & Intersections'
  | 'Croisement & Dépassement'
  | 'Stationnement & Circulation'
  | 'Autoroute & Voies Rapides'
  | 'Voyants, Feux & Conduite';

export type CodeRouteDifficulty = 'Facile' | 'Moyen' | 'Piège Examen';

export interface CodeRouteVisualConfig {
  /** Identifiant de la scène visuelle vectorielle haute précision */
  sceneType:
    // --- PANNEAUX & SIGNALISATION ---
    | 'sign_b1_sens_interdit'
    | 'sign_b2a_interdit_tourner_gauche'
    | 'sign_b14_vitesse_50_entree_agglo'
    | 'sign_b21_1_obligation_droite'
    | 'sign_b22a_piste_cyclable_obligatoire'
    | 'sign_c18_priorite_sens_inverse'
    | 'sign_b15_cedez_passage_sens_inverse'
    | 'sign_ab1_priorite_droite'
    | 'sign_ab2_route_prioritaire'
    | 'sign_ab6_fin_route_prioritaire'
    | 'sign_a13b_passage_pietons_danger'
    | 'sign_ak5_travaux_temporaire'
    | 'sign_b3_interdiction_depasser'
    | 'sign_b34_fin_interdiction_depasser'
    | 'sign_c12_sens_unique'
    | 'sign_b21b_tout_droit_obligatoire'
    | 'sign_c13a_impasse'
    | 'sign_j4_balise_virage'
    | 'sign_a7_passage_niveau_barriere'
    | 'sign_a14_danger_avec_panonceau_etendue'
    // --- PRIORITÉS & INTERSECTIONS ---
    | 'inter_priorite_droite_classique'
    | 'inter_rond_point_vs_giratoire'
    | 'inter_stop_ligne_continue'
    | 'inter_feu_jaune_clignotant_panneau'
    | 'inter_feu_rouge_fleche_clignotante_droite'
    | 'inter_feu_vert_tourner_gauche_en_face'
    | 'inter_vehicule_prioritaire_gyrophare'
    | 'inter_route_prioritaire_panonceau_schema'
    // --- CROISEMENT & DÉPASSEMENT ---
    | 'depass_ligne_mixte_pointilles_mon_cote'
    | 'depass_ligne_mixte_continue_mon_cote'
    | 'depass_cycliste_hors_agglo_1m50'
    | 'croisement_pente_montant_vs_descendant'
    | 'depass_ligne_dissuasion_autoroute'
    | 'depass_tramway_arret_voyageurs'
    // --- STATIONNEMENT & CIRCULATION ---
    | 'stat_b6a1_interdit_stationner'
    | 'stat_b6d_arret_et_stationnement_interdits'
    | 'stat_semi_mensuel_1_15_16_31'
    | 'stat_trottoir_ligne_jaune_continue'
    | 'stat_trottoir_ligne_jaune_discontinue'
    | 'circ_zone_rencontre_20kmh'
    // --- AUTOROUTE & VOIES RAPIDES ---
    | 'auto_distances_securite_2_traits'
    | 'auto_pluie_vitesse_110'
    | 'auto_bande_arret_urgence'
    | 'auto_voie_detresse_echappatoire'
    | 'auto_tunnel_diodes_bleues'
    // --- VOYANTS, FEUX & CONDUITE ---
    | 'dash_voyant_huile_rouge'
    | 'dash_voyant_liquide_refroidissement'
    | 'dash_feux_brouillard_arriere_pluie'
    | 'dash_feux_route_eblouissement'
    | 'conduite_distance_arret_100kmh'
    | 'conduite_alcool_verre_equivalent';
  /** Légende affichée dans le bandeau photo (style boîtier d'examen ETG) */
  caption: string;
  /** Vitesse affichée au compteur dans le cockpit (optionnel) */
  speedKmh?: number;
  /** Indication météo / contexte sur la photo */
  contextBadge?: string;
}

export interface CodeRouteQuestion {
  id: string;
  codeRef: string; // ex: "ETG-01"
  theme: CodeRouteTheme;
  difficulty: CodeRouteDifficulty;
  question: string;
  /** Optionnel : sous-question si question double type Code de la route */
  subQuestion?: string;
  options: [string, string, string, string];
  correct_index: number;
  explanation: string;
  penaltyInfo?: string;
  visual: CodeRouteVisualConfig;
}

export const CODE_ROUTE_THEMES_META: {
  id: 'ALL' | CodeRouteTheme;
  label: string;
  shortLabel: string;
  emoji: string;
}[] = [
  { id: 'ALL', label: 'Toutes les séries', shortLabel: 'Tout (50)', emoji: '🚗' },
  {
    id: 'Panneaux & Signalisation',
    label: 'Panneaux & Signalisation',
    shortLabel: 'Panneaux',
    emoji: '🛑',
  },
  {
    id: 'Priorités & Intersections',
    label: 'Priorités & Intersections',
    shortLabel: 'Priorités',
    emoji: '🚦',
  },
  {
    id: 'Croisement & Dépassement',
    label: 'Croisement & Dépassement',
    shortLabel: 'Dépassement',
    emoji: '🛣️',
  },
  {
    id: 'Stationnement & Circulation',
    label: 'Stationnement & Circulation',
    shortLabel: 'Stationnement',
    emoji: '🅿️',
  },
  {
    id: 'Autoroute & Voies Rapides',
    label: 'Autoroute & Voies Rapides',
    shortLabel: 'Autoroute',
    emoji: '🚧',
  },
  {
    id: 'Voyants, Feux & Conduite',
    label: 'Voyants, Feux & Conduite',
    shortLabel: 'Voyants & Feux',
    emoji: '⚠️',
  },
];

export const CODE_ROUTE_QUESTIONS: CodeRouteQuestion[] = [
  // ============================================================================
  // 1. PANNEAUX & SIGNALISATION (18 questions 100% illustrées)
  // ============================================================================
  {
    id: 'cr-pan-01',
    codeRef: 'ETG-001',
    theme: 'Panneaux & Signalisation',
    difficulty: 'Piège Examen',
    question:
      'Face à ce panneau carré bleu avec flèche blanche et flèche rouge, lors d’un passage étroit :',
    options: [
      'J’ai la priorité par rapport aux véhicules venant en sens inverse',
      'Je dois céder le passage aux véhicules venant en sens inverse',
      'Cette rue est à sens unique sur 200 mètres',
      'Il est interdit de faire demi-tour jusqu’à la prochaine intersection',
    ],
    correct_index: 0,
    explanation:
      'Le panneau C18 (carré bleu = indication) indique que vous avez la priorité de passage par rapport aux véhicules arrivant en sens inverse dans le passage étroit. À l’inverse, le panneau rond rouge B15 impose de céder le passage.',
    penaltyInfo: 'Confusion classique entre le carré bleu C18 (priorité) et le rond rouge B15 (céder le passage).',
    visual: {
      sceneType: 'sign_c18_priorite_sens_inverse',
      caption: 'Approche d’un pont étroit — Signalisation de position C18',
      speedKmh: 45,
      contextBadge: 'Chaussée rétrécie',
    },
  },
  {
    id: 'cr-pan-02',
    codeRef: 'ETG-002',
    theme: 'Panneaux & Signalisation',
    difficulty: 'Facile',
    question:
      'Que signifie ce panneau rond à fond blanc entouré de rouge avec une flèche noire et une flèche rouge ?',
    options: [
      'Je dois céder le passage aux véhicules venant en sens inverse',
      'J’ai la priorité sur les véhicules venant en face',
      'Circulation interdite dans les deux sens',
      'Obligation de serrer à gauche',
    ],
    correct_index: 0,
    explanation:
      'C’est le panneau B15 « Cédez le passage à la circulation venant en sens inverse ». Sa forme ronde bordée de rouge exprime une interdiction/restriction : si un véhicule s’engage en face, vous devez vous arrêter.',
    visual: {
      sceneType: 'sign_b15_cedez_passage_sens_inverse',
      caption: 'Rétrécissement de chaussée — Panneau B15',
      speedKmh: 40,
      contextBadge: 'Hors agglomération',
    },
  },
  {
    id: 'cr-pan-03',
    codeRef: 'ETG-003',
    theme: 'Panneaux & Signalisation',
    difficulty: 'Piège Examen',
    question:
      'Quelle est la différence exacte entre ce panneau rond bleu avec flèche à droite (B21-1) et le panneau avec flèche coudée (B21a1) ?',
    options: [
      'Celui-ci oblige à tourner à droite AVANT le panneau (au pied du panneau)',
      'Celui-ci oblige à tourner à droite à la prochaine intersection à 150 m',
      'Celui-ci indique une voie conseillée pour les poids lourds',
      'Celui-ci interdit uniquement de tourner à gauche',
    ],
    correct_index: 0,
    explanation:
      'Piège incontournable du Code ! La flèche droite horizontale (B21-1) oblige à tourner à droite AVANT d’avoir dépassé le panneau. La flèche coudée vers le haut puis la droite (B21a1) oblige à tourner à la prochaine intersection.',
    visual: {
      sceneType: 'sign_b21_1_obligation_droite',
      caption: 'Signalisation d’obligation B21-1 en carrefour urbain',
      speedKmh: 30,
      contextBadge: 'Agglomération',
    },
  },
  {
    id: 'cr-pan-04',
    codeRef: 'ETG-004',
    theme: 'Panneaux & Signalisation',
    difficulty: 'Piège Examen',
    question:
      'En rencontrant ces deux panneaux superposés (entrée d’agglomération + limitation 70), quelle est ma vitesse maximale autorisée ?',
    options: [
      '70 km/h dans toute l’agglomération ou jusqu’à une autre limitation',
      '50 km/h, car le panneau d’entrée de ville annule toujours le 70',
      '70 km/h uniquement sur 100 mètres après le panneau',
      '80 km/h car nous sommes sur une route principale',
    ],
    correct_index: 0,
    explanation:
      'Lorsqu’un panneau de limitation de vitesse (ici 70 km/h) est placé sur le même support que le panneau d’entrée d’agglomération, cette vitesse déroge au 50 km/h général sur l’axe traversé (ou dans toute l’agglomération).',
    visual: {
      sceneType: 'sign_b14_vitesse_50_entree_agglo',
      caption: 'Entrée d’agglomération avec panneau B14 sur le même support',
      speedKmh: 65,
      contextBadge: 'Entrée de ville',
    },
  },
  {
    id: 'cr-pan-05',
    codeRef: 'ETG-005',
    theme: 'Panneaux & Signalisation',
    difficulty: 'Moyen',
    question:
      'Ce panneau triangulaire avec un panonceau comportant deux flèches verticales encadrant « 3 km » signifie :',
    options: [
      'La zone de virages dangereux s’étend sur une longueur de 3 km',
      'Le premier virage dangereux commence dans 3 km exactement',
      'Il y a 3 virages dangereux successifs',
      'La vitesse est limitée à 30 km/h pendant 3 km',
    ],
    correct_index: 0,
    explanation:
      'Les deux flèches encadrant la distance forment un panonceau d’étendue (M2) : le danger débute à distance normale (150 m hors agglomération) et s’étend sur une longueur totale de 3 km. Sans flèches, c’est un panonceau de distance (M1).',
    visual: {
      sceneType: 'sign_a14_danger_avec_panonceau_etendue',
      caption: 'Panneau de danger A1c avec panonceau d’étendue M2',
      speedKmh: 75,
      contextBadge: 'Route de montagne',
    },
  },
  {
    id: 'cr-pan-06',
    codeRef: 'ETG-006',
    theme: 'Panneaux & Signalisation',
    difficulty: 'Moyen',
    question:
      'Hors agglomération, à quelle distance du danger est implanté par défaut ce panneau triangulaire de passage pour piétons ?',
    options: [
      'À environ 150 mètres avant le passage piétons',
      'À environ 50 mètres avant le passage piétons',
      'Au niveau exact du passage piétons (signalisation de position)',
      'À environ 500 mètres avant le passage piétons',
    ],
    correct_index: 0,
    explanation:
      'Règle d’or des panneaux triangulaires de danger (type A) : ils sont placés à environ 150 mètres du danger hors agglomération, et à environ 50 mètres en agglomération (sauf panonceau de distance contraire).',
    visual: {
      sceneType: 'sign_a13b_passage_pietons_danger',
      caption: 'Signalisation avancée A13b hors agglomération',
      speedKmh: 80,
      contextBadge: 'Hors agglomération',
    },
  },
  {
    id: 'cr-pan-07',
    codeRef: 'ETG-007',
    theme: 'Panneaux & Signalisation',
    difficulty: 'Facile',
    question:
      'Que m’indique ce panneau losange jaune bordé de blanc barré d’un trait noir diagonal ?',
    options: [
      'Fin de route à caractère prioritaire',
      'Route prioritaire à la prochaine intersection uniquement',
      'Interdiction de stationner sur la chaussée',
      'Fin de toutes les interdictions précédemment signalées',
    ],
    correct_index: 0,
    explanation:
      'Le panneau AB7 (losange jaune barré de noir) annonce la fin d’une route à caractère prioritaire : aux prochaines intersections, il faudra observer la signalisation en place ou appliquer la priorité à droite.',
    visual: {
      sceneType: 'sign_ab6_fin_route_prioritaire',
      caption: 'Signalisation de priorité AB7 en sortie d’axe principal',
      speedKmh: 70,
      contextBadge: 'Route départementale',
    },
  },
  {
    id: 'cr-pan-08',
    codeRef: 'ETG-008',
    theme: 'Panneaux & Signalisation',
    difficulty: 'Moyen',
    question:
      'Face à ce panneau rond rouge à barre horizontale blanche (Sens interdit B1) :',
    options: [
      'L’accès m’est interdit, mais des véhicules peuvent sortir de cette rue face à moi',
      'La circulation est interdite dans les deux sens de circulation',
      'Seuls les riverains sont autorisés à s’y engager',
      'Aucun véhicule ne peut circuler dans cette rue',
    ],
    correct_index: 0,
    explanation:
      'Le panneau B1 « Sens interdit » interdit d’entrer dans la voie par ce côté, mais la voie est ouverte en sens inverse : des véhicules peuvent donc en déboucher face à vous !',
    penaltyInfo: 'Franchissement d’un sens interdit : amende de 4e classe (135 €) et retrait de 4 points.',
    visual: {
      sceneType: 'sign_b1_sens_interdit',
      caption: 'Entrée de rue avec panneau B1',
      speedKmh: 25,
      contextBadge: 'Centre-ville',
    },
  },
  {
    id: 'cr-pan-09',
    codeRef: 'ETG-009',
    theme: 'Panneaux & Signalisation',
    difficulty: 'Piège Examen',
    question:
      'En présence de ce panneau d’interdiction de dépasser (voiture rouge à gauche, noire à droite), que puis-je quand même dépasser ?',
    options: [
      'Un deux-roues à moteur sans side-car ou un cycliste (en respectant les distances)',
      'Aucun véhicule, même pas un vélo',
      'Un tracteur agricole roulant à moins de 30 km/h',
      'Une voiture sans permis',
    ],
    correct_index: 0,
    explanation:
      'Le panneau B3 interdit de dépasser tous les véhicules à moteur AUTRES que ceux à deux roues sans side-car. Vous pouvez donc dépasser un vélo, un cyclomoteur ou une moto sans side-car si la ligne au sol le permet.',
    penaltyInfo: 'Dépassement interdit : amende de 4e classe (135 €) et retrait de 3 points.',
    visual: {
      sceneType: 'sign_b3_interdiction_depasser',
      caption: 'Panneau B3 sur route bidirectionnelle',
      speedKmh: 80,
      contextBadge: 'Route nationale',
    },
  },
  {
    id: 'cr-pan-10',
    codeRef: 'ETG-010',
    theme: 'Panneaux & Signalisation',
    difficulty: 'Moyen',
    question:
      'Quelle est la différence entre ce panneau carré bleu avec flèche blanche verticale (C12) et le panneau rond bleu avec flèche blanche verticale (B21b) ?',
    options: [
      'Le carré C12 indique une rue à sens unique (je peux tourner), le rond B21b oblige à aller tout droit',
      'Le carré C12 oblige à aller tout droit, le rond B21b indique un sens unique',
      'Ils ont exactement la même signification réglementaire',
      'Le carré C12 concerne uniquement les autoroutes',
    ],
    correct_index: 0,
    explanation:
      'Moyen mnémotechnique infaillible : Carré = Indication (la chaussée est à sens unique, mais vous pouvez tourner à gauche ou à droite aux intersections). Rond = Obligation (vous devez aller tout droit à la prochaine intersection).',
    visual: {
      sceneType: 'sign_c12_sens_unique',
      caption: 'Comparaison visuelle : Carré d’indication C12 vs Rond d’obligation B21b',
      speedKmh: 35,
      contextBadge: 'Signalisation urbaine',
    },
  },
  {
    id: 'cr-pan-11',
    codeRef: 'ETG-011',
    theme: 'Panneaux & Signalisation',
    difficulty: 'Facile',
    question:
      'Ce panneau triangulaire à fond jaune orangé avec un ouvrier annonce :',
    options: [
      'Un danger temporaire lié à une zone de travaux sur la chaussée',
      'Une aire de repos permanente avec personnel d’entretien',
      'Un chemin piétonnier réservé aux randonneurs',
      'L’obligation de descendre du véhicule',
    ],
    correct_index: 0,
    explanation:
      'Le fond jaune des panneaux triangulaires (série AK, ici AK5) caractérise toujours une signalisation TEMPORAIRE (travaux, obstacle passager, chaussée glissante temporaire). Vous devez ralentir fortement.',
    visual: {
      sceneType: 'sign_ak5_travaux_temporaire',
      caption: 'Signalisation temporaire de chantier AK5',
      speedKmh: 50,
      contextBadge: 'Zone de chantier',
    },
  },
  {
    id: 'cr-pan-12',
    codeRef: 'ETG-012',
    theme: 'Panneaux & Signalisation',
    difficulty: 'Piège Examen',
    question:
      'Que signifie cette balise blanche et bleue à chevrons (J4) implantée à l’extérieur de la courbe ?',
    options: [
      'Elle signale un virage très serré ou dangereux et indique le sens de la courbe',
      'Elle indique une obligation de tourner pour les poids lourds uniquement',
      'Elle annonce une déviation temporaire de chantier',
      'Elle signale la présence d’un passage à niveau à 150 mètres',
    ],
    correct_index: 0,
    explanation:
      'La balise J4 à chevrons blancs sur fond bleu renforce la perception d’un virage dangereux ou d’un rétrécissement brutal de chaussée. La pointe des chevrons indique le sens du virage.',
    visual: {
      sceneType: 'sign_j4_balise_virage',
      caption: 'Balise de virage J4 en approche de courbe serrée',
      speedKmh: 60,
      contextBadge: 'Virage dangereux',
    },
  },
  {
    id: 'cr-pan-13',
    codeRef: 'ETG-013',
    theme: 'Panneaux & Signalisation',
    difficulty: 'Moyen',
    question:
      'Face à ce panneau triangulaire représentant une barrière avec 3 bandes rouges obliques sur la balise (J10) :',
    options: [
      'J’approche d’un passage à niveau muni de barrières situé à environ 150 mètres',
      'J’approche d’un passage à niveau sans barrière ni demi-barrière à 50 mètres',
      'J’approche d’un pont mobile situé à 300 mètres',
      'La route est définitivement barrée à 150 mètres',
    ],
    correct_index: 0,
    explanation:
      'Le panneau A7 annonce un passage à niveau muni de barrières à fonctionnement manuel ou de demi-barrières automatiques. Chaque bande rouge oblique de la balise J10 représente 50 mètres : 3 bandes = 150 mètres.',
    visual: {
      sceneType: 'sign_a7_passage_niveau_barriere',
      caption: 'Panneau A7 et balise d’approche J10 à 3 bandes rouges',
      speedKmh: 70,
      contextBadge: 'Voie ferrée à 150 m',
    },
  },
  {
    id: 'cr-pan-14',
    codeRef: 'ETG-014',
    theme: 'Panneaux & Signalisation',
    difficulty: 'Moyen',
    question:
      'En voyant ce panneau d’interdiction de tourner à gauche (B2a) avant le carrefour :',
    options: [
      'Il m’est interdit de tourner à gauche ET interdit de faire demi-tour à cette intersection',
      'Il m’est interdit de tourner à gauche, mais le demi-tour reste autorisé',
      'L’interdiction ne concerne que les véhicules de plus de 3,5 tonnes',
      'Je dois obligatoirement tourner à droite',
    ],
    correct_index: 0,
    explanation:
      'Règle importante : le panneau B2a (interdiction de tourner à gauche à la prochaine intersection) interdit également d’effectuer un demi-tour dans cette même intersection ! En revanche, vous pouvez aller tout droit ou à droite.',
    visual: {
      sceneType: 'sign_b2a_interdit_tourner_gauche',
      caption: 'Approche d’intersection avec panneau B2a',
      speedKmh: 45,
      contextBadge: 'Intersection à 50 m',
    },
  },

  // ============================================================================
  // 2. PRIORITÉS & INTERSECTIONS (10 questions 100% illustrées)
  // ============================================================================
  {
    id: 'cr-prio-01',
    codeRef: 'ETG-015',
    theme: 'Priorités & Intersections',
    difficulty: 'Facile',
    question:
      'À cette intersection sans marquage au sol mais précédée d’un panneau triangulaire avec une croix noire (AB1), une voiture rouge arrive par ma droite :',
    options: [
      'Je ralentis et je cède le passage à la voiture rouge venant de droite',
      'Je passe en premier car je circule sur l’axe le plus large',
      'Je klaxonne et je maintiens mon allure',
      'La voiture rouge doit me céder le passage car elle tourne',
    ],
    correct_index: 0,
    explanation:
      'Le panneau AB1 annonce une intersection où s’applique la règle générale de la priorité à droite (la largeur de la route ne donne jamais la priorité !). Vous devez céder le passage au véhicule arrivant à votre droite.',
    penaltyInfo: 'Refus de priorité à droite : amende de 4e classe (135 €) et retrait de 4 points.',
    visual: {
      sceneType: 'inter_priorite_droite_classique',
      caption: 'Intersection avec panneau AB1 — Véhicule arrivant de droite',
      speedKmh: 40,
      contextBadge: 'Priorité à droite',
    },
  },
  {
    id: 'cr-prio-02',
    codeRef: 'ETG-016',
    theme: 'Priorités & Intersections',
    difficulty: 'Piège Examen',
    question:
      'En abordant ce carrefour à sens giratoire (annoncé par le panneau AB25 et une ligne pointillée au sol), qui a la priorité ?',
    options: [
      'Les véhicules déjà engagés sur l’anneau ont la priorité : je leur cède le passage',
      'J’ai la priorité en entrant car je viens de leur droite',
      'Les véhicules qui sortent doivent céder le passage à ceux qui entrent',
      'Le premier arrivé klaxonne et passe',
    ],
    correct_index: 0,
    explanation:
      'Dans un carrefour à sens giratoire (signalé par le triangle AB25 avec 3 flèches en cercle et un Cédez-le-passage à l’entrée), les conducteurs qui abordent l’anneau doivent céder le passage à ceux qui y circulent déjà (venant de gauche). Sur un « rond-point » ancien sans panneau AB25, c’est la priorité à droite qui s’applique.',
    visual: {
      sceneType: 'inter_rond_point_vs_giratoire',
      caption: 'Entrée de carrefour à sens giratoire — Véhicule bleu sur l’anneau',
      speedKmh: 25,
      contextBadge: 'Sens giratoire',
    },
  },
  {
    id: 'cr-prio-03',
    codeRef: 'ETG-017',
    theme: 'Priorités & Intersections',
    difficulty: 'Moyen',
    question:
      'À ce panneau STOP (AB4), aucun véhicule n’est visible à gauche ni à droite. Que dois-je faire exactement ?',
    options: [
      'Marquer un arrêt complet à la limite de la ligne blanche continue avant de repartir',
      'Ralentir en 1re à 5 km/h et passer sans m’arrêter puisque la voie est libre',
      'M’arrêter exactement au pied du panneau STOP, même s’il est à 10 m de la ligne',
      'Klaxonner et passer sans marquer l’arrêt',
    ],
    correct_index: 0,
    explanation:
      'Au STOP, l’arrêt complet des roues (0 km/h) est obligatoire à la limite de la ligne blanche continue (ou à la limite de la chaussée abordée s’il n’y a pas de ligne), même si aucun usager n’est en vue !',
    penaltyInfo: 'Non-respect de l’arrêt au STOP : amende de 4e classe (135 €) et retrait de 4 points.',
    visual: {
      sceneType: 'inter_stop_ligne_continue',
      caption: 'Intersection munie d’un panneau STOP AB4 et d’une ligne d’effet',
      speedKmh: 15,
      contextBadge: 'Arrêt obligatoire',
    },
  },
  {
    id: 'cr-prio-04',
    codeRef: 'ETG-018',
    theme: 'Priorités & Intersections',
    difficulty: 'Piège Examen',
    question:
      'Le feu tricolore clignote à l’orange (en panne/hors service) et un panneau « Cédez le passage » est fixé sous le feu. Une voiture arrive de ma gauche :',
    options: [
      'Je cède le passage à la voiture venant de gauche en obéissant au panneau sous le feu',
      'Je passe en premier car le feu orange clignotant donne toujours la priorité à droite',
      'Je m’arrête obligatoirement comme à un feu rouge',
      'Je passe en accélérant avant la voiture de gauche',
    ],
    correct_index: 0,
    explanation:
      'Quand un feu est jaune clignotant (ou éteint), on applique le panneau de priorité fixé sur le support du feu ! Ici, le panneau « Cédez le passage » (AB3a) s’applique : vous devez céder le passage à gauche ET à droite. Ce n’est qu’en l’absence de panneau qu’on applique la priorité à droite.',
    visual: {
      sceneType: 'inter_feu_jaune_clignotant_panneau',
      caption: 'Feu jaune clignotant avec panneau AB3a sous le feu',
      speedKmh: 30,
      contextBadge: 'Feu clignotant',
    },
  },
  {
    id: 'cr-prio-05',
    codeRef: 'ETG-019',
    theme: 'Priorités & Intersections',
    difficulty: 'Piège Examen',
    question:
      'Le feu principal est ROUGE fixe, mais une flèche jaune clignotante pointe vers la droite. Je veux tourner à droite :',
    options: [
      'Je peux tourner à droite sans m’arrêter si la voie est libre, en cédant le passage aux piétons et à tous les véhicules',
      'J’ai la priorité absolue pour tourner à droite',
      'Je dois attendre que le feu principal passe au vert',
      'Cette flèche concerne uniquement les cyclistes',
    ],
    correct_index: 0,
    explanation:
      'La flèche jaune clignotante associée au feu rouge vous autorise à vous engager uniquement dans la direction indiquée par la flèche, MAIS sans aucune priorité : vous devez céder le passage aux piétons qui traversent et aux véhicules circulant sur la voie rejointe.',
    visual: {
      sceneType: 'inter_feu_rouge_fleche_clignotante_droite',
      caption: 'Feu rouge fixe accompagné d’une flèche jaune clignotante à droite',
      speedKmh: 20,
      contextBadge: 'Carrefour à feux',
    },
  },
  {
    id: 'cr-prio-06',
    codeRef: 'ETG-020',
    theme: 'Priorités & Intersections',
    difficulty: 'Moyen',
    question:
      'Mon feu est VERT et je souhaite tourner à gauche. La voiture en face a aussi le feu vert et va tout droit :',
    options: [
      'Je m’avance dans le carrefour et je cède le passage à la voiture d’en face avant de tourner',
      'Je tourne immédiatement devant elle car mon clignotant est activé',
      'Je reste arrêté derrière la ligne de feu en attendant le prochain cycle',
      'La voiture d’en face doit s’arrêter pour me laisser tourner',
    ],
    correct_index: 0,
    explanation:
      'En tournant à gauche au feu vert, vous allez couper la trajectoire du véhicule venant en face (qui se trouvera alors à votre droite au moment de virer). Vous devez donc vous avancer jusqu’au centre sans gêner et lui céder le passage.',
    visual: {
      sceneType: 'inter_feu_vert_tourner_gauche_en_face',
      caption: 'Feu vert — Manœuvre de tourne-à-gauche avec véhicule en face',
      speedKmh: 20,
      contextBadge: 'Priorité en face',
    },
  },
  {
    id: 'cr-prio-07',
    codeRef: 'ETG-021',
    theme: 'Priorités & Intersections',
    difficulty: 'Facile',
    question:
      'Mon feu est vert, mais une ambulance du SAMU arrive de ma droite avec sa sirène deux-tons et ses gyrophares bleus allumés :',
    options: [
      'Je ralentis, je m’arrête et je lui cède immédiatement le passage malgré mon feu vert',
      'Je passe car mon feu est vert et j’ai la priorité légale',
      'Je m’arrête au milieu du carrefour pour bloquer les autres voies',
      'L’ambulance doit attendre que son feu passe au vert',
    ],
    correct_index: 0,
    explanation:
      'Les véhicules d’intérêt général prioritaires (Police, Gendarmerie, Pompiers, SAMU/SMUR) en mission utilisant leurs avertisseurs sonores et lumineux bleus sont prioritaires en toutes circonstances, même face à un feu vert !',
    visual: {
      sceneType: 'inter_vehicule_prioritaire_gyrophare',
      caption: 'Véhicule d’urgence en intervention arrivant à l’intersection',
      speedKmh: 35,
      contextBadge: 'Urgence prioritaire',
    },
  },
  {
    id: 'cr-prio-08',
    codeRef: 'ETG-022',
    theme: 'Priorités & Intersections',
    difficulty: 'Piège Examen',
    question:
      'Sous le panneau de route prioritaire (AB6), ce panonceau schéma montre un trait épais qui tourne à gauche. Je veux continuer tout droit :',
    options: [
      'Je quitte l’axe prioritaire : je dois céder le passage aux véhicules venant de la droite',
      'Je dois céder le passage à gauche ET à droite car je quitte le trait épais',
      'Je reste prioritaire sur tout le monde puisque j’ai le panneau losange jaune',
      'Il est interdit d’aller tout droit',
    ],
    correct_index: 0,
    explanation:
      'Le trait gras du panonceau schéma (M9c) représente le tracé de la route prioritaire. Vous êtes sur le trait gras en arrivant : vous êtes donc prioritaire sur ceux qui sont sur les traits fins, même si vous continuez tout droit ! Seule exception si un autre véhicule venait d’une branche également prioritaire à votre droite.',
    visual: {
      sceneType: 'inter_route_prioritaire_panonceau_schema',
      caption: 'Panneau AB6 complété par un panonceau schéma M9c',
      speedKmh: 45,
      contextBadge: 'Tracé prioritaire',
    },
  },

  // ============================================================================
  // 3. CROISEMENT & DÉPASSEMENT (8 questions 100% illustrées)
  // ============================================================================
  {
    id: 'cr-dep-01',
    codeRef: 'ETG-023',
    theme: 'Croisement & Dépassement',
    difficulty: 'Facile',
    question:
      'Sur cette route avec une ligne mixte au sol (ligne discontinue de mon côté, ligne continue à gauche), puis-je dépasser ce véhicule lent si la visibilité est bonne ?',
    options: [
      'Oui, car les pointillés sont situés immédiatement de mon côté de la chaussée',
      'Non, une ligne mixte interdit le dépassement dans les deux sens',
      'Oui, mais uniquement s’il s’agit d’un tracteur ou d’un vélo',
      'Non, je dois attendre une ligne 100% discontinue sans ligne continue à côté',
    ],
    correct_index: 0,
    explanation:
      'Dans le cas d’une ligne mixte, le conducteur ne doit tenir compte que de la ligne située immédiatement de son côté : pointillés de votre côté = franchissement autorisé pour dépasser (et pour se rabattre ensuite !).',
    visual: {
      sceneType: 'depass_ligne_mixte_pointilles_mon_cote',
      caption: 'Ligne mixte avec tirets discontinus du côté de votre voie',
      speedKmh: 75,
      contextBadge: 'Dépassement',
    },
  },
  {
    id: 'cr-dep-02',
    codeRef: 'ETG-024',
    theme: 'Croisement & Dépassement',
    difficulty: 'Moyen',
    question:
      'Ici, la ligne continue de la ligne mixte est située de mon côté. Devant moi roule un véhicule à 60 km/h :',
    options: [
      'Je ne peux pas le dépasser : il est formellement interdit de franchir ou chevaucher la ligne continue',
      'Je peux dépasser car il y a des pointillés juste à côté de la ligne continue',
      'Je peux chevaucher la ligne avec deux roues seulement',
      'Je peux dépasser si personne n’arrive en face sur 500 m',
    ],
    correct_index: 0,
    explanation:
      'Lorsque la ligne continue est de votre côté, son franchissement et son chevauchement sont strictement interdits pour dépasser une voiture (seule exception : le dépassement d’un cycliste si la visibilité est excellente).',
    penaltyInfo: 'Franchissement de ligne continue : 135 € d’amende et retrait de 3 points (chevauchement : 1 point).',
    visual: {
      sceneType: 'depass_ligne_mixte_continue_mon_cote',
      caption: 'Ligne mixte avec ligne continue du côté de votre voie',
      speedKmh: 60,
      contextBadge: 'Ligne continue',
    },
  },
  {
    id: 'cr-dep-03',
    codeRef: 'ETG-025',
    theme: 'Croisement & Dépassement',
    difficulty: 'Moyen',
    question:
      'Hors agglomération, quel intervalle latéral de sécurité minimum dois-je laisser en dépassant ce cycliste ?',
    options: [
      'Au moins 1,50 mètre hors agglomération (et 1 mètre en agglomération)',
      'Au moins 1 mètre hors agglomération (et 0,50 mètre en ville)',
      'Au moins 2 mètres partout',
      'Il est interdit de dépasser un cycliste hors agglomération',
    ],
    correct_index: 0,
    explanation:
      'Pour protéger les usagers vulnérables (piétons, cyclistes, trottinettes, cavaliers), la distance latérale minimale lors d’un dépassement est de 1 mètre en agglomération et de 1,50 mètre hors agglomération.',
    penaltyInfo: 'Dépassement trop proche d’un cycliste : 135 € d’amende et retrait de 3 points.',
    visual: {
      sceneType: 'depass_cycliste_hors_agglo_1m50',
      caption: 'Dépassement d’un cycliste sur route départementale hors agglomération',
      speedKmh: 70,
      contextBadge: 'Hors agglomération',
    },
  },
  {
    id: 'cr-dep-04',
    codeRef: 'ETG-026',
    theme: 'Croisement & Dépassement',
    difficulty: 'Piège Examen',
    question:
      'Sur cette route de montagne étroite à forte pente, je descends et je croise une voiture qui monte. Le croisement est difficile : qui doit s’arrêter en premier ?',
    options: [
      'C’est à moi (véhicule descendant) de m’arrêter pour laisser passer le véhicule montant',
      'C’est au véhicule montant de s’arrêter car il roule moins vite',
      'Le véhicule le plus léger a toujours la priorité',
      'C’est toujours celui qui est à droite du ravin qui passe',
    ],
    correct_index: 0,
    explanation:
      'Sur une route à forte pente où le croisement est difficile, c’est le véhicule DESCENDANT qui doit s’arrêter à temps le premier, car un démarrage en côte est plus difficile pour le véhicule montant ! (Et si une marche arrière est indispensable à véhicules de même catégorie, c’est celui qui descend qui recule).',
    visual: {
      sceneType: 'croisement_pente_montant_vs_descendant',
      caption: 'Croisement difficile sur route de montagne à 10% de pente',
      speedKmh: 30,
      contextBadge: 'Forte descente 10%',
    },
  },
  {
    id: 'cr-dep-05',
    codeRef: 'ETG-027',
    theme: 'Croisement & Dépassement',
    difficulty: 'Piège Examen',
    question:
      'Dans cette rue où circule un tramway, le tramway est arrêté à sa station et des piétons montent/descendent du côté de ma voie :',
    options: [
      'Je m’arrête obligatoirement derrière le tramway et j’attends que les portes se ferment et que la chaussée soit libre',
      'Je dépasse le tramway par la droite à 10 km/h en klaxonnant',
      'Je dépasse le tramway par la gauche sur la voie inverse',
      'Les piétons doivent attendre sur le trottoir que je sois passé',
    ],
    correct_index: 0,
    explanation:
      'Le dépassement d’un tramway à l’arrêt pendant la montée ou la descente des voyageurs est formellement interdit du côté où s’effectue cette montée/descente. Vous devez vous arrêter et laisser la priorité absolue aux voyageurs.',
    visual: {
      sceneType: 'depass_tramway_arret_voyageurs',
      caption: 'Tramway à l’arrêt en station — Voyageurs sur la chaussée',
      speedKmh: 15,
      contextBadge: 'Station Tramway',
    },
  },
  {
    id: 'cr-dep-06',
    codeRef: 'ETG-028',
    theme: 'Croisement & Dépassement',
    difficulty: 'Piège Examen',
    question:
      'Sur cette route à double sens, cette ligne blanche aux tirets très rapprochés (ligne de dissuasion) au centre :',
    options: [
      'Interdit de dépasser les voitures, mais autorise le dépassement des véhicules très lents (tracteurs, vélos)',
      'Autorise le dépassement de tous les véhicules à condition de rouler à moins de 80 km/h',
      'Indique une voie réservée aux bus',
      'Oblige à quitter la route à la prochaine sortie',
    ],
    correct_index: 0,
    explanation:
      'Sur route étroite ou sinueuse, la ligne de dissuasion (tirets 3m espacés de 1,33m) interdit les dépassements normaux mais permet de dépasser un véhicule très lent. Sur autoroute (devant une sortie), elle interdit en revanche de se rabattre tardivement de la voie de gauche vers la sortie !',
    visual: {
      sceneType: 'depass_ligne_dissuasion_autoroute',
      caption: 'Marquage axial à tirets serrés (ligne de dissuasion)',
      speedKmh: 70,
      contextBadge: 'Ligne de dissuasion',
    },
  },

  // ============================================================================
  // 4. STATIONNEMENT & CIRCULATION (7 questions 100% illustrées)
  // ============================================================================
  {
    id: 'cr-stat-01',
    codeRef: 'ETG-029',
    theme: 'Stationnement & Circulation',
    difficulty: 'Moyen',
    question:
      'Après ce panneau rond bleu et rouge barré d’UN SEul trait oblique (B6a1), qu’ai-je le droit de faire du côté du panneau ?',
    options: [
      'Le stationnement est interdit, mais l’arrêt momentané (pour déposer un passager) reste autorisé',
      'L’arrêt ET le stationnement sont strictement interdits',
      'Je peux stationner pendant 15 minutes maximum avec un disque bleu',
      'L’interdiction s’applique avant le panneau et se termine au panneau',
    ],
    correct_index: 0,
    explanation:
      '1 barre oblique rouge (B6a1) = Stationnement interdit, mais l’ARRÊT bref (montée/descente d’un passager ou chargement rapide en restant au volant ou à proximité immédiate) est autorisé, du panneau jusqu’à la prochaine intersection.',
    visual: {
      sceneType: 'stat_b6a1_interdit_stationner',
      caption: 'Panneau B6a1 en bordure de trottoir',
      speedKmh: 20,
      contextBadge: 'Stationnement réglementé',
    },
  },
  {
    id: 'cr-stat-02',
    codeRef: 'ETG-030',
    theme: 'Stationnement & Circulation',
    difficulty: 'Facile',
    question:
      'Que signifie ce panneau rond à fond bleu avec une croix rouge en X (deux barres obliques B6d) ?',
    options: [
      'L’arrêt ET le stationnement sont tous les deux interdits sur la chaussée et l’accotement',
      'Seul le stationnement de plus de 24 heures est interdit',
      'Fin de l’interdiction de stationner',
      'Emplacement réservé aux livraisons uniquement',
    ],
    correct_index: 0,
    explanation:
      'La croix rouge (2 barres = 2 interdictions, panneau B6d) interdit à la fois le STATIONNEMENT et l’ARRÊT, même pour quelques secondes le temps de déposer quelqu’un !',
    visual: {
      sceneType: 'stat_b6d_arret_et_stationnement_interdits',
      caption: 'Panneau B6d (Arrêt et stationnement interdits)',
      speedKmh: 30,
      contextBadge: 'Axe dégagé',
    },
  },
  {
    id: 'cr-stat-03',
    codeRef: 'ETG-031',
    theme: 'Stationnement & Circulation',
    difficulty: 'Piège Examen',
    question:
      'Nous sommes le 15 du mois à 19h00. Dans cette rue à stationnement unilatéral à alternance semi-mensuelle (1-15 / 16-31), à quelle heure dois-je changer ma voiture de côté ?',
    options: [
      'Ce soir même, le 15 du mois, entre 20h30 et 21h00',
      'Demain matin le 16 à 08h00 précises',
      'À minuit pile dans la nuit du 15 au 16',
      'Je peux déjà me garer du côté 16-31 dès 18h00',
    ],
    correct_index: 0,
    explanation:
      'Question mythique du Code de la route ! Le changement de côté du stationnement à alternance semi-mensuelle s’effectue le dernier jour de chacune des deux périodes (donc le 15 et le dernier jour du mois) ENTRE 20h30 ET 21h00.',
    visual: {
      sceneType: 'stat_semi_mensuel_1_15_16_31',
      caption: 'Panneau B6b3 — Stationnement alterné semi-mensuel (1-15 / 16-31)',
      speedKmh: 20,
      contextBadge: 'Le 15 du mois à 19h',
    },
  },
  {
    id: 'cr-stat-04',
    codeRef: 'ETG-032',
    theme: 'Stationnement & Circulation',
    difficulty: 'Moyen',
    question:
      'Une ligne JAUNE CONTINUE est peinte le long de la bordure du trottoir à ma droite. Que signifie-t-elle ?',
    options: [
      'L’arrêt et le stationnement sont tous les deux interdits le long de ce trottoir',
      'Seul le stationnement est interdit, l’arrêt reste autorisé',
      'C’est une bande cyclable temporaire de chantier',
      'Le stationnement est payant par horodateur',
    ],
    correct_index: 0,
    explanation:
      'Retenez l’analogie avec les lignes blanches : Ligne jaune CONTINUE sur la bordure du trottoir = Arrêt ET stationnement interdits (équivalent du panneau croix B6d). Ligne jaune DISCONTINUE = Stationnement interdit mais arrêt autorisé (équivalent du panneau 1 barre B6a1).',
    visual: {
      sceneType: 'stat_trottoir_ligne_jaune_continue',
      caption: 'Bordure de trottoir peinte d’une ligne jaune continue',
      speedKmh: 25,
      contextBadge: 'Marquage jaune continu',
    },
  },
  {
    id: 'cr-stat-05',
    codeRef: 'ETG-033',
    theme: 'Stationnement & Circulation',
    difficulty: 'Moyen',
    question:
      'Le long de ce trottoir, le marquage jaune est DISCONTINU (en pointillés jaunes). Puis-je m’arrêter 30 secondes pour faire descendre mon passager ?',
    options: [
      'Oui, la ligne jaune discontinue interdit uniquement le stationnement mais autorise l’arrêt',
      'Non, tout marquage jaune interdit l’arrêt',
      'Oui, et je peux même laisser ma voiture garée 30 minutes',
      'Non, cet emplacement est réservé aux taxis',
    ],
    correct_index: 0,
    explanation:
      'La ligne jaune discontinue peinte sur la bordure du trottoir interdit le stationnement mais autorise l’arrêt momentané (pour la montée/descente de passagers ou le chargement/déchargement).',
    visual: {
      sceneType: 'stat_trottoir_ligne_jaune_discontinue',
      caption: 'Bordure de trottoir peinte d’une ligne jaune discontinue',
      speedKmh: 20,
      contextBadge: 'Marquage jaune discontinu',
    },
  },
  {
    id: 'cr-stat-06',
    codeRef: 'ETG-034',
    theme: 'Stationnement & Circulation',
    difficulty: 'Moyen',
    question:
      'En entrant dans cette « Zone de rencontre » (panneau carré bleu B52), quelles sont les deux règles essentielles ?',
    options: [
      'La vitesse est limitée à 20 km/h et les piétons sont prioritaires sur toute la chaussée',
      'La vitesse est limitée à 30 km/h et les piétons doivent rester sur les trottoirs',
      'La circulation est interdite aux voitures particulières',
      'Le stationnement est libre partout dans la rue',
    ],
    correct_index: 0,
    explanation:
      'Dans une Zone de rencontre (panneau B52), tous les usagers cohabitent : les piétons peuvent circuler sur toute la largeur de la chaussée et ont la priorité sur tous les véhicules, dont la vitesse est limitée à 20 km/h (et les cyclistes peuvent circuler dans les deux sens).',
    visual: {
      sceneType: 'circ_zone_rencontre_20kmh',
      caption: 'Entrée de Zone de rencontre — Panneau B52',
      speedKmh: 18,
      contextBadge: 'Zone 20 km/h',
    },
  },
  {
    id: 'cr-stat-07',
    codeRef: 'ETG-035',
    theme: 'Stationnement & Circulation',
    difficulty: 'Facile',
    question:
      'Ce panneau carré bleu avec un triangle blanc pointant vers le haut traversé d’une barre horizontale (C13a) annonce :',
    options: [
      'Une rue sans issue (impasse) : je peux m’y engager mais je devrai faire demi-tour pour ressortir',
      'Un sens interdit à 100 mètres',
      'Un péage autoroutier obligatoire',
      'Une route prioritaire qui s’arrête',
    ],
    correct_index: 0,
    explanation:
      'Le panneau C13a est un panneau d’indication (carré bleu) signalant une voie sans issue (impasse). L’accès n’est nullement interdit, mais les véhicules motorisés n’ont pas de débouché à l’extrémité.',
    visual: {
      sceneType: 'sign_c13a_impasse',
      caption: 'Entrée de voie résidentielle avec panneau C13a',
      speedKmh: 25,
      contextBadge: 'Voie sans issue',
    },
  },

  // ============================================================================
  // 5. AUTOROUTE & VOIES RAPIDES (6 questions 100% illustrées)
  // ============================================================================
  {
    id: 'cr-auto-01',
    codeRef: 'ETG-036',
    theme: 'Autoroute & Voies Rapides',
    difficulty: 'Facile',
    question:
      'Sur autoroute à 130 km/h, combien de traits blancs de la bande d’arrêt d’urgence (et combien de secondes) dois-je laisser au minimum avec la voiture qui me précède ?',
    options: [
      'Au moins 2 traits blancs (soit un intervalle d’au moins 2 secondes, environ 78 mètres)',
      '1 seul trait blanc (soit 1 seconde, environ 38 mètres)',
      '3 traits blancs uniquement par temps de pluie',
      'La longueur de 3 voitures (environ 15 mètres)',
    ],
    correct_index: 0,
    explanation:
      'Sur autoroute, un trait de la bande d’arrêt d’urgence mesure 39 m et l’intervalle entre deux traits mesure 13 m (39 + 13 = 52 m, et 2 traits + 1 espace = ~90 m). Laisser 2 traits blancs visibles garantit l’intervalle minimal de sécurité de 2 secondes !',
    penaltyInfo: 'Non-respect des distances de sécurité : amende de 4e classe (135 €) et retrait de 3 points.',
    visual: {
      sceneType: 'auto_distances_securite_2_traits',
      caption: 'Circulation sur autoroute — Repères de la bande d’arrêt d’urgence',
      speedKmh: 130,
      contextBadge: 'Autoroute 130 km/h',
    },
  },
  {
    id: 'cr-auto-02',
    codeRef: 'ETG-037',
    theme: 'Autoroute & Voies Rapides',
    difficulty: 'Moyen',
    question:
      'Il pleut sur cette portion d’autoroute normalement limitée à 130 km/h. Quelle est désormais la vitesse maximale autorisée (pour tous les conducteurs, y compris confirmés) ?',
    options: [
      '110 km/h',
      '120 km/h',
      '100 km/h',
      '90 km/h',
    ],
    correct_index: 0,
    explanation:
      'Par temps de pluie (ou autres précipitations) ET pour les détenteurs d’un permis probatoire, les limitations maximales sont abaissées : 130 km/h passe à 110 km/h sur autoroute, 110 km/h passe à 100 km/h sur voie rapide à chaussées séparées, et 90/80 km/h passe à 80 km/h sur route.',
    visual: {
      sceneType: 'auto_pluie_vitesse_110',
      caption: 'Autoroute sous la pluie — Essuie-glaces en marche',
      speedKmh: 110,
      contextBadge: 'Pluie sur autoroute',
    },
  },
  {
    id: 'cr-auto-03',
    codeRef: 'ETG-038',
    theme: 'Autoroute & Voies Rapides',
    difficulty: 'Moyen',
    question:
      'Sur l’autoroute, mon téléphone sonne et je souhaite vérifier mon itinéraire GPS. Puis-je m’arrêter sur la Bande d’Arrêt d’Urgence (BAU) à droite ?',
    options: [
      'Non, l’arrêt sur la BAU est strictement réservé aux cas de nécessité absolue (panne, malaise, accident)',
      'Oui, si j’allume mes feux de détresse et que cela dure moins de 2 minutes',
      'Oui, à condition de mettre mon gilet jaune avant de regarder le téléphone',
      'Oui, si aucun camion n’arrive derrière moi',
    ],
    correct_index: 0,
    explanation:
      'La Bande d’Arrêt d’Urgence (séparée par une ligne discontinue de 39 m de long) est une zone extrêmement dangereuse où la durée de survie moyenne d’un piéton est très faible. On ne s’y arrête qu’en cas d’urgence absolue (panne mécanique immobilisante ou malaise grave). Sinon, attendez la prochaine aire de repos !',
    penaltyInfo: 'Arrêt ou stationnement injustifié sur la BAU : 135 € d’amende et retrait de 3 points.',
    visual: {
      sceneType: 'auto_bande_arret_urgence',
      caption: 'Bande d’Arrêt d’Urgence (BAU) sur autoroute',
      speedKmh: 120,
      contextBadge: 'Bande d’arrêt d’urgence',
    },
  },
  {
    id: 'cr-auto-04',
    codeRef: 'ETG-039',
    theme: 'Autoroute & Voies Rapides',
    difficulty: 'Facile',
    question:
      'Dans cette longue descente, à quoi sert cette voie à damier rouge et blanc qui part sur la droite (« Voie de détresse ») ?',
    options: [
      'À arrêter dans un lit de graviers un véhicule dont les freins ont lâché',
      'À faire une pause pique-nique en sécurité',
      'À faire demi-tour en cas d’erreur d’itinéraire',
      'À peser les camions de plus de 19 tonnes',
    ],
    correct_index: 0,
    explanation:
      'La voie de détresse (signalée par le panneau C24c avec damier rouge et blanc) se termine par un bac à sable ou à graviers meubles permettant de stopper un véhicule victime d’une défaillance du système de freinage en descente. Tout arrêt volontaire y est bien sûr interdit !',
    visual: {
      sceneType: 'auto_voie_detresse_echappatoire',
      caption: 'Panneau de voie de détresse à damier rouge et blanc en descente',
      speedKmh: 70,
      contextBadge: 'Descente dangereuse',
    },
  },
  {
    id: 'cr-auto-05',
    codeRef: 'ETG-040',
    theme: 'Autoroute & Voies Rapides',
    difficulty: 'Piège Examen',
    question:
      'En circulant dans ce tunnel routier, à quoi servent les diodes lumineuses BLEUES régulièrement espacées sur la paroi ?',
    options: [
      'À matérialiser la distance de sécurité minimale à laisser avec le véhicule qui précède (2 diodes bleues)',
      'À indiquer l’emplacement des extincteurs et bornes d’appel',
      'À éclairer le trottoir pour les piétons',
      'À signaler une zone de radar automatique',
    ],
    correct_index: 0,
    explanation:
      'Dans les grands tunnels (comme le tunnel du Mont-Blanc ou de Fourvière), les jalons lumineux BLEUS espacés sur les parois servent de repères de distance de sécurité : vous devez toujours laisser l’équivalent d’au moins 2 diodes bleues entre vous et le véhicule devant vous.',
    visual: {
      sceneType: 'auto_tunnel_diodes_bleues',
      caption: 'Tunnel routier équipé de jalons lumineux bleus sur la paroi',
      speedKmh: 70,
      contextBadge: 'Tunnel routier',
    },
  },

  // ============================================================================
  // 6. VOYANTS, FEUX & CONDUITE (7 questions 100% illustrées)
  // ============================================================================
  {
    id: 'cr-voy-01',
    codeRef: 'ETG-041',
    theme: 'Voyants, Feux & Conduite',
    difficulty: 'Facile',
    question:
      'En roulant, ce voyant ROUGE en forme de burette d’huile s’allume sur mon tableau de bord. Que dois-je faire ?',
    options: [
      'M’arrêter immédiatement dès que possible en sécurité et couper le moteur (défaut de pression d’huile)',
      'Continuer jusqu’au prochain garage à 30 km en roulant doucement',
      'Attendre la prochaine révision annuelle pour rajouter de l’huile',
      'Activer le chauffage au maximum pour refroidir l’huile',
    ],
    correct_index: 0,
    explanation:
      'Tout voyant d’alerte ROUGE qui s’allume en roulant impose un ARRÊT IMMÉDIAT (en sécurité). La burette rouge indique une chute de pression d’huile moteur : rouler quelques kilomètres de plus suffit à casser définitivement le moteur par grippage !',
    visual: {
      sceneType: 'dash_voyant_huile_rouge',
      caption: 'Tableau de bord — Allumage d’un témoin rouge en circulation',
      speedKmh: 80,
      contextBadge: 'Alerte Tableau de bord',
    },
  },
  {
    id: 'cr-voy-02',
    codeRef: 'ETG-042',
    theme: 'Voyants, Feux & Conduite',
    difficulty: 'Moyen',
    question:
      'Ce voyant rouge représentant un thermomètre plongé dans un liquide s’allume. Quelle est sa signification et que ne faut-il surtout PAS faire à chaud ?',
    options: [
      'Surchauffe du liquide de refroidissement : je m’arrête, et je n’ouvre surtout pas le bouchon du vase d’expansion à chaud (risque de brûlures graves)',
      'Température extérieure inférieure à 0°C (risque de verglas)',
      'Manque de liquide lave-glace : j’en rajoute immédiatement',
      'Surchauffe de l’huile de boîte de vitesses',
    ],
    correct_index: 0,
    explanation:
      'Ce témoin signale une température excessive du liquide de refroidissement moteur (> 110°C). Il faut s’arrêter immédiatement. Attention : le circuit étant sous haute pression à chaud, dévisser le bouchon provoquerait un geyser de vapeur bouillante !',
    visual: {
      sceneType: 'dash_voyant_liquide_refroidissement',
      caption: 'Tableau de bord — Témoin de température du liquide de refroidissement',
      speedKmh: 60,
      contextBadge: 'Surchauffe moteur',
    },
  },
  {
    id: 'cr-voy-03',
    codeRef: 'ETG-043',
    theme: 'Voyants, Feux & Conduite',
    difficulty: 'Piège Examen',
    question:
      'Il pleut fortement ce soir. Quels feux puis-je utiliser, et lesquels sont FORMELLEMENT INTERDITS sous la pluie ?',
    options: [
      'Feux de croisement + feux de brouillard AVANT autorisés, mais feux de brouillard ARRIÈRE interdits sous la pluie !',
      'J’allume les feux de brouillard avant ET arrière dès qu’il pleut',
      'Seuls les feux de position (veilleuses) suffisent sous la pluie',
      'Les feux de brouillard avant sont interdits sous la pluie',
    ],
    correct_index: 0,
    explanation:
      'Règle ultra-classique de l’examen : En cas de FORTE PLUIE, les feux de brouillard AVANT sont autorisés (en complément des feux de croisement), mais les feux de brouillard ARRIÈRE sont strictement INTERDITS car très éblouissants par réverbération sur l’eau ! Les feux de brouillard arrière ne s’utilisent QUE par brouillard ou chute de neige.',
    visual: {
      sceneType: 'dash_feux_brouillard_arriere_pluie',
      caption: 'Conduite de nuit par forte pluie — Témoins des feux de brouillard',
      speedKmh: 80,
      contextBadge: 'Forte pluie de nuit',
    },
  },
  {
    id: 'cr-voy-04',
    codeRef: 'ETG-044',
    theme: 'Voyants, Feux & Conduite',
    difficulty: 'Facile',
    question:
      'Je roule de nuit hors agglomération avec mes feux de route (voyant bleu allumé). Une voiture apparaît en face au loin :',
    options: [
      'Je repasse immédiatement en feux de croisement (voyant vert) pour ne pas éblouir le conducteur en face',
      'Je reste en feux de route jusqu’à être à 20 mètres de la voiture',
      'Je passe en feux de position uniquement jusqu’au croisement',
      'J’allume mes feux de brouillard arrière',
    ],
    correct_index: 0,
    explanation:
      'Les feux de route éclairent à au moins 100 mètres mais éblouissent tout usager en face ou suivi. Dès que vous allez croiser ou suivre un autre véhicule, vous devez repasser en feux de croisement (qui éclairent à environ 30 m sans éblouir).',
    visual: {
      sceneType: 'dash_feux_route_eblouissement',
      caption: 'Route non éclairée de nuit — Véhicule arrivant en face',
      speedKmh: 80,
      contextBadge: 'Conduite de nuit',
    },
  },
  {
    id: 'cr-voy-05',
    codeRef: 'ETG-045',
    theme: 'Voyants, Feux & Conduite',
    difficulty: 'Moyen',
    question:
      'Sur chaussée sèche à 90 km/h, quelle est approximativement ma distance totale d’arrêt (temps de réaction + freinage) selon la formule rapide du Code ?',
    options: [
      'Environ 81 mètres (9 × 9 = 81 m)',
      'Environ 45 mètres (90 ÷ 2 = 45 m)',
      'Environ 27 mètres (9 × 3 = 27 m)',
      'Environ 130 mètres',
    ],
    correct_index: 0,
    explanation:
      'Astuce officielle du Code de la route : sur route sèche, pour calculer la distance d’arrêt, on multiplie le chiffre des dizaines de la vitesse par lui-même ! À 90 km/h : 9 × 9 = 81 m (dont 9 × 3 = 27 m parcourus pendant la seconde de temps de réaction). Sur route mouillée, on ajoute la moitié (81 + 40 = ~120 m) !',
    visual: {
      sceneType: 'conduite_distance_arret_100kmh',
      caption: 'Schéma de la distance de réaction (1s) + distance de freinage à 90 km/h',
      speedKmh: 90,
      contextBadge: 'Calcul Distance d’arrêt',
    },
  },
  {
    id: 'cr-voy-06',
    codeRef: 'ETG-046',
    theme: 'Voyants, Feux & Conduite',
    difficulty: 'Moyen',
    question:
      'En soirée, quel verre contient le plus d’alcool pur lorsqu’il est servi aux doses standard de bar/bistrot ?',
    options: [
      'Aucun : un demi de bière (25 cl à 5°), un ballon de vin (10 cl à 12°) et un whisky (3 cl à 40°) contiennent la même quantité d’alcool pur (~10 g)',
      'Le verre de whisky à 40° contient trois fois plus d’alcool',
      'Le demi de bière contient deux fois moins d’alcool que le vin',
      'La coupe de champagne ne fait pas monter l’alcoolémie',
    ],
    correct_index: 0,
    explanation:
      'Chaque dose standard servie dans un établissement (25 cl de bière à 5°, 12 cl de vin à 12°, 3 cl d’alcool fort à 40°) contient environ 10 grammes d’alcool pur et fait monter l’alcoolémie de 0,20 à 0,25 g/L de sang en moyenne ! (Seuil max : 0,5 g/L de sang, ou 0,2 g/L en permis probatoire).',
    penaltyInfo: 'Alcoolémie ≥ 0,5 g/L (0,25 mg/L d’air expiré) : retrait de 6 points !',
    visual: {
      sceneType: 'conduite_alcool_verre_equivalent',
      caption: 'Équivalence des doses standard d’alcool (Bière 25 cl / Vin 10 cl / Whisky 3 cl)',
      contextBadge: 'Sécurité Routière',
    },
  },
];
