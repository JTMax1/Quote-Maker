/**
 * 50 Dynamic Layouts Selector Drawer
 * Browse and switch between 50 distinct structural arrangements.
 */

import { LAYOUT_CATEGORIES, LAYOUT_STYLES } from '../data/defaultPresets.js';
import { Toast } from './toast.js';
import { escapeHtml } from '../utils/security.js';
import { icon } from '../utils/icons.js';

export class LayoutPicker {
  constructor(onSelectLayout) {
    this.onSelectLayout = onSelectLayout;
    this.selectedCategory = 'all';
    this.searchQuery = '';
    this.activeLayoutId = 'classic-centered';

    this.modalEl = null;
    this.render();
  }

  render() {
    const existing = document.getElementById('layoutPickerModal');
    if (existing) existing.remove();

    this.modalEl = document.createElement('div');
    this.modalEl.id = 'layoutPickerModal';
    this.modalEl.className = 'modal-backdrop';
    this.modalEl.setAttribute('role', 'dialog');
    this.modalEl.setAttribute('aria-modal', 'true');
    this.modalEl.setAttribute('aria-label', `${LAYOUT_STYLES.length} Quote Layout Rearrangements`);

    this.modalEl.innerHTML = `
      <div class="onboarding-card modal-card" style="max-width: 960px; max-height: 85vh;">
        <!-- Header -->
        <div class="stepper-header" style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 36px; height: 36px; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-glass-strong); display: flex; align-items: center; justify-content: center; color: var(--brand-primary);">
              ${icon('layout', { size: 20 })}
            </div>
            <div>
              <h2 style="font-size: 1.3rem; font-weight: 700; font-family: var(--font-display); margin: 0;">${LAYOUT_STYLES.length} Quote Layout Rearrangements</h2>
              <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0.2rem 0 0 0;">Select how quote text, author portraits, headers, and frames are structured.</p>
            </div>
          </div>
          <button class="btn-glass modal-close-btn" id="btnCloseLayoutPicker" style="padding: 0.4rem 0.65rem;" aria-label="Close layout selector">
            ${icon('x', { size: 16 })}
          </button>
        </div>

        <!-- Filter Bar -->
        <div style="padding: 1rem 1.5rem 0.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; border-bottom: 1px solid var(--border-glass);">
          <div class="category-filter-bar" id="layoutCategoryBar">
            ${LAYOUT_CATEGORIES.map(cat => `
              <button class="category-chip ${this.selectedCategory === cat.id ? 'active' : ''}" data-cat="${cat.id}">
                ${cat.label}
              </button>
            `).join('')}
          </div>
          <div style="position: relative;">
            <div style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none;">
              ${icon('search', { size: 14 })}
            </div>
            <input type="text" class="form-input" id="layoutSearchInput" placeholder="Search layouts..." aria-label="Search layouts" style="width: 210px; border-radius: 9999px; padding: 0.4rem 0.8rem 0.4rem 2rem;" />
          </div>
        </div>

        <!-- Layout Cards Grid -->
        <div class="step-body" style="overflow-y: auto; max-height: 520px; padding: 1.5rem;">
          <div class="presets-grid" id="layoutCardsGrid" style="grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem;">
            <!-- Dynamically populated -->
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modalEl);
    this.bindEvents();
    this.renderCards();
  }

  bindEvents() {
    this.modalEl.querySelector('#btnCloseLayoutPicker').addEventListener('click', () => this.close());

    // Backdrop click dismiss
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.close();
    });

    // Escape key listener
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modalEl.classList.contains('open')) {
        this.close();
      }
    });

    // Category Filter
    const catBar = this.modalEl.querySelector('#layoutCategoryBar');
    catBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.category-chip');
      if (!btn) return;
      catBar.querySelectorAll('.category-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.selectedCategory = btn.dataset.cat;
      this.renderCards();
    });

    // Search Input
    const searchInput = this.modalEl.querySelector('#layoutSearchInput');
    searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.renderCards();
    });
  }

  renderCards() {
    const grid = this.modalEl.querySelector('#layoutCardsGrid');

    let filtered = LAYOUT_STYLES;
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(l => l.category === this.selectedCategory);
    }
    if (this.searchQuery) {
      filtered = filtered.filter(l => 
        l.name.toLowerCase().includes(this.searchQuery) ||
        l.description.toLowerCase().includes(this.searchQuery)
      );
    }

    grid.innerHTML = filtered.map(layout => {
      const isActive = this.activeLayoutId === layout.id;
      const safeId = escapeHtml(layout.id);
      const safeName = escapeHtml(layout.name);
      const safeCategory = escapeHtml(layout.category);
      const safeDesc = escapeHtml(layout.description);

      return `
        <div class="preset-card ${isActive ? 'active-theme' : ''}" data-id="${safeId}" style="padding: 1.1rem; gap: 0.5rem; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <span style="width: 38px; height: 38px; border-radius: var(--radius-sm); background: var(--bg-surface-elevated); border: 1px solid var(--border-glass); display: flex; align-items: center; justify-content: center; color: var(--brand-primary); flex-shrink: 0;" aria-hidden="true">
              ${icon(layout.icon || 'layout', { size: 20 })}
            </span>
            <div>
              <div style="font-size: 0.95rem; font-weight: 700;">${safeName}</div>
              <span class="brand-badge" style="font-size: 0.65rem; padding: 0.1rem 0.4rem;">${safeCategory}</span>
            </div>
          </div>
          <p style="font-size: 0.78rem; color: var(--text-secondary); line-height: 1.4; margin: 0.25rem 0;">
            ${safeDesc}
          </p>
          <button class="btn-apply-theme" data-id="${safeId}" aria-label="Apply ${safeName} layout" style="align-self: flex-start; margin-top: 0.25rem; display: flex; align-items: center; gap: 0.35rem;">
            ${isActive ? icon('check', { size: 14 }) + ' <span>Active Layout</span>' : '<span>Apply Layout</span>'}
          </button>
        </div>
      `;
    }).join('');

    // Attach click events to card container only (avoids double triggering from child button)
    grid.querySelectorAll('.preset-card').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.id;
        if (id) {
          const selected = LAYOUT_STYLES.find(l => l.id === id);
          if (selected) {
            this.activeLayoutId = id;
            this.renderCards();
            if (this.onSelectLayout) {
              this.onSelectLayout(selected);
            }
            Toast.show(`Applied "${selected.name}" layout!`, 'success');
            this.close();
          }
        }
      });
    });
  }

  open(currentLayoutId) {
    if (currentLayoutId) this.activeLayoutId = currentLayoutId;
    this.renderCards();
    this.modalEl.classList.add('open');
  }

  close() {
    this.modalEl.classList.remove('open');
  }
}
