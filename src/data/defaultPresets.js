/**
 * Comprehensive Catalog of 280+ Unique Design Templates Across 11 Categories,
 * 50 Portrait Placements on Canvas, and 50 Dynamic Layout Rearrangements.
 */

import { EDITORIAL_PRESETS } from './presets/editorialPresets.js';
import { DARK_PRESETS } from './presets/darkPresets.js';
import { VIBRANT_PRESETS } from './presets/vibrantPresets.js';
import { LUXURY_PRESETS } from './presets/luxuryPresets.js';
import { BRUTALIST_PRESETS } from './presets/brutalistPresets.js';
import { RETRO_PRESETS } from './presets/retroPresets.js';
import { EARTHY_PRESETS } from './presets/earthyPresets.js';
import { MINIMALIST_PRESETS } from './presets/minimalistPresets.js';
import { GLASSMORPHISM_PRESETS } from './presets/glassmorphismPresets.js';
import { PASTEL_PRESETS } from './presets/pastelPresets.js';
import { GEOMETRY_PRESETS } from './presets/geometryPresets.js';

export const PRESET_CATEGORIES = [
  { id: 'all', label: 'All Themes (280+)', icon: 'sparkles' },
  { id: 'geometry', label: 'Abstract Lines & Geometry (70)', icon: 'shapes' },
  { id: 'editorial', label: 'Editorial & Magazine (25)', icon: 'newspaper' },
  { id: 'dark', label: 'Dark & Noir (23)', icon: 'moon' },
  { id: 'vibrant', label: 'Cyberpunk & Neon (22)', icon: 'zap' },
  { id: 'luxury', label: 'Luxury & Gold (22)', icon: 'crown' },
  { id: 'brutalist', label: 'Brutalist & Raw (22)', icon: 'box' },
  { id: 'retro', label: 'Retro & Vintage (22)', icon: 'disc' },
  { id: 'earthy', label: 'Organic & Earth (21)', icon: 'leaf' },
  { id: 'minimalist', label: 'Minimalist & Clean (21)', icon: 'feather' },
  { id: 'glassmorphism', label: 'Glass & Aurora (21)', icon: 'layers' },
  { id: 'pastel', label: 'Pastel & Aesthetic (21)', icon: 'gem' }
];

