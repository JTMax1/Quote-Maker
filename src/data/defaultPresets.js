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
  // Cutout Placements (1-25)
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
  { id: 'cutout-center-bottom-large', label: 'Cutout Grand Bust Center', type: 'cutout', desc: 'Heroic rising torso anchored at center base' },
  { id: 'cutout-floating-top', label: 'Cutout Floating Top', type: 'cutout', desc: 'Suspended cutout in upper canvas quadrant' },
  { id: 'cutout-left-offset', label: 'Cutout Left Indent', type: 'cutout', desc: 'Cutout inset 25% from left margin' },
  { id: 'cutout-right-offset', label: 'Cutout Right Indent', type: 'cutout', desc: 'Cutout inset 25% from right margin' },
  { id: 'cutout-diagonal-left', label: 'Cutout Cantilever Left', type: 'cutout', desc: 'Dynamic diagonal posture from lower-left' },
  { id: 'cutout-diagonal-right', label: 'Cutout Cantilever Right', type: 'cutout', desc: 'Dynamic diagonal posture from lower-right' },
  { id: 'cutout-cinematic-wide', label: 'Cutout Cinematic Panoramic', type: 'cutout', desc: 'Wide atmospheric torso profile' },
  { id: 'cutout-vertical-center', label: 'Cutout Column Divider', type: 'cutout', desc: 'Vertical spine cutout splitting quote columns' },
  { id: 'cutout-split-peek-bottom', label: 'Cutout Quote Arch Peek', type: 'cutout', desc: 'Portrait framing between double quotation marks' },
  { id: 'cutout-monochrome-glow', label: 'Cutout Radiant Aura', type: 'cutout', desc: 'Silhouette with luminous contour halo' },
  { id: 'cutout-side-profile-left', label: 'Cutout Profile Inward Left', type: 'cutout', desc: 'Inward gaze profile from left edge' },
  { id: 'cutout-side-profile-right', label: 'Cutout Profile Inward Right', type: 'cutout', desc: 'Inward gaze profile from right edge' },
  { id: 'cutout-grounded-pedestal', label: 'Cutout Foundation Torso', type: 'cutout', desc: 'Firmly baseline-grounded author silhouette' },

  // Circular & Squircle Avatars (26-50)
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
  { id: 'avatar-badge-mid-top', label: 'Avatar Crowned Crest', type: 'avatar', desc: 'Large centered avatar medallion with metallic ring' },
  { id: 'avatar-triple-ring', label: 'Avatar Orbital Trinity', type: 'avatar', desc: 'Three concentric gyroscopic vector rings' },
  { id: 'avatar-square-bevel', label: 'Avatar Brutalist Bevel', type: 'avatar', desc: 'Neo-brutalist square portrait avatar' },
  { id: 'avatar-hexagon-corner', label: 'Avatar Hex Shield Corner', type: 'avatar', desc: 'Hexagonal author token in upper corner' },
  { id: 'avatar-squircle-left', label: 'Avatar Squircle Bio', type: 'avatar', desc: 'Smooth squircle badge aligned with quotation text' },
  { id: 'avatar-inline-signature', label: 'Avatar Inline Signature', type: 'avatar', desc: 'Micro avatar icon right beside signature' },
  { id: 'avatar-top-banner-center', label: 'Avatar Rule Break Center', type: 'avatar', desc: 'Avatar interrupting top decorative rule' },
  { id: 'avatar-gold-coin', label: 'Avatar Gilded Medallion', type: 'avatar', desc: 'Antique coin relief frame' },
  { id: 'avatar-hologram-cyan', label: 'Avatar Cyber Hologram', type: 'avatar', desc: 'Glowing holographic perimeter ring' },
  { id: 'avatar-split-center', label: 'Avatar Bipartite Axis', type: 'avatar', desc: 'Avatar floating at the partition axis of split canvas' },
  { id: 'avatar-corner-pin-left', label: 'Avatar Stamp Pin Left', type: 'avatar', desc: 'Minimalist pin badge in extreme upper-left' },
  { id: 'avatar-corner-pin-right', label: 'Avatar Stamp Pin Right', type: 'avatar', desc: 'Minimalist pin badge in extreme upper-right' },
  { id: 'avatar-vertical-meta', label: 'Avatar Track Vertical', type: 'avatar', desc: 'Integrated into vertical sidebar metadata rail' },

  // Geometric Shapes & Architectural Portals (51-76)
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
  { id: 'arch-cathedral-center', label: 'Gothic Cathedral Arch', type: 'frame', desc: 'Pointed lancet cathedral arch aperture' },
  { id: 'arch-trefoil-badge', label: 'Trefoil Architectural Rosette', type: 'frame', desc: 'Triple-lobed gothic window medallion' },
  { id: 'frame-rotunda-circle', label: 'Rotunda Ring Portico', type: 'frame', desc: 'Greek temple rotunda concentric circle' },
  { id: 'frame-octagon-bevel', label: 'Octagonal Prism Prism', type: 'frame', desc: 'Chamfered eight-sided polygon frame' },
  { id: 'frame-film-negative', label: 'Film Negative Filmstrip', type: 'frame', desc: 'Filmstrip border with edge timing marks' },
  { id: 'frame-parchment-scroll', label: 'Deckled Parchment Cartouche', type: 'frame', desc: 'Rag-paper deckled edge ornamental plaque' },
  { id: 'frame-gallery-mat', label: 'Gallery Bevel Matting', type: 'frame', desc: 'Exhibition white mat with hairline border' },
  { id: 'frame-skewed-parallelogram', label: 'Dynamic Slanted Rhomboid', type: 'frame', desc: 'Speed-slanted editorial parallelogram card' },
  { id: 'frame-retro-cassette', label: 'Cassette Label Window', type: 'frame', desc: 'Vintage cassette spool window cutout' },
  { id: 'frame-split-circle-dual', label: 'Twin Semicircle Aperture', type: 'frame', desc: 'Segmented dual semicircle lens' },
  { id: 'frame-isometric-cube-top', label: 'Isometric Isometric Rhombus', type: 'frame', desc: '3D top isometric cube projection frame' },
  { id: 'frame-golden-ratio-box', label: 'Golden Rectangle Inset', type: 'frame', desc: '1.618 golden proportion photo container' },

  // Environmental & Full-Bleed Blends (77-100)
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
  { id: 'duotone-underlay', label: 'Duotone Graphic Blend', type: 'blend', desc: 'Stylized 2-color photo underlay' },
  { id: 'blend-light-leak', label: 'Cinematic Light Leak', type: 'blend', desc: 'Warm horizontal golden flare wash across subject' },
  { id: 'blend-dark-smoke', label: 'Charcoal Vapor Dissolve', type: 'blend', desc: 'Atmospheric charcoal smoke dissolving photo edges' },
  { id: 'blend-cyber-glitch', label: 'Chromatic Glitch Shift', type: 'blend', desc: 'Digital RGB displacement channel scanline' },
  { id: 'blend-gradient-mask-top', label: 'Cascade Top Fade', type: 'blend', desc: 'Soft gradient descending into dark card' },
  { id: 'blend-gradient-mask-bottom', label: 'Ascending Horizon Fade', type: 'blend', desc: 'Soft gradient rising from bottom card boundary' },
  { id: 'blend-diagonal-gradient', label: 'Angular Oblique Wash', type: 'blend', desc: '45-degree angle linear illumination gradient' },
  { id: 'blend-radial-glow-center', label: 'Luminous Solar Core', type: 'blend', desc: 'Intense spotlight focus around author head' },
  { id: 'blend-monochrome-high-contrast', label: 'Noir High-Contrast', type: 'blend', desc: 'Graphic black and white dramatic portrait' },
  { id: 'blend-sepia-vintage', label: 'Antique Archival Sepia', type: 'blend', desc: 'Warm daguerreotype tone photo underlay' },
  { id: 'blend-prism-rainbow', label: 'Prism Spectral Refract', type: 'blend', desc: 'Subtle rainbow dispersion over portrait' },
  { id: 'blend-newspaper-halftone', label: 'Halftone Print Screen', type: 'blend', desc: 'Editorial newspaper screen dot texture' },
  { id: 'blend-aurora-borealis', label: 'Celestial Aurora Wave', type: 'blend', desc: 'Bioluminescent green-teal cosmic gradient' }
];

