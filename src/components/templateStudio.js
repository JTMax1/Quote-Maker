/**
 * Custom Design Theme Template Studio & Publisher
 * Upgraded to support 50 layouts, 50 portrait placements, abstract geometric line art,
 * instant reactive live preview for quote marks and backgrounds,
 * full Typography & Google Fonts Studio integration, and Watermark & Branding Suite.
 */

import { FONT_FAMILIES, PRESET_CATEGORIES, LAYOUT_STYLES, PORTRAIT_PLACEMENTS } from '../data/defaultPresets.js';
import { StorageService } from '../services/storageService.js';
import { Toast } from './toast.js';
import confetti from 'canvas-confetti';
import { icon } from '../utils/icons.js';
import { FontLoaderService } from '../services/fontLoaderService.js';
import { FontPickerModal } from './fontPickerModal.js';
import { BrandingService, BRANDING_STYLES, BRANDING_POSITIONS } from '../services/brandingService.js';
import { escapeHtml } from '../utils/security.js';

export class TemplateStudio {
  constructor(containerEl, onTemplatePublished) {
    this.containerEl = containerEl;
    this.onTemplatePublished = onTemplatePublished;

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
        <div class="studio-controls-pane" style="max-height: 85vh; overflow-y: auto; padding-right: 0.5rem;">
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
            <div class="option-chips-grid" id="abstractPatternGrid" style="grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 0.45rem;" role="group" aria-label="Geometric pattern style">
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
                <label for="colorBg">Background</label>
              </div>
              <div class="color-input-item">
                <input type="color" class="color-swatch-input" id="colorText" value="${this.template.textColor}" aria-label="Quote Text Color" />
                <label for="colorText">Text</label>
              </div>
              <div class="color-input-item">
                <input type="color" class="color-swatch-input" id="colorAccent" value="${this.template.accentColor}" aria-label="Accent Color" />
                <label for="colorAccent">Accent</label>
              </div>
              <div class="color-input-item">
                <input type="color" class="color-swatch-input" id="colorMeta" value="${this.template.metaColor}" aria-label="Secondary Meta Color" />
                <label for="colorMeta">Secondary</label>
              </div>
            </div>

            <!-- Gradient Presets Quick Swatches -->
            <div style="margin-top: 0.5rem;">
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
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="section-label">4. Typography & Google Fonts</span>
              <div style="display: flex; gap: 0.35rem; align-items: center;">
                <button type="button" class="btn-glass" id="btnStudioPairings" style="padding: 0.3rem 0.6rem; font-size: 0.74rem; border-color: var(--brand-primary); color: var(--brand-primary);" aria-label="Browse 6 Signature Font Pairings">
                  <span aria-hidden="true">${icon('layers', { size: 12 })}</span>
                  <span>Pairings</span>
                </button>
                <button type="button" class="inspire-btn" id="btnStudioBrowseFonts" style="padding: 0.3rem 0.6rem; font-size: 0.74rem;" aria-label="Browse 40+ curated Google Fonts">
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
                  <div style="display: flex; gap: 0.4rem;">
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
          <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">
            Live Template Preview
          </div>

          <div class="studio-canvas-mockup" id="studioMockup" style="background: ${this.template.gradient || this.template.background}; color: ${this.template.textColor}; position: relative; overflow: hidden;">
            <!-- Abstract Geometry Preview Canvas Overlay -->
            <canvas id="mockupPatternCanvas" width="480" height="480" style="position: absolute; inset: 0; pointer-events: none; z-index: 1;"></canvas>

            <!-- Live Watermark Overlay inside Canvas Mockup -->
            <div class="studio-watermark-overlay" id="mockupWatermarkOverlay" data-pos="${this.template.brandingPosition || 'bottom-right'}"></div>

            <!-- Content -->
            <div style="position: relative; z-index: 2; width: 100%;" id="mockupContentBox">
              <div id="mockupQuoteMarkTop" style="font-size: 2.5rem; line-height: 1; opacity: 0.5; margin-bottom: 0.25rem;">“</div>
              <div class="studio-quote-text" id="mockupQuoteText">
                Creativity is intelligence having fun.
              </div>
              <div id="mockupQuoteMarkBottom" style="font-size: 2.5rem; line-height: 1; opacity: 0.5; display: none;">”</div>
              <div class="studio-author-text" id="mockupAuthorText" style="color: ${this.template.accentColor}; margin-top: 0.75rem;">
                — Albert Einstein
              </div>
            </div>
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
      this.updateMockup();
    });
    placementSelect?.addEventListener('change', (e) => {
      this.template.portraitPlacement = e.target.value;
      this.updateMockup();
    });

    // Abstract Pattern Selection
    const patternGrid = this.containerEl.querySelector('#abstractPatternGrid');
    patternGrid?.addEventListener('click', (e) => {
      const btn = e.target.closest('.option-chip-btn');
      if (!btn) return;
      patternGrid.querySelectorAll('.option-chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.template.abstractPattern = btn.dataset.pattern || null;
      this.updateMockup();
    });

    // Colors
    const colorBg = this.containerEl.querySelector('#colorBg');
    const colorText = this.containerEl.querySelector('#colorText');
    const colorAccent = this.containerEl.querySelector('#colorAccent');
    const colorMeta = this.containerEl.querySelector('#colorMeta');

    colorBg?.addEventListener('input', (e) => {
      this.template.background = e.target.value;
      this.template.gradient = null;
      this.updateMockup();
    });
    colorText?.addEventListener('input', (e) => {
      this.template.textColor = e.target.value;
      this.updateMockup();
    });
    colorAccent?.addEventListener('input', (e) => {
      this.template.accentColor = e.target.value;
      this.template.borderColor = e.target.value;
      this.updateMockup();
    });
    colorMeta?.addEventListener('input', (e) => {
      this.template.metaColor = e.target.value;
      this.updateMockup();
    });

    // Gradient swatches
    const gradSwatches = this.containerEl.querySelector('#gradientSwatches');
    gradSwatches?.addEventListener('click', (e) => {
      const btn = e.target.closest('.gradient-swatch-btn');
      if (!btn) return;
      this.template.gradient = btn.dataset.grad || null;
      this.updateMockup();
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

  updateWatermarkMockup() {
    const overlay = this.containerEl.querySelector('#mockupWatermarkOverlay');
    if (!overlay) return;

    if (!this.template.showWatermark) {
      overlay.style.display = 'none';
      return;
    }

    overlay.style.display = 'flex';
    overlay.dataset.pos = this.template.brandingPosition || 'bottom-right';
    overlay.style.opacity = this.template.brandingOpacity ?? 0.85;

    const style = this.template.brandingStyle || 'pill-badge';
    const watermarkText = this.template.watermark || 'QuoteForge';
    const handleText = this.template.brandingHandle || '@quoteforge';
    const logoUrl = this.template.brandingLogo;
    const accentColor = this.template.accentColor || 'var(--brand-primary)';

    if (style === 'pill-badge') {
      const displayText = handleText || watermarkText;
      overlay.innerHTML = `
        <div class="studio-watermark-badge">
          ${logoUrl ? `<img src="${logoUrl}" class="studio-watermark-badge-logo" alt="Logo" />` : `<span style="color: ${accentColor};">${icon('sparkles', { size: 12 })}</span>`}
          <span class="studio-watermark-badge-text" style="color: ${this.template.textColor};">${escapeHtml(displayText)}</span>
        </div>
      `;
    } else if (style === 'logo-handle') {
      overlay.innerHTML = `
        <div class="studio-watermark-badge">
          ${logoUrl ? `<img src="${logoUrl}" class="studio-watermark-badge-logo" alt="Logo" />` : `<span style="color: ${accentColor};">${icon('shield', { size: 12 })}</span>`}
          <span class="studio-watermark-badge-text" style="color: ${this.template.textColor};">${escapeHtml(handleText || watermarkText)}</span>
        </div>
      `;
    } else if (style === 'logo-emblem') {
      overlay.innerHTML = `
        <div class="studio-watermark-badge" style="padding: 0.35rem 0.5rem;">
          ${logoUrl ? `<img src="${logoUrl}" class="studio-watermark-badge-logo" style="width: 20px; height: 20px;" alt="Logo" />` : `<span style="color: ${accentColor}; font-weight: 800; font-size: 0.85rem;">QF</span>`}
        </div>
      `;
    } else {
      // subtle-text
      overlay.innerHTML = `
        <span class="studio-watermark-subtle" style="color: ${this.template.textColor}; opacity: 0.85;">${escapeHtml(watermarkText)}</span>
      `;
    }
  }

  updateMockup() {
    const mockup = this.containerEl.querySelector('#studioMockup');
    const quote = this.containerEl.querySelector('#mockupQuoteText');
    const author = this.containerEl.querySelector('#mockupAuthorText');
    const qmTop = this.containerEl.querySelector('#mockupQuoteMarkTop');
    const qmBottom = this.containerEl.querySelector('#mockupQuoteMarkBottom');
    const patternCanvas = this.containerEl.querySelector('#mockupPatternCanvas');

    if (!mockup) return;

    const quoteStack = FontLoaderService.getFallbackStack(this.template.fontFamily || 'Space Grotesk');
    const authorStack = FontLoaderService.getFallbackStack(this.template.authorFontFamily || 'Plus Jakarta Sans');

    mockup.style.background = this.template.gradient || this.template.background;
    mockup.style.color = this.template.textColor;

    if (quote) {
      quote.style.fontFamily = quoteStack;
      quote.style.fontWeight = this.template.fontWeight || 600;
      quote.style.textAlign = this.template.textAlign || 'center';
    }

    if (author) {
      author.style.fontFamily = authorStack;
      author.style.color = this.template.accentColor;
      author.style.textAlign = this.template.textAlign || 'center';
    }

    // Quote Marks live reactivity
    if (qmTop) {
      if (this.template.quoteMarkStyle === 'classic') {
        qmTop.style.display = 'block';
        qmTop.textContent = '“';
        qmTop.style.color = this.template.accentColor;
        qmTop.style.fontFamily = 'Playfair Display, serif';
      } else if (this.template.quoteMarkStyle === 'modern-brackets') {
        qmTop.style.display = 'block';
        qmTop.textContent = '//';
        qmTop.style.color = this.template.accentColor;
        qmTop.style.fontFamily = 'Space Mono, monospace';
      } else if (this.template.quoteMarkStyle === 'minimal-dash') {
        qmTop.style.display = 'block';
        qmTop.textContent = '—';
        qmTop.style.color = this.template.accentColor;
      } else if (this.template.quoteMarkStyle === 'decorative-stars') {
        qmTop.style.display = 'block';
        qmTop.textContent = '✦  ✦  ✦';
        qmTop.style.fontSize = '1.2rem';
        qmTop.style.color = this.template.accentColor;
      } else {
        qmTop.style.display = 'none';
      }
    }

    // Border preview
    if (this.template.borderStyle === 'double') {
      mockup.style.border = `4px double ${this.template.borderColor || 'rgba(255,255,255,0.3)'}`;
      mockup.style.boxShadow = 'none';
    } else if (this.template.borderStyle === 'neon-glow') {
      mockup.style.border = `2px solid ${this.template.accentColor}`;
      mockup.style.boxShadow = `0 0 30px ${this.template.accentColor}44`;
    } else if (this.template.borderStyle === 'brutalist-solid') {
      mockup.style.border = `4px solid #000000`;
      mockup.style.boxShadow = `12px 12px 0px #000000`;
    } else if (this.template.borderStyle === 'polaroid') {
      mockup.style.border = `12px solid #ffffff`;
      mockup.style.boxShadow = `0 20px 40px rgba(0,0,0,0.2)`;
    } else if (this.template.borderStyle === 'none') {
      mockup.style.border = 'none';
      mockup.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.6)';
    } else {
      mockup.style.border = `1px solid rgba(255,255,255,0.15)`;
      mockup.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.6)';
    }

    // Update live watermark overlay on mockup
    this.updateWatermarkMockup();


    // Draw pattern on mockup overlay canvas
    if (patternCanvas) {
      const pctx = patternCanvas.getContext('2d');
      pctx.clearRect(0, 0, 480, 480);
      if (this.template.abstractPattern) {
        pctx.strokeStyle = this.template.accentColor || '#6366f1';
        pctx.lineWidth = 1.4;
        pctx.globalAlpha = 0.22;

        if (this.template.abstractPattern === 'orbital-rings') {
          for (let r = 50; r <= 220; r += 45) {
            pctx.beginPath();
            pctx.arc(360, 160, r, 0, Math.PI * 2);
            pctx.stroke();
          }
          pctx.beginPath();
          pctx.ellipse(190, 290, 160, 70, Math.PI / 4, 0, Math.PI * 2);
          pctx.stroke();
        } else if (this.template.abstractPattern === 'fibonacci') {
          let r = 10;
          pctx.beginPath();
          pctx.moveTo(260, 240);
          for (let a = 0; a < Math.PI * 4; a += 0.1) {
            r = 10 * Math.exp(0.18 * a);
            pctx.lineTo(260 + r * Math.cos(a), 240 + r * Math.sin(a));
          }
          pctx.stroke();
        } else if (this.template.abstractPattern === 'zen-waves') {
          for (let y = 280; y < 480; y += 30) {
            pctx.beginPath();
            pctx.moveTo(0, y);
            for (let x = 0; x <= 480; x += 20) {
              pctx.lineTo(x, y + Math.sin(x * 0.03) * 12);
            }
            pctx.stroke();
          }
        } else if (this.template.abstractPattern === 'sunburst') {
          for (let a = 0; a < Math.PI; a += Math.PI / 12) {
            pctx.beginPath();
            pctx.moveTo(240, 0);
            pctx.lineTo(240 + Math.cos(a) * 500, Math.sin(a) * 500);
            pctx.stroke();
          }
        } else if (this.template.abstractPattern === 'diagonal-hatch') {
          for (let p = -480; p < 960; p += 26) {
            pctx.beginPath();
            pctx.moveTo(p, 0);
            pctx.lineTo(p + 480, 480);
            pctx.stroke();
          }
        } else if (this.template.abstractPattern === 'mandala') {
          const cx = 240, cy = 240;
          for (let i = 0; i < 8; i++) {
            const ang = (i * Math.PI) / 4;
            pctx.beginPath();
            pctx.arc(cx + Math.cos(ang) * 45, cy + Math.sin(ang) * 45, 70, 0, Math.PI * 2);
            pctx.stroke();
          }
        } else if (this.template.abstractPattern === 'celestial') {
          const cx = 360, cy = 120;
          pctx.beginPath();
          pctx.arc(cx, cy, 90, 0, Math.PI * 2);
          pctx.stroke();
          pctx.beginPath();
          pctx.arc(cx, cy, 120, 0, Math.PI * 2);
          pctx.stroke();
          pctx.beginPath();
          pctx.moveTo(cx - 150, cy);
          pctx.lineTo(cx + 150, cy);
          pctx.moveTo(cx, cy - 150);
          pctx.lineTo(cx, cy + 150);
          pctx.stroke();
        } else if (this.template.abstractPattern === 'isometric') {
          const spacing = 32;
          for (let x = -480; x < 960; x += spacing) {
            pctx.beginPath();
            pctx.moveTo(x, 0);
            pctx.lineTo(x + 480 * 0.577, 480);
            pctx.stroke();
            pctx.beginPath();
            pctx.moveTo(x, 0);
            pctx.lineTo(x - 480 * 0.577, 480);
            pctx.stroke();
          }
        } else if (this.template.abstractPattern === 'topography') {
          for (let y = 90; y <= 450; y += 40) {
            pctx.beginPath();
            pctx.moveTo(0, y);
            pctx.bezierCurveTo(120, y - 25, 360, y + 25, 480, y);
            pctx.stroke();
          }
        } else if (this.template.abstractPattern === 'perspective') {
          const vpX = 240, vpY = 220;
          for (let x = 0; x <= 480; x += 45) {
            pctx.beginPath();
            pctx.moveTo(vpX, vpY);
            pctx.lineTo(x, 480);
            pctx.stroke();
          }
          for (let y = vpY + 20; y <= 480; y += 28) {
            pctx.beginPath();
            pctx.moveTo(0, y);
            pctx.lineTo(480, y);
            pctx.stroke();
          }
        } else if (this.template.abstractPattern === 'sacred-polygon') {
          const cx = 240, cy = 240;
          [40, 80, 120, 160].forEach(r => {
            pctx.beginPath();
            for (let i = 0; i < 6; i++) {
              const ang = (i * Math.PI) / 3;
              const px = cx + r * Math.cos(ang);
              const py = cy + r * Math.sin(ang);
              if (i === 0) pctx.moveTo(px, py);
              else pctx.lineTo(px, py);
            }
            pctx.closePath();
            pctx.stroke();
          });
          pctx.beginPath();
          pctx.arc(cx, cy, 180, 0, Math.PI * 2);
          pctx.stroke();
        } else if (this.template.abstractPattern === 'cyber-matrix') {
          for (let x = 30; x <= 450; x += 45) {
            pctx.beginPath();
            pctx.moveTo(x, 0);
            pctx.lineTo(x, 480);
            pctx.stroke();
            for (let y = 30; y <= 450; y += 45) {
              pctx.strokeRect(x - 2, y - 2, 4, 4);
            }
          }
        } else if (this.template.abstractPattern === 'constellation') {
          const nodes = [
            [80, 70], [160, 130], [280, 90], [390, 60],
            [120, 260], [220, 210], [340, 280], [420, 200],
            [90, 390], [200, 420], [310, 370], [400, 410]
          ];
          nodes.forEach(([x, y]) => {
            pctx.beginPath();
            pctx.arc(x, y, 3.5, 0, Math.PI * 2);
            pctx.stroke();
          });
          pctx.beginPath();
          nodes.forEach(([x, y], idx) => {
            if (idx % 2 === 0 && nodes[idx + 1]) {
              pctx.moveTo(x, y);
              pctx.lineTo(nodes[idx + 1][0], nodes[idx + 1][1]);
            }
          });
          pctx.stroke();
        } else if (this.template.abstractPattern === 'retro-synthwave') {
          const horizonY = 280;
          for (let x = -200; x <= 680; x += 55) {
            pctx.beginPath();
            pctx.moveTo(240, horizonY);
            pctx.lineTo(x, 480);
            pctx.stroke();
          }
          for (let y = horizonY + 20; y <= 480; y += (y - horizonY) * 0.45 + 10) {
            pctx.beginPath();
            pctx.moveTo(0, y);
            pctx.lineTo(480, y);
            pctx.stroke();
          }
          for (let r = 40; r <= 100; r += 20) {
            pctx.beginPath();
            pctx.arc(240, horizonY, r, Math.PI, 0);
            pctx.stroke();
          }
        } else if (this.template.abstractPattern === 'voronoi-mesh') {
          const points = [[60, 60], [240, 40], [420, 80], [120, 240], [240, 200], [380, 230], [80, 420], [250, 440], [410, 400]];
          for (let i = 0; i < points.length; i++) {
            for (let j = i + 1; j < points.length; j++) {
              const d = Math.hypot(points[i][0] - points[j][0], points[i][1] - points[j][1]);
              if (d < 190) {
                pctx.beginPath();
                pctx.moveTo(points[i][0], points[i][1]);
                pctx.lineTo(points[j][0], points[j][1]);
                pctx.stroke();
              }
            }
          }
        } else if (this.template.abstractPattern === 'hypercube') {
          const cx = 240, cy = 240, s1 = 80, s2 = 40;
          pctx.strokeRect(cx - s1, cy - s1, s1 * 2, s1 * 2);
          pctx.strokeRect(cx - s2, cy - s2, s2 * 2, s2 * 2);
          pctx.beginPath();
          pctx.moveTo(cx - s1, cy - s1); pctx.lineTo(cx - s2, cy - s2);
          pctx.moveTo(cx + s1, cy - s1); pctx.lineTo(cx + s2, cy - s2);
          pctx.moveTo(cx + s1, cy + s1); pctx.lineTo(cx + s2, cy + s2);
          pctx.moveTo(cx - s1, cy + s1); pctx.lineTo(cx - s2, cy + s2);
          pctx.stroke();
        } else if (this.template.abstractPattern === 'arch-deco') {
          for (let r = 50; r <= 260; r += 28) {
            pctx.beginPath();
            pctx.arc(240, 460, r, Math.PI, 0);
            pctx.stroke();
          }
        } else if (this.template.abstractPattern === 'bauhaus-diagonals') {
          pctx.beginPath();
          pctx.moveTo(0, 0); pctx.lineTo(480, 480);
          pctx.moveTo(0, 240); pctx.lineTo(240, 480);
          pctx.moveTo(240, 0); pctx.lineTo(480, 240);
          pctx.stroke();
          pctx.beginPath();
          pctx.arc(140, 340, 40, 0, Math.PI * 2);
          pctx.arc(340, 140, 60, 0, Math.PI * 2);
          pctx.stroke();
        } else if (this.template.abstractPattern === 'quantum-field') {
          pctx.beginPath();
          for (let t = 0; t < Math.PI * 8; t += 0.05) {
            const x = 240 + 160 * Math.sin(3 * t);
            const y = 240 + 160 * Math.sin(4 * t);
            if (t === 0) pctx.moveTo(x, y);
            else pctx.lineTo(x, y);
          }
          pctx.stroke();
        } else if (this.template.abstractPattern === 'soundwave-radar') {
          const cx = 240, cy = 240;
          for (let r = 40; r <= 220; r += 36) {
            pctx.beginPath();
            pctx.arc(cx, cy, r, 0, Math.PI * 2);
            pctx.stroke();
          }
          pctx.beginPath();
          for (let x = 40; x <= 440; x += 8) {
            const h = Math.sin(x * 0.08) * 22 * Math.exp(-Math.abs(x - 240) / 120);
            pctx.moveTo(x, 240 - h);
            pctx.lineTo(x, 240 + h);
          }
          pctx.stroke();
        }
      }
    }
  }
}
