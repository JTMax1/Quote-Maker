/**
 * Custom Design Theme Template Studio & Publisher
 * Upgraded to support 50 layouts, 50 portrait placements, abstract geometric line art,
 * instant reactive live preview for quote marks and backgrounds,
 * full Typography & Google Fonts Studio integration, and Watermark & Branding Suite.
 */

import { FONT_FAMILIES, PRESET_CATEGORIES, LAYOUT_STYLES, PORTRAIT_PLACEMENTS, CANVAS_FORMATS } from '../data/defaultPresets.js';
import { PRESET_AUTHOR_PORTRAITS } from '../data/authorCutouts.js';
import { StorageService } from '../services/storageService.js';
import { Toast } from './toast.js';
import confetti from 'canvas-confetti';
import { icon } from '../utils/icons.js';
import { FontLoaderService } from '../services/fontLoaderService.js';
import { FontPickerModal } from './fontPickerModal.js';
import { BrandingService, BRANDING_STYLES, BRANDING_POSITIONS } from '../services/brandingService.js';
import { escapeHtml } from '../utils/security.js';
import { CanvasRenderer } from '../services/canvasRenderer.js';

export class TemplateStudio {
  constructor(containerEl, onTemplatePublished) {
    this.containerEl = containerEl;
    this.onTemplatePublished = onTemplatePublished;
    this.currentPreviewRatio = '1:1';
    this.sampleAuthorImage = PRESET_AUTHOR_PORTRAITS[1]?.imageUrl || PRESET_AUTHOR_PORTRAITS[0]?.imageUrl;
    this.renderDebounceTimer = null;

    this.template = {
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
      gradient: null,
      badgeStyle: 'neon-pill',
      letterSpacing: '0.02em',
      lineHeight: 1.45,
      showWatermark: true,
      watermark: 'QuoteForge Studio',
      brandingHandle: '@quoteforge',
      brandingStyle: 'pill-badge',
      brandingPosition: 'bottom-right',
      brandingOpacity: 0.85,
      brandingLogo: null
    };

    // Initialize Font Picker Modal for Template Studio
    this.fontPickerModal = new FontPickerModal(
      (family, target) => {
        if (target === 'author') {
          this.template.authorFontFamily = family;
        } else {
          this.template.fontFamily = family;
        }
        this.updateTypographyUI();
        this.updateMockup();
        Toast.show(`Applied font: ${family}`, 'success');
      },
      (pairing) => {
        this.template.fontFamily = pairing.quoteFont;
        this.template.authorFontFamily = pairing.authorFont;
        this.updateTypographyUI();
        this.updateMockup();
        Toast.show(`Applied "${pairing.name}" font pairing!`, 'success');
      }
    );

    // Auto-load brand logo from IndexedDB if saved previously
    BrandingService.loadCustomLogo().then(logo => {
      if (logo) {
        this.template.brandingLogo = logo;
        this.updateBrandingUI();
        this.updateMockup();
      }
    });

    this.render();
  }

