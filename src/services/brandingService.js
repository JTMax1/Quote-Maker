/**
 * Branding & Watermark Service
 * Manages custom logo persistence, branding styles, and badge configurations.
 */

import { dbService } from './dbService.js';
import { StorageService } from './storageService.js';

export const BRANDING_STYLES = [
  { id: 'text', label: 'Subtle Text', desc: 'Minimalist uppercase brand watermark' },
  { id: 'badge', label: 'Pill Badge', desc: 'Glassmorphic badge with emblem & handle' },
  { id: 'logo', label: 'Logo Emblem', desc: 'Custom uploaded logo graphic only' },
  { id: 'logo-text', label: 'Logo + Handle', desc: 'Custom logo emblem alongside handle' }
];

export const BRANDING_POSITIONS = [
  { id: 'bottom-right', label: 'Bottom Right', icon: 'cornerDownRight' },
  { id: 'bottom-left', label: 'Bottom Left', icon: 'cornerDownLeft' },
  { id: 'top-right', label: 'Top Right', icon: 'cornerUpRight' },
  { id: 'top-left', label: 'Top Left', icon: 'cornerUpLeft' },
  { id: 'footer-center', label: 'Footer Center', icon: 'alignCenter' }
];

export class BrandingService {
  static LOGO_KEY = 'custom_brand_logo';

  /**
   * Save custom logo to IndexedDB
   * @param {string|Blob} logoData Data URI or Blob
   */
  static async saveCustomLogo(logoData) {
    try {
      await dbService.saveImage(this.LOGO_KEY, logoData);
      return true;
    } catch (err) {
      console.warn('Failed to save brand logo to IndexedDB:', err);
      return false;
    }
  }

  /**
   * Load saved custom logo from IndexedDB
   * @returns {Promise<string|null>} Data URL or null
   */
  static async loadCustomLogo() {
    try {
      return await dbService.getImageUrl(this.LOGO_KEY);
    } catch (err) {
      console.warn('Failed to load brand logo from IndexedDB:', err);
      return null;
    }
  }

  /**
   * Remove custom logo from IndexedDB
   */
  static async clearCustomLogo() {
    try {
      await dbService.deleteImage(this.LOGO_KEY);
      return true;
    } catch (err) {
      console.warn('Failed to clear brand logo:', err);
      return false;
    }
  }
}
