export type SocialLink = {
  label: string;
  url: string;
  rel?: string;
};

export type Project = {
  slug: string;
  titre: string;
  categorie: string;
  annee: string;
  couleur: string;
  lien?: string;
  lienLabel?: string;
  /** When false, the live site refuses iframes — portal uses a staged visit. */
  embed?: boolean;
  description: string;
  probleme: string;
  fonctionnalites: string[];
  stack: string[];
  featured?: boolean;
  image?: string;
};

export type Experience = {
  periode: string;
  titre: string;
  lieu: string;
  description: string;
  stack: string[];
};

export const person = {
  prenom: "Michel",
  nom: "Mouhani",
  nomComplet: "Michel Mouhani",
  jobTitle: "Développeur & fondateur · Apkaid Solution",
  location: "Pointe-Noire, Congo-Brazzaville",
  country: "Congo-Brazzaville",
  email: "michel.mouhani@outlook.com",
  telephone: "+242 06 986 58 00",
  telephoneHref: "tel:+242069865800",
  availability: "Disponible pour de nouveaux projets",
} as const;

export const copy = {
  metier: "Studio digital · Pointe-Noire",
  heroHint: "Faites défiler",
  aproposTitre: "Du brief au produit en ligne.",
  apropos:
    "Sites vitrines, applications et outils métier — clairs pour vos clients, rapides à utiliser, faciles à trouver. Avec Apkaid Solution.",
  aproposLong: [
    "Développeur et fondateur d’Apkaid Solution à Pointe-Noire, je conçois des sites vitrines, des applications web et mobiles, et des boutiques e-commerce. L’objectif : un produit net, performant, et utile dès le premier jour.",
    "Chaque projet part d’un besoin business clair — générer des contacts, vendre en ligne, ou faire gagner du temps à une équipe. Je livre des solutions complètes, maintenables, pensées pour le mobile autant que pour le bureau.",
    "Entre Apkaid Solution et des missions avec Ginov (France), je travaille sur des produits qui comptent — au Congo et ailleurs. Des outils numériques que vos utilisateurs adoptent, et que votre équipe peut faire évoluer sans friction.",
  ],
  mission:
    "Créer des produits numériques vraiment utiles : performants, compréhensibles, et durables — pour vos clients comme pour vos équipes.",
  contactTitre: "Parlons de votre projet.",
  contact: "Un brief, une idée, un délai ? Écrivez-moi.",
  cue: "Entrez dans l’écran",
  projectsTip: "Cliquez pour ouvrir",
  blogTip: "Blog — cliquez pour lire",
  blogKicker: "Blog",
  loaderReady: "Le bureau est prêt.",
  loaderWait: "Préparation du bureau…",
  enter: "Entrer",
  again: "Revenir",
} as const;

export type Note = {
  id: string;
  titre: string;
  /** Short spine / cover label for the 3D book. */
  spine: string;
  date: string;
  corps: string[];
};

