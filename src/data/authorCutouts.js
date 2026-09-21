/**
 * Curated Pre-Packaged Author Portraits & Cutouts
 * Embedded as clean vector silhouette portraits on transparent backgrounds
 * allowing instant demonstration without external network dependencies.
 */

// Helper to create high quality vector portrait SVG data URLs
function createVectorPortrait(theme, accentColor, features) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
    <defs>
      <linearGradient id="grad_${theme}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.95" />
        <stop offset="100%" stop-color="#111827" stop-opacity="0.8" />
      </linearGradient>
      <filter id="shadow_${theme}" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="rgba(0,0,0,0.5)"/>
      </filter>
    </defs>
    <g filter="url(#shadow_${theme})">
      <!-- Shoulders & Torso -->
      <path d="M 60 500 C 60 420, 100 370, 140 350 C 170 335, 230 335, 260 350 C 300 370, 340 420, 340 500 Z" fill="url(#grad_${theme})" />
      <!-- Neck -->
      <rect x="175" y="270" width="50" height="80" rx="8" fill="#e2d4c0" />
      <!-- Head Base -->
      <ellipse cx="200" cy="220" rx="72" ry="92" fill="#eddcc9" />
      <!-- Hair / Beard / Distinctive silhouette -->
      ${features}
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const PRESET_AUTHOR_PORTRAITS = [
  {
    id: 'marcus-aurelius',
    name: 'Marcus Aurelius',
    title: 'Roman Emperor & Stoic Philosopher',
    type: 'cutout',
    imageUrl: createVectorPortrait('marcus', '#d4af37', `
      <!-- Curly Philosopher Hair & Beard -->
      <path d="M 124 200 C 115 150, 140 115, 200 115 C 260 115, 285 150, 276 200 C 290 225, 285 300, 255 330 C 235 350, 165 350, 145 330 C 115 300, 110 225, 124 200 Z" fill="#8c7853" opacity="0.95" />
      <ellipse cx="200" cy="210" rx="60" ry="72" fill="#f3e5d3" />
      <!-- Laurels / Classical Features -->
      <path d="M 150 140 Q 200 120 250 140" stroke="#d4af37" stroke-width="6" fill="none" />
      <circle cx="180" cy="205" r="4" fill="#332a22" />
      <circle cx="220" cy="205" r="4" fill="#332a22" />
      <path d="M 175 250 Q 200 295 225 250 C 235 310, 165 310, 175 250 Z" fill="#716043" />
    `)
  },
  {
    id: 'seneca',
    name: 'Seneca',
    title: 'Stoic Statesman & Dramatist',
    type: 'cutout',
    imageUrl: createVectorPortrait('seneca', '#8b5cf6', `
      <!-- Receding Hair & Stoic Expression -->
      <path d="M 130 190 C 130 130, 160 115, 200 115 C 240 115, 270 130, 270 190 Z" fill="#52525b" />
      <ellipse cx="200" cy="215" rx="62" ry="78" fill="#ecd8c2" />
      <circle cx="180" cy="210" r="4" fill="#262626" />
      <circle cx="220" cy="210" r="4" fill="#262626" />
      <path d="M 190 252 Q 200 256 210 252" stroke="#44352a" stroke-width="3" fill="none" />
    `)
  },
  {
    id: 'steve-jobs',
    name: 'Steve Jobs',
    title: 'Visionary & Apple Co-Founder',
    type: 'cutout',
    imageUrl: createVectorPortrait('jobs', '#0ea5e9', `
      <!-- Black Turtleneck Collar & Round Spectacles -->
      <path d="M 160 330 C 160 300, 240 300, 240 330 Z" fill="#09090b" />
      <!-- Round Glasses -->
      <circle cx="178" cy="208" r="14" stroke="#18181b" stroke-width="3.5" fill="none" />
      <circle cx="222" cy="208" r="14" stroke="#18181b" stroke-width="3.5" fill="none" />
      <line x1="192" y1="208" x2="208" y2="208" stroke="#18181b" stroke-width="3.5" />
      <!-- Eyes & Subtle Smile -->
      <circle cx="178" cy="208" r="4" fill="#18181b" />
      <circle cx="222" cy="208" r="4" fill="#18181b" />
      <path d="M 188 248 Q 200 256 212 248" stroke="#332a22" stroke-width="3" fill="none" />
      <!-- Short Trimmed Beard -->
      <path d="M 160 225 C 160 290, 240 290, 240 225 C 230 280, 170 280, 160 225 Z" fill="#52525b" opacity="0.6" />
    `)
  },
  {
    id: 'albert-einstein',
    name: 'Albert Einstein',
    title: 'Theoretical Physicist',
    type: 'cutout',
    imageUrl: createVectorPortrait('einstein', '#f59e0b', `
      <!-- Wild Eccentric White Hair -->
      <path d="M 110 200 C 90 120, 150 80, 200 80 C 250 80, 310 120, 290 200 C 310 250, 280 290, 260 290 C 250 250, 150 250, 140 290 C 120 290, 90 250, 110 200 Z" fill="#e4e4e7" opacity="0.95" />
      <ellipse cx="200" cy="220" rx="58" ry="72" fill="#eed9c4" />
      <circle cx="180" cy="210" r="4.5" fill="#27272a" />
      <circle cx="220" cy="210" r="4.5" fill="#27272a" />
      <!-- Famous Bushy Mustache -->
      <path d="M 165 248 Q 200 240 235 248 C 225 268, 175 268, 165 248 Z" fill="#d4d4d8" />
    `)
  },
  {
    id: 'maya-angelou',
    name: 'Maya Angelou',
    title: 'Poet, Memoirist & Civil Rights Leader',
    type: 'cutout',
    imageUrl: createVectorPortrait('maya', '#ec4899', `
      <!-- Elegant Headwrap / Crown -->
      <path d="M 120 180 C 120 90, 280 90, 280 180 Z" fill="#701a75" />
      <ellipse cx="200" cy="225" rx="64" ry="75" fill="#6d4c41" />
      <circle cx="178" cy="218" r="4.5" fill="#1c1917" />
      <circle cx="222" cy="218" r="4.5" fill="#1c1917" />
      <path d="M 180 262 Q 200 275 220 262" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none" />
    `)
  },
  {
    id: 'leonardo-da-vinci',
    name: 'Leonardo da Vinci',
    title: 'Polymath & Artist',
    type: 'cutout',
    imageUrl: createVectorPortrait('davinci', '#10b981', `
      <!-- Flowing Renaissance Hair & Beard -->
      <path d="M 115 180 C 110 90, 290 90, 285 180 C 310 280, 270 380, 200 390 C 130 380, 90 280, 115 180 Z" fill="#cbd5e1" />
      <ellipse cx="200" cy="215" rx="58" ry="70" fill="#edd6bf" />
      <circle cx="180" cy="205" r="4" fill="#332a22" />
      <circle cx="220" cy="205" r="4" fill="#332a22" />
    `)
  },
  {
    id: 'friedrich-nietzsche',
    name: 'Friedrich Nietzsche',
    title: 'Philosopher & Cultural Critic',
    type: 'cutout',
    imageUrl: createVectorPortrait('nietzsche', '#ef4444', `
      <!-- Deep Piercing Gaze & Legendary Giant Walrus Mustache -->
      <path d="M 130 180 C 130 110, 270 110, 270 180 Z" fill="#3f3f46" />
      <ellipse cx="200" cy="215" rx="58" ry="70" fill="#edd7c0" />
      <circle cx="178" cy="200" r="4" fill="#18181b" />
      <circle cx="222" cy="200" r="4" fill="#18181b" />
      <!-- Giant Mustache Covering Mouth -->
      <path d="M 145 235 Q 200 215 255 235 C 265 295, 135 295, 145 235 Z" fill="#27272a" />
    `)
  },
  {
    id: 'oscar-wilde',
    name: 'Oscar Wilde',
    title: 'Poet, Playwright & Wit',
    type: 'cutout',
    imageUrl: createVectorPortrait('wilde', '#6366f1', `
      <!-- Dandy Velvet Hair & Carnation -->
      <path d="M 125 190 C 115 110, 285 110, 275 190 C 285 240, 260 270, 200 270 C 140 270, 115 240, 125 190 Z" fill="#451a03" />
      <ellipse cx="200" cy="218" rx="60" ry="72" fill="#fae8d4" />
      <circle cx="178" cy="210" r="4" fill="#1c1917" />
      <circle cx="222" cy="210" r="4" fill="#1c1917" />
      <!-- Wry Smirk -->
      <path d="M 185 254 Q 202 260 218 250" stroke="#78350f" stroke-width="3" fill="none" />
    `)
  }
];
