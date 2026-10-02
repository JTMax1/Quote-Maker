/**
 * Custom Design Theme Template Studio & Publisher
 * Upgraded & Fixed:
 * - 7 Collapsible Accordion sections with live summary badges & Expand/Collapse All
 * - Complete features preserved: Abstract Geometry (21), Curated Palettes, Gradients, 
 *   Frame & Border Aesthetics, Typography Studio with Pairings & Browse Fonts,
 *   6-Anchor Canvas Placements, Branding Display Styles, Micro-Sizing (XS-3XL)
 * - Real-Time WCAG 2.1 AA/AAA Contrast Meter with 1-click Auto-Fix
 * - Sample Quote Length Switcher (Short, Medium, Long, Custom)
 * - Bidirectional Editing: loadTemplate() for both custom & built-in themes
 * - RAF (requestAnimationFrame) coalesced rendering engine for fluid 60fps responsiveness
 * - Draft Auto-Save & Recovery with Discard option
 * - JSON Export / Import and Shareable Link generation
 * - IndexedDB decoupling for large brand logos
 */

import { FONT_FAMILIES, PRESET_CATEGORIES, LAYOUT_STYLES, PORTRAIT_PLACEMENTS, CANVAS_FORMATS } from '../data/defaultPresets.js';
import { PRESET_AUTHOR_PORTRAITS } from '../data/authorCutouts.js';
import { StorageService } from '../services/storageService.js';
import { Toast } from './toast.js';
import confetti from 'canvas-confetti';
import { icon } from '../utils/icons.js';
import { FontLoaderService } from '../services/fontLoaderService.js';
import { FontPickerModal } from './fontPickerModal.js';
import { BrandingService, BRANDING_STYLES, BRANDING_POSITIONS, BRANDING_SIZES, CANVAS_PLACEMENTS } from '../services/brandingService.js';
import { escapeHtml, sanitizeStyleValue } from '../utils/security.js';
import { CanvasRenderer } from '../services/canvasRenderer.js';
import { getContrastRatio, getContrastRating, getHighContrastTextColor, hexToRgb } from '../utils/contrast.js';

export const SAMPLE_QUOTES = {
  short: {
    quote: "Stay hungry, stay foolish.",
    author: "Steve Jobs",
    category: "Vision",
    date: "Jun 2005"
  },
  medium: {
    quote: "Creativity is intelligence having fun.",
    author: "Albert Einstein",
    category: "Wisdom",
    date: "Sep 2026"
  },
  long: {
    quote: "The only way of discovering the limits of the possible is to venture a little way past them into the impossible.",
    author: "Arthur C. Clarke",
    category: "Discovery",
    date: "Oct 2026"
  },
  custom: {
    quote: "Design is not just what it looks like and feels like. Design is how it works.",
    author: "Steve Jobs",
    category: "Craft",
    date: "Present"
  }
};

export const PATTERN_LABELS = {
  'orbital-rings': 'Orbital Rings',
  'fibonacci': 'Golden Spiral',
  'celestial': 'Star Map',
  'zen-waves': 'Zen Waves',
  'isometric': 'Isometric Grid',
  'sunburst': 'Sunburst Rays',
  'mandala': 'Mandala',
  'diagonal-hatch': 'Fine Hatching',
  'topography': 'Topography',
  'perspective': 'Horizon Grid',
  'sacred-polygon': 'Sacred Polygon',
  'cyber-matrix': 'Cyber Matrix',
  'constellation': 'Constellation',
  'retro-synthwave': 'Retro Synthwave',
  'voronoi-mesh': 'Voronoi Mesh',
  'hypercube': 'Hypercube',
  'arch-deco': 'Art Deco Arch',
  'bauhaus-diagonals': 'Bauhaus Dynamic',
  'quantum-field': 'Quantum Field',
  'soundwave-radar': 'Soundwave Radar',
  '': 'None (Clean)'
};

function toValidHex(colorStr, fallback = '#0a0d14') {
  if (!colorStr) return fallback;
  const s = colorStr.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(s)) return s;
  if (/^#[0-9a-fA-F]{3}$/.test(s)) {
    return '#' + s[1] + s[1] + s[2] + s[2] + s[3] + s[3];
  }
  const rgb = hexToRgb(s);
  if (rgb && (rgb.r !== undefined)) {
    const toHex = (n) => Math.min(255, Math.max(0, n)).toString(16).padStart(2, '0');
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  }
  return fallback;
}

export class TemplateStudio {
  constructor(containerEl, onTemplatePublished) {
    this.containerEl = containerEl;
    this.onTemplatePublished = onTemplatePublished;
    this.currentPreviewRatio = '1:1';
    this.sampleAuthorImage = PRESET_AUTHOR_PORTRAITS[1]?.imageUrl || PRESET_AUTHOR_PORTRAITS[0]?.imageUrl;

    // RAF Coalescing State
    this.rafId = null;
    this.isRendering = false;
    this.pendingRender = false;
    this.draftDebounceTimer = null;

    // Editing & Accordion State
    this.editingTemplateId = null;
    this.sampleQuoteMode = 'medium';
    this.allAccordionsOpen = false;
    this.soloAccordionMode = false;

    this.defaultTemplate = {
      name: 'Geometric Cyber Velvet',
      category: 'geometry',
      description: 'Custom abstract geometric theme with lines and typography',
      background: '#0a0d14',
      textColor: '#ffffff',
      accentColor: '#38bdf8',
      metaColor: '#94a3b8',
      cardBackground: 'rgba(255, 255, 255, 0.06)',
      borderStyle: 'neon-glow',
      borderColor: '#38bdf8',
      fontFamily: 'Space Grotesk',
      authorFontFamily: 'Plus Jakarta Sans',
      textAlign: 'center',
      fontWeight: 600,
      quoteMarkStyle: 'classic',
      cardStyle: 'glass',
      abstractPattern: 'orbital-rings',
      layoutId: 'classic-centered',
      portraitPlacement: 'cutout-right',
      authorPlacement: 'auto',
      datePlacement: 'top-right',
      categoryPlacement: 'top-left',
      gradient: null,
      badgeStyle: 'neon-pill',
      letterSpacing: '0.02em',
      lineHeight: 1.45,
      showWatermark: true,
      watermark: 'QuoteForge Studio',
      brandingHandle: '@quoteforge',
      brandingStyle: 'badge',
      brandingPosition: 'bottom-right',
      brandingSize: 'm',
      brandingOpacity: 0.85,
      brandingLogo: null
    };

    this.template = { ...this.defaultTemplate };

    // Check for URL hash theme sharing
    this.checkUrlThemeHash();

    // Check for draft recovery if no URL theme
    const draft = StorageService.getStudioDraft();
    if (draft && !this.editingTemplateId) {
      this.template = { ...this.defaultTemplate, ...draft };
      this.hasRestoredDraft = true;
    }

    // Initialize Font Picker Modal for Template Studio
    this.fontPickerModal = new FontPickerModal(
      (family, target) => {
        if (target === 'author') {
          this.template.authorFontFamily = family;
        } else {
          this.template.fontFamily = family;
        }
        this.updateTypographyUI();
        this.updateAccordionBadges();
        this.scheduleRender();
        Toast.show(`Applied font: ${family}`, 'success');
      },
      (pairing) => {
        this.template.fontFamily = pairing.quoteFont;
        this.template.authorFontFamily = pairing.authorFont;
        this.updateTypographyUI();
        this.updateAccordionBadges();
        this.scheduleRender();
        Toast.show(`Applied "${pairing.name}" font pairing!`, 'success');
      },
      'studioFontPickerModal'
    );

    // Auto-load brand logo from IndexedDB if saved previously
    BrandingService.loadCustomLogo().then(logo => {
      if (logo && !this.template.brandingLogo) {
        this.template.brandingLogo = logo;
        this.updateBrandingUI();
        this.scheduleRender();
      }
    });

    this.render();
  }

  getActiveSampleQuoteText() {
    return SAMPLE_QUOTES[this.sampleQuoteMode]?.quote || SAMPLE_QUOTES.medium.quote;
  }

  getActiveSampleAuthorText() {
    return SAMPLE_QUOTES[this.sampleQuoteMode]?.author || SAMPLE_QUOTES.medium.author;
  }

  checkUrlThemeHash() {
    try {
      const hash = window.location.hash;
      if (hash.includes('theme=')) {
        const match = hash.match(/theme=([^&]+)/);
        if (match && match[1]) {
          const jsonStr = decodeURIComponent(atob(match[1]));
          const parsed = JSON.parse(jsonStr);
          if (parsed && parsed.name) {
            this.template = { ...this.defaultTemplate, ...parsed, id: null };
            Toast.show(`Loaded shared theme "${parsed.name}"!`, 'success');
          }
        }
      }
    } catch (e) {
      console.warn('Failed to parse URL theme hash:', e);
    }
  }

  /**
   * Load any preset or custom template into Template Studio
   */
  loadTemplate(templateData, options = {}) {
    if (!templateData) return;
    this.editingTemplateId = options.isEditing ? templateData.id : null;
    this.template = {
      ...this.defaultTemplate,
      ...templateData
    };

    // Re-render UI and sync controls
    this.render();
    Toast.show(options.isEditing ? `Editing "${templateData.name}"` : `Loaded "${templateData.name}" template`, 'info');
  }

