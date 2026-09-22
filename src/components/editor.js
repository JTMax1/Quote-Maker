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
import { FontPickerModal } from './fontPickerModal.js';
import { FontLoaderService } from '../services/fontLoaderService.js';
import { BrandingService, BRANDING_STYLES, BRANDING_POSITIONS } from '../services/brandingService.js';

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
      brandingStyle: 'text',
      brandingPosition: 'bottom-right',
      brandingOpacity: 0.55,
      brandingLogo: null,
      brandingHandle: this.profile.handle || '',
      showAuthorImage: false,
      authorImage: PRESET_AUTHOR_PORTRAITS[1].imageUrl, // Seneca cutout preset available when toggled
      authorImagePlacement: 'cutout-right',
      styles: { ...this.activePreset }
    };

    this.exportFormat = 'png';
    this.mobileViewMode = 'split';
    this.mobileEditorLayout = this.profile.mobileEditorLayout || 'pinned';
    this.activeRailCategory = 'typography';
    this.isExportSheetOpen = false;

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

    this.fontPickerModal = new FontPickerModal(
      (family, target) => {
        if (target === 'author') {
          this.state.styles.authorFontFamily = family;
        } else {
          this.state.styles.fontFamily = family;
        }
        this.updateTypographyUI();
        this.scheduleRender();
        Toast.show(`Applied font: ${family}`, 'success');
      },
      (pairing) => {
        this.state.styles.fontFamily = pairing.quoteFont;
        this.state.styles.authorFontFamily = pairing.authorFont;
        this.updateTypographyUI();
        this.scheduleRender();
        Toast.show(`Applied "${pairing.name}" font pairing!`, 'success');
      }
    );

    // Load saved brand logo from IndexedDB
    BrandingService.loadCustomLogo().then(logo => {
      if (logo) {
        this.state.brandingLogo = logo;
        this.updateBrandingUI();
        this.scheduleRender();
      }
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
    if (preset.fontFamily) {
      this.state.styles.fontFamily = preset.fontFamily;
    }
    if (preset.authorFontFamily) {
      this.state.styles.authorFontFamily = preset.authorFontFamily;
    }
    if (preset.fontWeight) {
      this.state.styles.fontWeight = preset.fontWeight;
    }
    if (preset.textAlign) {
      this.state.styles.textAlign = preset.textAlign;
    }
    if (preset.showWatermark !== undefined) {
      this.state.showWatermark = preset.showWatermark;
    }
    if (preset.watermark !== undefined) {
      this.state.watermark = preset.watermark;
    }
    if (preset.brandingHandle !== undefined) {
      this.state.brandingHandle = preset.brandingHandle;
    }
    if (preset.brandingStyle !== undefined) {
      this.state.brandingStyle = preset.brandingStyle;
    }
    if (preset.brandingPosition !== undefined) {
      this.state.brandingPosition = preset.brandingPosition;
    }
    if (preset.brandingOpacity !== undefined) {
      this.state.brandingOpacity = preset.brandingOpacity;
    }
    if (preset.brandingLogo !== undefined) {
      this.state.brandingLogo = preset.brandingLogo;
    }
    this.updateThemePill();
    this.updateLayoutDisplay();
    this.updateBrandingUI();
    this.updateTypographyUI();
    this.scheduleRender();
  }

  loadState(stateObj) {
    if (!stateObj) return;
    const targetState = stateObj.canvasState || stateObj;
    this.state = {
      ...this.state,
      ...targetState,
      styles: {
        ...this.state.styles,
        ...(targetState.styles || targetState.customStyles || {})
      }
    };
    if (targetState.presetId) {
      const all = StorageService.getAllPresets();
      const found = all.find(p => p.id === targetState.presetId);
      if (found) this.activePreset = found;
    }
    this.syncFormValues();
    this.updateThemePill();
    this.updateLayoutDisplay();
    this.updateAuthorImageStrip();
    this.updateBrandingUI();
    this.updateTypographyUI();
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

    if (profile.mobileEditorLayout && profile.mobileEditorLayout !== this.mobileEditorLayout) {
      this.mobileEditorLayout = profile.mobileEditorLayout;
      this.applyMobileLayoutMode();
    }

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
      <div class="editor-layout" id="editorLayoutRoot">
        <!-- Canvas Stage Area -->
        <div class="canvas-stage-wrapper ${this.mobileViewMode === 'controls' ? 'hidden-mobile' : ''}" id="canvasStageWrapper">
          <!-- Canvas Top Utility Bar: Ratio Switcher & Mobile Architecture Switcher -->
          <div class="canvas-top-utility-bar" id="canvasTopUtilityBar">
            <!-- Aspect Ratio Selector -->
            <div class="ratio-switcher" id="ratioSwitcher" role="radiogroup" aria-label="Canvas Aspect Ratio">
              ${CANVAS_FORMATS.map(f => `
                <button type="button" class="ratio-chip ${this.state.ratio === f.id ? 'active' : ''}" data-ratio="${f.id}" role="radio" aria-checked="${this.state.ratio === f.id}" title="${f.label} (${f.sublabel})" aria-label="${f.label} ratio">
                  <span class="ratio-icon" aria-hidden="true">${icon(f.icon || 'square', { size: 12 })}</span>
                  <span>${f.label}</span>
                </button>
              `).join('')}
            </div>

            <!-- Mobile Layout Architecture Switcher (Options A, B, C) -->
            <div class="compact-mode-menu-wrapper">
              <button type="button" class="compact-util-btn" id="btnMobileLayoutModeToggle" aria-label="Switch Mobile Editor Layout (Options A, B, C)" aria-haspopup="true" aria-expanded="false">
                <span aria-hidden="true">${icon('smartphone', { size: 12 })}</span>
                <span id="lblCurrentMobileLayoutMode">${this.mobileEditorLayout === 'rail' ? 'Rail' : (this.mobileEditorLayout === 'pip' ? 'PiP' : 'Pinned')}</span>
                <span aria-hidden="true">${icon('chevronDown', { size: 10 })}</span>
              </button>
              <div class="compact-mode-dropdown" id="compactModeDropdown" hidden>
                <button type="button" class="compact-mode-item ${(!this.mobileEditorLayout || this.mobileEditorLayout === 'pinned') ? 'active' : ''}" data-mode="pinned">
                  <strong>Option A: Pinned (Default)</strong>
                  <span>Live canvas pinned at top (Canva style)</span>
                </button>
                <button type="button" class="compact-mode-item ${this.mobileEditorLayout === 'rail' ? 'active' : ''}" data-mode="rail">
                  <strong>Option B: Studio Rail</strong>
                  <span>Full canvas + bottom icon rail & drawer</span>
                </button>
                <button type="button" class="compact-mode-item ${this.mobileEditorLayout === 'pip' ? 'active' : ''}" data-mode="pip">
                  <strong>Option C: Floating PiP</strong>
                  <span>Scrolls naturally with docked mini-preview</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Canvas Card Container -->
          <div class="canvas-viewport-card">
            <div class="canvas-frame" id="canvasFrame">
              <canvas id="previewCanvas" aria-label="Rendered Quote Preview Canvas" role="img"></canvas>
            </div>
          </div>

          <!-- Consolidated Primary Action Bar: Download, Share, and More Options -->
          <div class="canvas-actions-bar consolidated-actions-bar" id="canvasActionsBar">
            <button type="button" class="btn-primary action-download-btn" id="btnMainDownload" aria-label="Download Image">
              <span aria-hidden="true">${icon('download', { size: 15 })}</span>
              <span id="lblMainDownloadText">Download</span>
              <span class="action-format-badge" id="lblFormatBadge">${this.exportFormat.toUpperCase()} 2x</span>
            </button>
            <button type="button" class="btn-glass action-share-btn" id="btnMainShare" aria-label="Share Quote Graphic">
              <span aria-hidden="true">${icon('share', { size: 15 })}</span>
              <span>Share</span>
            </button>
            <button type="button" class="btn-glass action-more-btn" id="btnOpenExportSheet" aria-label="More Export and Publishing Options" title="More export options">
              <span aria-hidden="true">${icon('moreHorizontal', { size: 16 })}</span>
            </button>
          </div>
        </div>

        <!-- Controls Side Panel -->
        <div class="editor-controls-panel ${this.mobileViewMode === 'canvas' ? 'hidden-mobile' : ''}" id="editorControlsPanel">
          <!-- Active Theme Card -->
          <div class="control-card" data-rail-section="themes">
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

          <!-- Canvas Layout (50 Canvas Layouts) Card -->
          <div class="control-card" data-rail-section="layout">
            <div class="control-card-header">
              <span class="card-title">
                <span aria-hidden="true">${icon('layout', { size: 15 })}</span>
                <span>Canvas Layout</span>
              </span>
              <span class="tab-badge" style="background: var(--brand-primary); font-size: 0.72rem; font-weight: 700;">50 Layouts</span>
            </div>
            <div class="layout-selection-strip">
              <div class="layout-strip-info">
                <div class="layout-thumb-box" aria-hidden="true">
                  ${icon('layout', { size: 20 })}
                </div>
                <div>
                  <div class="layout-title-text" id="lblToolsLayoutName">${currentLayout.name}</div>
                  <div class="layout-subtitle-text" id="lblToolsLayoutCategory">${currentLayout.category || 'Editorial & Social'} • ${currentLayout.portraitPlacement !== 'none' ? 'With Portrait' : 'Minimal'}</div>
                </div>
              </div>
              <button type="button" class="btn-primary btn-choose-layout" id="btnOpenLayoutsModal" aria-label="Browse all 50 canvas layouts" style="padding: 0.45rem 1rem; font-size: 0.82rem;">
                <span aria-hidden="true">${icon('sliders', { size: 13 })}</span>
                <span>Choose Layout</span>
              </button>
            </div>
          </div>

          <!-- Typography & Google Fonts Studio Card -->
          <div class="control-card" data-rail-section="typography">
            <div class="control-card-header">
              <span class="card-title">
                <span aria-hidden="true">${icon('type', { size: 15 })}</span>
                <span>Typography & Google Fonts</span>
              </span>
              <div style="display: flex; gap: 0.4rem; align-items: center;">
                <button class="btn-glass" id="btnOpenPairingsStudio" style="padding: 0.35rem 0.65rem; font-size: 0.76rem; border-color: var(--brand-primary); color: var(--brand-primary);" aria-label="Browse 6 Signature Font Pairings">
                  <span aria-hidden="true">${icon('layers', { size: 12 })}</span>
                  <span>Pairings</span>
                </button>
                <button class="inspire-btn" id="btnOpenFontPickerQuote" aria-label="Browse 40+ curated Google Fonts">
                  <span aria-hidden="true">${icon('sparkles', { size: 13 })}</span>
                  <span>Browse Fonts</span>
                </button>
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <!-- Quote Typography Row -->
              <div class="typography-row">
                <div class="typography-info">
                  <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Quote Typeface</span>
                  <span class="typography-font-name" id="lblQuoteFontName" style="font-family: ${FontLoaderService.getFallbackStack(this.state.styles.fontFamily || 'Playfair Display')}; font-size: 1.05rem;">${escapeHtml(this.state.styles.fontFamily || 'Playfair Display')}</span>
                  <span class="typography-sample-text" id="lblQuoteFontSample" style="font-family: ${FontLoaderService.getFallbackStack(this.state.styles.fontFamily || 'Playfair Display')};">“${escapeHtml(this.state.quote ? (this.state.quote.length > 32 ? this.state.quote.slice(0, 30) + '…' : this.state.quote) : 'Typography Preview')}”</span>
                </div>
                <button class="btn-glass" id="btnChangeQuoteFont" style="padding: 0.45rem 0.85rem; font-size: 0.78rem;" aria-label="Change quote font">
                  Change
                </button>
              </div>

              <!-- Author Signature Typography Row -->
              <div class="typography-row">
                <div class="typography-info">
                  <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Author Signature Typeface</span>
                  <span class="typography-font-name" id="lblAuthorFontName" style="font-family: ${FontLoaderService.getFallbackStack(this.state.styles.authorFontFamily || 'Plus Jakarta Sans')}; font-size: 1.05rem;">${escapeHtml(this.state.styles.authorFontFamily || 'Plus Jakarta Sans')}</span>
                  <span class="typography-sample-text" id="lblAuthorFontSample" style="font-family: ${FontLoaderService.getFallbackStack(this.state.styles.authorFontFamily || 'Plus Jakarta Sans')};">— ${escapeHtml(this.state.author || 'Author Signature')}</span>
                </div>
                <button class="btn-glass" id="btnChangeAuthorFont" style="padding: 0.45rem 0.85rem; font-size: 0.78rem;" aria-label="Change author signature font">
                  Change
                </button>
              </div>

              <!-- Typographic Micro-Controls: Text Alignment & Font Weight -->
              <div class="typo-micro-controls">
                <!-- Text Alignment -->
                <div class="typo-control-group">
                  <span class="typo-control-label">Alignment</span>
                  <div class="typo-btn-group" id="typoAlignGroup" role="radiogroup" aria-label="Quote Text Alignment">
                    <button type="button" class="typo-btn ${(!this.state.styles.textAlign || this.state.styles.textAlign === 'left') ? 'active' : ''}" data-align="left" role="radio" aria-checked="${(!this.state.styles.textAlign || this.state.styles.textAlign === 'left') ? 'true' : 'false'}" aria-label="Align Left">
                      <span aria-hidden="true">${icon('alignLeft', { size: 14 })}</span>
                      <span>Left</span>
                    </button>
                    <button type="button" class="typo-btn ${this.state.styles.textAlign === 'center' ? 'active' : ''}" data-align="center" role="radio" aria-checked="${this.state.styles.textAlign === 'center' ? 'true' : 'false'}" aria-label="Align Center">
                      <span aria-hidden="true">${icon('alignCenter', { size: 14 })}</span>
                      <span>Center</span>
                    </button>
                    <button type="button" class="typo-btn ${this.state.styles.textAlign === 'right' ? 'active' : ''}" data-align="right" role="radio" aria-checked="${this.state.styles.textAlign === 'right' ? 'true' : 'false'}" aria-label="Align Right">
                      <span aria-hidden="true">${icon('alignRight', { size: 14 })}</span>
                      <span>Right</span>
                    </button>
                  </div>
                </div>

                <!-- Font Weight -->
                <div class="typo-control-group">
                  <span class="typo-control-label">Quote Weight</span>
                  <div class="typo-btn-group" id="typoWeightGroup" role="radiogroup" aria-label="Quote Font Weight">
                    <button type="button" class="typo-btn ${this.state.styles.fontWeight == 400 ? 'active' : ''}" data-weight="400" role="radio" aria-checked="${this.state.styles.fontWeight == 400 ? 'true' : 'false'}" aria-label="Regular 400">
                      Regular
                    </button>
                    <button type="button" class="typo-btn ${(this.state.styles.fontWeight == 600 || !this.state.styles.fontWeight) ? 'active' : ''}" data-weight="600" role="radio" aria-checked="${(this.state.styles.fontWeight == 600 || !this.state.styles.fontWeight) ? 'true' : 'false'}" aria-label="Semi-Bold 600">
                      Semi
                    </button>
                    <button type="button" class="typo-btn ${this.state.styles.fontWeight == 700 ? 'active' : ''}" data-weight="700" role="radio" aria-checked="${this.state.styles.fontWeight == 700 ? 'true' : 'false'}" aria-label="Bold 700">
                      Bold
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Author Portrait & Background Remover Strip -->
          <div class="control-card" data-rail-section="portrait">
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
          <div class="control-card" data-rail-section="content">
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
          <div class="control-card" data-rail-section="metadata">
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
            </div>
          </div>

          <!-- Watermark & Custom Branding Suite Card -->
          <div class="control-card" data-rail-section="branding">
            <div class="control-card-header">
              <span class="card-title">
                <span aria-hidden="true">${icon('shield', { size: 15 })}</span>
                <span>Watermark & Branding Suite</span>
              </span>
              <label class="switch" for="toggleWatermark">
                <input type="checkbox" id="toggleWatermark" aria-label="Toggle watermark and branding display" ${this.state.showWatermark ? 'checked' : ''} />
                <span class="slider"></span>
              </label>
            </div>

            <div class="branding-options-stack" id="brandingOptionsBody" style="${this.state.showWatermark ? '' : 'opacity: 0.45; pointer-events: none;'}">
              <!-- Watermark Text & Handle Input -->
              <div class="input-row">
                <div class="form-group">
                  <label class="form-label" for="inputWatermarkText">Brand / Watermark Text</label>
                  <input type="text" class="form-input" id="inputWatermarkText" value="${escapeHtml(this.state.watermark)}" placeholder="e.g. QuoteForge" aria-label="Watermark brand text" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="inputBrandingHandle">Badge Handle</label>
                  <input type="text" class="form-input" id="inputBrandingHandle" value="${escapeHtml(this.state.brandingHandle || this.state.handle)}" placeholder="@handle" aria-label="Badge handle" />
                </div>
              </div>

              <!-- Branding Style Segmented Grid -->
              <div>
                <label class="form-label" style="margin-bottom: 0.35rem; display: block;">Branding Display Style</label>
                <div class="branding-style-selector" id="brandingStyleSelector" role="radiogroup" aria-label="Branding Display Style">
                  ${BRANDING_STYLES.map(s => `
                    <button class="branding-style-btn ${this.state.brandingStyle === s.id ? 'active' : ''}" data-style="${s.id}" role="radio" aria-checked="${this.state.brandingStyle === s.id}">
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
                    <div class="logo-thumb-box" id="brandingLogoThumb" aria-hidden="true">
                      ${this.state.brandingLogo ? `<img src="${this.state.brandingLogo}" alt="Brand logo thumbnail" />` : icon('image', { size: 18 })}
                    </div>
                    <div>
                      <div style="font-size: 0.84rem; font-weight: 700;" id="lblLogoStatus">${this.state.brandingLogo ? 'Custom Logo Active' : 'No Logo Uploaded'}</div>
                      <div style="font-size: 0.72rem; color: var(--text-muted);">PNG, SVG, or JPG with transparency</div>
                    </div>
                  </div>
                  <div style="display: flex; gap: 0.4rem;">
                    <input type="file" id="inputBrandingLogoFile" accept="image/png,image/svg+xml,image/jpeg,image/webp" style="display: none;" aria-label="Upload custom logo file" />
                    <button class="btn-glass" id="btnUploadBrandingLogo" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;" aria-label="Upload custom brand logo">
                      ${icon('upload', { size: 13 })} Upload Logo
                    </button>
                    ${this.state.brandingLogo ? `
                      <button class="btn-glass" id="btnClearBrandingLogo" style="padding: 0.35rem 0.6rem; font-size: 0.78rem; color: #ef4444;" aria-label="Remove custom logo">
                        ${icon('trash', { size: 13 })}
                      </button>
                    ` : ''}
                  </div>
                </div>
              </div>

              <!-- Canvas Position Selector -->
              <div>
                <label class="form-label" style="margin-bottom: 0.35rem; display: block;">Canvas Placement</label>
                <div class="branding-pos-selector" id="brandingPosSelector" role="radiogroup" aria-label="Branding Placement on Canvas">
                  ${BRANDING_POSITIONS.map(p => `
                    <button class="branding-pos-btn ${this.state.brandingPosition === p.id ? 'active' : ''}" data-pos="${p.id}" role="radio" aria-checked="${this.state.brandingPosition === p.id}">
                      <span>${p.label}</span>
                    </button>
                  `).join('')}
                </div>
              </div>

              <!-- Opacity Slider -->
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                  <label for="sliderBrandingOpacity" class="form-label">Watermark Opacity</label>
                  <span style="font-size: 0.78rem; font-weight: 700; color: var(--brand-primary);" id="lblBrandingOpacity">${Math.round(this.state.brandingOpacity * 100)}%</span>
                </div>
                <input type="range" id="sliderBrandingOpacity" min="10" max="100" value="${Math.round(this.state.brandingOpacity * 100)}" aria-label="Watermark Opacity" style="width: 100%; accent-color: var(--brand-primary);" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Studio Bottom Rail Bar (Option B) -->
      <div class="studio-rail-bar" id="studioRailBar">
        <button type="button" class="studio-rail-item ${this.activeRailCategory === 'layout' ? 'active' : ''}" data-rail="layout" aria-label="50 Canvas Layouts">
          <span aria-hidden="true">${icon('layout', { size: 18 })}</span>
          <span>Layout</span>
        </button>
        <button type="button" class="studio-rail-item ${this.activeRailCategory === 'typography' ? 'active' : ''}" data-rail="typography" aria-label="Typography & Fonts">
          <span aria-hidden="true">${icon('type', { size: 18 })}</span>
          <span>Fonts</span>
        </button>
        <button type="button" class="studio-rail-item ${this.activeRailCategory === 'content' ? 'active' : ''}" data-rail="content" aria-label="Quote Text Content">
          <span aria-hidden="true">${icon('quote', { size: 18 })}</span>
          <span>Text</span>
        </button>
        <button type="button" class="studio-rail-item ${this.activeRailCategory === 'portrait' ? 'active' : ''}" data-rail="portrait" aria-label="Author Portrait">
          <span aria-hidden="true">${icon('user', { size: 18 })}</span>
          <span>Portrait</span>
        </button>
        <button type="button" class="studio-rail-item ${this.activeRailCategory === 'metadata' ? 'active' : ''}" data-rail="metadata" aria-label="Details & Metadata">
          <span aria-hidden="true">${icon('settings', { size: 18 })}</span>
          <span>Details</span>
        </button>
        <button type="button" class="studio-rail-item ${this.activeRailCategory === 'branding' ? 'active' : ''}" data-rail="branding" aria-label="Watermark & Branding">
          <span aria-hidden="true">${icon('shield', { size: 18 })}</span>
          <span>Brand</span>
        </button>
        <button type="button" class="studio-rail-item ${this.activeRailCategory === 'themes' ? 'active' : ''}" data-rail="themes" aria-label="Browse Themes & Presets">
          <span aria-hidden="true">${icon('palette', { size: 18 })}</span>
          <span>Themes</span>
        </button>
      </div>

      <!-- Studio Rail Drawer Modal (Option B) -->
      <div class="rail-drawer-backdrop" id="studioRailDrawerBackdrop" hidden>
        <div class="rail-drawer-modal" id="studioRailDrawerModal" role="dialog" aria-modal="true" aria-labelledby="lblRailDrawerTitle">
          <div class="rail-drawer-handle"></div>
          <div class="rail-drawer-header">
            <div class="rail-drawer-title" id="lblRailDrawerTitle">
              <span id="lblRailDrawerIcon" aria-hidden="true">${icon('type', { size: 16 })}</span>
              <span id="lblRailDrawerText">Typography & Google Fonts</span>
            </div>
            <button type="button" class="export-close-btn" id="btnCloseRailDrawer" aria-label="Close studio drawer">
              ${icon('x', { size: 16 })}
            </button>
          </div>
          <div class="rail-drawer-body" id="railDrawerBodySlot">
            <!-- Dynamically populated or card moved here -->
          </div>
        </div>
      </div>

      <!-- Floating Mini-PiP Dock (Option C) -->
      <div class="mini-pip-dock" id="miniPipDock" aria-label="Floating preview canvas">
        <div class="mini-pip-header">
          <span class="pip-label">Live Preview</span>
          <button type="button" class="pip-scroll-up-btn" id="btnPipScrollUp" aria-label="Scroll back up to full canvas">
            <span aria-hidden="true">${icon('arrowUp', { size: 12 })}</span>
          </button>
        </div>
        <div class="mini-pip-frame">
          <canvas id="miniPipCanvas" width="220" height="220" aria-label="Mini floating preview canvas"></canvas>
        </div>
      </div>

      <!-- Consolidated Export & Share Bottom Sheet Modal -->
      <div class="export-sheet-backdrop" id="exportSheetBackdrop" hidden>
        <div class="export-sheet-modal" id="exportSheetModal" role="dialog" aria-modal="true" aria-labelledby="lblExportSheetTitle">
          <div class="export-sheet-drag-handle"></div>
          <div class="export-sheet-header">
            <div class="export-sheet-title-group">
              <span class="export-sheet-badge">High Resolution</span>
              <h3 class="export-sheet-title" id="lblExportSheetTitle">Export & Share</h3>
              <p class="export-sheet-subtitle">Download image, copy to clipboard, or publish</p>
            </div>
            <button type="button" class="export-close-btn" id="btnCloseExportSheet" aria-label="Close export sheet">
              ${icon('x', { size: 16 })}
            </button>
          </div>

          <!-- Format Segmented Chips -->
          <div class="export-format-block">
            <div class="export-block-label">Format Selection</div>
            <div class="export-format-chips-grid" id="sheetFormatGrid" role="radiogroup" aria-label="Export format">
              <button type="button" class="export-format-chip ${this.exportFormat === 'png' ? 'active' : ''}" data-format="png" role="radio" aria-checked="${this.exportFormat === 'png'}">
                <div class="format-chip-header">
                  <strong>PNG</strong>
                  <span class="format-chip-badge">2x HD</span>
                </div>
                <span>Lossless Quality</span>
              </button>
              <button type="button" class="export-format-chip ${this.exportFormat === 'jpg' ? 'active' : ''}" data-format="jpg" role="radio" aria-checked="${this.exportFormat === 'jpg'}">
                <div class="format-chip-header">
                  <strong>JPG</strong>
                  <span class="format-chip-badge">Standard</span>
                </div>
                <span>Lightweight Web</span>
              </button>
              <button type="button" class="export-format-chip ${this.exportFormat === 'webp' ? 'active' : ''}" data-format="webp" role="radio" aria-checked="${this.exportFormat === 'webp'}">
                <div class="format-chip-header">
                  <strong>WebP</strong>
                  <span class="format-chip-badge">Next-Gen</span>
                </div>
                <span>Ultra-Compressed</span>
              </button>
            </div>
          </div>

          <!-- Primary Download Button -->
          <button type="button" class="btn-primary sheet-primary-download-btn" id="btnSheetDownload" aria-label="Download image in selected format">
            <span aria-hidden="true">${icon('download', { size: 16 })}</span>
            <span id="lblSheetDownloadText">Download (${this.exportFormat.toUpperCase()} 2x)</span>
          </button>

          <!-- Secondary Actions List -->
          <div class="sheet-actions-list">
            <button type="button" class="sheet-action-item" id="btnSheetCopy" aria-label="Copy image to clipboard">
              <div class="sheet-action-icon icon-cyan" aria-hidden="true">${icon('copy', { size: 18 })}</div>
              <div class="sheet-action-info">
                <strong>Copy Image to Clipboard</strong>
                <span>Paste directly into Instagram, Twitter, LinkedIn</span>
              </div>
              <div class="sheet-action-arrow" aria-hidden="true">${icon('chevronRight', { size: 16 })}</div>
            </button>

            <button type="button" class="sheet-action-item" id="btnSheetShare" aria-label="Share quote image">
              <div class="sheet-action-icon icon-purple" aria-hidden="true">${icon('share', { size: 18 })}</div>
              <div class="sheet-action-info">
                <strong>Share Graphic</strong>
                <span>Open native device share sheet or social apps</span>
              </div>
              <div class="sheet-action-arrow" aria-hidden="true">${icon('chevronRight', { size: 16 })}</div>
            </button>

            <button type="button" class="sheet-action-item" id="btnSheetSaveHistory" aria-label="Save quote to history">
              <div class="sheet-action-icon icon-green" aria-hidden="true">${icon('bookmark', { size: 18 })}</div>
              <div class="sheet-action-info">
                <strong>Save to History Gallery</strong>
                <span>Store in local library to edit or reuse later</span>
              </div>
              <div class="sheet-action-arrow" aria-hidden="true">${icon('chevronRight', { size: 16 })}</div>
            </button>

            <button type="button" class="sheet-action-item" id="btnSheetPublish" aria-label="Publish quote to community">
              <div class="sheet-action-icon icon-amber" aria-hidden="true">${icon('globe', { size: 18 })}</div>
              <div class="sheet-action-info">
                <strong>Publish to Community Feed</strong>
                <span>Showcase design to other QuoteForge creators</span>
              </div>
              <div class="sheet-action-arrow" aria-hidden="true">${icon('chevronRight', { size: 16 })}</div>
            </button>
          </div>
        </div>
      </div>
    `;

    // Ensure mini-pip dock, rail drawer, and export sheet are attached to document.body for true global viewport floating
    ['miniPipDock', 'studioRailDrawerBackdrop', 'exportSheetBackdrop'].forEach(id => {
      const el = this.containerEl.querySelector(`#${id}`);
      if (el) {
        const existing = document.getElementById(id);
        if (existing && existing !== el) existing.remove();
        document.body.appendChild(el);
      }
    });

    this.bindEvents();
    this.scheduleRender();
  }

  bindEvents() {
    // Ratio Switcher (Synchronized between desktop & mobile compact bar)
    const setRatio = (ratio) => {
      this.state.ratio = ratio;
      this.containerEl.querySelectorAll('.ratio-chip').forEach(c => {
        const isMatch = c.dataset.ratio === ratio;
        c.classList.toggle('active', isMatch);
        c.setAttribute('aria-checked', isMatch ? 'true' : 'false');
      });
      this.containerEl.querySelectorAll('.compact-ratio-btn').forEach(c => {
        const isMatch = c.dataset.ratio === ratio;
        c.classList.toggle('active', isMatch);
        c.setAttribute('aria-checked', isMatch ? 'true' : 'false');
      });
      this.scheduleRender();
    };

    const ratioSwitcher = this.containerEl.querySelector('#ratioSwitcher');
    if (ratioSwitcher) {
      ratioSwitcher.addEventListener('click', (e) => {
        const chip = e.target.closest('.ratio-chip');
        if (!chip || !chip.dataset.ratio) return;
        setRatio(chip.dataset.ratio);
      });
    }

    const compactRatioSelector = this.containerEl.querySelector('#compactRatioSelector');
    if (compactRatioSelector) {
      compactRatioSelector.addEventListener('click', (e) => {
        const btn = e.target.closest('.compact-ratio-btn');
        if (!btn || !btn.dataset.ratio) return;
        setRatio(btn.dataset.ratio);
      });
    }

    // Layout Picker Buttons (Desktop, Mobile Card & Compact)
    this.containerEl.querySelector('#btnOpenLayouts')?.addEventListener('click', () => {
      this.layoutPicker.open(this.state.layoutId);
    });
    this.containerEl.querySelector('#btnCompactLayouts')?.addEventListener('click', () => {
      this.layoutPicker.open(this.state.layoutId);
    });
    this.containerEl.querySelector('#btnOpenLayoutsModal')?.addEventListener('click', () => {
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
      this.updateTypographyUI();
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
      this.updateTypographyUI();
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

    // Typography & Font Picker Triggers
    const btnOpenFontQuote = this.containerEl.querySelector('#btnOpenFontPickerQuote');
    const btnOpenPairings = this.containerEl.querySelector('#btnOpenPairingsStudio');
    const btnChangeQuoteFont = this.containerEl.querySelector('#btnChangeQuoteFont');
    const btnChangeAuthorFont = this.containerEl.querySelector('#btnChangeAuthorFont');

    if (btnOpenFontQuote) {
      btnOpenFontQuote.addEventListener('click', () => {
        this.fontPickerModal.open(this.state.styles.fontFamily || 'Playfair Display', 'quote', this.state.quote);
      });
    }
    if (btnOpenPairings) {
      btnOpenPairings.addEventListener('click', () => {
        this.fontPickerModal.open(this.state.styles.fontFamily || 'Playfair Display', 'quote', this.state.quote, 'pairings');
      });
    }
    if (btnChangeQuoteFont) {
      btnChangeQuoteFont.addEventListener('click', () => {
        this.fontPickerModal.open(this.state.styles.fontFamily || 'Playfair Display', 'quote', this.state.quote);
      });
    }
    if (btnChangeAuthorFont) {
      btnChangeAuthorFont.addEventListener('click', () => {
        this.fontPickerModal.open(this.state.styles.authorFontFamily || 'Plus Jakarta Sans', 'author', this.state.quote);
      });
    }

    // Typographic Micro-Controls: Text Alignment
    const typoAlignGroup = this.containerEl.querySelector('#typoAlignGroup');
    if (typoAlignGroup) {
      typoAlignGroup.addEventListener('click', (e) => {
        const btn = e.target.closest('.typo-btn');
        if (!btn || !btn.dataset.align) return;
        this.state.styles.textAlign = btn.dataset.align;
        this.updateTypographyUI();
        this.scheduleRender();
      });
    }

    // Typographic Micro-Controls: Font Weight
    const typoWeightGroup = this.containerEl.querySelector('#typoWeightGroup');
    if (typoWeightGroup) {
      typoWeightGroup.addEventListener('click', (e) => {
        const btn = e.target.closest('.typo-btn');
        if (!btn || !btn.dataset.weight) return;
        this.state.styles.fontWeight = parseInt(btn.dataset.weight, 10);
        this.updateTypographyUI();
        this.scheduleRender();
      });
    }

    // Watermark & Branding Suite Events
    const toggleWatermark = this.containerEl.querySelector('#toggleWatermark');
    const brandingBody = this.containerEl.querySelector('#brandingOptionsBody');
    if (toggleWatermark) {
      toggleWatermark.addEventListener('change', (e) => {
        this.state.showWatermark = e.target.checked;
        if (brandingBody) {
          brandingBody.style.opacity = e.target.checked ? '1' : '0.45';
          brandingBody.style.pointerEvents = e.target.checked ? 'auto' : 'none';
        }
        this.scheduleRender();
      });
    }

    const inputWatermarkText = this.containerEl.querySelector('#inputWatermarkText');
    if (inputWatermarkText) {
      inputWatermarkText.addEventListener('input', (e) => {
        this.state.watermark = e.target.value;
        this.scheduleRender();
      });
    }

    const inputBrandingHandle = this.containerEl.querySelector('#inputBrandingHandle');
    if (inputBrandingHandle) {
      inputBrandingHandle.addEventListener('input', (e) => {
        this.state.brandingHandle = e.target.value;
        this.scheduleRender();
      });
    }

    // Branding Style Selector
    const brandingStyleSelector = this.containerEl.querySelector('#brandingStyleSelector');
    if (brandingStyleSelector) {
      brandingStyleSelector.addEventListener('click', (e) => {
        const btn = e.target.closest('.branding-style-btn');
        if (!btn) return;
        brandingStyleSelector.querySelectorAll('.branding-style-btn').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-checked', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-checked', 'true');
        this.state.brandingStyle = btn.dataset.style;
        this.scheduleRender();
      });
    }

    // Branding Position Selector
    const brandingPosSelector = this.containerEl.querySelector('#brandingPosSelector');
    if (brandingPosSelector) {
      brandingPosSelector.addEventListener('click', (e) => {
        const btn = e.target.closest('.branding-pos-btn');
        if (!btn) return;
        brandingPosSelector.querySelectorAll('.branding-pos-btn').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-checked', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-checked', 'true');
        this.state.brandingPosition = btn.dataset.pos;
        this.scheduleRender();
      });
    }

    // Watermark Opacity Slider
    const sliderOpacity = this.containerEl.querySelector('#sliderBrandingOpacity');
    const lblOpacity = this.containerEl.querySelector('#lblBrandingOpacity');
    if (sliderOpacity) {
      sliderOpacity.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.state.brandingOpacity = val / 100;
        if (lblOpacity) lblOpacity.textContent = `${val}%`;
        this.scheduleRender();
      });
    }

    // Custom Logo File Uploader
    const btnUploadLogo = this.containerEl.querySelector('#btnUploadBrandingLogo');
    const inputLogoFile = this.containerEl.querySelector('#inputBrandingLogoFile');
    const btnClearLogo = this.containerEl.querySelector('#btnClearBrandingLogo');

    if (btnUploadLogo && inputLogoFile) {
      btnUploadLogo.addEventListener('click', () => inputLogoFile.click());

      inputLogoFile.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
          const dataUrl = event.target.result;
          this.state.brandingLogo = dataUrl;
          await BrandingService.saveCustomLogo(dataUrl);
          this.updateBrandingUI();
          this.scheduleRender();
          Toast.show('Custom brand logo applied & saved!', 'success');
        };
        reader.readAsDataURL(file);
      });
    }

    if (btnClearLogo) {
      btnClearLogo.addEventListener('click', async () => {
        this.state.brandingLogo = null;
        await BrandingService.clearCustomLogo();
        this.updateBrandingUI();
        this.scheduleRender();
        Toast.show('Custom logo removed', 'info');
      });
    }

    // Preset Browse
    this.containerEl.querySelector('#btnBrowsePresets').addEventListener('click', () => {
      if (this.onOpenPresets) this.onOpenPresets();
    });

    // Mobile Layout Architecture Switcher (Options A, B, C)
    const btnModeToggle = this.containerEl.querySelector('#btnMobileLayoutModeToggle');
    const modeDropdown = this.containerEl.querySelector('#compactModeDropdown');

    if (btnModeToggle && modeDropdown) {
      const toggleModeMenu = (open) => {
        const isOpen = typeof open === 'boolean' ? open : modeDropdown.hidden;
        modeDropdown.hidden = !isOpen;
        btnModeToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      };

      btnModeToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleModeMenu();
      });

      modeDropdown.querySelectorAll('.compact-mode-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const mode = item.dataset.mode;
          if (mode) {
            this.mobileEditorLayout = mode;
            this.profile.mobileEditorLayout = mode;
            StorageService.saveProfile(this.profile);
            this.applyMobileLayoutMode();
            toggleModeMenu(false);
            const modeNames = { pinned: 'Option A: Pinned Canvas', rail: 'Option B: Studio Rail & Drawer', pip: 'Option C: Floating PiP' };
            Toast.show(`Layout set to ${modeNames[mode] || mode}`, 'info');
          }
        });
      });

      document.addEventListener('click', (e) => {
        if (!modeDropdown.hidden && !modeDropdown.contains(e.target) && e.target !== btnModeToggle) {
          toggleModeMenu(false);
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modeDropdown.hidden) {
          toggleModeMenu(false);
          btnModeToggle.focus();
        }
      });
    }

    // Dynamic sticky header height synchronization
    const updateHeaderHeight = () => {
      const header = document.querySelector('.app-header');
      if (header) {
        const h = header.offsetHeight || 98;
        document.documentElement.style.setProperty('--header-height', `${h}px`);
      }
    };
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    window.addEventListener('orientationchange', updateHeaderHeight);

    // Primary Canvas Action Bar Handlers (Download & Share)
    const executeDownload = () => {
      this.saveToHistorySilent();
      ShareService.downloadImage(this.state, this.exportFormat);
      this.closeExportSheet();
    };

    const btnMainDownload = this.containerEl.querySelector('#btnMainDownload');
    if (btnMainDownload) btnMainDownload.addEventListener('click', executeDownload);

    const btnMainShare = this.containerEl.querySelector('#btnMainShare');
    if (btnMainShare) {
      btnMainShare.addEventListener('click', () => {
        this.saveToHistorySilent();
        ShareService.shareQuote(this.state);
      });
    }

    // Consolidated Export Sheet Handlers
    const btnOpenExport = this.containerEl.querySelector('#btnOpenExportSheet');
    const btnCompactExport = this.containerEl.querySelector('#btnCompactExport');
    const btnCloseExport = document.getElementById('btnCloseExportSheet');
    const exportBackdrop = document.getElementById('exportSheetBackdrop');
    const formatGrid = document.getElementById('sheetFormatGrid');
    const lblSheetDownload = document.getElementById('lblSheetDownloadText');
    const lblFormatBadge = this.containerEl.querySelector('#lblFormatBadge');

    if (btnOpenExport) btnOpenExport.addEventListener('click', () => this.openExportSheet());
    if (btnCompactExport) btnCompactExport.addEventListener('click', () => this.openExportSheet());
    if (btnCloseExport) btnCloseExport.addEventListener('click', () => this.closeExportSheet());

    if (exportBackdrop) {
      exportBackdrop.addEventListener('click', (e) => {
        if (e.target === exportBackdrop) this.closeExportSheet();
      });
    }

    if (formatGrid) {
      formatGrid.addEventListener('click', (e) => {
        const chip = e.target.closest('.export-format-chip');
        if (!chip || !chip.dataset.format) return;
        const fmt = chip.dataset.format;
        this.exportFormat = fmt;
        formatGrid.querySelectorAll('.export-format-chip').forEach(c => {
          const isMatch = c.dataset.format === fmt;
          c.classList.toggle('active', isMatch);
          c.setAttribute('aria-checked', isMatch ? 'true' : 'false');
        });
        if (lblSheetDownload) {
          lblSheetDownload.textContent = `Download (${fmt.toUpperCase()} 2x)`;
        }
        if (lblFormatBadge) {
          lblFormatBadge.textContent = `${fmt.toUpperCase()} 2x`;
        }
        Toast.show(`Format set to ${fmt.toUpperCase()}`, 'info');
      });
    }

    const btnQuickDownload = this.containerEl.querySelector('#btnQuickDownload');
    if (btnQuickDownload) btnQuickDownload.addEventListener('click', executeDownload);

    const btnSheetDownload = document.getElementById('btnSheetDownload');
    if (btnSheetDownload) btnSheetDownload.addEventListener('click', executeDownload);

    const btnSheetCopy = document.getElementById('btnSheetCopy');
    if (btnSheetCopy) {
      btnSheetCopy.addEventListener('click', () => {
        this.saveToHistorySilent();
        ShareService.copyImageToClipboard(this.state);
        this.closeExportSheet();
      });
    }

    const btnSheetShare = document.getElementById('btnSheetShare');
    if (btnSheetShare) {
      btnSheetShare.addEventListener('click', () => {
        this.saveToHistorySilent();
        ShareService.shareQuote(this.state);
        this.closeExportSheet();
      });
    }

    const btnSheetSaveHistory = document.getElementById('btnSheetSaveHistory');
    if (btnSheetSaveHistory) {
      btnSheetSaveHistory.addEventListener('click', () => {
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
          watermark: this.state.watermark,
          showWatermark: this.state.showWatermark,
          brandingStyle: this.state.brandingStyle,
          brandingPosition: this.state.brandingPosition,
          brandingOpacity: this.state.brandingOpacity,
          brandingLogo: this.state.brandingLogo,
          brandingHandle: this.state.brandingHandle,
          presetId: this.activePreset.id,
          styles: { ...this.state.styles }
        });
        if (this.onSaveHistory) this.onSaveHistory(saved);
        Toast.show('Saved to History gallery!', 'success');
        this.closeExportSheet();
      });
    }

    const btnSheetPublish = document.getElementById('btnSheetPublish');
    if (btnSheetPublish) {
      btnSheetPublish.addEventListener('click', () => {
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
            watermark: this.state.watermark,
            showWatermark: this.state.showWatermark,
            brandingStyle: this.state.brandingStyle,
            brandingPosition: this.state.brandingPosition,
            brandingOpacity: this.state.brandingOpacity,
            brandingLogo: this.state.brandingLogo,
            brandingHandle: this.state.brandingHandle,
            presetId: this.activePreset.id,
            styles: { ...this.state.styles }
          },
          this.profile
        );
        if (published) {
          Toast.show('Published quote to Community Feed!', 'success');
          if (this.onQuotePublished) this.onQuotePublished(published);
        }
        this.closeExportSheet();
      });
    }

    // Option B: Studio Rail Bar & Drawer Handlers
    const railBar = this.containerEl.querySelector('#studioRailBar');
    if (railBar) {
      railBar.addEventListener('click', (e) => {
        const item = e.target.closest('.studio-rail-item');
        if (!item || !item.dataset.rail) return;
        const cat = item.dataset.rail;
        if (cat === 'themes') {
          if (this.onOpenPresets) this.onOpenPresets();
          return;
        }
        if (cat === 'layout') {
          this.layoutPicker.open(this.state.layoutId);
          return;
        }
        this.activeRailCategory = cat;
        railBar.querySelectorAll('.studio-rail-item').forEach(i => i.classList.toggle('active', i.dataset.rail === cat));
        this.openRailDrawer(cat);
      });
    }

    const btnCloseRail = document.getElementById('btnCloseRailDrawer');
    if (btnCloseRail) btnCloseRail.addEventListener('click', () => this.closeRailDrawer());

    const railBackdrop = document.getElementById('studioRailDrawerBackdrop');
    if (railBackdrop) {
      railBackdrop.addEventListener('click', (e) => {
        if (e.target === railBackdrop) this.closeRailDrawer();
      });
    }

    // Option C: Floating PiP Dock Handlers
    const pipDock = document.getElementById('miniPipDock');
    const btnPipScrollUp = document.getElementById('btnPipScrollUp');
    const scrollToCanvas = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    if (pipDock) pipDock.addEventListener('click', scrollToCanvas);
    if (btnPipScrollUp) {
      btnPipScrollUp.addEventListener('click', (e) => {
        e.stopPropagation();
        scrollToCanvas();
      });
    }

    // Apply initial mobile layout mode
    this.applyMobileLayoutMode();
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
    const layout = LAYOUT_STYLES.find(l => l.id === this.state.layoutId) || LAYOUT_STYLES[0];
    const lbl = this.containerEl.querySelector('#lblActiveLayout');
    const compactLbl = this.containerEl.querySelector('#lblCompactLayoutName');
    const toolsName = this.containerEl.querySelector('#lblToolsLayoutName');
    const toolsCategory = this.containerEl.querySelector('#lblToolsLayoutCategory');

    if (lbl) {
      lbl.textContent = `Layout: ${layout.name}`;
    }
    if (compactLbl) {
      compactLbl.textContent = layout.name.split(' ')[0];
    }
    if (toolsName) {
      toolsName.textContent = layout.name;
    }
    if (toolsCategory) {
      toolsCategory.textContent = `${layout.category || 'Editorial & Social'} • ${layout.portraitPlacement !== 'none' ? 'With Portrait' : 'Minimal'}`;
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
      watermark: this.state.watermark,
      showWatermark: this.state.showWatermark,
      brandingStyle: this.state.brandingStyle,
      brandingPosition: this.state.brandingPosition,
      brandingOpacity: this.state.brandingOpacity,
      brandingLogo: this.state.brandingLogo,
      brandingHandle: this.state.brandingHandle,
      presetId: this.activePreset.id,
      styles: { ...this.state.styles }
    });
  }

  updateBrandingUI() {
    const inputWatermarkText = this.containerEl.querySelector('#inputWatermarkText');
    const inputBrandingHandle = this.containerEl.querySelector('#inputBrandingHandle');
    const sliderOpacity = this.containerEl.querySelector('#sliderBrandingOpacity');
    const lblOpacity = this.containerEl.querySelector('#lblBrandingOpacity');
    const thumbBox = this.containerEl.querySelector('#brandingLogoThumb');
    const statusText = this.containerEl.querySelector('#lblLogoStatus');
    const toggleWatermark = this.containerEl.querySelector('#toggleWatermark');
    const brandingBody = this.containerEl.querySelector('#brandingOptionsBody');

    if (toggleWatermark) toggleWatermark.checked = this.state.showWatermark;
    if (brandingBody) {
      brandingBody.style.opacity = this.state.showWatermark ? '1' : '0.45';
      brandingBody.style.pointerEvents = this.state.showWatermark ? 'auto' : 'none';
    }
    if (inputWatermarkText) inputWatermarkText.value = this.state.watermark || '';
    if (inputBrandingHandle) inputBrandingHandle.value = this.state.brandingHandle || '';
    if (sliderOpacity) sliderOpacity.value = Math.round(this.state.brandingOpacity * 100);
    if (lblOpacity) lblOpacity.textContent = `${Math.round(this.state.brandingOpacity * 100)}%`;

    if (thumbBox) {
      thumbBox.innerHTML = this.state.brandingLogo 
        ? `<img src="${this.state.brandingLogo}" alt="Custom brand logo" />` 
        : icon('image', { size: 18 });
    }
    if (statusText) {
      statusText.textContent = this.state.brandingLogo ? 'Custom Logo Active' : 'No Logo Uploaded';
    }

    const styleSelector = this.containerEl.querySelector('#brandingStyleSelector');
    if (styleSelector) {
      styleSelector.querySelectorAll('.branding-style-btn').forEach(b => {
        const isMatch = b.dataset.style === this.state.brandingStyle;
        b.classList.toggle('active', isMatch);
        b.setAttribute('aria-checked', isMatch ? 'true' : 'false');
      });
    }

    const posSelector = this.containerEl.querySelector('#brandingPosSelector');
    if (posSelector) {
      posSelector.querySelectorAll('.branding-pos-btn').forEach(b => {
        const isMatch = b.dataset.pos === this.state.brandingPosition;
        b.classList.toggle('active', isMatch);
        b.setAttribute('aria-checked', isMatch ? 'true' : 'false');
      });
    }
  }

  updateTypographyUI() {
    const quoteFont = this.state.styles.fontFamily || 'Playfair Display';
    const authorFont = this.state.styles.authorFontFamily || 'Plus Jakarta Sans';
    const quoteStack = FontLoaderService.getFallbackStack(quoteFont);
    const authorStack = FontLoaderService.getFallbackStack(authorFont);

    const lblQuote = this.containerEl.querySelector('#lblQuoteFontName');
    const lblAuthor = this.containerEl.querySelector('#lblAuthorFontName');
    const sampleQuote = this.containerEl.querySelector('#lblQuoteFontSample');
    const sampleAuthor = this.containerEl.querySelector('#lblAuthorFontSample');

    if (lblQuote) {
      lblQuote.textContent = quoteFont;
      lblQuote.style.fontFamily = quoteStack;
    }
    if (lblAuthor) {
      lblAuthor.textContent = authorFont;
      lblAuthor.style.fontFamily = authorStack;
    }
    if (sampleQuote) {
      sampleQuote.style.fontFamily = quoteStack;
      sampleQuote.textContent = `“${this.state.quote ? (this.state.quote.length > 32 ? this.state.quote.slice(0, 30) + '…' : this.state.quote) : 'Typography Preview'}”`;
    }
    if (sampleAuthor) {
      sampleAuthor.style.fontFamily = authorStack;
      sampleAuthor.textContent = `— ${this.state.author || 'Author Signature'}`;
    }

    // Sync Text Alignment Buttons
    const alignGroup = this.containerEl.querySelector('#typoAlignGroup');
    if (alignGroup) {
      const activeAlign = this.state.styles.textAlign || 'center';
      alignGroup.querySelectorAll('.typo-btn').forEach(btn => {
        const isMatch = btn.dataset.align === activeAlign;
        btn.classList.toggle('active', isMatch);
        btn.setAttribute('aria-checked', isMatch ? 'true' : 'false');
      });
    }

    // Sync Font Weight Buttons
    const weightGroup = this.containerEl.querySelector('#typoWeightGroup');
    if (weightGroup) {
      const activeWeight = String(this.state.styles.fontWeight || 600);
      weightGroup.querySelectorAll('.typo-btn').forEach(btn => {
        const isMatch = btn.dataset.weight === activeWeight;
        btn.classList.toggle('active', isMatch);
        btn.setAttribute('aria-checked', isMatch ? 'true' : 'false');
      });
    }
  }

  syncFormValues() {
    const author = this.containerEl.querySelector('#inputAuthor');
    const handle = this.containerEl.querySelector('#inputHandle');
    const cat = this.containerEl.querySelector('#inputCategory');
    const date = this.containerEl.querySelector('#inputDate');
    const toggleAuthor = this.containerEl.querySelector('#toggleAuthor');
    const toggleDate = this.containerEl.querySelector('#toggleDate');
    const toggleCat = this.containerEl.querySelector('#toggleCategory');

    if (author) author.value = this.state.author;
    if (handle) handle.value = this.state.handle;
    if (cat) cat.value = this.state.category;
    if (date) date.value = this.state.date;
    if (toggleAuthor) toggleAuthor.checked = this.state.showAuthor;
    if (toggleDate) toggleDate.checked = this.state.showDate;
    if (toggleCat) toggleCat.checked = this.state.showCategory;

    this.updateBrandingUI();
    this.updateTypographyUI();
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

    const pipCanvas = document.getElementById('miniPipCanvas');
    const pipDock = document.getElementById('miniPipDock');
    if (pipCanvas && (this.mobileEditorLayout === 'pip' || (pipDock && pipDock.classList.contains('pip-active')))) {
      await CanvasRenderer.renderToCanvas(this.state, pipCanvas);
    }
  }

  openExportSheet() {
    const backdrop = document.getElementById('exportSheetBackdrop');
    if (backdrop) {
      backdrop.hidden = false;
      this.isExportSheetOpen = true;
    }
  }

  closeExportSheet() {
    const backdrop = document.getElementById('exportSheetBackdrop');
    if (backdrop) {
      backdrop.hidden = true;
      this.isExportSheetOpen = false;
    }
  }

  openRailDrawer(category) {
    const backdrop = document.getElementById('studioRailDrawerBackdrop');
    const slot = document.getElementById('railDrawerBodySlot');
    const titleText = document.getElementById('lblRailDrawerText');
    const titleIcon = document.getElementById('lblRailDrawerIcon');
    if (!backdrop || !slot) return;

    // Restore any previously docked card
    this.restoreRailCard();

    const titles = {
      layout: { label: 'Canvas Layout (50 Layouts)', icon: 'layout' },
      typography: { label: 'Typography & Google Fonts', icon: 'type' },
      content: { label: 'Quote Content & Copy', icon: 'quote' },
      portrait: { label: 'Author Portrait & Cutout', icon: 'user' },
      metadata: { label: 'Details & Metadata', icon: 'settings' },
      branding: { label: 'Watermark & Branding Suite', icon: 'shield' }
    };

    const info = titles[category] || { label: 'Card Settings', icon: 'settings' };
    if (titleText) titleText.textContent = info.label;
    if (titleIcon) titleIcon.innerHTML = icon(info.icon, { size: 16 });

    const card = this.containerEl.querySelector(`.control-card[data-rail-section="${category}"]`);
    if (card) {
      const anchor = document.createElement('div');
      anchor.className = 'rail-card-anchor';
      anchor.id = `railCardAnchor_${category}`;
      card.parentNode.insertBefore(anchor, card);

      this.currentRailDockedCard = { card, anchor, category };
      slot.appendChild(card);
      backdrop.hidden = false;
    }
  }

  restoreRailCard() {
    if (this.currentRailDockedCard) {
      const { card, anchor } = this.currentRailDockedCard;
      if (anchor && anchor.parentNode && card) {
        anchor.parentNode.insertBefore(card, anchor);
        anchor.remove();
      }
      this.currentRailDockedCard = null;
    }
  }

  closeRailDrawer() {
    const backdrop = document.getElementById('studioRailDrawerBackdrop');
    if (backdrop) backdrop.hidden = true;
    this.restoreRailCard();
    const railBar = this.containerEl.querySelector('#studioRailBar');
    if (railBar) {
      railBar.querySelectorAll('.studio-rail-item').forEach(i => i.classList.remove('active'));
    }
  }

  applyMobileLayoutMode() {
    const mode = this.mobileEditorLayout || 'pinned';

    this.containerEl.classList.remove('mobile-layout-pinned', 'mobile-layout-rail', 'mobile-layout-pip');
    this.containerEl.classList.add(`mobile-layout-${mode}`);

    const modeLabel = this.containerEl.querySelector('#lblCurrentMobileLayoutMode');
    if (modeLabel) {
      modeLabel.textContent = mode === 'rail' ? 'Rail' : (mode === 'pip' ? 'PiP' : 'Pinned');
    }

    const dropdown = this.containerEl.querySelector('#compactModeDropdown');
    if (dropdown) {
      dropdown.querySelectorAll('.compact-mode-item').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
      });
    }

    if (mode !== 'rail') {
      this.closeRailDrawer();
    }

    const pipDock = document.getElementById('miniPipDock');
    if (mode === 'pip') {
      this.initPipObserver();
      const stage = this.containerEl.querySelector('#canvasStageWrapper');
      if (stage && pipDock) {
        const rect = stage.getBoundingClientRect();
        const isOffscreen = rect.bottom < 120;
        pipDock.classList.toggle('pip-active', isOffscreen);
        if (isOffscreen) {
          const pipCanvas = document.getElementById('miniPipCanvas');
          if (pipCanvas) CanvasRenderer.renderToCanvas(this.state, pipCanvas);
        }
      }
      this.scheduleRender();
    } else {
      if (pipDock) pipDock.classList.remove('pip-active');
    }
  }

  initPipObserver() {
    const stage = this.containerEl.querySelector('#canvasStageWrapper');
    const pipDock = document.getElementById('miniPipDock');
    if (!stage || !pipDock) return;

    if (this.pipObserver) {
      this.pipObserver.disconnect();
      this.pipObserver = null;
    }

    this.pipObserver = new IntersectionObserver((entries) => {
      if (this.mobileEditorLayout !== 'pip') {
        pipDock.classList.remove('pip-active');
        return;
      }
      entries.forEach(entry => {
        const isOffscreen = !entry.isIntersecting;
        pipDock.classList.toggle('pip-active', isOffscreen);
        if (isOffscreen) {
          const pipCanvas = document.getElementById('miniPipCanvas');
          if (pipCanvas) {
            CanvasRenderer.renderToCanvas(this.state, pipCanvas);
          }
        }
      });
    }, { threshold: 0.15 });

    this.pipObserver.observe(stage);
  }
}
