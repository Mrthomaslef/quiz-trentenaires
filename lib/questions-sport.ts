import type { RawSeedQuestion } from './questions-part1';

export const QUESTIONS_SPORT: RawSeedQuestion[] = [
  // ============================================================================
  // NIVEAU 1 (5 questions Sport)
  // ============================================================================
  {
    difficulty: 1,
    theme: 'Sport',
    question:
      'Contre quel pays l’équipe de France de football a-t-elle gagné la finale de la Coupe du Monde 1998 (3-0) ?',
    options: ['L’Italie', 'L’Allemagne', 'Le Brésil', 'L’Argentine'],
    correct_index: 2,
    explanation:
      'Le 12 juillet 1998 au Stade de France, les Bleus ont battu le Brésil 3-0 grâce à un doublé de la tête de Zinédine Zidane et un but d’Emmanuel Petit.',
  },
  {
    difficulty: 1,
    theme: 'Sport',
    question:
      'De quelle couleur est le maillot porté par le leader du classement général du Tour de France ?',
    options: [
      'Le maillot vert',
      'Le maillot jaune',
      'Le maillot à pois rouges',
      'Le maillot blanc',
    ],
    correct_index: 1,
    explanation:
      'Créé en 1919, le maillot jaune rappelle la couleur du papier du journal organisateur de l’époque, L’Auto.',
  },
  {
    difficulty: 1,
    theme: 'Sport',
    question:
      'Sur quelle surface se joue le tournoi de tennis de Roland-Garros à Paris ?',
    options: [
      'Gazon',
      'Terre battue',
      'Dur (résine)',
      'Moquette synthétique',
    ],
    correct_index: 1,
    explanation:
      'Roland-Garros est le seul tournoi du Grand Chelem disputé sur terre battue, surface où Rafael Nadal a remporté 14 titres.',
  },
  {
    difficulty: 1,
    theme: 'Sport',
    question:
      'Combien d’anneaux entrelacés composent le drapeau des Jeux Olympiques ?',
    options: ['4 anneaux', '5 anneaux', '6 anneaux', '7 anneaux'],
    correct_index: 1,
    explanation:
      'Les 5 anneaux (bleu, jaune, noir, vert, rouge) représentent l’union des cinq continents habités.',
  },
  {
    difficulty: 1,
    theme: 'Sport',
    question:
      'Dans quel sport collectif français la surnommée « équipe des Barjots » puis « des Experts » s’est-elle illustrée ?',
    options: ['Le volley-ball', 'Le handball', 'Le basket-ball', 'Le water-polo'],
    correct_index: 1,
    explanation:
      'L’équipe de France masculine de handball détient le plus grand palmarès de l’histoire de son sport avec 6 titres mondiaux et 3 titres olympiques.',
  },

  // ============================================================================
  // NIVEAU 2 (5 questions Sport)
  // ============================================================================
  {
    difficulty: 2,
    theme: 'Sport',
    question:
      'Quel nageur français a remporté 4 médailles d’or individuelles aux Jeux Olympiques de Paris 2024 ?',
    options: [
      'Florent Manaudou',
      'Camille Lacourt',
      'Léon Marchand',
      'Alain Bernard',
    ],
    correct_index: 2,
    explanation:
      'Léon Marchand a réalisé un quadruplé historique (400m 4 nages, 200m papillon, 200m brasse, 200m 4 nages), dont deux titres remportés lors de la même soirée !',
  },
  {
    difficulty: 2,
    theme: 'Sport',
    question:
      'Dans quelle franchise NBA Michael Jordan a-t-il remporté ses 6 titres de champion dans les années 1990 ?',
    options: [
      'Los Angeles Lakers',
      'Chicago Bulls',
      'Boston Celtics',
      'San Antonio Spurs',
    ],
    correct_index: 1,
    explanation:
      'Avec Scottie Pippen et l’entraîneur Phil Jackson, Michael Jordan a réalisé deux triplés (1991-1993 et 1996-1998) sous le maillot n°23 des Bulls.',
  },
  {
    difficulty: 2,
    theme: 'Sport',
    question:
      'Quel judoka français, multiple champion olympique des poids lourds, a allumé la vasque des JO de Paris 2024 avec Marie-José Pérec ?',
    options: ['David Douillet', 'Teddy Riner', 'Luka Mkheidze', 'Angelo Parisi'],
    correct_index: 1,
    explanation:
      'Teddy Riner, onze fois champion du monde et quintuple médaillé d’or olympique (individuel et équipes), a embrasé la vasque du jardin des Tuileries.',
  },
  {
    difficulty: 2,
    theme: 'Sport',
    question:
      'Quel sprinteur jamaïcain détient toujours le record du monde du 100 mètres en 9,58 secondes ?',
    options: ['Asafa Powell', 'Yohan Blake', 'Usain Bolt', 'Carl Lewis'],
    correct_index: 2,
    explanation:
      '« La Foudre » Usain Bolt a établi ce record mythique le 16 août 2009 lors des championnats du monde de Berlin.',
  },
  {
    difficulty: 2,
    theme: 'Sport',
    question:
      'Combien de joueurs composent une équipe de rugby à XV sur le terrain au coup d’envoi ?',
    options: ['11 joueurs', '13 joueurs', '15 joueurs', '18 joueurs'],
    correct_index: 2,
    explanation:
      'Une équipe de rugby à XV aligne 8 avants (numéros 1 à 8) et 7 arrières (numéros 9 à 15).',
  },

  // ============================================================================
  // NIVEAU 3 (5 questions Sport)
  // ============================================================================
  {
    difficulty: 3,
    theme: 'Sport',
    question:
      'Avec quelle équipe NBA le meneur français Tony Parker a-t-il remporté 4 bagues de champion ?',
    options: [
      'Dallas Mavericks',
      'San Antonio Spurs',
      'Miami Heat',
      'Charlotte Hornets',
    ],
    correct_index: 1,
    explanation:
      'Aux côtés de Tim Duncan et Manu Ginóbili sous les ordres de Gregg Popovich, Tony Parker a été sacré en 2003, 2005, 2007 (MVP des Finales) et 2014.',
  },
  {
    difficulty: 3,
    theme: 'Sport',
    question:
      'Qui a inscrit le but en or qui a offert l’Euro 2000 à la France face à l’Italie en finale ?',
    options: [
      'Sylvain Wiltord',
      'Thierry Henry',
      'David Trezeguet',
      'Robert Pirès',
    ],
    correct_index: 2,
    explanation:
      'Après l’égalisation de Sylvain Wiltord à la dernière seconde du temps réglementaire, David Trezeguet a fusillé Francesco Toldo d’une reprise de volée sous la barre en prolongation.',
  },
  {
    difficulty: 3,
    theme: 'Sport',
    question:
      'Quelle nageuse française est devenue championne olympique du 400 m nage libre aux JO d’Athènes en 2004 à seulement 17 ans ?',
    options: [
      'Roxana Maracineanu',
      'Laure Manaudou',
      'Malia Metella',
      'Camille Muffat',
    ],
    correct_index: 1,
    explanation:
      'Entraînée par Philippe Lucas, Laure Manaudou avait décroché trois médailles (or, argent, bronze) lors de ces Jeux d’Athènes 2004.',
  },
  {
    difficulty: 3,
    theme: 'Sport',
    question:
      'Dans quel sport utilise-t-on une épée, un fleuret ou un sabre ?',
    options: ['Le kendo', 'L’escrime', 'Le pentathlon moderne uniquement', 'La joute'],
    correct_index: 1,
    explanation:
      'L’escrime est le sport français qui a rapporté le plus grand nombre de médailles olympiques à la France depuis 1896.',
  },
  {
    difficulty: 3,
    theme: 'Sport',
    question:
      'Quelle est la distance exacte d’un marathon olympique depuis 1924 ?',
    options: [
      '40,000 kilomètres',
      '42,195 kilomètres',
      '45,500 kilomètres',
      '50,000 kilomètres',
    ],
    correct_index: 1,
    explanation:
      'La distance de 42,195 km a été fixée aux JO de Londres 1908 pour relier le château de Windsor à la loge royale du stade de White City.',
  },

  // ============================================================================
  // NIVEAU 4 (5 questions Sport)
  // ============================================================================
  {
    difficulty: 4,
    theme: 'Sport',
    question:
      'Quel pilote allemand a remporté 5 titres consécutifs de champion du monde de Formule 1 avec Ferrari entre 2000 et 2004 ?',
    options: [
      'Sebastian Vettel',
      'Nico Rosberg',
      'Michael Schumacher',
      'Ralf Schumacher',
    ],
    correct_index: 2,
    explanation:
      '« Le Baron Rouge » compte 7 titres mondiaux au total (2 avec Benetton en 1994-1995 et 5 avec la Scuderia Ferrari).',
  },
  {
    difficulty: 4,
    theme: 'Sport',
    question:
      'Quel club français a remporté la Ligue des Champions de football en 1993 grâce à un but de Basile Boli ?',
    options: [
      'Paris Saint-Germain',
      'AS Monaco',
      'Olympique de Marseille',
      'AJ Auxerre',
    ],
    correct_index: 2,
    explanation:
      'Le 26 mai 1993 à Munich, l’OM a battu le grand Milan AC (1-0) sur une tête de Basile Boli, devenant le premier club français sacré champion d’Europe.',
  },
  {
    difficulty: 4,
    theme: 'Sport',
    question:
      'Quel athlète français du saut à la perche a battu le record du monde en franchissant 6,16 m à Donetsk en 2014 ?',
    options: [
      'Jean Galfione',
      'Renaud Lavillenie',
      'Pierre Quinon',
      'Thibaut Collet',
    ],
    correct_index: 1,
    explanation:
      'Champion olympique à Londres en 2012, Renaud Lavillenie avait alors effacé le mythique record de Sergueï Bubka sous les yeux de ce dernier.',
  },
  {
    difficulty: 4,
    theme: 'Sport',
    question:
      'Quel joueur de tennis français est le dernier vainqueur masculin tricolore en simple à Roland-Garros (en 1983) ?',
    options: ['Henri Leconte', 'Guy Forget', 'Yannick Noah', 'Cédric Pioline'],
    correct_index: 2,
    explanation:
      'Le 5 juin 1983, Yannick Noah a battu le Suédois Mats Wilander en trois sets sur le court central de Roland-Garros.',
  },
  {
    difficulty: 4,
    theme: 'Sport',
    question:
      'En quelle année l’équipe de France de football a-t-elle décroché sa deuxième étoile mondiale en Russie ?',
    options: ['2014', '2016', '2018', '2022'],
    correct_index: 2,
    explanation:
      'Le 15 juillet 2018 à Moscou, les Bleus de Didier Deschamps ont battu la Croatie 4-2 en finale.',
  },

  // ============================================================================
  // NIVEAU 5 (5 questions Sport)
  // ============================================================================
  {
    difficulty: 5,
    theme: 'Sport',
    question:
      'Quelle athlète française a réalisé le doublé 200 m / 400 m aux Jeux Olympiques d’Atlanta en 1996 ?',
    options: [
      'Christine Arron',
      'Marie-José Pérec',
      'Muriel Hurtis',
      'Patricia Girard',
    ],
    correct_index: 1,
    explanation:
      'Surnommée « La Gazelle », Marie-José Pérec est la seule triple championne olympique française d’athlétisme (400 m en 1992, puis 200 m et 400 m en 1996).',
  },
  {
    difficulty: 5,
    theme: 'Sport',
    question:
      'Quelle joueuse de tennis franco-américaine a remporté Roland-Garros en 2000 et l’Open d’Australie en 1995 ?',
    options: [
      'Amélie Mauresmo',
      'Mary Pierce',
      'Nathalie Tauziat',
      'Marion Bartoli',
    ],
    correct_index: 1,
    explanation:
      'Mary Pierce a remporté le simple et le double dames de Roland-Garros en 2000, restant à ce jour la dernière Française titrée en simple Porte d’Auteuil.',
  },
  {
    difficulty: 5,
    theme: 'Sport',
    question:
      'Combien de fois Rafael Nadal a-t-il remporté le tournoi de Roland-Garros au cours de sa carrière ?',
    options: ['11 fois', '12 fois', '14 fois', '16 fois'],
    correct_index: 2,
    explanation:
      'Entre son premier sacre en 2005 et son quatorzième en 2022, l’Espagnol a compilé un bilan ahurissant de 112 victoires pour seulement 4 défaites à Roland-Garros.',
  },
  {
    difficulty: 5,
    theme: 'Sport',
    question:
      'Quel biathlète français est devenu l’athlète tricolore le plus titré aux Jeux Olympiques d’hiver avec 5 médailles d’or ?',
    options: [
      'Raphaël Poirée',
      'Martin Fourcade',
      'Quentin Fillon Maillet',
      'Vincent Defrasne',
    ],
    correct_index: 1,
    explanation:
      'Martin Fourcade a dominé le biathlon mondial avec 5 titres olympiques (2014 et 2018) et 7 gros globes de cristal consécutifs.',
  },
  {
    difficulty: 5,
    theme: 'Sport',
    question:
      'Quel joueur français a été élu n°1 de la Draft NBA en 2023 par les San Antonio Spurs ?',
    options: [
      'Rudy Gobert',
      'Evan Fournier',
      'Victor Wembanyama',
      'Zaccharie Risacher',
    ],
    correct_index: 2,
    explanation:
      'Victor Wembanyama (« Wemby »), du haut de ses 2,24 m, est devenu le premier Français sélectionné en 1re position de la Draft NBA avant que Zaccharie Risacher ne l’imite en 2024.',
  },

  // ============================================================================
  // NIVEAU 6 (5 questions Sport)
  // ============================================================================
  {
    difficulty: 6,
    theme: 'Sport',
    question:
      'Contre quelle équipe le XV de France a-t-il signé une remontée légendaire en demi-finale de la Coupe du Monde 1999 à Twickenham (43-31) ?',
    options: [
      'L’Australie',
      'L’Afrique du Sud',
      'La Nouvelle-Zélande (All Blacks)',
      'L’Angleterre',
    ],
    correct_index: 2,
    explanation:
      'Menés 24-10 par les All Blacks de Jonah Lomu, les Bleus de Christophe Dominici et Philippe Bernat-Salles ont inscrit 33 points d’affilée en seconde période !',
  },
  {
    difficulty: 6,
    theme: 'Sport',
    question:
      'Dans quel stade Zinédine Zidane a-t-il inscrit sa célèbre reprise de volée du pied gauche en finale de la Ligue des Champions 2002 ?',
    options: [
      'Old Trafford (Manchester)',
      'Hampden Park (Glasgow)',
      'Stade Roi Baudouin (Bruxelles)',
      'San Siro (Milan)',
    ],
    correct_index: 1,
    explanation:
      'Sur un centre en cloche de Roberto Carlos, Zidane a offert la 9e Ligue des Champions au Real Madrid contre le Bayer Leverkusen (2-1) à Glasgow.',
  },
  {
    difficulty: 6,
    theme: 'Sport',
    question:
      'Quelle Française a remporté le tournoi de Wimbledon en simple dames en 2006 puis en 2013 (deux joueuses différentes) ? Laquelle fut sacrée en 2006 ?',
    options: [
      'Marion Bartoli',
      'Amélie Mauresmo',
      'Tatiana Golovin',
      'Caroline Garcia',
    ],
    correct_index: 1,
    explanation:
      'Amélie Mauresmo a remporté l’Open d’Australie et Wimbledon en 2006 (étant n°1 mondiale), tandis que Marion Bartoli a triomphé à Wimbledon en 2013.',
  },
  {
    difficulty: 6,
    theme: 'Sport',
    question:
      'Quel cycliste français a porté le maillot jaune pendant 10 jours sur le Tour de France 2019 en faisant vibrer tout le pays ?',
    options: [
      'Thibaut Pinot',
      'Romain Bardet',
      'Julian Alaphilippe',
      'Richard Virenque',
    ],
    correct_index: 2,
    explanation:
      'Julian Alaphilippe a remporté deux étapes (dont le contre-la-montre de Pau en jaune) et terminé 5e du Tour 2019 avant de devenir double champion du monde sur route.',
  },
  {
    difficulty: 6,
    theme: 'Sport',
    question:
      'Quel nageur américain a remporté 8 médailles d’or lors des seuls Jeux Olympiques de Pékin en 2008 ?',
    options: ['Ian Thorpe', 'Ryan Lochte', 'Michael Phelps', 'Mark Spitz'],
    correct_index: 2,
    explanation:
      'Michael Phelps a battu le record de Mark Spitz (7 titres en 1972) et totalise 23 médailles d’or olympiques en carrière.',
  },

  // ============================================================================
  // NIVEAU 7 (5 questions Sport)
  // ============================================================================
  {
    difficulty: 7,
    theme: 'Sport',
    question:
      'Combien de fois Richard Virenque a-t-il remporté le maillot à pois de meilleur grimpeur du Tour de France (un record) ?',
    options: ['5 fois', '6 fois', '7 fois', '8 fois'],
    correct_index: 2,
    explanation:
      'Chouchou du public français dans les années 90 et 2000, Richard Virenque a ramené 7 fois le maillot à pois à Paris entre 1994 et 2004.',
  },
  {
    difficulty: 7,
    theme: 'Sport',
    question:
      'Quel défenseur français a inscrit un doublé totalement improbable en demi-finale de la Coupe du Monde 1998 contre la Croatie ?',
    options: [
      'Laurent Blanc',
      'Marcel Desailly',
      'Lilian Thuram',
      'Bixente Lizarazu',
    ],
    correct_index: 2,
    explanation:
      'Ce furent les deux seuls buts de Lilian Thuram en 142 sélections avec l’équipe de France !',
  },
  {
    difficulty: 7,
    theme: 'Sport',
    question:
      'Quel pilote français de Formule 1 est surnommé « Le Professeur » et compte 4 titres de champion du monde ?',
    options: [
      'Jean Alesi',
      'Alain Prost',
      'René Arnoux',
      'Olivier Panis',
    ],
    correct_index: 1,
    explanation:
      'Alain Prost a été sacré champion du monde en 1985, 1986, 1989 (McLaren) et 1993 (Williams-Renault), livrant des duels mythiques avec Ayrton Senna.',
  },
  {
    difficulty: 7,
    theme: 'Sport',
    question:
      'Quel patineur artistique français était célèbre pour ses saltos arrière sur la glace, notamment aux JO de Nagano en 1998 ?',
    options: [
      'Philippe Candeloro',
      'Brian Joubert',
      'Surya Bonaly',
      'Gwendal Peizerat',
    ],
    correct_index: 2,
    explanation:
      'Surya Bonaly a réalisé à Nagano 1998 un salto arrière réceptionné sur un seul patin (le « Bonaly »), figure alors interdite mais entrée dans la légende.',
  },
  {
    difficulty: 7,
    theme: 'Sport',
    question:
      'En quelle année la France a-t-elle remporté pour la dernière fois la Coupe Davis de tennis masculin ?',
    options: ['2001', '2014', '2017', '2019'],
    correct_index: 2,
    explanation:
      'En novembre 2017 à Villeneuve-d’Ascq, l’équipe dirigée par Yannick Noah (Tsonga, Pouille, Gasquet, Herbert) a battu la Belgique 3-2 pour décrocher son 10e Saladier d’Argent.',
  },

  // ============================================================================
  // NIVEAU 8 (5 questions Sport)
  // ============================================================================
  {
    difficulty: 8,
    theme: 'Sport',
    question:
      'Quel pilote français a remporté son unique Grand Prix de Formule 1 sous la pluie à Monaco en 1996 au volant d’une Ligier ?',
    options: [
      'Jean Alesi',
      'Olivier Panis',
      'Pierre Gasly',
      'Esteban Ocon',
    ],
    correct_index: 1,
    explanation:
      'Parti 14e, Olivier Panis a remporté ce Grand Prix de Monaco 1996 d’anthologie où seules 3 voitures ont franchi la ligne d’arrivée !',
  },
  {
    difficulty: 8,
    theme: 'Sport',
    question:
      'Dans quelle ville se sont déroulés les Jeux Olympiques d’hiver de 1992 organisés en France ?',
    options: ['Chamonix', 'Grenoble', 'Albertville', 'Annecy'],
    correct_index: 2,
    explanation:
      'Les JO d’Albertville en Savoie (février 1992), avec leur cérémonie d’ouverture signée Philippe Decouflé, ont marqué toute la génération des années 90.',
  },
  {
    difficulty: 8,
    theme: 'Sport',
    question:
      'Quel athlète français détient le record du monde du décathlon depuis 2018 avec 9 126 points ?',
    options: [
      'Christian Plaziat',
      'Romain Barras',
      'Kevin Mayer',
      'Alain Blondel',
    ],
    correct_index: 2,
    explanation:
      'Double champion du monde et double vice-champion olympique, Kevin Mayer a franchi la barre mythique des 9 100 points lors du Décastar de Talence en septembre 2018.',
  },
  {
    difficulty: 8,
    theme: 'Sport',
    question:
      'Qui a marqué le essai du « bout du monde » pour le XV de France face à la Nouvelle-Zélande à Auckland en 1994 ?',
    options: [
      'Philippe Saint-André',
      'Jean-Luc Sadourny',
      'Émile Ntamack',
      'Abdelatif Benazzi',
    ],
    correct_index: 1,
    explanation:
      'À la dernière minute à l’Eden Park, une relance initiée par Philippe Saint-André de ses 22 mètres aboutit à l’essai victorieux de Jean-Luc Sadourny.',
  },
  {
    difficulty: 8,
    theme: 'Sport',
    question:
      'Combien de médailles d’or la délégation française a-t-elle remportées lors des Jeux Olympiques de Paris 2024 ?',
    options: ['12 médailles d’or', '16 médailles d’or', '20 médailles d’or', '24 médailles d’or'],
    correct_index: 1,
    explanation:
      'La France a terminé 5e au classement des nations avec 64 médailles au total (16 en or, 26 en argent et 22 en bronze), battant son record de Pékin 2008.',
  },

  // ============================================================================
  // NIVEAU 9 (5 questions Sport)
  // ============================================================================
  {
    difficulty: 9,
    theme: 'Sport',
    question:
      'Quel escrimeur français, spécialiste de l’épée, a été porte-drapeau à Pékin 2008 mais détient surtout 2 titres olympiques en fleuret (1992) et sabre… ou quel sabreur français fut champion olympique individuel à Sydney 2000 ?',
    options: [
      'Brice Guyart',
      'Hugues Obry',
      'Jean-François Lamour',
      'Damien Touya',
    ],
    correct_index: 0,
    explanation:
      'À Sydney 2000 puis Athènes 2004, le fleurettiste Brice Guyart a décroché l’or olympique par équipes et en individuel !',
  },
  {
    difficulty: 9,
    theme: 'Sport',
    question:
      'Quel skieur alpin français a remporté la médaille d’or de la descente aux Jeux Olympiques de Salt Lake City en 2002 ?',
    options: [
      'Luc Alphand',
      'Jean-Luc Crétier',
      'Carole Montillet',
      'Antoine Dénériaz',
    ],
    correct_index: 2,
    explanation:
      'Carole Montillet a remporté l’or de la descente féminine à Salt Lake City 2002 (tandis que Jean-Luc Crétier l’avait emporté à Nagano 1998 et Antoine Dénériaz à Turin 2006).',
  },
  {
    difficulty: 9,
    theme: 'Sport',
    question:
      'Quel était le temps exact réalisé par Florent Manaudou lorsqu’il a remporté le 50 m nage libre aux JO de Londres en 2012 ?',
    options: ['20,94 secondes', '21,34 secondes', '21,80 secondes', '22,02 secondes'],
    correct_index: 1,
    explanation:
      'Parti du couloir n°7, Florent Manaudou a nagé en 21 s 34 pour devenir champion olympique huit ans après le titre de sa sœur Laure.',
  },
  {
    difficulty: 9,
    theme: 'Sport',
    question:
      'Quel navigateur français a remporté deux fois le Vendée Globe (course autour du monde en solitaire sans escale), en 2000-2001 puis en 2008-2009 ?',
    options: [
      'François Gabart',
      'Armel Le Cléac’h',
      'Michel Desjoyeaux',
      'Vincent Riou',
    ],
    correct_index: 2,
    explanation:
      'Surnommé « Le Professeur », Michel Desjoyeaux reste à ce jour le seul marin à avoir remporté deux fois le Vendée Globe.',
  },
  {
    difficulty: 9,
    theme: 'Sport',
    question:
      'Quelle équipe française de basket féminin a remporté la Ligue féminine et l’Euroligue à deux reprises en 1997 et 2001 ?',
    options: [
      'Valenciennes (USVO)',
      'Bourges Basket (CJM Bourges)',
      'ASVEL Féminin',
      'Tarbes Gespe Bigorre',
    ],
    correct_index: 1,
    explanation:
      'Les « Tango » de Bourges ont même réalisé le triplé Euroligue (1997, 1998, 2001) avant le doublé de Valenciennes (2002, 2004).',
  },

  // ============================================================================
  // NIVEAU 10 (5 questions Sport)
  // ============================================================================
  {
    difficulty: 10,
    theme: 'Sport',
    question:
      'De combien de secondes exactement Laurent Fignon a-t-il perdu le Tour de France 1989 face à l’Américain Greg LeMond lors du contre-la-montre final sur les Champs-Élysées ?',
    options: ['4 secondes', '8 secondes', '12 secondes', '19 secondes'],
    correct_index: 1,
    explanation:
      'Avec son guidon de triathlète aérodynamique, Greg LeMond a repris 58 secondes à Laurent Fignon en 24,5 km pour s’imposer de 8 secondes, le plus faible écart de l’histoire du Tour.',
  },
  {
    difficulty: 10,
    theme: 'Sport',
    question:
      'Quel pongiste français est devenu champion du monde individuel de tennis de table en 1993 à Göteborg ?',
    options: [
      'Jacques Secrétin',
      'Jean-Philippe Gatien',
      'Patrick Chila',
      'Félix Lebrun',
    ],
    correct_index: 1,
    explanation:
      'Vice-champion olympique à Barcelone en 1992, Jean-Philippe Gatien a décroché le titre mondial en simple à Göteborg en 1993 en battant Jean-Michel Saive en finale.',
  },
  {
    difficulty: 10,
    theme: 'Sport',
    question:
      'Quel duel épique de 11 heures et 5 minutes, le plus long match de l’histoire du tennis, Nicolas Mahut a-t-il disputé à Wimbledon en 2010, et quel fut le score du 5e set ?',
    options: [
      '58-56 contre Andy Roddick',
      '64-62 contre Kevin Anderson',
      '70-68 contre John Isner',
      '75-73 contre Ivo Karlović',
    ],
    correct_index: 2,
    explanation:
      'Étalé sur trois jours sur le court n°18 de Wimbledon, ce match hors-norme s’est conclu sur le score de 70-68 au cinquième set en faveur de l’Américain John Isner.',
  },
  {
    difficulty: 10,
    theme: 'Sport',
    question:
      'Quel athlète français est devenu champion du monde du 110 mètres haies à Séville en 2005 avec un chrono de 13,07 secondes ?',
    options: [
      'Stéphane Diagana',
      'Ladji Doucouré',
      'Garfield Darien',
      'Pascal Martinot-Lagarde',
    ],
    correct_index: 1,
    explanation:
      'À Helsinki en 2005, Ladji Doucouré a remporté le 110 m haies devant Liu Xiang et Allen Johnson avant de décrocher également l’or du relais 4x100 m !',
  },
  {
    difficulty: 10,
    theme: 'Sport',
    question:
      'En quelle année Stéphane Diagana est-il devenu le premier Français champion du monde d’athlétisme masculin sur 400 mètres haies à Athènes ?',
    options: ['1995', '1997', '1999', '2001'],
    correct_index: 1,
    explanation:
      'Le 4 août 1997 à Athènes, Stéphane Diagana a été sacré champion du monde du 400 m haies en 47,70 s avant de remporter le titre mondial du relais 4x400 m à Paris en 2003.',
  },
];
