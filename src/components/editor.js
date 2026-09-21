/**
 * Core Live Canvas Editor Component
 * Instant quote generation, live reactive preview, 50 layouts, author portraits & cutouts, high-res export.
 */

import { CANVAS_FORMATS, DEFAULT_PRESETS, LAYOUT_STYLES } from '../data/defaultPresets.js';
import { PRESET_AUTHOR_PORTRAITS } from '../data/authorCutouts.js';
import { getRandomQuote } from '../data/sampleQuotes.js';
import { StorageService } from '../services/storageService.js';
import { CanvasRenderer } from '../services/canvasRenderer.js';
import { ShareService } from '../services/shareService.js';
import { AuthorImageModal } from './authorImageModal.js';
import { LayoutPicker } from './layoutPicker.js';
import { Toast } from './toast.js';

export class Editor {
  constructor(containerEl, onOpenPresets, onOpenStudio, onQuotePublished) {
    this.containerEl = containerEl;
    this.onOpenPresets = onOpenPresets;
    this.onOpenStudio = onOpenStudio;
    this.onQuotePublished = onQuotePublished;

    this.profile = StorageService.getProfile();
    this.activePreset = this.loadInitialPreset();

    // Editor state
    this.state = {
      quote: "We suffer more often in imagination than in reality.",
      author: this.profile.name || "Seneca",
      handle: this.profile.handle || "@stoicwisdom",
      category: "Philosophy",
      date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      watermark: this.profile.watermarkText || "QuoteForge",
      ratio: this.profile.defaultRatio || "1:1",
      layoutId: this.activePreset.layoutId || 'cutout-right',
      showAuthor: this.profile.showAuthor ?? true,
      showDate: this.profile.showDate ?? true,
      showCategory: this.profile.showCategory ?? true,
      showWatermark: this.profile.showWatermark ?? true,
      showAuthorImage: true,
      authorImage: PRESET_AUTHOR_PORTRAITS[1].imageUrl, // Default Seneca cutout!
      authorImagePlacement: 'right',
      styles: { ...this.activePreset }
    };

    // Sub-modals
    this.authorImageModal = new AuthorImageModal((imageConfig) => {
      this.state.showAuthorImage = imageConfig.showAuthorImage;
      this.state.authorImage = imageConfig.authorImage;
      this.state.authorImagePlacement = imageConfig.authorImagePlacement;
      this.updateAuthorImageStrip();
      this.scheduleRender();
    });

    this.layoutPicker = new LayoutPicker((layout) => {
      this.state.layoutId = layout.id;
      if (layout.portraitPlacement && layout.portraitPlacement !== 'none') {
        this.state.authorImagePlacement = layout.portraitPlacement;
      }
      this.updateLayoutDisplay();
      this.scheduleRender();
    });

    this.renderDebounceTimer = null;
    this.render();
  }

  loadInitialPreset() {
    const all = StorageService.getAllPresets();
    const found = all.find(p => p.id === this.profile.activePresetId);
    return found || DEFAULT_PRESETS[0];
  }

  applyPreset(preset) {
    this.activePreset = preset;
    this.state.styles = { ...preset };
    if (preset.layoutId) {
      this.state.layoutId = preset.layoutId;
    }
    this.updateThemePill();
    this.updateLayoutDisplay();
    this.scheduleRender();
  }

  updateProfile(profile) {
    this.profile = profile;
    this.state.author = profile.name || this.state.author;
    this.state.handle = profile.handle || this.state.handle;
    this.state.ratio = profile.defaultRatio || this.state.ratio;
    this.state.showDate = profile.showDate ?? this.state.showDate;
    this.state.showAuthor = profile.showAuthor ?? this.state.showAuthor;
    this.state.showCategory = profile.showCategory ?? this.state.showCategory;
    this.state.showWatermark = profile.showWatermark ?? this.state.showWatermark;

    const all = StorageService.getAllPresets();
    const found = all.find(p => p.id === profile.activePresetId);
    if (found) {
      this.applyPreset(found);
    } else {
      this.scheduleRender();
    }
    this.syncFormValues();
  }

