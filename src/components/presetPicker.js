/**
 * Preset Template Picker & Catalog
 * Enables switching between dozens of built-in and community-published themes,
 * with full custom theme CRUD (Edit in Studio, Duplicate, Delete, Import/Export JSON).
 */

import { PRESET_CATEGORIES } from '../data/defaultPresets.js';
import { StorageService } from '../services/storageService.js';
import { Toast } from './toast.js';
import { escapeHtml, sanitizeStyleValue } from '../utils/security.js';
import { icon } from '../utils/icons.js';

export class PresetPicker {
  constructor(containerEl, onSelectPreset, onEditInStudio) {
    this.containerEl = containerEl;
    this.onSelectPreset = onSelectPreset;
    this.onEditInStudio = onEditInStudio;
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
        <!-- Toolbar: Search, Categories & Import/Export -->
        <div class="presets-toolbar">
          <div class="category-filter-bar" id="presetCategoryBar">
            ${PRESET_CATEGORIES.map(cat => `
              <button class="category-chip ${this.selectedCategory === cat.id ? 'active' : ''}" data-cat="${cat.id}" role="button" aria-pressed="${this.selectedCategory === cat.id ? 'true' : 'false'}" aria-label="Filter presets by ${cat.label}">
                <span>${icon(cat.icon || 'sparkles', { size: 14 })}</span>
                <span>${cat.label}</span>
              </button>
            `).join('')}
          </div>

          <div class="presets-toolbar-right">
            <div style="min-width: 220px; position: relative;">
              <label for="presetSearchInput" class="sr-only" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0;">Search presets</label>
              <div style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none;">
                ${icon('search', { size: 15 })}
              </div>
              <input type="search" class="form-input" id="presetSearchInput" placeholder="Search themes, styles, fonts..." aria-label="Search themes, styles, or fonts" style="width: 100%; border-radius: 9999px; padding-left: 2.3rem;" />
            </div>

            <input type="file" id="inputImportPresetJson" accept=".json,application/json" style="display: none;" aria-label="Import Presets JSON" />
            <button type="button" class="preset-io-btn" id="btnImportPresets" title="Import Custom Themes from JSON file">
              <span>${icon('upload', { size: 13 })}</span>
              <span>Import</span>
            </button>
            <button type="button" class="preset-io-btn" id="btnExportPresets" title="Export all Custom Themes to JSON file">
              <span>${icon('download', { size: 13 })}</span>
              <span>Export</span>
            </button>
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
    catBar?.addEventListener('click', (e) => {
      const btn = e.target.closest('.category-chip');
      if (!btn) return;
      catBar.querySelectorAll('.category-chip').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      this.selectedCategory = btn.dataset.cat;
      this.renderCards();
    });

    // Search input
    const searchInput = this.containerEl.querySelector('#presetSearchInput');
    searchInput?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.renderCards();
    });

    // Import Themes JSON
    const btnImport = this.containerEl.querySelector('#btnImportPresets');
    const inputImport = this.containerEl.querySelector('#inputImportPresetJson');
    btnImport?.addEventListener('click', () => inputImport?.click());
    inputImport?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const res = StorageService.importTemplatesFromJSON(text);
        if (res.success) {
          Toast.show(`Imported ${res.count} custom themes successfully!`, 'success');
          this.renderCards();
        } else {
          Toast.show(`Failed to import: ${res.error}`, 'error');
        }
      } catch (err) {
        Toast.show('Error reading JSON file', 'error');
      } finally {
        inputImport.value = '';
      }
    });

    // Export Themes JSON
    const btnExport = this.containerEl.querySelector('#btnExportPresets');
    btnExport?.addEventListener('click', () => {
      const json = StorageService.exportTemplatesAsJSON();
      const customTemplates = StorageService.getCustomTemplates();
      if (!customTemplates.length) {
        Toast.show('No custom templates to export yet. Create one in Template Studio!', 'info');
        return;
      }
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quoteforge-custom-themes-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      Toast.show(`Exported ${customTemplates.length} custom themes!`, 'success');
    });
  }

  renderCards() {
    const grid = this.containerEl.querySelector('#presetsCardsGrid');
    if (!grid) return;
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

      const hasCard = preset.cardBackground && preset.cardBackground !== 'transparent';
      const cardBg = hasCard ? sanitizeStyleValue(preset.cardBackground, 'transparent') : 'transparent';
      const cardBorder = preset.borderColor ? sanitizeStyleValue(preset.borderColor, 'rgba(255,255,255,0.15)') : 'rgba(255, 255, 255, 0.12)';

      const cardInnerHtml = hasCard ? `
        <div class="preset-preview-inner-card" style="background: ${cardBg}; color: ${color}; padding: 10px 12px; border-radius: 6px; width: 100%; border: 1.5px solid ${cardBorder}; box-shadow: 0 4px 12px rgba(0,0,0,0.35); text-align: left; box-sizing: border-box;">
          <div class="preset-quote-sample" style="color: ${color}; font-size: 0.82rem; line-height: 1.35; margin-bottom: 6px;">${sampleQuote}</div>
          <div class="preset-author-sample" style="color: ${accent}; font-size: 0.72rem; opacity: 0.9;">— Leonardo da Vinci</div>
        </div>
      ` : `
        <div class="preset-quote-sample">${sampleQuote}</div>
        <div class="preset-author-sample" style="color: ${accent}">— Leonardo da Vinci</div>
      `;

      // Card action tools (Edit, Duplicate, Delete for Custom; Fork for Built-in)
      const toolsHtml = preset.isCustom ? `
        <div class="preset-card-tools">
          <button type="button" class="preset-tool-btn btn-preset-edit" data-id="${safeId}" title="Edit in Template Studio" aria-label="Edit in Template Studio">
            ${icon('edit', { size: 13 })}
          </button>
          <button type="button" class="preset-tool-btn btn-preset-copy" data-id="${safeId}" title="Duplicate this theme" aria-label="Duplicate theme">
            ${icon('copy', { size: 13 })}
          </button>
          <button type="button" class="preset-tool-btn danger btn-preset-delete" data-id="${safeId}" title="Delete custom theme" aria-label="Delete custom theme">
            ${icon('trash', { size: 13 })}
          </button>
        </div>
      ` : `
        <div class="preset-card-tools">
          <button type="button" class="preset-tool-btn btn-preset-fork" data-id="${safeId}" title="Customize in Template Studio" aria-label="Customize in Template Studio">
            ${icon('sparkles', { size: 13 })}
          </button>
        </div>
      `;

      return `
        <div class="preset-card ${isActive ? 'active-theme' : ''}" data-id="${safeId}">
          <div class="preset-preview-box" style="background: ${bgStyle}; color: ${color}; font-family: '${font}', sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 12px; box-sizing: border-box;">
            ${cardInnerHtml}
          </div>
          <div class="preset-card-footer">
            <div class="preset-name-wrap">
              <span class="preset-card-title">
                ${safeName}
                ${preset.isCustom ? '<span class="preset-custom-badge">Custom</span>' : ''}
              </span>
              <span class="preset-card-font">${font} • ${safeCategory}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              ${toolsHtml}
              <button type="button" class="btn-apply-theme" data-id="${safeId}" aria-label="Select ${safeName} theme">
                ${isActive ? 'Active' : 'Select'}
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach card clicks & stop propagation for action buttons
    grid.querySelectorAll('.preset-card').forEach(card => {
      const id = card.dataset.id;
      const selected = allPresets.find(p => p.id === id);
      if (!selected) return;

      // Select Card click
      card.addEventListener('click', (e) => {
        if (e.target.closest('.preset-tool-btn')) return;
        this.activePresetId = id;
        this.renderCards();
        if (this.onSelectPreset) {
          this.onSelectPreset(selected);
        }
        Toast.show(`Applied "${selected.name}" style!`, 'success');
      });

      // Edit in Studio
      const btnEdit = card.querySelector('.btn-preset-edit');
      btnEdit?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.onEditInStudio) {
          this.onEditInStudio(selected);
        }
      });

      // Fork / Customize Built-in in Studio
      const btnFork = card.querySelector('.btn-preset-fork');
      btnFork?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.onEditInStudio) {
          const forked = {
            ...selected,
            id: null,
            name: `${selected.name} (Custom)`,
            isCustom: true
          };
          this.onEditInStudio(forked);
          Toast.show(`Opened "${selected.name}" in Template Studio!`, 'info');
        }
      });

      // Duplicate Theme
      const btnCopy = card.querySelector('.btn-preset-copy');
      btnCopy?.addEventListener('click', (e) => {
        e.stopPropagation();
        const clone = StorageService.duplicateCustomTemplate(id);
        if (clone) {
          Toast.show(`Duplicated "${clone.name}"!`, 'success');
          this.renderCards();
        }
      });

      // Delete Theme
      const btnDelete = card.querySelector('.btn-preset-delete');
      btnDelete?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Are you sure you want to delete the "${selected.name}" theme?`)) {
          const ok = StorageService.deleteCustomTemplate(id);
          if (ok) {
            Toast.show(`Deleted "${selected.name}" theme`, 'info');
            this.renderCards();
          }
        }
      });
    });
  }
}
