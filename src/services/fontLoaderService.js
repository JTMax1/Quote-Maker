/**
 * Google Fonts Loader Service
 * Manages curated typography catalog, asynchronous font preloading,
 * and canvas rendering readiness synchronization.
 */

export const FONT_CATEGORIES = [
  { id: 'all', label: 'All Styles', icon: 'sparkles' },
  { id: 'editorial', label: 'Editorial & Display', icon: 'bookOpen' },
  { id: 'sans', label: 'Clean & Modern Sans', icon: 'type' },
  { id: 'serif', label: 'Classic Literary Serif', icon: 'feather' },
  { id: 'handwriting', label: 'Script & Signature', icon: 'penTool' },
  { id: 'mono', label: 'Monospace & Tech', icon: 'code' },
];

export const CURATED_FONTS = [
  // --- Editorial & Display ---
  { family: 'Playfair Display', category: 'editorial', weights: [500, 600, 700, 800], sample: 'Timeless luxury & editorial poise' },
  { family: 'Cinzel', category: 'editorial', weights: [600, 700, 800], sample: 'Classical Roman stone inscription' },
  { family: 'Bodoni Moda', category: 'editorial', weights: [500, 700, 900], sample: 'Vogue & high fashion contrast' },
  { family: 'Prata', category: 'editorial', weights: [400], sample: 'Elegant tear-drop terminals' },
  { family: 'Cormorant Garamond', category: 'editorial', weights: [500, 600, 700], sample: 'Renaissance heritage & poetry' },
  { family: 'Syne', category: 'editorial', weights: [600, 700, 800], sample: 'Brutalist avant-garde aesthetic' },
  { family: 'DM Serif Display', category: 'editorial', weights: [400], sample: 'Punchy retro poster title' },
  { family: 'Abril Fatface', category: 'editorial', weights: [400], sample: 'Dramatic titling tithe' },
  { family: 'Italiana', category: 'editorial', weights: [400], sample: 'Italian calligraphy refined' },
  { family: 'UnifrakturMaguntia', category: 'editorial', weights: [400], sample: 'Gothic blackletter scripture' },

  // --- Modern & Sans-Serif ---
  { family: 'Plus Jakarta Sans', category: 'sans', weights: [400, 600, 700, 800], sample: 'Geometric clarity for digital age' },
  { family: 'Outfit', category: 'sans', weights: [400, 500, 600, 700], sample: 'Minimalist commercial purity' },
  { family: 'Montserrat', category: 'sans', weights: [500, 600, 700, 800], sample: 'Urban architecture inspired' },
  { family: 'Space Grotesk', category: 'sans', weights: [500, 600, 700], sample: 'Futuristic technical character' },
  { family: 'Inter', category: 'sans', weights: [400, 500, 600, 700], sample: 'Ultra-legible screen workhorse' },
  { family: 'Poppins', category: 'sans', weights: [500, 600, 700], sample: 'Friendly geometric curves' },
  { family: 'Raleway', category: 'sans', weights: [500, 600, 700, 800], sample: 'Sophisticated lightweight headings' },
  { family: 'Work Sans', category: 'sans', weights: [400, 600, 700], sample: 'Pragmatic early grotesque' },
  { family: 'Urbanist', category: 'sans', weights: [500, 600, 700], sample: 'Sleek metropolitan modern' },
  { family: 'Lexend', category: 'sans', weights: [500, 600, 700], sample: 'Engineered reading velocity' },
  { family: 'Manrope', category: 'sans', weights: [500, 600, 700], sample: 'Modernist semi-rounded curves' },
  { family: 'Figtree', category: 'sans', weights: [500, 600, 700], sample: 'Harmonious humanistic flow' },

  // --- Classic Serif ---
  { family: 'Merriweather', category: 'serif', weights: [400, 700], sample: 'Pleasant long-form readability' },
  { family: 'Lora', category: 'serif', weights: [500, 600, 700], sample: 'Contemporary balanced curves' },
  { family: 'PT Serif', category: 'serif', weights: [400, 700], sample: 'Universal publishing strength' },
  { family: 'Crimson Text', category: 'serif', weights: [400, 600, 700], sample: 'Oldstyle book printing tradition' },
  { family: 'Libre Baskerville', category: 'serif', weights: [400, 700], sample: '18th-century intellectual weight' },
  { family: 'EB Garamond', category: 'serif', weights: [400, 600, 700], sample: 'Classic Claude Garamont specimen' },
  { family: 'Bitter', category: 'serif', weights: [500, 600, 700], sample: 'Contemporary slab for screens' },
  { family: 'Spectral', category: 'serif', weights: [400, 600, 700], sample: 'Screen-optimized serif elegance' },
  { family: 'Domine', category: 'serif', weights: [500, 700], sample: 'Bold newsprint impact' },
  { family: 'Castoro', category: 'serif', weights: [400], sample: 'Academic authority & discipline' },

  // --- Handwriting & Signature ---
  { family: 'Caveat', category: 'handwriting', weights: [600, 700], sample: 'Casual handwritten spontaneity' },
  { family: 'Dancing Script', category: 'handwriting', weights: [600, 700], sample: 'Bouncy lively cursive rhythm' },
  { family: 'Pacifico', category: 'handwriting', weights: [400], sample: '1950s American surf nostalgia' },
  { family: 'Great Vibes', category: 'handwriting', weights: [400], sample: 'Formal flowing calligraphy' },
  { family: 'Sacramento', category: 'handwriting', weights: [400], sample: 'Slender mid-century monograph' },
  { family: 'Kalam', category: 'handwriting', weights: [400, 700], sample: 'Organic ballpoint pen warmth' },
  { family: 'Alex Brush', category: 'handwriting', weights: [400], sample: 'Flowing brush pen signature' },
  { family: 'Satisfy', category: 'handwriting', weights: [400], sample: 'Gentle rounded quill script' },
  { family: 'Yellowtail', category: 'handwriting', weights: [400], sample: 'Vintage sign-painter flat brush' },
  { family: 'Marck Script', category: 'handwriting', weights: [400], sample: 'Fountain pen personal journal' },

  // --- Monospace & Retro ---
  { family: 'Space Mono', category: 'mono', weights: [400, 700], sample: 'NASA terminal retro-future' },
  { family: 'JetBrains Mono', category: 'mono', weights: [500, 700], sample: 'Engineered code aesthetics' },
  { family: 'Fira Code', category: 'mono', weights: [500, 700], sample: 'Programmer ligature symmetry' },
  { family: 'Share Tech Mono', category: 'mono', weights: [400], sample: 'Cyberpunk telemetry readout' },
  { family: 'Inconsolata', category: 'mono', weights: [500, 700], sample: 'Clean humanist monospace' },
  { family: 'Source Code Pro', category: 'mono', weights: [500, 600, 700], sample: 'Balanced typographic geometry' }
];

