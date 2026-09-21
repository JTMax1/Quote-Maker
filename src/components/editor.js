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
import { escapeHtml } from '../utils/security.js';
import { icon } from '../utils/icons.js';

export class Editor {
  constructor(containerEl, onOpenPresets, onOpenStudio, onQuotePublished) {
    this.containerEl = containerEl;
    if (typeof onOpenPresets === 'object' && onOpenPresets !== null) {
      this.onOpenPresets = onOpenPresets.onOpenPresetPicker || onOpenPresets.onOpenPresets;
      this.onOpenStudio = onOpenStudio || onOpenPresets.onOpenStudio;
      this.onQuotePublished = onQuotePublished || onOpenPresets.onShareCommunity || onOpenPresets.onQuotePublished;
      this.onSaveHistory = onOpenPresets.onSaveHistory;
    } else {
      this.onOpenPresets = onOpenPresets;
      this.onOpenStudio = onOpenStudio;
      this.onQuotePublished = onQuotePublished;
    }

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
      showAuthorImage: false,
      authorImage: PRESET_AUTHOR_PORTRAITS[1].imageUrl, // Seneca cutout preset available when toggled
      authorImagePlacement: 'cutout-right',
      styles: { ...this.activePreset }
    };

    this.exportFormat = 'png';
    this.mobileViewMode = 'split';

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
      <!-- Mobile Segmented View Switcher -->
      <div class="mobile-editor-switcher" id="mobileEditorSwitcher" role="tablist" aria-label="Mobile Layout View Toggle">
        <button class="switcher-btn ${this.mobileViewMode === 'canvas' ? 'active' : ''}" data-mode="canvas" role="tab" aria-selected="${this.mobileViewMode === 'canvas'}">
          <span aria-hidden="true">${icon('image', { size: 14 })}</span>
          <span>Preview</span>
        </button>
        <button class="switcher-btn ${this.mobileViewMode === 'controls' ? 'active' : ''}" data-mode="controls" role="tab" aria-selected="${this.mobileViewMode === 'controls'}">
          <span aria-hidden="true">${icon('sliders', { size: 14 })}</span>
          <span>Controls</span>
        </button>
        <button class="switcher-btn ${this.mobileViewMode === 'split' ? 'active' : ''}" data-mode="split" role="tab" aria-selected="${this.mobileViewMode === 'split'}">
          <span aria-hidden="true">${icon('columns', { size: 14 })}</span>
          <span>Split</span>
        </button>
      </div>

      <div class="editor-layout" id="editorLayoutRoot">
        <!-- Canvas Stage Area -->
        <div class="canvas-stage-wrapper ${this.mobileViewMode === 'controls' ? 'hidden-mobile' : ''}" id="canvasStageWrapper">
          <!-- Ratio Switcher & Layout Trigger -->
          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center; width: 100%;">
            <div class="ratio-switcher" id="ratioSwitcher" role="radiogroup" aria-label="Canvas Aspect Ratio">
              ${CANVAS_FORMATS.map(f => `
                <button class="ratio-chip ${this.state.ratio === f.id ? 'active' : ''}" data-ratio="${f.id}" role="radio" aria-checked="${this.state.ratio === f.id}" aria-label="${f.label} ratio">
                  <span class="ratio-icon" aria-hidden="true">${icon(f.icon || 'square', { size: 14 })}</span>
                  <span>${f.label}</span>
                </button>
              `).join('')}
            </div>

            <!-- 50 Layouts Trigger Pill -->
            <button class="btn-glass" id="btnOpenLayouts" aria-label="Choose from 50 Canvas Layouts" style="padding: 0.4rem 1rem; border-radius: 9999px; font-size: 0.85rem; font-weight: 600;">
              <span aria-hidden="true">${icon('layout', { size: 14 })}</span>
              <span id="lblActiveLayout">Layout: ${currentLayout.name}</span>
              <span class="tab-badge" style="background: var(--brand-primary); font-size: 0.7rem;">50 Canvas Layouts</span>
            </button>
          </div>

          <!-- Canvas Card Container -->
          <div class="canvas-viewport-card">
            <div class="canvas-frame" id="canvasFrame">
              <canvas id="previewCanvas" aria-label="Rendered Quote Preview Canvas" role="img"></canvas>
            </div>
          </div>

