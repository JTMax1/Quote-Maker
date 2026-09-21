/**
 * Custom Design Theme Template Studio & Publisher
 * Enables creators to build new themes, customize styling, and publish under categories.
 */

import { FONT_FAMILIES, PRESET_CATEGORIES } from '../data/defaultPresets.js';
import { StorageService } from '../services/storageService.js';
import { Toast } from './toast.js';
import confetti from 'canvas-confetti';

export class TemplateStudio {
  constructor(containerEl, onTemplatePublished) {
    this.containerEl = containerEl;
    this.onTemplatePublished = onTemplatePublished;

    this.template = {
      name: 'Midnight Neon Dream',
      category: 'vibrant',
      description: 'Custom community gradient style',
      background: '#0a0d14',
      textColor: '#ffffff',
      accentColor: '#38ef7d',
      metaColor: '#94a3b8',
      cardBackground: 'rgba(255, 255, 255, 0.08)',
      borderStyle: 'neon-glow',
      borderColor: '#38ef7d',
      fontFamily: 'Syne',
      authorFontFamily: 'Plus Jakarta Sans',
      textAlign: 'center',
      quoteMarkStyle: 'classic',
      cardStyle: 'glass',
      gradient: 'linear-gradient(135deg, #090a0f 0%, #17153b 50%, #0f172a 100%)',
      badgeStyle: 'neon-pill',
      letterSpacing: '0.01em',
      lineHeight: 1.45
    };

    this.render();
  }

