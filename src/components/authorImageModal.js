/**
 * Author Image Studio & In-Browser Background Remover Modal
 * Upload photos, pick iconic thinker cutouts, or remove backgrounds directly.
 */

import { PRESET_AUTHOR_PORTRAITS } from '../data/authorCutouts.js';
import { BgRemoverService } from '../services/bgRemoverService.js';
import { Toast } from './toast.js';

export class AuthorImageModal {
  constructor(onApplyAuthorImage) {
    this.onApplyAuthorImage = onApplyAuthorImage;
    this.currentImage = null; // HTMLImageElement or dataUrl
    this.processedDataUrl = null;
    this.selectedPlacement = 'right'; // 'right', 'left', 'bottom', 'avatar-top', 'scrim'
    this.tolerance = 38;
    this.feather = 2;

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
      <div class="onboarding-card" style="max-width: 780px;">
        <!-- Header -->
        <div class="stepper-header" style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="font-size: 1.25rem; font-weight: 700; font-family: var(--font-display);">Author Image & Background Remover Studio</h2>
            <p style="font-size: 0.82rem; color: var(--text-secondary);">Add transparent cutout portraits, circular avatars, or custom photos.</p>
          </div>
          <button class="btn-glass" id="btnCloseAuthorModal" style="padding: 0.4rem 0.8rem;">✕</button>
        </div>

        <!-- Body -->
        <div class="step-body" style="min-height: 480px; gap: 1.25rem;">
          <!-- Top Row: Select or Upload -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <!-- Upload Box -->
            <div class="format-card" id="uploadDropZone" style="align-items: center; text-align: center; border-style: dashed; padding: 1.5rem; justify-content: center;">
              <span style="font-size: 2rem; margin-bottom: 0.25rem;">📁</span>
              <div style="font-size: 0.9rem; font-weight: 700;">Upload Author Photo</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">PNG, JPG, or WebP</div>
              <input type="file" id="authorFileInput" accept="image/*" style="display: none;" />
              <button class="btn-glass" id="btnTriggerUpload" style="margin-top: 0.5rem; font-size: 0.78rem; padding: 0.4rem 0.9rem;">
                Browse Files
              </button>
            </div>

            <!-- Preloaded Thinkers Grid -->
            <div>
              <label class="form-label" style="margin-bottom: 0.4rem; display: block;">Or Pick Iconic Thinker:</label>
              <div class="author-thinkers-grid" id="thinkersGrid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; max-height: 150px; overflow-y: auto;">
                ${PRESET_AUTHOR_PORTRAITS.map(p => `
                  <div class="thinker-card" data-id="${p.id}" style="background: var(--bg-surface-elevated); border: 1px solid var(--border-glass); border-radius: var(--radius-sm); padding: 0.4rem; text-align: center; cursor: pointer;">
                    <img src="${p.imageUrl}" style="width: 38px; height: 46px; object-fit: contain; margin: 0 auto; display: block;" alt="${p.name}" />
                    <span style="font-size: 0.65rem; font-weight: 600; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 0.2rem;">${p.name.split(' ')[0]}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Middle Row: Live Background Remover Canvas & Controls -->
          <div style="display: grid; grid-template-columns: 240px 1fr; gap: 1.25rem; background: var(--bg-surface-elevated); border-radius: var(--radius-md); padding: 1.25rem; border: 1px solid var(--border-glass);">
            <!-- Canvas Preview with Checkerboard -->
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; background: repeating-conic-gradient(#27272a 0% 25%, #18181b 0% 50%) 50% / 16px 16px; border-radius: var(--radius-sm); min-height: 200px; max-height: 220px; overflow: hidden; border: 1px solid var(--border-glass);">
              <canvas id="bgRemoverPreviewCanvas" style="max-width: 100%; max-height: 200px; object-fit: contain;"></canvas>
            </div>

            <!-- Remover Controls -->
            <div style="display: flex; flex-direction: column; justify-content: space-between; gap: 0.75rem;">
              <div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                  <span class="form-label">Transparency Tolerance</span>
                  <span style="font-size: 0.78rem; font-weight: 700; color: var(--brand-primary);" id="lblTolerance">${this.tolerance}%</span>
                </div>
                <input type="range" id="sliderTolerance" min="5" max="90" value="${this.tolerance}" style="width: 100%; accent-color: var(--brand-primary);" />
              </div>

              <div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                  <span class="form-label">Edge Feathering</span>
                  <span style="font-size: 0.78rem; font-weight: 700; color: var(--brand-accent);" id="lblFeather">${this.feather}px</span>
                </div>
                <input type="range" id="sliderFeather" min="0" max="6" value="${this.feather}" style="width: 100%; accent-color: var(--brand-accent);" />
              </div>

              <button class="btn-accent" id="btnExecuteBgRemove" style="justify-content: center; font-size: 0.85rem; padding: 0.5rem 1rem;">
                <span>✂️</span>
                <span>Remove Background Now</span>
              </button>
            </div>
          </div>

          <!-- Placement Selector -->
          <div>
            <label class="form-label" style="margin-bottom: 0.4rem; display: block;">Portrait Placement on Canvas:</label>
            <div class="option-chips-grid" id="placementOptionsGrid" style="grid-template-columns: repeat(5, 1fr);">
              <button class="option-chip-btn ${this.selectedPlacement === 'right' ? 'active' : ''}" data-place="right">Cutout Right</button>
              <button class="option-chip-btn ${this.selectedPlacement === 'left' ? 'active' : ''}" data-place="left">Cutout Left</button>
              <button class="option-chip-btn ${this.selectedPlacement === 'bottom' ? 'active' : ''}" data-place="bottom">Bottom Pop-Out</button>
              <button class="option-chip-btn ${this.selectedPlacement === 'avatar-top' ? 'active' : ''}" data-place="avatar-top">Avatar Badge</button>
              <button class="option-chip-btn ${this.selectedPlacement === 'scrim' ? 'active' : ''}" data-place="scrim">Full Scrim</button>
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
              Apply Portrait to Quote ✨
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modalEl);
    this.bindEvents();
    // Default load Marcus Aurelius cutout for instant preview
    this.selectThinker('marcus-aurelius');
  }

  bindEvents() {
    // Close / Cancel
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
        this.drawPreview(loaded);
        Toast.show('Photo loaded! Click "Remove Background" if needed.', 'success');
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

    // Tolerance & Feather Sliders
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

    // Background Removal Button
    this.modalEl.querySelector('#btnExecuteBgRemove').addEventListener('click', async () => {
      if (!this.currentImage) {
        Toast.show('Please upload or select an image first', 'info');
        return;
      }
      Toast.show('Removing background...', 'info');
      try {
        const result = await BgRemoverService.removeBackground(this.currentImage, {
          tolerance: this.tolerance,
          feather: this.feather
        });
        this.processedDataUrl = result.dataUrl;
        const img = await BgRemoverService.loadImage(result.dataUrl);
        this.drawPreview(img);
        Toast.show('Background removed! Transparent cutout ready.', 'success');
      } catch (err) {
        console.error(err);
        Toast.show('Background removal error', 'error');
      }
    });

    // Placement selector
    const placeGrid = this.modalEl.querySelector('#placementOptionsGrid');
    placeGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.option-chip-btn');
      if (!btn) return;
      placeGrid.querySelectorAll('.option-chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.selectedPlacement = btn.dataset.place;
    });

    // Clear photo
    this.modalEl.querySelector('#btnClearAuthorImage').addEventListener('click', () => {
      this.currentImage = null;
      this.processedDataUrl = null;
      const canvas = this.modalEl.querySelector('#bgRemoverPreviewCanvas');
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
      Toast.show('Author portrait updated!', 'success');
      this.close();
    });
  }

  async selectThinker(thinkerId) {
    const thinker = PRESET_AUTHOR_PORTRAITS.find(p => p.id === thinkerId);
    if (!thinker) return;

    try {
      const img = await BgRemoverService.loadImage(thinker.imageUrl);
      this.currentImage = img;
      this.processedDataUrl = thinker.imageUrl; // Already transparent vector cutout
      this.drawPreview(img);
    } catch (e) {
      console.error(e);
    }
  }

  drawPreview(img) {
    const canvas = this.modalEl.querySelector('#bgRemoverPreviewCanvas');
    if (!canvas || !img) return;

    canvas.width = 240;
    canvas.height = 200;
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