/** Blog articles opened from the books on the 3D office desk. */
export const notes: Note[] = [
  {
    id: "seo-congo",
    titre: "Être trouvé à Pointe-Noire",
    spine: "SEO local",
    date: "2025",
    corps: [
      "Au Congo, un site se trouve d’abord sur le téléphone. Pages rapides, titres clairs, fiche Google Business : voilà ce qui compte avant les animations.",
      "Je commence toujours par l’intention de recherche — ce que vos clients tapent vraiment — pas par la maquette.",
    ],
  },
  {
    id: "mobile-first",
    titre: "Application mobile ou site d’abord ?",
    spine: "Mobile",
    date: "2025",
    corps: [
      "Une app native quand vos utilisateurs doivent y revenir chaque semaine, hors navigateur. Un site soigné quand le budget et le délai priment.",
      "Le bon choix, c’est celui que vos clients ouvrent vraiment — pas celui qui impressionne en réunion.",
    ],
  },
  {
    id: "apkaid-studio",
    titre: "Apkaid Solution, un studio agile",
    spine: "Studio",
    date: "2025",
    corps: [
      "Peu de process, beaucoup de livrables. Brief → prototype → mise en ligne, avec un interlocuteur unique.",
      "La qualité d’un studio, la réactivité d’un indépendant — pour les entreprises qui veulent avancer vite.",
    ],
  },
  {
    id: "kolingua-note",
    titre: "Pourquoi Kolingua",
    spine: "Kolingua",
    date: "2026",
    corps: [
      "Apprendre l’anglais depuis le français, avec un parcours clair — pas un jeu de cartes sans fin.",
      "Chapitre 1 gratuit, le reste en Premium. Le produit phare que je construis en public avec Apkaid Solution.",
    ],
  },
  {
    id: "craft",
    titre: "Montrer le travail, pas le raconter",
    spine: "Preuve",
    date: "2026",
    corps: [
      "Un portfolio doit faire vivre le produit : d’où ce bureau 3D et des projets que l’on ouvre sur place.",
      "Si un service a besoin d’un long paragraphe pour s’expliquer, il n’est pas encore assez clair.",
    ],
  },
];

export const competences = [
  "Next.js",
  "React Native",
  "Node.js",
  "TypeScript",
  "SEO",
] as const;

export const skills = {
  frontend: [
    "HTML5",
    "CSS3",
    "Tailwind CSS",
    "JavaScript (ES6+)",
    "TypeScript",
    "React.js",
    "Next.js",
    "Vue.js",
    "ShadCN UI",
    "GSAP",
    "Three.js",
  ],
  mobile: ["React Native", "Expo", "Zustand"],
  backend: [
    "Node.js",
    "Express.js",
    "NestJS",
    "API REST",
    "JWT",
    "Socket.io",
    "MongoDB",
    "SQL",
  ],
  outils: [
    "Git & GitHub",
    "Vercel",
    "Netlify",
    "Figma",
    "Postman",
    "Cursor",
    "Domain Driven Design",
  ],
} as const;

export const liens: SocialLink[] = [
  {
    label: "LinkedIn",
    url: "https://www.linkedin.com/in/michel-mouhani-b563b1262",
  },
  { label: "GitHub", url: "https://github.com/mikestudent06" },
  { label: "X", url: "https://x.com/MouhaniMic44729" },
  {
    label: "Ancien portfolio",
    url: "https://michelmouhani.apkaid.com/",
  },
];

export const sameAs = [
  "https://github.com/mikestudent06",
  "https://www.linkedin.com/in/michel-mouhani-b563b1262",
  "https://x.com/MouhaniMic44729",
  "https://apkaid.com/",
  "https://michelmouhani.apkaid.com/",
];

export const services = [
  {
    slug: "sites-vitrines",
    titre: "Sites vitrines",
    description:
      "Sites professionnels, rapides et optimisés SEO — pour présenter une marque et générer des contacts qualifiés.",
  },
  {
    slug: "applications-web",
    titre: "Applications web",
    description:
      "Plateformes SaaS, outils métier et systèmes de gestion : performants, maintenables, avec une UX soignée de bout en bout.",
  },
  {
    slug: "applications-mobiles",
    titre: "Applications mobiles",
    description:
      "Apps iOS et Android en React Native : une base de code, une expérience native, des délais maîtrisés.",
  },
  {
    slug: "ecommerce",
    titre: "E-commerce",
    description:
      "Boutiques en ligne avec catalogue, panier, paiement et back-office — pensées pour convertir et évoluer avec l’activité.",
  },
] as const;

export const valeurs = [
  {
    titre: "Code propre",
    description:
      "Du code maintenable, évolutif, que votre prochaine équipe pourra reprendre sans tout réécrire.",
  },
  {
    titre: "Performance",
    description:
      "Des pages qui s’affichent vite, y compris sur mobile et sur des connexions imparfaites.",
  },
  {
    titre: "Orientation business",
    description:
      "Chaque écran sert un objectif : prise de contact, vente, suivi, opération quotidienne.",
  },
  {
    titre: "Innovation utile",
    description:
      "3D, animations, IA : seulement quand cela aide vraiment l’utilisateur, pas pour faire joli.",
  },
] as const;