  render() {
    this.containerEl.innerHTML = `
      <div class="studio-layout">
        <!-- Controls Pane -->
        <div class="studio-controls-pane">
          <div style="border-bottom: 1px solid var(--border-glass); padding-bottom: 1rem;">
            <h2 style="font-size: 1.3rem; font-weight: 700; font-family: var(--font-display); margin-bottom: 0.25rem;">Theme Template Studio</h2>
            <p style="font-size: 0.85rem; color: var(--text-secondary);">Craft custom aesthetic themes with abstract geometry, curated typography, and custom branding, then publish to Presets.</p>
          </div>

          <!-- Basic Info -->
          <div class="studio-section">
            <span class="section-label">1. Theme Name & Category</span>
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

          <!-- Abstract Lines & Geometry Patterns -->
          <div class="studio-section">
            <span class="section-label">2. Abstract Lines & Geometric Patterns</span>
            <span style="font-size: 0.72rem; color: var(--text-muted); margin-bottom: 0.35rem; display: block;">Subtle geometric background lines that enhance elegance without overshadowing text:</span>
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

          <!-- Color Palette -->
          <div class="studio-section">
            <span class="section-label">3. Color Palette</span>
            <div class="color-picker-grid">
              <div class="color-input-item">
                <input type="color" class="color-swatch-input" id="colorBg" value="${this.template.background}" aria-label="Background Color" />
                <div class="color-item-labels">
                  <label for="colorBg">Background</label>
                  <span class="color-hex-tag" id="hexBg">${this.template.background}</span>
                </div>
              </div>
              <div class="color-input-item">
                <input type="color" class="color-swatch-input" id="colorText" value="${this.template.textColor}" aria-label="Quote Text Color" />
                <div class="color-item-labels">
                  <label for="colorText">Text</label>
                  <span class="color-hex-tag" id="hexText">${this.template.textColor}</span>
                </div>
              </div>
              <div class="color-input-item">
                <input type="color" class="color-swatch-input" id="colorAccent" value="${this.template.accentColor}" aria-label="Accent Color" />
                <div class="color-item-labels">
                  <label for="colorAccent">Accent</label>
                  <span class="color-hex-tag" id="hexAccent">${this.template.accentColor}</span>
                </div>
              </div>
              <div class="color-input-item">
                <input type="color" class="color-swatch-input" id="colorMeta" value="${this.template.metaColor}" aria-label="Secondary Meta Color" />
                <div class="color-item-labels">
                  <label for="colorMeta">Secondary</label>
                  <span class="color-hex-tag" id="hexMeta">${this.template.metaColor}</span>
                </div>
              </div>
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
                <button type="button" class="gradient-swatch-btn" data-grad="" style="background: ${this.template.background};" title="Solid" aria-label="Solid background"></button>
                <button type="button" class="gradient-swatch-btn" data-grad="linear-gradient(135deg, #090a0f 0%, #17153b 50%, #0f172a 100%)" style="background: linear-gradient(135deg, #090a0f 0%, #17153b 50%, #0f172a 100%);" title="Cyber Dark" aria-label="Cyber Dark gradient"></button>
                <button type="button" class="gradient-swatch-btn" data-grad="linear-gradient(180deg, #1b003a 0%, #751268 60%, #ff5e62 100%)" style="background: linear-gradient(180deg, #1b003a 0%, #751268 60%, #ff5e62 100%);" title="Retro Sunset" aria-label="Retro Sunset gradient"></button>
                <button type="button" class="gradient-swatch-btn" data-grad="linear-gradient(160deg, #020617 0%, #0c2b4e 50%, #064e3b 100%)" style="background: linear-gradient(160deg, #020617 0%, #0c2b4e 50%, #064e3b 100%);" title="Deep Abyss" aria-label="Deep Abyss gradient"></button>
                <button type="button" class="gradient-swatch-btn" data-grad="linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)" style="background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);" title="Nordic Aurora" aria-label="Nordic Aurora gradient"></button>
              </div>
            </div>
          </div>

          <!-- Typography & Google Fonts Studio -->
          <div class="studio-section">
            <div class="studio-section-header">
              <span class="section-label">4. Typography & Google Fonts</span>
              <div class="studio-section-actions">
                <button type="button" class="btn-glass" id="btnStudioPairings" style="padding: 0.35rem 0.65rem; font-size: 0.74rem; border-color: var(--brand-primary); color: var(--brand-primary);" aria-label="Browse 6 Signature Font Pairings">
                  <span aria-hidden="true">${icon('layers', { size: 12 })}</span>
                  <span>Pairings</span>
                </button>
                <button type="button" class="inspire-btn" id="btnStudioBrowseFonts" style="padding: 0.35rem 0.65rem; font-size: 0.74rem;" aria-label="Browse 40+ curated Google Fonts">
                  <span aria-hidden="true">${icon('sparkles', { size: 12 })}</span>
                  <span>Browse Fonts</span>
                </button>
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 0.6rem;">
              <!-- Quote Typeface Row -->
              <div class="typography-row">
                <div class="typography-info">
                  <span style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Quote Typeface</span>
                  <span class="typography-font-name" id="lblStudioQuoteFontName" style="font-family: ${FontLoaderService.getFallbackStack(this.template.fontFamily || 'Space Grotesk')}; font-size: 0.95rem;">${escapeHtml(this.template.fontFamily || 'Space Grotesk')}</span>
                  <span class="typography-sample-text" id="lblStudioQuoteFontSample" style="font-family: ${FontLoaderService.getFallbackStack(this.template.fontFamily || 'Space Grotesk')};">“Creativity is intelligence having fun.”</span>
                </div>
                <button type="button" class="btn-glass" id="btnStudioChangeQuoteFont" style="padding: 0.4rem 0.75rem; font-size: 0.76rem;" aria-label="Change quote font">
                  Change
                </button>
              </div>

              <!-- Author Signature Typeface Row -->
              <div class="typography-row">
                <div class="typography-info">
                  <span style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Author Signature Typeface</span>
                  <span class="typography-font-name" id="lblStudioAuthorFontName" style="font-family: ${FontLoaderService.getFallbackStack(this.template.authorFontFamily || 'Plus Jakarta Sans')}; font-size: 0.95rem;">${escapeHtml(this.template.authorFontFamily || 'Plus Jakarta Sans')}</span>
                  <span class="typography-sample-text" id="lblStudioAuthorFontSample" style="font-family: ${FontLoaderService.getFallbackStack(this.template.authorFontFamily || 'Plus Jakarta Sans')};">— Albert Einstein</span>
                </div>
                <button type="button" class="btn-glass" id="btnStudioChangeAuthorFont" style="padding: 0.4rem 0.75rem; font-size: 0.76rem;" aria-label="Change author signature font">
                  Change
                </button>
              </div>

              <!-- Typographic Micro-Controls: Alignment & Weight -->
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
                    <button type="button" class="typo-btn ${this.template.fontWeight == 400 ? 'active' : ''}" data-weight="400" role="radio" aria-checked="${this.template.fontWeight == 400}">
                      Regular
                    </button>
                    <button type="button" class="typo-btn ${(this.template.fontWeight == 600 || !this.template.fontWeight) ? 'active' : ''}" data-weight="600" role="radio" aria-checked="${(this.template.fontWeight == 600 || !this.template.fontWeight)}">
                      Semi
                    </button>
                    <button type="button" class="typo-btn ${this.template.fontWeight == 700 ? 'active' : ''}" data-weight="700" role="radio" aria-checked="${this.template.fontWeight == 700}">
                      Bold
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quote Marks Selection -->
            <div style="margin-top: 0.25rem;">
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

          <!-- Layout & Portrait Placement -->
          <div class="studio-section">
            <span class="section-label">5. Default Layout & Portrait Placement</span>
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
            </div>
          </div>

          <!-- Frame & Border Style -->
          <div class="studio-section">
            <label class="section-label">6. Frame & Border Aesthetic</label>
            <div class="option-chips-grid" id="borderOptionsGrid">
              <button type="button" class="option-chip-btn ${this.template.borderStyle === 'double' ? 'active' : ''}" data-border="double">Double Line</button>
              <button type="button" class="option-chip-btn ${this.template.borderStyle === 'neon-glow' ? 'active' : ''}" data-border="neon-glow">Neon Glow</button>
              <button type="button" class="option-chip-btn ${this.template.borderStyle === 'gold-inlay' ? 'active' : ''}" data-border="gold-inlay">Gold Inlay</button>
              <button type="button" class="option-chip-btn ${this.template.borderStyle === 'brutalist-solid' ? 'active' : ''}" data-border="brutalist-solid">Brutalist</button>
              <button type="button" class="option-chip-btn ${this.template.borderStyle === 'polaroid' ? 'active' : ''}" data-border="polaroid">Polaroid</button>
              <button type="button" class="option-chip-btn ${this.template.borderStyle === 'subtle-frame' ? 'active' : ''}" data-border="subtle-frame">Subtle Rim</button>
              <button type="button" class="option-chip-btn ${this.template.borderStyle === 'none' ? 'active' : ''}" data-border="none">No Border</button>
            </div>
          </div>

          <!-- Watermark & Custom Branding Suite Section -->
          <div class="studio-section">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="section-label">
                <span aria-hidden="true">${icon('shield', { size: 15 })}</span>
                <span>7. Watermark & Branding Suite</span>
              </span>
              <label class="switch" for="toggleStudioWatermark">
                <input type="checkbox" id="toggleStudioWatermark" aria-label="Toggle watermark and branding display in template" ${this.template.showWatermark ? 'checked' : ''} />
                <span class="slider"></span>
              </label>
            </div>

            <div class="branding-options-stack" id="studioBrandingOptionsBody" style="${this.template.showWatermark ? '' : 'opacity: 0.45; pointer-events: none;'}">
              <!-- Watermark Text & Handle Input -->
              <div class="studio-form-stack">
                <div class="input-row">
                  <div class="form-group">
                    <label class="form-label" for="studioWatermarkText">Brand / Watermark Text</label>
                    <input type="text" class="form-input" id="studioWatermarkText" value="${escapeHtml(this.template.watermark || '')}" placeholder="e.g. QuoteForge" aria-label="Watermark brand text" />
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="studioBrandingHandle">Badge Handle</label>
                    <input type="text" class="form-input" id="studioBrandingHandle" value="${escapeHtml(this.template.brandingHandle || '')}" placeholder="@handle" aria-label="Badge handle" />
                  </div>
                </div>
              </div>

              <!-- Branding Style Segmented Grid -->
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
              <div>
                <label class="form-label" style="margin-bottom: 0.35rem; display: block;">Custom Logo / Emblem</label>
                <div class="logo-uploader-strip">
                  <div class="logo-uploader-info">
                    <div class="logo-thumb-box" id="studioLogoThumb" aria-hidden="true">
                      ${this.template.brandingLogo ? `<img src="${this.template.brandingLogo}" alt="Brand logo thumbnail" />` : icon('image', { size: 18 })}
                    </div>
                    <div>
                      <div style="font-size: 0.84rem; font-weight: 700;" id="lblStudioLogoStatus">${this.template.brandingLogo ? 'Custom Logo Active' : 'No Logo Uploaded'}</div>
                      <div style="font-size: 0.72rem; color: var(--text-muted);">PNG, SVG, or JPG with transparency</div>
                    </div>
                  </div>
                  <div class="logo-uploader-actions" style="display: flex; gap: 0.4rem;">
                    <input type="file" id="inputStudioLogoFile" accept="image/png,image/svg+xml,image/jpeg,image/webp" style="display: none;" aria-label="Upload custom logo file" />
                    <button type="button" class="btn-glass" id="btnStudioUploadLogo" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;" aria-label="Upload custom brand logo">
                      ${icon('upload', { size: 13 })} Upload Logo
                    </button>
                    ${this.template.brandingLogo ? `
                      <button type="button" class="btn-glass" id="btnClearStudioLogo" style="padding: 0.35rem 0.6rem; font-size: 0.78rem; color: #ef4444;" aria-label="Remove custom logo">
                        ${icon('trash', { size: 13 })}
                      </button>
                    ` : ''}
                  </div>
                </div>
              </div>

              <!-- Canvas Position Selector -->
              <div>
                <label class="form-label" style="margin-bottom: 0.35rem; display: block;">Canvas Placement</label>
                <div class="branding-pos-selector" id="studioBrandingPosSelector" role="radiogroup" aria-label="Branding Placement on Canvas">
                  ${BRANDING_POSITIONS.map(p => `
                    <button type="button" class="branding-pos-btn ${this.template.brandingPosition === p.id ? 'active' : ''}" data-pos="${p.id}" role="radio" aria-checked="${this.template.brandingPosition === p.id}">
                      <span>${p.label}</span>
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

          <!-- Publish Action Button -->
          <button type="button" class="btn-primary" id="btnPublishTemplate" style="width: 100%; justify-content: center; padding: 0.85rem; margin-top: 0.5rem; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>${icon('sparkles', { size: 16 })}</span>
            <span>Publish Template to Presets</span>
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

          <div class="studio-canvas-container" id="studioCanvasContainer">
            <canvas id="studioLiveCanvas"></canvas>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.updateTypographyUI();
    this.updateBrandingUI();
    this.updateMockup();
  }

