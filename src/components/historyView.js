/**
 * Saved Quotes History Gallery View
 * Archive, re-download, copy, remix, or publish past creations.
 */

import { StorageService } from '../services/storageService.js';
import { ShareService } from '../services/shareService.js';
import { Toast } from './toast.js';
import { escapeHtml, sanitizeStyleValue } from '../utils/security.js';

export class HistoryView {
  constructor(containerEl, onRemixQuote, onGoToEditor) {
    this.containerEl = containerEl;
    this.onRemixQuote = onRemixQuote;
    this.onGoToEditor = onGoToEditor;
    this.render();
  }

  refresh() {
    this.render();
  }

  render() {
    const historyItems = StorageService.getHistory();

    if (historyItems.length === 0) {
      this.containerEl.innerHTML = `
        <div class="history-container">
          <div class="history-header-bar">
            <div class="history-title-wrap">
              <h2>Quote History</h2>
              <p>Your library of saved quote designs</p>
            </div>
          </div>
          <div class="history-empty-state">
            <div class="empty-icon">🎨</div>
            <div class="empty-title">No Quotes in Your History Yet</div>
            <p class="empty-desc">Whenever you download, copy, or save a quote from the creator, it will automatically appear here for easy re-downloading and community publishing.</p>
            <button class="btn-primary" id="btnHistoryStart" style="margin-top: 0.5rem;">
              Forge Your First Quote 🚀
            </button>
          </div>
        </div>
      `;

      this.containerEl.querySelector('#btnHistoryStart').addEventListener('click', () => {
        if (this.onGoToEditor) this.onGoToEditor();
      });
      return;
    }

    this.containerEl.innerHTML = `
      <div class="history-container">
        <div class="history-header-bar">
          <div class="history-title-wrap">
            <h2>Quote History (${historyItems.length})</h2>
            <p>Review, re-download, or share your past creations</p>
          </div>
        </div>

        <div class="history-grid" id="historyGrid">
          ${historyItems.map(item => {
            const styles = item.styles || {};
            const bg = styles.gradient || styles.background || '#18181b';
            const color = sanitizeStyleValue(styles.textColor, '#ffffff');
            const accent = sanitizeStyleValue(styles.accentColor, color);
            const font = sanitizeStyleValue(styles.fontFamily, 'Playfair Display');
            const safeQuote = escapeHtml(item.quote);
            const safeAuthor = escapeHtml(item.author || 'Anonymous');
            const safeRatio = escapeHtml(item.ratio || '1:1');
            const safeId = escapeHtml(item.id);

            return `
              <div class="history-card" data-id="${safeId}">
                <div class="history-preview" style="background: ${bg}; color: ${color}; font-family: '${font}', sans-serif;">
                  <span class="history-badge-ratio">${safeRatio}</span>
                  <div class="history-quote-text">“${safeQuote}”</div>
                  <div class="history-quote-author" style="color: ${accent}">— ${safeAuthor}</div>
                </div>

                <div class="history-card-actions">
                  <div style="display: flex; gap: 0.4rem;">
                    <button class="history-action-btn btn-redownload" data-id="${safeId}" title="Re-download" aria-label="Re-download quote ${safeAuthor}">
                      <span>⬇</span> Download
                    </button>
                    <button class="history-action-btn btn-remix-hist" data-id="${safeId}" title="Load in Editor" aria-label="Edit quote in canvas editor">
                      <span>✏️</span> Edit
                    </button>
                  </div>
                  <div style="display: flex; gap: 0.4rem;">
                    <button class="history-action-btn btn-publish-hist" data-id="${safeId}" title="Publish to Community" aria-label="Publish to community showcase">
                      <span>🌐</span>
                    </button>
                    <button class="history-action-btn btn-delete" data-id="${safeId}" title="Delete" aria-label="Delete quote from history">
                      <span>🗑</span>
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    this.pendingDeletes = new Map();
    this.bindEvents();
  }

  bindEvents() {
    const grid = this.containerEl.querySelector('#historyGrid');
    if (!grid) return;

    grid.addEventListener('click', (e) => {
      const target = e.target.closest('button');
      if (!target) return;

      const id = target.dataset.id;
      const historyItems = StorageService.getHistory();
      const item = historyItems.find(h => h.id === id);
      if (!item) return;

      if (target.classList.contains('btn-redownload')) {
        ShareService.downloadImage(item, 'png');
      } else if (target.classList.contains('btn-remix-hist')) {
        if (this.onRemixQuote) {
          this.onRemixQuote(item);
          Toast.show('Loaded quote into editor!', 'info');
        }
      } else if (target.classList.contains('btn-publish-hist')) {
        const profile = StorageService.getProfile();
        StorageService.publishToCommunity(item, profile);
        Toast.show('Published to Community Showcase! 🌟', 'success');
      } else if (target.classList.contains('btn-delete')) {
        const card = grid.querySelector(`.history-card[data-id="${id}"]`);
        if (!card) return;

        // Optimistic soft delete with undo grace period
        card.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.9)';

        setTimeout(() => {
          card.style.display = 'none';
        }, 250);

        const deleteTimeout = setTimeout(() => {
          StorageService.deleteFromHistory(id);
          this.pendingDeletes.delete(id);
          // If all items deleted, re-render empty state
          if (StorageService.getHistory().length === 0) {
            this.render();
          }
        }, 6000);

        this.pendingDeletes.set(id, deleteTimeout);

        Toast.show('Quote removed from history', 'info', {
          actionText: 'Undo',
          duration: 6000,
          onAction: () => {
            const timeout = this.pendingDeletes.get(id);
            if (timeout) {
              clearTimeout(timeout);
              this.pendingDeletes.delete(id);
            }
            card.style.display = '';
            requestAnimationFrame(() => {
              card.style.opacity = '1';
              card.style.transform = 'scale(1)';
            });
            Toast.show('Restored quote to history!', 'success');
          }
        });
      }
    });
  }
}