          <!-- Quick Action Bar -->
          <div class="canvas-actions-bar">
            <!-- Split Download Button with Format Dropdown -->
            <div class="download-split-group">
              <button class="btn-primary" id="btnDownload" aria-label="Download High-Res Image in ${this.exportFormat.toUpperCase()} format">
                <span aria-hidden="true">${icon('download', { size: 14 })}</span>
                <span id="lblDownloadText">Download (${this.exportFormat.toUpperCase()} 2x)</span>
              </button>
              <button class="btn-dropdown-trigger" id="btnExportFormatToggle" aria-label="Select download file format" aria-haspopup="true" aria-expanded="false">
                <span aria-hidden="true">${icon('chevronDown', { size: 14 })}</span>
              </button>
              <div class="export-format-menu" id="exportFormatMenu" role="menu" hidden>
                <button class="format-menu-item ${this.exportFormat === 'png' ? 'active' : ''}" data-format="png" role="menuitem">
                  <strong>PNG (Retina 2x)</strong>
                  <span>Lossless clarity for Instagram & X</span>
                </button>
                <button class="format-menu-item ${this.exportFormat === 'jpg' ? 'active' : ''}" data-format="jpg" role="menuitem">
                  <strong>JPG (Compact)</strong>
                  <span>High quality compressed file</span>
                </button>
                <button class="format-menu-item ${this.exportFormat === 'webp' ? 'active' : ''}" data-format="webp" role="menuitem">
                  <strong>WebP (Modern Web)</strong>
                  <span>Ultra-efficient lightweight graphic</span>
                </button>
              </div>
            </div>

            <button class="btn-accent" id="btnCopy" aria-label="Copy rendered quote image to clipboard">
              <span aria-hidden="true">${icon('copy', { size: 14 })}</span>
              <span>Copy Image</span>
            </button>
            <button class="btn-glass" id="btnShare" aria-label="Share quote image via system share">
              <span aria-hidden="true">${icon('share', { size: 14 })}</span>
              <span>Share</span>
            </button>
            <button class="btn-glass" id="btnSaveHistory" aria-label="Save quote to history">
              <span aria-hidden="true">${icon('hardDrive', { size: 14 })}</span>
              <span>Save</span>
            </button>
            <button class="btn-glass" id="btnPublish" aria-label="Publish quote to community feed">
              <span aria-hidden="true">${icon('globe', { size: 14 })}</span>
              <span>Publish to Community</span>
            </button>
          </div>
        </div>

        <!-- Controls Side Panel -->
        <div class="editor-controls-panel ${this.mobileViewMode === 'canvas' ? 'hidden-mobile' : ''}" id="editorControlsPanel">
          <!-- Active Theme Card -->
          <div class="control-card">
            <div class="active-theme-strip">
              <div class="theme-pill-left">
                <div class="theme-preview-dot" id="themePreviewDot" style="background: ${this.activePreset.gradient || this.activePreset.background};" aria-hidden="true"></div>
                <div>
                  <div class="theme-title-text" id="themeTitleText">${this.activePreset.name}</div>
                  <div class="theme-subtitle-text" id="themeSubText">${this.activePreset.fontFamily} • ${this.activePreset.category}</div>
                </div>
              </div>
              <button class="btn-glass" id="btnBrowsePresets" aria-label="Browse all presets" style="padding: 0.4rem 0.85rem; font-size: 0.8rem;">
                Browse Presets
              </button>
            </div>
          </div>

          <!-- Author Portrait & Background Remover Strip -->
          <div class="control-card">
            <div class="control-card-header">
              <span class="card-title">
                <span aria-hidden="true">${icon('user', { size: 15 })}</span>
                <span>Author Portrait & Cutout</span>
              </span>
              <label class="switch" for="toggleAuthorImage">
                <input type="checkbox" id="toggleAuthorImage" aria-label="Toggle author portrait and cutout display" ${this.state.showAuthorImage ? 'checked' : ''} />
                <span class="slider"></span>
              </label>
            </div>

            <div class="author-image-status-strip" id="authorImageStatusStrip">
              <div class="author-status-info">
                <div id="authorThumbBox" class="author-thumb-box">
                  ${this.state.authorImage ? `<img src="${this.state.authorImage}" alt="Portrait preview" style="width: 100%; height: 100%; object-fit: cover;" />` : icon('user', { size: 20 })}
                </div>
                <div class="author-status-meta">
                  <div style="font-size: 0.85rem; font-weight: 700;" id="lblAuthorPhotoStatus">${this.state.authorImage ? 'Portrait Active' : 'No Photo Selected'}</div>
                  <div style="font-size: 0.72rem; color: var(--text-muted);" id="lblAuthorPhotoPos">Placement: ${this.state.authorImagePlacement}</div>
                </div>
              </div>

