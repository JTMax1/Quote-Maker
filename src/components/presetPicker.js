/**
 * Preset Template Picker & Catalog
 * Enables switching between dozens of built-in and community-published themes.
 */

import { PRESET_CATEGORIES } from '../data/defaultPresets.js';
import { StorageService } from '../services/storageService.js';
import { Toast } from './toast.js';
import { escapeHtml, sanitizeStyleValue } from '../utils/security.js';

export class PresetPicker {
  constructor(containerEl, onSelectPreset) {
    this.containerEl = containerEl;
    this.onSelectPreset = onSelectPreset;
    this.selectedCategory = 'all';
    this.searchQuery = '';
    this.activePresetId = null;

    this.render();
  }

  setActivePreset(presetId) {
    this.activePresetId = presetId;
    this.renderCards();
  }

  render() {
    this.containerEl.innerHTML = `
      <div class="presets-container">
        <!-- Toolbar: Search & Categories -->
        <div class="presets-toolbar">
          <div class="category-filter-bar" id="presetCategoryBar">
            ${PRESET_CATEGORIES.map(cat => `
              <button class="category-chip ${this.selectedCategory === cat.id ? 'active' : ''}" data-cat="${cat.id}">
                <span>${cat.icon}</span>
                <span>${cat.label}</span>
              </button>
            `).join('')}
          </div>

          <div style="min-width: 240px;">
            <input type="text" class="form-input" id="presetSearchInput" placeholder="🔍 Search themes or fonts..." style="width: 100%; border-radius: 9999px;" />
          </div>
        </div>

        <!-- Presets Grid -->
        <div class="presets-grid" id="presetsCardsGrid">
          <!-- Dynamically populated -->
        </div>
      </div>
    `;

    this.bindEvents();
    this.renderCards();
  }

  bindEvents() {
    // Category click
    const catBar = this.containerEl.querySelector('#presetCategoryBar');
    catBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.category-chip');
      if (!btn) return;
      catBar.querySelectorAll('.category-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.selectedCategory = btn.dataset.cat;
      this.renderCards();
    });

    // Search input
    const searchInput = this.containerEl.querySelector('#presetSearchInput');
    searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.renderCards();
    });
  }

  renderCards() {
    const grid = this.containerEl.querySelector('#presetsCardsGrid');
    const allPresets = StorageService.getAllPresets();

    let filtered = allPresets;
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === this.selectedCategory);
    }
    if (this.searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(this.searchQuery) ||
        (p.fontFamily && p.fontFamily.toLowerCase().includes(this.searchQuery)) ||
        (p.description && p.description.toLowerCase().includes(this.searchQuery))
      );
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-secondary);">
          <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">No design themes match your search.</p>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Try a different category or create a custom theme in Template Studio!</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(preset => {
      const isActive = this.activePresetId === preset.id;
      const bgStyle = preset.gradient || preset.background || '#1e293b';
      const color = sanitizeStyleValue(preset.textColor, '#ffffff');
      const accent = sanitizeStyleValue(preset.accentColor, color);
      const font = sanitizeStyleValue(preset.fontFamily, 'Playfair Display');
      const safeId = escapeHtml(preset.id);
      const safeName = escapeHtml(preset.name);
      const safeCategory = escapeHtml(preset.category);
      const sampleQuote = "“Simplicity is the ultimate sophistication.”";

      return `
        <div class="preset-card ${isActive ? 'active-theme' : ''}" data-id="${safeId}">
          <div class="preset-preview-box" style="background: ${bgStyle}; color: ${color}; font-family: '${font}', sans-serif;">
            <div class="preset-quote-sample">${sampleQuote}</div>
            <div class="preset-author-sample" style="color: ${accent}">— Leonardo da Vinci</div>
          </div>
          <div class="preset-card-footer">
            <div class="preset-name-wrap">
              <span class="preset-card-title">${safeName} ${preset.isCustom ? '★' : ''}</span>
              <span class="preset-card-font">${font} • ${safeCategory}</span>
            </div>
            <button class="btn-apply-theme" data-id="${safeId}" aria-label="Select ${safeName} theme">
              ${isActive ? 'Active' : 'Select'}
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach click events once per card (prevents double-firing from child button bubbling)
    grid.querySelectorAll('.preset-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        if (id) {
          const selected = allPresets.find(p => p.id === id);
          if (selected) {
            this.activePresetId = id;
            this.renderCards();
            if (this.onSelectPreset) {
              this.onSelectPreset(selected);
            }
            Toast.show(`Applied "${selected.name}" style!`, 'success');
          }
        }
      });
    });
  }
}
