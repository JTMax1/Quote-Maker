/**
 * Preset Template Picker & Catalog
 * Enables switching between dozens of built-in and community-published themes.
 */

import { PRESET_CATEGORIES } from '../data/defaultPresets.js';
import { StorageService } from '../services/storageService.js';
import { Toast } from './toast.js';
import { escapeHtml, sanitizeStyleValue } from '../utils/security.js';
import { icon } from '../utils/icons.js';

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
                <span>${icon(cat.icon || 'sparkles', { size: 14 })}</span>
                <span>${cat.label}</span>
              </button>
            `).join('')}
          </div>

          <div style="min-width: 240px; position: relative;">
            <label for="presetSearchInput" class="sr-only" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0;">Search presets</label>
            <div style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none;">
              ${icon('search', { size: 15 })}
            </div>
            <input type="search" class="form-input" id="presetSearchInput" placeholder="Search themes, styles, or fonts..." aria-label="Search themes, styles, or fonts" style="width: 100%; border-radius: 9999px; padding-left: 2.3rem;" />
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
      const displayQuery = escapeHtml(this.searchQuery);
      grid.innerHTML = `
        <div class="empty-state-card" style="grid-column: 1 / -1; text-align: center; padding: 3.5rem 1.5rem; background: var(--bg-surface-elevated); border: 1px dashed var(--border-glass-strong); border-radius: var(--radius-xl); margin: 1rem 0;">
          <div style="margin-bottom: 0.75rem; color: var(--text-muted); display: flex; justify-content: center;" aria-hidden="true">
            ${icon('search', { size: 42 })}
          </div>
          <h3 style="font-size: 1.2rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.4rem;">
            ${displayQuery ? `No themes matching "${displayQuery}"` : 'No themes in this category'}
          </h3>
          <p style="font-size: 0.88rem; color: var(--text-secondary); max-width: 420px; margin: 0 auto 1.5rem auto; line-height: 1.5;">
            We couldn't find any presets matching your criteria. Reset your search or browse all categories to explore over 100 styles.
          </p>
          <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
            <button class="btn-primary" id="btnClearPresetSearch" style="padding: 0.5rem 1.25rem; font-size: 0.85rem; border-radius: var(--radius-full);">
              <span>${icon('x', { size: 14 })}</span>
              <span>Clear Search & Reset</span>
            </button>
          </div>
        </div>
      `;

      const btnClear = grid.querySelector('#btnClearPresetSearch');
      if (btnClear) {
        btnClear.addEventListener('click', () => {
          this.searchQuery = '';
          this.selectedCategory = 'all';
          const searchInput = this.containerEl.querySelector('#presetSearchInput');
          if (searchInput) searchInput.value = '';
          const catBar = this.containerEl.querySelector('#presetCategoryBar');
          if (catBar) {
            catBar.querySelectorAll('.category-chip').forEach(b => {
              b.classList.toggle('active', b.dataset.cat === 'all');
            });
          }
          this.renderCards();
        });
      }
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
