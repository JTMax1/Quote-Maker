/**
 * Local storage manager for QuoteForge
 * Handles user profile, default signature preset, quote history,
 * custom design templates, and community interactions.
 */

import { INITIAL_COMMUNITY_QUOTES } from '../data/sampleCommunity.js';
import { DEFAULT_PRESETS } from '../data/defaultPresets.js';

const STORAGE_KEYS = {
  PROFILE: 'quoteforge_user_profile',
  HISTORY: 'quoteforge_quote_history',
  CUSTOM_TEMPLATES: 'quoteforge_custom_templates',
  COMMUNITY: 'quoteforge_community_quotes',
  LIKED_QUOTES: 'quoteforge_liked_quotes'
};

const DEFAULT_PROFILE = {
  name: 'Marcus Thinker',
  handle: '@thinker_quotes',
  bio: 'Curator of Timeless Wisdom',
  defaultRatio: '1:1',
  showDate: true,
  dateFormat: 'MMM YYYY',
  showAuthor: true,
  showCategory: true,
  showWatermark: true,
  watermarkText: 'QuoteForge',
  activePresetId: 'editorial-vogue',
  customPreset: null,
  onboarded: false
};

export class StorageService {
  static getProfile() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (!data) return { ...DEFAULT_PROFILE };
      return { ...DEFAULT_PROFILE, ...JSON.parse(data) };
    } catch (e) {
      console.error('Failed to load profile:', e);
      return { ...DEFAULT_PROFILE };
    }
  }

  static saveProfile(profile) {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile:', e);
    }
  }

  static getHistory() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load history:', e);
      return [];
    }
  }

  static saveToHistory(quoteItem) {
    try {
      const history = this.getHistory();
      // Ensure unique id and timestamp
      const itemWithMeta = {
        ...quoteItem,
        id: quoteItem.id || 'hist_' + Date.now(),
        createdAt: quoteItem.createdAt || new Date().toISOString()
      };
      // Prepend to show latest first
      const updated = [itemWithMeta, ...history.filter(h => h.id !== itemWithMeta.id)];
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated.slice(0, 100)));
      return itemWithMeta;
    } catch (e) {
      console.error('Failed to save quote to history:', e);
      return quoteItem;
    }
  }

  static deleteFromHistory(id) {
    try {
      const history = this.getHistory().filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
      return history;
    } catch (e) {
      console.error('Failed to delete history item:', e);
      return [];
    }
  }

  static getCustomTemplates() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_TEMPLATES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load custom templates:', e);
      return [];
    }
  }

  static saveCustomTemplate(template) {
    try {
      const templates = this.getCustomTemplates();
      const newTemplate = {
        ...template,
        id: template.id || 'tpl_' + Date.now(),
        isCustom: true,
        createdAt: new Date().toISOString()
      };
      const updated = [newTemplate, ...templates.filter(t => t.id !== newTemplate.id)];
      localStorage.setItem(STORAGE_KEYS.CUSTOM_TEMPLATES, JSON.stringify(updated));
      return newTemplate;
    } catch (e) {
      console.error('Failed to save custom template:', e);
      return template;
    }
  }

  static getAllPresets() {
    const custom = this.getCustomTemplates();
    return [...DEFAULT_PRESETS, ...custom];
  }

  static getCommunityQuotes() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMMUNITY);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.COMMUNITY, JSON.stringify(INITIAL_COMMUNITY_QUOTES));
        return [...INITIAL_COMMUNITY_QUOTES];
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load community quotes:', e);
      return [...INITIAL_COMMUNITY_QUOTES];
    }
  }

  static publishToCommunity(quoteItem, creatorProfile) {
    try {
      const community = this.getCommunityQuotes();
      const publishedItem = {
        id: 'pub_' + Date.now(),
        quote: quoteItem.quote,
        author: quoteItem.author || creatorProfile.name,
        category: quoteItem.category || 'Wisdom',
        handle: quoteItem.handle || creatorProfile.handle,
        date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        likes: 1,
        downloads: 0,
        creatorName: creatorProfile.name || 'Anonymous',
        ratio: quoteItem.ratio || '1:1',
        presetId: quoteItem.presetId,
        customStyles: quoteItem.styles || {},
        createdAt: new Date().toISOString()
      };
      const updated = [publishedItem, ...community];
      localStorage.setItem(STORAGE_KEYS.COMMUNITY, JSON.stringify(updated));
      return publishedItem;
    } catch (e) {
      console.error('Failed to publish to community:', e);
      return null;
    }
  }

  static getLikedQuotes() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LIKED_QUOTES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  static toggleLike(quoteId) {
    try {
      const liked = this.getLikedQuotes();
      const isLiked = liked.includes(quoteId);
      const updatedLiked = isLiked ? liked.filter(id => id !== quoteId) : [...liked, quoteId];
      localStorage.setItem(STORAGE_KEYS.LIKED_QUOTES, JSON.stringify(updatedLiked));

      // Update count in community list
      const community = this.getCommunityQuotes();
      const updatedCommunity = community.map(item => {
        if (item.id === quoteId) {
          return {
            ...item,
            likes: Math.max(0, item.likes + (isLiked ? -1 : 1))
          };
        }
        return item;
      });
      localStorage.setItem(STORAGE_KEYS.COMMUNITY, JSON.stringify(updatedCommunity));

      return { isLiked: !isLiked, count: updatedCommunity.find(i => i.id === quoteId)?.likes ?? 0 };
    } catch (e) {
      console.error('Failed to toggle like:', e);
      return { isLiked: false, count: 0 };
    }
  }

  static incrementDownloads(quoteId) {
    try {
      const community = this.getCommunityQuotes();
      const updated = community.map(item => {
        if (item.id === quoteId) {
          return { ...item, downloads: (item.downloads || 0) + 1 };
        }
        return item;
      });
      localStorage.setItem(STORAGE_KEYS.COMMUNITY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  }
}
