/**
 * Seed Community Quotes across categories with ready-to-remix design templates
 */

export const COMMUNITY_CATEGORIES = [
  { id: 'all', label: 'All Community', count: 12 },
  { id: 'Wisdom', label: 'Wisdom & Philosophy', count: 4 },
  { id: 'Motivation', label: 'Motivation & Hustle', count: 3 },
  { id: 'Tech', label: 'Tech & Design', count: 2 },
  { id: 'Leadership', label: 'Leadership', count: 2 },
  { id: 'Poetry', label: 'Poetry & Art', count: 1 }
];

export const INITIAL_COMMUNITY_QUOTES = [
  {
    id: 'comm-1',
    quote: "Waste no more time arguing what a good man should be. Be one.",
    author: "Marcus Aurelius",
    category: "Wisdom",
    handle: "@stoic_daily",
    date: "Sep 2026",
    likes: 142,
    downloads: 89,
    creatorName: "AureliusClub",
    ratio: '1:1',
    presetId: 'editorial-vogue',
    customStyles: {
      background: '#f8f5f0',
      textColor: '#18181b',
      accentColor: '#78350f',
      fontFamily: 'Playfair Display',
      authorFontFamily: 'Plus Jakarta Sans',
      textAlign: 'center',
      quoteMarkStyle: 'classic',
      cardStyle: 'bordered',
      gradient: null
    }
  },
  {
    id: 'comm-2',
    quote: "First do it, then do it right, then do it better.",
    author: "Addy Osmani",
    category: "Tech",
    handle: "@webcraft",
    date: "Sep 2026",
    likes: 218,
    downloads: 134,
    creatorName: "DevCraft",
    ratio: '1:1',
    presetId: 'cyber-neon',
    customStyles: {
      background: '#090a0f',
      textColor: '#f8fafc',
      accentColor: '#00f2fe',
      fontFamily: 'Space Grotesk',
      authorFontFamily: 'Space Mono',
      textAlign: 'left',
      quoteMarkStyle: 'modern-brackets',
      cardStyle: 'glass',
      gradient: 'linear-gradient(135deg, #090a0f 0%, #17153b 50%, #0f172a 100%)'
    }
  },
  {
    id: 'comm-3',
    quote: "He who has a why to live can bear almost any how.",
    author: "Friedrich Nietzsche",
    category: "Wisdom",
    handle: "@deep_thoughts",
    date: "Sep 2026",
    likes: 310,
    downloads: 195,
    creatorName: "Existentialist",
    ratio: '4:5',
    presetId: 'luxury-noir-gold',
    customStyles: {
      background: '#0a0a0c',
      textColor: '#faf5ea',
      accentColor: '#d4af37',
      fontFamily: 'Cinzel',
      authorFontFamily: 'Playfair Display',
      textAlign: 'center',
      quoteMarkStyle: 'decorative-stars',
      cardStyle: 'bordered',
      gradient: 'radial-gradient(ellipse at center, #1b1a17 0%, #0a0a0c 80%)'
    }
  },
  {
    id: 'comm-4',
    quote: "Simplicity is about subtracting the obvious and adding the meaningful.",
    author: "John Maeda",
    category: "Tech",
    handle: "@laws_of_simplicity",
    date: "Sep 2026",
    likes: 189,
    downloads: 112,
    creatorName: "DesignMinimal",
    ratio: '1:1',
    presetId: 'swiss-bauhaus',
    customStyles: {
      background: '#fffff8',
      textColor: '#111111',
      accentColor: '#e11d48',
      fontFamily: 'Plus Jakarta Sans',
      authorFontFamily: 'Plus Jakarta Sans',
      textAlign: 'left',
      quoteMarkStyle: 'minimal-dash',
      cardStyle: 'flat',
      gradient: null
    }
  },
  {
    id: 'comm-5',
    quote: "The miracle is not to walk on water. The miracle is to walk on the green earth in the present moment.",
    author: "Thich Nhat Hanh",
    category: "Wisdom",
    handle: "@mindfulpeace",
    date: "Sep 2026",
    likes: 275,
    downloads: 160,
    creatorName: "SerenityNow",
    ratio: '9:16',
    presetId: 'organic-earth',
    customStyles: {
      background: '#f4ede4',
      textColor: '#2c2523',
      accentColor: '#964b32',
      fontFamily: 'Merriweather',
      authorFontFamily: 'Plus Jakarta Sans',
      textAlign: 'center',
      quoteMarkStyle: 'classic',
      cardStyle: 'shadowed',
      gradient: null
    }
  },
  {
    id: 'comm-6',
    quote: "Discipline equals freedom.",
    author: "Jocko Willink",
    category: "Motivation",
    handle: "@grindset",
    date: "Sep 2026",
    likes: 420,
    downloads: 301,
    creatorName: "TitanMentality",
    ratio: '1:1',
    presetId: 'monochrome-brutalism',
    customStyles: {
      background: '#ffffff',
      textColor: '#000000',
      accentColor: '#000000',
      fontFamily: 'Space Grotesk',
      authorFontFamily: 'Space Mono',
      textAlign: 'left',
      quoteMarkStyle: 'minimal-dash',
      cardStyle: 'brutalist-card',
      gradient: null
    }
  },
  {
    id: 'comm-7',
    quote: "Lead from the back — and let others believe they are in front.",
    author: "Nelson Mandela",
    category: "Leadership",
    handle: "@leadership_hub",
    date: "Sep 2026",
    likes: 198,
    downloads: 94,
    creatorName: "GlobalLeaders",
    ratio: '16:9',
    presetId: 'deep-ocean-mystic',
    customStyles: {
      background: '#04101e',
      textColor: '#e0f2fe',
      accentColor: '#38bdf8',
      fontFamily: 'Playfair Display',
      authorFontFamily: 'Outfit',
      textAlign: 'center',
      quoteMarkStyle: 'classic',
      cardStyle: 'glass',
      gradient: 'linear-gradient(160deg, #020617 0%, #0c2b4e 50%, #064e3b 100%)'
    }
  },
  {
    id: 'comm-8',
    quote: "The cure for anything is salt water: sweat, tears or the sea.",
    author: "Isak Dinesen",
    category: "Poetry",
    handle: "@literary_souls",
    date: "Sep 2026",
    likes: 245,
    downloads: 153,
    creatorName: "PoetParchment",
    ratio: '4:5',
    presetId: 'handwritten-journal',
    customStyles: {
      background: '#faf6ee',
      textColor: '#292524',
      accentColor: '#b45309',
      fontFamily: 'Caveat',
      authorFontFamily: 'Plus Jakarta Sans',
      textAlign: 'center',
      quoteMarkStyle: 'classic',
      cardStyle: 'polaroid',
      gradient: null
    }
  }
];
