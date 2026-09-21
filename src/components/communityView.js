/**
 * Community Feed & Showcase Component
 * Browse quotes across categories, like, download, and remix visual styles.
 */

import { COMMUNITY_CATEGORIES } from '../data/sampleCommunity.js';
import { StorageService } from '../services/storageService.js';
import { ShareService } from '../services/shareService.js';
import { Toast } from './toast.js';

export class CommunityView {
  constructor(containerEl, onRemixStyle) {
    this.containerEl = containerEl;
    this.onRemixStyle = onRemixStyle;
    this.selectedCategory = 'all';

    this.render();
  }

  refresh() {
    this.renderCards();
  }

  render() {
    this.containerEl.innerHTML = `
      <div class="community-container">
        <!-- Hero Section -->
        <div class="community-hero">
          <div class="community-hero-text">
            <h1>Community Showcase</h1>
            <p>Discover quotes crafted by fellow thinkers and creators. Like, download, or remix any visual design style straight into your editor.</p>
          </div>
        </div>

        <!-- Categories Filter Bar -->
        <div class="category-filter-bar" id="commCategoryBar">
          ${COMMUNITY_CATEGORIES.map(cat => `
            <button class="category-chip ${this.selectedCategory === cat.id ? 'active' : ''}" data-cat="${cat.id}">
              <span>${cat.label}</span>
            </button>
          `).join('')}
        </div>

        <!-- Community Quotes Grid -->
        <div class="community-grid" id="commGrid">
          <!-- Dynamically populated -->
        </div>
      </div>
    `;

    this.bindEvents();
    this.renderCards();
  }

  bindEvents() {
    const catBar = this.containerEl.querySelector('#commCategoryBar');
    catBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.category-chip');
      if (!btn) return;
      catBar.querySelectorAll('.category-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.selectedCategory = btn.dataset.cat;
      this.renderCards();
    });

    const grid = this.containerEl.querySelector('#commGrid');
    grid.addEventListener('click', (e) => {
      // Like button click
      const likeBtn = e.target.closest('.like-btn');
      if (likeBtn) {
        const quoteId = likeBtn.dataset.id;
        const result = StorageService.toggleLike(quoteId);
        likeBtn.classList.toggle('liked', result.isLiked);
        const countSpan = likeBtn.querySelector('.like-count');
        if (countSpan) countSpan.textContent = result.count;
        return;
      }

      // Download button click
      const downloadBtn = e.target.closest('.btn-comm-download');
      if (downloadBtn) {
        const quoteId = downloadBtn.dataset.id;
        const community = StorageService.getCommunityQuotes();
        const item = community.find(c => c.id === quoteId);
        if (item) {
          StorageService.incrementDownloads(quoteId);
          ShareService.downloadImage({
            quote: item.quote,
            author: item.author,
            handle: item.handle,
            category: item.category,
            ratio: item.ratio,
            styles: item.customStyles || {}
          }, 'png');
        }
        return;
      }

      // Remix button click
      const remixBtn = e.target.closest('.btn-remix');
      if (remixBtn) {
        const quoteId = remixBtn.dataset.id;
        const community = StorageService.getCommunityQuotes();
        const item = community.find(c => c.id === quoteId);
        if (item && this.onRemixStyle) {
          this.onRemixStyle(item);
          Toast.show(`Remixing "${item.author}" style into editor!`, 'success');
        }
      }
    });
  }

  renderCards() {
    const grid = this.containerEl.querySelector('#commGrid');
    if (!grid) return;

    const community = StorageService.getCommunityQuotes();
    const likedIds = StorageService.getLikedQuotes();

    let filtered = community;
    if (this.selectedCategory !== 'all') {
      filtered = community.filter(c => c.category === this.selectedCategory);
    }

    grid.innerHTML = filtered.map(item => {
      const styles = item.customStyles || {};
      const bg = styles.gradient || styles.background || '#18181b';
      const color = styles.textColor || '#ffffff';
      const font = styles.fontFamily || 'Playfair Display';
      const isLiked = likedIds.includes(item.id);
      const initial = (item.creatorName || item.author || 'A')[0].toUpperCase();

      return `
        <div class="community-card" data-id="${item.id}">
          <div class="community-preview" style="background: ${bg}; color: ${color}; font-family: '${font}', sans-serif;">
            <span class="community-category-pill">${item.category || 'Wisdom'}</span>
            <div class="community-quote-text">“${item.quote}”</div>
            <div class="community-author-text" style="color: ${styles.accentColor || color}">— ${item.author}</div>
          </div>

          <div class="community-card-footer">
            <div class="creator-info">
              <div class="creator-avatar">${initial}</div>
              <span class="creator-name">${item.creatorName || item.handle || 'Creator'}</span>
            </div>

            <div class="community-actions">
              <button class="like-btn ${isLiked ? 'liked' : ''}" data-id="${item.id}" title="Like">
                <span>♥</span>
                <span class="like-count">${item.likes}</span>
              </button>
              <button class="history-action-btn btn-comm-download" data-id="${item.id}" title="Download Graphic">
                <span>⬇</span>
              </button>
              <button class="btn-remix" data-id="${item.id}" title="Remix style into editor">
                <span>⚡</span>
                <span>Remix</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
}
