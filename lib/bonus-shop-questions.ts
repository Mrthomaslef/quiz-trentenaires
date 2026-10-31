import type { RawSeedQuestion } from './questions-part1';
import { validateQuestionBatch, type ValidatedQuestion } from './generator';
import { insertValidatedQuestions, type QuizQuestionRecord } from './supabase';
import { normalizeQuestionKey } from './question-analytics';

export const BONUS_SHOP_QUESTIONS: RawSeedQuestion[] = [
  // ============================================================================
  // PACKS BONUS ACHETABLES DANS LA BOUTIQUE / CAGNOTTE (Difficulté 1 à 10)
  // ============================================================================
  {
    difficulty: 1,
    theme: 'Pop Culture 90/2000',
    question: 'Quel petit animal virtuel japonais en forme d’œuf fallait-il nourrir et nettoyer sur un porte-clés à la fin des années 90 ?',
    options: ['Furby', 'Tamagotchi', 'Digimon', 'Polly Pocket'],
    correct_index: 1,
    explanation: 'Lancé par Bandai en 1996-1997, le Tamagotchi a déclenché une véritable frénésie dans les cours de récréation du monde entier.',
  },
  {
    difficulty: 2,
    theme: 'Cinéma',
    question: 'Dans le film « Le Dîner de Cons » (1998), avec quel matériau François Pignon construit-il ses célèbres maquettes ?',
    options: ['Des cure-dents', 'Des bouchons de liège', 'Des allumettes', 'Des bâtonnets de glace'],
    correct_index: 2,
    explanation: 'François Pignon (Jacques Villeret) est très fier de sa maquette du viaduc de Millau réalisée avec 346 422 allumettes et deux tubes de colle.',
  },
  {
    difficulty: 3,
    theme: 'Séries TV',
    question: 'Dans la série « Friends », quel est le nom du café où les six amis se retrouvent quotidiennement sur le canapé orange ?',
    options: ['MacLaren’s Pub', 'Central Perk', 'Monk’s Café', 'The Peach Pit'],
    correct_index: 1,
    explanation: 'Le Central Perk, tenu par Gunther (secrètement amoureux de Rachel), est un jeu de mots avec le célèbre parc new-yorkais Central Park.',
  },
  {
    difficulty: 4,
    theme: 'Musique',
    question: 'Quel duo français de musique électronique a sorti l’album mythique « Discovery » en 2001 avec les titres One More Time et Harder, Better, Faster, Stronger ?',
    options: ['Justice', 'Air', 'Daft Punk', 'Cassius'],
    correct_index: 2,
    explanation: 'Thomas Bangalter et Guy-Manuel de Homem-Christo ont accompagné l’album Discovery du film d’animation japonais Interstella 5555 signé Leiji Matsumoto.',
  },
  {
    difficulty: 5,
    theme: 'Gastronomie',
    question: 'De quelle ville italienne est originaire la véritable sauce carbonara, préparée traditionnellement avec du guanciale et du pecorino romano ?',
    options: ['Naples', 'Bologne', 'Rome', 'Milan'],
    correct_index: 2,
    explanation: 'Plat emblématique du Latium et de Rome, la vraie carbonara se prépare avec de la joue de porc séchée (guanciale), du pecorino, des jaunes d’œufs et du poivre noir, sans crème fraîche !',
  },
  {
    difficulty: 6,
    theme: 'Jeux Vidéo',
    question: 'Sur Nintendo 64, dans « Mario Kart 64 », quelle est la toute dernière course de la Coupe Spéciale, célèbre pour sa piste multicolore dans l’espace ?',
    options: ['Route Arc-en-Ciel', 'Château de Bowser', 'Vallée Yoshi', 'Jungle DK'],
    correct_index: 0,
    explanation: 'La Route Arc-en-Ciel (Rainbow Road) de Mario Kart 64 est la plus longue piste du jeu (plus de 2 kilomètres virtuels) et est bordée de barrières étoilées.',
  },
  {
    difficulty: 7,
    theme: 'Histoire',
    question: 'En quelle année le mur de Berlin est-il tombé dans la nuit du 9 au 10 novembre, marquant la fin symbolique de la Guerre froide ?',
    options: ['1987', '1989', '1991', '1990'],
    correct_index: 1,
    explanation: 'Le 9 novembre 1989, suite à une déclaration télévisée de Günter Schabowski annonçant l’ouverture immédiate des frontières, des milliers de Berlinois ont franchi le mur.',
  },
  {
    difficulty: 8,
    theme: 'Sciences',
    question: 'Quel élément chimique possède le symbole « Au » dans le tableau périodique de Mendeleïev ?',
    options: ['L’argent', 'L’aluminium', 'L’or', 'L’argon'],
    correct_index: 2,
    explanation: 'Le symbole « Au » de l’or provient directement du mot latin « aurum », qui signifie « briller comme l’aurore ».',
  },
  {
    difficulty: 9,
    theme: 'Géographie',
    question: 'Quel est le seul pays d’Amérique du Sud dont la langue officielle est le néerlandais ?',
    options: ['Le Guyana', 'Le Suriname', 'Le Belize', 'La Trinité-et-Tobago'],
    correct_index: 1,
    explanation: 'Ancienne Guyane néerlandaise devenue indépendante en 1975, le Suriname a pour capitale Paramaribo et le néerlandais pour langue officielle.',
  },
  {
    difficulty: 10,
    theme: 'Arts & Architecture',
    question: 'Quel architecte catalan a conçu la Casa Batlló et la Sagrada Família à Barcelone, laissant cette dernière inachevée à sa mort en 1926 ?',
    options: ['Santiago Calatrava', 'Antoni Gaudí', 'Ricardo Bofill', 'Lluís Domènech i Montaner'],
    correct_index: 1,
    explanation: 'Figure majeure du modernisme catalan, Antoni Gaudí a consacré les 43 dernières années de sa vie à la basilique de la Sagrada Família avant d’être renversé par un tramway en 1926.',
  },
  {
    difficulty: 1,
    theme: 'Émissions TV & Télé-réalité',
    question: 'Dans le jeu télévisé « Fort Boyard », comment s’appelle le vieux sage barbu qui pose des énigmes en haut de sa vigie ?',
    options: ['Le Père Fouras', 'Passe-Partout', 'La Boule', 'Félindra'],
    correct_index: 0,
    explanation: 'Personnage emblématique créé dès le lancement de l’émission en 1990, le Père Fouras garde les clés et les indices grâce à ses célèbres énigmes poétiques.',
  },
  {
    difficulty: 2,
    theme: 'Marques, Pubs & Objets Cultes',
    question: 'Quelle célèbre pâte à modeler vendue dans de petits pots jaunes au bouchon coloré a bercé l’enfance des enfants des années 90 ?',
    options: ['Play-Doh', 'Fimo', 'Slime', 'Patafix'],
    correct_index: 0,
    explanation: 'Initialement conçue dans les années 1930 comme produit nettoyant pour papier peint, la pâte Play-Doh est devenue dans les années 1950 le jouet créatif le plus célèbre au monde.',
  },
  {
    difficulty: 3,
    theme: 'BD & Mangas',
    question: 'Dans « Dragon Ball Z », en quoi Sangoku se transforme-t-il pour la toute première fois face à Freezer sur la planète Namek après la mort de Krilin ?',
    options: ['En singe géant Oozaru', 'En Super Saiyan', 'En Kaïoken x100', 'En Dieu Super Saiyan'],
    correct_index: 1,
    explanation: 'Fou de rage après l’assassinat de son meilleur ami Krilin par Freezer, Son Goku éveille le guerrier légendaire aux cheveux dorés et aux yeux turquoise : le Super Saiyan.',
  },
  {
    difficulty: 4,
    theme: 'Humour & Comédie',
    question: 'Dans « Astérix et Obélix : Mission Cléopâtre » (2002), quel est le métier du personnage d’Otis, interprété par Édouard Baer dans son célèbre monologue ?',
    options: ['Architecte', 'Scribe', 'Tailleur de pierre', 'Goûteur de la reine'],
    correct_index: 1,
    explanation: 'Lorsqu’on lui demande si c’est une bonne situation, ça, scribe, Otis répond la réplique culte : « Vous savez, moi je ne crois pas qu’il y ait de bonne ou de mauvaise situation… ».',
  },
  {
    difficulty: 5,
    theme: 'Sport',
    question: 'Quel joueur de tennis espagnol détient le record historique de 14 titres remportés en simple messieurs à Roland-Garros ?',
    options: ['Carlos Alcaraz', 'David Ferrer', 'Rafael Nadal', 'Juan Carlos Ferrero'],
    correct_index: 2,
    explanation: 'Surnommé le « Roi de la terre battue », Rafael Nadal a remporté son premier Roland-Garros en 2005 à 19 ans et son quatorzième trophée en 2022.',
  },
  {
    difficulty: 6,
    theme: 'Espace & Astronomie',
    question: 'Quelle est la planète la plus chaude du Système solaire en raison de son effet de serre extrême, dépassant les 460 °C en surface ?',
    options: ['Mercure', 'Vénus', 'Mars', 'Jupiter'],
    correct_index: 1,
    explanation: 'Bien que Mercure soit plus proche du Soleil, Vénus possède une atmosphère ultra-dense composée à 96 % de dioxyde de carbone qui piège la chaleur.',
  },
  {
    difficulty: 7,
    theme: 'Littérature & Contes',
    question: 'Quel écrivain français est l’auteur du roman d’aventures « Le Comte de Monte-Cristo », publié en feuilleton entre 1844 et 1846 ?',
    options: ['Victor Hugo', 'Honoré de Balzac', 'Alexandre Dumas', 'Jules Verne'],
    correct_index: 2,
    explanation: 'Alexandre Dumas, avec la collaboration d’Auguste Maquet, y raconte l’emprisonnement injuste d’Edmond Dantès au château d’If et sa vengeance méthodique.',
  },
  {
    difficulty: 8,
    theme: 'Mythologie & Légendes',
    question: 'Dans la mythologie grecque, quel fleuve des Enfers les âmes des défunts devaient-elles traverser dans la barque du nocher Charon ?',
    options: ['Le Pactole', 'Le Rubicon', 'Le Styx', 'L’Hellespont'],
    correct_index: 2,
    explanation: 'Selon la tradition antique, on plaçait une obole sous la langue du défunt pour qu’il puisse payer son passage à Charon à travers le Styx ou l’Achéron.',
  },
  {
    difficulty: 9,
    theme: 'Inventions, Tech & Insolite',
    question: 'Quel ingénieur britannique a inventé le World Wide Web (WWW) en 1989 alors qu’il travaillait au CERN près de Genève ?',
    options: ['Alan Turing', 'Tim Berners-Lee', 'Steve Wozniak', 'Linus Torvalds'],
    correct_index: 1,
    explanation: 'Sir Tim Berners-Lee a créé les trois piliers du Web moderne au CERN : les adresses URL, le protocole HTTP et le langage HTML.',
  },
  {
    difficulty: 10,
    theme: 'Langue Française & Expressions',
    question: 'Que signifie l’adjectif « callipyge », emprunté au grec ancien et célèbre notamment grâce à une chanson de Georges Brassens ?',
    options: ['Qui a une belle écriture', 'Qui a de belles fesses', 'Qui parle plusieurs langues', 'Qui a un regard perçant'],
    correct_index: 1,
    explanation: 'Issu du grec « kallos » (beauté) et « pugê » (fesses), le terme désignait dans l’Antiquité une statue célèbre d’Aphrodite, la Vénus callipyge.',
  },
  {
    difficulty: 1,
    theme: 'Animaux & Nature',
    question: 'Quel mammifère marin est le plus grand animal ayant jamais vécu sur Terre, pouvant mesurer jusqu’à 30 mètres de long ?',
    options: ['Le grand cachalot', 'La baleine bleue', 'Le requin-baleine', 'L’orque épaulard'],
    correct_index: 1,
    explanation: 'La baleine bleue (ou rorqual bleu) peut peser plus de 150 tonnes ; sa langue seule pèse autant qu’un éléphant d’Afrique adulte !',
  },
  {
    difficulty: 2,
    theme: 'Internet, Memes & Réseaux',
    question: 'Quel logiciel de messagerie instantanée culte des années 2000 permettait d’envoyer des « Wizz » qui faisaient trembler tout l’écran de ses amis ?',
    options: ['Skype', 'MSN Messenger', 'WhatsApp', 'Discord'],
    correct_index: 1,
    explanation: 'MSN Messenger (puis Windows Live Messenger) a marqué toute la génération des années 90 avec ses pseudos à rallonge, ses statuts musicaux et ses fameux Wizz.',
  },
  {
    difficulty: 3,
    theme: 'Cinéma',
    question: 'Dans « Retour vers le futur », quelle vitesse en miles par heure (mph) la DeLorean doit-elle atteindre pour voyager dans le temps ?',
    options: ['77 mph', '88 mph', '99 mph', '100 mph'],
    correct_index: 1,
    explanation: 'À exactement 88 miles par heure (soit environ 141,6 km/h), le convecteur temporel de Doc Brown s’active grâce à ses 2,21 gigowatts.',
  },
  {
    difficulty: 4,
    theme: 'Société',
    question: 'En quelle année les pièces et billets en euros sont-ils entrés en circulation dans le porte-monnaie des Français, remplaçant le franc ?',
    options: ['1999', '2000', '2002', '2004'],
    correct_index: 2,
    explanation: 'Si l’euro existait comme monnaie scripturale dès le 1er janvier 1999, c’est le 1er janvier 2002 que les billets et les pièces ont été mis en circulation (1 € = 6,55957 F).',
  },
  {
    difficulty: 5,
    theme: 'Santé, Corps & Psychologie',
    question: 'Quel est l’os le plus long, le plus lourd et le plus résistant du squelette humain ?',
    options: ['Le tibia', 'L’humérus', 'Le fémur', 'Le rachis'],
    correct_index: 2,
    explanation: 'Situé dans la cuisse, le fémur représente à lui seul environ un quart de la taille totale d’un être humain adulte.',
  },
  {
    difficulty: 6,
    theme: 'Musique',
    question: 'Quel groupe de rock britannique, mené par les frères Liam et Noel Gallagher, a composé l’hymne « Wonderwall » en 1995 ?',
    options: ['Blur', 'Oasis', 'Radiohead', 'The Verve'],
    correct_index: 1,
    explanation: 'Issu de l’album (What’s the Story) Morning Glory?, Wonderwall d’Oasis est devenu l’un des morceaux les plus repris à la guitare sèche de toute l’histoire de la pop.',
  },
  {
    difficulty: 7,
    theme: 'Gastronomie',
    question: 'Quelle épice, la plus chère au monde au kilo, est extraite des trois stigmates rouges d’une fleur de crocus (Crocus sativus) ?',
    options: ['La cardamome', 'La vanille Bourbon', 'Le safran', 'La fève tonka'],
    correct_index: 2,
    explanation: 'Surnommé « l’or rouge », le safran nécessite la cueillette manuelle d’environ 150 000 fleurs de Crocus sativus pour obtenir un seul kilogramme d’épice sèche.',
  },
  {
    difficulty: 8,
    theme: 'Histoire',
    question: 'Quel roi de France, surnommé « le Père du Peuple », a remporté la bataille de Marignan en 1515 dès la première année de son règne ?',
    options: ['Louis XII', 'François Ier', 'Henri II', 'Henri IV'],
    correct_index: 1,
    explanation: 'Si Louis XII était surnommé le Père du Peuple, c’est son successeur et gendre François Ier, sacré en janvier 1515, qui remporta la célèbre victoire de Marignan en septembre 1515.',
  },
  {
    difficulty: 9,
    theme: 'Sciences',
    question: 'Quelle physicienne d’origine polonaise est la seule personne de l’histoire à avoir reçu deux prix Nobel dans deux disciplines scientifiques distinctes (Physique et Chimie) ?',
    options: ['Irène Joliot-Curie', 'Rosalind Franklin', 'Marie Curie', 'Lise Meitner'],
    correct_index: 2,
    explanation: 'Marie Curie a reçu le prix Nobel de physique en 1903 (avec Pierre Curie et Henri Becquerel) puis le prix Nobel de chimie en 1911 pour ses travaux sur le polonium et le radium.',
  },
  {
    difficulty: 10,
    theme: 'Géographie',
    question: 'Quelle est la capitale de l’Australie, choisie en 1908 comme compromis géographique entre les deux métropoles rivales Sydney et Melbourne ?',
    options: ['Adélaïde', 'Perth', 'Brisbane', 'Canberra'],
    correct_index: 3,
    explanation: 'Ne parvenant pas à départager Sydney et Melbourne, le gouvernement australien a fait construire de toutes pièces la ville nouvelle de Canberra dans les terres.',
  },
  {
    difficulty: 1,
    theme: 'Pop Culture 90/2000',
    question: 'Dans « Pokémon Rouge et Bleu » sur Game Boy, quels sont les trois Pokémon de départ proposés par le Professeur Chen ?',
    options: [
      'Pikachu, Évoli et Mélofée',
      'Bulbizarre, Salamèche et Carapuce',
      'Germignon, Héricendre et Kaiminus',
      'Arcko, Poussifeu et Gobou',
    ],
    correct_index: 1,
    explanation: 'À Bourg Palette, le Professeur Chen propose au joueur de choisir entre Bulbizarre (Plante), Salamèche (Feu) et Carapuce (Eau).',
  },
  {
    difficulty: 2,
    theme: 'Séries TV',
    question: 'Dans la série « Malcolm », quel est le prénom du père de famille, incarné par Bryan Cranston avant son rôle dans Breaking Bad ?',
    options: ['Hal', 'Craig', 'Otto', 'Francis'],
    correct_index: 0,
    explanation: 'Hal, père aimant, impulsif et totalement dépassé par ses garçons et sa femme Lois, est l’un des rôles comiques les plus cultes des années 2000.',
  },
  {
    difficulty: 3,
    theme: 'Musique',
    question: 'Quel boys band français a connu un triomphe phénoménal en 1996 avec le tube « Partir un jour » ?',
    options: ['Alliage', 'Worlds Apart', '2Be3', 'G-Squad'],
    correct_index: 2,
    explanation: 'Formé par Filip Nikolic, Adel Kachermi et Frank Delay, originaires de Longjumeau, le groupe 2Be3 (« To Be Free ») a vendu des millions de disques.',
  },
  {
    difficulty: 4,
    theme: 'Jeux Vidéo',
    question: 'Dans « Les Sims », quel mot en langage « Simlish » signifie « Bonjour » ou « Salut » ?',
    options: ['Sul Sul', 'Dag Dag', 'Nooboo', 'Lalo'],
    correct_index: 0,
    explanation: 'En Simlish, la langue imaginaire créée par Will Wright pour Les Sims, « Sul Sul ! » veut dire Bonjour et « Dag Dag ! » signifie Au revoir.',
  },
  {
    difficulty: 5,
    theme: 'Cinéma',
    question: 'Dans « Le Seigneur des Anneaux », combien de membres composent la Communauté de l’Anneau formée à Fondcombe ?',
    options: ['7 membres', '8 membres', '9 membres', '12 membres'],
    correct_index: 2,
    explanation: 'Les 9 Marcheurs (Frodon, Sam, Merry, Pippin, Gandalf, Aragorn, Legolas, Gimli et Boromir) font face aux 9 Cavaliers Noirs (les Nazgûl).',
  },
  {
    difficulty: 6,
    theme: 'Gastronomie',
    question: 'Quel fromage AOP du Jura est reconnaissable à la fine ligne horizontale de cendre végétale noire qui traverse le milieu de sa pâte ?',
    options: ['Le Comté', 'Le Morbier', 'Le Mont d’Or', 'Le Beaufort'],
    correct_index: 1,
    explanation: 'Autrefois, les fermiers jurassiens recouvraient la traite du soir d’une fine couche de suie pour la protéger avant d’y ajouter la traite du matin.',
  },
  {
    difficulty: 7,
    theme: 'Histoire',
    question: 'Quelle reine de France a prononcé, selon la légende popularisée par Jean-Jacques Rousseau, « S’ils n’ont pas de pain, qu’ils mangent de la brioche » ?',
    options: ['Anne d’Autriche', 'Marie-Antoinette', 'Catherine de Médicis', 'Joséphine de Beauharnais'],
    correct_index: 1,
    explanation: 'Bien qu’attribuée à Marie-Antoinette par la propagande révolutionnaire, la phrase figure déjà dans Les Confessions de Rousseau écrites quand elle était enfant.',
  },
  {
    difficulty: 8,
    theme: 'Sciences',
    question: 'Quelle planète du Système solaire possède le plus grand volcan connu, baptisé Olympus Mons, qui culmine à plus de 21 kilomètres d’altitude ?',
    options: ['Vénus', 'Mars', 'Mercure', 'Terre'],
    correct_index: 1,
    explanation: 'Situé sur Mars, le volcan bouclier Olympus Mons mesure environ 21,9 km de haut, soit près de trois fois la hauteur de l’Everest !',
  },
  {
    difficulty: 9,
    theme: 'Littérature & Contes',
    question: 'Quel est le véritable nom de plume de Jean-Baptiste Poquelin, dramaturge immortel du XVIIe siècle ?',
    options: ['Corneille', 'Racine', 'Molière', 'La Fontaine'],
    correct_index: 2,
    explanation: 'Baptisé à Paris en janvier 1622, Jean-Baptiste Poquelin prit le pseudonyme de Molière à l’âge de 22 ans à l’époque de l’Illustre Théâtre.',
  },
  {
    difficulty: 10,
    theme: 'Arts & Architecture',
    question: 'Dans quel musée madrilène est conservé le célèbre tableau « Guernica » peint par Pablo Picasso en 1937 ?',
    options: ['Le Musée du Prado', 'Le Musée Reina Sofía', 'Le Musée Thyssen-Bornemisza', 'Le Musée Guggenheim'],
    correct_index: 1,
    explanation: 'Longtemps exposé au MoMA de New York selon la volonté de Picasso tant que Franco était au pouvoir, Guernica est aujourd’hui le joyau du musée Reina Sofía à Madrid.',
  },
  {
    difficulty: 1,
    theme: 'Jeux de Société & Jouets',
    question: 'Dans le jeu « Qui est-ce ? », quel accessoire physique ou trait du visage permet d’éliminer d’un coup toute une série de personnages ?',
    options: [
      'A-t-il des lunettes ou un chapeau ?',
      'Quel est son signe astrologique ?',
      'Dans quelle ville habite-t-il ?',
      'Quel est son plat préféré ?',
    ],
    correct_index: 0,
    explanation: 'Les questions sur les lunettes, la moustache, les cheveux blonds ou le chapeau sont les grands classiques stratégiques de « Qui est-ce ? ».',
  },
  {
    difficulty: 2,
    theme: 'Émissions TV & Télé-réalité',
    question: 'Quel animateur présentait « Qui veut gagner des millions ? » lors de son lancement culte sur TF1 en juillet 2000 ?',
    options: ['Arthur', 'Jean-Pierre Foucault', 'Christophe Dechavanne', 'Denis Brogniart'],
    correct_index: 1,
    explanation: 'Jean-Pierre Foucault a incarné l’émission pendant près de 20 ans avec sa célèbre phrase fétiche : « C’est votre dernier mot ? ».',
  },
  {
    difficulty: 3,
    theme: 'Sport',
    question: 'Lors de la finale de la Coupe du monde 1998 au Stade de France, quel joueur français a inscrit le troisième but à la dernière minute (3-0) ?',
    options: ['Zinédine Zidane', 'Youri Djorkaeff', 'Emmanuel Petit', 'Thierry Henry'],
    correct_index: 2,
    explanation: 'Après le doublé de la tête de Zinédine Zidane en première période, Emmanuel Petit scelle le triomphe des Bleus face au Brésil à la 93e minute.',
  },
  {
    difficulty: 4,
    theme: 'BD & Mangas',
    question: 'Dans « One Piece », quel est le nom du fruit du démon qu’a mangé Monkey D. Luffy, rendant son corps élastique comme du caoutchouc ?',
    options: ['Le Mera Mera no Mi', 'Le Gomu Gomu no Mi', 'Le Bara Bara no Mi', 'Le Yami Yami no Mi'],
    correct_index: 1,
    explanation: 'Enfant, Luffy mange par gourmandise le Gomu Gomu no Mi (Fruit du Caoutchoutier) rapporté par l’équipage de Shanks le Roux.',
  },
  {
    difficulty: 5,
    theme: 'Humour & Comédie',
    question: 'Dans « La Cité de la Peur » des Nuls (1994), quelle danse improbable Karamazov et Odile Deray exécutent-ils au restaurant ?',
    options: ['La Macarena', 'La Carioca', 'La Lambada', 'Le Madison'],
    correct_index: 1,
    explanation: 'Interprétée par Alain Chabat et Gérard Darmon avec claquettes et guitare, « La Carioca » est l’une des scènes les plus parodiées du cinéma français.',
  },
  {
    difficulty: 6,
    theme: 'Espace & Astronomie',
    question: 'Combien de minutes environ faut-il à la lumière du Soleil pour parcourir les 150 millions de kilomètres jusqu’à la Terre ?',
    options: ['Environ 1 minute', 'Environ 8 minutes et 20 secondes', 'Environ 24 minutes', 'Environ 1 heure'],
    correct_index: 1,
    explanation: 'Voyageant à près de 300 000 km/s dans le vide, les photons émis par la surface solaire mettent environ 499 secondes (8 min 19 s) pour nous atteindre.',
  },
  {
    difficulty: 7,
    theme: 'Mythologie & Légendes',
    question: 'Dans la mythologie nordique, comment s’appelle le marteau magique du dieu du tonnerre Thor, qui revient toujours dans sa main ?',
    options: ['Gungnir', 'Mjöllnir', 'Excalibur', 'Bifröst'],
    correct_index: 1,
    explanation: 'Forgé par les nains Brokk et Eitri, le marteau Mjöllnir (« le Broyeur ») est l’arme redoutable de Thor contre les géants de glace.',
  },
  {
    difficulty: 8,
    theme: 'Inventions, Tech & Insolite',
    question: 'En quelle année le tout premier iPhone a-t-il été présenté sur scène par Steve Jobs à San Francisco ?',
    options: ['2005', '2007', '2009', '2010'],
    correct_index: 1,
    explanation: 'Le 9 janvier 2007 lors de la Macworld Conference, Steve Jobs dévoile un appareil révolutionnaire combinant « un iPod à écran tactile, un téléphone et un navigateur Internet ».',
  },
  {
    difficulty: 9,
    theme: 'Langue Française & Expressions',
    question: 'Quelle est la seule œuvre de la langue française où le mot « délice » est masculin au singulier mais devient féminin au pluriel ?',
    options: [
      'Avec « amour » et « orgue »',
      'Avec « automne » et « pétale »',
      'Avec « après-midi » et « oasis »',
      'Avec « éclair » et « espace »',
    ],
    correct_index: 0,
    explanation: 'Les trois noms « amour », « délice » et « orgue » sont célèbres en grammaire française pour être masculins au singulier et féminins au pluriel.',
  },
  {
    difficulty: 10,
    theme: 'Géographie',
    question: 'Quel détroit sépare l’extrémité orientale de la Russie (Sibérie) de l’État américain de l’Alaska sur seulement 82 kilomètres ?',
    options: ['Le détroit de Magellan', 'Le détroit de Béring', 'Le détroit de Malacca', 'Le détroit de Gibraltar'],
    correct_index: 1,
    explanation: 'Nommé d’après l’explorateur danois Vitus Béring, ce détroit abrite les îles Diomède, où la frontière américano-russe se double de la ligne de changement de date.',
  },
];

