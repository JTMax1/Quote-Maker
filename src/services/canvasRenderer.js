/**
 * High-DPI Canvas 2D Rendering Engine for QuoteForge
 * Supports 50 dynamic layout rearrangements, author cutouts with drop shadows,
 * circular avatars, and 100+ aesthetic themes.
 */

import { CANVAS_FORMATS, LAYOUT_STYLES } from '../data/defaultPresets.js';

export class CanvasRenderer {
  static imageCache = new Map();

  /**
   * Helper to ensure custom Google Fonts are loaded before canvas rendering
   */
  static async ensureFontsLoaded(fontFamilies = []) {
    if (!document.fonts) return;
    const promises = fontFamilies.map(font => {
      try {
        return document.fonts.load(`16px "${font}"`);
      } catch (e) {
        return Promise.resolve();
      }
    });
    await Promise.all(promises);
  }

  /**
   * Helper to load Image into HTMLImageElement with caching
   */
  static async loadImageAsync(src) {
    if (!src) return null;
    if (this.imageCache.has(src)) return this.imageCache.get(src);

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.imageCache.set(src, img);
        resolve(img);
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  /**
   * Render quote onto a newly created or target canvas element
   */
  static async renderToCanvas(data, targetCanvas = null) {
    const {
      quote = "Your quote here...",
      author = "Author Name",
      handle = "",
      category = "Wisdom",
      date = "Sep 2026",
      watermark = "QuoteForge",
      showAuthor = true,
      showDate = true,
      showCategory = true,
      showWatermark = true,
      showAuthorImage = false,
      authorImage = null,
      authorImagePlacement = 'auto',
      layoutId = 'classic-centered',
      ratio = "1:1",
      styles = {}
    } = data;

    const formatInfo = CANVAS_FORMATS.find(f => f.id === ratio) || CANVAS_FORMATS[0];
    const width = formatInfo.width;
    const height = formatInfo.height;

    // Resolve layout configuration
    const activeLayout = LAYOUT_STYLES.find(l => l.id === layoutId) || LAYOUT_STYLES[0];
    const effectivePlacement = authorImagePlacement !== 'auto' ? authorImagePlacement : activeLayout.portraitPlacement;

    // Load fonts and optional author image
    await this.ensureFontsLoaded([
      styles.fontFamily || 'Playfair Display',
      styles.authorFontFamily || 'Plus Jakarta Sans'
    ]);

    let loadedAuthorImg = null;
    if (showAuthorImage && authorImage) {
      loadedAuthorImg = await this.loadImageAsync(authorImage);
    }

    const canvas = targetCanvas || document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // 1. Draw Canvas Background (Solid, Gradient, Mesh, or Scrim)
    this.drawBackground(ctx, width, height, styles, activeLayout, loadedAuthorImg, effectivePlacement);

    // 2. Base Margins and Usable Canvas Area
    const padding = Math.round(width * 0.08);
    const cardX = padding;
    const cardY = padding;
    const cardW = width - padding * 2;
    const cardH = height - padding * 2;

    // 3. Draw Card Frame or Border Style
    this.drawCardFrame(ctx, cardX, cardY, cardW, cardH, styles, activeLayout);

    // 4. Content Area
    const innerPadding = Math.round(cardW * 0.07);
    let contentX = cardX + innerPadding;
    let contentY = cardY + innerPadding;
    let contentW = cardW - innerPadding * 2;
    let contentH = cardH - innerPadding * 2;

    // 5. If layout has a side cutout (Left or Right), allocate side space
    let quoteBoxX = contentX;
    let quoteBoxW = contentW;
    let cutoutX = 0;
    let cutoutY = 0;
    let cutoutW = 0;
    let cutoutH = 0;

    const hasSideCutout = loadedAuthorImg && (effectivePlacement === 'right' || effectivePlacement === 'left');
    if (hasSideCutout) {
      const cutoutWidthFactor = 0.38;
      cutoutW = Math.round(contentW * cutoutWidthFactor);
      cutoutH = Math.round(contentH * 0.82);
      cutoutY = contentY + contentH - cutoutH;

      if (effectivePlacement === 'right') {
        cutoutX = contentX + contentW - cutoutW + 20;
        quoteBoxW = contentW - cutoutW - 20;
      } else {
        cutoutX = contentX - 20;
        quoteBoxX = contentX + cutoutW + 20;
        quoteBoxW = contentW - cutoutW - 20;
      }
    } else if (loadedAuthorImg && effectivePlacement === 'bottom') {
      // Bottom pop out
      const bottomCutoutH = Math.round(height * 0.35);
      cutoutW = Math.round(bottomCutoutH * 0.85);
      cutoutH = bottomCutoutH;
      cutoutX = (width - cutoutW) / 2;
      cutoutY = height - cutoutH;
      contentH -= Math.round(bottomCutoutH * 0.4);
    }

    // 6. Draw Layout Specific Accents (Header, Drop Cap, Watermark, Terminal chrome)
    let currentY = contentY;
    const headerH = Math.round(height * 0.07);

    // Big Watermark Quote marks
    if (activeLayout.id === 'big-watermark') {
      ctx.save();
      ctx.font = `italic 380px "${styles.fontFamily || 'Playfair Display'}", serif`;
      ctx.fillStyle = styles.accentColor ? `${styles.accentColor}18` : 'rgba(255,255,255,0.06)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('“', width / 2, height / 2 - 40);
      ctx.restore();
    }

    // Terminal Code Window Header
    if (activeLayout.id === 'terminal-code') {
      this.drawTerminalChrome(ctx, cardX, cardY, cardW);
      currentY += 40;
    }

    // Draw Header (Category & Date)
    if ((showCategory || showDate) && activeLayout.id !== 'terminal-code') {
      this.drawHeader(ctx, {
        showCategory,
        category,
        showDate,
        date,
        x: quoteBoxX,
        y: currentY,
        width: quoteBoxW,
        styles,
        activeLayout
      });
      currentY += headerH;
    }

    // 7. Render Avatar (if layout uses avatar placement)
    if (loadedAuthorImg && (effectivePlacement === 'avatar-top' || effectivePlacement === 'avatar-center')) {
      const avatarSize = 100;
      const avatarX = quoteBoxX + (quoteBoxW - avatarSize) / 2;
      this.drawAvatar(ctx, loadedAuthorImg, avatarX, currentY, avatarSize, styles);
      currentY += avatarSize + 24;
    }

    // 8. Reserved Footer Height
    const footerReservedHeight = Math.round(height * 0.16);
    const availableQuoteHeight = (contentY + contentH) - currentY - footerReservedHeight;

    // 9. Draw Quote Text
    const quoteY = currentY + (availableQuoteHeight * 0.08);
    const maxQuoteH = availableQuoteHeight * 0.9;

    this.drawQuote(ctx, {
      quote,
      x: quoteBoxX,
      y: quoteY,
      width: quoteBoxW,
      maxHeight: maxQuoteH,
      styles,
      activeLayout
    });

    // 10. Draw Footer (Author & Watermark)
    const footerY = contentY + contentH - footerReservedHeight + (footerReservedHeight * 0.15);
    this.drawFooter(ctx, {
      showAuthor,
      author,
      handle,
      showWatermark,
      watermark,
      loadedAuthorImg: effectivePlacement === 'avatar-left' || effectivePlacement === 'avatar-bottom' ? loadedAuthorImg : null,
      x: quoteBoxX,
      y: footerY,
      width: quoteBoxW,
      styles,
      activeLayout
    });

    // 11. Draw Cutout Portrait over canvas (if present)
    if (loadedAuthorImg && (effectivePlacement === 'right' || effectivePlacement === 'left' || effectivePlacement === 'bottom')) {
      this.drawCutoutPortrait(ctx, loadedAuthorImg, cutoutX, cutoutY, cutoutW, cutoutH, styles);
    }

    return canvas;
  }

  /**
   * Draw Canvas Background
   */
  static drawBackground(ctx, width, height, styles, activeLayout, loadedAuthorImg, effectivePlacement) {
    ctx.save();

    // If Scrim Overlay mode and image provided
    if (effectivePlacement === 'scrim' && loadedAuthorImg) {
      ctx.drawImage(loadedAuthorImg, 0, 0, width, height);
      // Dark vignette scrim gradient
      const scrim = ctx.createLinearGradient(0, 0, 0, height);
      scrim.addColorStop(0, 'rgba(4, 7, 13, 0.7)');
      scrim.addColorStop(0.5, 'rgba(4, 7, 13, 0.85)');
      scrim.addColorStop(1, 'rgba(4, 7, 13, 0.98)');
      ctx.fillStyle = scrim;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
      return;
    }

    // 50/50 Split Canvas Background
    if (activeLayout.id === 'split-50') {
      ctx.fillStyle = styles.background || '#18181b';
      ctx.fillRect(0, 0, width / 2, height);
      ctx.fillStyle = styles.accentColor ? `${styles.accentColor}22` : '#27272a';
      ctx.fillRect(width / 2, 0, width / 2, height);
      ctx.restore();
      return;
    }

    // Dot Grid Background
    if (activeLayout.id === 'dotted-grid-bg') {
      ctx.fillStyle = styles.background || '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = styles.metaColor ? `${styles.metaColor}44` : 'rgba(0,0,0,0.12)';
      const dotSpacing = 40;
      for (let x = 20; x < width; x += dotSpacing) {
        for (let y = 20; y < height; y += dotSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
      return;
    }

    // Standard linear/radial gradient or solid
    if (styles.gradient && styles.gradient.startsWith('linear-gradient')) {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      if (styles.gradient.includes('#1b003a') || styles.gradient.includes('#ff5e62')) {
        grad.addColorStop(0, '#1b003a');
        grad.addColorStop(0.6, '#751268');
        grad.addColorStop(1, '#ff5e62');
      } else if (styles.gradient.includes('#090a0f')) {
        grad.addColorStop(0, '#090a0f');
        grad.addColorStop(0.5, '#17153b');
        grad.addColorStop(1, '#0f172a');
      } else if (styles.gradient.includes('#020617')) {
        grad.addColorStop(0, '#020617');
        grad.addColorStop(0.5, '#0c2b4e');
        grad.addColorStop(1, '#064e3b');
      } else if (styles.gradient.includes('#0f2027')) {
        grad.addColorStop(0, '#0f2027');
        grad.addColorStop(0.5, '#203a43');
        grad.addColorStop(1, '#2c5364');
      } else {
        grad.addColorStop(0, styles.background || '#18181b');
        grad.addColorStop(1, styles.accentColor || '#3b82f6');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else if (styles.gradient && styles.gradient.startsWith('radial-gradient')) {
      const grad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width * 0.8);
      grad.addColorStop(0, '#222019');
      grad.addColorStop(0.7, '#0f0e0c');
      grad.addColorStop(1, '#050506');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.fillStyle = styles.background || '#ffffff';
      ctx.fillRect(0, 0, width, height);
    }

    // Ambient glow for glass cards
    if (styles.cardStyle === 'glass' || styles.borderStyle === 'neon-glow') {
      const glowGrad = ctx.createRadialGradient(width * 0.85, height * 0.15, 10, width * 0.85, height * 0.15, width * 0.45);
      glowGrad.addColorStop(0, styles.accentColor ? `${styles.accentColor}33` : 'rgba(99, 102, 241, 0.25)');
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);
    }
    ctx.restore();
  }

  /**
   * Draw Card Frame or Border
   */
  static drawCardFrame(ctx, x, y, w, h, styles, activeLayout) {
    ctx.save();
    const borderStyle = styles.borderStyle || 'none';
    const cardStyle = styles.cardStyle || 'flat';
    const borderColor = styles.borderColor || 'rgba(0,0,0,0.1)';
    const cardBg = styles.cardBackground || 'transparent';

    const radius = borderStyle === 'rounded-soft' || cardStyle === 'glass' ? 32 : 16;

    // Fill card background if not transparent
    if (cardBg && cardBg !== 'transparent') {
      ctx.fillStyle = cardBg;
      this.roundRect(ctx, x, y, w, h, radius, true, false);
    }

    // Framed Inset Layout
    if (activeLayout.id === 'framed-inset') {
      ctx.strokeStyle = borderColor || styles.accentColor || '#6366f1';
      ctx.lineWidth = 2;
      this.roundRect(ctx, x + 20, y + 20, w - 40, h - 40, 8, false, true);
    }

    // Left accent bar
    if (activeLayout.id === 'left-accent-bar' || borderStyle === 'thick-left') {
      ctx.fillStyle = styles.accentColor || '#3b82f6';
      ctx.fillRect(x, y, 16, h);
    }

    // Border Styles
    if (borderStyle === 'double') {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 4;
      this.roundRect(ctx, x, y, w, h, 8, false, true);
      ctx.lineWidth = 1.5;
      this.roundRect(ctx, x + 12, y + 12, w - 24, h - 24, 6, false, true);
    } else if (borderStyle === 'neon-glow') {
      ctx.shadowColor = styles.accentColor || '#00f2fe';
      ctx.shadowBlur = 24;
      ctx.strokeStyle = styles.accentColor || '#00f2fe';
      ctx.lineWidth = 3;
      this.roundRect(ctx, x, y, w, h, radius, false, true);
    } else if (borderStyle === 'gold-inlay') {
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 2.5;
      this.roundRect(ctx, x, y, w, h, 12, false, true);
      this.drawCornerAccents(ctx, x, y, w, h, '#d4af37');
    } else if (borderStyle === 'brutalist-solid') {
      ctx.fillStyle = '#000000';
      ctx.fillRect(x + 14, y + 14, w, h);
      ctx.fillStyle = styles.cardBackground || '#ffffff';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 6;
      ctx.strokeRect(x, y, w, h);
    } else if (borderStyle === 'polaroid' || activeLayout.id === 'polaroid-photo') {
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.12)';
      ctx.shadowBlur = 28;
      ctx.shadowOffsetY = 14;
      this.roundRect(ctx, x, y, w, h, 14, true, false);
      ctx.strokeStyle = '#e7e5e4';
      ctx.lineWidth = 2;
      this.roundRect(ctx, x, y, w, h, 14, false, true);
    } else if (borderStyle === 'glass-rim') {
      ctx.strokeStyle = borderColor || 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 2;
      this.roundRect(ctx, x, y, w, h, radius, false, true);
    } else if (borderStyle === 'subtle-frame') {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 2;
      this.roundRect(ctx, x, y, w, h, 20, false, true);
    }

    ctx.restore();
  }

  /**
   * Draw decorative corners for classical/luxury borders
   */
  static drawCornerAccents(ctx, x, y, w, h, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    const len = 30;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(x - 8, y + len);
    ctx.lineTo(x - 8, y - 8);
    ctx.lineTo(x + len, y - 8);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(x + w + 8, y + len);
    ctx.lineTo(x + w + 8, y - 8);
    ctx.lineTo(x + w - len, y - 8);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(x - 8, y + h - len);
    ctx.lineTo(x - 8, y + h + 8);
    ctx.lineTo(x + len, y + h + 8);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(x + w + 8, y + h - len);
    ctx.lineTo(x + w + 8, y + h + 8);
    ctx.lineTo(x + w - len, y + h + 8);
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Draw Terminal Window Chrome (Traffic lights)
   */
  static drawTerminalChrome(ctx, x, y, w) {
    ctx.save();
    // Window header bar
    ctx.fillStyle = '#21262d';
    this.roundRect(ctx, x, y, w, 44, 12, true, false);

    // Three buttons (red, yellow, green)
    const btnRadius = 6;
    const btnY = y + 22;

    ctx.fillStyle = '#ff5f56';
    ctx.beginPath();
    ctx.arc(x + 24, btnY, btnRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffbd2e';
    ctx.beginPath();
    ctx.arc(x + 44, btnY, btnRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#27c93f';
    ctx.beginPath();
    ctx.arc(x + 64, btnY, btnRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Draw Circular Avatar Badge
   */
  static drawAvatar(ctx, img, x, y, size, styles) {
    ctx.save();
    const radius = size / 2;
    const cx = x + radius;
    const cy = y + radius;

    // Outer glow or border
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 4, 0, Math.PI * 2);
    ctx.fillStyle = styles.accentColor || '#3b82f6';
    ctx.fill();

    // Clip circle for image
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();

    ctx.drawImage(img, x, y, size, size);
    ctx.restore();
  }

  /**
   * Draw Cutout Portrait standing on canvas with natural drop shadow
   */
  static drawCutoutPortrait(ctx, img, x, y, w, h, styles) {
    ctx.save();
    // Subtle drop shadow for realism
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 32;
    ctx.shadowOffsetY = 16;

    // Aspect ratio fit
    const imgRatio = (img.naturalWidth || img.width) / (img.naturalHeight || img.height);
    let drawW = w;
    let drawH = drawW / imgRatio;

    if (drawH > h) {
      drawH = h;
      drawW = drawH * imgRatio;
    }

    const drawX = x + (w - drawW) / 2;
    const drawY = y + (h - drawH);

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.restore();
  }

  /**
   * Draw Header Badges (Category & Date)
   */
  static drawHeader(ctx, { showCategory, category, showDate, date, x, y, width, styles, activeLayout }) {
    ctx.save();
    const metaColor = styles.metaColor || '#71717a';
    const accentColor = styles.accentColor || '#3b82f6';
    const font = styles.authorFontFamily || 'Plus Jakarta Sans';

    // Category Pill / Tag
    if (showCategory && category) {
      const catText = category.toUpperCase();
      ctx.font = `700 24px "${font}", sans-serif`;
      ctx.textBaseline = 'middle';
      const textWidth = ctx.measureText(catText).width;

      if (styles.badgeStyle === 'neon-pill') {
        const pillW = textWidth + 36;
        const pillH = 44;
        ctx.fillStyle = `${accentColor}22`;
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 2;
        this.roundRect(ctx, x, y, pillW, pillH, 22, true, true);
        ctx.fillStyle = accentColor;
        ctx.fillText(catText, x + 18, y + pillH / 2);
      } else if (styles.badgeStyle === 'gold-badge') {
        ctx.fillStyle = accentColor;
        ctx.fillText(`✦ ${catText} ✦`, x, y + 20);
      } else if (styles.badgeStyle === 'bold-block') {
        const pillW = textWidth + 24;
        const pillH = 38;
        ctx.fillStyle = accentColor;
        ctx.fillRect(x, y, pillW, pillH);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(catText, x + 12, y + pillH / 2);
      } else if (styles.badgeStyle === 'brutalist-badge') {
        const pillW = textWidth + 24;
        const pillH = 40;
        ctx.fillStyle = '#000000';
        ctx.fillRect(x, y, pillW, pillH);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(catText, x + 12, y + pillH / 2);
      } else {
        const pillW = textWidth + 30;
        const pillH = 42;
        ctx.fillStyle = `${accentColor}18`;
        this.roundRect(ctx, x, y, pillW, pillH, 12, true, false);
        ctx.fillStyle = accentColor;
        ctx.fillText(catText, x + 15, y + pillH / 2);
      }
    }

    // Date
    if (showDate && date) {
      ctx.font = `500 24px "${font}", sans-serif`;
      ctx.fillStyle = metaColor;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(date, x + width, y + 21);
    }

    ctx.restore();
  }

  /**
   * Draw Quote text with auto-fitting font size and multi-line wrapping
   */
  static drawQuote(ctx, { quote, x, y, width, maxHeight, styles, activeLayout }) {
    ctx.save();
    let textAlign = styles.textAlign || 'center';
    if (activeLayout.id === 'right-aligned-minimal') textAlign = 'right';
    if (activeLayout.id === 'left-accent-bar' || activeLayout.id === 'cutout-right') textAlign = 'left';

    const textColor = styles.textColor || '#18181b';
    const accentColor = styles.accentColor || '#3b82f6';
    const fontFamily = styles.fontFamily || 'Playfair Display';
    const quoteMarkStyle = styles.quoteMarkStyle || 'classic';
    const lineHeightRatio = styles.lineHeight || 1.4;

    // Pull-Quote horizontal rule lines
    if (activeLayout.id === 'pull-quote-rules') {
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y - 24);
      ctx.lineTo(x + width, y - 24);
      ctx.stroke();
    }

    // Draw Quote Marks
    if (quoteMarkStyle === 'classic' && activeLayout.id !== 'big-watermark') {
      ctx.font = `italic 140px "Playfair Display", serif`;
      ctx.fillStyle = `${accentColor}44`;
      ctx.textAlign = textAlign === 'center' ? 'center' : 'left';
      ctx.textBaseline = 'top';
      const markX = textAlign === 'center' ? x + width / 2 : x;
      ctx.fillText('“', markX, y - 50);
    } else if (quoteMarkStyle === 'modern-brackets') {
      ctx.font = `600 54px "${fontFamily}", sans-serif`;
      ctx.fillStyle = accentColor;
      ctx.textAlign = 'left';
      ctx.fillText('//', x, y - 10);
    } else if (quoteMarkStyle === 'minimal-dash') {
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      const dashX = textAlign === 'center' ? x + width / 2 - 30 : x;
      ctx.moveTo(dashX, y - 10);
      ctx.lineTo(dashX + 60, y - 10);
      ctx.stroke();
    }

    // Dynamic Font Size Auto-Calculation
    let fontSize = Math.min(Math.round(width * 0.08), 84);
    if (activeLayout.id === 'billboard-heavy') fontSize = Math.min(Math.round(width * 0.11), 104);

    const minFontSize = 26;
    let lines = [];
    let calculatedLineHeight = fontSize * lineHeightRatio;

    while (fontSize >= minFontSize) {
      ctx.font = `600 ${fontSize}px "${fontFamily}", sans-serif`;
      lines = this.wrapText(ctx, `“${quote}”`, width);
      calculatedLineHeight = fontSize * lineHeightRatio;
      const totalBlockHeight = lines.length * calculatedLineHeight;

      if (totalBlockHeight <= maxHeight) {
        break;
      }
      fontSize -= 3;
    }

    // Render wrapped lines
    ctx.font = `600 ${fontSize}px "${fontFamily}", sans-serif`;
    ctx.fillStyle = textColor;
    ctx.textAlign = textAlign;
    ctx.textBaseline = 'top';

    const totalHeight = lines.length * calculatedLineHeight;
    const startY = y + Math.max(0, (maxHeight - totalHeight) / 2);

    let drawX = x + width / 2;
    if (textAlign === 'left') drawX = x;
    if (textAlign === 'right') drawX = x + width;

    lines.forEach((line, index) => {
      // Highlight marker effect
      if (activeLayout.id === 'highlight-marker' && index === 0) {
        const metrics = ctx.measureText(line);
        ctx.save();
        ctx.fillStyle = styles.accentColor ? `${styles.accentColor}55` : 'rgba(250, 204, 21, 0.45)';
        const hlX = textAlign === 'center' ? drawX - metrics.width / 2 : drawX;
        ctx.fillRect(hlX - 6, startY + (index * calculatedLineHeight) + (fontSize * 0.5), metrics.width + 12, fontSize * 0.45);
        ctx.restore();
      }
      ctx.fillText(line, drawX, startY + (index * calculatedLineHeight));
    });

    // Lower pull-quote line
    if (activeLayout.id === 'pull-quote-rules') {
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, startY + totalHeight + 24);
      ctx.lineTo(x + width, startY + totalHeight + 24);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Draw Author, Handle, and Watermark in Footer
   */
  static drawFooter(ctx, { showAuthor, author, handle, showWatermark, watermark, loadedAuthorImg, x, y, width, styles, activeLayout }) {
    ctx.save();
    let textAlign = styles.textAlign || 'center';
    if (activeLayout.id === 'right-aligned-minimal') textAlign = 'right';
    if (activeLayout.id === 'left-accent-bar' || activeLayout.id === 'cutout-right') textAlign = 'left';

    const textColor = styles.textColor || '#18181b';
    const accentColor = styles.accentColor || '#3b82f6';
    const metaColor = styles.metaColor || '#71717a';
    const font = styles.authorFontFamily || 'Plus Jakarta Sans';

    // Draw Small Avatar inside footer if configured
    let textOffsetX = 0;
    if (loadedAuthorImg) {
      const avSize = 56;
      this.drawAvatar(ctx, loadedAuthorImg, x, y - 6, avSize, styles);
      textOffsetX = avSize + 16;
      textAlign = 'left';
    }

    // Draw Author & Handle
    if (showAuthor && author) {
      let authorX = x + textOffsetX + (width - textOffsetX) / 2;
      if (textAlign === 'left') authorX = x + textOffsetX;
      if (textAlign === 'right') authorX = x + width;

      ctx.textAlign = textAlign;
      const authorText = `— ${author}`;
      ctx.font = `700 36px "${font}", sans-serif`;
      ctx.fillStyle = textColor;
      ctx.fillText(authorText, authorX, y);

      if (handle) {
        ctx.font = `500 24px "${font}", sans-serif`;
        ctx.fillStyle = accentColor || metaColor;
        ctx.fillText(handle, authorX, y + 44);
      }
    }

    // Watermark
    if (showWatermark && watermark) {
      ctx.font = `600 20px "${font}", sans-serif`;
      ctx.fillStyle = `${metaColor}88`;
      ctx.textAlign = 'right';
      ctx.fillText(watermark.toUpperCase(), x + width, y + 68);
    }

    ctx.restore();
  }

  /**
   * Word wrap helper
   */
  static wrapText(ctx, text, maxWidth) {
    const words = text.split(/\s+/);
    const lines = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    return lines;
  }

  /**
   * Rounded rect helper
   */
  static roundRect(ctx, x, y, width, height, radius, fill = true, stroke = false) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  /**
   * Export to high-res Blob
   */
  static async exportBlob(data, format = 'image/png', quality = 0.95) {
    const canvas = await this.renderToCanvas(data);
    return new Promise(resolve => {
      canvas.toBlob(blob => resolve(blob), format, quality);
    });
  }

  /**
   * Export to Data URL
   */
  static async exportDataURL(data, format = 'image/png', quality = 0.95) {
    const canvas = await this.renderToCanvas(data);
    return canvas.toDataURL(format, quality);
  }
}