  render() {
    const currentLayout = LAYOUT_STYLES.find(l => l.id === this.state.layoutId) || LAYOUT_STYLES[0];

    this.containerEl.innerHTML = `
      <div class="editor-layout">
        <!-- Canvas Stage Area -->
        <div class="canvas-stage-wrapper">
          <!-- Ratio Switcher & Layout Trigger -->
          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center; width: 100%;">
            <div class="ratio-switcher" id="ratioSwitcher">
              ${CANVAS_FORMATS.map(f => `
                <button class="ratio-chip ${this.state.ratio === f.id ? 'active' : ''}" data-ratio="${f.id}">
                  <span class="ratio-icon">📐</span>
                  <span>${f.label}</span>
                </button>
              `).join('')}
            </div>

            <!-- 50 Layouts Trigger Pill -->
            <button class="btn-glass" id="btnOpenLayouts" style="padding: 0.4rem 1rem; border-radius: 9999px; font-size: 0.85rem; font-weight: 600;">
              <span>🔀</span>
              <span id="lblActiveLayout">Layout: ${currentLayout.name}</span>
              <span class="tab-badge" style="background: var(--brand-primary); font-size: 0.7rem;">50 Styles</span>
            </button>
          </div>

          <!-- Canvas Card Container -->
          <div class="canvas-viewport-card">
            <div class="canvas-frame" id="canvasFrame">
              <canvas id="previewCanvas"></canvas>
            </div>
          </div>

          <!-- Quick Action Bar -->
          <div class="canvas-actions-bar">
            <button class="btn-primary" id="btnDownload">
              <span>⬇</span>
              <span>Download High-Res (2x)</span>
            </button>
            <button class="btn-accent" id="btnCopy">
              <span>📋</span>
              <span>Copy Image</span>
            </button>
            <button class="btn-glass" id="btnShare">
              <span>↗</span>
              <span>Share</span>
            </button>
            <button class="btn-glass" id="btnSaveHistory">
              <span>💾</span>
              <span>Save</span>
            </button>
            <button class="btn-glass" id="btnPublish">
              <span>🌐</span>
              <span>Publish to Community</span>
            </button>
          </div>
        </div>

        <!-- Controls Side Panel -->
        <div class="editor-controls-panel">
          <!-- Active Theme Card -->
          <div class="control-card">
            <div class="active-theme-strip">
              <div class="theme-pill-left">
                <div class="theme-preview-dot" id="themePreviewDot" style="background: ${this.activePreset.gradient || this.activePreset.background};"></div>
                <div>
                  <div class="theme-title-text" id="themeTitleText">${this.activePreset.name}</div>
                  <div class="theme-subtitle-text" id="themeSubText">${this.activePreset.fontFamily} • ${this.activePreset.category}</div>
                </div>
              </div>
              <button class="btn-glass" id="btnBrowsePresets" style="padding: 0.4rem 0.85rem; font-size: 0.8rem;">
                Browse 100+ Themes
              </button>
            </div>
          </div>

          <!-- Author Portrait & Background Remover Strip -->
          <div class="control-card">
            <div class="control-card-header">
              <span class="card-title">
                <span>👤</span>
                <span>Author Portrait & Cutout</span>
              </span>
              <label class="switch">
                <input type="checkbox" id="toggleAuthorImage" ${this.state.showAuthorImage ? 'checked' : ''} />
                <span class="slider"></span>
              </label>
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-surface-elevated); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass);" id="authorImageStatusStrip">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div id="authorThumbBox" style="width: 38px; height: 38px; border-radius: 50%; overflow: hidden; background: #27272a; display: flex; align-items: center; justify-content: center; border: 2px solid var(--brand-accent);">
                  ${this.state.authorImage ? `<img src="${this.state.authorImage}" style="width: 100%; height: 100%; object-fit: cover;" />` : '👤'}
                </div>
                <div>
                  <div style="font-size: 0.85rem; font-weight: 700;" id="lblAuthorPhotoStatus">${this.state.authorImage ? 'Portrait Active' : 'No Photo Selected'}</div>
                  <div style="font-size: 0.72rem; color: var(--text-muted);" id="lblAuthorPhotoPos">Placement: ${this.state.authorImagePlacement}</div>
                </div>
              </div>

              <button class="btn-glass" id="btnOpenAuthorStudio" style="padding: 0.4rem 0.75rem; font-size: 0.78rem; font-weight: 600;">
                <span>✂️ Studio / Remover</span>
              </button>
            </div>
          </div>

          <!-- Quote Text Input Card -->
          <div class="control-card">
            <div class="control-card-header">
              <span class="card-title">
                <span>💬</span>
                <span>Quote Content</span>
              </span>
              <button class="inspire-btn" id="btnInspire">
                <span>✨</span>
                <span>Inspire Me</span>
              </button>
            </div>

            <div class="quote-textarea-wrap">
              <textarea class="quote-textarea" id="quoteTextInput" rows="4" placeholder="Type or paste your quote here...">${this.state.quote}</textarea>
              <div class="input-char-count" id="quoteCharCount">${this.state.quote.length} chars</div>
            </div>
          </div>

          <!-- Metadata & Details Card -->
          <div class="control-card">
            <div class="control-card-header">
              <span class="card-title">
                <span>⚙️</span>
                <span>Details & Metadata</span>
              </span>
            </div>

            <div class="input-row">
              <div class="form-group">
                <label class="form-label">Author</label>
                <input type="text" class="form-input" id="inputAuthor" value="${this.state.author}" placeholder="Author Name" />
              </div>
              <div class="form-group">
                <label class="form-label">Handle / Role</label>
                <input type="text" class="form-input" id="inputHandle" value="${this.state.handle}" placeholder="@handle" />
              </div>
            </div>

            <div class="input-row">
              <div class="form-group">
                <label class="form-label">Topic / Category</label>
                <input type="text" class="form-input" id="inputCategory" value="${this.state.category}" placeholder="e.g. Wisdom" />
              </div>
              <div class="form-group">
                <label class="form-label">Date</label>
                <input type="text" class="form-input" id="inputDate" value="${this.state.date}" placeholder="e.g. Sep 2026" />
              </div>
            </div>

            <!-- Toggles List -->
            <div class="toggles-list" style="margin-top: 0.5rem;">
              <div class="toggle-item">
                <div class="toggle-info">
                  <span class="toggle-label">Author & Handle</span>
                  <span class="toggle-desc">Show signature name</span>
                </div>
                <label class="switch">
                  <input type="checkbox" id="toggleAuthor" ${this.state.showAuthor ? 'checked' : ''} />
                  <span class="slider"></span>
                </label>
              </div>

              <div class="toggle-item">
                <div class="toggle-info">
                  <span class="toggle-label">Date Stamp</span>
                  <span class="toggle-desc">Show date in header</span>
                </div>
                <label class="switch">
                  <input type="checkbox" id="toggleDate" ${this.state.showDate ? 'checked' : ''} />
                  <span class="slider"></span>
                </label>
              </div>

              <div class="toggle-item">
                <div class="toggle-info">
                  <span class="toggle-label">Category Badge</span>
                  <span class="toggle-desc">Show topic badge pill</span>
                </div>
                <label class="switch">
                  <input type="checkbox" id="toggleCategory" ${this.state.showCategory ? 'checked' : ''} />
                  <span class="slider"></span>
                </label>
              </div>

              <div class="toggle-item">
                <div class="toggle-info">
                  <span class="toggle-label">Watermark</span>
                  <span class="toggle-desc">Subtle QuoteForge brand mark</span>
                </div>
                <label class="switch">
                  <input type="checkbox" id="toggleWatermark" ${this.state.showWatermark ? 'checked' : ''} />
                  <span class="slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.scheduleRender();
  }

  bindEvents() {
    // Ratio Switcher
    const ratioSwitcher = this.containerEl.querySelector('#ratioSwitcher');
    ratioSwitcher.addEventListener('click', (e) => {
      const chip = e.target.closest('.ratio-chip');
      if (!chip) return;
      ratioSwitcher.querySelectorAll('.ratio-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      this.state.ratio = chip.dataset.ratio;
      this.scheduleRender();
    });

    // Layout Picker Button
    this.containerEl.querySelector('#btnOpenLayouts').addEventListener('click', () => {
      this.layoutPicker.open(this.state.layoutId);
    });

    // Author Image Studio Button
    this.containerEl.querySelector('#btnOpenAuthorStudio').addEventListener('click', () => {
      this.authorImageModal.open();
    });

    // Author Image Toggle
    const toggleAuthorImage = this.containerEl.querySelector('#toggleAuthorImage');
    toggleAuthorImage.addEventListener('change', (e) => {
      this.state.showAuthorImage = e.target.checked;
      this.updateAuthorImageStrip();
      this.scheduleRender();
    });

    // Quote Input with live char counter
    const quoteText = this.containerEl.querySelector('#quoteTextInput');
    const charCount = this.containerEl.querySelector('#quoteCharCount');
    quoteText.addEventListener('input', (e) => {
      this.state.quote = e.target.value;
      charCount.textContent = `${e.target.value.length} chars`;
      this.scheduleRender();
    });

    // Inspire Me button
    const btnInspire = this.containerEl.querySelector('#btnInspire');
    btnInspire.addEventListener('click', () => {
      const randomQuote = getRandomQuote();
      this.state.quote = randomQuote.quote;
      this.state.author = randomQuote.author;
      this.state.category = randomQuote.category;
      this.state.handle = randomQuote.handle || this.state.handle;

      // Auto-match portrait if available
      const matchedPortrait = PRESET_AUTHOR_PORTRAITS.find(p => p.name.toLowerCase().includes(randomQuote.author.toLowerCase()));
      if (matchedPortrait) {
        this.state.authorImage = matchedPortrait.imageUrl;
        this.state.showAuthorImage = true;
        this.updateAuthorImageStrip();
      }

      quoteText.value = this.state.quote;
      charCount.textContent = `${this.state.quote.length} chars`;
      this.syncFormValues();
      this.scheduleRender();
      Toast.show('Loaded inspiration quote!', 'info');
    });

    // Input fields
    const authorInput = this.containerEl.querySelector('#inputAuthor');
    const handleInput = this.containerEl.querySelector('#inputHandle');
    const catInput = this.containerEl.querySelector('#inputCategory');
    const dateInput = this.containerEl.querySelector('#inputDate');

    authorInput.addEventListener('input', (e) => {
      this.state.author = e.target.value;
      this.scheduleRender();
    });
    handleInput.addEventListener('input', (e) => {
      this.state.handle = e.target.value;
      this.scheduleRender();
    });
    catInput.addEventListener('input', (e) => {
      this.state.category = e.target.value;
      this.scheduleRender();
    });
    dateInput.addEventListener('input', (e) => {
      this.state.date = e.target.value;
      this.scheduleRender();
    });

    // Toggles
    const toggleAuthor = this.containerEl.querySelector('#toggleAuthor');
    const toggleDate = this.containerEl.querySelector('#toggleDate');
    const toggleCat = this.containerEl.querySelector('#toggleCategory');
    const toggleWatermark = this.containerEl.querySelector('#toggleWatermark');

    toggleAuthor.addEventListener('change', (e) => {
      this.state.showAuthor = e.target.checked;
      this.scheduleRender();
    });
    toggleDate.addEventListener('change', (e) => {
      this.state.showDate = e.target.checked;
      this.scheduleRender();
    });
    toggleCat.addEventListener('change', (e) => {
      this.state.showCategory = e.target.checked;
      this.scheduleRender();
    });
    toggleWatermark.addEventListener('change', (e) => {
      this.state.showWatermark = e.target.checked;
      this.scheduleRender();
    });

    // Preset Browse
    this.containerEl.querySelector('#btnBrowsePresets').addEventListener('click', () => {
      if (this.onOpenPresets) this.onOpenPresets();
    });

    // Action Buttons
    this.containerEl.querySelector('#btnDownload').addEventListener('click', () => {
      this.saveToHistorySilent();
      ShareService.downloadImage(this.state, 'png');
    });

    this.containerEl.querySelector('#btnCopy').addEventListener('click', () => {
      this.saveToHistorySilent();
      ShareService.copyImageToClipboard(this.state);
    });

    this.containerEl.querySelector('#btnShare').addEventListener('click', () => {
      this.saveToHistorySilent();
      ShareService.shareQuote(this.state);
    });

    this.containerEl.querySelector('#btnSaveHistory').addEventListener('click', () => {
      StorageService.saveToHistory({
        quote: this.state.quote,
        author: this.state.author,
        category: this.state.category,
        handle: this.state.handle,
        ratio: this.state.ratio,
        layoutId: this.state.layoutId,
        authorImage: this.state.authorImage,
        showAuthorImage: this.state.showAuthorImage,
        authorImagePlacement: this.state.authorImagePlacement,
        presetId: this.activePreset.id,
        styles: { ...this.state.styles }
      });
      Toast.show('Saved to History gallery!', 'success');
    });

    this.containerEl.querySelector('#btnPublish').addEventListener('click', () => {
      const published = StorageService.publishToCommunity(
        {
          quote: this.state.quote,
          author: this.state.author,
          category: this.state.category,
          handle: this.state.handle,
          ratio: this.state.ratio,
          layoutId: this.state.layoutId,
          authorImage: this.state.authorImage,
          showAuthorImage: this.state.showAuthorImage,
          authorImagePlacement: this.state.authorImagePlacement,
          presetId: this.activePreset.id,
          styles: { ...this.state.styles }
        },
        this.profile
      );
      if (published) {
        Toast.show('Published quote to Community Feed! 🌟', 'success');
        if (this.onQuotePublished) this.onQuotePublished(published);
      }
    });
  }

  updateAuthorImageStrip() {
    const thumbBox = this.containerEl.querySelector('#authorThumbBox');
    const statusText = this.containerEl.querySelector('#lblAuthorPhotoStatus');
    const posText = this.containerEl.querySelector('#lblAuthorPhotoPos');
    const toggle = this.containerEl.querySelector('#toggleAuthorImage');

    if (toggle) toggle.checked = this.state.showAuthorImage;
    if (thumbBox) {
      thumbBox.innerHTML = this.state.authorImage && this.state.showAuthorImage 
        ? `<img src="${this.state.authorImage}" style="width: 100%; height: 100%; object-fit: cover;" />`
        : '👤';
    }
    if (statusText) {
      statusText.textContent = this.state.showAuthorImage && this.state.authorImage ? 'Portrait Active' : 'No Photo Active';
    }
    if (posText) {
      posText.textContent = `Placement: ${this.state.authorImagePlacement}`;
    }
  }

  updateLayoutDisplay() {
    const lbl = this.containerEl.querySelector('#lblActiveLayout');
    const layout = LAYOUT_STYLES.find(l => l.id === this.state.layoutId) || LAYOUT_STYLES[0];
    if (lbl) {
      lbl.textContent = `Layout: ${layout.name}`;
    }
  }

  saveToHistorySilent() {
    StorageService.saveToHistory({
      quote: this.state.quote,
      author: this.state.author,
      category: this.state.category,
      handle: this.state.handle,
      ratio: this.state.ratio,
      layoutId: this.state.layoutId,
      authorImage: this.state.authorImage,
      showAuthorImage: this.state.showAuthorImage,
      authorImagePlacement: this.state.authorImagePlacement,
      presetId: this.activePreset.id,
      styles: { ...this.state.styles }
    });
  }

  syncFormValues() {
    const author = this.containerEl.querySelector('#inputAuthor');
    const handle = this.containerEl.querySelector('#inputHandle');
    const cat = this.containerEl.querySelector('#inputCategory');
    const date = this.containerEl.querySelector('#inputDate');
    const toggleAuthor = this.containerEl.querySelector('#toggleAuthor');
    const toggleDate = this.containerEl.querySelector('#toggleDate');
    const toggleCat = this.containerEl.querySelector('#toggleCategory');
    const toggleWatermark = this.containerEl.querySelector('#toggleWatermark');

    if (author) author.value = this.state.author;
    if (handle) handle.value = this.state.handle;
    if (cat) cat.value = this.state.category;
    if (date) date.value = this.state.date;
    if (toggleAuthor) toggleAuthor.checked = this.state.showAuthor;
    if (toggleDate) toggleDate.checked = this.state.showDate;
    if (toggleCat) toggleCat.checked = this.state.showCategory;
    if (toggleWatermark) toggleWatermark.checked = this.state.showWatermark;
  }

  updateThemePill() {
    const dot = this.containerEl.querySelector('#themePreviewDot');
    const title = this.containerEl.querySelector('#themeTitleText');
    const sub = this.containerEl.querySelector('#themeSubText');

    if (dot) dot.style.background = this.activePreset.gradient || this.activePreset.background;
    if (title) title.textContent = this.activePreset.name;
    if (sub) sub.textContent = `${this.activePreset.fontFamily} • ${this.activePreset.category}`;
  }

  scheduleRender() {
    if (this.renderDebounceTimer) clearTimeout(this.renderDebounceTimer);
    this.renderDebounceTimer = setTimeout(() => {
      this.executeRender();
    }, 40);
  }

  async executeRender() {
    const canvas = this.containerEl.querySelector('#previewCanvas');
    if (!canvas) return;
    await CanvasRenderer.renderToCanvas(this.state, canvas);
  }
}