              <button class="btn-glass btn-author-change" id="btnOpenAuthorStudio" aria-label="Change portrait and cutout photo">
                <span aria-hidden="true">${icon('scissors', { size: 14 })}</span>
                <span>Change Portrait & Cutout</span>
              </button>
            </div>
          </div>

          <!-- Quote Text Input Card -->
          <div class="control-card">
            <div class="control-card-header">
              <span class="card-title">
                <span aria-hidden="true">${icon('quote', { size: 15 })}</span>
                <span>Quote Content</span>
              </span>
              <button class="inspire-btn" id="btnInspire" aria-label="Load a random inspiration quote">
                <span aria-hidden="true">${icon('dices', { size: 14 })}</span>
                <span>Random Quote</span>
              </button>
            </div>

            <div class="quote-textarea-wrap">
              <label for="quoteTextInput" class="sr-only" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0;">Quote Content</label>
              <textarea class="quote-textarea" id="quoteTextInput" rows="4" placeholder="Type or paste your quote here..." aria-label="Quote Content Textarea">${escapeHtml(this.state.quote)}</textarea>
              <div class="input-char-count" id="quoteCharCount">${this.state.quote.length} chars</div>
            </div>
          </div>

          <!-- Metadata & Details Card -->
          <div class="control-card">
            <div class="control-card-header">
              <span class="card-title">
                <span>${icon('settings', { size: 15 })}</span>
                <span>Details & Metadata</span>
              </span>
            </div>

            <div class="input-row">
              <div class="form-group">
                <label class="form-label" for="inputAuthor">Author</label>
                <input type="text" class="form-input" id="inputAuthor" value="${escapeHtml(this.state.author)}" placeholder="Author Name" />
              </div>
              <div class="form-group">
                <label class="form-label" for="inputHandle">Handle / Role</label>
                <input type="text" class="form-input" id="inputHandle" value="${escapeHtml(this.state.handle)}" placeholder="@handle" />
              </div>
            </div>

            <div class="input-row">
              <div class="form-group">
                <label class="form-label" for="inputCategory">Topic / Category</label>
                <input type="text" class="form-input" id="inputCategory" value="${escapeHtml(this.state.category)}" placeholder="e.g. Wisdom" />
              </div>
              <div class="form-group">
                <label class="form-label" for="inputDate">Date</label>
                <input type="text" class="form-input" id="inputDate" value="${escapeHtml(this.state.date)}" placeholder="e.g. Sep 2026" />
              </div>
            </div>

            <!-- Toggles List -->
            <div class="toggles-list" style="margin-top: 0.5rem;">
              <div class="toggle-item">
                <div class="toggle-info">
                  <span class="toggle-label">Author & Handle</span>
                  <span class="toggle-desc">Show signature name</span>
                </div>
                <label class="switch" for="toggleAuthor">
                  <input type="checkbox" id="toggleAuthor" aria-label="Toggle author and handle display" ${this.state.showAuthor ? 'checked' : ''} />
                  <span class="slider"></span>
                </label>
              </div>

              <div class="toggle-item">
                <div class="toggle-info">
                  <span class="toggle-label">Date Stamp</span>
                  <span class="toggle-desc">Show date in header</span>
                </div>
                <label class="switch" for="toggleDate">
                  <input type="checkbox" id="toggleDate" aria-label="Toggle date display" ${this.state.showDate ? 'checked' : ''} />
                  <span class="slider"></span>
                </label>
              </div>

              <div class="toggle-item">
                <div class="toggle-info">
                  <span class="toggle-label">Category Badge</span>
                  <span class="toggle-desc">Show topic badge pill</span>
                </div>
                <label class="switch" for="toggleCategory">
                  <input type="checkbox" id="toggleCategory" aria-label="Toggle category badge display" ${this.state.showCategory ? 'checked' : ''} />
                  <span class="slider"></span>
                </label>
              </div>

