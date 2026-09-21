/**
 * Upgraded Author Image Studio & In-Browser Background Remover Modal
 * Features:
 * - 50 Portrait Placements across Cutouts, Avatars, Geometric Portals, and Environmental Blends
 * - Boundary-Safe Flood-Fill Background Remover (never chops into subject body)
 * - Click-To-Pick Eye-Dropper sampling directly on canvas
 */

import { PORTRAIT_PLACEMENTS } from '../data/defaultPresets.js';
import { BgRemoverService } from '../services/bgRemoverService.js';
import { dbService } from '../services/dbService.js';
import { Toast } from './toast.js';
import { escapeHtml } from '../utils/security.js';

export class AuthorImageModal {
  constructor(onApplyAuthorImage) {
    this.onApplyAuthorImage = onApplyAuthorImage;
    this.currentImage = null;
    this.processedDataUrl = null;
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
            <h2 style="font-size: 1.25rem; font-weight: 700; font-family: var(--font-display);">Author Portrait Studio</h2>
            <p style="font-size: 0.82rem; color: var(--text-secondary);">Isolate subject portraits and select from 50 precise canvas layouts.</p>
          </div>
          <button class="btn-glass" id="btnCloseAuthorModal" style="padding: 0.4rem 0.8rem;" aria-label="Close author studio">✕</button>
        </div>

        <!-- Modal Sub-Tabs (P2-2: Eliminates nested scroll touch-traps) -->
        <div style="display: flex; gap: 0.5rem; padding: 0.75rem 1.5rem 0.25rem 1.5rem; border-bottom: 1px solid var(--border-glass); background: var(--bg-surface-elevated);" role="tablist" aria-label="Author Studio Sections">
          <button class="tab-btn ${this.activeTab === 'remover' ? 'active' : ''}" id="tabBtnRemover" role="tab" aria-selected="${this.activeTab === 'remover'}" style="font-size: 0.84rem; padding: 0.4rem 1rem;">
            <span>✂️</span>
            <span>Background Remover</span>
          </button>
          <button class="tab-btn ${this.activeTab === 'placements' ? 'active' : ''}" id="tabBtnPlacements" role="tab" aria-selected="${this.activeTab === 'placements'}" style="font-size: 0.84rem; padding: 0.4rem 1rem;">
            <span>🎨</span>
            <span>50 Canvas Placements</span>
            <span class="tab-badge" style="background: var(--brand-primary); font-size: 0.68rem; margin-left: 0.25rem;">50</span>
          </button>
        </div>

        <!-- Body (Single unified scroll container) -->
        <div class="step-body" style="flex: 1; overflow-y: auto; gap: 1.25rem; padding: 1.5rem;">
          <!-- TAB 1: Background Remover & Upload -->
          <div id="authorTabPaneRemover" style="display: ${this.activeTab === 'remover' ? 'flex' : 'none'}; flex-direction: column; gap: 1.25rem;">
            <!-- Top Section: Upload Author Photo -->
            <div class="format-card" id="uploadDropZone" style="align-items: center; text-align: center; border-style: dashed; padding: 1.5rem; justify-content: center; cursor: pointer; background: var(--bg-surface-elevated); border: 2px dashed var(--border-glass); border-radius: var(--radius-md); transition: all 0.2s ease;">
              <span style="font-size: 2.2rem; margin-bottom: 0.35rem;" aria-hidden="true">📸</span>
              <div style="font-size: 1rem; font-weight: 700;">Upload Author Portrait or Subject Photo</div>
              <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.2rem;">Drag & drop image here, or browse files (PNG, JPG, WebP)</div>
              <input type="file" id="authorFileInput" accept="image/*" style="display: none;" aria-label="Upload author photo" />
              <button class="btn-glass" id="btnTriggerUpload" style="margin-top: 0.75rem; font-size: 0.82rem; padding: 0.45rem 1.1rem;" aria-label="Browse image files">
                📁 Browse Image File
              </button>
            </div>

            <!-- Intelligent Background Remover Workbench -->
            <div class="remover-workbench-grid" style="background: var(--bg-surface-elevated); border-radius: var(--radius-md); padding: 1.25rem; border: 1px solid var(--border-glass);">
              <!-- Interactive Canvas Preview -->
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; background: repeating-conic-gradient(#27272a 0% 25%, #18181b 0% 50%) 50% / 16px 16px; border-radius: var(--radius-sm); min-height: 220px; max-height: 240px; overflow: hidden; border: 1px solid var(--border-glass); position: relative;">
                <canvas id="bgRemoverPreviewCanvas" style="max-width: 100%; max-height: 220px; object-fit: contain; cursor: crosshair;" title="Click anywhere on canvas to sample background color!"></canvas>
                <div style="position: absolute; bottom: 6px; left: 6px; font-size: 0.68rem; background: rgba(0,0,0,0.7); padding: 0.2rem 0.5rem; border-radius: 4px; color: #cbd5e1;">
                  💡 Click canvas backdrop to eye-drop color
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
                    <span>✂️</span>
                    <span>Remove Background</span>
                  </button>
                  <button class="btn-glass" id="btnResetPhoto" style="font-size: 0.85rem; padding: 0.55rem 0.85rem;" title="Reset original photo" aria-label="Reset original photo">
                    <span>↺</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 2: 50 Portrait Placements on Canvas (No inner nested scroll container!) -->
          <div id="authorTabPanePlacements" style="display: ${this.activeTab === 'placements' ? 'flex' : 'none'}; flex-direction: column; gap: 0.75rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface-elevated); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
              <div>
                <span style="font-size: 0.88rem; font-weight: 700; color: var(--text-primary);">Active Placement:</span>
                <span style="font-size: 0.88rem; color: var(--brand-primary); font-weight: 700; margin-left: 0.35rem;" id="lblCurrentPlacementName">${this.selectedPlacement}</span>
              </div>
              <span style="font-size: 0.75rem; color: var(--text-muted);">Click any option to preview</span>
            </div>

            <!-- Placement Cards Grid (Flows with main modal scroll) -->
            <div class="option-chips-grid" id="placementOptionsGrid" style="grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 0.55rem;">
              ${PORTRAIT_PLACEMENTS.map(p => `
                <button class="option-chip-btn ${this.selectedPlacement === p.id ? 'active' : ''}" data-place="${p.id}" style="text-align: left; padding: 0.65rem 0.75rem; font-size: 0.78rem;">
                  <div style="font-weight: 700;">${p.label}</div>
                  <div style="font-size: 0.68rem; color: var(--text-muted);">${p.type}</div>
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="stepper-footer" style="border-top: 1px solid var(--border-glass); padding: 1rem 1.5rem;">
          <button class="btn-glass" id="btnClearAuthorImage" aria-label="Clear active author portrait">
            Remove Photo
          </button>
          <div style="display: flex; gap: 0.75rem;">
            <button class="btn-glass" id="btnCancelAuthorModal" aria-label="Cancel portrait modal">Cancel</button>
            <button class="btn-primary" id="btnApplyAuthorImage" aria-label="Apply portrait and placement settings">
              Apply Portrait & Placement ✨
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
    };

    tabBtnRemover.addEventListener('click', () => switchModalTab('remover'));
    tabBtnPlacements.addEventListener('click', () => switchModalTab('placements'));

    // Backdrop click dismiss
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.close();
    });

    // Escape key dismiss
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modalEl.classList.contains('open')) {
        this.close();
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

  open() {
    this.modalEl.classList.add('open');
  }

  close() {
    this.modalEl.classList.remove('open');
  }
}