  bindEvents() {
    const nameInput = this.containerEl.querySelector('#studioThemeName');
    const catSelect = this.containerEl.querySelector('#studioCategorySelect');
    const layoutSelect = this.containerEl.querySelector('#studioLayoutSelect');
    const placementSelect = this.containerEl.querySelector('#studioPlacementSelect');

    nameInput?.addEventListener('input', (e) => {
      this.template.name = e.target.value;
    });
    catSelect?.addEventListener('change', (e) => {
      this.template.category = e.target.value;
    });
    layoutSelect?.addEventListener('change', (e) => {
      this.template.layoutId = e.target.value;
      const selectedLayout = LAYOUT_STYLES.find(l => l.id === e.target.value);
      if (selectedLayout && selectedLayout.portraitPlacement) {
        this.template.portraitPlacement = selectedLayout.portraitPlacement;
        if (placementSelect) {
          placementSelect.value = selectedLayout.portraitPlacement;
        }
      }
      this.scheduleRender();
    });
    placementSelect?.addEventListener('change', (e) => {
      this.template.portraitPlacement = e.target.value;
      this.scheduleRender();
    });

    // Preview Aspect Ratio Switcher
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
      this.currentPreviewRatio = btn.dataset.ratio || '1:1';
      this.scheduleRender();
    });

    // Curated Aesthetic Palettes
    const curatedRow = this.containerEl.querySelector('#curatedPalettesRow');
    curatedRow?.addEventListener('click', (e) => {
      const chip = e.target.closest('.palette-preset-chip');
      if (!chip) return;
      curatedRow.querySelectorAll('.palette-preset-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      this.template.background = chip.dataset.bg;
      this.template.textColor = chip.dataset.text;
      this.template.accentColor = chip.dataset.accent;
      this.template.borderColor = chip.dataset.accent;
      this.template.metaColor = chip.dataset.meta;
      this.template.gradient = null;
      this.updateColorInputs();
      this.scheduleRender();
      Toast.show(`Applied ${chip.title} color scheme`, 'info');
    });

    // Abstract Pattern Selection
    const patternGrid = this.containerEl.querySelector('#abstractPatternGrid');
    patternGrid?.addEventListener('click', (e) => {
      const btn = e.target.closest('.option-chip-btn');
      if (!btn) return;
      patternGrid.querySelectorAll('.option-chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.template.abstractPattern = btn.dataset.pattern || null;
      this.scheduleRender();
    });

    // Colors
    const colorBg = this.containerEl.querySelector('#colorBg');
    const colorText = this.containerEl.querySelector('#colorText');
    const colorAccent = this.containerEl.querySelector('#colorAccent');
    const colorMeta = this.containerEl.querySelector('#colorMeta');

    colorBg?.addEventListener('input', (e) => {
      this.template.background = e.target.value;
      this.template.gradient = null;
      const hex = this.containerEl.querySelector('#hexBg');
      if (hex) hex.textContent = e.target.value;
      this.scheduleRender();
    });
    colorText?.addEventListener('input', (e) => {
      this.template.textColor = e.target.value;
      const hex = this.containerEl.querySelector('#hexText');
      if (hex) hex.textContent = e.target.value;
      this.scheduleRender();
    });
    colorAccent?.addEventListener('input', (e) => {
      this.template.accentColor = e.target.value;
      this.template.borderColor = e.target.value;
      const hex = this.containerEl.querySelector('#hexAccent');
      if (hex) hex.textContent = e.target.value;
      this.scheduleRender();
    });
    colorMeta?.addEventListener('input', (e) => {
      this.template.metaColor = e.target.value;
      const hex = this.containerEl.querySelector('#hexMeta');
      if (hex) hex.textContent = e.target.value;
      this.scheduleRender();
    });

    // Gradient swatches
    const gradSwatches = this.containerEl.querySelector('#gradientSwatches');
    gradSwatches?.addEventListener('click', (e) => {
      const btn = e.target.closest('.gradient-swatch-btn');
      if (!btn) return;
      gradSwatches.querySelectorAll('.gradient-swatch-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.template.gradient = btn.dataset.grad || null;
      this.scheduleRender();
    });

    // Typography Studio controls
    const btnBrowseFonts = this.containerEl.querySelector('#btnStudioBrowseFonts');
    const btnPairings = this.containerEl.querySelector('#btnStudioPairings');
    const btnChangeQuote = this.containerEl.querySelector('#btnStudioChangeQuoteFont');
    const btnChangeAuthor = this.containerEl.querySelector('#btnStudioChangeAuthorFont');

    btnBrowseFonts?.addEventListener('click', () => {
      this.fontPickerModal.open(this.template.fontFamily || 'Space Grotesk', 'quote', 'Creativity is intelligence having fun.');
    });
    btnPairings?.addEventListener('click', () => {
      this.fontPickerModal.open(this.template.fontFamily || 'Space Grotesk', 'quote', 'Creativity is intelligence having fun.', 'pairings');
    });
    btnChangeQuote?.addEventListener('click', () => {
      this.fontPickerModal.open(this.template.fontFamily || 'Space Grotesk', 'quote', 'Creativity is intelligence having fun.');
    });
    btnChangeAuthor?.addEventListener('click', () => {
      this.fontPickerModal.open(this.template.authorFontFamily || 'Plus Jakarta Sans', 'author', 'Albert Einstein');
    });

    // Text Alignment buttons
    const alignGroup = this.containerEl.querySelector('#studioTypoAlignGroup');
    alignGroup?.addEventListener('click', (e) => {
      const btn = e.target.closest('.typo-btn');
      if (!btn) return;
      this.template.textAlign = btn.dataset.align;
      this.updateTypographyUI();
      this.updateMockup();
    });

    // Font Weight buttons
    const weightGroup = this.containerEl.querySelector('#studioTypoWeightGroup');
    weightGroup?.addEventListener('click', (e) => {
      const btn = e.target.closest('.typo-btn');
      if (!btn) return;
      this.template.fontWeight = parseInt(btn.dataset.weight, 10);
      this.updateTypographyUI();
      this.updateMockup();
    });

    // Border options
    const borderGrid = this.containerEl.querySelector('#borderOptionsGrid');
    borderGrid?.addEventListener('click', (e) => {
      const btn = e.target.closest('.option-chip-btn');
      if (!btn) return;
      borderGrid.querySelectorAll('.option-chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.template.borderStyle = btn.dataset.border;
      this.updateMockup();
    });

    // Quote mark options
    const qmGrid = this.containerEl.querySelector('#quoteMarkOptionsGrid');
    qmGrid?.addEventListener('click', (e) => {
      const btn = e.target.closest('.option-chip-btn');
      if (!btn) return;
      qmGrid.querySelectorAll('.option-chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.template.quoteMarkStyle = btn.dataset.qm;
      this.updateMockup();
    });

    // Watermark & Branding Suite controls
    const toggleWatermark = this.containerEl.querySelector('#toggleStudioWatermark');
    const brandingBody = this.containerEl.querySelector('#studioBrandingOptionsBody');
    toggleWatermark?.addEventListener('change', (e) => {
      this.template.showWatermark = e.target.checked;
      if (brandingBody) {
        brandingBody.style.opacity = e.target.checked ? '1' : '0.45';
        brandingBody.style.pointerEvents = e.target.checked ? 'auto' : 'none';
      }
      this.updateWatermarkMockup();
    });

    const inputWatermark = this.containerEl.querySelector('#studioWatermarkText');
    inputWatermark?.addEventListener('input', (e) => {
      this.template.watermark = e.target.value;
      this.updateWatermarkMockup();
    });

    const inputHandle = this.containerEl.querySelector('#studioBrandingHandle');
    inputHandle?.addEventListener('input', (e) => {
      this.template.brandingHandle = e.target.value;
      this.updateWatermarkMockup();
    });

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
      this.updateWatermarkMockup();
    });

    const posSelector = this.containerEl.querySelector('#studioBrandingPosSelector');
    posSelector?.addEventListener('click', (e) => {
      const btn = e.target.closest('.branding-pos-btn');
      if (!btn) return;
      posSelector.querySelectorAll('.branding-pos-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-checked', 'true');
      this.template.brandingPosition = btn.dataset.pos;
      this.updateWatermarkMockup();
    });

    const sliderOpacity = this.containerEl.querySelector('#sliderStudioBrandingOpacity');
    const lblOpacity = this.containerEl.querySelector('#lblStudioBrandingOpacity');
    sliderOpacity?.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      this.template.brandingOpacity = val / 100;
      if (lblOpacity) lblOpacity.textContent = `${val}%`;
      this.updateWatermarkMockup();
    });

    // Custom Logo File Uploader for Template Studio
    const btnUploadLogo = this.containerEl.querySelector('#btnStudioUploadLogo');
    const inputLogoFile = this.containerEl.querySelector('#inputStudioLogoFile');
    const btnClearLogo = this.containerEl.querySelector('#btnClearStudioLogo');

    btnUploadLogo?.addEventListener('click', () => inputLogoFile?.click());
    inputLogoFile?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target.result;
        this.template.brandingLogo = dataUrl;
        await BrandingService.saveCustomLogo(dataUrl);
        this.updateBrandingUI();
        this.updateWatermarkMockup();
        Toast.show('Custom brand logo applied & saved!', 'success');
      };
      reader.readAsDataURL(file);
    });

    btnClearLogo?.addEventListener('click', async () => {
      this.template.brandingLogo = null;
      await BrandingService.clearCustomLogo();
      this.updateBrandingUI();
      this.updateWatermarkMockup();
      Toast.show('Custom logo removed', 'info');
    });

    // Publish Template
    const btnPublish = this.containerEl.querySelector('#btnPublishTemplate');
    btnPublish?.addEventListener('click', () => {
      const templateToSave = {
        ...this.template,
        name: this.template.name.trim() || 'Custom Template',
        id: 'custom_' + Date.now(),
        showWatermark: this.template.showWatermark,
        watermark: this.template.watermark,
        brandingHandle: this.template.brandingHandle,
        brandingStyle: this.template.brandingStyle,
        brandingPosition: this.template.brandingPosition,
        brandingOpacity: this.template.brandingOpacity,
        brandingLogo: this.template.brandingLogo,
        fontWeight: this.template.fontWeight,
        textAlign: this.template.textAlign,
        fontFamily: this.template.fontFamily,
        authorFontFamily: this.template.authorFontFamily
      };

      const saved = StorageService.saveCustomTemplate(templateToSave);

      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      Toast.show(`Published template "${saved.name}" to Presets!`, 'success');

      if (this.onTemplatePublished) {
        this.onTemplatePublished(saved);
      }
    });
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
        ? `<img src="${this.template.brandingLogo}" alt="Brand logo thumbnail" />`
        : icon('image', { size: 18 });
    }
    if (lblLogoStatus) {
      lblLogoStatus.textContent = this.template.brandingLogo ? 'Custom Logo Active' : 'No Logo Uploaded';
    }
    if (btnClearLogo) {
      btnClearLogo.style.display = this.template.brandingLogo ? 'inline-flex' : 'none';
    }

    const styleSelector = this.containerEl.querySelector('#studioBrandingStyleSelector');
    if (styleSelector) {
      styleSelector.querySelectorAll('.branding-style-btn').forEach(btn => {
        const isActive = btn.dataset.style === (this.template.brandingStyle || 'pill-badge');
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
      });
    }

    const posSelector = this.containerEl.querySelector('#studioBrandingPosSelector');
    if (posSelector) {
      posSelector.querySelectorAll('.branding-pos-btn').forEach(btn => {
        const isActive = btn.dataset.pos === (this.template.brandingPosition || 'bottom-right');
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
      });
    }

    const sliderOpacity = this.containerEl.querySelector('#sliderStudioBrandingOpacity');
    const lblOpacity = this.containerEl.querySelector('#lblStudioBrandingOpacity');
    const opacityVal = Math.round((this.template.brandingOpacity ?? 0.85) * 100);
    if (sliderOpacity) sliderOpacity.value = opacityVal;
    if (lblOpacity) lblOpacity.textContent = `${opacityVal}%`;

    const toggle = this.containerEl.querySelector('#toggleStudioWatermark');
    const body = this.containerEl.querySelector('#studioBrandingOptionsBody');
    if (toggle) toggle.checked = !!this.template.showWatermark;
    if (body) {
      body.style.opacity = this.template.showWatermark ? '1' : '0.45';
      body.style.pointerEvents = this.template.showWatermark ? 'auto' : 'none';
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

    if (colorBg && this.template.background) colorBg.value = this.template.background;
    if (colorText && this.template.textColor) colorText.value = this.template.textColor;
    if (colorAccent && this.template.accentColor) colorAccent.value = this.template.accentColor;
    if (colorMeta && this.template.metaColor) colorMeta.value = this.template.metaColor;

    if (hexBg) hexBg.textContent = this.template.background;
    if (hexText) hexText.textContent = this.template.textColor;
    if (hexAccent) hexAccent.textContent = this.template.accentColor;
    if (hexMeta) hexMeta.textContent = this.template.metaColor;
  }

  scheduleRender() {
    if (this.renderDebounceTimer) {
      clearTimeout(this.renderDebounceTimer);
    }
    this.renderDebounceTimer = setTimeout(() => {
      this.executeRender();
    }, 16);
  }

  async executeRender() {
    const canvas = this.containerEl.querySelector('#studioLiveCanvas');
    if (!canvas) return;

    const renderData = {
      quote: "Creativity is intelligence having fun.",
      author: "Albert Einstein",
      handle: this.template.brandingHandle || "@quoteforge",
      category: "Wisdom",
      date: "Sep 2026",
      watermark: this.template.watermark || "QuoteForge Studio",
      showAuthor: true,
      showDate: true,
      showCategory: true,
      showWatermark: !!this.template.showWatermark,
      brandingStyle: this.template.brandingStyle || 'pill-badge',
      brandingPosition: this.template.brandingPosition || 'bottom-right',
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
