/**
 * Professional Font Picker Modal Component
 * Features:
 * - Curated Google Fonts with Category Filtering & Real-time Search
 * - "Preview with My Quote" Toggle: renders creator's actual words live
 * - 6 Signature Font Pairings (1-click dual Quote + Author pairing)
 * - Category-aware bulletproof font fallback stacks
 * - Lazy IntersectionObserver font preloader (network-friendly)
 * - Mobile-first responsive touch layout (WCAG compliant)
 */

import { FONT_CATEGORIES, CURATED_FONTS, FONT_PAIRINGS, FontLoaderService } from '../services/fontLoaderService.js';
import { escapeHtml } from '../utils/security.js';
import { icon } from '../utils/icons.js';

export class FontPickerModal {
  constructor(onSelectFont, onApplyPairing) {
    this.onSelectFont = onSelectFont;
    this.onApplyPairing = onApplyPairing;
    this.selectedCategory = 'all'; // 'all' | 'editorial' | 'sans' | 'serif' | 'handwriting' | 'mono' | 'pairings'
    this.searchQuery = '';
    this.currentTarget = 'quote'; // 'quote' | 'author'
    this.activeFont = 'Plus Jakarta Sans';
    this.currentQuoteText = 'We suffer more often in imagination than in reality.';
    this.previewWithQuote = true;
    this.observer = null;

    this.modalEl = null;
    FontLoaderService.ensureCatalogLoaded();
    this.render();
  }