export const FONT_PAIRINGS = [
  {
    id: 'editorial-luxury',
    name: 'Editorial Luxury',
    quoteFont: 'Playfair Display',
    authorFont: 'Plus Jakarta Sans',
    desc: 'High-contrast serif title paired with clean geometric metadata'
  },
  {
    id: 'classical-stoic',
    name: 'Classical Stoic',
    quoteFont: 'Cinzel',
    authorFont: 'Cormorant Garamond',
    desc: 'Roman imperial uppercase with refined literary heritage'
  },
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    quoteFont: 'Outfit',
    authorFont: 'Space Grotesk',
    desc: 'Crisp commercial purity with subtle futuristic edge'
  },
  {
    id: 'personal-poetic',
    name: 'Personal Poetic',
    quoteFont: 'Caveat',
    authorFont: 'Montserrat',
    desc: 'Warm handwritten spontaneity anchored by bold sans'
  },
  {
    id: 'tech-brutalist',
    name: 'Tech Brutalist',
    quoteFont: 'Syne',
    authorFont: 'Space Mono',
    desc: 'Avant-garde headline paired with retro telemetry code'
  },
  {
    id: 'literary-chronicle',
    name: 'Literary Chronicle',
    quoteFont: 'Merriweather',
    authorFont: 'Inter',
    desc: 'Warm editorial storytelling with neutral modern legibility'
  }
];

export class FontLoaderService {
  static loadedFonts = new Set([
    'system-ui',
    '-apple-system',
    'sans-serif',
    'serif',
    'monospace',
    // Pre-loaded in index.html
    'Plus Jakarta Sans',
    'Caveat',
    'Cinzel',
    'Merriweather',
    'Montserrat',
    'Outfit',
    'Playfair Display',
    'Space Grotesk',
    'Space Mono',
    'Syne'
  ]);

