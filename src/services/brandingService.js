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
  { id: 'top-left', label: 'Top Left', short: 'TL', icon: 'cornerUpLeft' },
  { id: 'top-center', label: 'Top Center', short: 'TC', icon: 'alignCenter' },
  { id: 'top-right', label: 'Top Right', short: 'TR', icon: 'cornerUpRight' },
  { id: 'bottom-left', label: 'Bottom Left', short: 'BL', icon: 'cornerDownLeft' },
  { id: 'bottom-center', label: 'Bottom Center', short: 'BC', icon: 'alignCenter' },
  { id: 'bottom-right', label: 'Bottom Right', short: 'BR', icon: 'cornerDownRight' }
];

export const BRANDING_SIZES = [
  { id: 'xs', label: 'XS', scale: 0.65 },
  { id: 's', label: 'S', scale: 0.8 },
  { id: 'm', label: 'M', scale: 1.0 },
  { id: 'l', label: 'L', scale: 1.25 },
  { id: 'xl', label: 'XL', scale: 1.55 },
  { id: 'xxl', label: '2XL', scale: 1.9 },
  { id: 'xxxl', label: '3XL', scale: 2.3 }
];

export const CANVAS_PLACEMENTS = [
  { id: 'top-left', label: 'Top Left', short: 'TL' },
  { id: 'top-center', label: 'Top Center', short: 'TC' },
  { id: 'top-right', label: 'Top Right', short: 'TR' },
  { id: 'bottom-left', label: 'Bottom Left', short: 'BL' },
  { id: 'bottom-center', label: 'Bottom Center', short: 'BC' },
  { id: 'bottom-right', label: 'Bottom Right', short: 'BR' }
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