  render() {
    this.modalEl = document.createElement('div');
    this.modalEl.className = 'modal-backdrop';
    this.modalEl.id = 'fontPickerModal';
    this.modalEl.setAttribute('role', 'dialog');
    this.modalEl.setAttribute('aria-modal', 'true');
    this.modalEl.setAttribute('aria-label', 'Google Fonts Typography Library');

    this.modalEl.innerHTML = `
      <div class="onboarding-card modal-card font-picker-modal-card" style="max-width: 920px; max-height: 88vh; display: flex; flex-direction: column; width: 95vw;">
        <!-- Header -->
        <div class="stepper-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-glass); padding-bottom: 0.85rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem; min-width: 0;">
            <div style="width: 38px; height: 38px; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-glass-strong); display: flex; align-items: center; justify-content: center; color: var(--brand-primary); flex-shrink: 0;">
              ${icon('type', { size: 20 })}
            </div>
            <div style="min-width: 0;">
              <h2 style="font-size: 1.25rem; font-weight: 700; font-family: var(--font-display); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Typography & Google Fonts Studio</h2>
              <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0.2rem 0 0 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" id="lblFontPickerTarget">
                Select a signature typeface for your quote
              </p>
            </div>
          </div>
          <button class="btn-glass modal-close-btn" id="btnCloseFontPicker" style="padding: 0.4rem 0.65rem;" aria-label="Close typography modal">
            ${icon('x', { size: 16 })}
          </button>
        </div>

        <!-- Filter, Toggle & Search Bar (Sticky controls) -->
        <div style="display: flex; flex-direction: column; gap: 0.65rem; padding: 0.85rem 1.5rem 0.65rem 1.5rem; border-bottom: 1px solid var(--border-glass); background: var(--bg-surface-elevated);">
          <!-- Top Row: Search + Preview Mode Toggle -->
          <div style="display: flex; gap: 0.75rem; justify-content: space-between; align-items: center; flex-wrap: wrap;">
            <!-- Search Input -->
            <div style="position: relative; flex: 1 1 240px; min-width: 180px;">
              <div style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none;">
                ${icon('search', { size: 14 })}
              </div>
              <input type="search" class="form-input" id="fontSearchInput" placeholder="Search fonts or styles..." aria-label="Search fonts" style="width: 100%; border-radius: 9999px; padding: 0.4rem 0.85rem 0.4rem 2.2rem; font-size: 0.82rem;" />
            </div>

            <!-- Preview Mode Pill Switch (UX Delight) -->
            <div style="display: flex; align-items: center; gap: 0.5rem; background: var(--bg-surface); padding: 0.25rem 0.65rem; border-radius: var(--radius-full); border: 1px solid var(--border-glass);">
              <label class="switch" for="togglePreviewQuote" style="transform: scale(0.85); margin: 0;">
                <input type="checkbox" id="togglePreviewQuote" ${this.previewWithQuote ? 'checked' : ''} aria-label="Preview with my active quote" />
                <span class="slider"></span>
              </label>
              <span style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); white-space: nowrap;" id="lblPreviewModeText">
                Preview with My Quote
              </span>
            </div>
          </div>

          <!-- Category Chips Bar (Touch-friendly & Horizontal-scrolling) -->
          <div class="category-filter-bar" id="fontCategoryFilterBar" style="gap: 0.4rem; overflow-x: auto; white-space: nowrap; -webkit-overflow-scrolling: touch; padding-bottom: 0.2rem; margin-bottom: 0; scrollbar-width: none;">
            ${FONT_CATEGORIES.map(cat => `
              <button class="category-chip ${this.selectedCategory === cat.id ? 'active' : ''}" data-cat="${cat.id}" style="padding: 0.35rem 0.75rem; font-size: 0.78rem; flex-shrink: 0;">
                <span>${cat.label}</span>
              </button>
            `).join('')}
            <button class="category-chip ${this.selectedCategory === 'pairings' ? 'active' : ''}" data-cat="pairings" style="padding: 0.35rem 0.75rem; font-size: 0.78rem; flex-shrink: 0; border-color: var(--brand-primary); color: var(--brand-primary);">
              <span>${icon('layers', { size: 13 })}</span>
              <span>Signature Pairings (6)</span>
            </button>
          </div>
        </div>

        <!-- Fonts Grid Container -->
        <div class="step-body" style="flex: 1; overflow-y: auto; padding: 1.25rem 1.5rem;">
          <div class="fonts-cards-grid" id="fontsCardsGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0.85rem;">
            <!-- Injected via renderFontCards -->
          </div>
        </div>

        <!-- Footer -->
        <div class="stepper-footer" style="border-top: 1px solid var(--border-glass); padding: 0.85rem 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
          <div style="font-size: 0.78rem; color: var(--text-muted); display: flex; align-items: baseline; gap: 0.35rem;">
            <span>Active ${this.currentTarget === 'author' ? 'Author' : 'Quote'} Font:</span>
            <strong style="color: var(--brand-primary); font-family: ${FontLoaderService.getFallbackStack(this.activeFont)}; font-size: 0.95rem;" id="lblActiveFontName">${escapeHtml(this.activeFont)}</strong>
          </div>
          <button class="btn-glass" id="btnCancelFontPicker" style="padding: 0.4rem 1.1rem; font-size: 0.82rem;">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.modalEl);
    this.bindEvents();
    this.initIntersectionObserver();
    this.renderFontCards();
  }

  initIntersectionObserver() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const family = entry.target.dataset.family;
            if (family) {
              FontLoaderService.loadFont(family);
            }
          }
        });
      }, { root: this.modalEl.querySelector('.step-body'), rootMargin: '120px' });
    }
  }

  renderFontCards() {
    const grid = this.modalEl.querySelector('#fontsCardsGrid');
    if (!grid) return;

    // Disconnect previous observer
    if (this.observer) this.observer.disconnect();

    // Mode 1: Curated Font Pairings
    if (this.selectedCategory === 'pairings') {
      const pairingPreview = this.previewWithQuote && this.currentQuoteText
        ? (this.currentQuoteText.length > 70 ? this.currentQuoteText.slice(0, 68) + '…' : this.currentQuoteText)
        : null;

      grid.innerHTML = FONT_PAIRINGS.map(p => `
        <div class="pairing-card" 
             data-pairing-id="${p.id}"
             tabindex="0"
             role="button"
             aria-label="Apply ${p.name} font pairing"
             style="background: var(--bg-surface-elevated); border: 1px solid var(--border-glass-strong); border-radius: var(--radius-md); padding: 1.1rem; cursor: pointer; display: flex; flex-direction: column; justify-content: space-between; gap: 0.85rem; transition: all var(--transition-fast); grid-column: span 1;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: baseline; gap: 0.5rem; flex-wrap: wrap;">
              <span style="font-weight: 700; font-size: 0.95rem; color: var(--brand-primary);">${escapeHtml(p.name)}</span>
              <span style="font-size: 0.72rem; color: var(--text-muted);">(${escapeHtml(p.quoteFont)} + ${escapeHtml(p.authorFont)})</span>
            </div>
            <span class="tab-badge" style="font-size: 0.65rem; background: rgba(99, 102, 241, 0.18); color: var(--brand-primary); flex-shrink: 0;">PAIRING</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.5rem; background: var(--bg-surface); padding: 0.85rem; border-radius: var(--radius-sm); border: 1px solid var(--border-glass);">
            <div style="font-family: ${FontLoaderService.getFallbackStack(p.quoteFont)}; font-size: 1.25rem; font-weight: 600; color: var(--text-primary); line-height: 1.35; word-break: break-word;">
              “${escapeHtml(pairingPreview || 'Great things never came from comfort zones.')}”
            </div>
            <div style="font-family: ${FontLoaderService.getFallbackStack(p.authorFont)}; font-size: 0.88rem; font-weight: 600; color: var(--brand-accent);">
              — Seneca (@stoicwisdom)
            </div>
          </div>

          <div style="font-size: 0.74rem; color: var(--text-secondary); line-height: 1.4;">
            ${escapeHtml(p.desc)}
          </div>

          <button class="btn-primary" data-pairing-id="${p.id}" style="width: 100%; justify-content: center; font-size: 0.8rem; padding: 0.45rem 0.85rem; border-radius: var(--radius-full);">
            <span>${icon('check', { size: 13 })}</span>
            <span>Apply Dual Pairing</span>
          </button>
        </div>
      `).join('');

      // Preload pairing fonts
      FONT_PAIRINGS.forEach(p => {
        FontLoaderService.loadFont(p.quoteFont);
        FontLoaderService.loadFont(p.authorFont);
      });

      grid.querySelectorAll('.pairing-card, .pairing-card button').forEach(el => {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          const card = e.target.closest('.pairing-card');
          const pId = card?.dataset.pairingId;
          const found = FONT_PAIRINGS.find(p => p.id === pId);
          if (found) {
            this.applyPairing(found);
          }
        });
      });
      return;
    }

    // Mode 2: Individual Font Cards
    const filtered = FontLoaderService.getFonts(this.selectedCategory, this.searchQuery);

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-secondary);">
          <div style="color: var(--text-muted); margin-bottom: 0.5rem;">${icon('search', { size: 36 })}</div>
          <p style="font-weight: 600; font-size: 1.05rem;">No fonts found matching "${escapeHtml(this.searchQuery)}"</p>
          <p style="font-size: 0.82rem; color: var(--text-muted);">Try a different search query or select another style category.</p>
        </div>
      `;
      return;
    }