export const projets: Project[] = [
  {
    slug: "kolingua",
    titre: "Kolingua — apprendre l’anglais",
    categorie: "Éducation",
    annee: "2026",
    couleur: "#c45a28",
    lien: "https://kolingua.apkaid.com/",
    embed: false,
    image: "/projets/kolingua.png",
    featured: true,
    description:
      "Application pour apprendre l’anglais depuis zéro, avec des leçons courtes, des fiches en français, de l’audio à répéter et des vidéos de pratique. Chapitre 1 gratuit, Premium pour le parcours complet.",
    probleme:
      "Les apps de langues sont souvent des jeux de cartes sans parcours clair, et rarement expliquées en français pour un public au Congo.",
    fonctionnalites: [
      "7 chapitres d’anglais débutant, du salut aux mini-dialogues",
      "Fiche pédagogique en français dans chaque leçon",
      "Exercices, prononciation audio et onglet Pratique vidéo",
      "Offre gratuite + Premium (web, iOS bientôt, Android sur demande)",
    ],
    stack: ["Next.js", "TypeScript", "React Native", "Expo"],
  },
  {
    slug: "apkaid",
    titre: "Apkaid — agence digitale",
    categorie: "Site vitrine",
    annee: "2025",
    couleur: "#7fd4e0",
    lien: "https://apkaid.com/",
    image: "/projets/apkaid.png",
    featured: true,
    description:
      "Site vitrine de l’agence que j’ai fondée à Pointe-Noire. Présenter l’offre (web, mobile, UI/UX), le processus client et convertir les visiteurs en briefs clairs.",
    probleme:
      "Donner à Apkaid une vitrine à la hauteur de ses livrables, capable de générer des leads qualifiés au Congo et à l’international.",
    fonctionnalites: [
      "Site vitrine haut de gamme, pensé mobile-first",
      "Présentation des services web, mobile et UI/UX",
      "Processus de travail structuré",
      "Déploiement Netlify + hébergement LWS",
    ],
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Netlify", "LWS"],
  },
  {
    slug: "hami",
    titre: "HAMI — réseau pour entrepreneurs",
    categorie: "Plateforme",
    annee: "2024",
    couleur: "#f0a060",
    featured: true,
    description:
      "Réseau social pour entrepreneurs : se connecter, trouver des investisseurs, créer des entreprises et collaborer. Messagerie temps réel, projets et networking dans une même app.",
    probleme:
      "Les fondateurs n’avaient pas d’espace unique pour pitcher, recruter et suivre des collaborations.",
    fonctionnalites: [
      "Réseau social dédié aux entrepreneurs",
      "Gestion de projets et d’entreprises",
      "Messagerie en temps réel",
      "Parcours investisseurs / collaborations",
    ],
    stack: [
      "React",
      "Redux Toolkit",
      "Node.js",
      "Express",
      "MongoDB",
      "Socket.io",
      "JWT",
    ],
  },
  {
    slug: "sprint-job",
    titre: "Sprint Job — recrutement",
    categorie: "Produit RH",
    annee: "2024",
    couleur: "#8fa8ff",
    featured: true,
    description:
      "Matching entre candidats et entreprises selon compétences, localisation et expériences. Cartes, CV, suivi des candidatures : une base de recrutement moderne.",
    probleme:
      "Recruteurs et candidats perdaient du temps sur des offres mal ciblées, sans vue géographique ni suivi clair.",
    fonctionnalites: [
      "Matching intelligent candidats / offres",
      "Gestion de profils et de CV",
      "Cartes interactives (Leaflet)",
      "Suivi des candidatures",
    ],
    stack: [
      "React",
      "TypeScript",
      "TanStack Query",
      "Leaflet",
      "Zustand",
      "Zod",
    ],
  },
  {
    slug: "toud",
    titre: "Toud — tâches assistées par l’IA",
    categorie: "Application mobile",
    annee: "2025",
    couleur: "#6fe0b0",
    featured: true,
    description:
      "Application mobile de gestion de tâches avec assistant IA, calendrier, statistiques de productivité et rappels. Conçue pour rester fluide hors ligne, avec SQLite.",
    probleme:
      "Les to-do listes classiques n’aident pas à prioriser ni à voir ce qui dérape dans la semaine.",
    fonctionnalites: [
      "Gestion de tâches complète",
      "Calendrier avec navigation au swipe",
      "Statistiques de productivité",
      "Assistant IA et détection des retards",
    ],
    stack: [
      "React Native",
      "Expo",
      "TypeScript",
      "SQLite",
      "Drizzle ORM",
      "Zustand",
    ],
  },
  {
    slug: "lordson-congo",
    titre: "Lordson Congo",
    categorie: "Site web",
    annee: "2024",
    couleur: "#f2c862",
    lien: "https://candid-begonia-e3c199.netlify.app/",
    image: "/projets/lordson-congo.png",
    featured: true,
    description:
      "Site professionnel pour une entreprise d’offshore et d’échafaudage. Clarifier l’offre, inspirer confiance et rendre l’expertise lisible pour des clients industriels.",
    probleme:
      "L’entreprise n’avait pas de présence web à la hauteur de ses chantiers et de ses standards de sécurité.",
    fonctionnalites: [
      "Design sobre, adapté à un public B2B",
      "Présentation des services offshore et échafaudage",
      "Interface responsive",
      "Mise en avant de l’expertise terrain",
    ],
    stack: ["WordPress", "HTML", "PHP", "CSS"],
  },
  {
    slug: "dsi-box",
    titre: "DSI Box — no-code métier",
    categorie: "Plateforme",
    annee: "2024",
    couleur: "#7fd4e0",
    description:
      "Outil no-code pour DSI : objets métiers, vues tableau / formulaire / kanban, modules assemblés sans écrire de code applicatif.",
    probleme:
      "Les DSI attendaient trop longtemps une équipe de dev pour des outils internes pourtant répétitifs.",
    fonctionnalites: [
      "Objets métiers personnalisés",
      "Vues tableau, formulaire et kanban",
      "Construction de modules sans code",
      "Graphe d’assemblage (React Flow)",
    ],
    stack: [
      "React",
      "TypeScript",
      "Radix UI",
      "React Flow",
      "Zustand",
      "TanStack Query",
      "Zod",
    ],
  },
  {
    slug: "mediasoft",
    titre: "Mediasoft — devis & factures",
    categorie: "Application métier",
    annee: "2023",
    couleur: "#8fa8ff",
    description:
      "Application de devis et factures pour Mediasoft (France), via Ginov. Espace client pour consulter, espace admin pour piloter, organisation par glisser-déposer.",
    probleme:
      "Le suivi commercial mélangeait fichiers, e-mails et un système trop rigide pour l’équipe.",
    fonctionnalites: [
      "Gestion des devis et factures",
      "Interfaces client et administration",
      "Organisation par drag & drop",
      "Formulaires robustes",
    ],
    stack: [
      "React",
      "TypeScript",
      "Radix UI",
      "TanStack Query",
      "Zustand",
      "React Hook Form",
    ],
  },
  {
    slug: "pole-embal-mobile",
    titre: "Pole Embal Mobile",
    categorie: "Application mobile",
    annee: "2023",
    couleur: "#f0a060",
    description:
      "Application React Native développée pour Ginov : commandes, mode hors ligne et synchronisation, interface native pour les équipes terrain.",
    probleme:
      "Les commandes se perdaient dès que le réseau lâchait, ce qui est fréquent sur le terrain.",
    fonctionnalites: [
      "Application iOS / Android native",
      "Gestion des commandes",
      "Mode hors ligne",
      "Synchronisation avec l’API",
    ],
    stack: ["React Native", "JavaScript", "TypeScript"],
  },
  {
    slug: "decrea",
    titre: "Decrea — identité visuelle",
    categorie: "Site vitrine",
    annee: "2024",
    couleur: "#8fa8ff",
    lien: "https://decrea.vercel.app/",
    image: "/projets/decrea.png",
    description:
      "Site d’une agence spécialisée logos et identités. Montrer le goût, le portfolio et les offres sans alourdir la navigation.",
    probleme:
      "Une agence de design avait besoin d’un site aussi soigné que ses livrables.",
    fonctionnalites: [
      "Direction artistique épurée",
      "Présentation des services",
      "Portfolio de réalisations",
    ],
    stack: ["Next.js", "Tailwind CSS"],
  },
  {
    slug: "cogym",
    titre: "Cogym — entraînement personnalisé",
    categorie: "Plateforme",
    annee: "2024",
    couleur: "#6fe0b0",
    image: "/projets/cogym.png",
    description:
      "Plateforme d’entraînement personnalisé : programmes, suivi des utilisateurs et parcours simple pour s’exercer régulièrement.",
    probleme:
      "Il manquait un espace unique pour suivre un programme et l’assiduité des membres.",
    fonctionnalites: [
      "Entraînement personnalisé",
      "Gestion des utilisateurs",
      "Interface intuitive",
    ],
    stack: ["WordPress", "HTML", "PHP", "CSS"],
  },
  {
    slug: "gymo",
    titre: "Gymo — exercices & YouTube",
    categorie: "Application web",
    annee: "2024",
    couleur: "#f2c862",
    lien: "https://gymo.vercel.app/",
    image: "/projets/gymo.jpg",
    description:
      "Application pour trouver des exercices adaptés, avec démonstrations YouTube. Recherche, filtres et lecture intégrée.",
    probleme:
      "Les tutoriels sportifs sont éparpillés : il fallait un moteur simple, visuel, pour choisir un mouvement.",
    fonctionnalites: [
      "Recherche d’exercices",
      "Intégration YouTube",
      "Interface interactive",
    ],
    stack: ["React", "Tailwind CSS", "TypeScript", "Framer Motion"],
  },
  {
    slug: "pitcheur",
    titre: "Pitcheur — pitchs d’entrepreneurs",
    categorie: "Plateforme",
    annee: "2024",
    couleur: "#7fd4e0",
    lien: "https://pitcheur.vercel.app/",
    image: "/projets/pitcheur.jpg",
    description:
      "Espace pour présenter une idée, découvrir d’autres projets et croiser des profils. Auth via Clerk, pensé pour le networking.",
    probleme:
      "Les fondateurs n’avaient pas de vitrine courte, partageable, pour un pitch.",
    fonctionnalites: [
      "Pitch de projets",
      "Découverte de projets",
      "Networking",
      "Authentification Clerk",
    ],
    stack: ["Next.js", "Tailwind CSS", "TypeScript", "Clerk"],
  },
  {
    slug: "horizon",
    titre: "Horizon — fintech (démo)",
    categorie: "SaaS",
    annee: "2025",
    couleur: "#8fa8ff",
    description:
      "Démonstration technique d’une plateforme financière : agrégation de comptes, transactions et virements. Non déployée en production.",
    probleme:
      "Montrer qu’on peut assembler auth SSR, open banking et vues de dépenses dans un produit cohérent.",
    fonctionnalites: [
      "Authentification SSR",
      "Connexion de comptes via Plaid",
      "Solde agrégé et dépenses par catégorie",
      "Virements entre utilisateurs",
    ],
    stack: ["Next.js", "TypeScript", "Plaid"],
  },
  {
    slug: "dino-jump",
    titre: "Dino Jump",
    categorie: "Jeu web",
    annee: "2023",
    couleur: "#f0a060",
    lien: "https://dino-game-pearl.vercel.app/",
    image: "/projets/dino-jump.png",
    description:
      "Jeu de saut inspiré du dino Chrome : timing, obstacles, score. Un exercice de gameplay web, utile pour les animations et la boucle de jeu.",
    probleme:
      "S’entraîner à une boucle de jeu fluide, au clavier, sans moteur lourd.",
    fonctionnalites: [
      "Gameplay fluide",
      "Système de score",
      "Animations et collisions",
    ],
    stack: ["JavaScript"],
  },
];

