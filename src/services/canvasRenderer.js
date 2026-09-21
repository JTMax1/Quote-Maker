/**
 * High-DPI Canvas 2D Rendering Engine for QuoteForge
 * Supports:
 * - 50 Dynamic Layout Rearrangements
 * - 50 Portrait Placements on Canvas
 * - Abstract Geometric Background Line Art (subtle & non-intrusive)
 * - Transparent Cutout Drop Shadows & Portals
 */

import { CANVAS_FORMATS, LAYOUT_STYLES, PORTRAIT_PLACEMENTS } from '../data/defaultPresets.js';

export class CanvasRenderer {
  static imageCache = new Map();

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

    const activeLayout = LAYOUT_STYLES.find(l => l.id === layoutId) || LAYOUT_STYLES[0];
    const effectivePlacement = authorImagePlacement !== 'auto' 
      ? authorImagePlacement 
      : (activeLayout.portraitPlacement || 'cutout-right');

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

    // 1. Draw Canvas Background (with subtle abstract geometric line art)
    this.drawBackground(ctx, width, height, styles, activeLayout, loadedAuthorImg, effectivePlacement);

    // 2. Base Dimensions
    const padding = Math.round(width * 0.08);
    let cardX = padding;
    let cardY = padding;
    let cardW = width - padding * 2;
    let cardH = height - padding * 2;

    // Polaroid layout adjust card bounds
    if (activeLayout.id === 'polaroid-photo') {
      cardY = Math.round(height * 0.05);
      cardH = Math.round(height * 0.9);
    }

    // 3. Draw Card Frame
    this.drawCardFrame(ctx, cardX, cardY, cardW, cardH, styles, activeLayout);

    // 4. Content Area
    const innerPadding = Math.round(cardW * 0.07);
    let contentX = cardX + innerPadding;
    let contentY = cardY + innerPadding;
    let contentW = cardW - innerPadding * 2;
    let contentH = cardH - innerPadding * 2;

    // 5. Layout-Driven Space Partitioning
    let quoteBoxX = contentX;
    let quoteBoxW = contentW;
    let cutoutX = 0;
    let cutoutY = 0;
    let cutoutW = 0;
    let cutoutH = 0;

    const isSideCutout = loadedAuthorImg && (
      effectivePlacement === 'cutout-right' || 
      effectivePlacement === 'cutout-left' || 
      effectivePlacement === 'cutout-edge-left' ||
      effectivePlacement === 'cutout-edge-right'
    );

    if (isSideCutout) {
      const cutoutWidthFactor = 0.38;
      cutoutW = Math.round(contentW * cutoutWidthFactor);
      cutoutH = Math.round(contentH * 0.85);
      cutoutY = contentY + contentH - cutoutH;

      if (effectivePlacement === 'cutout-right' || effectivePlacement === 'cutout-edge-right') {
        cutoutX = contentX + contentW - cutoutW + 10;
        quoteBoxW = contentW - cutoutW - 20;
      } else {
        cutoutX = contentX - 10;
        quoteBoxX = contentX + cutoutW + 20;
        quoteBoxW = contentW - cutoutW - 20;
      }
    } else if (loadedAuthorImg && (effectivePlacement === 'cutout-bottom' || effectivePlacement === 'cutout-bottom-left' || effectivePlacement === 'cutout-bottom-right')) {
      const bottomCutoutH = Math.round(height * 0.35);
      cutoutW = Math.round(bottomCutoutH * 0.85);
      cutoutH = bottomCutoutH;
      cutoutY = height - cutoutH;

      if (effectivePlacement === 'cutout-bottom-left') {
        cutoutX = contentX;
      } else if (effectivePlacement === 'cutout-bottom-right') {
        cutoutX = contentX + contentW - cutoutW;
      } else {
        cutoutX = (width - cutoutW) / 2;
      }
      contentH -= Math.round(bottomCutoutH * 0.35);
    }

    // 6. Header
    let currentY = contentY;
    const headerH = Math.round(height * 0.07);

    // Magazine Masthead
    if (activeLayout.id === 'magazine-cover') {
      this.drawMagazineMasthead(ctx, contentX, currentY, contentW, styles);
      currentY += 80;
    }

