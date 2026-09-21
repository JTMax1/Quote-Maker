/**
 * Dedicated Signature & Profile Settings Modal
 * Allows quick configuration of author name, handle, watermark, default format, and toggles
 * without forcing the user through the 3-step onboarding wizard.
 */

import { CANVAS_FORMATS } from '../data/defaultPresets.js';
import { StorageService } from '../services/storageService.js';
import { Toast } from './toast.js';
import { escapeHtml } from '../utils/security.js';

export class ProfileSettingsModal {
  constructor(onSave) {
    this.onSave = onSave;
    this.modalEl = null;
    this.previouslyFocusedEl = null;
    this.render();
  }

  render() {
    const existing = document.getElementById('profileSettingsModal');
    if (existing) existing.remove();

    this.modalEl = document.createElement('div');
    this.modalEl.id = 'profileSettingsModal';
    this.modalEl.className = 'modal-backdrop';
    this.modalEl.setAttribute('role', 'dialog');
    this.modalEl.setAttribute('aria-modal', 'true');
    this.modalEl.setAttribute('aria-labelledby', 'profileModalTitle');

    const profile = StorageService.getProfile();

    this.modalEl.innerHTML = `
      <div class="onboarding-card" style="max-width: 580px; width: 100%;" tabindex="-1">
        <!-- Header -->
        <div class="stepper-header" style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 id="profileModalTitle" style="font-size: 1.25rem; font-weight: 700; font-family: var(--font-display);">Signature & Profile Settings</h2>
            <p style="font-size: 0.82rem; color: var(--text-secondary);">Configure your default author signature, branding watermark, and display preferences.</p>
          </div>
          <button class="btn-glass modal-close-btn" id="btnCloseProfileModal" aria-label="Close settings modal" style="padding: 0.35rem 0.75rem;">✕</button>
        </div>

        <!-- Body Form -->
        <div class="step-body" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; max-height: 70vh; overflow-y: auto;">
          <!-- Name & Handle -->
          <div class="input-row">
            <div class="form-group">
              <label class="form-label" for="settingProfileName">Author Name</label>
              <input type="text" class="form-input" id="settingProfileName" value="${escapeHtml(profile.name || '')}" placeholder="e.g. Seneca" aria-label="Author name" />
            </div>
            <div class="form-group">
              <label class="form-label" for="settingProfileHandle">Handle / Tagline</label>
              <input type="text" class="form-input" id="settingProfileHandle" value="${escapeHtml(profile.handle || '')}" placeholder="e.g. @stoicwisdom" aria-label="Social handle or tagline" />
            </div>
          </div>

          <!-- Watermark -->
          <div class="form-group">
            <label class="form-label" for="settingProfileWatermark">Watermark / Brand Label</label>
            <input type="text" class="form-input" id="settingProfileWatermark" value="${escapeHtml(profile.watermarkText || 'QuoteForge')}" placeholder="e.g. QuoteForge or YourBrand" aria-label="Watermark branding text" />
          </div>

          <!-- Default Canvas Ratio -->
          <div class="form-group">
            <label class="form-label" for="settingDefaultRatio">Default Canvas Ratio</label>
            <select class="form-input" id="settingDefaultRatio" aria-label="Default canvas aspect ratio">
              ${CANVAS_FORMATS.map(f => `
                <option value="${f.id}" ${profile.defaultRatio === f.id ? 'selected' : ''}>
                  ${f.label} (${f.sublabel})
                </option>
              `).join('')}
            </select>
          </div>

          <!-- Visibility Toggles -->
          <div>
            <div class="form-label" style="margin-bottom: 0.5rem;">Default Visibility Toggles</div>
            <div class="toggles-list" style="background: var(--bg-surface-elevated); padding: 0.85rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
              <div class="toggle-item">
                <div class="toggle-info">
                  <span class="toggle-label">Show Author</span>
                  <span class="toggle-desc">Display author signature and handle</span>
                </div>
                <label class="switch">
                  <input type="checkbox" id="settingToggleAuthor" ${profile.showAuthor ?? true ? 'checked' : ''} aria-label="Toggle author visibility by default" />
                  <span class="slider"></span>
                </label>
              </div>

              <div class="toggle-item">
                <div class="toggle-info">
                  <span class="toggle-label">Show Date</span>
                  <span class="toggle-desc">Display month/year timestamp badge</span>
                </div>
                <label class="switch">
                  <input type="checkbox" id="settingToggleDate" ${profile.showDate ?? true ? 'checked' : ''} aria-label="Toggle date visibility by default" />
                  <span class="slider"></span>
                </label>
              </div>

              <div class="toggle-item">
                <div class="toggle-info">
                  <span class="toggle-label">Show Category</span>
                  <span class="toggle-desc">Display topic tag badge</span>
                </div>
                <label class="switch">
                  <input type="checkbox" id="settingToggleCategory" ${profile.showCategory ?? true ? 'checked' : ''} aria-label="Toggle category badge visibility by default" />
                  <span class="slider"></span>
                </label>
              </div>

              <div class="toggle-item">
                <div class="toggle-info">
                  <span class="toggle-label">Show Watermark</span>
                  <span class="toggle-desc">Display discreet branding logo</span>
                </div>
                <label class="switch">
                  <input type="checkbox" id="settingToggleWatermark" ${profile.showWatermark ?? true ? 'checked' : ''} aria-label="Toggle watermark visibility by default" />
                  <span class="slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="stepper-footer" style="display: flex; justify-content: space-between; align-items: center;">
          <button class="btn-glass" id="btnRestartOnboarding" style="font-size: 0.8rem; color: var(--text-muted);" aria-label="Restart interactive setup tour">
            🚀 Tutorial Tour
          </button>
          <div style="display: flex; gap: 0.75rem;">
            <button class="btn-glass" id="btnCancelProfileModal">Cancel</button>
            <button class="btn-primary" id="btnSaveProfileSettings">
              Save Settings ✨
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modalEl);
    this.bindEvents();
  }

  bindEvents() {
    const close = () => this.close();

    this.modalEl.querySelector('#btnCloseProfileModal').addEventListener('click', close);
    this.modalEl.querySelector('#btnCancelProfileModal').addEventListener('click', close);

    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) close();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modalEl.classList.contains('open')) {
        close();
      }
    });

    // Save
    this.modalEl.querySelector('#btnSaveProfileSettings').addEventListener('click', () => {
      const name = this.modalEl.querySelector('#settingProfileName').value.trim();
      const handle = this.modalEl.querySelector('#settingProfileHandle').value.trim();
      const watermarkText = this.modalEl.querySelector('#settingProfileWatermark').value.trim();
      const defaultRatio = this.modalEl.querySelector('#settingDefaultRatio').value;
      const showAuthor = this.modalEl.querySelector('#settingToggleAuthor').checked;
      const showDate = this.modalEl.querySelector('#settingToggleDate').checked;
      const showCategory = this.modalEl.querySelector('#settingToggleCategory').checked;
      const showWatermark = this.modalEl.querySelector('#settingToggleWatermark').checked;

      const profile = StorageService.getProfile();
      const updated = {
        ...profile,
        name: name || profile.name || 'Author',
        handle: handle || profile.handle || '@author',
        watermarkText: watermarkText || 'QuoteForge',
        defaultRatio,
        showAuthor,
        showDate,
        showCategory,
        showWatermark
      };

      StorageService.saveProfile(updated);
      Toast.show('Profile settings saved successfully!', 'success');
      this.close();

      if (this.onSave) {
        this.onSave(updated);
      }
    });

    // Option to restart tour
    this.modalEl.querySelector('#btnRestartOnboarding').addEventListener('click', () => {
      this.close();
      if (this.onRestartTour) {
        this.onRestartTour();
      }
    });

    // Keyboard focus trap
    this.modalEl.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const focusables = this.modalEl.querySelectorAll('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    });
  }

  open(onRestartTour = null) {
    this.onRestartTour = onRestartTour;
    this.previouslyFocusedEl = document.activeElement;

    const profile = StorageService.getProfile();
    this.modalEl.querySelector('#settingProfileName').value = profile.name || '';
    this.modalEl.querySelector('#settingProfileHandle').value = profile.handle || '';
    this.modalEl.querySelector('#settingProfileWatermark').value = profile.watermarkText || 'QuoteForge';
    this.modalEl.querySelector('#settingDefaultRatio').value = profile.defaultRatio || '1:1';
    this.modalEl.querySelector('#settingToggleAuthor').checked = profile.showAuthor ?? true;
    this.modalEl.querySelector('#settingToggleDate').checked = profile.showDate ?? true;
    this.modalEl.querySelector('#settingToggleCategory').checked = profile.showCategory ?? true;
    this.modalEl.querySelector('#settingToggleWatermark').checked = profile.showWatermark ?? true;

    this.modalEl.classList.add('open');

    // Focus first input
    setTimeout(() => {
      this.modalEl.querySelector('#settingProfileName').focus();
    }, 100);
  }

  close() {
    this.modalEl.classList.remove('open');
    if (this.previouslyFocusedEl && typeof this.previouslyFocusedEl.focus === 'function') {
      this.previouslyFocusedEl.focus();
    }
  }
}
