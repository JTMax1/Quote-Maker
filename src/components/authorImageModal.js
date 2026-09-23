/**
 * Upgraded Author Image Studio & In-Browser Background Remover Modal
 * Features:
 * - 50 Portrait Placements across Cutouts, Avatars, Geometric Portals, and Environmental Blends
 * - Boundary-Safe Flood-Fill Background Remover (never chops into subject body)
 * - Click-To-Pick Eye-Dropper sampling directly on canvas
 */

import { PORTRAIT_PLACEMENTS } from '../data/defaultPresets.js';
import { PRESET_AUTHOR_PORTRAITS } from '../data/authorCutouts.js';
import { BgRemoverService } from '../services/bgRemoverService.js';
import { dbService } from '../services/dbService.js';
import { Toast } from './toast.js';
import { escapeHtml } from '../utils/security.js';
import { icon } from '../utils/icons.js';

export class AuthorImageModal {
  constructor(onApplyAuthorImage) {
    this.onApplyAuthorImage = onApplyAuthorImage;
    this.currentImage = null;
    this.processedDataUrl = null;
    this.currentImageSrc = null;
    this.previewImgCache = null;
    this.selectedPlacement = 'cutout-right';
    this.tolerance = 32;
    this.feather = 2;
    this.pickedColor = null;

    this.activeTab = 'remover'; // 'remover' | 'placements'

    this.modalEl = null;
    this.render();
  }