    const previewText = this.previewWithQuote && this.currentQuoteText
      ? (this.currentQuoteText.length > 70 ? this.currentQuoteText.slice(0, 68) + '…' : this.currentQuoteText)
      : null;

    grid.innerHTML = filtered.map(f => {
      const isSelected = f.family.toLowerCase() === this.activeFont.toLowerCase();
      const fallbackStack = FontLoaderService.getFallbackStack(f.family);
      const displayText = previewText || f.sample;

      // Match exact registered weights so browser never skips custom font
      const titleWeight = f.weights.includes(600) ? 600 : (f.weights.includes(700) ? 700 : f.weights[0]);
      const specimenWeight = f.weights.includes(400) ? 400 : (f.weights.includes(500) ? 500 : f.weights[0]);

      return `
        <div class="font-sample-card ${isSelected ? 'selected' : ''}" 
             data-family="${escapeHtml(f.family)}"
             tabindex="0"
             role="button"
             aria-label="Select ${escapeHtml(f.family)} font"
             style="background: var(--bg-surface-elevated); border: 1px solid ${isSelected ? 'var(--brand-primary)' : 'var(--border-glass)'}; border-radius: var(--radius-md); padding: 1.1rem; cursor: pointer; display: flex; flex-direction: column; justify-content: space-between; gap: 0.85rem; transition: all var(--transition-fast); box-shadow: ${isSelected ? '0 0 0 1px var(--brand-primary), 0 4px 14px rgba(99, 102, 241, 0.25)' : 'none'};">
          <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 0.5rem;">
            <span class="font-card-title-preview" 
                  style="font-family: ${fallbackStack}; font-weight: ${titleWeight}; font-size: 1.1rem; color: ${isSelected ? 'var(--brand-primary)' : 'var(--text-primary)'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: 0.01em;">
              ${escapeHtml(f.family)}
            </span>
            <span class="tab-badge" style="font-size: 0.65rem; text-transform: uppercase; padding: 0.15rem 0.45rem; flex-shrink: 0;">${escapeHtml(f.category)}</span>
          </div>
          
          <div class="font-preview-specimen" 
               style="font-family: ${fallbackStack}; font-weight: ${specimenWeight}; font-size: 1.25rem; line-height: 1.4; color: var(--text-secondary); min-height: 56px; display: flex; align-items: center; word-break: break-word;">
            “${escapeHtml(displayText)}”
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.2rem;">
            <span style="font-size: 0.7rem; color: var(--text-muted);">${f.weights.length} weights (${f.weights.join(', ')})</span>
            <span style="font-size: 0.76rem; font-weight: 600; color: ${isSelected ? 'var(--brand-primary)' : 'var(--text-muted)'}; display: flex; align-items: center; gap: 0.25rem;">
              ${isSelected ? icon('check', { size: 12 }) + ' Active' : 'Apply'}
            </span>
          </div>
        </div>
      `;
    }).join('');