  render() {
    this.containerEl.innerHTML = `
      <div class="studio-layout">
        <!-- Controls Pane -->
        <div class="studio-controls-pane">
          <div class="studio-header-wrap">
            <div style="border-bottom: 1px solid var(--border-glass); padding-bottom: 0.85rem;">
              <h2 id="studioViewTitle" style="font-size: 1.3rem; font-weight: 700; font-family: var(--font-display); margin-bottom: 0.25rem;">
                ${this.editingTemplateId ? 'Edit Theme Template' : 'Theme Template Studio'}
              </h2>
              <p style="font-size: 0.85rem; color: var(--text-secondary);">Craft custom aesthetic themes with abstract geometry, curated typography, and custom branding, then publish to Presets.</p>
            </div>

            <!-- Draft Notification Banner -->
            ${this.hasRestoredDraft ? `
              <div class="studio-draft-banner" id="studioDraftBanner">
                <span>⚡ <strong>Restored Draft:</strong> Unsaved changes from previous session</span>
                <div class="draft-actions">
                  <button type="button" class="btn-discard-draft" id="btnDiscardDraft">Discard Draft</button>
                </div>
              </div>
            ` : ''}

            <!-- Top Tool strip -->
            <div class="studio-top-bar">
              <div class="studio-top-tools">
                <button type="button" class="studio-tool-btn" id="btnToggleAllAccordions" title="Expand or collapse all sections">
                  <span id="icoToggleAll" aria-hidden="true">${icon('maximize2', { size: 12 })}</span>
                  <span id="lblToggleAllText">Expand All</span>
                </button>
                <button type="button" class="studio-tool-btn ${this.soloAccordionMode ? 'active' : ''}" id="btnToggleSoloMode" title="Focus Mode: Keep only one section open at a time to maximize screen space">
                  <span aria-hidden="true">${icon('layers', { size: 12 })}</span>
                  <span id="lblSoloModeText">${this.soloAccordionMode ? 'Solo Focus: ON' : 'Solo Focus'}</span>
                </button>
              </div>
              <div class="studio-top-tools">
                <input type="file" id="inputStudioImportJson" accept=".json,application/json" style="display: none;" aria-label="Import Template JSON" />
                <button type="button" class="studio-tool-btn" id="btnStudioImportTheme" title="Import Theme from JSON file">
                  ${icon('upload', { size: 12 })} Import JSON
                </button>
                <button type="button" class="studio-tool-btn" id="btnStudioExportTheme" title="Export Theme to JSON file">
                  ${icon('download', { size: 12 })} Export JSON
                </button>
                <button type="button" class="studio-tool-btn" id="btnStudioShareTheme" title="Copy shareable link">
                  ${icon('sparkles', { size: 12 })} Share Link
                </button>
              </div>
            </div>
          </div>

          <!-- Accordion Group Container (guarantees flex layout integrity on desktop) -->
          <div class="studio-accordions-group" id="studioAccordionsGroup">

          <!-- Section 1: Basic Info (Open by default) -->
          <div class="studio-accordion-card open" id="accordionSection1" data-accordion="section-name">
            <button type="button" class="studio-accordion-header" id="headerSection1" aria-controls="collapseSection1" aria-expanded="true">
              <div class="studio-accordion-title-wrap">
                <span class="studio-accordion-number">1</span>
                <span class="studio-accordion-title">Theme Identity</span>
              </div>
              <div class="studio-accordion-meta-wrap">
                <span class="studio-accordion-badge" id="badgeSection1">${escapeHtml(this.template.name)}</span>
                <span class="studio-accordion-chevron" aria-hidden="true">${icon('chevronDown', { size: 14 })}</span>
              </div>
            </button>
            <div class="studio-accordion-collapse" id="collapseSection1" role="region" aria-labelledby="headerSection1">
              <div class="studio-accordion-inner">
                <div class="studio-form-stack">
                  <div class="form-group">
                    <label class="form-label" for="studioThemeName">Template Name</label>
                    <input type="text" class="form-input" id="studioThemeName" value="${escapeHtml(this.template.name)}" placeholder="e.g. Cyber Velvet" aria-label="Template Name" />
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="studioCategorySelect">Category</label>
                    <select class="form-input studio-select" id="studioCategorySelect" aria-label="Theme Category">
                      ${PRESET_CATEGORIES.filter(c => c.id !== 'all').map(c => `
                        <option value="${c.id}" ${this.template.category === c.id ? 'selected' : ''}>${c.label}</option>
                      `).join('')}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 2: Abstract Geometry Patterns -->
          <div class="studio-accordion-card" id="accordionSection2" data-accordion="section-geometry">
            <button type="button" class="studio-accordion-header" id="headerSection2" aria-controls="collapseSection2" aria-expanded="false">
              <div class="studio-accordion-title-wrap">
                <span class="studio-accordion-number">2</span>
                <span class="studio-accordion-title">Abstract Lines & Geometry</span>
              </div>
              <div class="studio-accordion-meta-wrap">
                <span class="studio-accordion-badge" id="badgeSection2">${PATTERN_LABELS[this.template.abstractPattern] || this.template.abstractPattern || 'Clean'}</span>
                <span class="studio-accordion-chevron" aria-hidden="true">${icon('chevronDown', { size: 14 })}</span>
              </div>
            </button>
            <div class="studio-accordion-collapse" id="collapseSection2" role="region" aria-labelledby="headerSection2">
              <div class="studio-accordion-inner">
                <span style="font-size: 0.72rem; color: var(--text-muted); margin-bottom: 0.4rem; display: block;">Subtle geometric background lines that enhance elegance without overshadowing text:</span>
                <div class="abstract-patterns-grid" id="abstractPatternGrid" role="group" aria-label="Geometric pattern style">
                  <button type="button" class="option-chip-btn ${this.template.abstractPattern === 'orbital-rings' ? 'active' : ''}" data-pattern="orbital-rings">Orbital Rings</button>
                  <button type="button" class="option-chip-btn ${this.template.abstractPattern === 'fibonacci' ? 'active' : ''}" data-pattern="fibonacci">Golden Spiral</button>
                  <button type="button" class="option-chip-btn ${this.template.abstractPattern === 'celestial' ? 'active' : ''}" data-pattern="celestial">Star Map</button>
                  <button type="button" class="option-chip-btn ${this.template.abstractPattern === 'zen-waves' ? 'active' : ''}" data-pattern="zen-waves">Zen Waves</button>
                  <button type="button" class="option-chip-btn ${this.template.abstractPattern === 'isometric' ? 'active' : ''}" data-pattern="isometric">Isometric Grid</button>
                  <button type="button" class="option-chip-btn ${this.template.abstractPattern === 'sunburst' ? 'active' : ''}" data-pattern="sunburst">Sunburst Rays</button>
                  <button type="button" class="option-chip-btn ${this.template.abstractPattern === 'mandala' ? 'active' : ''}" data-pattern="mandala">Mandala</button>
                  <button type="button" class="option-chip-btn ${this.template.abstractPattern === 'diagonal-hatch' ? 'active' : ''}" data-pattern="diagonal-hatch">Fine Hatching</button>
                  <button type="button" class="option-chip-btn ${this.template.abstractPattern === 'topography' ? 'active' : ''}" data-pattern="topography">Topography</button>
                  <button type="button" class="option-chip-btn ${this.template.abstractPattern === 'perspective' ? 'active' : ''}" data-pattern="perspective">Horizon Grid</button>
                  <button type="button" class="option-chip-btn ${this.template.abstractPattern === 'sacred-polygon' ? 'active' : ''}" data-pattern="sacred-polygon">Sacred Polygon</button>
                  <button type="button" class="option-chip-btn ${this.template.abstractPattern === 'cyber-matrix' ? 'active' : ''}" data-pattern="cyber-matrix">Cyber Matrix</button>
                  <button type="button" class="option-chip-btn ${this.template.abstractPattern === 'constellation' ? 'active' : ''}" data-pattern="constellation">Constellation</button>
                  <button type="button" class="option-chip-btn ${this.template.abstractPattern === 'retro-synthwave' ? 'active' : ''}" data-pattern="retro-synthwave">Retro Synthwave</button>
                  <button type="button" class="option-chip-btn ${this.template.abstractPattern === 'voronoi-mesh' ? 'active' : ''}" data-pattern="voronoi-mesh">Voronoi Mesh</button>
                  <button type="button" class="option-chip-btn ${this.template.abstractPattern === 'hypercube' ? 'active' : ''}" data-pattern="hypercube">Hypercube</button>
                  <button type="button" class="option-chip-btn ${this.template.abstractPattern === 'arch-deco' ? 'active' : ''}" data-pattern="arch-deco">Art Deco Arch</button>
                  <button type="button" class="option-chip-btn ${this.template.abstractPattern === 'bauhaus-diagonals' ? 'active' : ''}" data-pattern="bauhaus-diagonals">Bauhaus Dynamic</button>
                  <button type="button" class="option-chip-btn ${this.template.abstractPattern === 'quantum-field' ? 'active' : ''}" data-pattern="quantum-field">Quantum Field</button>
                  <button type="button" class="option-chip-btn ${this.template.abstractPattern === 'soundwave-radar' ? 'active' : ''}" data-pattern="soundwave-radar">Soundwave Radar</button>
                  <button type="button" class="option-chip-btn ${!this.template.abstractPattern ? 'active' : ''}" data-pattern="">None (Clean)</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 3: Color Palette, WCAG Meter & Gradients -->
          <div class="studio-accordion-card" id="accordionSection3" data-accordion="section-colors">
            <button type="button" class="studio-accordion-header" id="headerSection3" aria-controls="collapseSection3" aria-expanded="false">
              <div class="studio-accordion-title-wrap">
                <span class="studio-accordion-number">3</span>
                <span class="studio-accordion-title">Color Palette & WCAG</span>
              </div>
              <div class="studio-accordion-meta-wrap">
                <span class="studio-accordion-badge" id="badgeSection3">AAA Check</span>
                <span class="studio-accordion-chevron" aria-hidden="true">${icon('chevronDown', { size: 14 })}</span>
              </div>
            </button>
            <div class="studio-accordion-collapse" id="collapseSection3" role="region" aria-labelledby="headerSection3">
              <div class="studio-accordion-inner">
                <div class="color-picker-grid">
                  <div class="color-input-item">
                    <input type="color" class="color-swatch-input" id="colorBg" value="${toValidHex(this.template.background, '#0a0d14')}" aria-label="Background Color" />
                    <div class="color-item-labels">
                      <label for="colorBg">Background</label>
                      <span class="color-hex-tag" id="hexBg">${this.template.background}</span>
                    </div>
                  </div>
                  <div class="color-input-item">
                    <input type="color" class="color-swatch-input" id="colorText" value="${toValidHex(this.template.textColor, '#ffffff')}" aria-label="Quote Text Color" />
                    <div class="color-item-labels">
                      <label for="colorText">Text</label>
                      <span class="color-hex-tag" id="hexText">${this.template.textColor}</span>
                    </div>
                  </div>
                  <div class="color-input-item">
                    <input type="color" class="color-swatch-input" id="colorAccent" value="${toValidHex(this.template.accentColor, '#38bdf8')}" aria-label="Accent Color" />
                    <div class="color-item-labels">
                      <label for="colorAccent">Accent</label>
                      <span class="color-hex-tag" id="hexAccent">${this.template.accentColor}</span>
                    </div>
                  </div>
                  <div class="color-input-item">
                    <input type="color" class="color-swatch-input" id="colorMeta" value="${toValidHex(this.template.metaColor, '#94a3b8')}" aria-label="Secondary Meta Color" />
                    <div class="color-item-labels">
                      <label for="colorMeta">Secondary</label>
                      <span class="color-hex-tag" id="hexMeta">${this.template.metaColor}</span>
                    </div>
                  </div>
                </div>

                <!-- WCAG Contrast Meter Card -->
                <div class="wcag-meter-card" id="wcagMeterCard">
                  <div class="wcag-meter-info">
                    <div class="wcag-preview-swatch" id="wcagSwatch" style="background: ${this.template.background}; color: ${this.template.textColor};">
                      Aa
                    </div>
                    <div class="wcag-score-text">
                      <div class="wcag-score-headline">
                        <span id="wcagRatioValue">11.2:1</span>
                        <span class="wcag-status-pill pass" id="wcagStatusPill">AAA Pass</span>
                      </div>
                      <span style="font-size: 0.7rem; color: var(--text-muted);" id="wcagDescText">Excellent contrast for text</span>
                    </div>
                  </div>
                  <button type="button" class="btn-autofix-contrast" id="btnAutoFixContrast" title="Auto-adjust text color for high WCAG compliance">
                    ${icon('sparkles', { size: 12 })} Auto-Fix Contrast
                  </button>
                </div>

                <!-- Curated Aesthetic Color Palettes -->
                <div style="margin-top: 0.65rem;">
                  <span style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-bottom: 0.35rem;">Curated Aesthetic Color Schemes:</span>
                  <div class="curated-palettes-row" id="curatedPalettesRow" role="group" aria-label="Curated color schemes">
                    <button type="button" class="palette-preset-chip" data-bg="#0a0d14" data-text="#ffffff" data-accent="#38bdf8" data-meta="#94a3b8" title="Cyber Velvet">
                      <span class="palette-chip-dot" style="background: #38bdf8;"></span>
                      <span>Cyber Velvet</span>
                    </button>
                    <button type="button" class="palette-preset-chip" data-bg="#0f172a" data-text="#f8fafc" data-accent="#f59e0b" data-meta="#94a3b8" title="Midnight Amber">
                      <span class="palette-chip-dot" style="background: #f59e0b;"></span>
                      <span>Midnight Amber</span>
                    </button>
                    <button type="button" class="palette-preset-chip" data-bg="#18181b" data-text="#fafafa" data-accent="#a855f7" data-meta="#a1a1aa" title="Deep Amethyst">
                      <span class="palette-chip-dot" style="background: #a855f7;"></span>
                      <span>Deep Amethyst</span>
                    </button>
                    <button type="button" class="palette-preset-chip" data-bg="#064e3b" data-text="#ecfdf5" data-accent="#34d399" data-meta="#a7f3d0" title="Emerald Luxe">
                      <span class="palette-chip-dot" style="background: #34d399;"></span>
                      <span>Emerald Luxe</span>
                    </button>
                    <button type="button" class="palette-preset-chip" data-bg="#1c1917" data-text="#fef3c7" data-accent="#fbbf24" data-meta="#d6d3d1" title="Warm Editorial">
                      <span class="palette-chip-dot" style="background: #fbbf24;"></span>
                      <span>Warm Editorial</span>
                    </button>
                    <button type="button" class="palette-preset-chip" data-bg="#450a0a" data-text="#fff1f2" data-accent="#f43f5e" data-meta="#fecdd3" title="Crimson Noir">
                      <span class="palette-chip-dot" style="background: #f43f5e;"></span>
                      <span>Crimson Noir</span>
                    </button>
                    <button type="button" class="palette-preset-chip" data-bg="#f8fafc" data-text="#0f172a" data-accent="#2563eb" data-meta="#64748b" title="Pure Modern">
                      <span class="palette-chip-dot" style="background: #2563eb;"></span>
                      <span>Pure Modern</span>
                    </button>
                  </div>
                </div>

                <!-- Gradient Presets Quick Swatches -->
                <div style="margin-top: 0.65rem;">
                  <span style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-bottom: 0.4rem;">Or Choose Background Gradient:</span>
                  <div class="gradient-swatches-row" id="gradientSwatches" role="group" aria-label="Gradient color presets">
                    <button type="button" class="gradient-swatch-btn ${!this.template.gradient ? 'active' : ''}" data-grad="" style="background: ${this.template.background};" title="Solid Background" aria-label="Solid background"></button>
                    <button type="button" class="gradient-swatch-btn ${this.template.gradient === 'linear-gradient(135deg, #090a0f 0%, #17153b 50%, #0f172a 100%)' ? 'active' : ''}" data-grad="linear-gradient(135deg, #090a0f 0%, #17153b 50%, #0f172a 100%)" style="background: linear-gradient(135deg, #090a0f 0%, #17153b 50%, #0f172a 100%);" title="Cyber Dark" aria-label="Cyber Dark gradient"></button>
                    <button type="button" class="gradient-swatch-btn ${this.template.gradient === 'linear-gradient(180deg, #1b003a 0%, #751268 60%, #ff5e62 100%)' ? 'active' : ''}" data-grad="linear-gradient(180deg, #1b003a 0%, #751268 60%, #ff5e62 100%)" style="background: linear-gradient(180deg, #1b003a 0%, #751268 60%, #ff5e62 100%);" title="Retro Sunset" aria-label="Retro Sunset gradient"></button>
                    <button type="button" class="gradient-swatch-btn ${this.template.gradient === 'linear-gradient(160deg, #020617 0%, #0c2b4e 50%, #064e3b 100%)' ? 'active' : ''}" data-grad="linear-gradient(160deg, #020617 0%, #0c2b4e 50%, #064e3b 100%);" title="Deep Abyss" aria-label="Deep Abyss gradient"></button>
                    <button type="button" class="gradient-swatch-btn ${this.template.gradient === 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' ? 'active' : ''}" data-grad="linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);" title="Nordic Aurora" aria-label="Nordic Aurora gradient"></button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 4: Typography & Google Fonts -->
          <div class="studio-accordion-card" id="accordionSection4" data-accordion="section-typography">
            <button type="button" class="studio-accordion-header" id="headerSection4" aria-controls="collapseSection4" aria-expanded="false">
              <div class="studio-accordion-title-wrap">
                <span class="studio-accordion-number">4</span>
                <span class="studio-accordion-title">Typography & Google Fonts</span>
              </div>
              <div class="studio-accordion-meta-wrap">
                <span class="studio-accordion-badge" id="badgeSection4">${this.template.fontFamily}</span>
                <span class="studio-accordion-chevron" aria-hidden="true">${icon('chevronDown', { size: 14 })}</span>
              </div>
            </button>
            <div class="studio-accordion-collapse" id="collapseSection4" role="region" aria-labelledby="headerSection4">
              <div class="studio-accordion-inner">
                <div style="display: flex; justify-content: flex-end; gap: 0.4rem; margin-bottom: 0.5rem;">
                  <button type="button" class="btn-glass" id="btnStudioPairings" style="padding: 0.35rem 0.65rem; font-size: 0.74rem; border-color: var(--brand-primary); color: var(--brand-primary);" aria-label="Browse 6 Signature Font Pairings">
                    <span aria-hidden="true">${icon('layers', { size: 12 })}</span>
                    <span>Signature Pairings</span>
                  </button>
                  <button type="button" class="inspire-btn" id="btnStudioBrowseFonts" style="padding: 0.35rem 0.65rem; font-size: 0.74rem;" aria-label="Browse 40+ curated Google Fonts">
                    <span aria-hidden="true">${icon('sparkles', { size: 12 })}</span>
                    <span>Browse All Fonts</span>
                  </button>
                </div>

                <div class="typography-studio-card">
                  <!-- Quote Font Selector -->
                  <div class="typography-row">
                    <div class="typography-font-meta">
                      <span class="typography-role-tag">Quote Font</span>
                      <span class="typography-font-name" id="lblStudioQuoteFontName" style="font-family: ${FontLoaderService.getFallbackStack(this.template.fontFamily || 'Space Grotesk')}; font-size: 0.95rem;">${escapeHtml(this.template.fontFamily || 'Space Grotesk')}</span>
                      <span class="typography-sample-text" id="lblStudioQuoteFontSample" style="font-family: ${FontLoaderService.getFallbackStack(this.template.fontFamily || 'Space Grotesk')};">“Creativity is intelligence having fun.”</span>
                    </div>
                    <button type="button" class="btn-glass" id="btnStudioChangeQuoteFont" style="padding: 0.4rem 0.75rem; font-size: 0.76rem;" aria-label="Change quote font">
                      Change
                    </button>
                  </div>

                  <!-- Author Font Selector -->
                  <div class="typography-row">
                    <div class="typography-font-meta">
                      <span class="typography-role-tag">Author & Meta Font</span>
                      <span class="typography-font-name" id="lblStudioAuthorFontName" style="font-family: ${FontLoaderService.getFallbackStack(this.template.authorFontFamily || 'Plus Jakarta Sans')}; font-size: 0.95rem;">${escapeHtml(this.template.authorFontFamily || 'Plus Jakarta Sans')}</span>
                      <span class="typography-sample-text" id="lblStudioAuthorFontSample" style="font-family: ${FontLoaderService.getFallbackStack(this.template.authorFontFamily || 'Plus Jakarta Sans')};">— Albert Einstein</span>
                    </div>
                    <button type="button" class="btn-glass" id="btnStudioChangeAuthorFont" style="padding: 0.4rem 0.75rem; font-size: 0.76rem;" aria-label="Change author signature font">
                      Change
                    </button>
                  </div>

                  <!-- Alignment & Weight -->
                  <div class="typo-micro-controls">
                    <div class="typo-control-group">
                      <span class="typo-control-label">Alignment</span>
                      <div class="typo-btn-group" id="studioTypoAlignGroup" role="radiogroup" aria-label="Template Text Alignment">
                        <button type="button" class="typo-btn ${(!this.template.textAlign || this.template.textAlign === 'left') ? 'active' : ''}" data-align="left" role="radio" aria-checked="${(!this.template.textAlign || this.template.textAlign === 'left')}">
                          <span aria-hidden="true">${icon('alignLeft', { size: 13 })}</span>
                          <span>Left</span>
                        </button>
                        <button type="button" class="typo-btn ${this.template.textAlign === 'center' ? 'active' : ''}" data-align="center" role="radio" aria-checked="${this.template.textAlign === 'center'}">
                          <span aria-hidden="true">${icon('alignCenter', { size: 13 })}</span>
                          <span>Center</span>
                        </button>
                        <button type="button" class="typo-btn ${this.template.textAlign === 'right' ? 'active' : ''}" data-align="right" role="radio" aria-checked="${this.template.textAlign === 'right'}">
                          <span aria-hidden="true">${icon('alignRight', { size: 13 })}</span>
                          <span>Right</span>
                        </button>
                      </div>
                    </div>

                    <div class="typo-control-group">
                      <span class="typo-control-label">Quote Weight</span>
                      <div class="typo-btn-group" id="studioTypoWeightGroup" role="radiogroup" aria-label="Template Font Weight">
                        <button type="button" class="typo-btn ${this.template.fontWeight == 400 ? 'active' : ''}" data-weight="400" role="radio" aria-checked="${this.template.fontWeight == 400}">Regular</button>
                        <button type="button" class="typo-btn ${(this.template.fontWeight == 600 || !this.template.fontWeight) ? 'active' : ''}" data-weight="600" role="radio" aria-checked="${(this.template.fontWeight == 600 || !this.template.fontWeight)}">Semi</button>
                        <button type="button" class="typo-btn ${this.template.fontWeight == 700 ? 'active' : ''}" data-weight="700" role="radio" aria-checked="${this.template.fontWeight == 700}">Bold</button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Quote Marks Selection -->
                <div style="margin-top: 0.65rem;">
                  <span style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-bottom: 0.35rem;">Quote Mark Styling:</span>
                  <div class="option-chips-grid" id="quoteMarkOptionsGrid" role="group" aria-label="Quote Mark Style">
                    <button type="button" class="option-chip-btn ${this.template.quoteMarkStyle === 'classic' ? 'active' : ''}" data-qm="classic">Classic “ ”</button>
                    <button type="button" class="option-chip-btn ${this.template.quoteMarkStyle === 'modern-brackets' ? 'active' : ''}" data-qm="modern-brackets">Brackets // </button>
                    <button type="button" class="option-chip-btn ${this.template.quoteMarkStyle === 'minimal-dash' ? 'active' : ''}" data-qm="minimal-dash">Minimal —</button>
                    <button type="button" class="option-chip-btn ${this.template.quoteMarkStyle === 'decorative-stars' ? 'active' : ''}" data-qm="decorative-stars">Stars ✦</button>
                    <button type="button" class="option-chip-btn ${this.template.quoteMarkStyle === 'none' ? 'active' : ''}" data-qm="none">None</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 5: Layout & Canvas Placements -->
          <div class="studio-accordion-card" id="accordionSection5" data-accordion="section-layout">
            <button type="button" class="studio-accordion-header" id="headerSection5" aria-controls="collapseSection5" aria-expanded="false">
              <div class="studio-accordion-title-wrap">
                <span class="studio-accordion-number">5</span>
                <span class="studio-accordion-title">Layout & Canvas Placements</span>
              </div>
              <div class="studio-accordion-meta-wrap">
                <span class="studio-accordion-badge" id="badgeSection5">${(LAYOUT_STYLES.find(l => l.id === this.template.layoutId) || {}).name || 'Layout'}</span>
                <span class="studio-accordion-chevron" aria-hidden="true">${icon('chevronDown', { size: 14 })}</span>
              </div>
            </button>
            <div class="studio-accordion-collapse" id="collapseSection5" role="region" aria-labelledby="headerSection5">
              <div class="studio-accordion-inner">
                <div class="studio-form-stack">
                  <div class="form-group">
                    <label class="form-label" for="studioLayoutSelect">Associated Layout Style</label>
                    <select class="form-input studio-select" id="studioLayoutSelect" aria-label="Associated Layout Style">
                      ${LAYOUT_STYLES.map(l => `
                        <option value="${l.id}" ${this.template.layoutId === l.id ? 'selected' : ''}>${l.name}</option>
                      `).join('')}
                    </select>
                  </div>

                  <div class="form-group">
                    <label class="form-label" for="studioPlacementSelect">Default Portrait Placement</label>
                    <select class="form-input studio-select" id="studioPlacementSelect" aria-label="Default Portrait Placement">
                      ${PORTRAIT_PLACEMENTS.map(p => `
                        <option value="${p.id}" ${this.template.portraitPlacement === p.id ? 'selected' : ''}>${p.label}</option>
                      `).join('')}
                    </select>
                  </div>

                  <!-- 6 Canvas Placements: Author, Date, Category -->
                  <div style="margin-top: 0.45rem; display: flex; flex-direction: column; gap: 0.45rem;">
                    <div class="studio-pos-row">
                      <span class="studio-pos-lbl">Author Placement</span>
                      <div class="pos-segmented-bar" id="studioAuthorPosSelector" role="radiogroup" aria-label="Default Author Placement">
                        <button type="button" class="pos-chip ${(!this.template.authorPlacement || this.template.authorPlacement === 'auto') ? 'active' : ''}" data-studio-author-pos="auto" title="Auto (Inline below quote)">Auto</button>
                        ${CANVAS_PLACEMENTS.map(p => `
                          <button type="button" class="pos-chip ${this.template.authorPlacement === p.id ? 'active' : ''}" data-studio-author-pos="${p.id}" title="${p.label}">${p.short}</button>
                        `).join('')}
                      </div>
                    </div>

                    <div class="studio-pos-row">
                      <span class="studio-pos-lbl">Date Placement</span>
                      <div class="pos-segmented-bar" id="studioDatePosSelector" role="radiogroup" aria-label="Default Date Placement">
                        ${CANVAS_PLACEMENTS.map(p => `
                          <button type="button" class="pos-chip ${(this.template.datePlacement || 'top-right') === p.id ? 'active' : ''}" data-studio-date-pos="${p.id}" title="${p.label}">${p.short}</button>
                        `).join('')}
                      </div>
                    </div>

                    <div class="studio-pos-row">
                      <span class="studio-pos-lbl">Category Placement</span>
                      <div class="pos-segmented-bar" id="studioCategoryPosSelector" role="radiogroup" aria-label="Default Category Placement">
                        ${CANVAS_PLACEMENTS.map(p => `
                          <button type="button" class="pos-chip ${(this.template.categoryPlacement || 'top-left') === p.id ? 'active' : ''}" data-studio-cat-pos="${p.id}" title="${p.label}">${p.short}</button>
                        `).join('')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 6: Frame & Border Aesthetic -->
          <div class="studio-accordion-card" id="accordionSection6" data-accordion="section-border">
            <button type="button" class="studio-accordion-header" id="headerSection6" aria-controls="collapseSection6" aria-expanded="false">
              <div class="studio-accordion-title-wrap">
                <span class="studio-accordion-number">6</span>
                <span class="studio-accordion-title">Frame & Border Aesthetic</span>
              </div>
              <div class="studio-accordion-meta-wrap">
                <span class="studio-accordion-badge" id="badgeSection6">${(this.template.borderStyle || 'neon-glow').replace(/-/g, ' ').toUpperCase()}</span>
                <span class="studio-accordion-chevron" aria-hidden="true">${icon('chevronDown', { size: 14 })}</span>
              </div>
            </button>
            <div class="studio-accordion-collapse" id="collapseSection6" role="region" aria-labelledby="headerSection6">
              <div class="studio-accordion-inner">
                <div class="option-chips-grid" id="borderOptionsGrid" role="group" aria-label="Border style options">
                  <button type="button" class="option-chip-btn ${this.template.borderStyle === 'double' ? 'active' : ''}" data-border="double">Double Line</button>
                  <button type="button" class="option-chip-btn ${this.template.borderStyle === 'neon-glow' ? 'active' : ''}" data-border="neon-glow">Neon Glow</button>
                  <button type="button" class="option-chip-btn ${this.template.borderStyle === 'gold-inlay' ? 'active' : ''}" data-border="gold-inlay">Gold Inlay</button>
                  <button type="button" class="option-chip-btn ${this.template.borderStyle === 'brutalist-solid' ? 'active' : ''}" data-border="brutalist-solid">Brutalist</button>
                  <button type="button" class="option-chip-btn ${this.template.borderStyle === 'polaroid' ? 'active' : ''}" data-border="polaroid">Polaroid</button>
                  <button type="button" class="option-chip-btn ${this.template.borderStyle === 'subtle-frame' ? 'active' : ''}" data-border="subtle-frame">Subtle Rim</button>
                  <button type="button" class="option-chip-btn ${this.template.borderStyle === 'none' ? 'active' : ''}" data-border="none">No Border</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 7: Watermark & Branding Suite -->
          <div class="studio-accordion-card" id="accordionSection7" data-accordion="section-branding">
            <button type="button" class="studio-accordion-header" id="headerSection7" aria-controls="collapseSection7" aria-expanded="false">
              <div class="studio-accordion-title-wrap">
                <span class="studio-accordion-number">7</span>
                <span class="studio-accordion-title">Watermark & Branding Suite</span>
              </div>
              <div class="studio-accordion-meta-wrap">
                <span class="studio-accordion-badge" id="badgeSection7">${(this.template.brandingSize || 'm').toUpperCase()} • ${this.template.brandingPosition || 'BR'}</span>
                <span class="studio-accordion-chevron" aria-hidden="true">${icon('chevronDown', { size: 14 })}</span>
              </div>
            </button>
            <div class="studio-accordion-collapse" id="collapseSection7" role="region" aria-labelledby="headerSection7">
              <div class="studio-accordion-inner">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
                  <label for="toggleStudioWatermark" class="form-label" style="margin: 0; cursor: pointer;">Enable Branding & Watermark</label>
                  <input type="checkbox" id="toggleStudioWatermark" ${this.template.showWatermark ? 'checked' : ''} style="width: 17px; height: 17px; accent-color: var(--brand-primary); cursor: pointer;" />
                </div>

                <div class="studio-form-stack" id="studioBrandingOptionsBody" style="${this.template.showWatermark ? '' : 'opacity: 0.45; pointer-events: none;'}">
                  <div class="form-group">
                    <label class="form-label" for="studioWatermarkText">Brand / Watermark Name</label>
                    <input type="text" class="form-input" id="studioWatermarkText" value="${escapeHtml(this.template.watermark || 'QuoteForge Studio')}" placeholder="e.g. My Studio" />
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="studioBrandingHandle">Social Handle / Tagline</label>
                    <input type="text" class="form-input" id="studioBrandingHandle" value="${escapeHtml(this.template.brandingHandle || '@quoteforge')}" placeholder="@handle" />
                  </div>

                  <!-- Branding Display Style Segmented Grid -->
                  <div>
                    <label class="form-label" style="margin-bottom: 0.35rem; display: block;">Branding Display Style</label>
                    <div class="branding-style-selector" id="studioBrandingStyleSelector" role="radiogroup" aria-label="Branding Display Style">
                      ${BRANDING_STYLES.map(s => `
                        <button type="button" class="branding-style-btn ${this.template.brandingStyle === s.id ? 'active' : ''}" data-style="${s.id}" role="radio" aria-checked="${this.template.brandingStyle === s.id}">
                          <strong>${s.label}</strong>
                          <span>${s.desc}</span>
                        </button>
                      `).join('')}
                    </div>
                  </div>

                  <!-- Custom Logo Uploader -->
                  <div class="form-group">
                    <label class="form-label">Custom Logo / Emblem</label>
                    <div class="logo-uploader-strip">
                      <div class="logo-uploader-info">
                        <div class="logo-uploader-thumb" id="studioLogoThumb">
                          ${this.template.brandingLogo ? `<img src="${this.template.brandingLogo}" alt="Logo" />` : icon('image', { size: 16 })}
                        </div>
                        <div>
                          <div style="font-size: 0.84rem; font-weight: 700;" id="lblStudioLogoStatus">${this.template.brandingLogo ? 'Custom Logo Active' : 'No Logo Uploaded'}</div>
                          <div style="font-size: 0.72rem; color: var(--text-muted);">PNG, SVG, or WEBP (transparent recommended)</div>
                        </div>
                      </div>
                      <div class="logo-uploader-actions" style="display: flex; gap: 0.4rem;">
                        <input type="file" id="inputStudioLogoFile" accept="image/png,image/svg+xml,image/jpeg,image/webp" style="display: none;" aria-label="Upload custom logo file" />
                        <button type="button" class="btn-glass" id="btnStudioUploadLogo" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;" aria-label="Upload custom brand logo">
                          ${icon('upload', { size: 13 })} Upload Logo
                        </button>
                        <button type="button" class="btn-glass" id="btnClearStudioLogo" style="padding: 0.35rem 0.55rem; color: #f87171; display: ${this.template.brandingLogo ? 'inline-flex' : 'none'};" title="Remove logo" aria-label="Remove logo">
                          ${icon('trash', { size: 13 })}
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Canvas Placement (6 Positions) -->
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                      <label class="form-label" style="margin: 0;">Canvas Placement</label>
                      <span style="font-size: 0.72rem; font-weight: 700; color: var(--brand-primary); text-transform: uppercase;">${(BRANDING_POSITIONS.find(p => p.id === this.template.brandingPosition) || {}).label || 'Bottom Right'}</span>
                    </div>
                    <div class="branding-pos-selector" id="studioBrandingPosSelector" role="radiogroup" aria-label="Branding Placement on Canvas">
                      ${BRANDING_POSITIONS.map(p => `
                        <button type="button" class="branding-pos-btn ${this.template.brandingPosition === p.id ? 'active' : ''}" data-pos="${p.id}" role="radio" aria-checked="${this.template.brandingPosition === p.id}" title="${p.label}">
                          <span>${p.label}</span>
                        </button>
                      `).join('')}
                    </div>
                  </div>

                  <!-- Size Scale (XS to XXXL) -->
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                      <label class="form-label" style="margin: 0;">Branding Size Scale</label>
                      <span style="font-size: 0.72rem; font-weight: 700; color: var(--brand-primary); text-transform: uppercase;" id="lblStudioBrandingSize">${(this.template.brandingSize || 'm').toUpperCase()}</span>
                    </div>
                    <div class="size-segmented-bar" id="studioBrandingSizeSelector" role="radiogroup" aria-label="Branding Suite Size Scale">
                      ${BRANDING_SIZES.map(s => `
                        <button type="button" class="size-chip ${(this.template.brandingSize || 'm') === s.id ? 'active' : ''}" data-studio-branding-size="${s.id}" role="radio" aria-checked="${(this.template.brandingSize || 'm') === s.id}" title="Size ${s.label} (${s.scale}x scale)">
                          ${s.label}
                        </button>
                      `).join('')}
                    </div>
                  </div>

                  <!-- Opacity Slider -->
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                      <label for="sliderStudioBrandingOpacity" class="form-label">Watermark Opacity</label>
                      <span style="font-size: 0.78rem; font-weight: 700; color: var(--brand-primary);" id="lblStudioBrandingOpacity">${Math.round((this.template.brandingOpacity ?? 0.85) * 100)}%</span>
                    </div>
                    <input type="range" id="sliderStudioBrandingOpacity" min="10" max="100" value="${Math.round((this.template.brandingOpacity ?? 0.85) * 100)}" aria-label="Watermark Opacity" style="width: 100%; accent-color: var(--brand-primary);" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>

          <!-- Publish Action Button -->
          <button type="button" class="btn-primary" id="btnPublishTemplate" style="width: 100%; justify-content: center; padding: 0.85rem; margin-top: 0.5rem; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>${icon('sparkles', { size: 16 })}</span>
            <span id="lblPublishBtnText">${this.editingTemplateId ? 'Update Template in Presets' : 'Publish Template to Presets'}</span>
          </button>
        </div>

        <!-- Studio Preview Pane -->
        <div class="studio-preview-pane">
          <div class="studio-preview-header">
            <span class="studio-preview-title">
              <span class="studio-preview-dot"></span>
              Live Canvas Preview
            </span>
            <div class="studio-ratio-switcher" id="studioRatioSwitcher" role="radiogroup" aria-label="Aspect ratio">
              <button type="button" class="studio-ratio-btn ${this.currentPreviewRatio === '1:1' ? 'active' : ''}" data-ratio="1:1" role="radio" aria-checked="${this.currentPreviewRatio === '1:1'}">
                <span class="studio-ratio-full">1:1 Square</span>
                <span class="studio-ratio-short">1:1</span>
              </button>
              <button type="button" class="studio-ratio-btn ${this.currentPreviewRatio === '9:16' ? 'active' : ''}" data-ratio="9:16" role="radio" aria-checked="${this.currentPreviewRatio === '9:16'}">
                <span class="studio-ratio-full">9:16 Story</span>
                <span class="studio-ratio-short">9:16</span>
              </button>
              <button type="button" class="studio-ratio-btn ${this.currentPreviewRatio === '4:5' ? 'active' : ''}" data-ratio="4:5" role="radio" aria-checked="${this.currentPreviewRatio === '4:5'}">
                <span class="studio-ratio-full">4:5 Post</span>
                <span class="studio-ratio-short">4:5</span>
              </button>
              <button type="button" class="studio-ratio-btn ${this.currentPreviewRatio === '16:9' ? 'active' : ''}" data-ratio="16:9" role="radio" aria-checked="${this.currentPreviewRatio === '16:9'}">
                <span class="studio-ratio-full">16:9 Wide</span>
                <span class="studio-ratio-short">16:9</span>
              </button>
            </div>
          </div>

          <!-- Sample Quote Length Switcher -->
          <div class="sample-quote-bar">
            <span class="sample-quote-label">Sample Quote:</span>
            <div class="sample-quote-chips" id="sampleQuoteSwitcher">
              <button type="button" class="sample-quote-chip ${this.sampleQuoteMode === 'short' ? 'active' : ''}" data-sample="short">Short</button>
              <button type="button" class="sample-quote-chip ${this.sampleQuoteMode === 'medium' ? 'active' : ''}" data-sample="medium">Medium</button>
              <button type="button" class="sample-quote-chip ${this.sampleQuoteMode === 'long' ? 'active' : ''}" data-sample="long">Long</button>
              <button type="button" class="sample-quote-chip ${this.sampleQuoteMode === 'custom' ? 'active' : ''}" data-sample="custom">Custom...</button>
            </div>
          </div>

          <div class="studio-canvas-container" id="studioCanvasContainer">
            <canvas id="studioLiveCanvas"></canvas>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.updateTypographyUI();
    this.updateBrandingUI();
    this.updateColorInputs();
    this.updateAccordionBadges();
    this.scheduleRender();
  }

  bindEvents() {
    // Helper to keep Expand/Collapse button synchronized with real accordion states
    const updateToggleAllButton = () => {
      const allCards = Array.from(this.containerEl.querySelectorAll('.studio-accordion-card'));
      const openCards = allCards.filter(c => c.classList.contains('open'));
      const btnToggleAll = this.containerEl.querySelector('#btnToggleAllAccordions');
      const lblToggleAll = this.containerEl.querySelector('#lblToggleAllText');
      const icoToggleAll = this.containerEl.querySelector('#icoToggleAll');

      const allOpen = openCards.length === allCards.length && allCards.length > 0;
      this.allAccordionsOpen = allOpen;

      if (lblToggleAll) {
        lblToggleAll.textContent = allOpen ? 'Collapse All' : 'Expand All';
      }
      if (icoToggleAll) {
        icoToggleAll.innerHTML = allOpen ? icon('minimize2', { size: 12 }) : icon('maximize2', { size: 12 });
      }
      if (btnToggleAll) {
        btnToggleAll.setAttribute('aria-label', allOpen ? 'Collapse all accordion sections' : 'Expand all accordion sections');
      }
    };

    // Accordion click handlers with optional Solo Focus mode
    this.containerEl.querySelectorAll('.studio-accordion-header').forEach(header => {
      header.addEventListener('click', () => {
        const card = header.closest('.studio-accordion-card');
        if (!card) return;
        const willOpen = !card.classList.contains('open');

        if (this.soloAccordionMode && willOpen) {
          // Solo Focus: Close all other cards to keep screen compact & eliminate clutter
          this.containerEl.querySelectorAll('.studio-accordion-card').forEach(other => {
            if (other !== card && other.classList.contains('open')) {
              other.classList.remove('open');
              other.querySelector('.studio-accordion-header')?.setAttribute('aria-expanded', 'false');
            }
          });
        }

        card.classList.toggle('open', willOpen);
        header.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
        updateToggleAllButton();

        if (willOpen) {
          setTimeout(() => {
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 60);
        }
      });
    });

    // Expand / Collapse All
    const btnToggleAll = this.containerEl.querySelector('#btnToggleAllAccordions');
    btnToggleAll?.addEventListener('click', () => {
      const allCards = Array.from(this.containerEl.querySelectorAll('.studio-accordion-card'));
      const openCards = allCards.filter(c => c.classList.contains('open'));
      // If any card is closed, expand all; if all are open, collapse all
      const shouldOpenAll = openCards.length < allCards.length;

      allCards.forEach(card => {
        card.classList.toggle('open', shouldOpenAll);
        const header = card.querySelector('.studio-accordion-header');
        header?.setAttribute('aria-expanded', shouldOpenAll ? 'true' : 'false');
      });

      this.allAccordionsOpen = shouldOpenAll;
      updateToggleAllButton();
    });

    // Solo Focus Mode Toggle
    const btnToggleSolo = this.containerEl.querySelector('#btnToggleSoloMode');
    const lblSoloMode = this.containerEl.querySelector('#lblSoloModeText');
    btnToggleSolo?.addEventListener('click', () => {
      this.soloAccordionMode = !this.soloAccordionMode;
      btnToggleSolo.classList.toggle('active', this.soloAccordionMode);
      if (lblSoloMode) {
        lblSoloMode.textContent = this.soloAccordionMode ? 'Solo Focus: ON' : 'Solo Focus';
      }

      if (this.soloAccordionMode) {
        // When enabling Solo Focus, collapse all open cards except the first one
        const openCards = Array.from(this.containerEl.querySelectorAll('.studio-accordion-card.open'));
        if (openCards.length > 1) {
          openCards.slice(1).forEach(c => {
            c.classList.remove('open');
            c.querySelector('.studio-accordion-header')?.setAttribute('aria-expanded', 'false');
          });
          updateToggleAllButton();
        }
        Toast.show('Solo Focus ON: Only one section remains open to maximize screen space', 'info');
      } else {
        Toast.show('Solo Focus OFF: Multiple sections can now be open simultaneously', 'info');
      }
    });

    updateToggleAllButton();

    // Discard Draft
    const btnDiscard = this.containerEl.querySelector('#btnDiscardDraft');
    btnDiscard?.addEventListener('click', () => {
      StorageService.clearStudioDraft();
      this.hasRestoredDraft = false;
      this.template = { ...this.defaultTemplate };
      this.render();
      Toast.show('Draft discarded, reset to default theme', 'info');
    });

    // Export Theme JSON
    const btnExportTheme = this.containerEl.querySelector('#btnStudioExportTheme');
    btnExportTheme?.addEventListener('click', () => {
      const exportData = {
        app: 'QuoteForge',
        schemaVersion: '1.0.0',
        exportedAt: new Date().toISOString(),
        template: this.template
      };
      const json = JSON.stringify(exportData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quoteforge-theme-${(this.template.name || 'custom').toLowerCase().replace(/\s+/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      Toast.show(`Exported theme "${this.template.name}"!`, 'success');
    });

    // Import Theme JSON
    const btnImportTheme = this.containerEl.querySelector('#btnStudioImportTheme');
    const inputImportJson = this.containerEl.querySelector('#inputStudioImportJson');
    btnImportTheme?.addEventListener('click', () => inputImportJson?.click());
    inputImportJson?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        const tpl = parsed.template || parsed;
        if (tpl && tpl.name) {
          this.loadTemplate(tpl, { isEditing: false });
          Toast.show(`Imported theme "${tpl.name}"!`, 'success');
        } else {
          Toast.show('Invalid theme file structure', 'error');
        }
      } catch (err) {
        Toast.show('Error reading JSON file', 'error');
      } finally {
        inputImportJson.value = '';
      }
    });

    // Shareable Theme Link
    const btnShareTheme = this.containerEl.querySelector('#btnStudioShareTheme');
    btnShareTheme?.addEventListener('click', () => {
      try {
        const safeTemplate = { ...this.template, brandingLogo: null };
        const b64 = btoa(encodeURIComponent(JSON.stringify(safeTemplate)));
        const shareUrl = `${window.location.origin}${window.location.pathname}#studio?theme=${b64}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
          Toast.show('Copied shareable theme link to clipboard!', 'success');
        }).catch(() => {
          prompt('Copy this shareable theme URL:', shareUrl);
        });
      } catch (e) {
        Toast.show('Could not generate share link', 'error');
      }
    });

    // Sample Quote Switcher
    const sampleSwitcher = this.containerEl.querySelector('#sampleQuoteSwitcher');
    sampleSwitcher?.addEventListener('click', (e) => {
      const btn = e.target.closest('.sample-quote-chip');
      if (!btn) return;
      const mode = btn.dataset.sample;
      if (mode === 'custom') {
        const userQuote = prompt('Enter custom sample quote to preview:', SAMPLE_QUOTES.custom.quote);
        if (userQuote && userQuote.trim()) {
          SAMPLE_QUOTES.custom.quote = userQuote.trim();
          const userAuthor = prompt('Enter author name:', SAMPLE_QUOTES.custom.author) || 'Author';
          SAMPLE_QUOTES.custom.author = userAuthor.trim();
        } else {
          return;
        }
      }
      this.sampleQuoteMode = mode;
      sampleSwitcher.querySelectorAll('.sample-quote-chip').forEach(b => {
        b.classList.toggle('active', b.dataset.sample === mode);
      });
      this.scheduleRender();
    });

    // Theme Name & Category
    const nameInput = this.containerEl.querySelector('#studioThemeName');
    const catSelect = this.containerEl.querySelector('#studioCategorySelect');
    const layoutSelect = this.containerEl.querySelector('#studioLayoutSelect');
    const placementSelect = this.containerEl.querySelector('#studioPlacementSelect');

    nameInput?.addEventListener('input', (e) => {
      this.template.name = e.target.value;
      this.updateAccordionBadges();
      this.scheduleRender();
    });
    catSelect?.addEventListener('change', (e) => {
      this.template.category = e.target.value;
      this.updateAccordionBadges();
      this.scheduleRender();
    });
    layoutSelect?.addEventListener('change', (e) => {
      this.template.layoutId = e.target.value;
      this.updateAccordionBadges();
      this.scheduleRender();
    });
    placementSelect?.addEventListener('change', (e) => {
      this.template.portraitPlacement = e.target.value;
      this.scheduleRender();
    });

    // 6-Position Anchors: Author, Date, Category
    const authorPosSelector = this.containerEl.querySelector('#studioAuthorPosSelector');
    authorPosSelector?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-studio-author-pos]');
      if (!btn) return;
      this.template.authorPlacement = btn.dataset.studioAuthorPos;
      authorPosSelector.querySelectorAll('[data-studio-author-pos]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.scheduleRender();
    });

    const datePosSelector = this.containerEl.querySelector('#studioDatePosSelector');
    datePosSelector?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-studio-date-pos]');
      if (!btn) return;
      this.template.datePlacement = btn.dataset.studioDatePos;
      datePosSelector.querySelectorAll('[data-studio-date-pos]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.scheduleRender();
    });

    const categoryPosSelector = this.containerEl.querySelector('#studioCategoryPosSelector');
    categoryPosSelector?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-studio-cat-pos]');
      if (!btn) return;
      this.template.categoryPlacement = btn.dataset.studioCatPos;
      categoryPosSelector.querySelectorAll('[data-studio-cat-pos]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.scheduleRender();
    });

    // Abstract Geometry Pattern Selector
    const patternGrid = this.containerEl.querySelector('#abstractPatternGrid');
    patternGrid?.addEventListener('click', (e) => {
      const btn = e.target.closest('.option-chip-btn');
      if (!btn) return;
      patternGrid.querySelectorAll('.option-chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.template.abstractPattern = btn.dataset.pattern || null;
      this.updateAccordionBadges();
      this.scheduleRender();
    });

    // Color Pickers
    const bindColor = (id, prop, hexId) => {
      const input = this.containerEl.querySelector(id);
      const hex = this.containerEl.querySelector(hexId);
      input?.addEventListener('input', (e) => {
        this.template[prop] = e.target.value;
        if (prop === 'background') {
          // If solid background is chosen, clear gradient so solid background displays
          this.template.gradient = null;
          const gradSwatches = this.containerEl.querySelector('#gradientSwatches');
          if (gradSwatches) {
            gradSwatches.querySelectorAll('.gradient-swatch-btn').forEach(b => {
              b.classList.toggle('active', b.dataset.grad === '');
            });
          }
        }
        if (hex) hex.textContent = e.target.value;
        this.updateWCAGMeter();
        this.scheduleRender();
      });
    };
    bindColor('#colorBg', 'background', '#hexBg');
    bindColor('#colorText', 'textColor', '#hexText');
    bindColor('#colorAccent', 'accentColor', '#hexAccent');
    bindColor('#colorMeta', 'metaColor', '#hexMeta');

    // Auto-Fix Contrast Button
    const btnAutoFix = this.containerEl.querySelector('#btnAutoFixContrast');
    btnAutoFix?.addEventListener('click', () => {
      const optimalTextColor = getHighContrastTextColor(this.template.background);
      this.template.textColor = optimalTextColor;
      this.updateColorInputs();
      this.updateAccordionBadges();
      this.scheduleRender();
      Toast.show(`Adjusted text color to ${optimalTextColor} for maximum WCAG compliance!`, 'success');
    });

    // Curated Palettes
    const curatedRow = this.containerEl.querySelector('#curatedPalettesRow');
    curatedRow?.addEventListener('click', (e) => {
      const chip = e.target.closest('.palette-preset-chip');
      if (!chip) return;
      this.template.background = chip.dataset.bg;
      this.template.textColor = chip.dataset.text;
      this.template.accentColor = chip.dataset.accent;
      this.template.metaColor = chip.dataset.meta;
      this.template.gradient = null;
      const gradSwatches = this.containerEl.querySelector('#gradientSwatches');
      if (gradSwatches) {
        gradSwatches.querySelectorAll('.gradient-swatch-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.grad === '');
        });
      }
      this.updateColorInputs();
      this.updateAccordionBadges();
      this.scheduleRender();
      Toast.show(`Applied "${chip.title}" palette!`, 'info');
    });

    // Gradient Presets Quick Swatches
    const gradSwatches = this.containerEl.querySelector('#gradientSwatches');
    gradSwatches?.addEventListener('click', (e) => {
      const btn = e.target.closest('.gradient-swatch-btn');
      if (!btn) return;
      gradSwatches.querySelectorAll('.gradient-swatch-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.template.gradient = btn.dataset.grad || null;
      this.updateWCAGMeter();
      this.scheduleRender();
    });

    // Font Picker Openers (Pairings, Browse All, and Individual Typefaces)
    const btnPairings = this.containerEl.querySelector('#btnStudioPairings');
    const btnBrowseFonts = this.containerEl.querySelector('#btnStudioBrowseFonts');
    const btnChangeQuote = this.containerEl.querySelector('#btnStudioChangeQuoteFont');
    const btnChangeAuthor = this.containerEl.querySelector('#btnStudioChangeAuthorFont');

    btnPairings?.addEventListener('click', () => {
      this.fontPickerModal.open(this.template.fontFamily || 'Space Grotesk', 'quote', this.getActiveSampleQuoteText(), 'pairings');
    });
    btnBrowseFonts?.addEventListener('click', () => {
      this.fontPickerModal.open(this.template.fontFamily || 'Space Grotesk', 'quote', this.getActiveSampleQuoteText());
    });
    btnChangeQuote?.addEventListener('click', () => {
      this.fontPickerModal.open(this.template.fontFamily || 'Space Grotesk', 'quote', this.getActiveSampleQuoteText());
    });
    btnChangeAuthor?.addEventListener('click', () => {
      this.fontPickerModal.open(this.template.authorFontFamily || 'Plus Jakarta Sans', 'author', this.getActiveSampleAuthorText());
    });

    // Text Alignment
    const alignGroup = this.containerEl.querySelector('#studioTypoAlignGroup');
    alignGroup?.addEventListener('click', (e) => {
      const btn = e.target.closest('.typo-btn');
      if (!btn) return;
      alignGroup.querySelectorAll('.typo-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-checked', 'true');
      this.template.textAlign = btn.dataset.align;
      this.scheduleRender();
    });

    // Font Weight
    const weightGroup = this.containerEl.querySelector('#studioTypoWeightGroup');
    weightGroup?.addEventListener('click', (e) => {
      const btn = e.target.closest('.typo-btn');
      if (!btn) return;
      weightGroup.querySelectorAll('.typo-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-checked', 'true');
      this.template.fontWeight = parseInt(btn.dataset.weight, 10);
      this.scheduleRender();
    });

    // Quote Marks
    const qmGrid = this.containerEl.querySelector('#quoteMarkOptionsGrid');
    qmGrid?.addEventListener('click', (e) => {
      const btn = e.target.closest('.option-chip-btn');
      if (!btn) return;
      qmGrid.querySelectorAll('.option-chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.template.quoteMarkStyle = btn.dataset.qm;
      this.scheduleRender();
    });

    // Frame & Border Aesthetics
    const borderGrid = this.containerEl.querySelector('#borderOptionsGrid');
    borderGrid?.addEventListener('click', (e) => {
      const btn = e.target.closest('.option-chip-btn');
      if (!btn) return;
      borderGrid.querySelectorAll('.option-chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.template.borderStyle = btn.dataset.border;
      this.updateAccordionBadges();
      this.scheduleRender();
    });

    // Watermark & Branding Inputs
    const toggleWatermark = this.containerEl.querySelector('#toggleStudioWatermark');
    const inputWatermarkText = this.containerEl.querySelector('#studioWatermarkText');
    const inputBrandingHandle = this.containerEl.querySelector('#studioBrandingHandle');
    const sliderOpacity = this.containerEl.querySelector('#sliderStudioBrandingOpacity');
    const lblOpacity = this.containerEl.querySelector('#lblStudioBrandingOpacity');

    toggleWatermark?.addEventListener('change', (e) => {
      this.template.showWatermark = e.target.checked;
      const body = this.containerEl.querySelector('#studioBrandingOptionsBody');
      if (body) {
        body.style.opacity = e.target.checked ? '1' : '0.45';
        body.style.pointerEvents = e.target.checked ? 'auto' : 'none';
      }
      this.scheduleRender();
    });

    inputWatermarkText?.addEventListener('input', (e) => {
      this.template.watermark = e.target.value;
      this.scheduleRender();
    });
    inputBrandingHandle?.addEventListener('input', (e) => {
      this.template.brandingHandle = e.target.value;
      this.scheduleRender();
    });

    // Branding Display Style Selector
    const styleSelector = this.containerEl.querySelector('#studioBrandingStyleSelector');
    styleSelector?.addEventListener('click', (e) => {
      const btn = e.target.closest('.branding-style-btn');
      if (!btn) return;
      styleSelector.querySelectorAll('.branding-style-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-checked', 'true');
      this.template.brandingStyle = btn.dataset.style;
      this.updateAccordionBadges();
      this.scheduleRender();
    });

    sliderOpacity?.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      this.template.brandingOpacity = val / 100;
      if (lblOpacity) lblOpacity.textContent = `${val}%`;
      this.scheduleRender();
    });

    // Branding Canvas Placement
    const brandingPosSelector = this.containerEl.querySelector('#studioBrandingPosSelector');
    brandingPosSelector?.addEventListener('click', (e) => {
      const btn = e.target.closest('.branding-pos-btn');
      if (!btn) return;
      brandingPosSelector.querySelectorAll('.branding-pos-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-checked', 'true');
      this.template.brandingPosition = btn.dataset.pos;
      this.updateAccordionBadges();
      this.scheduleRender();
    });

    // Branding Size Selector
    const sizeSelector = this.containerEl.querySelector('#studioBrandingSizeSelector');
    const lblSize = this.containerEl.querySelector('#lblStudioBrandingSize');
    sizeSelector?.addEventListener('click', (e) => {
      const btn = e.target.closest('.size-chip');
      if (!btn) return;
      sizeSelector.querySelectorAll('.size-chip').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-checked', 'true');
      this.template.brandingSize = btn.dataset.studioBrandingSize;
      if (lblSize) lblSize.textContent = this.template.brandingSize.toUpperCase();
      this.updateAccordionBadges();
      this.scheduleRender();
    });

    // Custom Logo File Uploader
    const btnUploadLogo = this.containerEl.querySelector('#btnStudioUploadLogo');
    const inputLogoFile = this.containerEl.querySelector('#inputStudioLogoFile');
    const btnClearLogo = this.containerEl.querySelector('#btnClearStudioLogo');

    btnUploadLogo?.addEventListener('click', () => inputLogoFile?.click());
    inputLogoFile?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result;
        if (dataUrl) {
          this.template.brandingLogo = dataUrl;
          await BrandingService.saveCustomLogo(dataUrl);
          this.updateBrandingUI();
          this.scheduleRender();
          Toast.show('Custom brand logo uploaded & saved!', 'success');
        }
      };
      reader.readAsDataURL(file);
    });

    btnClearLogo?.addEventListener('click', async () => {
      this.template.brandingLogo = null;
      await BrandingService.saveCustomLogo(null);
      this.updateBrandingUI();
      this.scheduleRender();
      Toast.show('Logo removed', 'info');
    });

    // Aspect Ratio Switcher
    const ratioSwitcher = this.containerEl.querySelector('#studioRatioSwitcher');
    ratioSwitcher?.addEventListener('click', (e) => {
      const btn = e.target.closest('.studio-ratio-btn');
      if (!btn) return;
      ratioSwitcher.querySelectorAll('.studio-ratio-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-checked', 'true');
      this.currentPreviewRatio = btn.dataset.ratio;
      this.scheduleRender();
    });

    // Publish / Update Template Action
    const btnPublish = this.containerEl.querySelector('#btnPublishTemplate');
    btnPublish?.addEventListener('click', () => {
      const templateToSave = {
        ...this.template,
        name: this.template.name.trim() || 'Custom Template',
        id: this.editingTemplateId || ('custom_' + Date.now()),
        isCustom: true,
        authorPlacement: this.template.authorPlacement || 'auto',
        datePlacement: this.template.datePlacement || 'top-right',
        categoryPlacement: this.template.categoryPlacement || 'top-left',
        showWatermark: this.template.showWatermark,
        watermark: this.template.watermark,
        brandingHandle: this.template.brandingHandle,
        brandingStyle: this.template.brandingStyle,
        brandingPosition: this.template.brandingPosition,
        brandingSize: this.template.brandingSize || 'm',
        brandingOpacity: this.template.brandingOpacity,
        brandingLogo: this.template.brandingLogo,
        fontWeight: this.template.fontWeight,
        textAlign: this.template.textAlign,
        fontFamily: this.template.fontFamily,
        authorFontFamily: this.template.authorFontFamily,
        borderStyle: this.template.borderStyle,
        gradient: this.template.gradient
      };

      const saved = StorageService.saveCustomTemplate(templateToSave);
      StorageService.clearStudioDraft();
      this.hasRestoredDraft = false;

      try {
        confetti({
          particleCount: 120,
          spread: 85,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      Toast.show(
        this.editingTemplateId ? `Updated template "${saved.name}" in Presets!` : `Published template "${saved.name}" to Presets!`,
        'success'
      );

      if (this.onTemplatePublished) {
        this.onTemplatePublished(saved);
      }
    });
  }

  autoSaveDraft() {
    if (this.draftDebounceTimer) clearTimeout(this.draftDebounceTimer);
    this.draftDebounceTimer = setTimeout(() => {
      if (!this.editingTemplateId) {
        StorageService.saveStudioDraft(this.template);
      }
    }, 600);
  }

  updateAccordionBadges() {
    const b1 = this.containerEl.querySelector('#badgeSection1');
    const b2 = this.containerEl.querySelector('#badgeSection2');
    const b3 = this.containerEl.querySelector('#badgeSection3');
    const b4 = this.containerEl.querySelector('#badgeSection4');
    const b5 = this.containerEl.querySelector('#badgeSection5');
    const b6 = this.containerEl.querySelector('#badgeSection6');
    const b7 = this.containerEl.querySelector('#badgeSection7');

    if (b1) b1.textContent = this.template.name || 'Untitled';
    if (b2) b2.textContent = PATTERN_LABELS[this.template.abstractPattern] || this.template.abstractPattern || 'Clean';
    if (b4) b4.textContent = this.template.fontFamily || 'Default';
    if (b5) {
      const l = LAYOUT_STYLES.find(x => x.id === this.template.layoutId);
      b5.textContent = l ? l.name : 'Layout';
    }
    if (b6) {
      b6.textContent = (this.template.borderStyle || 'neon-glow').replace(/-/g, ' ').toUpperCase();
    }
    if (b7) {
      const posShort = (BRANDING_POSITIONS.find(p => p.id === this.template.brandingPosition) || {}).short || 'BR';
      b7.textContent = `${(this.template.brandingSize || 'm').toUpperCase()} • ${posShort}`;
    }
    this.updateWCAGMeter();
  }

  updateWCAGMeter() {
    const swatch = this.containerEl.querySelector('#wcagSwatch');
    const ratioVal = this.containerEl.querySelector('#wcagRatioValue');
    const pill = this.containerEl.querySelector('#wcagStatusPill');
    const desc = this.containerEl.querySelector('#wcagDescText');
    const b3 = this.containerEl.querySelector('#badgeSection3');

    const ratio = getContrastRatio(this.template.textColor, this.template.background);
    const rating = getContrastRating(ratio);

    if (swatch) {
      swatch.style.background = this.template.gradient || this.template.background;
      swatch.style.color = this.template.textColor;
    }
    if (ratioVal) ratioVal.textContent = rating.score;
    if (pill) {
      pill.textContent = `${rating.level} ${rating.label}`;
      pill.className = `wcag-status-pill ${rating.status}`;
    }
    if (desc) {
      desc.textContent = rating.status === 'pass' ? 'Meets WCAG standard for all text' : (rating.status === 'warning' ? 'Suitable for large text & titles' : 'Fails readability — click Auto-Fix');
    }
    if (b3) {
      b3.textContent = `${rating.score} ${rating.level}`;
    }
  }

  updateTypographyUI() {
    const qName = this.containerEl.querySelector('#lblStudioQuoteFontName');
    const qSample = this.containerEl.querySelector('#lblStudioQuoteFontSample');
    const aName = this.containerEl.querySelector('#lblStudioAuthorFontName');
    const aSample = this.containerEl.querySelector('#lblStudioAuthorFontSample');

    const quoteStack = FontLoaderService.getFallbackStack(this.template.fontFamily || 'Space Grotesk');
    const authorStack = FontLoaderService.getFallbackStack(this.template.authorFontFamily || 'Plus Jakarta Sans');

    if (qName) {
      qName.textContent = this.template.fontFamily || 'Space Grotesk';
      qName.style.fontFamily = quoteStack;
    }
    if (qSample) {
      qSample.style.fontFamily = quoteStack;
    }
    if (aName) {
      aName.textContent = this.template.authorFontFamily || 'Plus Jakarta Sans';
      aName.style.fontFamily = authorStack;
    }
    if (aSample) {
      aSample.style.fontFamily = authorStack;
    }

    const alignGroup = this.containerEl.querySelector('#studioTypoAlignGroup');
    if (alignGroup) {
      alignGroup.querySelectorAll('.typo-btn').forEach(btn => {
        const isActive = btn.dataset.align === (this.template.textAlign || 'center');
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
      });
    }

    const weightGroup = this.containerEl.querySelector('#studioTypoWeightGroup');
    if (weightGroup) {
      weightGroup.querySelectorAll('.typo-btn').forEach(btn => {
        const isActive = btn.dataset.weight == (this.template.fontWeight || 600);
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
      });
    }
  }

  updateBrandingUI() {
    const logoThumb = this.containerEl.querySelector('#studioLogoThumb');
    const lblLogoStatus = this.containerEl.querySelector('#lblStudioLogoStatus');
    const btnClearLogo = this.containerEl.querySelector('#btnClearStudioLogo');

    if (logoThumb) {
      logoThumb.innerHTML = this.template.brandingLogo 
        ? `<img src="${this.template.brandingLogo}" alt="Logo" style="width: 100%; height: 100%; object-fit: contain;" />` 
        : icon('image', { size: 16 });
    }
    if (lblLogoStatus) {
      lblLogoStatus.textContent = this.template.brandingLogo ? 'Custom Logo Active' : 'No Logo Uploaded';
    }
    if (btnClearLogo) {
      btnClearLogo.style.display = this.template.brandingLogo ? 'inline-flex' : 'none';
    }
  }

  updateColorInputs() {
    const colorBg = this.containerEl.querySelector('#colorBg');
    const colorText = this.containerEl.querySelector('#colorText');
    const colorAccent = this.containerEl.querySelector('#colorAccent');
    const colorMeta = this.containerEl.querySelector('#colorMeta');

    const hexBg = this.containerEl.querySelector('#hexBg');
    const hexText = this.containerEl.querySelector('#hexText');
    const hexAccent = this.containerEl.querySelector('#hexAccent');
    const hexMeta = this.containerEl.querySelector('#hexMeta');

    if (colorBg && this.template.background) colorBg.value = toValidHex(this.template.background, '#0a0d14');
    if (colorText && this.template.textColor) colorText.value = toValidHex(this.template.textColor, '#ffffff');
    if (colorAccent && this.template.accentColor) colorAccent.value = toValidHex(this.template.accentColor, '#38bdf8');
    if (colorMeta && this.template.metaColor) colorMeta.value = toValidHex(this.template.metaColor, '#94a3b8');

    if (hexBg) hexBg.textContent = this.template.background;
    if (hexText) hexText.textContent = this.template.textColor;
    if (hexAccent) hexAccent.textContent = this.template.accentColor;
    if (hexMeta) hexMeta.textContent = this.template.metaColor;

    this.updateWCAGMeter();
  }

  scheduleRender() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    this.rafId = requestAnimationFrame(async () => {
      if (this.isRendering) {
        this.pendingRender = true;
        return;
      }
      this.isRendering = true;
      try {
        await this.executeRender();
        this.autoSaveDraft();
      } catch (err) {
        console.warn('Live render error:', err);
      } finally {
        this.isRendering = false;
        if (this.pendingRender) {
          this.pendingRender = false;
          this.scheduleRender();
        }
      }
    });
  }

  async executeRender() {
    const canvas = this.containerEl.querySelector('#studioLiveCanvas');
    if (!canvas) return;

    const sample = SAMPLE_QUOTES[this.sampleQuoteMode] || SAMPLE_QUOTES.medium;

    const renderData = {
      quote: sample.quote,
      author: sample.author,
      handle: this.template.brandingHandle || "@quoteforge",
      category: sample.category,
      date: sample.date,
      watermark: this.template.watermark || "QuoteForge Studio",
      showAuthor: true,
      showDate: true,
      showCategory: true,
      authorPlacement: this.template.authorPlacement || 'auto',
      datePlacement: this.template.datePlacement || 'top-right',
      categoryPlacement: this.template.categoryPlacement || 'top-left',
      showWatermark: !!this.template.showWatermark,
      brandingStyle: this.template.brandingStyle || 'badge',
      brandingPosition: this.template.brandingPosition || 'bottom-right',
      brandingSize: this.template.brandingSize || 'm',
      brandingOpacity: this.template.brandingOpacity ?? 0.85,
      brandingLogo: this.template.brandingLogo || null,
      brandingHandle: this.template.brandingHandle || '@quoteforge',
      showAuthorImage: this.template.portraitPlacement && this.template.portraitPlacement !== 'none',
      authorImage: this.sampleAuthorImage,
      authorImagePlacement: this.template.portraitPlacement || 'cutout-right',
      layoutId: this.template.layoutId || 'classic-centered',
      ratio: this.currentPreviewRatio || '1:1',
      styles: {
        background: this.template.background || '#0a0d14',
        textColor: this.template.textColor || '#ffffff',
        accentColor: this.template.accentColor || '#38bdf8',
        metaColor: this.template.metaColor || '#94a3b8',
        cardBackground: this.template.cardBackground || 'rgba(255, 255, 255, 0.06)',
        borderStyle: this.template.borderStyle || 'neon-glow',
        borderColor: this.template.borderColor || this.template.accentColor || '#38bdf8',
        fontFamily: this.template.fontFamily || 'Space Grotesk',
        authorFontFamily: this.template.authorFontFamily || 'Plus Jakarta Sans',
        textAlign: this.template.textAlign || 'center',
        fontWeight: this.template.fontWeight || 600,
        quoteMarkStyle: this.template.quoteMarkStyle || 'classic',
        cardStyle: this.template.cardStyle || 'glass',
        abstractPattern: this.template.abstractPattern || null,
        gradient: this.template.gradient || null,
        badgeStyle: this.template.badgeStyle || 'neon-pill',
        letterSpacing: this.template.letterSpacing || '0.02em',
        lineHeight: this.template.lineHeight || 1.45
      }
    };

    try {
      await CanvasRenderer.renderToCanvas(renderData, canvas, 1);
    } catch (err) {
      console.warn('Template Studio live preview render error:', err);
    }
  }

  updateMockup() {
    this.scheduleRender();
  }

  updateWatermarkMockup() {
    this.scheduleRender();
  }
}