  render() {
    const existing = document.getElementById('authorImageModal');
    if (existing) existing.remove();

    this.modalEl = document.createElement('div');
    this.modalEl.id = 'authorImageModal';
    this.modalEl.className = 'modal-backdrop';
    this.modalEl.setAttribute('role', 'dialog');
    this.modalEl.setAttribute('aria-modal', 'true');
    this.modalEl.setAttribute('aria-label', 'Author Portrait & Background Remover Studio');

    this.modalEl.innerHTML = `
      <div class="onboarding-card author-modal-card" style="max-width: 920px; max-height: 90vh; display: flex; flex-direction: column;">
        <!-- Header -->
        <div class="stepper-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-glass); padding-bottom: 0.85rem;">
          <div>
            <h2 style="font-size: 1.25rem; font-weight: 700; font-family: var(--font-display); margin: 0;">Author Portrait Studio</h2>
            <p style="font-size: 0.82rem; color: var(--text-secondary); margin: 0.2rem 0 0 0;">Isolate subject portraits and select from 100 precise canvas placements.</p>
          </div>
          <button class="btn-glass modal-close-btn" id="btnCloseAuthorModal" style="padding: 0.4rem 0.65rem;" aria-label="Close author studio">
            ${icon('x', { size: 16 })}
          </button>
        </div>

        <!-- Modal Sub-Tabs (P2-2: Eliminates nested scroll touch-traps) -->
        <div style="display: flex; gap: 0.5rem; padding: 0.75rem 1.5rem 0.25rem 1.5rem; border-bottom: 1px solid var(--border-glass); background: var(--bg-surface-elevated);" role="tablist" aria-label="Author Studio Sections">
          <button class="tab-btn ${this.activeTab === 'remover' ? 'active' : ''}" id="tabBtnRemover" role="tab" aria-selected="${this.activeTab === 'remover'}" aria-label="Background Remover Studio" style="font-size: 0.84rem; padding: 0.4rem 1rem;">
            <span>${icon('scissors', { size: 14 })}</span>
            <span>Background Remover</span>
          </button>
          <button class="tab-btn ${this.activeTab === 'placements' ? 'active' : ''}" id="tabBtnPlacements" role="tab" aria-selected="${this.activeTab === 'placements'}" aria-label="Portrait Placements (${PORTRAIT_PLACEMENTS.length} options)" style="font-size: 0.84rem; padding: 0.4rem 1rem;">
            <span>${icon('layout', { size: 14 })}</span>
            <span>Placements</span>
            <span class="tab-badge" id="placementsBadgeCount" style="background: var(--brand-primary); font-size: 0.68rem; margin-left: 0.25rem;">${PORTRAIT_PLACEMENTS.length}</span>
          </button>
        </div>

        <!-- Body (Single unified scroll container) -->
        <div class="step-body" style="flex: 1; overflow-y: auto; gap: 1.25rem; padding: 1.5rem;">
          <!-- TAB 1: Background Remover & Upload -->
          <div id="authorTabPaneRemover" style="display: ${this.activeTab === 'remover' ? 'flex' : 'none'}; flex-direction: column; gap: 1.25rem;">
            <!-- Top Section: Upload Author Photo -->
            <div class="format-card" id="uploadDropZone" style="align-items: center; text-align: center; border-style: dashed; padding: 1.5rem; justify-content: center; cursor: pointer; background: var(--bg-surface-elevated); border: 2px dashed var(--border-glass); border-radius: var(--radius-md); transition: all 0.2s ease;">
              <span style="display: flex; justify-content: center; margin-bottom: 0.35rem; color: var(--brand-accent);" aria-hidden="true">${icon('camera', { size: 36 })}</span>
              <div style="font-size: 1rem; font-weight: 700;">Upload Author Portrait or Subject Photo</div>
              <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.2rem;">Drag & drop image here, or browse files (PNG, JPG, WebP)</div>
              <input type="file" id="authorFileInput" accept="image/*" style="display: none;" aria-label="Upload author photo" />
              <button class="btn-glass" id="btnTriggerUpload" style="margin-top: 0.75rem; font-size: 0.82rem; padding: 0.45rem 1.1rem;" aria-label="Browse image files">
                ${icon('upload', { size: 14 })} Browse Image File
              </button>
            </div>

            <!-- Intelligent Background Remover Workbench -->
            <div class="remover-workbench-grid" style="background: var(--bg-surface-elevated); border-radius: var(--radius-md); padding: 1.25rem; border: 1px solid var(--border-glass);">
              <!-- Interactive Canvas Preview -->
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; background: repeating-conic-gradient(#27272a 0% 25%, #18181b 0% 50%) 50% / 16px 16px; border-radius: var(--radius-sm); min-height: 220px; max-height: 240px; overflow: hidden; border: 1px solid var(--border-glass); position: relative;">
                <canvas id="bgRemoverPreviewCanvas" style="max-width: 100%; max-height: 220px; object-fit: contain; cursor: crosshair;" title="Click anywhere on canvas to sample background color!"></canvas>
                <div style="position: absolute; bottom: 6px; left: 6px; font-size: 0.68rem; background: rgba(0,0,0,0.7); padding: 0.2rem 0.5rem; border-radius: 4px; color: #cbd5e1; display: flex; align-items: center; gap: 0.3rem;">
                  ${icon('info', { size: 12 })} Click canvas backdrop to eye-drop color
                </div>
              </div>

              <!-- Remover Controls -->
              <div style="display: flex; flex-direction: column; justify-content: space-between; gap: 0.75rem;">
                <div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                    <label for="sliderTolerance" class="form-label">Edge-Safe Tolerance</label>
                    <span style="font-size: 0.78rem; font-weight: 700; color: var(--brand-primary);" id="lblTolerance">${this.tolerance}%</span>
                  </div>
                  <input type="range" id="sliderTolerance" min="5" max="80" value="${this.tolerance}" aria-label="Edge-Safe Tolerance" style="width: 100%; accent-color: var(--brand-primary);" />
                  <span style="font-size: 0.7rem; color: var(--text-muted); display: block; margin-top: 0.2rem;">Boundary flood fill protects clothes & skin from being erased.</span>
                </div>

                <div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                    <label for="sliderFeather" class="form-label">Contour Smoothing</label>
                    <span style="font-size: 0.78rem; font-weight: 700; color: var(--brand-accent);" id="lblFeather">${this.feather}px</span>
                  </div>
                  <input type="range" id="sliderFeather" min="0" max="6" value="${this.feather}" aria-label="Contour Smoothing Feather" style="width: 100%; accent-color: var(--brand-accent);" />
                </div>

                <div style="display: flex; gap: 0.5rem;">
                  <button class="btn-accent" id="btnExecuteBgRemove" style="flex: 1; justify-content: center; font-size: 0.85rem; padding: 0.55rem 1rem;" aria-label="Execute background removal">
                    <span>${icon('scissors', { size: 14 })}</span>
                    <span>Remove Background</span>
                  </button>
                  <button class="btn-glass" id="btnResetPhoto" style="font-size: 0.85rem; padding: 0.55rem 0.85rem;" title="Reset original photo" aria-label="Reset original photo">
                    <span>${icon('rotateCcw', { size: 14 })}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 2: Canvas Placements (Interactive Live Placement Preview) -->
          <div id="authorTabPanePlacements" style="display: ${this.activeTab === 'placements' ? 'flex' : 'none'}; flex-direction: column; gap: 0.85rem;">
            <!-- Interactive Live Mockup Card -->
            <div class="placement-preview-panel" style="background: var(--bg-surface-elevated); border: 1px solid var(--border-glass); border-radius: var(--radius-md); padding: 0.85rem; display: flex; flex-direction: column; gap: 0.65rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                <div style="display: flex; align-items: center; gap: 0.4rem;">
                  <span style="font-size: 0.88rem; font-weight: 700; color: var(--text-primary);">Active Placement:</span>
                  <span style="font-size: 0.88rem; color: var(--brand-primary); font-weight: 700;" id="lblCurrentPlacementName">${this.selectedPlacement}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span class="tab-badge" id="lblPlacementTypeBadge" style="background: rgba(99,102,241,0.2); color: var(--brand-primary); border: 1px solid rgba(99,102,241,0.3); font-size: 0.72rem; padding: 0.2rem 0.6rem;">cutout</span>
                  <span style="font-size: 0.75rem; color: var(--text-muted);">Click any option to preview</span>
                </div>
              </div>

              <!-- Interactive Mockup Stage Canvas -->
              <div style="width: 100%; height: 210px; background: radial-gradient(circle at center, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.95) 100%); border-radius: var(--radius-sm); border: 1px solid var(--border-glass); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; box-shadow: var(--shadow-sm);">
                <canvas id="placementMockupCanvas" width="420" height="210" style="max-width: 100%; max-height: 210px; object-fit: contain;"></canvas>
              </div>
            </div>

            <!-- Placement Cards Grid (Flows with main modal scroll) -->
            <div class="option-chips-grid" id="placementOptionsGrid" style="grid-template-columns: repeat(auto-fill, minmax(185px, 1fr)); gap: 0.55rem;">
              ${PORTRAIT_PLACEMENTS.map(p => `
                <button class="option-chip-btn placement-option-chip ${this.selectedPlacement === p.id ? 'active' : ''}" data-place="${p.id}" aria-label="Select placement: ${p.label} (${p.type})">
                  <div class="placement-chip-label">
                    ${p.id === 'none' ? `<span style="color: var(--text-muted);">${icon('slash', { size: 13 })}</span>` : ''}
                    <span>${p.label}</span>
                  </div>
                  <span class="placement-chip-badge">${p.type}</span>
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="stepper-footer" style="border-top: 1px solid var(--border-glass); padding: 1rem 1.5rem;">
          <button class="btn-glass" id="btnClearAuthorImage" aria-label="Clear active author portrait">
            ${icon('trash', { size: 14 })} Remove Photo
          </button>
          <div style="display: flex; gap: 0.75rem;">
            <button class="btn-glass" id="btnCancelAuthorModal" aria-label="Cancel portrait modal">Cancel</button>
            <button class="btn-primary" id="btnApplyAuthorImage" aria-label="Apply portrait and placement settings">
              ${icon('check', { size: 16 })} Apply Portrait & Placement
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modalEl);
    this.bindEvents();
  }

  bindEvents() {
    this.modalEl.querySelector('#btnCloseAuthorModal').addEventListener('click', () => this.close());
    this.modalEl.querySelector('#btnCancelAuthorModal').addEventListener('click', () => this.close());

    // Tab Switching
    const tabBtnRemover = this.modalEl.querySelector('#tabBtnRemover');
    const tabBtnPlacements = this.modalEl.querySelector('#tabBtnPlacements');
    const paneRemover = this.modalEl.querySelector('#authorTabPaneRemover');
    const panePlacements = this.modalEl.querySelector('#authorTabPanePlacements');

    const switchModalTab = (tab) => {
      this.activeTab = tab;
      tabBtnRemover.classList.toggle('active', tab === 'remover');
      tabBtnRemover.setAttribute('aria-selected', tab === 'remover' ? 'true' : 'false');
      tabBtnPlacements.classList.toggle('active', tab === 'placements');
      tabBtnPlacements.setAttribute('aria-selected', tab === 'placements' ? 'true' : 'false');

      paneRemover.style.display = tab === 'remover' ? 'flex' : 'none';
      panePlacements.style.display = tab === 'placements' ? 'flex' : 'none';

      if (tab === 'placements') {
        this.renderPlacementPreview();
      }
    };

    tabBtnRemover.addEventListener('click', () => switchModalTab('remover'));
    tabBtnPlacements.addEventListener('click', () => switchModalTab('placements'));

    // Backdrop click dismiss
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.close();
    });

    // Keyboard navigation: Escape to dismiss, Tab trapping
    this.modalEl.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        this.close();
        return;
      }
      if (e.key === 'Tab') {
        const focusables = Array.from(this.modalEl.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )).filter(el => el.offsetParent !== null);
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    // File Upload
    const fileInput = this.modalEl.querySelector('#authorFileInput');
    const triggerUpload = this.modalEl.querySelector('#btnTriggerUpload');
    const dropZone = this.modalEl.querySelector('#uploadDropZone');

    triggerUpload.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('click', (e) => {
      if (e.target !== triggerUpload) fileInput.click();
    });

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      Toast.show('Loading author image...', 'info');
      try {
        const loaded = await BgRemoverService.loadImage(file);
        this.currentImage = loaded;
        this.processedDataUrl = null;
        this.drawPreview(loaded);
        Toast.show('Photo loaded! Click "Remove Background".', 'success');
      } catch (err) {
        Toast.show('Failed to load image file', 'error');
      }
    });

    // Drag and drop upload support
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = 'var(--brand-primary)';
    });
    dropZone.addEventListener('dragleave', () => {
      dropZone.style.borderColor = 'var(--border-glass)';
    });
    dropZone.addEventListener('drop', async (e) => {
      e.preventDefault();
      dropZone.style.borderColor = 'var(--border-glass)';
      const file = e.dataTransfer?.files?.[0];
      if (!file) return;

      Toast.show('Loading author image...', 'info');
      try {
        const loaded = await BgRemoverService.loadImage(file);
        this.currentImage = loaded;
        this.processedDataUrl = null;
        this.drawPreview(loaded);
        Toast.show('Photo loaded! Click "Remove Background".', 'success');
      } catch (err) {
        Toast.show('Failed to load image file', 'error');
      }
    });

    // Eye-dropper click on preview canvas with true coordinate scaling
    const canvas = this.modalEl.querySelector('#bgRemoverPreviewCanvas');
    canvas.addEventListener('click', (e) => {
      if (!this.currentImage) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / (rect.width || 280);
      const scaleY = canvas.height / (rect.height || 220);
      const x = Math.max(0, Math.min(canvas.width - 1, Math.floor((e.clientX - rect.left) * scaleX)));
      const y = Math.max(0, Math.min(canvas.height - 1, Math.floor((e.clientY - rect.top) * scaleY)));
      const ctx = canvas.getContext('2d');
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      if (pixel[3] < 15) {
        Toast.show('Clicked outside photo area; please click on the background backdrop.', 'info');
        return;
      }
      this.pickedColor = { r: pixel[0], g: pixel[1], b: pixel[2] };
      Toast.show(`Sampled background color rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})!`, 'info');
      this.executeBackgroundRemoval();
    });

    // Sliders
    const sliderTol = this.modalEl.querySelector('#sliderTolerance');
    const lblTol = this.modalEl.querySelector('#lblTolerance');
    const sliderFeather = this.modalEl.querySelector('#sliderFeather');
    const lblFeather = this.modalEl.querySelector('#lblFeather');

    sliderTol.addEventListener('input', (e) => {
      this.tolerance = parseInt(e.target.value, 10);
      lblTol.textContent = `${this.tolerance}%`;
    });

    sliderFeather.addEventListener('input', (e) => {
      this.feather = parseInt(e.target.value, 10);
      lblFeather.textContent = `${this.feather}px`;
    });

    // Remove background button
    this.modalEl.querySelector('#btnExecuteBgRemove').addEventListener('click', () => {
      this.executeBackgroundRemoval();
    });

    // Reset button
    this.modalEl.querySelector('#btnResetPhoto').addEventListener('click', () => {
      if (this.currentImage) {
        this.processedDataUrl = null;
        this.drawPreview(this.currentImage);
        Toast.show('Reset to original photo', 'info');
      }
    });

    // Placement selector
    const placeGrid = this.modalEl.querySelector('#placementOptionsGrid');
    const lblPlacement = this.modalEl.querySelector('#lblCurrentPlacementName');

    placeGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.option-chip-btn');
      if (!btn) return;
      placeGrid.querySelectorAll('.option-chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.selectedPlacement = btn.dataset.place;
      const found = PORTRAIT_PLACEMENTS.find(p => p.id === this.selectedPlacement);
      if (lblPlacement && found) lblPlacement.textContent = found.label;
      this.renderPlacementPreview();
    });

    // Clear photo
    this.modalEl.querySelector('#btnClearAuthorImage').addEventListener('click', () => {
      this.currentImage = null;
      this.processedDataUrl = null;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (this.onApplyAuthorImage) {
        this.onApplyAuthorImage({
          showAuthorImage: false,
          authorImage: null,
          authorImagePlacement: 'none'
        });
      }
      Toast.show('Author image removed', 'info');
      this.close();
    });

    // Apply button
    this.modalEl.querySelector('#btnApplyAuthorImage').addEventListener('click', () => {
      if (this.selectedPlacement === 'none') {
        if (this.onApplyAuthorImage) {
          this.onApplyAuthorImage({
            showAuthorImage: false,
            authorImage: null,
            authorImagePlacement: 'none'
          });
        }
        Toast.show('Author portrait disabled (None)', 'info');
        this.close();
        return;
      }

      const finalImage = this.processedDataUrl || (this.currentImage ? (this.currentImage.src || this.currentImage) : null);

      if (finalImage) {
        dbService.saveImage('author_portrait_active', finalImage).catch(() => {});
      }

      if (this.onApplyAuthorImage) {
        this.onApplyAuthorImage({
          showAuthorImage: !!finalImage,
          authorImage: finalImage,
          authorImagePlacement: this.selectedPlacement
        });
      }
      Toast.show(`Applied portrait with "${this.selectedPlacement}" placement!`, 'success');
      this.close();
    });
  }

  async executeBackgroundRemoval() {
    if (!this.currentImage) {
      Toast.show('Please upload or select an image first', 'info');
      return;
    }
    Toast.show('Running edge-safe background removal...', 'info');
    try {
      if (this.lastResult) {
        BgRemoverService.revokeResult(this.lastResult);
      }
      const result = await BgRemoverService.removeBackground(this.currentImage, {
        tolerance: this.tolerance,
        feather: this.feather,
        pickedColor: this.pickedColor
      });
      this.lastResult = result;
      this.processedDataUrl = result.objectUrl || result.dataUrl;
      const img = await BgRemoverService.loadImage(this.processedDataUrl);
      this.drawPreview(img);
      Toast.show('Background removed! Subject protected.', 'success');
    } catch (err) {
      console.error(err);
      Toast.show('Background removal error', 'error');
    }
  }



  drawPreview(img) {
    const canvas = this.modalEl.querySelector('#bgRemoverPreviewCanvas');
    if (!canvas || !img) return;

    canvas.width = 280;
    canvas.height = 220;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const imgRatio = (img.naturalWidth || img.width) / (img.naturalHeight || img.height);
    let dw = canvas.width;
    let dh = dw / imgRatio;
    if (dh > canvas.height) {
      dh = canvas.height;
      dw = dh * imgRatio;
    }

    const dx = (canvas.width - dw) / 2;
    const dy = (canvas.height - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  async renderPlacementPreview() {
    const canvas = this.modalEl.querySelector('#placementMockupCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = 420;
    const height = 210;
    canvas.width = width;
    canvas.height = height;

    const currentPlacement = this.selectedPlacement || 'cutout-right';
    const placementObj = PORTRAIT_PLACEMENTS.find(p => p.id === currentPlacement) || PORTRAIT_PLACEMENTS[0];

    const lblType = this.modalEl.querySelector('#lblPlacementTypeBadge');
    if (lblType) lblType.textContent = placementObj.type || 'placement';

    // 1. Draw Card Background
    ctx.clearRect(0, 0, width, height);
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#1e293b');
    bgGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(10, 10, width - 20, height - 20, 12);
    else ctx.rect(10, 10, width - 20, height - 20);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 2. Load preview portrait image
    const imageSrc = this.processedDataUrl || (this.currentImage?.src || this.currentImage) || this.currentImageSrc || PRESET_AUTHOR_PORTRAITS[1]?.imageUrl;
    let img = this.previewImgCache;
    if (!img || img.src !== imageSrc) {
      img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageSrc;
      await new Promise((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
      this.previewImgCache = img;
    }

    const type = placementObj.type;
    const pId = placementObj.id;

    // 3. Environmental blend placements
    if (type === 'blend' && img && img.complete && img.naturalWidth) {
      ctx.save();
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(10, 10, width - 20, height - 20, 12);
      else ctx.rect(10, 10, width - 20, height - 20);
      ctx.clip();

      if (pId === 'half-screen-left' || pId === 'scrim-split-left') {
        ctx.drawImage(img, 10, 10, (width - 20) / 2, height - 20);
      } else if (pId === 'half-screen-right' || pId === 'scrim-split-right') {
        ctx.drawImage(img, width / 2, 10, (width - 20) / 2, height - 20);
      } else if (pId === 'top-banner-strip') {
        ctx.drawImage(img, 10, 10, width - 20, 70);
      } else if (pId === 'bottom-banner-strip') {
        ctx.drawImage(img, 10, height - 70, width - 20, 60);
      } else {
        ctx.drawImage(img, 10, 10, width - 20, height - 20);
        const scrim = ctx.createLinearGradient(0, 0, 0, height);
        scrim.addColorStop(0, 'rgba(4,7,13,0.55)');
        scrim.addColorStop(1, 'rgba(4,7,13,0.92)');
        ctx.fillStyle = scrim;
        ctx.fillRect(10, 10, width - 20, height - 20);
      }
      ctx.restore();
    }

    // 4. Draw Mockup Quote Lines
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '600 13px system-ui, sans-serif';

    let textX = 30;
    const isLeft = ['cutout-left', 'cutout-edge-left', 'arch-portal-left', 'shadowbox-inset-left', 'avatar-mid-left', 'cutout-left-offset', 'cutout-diagonal-left', 'cutout-side-profile-left', 'avatar-squircle-left'].includes(pId);
    const isRight = ['cutout-right', 'cutout-edge-right', 'shadowbox-inset-right', 'avatar-mid-right', 'cutout-right-offset', 'cutout-diagonal-right', 'cutout-side-profile-right'].includes(pId);

    if (type === 'none' || pId === 'none') {
      textX = 75;
    } else if (isLeft) {
      textX = 145;
    } else if (isRight) {
      textX = 30;
    }

    ctx.fillText('"We suffer more often in', textX, 75);
    ctx.fillText('imagination than in reality."', textX, 98);
    ctx.fillStyle = 'rgba(99, 102, 241, 0.9)';
    ctx.font = '700 11px system-ui, sans-serif';
    ctx.fillText('— Seneca', textX, 126);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '400 9px system-ui, sans-serif';
    ctx.fillText('@stoicwisdom • Philosophy', textX, 142);
    ctx.restore();

    // 5. Draw Subject Portrait at exact placement coordinates
    if (img && img.complete && img.naturalWidth && type !== 'blend' && type !== 'none' && pId !== 'none') {
      ctx.save();
      if (type === 'cutout') {
        let cx = width - 130, cy = 35, cw = 110, ch = 165;
        if (isLeft) {
          cx = 25; cy = 35; cw = 110; ch = 165;
        } else if (pId.includes('bottom') || pId.includes('pedestal')) {
          cx = width / 2 - 50; cy = 80; cw = 100; ch = 120;
        } else if (pId.includes('top')) {
          cx = pId.includes('left') ? 25 : width - 110; cy = 20; cw = 85; ch = 105;
        } else if (pId.includes('hero') || pId.includes('vertical')) {
          cx = width / 2 - 45; cy = 30; cw = 90; ch = 150;
          ctx.globalAlpha = 0.45;
        }
        ctx.shadowColor = 'rgba(0,0,0,0.45)';
        ctx.shadowBlur = 12;
        ctx.drawImage(img, cx, cy, cw, ch);
      } else if (type === 'avatar') {
        let ax = width / 2, ay = 40, ar = 22;
        if (pId.includes('left')) { ax = 42; ay = 42; }
        else if (pId.includes('right')) { ax = width - 42; ay = 42; }
        else if (pId.includes('bottom') || pId.includes('footer') || pId.includes('signature')) {
          ax = textX + 10; ay = 175; ar = 16;
        } else if (pId.includes('mid-left')) { ax = 45; ay = 105; ar = 24; }
        else if (pId.includes('mid-right')) { ax = width - 45; ay = 105; ar = 24; }

        ctx.save();
        ctx.beginPath();
        ctx.arc(ax, ay, ar, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, ax - ar, ay - ar, ar * 2, ar * 2);
        ctx.restore();

        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(ax, ay, ar, 0, Math.PI * 2);
        ctx.stroke();
      } else if (type === 'frame') {
        let fx = width - 115, fy = 45, fw = 85, fh = 115;
        if (isLeft) { fx = 25; fy = 45; }
        else if (pId.includes('top')) { fx = width / 2 - 40; fy = 20; fw = 80; fh = 80; }

        ctx.save();
        ctx.beginPath();
        if (pId.includes('arch')) {
          const r = fw / 2;
          ctx.moveTo(fx, fy + fh);
          ctx.lineTo(fx, fy + r);
          ctx.arc(fx + r, fy + r, r, Math.PI, 0, false);
          ctx.lineTo(fx + fw, fy + fh);
          ctx.closePath();
        } else if (pId.includes('cameo') || pId.includes('rotunda')) {
          ctx.arc(fx + fw / 2, fy + fh / 2, Math.min(fw, fh) / 2, 0, Math.PI * 2);
        } else {
          if (ctx.roundRect) ctx.roundRect(fx, fy, fw, fh, 8);
          else ctx.rect(fx, fy, fw, fh);
        }
        ctx.clip();
        ctx.drawImage(img, fx, fy, fw, fh);
        ctx.restore();

        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (pId.includes('arch')) {
          const r = fw / 2;
          ctx.moveTo(fx, fy + fh);
          ctx.lineTo(fx, fy + r);
          ctx.arc(fx + r, fy + r, r, Math.PI, 0, false);
          ctx.lineTo(fx + fw, fy + fh);
          ctx.closePath();
        } else if (pId.includes('cameo') || pId.includes('rotunda')) {
          ctx.arc(fx + fw / 2, fy + fh / 2, Math.min(fw, fh) / 2, 0, Math.PI * 2);
        } else {
          if (ctx.roundRect) ctx.roundRect(fx, fy, fw, fh, 8);
          else ctx.rect(fx, fy, fw, fh);
        }
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  open(placement, imageUrl) {
    if (placement) {
      this.selectedPlacement = placement;
      const placeGrid = this.modalEl.querySelector('#placementOptionsGrid');
      const lblPlacement = this.modalEl.querySelector('#lblCurrentPlacementName');
      if (placeGrid) {
        placeGrid.querySelectorAll('.option-chip-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.place === placement);
        });
      }
      const found = PORTRAIT_PLACEMENTS.find(p => p.id === placement);
      if (lblPlacement && found) lblPlacement.textContent = found.label;
    }
    if (imageUrl) this.currentImageSrc = imageUrl;
    this.previouslyFocusedEl = document.activeElement;
    this.modalEl.classList.add('open');
    if (this.activeTab === 'placements') {
      this.renderPlacementPreview();
    }
    setTimeout(() => {
      const initialFocus = this.modalEl.querySelector('#tabBtnRemover') || this.modalEl.querySelector('#btnCloseAuthorModal');
      initialFocus?.focus();
    }, 60);
  }

  close() {
    this.modalEl.classList.remove('open');
    if (this.previouslyFocusedEl && typeof this.previouslyFocusedEl.focus === 'function') {
      try {
        this.previouslyFocusedEl.focus();
      } catch (e) {}
    }
  }
}