    // Terminal Code Window Header
    if (activeLayout.id === 'terminal-code') {
      this.drawTerminalChrome(ctx, cardX, cardY, cardW);
      currentY += 44;
    }

    // Big Watermark
    if (activeLayout.id === 'big-watermark') {
      ctx.save();
      ctx.font = `italic 380px "${styles.fontFamily || 'Playfair Display'}", serif`;
      ctx.fillStyle = styles.accentColor ? `${styles.accentColor}18` : 'rgba(255,255,255,0.06)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('“', width / 2, height / 2 - 40);
      ctx.restore();
    }

    // Header Badges
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

    // 7. Render Avatar (Top/Center Placements)
    const isTopAvatar = loadedAuthorImg && (
      effectivePlacement === 'avatar-top-center' || 
      effectivePlacement === 'avatar-top-left' || 
      effectivePlacement === 'avatar-top-right' ||
      effectivePlacement === 'oval-cameo-center' ||
      effectivePlacement === 'hexagon-badge-top' ||
      effectivePlacement === 'arch-portal-center'
    );

    if (isTopAvatar) {
      const avatarSize = 110;
      let avX = quoteBoxX + (quoteBoxW - avatarSize) / 2;
      if (effectivePlacement === 'avatar-top-left') avX = quoteBoxX;
      if (effectivePlacement === 'avatar-top-right') avX = quoteBoxX + quoteBoxW - avatarSize;

      this.drawAvatarPlacement(ctx, loadedAuthorImg, avX, currentY, avatarSize, effectivePlacement, styles);
      currentY += avatarSize + 24;
    }

    // 8. Reserved Footer Height
    const footerReservedHeight = Math.round(height * 0.16);
    const availableQuoteHeight = (contentY + contentH) - currentY - footerReservedHeight;

    // 9. Draw Quote Text
    const quoteY = currentY + (availableQuoteHeight * 0.08);
    const maxQuoteH = availableQuoteHeight * 0.88;

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
    const isBottomAvatar = loadedAuthorImg && (
      effectivePlacement === 'avatar-bottom-left' || 
      effectivePlacement === 'avatar-bottom-right' || 
      effectivePlacement === 'avatar-bottom-center' ||
      effectivePlacement === 'avatar-mid-left'
    );

    this.drawFooter(ctx, {
      showAuthor,
      author,
      handle,
      showWatermark,
      watermark,
      loadedAuthorImg: isBottomAvatar ? loadedAuthorImg : null,
      x: quoteBoxX,
      y: footerY,
      width: quoteBoxW,
      styles,
      activeLayout,
      effectivePlacement
    });

    // 11. Draw Cutout Portrait
    if (loadedAuthorImg && (isSideCutout || effectivePlacement.startsWith('cutout-bottom'))) {
      this.drawCutoutPortrait(ctx, loadedAuthorImg, cutoutX, cutoutY, cutoutW, cutoutH, styles);
    }