/**
 * 100 DISTINCT QUOTE LAYOUT REARRANGEMENTS
 */
export const LAYOUT_CATEGORIES = [
  { id: 'all', label: 'All Layouts (100)' },
  { id: 'author', label: 'Author & Cutout Focus (20)' },
  { id: 'editorial', label: 'Magazine & Editorial (20)' },
  { id: 'expressive', label: 'Expressive & Display (20)' },
  { id: 'minimalist', label: 'Clean & Minimalist (20)' },
  { id: 'novelty', label: 'Creative & Novelty (20)' }
];

export const LAYOUT_STYLES = [
  // 1. Author & Cutout Focus (1-20)
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
  { id: 'author-hero-large', name: 'Hero Author Background', category: 'author', icon: 'user', portraitPlacement: 'cutout-hero-large', description: 'Large architectural author silhouette occupying the right 60% of canvas with punchy quote.' },
  { id: 'author-floating-card', name: 'Floating Profile Card', category: 'author', icon: 'user', portraitPlacement: 'floating-card-bottom-right', description: 'Elevated floating translucent portrait card overlapping the bottom-right of quote.' },
  { id: 'author-quote-bubble', name: 'Speech Bubble & Tail', category: 'author', icon: 'message', portraitPlacement: 'avatar-bubble-tail', description: 'Curved dialogue quote bubble pointing directly down to author monogram.' },
  { id: 'author-split-diagonal', name: 'Diagonal Photo Angle', category: 'author', icon: 'columns', portraitPlacement: 'diagonal-split-photo', description: 'Dynamic 30-degree diagonal split separating author photo zone from quote text.' },
  { id: 'author-editorial-inset', name: 'Fashion Column Inset', category: 'author', icon: 'newspaper', portraitPlacement: 'fashion-column-right', description: 'Tall vertical editorial portrait column with overlapping serif quotation.' },
  { id: 'author-stat-sidebar', name: 'Tech Dossier Sidebar', category: 'author', icon: 'columns', portraitPlacement: 'sidebar-dossier-left', description: 'Left technical specs sidebar with author avatar, coordinates, and date stamp.' },
  { id: 'author-header-banner', name: 'Cinematic Header Banner', category: 'author', icon: 'image', portraitPlacement: 'banner-top-cinematic', description: 'Horizontal cinematic widescreen portrait banner stretching across top.' },
  { id: 'author-bottom-shelf', name: 'Bottom Pedestal Shelf', category: 'author', icon: 'layout', portraitPlacement: 'pedestal-shelf-bottom', description: 'Architectural pedestal shelf anchoring the bottom of canvas with author portrait.' },
  { id: 'author-circle-side', name: 'Semicircle Edge Portal', category: 'author', icon: 'sparkle', portraitPlacement: 'semicircle-portal-right', description: 'Giant circular aperture protruding inward from right edge framing author.' },
  { id: 'author-polaroid-stack', name: 'Pinned Polaroid Snapshot', category: 'author', icon: 'camera', portraitPlacement: 'polaroid-pinned-corner', description: 'Tilted Polaroid photo card pinned into the upper-right corner beside quote.' },

  // 2. Magazine & Editorial (21-40)
  { id: 'classic-centered', name: 'Classic Vogue Editorial', category: 'editorial', icon: 'newspaper', portraitPlacement: 'avatar-top-center', description: 'Harmonious center-aligned typography with curly quote marks.' },
  { id: 'magazine-cover', name: 'Magazine Cover Masthead', category: 'editorial', icon: 'newspaper', portraitPlacement: 'scrim', description: 'Publication title masthead across top, bold headline quote.' },
  { id: 'pull-quote-rules', name: 'Editorial Pull Quote', category: 'editorial', icon: 'type', portraitPlacement: 'none', description: 'Upper and lower horizontal hairline rules framing statement.' },
  { id: 'dropcap-literary', name: 'Initial Drop Cap Letter', category: 'editorial', icon: 'type', portraitPlacement: 'none', description: 'First letter rendered as an opulent giant serif display cap.' },
  { id: 'newspaper-headline', name: 'Broadsheet Front Page', category: 'editorial', icon: 'newspaper', portraitPlacement: 'none', description: 'Multi-tiered newspaper headline styling with date stamp.' },
  { id: 'book-spread', name: 'Open Book Spread', category: 'editorial', icon: 'fileText', portraitPlacement: 'none', description: 'Simulates the refined open typography of a hardbound book.' },
  { id: 'interview-qa', name: 'Interview Q&A Block', category: 'editorial', icon: 'message', portraitPlacement: 'avatar-top-left', description: 'Prompt in bold grotesque sans, reply in warm reflective serif.' },
  { id: 'manifesto-numbered', name: 'Numbered Principle', category: 'editorial', icon: 'fileText', portraitPlacement: 'none', description: 'Giant Roman numeral or index number anchored above axiom.' },
  { id: 'museum-plaque', name: 'Gallery Museum Label', category: 'editorial', icon: 'layout', portraitPlacement: 'none', description: 'Quiet, sparse, high-culture layout modeled on art museum labels.' },
  { id: 'monocle-brief', name: 'Monocle Global Brief', category: 'editorial', icon: 'globe', portraitPlacement: 'none', description: 'Strict grid layout with topic coordinates and author caption.' },
  { id: 'editorial-two-column', name: 'Split Editorial Columns', category: 'editorial', icon: 'columns', portraitPlacement: 'none', description: 'Two balanced publishing text columns separated by vertical hairline rule.' },
  { id: 'vogue-italics', name: 'Vogue Display Italics', category: 'editorial', icon: 'type', portraitPlacement: 'none', description: 'Oversized high-contrast italic serif with elegant editorial poise.' },
  { id: 'literary-footnote', name: 'Academic Footnote Opus', category: 'editorial', icon: 'fileText', portraitPlacement: 'none', description: 'Formal literary thesis with superscript reference and divider citation.' },
  { id: 'front-page-lead', name: 'Front-Page Lead Story', category: 'editorial', icon: 'newspaper', portraitPlacement: 'none', description: 'Heavy newsprint headline with byline rule and volume numbering.' },
  { id: 'poetry-anthology', name: 'Poetry Anthology Stanza', category: 'editorial', icon: 'feather', portraitPlacement: 'none', description: 'Centered lyrical stanza with classical leaf fleuron flourish.' },
  { id: 'glossy-spread', name: 'Glossy Feature Spread', category: 'editorial', icon: 'layout', portraitPlacement: 'none', description: 'Bold color kicker bar across top, wide headline, and structured author footer.' },
  { id: 'manuscript-parchment', name: 'Ancient Folio Manuscript', category: 'editorial', icon: 'bookOpen', portraitPlacement: 'none', description: 'Classical illuminated manuscript border with decorative corner fleurons.' },
  { id: 'the-atlantic-op', name: 'The Atlantic Essayist', category: 'editorial', icon: 'type', portraitPlacement: 'none', description: 'Prestige op-ed essay layout with category kicker and refined author signature.' },
  { id: 'catalog-specimen', name: 'Typography Specimen Poster', category: 'editorial', icon: 'shapes', portraitPlacement: 'none', description: 'Graphic design catalog sheet featuring glyph scale marks and point sizes.' },
  { id: 'broadsheet-banner', name: 'Inverted Masthead Banner', category: 'editorial', icon: 'newspaper', portraitPlacement: 'none', description: 'Deep dark solid banner header across top with crisp newsprint layout.' },

  // 3. Expressive & Display (41-60)
  { id: 'big-watermark', name: 'Giant Watermark Marks', category: 'expressive', icon: 'quote', portraitPlacement: 'none', description: 'Huge 400px quotation marks faded softly into background.' },
  { id: 'hero-word-scale', name: 'Display Word Highlight', category: 'expressive', icon: 'sparkles', portraitPlacement: 'none', description: 'First key phrase rendered in colossal display font.' },
  { id: 'diagonal-kinetic', name: 'Diagonal Kinetic Type', category: 'expressive', icon: 'sliders', portraitPlacement: 'none', description: 'Dynamic angled canvas layout imparting speed and motion.' },
  { id: 'billboard-heavy', name: 'Massive Billboard Sans', category: 'expressive', icon: 'type', portraitPlacement: 'none', description: 'High-impact, tight line-height, zero-margin type.' },
  { id: 'highlight-marker', name: 'Fluorescent Highlighter', category: 'expressive', icon: 'paintbrush', portraitPlacement: 'none', description: 'Core concepts underlined with glowing neon or pastel stripes.' },
  { id: 'comic-pop', name: 'Comic Book Graphic Pop', category: 'expressive', icon: 'zap', portraitPlacement: 'none', description: 'Pop art halftone dots with speech burst and action author tag.' },
  { id: 'stencil-spray', name: 'Street Stencil Graffiti', category: 'expressive', icon: 'paintbrush', portraitPlacement: 'none', description: 'Urban street aesthetic with textured stencil borders.' },
  { id: 'boxed-words', name: 'Individually Boxed Words', category: 'expressive', icon: 'box', portraitPlacement: 'none', description: 'Words isolated inside alternating dark and light solid blocks.' },
  { id: 'audio-wave', name: 'Podcast Audio Waveform', category: 'expressive', icon: 'radio', portraitPlacement: 'none', description: 'Graphic visualizer waveform beneath quote with playback bar.' },
  { id: 'cinema-subtitles', name: 'Cinematic Movie Subtitle', category: 'expressive', icon: 'tv', portraitPlacement: 'none', description: '16:9 letterboxed cinema frame with yellow subtitle text.' },
  { id: 'cyberpunk-hud', name: 'Cyberpunk HUD Telemetry', category: 'expressive', icon: 'crosshair', portraitPlacement: 'none', description: 'Futuristic sci-fi interface with targeting reticles, corner brackets, and hex codes.' },
  { id: 'marquee-ticker', name: 'Broadway Marquee Ticker', category: 'expressive', icon: 'tv', portraitPlacement: 'none', description: 'Electric theater marquee framing with illuminated bulb accents and bold type.' },
  { id: 'glitch-matrix', name: 'CRT Matrix Terminal', category: 'expressive', icon: 'monitor', portraitPlacement: 'none', description: 'Phosphor green scanline CRT monitor with retro digital matrix glyphs.' },
  { id: 'neon-signboard', name: 'Electric Neon Tube Bar', category: 'expressive', icon: 'zap', portraitPlacement: 'none', description: 'Luminous neon wire outline framing quote text with subtle wall reflection.' },
  { id: 'heavy-metal-blackletter', name: 'Gothic Dark Occult', category: 'expressive', icon: 'shield', portraitPlacement: 'none', description: 'Medieval blackletter aesthetic with sharp angular framing and dagger glyphs.' },
  { id: 'retro-synthwave', name: 'Outrun Synthwave Grid', category: 'expressive', icon: 'sun', portraitPlacement: 'none', description: '1980s retro sunset horizon with wireframe perspective floor grid.' },
  { id: 'newspaper-cutout-ransom', name: 'Collage Ransom Note', category: 'expressive', icon: 'scissors', portraitPlacement: 'none', description: 'Mixed-media typography cutouts with staggered rotated paper blocks.' },
  { id: 'duotone-poster', name: 'Swiss Duotone Poster', category: 'expressive', icon: 'image', portraitPlacement: 'none', description: 'High-contrast 2-tone poster layout with massive architectural lettering.' },
  { id: 'vinyl-album-sleeve', name: 'Vinyl 12-Inch Record Cover', category: 'expressive', icon: 'disc', portraitPlacement: 'none', description: 'Authentic vinyl LP jacket layout with center spindle hole and groove rings.' },
  { id: 'liquid-blobs-pop', name: 'Organic Liquid Blobs', category: 'expressive', icon: 'shapes', portraitPlacement: 'none', description: 'Playful fluid organic blob contours framing quote statement.' },

  // 4. Clean & Minimalist (61-80)
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
  { id: 'minimal-crosshair', name: 'Architectural Crosshair', category: 'minimalist', icon: 'crosshair', portraitPlacement: 'none', description: 'Fine drafting crosshair lines intersecting behind serene centered typography.' },
  { id: 'bauhaus-geometry', name: 'Bauhaus Primary Shapes', category: 'minimalist', icon: 'shapes', portraitPlacement: 'none', description: 'Constructivist layout with primary red, blue, and yellow geometric blocks.' },
  { id: 'floating-white-card', name: 'Elevated Studio Plaque', category: 'minimalist', icon: 'square', portraitPlacement: 'none', description: 'Crisp solid card floating centered on a textured studio backdrop.' },
  { id: 'bracket-container', name: 'Architectural Brackets', category: 'minimalist', icon: 'box', portraitPlacement: 'none', description: 'Oversized bold corner brackets [ ] encapsulating quote typography.' },
  { id: 'single-line-divider', name: 'Single Hairline Rule', category: 'minimalist', icon: 'minus', portraitPlacement: 'none', description: 'Pure reductionist layout: quiet quote, single ultra-thin line, author byline.' },
  { id: 'pill-tag-header', name: 'Status Pill Tag Header', category: 'minimalist', icon: 'tag', portraitPlacement: 'none', description: 'Minimalist rounded tag at top-left, spacious typography below.' },
  { id: 'vertical-spine-text', name: 'Vertical Japanese Spine', category: 'minimalist', icon: 'columns', portraitPlacement: 'none', description: 'Vertical typographic spine running down left edge with spacious body.' },
  { id: 'monochrome-stark', name: 'Stark Monochrome Grid', category: 'minimalist', icon: 'layout', portraitPlacement: 'none', description: 'High-contrast black-and-white layout with zero ornamentation.' },
  { id: 'subtle-grid-blueprint', name: 'Draftsman Grid Coordinates', category: 'minimalist', icon: 'grid', portraitPlacement: 'none', description: 'Faint 32px blueprint grid with technical coordinate markers (A-1, B-4).' },
  { id: 'center-badge-minimal', name: 'Center Seal Monogram', category: 'minimalist', icon: 'shield', portraitPlacement: 'none', description: 'Compact circular monogram seal centered at top with quiet quotes.' },

  // 5. Creative & Novelty (81-100)
  { id: 'tweet-card', name: 'Social Verified Tweet Card', category: 'novelty', icon: 'message', portraitPlacement: 'none', description: 'Twitter/X style verified social media card with avatar and metrics.' },
  { id: 'polaroid-photo', name: 'Instant Polaroid Snapshot', category: 'novelty', icon: 'camera', portraitPlacement: 'none', description: 'Iconic white Polaroid film border with handwritten caption.' },
  { id: 'terminal-code', name: 'Developer Terminal Window', category: 'novelty', icon: 'monitor', portraitPlacement: 'none', description: 'CRT code console with macOS traffic light buttons.' },
  { id: 'sticky-note', name: 'Post-It Sticky Memo', category: 'novelty', icon: 'fileText', portraitPlacement: 'none', description: 'Yellow sticky note with realistic dropped shadow and pin.' },
  { id: 'boarding-pass', name: 'Airline Boarding Pass Stub', category: 'novelty', icon: 'tag', portraitPlacement: 'none', description: 'Perforated travel ticket with destination coordinates.' },
  { id: 'receipt-pos', name: 'Thermal Store Receipt', category: 'novelty', icon: 'fileText', portraitPlacement: 'none', description: 'Crinkled store receipt with zig-zag tear edges.' },
  { id: 'film-strip', name: '35mm Film Roll Negative', category: 'novelty', icon: 'tv', portraitPlacement: 'none', description: 'Kodak 35mm film strip with sprocket perforations.' },
  { id: 'cassette-tape', name: 'Mixtape Cassette Label', category: 'novelty', icon: 'disc', portraitPlacement: 'none', description: 'Analog cassette spool graphic with handwritten A-side label.' },
  { id: 'postage-stamp', name: 'Vintage Postage Stamp', category: 'novelty', icon: 'image', portraitPlacement: 'none', description: 'Scalloped serrated stamp edges with postal ink cancellation.' },
  { id: 'blueprint-cyan', name: 'Engineering Blueprint', category: 'novelty', icon: 'shapes', portraitPlacement: 'none', description: 'Deep Prussian blue grid background with draftsman lettering.' },
  { id: 'museum-ticket-stub', name: 'Perforated Ticket Stub', category: 'novelty', icon: 'tag', portraitPlacement: 'none', description: 'Vintage cinema/museum admission ticket with barcode and perforated edge.' },
  { id: 'vintage-typewriter', name: 'Smith-Corona Typewriter', category: 'novelty', icon: 'type', portraitPlacement: 'none', description: 'Mechanical ink-ribbon strike typography on aged bond paper.' },
  { id: 'retro-game-cartridge', name: '16-Bit Game Cartridge', category: 'novelty', icon: 'cpu', portraitPlacement: 'none', description: 'Classic video game cartridge label with Gold Seal of Quality emblem.' },
  { id: 'music-player-lockscreen', name: 'Now Playing Lockscreen', category: 'novelty', icon: 'music', portraitPlacement: 'none', description: 'Smartphone lockscreen music card with scrub bar, duration, and play controls.' },
  { id: 'calendar-tear-off', name: 'Daily Calendar Tear-Off', category: 'novelty', icon: 'calendar', portraitPlacement: 'none', description: 'Block calendar page with bold red day number and perforated top stub.' },
  { id: 'newspaper-clipping', name: 'Archival Press Clipping', category: 'novelty', icon: 'paperclip', portraitPlacement: 'none', description: 'Yellowed newsprint clipping secured with a realistic metal paperclip.' },
  { id: 'hotel-keycard-tag', name: 'Grand Hotel Key Fob', category: 'novelty', icon: 'key', portraitPlacement: 'none', description: 'Boutique hotel vintage brass/acrylic key fob tag with room number.' },
  { id: 'coffee-shop-cup', name: 'Artisan Coffee Cup Sleeve', category: 'novelty', icon: 'coffee', portraitPlacement: 'none', description: 'Corrugated cardboard coffee cup sleeve with barista marker stamp.' },
  { id: 'vintage-envelope-letter', name: 'Par Avion Airmail Letter', category: 'novelty', icon: 'mail', portraitPlacement: 'none', description: 'Red and blue striped airmail envelope border with vintage wax seal.' },
  { id: 'retro-floppy-disk', name: '3.5-Inch Floppy Diskette', category: 'novelty', icon: 'hardDrive', portraitPlacement: 'none', description: '1.44MB retro computer diskette with metal sliding shutter and lined sticker.' }
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
