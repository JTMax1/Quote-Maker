/**
 * Custom Design Theme Template Studio & Publisher
 * Upgraded to support 50 layouts, 50 portrait placements, abstract geometric line art,
 * and instant reactive live preview for quote marks and backgrounds.
 */

import { FONT_FAMILIES, PRESET_CATEGORIES, LAYOUT_STYLES, PORTRAIT_PLACEMENTS } from '../data/defaultPresets.js';
import { StorageService } from '../services/storageService.js';
import { Toast } from './toast.js';
import confetti from 'canvas-confetti';

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
      quoteMarkStyle: 'classic',
      cardStyle: 'glass',
      abstractPattern: 'orbital-rings',
      layoutId: 'classic-centered',
      portraitPlacement: 'cutout-right',
      gradient: null,
      badgeStyle: 'neon-pill',
      letterSpacing: '0.02em',
      lineHeight: 1.45
    };

    this.render();
  }

  render() {
    this.containerEl.innerHTML = `
      <div class="studio-layout">
        <!-- Controls Pane -->
        <div class="studio-controls-pane" style="max-height: 85vh; overflow-y: auto; padding-right: 0.5rem;">
          <div style="border-bottom: 1px solid var(--border-glass); padding-bottom: 1rem;">
            <h2 style="font-size: 1.3rem; font-weight: 700; font-family: var(--font-display); margin-bottom: 0.25rem;">Theme Template Studio</h2>
            <p style="font-size: 0.85rem; color: var(--text-secondary);">Craft custom aesthetic themes with abstract geometry and 50 layouts, then publish to Presets.</p>
          </div>

          <!-- Basic Info -->
          <div class="studio-section">
            <span class="section-label">1. Theme Name & Category</span>
            <div class="input-row">
              <div class="form-group">
                <label class="form-label" for="studioThemeName">Template Name</label>
                <input type="text" class="form-input" id="studioThemeName" value="${this.template.name}" placeholder="e.g. Cyber Velvet" aria-label="Template Name" />
              </div>
              <div class="form-group">
                <label class="form-label" for="studioCategorySelect">Category</label>
                <select class="form-input" id="studioCategorySelect" aria-label="Theme Category">
                  ${PRESET_CATEGORIES.filter(c => c.id !== 'all').map(c => `
                    <option value="${c.id}" ${this.template.category === c.id ? 'selected' : ''}>${c.icon} ${c.label}</option>
                  `).join('')}
                </select>
              </div>
            </div>
          </div>

          <!-- Abstract Lines & Geometry Patterns -->
          <div class="studio-section">
            <span class="section-label">2. Abstract Lines & Geometric Patterns</span>
            <span style="font-size: 0.72rem; color: var(--text-muted); margin-bottom: 0.35rem; display: block;">Subtle geometric background lines that enhance elegance without overshadowing text:</span>
            <div class="option-chips-grid" id="abstractPatternGrid" style="grid-template-columns: repeat(3, 1fr);" role="group" aria-label="Geometric pattern style">
              <button class="option-chip-btn ${this.template.abstractPattern === 'orbital-rings' ? 'active' : ''}" data-pattern="orbital-rings">Orbital Rings</button>
              <button class="option-chip-btn ${this.template.abstractPattern === 'fibonacci' ? 'active' : ''}" data-pattern="fibonacci">Golden Spiral</button>
              <button class="option-chip-btn ${this.template.abstractPattern === 'celestial' ? 'active' : ''}" data-pattern="celestial">Star Map</button>
              <button class="option-chip-btn ${this.template.abstractPattern === 'zen-waves' ? 'active' : ''}" data-pattern="zen-waves">Zen Waves</button>
              <button class="option-chip-btn ${this.template.abstractPattern === 'isometric' ? 'active' : ''}" data-pattern="isometric">Isometric Grid</button>
              <button class="option-chip-btn ${this.template.abstractPattern === 'sunburst' ? 'active' : ''}" data-pattern="sunburst">Sunburst Rays</button>
              <button class="option-chip-btn ${this.template.abstractPattern === 'mandala' ? 'active' : ''}" data-pattern="mandala">Mandala</button>
              <button class="option-chip-btn ${this.template.abstractPattern === 'diagonal-hatch' ? 'active' : ''}" data-pattern="diagonal-hatch">Fine Hatching</button>
              <button class="option-chip-btn ${this.template.abstractPattern === 'topography' ? 'active' : ''}" data-pattern="topography">Topography</button>
              <button class="option-chip-btn ${this.template.abstractPattern === 'perspective' ? 'active' : ''}" data-pattern="perspective">Horizon Grid</button>
              <button class="option-chip-btn ${!this.template.abstractPattern ? 'active' : ''}" data-pattern="">None (Clean)</button>
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
                <button class="gradient-swatch-btn" data-grad="" style="background: ${this.template.background};" title="Solid" aria-label="Solid background"></button>
                <button class="gradient-swatch-btn" data-grad="linear-gradient(135deg, #090a0f 0%, #17153b 50%, #0f172a 100%)" style="background: linear-gradient(135deg, #090a0f 0%, #17153b 50%, #0f172a 100%);" title="Cyber Dark" aria-label="Cyber Dark gradient"></button>
                <button class="gradient-swatch-btn" data-grad="linear-gradient(180deg, #1b003a 0%, #751268 60%, #ff5e62 100%)" style="background: linear-gradient(180deg, #1b003a 0%, #751268 60%, #ff5e62 100%);" title="Retro Sunset" aria-label="Retro Sunset gradient"></button>
                <button class="gradient-swatch-btn" data-grad="linear-gradient(160deg, #020617 0%, #0c2b4e 50%, #064e3b 100%)" style="background: linear-gradient(160deg, #020617 0%, #0c2b4e 50%, #064e3b 100%);" title="Deep Abyss" aria-label="Deep Abyss gradient"></button>
                <button class="gradient-swatch-btn" data-grad="linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)" style="background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);" title="Nordic Aurora" aria-label="Nordic Aurora gradient"></button>
              </div>
            </div>
          </div>

          <!-- Typography -->
          <div class="studio-section">
            <span class="section-label">4. Typography & Quote Marks</span>
            <div class="input-row">
              <div class="form-group">
                <label class="form-label" for="studioFontSelect">Quote Font Family</label>
                <select class="form-input" id="studioFontSelect" aria-label="Quote Font Family">
                  ${FONT_FAMILIES.map(f => `
                    <option value="${f.id}" ${this.template.fontFamily === f.id ? 'selected' : ''}>${f.label}</option>
                  `).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="studioAlignSelect">Text Alignment</label>
                <select class="form-input" id="studioAlignSelect" aria-label="Text Alignment">
                  <option value="center" ${this.template.textAlign === 'center' ? 'selected' : ''}>Center</option>
                  <option value="left" ${this.template.textAlign === 'left' ? 'selected' : ''}>Left</option>
                  <option value="right" ${this.template.textAlign === 'right' ? 'selected' : ''}>Right</option>
                </select>
              </div>
            </div>

            <!-- Quote Marks Selection -->
            <div style="margin-top: 0.5rem;">
              <span style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-bottom: 0.35rem;">Quote Mark Styling:</span>
              <div class="option-chips-grid" id="quoteMarkOptionsGrid" role="group" aria-label="Quote Mark Style">
                <button class="option-chip-btn ${this.template.quoteMarkStyle === 'classic' ? 'active' : ''}" data-qm="classic">Classic “ ”</button>
                <button class="option-chip-btn ${this.template.quoteMarkStyle === 'modern-brackets' ? 'active' : ''}" data-qm="modern-brackets">Brackets // </button>
                <button class="option-chip-btn ${this.template.quoteMarkStyle === 'minimal-dash' ? 'active' : ''}" data-qm="minimal-dash">Minimal —</button>
                <button class="option-chip-btn ${this.template.quoteMarkStyle === 'decorative-stars' ? 'active' : ''}" data-qm="decorative-stars">Stars ✦</button>
                <button class="option-chip-btn ${this.template.quoteMarkStyle === 'none' ? 'active' : ''}" data-qm="none">None</button>
              </div>
            </div>
          </div>

          <!-- Layout & Portrait Placement -->
          <div class="studio-section">
            <span class="section-label">5. Default Layout & Portrait Placement</span>
            <div class="input-row">
              <div class="form-group">
                <label class="form-label" for="studioLayoutSelect">Associated Layout Style</label>
                <select class="form-input" id="studioLayoutSelect" aria-label="Associated Layout Style">
                  ${LAYOUT_STYLES.map(l => `
                    <option value="${l.id}" ${this.template.layoutId === l.id ? 'selected' : ''}>${l.icon} ${l.name}</option>
                  `).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="studioPlacementSelect">Default Portrait Placement</label>
                <select class="form-input" id="studioPlacementSelect" aria-label="Default Portrait Placement">
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
              <button class="option-chip-btn ${this.template.borderStyle === 'double' ? 'active' : ''}" data-border="double">Double Line</button>
              <button class="option-chip-btn ${this.template.borderStyle === 'neon-glow' ? 'active' : ''}" data-border="neon-glow">Neon Glow</button>
              <button class="option-chip-btn ${this.template.borderStyle === 'gold-inlay' ? 'active' : ''}" data-border="gold-inlay">Gold Inlay</button>
              <button class="option-chip-btn ${this.template.borderStyle === 'brutalist-solid' ? 'active' : ''}" data-border="brutalist-solid">Brutalist</button>
              <button class="option-chip-btn ${this.template.borderStyle === 'polaroid' ? 'active' : ''}" data-border="polaroid">Polaroid</button>
              <button class="option-chip-btn ${this.template.borderStyle === 'subtle-frame' ? 'active' : ''}" data-border="subtle-frame">Subtle Rim</button>
              <button class="option-chip-btn ${this.template.borderStyle === 'none' ? 'active' : ''}" data-border="none">No Border</button>
            </div>
          </div>

          <!-- Publish Action Button -->
          <button class="btn-primary" id="btnPublishTemplate" style="width: 100%; justify-content: center; padding: 0.85rem; margin-top: 0.5rem; font-size: 1rem;">
            <span>✨</span>
            <span>Publish Template to Presets</span>
          </button>
        </div>

        <!-- Studio Preview Pane -->
        <div class="studio-preview-pane">
          <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">
            Live Template Preview
          </div>

          <div class="studio-canvas-mockup" id="studioMockup" style="background: ${this.template.gradient || this.template.background}; color: ${this.template.textColor}; font-family: '${this.template.fontFamily}', sans-serif; position: relative; overflow: hidden;">
            <!-- Abstract Geometry Preview Canvas Overlay -->
            <canvas id="mockupPatternCanvas" width="480" height="480" style="position: absolute; inset: 0; pointer-events: none; z-index: 1;"></canvas>

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
    this.updateMockup();
  }

  bindEvents() {
    const nameInput = this.containerEl.querySelector('#studioThemeName');
    const catSelect = this.containerEl.querySelector('#studioCategorySelect');
    const layoutSelect = this.containerEl.querySelector('#studioLayoutSelect');
    const placementSelect = this.containerEl.querySelector('#studioPlacementSelect');

    nameInput.addEventListener('input', (e) => {
      this.template.name = e.target.value;
    });
    catSelect.addEventListener('change', (e) => {
      this.template.category = e.target.value;
    });
    layoutSelect.addEventListener('change', (e) => {
      this.template.layoutId = e.target.value;
      this.updateMockup();
    });
    placementSelect.addEventListener('change', (e) => {
      this.template.portraitPlacement = e.target.value;
      this.updateMockup();
    });

    // Abstract Pattern Selection
    const patternGrid = this.containerEl.querySelector('#abstractPatternGrid');
    patternGrid.addEventListener('click', (e) => {
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

    colorBg.addEventListener('input', (e) => {
      this.template.background = e.target.value;
      this.template.gradient = null;
      this.updateMockup();
    });
    colorText.addEventListener('input', (e) => {
      this.template.textColor = e.target.value;
      this.updateMockup();
    });
    colorAccent.addEventListener('input', (e) => {
      this.template.accentColor = e.target.value;
      this.template.borderColor = e.target.value;
      this.updateMockup();
    });
    colorMeta.addEventListener('input', (e) => {
      this.template.metaColor = e.target.value;
      this.updateMockup();
    });

    // Gradient swatches
    const gradSwatches = this.containerEl.querySelector('#gradientSwatches');
    gradSwatches.addEventListener('click', (e) => {
      const btn = e.target.closest('.gradient-swatch-btn');
      if (!btn) return;
      this.template.gradient = btn.dataset.grad || null;
      this.updateMockup();
    });

    // Font select
    const fontSelect = this.containerEl.querySelector('#studioFontSelect');
    fontSelect.addEventListener('change', (e) => {
      this.template.fontFamily = e.target.value;
      this.updateMockup();
    });

    // Align select
    const alignSelect = this.containerEl.querySelector('#studioAlignSelect');
    alignSelect.addEventListener('change', (e) => {
      this.template.textAlign = e.target.value;
      this.updateMockup();
    });

    // Border options
    const borderGrid = this.containerEl.querySelector('#borderOptionsGrid');
    borderGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.option-chip-btn');
      if (!btn) return;
      borderGrid.querySelectorAll('.option-chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.template.borderStyle = btn.dataset.border;
      this.updateMockup();
    });

    // Quote mark options (FIXED: Reactively updates live preview mockup immediately!)
    const qmGrid = this.containerEl.querySelector('#quoteMarkOptionsGrid');
    qmGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.option-chip-btn');
      if (!btn) return;
      qmGrid.querySelectorAll('.option-chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.template.quoteMarkStyle = btn.dataset.qm;
      this.updateMockup();
    });

    // Publish Template
    const btnPublish = this.containerEl.querySelector('#btnPublishTemplate');
    btnPublish.addEventListener('click', () => {
      const templateToSave = {
        ...this.template,
        name: this.template.name.trim() || 'Custom Template',
        id: 'custom_' + Date.now()
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

  updateMockup() {
    const mockup = this.containerEl.querySelector('#studioMockup');
    const quote = this.containerEl.querySelector('#mockupQuoteText');
    const author = this.containerEl.querySelector('#mockupAuthorText');
    const qmTop = this.containerEl.querySelector('#mockupQuoteMarkTop');
    const qmBottom = this.containerEl.querySelector('#mockupQuoteMarkBottom');
    const patternCanvas = this.containerEl.querySelector('#mockupPatternCanvas');

    if (!mockup) return;

    mockup.style.background = this.template.gradient || this.template.background;
    mockup.style.color = this.template.textColor;
    mockup.style.fontFamily = `'${this.template.fontFamily}', sans-serif`;
    mockup.style.textAlign = this.template.textAlign;

    if (author) author.style.color = this.template.accentColor;

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
          for (let y = 300; y < 480; y += 30) {
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
          for (let p = -480; p < 960; p += 30) {
            pctx.beginPath();
            pctx.moveTo(p, 0);
            pctx.lineTo(p + 480, 480);
            pctx.stroke();
          }
        } else if (this.template.abstractPattern === 'mandala') {
          for (let i = 0; i < 6; i++) {
            const ang = (i * Math.PI) / 3;
            pctx.beginPath();
            pctx.arc(240 + Math.cos(ang) * 50, 240 + Math.sin(ang) * 50, 80, 0, Math.PI * 2);
            pctx.stroke();
          }
        }
      }
    }
  }
}
