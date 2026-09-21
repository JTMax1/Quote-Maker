/**
 * Dedicated Signature & Profile Settings Modal
 * Allows quick configuration of author name, handle, watermark, default format,
 * default template/preset, and visibility toggles.
 */

import { CANVAS_FORMATS, DEFAULT_PRESETS, PRESET_CATEGORIES } from '../data/defaultPresets.js';
import { StorageService } from '../services/storageService.js';
import { Toast } from './toast.js';
import { escapeHtml } from '../utils/security.js';
import { icon } from '../utils/icons.js';

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
    const activePresetId = profile.activePresetId || 'editorial-vogue';

    // Group presets by category
    const presetsByCategory = {};
    PRESET_CATEGORIES.forEach(cat => {
      if (cat.id !== 'all') presetsByCategory[cat.id] = [];
    });
    DEFAULT_PRESETS.forEach(p => {
      const cat = p.category || 'editorial';
      if (!presetsByCategory[cat]) presetsByCategory[cat] = [];
      presetsByCategory[cat].push(p);
    });

    this.modalEl.innerHTML = `
      <div class="onboarding-card modal-card" style="max-width: 580px; width: 100%;" tabindex="-1">
        <!-- Header -->
        <div class="stepper-header" style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 36px; height: 36px; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-glass-strong); display: flex; align-items: center; justify-content: center; color: var(--brand-primary);">
              ${icon('settings', { size: 20 })}
            </div>
            <div>
              <h2 id="profileModalTitle" style="font-size: 1.25rem; font-weight: 700; font-family: var(--font-display); margin: 0;">Profile & Default Settings</h2>
              <p style="font-size: 0.82rem; color: var(--text-secondary); margin: 0.2rem 0 0 0;">Configure your signature, default template theme, and branding preferences.</p>
            </div>
          </div>
          <button class="btn-glass modal-close-btn" id="btnCloseProfileModal" aria-label="Close settings modal" style="padding: 0.4rem 0.65rem;">
            ${icon('x', { size: 16 })}
          </button>
        </div>

        <!-- Body Form -->
        <div class="step-body" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; max-height: 70vh; overflow-y: auto;">
          <!-- Name & Handle -->
          <div class="input-row">
            <div class="form-group">
              <label class="form-label" for="settingProfileName">
                ${icon('user', { size: 13, class: 'mr-1' })} Author Name
              </label>
              <input type="text" class="form-input" id="settingProfileName" value="${escapeHtml(profile.name || '')}" placeholder="e.g. Seneca" aria-label="Author name" />
            </div>
            <div class="form-group">
              <label class="form-label" for="settingProfileHandle">
                ${icon('atSign', { size: 13, class: 'mr-1' })} Handle / Subtitle
              </label>
              <input type="text" class="form-input" id="settingProfileHandle" value="${escapeHtml(profile.handle || '')}" placeholder="e.g. @stoicwisdom" aria-label="Social handle or tagline" />
            </div>
          </div>

          <!-- Watermark -->
          <div class="form-group">
            <label class="form-label" for="settingProfileWatermark">
              ${icon('droplets', { size: 13, class: 'mr-1' })} Watermark / Brand Label
            </label>
            <input type="text" class="form-input" id="settingProfileWatermark" value="${escapeHtml(profile.watermarkText || 'QuoteForge')}" placeholder="e.g. QuoteForge or YourBrand" aria-label="Watermark branding text" />
          </div>

          <!-- Default Template Theme -->
          <div class="form-group">
            <label class="form-label" for="settingDefaultTemplate">
              ${icon('palette', { size: 13, class: 'mr-1' })} Default Template Theme
            </label>
            <select class="form-input" id="settingDefaultTemplate" aria-label="Default design preset template">
              ${PRESET_CATEGORIES.filter(c => c.id !== 'all').map(cat => `
                <optgroup label="${cat.label}">
                  ${(presetsByCategory[cat.id] || []).map(p => `
                    <option value="${p.id}" ${p.id === activePresetId ? 'selected' : ''}>
                      ${p.name}
                    </option>
                  `).join('')}
                </optgroup>
              `).join('')}
            </select>
            <div id="templatePreviewBadge" style="margin-top: 0.5rem; font-size: 0.8rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.5rem; background: var(--bg-surface-elevated); padding: 0.4rem 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border-glass);">
              <span id="templateSwatch" style="width: 12px; height: 12px; border-radius: 50%; display: inline-block; background: #6366f1;"></span>
              <span id="templateDesc">Selected template</span>
            </div>
          </div>

          <!-- Default Canvas Ratio -->
          <div class="form-group">
            <label class="form-label" for="settingDefaultRatio">
              ${icon('square', { size: 13, class: 'mr-1' })} Default Canvas Ratio
            </label>
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
            <div class="form-label" style="margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.4rem;">
              ${icon('eye', { size: 13 })} Default Visibility Toggles
            </div>
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
                  <span class="toggle-desc">Display discreet branding label</span>
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
        <div class="stepper-footer" style="display: flex; justify-content: flex-end; align-items: center; gap: 0.75rem;">
          <button class="btn-glass" id="btnCancelProfileModal">Cancel</button>
          <button class="btn-primary" id="btnSaveProfileSettings">
            ${icon('check', { size: 16 })} Save Settings
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(this.modalEl);
    this.bindEvents();
    this.updateTemplatePreview();
  }

  updateTemplatePreview() {
    const select = this.modalEl.querySelector('#settingDefaultTemplate');
    if (!select) return;
    const selectedId = select.value;
    const preset = DEFAULT_PRESETS.find(p => p.id === selectedId);
    const swatch = this.modalEl.querySelector('#templateSwatch');
    const desc = this.modalEl.querySelector('#templateDesc');

    if (preset && swatch && desc) {
      swatch.style.background = preset.textColor || '#6366f1';
      desc.textContent = `${preset.name} — ${preset.fontFamily || 'Sans'} (${preset.category || 'Theme'})`;
    }
  }

  bindEvents() {
    const close = () => this.close();

    this.modalEl.querySelector('#btnCloseProfileModal').addEventListener('click', close);
    this.modalEl.querySelector('#btnCancelProfileModal').addEventListener('click', close);

    this.modalEl.querySelector('#settingDefaultTemplate').addEventListener('change', () => {
      this.updateTemplatePreview();
    });

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
      const activePresetId = this.modalEl.querySelector('#settingDefaultTemplate').value;
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
        activePresetId: activePresetId || profile.activePresetId || 'editorial-vogue',
        defaultRatio,
        showAuthor,
        showDate,
        showCategory,
        showWatermark,
        onboarded: true
      };

      StorageService.saveProfile(updated);
      Toast.show('Profile and default template saved successfully!', 'success');
      this.close();

      if (this.onSave) {
        this.onSave(updated);
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

  open() {
    this.previouslyFocusedEl = document.activeElement;

    const profile = StorageService.getProfile();
    this.modalEl.querySelector('#settingProfileName').value = profile.name || '';
    this.modalEl.querySelector('#settingProfileHandle').value = profile.handle || '';
    this.modalEl.querySelector('#settingProfileWatermark').value = profile.watermarkText || 'QuoteForge';
    this.modalEl.querySelector('#settingDefaultTemplate').value = profile.activePresetId || 'editorial-vogue';
    this.modalEl.querySelector('#settingDefaultRatio').value = profile.defaultRatio || '1:1';
    this.modalEl.querySelector('#settingToggleAuthor').checked = profile.showAuthor ?? true;
    this.modalEl.querySelector('#settingToggleDate').checked = profile.showDate ?? true;
    this.modalEl.querySelector('#settingToggleCategory').checked = profile.showCategory ?? true;
    this.modalEl.querySelector('#settingToggleWatermark').checked = profile.showWatermark ?? true;

    this.updateTemplatePreview();
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
