/**
 * Upgraded Author Image Studio & In-Browser Background Remover Modal
 * Features:
 * - 50 Portrait Placements across Cutouts, Avatars, Geometric Portals, and Environmental Blends
 * - Boundary-Safe Flood-Fill Background Remover (never chops into subject body)
 * - Click-To-Pick Eye-Dropper sampling directly on canvas
 */

import { PRESET_AUTHOR_PORTRAITS } from '../data/authorCutouts.js';
import { PORTRAIT_PLACEMENTS } from '../data/defaultPresets.js';
import { BgRemoverService } from '../services/bgRemoverService.js';
import { Toast } from './toast.js';

export class AuthorImageModal {
  constructor(onApplyAuthorImage) {
    this.onApplyAuthorImage = onApplyAuthorImage;
    this.currentImage = null;
    this.processedDataUrl = null;
    this.selectedPlacement = 'cutout-right';
    this.tolerance = 32;
    this.feather = 2;
    this.pickedColor = null;

    this.modalEl = null;
    this.render();
  }

  render() {
    const existing = document.getElementById('authorImageModal');
    if (existing) existing.remove();

    this.modalEl = document.createElement('div');
    this.modalEl.id = 'authorImageModal';
    this.modalEl.className = 'modal-backdrop';

    this.modalEl.innerHTML = `
      <div class="onboarding-card" style="max-width: 920px; max-height: 90vh;">
        <!-- Header -->
        <div class="stepper-header" style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="font-size: 1.3rem; font-weight: 700; font-family: var(--font-display);">Author Portrait & Background Remover Studio</h2>
            <p style="font-size: 0.82rem; color: var(--text-secondary);">Remove backgrounds with edge-preserving flood fill or select from 50 canvas placements.</p>
          </div>
          <button class="btn-glass" id="btnCloseAuthorModal" style="padding: 0.4rem 0.8rem;">✕</button>
        </div>

        <!-- Body -->
        <div class="step-body" style="overflow-y: auto; max-height: 580px; gap: 1.5rem; padding: 1.5rem;">
          <!-- Top Section: Upload & Preloaded Thinkers -->
          <div style="display: grid; grid-template-columns: 280px 1fr; gap: 1rem;">
            <!-- Upload Box -->
            <div class="format-card" id="uploadDropZone" style="align-items: center; text-align: center; border-style: dashed; padding: 1.25rem; justify-content: center; cursor: pointer;">
              <span style="font-size: 2rem; margin-bottom: 0.25rem;">📁</span>
              <div style="font-size: 0.9rem; font-weight: 700;">Upload Author Photo</div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">PNG, JPG, WebP</div>
              <input type="file" id="authorFileInput" accept="image/*" style="display: none;" />
              <button class="btn-glass" id="btnTriggerUpload" style="margin-top: 0.5rem; font-size: 0.78rem; padding: 0.4rem 0.9rem;">
                Browse Files
              </button>
            </div>

            <!-- Preloaded Thinkers Grid -->
            <div>
              <label class="form-label" style="margin-bottom: 0.4rem; display: block;">Or Pick Iconic Thinker Cutout:</label>
              <div class="author-thinkers-grid" id="thinkersGrid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; max-height: 140px; overflow-y: auto;">
                ${PRESET_AUTHOR_PORTRAITS.map(p => `
                  <div class="thinker-card" data-id="${p.id}" style="background: var(--bg-surface-elevated); border: 1px solid var(--border-glass); border-radius: var(--radius-sm); padding: 0.4rem; text-align: center; cursor: pointer;">
                    <img src="${p.imageUrl}" style="width: 36px; height: 42px; object-fit: contain; margin: 0 auto; display: block;" alt="${p.name}" />
                    <span style="font-size: 0.65rem; font-weight: 600; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 0.2rem;">${p.name.split(' ')[0]}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Middle Section: Intelligent Background Remover -->
          <div style="display: grid; grid-template-columns: 280px 1fr; gap: 1.25rem; background: var(--bg-surface-elevated); border-radius: var(--radius-md); padding: 1.25rem; border: 1px solid var(--border-glass);">
            <!-- Interactive Canvas Preview -->
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; background: repeating-conic-gradient(#27272a 0% 25%, #18181b 0% 50%) 50% / 16px 16px; border-radius: var(--radius-sm); min-height: 220px; max-height: 240px; overflow: hidden; border: 1px solid var(--border-glass); position: relative;">
              <canvas id="bgRemoverPreviewCanvas" style="max-width: 100%; max-height: 220px; object-fit: contain; cursor: crosshair;" title="Click anywhere to sample background color!"></canvas>
              <div style="position: absolute; bottom: 6px; left: 6px; font-size: 0.68rem; background: rgba(0,0,0,0.7); padding: 0.2rem 0.5rem; border-radius: 4px; color: #cbd5e1;">
                💡 Tip: Click on background to eye-drop color
              </div>
            </div>

            <!-- Remover Controls -->
            <div style="display: flex; flex-direction: column; justify-content: space-between; gap: 0.75rem;">
              <div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                  <span class="form-label">Edge-Safe Tolerance</span>
                  <span style="font-size: 0.78rem; font-weight: 700; color: var(--brand-primary);" id="lblTolerance">${this.tolerance}%</span>
                </div>
                <input type="range" id="sliderTolerance" min="5" max="80" value="${this.tolerance}" style="width: 100%; accent-color: var(--brand-primary);" />
                <span style="font-size: 0.7rem; color: var(--text-muted); display: block; margin-top: 0.2rem;">Boundary flood fill protects clothes & skin from being erased.</span>
              </div>

              <div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                  <span class="form-label">Contour Smoothing</span>
                  <span style="font-size: 0.78rem; font-weight: 700; color: var(--brand-accent);" id="lblFeather">${this.feather}px</span>
                </div>
                <input type="range" id="sliderFeather" min="0" max="6" value="${this.feather}" style="width: 100%; accent-color: var(--brand-accent);" />
              </div>

              <div style="display: flex; gap: 0.5rem;">
                <button class="btn-accent" id="btnExecuteBgRemove" style="flex: 1; justify-content: center; font-size: 0.85rem; padding: 0.55rem 1rem;">
                  <span>✂️</span>
                  <span>Remove Background</span>
                </button>
                <button class="btn-glass" id="btnResetPhoto" style="font-size: 0.85rem; padding: 0.55rem 0.85rem;" title="Reset original photo">
                  <span>↺</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Bottom Section: 50 Portrait Placements on Canvas -->
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <label class="form-label" style="font-weight: 700; text-transform: uppercase;">50 Canvas Portrait Placements:</label>
              <span style="font-size: 0.75rem; color: var(--brand-primary); font-weight: 600;" id="lblCurrentPlacementName">${this.selectedPlacement}</span>
            </div>

            <!-- Placement Cards Grid -->
            <div class="option-chips-grid" id="placementOptionsGrid" style="grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 0.5rem; max-height: 180px; overflow-y: auto; padding-right: 0.25rem;">
              ${PORTRAIT_PLACEMENTS.map(p => `
                <button class="option-chip-btn ${this.selectedPlacement === p.id ? 'active' : ''}" data-place="${p.id}" style="text-align: left; padding: 0.5rem; font-size: 0.75rem;">
                  <div style="font-weight: 700;">${p.label}</div>
                  <div style="font-size: 0.65rem; color: var(--text-muted);">${p.type}</div>
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="stepper-footer">
          <button class="btn-glass" id="btnClearAuthorImage">
            Remove Photo
          </button>
          <div style="display: flex; gap: 0.75rem;">
            <button class="btn-glass" id="btnCancelAuthorModal">Cancel</button>
            <button class="btn-primary" id="btnApplyAuthorImage">
              Apply Portrait & Placement ✨
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modalEl);
    this.bindEvents();
    this.selectThinker('marcus-aurelius');
  }

  bindEvents() {
    this.modalEl.querySelector('#btnCloseAuthorModal').addEventListener('click', () => this.close());
    this.modalEl.querySelector('#btnCancelAuthorModal').addEventListener('click', () => this.close());

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

    // Thinkers click
    const thinkersGrid = this.modalEl.querySelector('#thinkersGrid');
    thinkersGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.thinker-card');
      if (!card) return;
      thinkersGrid.querySelectorAll('.thinker-card').forEach(c => c.style.borderColor = 'var(--border-glass)');
      card.style.borderColor = 'var(--brand-primary)';
      this.selectThinker(card.dataset.id);
    });

    // Eye-dropper click on preview canvas
    const canvas = this.modalEl.querySelector('#bgRemoverPreviewCanvas');
    canvas.addEventListener('click', (e) => {
      if (!this.currentImage) return;
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor(e.clientX - rect.left);
      const y = Math.floor(e.clientY - rect.top);
      const ctx = canvas.getContext('2d');
      const pixel = ctx.getImageData(x, y, 1, 1).data;
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

  async selectThinker(thinkerId) {
    const thinker = PRESET_AUTHOR_PORTRAITS.find(p => p.id === thinkerId);
    if (!thinker) return;

    try {
      const img = await BgRemoverService.loadImage(thinker.imageUrl);
      this.currentImage = img;
      this.processedDataUrl = thinker.imageUrl;
      this.drawPreview(img);
    } catch (e) {
      console.error(e);
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
