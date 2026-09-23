/**
 * IndexedDB Service for QuoteForge (QuoteForgeDB)
 * High-capacity offline binary storage for cutouts, user portraits, and high-res assets.
 * Solves the 5MB localStorage quota limit and avoids expired Object URLs.
 */

const DB_NAME = 'QuoteForgeDB';
const DB_VERSION = 1;
const STORE_NAME = 'images';

class DbService {
  constructor() {
    this.dbPromise = null;
  }

  async getDb() {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        resolve(null);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => {
        console.warn('IndexedDB unavailable:', e);
        resolve(null);
      };
    });

    return this.dbPromise;
  }

  /**
   * Stores an image (Blob, File, or base64 string) in IndexedDB
   * @param {string} id - Unique identifier
   * @param {Blob|File|string} imagePayload
   * @returns {Promise<string>} Saved image ID
   */
  async saveImage(id, imagePayload) {
    const db = await this.getDb();
    if (!db || !imagePayload) return id;

    let blobToStore = imagePayload;

    // Convert data URL to Blob if string
    if (typeof imagePayload === 'string' && imagePayload.startsWith('data:')) {
      try {
        const res = await fetch(imagePayload);
        blobToStore = await res.blob();
      } catch (e) {
        blobToStore = imagePayload;
      }
    }

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put({ id, data: blobToStore, updatedAt: Date.now() });
        tx.oncomplete = () => resolve(id);
        tx.onerror = () => resolve(id);
      } catch (err) {
        console.warn('Failed to put in IndexedDB:', err);
        resolve(id);
      }
    });
  }

  /**
   * Retrieves an image from IndexedDB and returns a usable Object URL or data string
   * @param {string} id 
   * @returns {Promise<string|null>}
   */
  async getImageUrl(id) {
    if (!id) return null;
    const db = await this.getDb();
    if (!db) return null;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(id);

        req.onsuccess = () => {
          const record = req.result;
          if (!record || !record.data) {
            resolve(null);
            return;
          }

          if (record.data instanceof Blob || record.data instanceof File) {
            const objectUrl = URL.createObjectURL(record.data);
            resolve(objectUrl);
          } else if (typeof record.data === 'string') {
            resolve(record.data);
          } else {
            resolve(null);
          }
        };

        req.onerror = () => resolve(null);
      } catch (err) {
        console.warn('Failed to read from IndexedDB:', err);
        resolve(null);
      }
    });
  }

  /**
   * Alias for getImageUrl for backward and cross-service compatibility
   * @param {string} id
   * @returns {Promise<string|null>}
   */
  async getImage(id) {
    return this.getImageUrl(id);
  }

  /**
   * Deletes an image record from IndexedDB
   * @param {string} id 
   */
  async deleteImage(id) {
    const db = await this.getDb();
    if (!db || !id) return;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch (e) {
        resolve();
      }
    });
  }
}

export const dbService = new DbService();