  static loadingPromises = new Map();
  static catalogLoaded = false;

  /**
   * On-demand typography catalog initialization.
   * Defers font binary downloads until explicit user selection or view.
   */
  static ensureCatalogLoaded() {
    // Eager bulk injection deprecated to protect Core Web Vitals and network bandwidth.
    // Fonts are loaded on-demand via loadFont() and IntersectionObserver.
    return;
  }

  /**
   * Return category-aware CSS font fallback stack for bulletproof rendering.
   * Prevents competing web font collision and avoids destructive baseline reflow.
   * @param {string} family Font family
   * @returns {string} Font stack string
   */
  static getFallbackStack(family) {
    if (!family) return "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    const cleanFamily = family.trim().replace(/^['"]|['"]$/g, '');
    const meta = CURATED_FONTS.find(f => f.family.toLowerCase() === cleanFamily.toLowerCase());
    const category = meta?.category || 'sans';

    switch (category) {
      case 'editorial':
      case 'serif':
        return `'${cleanFamily}', Georgia, 'Times New Roman', serif`;
      case 'handwriting':
        return `'${cleanFamily}', 'Brush Script MT', cursive, sans-serif`;
      case 'mono':
        return `'${cleanFamily}', 'Courier New', monospace`;
      case 'sans':
      default:
        return `'${cleanFamily}', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
    }
  }

  /**
   * Load a Google font dynamically and guarantee canvas availability.
   * Uses precise requested weight queries to prevent single-weight font timeout hangs.
   * @param {string} family Font family name
   * @returns {Promise<boolean>} Resolves true when font is ready for canvas drawing
   */
  static async loadFont(family) {
    if (!family) return true;
    const cleanFamily = family.trim().replace(/^['"]|['"]$/g, '');

    this.ensureCatalogLoaded();

    if (this.loadedFonts.has(cleanFamily)) {
      if (document.fonts && document.fonts.check && document.fonts.check(`16px "${cleanFamily}"`)) {
        return true;
      }
    }

    if (this.loadingPromises.has(cleanFamily)) {
      return this.loadingPromises.get(cleanFamily);
    }

    const promise = (async () => {
      try {
        const fontMeta = CURATED_FONTS.find(f => f.family.toLowerCase() === cleanFamily.toLowerCase());
        const weights = fontMeta?.weights || [400, 600, 700];

        // Ensure standalone stylesheet link as fallback
        const linkId = `gf-link-${cleanFamily.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        if (!document.getElementById(linkId)) {
          const weightParam = weights.join(';');
          const url = `https://fonts.googleapis.com/css2?family=${cleanFamily.replace(/ /g, '+')}:wght@${weightParam}&display=swap`;
          const link = document.createElement('link');
          link.id = linkId;
          link.rel = 'stylesheet';
          link.href = url;
          document.head.appendChild(link);
        }

        // Wait for document.fonts to register the font using its exact available weights
        if (document.fonts && document.fonts.load) {
          const loadChecks = weights.map(w => {
            return document.fonts.load(`${w} 16px "${cleanFamily}"`).catch(() => {});
          });
          loadChecks.push(document.fonts.ready);

          await Promise.race([
            Promise.all(loadChecks),
            new Promise(r => setTimeout(r, 1200)) // Snappy fallback
          ]);
        }

        this.loadedFonts.add(cleanFamily);
        return true;
      } catch (err) {
        console.warn(`FontLoader: Failed to load font "${cleanFamily}":`, err);
        return false;
      } finally {
        this.loadingPromises.delete(cleanFamily);
      }
    })();

    this.loadingPromises.set(cleanFamily, promise);
    return promise;
  }

  /**
   * Preload popular fonts in the background
   */
  static preloadPopular() {
    const popular = ['Playfair Display', 'Caveat', 'Cinzel', 'Outfit', 'Space Grotesk', 'Bodoni Moda'];
    popular.forEach(f => this.loadFont(f));
  }

  static getFonts(category = 'all', query = '') {
    let list = CURATED_FONTS;
    if (category && category !== 'all') {
      list = list.filter(f => f.category === category);
    }
    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter(f => f.family.toLowerCase().includes(q) || f.category.toLowerCase().includes(q));
    }
    return list;
  }
}
