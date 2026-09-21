/**
 * Sharing, Clipboard, and File Download Service
 */

import { CanvasRenderer } from './canvasRenderer.js';
import { Toast } from '../components/toast.js';

export class ShareService {
  /**
   * Download rendered quote as PNG or WebP
   */
  static async downloadImage(quoteData, format = 'png', scale = 2) {
    try {
      Toast.show('Generating 2x high-res image...', 'info');
      const mimeType = format === 'webp' ? 'image/webp' : 'image/png';
      const blob = await CanvasRenderer.exportBlob(quoteData, mimeType, 0.95, scale);

      if (!blob) {
        Toast.show('Failed to generate image', 'error');
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = `quote-${(quoteData.author || 'quoteforge').toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${format}`;
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      Toast.show(`Saved ${filename} (Retina 2x)!`, 'success');
    } catch (e) {
      console.error('Download error:', e);
      Toast.show('Could not download image', 'error');
    }
  }

  /**
   * Copy image Blob directly to system clipboard
   */
  static async copyImageToClipboard(quoteData) {
    try {
      Toast.show('Rendering to clipboard...', 'info');
      const blob = await CanvasRenderer.exportBlob(quoteData, 'image/png');

      if (!navigator.clipboard || !window.ClipboardItem) {
        // Fallback: Copy quote text to clipboard
        await navigator.clipboard.writeText(`"${quoteData.quote}" — ${quoteData.author}`);
        Toast.show('Quote text copied to clipboard!', 'info');
        return;
      }

      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      Toast.show('Image copied to clipboard! Ready to paste.', 'success');
    } catch (e) {
      console.error('Clipboard error:', e);
      // Fallback
      try {
        await navigator.clipboard.writeText(`"${quoteData.quote}" — ${quoteData.author}`);
        Toast.show('Quote text copied to clipboard!', 'info');
      } catch (err) {
        Toast.show('Clipboard access denied', 'error');
      }
    }
  }

  /**
   * Native device Web Share API
   */
  static async shareQuote(quoteData) {
    try {
      const blob = await CanvasRenderer.exportBlob(quoteData, 'image/png');
      const filename = `quote-${Date.now()}.png`;
      const file = new File([blob], filename, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Quote by ${quoteData.author || 'QuoteForge'}`,
          text: `"${quoteData.quote}" — ${quoteData.author}`
        });
        Toast.show('Shared successfully!', 'success');
      } else if (navigator.share) {
        await navigator.share({
          title: `Quote by ${quoteData.author || 'QuoteForge'}`,
          text: `"${quoteData.quote}" — ${quoteData.author}`
        });
        Toast.show('Shared successfully!', 'success');
      } else {
        // Fallback to clipboard
        await this.copyImageToClipboard(quoteData);
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error('Share error:', e);
        Toast.show('Unable to open share sheet', 'error');
      }
    }
  }
}