              <div class="toggle-item">
                <div class="toggle-info">
                  <span class="toggle-label">Watermark</span>
                  <span class="toggle-desc">Subtle QuoteForge brand mark</span>
                </div>
                <label class="switch" for="toggleWatermark">
                  <input type="checkbox" id="toggleWatermark" aria-label="Toggle watermark brand mark" ${this.state.showWatermark ? 'checked' : ''} />
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
      this.authorImageModal.open(this.state.authorImagePlacement, this.state.authorImage);
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

    // Mobile Layout View Switcher
    const mobileSwitcher = this.containerEl.querySelector('#mobileEditorSwitcher');
    const stageWrapper = this.containerEl.querySelector('#canvasStageWrapper');
    const controlsPanel = this.containerEl.querySelector('#editorControlsPanel');

    const setMobileMode = (mode) => {
      this.mobileViewMode = mode;
      if (mobileSwitcher) {
        mobileSwitcher.querySelectorAll('.switcher-btn').forEach(btn => {
          const isActive = btn.dataset.mode === mode;
          btn.classList.toggle('active', isActive);
          btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
      }

      if (stageWrapper && controlsPanel) {
        if (mode === 'canvas') {
          stageWrapper.classList.remove('hidden-mobile');
          controlsPanel.classList.add('hidden-mobile');
          document.body.classList.remove('show-floating-preview');
        } else if (mode === 'controls') {
          stageWrapper.classList.add('hidden-mobile');
          controlsPanel.classList.remove('hidden-mobile');
          document.body.classList.add('show-floating-preview');
        } else {
          // split
          stageWrapper.classList.remove('hidden-mobile');
          controlsPanel.classList.remove('hidden-mobile');
          document.body.classList.remove('show-floating-preview');
        }
      }
    };

    if (mobileSwitcher) {
      mobileSwitcher.addEventListener('click', (e) => {
        const btn = e.target.closest('.switcher-btn');
        if (!btn) return;
        setMobileMode(btn.dataset.mode);
      });
    }

    // Floating Preview Trigger on mobile
    let floatingBtn = document.getElementById('btnFloatingShowPreview');
    if (!floatingBtn) {
      floatingBtn = document.createElement('button');
      floatingBtn.id = 'btnFloatingShowPreview';
      floatingBtn.className = 'floating-preview-trigger';
      floatingBtn.setAttribute('aria-label', 'View preview canvas');
      floatingBtn.innerHTML = `<span aria-hidden="true">${icon('image', { size: 14 })}</span><span>View Canvas</span>`;
      document.body.appendChild(floatingBtn);
      floatingBtn.addEventListener('click', () => {
        setMobileMode('canvas');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Export Format Dropdown
    const btnFormatToggle = this.containerEl.querySelector('#btnExportFormatToggle');
    const formatMenu = this.containerEl.querySelector('#exportFormatMenu');
    const lblDownload = this.containerEl.querySelector('#lblDownloadText');

    if (btnFormatToggle && formatMenu) {
      const toggleFormatMenu = (open) => {
        const isOpen = typeof open === 'boolean' ? open : formatMenu.hidden;
        formatMenu.hidden = !isOpen;
        btnFormatToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      };

      btnFormatToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFormatMenu();
      });

      formatMenu.querySelectorAll('.format-menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const fmt = item.dataset.format;
          if (fmt) {
            this.exportFormat = fmt;
            formatMenu.querySelectorAll('.format-menu-item').forEach(m => m.classList.toggle('active', m.dataset.format === fmt));
            if (lblDownload) {
              lblDownload.textContent = `Download (${fmt.toUpperCase()} 2x)`;
            }
            toggleFormatMenu(false);
            Toast.show(`Export format set to ${fmt.toUpperCase()}`, 'info');
          }
        });
      });

      document.addEventListener('click', (e) => {
        if (!formatMenu.hidden && !formatMenu.contains(e.target) && e.target !== btnFormatToggle) {
          toggleFormatMenu(false);
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !formatMenu.hidden) {
          toggleFormatMenu(false);
          btnFormatToggle.focus();
        }
      });
    }

    // Action Buttons
    this.containerEl.querySelector('#btnDownload').addEventListener('click', () => {
      this.saveToHistorySilent();
      ShareService.downloadImage(this.state, this.exportFormat);
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
      const saved = StorageService.saveToHistory({
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
      if (this.onSaveHistory) this.onSaveHistory(saved);
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
        Toast.show('Published quote to Community Feed!', 'success');
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
        : icon('user', { size: 20 });
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
