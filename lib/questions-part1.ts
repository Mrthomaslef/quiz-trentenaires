export interface RawSeedQuestion {
  difficulty: number;
  theme: string;
  question: string;
  options: [string, string, string, string];
  correct_index: number;
  explanation: string;
}

export const QUESTIONS_PART_1: RawSeedQuestion[] = [
  // ============================================================================
  // DIFFICULTY 1 (30 questions) - Apéro Détendu
  // ============================================================================
  {
    difficulty: 1,
    theme: "Pop Culture 90/2000",
    question: "Dans l'univers Pokémon, quelle est l'évolution directe de Pikachu ?",
    options: ["Raichu", "Pichu", "Électhor", "Voltali"],
    correct_index: 0,
    explanation: "Pikachu évolue en Raichu lorsqu'il est exposé à une Pierre Foudre. Pichu est sa pré-évolution apparue en deuxième génération."
  },
  {
    difficulty: 1,
    theme: "Cinéma",
    question: "Dans quelle maison de Poudlard Harry Potter est-il envoyé par le Choixpeau magique ?",
    options: ["Serpentard", "Gryffondor", "Poufsouffle", "Serdaigle"],
    correct_index: 1,
    explanation: "Le Choixpeau hésite longuement avec Serpentard, mais Harry demande expressément à ne pas y aller et rejoint Gryffondor."
  },
  {
    difficulty: 1,
    theme: "Séries TV",
    question: "Quel est le nom du café où se retrouvent toujours Rachel, Monica, Phoebe, Joey, Chandler et Ross dans « Friends » ?",
    options: ["MacLaren's Pub", "Central Perk", "Luke's Diner", "Monk's Café"],
    correct_index: 1,
    explanation: "Le Central Perk et son célèbre canapé orange étaient situés au bas de l'immeuble de Monica à Greenwich Village."
  },
  {
    difficulty: 1,
    theme: "Musique",
    question: "Quel boys band français chantait « Partir un jour » en 1996 ?",
    options: ["Alliage", "Worlds Apart", "2Be3", "G Squad"],
    correct_index: 2,
    explanation: "Filip, Adel et Frank, trois amis d'enfance de Longjumeau, ont fait danser toute la France avec cet hymne des années 90."
  },
  {
    difficulty: 1,
    theme: "Jeux Vidéo",
    question: "Quel est le prénom du frère de Mario, vêtu d'une salopette et d'une casquette vertes ?",
    options: ["Wario", "Waluigi", "Yoshi", "Luigi"],
    correct_index: 3,
    explanation: "Luigi est apparu pour la première fois en 1983 dans le jeu d'arcade Mario Bros. Il est plus grand et saute plus haut que son frère."
  },
  {
    difficulty: 1,
    theme: "Gastronomie",
    question: "Quel fromage savoyard au lait de vache est l'ingrédient principal de la tartiflette ?",
    options: ["Le Reblochon", "Le Comté", "Le Beaufort", "La Tomme de Savoie"],
    correct_index: 0,
    explanation: "La recette de la tartiflette a été popularisée dans les années 1980 par le syndicat interprofessionnel du Reblochon pour relancer ses ventes !"
  },
  {
    difficulty: 1,
    theme: "Géographie",
    question: "Quelle est la capitale de l'Australie ?",
    options: ["Sydney", "Melbourne", "Canberra", "Perth"],
    correct_index: 2,
    explanation: "Fondée en 1913, Canberra a été choisie comme compromis entre les deux grandes métropoles rivales, Sydney et Melbourne."
  },
  {
    difficulty: 1,
    theme: "Histoire",
    question: "En quelle année l'équipe de France de football a-t-elle remporté sa toute première Coupe du monde ?",
    options: ["1994", "1998", "2000", "2002"],
    correct_index: 1,
    explanation: "Le 12 juillet 1998 au Stade de France, les Bleus d'Aimé Jacquet battent le Brésil 3-0 avec un doublé de Zinédine Zidane et un but d'Emmanuel Petit."
  },
  {
    difficulty: 1,
    theme: "Sciences",
    question: "Quelle planète du système solaire est surnommée la « planète rouge » ?",
    options: ["Vénus", "Jupiter", "Saturne", "Mars"],
    correct_index: 3,
    explanation: "Mars doit sa couleur rougeâtre à l'abondance d'oxyde de fer (de la rouille) présent à sa surface."
  },
  {
    difficulty: 1,
    theme: "Société",
    question: "Quel logiciel de messagerie instantanée permettait d'envoyer des « Wizz » pour faire vibrer l'écran de ses amis ?",
    options: ["MSN Messenger", "Skype", "AIM", "ICQ"],
    correct_index: 0,
    explanation: "Sorti en 1999, MSN Messenger a rythmé les soirées des ados des années 2000 avec ses statuts en paroles de chansons et ses fameux Wizz."
  },
  {
    difficulty: 1,
    theme: "Cinéma",
    question: "Dans « Le Roi Lion » de Disney, comment s'appelle le père de Simba ?",
    options: ["Scar", "Mufasa", "Rafiki", "Zazu"],
    correct_index: 1,
    explanation: "Doublé en version originale par James Earl Jones et en français par Jean Reno, Mufasa reste l'un des pères les plus marquants de l'histoire de Disney."
  },
  {
    difficulty: 1,
    theme: "Pop Culture 90/2000",
    question: "Comment s'appelait le petit animal virtuel japonais logé dans un œuf en plastique qu'il fallait nourrir pour ne pas qu'il meure ?",
    options: ["Furby", "Digimon", "Tamagotchi", "Polly Pocket"],
    correct_index: 2,
    explanation: "Lancé par Bandai en 1996, le Tamagotchi a déclenché une telle frénésie qu'il a été interdit dans de nombreuses cours de récréation."
  },
  {
    difficulty: 1,
    theme: "Musique",
    question: "Quelle chanteuse américaine est devenue une star mondiale en 1998 avec « ...Baby One More Time » ?",
    options: ["Christina Aguilera", "Avril Lavigne", "Pink", "Britney Spears"],
    correct_index: 3,
    explanation: "Britney Spears avait seulement 16 ans lors de l'enregistrement du titre, dont le clip tourné dans un lycée est devenu iconique."
  },
  {
    difficulty: 1,
    theme: "Séries TV",
    question: "Dans la série « Malcolm », comment s'appelle le père de famille interprété par Bryan Cranston ?",
    options: ["Hal", "Reese", "Francis", "Dewey"],
    correct_index: 0,
    explanation: "Bien avant d'incarner Walter White dans Breaking Bad, Bryan Cranston a marqué toute une génération dans le rôle du père fantasque Hal."
  },
  {
    difficulty: 1,
    theme: "Jeux Vidéo",
    question: "Dans « Mario Kart », quel objet réputé impitoyable traque et fait exploser le joueur situé en première position ?",
    options: ["La carapace rouge", "La carapace bleue à épines", "Le champignon doré", "La peau de banane"],
    correct_index: 1,
    explanation: "Apparue dans Mario Kart 64, la carapace bleue à épines a brisé d'innombrables amitiés à quelques mètres de la ligne d'arrivée."
  },
  {
    difficulty: 1,
    theme: "Gastronomie",
    question: "De quelle ville italienne la pizza Margherita est-elle originaire ?",
    options: ["Rome", "Milan", "Naples", "Florence"],
    correct_index: 2,
    explanation: "Elle a été créée à Naples en 1889 en l'honneur de la reine Marguerite de Savoie, avec les couleurs du drapeau italien : basilic, mozzarella et tomate."
  },
  {
    difficulty: 1,
    theme: "Géographie",
    question: "Quel océan sépare l'Europe du continent américain ?",
    options: ["L'océan Pacifique", "L'océan Indien", "L'océan Arctique", "L'océan Atlantique"],
    correct_index: 3,
    explanation: "Deuxième plus grand océan du monde après le Pacifique, l'Atlantique couvre environ un cinquième de la surface de la Terre."
  },
  {
    difficulty: 1,
    theme: "Histoire",
    question: "En quelle année les pièces et billets en euros ont-ils été mis en circulation en France ?",
    options: ["2002", "1999", "2000", "2004"],
    correct_index: 0,
    explanation: "Si l'euro existait sur les marchés financiers dès 1999, c'est le 1er janvier 2002 que les Français ont dit adieu au franc dans leur porte-monnaie."
  },
  {
    difficulty: 1,
    theme: "Sciences",
    question: "Quelle est la formule chimique de la molécule d'eau ?",
    options: ["CO2", "H2O", "O2", "NaCl"],
    correct_index: 1,
    explanation: "Une molécule d'eau est composée de deux atomes d'hydrogène reliés à un atome d'oxygène."
  },
  {
    difficulty: 1,
    theme: "Société",
    question: "Quelle marque de téléphonie finlandaise a commercialisé l'indestructible 3310 en l'an 2000 ?",
    options: ["Ericsson", "Motorola", "Nokia", "Alcatel"],
    correct_index: 2,
    explanation: "Écoulé à plus de 126 millions d'exemplaires, le Nokia 3310 est resté célèbre pour sa batterie inépuisable et son jeu Snake II."
  },
  {
    difficulty: 1,
    theme: "Pop Culture 90/2000",
    question: "Dans l'émission « C'est pas sorcier », qui conduisait le fameux camion blanc ?",
    options: ["Fred", "Jamy", "Sabine", "Marcel"],
    correct_index: 3,
    explanation: "« Allez, en route Marcel ! » Le chauffeur du Kenworth W900 n'apparaissait jamais à l'écran, ce qui a nourri le mythe pendant 20 ans."
  },
  {
    difficulty: 1,
    theme: "Cinéma",
    question: "Quel paquebot transatlantique fait naufrage dans le film aux 11 Oscars de James Cameron sorti en 1997 ?",
    options: ["Le Titanic", "Le Lusitania", "Le France", "Le Queen Mary"],
    correct_index: 0,
    explanation: "Sorti début 1998 en France, Titanic avec Leonardo DiCaprio et Kate Winslet a réuni plus de 20 millions de spectateurs dans les salles françaises."
  },
  {
    difficulty: 1,
    theme: "Séries TV",
    question: "Dans « Les Simpson », quelle est la boisson préférée d'Homer ?",
    options: ["Le Buzz Cola", "La bière Duff", "Le Flaming Moe", "Le Squishee"],
    correct_index: 1,
    explanation: "Homer boit sa bière Duff au bar de Moe à Springfield. Le nom a inspiré plusieurs brasseries réelles à travers le monde."
  },
  {
    difficulty: 1,
    theme: "Musique",
    question: "Quel duo français casqué a sorti le tube planétaire « One More Time » en l'an 2000 ?",
    options: ["Justice", "Air", "Daft Punk", "Cassius"],
    correct_index: 2,
    explanation: "Thomas Bangalter et Guy-Manuel de Homem-Christo ont marqué l'histoire de la French Touch avec l'album Discovery dont est issu ce titre."
  },
  {
    difficulty: 1,
    theme: "Jeux Vidéo",
    question: "Quel jeu PC créé par Will Wright en 2000 permet de créer une maison et de gérer la vie quotidienne d'êtres virtuels ?",
    options: ["RollerCoaster Tycoon", "Age of Empires", "Theme Hospital", "Les Sims"],
    correct_index: 3,
    explanation: "Qui n'a jamais retiré l'échelle de la piscine ou utilisé le code « rosebud » / « motherlode » pour devenir millionnaire dans Les Sims ?"
  },
  {
    difficulty: 1,
    theme: "Gastronomie",
    question: "Quel spiritueux à base de canne à sucre entre dans la composition du Mojito ?",
    options: ["Le rhum blanc", "La vodka", "La tequila", "Le gin"],
    correct_index: 0,
    explanation: "Né à Cuba, le Mojito associe rhum blanc, citron vert frais, feuilles de menthe, sucre de canne et eau gazeuse."
  },
  {
    difficulty: 1,
    theme: "Géographie",
    question: "Dans quelle ville européenne peut-on admirer le Colisée et la fontaine de Trevi ?",
    options: ["Athènes", "Rome", "Madrid", "Lisbonne"],
    correct_index: 1,
    explanation: "Chaque année, les touristes jettent plus d'un million d'euros en pièces de monnaie dans la fontaine de Trevi à Rome, reversés à des œuvres caritatives."
  },
  {
    difficulty: 1,
    theme: "Histoire",
    question: "Quel mur séparant une grande capitale européenne est tombé le 9 novembre 1989 ?",
    options: ["Le mur de Varsovie", "Le mur de Vienne", "Le mur de Berlin", "Le mur de Prague"],
    correct_index: 2,
    explanation: "Érigé en 1961, le mur de Berlin a divisé la ville pendant 28 ans avant que sa chute ne précipite la fin de la Guerre froide."
  },
  {
    difficulty: 1,
    theme: "Sciences",
    question: "Quel mammifère marin est le plus grand animal vivant sur Terre aujourd'hui ?",
    options: ["Le cachalot", "L'orque", "Le requin-baleine", "La baleine bleue"],
    correct_index: 3,
    explanation: "La baleine bleue peut atteindre 30 mètres de long et peser plus de 150 tonnes : sa langue à elle seule pèse autant qu'un éléphant !"
  },
  {
    difficulty: 1,
    theme: "Société",
    question: "Quel jeu de cartes à collectionner mettait en scène le « Dragon Blanc aux Yeux Bleus » et « Exodia l'Interdit » ?",
    options: ["Yu-Gi-Oh!", "Magic : L'Assemblée", "Duel Masters", "Beyblade"],
    correct_index: 0,
    explanation: "Créé par Kazuki Takahashi, Yu-Gi-Oh! a envahi les cours de récréation au début des années 2000 avec l'arrivée de l'anime en France."
  },

  // ============================================================================
  // DIFFICULTY 2 (30 questions) - Apéro Détendu +
  // ============================================================================
  {
    difficulty: 2,
    theme: "Cinéma",
    question: "Dans « Astérix et Obélix : Mission Cléopâtre », quel est le prénom de l'architecte joué par Édouard Baer ?",
    options: ["Numérobis", "Otis", "Amonbofis", "Caius Céplus"],
    correct_index: 1,
    explanation: "Otis, le scribe d'Numérobis, est l'auteur du monologue culte totalement improvisé par Édouard Baer : « Vous savez, moi je ne crois pas qu'il y ait de bonne ou de mauvaise situation... »"
  },
  {
    difficulty: 2,
    theme: "Séries TV",
    question: "Dans quelle ville californienne fictive se déroule la série « Buffy contre les vampires » ?",
    options: ["Smallville", "Capeside", "Sunnydale", "Tree Hill"],
    correct_index: 2,
    explanation: "Le lycée de Sunnydale est construit juste au-dessus de la « Bouche de l'Enfer », ce qui attire vampires et démons en tous genres."
  },
  {
    difficulty: 2,
    theme: "Musique",
    question: "Quelle jeune chanteuse française a chanté « Moi... Lolita » en l'an 2000, écrit par Mylène Farmer ?",
    options: ["Lorie", "Priscilla", "Jenifer", "Alizée"],
    correct_index: 3,
    explanation: "Repérée dans l'émission Graines de star, Alizée a connu un succès international phénoménal avec ce titre composé par Laurent Boutonnat."
  },
  {
    difficulty: 2,
    theme: "Pop Culture 90/2000",
    question: "Comment s'appellent les trois héroïnes du dessin animé français « Totally Spies! » ?",
    options: ["Sam, Clover et Alex", "Bloom, Stella et Flora", "Belle, Bulle et Rebelle", "Prue, Piper et Phoebe"],
    correct_index: 0,
    explanation: "Souvent pris pour un dessin animé américain, Totally Spies! est en réalité une création 100 % française du studio Marathon Media, diffusée dès 2001."
  },
  {
    difficulty: 2,
    theme: "Jeux Vidéo",
    question: "Dans les jeux Pokémon Rouge et Bleu, quel est le trio de Pokémon de départ proposé par le Professeur Chen ?",
    options: ["Germignon, Héricendre et Kaiminus", "Bulbizarre, Salamèche et Carapuce", "Arcko, Poussifeu et Gobou", "Tortipouss, Ouisticram et Tiplouf"],
    correct_index: 1,
    explanation: "Choisir entre Bulbizarre (Plante), Salamèche (Feu) et Carapuce (Eau) fut le premier grand dilemme moral des enfants nés dans les années 90."
  },
  {
    difficulty: 2,
    theme: "Gastronomie",
    question: "Quel biscuit rond fourré au chocolat de la marque LU affiche un petit prince coiffé d'une couronne ?",
    options: ["Le BN", "Le Choco", "Le Prince", "Le Pépito"],
    correct_index: 2,
    explanation: "Incontournable du goûter de 16h30, le biscuit Prince a été créé à Anvers à la fin du XIXe siècle avant de devenir le produit phare de LU."
  },
  {
    difficulty: 2,
    theme: "Géographie",
    question: "Quel fleuve traverse les capitales Vienne, Bratislava, Budapest et Belgrade ?",
    options: ["Le Rhin", "L'Elbe", "La Volga", "Le Danube"],
    correct_index: 3,
    explanation: "Long de près de 2 850 km, le Danube traverse dix pays européens et détient le record mondial du nombre de capitales traversées (quatre)."
  },
  {
    difficulty: 2,
    theme: "Histoire",
    question: "Quel président de la République française a effectué deux mandats consécutifs de 1995 à 2007 ?",
    options: ["Jacques Chirac", "François Mitterrand", "Nicolas Sarkozy", "Valéry Giscard d'Estaing"],
    correct_index: 0,
    explanation: "Jacques Chirac a fait un septennat (1995-2002) suivi du tout premier quinquennat (2002-2007) après le référendum de l'an 2000."
  },
  {
    difficulty: 2,
    theme: "Sciences",
    question: "Combien d'os compte le squelette d'un être humain adulte ?",
    options: ["156", "206", "256", "306"],
    correct_index: 1,
    explanation: "Un bébé naît avec environ 270 à 300 os, mais plusieurs d'entre eux fusionnent au cours de la croissance pour arriver à 206 à l'âge adulte."
  },
  {
    difficulty: 2,
    theme: "Société",
    question: "Quelle plateforme de blogs lancée par la radio Skyrock en 2002 permettait de poster des photos avec « Lâche tes coms » ?",
    options: ["MySpace", "Caramail", "Skyblog", "Copains d'avant"],
    correct_index: 2,
    explanation: "Véritable ancêtre d'Instagram en France, Skyblog a compté plus de 30 millions de blogs avant que ses archives ne soient confiées à la BnF en 2023."
  },
  {
    difficulty: 2,
    theme: "Cinéma",
    question: "Dans « Le Seigneur des Anneaux », combien de membres composent la Communauté de l'Anneau au départ de Fondcombe ?",
    options: ["7", "8", "10", "9"],
    correct_index: 3,
    explanation: "Neuf compagnons pour faire face aux neuf Nazgûl : quatre Hobbits (Frodon, Sam, Merry, Pippin), deux Hommes (Aragorn, Boromir), un Elfe (Legolas), un Nain (Gimli) et un Magicien (Gandalf)."
  },
  {
    difficulty: 2,
    theme: "Séries TV",
    question: "Quelle série française créée par Alexandre Astier en 2005 revisite avec humour la quête du Graal ?",
    options: ["Kaamelott", "Caméra Café", "Un gars, une fille", "H"],
    correct_index: 0,
    explanation: "Avec ses répliques cultes (« C'est pas faux », « Le gras, c'est la vie »), Kaamelott est devenue un pilier absolu de l'humour francophone."
  },
  {
    difficulty: 2,
    theme: "Musique",
    question: "Quel groupe de rap français a marqué l'année 1998 avec le titre épique « La Tribu de Dana » ?",
    options: ["IAM", "Manau", "Suprême NTM", "Sniper"],
    correct_index: 1,
    explanation: "En mêlant rap et mélodie celtique (« Tri Martolod » d'Alan Stivell), Manau a vendu plus de 1,7 million d'exemplaires de ce single."
  },
  {
    difficulty: 2,
    theme: "Pop Culture 90/2000",
    question: "Quelle émission de téléréalité présentée par Benjamin Castaldi sur M6 en 2001 a révélé Loana ?",
    options: ["Star Academy", "Koh-Lanta", "Loft Story", "Secret Story"],
    correct_index: 2,
    explanation: "Lancée le 26 avril 2001 sur M6, Loft Story fut la toute première émission de téléréalité d'enfermement en France, suivie par des millions de téléspectateurs."
  },
  {
    difficulty: 2,
    theme: "Jeux Vidéo",
    question: "Quelle console portable de Nintendo dotée de deux écrans, dont un tactile avec stylet, est sortie en Europe en mars 2005 ?",
    options: ["Game Boy Advance", "Game Boy Color", "PSP", "Nintendo DS"],
    correct_index: 3,
    explanation: "Avec plus de 154 millions d'unités vendues, la Nintendo DS (pour Dual Screen) et ses jeux comme Nintendogs ou Mario Kart DS reste la console portable la plus vendue de l'histoire."
  },
  {
    difficulty: 2,
    theme: "Gastronomie",
    question: "Quel est l'ingrédient de base traditionnellement utilisé pour préparer du houmous ?",
    options: ["Le pois chiche", "La lentille corail", "L'aubergine grillée", "Le haricot blanc"],
    correct_index: 0,
    explanation: "En arabe, le mot « houmous » signifie tout simplement « pois chiche ». On le mixe avec du tahini (crème de sésame), de l'ail, du citron et de l'huile d'olive."
  },
  {
    difficulty: 2,
    theme: "Géographie",
    question: "Dans quel pays se situe la cité inca du Machu Picchu ?",
    options: ["La Bolivie", "Le Pérou", "Le Chili", "La Colombie"],
    correct_index: 1,
    explanation: "Perchée à 2 430 mètres d'altitude dans la cordillère des Andes péruviennes, cette cité du XVe siècle a été rendue célèbre mondialement par Hiram Bingham en 1911."
  },
  {
    difficulty: 2,
    theme: "Histoire",
    question: "Quel pharaon égyptien est devenu célèbre grâce à la découverte de son tombeau quasi intact en 1922 ?",
    options: ["Ramsès II", "Khéops", "Toutânkhamon", "Akhenaton"],
    correct_index: 2,
    explanation: "Découvert par l'archéologue britannique Howard Carter dans la Vallée des Rois, son masque funéraire en or massif pesait plus de 10 kilos."
  },
  {
    difficulty: 2,
    theme: "Sciences",
    question: "Quel gaz représente environ 78 % de l'air que nous respirons sur Terre ?",
    options: ["Le dioxygène", "Le dioxyde de carbone", "L'hydrogène", "Le diazote"],
    correct_index: 3,
    explanation: "Contrairement à une idée reçue, l'air atmosphérique est composé à 78 % de diazote (N2) et seulement à 21 % de dioxygène (O2)."
  },
  {
    difficulty: 2,
    theme: "Société",
    question: "Comment s'appelaient les petites rondelles de carton illustrées avec lesquelles on jouait à la récré en les retournant avec un « Kini » ?",
    options: ["Les Pogs", "Les Jojo's", "Les Gogos", "Les Billes"],
    correct_index: 0,
    explanation: "Inspirés des capsules de bouteilles de jus de fruits d'Hawaï (Passion Orange Guava = POG), les Pogs ont créé un véritable marché noir dans les écoles vers 1995."
  },
  {
    difficulty: 2,
    theme: "Cinéma",
    question: "Dans « Matrix » (1999), de quelle couleur est la pilule que Neo choisit d'avaler pour découvrir la vérité ?",
    options: ["Bleue", "Rouge", "Verte", "Jaune"],
    correct_index: 1,
    explanation: "Morpheus lui tend deux pilules : la bleue pour tout oublier et reprendre sa vie normale, ou la rouge pour voir « jusqu'où va le terrier du lapin blanc »."
  },
  {
    difficulty: 2,
    theme: "Séries TV",
    question: "Comment s'appelle la rue résidentielle où vivent Bree, Gabrielle, Lynette et Susan dans « Desperate Housewives » ?",
    options: ["Melrose Place", "Evergreen Terrace", "Wisteria Lane", "Sunset Boulevard"],
    correct_index: 2,
    explanation: "Le décor de Wisteria Lane, situé dans la ville fictive de Fairview, se trouve en réalité dans les studios Universal à Hollywood."
  },
  {
    difficulty: 2,
    theme: "Musique",
    question: "Quel groupe de rock alternatif américain a sorti l'album « Hybrid Theory » en 2000 avec les titres « In the End » et « Crawling » ?",
    options: ["Green Day", "Blink-182", "Evanescence", "Linkin Park"],
    correct_index: 3,
    explanation: "Mené par Chester Bennington et Mike Shinoda, Linkin Park a signé avec Hybrid Theory l'album rock le plus vendu du XXIe siècle (plus de 30 millions d'exemplaires)."
  },
  {
    difficulty: 2,
    theme: "Pop Culture 90/2000",
    question: "Sur quelle chaîne de télévision l'émission jeunesse « KD2A » (Carrément Déjanté, Doublement Animé) était-elle diffusée ?",
    options: ["France 2", "TF1", "France 3", "M6"],
    correct_index: 0,
    explanation: "Diffusée sur France 2 de 2001 à 2009 le mercredi et le samedi matin, KD2A diffusait notamment Code Lyoko, Sabrina l'apprentie sorcière ou Lizzie McGuire."
  },
  {
    difficulty: 2,
    theme: "Jeux Vidéo",
    question: "Quelle célèbre aventurière de jeu vidéo vit dans un manoir où l'on pouvait enfermer son majordome dans la chambre froide ?",
    options: ["Samus Aran", "Lara Croft", "Jill Valentine", "Zelda"],
    correct_index: 1,
    explanation: "Dans Tomb Raider II (1997) et III (1998), presque tous les joueurs ont un jour enfermé le pauvre majordome Winston et son plateau à thé qui tremblait dans le frigo du manoir !"
  },
  {
    difficulty: 2,
    theme: "Gastronomie",
    question: "Dans quelle région française produit-on le cidre, le calvados et le camembert ?",
    options: ["La Bretagne", "Les Hauts-de-France", "La Normandie", "Les Pays de la Loire"],
    correct_index: 2,
    explanation: "Ce sont les trois grands emblèmes gastronomiques normands. Le village de Camembert se situe d'ailleurs dans le département de l'Orne."
  },
  {
    difficulty: 2,
    theme: "Géographie",
    question: "Quelle est la capitale du Canada ?",
    options: ["Toronto", "Montréal", "Vancouver", "Ottawa"],
    correct_index: 3,
    explanation: "Choisie par la reine Victoria en 1857, Ottawa est située dans la province de l'Ontario, juste à la frontière avec le Québec."
  },
  {
    difficulty: 2,
    theme: "Histoire",
    question: "Qui a peint « La Joconde » au début du XVIe siècle ?",
    options: ["Léonard de Vinci", "Michel-Ange", "Raphaël", "Sandro Botticelli"],
    correct_index: 0,
    explanation: "Léonard de Vinci a emporté le portrait de Mona Lisa dans ses bagages lorsqu'il s'est installé en France à l'invitation du roi François Ier en 1516."
  },
  {
    difficulty: 2,
    theme: "Sciences",
    question: "Quel organe du corps humain produit l'insuline pour réguler le taux de sucre dans le sang ?",
    options: ["Le foie", "Le pancréas", "La rate", "Les reins"],
    correct_index: 1,
    explanation: "Le pancréas joue un double rôle : il produit des enzymes digestives et sécrète des hormones comme l'insuline et le glucagon."
  },
  {
    difficulty: 2,
    theme: "Société",
    question: "Comment s'appelait l'encyclopédie multimédia sur CD-ROM commercialisée par Microsoft dans les années 1990 et 2000 ?",
    options: ["Universalis Junior", "Wikipédia CD", "Encarta", "Hachette Multimédia"],
    correct_index: 2,
    explanation: "Avant la généralisation d'Internet haut débit et de Wikipédia, Encarta (et son quiz MindMaze dans un château !) a sauvé tous nos exposés de collège."
  },

  // ============================================================================
  // DIFFICULTY 3 (30 questions) - Facile +
  // ============================================================================
  {
    difficulty: 3,
    theme: "Cinéma",
    question: "Dans « La Cité de la peur » des Nuls, quelle danse Odile Deray et Simon Jérémi exécutent-ils à Cannes ?",
    options: ["La Macarena", "Le Mia", "La Lambada", "La Carioca"],
    correct_index: 3,
    explanation: "Chantée par Alain Chabat et Gérard Darmon en claquettes, « La Carioca » est inspirée d'un numéro musical de Fred Astaire et Ginger Rogers de 1933."
  },
  {
    difficulty: 3,
    theme: "Séries TV",
    question: "Comment s'appelle le démon incarné par Julian McMahon dont Phoebe tombe amoureuse dans « Charmed » ?",
    options: ["Cole Turner (Balthazar)", "Leo Wyatt", "Angel", "Spike"],
    correct_index: 0,
    explanation: "Mi-humain mi-démon, le procureur Cole Turner (alias Balthazar) a formé avec Phoebe Halliwell l'un des couples les plus tourmentés des séries des années 2000."
  },
  {
    difficulty: 3,
    theme: "Musique",
    question: "Qui a remporté la toute première saison de la « Star Academy » sur TF1 en janvier 2002 ?",
    options: ["Nolwenn Leroy", "Jenifer", "Élodie Frégé", "Olivia Ruiz"],
    correct_index: 1,
    explanation: "À seulement 19 ans, Jenifer Bartoli s'est imposée face à Mario Barravecchia devant près de 12 millions de téléspectateurs."
  },
  {
    difficulty: 3,
    theme: "Pop Culture 90/2000",
    question: "Quel est le nom du superordinateur que Jérémi, Yumi, Ulrich, Odd et Aelita combattent dans « Code Lyoko » ?",
    options: ["HAL 9000", "Skynet", "X.A.N.A.", "GLaDOS"],
    correct_index: 2,
    explanation: "Dans cette série française culte diffusée dès 2003, les collégiens de Kadic plongent dans le monde virtuel de Lyoko pour désactiver les tours activées par X.A.N.A."
  },
  {
    difficulty: 3,
    theme: "Jeux Vidéo",
    question: "Dans « Age of Empires II », quel cri bizarre poussent les prêtres (moines) pour convertir les unités ennemies ?",
    options: ["Aléa jacta est", "Hallelujah", "Abracadabra", "Wololo"],
    correct_index: 3,
    explanation: "Bien que le cri « Wololo » vienne du premier Age of Empires (1997), il a été conservé comme provocation audio (taunt n°30) dans Age of Empires II et est devenu un mème légendaire."
  },
  {
    difficulty: 3,
    theme: "Gastronomie",
    question: "Quel apéritif italien de couleur orange vif est l'ingrédient principal de l'Aperol Spritz avec le Prosecco ?",
    options: ["L'Aperol", "Le Campari", "Le Limoncello", "L'Amaretto"],
    correct_index: 0,
    explanation: "Créé à Padoue en 1919 à base d'oranges amères, de rhubarbe et de gentiane, l'Aperol (11°) est moins amer et moitié moins alcoolisé que le Campari."
  },
  {
    difficulty: 3,
    theme: "Géographie",
    question: "Quel détroit sépare l'Espagne du Maroc et relie l'océan Atlantique à la mer Méditerranée ?",
    options: ["Le détroit du Bosphore", "Le détroit de Gibraltar", "Le détroit de Messine", "Le détroit d'Ormuz"],
    correct_index: 1,
    explanation: "Dans sa partie la plus étroite, le détroit de Gibraltar ne mesure qu'environ 14 kilomètres de large entre l'Europe et l'Afrique."
  },
  {
    difficulty: 3,
    theme: "Histoire",
    question: "Quelle catastrophe industrielle s'est produite à Toulouse le 21 septembre 2001 ?",
    options: ["Le naufrage de l'Erika", "L'incendie du tunnel du Mont-Blanc", "L'explosion de l'usine AZF", "La catastrophe de Furiani"],
    correct_index: 2,
    explanation: "Un stock d'environ 300 tonnes de nitrate d'ammonium a explosé dans l'usine chimique AZF, provoquant une déflagration entendue jusqu'à 80 kilomètres à la ronde."
  },
  {
    difficulty: 3,
    theme: "Sciences",
    question: "Quelle planète du système solaire possède le plus grand nombre de lunes connues ?",
    options: ["Mars", "Vénus", "Mercure", "Saturne"],
    correct_index: 3,
    explanation: "Avec plus de 140 lunes confirmées par l'Union astronomique internationale (dont Titan et Encelade), Saturne devance même Jupiter !"
  },
  {
    difficulty: 3,
    theme: "Société",
    question: "Quel logiciel de partage de fichiers en peer-to-peer (P2P) arborait une tête d'âne ou de mule comme icône ?",
    options: ["eMule", "Kazaa", "LimeWire", "Napster"],
    correct_index: 0,
    explanation: "Lancé en 2002, eMule a fait connaître à toute une génération l'attente interminable de téléchargement… et les mauvaises surprises en ouvrant enfin le fichier vidéo."
  },
  {
    difficulty: 3,
    theme: "Cinéma",
    question: "Dans « Shrek » (2001), quel acteur français prête sa voix à l'Âne dans la version française ?",
    options: ["Jamel Debbouze", "Med Hondo", "Élie Semoun", "Omar Sy"],
    correct_index: 1,
    explanation: "Med Hondo était également la voix française officielle d'Eddie Murphy (qui doublait l'Âne en VO), mais aussi de Morgan Freeman et de Rafiki dans Le Roi Lion !"
  },
  {
    difficulty: 3,
    theme: "Séries TV",
    question: "Quel numéro de vol de la compagnie Oceanic Airlines s'écrase sur l'île mystérieuse au début de la série « Lost » ?",
    options: ["Vol 747", "Vol 180", "Vol 815", "Vol 404"],
    correct_index: 2,
    explanation: "Le vol Oceanic 815 reliait Sydney à Los Angeles. Les chiffres 8 et 15 font d'ailleurs partie de la fameuse suite maudite de la série : 4, 8, 15, 16, 23, 42."
  },
  {
    difficulty: 3,
    theme: "Musique",
    question: "Quel groupe français chantait « Tu m'oublieras » en 1999, devenu un classique absolu des fins de soirée ?",
    options: ["Zebda", "Louise Attaque", "Mano Negra", "Larusso"],
    correct_index: 3,
    explanation: "Petite subtilité : ce n'est pas un groupe mais la chanteuse Larusso ! Ce tube de 1999 est une adaptation française de « You Will Forget » d'Irma Jackson (1979), déjà reprise par Régine en 1980."
  },
  {
    difficulty: 3,
    theme: "Pop Culture 90/2000",
    question: "Dans l'émission « Fort Boyard », comment s'appelait le personnage muet qui guidait les candidats de cellule en cellule avec ses clés ?",
    options: ["Passe-Partout", "La Boule", "Le Père Fouras", "Félindra"],
    correct_index: 0,
    explanation: "Incarné par André Bouchet depuis le tout premier épisode en 1990, Passe-Partout détient le record de longévité dans l'émission."
  },
  {
    difficulty: 3,
    theme: "Jeux Vidéo",
    question: "Dans « Grand Theft Auto: San Andreas » (2004), quel est le nom du héros que l'on incarne ?",
    options: ["Tommy Vercetti", "Carl « CJ » Johnson", "Niko Bellic", "Trevor Philips"],
    correct_index: 1,
    explanation: "De retour dans son quartier de Grove Street à Los Santos après la mort de sa mère, CJ est resté célèbre pour la phrase « Ah shit, here we go again »."
  },
  {
    difficulty: 3,
    theme: "Gastronomie",
    question: "Quel plat traditionnel du Sud-Ouest mijote longuement avec des haricots blancs, de la saucisse de Toulouse et du confit de canard ?",
    options: ["La garbure", "Le bœuf bourguignon", "Le cassoulet", "La choucroute"],
    correct_index: 2,
    explanation: "Castelnaudary, Carcassonne et Toulouse se disputent depuis des siècles la paternité et la « vraie » recette du cassoulet !"
  },
  {
    difficulty: 3,
    theme: "Géographie",
    question: "Quel pays d'Amérique du Sud est le seul dont la langue officielle est le portugais ?",
    options: ["L'Argentine", "La Colombie", "Le Venezuela", "Le Brésil"],
    correct_index: 3,
    explanation: "Suite au traité de Tordesillas signé en 1494 entre l'Espagne et le Portugal, la partie orientale de l'Amérique du Sud est revenue à la couronne portugaise."
  },
  {
    difficulty: 3,
    theme: "Histoire",
    question: "Quel roi de France était surnommé le « Roi-Soleil » ?",
    options: ["Louis XIV", "François Ier", "Henri IV", "Louis XVI"],
    correct_index: 0,
    explanation: "Avec plus de 72 ans de règne (1643-1715), Louis XIV détient le record du plus long règne de l'histoire de France et d'Europe pour un monarque souverain."
  },
  {
    difficulty: 3,
    theme: "Sciences",
    question: "Quelle unité mesure l'intensité d'un courant électrique ?",
    options: ["Le volt", "L'ampère", "Le watt", "L'ohm"],
    correct_index: 1,
    explanation: "Nommée en l'honneur du physicien français André-Marie Ampère, elle mesure le débit d'électrons dans un circuit, tandis que le volt mesure la tension."
  },
  {
    difficulty: 3,
    theme: "Société",
    question: "Quel lecteur MP3 lancé par Apple en octobre 2001 promettait de mettre « 1 000 chansons dans votre poche » ?",
    options: ["Le Walkman", "Le Zune", "L'iPod", "L'iPhone"],
    correct_index: 2,
    explanation: "Avec sa molette cliquable et ses écouteurs blancs immédiatement reconnaissables, l'iPod a révolutionné l'industrie musicale et sauvé Apple."
  },
  {
    difficulty: 3,
    theme: "Cinéma",
    question: "Dans « Le Fabuleux Destin d'Amélie Poulain » (2001), dans quel quartier parisien Amélie travaille-t-elle comme serveuse ?",
    options: ["Le Marais", "Saint-Germain-des-Prés", "Le Quartier Latin", "Montmartre"],
    correct_index: 3,
    explanation: "Amélie travaille au Café des 2 Moulins, situé rue Lepic à Montmartre, un vrai bistrot parisien devenu un lieu de pèlerinage pour les cinéphiles du monde entier."
  },
  {
    difficulty: 3,
    theme: "Séries TV",
    question: "Dans « Prison Break », où Michael Scofield s'est-il fait cacher les plans de la prison de Fox River ?",
    options: ["Dans un tatouage sur tout le torse", "Dans la semelle de ses chaussures", "Dans une bible creusée", "Sur une clé USB avalée"],
    correct_index: 0,
    explanation: "Ingénieur en génie civil ayant participé à la rénovation de la prison, Michael Scofield a dissimulé les plans dans une immense fresque gothique tatouée sur le haut de son corps."
  },
  {
    difficulty: 3,
    theme: "Musique",
    question: "Quel groupe de rock français mené par Gaëtan Roussel a sorti son premier album éponyme en 1997 avec « J't'emmène au vent » ?",
    options: ["Noir Désir", "Louise Attaque", "Matmatah", "Kyo"],
    correct_index: 1,
    explanation: "Avec son violon folk-rock survitaminé et ses 2,8 millions d'exemplaires vendus, le premier album de Louise Attaque reste le disque de rock français le plus vendu de l'histoire."
  },
  {
    difficulty: 3,
    theme: "Pop Culture 90/2000",
    question: "Quel duo d'humoristes animait le « Burger Quiz » ou les fausses publicités des « Robins des Bois » et « Kad et Olivier » ? Qui chantait « Kamoulox » ?",
    options: ["Éric et Ramzy", "Omar et Fred", "Kad et Olivier", "Chevalier et Laspalès"],
    correct_index: 2,
    explanation: "Kad Merad et Olivier Baroux ont inventé le mythique jeu absurde du « Kamoulox » sur la radio Ouï FM puis sur la chaîne Comédie !"
  },
  {
    difficulty: 3,
    theme: "Jeux Vidéo",
    question: "Dans « The Legend of Zelda », comment s'appelle le jeune héros vêtu d'une tunique verte que le joueur contrôle ?",
    options: ["Zelda", "Ganondorf", "Tingle", "Link"],
    correct_index: 3,
    explanation: "Classique piège : Zelda est le nom de la princesse d'Hyrule, tandis que le héros à l'épée et au bouclier s'appelle Link !"
  },
  {
    difficulty: 3,
    theme: "Gastronomie",
    question: "Quel dessert italien dont le nom signifie littéralement « tire-moi vers le haut » (ou « remonte-moi le moral ») est parfumé au café ?",
    options: ["Le tiramisu", "La panna cotta", "Le cannolo", "Le sabayon"],
    correct_index: 0,
    explanation: "À base de mascarpone, d'œufs, de biscuits cuillère (savoiardi) imbibés de café et de cacao, le tiramisu vient de la région de Trévise en Vénétie."
  },
  {
    difficulty: 3,
    theme: "Géographie",
    question: "Combien d'étoiles figurent sur le drapeau de l'Union européenne ?",
    options: ["10", "12", "15", "27"],
    correct_index: 1,
    explanation: "Le nombre de 12 étoiles dorées en cercle est fixe et ne dépend pas du nombre d'États membres : le chiffre 12 est un symbole traditionnel de perfection et d'unité."
  },
  {
    difficulty: 3,
    theme: "Histoire",
    question: "En quelle année l'homme a-t-il marché sur la Lune pour la première fois lors de la mission Apollo 11 ?",
    options: ["1965", "1967", "1969", "1972"],
    correct_index: 2,
    explanation: "Dans la nuit du 20 au 21 juillet 1969, Neil Armstrong pose le pied sur la Lune suivi de Buzz Aldrin, tandis que Michael Collins reste en orbite."
  },
  {
    difficulty: 3,
    theme: "Sciences",
    question: "À quelle vitesse approximative la lumière se déplace-t-elle dans le vide ?",
    options: ["3 000 km/s", "30 000 km/s", "150 000 km/s", "300 000 km/s"],
    correct_index: 3,
    explanation: "Plus exactement 299 792 458 mètres par seconde : à cette vitesse, la lumière met environ 8 minutes et 20 secondes pour nous parvenir depuis le Soleil."
  },
  {
    difficulty: 3,
    theme: "Société",
    question: "Quel forfait téléphonique des années 2000 destiné aux collégiens et lycéens proposait des « SMS illimités dès 17h » avec une pub mettant en scène une boule rose ?",
    options: ["M6 Mobile / Orange Zap", "SFR La Carte", "Bouygues Nomad", "Free Mobile"],
    correct_index: 0,
    explanation: "Les forfaits bloqués Zap d'Orange, M6 Mobile ou Universal Mobile obligeaient toute une génération à attendre 17h00 ou 20h00 pile pour bombarder ses amis de SMS !"
  },

  // ============================================================================
  // DIFFICULTY 4 (30 questions) - Intermédiaire doux
  // ============================================================================
  {
    difficulty: 4,
    theme: "Cinéma",
    question: "Dans « Le Cinquième Élément » de Luc Besson (1997), quel est le métier exercé par Korben Dallas (Bruce Willis) ?",
    options: ["Policier spatial", "Chauffeur de taxi", "Contrebandier", "Garde du corps"],
    correct_index: 1,
    explanation: "Ancien major des forces spéciales, Korben Dallas conduit un taxi volant jaune à New York en 2263 lorsque Leeloo (Milla Jovovich) tombe littéralement sur le toit de son véhicule."
  },
  {
    difficulty: 4,
    theme: "Séries TV",
    question: "Dans « How I Met Your Mother », quel objet de couleur jaune permet à Ted Mosby de rencontrer enfin la mère de ses enfants ?",
    options: ["Un cor français", "Un ananas", "Un parapluie", "Une paire de bottes"],
    correct_index: 2,
    explanation: "Le parapluie jaune de Tracy McConnell traverse plusieurs saisons de la série, tandis que le cor français bleu était le symbole de son histoire avec Robin."
  },
  {
    difficulty: 4,
    theme: "Musique",
    question: "Quel groupe de pop-rock français dirigé par Benoît Poher a connu un immense succès en 2003 avec l'album « Le Chemin » ?",
    options: ["Superbus", "BB Brunes", "Indochine", "Kyo"],
    correct_index: 3,
    explanation: "Avec les tubes « Le Chemin » (en duo avec Sita), « Dernière Danse » et « Je cours », Kyo a rythmé toutes les boums et tous les lecteurs MP3 de 2003-2004."
  },
  {
    difficulty: 4,
    theme: "Pop Culture 90/2000",
    question: "Dans le manga et l'anime « Dragon Ball Z », quel personnage élimine finalement le monstre Cell lors du Cell Game ?",
    options: ["Son Gohan", "Son Goku", "Vegeta", "Trunks du futur"],
    correct_index: 0,
    explanation: "Après le sacrifice de Son Goku, c'est son fils Son Gohan, premier à atteindre le stade de Super Saiyan 2, qui terrasse Cell avec un Kaméhaméha Père-Fils mémorable."
  },
  {
    difficulty: 4,
    theme: "Jeux Vidéo",
    question: "Quel jeu de tir à la première personne (FPS), né en 1999 comme un simple mod de « Half-Life », oppose terroristes et antiterroristes ?",
    options: ["Quake III Arena", "Counter-Strike", "Unreal Tournament", "Call of Duty"],
    correct_index: 1,
    explanation: "Créé par deux étudiants, Minh Le et Jess Cliffe, Counter-Strike (version 1.5 et 1.6) a fait les beaux jours des cybercafés et des LAN-parties des années 2000 sur la carte de_dust2."
  },
  {
    difficulty: 4,
    theme: "Gastronomie",
    question: "Quel cépage blanc est l'unique cépage autorisé pour produire le vin de Chablis ?",
    options: ["Le Sauvignon blanc", "Le Riesling", "Le Chardonnay", "Le Viognier"],
    correct_index: 2,
    explanation: "Bien que situé dans l'Yonne, le vignoble de Chablis fait partie de la Bourgogne viticole et produit des vins blancs secs exclusivement à partir du cépage Chardonnay."
  },
  {
    difficulty: 4,
    theme: "Géographie",
    question: "Dans quel pays européen se trouve la région historique de la Transylvanie ?",
    options: ["La Hongrie", "La Bulgarie", "La Serbie", "La Roumanie"],
    correct_index: 3,
    explanation: "Située au centre de la Roumanie et entourée par la chaîne des Carpates, la Transylvanie est célèbre pour ses châteaux médiévaux et le mythe de Dracula."
  },
  {
    difficulty: 4,
    theme: "Histoire",
    question: "Quel traité signé en février 1992 aux Pays-Bas a donné naissance à l'Union européenne et préparé la monnaie unique ?",
    options: ["Le traité de Maastricht", "Le traité de Rome", "Le traité de Schengen", "Le traité de Lisbonne"],
    correct_index: 0,
    explanation: "Ratifié de justesse par référendum en France en septembre 1992 (51,04 % de « oui »), le traité de Maastricht a transformé la CEE en Union européenne."
  },
  {
    difficulty: 4,
    theme: "Sciences",
    question: "Quel scientifique britannique a formulé la théorie de l'évolution par la sélection naturelle dans « L'Origine des espèces » (1859) ?",
    options: ["Isaac Newton", "Charles Darwin", "Louis Pasteur", "Gregor Mendel"],
    correct_index: 1,
    explanation: "Son voyage de cinq ans à bord du navire HMS Beagle, notamment aux îles Galápagos où il observa les pinsons, fut décisif pour ses travaux."
  },
  {
    difficulty: 4,
    theme: "Société",
    question: "Quelle marque de sacs à dos en toile ultra-résistante, garantie 30 ans, équipait la quasi-totalité des collégiens et lycéens dans les années 2000 ?",
    options: ["Lafuma", "Herschel", "Eastpak", "Fjällräven"],
    correct_index: 2,
    explanation: "Le modèle « Padded Pak'r » d'Eastpak était systématiquement personnalisé au Blanco, au marqueur Posca ou avec des patchs de groupes de rock."
  },
  {
    difficulty: 4,
    theme: "Cinéma",
    question: "Quel réalisateur américain a signé à la fois « Jurassic Park », « La Liste de Schindler » et « Il faut sauver le soldat Ryan » dans les années 1990 ?",
    options: ["James Cameron", "George Lucas", "Robert Zemeckis", "Steven Spielberg"],
    correct_index: 3,
    explanation: "Fait incroyable : Steven Spielberg a sorti Jurassic Park et La Liste de Schindler la même année, en 1993, supervisant le montage du premier depuis la Pologne où il tournait le second !"
  },
  {
    difficulty: 4,
    theme: "Séries TV",
    question: "Dans « Un dos tres » (Un paso adelante), dans quelle ville espagnole se trouve l'école des arts de la scène de Carmen Arranz ?",
    options: ["Madrid", "Barcelone", "Séville", "Valence"],
    correct_index: 0,
    explanation: "Diffusée en boucle sur M6 dès 2004, la série espagnole suivait Lola, Pedro, Roberto, Ingrid et Silvia à Madrid."
  },
  {
    difficulty: 4,
    theme: "Musique",
    question: "Quel rappeur américain joue son propre rôle (Jimmy « B-Rabbit » Smith) dans le film « 8 Mile » sorti en 2002 ?",
    options: ["50 Cent", "Eminem", "Snoop Dogg", "Dr. Dre"],
    correct_index: 1,
    explanation: "La chanson du film, « Lose Yourself », a valu à Eminem l'Oscar de la meilleure chanson originale en 2003 — la toute première fois qu'un titre de rap remportait cette récompense."
  },
  {
    difficulty: 4,
    theme: "Pop Culture 90/2000",
    question: "Dans le jeu télévisé « Qui veut gagner des millions ? » présenté par Jean-Pierre Foucault, comment s'appelait le joker permettant d'interroger un proche par téléphone ?",
    options: ["L'appel au public", "Le coup de fil en or", "L'appel à un ami", "La ligne de secours"],
    correct_index: 2,
    explanation: "Avec le 50:50 et l'avis du public, « l'appel à un ami » (limité à 30 secondes chrono) faisait partie des trois jokers historiques de l'émission lancée en 2000."
  },
  {
    difficulty: 4,
    theme: "Jeux Vidéo",
    question: "Dans « Pokémon Or et Argent » (2e génération), quel Pokémon légendaire de type Feu et Vol figure sur la jaquette de la version Or ?",
    options: ["Lugia", "Sulfura", "Entei", "Ho-Oh"],
    correct_index: 3,
    explanation: "Fait amusant : Ho-Oh est apparu dès le tout premier épisode du dessin animé Pokémon en 1997, plus de deux ans avant la sortie des versions Or et Argent !"
  },
  {
    difficulty: 4,
    theme: "Gastronomie",
    question: "Quelle épice très coûteuse, surnommée « l'or rouge », provient des stigmates séchés d'une fleur de crocus ?",
    options: ["Le safran", "Le curcuma", "Le paprika", "La cardamome"],
    correct_index: 0,
    explanation: "Il faut récolter à la main environ 150 000 fleurs de Crocus sativus pour obtenir un seul kilogramme de safran sec, indispensable à la paella ou à la bouillabaisse."
  },
  {
    difficulty: 4,
    theme: "Géographie",
    question: "Quelle est la plus grande île de la mer Méditerranée ?",
    options: ["La Sardaigne", "La Sicile", "Chypre", "La Corse"],
    correct_index: 1,
    explanation: "Avec près de 25 700 km², la Sicile devance de peu la Sardaigne (24 000 km²), suivie par Chypre, la Corse et la Crète."
  },
  {
    difficulty: 4,
    theme: "Histoire",
    question: "Quelle femme politique et magistrate française a porté la loi légalisant l'interruption volontaire de grossesse (IVG) en 1974 ?",
    options: ["Édith Cresson", "Françoise Giroud", "Simone Veil", "Yvette Roudy"],
    correct_index: 2,
    explanation: "Alors ministre de la Santé sous la présidence de Valéry Giscard d'Estaing, Simone Veil a prononcé un discours historique à l'Assemblée nationale le 26 novembre 1974."
  },
  {
    difficulty: 4,
    theme: "Sciences",
    question: "Quel élément chimique porte le symbole « Au » dans le tableau périodique de Mendeleïev ?",
    options: ["L'argent", "L'aluminium", "L'argon", "L'or"],
    correct_index: 3,
    explanation: "Le symbole « Au » vient du mot latin « aurum » qui signifie « or » (alors que l'argent a pour symbole « Ag », du latin « argentum »)."
  },
  {
    difficulty: 4,
    theme: "Société",
    question: "En quelle année le réseau social Facebook, d'abord réservé aux étudiants américains, a-t-il été fondé par Mark Zuckerberg ?",
    options: ["2004", "2002", "2006", "2008"],
    correct_index: 0,
    explanation: "Lancé sous le nom « TheFacebook » depuis une chambre de l'université Harvard en février 2004, il s'est ouvert au grand public en septembre 2006 avant de conquérir la France en 2007-2008."
  },
  {
    difficulty: 4,
    theme: "Cinéma",
    question: "Dans « Gladiator » de Ridley Scott (2000), quel empereur romain jaloux fait massacrer la famille du général Maximus ?",
    options: ["Néron", "Commode", "Caligula", "Marc Aurèle"],
    correct_index: 1,
    explanation: "Incarné par Joaquin Phoenix, Commode assassine son propre père Marc Aurèle et condamne à mort Maximus (Russell Crowe), qui devient gladiateur pour se venger."
  },
  {
    difficulty: 4,
    theme: "Séries TV",
    question: "Dans « Les Frères Scott » (One Tree Hill), quel sport pratiquent Lucas et Nathan Scott au lycée ?",
    options: ["Le football américain", "Le baseball", "Le basket-ball", "La natation"],
    correct_index: 2,
    explanation: "Les deux demi-frères ennemis puis complices portent le maillot des « Ravens » de Tree Hill sur les terrains de basket de Caroline du Nord."
  },
  {
    difficulty: 4,
    theme: "Musique",
    question: "Quelle chanson du groupe moldave O-Zone est devenue le tube de l'été 2004 avec son refrain « Numa Numa Yei » ?",
    options: ["Chihuahua", "Aserejé", "Bomba", "Dragostea Din Tei"],
    correct_index: 3,
    explanation: "Chantée en roumain (« L'amour sous les tilleuls »), la chanson est restée numéro 1 du Top 50 en France pendant 15 semaines consécutives à l'été 2004 !"
  },
  {
    difficulty: 4,
    theme: "Pop Culture 90/2000",
    question: "Comment s'appelait la série de petits livres à succès écrits par R. L. Stine qui faisait frissonner les enfants dans les années 90 ?",
    options: ["Chair de poule", "Fais-moi peur !", "Les Contes de la crypte", "Grand Galop"],
    correct_index: 0,
    explanation: "Avec leurs couvertures illustrées en relief (La Nuit des pantins, Le Masque hanté...), les romans Chair de poule (Goosebumps) se sont vendus à plus de 400 millions d'exemplaires."
  },
  {
    difficulty: 4,
    theme: "Jeux Vidéo",
    question: "Dans « Crash Bandicoot », quel masque vaudou flottant protège Crash lorsqu'il brise sa caisse ?",
    options: ["Uka Uka", "Aku Aku", "Cortex", "Zuma"],
    correct_index: 1,
    explanation: "Son cri ressemblant à « Ooga Booga » (ou « Boulbaga » selon les souvenirs d'enfance !) offrait une invincibilité temporaire quand on en récoltait trois."
  },
  {
    difficulty: 4,
    theme: "Gastronomie",
    question: "Quelle pâte à tartiner aux noisettes a été créée par le pâtissier italien Pietro Ferrero à Alba dans le Piémont ?",
    options: ["Nocciolata", "Ovomaltine", "Nutella", "Banania"],
    correct_index: 2,
    explanation: "Après la Seconde Guerre mondiale, face à la pénurie de cacao, Ferrero a ajouté des noisettes du Piémont à sa recette, baptisée « Nutella » en 1964."
  },
  {
    difficulty: 4,
    theme: "Géographie",
    question: "Quel est le plus petit État souverain du monde en superficie ?",
    options: ["Monaco", "Saint-Marin", "Le Liechtenstein", "Le Vatican"],
    correct_index: 3,
    explanation: "Enclavé dans la ville de Rome, l'État de la Cité du Vatican ne couvre que 0,44 km² (44 hectares) et compte moins de 1 000 habitants."
  },
  {
    difficulty: 4,
    theme: "Histoire",
    question: "Qui a prononcé le célèbre discours « I Have a Dream » à Washington le 28 août 1963 ?",
    options: ["Martin Luther King Jr.", "Malcolm X", "Nelson Mandela", "John F. Kennedy"],
    correct_index: 0,
    explanation: "Prononcé devant le Lincoln Memorial devant 250 000 personnes, ce discours est un jalon majeur du mouvement américain des droits civiques."
  },
  {
    difficulty: 4,
    theme: "Sciences",
    question: "À quelle température exprimée en degrés Celsius l'eau pure gèle-t-elle mais correspond à 32 degrés sur l'échelle américaine ?",
    options: ["L'échelle Kelvin", "L'échelle Fahrenheit", "L'échelle Rankine", "L'échelle Réaumur"],
    correct_index: 1,
    explanation: "Sur l'échelle Fahrenheit utilisée aux États-Unis, l'eau gèle à 32 °F et bout à 212 °F (sous pression atmosphérique normale)."
  },
  {
    difficulty: 4,
    theme: "Société",
    question: "Quelle boisson lactée à boire en petite bouteille plastique faisait fureur dans les années 2000 avec ses personnages « Yop » ou « Actimel » — et laquelle promettait de « renforcer les défenses naturelles » ?",
    options: ["Yop", "Candy'Up", "Actimel", "Danao"],
    correct_index: 2,
    explanation: "Avec son fameux ferment « L. casei Defensis » et sa petite bouteille blanche, Actimel de Danone était le rituel matinal des publicités des années 2000."
  },

  // ============================================================================
  // DIFFICULTY 5 (30 questions) - Standard Trentenaire
  // ============================================================================
  {
    difficulty: 5,
    theme: "Cinéma",
    question: "Dans « Les Bronzés font du ski » (1979), quel alcool fort aux plantes (et au crapaud !) les paysans montagnards font-ils boire à la troupe ?",
    options: ["La liqueur de génépi", "La goutte de gentiane", "L'eau-de-vie de mirabelle", "La liqueur d'échalote"],
    correct_index: 3,
    explanation: "« C'est gouleyant ! » Cette fameuse liqueur d'échalote relevée au crapaud est un hommage direct au « Père Noël est une ordure » et à l'alcool de prune d'antan."
  },
  {
    difficulty: 5,
    theme: "Séries TV",
    question: "Dans « Friends », quel est le véritable métier de Chandler Bing pendant la majeure partie de la série (que personne ne retient jamais) ?",
    options: ["Analyse statistique et reconfiguration de données", "Comptable dans une banque d'investissement", "Courtier en assurances maritimes", "Contrôleur fiscal pour l'État de New York"],
    correct_index: 0,
    explanation: "Rachel est tellement incapable de retenir son métier qu'elle répond « Transponster ! » lors du mythique quiz qui leur fait perdre leur appartement au profit de Joey et Chandler."
  },
  {
    difficulty: 5,
    theme: "Musique",
    question: "Quel groupe de rap marseillais a sorti en 1997 l'album « L'École du micro d'argent », considéré comme un chef-d'œuvre du rap français ?",
    options: ["Fonky Family", "IAM", "Psy 4 de la Rime", "Sniper"],
    correct_index: 1,
    explanation: "Enregistré entre Marseille et New York, cet album d'IAM (Akhenaton, Shurik'n, Freeman, Kheops, Imhotep, Kephren) contient « Petit frère », « Demain, c'est loin » et « Nés sous la même étoile »."
  },
  {
    difficulty: 5,
    theme: "Pop Culture 90/2000",
    question: "Dans la saga « Harry Potter », comment s'appellent les quatre créateurs de la Carte du Maraudeur ?",
    options: ["Godric, Helga, Rowena et Salazar", "Albus, Gellert, Abelforth et Severus", "Lunard, Queudver, Patmol et Cornedrue", "Fred, George, Lee et Percy"],
    correct_index: 2,
    explanation: "Derrière ces surnoms se cachent Remus Lupin (Lunard), Peter Pettigrew (Queudver), Sirius Black (Patmol) et James Potter, le père de Harry (Cornedrue)."
  },
  {
    difficulty: 5,
    theme: "Jeux Vidéo",
    question: "Dans « World of Warcraft », quel est le nom du continent glacé gouverné par le Roi Liche (Arthas) dans l'extension sortie en 2008 ?",
    options: ["Kalimdor", "Les Royaumes de l'Est", "L'Outreterre", "Le Norfendre"],
    correct_index: 3,
    explanation: "L'extension Wrath of the Lich King (2008), qui se déroule en Norfendre (Northrend), marque l'apogée de World of Warcraft avec plus de 12 millions d'abonnés."
  },
  {
    difficulty: 5,
    theme: "Gastronomie",
    question: "Dans la classification officielle de 1979 de l'échelle de Scoville, que mesure-t-on exactement ?",
    options: ["La force piquante des piments", "L'amertume de la bière (IBU)", "L'acidité du vinaigre balsamique", "La teneur en cacao du chocolat"],
    correct_index: 0,
    explanation: "Inventée par le pharmacologue Wilbur Scoville en 1912, cette échelle mesure la concentration en capsaïcine, la molécule responsable de la sensation de brûlure des piments."
  },
  {
    difficulty: 5,
    theme: "Géographie",
    question: "Quelle est la capitale de la Nouvelle-Zélande ?",
    options: ["Auckland", "Wellington", "Christchurch", "Queenstown"],
    correct_index: 1,
    explanation: "Bien qu'Auckland soit de loin la ville la plus peuplée du pays, c'est Wellington, située à la pointe sud de l'île du Nord, qui est la capitale depuis 1865."
  },
  {
    difficulty: 5,
    theme: "Histoire",
    question: "En quelle année Nelson Mandela a-t-il été élu président de la République d'Afrique du Sud, quatre ans après sa libération de prison ?",
    options: ["1990", "1992", "1994", "1996"],
    correct_index: 2,
    explanation: "Libéré en février 1990 après 27 ans de détention et prix Nobel de la paix en 1993, Nelson Mandela devient le premier président noir d'Afrique du Sud en mai 1994."
  },
  {
    difficulty: 5,
    theme: "Sciences",
    question: "Quel organite présent à l'intérieur de nos cellules est surnommé la « centrale énergétique » de la cellule ?",
    options: ["Le ribosome", "L'appareil de Golgi", "Le lysosome", "La mitochondrie"],
    correct_index: 3,
    explanation: "Souvenir incontournable des cours de SVT de lycée : la mitochondrie assure la respiration cellulaire et produit l'ATP, l'énergie indispensable à la cellule !"
  },
  {
    difficulty: 5,
    theme: "Société",
    question: "Quel film d'animation de 1995 produit par Pixar est le tout premier long-métrage de l'histoire entièrement réalisé en images de synthèse ?",
    options: ["Toy Story", "1001 Pattes", "Fourmiz", "Monstres et Cie"],
    correct_index: 0,
    explanation: "Réalisé par John Lasseter en 1995, Toy Story a ouvert une nouvelle ère du cinéma d'animation en mettant en scène Woody et Buzz l'Éclair."
  },
  {
    difficulty: 5,
    theme: "Cinéma",
    question: "Dans « Pulp Fiction » de Quentin Tarantino (1994), comment appelle-t-on un « Quarter Pounder with Cheese » à Paris selon Vincent Vega ?",
    options: ["Un Big Mac", "Un Royal Cheese", "Un Double Cheese", "Un Croque McDo"],
    correct_index: 1,
    explanation: "Dans cette scène de dialogue culte avec Jules Winnfield (Samuel L. Jackson), Vincent Vega (John Travolta) explique que c'est à cause du système métrique !"
  },
  {
    difficulty: 5,
    theme: "Séries TV",
    question: "Dans « Game of Thrones », quelle est la devise officielle de la Maison Lannister (à ne pas confondre avec son dicton populaire) ?",
    options: ["Un Lannister paie toujours ses dettes", "Le lion ne s'associe pas avec le cafard", "Je rugis (Hear Me Roar)", "Feu et Sang"],
    correct_index: 2,
    explanation: "Si tout le monde connaît le dicton « Un Lannister paie toujours ses dettes », la véritable devise officielle sur le blason de Castral Roc est « Je rugis ! » (Hear Me Roar!)."
  },
  {
    difficulty: 5,
    theme: "Musique",
    question: "Quelle chanteuse canadienne a vendu plus de 20 millions d'exemplaires de son album « Let Go » en 2002 avec les titres « Complicated » et « Sk8er Boi » ?",
    options: ["Nelly Furtado", "Alanis Morissette", "Shania Twain", "Avril Lavigne"],
    correct_index: 3,
    explanation: "Avec ses cravates portées sur des débardeurs, ses Converse et son eye-liner noir, Avril Lavigne a lancé la mode pop-punk chez tous les ados de 2002."
  },
  {
    difficulty: 5,
    theme: "Pop Culture 90/2000",
    question: "Dans l'émission « Koh-Lanta », comment s'appelle le candidat emblématique surnommé « le chouchou des Français » qui a remporté la 4e saison (2004) mais surtout marqué « Le Retour des Héros » ?",
    options: ["Moundir", "Claude Dartois", "Teheiura", "Grégoire"],
    correct_index: 0,
    explanation: "Révélé en 2003 (saison 3 à Bocas del Toro) puis devenu légendaire en 2009 pour son cri « Pourquoi être aussi corrompu ?! Aucun honneur ! », Moundir Zoughari est la première grande star de Koh-Lanta."
  },
  {
    difficulty: 5,
    theme: "Jeux Vidéo",
    question: "Dans « Super Smash Bros. Melee » sur GameCube (2001), quel est l'objectif principal pour éjecter un adversaire hors de l'écran ?",
    options: ["Vider sa barre de vie verte jusqu'à zéro", "Faire grimper son pourcentage de dégâts", "Collecter 100 pièces d'or", "Lui voler ses trois étoiles"],
    correct_index: 1,
    explanation: "Contrairement aux jeux de combat classiques, Super Smash Bros. utilise une jauge de pourcentage : plus le chiffre est élevé (100 %, 150 %...), plus le personnage vole loin à chaque coup reçu."
  },
  {
    difficulty: 5,
    theme: "Gastronomie",
    question: "Quelle est la différence principale entre un Croque-Monsieur et un Croque-Madame ?",
    options: ["Le jambon est remplacé par du saumon", "Il est préparé avec du fromage de chèvre", "Il est surmonté d'un œuf au plat", "Le pain de mie est remplacé par une brioche"],
    correct_index: 2,
    explanation: "Le Croque-Madame tire son nom de l'œuf au plat déposé sur le dessus du pain grillé, qui rappelait la forme des chapeaux portés par les dames au début du XXe siècle."
  },
  {
    difficulty: 5,
    theme: "Géographie",
    question: "Quel est le plus long fleuve de France métropolitaine qui coule entièrement sur le territoire national ?",
    options: ["La Seine", "Le Rhône", "La Garonne", "La Loire"],
    correct_index: 3,
    explanation: "Avec ses 1 006 kilomètres, de sa source au mont Gerbier-de-Jonc (Ardèche) jusqu'à son estuaire à Saint-Nazaire, la Loire est le plus long fleuve de France."
  },
  {
    difficulty: 5,
    theme: "Histoire",
    question: "Quel roi de France a signé l'édit de Nantes en 1598 pour mettre fin aux guerres de Religion entre catholiques et protestants ?",
    options: ["Henri IV", "François Ier", "Charles IX", "Louis XIII"],
    correct_index: 0,
    explanation: "Ancien chef protestant converti au catholicisme (« Paris vaut bien une messe »), Henri IV accorde par cet édit la liberté de culte aux protestants avant qu'il ne soit révoqué par Louis XIV en 1685."
  },
  {
    difficulty: 5,
    theme: "Sciences",
    question: "À quelle distance approximative de la Terre se trouve la Lune ?",
    options: ["38 400 km", "384 400 km", "3 840 000 km", "150 000 000 km"],
    correct_index: 1,
    explanation: "À 384 400 km en moyenne, on pourrait aligner côte à côte toutes les autres planètes du système solaire entre la Terre et la Lune ! (150 millions de km correspond à la distance Terre-Soleil)."
  },
  {
    difficulty: 5,
    theme: "Société",
    question: "Quel moteur de recherche français ou portail web à tête de chien (un bull-terrier) avait pour slogan « Va chercher ! » à la fin des années 1990 ?",
    options: ["AltaVista", "Yahoo!", "Lycos", "Wanadoo"],
    correct_index: 2,
    explanation: "D'origine américaine mais très populaire en France, Lycos mettait en scène un labrador noir (puis la formule « Va chercher Lycos ! ») dans toutes les coupures pub de la fin des années 90."
  },
  {
    difficulty: 5,
    theme: "Cinéma",
    question: "Dans « OSS 117 : Le Caire, nid d'espions » (2006), quelle est la couverture professionnelle d'Hubert Bonisseur de La Bath en Égypte ?",
    options: ["Importateur de tapis persans", "Attaché culturel à l'ambassade", "Archéologue spécialiste des pyramides", "Directeur de la SCEP (Société Cairote d'Élevage de Poulets)"],
    correct_index: 3,
    explanation: "Envoyé au Caire en 1955 par ses supérieurs pour enquêter sur la disparition de son ami Jack Jefferson, Hubert prend la tête d'une société d'élevage de poulets !"
  },
  {
    difficulty: 5,
    theme: "Séries TV",
    question: "Dans « Breaking Bad », sous quel pseudonyme tiré d'un célèbre physicien allemand Walter White se fait-il appeler dans le milieu de la drogue ?",
    options: ["Heisenberg", "Schrödinger", "Oppenheimer", "Planck"],
    correct_index: 0,
    explanation: "Walter White choisit le nom de Werner Heisenberg, prix Nobel de physique 1932 et père du fameux « principe d'incertitude » en mécanique quantique."
  },
  {
    difficulty: 5,
    theme: "Musique",
    question: "Quel chanteur franco-espagnol, ancien leader de la Mano Negra, a sorti l'album culte « Clandestino » en 1998 ?",
    options: ["Sergent Garcia", "Manu Chao", "Cali", "Sanseverino"],
    correct_index: 1,
    explanation: "Enregistré avec un studio portable à travers l'Amérique latine, « Clandestino » (avec « Je ne t'aime plus », « Bongo Bong ») s'est écoulé à plus de 3 millions d'exemplaires."
  },
  {
    difficulty: 5,
    theme: "Pop Culture 90/2000",
    question: "Dans le dessin animé « Hé Arnold ! », quelle particularité physique possède la tête du héros Arnold ?",
    options: ["Elle a la forme d'une poire", "Elle est totalement carrée", "Elle a la forme d'un ballon de football américain", "Elle est bleue"],
    correct_index: 2,
    explanation: "Helga Pataki, secrètement amoureuse de lui tout en le martyrisant à l'école, l'appelle d'ailleurs constamment « Tête de ballon de rugby » en VF (« Football Head » en VO) !"
  },
  {
    difficulty: 5,
    theme: "Jeux Vidéo",
    question: "Quel jeu de réflexion préinstallé sur Windows demandait de déminer une grille de cases grises à l'aide de chiffres et de petits drapeaux rouges ?",
    options: ["Freecell", "Pinball 3D Space Cadet", "Dame de Pique", "Le Démineur"],
    correct_index: 3,
    explanation: "Inclus dans Windows dès 1990 (Windows 3.1), le Démineur avait été conçu à l'origine par Microsoft pour apprendre aux utilisateurs à maîtriser le clic gauche et le clic droit de la souris !"
  },
  {
    difficulty: 5,
    theme: "Gastronomie",
    question: "Quel fromage corse à pâte molle, fabriqué à base de lait de brebis ou de chèvre, a été rendu célèbre par une scène explosive dans « L'Enquête corse » ?",
    options: ["Le Brocciu", "Le Maroilles", "L'Époisses", "Le Roquefort"],
    correct_index: 0,
    explanation: "Le Brocciu est le fromage national corse bénéficiant d'une AOP, tandis que les fromages corses très affinés sont regroupés sous l'appellation « casgiu merzu »."
  },
  {
    difficulty: 5,
    theme: "Géographie",
    question: "Dans quel massif montagneux français se situe le Puy de Dôme ?",
    options: ["Le Jura", "Le Massif central", "Les Vosges", "Les Pyrénées"],
    correct_index: 1,
    explanation: "Culminant à 1 465 mètres dans le département du même nom, ce volcan endormi de la chaîne des Puys (Massif central) était aussi l'emblème du jeu télévisé La Carte aux trésors !"
  },
  {
    difficulty: 5,
    theme: "Histoire",
    question: "Quel navigateur portugais a dirigé la première expédition maritime à réaliser le tour complet de la Terre (1519-1522), achevée par Juan Sebastián Elcano ?",
    options: ["Vasco de Gama", "Bartolomeu Dias", "Fernand de Magellan", "Pedro Álvares Cabral"],
    correct_index: 2,
    explanation: "Magellan a découvert le détroit qui porte son nom au sud du continent américain et a traversé le Pacifique, mais il est mort aux Philippines en 1521 avant le retour en Espagne."
  },
  {
    difficulty: 5,
    theme: "Sciences",
    question: "Combien de paires de chromosomes possède normalement une cellule humaine (hors cellules reproductrices) ?",
    options: ["21 paires", "22 paires", "46 paires", "23 paires"],
    correct_index: 3,
    explanation: "L'être humain possède 46 chromosomes au total, organisés en 23 paires (22 paires d'autosomes et 1 paire de chromosomes sexuels XX ou XY)."
  },
  {
    difficulty: 5,
    theme: "Société",
    question: "Quel magazine mensuel pour enfants et préadolescents, publié par Disney Hachette Presse, était célèbre pour ses gadgets et ses BD de Picsou et Titeuf ?",
    options: ["Le Journal de Mickey", "J'aime lire", "Science & Vie Junior", "Astrapi"],
    correct_index: 0,
    explanation: "Hebdomadaire mythique créé en 1934, Le Journal de Mickey publiait en dernière page les planches de Titeuf, Les Profs ou Kid Paddle que tous les enfants de 10 ans lisaient en premier."
  }
];