    return canvas;
  }

  /**
   * Draw Canvas Background with optional Abstract Lines & Geometry
   */
  static drawBackground(ctx, width, height, styles, activeLayout, loadedAuthorImg, effectivePlacement) {
    ctx.save();

    // Scrim overlay mode
    if ((effectivePlacement === 'scrim' || effectivePlacement === 'scrim-radial') && loadedAuthorImg) {
      ctx.drawImage(loadedAuthorImg, 0, 0, width, height);
      const scrim = ctx.createLinearGradient(0, 0, 0, height);
      scrim.addColorStop(0, 'rgba(4, 7, 13, 0.7)');
      scrim.addColorStop(0.5, 'rgba(4, 7, 13, 0.85)');
      scrim.addColorStop(1, 'rgba(4, 7, 13, 0.98)');
      ctx.fillStyle = scrim;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
      return;
    }

    // Split 50%
    if (activeLayout.id === 'split-50' || effectivePlacement === 'half-screen-left') {
      ctx.fillStyle = styles.background || '#18181b';
      ctx.fillRect(0, 0, width / 2, height);
      ctx.fillStyle = styles.accentColor ? `${styles.accentColor}22` : '#27272a';
      ctx.fillRect(width / 2, 0, width / 2, height);
    } else if (styles.gradient && styles.gradient.startsWith('linear-gradient')) {
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

    // DRAW ABSTRACT LINES & GEOMETRY (subtle, delicate, non-overshadowing)
    const pattern = styles.abstractPattern;
    if (pattern) {
      this.drawAbstractPattern(ctx, width, height, pattern, styles.accentColor || '#6366f1');
    }

    ctx.restore();
  }

  /**
   * Draw subtle abstract geometric background lines
   */
  static drawAbstractPattern(ctx, width, height, pattern, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.4;
    ctx.globalAlpha = 0.16; // soft subtle opacity to never overshadow text

    if (pattern === 'orbital-rings') {
      const cx = width * 0.75;
      const cy = height * 0.35;
      for (let r = 80; r <= 420; r += 70) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Tilted orbital ellipse
      ctx.beginPath();
      ctx.ellipse(width * 0.4, height * 0.6, 320, 140, Math.PI / 4, 0, Math.PI * 2);
      ctx.stroke();
    } else if (pattern === 'fibonacci') {
      let r = 20;
      let x = width * 0.6;
      let y = height * 0.55;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let angle = 0; angle < Math.PI * 6; angle += 0.1) {
        r = 15 * Math.exp(0.18 * angle);
        const px = x + r * Math.cos(angle);
        const py = y + r * Math.sin(angle);
        ctx.lineTo(px, py);
      }
      ctx.stroke();
    } else if (pattern === 'celestial') {
      const cx = width * 0.8;
      const cy = height * 0.25;
      ctx.beginPath();
      ctx.arc(cx, cy, 180, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 220, cy);
      ctx.lineTo(cx + 220, cy);
      ctx.moveTo(cx, cy - 220);
      ctx.lineTo(cx, cy + 220);
      ctx.stroke();
    } else if (pattern === 'zen-waves') {
      for (let y = height * 0.65; y < height + 60; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= width; x += 30) {
          const dy = Math.sin(x * 0.015 + y * 0.05) * 20;
          ctx.lineTo(x, y + dy);
        }
        ctx.stroke();
      }
    } else if (pattern === 'isometric') {
      const spacing = 60;
      for (let x = -width; x < width * 2; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + height * 0.577, height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x - height * 0.577, height);
        ctx.stroke();
      }
    } else if (pattern === 'sunburst') {
      const ox = width * 0.5;
      const oy = 0;
      for (let angle = 0; angle < Math.PI; angle += Math.PI / 18) {
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(ox + Math.cos(angle) * width * 1.5, oy + Math.sin(angle) * height * 1.5);
        ctx.stroke();
      }
    } else if (pattern === 'mandala') {
      const cx = width / 2;
      const cy = height / 2;
      for (let i = 0; i < 8; i++) {
        const ang = (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(ang) * 90, cy + Math.sin(ang) * 90, 140, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (pattern === 'diagonal-hatch') {
      for (let p = -height; p < width + height; p += 36) {
        ctx.beginPath();
        ctx.moveTo(p, 0);
        ctx.lineTo(p + height, height);
        ctx.stroke();
      }
    } else if (pattern === 'topography') {
      for (let y = height * 0.2; y <= height * 0.9; y += 75) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(width * 0.25, y - 40, width * 0.75, y + 40, width, y);
        ctx.stroke();
      }
    } else if (pattern === 'perspective') {
      const vpX = width / 2;
      const vpY = height * 0.45;
      for (let x = 0; x <= width; x += 90) {
        ctx.beginPath();
        ctx.moveTo(vpX, vpY);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  /**
   * Draw Magazine Cover Top Masthead
   */
  static drawMagazineMasthead(ctx, x, y, width, styles) {
    ctx.save();
    ctx.font = `900 68px "Cinzel", "Playfair Display", serif`;
    ctx.fillStyle = styles.textColor || '#ffffff';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '0.15em';
    ctx.fillText('DISPATCH', x + width / 2, y + 54);

    ctx.strokeStyle = styles.accentColor || '#d4af37';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y + 74);
    ctx.lineTo(x + width, y + 74);
    ctx.stroke();
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

    if (cardBg && cardBg !== 'transparent') {
      ctx.fillStyle = cardBg;
      this.roundRect(ctx, x, y, w, h, radius, true, false);
    }

    if (activeLayout.id === 'framed-inset') {
      ctx.strokeStyle = borderColor || styles.accentColor || '#6366f1';
      ctx.lineWidth = 2;
      this.roundRect(ctx, x + 24, y + 24, w - 48, h - 48, 8, false, true);
    }

    if (activeLayout.id === 'left-accent-bar' || borderStyle === 'thick-left') {
      ctx.fillStyle = styles.accentColor || '#3b82f6';
      ctx.fillRect(x, y, 16, h);
    }

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
      ctx.shadowColor = 'rgba(0,0,0,0.14)';
      ctx.shadowBlur = 32;
      ctx.shadowOffsetY = 16;
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

  static drawCornerAccents(ctx, x, y, w, h, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    const len = 30;
    ctx.beginPath();
    ctx.moveTo(x - 8, y + len);
    ctx.lineTo(x - 8, y - 8);
    ctx.lineTo(x + len, y - 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + w + 8, y + len);
    ctx.lineTo(x + w + 8, y - 8);
    ctx.lineTo(x + w - len, y - 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 8, y + h - len);
    ctx.lineTo(x - 8, y + h + 8);
    ctx.lineTo(x + len, y + h + 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + w + 8, y + h - len);
    ctx.lineTo(x + w + 8, y + h + 8);
    ctx.lineTo(x + w - len, y + h + 8);
    ctx.stroke();
    ctx.restore();
  }

  static drawTerminalChrome(ctx, x, y, w) {
    ctx.save();
    ctx.fillStyle = '#21262d';
    this.roundRect(ctx, x, y, w, 44, 12, true, false);
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
   * Draw Avatar in multiple geometrical frames
   */
  static drawAvatarPlacement(ctx, img, x, y, size, placement, styles) {
    ctx.save();
    const cx = x + size / 2;
    const cy = y + size / 2;
    const radius = size / 2;

    if (placement === 'oval-cameo-center') {
      // Victorian oval
      ctx.beginPath();
      ctx.ellipse(cx, cy, radius * 0.85, radius * 1.1, 0, 0, Math.PI * 2);
      ctx.strokeStyle = styles.accentColor || '#d4af37';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.clip();
      ctx.drawImage(img, x, y, size, size);
    } else if (placement === 'hexagon-badge-top') {
      // Hexagon
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        const hx = cx + radius * Math.cos(a);
        const hy = cy + radius * Math.sin(a);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.strokeStyle = styles.accentColor || '#38bdf8';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.clip();
      ctx.drawImage(img, x, y, size, size);
    } else {
      // Standard circular avatar
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 4, 0, Math.PI * 2);
      ctx.fillStyle = styles.accentColor || '#3b82f6';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, x, y, size, size);
    }
    ctx.restore();
  }

  static drawCutoutPortrait(ctx, img, x, y, w, h, styles) {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 32;
    ctx.shadowOffsetY = 16;

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

  static drawHeader(ctx, { showCategory, category, showDate, date, x, y, width, styles, activeLayout }) {
    ctx.save();
    const metaColor = styles.metaColor || '#71717a';
    const accentColor = styles.accentColor || '#3b82f6';
    const font = styles.authorFontFamily || 'Plus Jakarta Sans';

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

    if (showDate && date) {
      ctx.font = `500 24px "${font}", sans-serif`;
      ctx.fillStyle = metaColor;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(date, x + width, y + 21);
    }
    ctx.restore();
  }

  static drawQuote(ctx, { quote, x, y, width, maxHeight, styles, activeLayout }) {
    ctx.save();
    let textAlign = styles.textAlign || 'center';
    if (activeLayout.id === 'right-aligned-minimal') textAlign = 'right';
    if (activeLayout.id === 'left-accent-bar' || activeLayout.id === 'cutout-right' || activeLayout.id === 'tweet-card') textAlign = 'left';

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
    if (quoteMarkStyle === 'classic' && activeLayout.id !== 'big-watermark' && activeLayout.id !== 'tweet-card') {
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
    } else if (quoteMarkStyle === 'decorative-stars') {
      ctx.font = `28px serif`;
      ctx.fillStyle = accentColor;
      ctx.textAlign = 'center';
      ctx.fillText('✦  ✦  ✦', x + width / 2, y - 10);
    }

    // Dynamic Font Sizing
    let fontSize = Math.min(Math.round(width * 0.08), 84);
    if (activeLayout.id === 'billboard-heavy') fontSize = Math.min(Math.round(width * 0.11), 104);

    const minFontSize = 26;
    let lines = [];
    let calculatedLineHeight = fontSize * lineHeightRatio;

    while (fontSize >= minFontSize) {
      ctx.font = `600 ${fontSize}px "${fontFamily}", sans-serif`;
      lines = this.wrapText(ctx, activeLayout.id === 'tweet-card' ? quote : `“${quote}”`, width);
      calculatedLineHeight = fontSize * lineHeightRatio;
      const totalBlockHeight = lines.length * calculatedLineHeight;
      if (totalBlockHeight <= maxHeight) break;
      fontSize -= 3;
    }

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

  static drawFooter(ctx, { showAuthor, author, handle, showWatermark, watermark, loadedAuthorImg, x, y, width, styles, activeLayout, effectivePlacement }) {
    ctx.save();
    let textAlign = styles.textAlign || 'center';
    if (activeLayout.id === 'right-aligned-minimal') textAlign = 'right';
    if (activeLayout.id === 'left-accent-bar' || activeLayout.id === 'cutout-right' || activeLayout.id === 'tweet-card') textAlign = 'left';

    const textColor = styles.textColor || '#18181b';
    const accentColor = styles.accentColor || '#3b82f6';
    const metaColor = styles.metaColor || '#71717a';
    const font = styles.authorFontFamily || 'Plus Jakarta Sans';

    let textOffsetX = 0;
    if (loadedAuthorImg) {
      const avSize = 56;
      let avX = x;
      if (effectivePlacement === 'avatar-bottom-right') avX = x + width - avSize;
      if (effectivePlacement === 'avatar-bottom-center') avX = x + (width - avSize) / 2;

      this.drawAvatarPlacement(ctx, loadedAuthorImg, avX, y - 6, avSize, 'avatar-round', styles);
      if (effectivePlacement !== 'avatar-bottom-center' && effectivePlacement !== 'avatar-bottom-right') {
        textOffsetX = avSize + 16;
        textAlign = 'left';
      }
    }

    // Draw Tweet verified badge
    if (activeLayout.id === 'tweet-card' && showAuthor) {
      ctx.font = `700 36px "${font}", sans-serif`;
      ctx.fillStyle = textColor;
      ctx.fillText(author, x + textOffsetX, y);
      const nameW = ctx.measureText(author).width;
      // Blue verified checkmark
      ctx.fillStyle = '#1d9bf0';
      ctx.beginPath();
      ctx.arc(x + textOffsetX + nameW + 20, y + 14, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = `700 16px sans-serif`;
      ctx.fillText('✓', x + textOffsetX + nameW + 15, y + 20);

      if (handle) {
        ctx.font = `500 24px "${font}", sans-serif`;
        ctx.fillStyle = metaColor;
        ctx.fillText(handle, x + textOffsetX, y + 44);
      }
    } else if (showAuthor && author) {
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

    if (showWatermark && watermark) {
      ctx.font = `600 20px "${font}", sans-serif`;
      ctx.fillStyle = `${metaColor}88`;
      ctx.textAlign = 'right';
      ctx.fillText(watermark.toUpperCase(), x + width, y + 68);
    }
    ctx.restore();
  }

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
    if (currentLine) lines.push(currentLine);
    return lines;
  }

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

  static async exportBlob(data, format = 'image/png', quality = 0.95) {
    const canvas = await this.renderToCanvas(data);
    return new Promise(resolve => {
      canvas.toBlob(blob => resolve(blob), format, quality);
    });
  }

  static async exportDataURL(data, format = 'image/png', quality = 0.95) {
    const canvas = await this.renderToCanvas(data);
    return canvas.toDataURL(format, quality);
  }
}