export function pickTenUnseenBonusQuestions(
  excludeKeys: Set<string>,
  count = 10
): ValidatedQuestion[] {
  const pool = [...BONUS_SHOP_QUESTIONS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const unseen = pool.filter(
    (q) => !excludeKeys.has(normalizeQuestionKey(q.question))
  );
  const chosen =
    unseen.length >= count
      ? unseen.slice(0, count)
      : [...unseen, ...pool.filter((q) => !unseen.includes(q))].slice(0, count);

  return validateQuestionBatch(chosen);
}

/**
 * Génère et sauvegarde 10 nouvelles questions au hasard.
 * Fonctionne à la fois via l'API Next.js (si serveur disponible) ET 100% côté client
 * sur GitHub Pages / export statique + synchronisation directe Supabase.
 */
export async function createAndSaveTenRandomQuestions(params: {
  pseudo: string;
  excludeKeys: string[];
}): Promise<QuizQuestionRecord[]> {
  const excludeSet = new Set(params.excludeKeys);
  let validatedBatch: ValidatedQuestion[] = [];

  // 1. Tenter l'appel API serveur uniquement si un backend Next.js est actif
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/questions/buy-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pseudo: params.pseudo,
          excludeKeys: params.excludeKeys,
        }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (Array.isArray(data?.questions) && data.questions.length > 0) {
          return data.questions as QuizQuestionRecord[];
        }
      }
    } catch {
      // Sur GitHub Pages (export statique) ou Safari iOS sans route /api, bascule directe locale + Supabase
    }
  }

  // 2. Génération locale garantie de 10 nouvelles questions inédites au hasard
  validatedBatch = pickTenUnseenBonusQuestions(excludeSet, 10);

  // 3. Synchronisation directe vers Supabase (via la RPC publique seed_trentenaires_questions)
  try {
    await insertValidatedQuestions(validatedBatch);
  } catch {
    // Non-bloquant
  }

  const nowTs = Date.now();
  return validatedBatch.map((q, idx) => ({
    id: `custom-pack-${nowTs}-${idx + 1}`,
    difficulty: q.difficulty,
    theme: q.theme,
    question: q.question,
    options: q.options,
    correct_index: q.correct_index,
    explanation: q.explanation,
    target_audience: '30yo_couples',
    times_played: 0,
    times_correct: 0,
    times_wrong: 0,
    difficulty_notes: `Créée par ${params.pseudo || 'Joueur'} via la Boutique Millions`,
    is_already_answered: false,
    created_at: new Date().toISOString(),
  }));
}