export const FONT_FAMILIES = [
  { id: 'Playfair Display', label: 'Playfair Display (Editorial Serif)', type: 'serif' },
  { id: 'Cinzel', label: 'Cinzel (Classical Luxury)', type: 'serif' },
  { id: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans (Modern Clean)', type: 'sans' },
  { id: 'Syne', label: 'Syne (Avant-Garde Display)', type: 'display' },
  { id: 'Space Grotesk', label: 'Space Grotesk (Neo-Brutalist)', type: 'sans' },
  { id: 'Space Mono', label: 'Space Mono (Tech Monospace)', type: 'mono' },
  { id: 'Montserrat', label: 'Montserrat (Geometric Sans)', type: 'sans' },
  { id: 'Caveat', label: 'Caveat (Personal Handwritten)', type: 'script' },
  { id: 'Outfit', label: 'Outfit (Sleek Contemporary)', type: 'sans' },
  { id: 'Merriweather', label: 'Merriweather (Literary Serif)', type: 'serif' }
];

export const CANVAS_FORMATS = [
  {
    id: '1:1',
    label: 'Square (1:1)',
    sublabel: 'Instagram, LinkedIn, Threads, Profile',
    aspectRatio: 1,
    width: 1080,
    height: 1080,
    icon: 'square'
  },
  {
    id: '9:16',
    label: 'Story / Reel (9:16)',
    sublabel: 'Instagram Story, TikTok, YouTube Shorts',
    aspectRatio: 9 / 16,
    width: 1080,
    height: 1920,
    icon: 'smartphone'
  },
  {
    id: '4:5',
    label: 'Portrait (4:5)',
    sublabel: 'Instagram Feed, Pinterest, High-engagement',
    aspectRatio: 4 / 5,
    width: 1080,
    height: 1350,
    icon: 'portrait'
  },
  {
    id: '16:9',
    label: 'Landscape (16:9)',
    sublabel: 'Twitter / X, Presentation, YouTube Banner',
    aspectRatio: 16 / 9,
    width: 1920,
    height: 1080,
    icon: 'monitor'
  }
];

/**
 * 50 PORTRAIT PLACEMENTS ON CANVAS
 */
export const PORTRAIT_PLACEMENTS = [
  // Cutout Placements (1-12)
  { id: 'cutout-right', label: 'Cutout Right Full', type: 'cutout', desc: 'Author cutout on the right side' },
  { id: 'cutout-left', label: 'Cutout Left Full', type: 'cutout', desc: 'Author cutout on the left side' },
  { id: 'cutout-bottom', label: 'Cutout Bottom Center', type: 'cutout', desc: 'Author cutout rising from bottom center' },
  { id: 'cutout-bottom-left', label: 'Cutout Bottom Left', type: 'cutout', desc: 'Author cutout rising from bottom left' },
  { id: 'cutout-bottom-right', label: 'Cutout Bottom Right', type: 'cutout', desc: 'Author cutout rising from bottom right' },
  { id: 'cutout-top-right', label: 'Cutout Top Right', type: 'cutout', desc: 'Author cutout anchored in top right' },
  { id: 'cutout-top-left', label: 'Cutout Top Left', type: 'cutout', desc: 'Author cutout anchored in top left' },
  { id: 'cutout-edge-left', label: 'Cutout Side Peek Left', type: 'cutout', desc: 'Author peeking from left canvas edge' },
  { id: 'cutout-edge-right', label: 'Cutout Side Peek Right', type: 'cutout', desc: 'Author peeking from right canvas edge' },
  { id: 'cutout-hero-center', label: 'Cutout Hero Center', type: 'cutout', desc: 'Prominent center cutout behind quote' },
  { id: 'cutout-angle-bottom', label: 'Cutout Slanted Base', type: 'cutout', desc: 'Angled author cutout at base' },
  { id: 'cutout-side-peek', label: 'Cutout Corner Pop', type: 'cutout', desc: 'Dynamic bottom-corner pop-in' },

  // Circular & Squircle Avatars (13-24)
  { id: 'avatar-top-center', label: 'Avatar Top Center', type: 'avatar', desc: 'Round avatar badge crowned at top' },
  { id: 'avatar-top-left', label: 'Avatar Top Left', type: 'avatar', desc: 'Round avatar positioned top-left' },
  { id: 'avatar-top-right', label: 'Avatar Top Right', type: 'avatar', desc: 'Round avatar positioned top-right' },
  { id: 'avatar-bottom-center', label: 'Avatar Bottom Center', type: 'avatar', desc: 'Round avatar centered above author name' },
  { id: 'avatar-bottom-left', label: 'Avatar Bottom Left', type: 'avatar', desc: 'Round avatar next to bottom author signature' },
  { id: 'avatar-bottom-right', label: 'Avatar Bottom Right', type: 'avatar', desc: 'Round avatar bottom right signature' },
  { id: 'avatar-mid-left', label: 'Avatar Mid Left', type: 'avatar', desc: 'Avatar anchored along left margin' },
  { id: 'avatar-mid-right', label: 'Avatar Mid Right', type: 'avatar', desc: 'Avatar anchored along right margin' },
  { id: 'avatar-quote-inline', label: 'Avatar Inline Quote', type: 'avatar', desc: 'Avatar embedded directly with speech' },
  { id: 'avatar-header-badge', label: 'Avatar Pill Header', type: 'avatar', desc: 'Avatar embedded in header metadata pill' },
  { id: 'avatar-footer-card', label: 'Avatar Floating Card', type: 'avatar', desc: 'Avatar inside footer glass card' },
  { id: 'avatar-double-ring', label: 'Avatar Gold Double Ring', type: 'avatar', desc: 'Avatar framed in concentric luxury rings' },

  // Geometric Shapes & Architectural Portals (25-38)
  { id: 'oval-cameo-center', label: 'Oval Cameo Center', type: 'frame', desc: 'Classical Victorian oval cameo' },
  { id: 'hexagon-badge-top', label: 'Hexagon Badge Top', type: 'frame', desc: 'Modern geometric hexagon badge' },
  { id: 'diamond-inset-center', label: 'Diamond Inset Center', type: 'frame', desc: 'Diamond rhombus rotated portal' },
  { id: 'arch-portal-center', label: 'Neoclassical Arch Center', type: 'frame', desc: 'Roman architectural rounded arch' },
  { id: 'arch-portal-left', label: 'Neoclassical Arch Left', type: 'frame', desc: 'Arch portal frame on the left' },
  { id: 'polaroid-card-bottom', label: 'Polaroid Card Slot', type: 'frame', desc: 'Photo inside polaroid frame' },
  { id: 'stamp-perforated-corner', label: 'Postage Stamp Inset', type: 'frame', desc: 'Perforated stamp in upper corner' },
  { id: 'film-cell-inset', label: '35mm Film Frame', type: 'frame', desc: 'Portrait in 35mm film cell' },
  { id: 'bookmark-vertical-strip', label: 'Bookmark Strip Left', type: 'frame', desc: 'Vertical bookmark strip container' },
  { id: 'monogram-seal-top', label: 'Monogram Seal Crown', type: 'frame', desc: 'Royal wax seal frame' },
  { id: 'pedestal-base-center', label: 'Museum Pedestal Base', type: 'frame', desc: 'Marble bust pedestal base' },
  { id: 'shadowbox-inset-right', label: 'Shadowbox Card Right', type: 'frame', desc: 'Card with hard offset shadow' },
  { id: 'shadowbox-inset-left', label: 'Shadowbox Card Left', type: 'frame', desc: 'Left card with drop shadow' },
  { id: 'rounded-card-center', label: 'Floating Squircle Center', type: 'frame', desc: 'Centered floating rounded card' },

  // Environmental & Full-Bleed Blends (39-50)
  { id: 'scrim', label: 'Full Scrim Underlay', type: 'blend', desc: 'Full-bleed image under dark vignette' },
  { id: 'scrim-radial', label: 'Radial Spotlight Scrim', type: 'blend', desc: 'Center highlight with dark edges' },
  { id: 'scrim-split-left', label: 'Split Scrim Left', type: 'blend', desc: 'Photo under left half with dark right' },
  { id: 'scrim-split-right', label: 'Split Scrim Right', type: 'blend', desc: 'Photo under right half with dark left' },
  { id: 'silhouette-back-glow', label: 'Silhouette Back-Glow', type: 'blend', desc: 'Glowing contour silhouette' },
  { id: 'half-screen-left', label: 'Half Screen Split Left', type: 'blend', desc: 'Clean 50% left photo panel' },
  { id: 'half-screen-right', label: 'Half Screen Split Right', type: 'blend', desc: 'Clean 50% right photo panel' },
  { id: 'diagonal-slice-bg', label: 'Diagonal Slice Photo', type: 'blend', desc: 'Angled slice photo backdrop' },
  { id: 'top-banner-strip', label: 'Top Banner Landscape', type: 'blend', desc: 'Upper horizontal landscape strip' },
  { id: 'bottom-banner-strip', label: 'Bottom Banner Landscape', type: 'blend', desc: 'Lower horizontal landscape strip' },
  { id: 'soft-vignette-center', label: 'Soft Fog Vignette', type: 'blend', desc: 'Subtle feathered central photo' },
  { id: 'duotone-underlay', label: 'Duotone Graphic Blend', type: 'blend', desc: 'Stylized 2-color photo underlay' }
];

/**
 * 50 DISTINCT QUOTE LAYOUT REARRANGEMENTS
 */
export const LAYOUT_CATEGORIES = [
  { id: 'all', label: 'All Layouts (50)' },
  { id: 'author', label: 'Author & Cutout Focus' },
  { id: 'editorial', label: 'Magazine & Editorial' },
  { id: 'expressive', label: 'Expressive & Display' },
  { id: 'minimalist', label: 'Clean & Minimalist' },
  { id: 'novelty', label: 'Creative & Novelty' }
];

export const LAYOUT_STYLES = [
  // 1. Author & Cutout Focus (1-10)
  { id: 'cutout-right', name: 'Author Cutout Right', category: 'author', icon: 'user', portraitPlacement: 'cutout-right', description: 'Quote on left, author standing on right with natural drop shadow.' },
  { id: 'cutout-left', name: 'Author Cutout Left', category: 'author', icon: 'user', portraitPlacement: 'cutout-left', description: 'Author portrait cutout on the left with quote text on right.' },
  { id: 'cutout-bottom', name: 'Bottom Pop-Out Portrait', category: 'author', icon: 'user', portraitPlacement: 'cutout-bottom', description: 'Quote framed on top while author rises prominently from bottom.' },
  { id: 'split-50', name: '50/50 Split Canvas', category: 'author', icon: 'columns', portraitPlacement: 'cutout-left', description: 'Canvas partitioned into two contrasting color blocks.' },
  { id: 'avatar-pill-top', name: 'Author Avatar Header', category: 'author', icon: 'tag', portraitPlacement: 'avatar-top-center', description: 'Circular author avatar with name and badge anchored at top.' },
  { id: 'avatar-bottom-card', name: 'Author Card Footer', category: 'author', icon: 'user', portraitPlacement: 'avatar-bottom-left', description: 'Frosted bio card at base containing author photo and handle.' },
  { id: 'scrim-overlay', name: 'Full-Bleed Scrim Overlay', category: 'author', icon: 'image', portraitPlacement: 'scrim', description: 'Author image expands across canvas behind dark vignette.' },
  { id: 'dual-speaker', name: 'Author Speech Dialogue', category: 'author', icon: 'message', portraitPlacement: 'avatar-mid-left', description: 'Author portrait pointing directly into an elegant speech card.' },
  { id: 'circular-vignette', name: 'Circular Cameo Frame', category: 'author', icon: 'sparkle', portraitPlacement: 'oval-cameo-center', description: 'Portrait housed in a neoclassical round medallion crowned above quote.' },
  { id: 'sidebar-profile', name: 'Vertical Sidebar Profile', category: 'author', icon: 'columns', portraitPlacement: 'bookmark-vertical-strip', description: 'Narrow side strip for author photo; wide quadrant for typography.' },

  // 2. Magazine & Editorial (11-20)
  { id: 'classic-centered', name: 'Classic Vogue Editorial', category: 'editorial', icon: 'newspaper', portraitPlacement: 'avatar-top-center', description: 'Harmonious center-aligned typography with curly quote marks.' },
  { id: 'magazine-cover', name: 'Magazine Cover Masthead', category: 'editorial', icon: 'newspaper', portraitPlacement: 'scrim', description: 'Publication title masthead across top, bold headline quote.' },
  { id: 'pull-quote-rules', name: 'Editorial Pull Quote', category: 'editorial', icon: 'type', portraitPlacement: 'none', description: 'Upper and lower horizontal hairline rules framing statement.' },
  { id: 'dropcap-literary', name: 'Initial Drop Cap Letter', category: 'editorial', icon: 'type', portraitPlacement: 'none', description: 'First letter rendered as an opulent giant serif display cap.' },
  { id: 'newspaper-headline', name: 'Broadsheet Front Page', category: 'editorial', icon: 'newspaper', portraitPlacement: 'cutout-right', description: 'Multi-tiered newspaper headline styling with date stamp.' },
  { id: 'book-spread', name: 'Open Book Spread', category: 'editorial', icon: 'fileText', portraitPlacement: 'none', description: 'Simulates the refined open typography of a hardbound book.' },
  { id: 'interview-qa', name: 'Interview Q&A Block', category: 'editorial', icon: 'message', portraitPlacement: 'avatar-top-left', description: 'Prompt in bold grotesque sans, reply in warm reflective serif.' },
  { id: 'manifesto-numbered', name: 'Numbered Principle', category: 'editorial', icon: 'fileText', portraitPlacement: 'none', description: 'Giant Roman numeral or index number anchored above axiom.' },
  { id: 'museum-plaque', name: 'Gallery Museum Label', category: 'editorial', icon: 'layout', portraitPlacement: 'none', description: 'Quiet, sparse, high-culture layout modeled on art museum labels.' },
  { id: 'monocle-brief', name: 'Monocle Global Brief', category: 'editorial', icon: 'globe', portraitPlacement: 'avatar-top-right', description: 'Strict grid layout with topic coordinates and author caption.' },

  // 3. Expressive & Display (21-30)
  { id: 'big-watermark', name: 'Giant Watermark Marks', category: 'expressive', icon: 'quote', portraitPlacement: 'none', description: 'Huge 400px quotation marks faded softly into background.' },
  { id: 'hero-word-scale', name: 'Display Word Highlight', category: 'expressive', icon: 'sparkles', portraitPlacement: 'none', description: 'First key phrase rendered in colossal display font.' },
  { id: 'diagonal-kinetic', name: 'Diagonal Kinetic Type', category: 'expressive', icon: 'sliders', portraitPlacement: 'none', description: 'Dynamic angled canvas layout imparting speed and motion.' },
  { id: 'billboard-heavy', name: 'Massive Billboard Sans', category: 'expressive', icon: 'type', portraitPlacement: 'none', description: 'High-impact, tight line-height, zero-margin type.' },
  { id: 'highlight-marker', name: 'Fluorescent Highlighter', category: 'expressive', icon: 'paintbrush', portraitPlacement: 'none', description: 'Core concepts underlined with glowing neon or pastel stripes.' },
  { id: 'comic-pop', name: 'Comic Book Graphic Pop', category: 'expressive', icon: 'zap', portraitPlacement: 'avatar-top-left', description: 'Pop art halftone dots with speech burst and action author tag.' },
  { id: 'stencil-spray', name: 'Street Stencil Graffiti', category: 'expressive', icon: 'paintbrush', portraitPlacement: 'none', description: 'Urban street aesthetic with textured stencil borders.' },
  { id: 'boxed-words', name: 'Individually Boxed Words', category: 'expressive', icon: 'box', portraitPlacement: 'none', description: 'Words isolated inside alternating dark and light solid blocks.' },
  { id: 'audio-wave', name: 'Podcast Audio Waveform', category: 'expressive', icon: 'radio', portraitPlacement: 'avatar-bottom-left', description: 'Graphic visualizer waveform beneath quote with playback bar.' },
  { id: 'cinema-subtitles', name: 'Cinematic Movie Subtitle', category: 'expressive', icon: 'tv', portraitPlacement: 'scrim', description: '16:9 letterboxed cinema frame with yellow subtitle text.' },

  // 4. Clean & Minimalist (31-40)
  { id: 'left-accent-bar', name: 'Modern Left Accent Bar', category: 'minimalist', icon: 'alignLeft', portraitPlacement: 'none', description: 'Left-aligned text with a bold vertical colored accent stripe.' },
  { id: 'swiss-asymmetric', name: 'Swiss Modernist Grid', category: 'minimalist', icon: 'layout', portraitPlacement: 'none', description: 'Stark geometric arrangement adhering to asymmetric Swiss grids.' },
  { id: 'right-aligned-minimal', name: 'Poetic Right-Aligned', category: 'minimalist', icon: 'alignRight', portraitPlacement: 'none', description: 'Text hugging right margin with ample negative space on left.' },
  { id: 'horizontal-ribbon', name: 'Horizontal Central Ribbon', category: 'minimalist', icon: 'alignCenter', portraitPlacement: 'none', description: 'Quote encapsulated within a single horizontal band.' },
  { id: 'corner-anchors', name: 'Four-Corner Metadata', category: 'minimalist', icon: 'square', portraitPlacement: 'none', description: 'Category top-left, Date top-right, Watermark bottom-right, Author bottom-left.' },
  { id: 'framed-inset', name: 'Neat Inset Border', category: 'minimalist', icon: 'square', portraitPlacement: 'none', description: 'Ultra-thin elegant border floating 40px inset from perimeter.' },
  { id: 'zen-circle', name: 'Zen Ensō Circle', category: 'minimalist', icon: 'sparkle', portraitPlacement: 'none', description: 'Minimal brushstroke circle enclosing central quote.' },
  { id: 'dotted-grid-bg', name: 'Architectural Dot Matrix', category: 'minimalist', icon: 'shapes', portraitPlacement: 'none', description: 'Clean engineer dot grid background with monospaced annotations.' },
  { id: 'split-diagonal', name: 'Diagonal Color Split', category: 'minimalist', icon: 'columns', portraitPlacement: 'none', description: 'Clean angled color contrast bisecting canvas into light and dark.' },
  { id: 'clean-index-card', name: 'Archival Index Card', category: 'minimalist', icon: 'fileText', portraitPlacement: 'none', description: 'Faint ruled lines recalling vintage 3x5 library index cards.' },

  // 5. Creative & Novelty (41-50)
  { id: 'tweet-card', name: 'Social Verified Tweet Card', category: 'novelty', icon: 'message', portraitPlacement: 'avatar-bottom-left', description: 'Twitter/X style verified social media card with avatar and metrics.' },
  { id: 'polaroid-photo', name: 'Instant Polaroid Snapshot', category: 'novelty', icon: 'camera', portraitPlacement: 'polaroid-card-bottom', description: 'Iconic white Polaroid film border with handwritten caption.' },
  { id: 'terminal-code', name: 'Developer Terminal Window', category: 'novelty', icon: 'monitor', portraitPlacement: 'none', description: 'CRT code console with macOS traffic light buttons.' },
  { id: 'sticky-note', name: 'Post-It Sticky Memo', category: 'novelty', icon: 'fileText', portraitPlacement: 'none', description: 'Yellow sticky note with realistic dropped shadow and pin.' },
  { id: 'boarding-pass', name: 'Airline Boarding Pass Stub', category: 'novelty', icon: 'tag', portraitPlacement: 'none', description: 'Perforated travel ticket with destination coordinates.' },
  { id: 'receipt-pos', name: 'Thermal Store Receipt', category: 'novelty', icon: 'fileText', portraitPlacement: 'none', description: 'Crinkled store receipt with zig-zag tear edges.' },
  { id: 'film-strip', name: '35mm Film Roll Negative', category: 'novelty', icon: 'tv', portraitPlacement: 'film-cell-inset', description: 'Kodak 35mm film strip with sprocket perforations.' },
  { id: 'cassette-tape', name: 'Mixtape Cassette Label', category: 'novelty', icon: 'disc', portraitPlacement: 'none', description: 'Analog cassette spool graphic with handwritten A-side label.' },
  { id: 'postage-stamp', name: 'Vintage Postage Stamp', category: 'novelty', icon: 'image', portraitPlacement: 'stamp-perforated-corner', description: 'Scalloped serrated stamp edges with postal ink cancellation.' },
  { id: 'blueprint-cyan', name: 'Engineering Blueprint', category: 'novelty', icon: 'shapes', portraitPlacement: 'none', description: 'Deep Prussian blue grid background with draftsman lettering.' }
];

export const ABSTRACT_GEOMETRIC_THEMES = GEOMETRY_PRESETS;

export const DEFAULT_PRESETS = [
  ...GEOMETRY_PRESETS,
  ...EDITORIAL_PRESETS,
  ...DARK_PRESETS,
  ...VIBRANT_PRESETS,
  ...LUXURY_PRESETS,
  ...BRUTALIST_PRESETS,
  ...RETRO_PRESETS,
  ...EARTHY_PRESETS,
  ...MINIMALIST_PRESETS,
  ...GLASSMORPHISM_PRESETS,
  ...PASTEL_PRESETS
];