export const experiences: Experience[] = [
  {
    periode: "2025 — aujourd’hui",
    titre: "Fondateur",
    lieu: "Apkaid Solution, Pointe-Noire",
    description:
      "Création du studio, du site, de l’offre et du suivi client. Sites, applications et UI/UX pour des entreprises au Congo et à l’étranger.",
    stack: ["Next.js", "TypeScript", "React Native", "UI/UX"],
  },
  {
    periode: "2023 — aujourd’hui",
    titre: "Développeur full-stack & mobile",
    lieu: "Ginov (France) & freelance",
    description:
      "Applications web et mobiles pour des clients français et locaux : React, Vue.js, NestJS, React Native. De la conception au déploiement.",
    stack: ["React", "Vue.js", "NestJS", "React Native", "TypeScript"],
  },
  {
    periode: "2023",
    titre: "Frontend Vue.js — Interstis",
    lieu: "France, via Ginov",
    description:
      "Application de gestion de calendriers, collaboration avec l’équipe Interstis, interface fluide côté planning.",
    stack: ["Vue.js", "JavaScript", "TypeScript"],
  },
  {
    periode: "2023",
    titre: "Frontend React.js — Mediasoft",
    lieu: "France, via Ginov",
    description:
      "Application de devis et de factures : parcours client et outils internes.",
    stack: ["React", "JavaScript", "TypeScript"],
  },
  {
    periode: "2023",
    titre: "Backend — chat temps réel",
    lieu: "Ginov",
    description:
      "API complète d’une messagerie temps réel avec NestJS et Socket.io.",
    stack: ["NestJS", "Socket.io", "Node.js", "TypeScript"],
  },
  {
    periode: "2022 — 2023",
    titre: "Développeur web",
    lieu: "Projets personnels & académiques",
    description:
      "Full-stack : authentification, CRUD, APIs REST. Mise en pratique des bases encore utilisées aujourd’hui.",
    stack: ["React", "Node.js", "MongoDB", "Express"],
  },
];