  render() {
    this.containerEl.innerHTML = `
      <div class="studio-layout">
        <!-- Controls Pane -->
        <div class="studio-controls-pane">
          <div style="border-bottom: 1px solid var(--border-glass); padding-bottom: 1rem;">
            <h2 style="font-size: 1.3rem; font-weight: 700; font-family: var(--font-display); margin-bottom: 0.25rem;">Theme Template Studio</h2>
            <p style="font-size: 0.85rem; color: var(--text-secondary);">Craft custom aesthetic themes and publish to the template marketplace.</p>
          </div>

          <!-- Basic Info -->
          <div class="studio-section">
            <label class="section-label">1. Theme Name & Category</label>
            <div class="input-row">
              <div class="form-group">
                <label class="form-label">Template Name</label>
                <input type="text" class="form-input" id="studioThemeName" value="${this.template.name}" placeholder="e.g. Cyber Velvet" />
              </div>
              <div class="form-group">
                <label class="form-label">Category</label>
                <select class="form-input" id="studioCategorySelect">
                  ${PRESET_CATEGORIES.filter(c => c.id !== 'all').map(c => `
                    <option value="${c.id}" ${this.template.category === c.id ? 'selected' : ''}>${c.icon} ${c.label}</option>
                  `).join('')}
                </select>
              </div>
            </div>
          </div>

          <!-- Color Palette -->
          <div class="studio-section">
            <label class="section-label">2. Color Palette</label>
            <div class="color-picker-grid">
              <div class="color-input-item">
                <input type="color" class="color-swatch-input" id="colorBg" value="${this.template.background}" />
                <label>Background</label>
              </div>
              <div class="color-input-item">
                <input type="color" class="color-swatch-input" id="colorText" value="${this.template.textColor}" />
                <label>Text</label>
              </div>
              <div class="color-input-item">
                <input type="color" class="color-swatch-input" id="colorAccent" value="${this.template.accentColor}" />
                <label>Accent</label>
              </div>
              <div class="color-input-item">
                <input type="color" class="color-swatch-input" id="colorMeta" value="${this.template.metaColor}" />
                <label>Secondary</label>
              </div>
            </div>

            <!-- Gradient Presets Quick Swatches -->
            <div style="margin-top: 0.5rem;">
              <span style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-bottom: 0.4rem;">Or Choose Background Gradient:</span>
              <div class="gradient-swatches-row" id="gradientSwatches">
                <button class="gradient-swatch-btn" data-grad="" style="background: ${this.template.background};" title="Solid"></button>
                <button class="gradient-swatch-btn" data-grad="linear-gradient(135deg, #090a0f 0%, #17153b 50%, #0f172a 100%)" style="background: linear-gradient(135deg, #090a0f 0%, #17153b 50%, #0f172a 100%);" title="Cyber Dark"></button>
                <button class="gradient-swatch-btn" data-grad="linear-gradient(180deg, #1b003a 0%, #751268 60%, #ff5e62 100%)" style="background: linear-gradient(180deg, #1b003a 0%, #751268 60%, #ff5e62 100%);" title="Retro Sunset"></button>
                <button class="gradient-swatch-btn" data-grad="linear-gradient(160deg, #020617 0%, #0c2b4e 50%, #064e3b 100%)" style="background: linear-gradient(160deg, #020617 0%, #0c2b4e 50%, #064e3b 100%);" title="Deep Abyss"></button>
                <button class="gradient-swatch-btn" data-grad="linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)" style="background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);" title="Nordic Aurora"></button>
              </div>
            </div>
          </div>

          <!-- Typography -->
          <div class="studio-section">
            <label class="section-label">3. Typography Pairing</label>
            <div class="input-row">
              <div class="form-group">
                <label class="form-label">Quote Font Family</label>
                <select class="form-input" id="studioFontSelect">
                  ${FONT_FAMILIES.map(f => `
                    <option value="${f.id}" ${this.template.fontFamily === f.id ? 'selected' : ''}>${f.label}</option>
                  `).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Text Alignment</label>
                <select class="form-input" id="studioAlignSelect">
                  <option value="center" ${this.template.textAlign === 'center' ? 'selected' : ''}>Center</option>
                  <option value="left" ${this.template.textAlign === 'left' ? 'selected' : ''}>Left</option>
                  <option value="right" ${this.template.textAlign === 'right' ? 'selected' : ''}>Right</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Frame & Border Style -->
          <div class="studio-section">
            <label class="section-label">4. Frame & Border Aesthetic</label>
            <div class="option-chips-grid" id="borderOptionsGrid">
              <button class="option-chip-btn ${this.template.borderStyle === 'double' ? 'active' : ''}" data-border="double">Double Line</button>
              <button class="option-chip-btn ${this.template.borderStyle === 'neon-glow' ? 'active' : ''}" data-border="neon-glow">Neon Glow</button>
              <button class="option-chip-btn ${this.template.borderStyle === 'gold-inlay' ? 'active' : ''}" data-border="gold-inlay">Gold Inlay</button>
              <button class="option-chip-btn ${this.template.borderStyle === 'brutalist-solid' ? 'active' : ''}" data-border="brutalist-solid">Brutalist</button>
              <button class="option-chip-btn ${this.template.borderStyle === 'polaroid' ? 'active' : ''}" data-border="polaroid">Polaroid</button>
              <button class="option-chip-btn ${this.template.borderStyle === 'subtle-frame' ? 'active' : ''}" data-border="subtle-frame">Subtle Rim</button>
            </div>
          </div>

          <!-- Quote Mark Style -->
          <div class="studio-section">
            <label class="section-label">5. Quote Marks</label>
            <div class="option-chips-grid" id="quoteMarkOptionsGrid">
              <button class="option-chip-btn ${this.template.quoteMarkStyle === 'classic' ? 'active' : ''}" data-qm="classic">Classic “ ”</button>
              <button class="option-chip-btn ${this.template.quoteMarkStyle === 'modern-brackets' ? 'active' : ''}" data-qm="modern-brackets">Brackets // </button>
              <button class="option-chip-btn ${this.template.quoteMarkStyle === 'minimal-dash' ? 'active' : ''}" data-qm="minimal-dash">Minimal —</button>
              <button class="option-chip-btn ${this.template.quoteMarkStyle === 'decorative-stars' ? 'active' : ''}" data-qm="decorative-stars">Stars ✦</button>
              <button class="option-chip-btn ${this.template.quoteMarkStyle === 'none' ? 'active' : ''}" data-qm="none">None</button>
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

          <div class="studio-canvas-mockup" id="studioMockup" style="background: ${this.template.gradient || this.template.background}; color: ${this.template.textColor}; font-family: '${this.template.fontFamily}', sans-serif;">
            <div class="studio-quote-text" id="mockupQuoteText">
              “Creativity is intelligence having fun.”
            </div>
            <div class="studio-author-text" id="mockupAuthorText" style="color: ${this.template.accentColor};">
              — Albert Einstein
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.updateMockup();
  }

  bindEvents() {
    // Theme name and category
    const nameInput = this.containerEl.querySelector('#studioThemeName');
    const catSelect = this.containerEl.querySelector('#studioCategorySelect');

    nameInput.addEventListener('input', (e) => {
      this.template.name = e.target.value;
    });
    catSelect.addEventListener('change', (e) => {
      this.template.category = e.target.value;
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

    // Quote mark options
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

    if (!mockup) return;

    mockup.style.background = this.template.gradient || this.template.background;
    mockup.style.color = this.template.textColor;
    mockup.style.fontFamily = `'${this.template.fontFamily}', sans-serif`;
    mockup.style.textAlign = this.template.textAlign;

    if (author) {
      author.style.color = this.template.accentColor;
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
    } else {
      mockup.style.border = `1px solid rgba(255,255,255,0.15)`;
      mockup.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.6)';
    }
  }
}