    // Preload font binaries for displayed cards
    filtered.forEach(f => {
      const weight = f.weights.includes(400) ? 400 : f.weights[0];
      if (document.fonts && document.fonts.load) {
        document.fonts.load(`${weight} 16px "${f.family}"`).catch(() => {});
      }
    });

    // Attach IntersectionObserver for lazy on-demand network loading
    grid.querySelectorAll('.font-sample-card').forEach(card => {
      const family = card.dataset.family;
      if (this.observer) {
        this.observer.observe(card);
      }
      card.addEventListener('mouseenter', () => FontLoaderService.loadFont(family));
      card.addEventListener('click', () => this.selectFont(family));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.selectFont(family);
        }
      });
    });
  }

  async selectFont(family) {
    this.activeFont = family;
    const lblActive = this.modalEl.querySelector('#lblActiveFontName');
    if (lblActive) {
      lblActive.textContent = family;
      lblActive.style.fontFamily = FontLoaderService.getFallbackStack(family);
    }

    // Guarantee font is loaded before dispatching
    await FontLoaderService.loadFont(family);

    if (this.onSelectFont) {
      this.onSelectFont(family, this.currentTarget);
    }
    this.close();
  }

  async applyPairing(pairing) {
    await Promise.all([
      FontLoaderService.loadFont(pairing.quoteFont),
      FontLoaderService.loadFont(pairing.authorFont)
    ]);

    if (this.onApplyPairing) {
      this.onApplyPairing(pairing);
    } else if (this.onSelectFont) {
      // Fallback
      this.onSelectFont(pairing.quoteFont, 'quote');
    }
    this.close();
  }

  bindEvents() {
    const closeBtn = this.modalEl.querySelector('#btnCloseFontPicker');
    const cancelBtn = this.modalEl.querySelector('#btnCancelFontPicker');
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());
    if (cancelBtn) cancelBtn.addEventListener('click', () => this.close());

    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modalEl.classList.contains('open')) {
        this.close();
      }
    });

    // Toggle Preview Mode
    const togglePreview = this.modalEl.querySelector('#togglePreviewQuote');
    const lblPreview = this.modalEl.querySelector('#lblPreviewModeText');
    if (togglePreview) {
      togglePreview.addEventListener('change', (e) => {
        this.previewWithQuote = e.target.checked;
        if (lblPreview) {
          lblPreview.textContent = this.previewWithQuote ? 'Preview with My Quote' : 'Default Specimens';
        }
        this.renderFontCards();
      });
    }

    // Category filter chips
    const catBar = this.modalEl.querySelector('#fontCategoryFilterBar');
    if (catBar) {
      catBar.addEventListener('click', (e) => {
        const chip = e.target.closest('.category-chip');
        if (!chip) return;
        catBar.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.selectedCategory = chip.dataset.cat || 'all';
        this.renderFontCards();
      });
    }

    // Search input with debounce
    const searchInput = this.modalEl.querySelector('#fontSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        if (this.selectedCategory === 'pairings' && this.searchQuery) {
          this.selectedCategory = 'all';
          catBar?.querySelectorAll('.category-chip').forEach(c => {
            c.classList.toggle('active', c.dataset.cat === 'all');
          });
        }
        this.renderFontCards();
      });
    }
  }

  open(activeFont = 'Plus Jakarta Sans', target = 'quote', quoteText = '', initialCategory = null) {
    this.activeFont = activeFont;
    this.currentTarget = target;
    if (quoteText && quoteText.trim() !== '') {
      this.currentQuoteText = quoteText;
    }
    FontLoaderService.ensureCatalogLoaded();

    if (initialCategory) {
      this.selectedCategory = initialCategory;
      const catBar = this.modalEl.querySelector('#fontCategoryFilterBar');
      if (catBar) {
        catBar.querySelectorAll('.category-chip').forEach(c => {
          c.classList.toggle('active', c.dataset.cat === initialCategory);
        });
      }
    }

    const lblTarget = this.modalEl.querySelector('#lblFontPickerTarget');
    if (lblTarget) {
      lblTarget.textContent = target === 'author' 
        ? 'Choose a signature font for the author name & handle' 
        : 'Choose a signature typeface for the quote text';
    }
    const lblActive = this.modalEl.querySelector('#lblActiveFontName');
    if (lblActive) {
      lblActive.textContent = activeFont;
      lblActive.style.fontFamily = FontLoaderService.getFallbackStack(activeFont);
    }

    this.renderFontCards();
    this.modalEl.classList.add('open');
  }

  close() {
    this.modalEl.classList.remove('open');
  }
}