export const temoignage = {
  citation:
    "Travailler avec Michel Mouhani a été une expérience exceptionnelle. Son expertise, sa réactivité et son souci du détail ont permis de donner vie à notre vision. Michel a su comprendre nos besoins spécifiques et livrer un résultat qui dépasse nos attentes.",
  auteur: "Biko Ro Bieko Gilles",
  role: "CEO, Ginov",
} as const;

export const nav = [
  { href: "/", label: "Expérience" },
  { href: "/a-propos", label: "À propos" },
  { href: "/projets", label: "Projets" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
] as const;

export const featuredProjects = projets.filter((project) => project.featured);

export function getProject(slug: string): Project | undefined {
  return projets.find((project) => project.slug === slug);
}

export const seo = {
  titleDefault:
    "Michel Mouhani — Développeur & Apkaid Solution à Pointe-Noire",
  titleTemplate: "%s · Michel Mouhani",
  description:
    "Michel Mouhani, développeur et fondateur d’Apkaid Solution à Pointe-Noire. Sites vitrines, applications web et mobiles, e-commerce — conçus pour convertir et être trouvés.",
  keywords: [
    "développeur web Congo Brazzaville",
    "création site web Pointe-Noire",
    "agence digitale Pointe-Noire",
    "Apkaid Solution",
    "application mobile Congo",
    "site vitrine SEO Congo",
    "Michel Mouhani",
    "développeur freelance Congo",
    "studio digital Pointe-Noire",
  ],
};
