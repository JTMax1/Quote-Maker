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
    let effectivePlacement = authorImagePlacement !== 'auto' 
      ? authorImagePlacement 
      : (activeLayout.portraitPlacement || 'cutout-right');

    // Normalize legacy / alias keys
    if (effectivePlacement === 'right') effectivePlacement = 'cutout-right';
    if (effectivePlacement === 'left') effectivePlacement = 'cutout-left';
    if (effectivePlacement === 'bottom') effectivePlacement = 'cutout-bottom';
    if (effectivePlacement === 'avatar') effectivePlacement = 'avatar-top-center';

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

    // 1. Draw Canvas Background (supports all 12 blend placements + abstract patterns)
    this.drawBackground(ctx, width, height, styles, activeLayout, loadedAuthorImg, effectivePlacement);

    // 2. Base Card Dimensions
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

    // 5. Placement Classification for Space Partitioning & Layering
    const isLeftSide = loadedAuthorImg && [
      'cutout-left', 'cutout-edge-left', 'arch-portal-left',
      'bookmark-vertical-strip', 'shadowbox-inset-left', 'avatar-mid-left',
      'half-screen-left', 'scrim-split-left'
    ].includes(effectivePlacement);

    const isRightSide = loadedAuthorImg && [
      'cutout-right', 'cutout-edge-right', 'shadowbox-inset-right',
      'avatar-mid-right', 'half-screen-right', 'scrim-split-right'
    ].includes(effectivePlacement);

    const isTopPortal = loadedAuthorImg && [
      'avatar-top-center', 'avatar-top-left', 'avatar-top-right',
      'oval-cameo-center', 'hexagon-badge-top', 'diamond-inset-center',
      'arch-portal-center', 'film-cell-inset', 'monogram-seal-top',
      'avatar-double-ring', 'rounded-card-center'
    ].includes(effectivePlacement);

    const isTopCorner = loadedAuthorImg && [
      'stamp-perforated-corner', 'cutout-top-right', 'cutout-top-left'
    ].includes(effectivePlacement);

    const isBottomPlacement = loadedAuthorImg && [
      'cutout-bottom', 'cutout-bottom-left', 'cutout-bottom-right',
      'cutout-angle-bottom', 'cutout-side-peek', 'polaroid-card-bottom',
      'pedestal-base-center'
    ].includes(effectivePlacement);

    const isFooterAvatar = loadedAuthorImg && [
      'avatar-bottom-left', 'avatar-bottom-right', 'avatar-bottom-center',
      'avatar-footer-card'
    ].includes(effectivePlacement);

    const isInlineAvatar = loadedAuthorImg && effectivePlacement === 'avatar-quote-inline';
    const isHeaderAvatar = loadedAuthorImg && effectivePlacement === 'avatar-header-badge';
    const isCenterHero = loadedAuthorImg && effectivePlacement === 'cutout-hero-center';

    // 6. Layout-Driven Space Partitioning
    let quoteBoxX = contentX;
    let quoteBoxW = contentW;
    let sideX = 0, sideY = 0, sideW = 0, sideH = 0;
    let bottomX = 0, bottomY = 0, bottomW = 0, bottomH = 0;

    if (isLeftSide) {
      sideW = Math.round(contentW * 0.38);
      sideH = Math.round(contentH * 0.88);
      sideX = contentX;
      sideY = contentY + Math.round(contentH * 0.06);
      quoteBoxX = contentX + sideW + 28;
      quoteBoxW = contentW - sideW - 28;
    } else if (isRightSide) {
      sideW = Math.round(contentW * 0.38);
      sideH = Math.round(contentH * 0.88);
      sideX = contentX + contentW - sideW;
      sideY = contentY + Math.round(contentH * 0.06);
      quoteBoxX = contentX;
      quoteBoxW = contentW - sideW - 28;
    } else if (isBottomPlacement) {
      const isCardFrame = effectivePlacement === 'polaroid-card-bottom' || effectivePlacement === 'pedestal-base-center';
      bottomH = Math.round(height * (isCardFrame ? 0.30 : 0.35));
      bottomW = isCardFrame ? Math.round(bottomH * 0.95) : Math.round(bottomH * 0.88);
      bottomY = height - bottomH - (isCardFrame ? 24 : 0);

      if (effectivePlacement === 'cutout-bottom-left') {
        bottomX = contentX;
      } else if (effectivePlacement === 'cutout-bottom-right' || effectivePlacement === 'cutout-side-peek') {
        bottomX = contentX + contentW - bottomW;
      } else {
        bottomX = (width - bottomW) / 2;
      }
      contentH -= Math.round(bottomH * 0.42);
    } else if (effectivePlacement === 'top-banner-strip') {
      const bannerH = Math.round(height * 0.38);
      contentY = Math.max(contentY, bannerH + 24);
      contentH = height - contentY - padding;
    } else if (effectivePlacement === 'bottom-banner-strip') {
      contentH = Math.min(contentH, Math.round(height * 0.60) - contentY);
    }

    // 7. Header (Category, Date, Magazine Masthead, Terminal Chrome)
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
    if ((showCategory || showDate || isHeaderAvatar) && activeLayout.id !== 'terminal-code') {
      this.drawHeader(ctx, {
        showCategory,
        category,
        showDate,
        date,
        x: quoteBoxX,
        y: currentY,
        width: quoteBoxW,
        styles,
        activeLayout,
        loadedAuthorImg: isHeaderAvatar ? loadedAuthorImg : null,
        effectivePlacement
      });
      currentY += headerH;
    }

    // 8. Render Center Hero Portrait (Subtle background aura behind quote)
    if (isCenterHero) {
      const heroW = Math.round(width * 0.62);
      const heroH = Math.round(height * 0.72);
      const heroX = (width - heroW) / 2;
      const heroY = height - heroH;
      this.drawCutoutPortrait(ctx, loadedAuthorImg, heroX, heroY, heroW, heroH, styles, effectivePlacement);
    }

    // 9. Render Top Portals & Avatars
    if (isTopPortal) {
      let portalW = 120;
      let portalH = 120;
      if (effectivePlacement === 'arch-portal-center' || effectivePlacement === 'rounded-card-center') {
        portalW = 130;
        portalH = 145;
      } else if (effectivePlacement === 'film-cell-inset') {
        portalW = 145;
        portalH = 120;
      } else if (effectivePlacement === 'oval-cameo-center') {
        portalW = 110;
        portalH = 135;
      }

      let portalX = quoteBoxX + (quoteBoxW - portalW) / 2;
      if (effectivePlacement === 'avatar-top-left') portalX = quoteBoxX;
      if (effectivePlacement === 'avatar-top-right') portalX = quoteBoxX + quoteBoxW - portalW;

      if (['diamond-inset-center', 'arch-portal-center', 'film-cell-inset', 'monogram-seal-top', 'rounded-card-center'].includes(effectivePlacement)) {
        this.drawGeometricFrame(ctx, loadedAuthorImg, portalX, currentY, portalW, portalH, effectivePlacement, styles);
      } else {
        this.drawAvatarPlacement(ctx, loadedAuthorImg, portalX, currentY, portalW, effectivePlacement, styles);
      }
      currentY += portalH + 20;
    }

    // 10. Render Top Corner Insets (Stamp / Corner Cutouts)
    if (isTopCorner) {
      if (effectivePlacement === 'stamp-perforated-corner') {
        const stampW = 116;
        const stampH = 140;
        this.drawGeometricFrame(ctx, loadedAuthorImg, cardX + cardW - stampW - 16, cardY + 20, stampW, stampH, effectivePlacement, styles);
      } else if (effectivePlacement === 'cutout-top-right') {
        const cW = 160;
        const cH = 200;
        this.drawCutoutPortrait(ctx, loadedAuthorImg, cardX + cardW - cW - 10, cardY + 14, cW, cH, styles, effectivePlacement);
      } else if (effectivePlacement === 'cutout-top-left') {
        const cW = 160;
        const cH = 200;
        this.drawCutoutPortrait(ctx, loadedAuthorImg, cardX + 14, cardY + 14, cW, cH, styles, effectivePlacement);
      }
    }

    // 11. Render Inline Avatar (Preceding quote speech)
    if (isInlineAvatar) {
      const inlineSize = 64;
      this.drawAvatarPlacement(ctx, loadedAuthorImg, quoteBoxX + (quoteBoxW - inlineSize) / 2, currentY, inlineSize, 'avatar-quote-inline', styles);
      currentY += inlineSize + 18;
    }

    // 12. Reserved Footer Height
    const footerReservedHeight = Math.round(height * 0.16);
    const availableQuoteHeight = (contentY + contentH) - currentY - footerReservedHeight;

    // 13. Draw Quote Text
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

    // 14. Draw Footer (Author, Verified Badge, Watermark, Footer Avatar / Card)
    const footerY = contentY + contentH - footerReservedHeight + (footerReservedHeight * 0.15);

    this.drawFooter(ctx, {
      showAuthor,
      author,
      handle,
      showWatermark,
      watermark,
      loadedAuthorImg: isFooterAvatar ? loadedAuthorImg : null,
      x: quoteBoxX,
      y: footerY,
      width: quoteBoxW,
      styles,
      activeLayout,
      effectivePlacement
    });

    // 15. Draw Side Placement (Cutout or Frame)
    if (isLeftSide || isRightSide) {
      const isBlendSplit = ['half-screen-left', 'half-screen-right', 'scrim-split-left', 'scrim-split-right'].includes(effectivePlacement);
      if (!isBlendSplit) {
        if (['arch-portal-left', 'bookmark-vertical-strip', 'shadowbox-inset-left', 'shadowbox-inset-right'].includes(effectivePlacement)) {
          this.drawGeometricFrame(ctx, loadedAuthorImg, sideX, sideY, sideW, sideH, effectivePlacement, styles);
        } else if (effectivePlacement === 'avatar-mid-left' || effectivePlacement === 'avatar-mid-right') {
          const midSize = Math.min(sideW, 130);
          const midX = sideX + (sideW - midSize) / 2;
          const midY = sideY + (sideH - midSize) / 2;
          this.drawAvatarPlacement(ctx, loadedAuthorImg, midX, midY, midSize, 'avatar-round', styles);
        } else {
          this.drawCutoutPortrait(ctx, loadedAuthorImg, sideX, sideY, sideW, sideH, styles, effectivePlacement);
        }
      }
    }

    // 16. Draw Bottom Placement (Cutout, Slant, Corner Pop, Polaroid, or Museum Pedestal)
    if (isBottomPlacement) {
      if (effectivePlacement === 'polaroid-card-bottom' || effectivePlacement === 'pedestal-base-center') {
        this.drawGeometricFrame(ctx, loadedAuthorImg, bottomX, bottomY, bottomW, bottomH, effectivePlacement, styles);
      } else {
        this.drawCutoutPortrait(ctx, loadedAuthorImg, bottomX, bottomY, bottomW, bottomH, styles, effectivePlacement);
      }
    }

    return canvas;
  }

  /**
   * Helper to draw image center-covering a rectangle (object-fit: cover)
   */
  static drawCoverImage(ctx, img, x, y, w, h) {
    if (!img) return;
    const iw = img.naturalWidth || img.width || 1;
    const ih = img.naturalHeight || img.height || 1;
    const imgRatio = iw / ih;
    const targetRatio = w / h;
    let sx, sy, sw, sh;
    if (imgRatio > targetRatio) {
      sh = ih;
      sw = ih * targetRatio;
      sx = (iw - sw) / 2;
      sy = 0;
    } else {
      sw = iw;
      sh = iw / targetRatio;
      sx = 0;
      sy = (ih - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }

  /**
   * Draw Canvas Background with all 12 Environmental Blends + Geometric Line Art
   */
  static drawBackground(ctx, width, height, styles, activeLayout, loadedAuthorImg, effectivePlacement) {
    ctx.save();

    // Environmental Blends with loadedAuthorImg
    if (loadedAuthorImg) {
      if (effectivePlacement === 'scrim') {
        this.drawCoverImage(ctx, loadedAuthorImg, 0, 0, width, height);
        const scrim = ctx.createLinearGradient(0, 0, 0, height);
        scrim.addColorStop(0, 'rgba(4, 7, 13, 0.65)');
        scrim.addColorStop(0.5, 'rgba(4, 7, 13, 0.82)');
        scrim.addColorStop(1, 'rgba(4, 7, 13, 0.96)');
        ctx.fillStyle = scrim;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
        return;
      }

      if (effectivePlacement === 'scrim-radial') {
        this.drawCoverImage(ctx, loadedAuthorImg, 0, 0, width, height);
        const scrim = ctx.createRadialGradient(width / 2, height / 2, width * 0.15, width / 2, height / 2, width * 0.75);
        scrim.addColorStop(0, 'rgba(4, 7, 13, 0.35)');
        scrim.addColorStop(0.65, 'rgba(4, 7, 13, 0.82)');
        scrim.addColorStop(1, 'rgba(4, 7, 13, 0.98)');
        ctx.fillStyle = scrim;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
        return;
      }

      if (effectivePlacement === 'scrim-split-left') {
        this.drawBaseCanvasBackground(ctx, width, height, styles, activeLayout);
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, width * 0.58, height);
        ctx.clip();
        this.drawCoverImage(ctx, loadedAuthorImg, 0, 0, width * 0.58, height);
        ctx.restore();
        const splitGrad = ctx.createLinearGradient(0, 0, width * 0.65, 0);
        splitGrad.addColorStop(0, 'rgba(4, 7, 13, 0.3)');
        splitGrad.addColorStop(0.65, 'rgba(4, 7, 13, 0.8)');
        splitGrad.addColorStop(1, styles.background || '#090a0f');
        ctx.fillStyle = splitGrad;
        ctx.fillRect(0, 0, width * 0.65, height);
        ctx.restore();
        return;
      }

      if (effectivePlacement === 'scrim-split-right') {
        this.drawBaseCanvasBackground(ctx, width, height, styles, activeLayout);
        ctx.save();
        ctx.beginPath();
        ctx.rect(width * 0.42, 0, width * 0.58, height);
        ctx.clip();
        this.drawCoverImage(ctx, loadedAuthorImg, width * 0.42, 0, width * 0.58, height);
        ctx.restore();
        const splitGrad = ctx.createLinearGradient(width * 0.35, 0, width, 0);
        splitGrad.addColorStop(0, styles.background || '#090a0f');
        splitGrad.addColorStop(0.35, 'rgba(4, 7, 13, 0.8)');
        splitGrad.addColorStop(1, 'rgba(4, 7, 13, 0.3)');
        ctx.fillStyle = splitGrad;
        ctx.fillRect(width * 0.35, 0, width * 0.65, height);
        ctx.restore();
        return;
      }

      if (effectivePlacement === 'half-screen-left') {
        this.drawCoverImage(ctx, loadedAuthorImg, 0, 0, width / 2, height);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fillRect(0, 0, width / 2, height);
        ctx.save();
        ctx.beginPath();
        ctx.rect(width / 2, 0, width / 2, height);
        ctx.clip();
        this.drawBaseCanvasBackground(ctx, width, height, styles, activeLayout);
        ctx.restore();
        ctx.strokeStyle = styles.accentColor || '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        ctx.stroke();
        ctx.restore();
        return;
      }

      if (effectivePlacement === 'half-screen-right') {
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, width / 2, height);
        ctx.clip();
        this.drawBaseCanvasBackground(ctx, width, height, styles, activeLayout);
        ctx.restore();
        this.drawCoverImage(ctx, loadedAuthorImg, width / 2, 0, width / 2, height);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fillRect(width / 2, 0, width / 2, height);
        ctx.strokeStyle = styles.accentColor || '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        ctx.stroke();
        ctx.restore();
        return;
      }

      if (effectivePlacement === 'diagonal-slice-bg') {
        this.drawBaseCanvasBackground(ctx, width, height, styles, activeLayout);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(width * 0.45, 0);
        ctx.lineTo(width, 0);
        ctx.lineTo(width, height);
        ctx.lineTo(width * 0.15, height);
        ctx.closePath();
        ctx.clip();
        this.drawCoverImage(ctx, loadedAuthorImg, 0, 0, width, height);
        ctx.fillStyle = 'rgba(4, 7, 13, 0.4)';
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
        ctx.strokeStyle = styles.accentColor || '#3b82f6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(width * 0.45, 0);
        ctx.lineTo(width * 0.15, height);
        ctx.stroke();
        ctx.restore();
        return;
      }

      if (effectivePlacement === 'top-banner-strip') {
        this.drawBaseCanvasBackground(ctx, width, height, styles, activeLayout);
        const bannerH = Math.round(height * 0.38);
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, width, bannerH);
        ctx.clip();
        this.drawCoverImage(ctx, loadedAuthorImg, 0, 0, width, bannerH);
        const bannerGrad = ctx.createLinearGradient(0, 0, 0, bannerH);
        bannerGrad.addColorStop(0, 'rgba(4, 7, 13, 0.2)');
        bannerGrad.addColorStop(0.7, 'rgba(4, 7, 13, 0.65)');
        bannerGrad.addColorStop(1, styles.background || '#090a0f');
        ctx.fillStyle = bannerGrad;
        ctx.fillRect(0, 0, width, bannerH);
        ctx.restore();
        ctx.strokeStyle = styles.accentColor || '#3b82f6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, bannerH);
        ctx.lineTo(width, bannerH);
        ctx.stroke();
        ctx.restore();
        return;
      }

      if (effectivePlacement === 'bottom-banner-strip') {
        this.drawBaseCanvasBackground(ctx, width, height, styles, activeLayout);
        const bannerH = Math.round(height * 0.38);
        const bannerY = height - bannerH;
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, bannerY, width, bannerH);
        ctx.clip();
        this.drawCoverImage(ctx, loadedAuthorImg, 0, bannerY, width, bannerH);
        const bannerGrad = ctx.createLinearGradient(0, bannerY, 0, height);
        bannerGrad.addColorStop(0, styles.background || '#090a0f');
        bannerGrad.addColorStop(0.3, 'rgba(4, 7, 13, 0.65)');
        bannerGrad.addColorStop(1, 'rgba(4, 7, 13, 0.2)');
        ctx.fillStyle = bannerGrad;
        ctx.fillRect(0, bannerY, width, bannerH);
        ctx.restore();
        ctx.strokeStyle = styles.accentColor || '#3b82f6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, bannerY);
        ctx.lineTo(width, bannerY);
        ctx.stroke();
        ctx.restore();
        return;
      }

      if (effectivePlacement === 'soft-vignette-center') {
        this.drawBaseCanvasBackground(ctx, width, height, styles, activeLayout);
        ctx.save();
        const vRadius = Math.round(Math.min(width, height) * 0.42);
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, vRadius, 0, Math.PI * 2);
        ctx.clip();
        this.drawCoverImage(ctx, loadedAuthorImg, width / 2 - vRadius, height / 2 - vRadius, vRadius * 2, vRadius * 2);
        const vGrad = ctx.createRadialGradient(width / 2, height / 2, vRadius * 0.2, width / 2, height / 2, vRadius);
        vGrad.addColorStop(0, 'rgba(4, 7, 13, 0.2)');
        vGrad.addColorStop(0.7, 'rgba(4, 7, 13, 0.7)');
        vGrad.addColorStop(1, styles.background || '#090a0f');
        ctx.fillStyle = vGrad;
        ctx.fillRect(width / 2 - vRadius, height / 2 - vRadius, vRadius * 2, vRadius * 2);
        ctx.restore();
        ctx.restore();
        return;
      }

      if (effectivePlacement === 'duotone-underlay') {
        this.drawCoverImage(ctx, loadedAuthorImg, 0, 0, width, height);
        ctx.save();
        ctx.fillStyle = styles.accentColor || '#6366f1';
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
        const duoScrim = ctx.createLinearGradient(0, 0, 0, height);
        duoScrim.addColorStop(0, 'rgba(4, 7, 13, 0.7)');
        duoScrim.addColorStop(1, 'rgba(4, 7, 13, 0.92)');
        ctx.fillStyle = duoScrim;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
        return;
      }

      if (effectivePlacement === 'silhouette-back-glow') {
        this.drawBaseCanvasBackground(ctx, width, height, styles, activeLayout);
        const glowRad = Math.round(Math.min(width, height) * 0.45);
        const glow = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, glowRad);
        glow.addColorStop(0, styles.accentColor ? `${styles.accentColor}99` : 'rgba(99, 102, 241, 0.6)');
        glow.addColorStop(0.5, styles.accentColor ? `${styles.accentColor}33` : 'rgba(99, 102, 241, 0.2)');
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(width / 2 - glowRad, height / 2 - glowRad, glowRad * 2, glowRad * 2);
        ctx.restore();
        return;
      }
    }

    // Default Canvas Background
    this.drawBaseCanvasBackground(ctx, width, height, styles, activeLayout);
    ctx.restore();
  }

  /**
   * Draw base canvas fill, gradient, or split card background + abstract geometric patterns
   */
  static drawBaseCanvasBackground(ctx, width, height, styles, activeLayout) {
    if (activeLayout.id === 'split-50') {
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

    // Abstract geometric lines & geometry
    const pattern = styles.abstractPattern;
    if (pattern) {
      this.drawAbstractPattern(ctx, width, height, pattern, styles.accentColor || '#6366f1');
    }
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
   * Draw Geometric Frames & Architectural Portals (14 distinct structural portals)
   */
  static drawGeometricFrame(ctx, img, x, y, w, h, placement, styles) {
    if (!img) return;
    ctx.save();
    const accentColor = styles.accentColor || '#3b82f6';

    if (placement === 'arch-portal-center' || placement === 'arch-portal-left') {
      // Neoclassical Roman Arch
      const r = w / 2;
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 12;
      ctx.beginPath();
      ctx.moveTo(x, y + h);
      ctx.lineTo(x, y + r);
      ctx.arc(x + r, y + r, r, Math.PI, 0, false);
      ctx.lineTo(x + w, y + h);
      ctx.closePath();
      ctx.fillStyle = '#18181b';
      ctx.fill();
      ctx.clip();
      this.drawCoverImage(ctx, img, x, y, w, h);
      ctx.restore();

      // Arch Stroke & Keystone
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(x, y + h);
      ctx.lineTo(x, y + r);
      ctx.arc(x + r, y + r, r, Math.PI, 0, false);
      ctx.lineTo(x + w, y + h);
      ctx.closePath();
      ctx.stroke();

      // Keystone accent
      ctx.fillStyle = accentColor;
      ctx.fillRect(x + r - 8, y - 4, 16, 10);
    } else if (placement === 'diamond-inset-center') {
      // Rotated Rhombus Diamond
      const cx = x + w / 2;
      const cy = y + h / 2;
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.moveTo(cx, y);
      ctx.lineTo(x + w, cy);
      ctx.lineTo(cx, y + h);
      ctx.lineTo(x, cy);
      ctx.closePath();
      ctx.fillStyle = '#18181b';
      ctx.fill();
      ctx.clip();
      this.drawCoverImage(ctx, img, x, y, w, h);
      ctx.restore();

      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(cx, y);
      ctx.lineTo(x + w, cy);
      ctx.lineTo(cx, y + h);
      ctx.lineTo(x, cy);
      ctx.closePath();
      ctx.stroke();
    } else if (placement === 'polaroid-card-bottom') {
      // Vintage Polaroid Photo Card
      ctx.save();
      ctx.translate(x + w / 2, y + h / 2);
      ctx.rotate(-0.035); // -2 degree tilt
      ctx.translate(-(x + w / 2), -(y + h / 2));

      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 28;
      ctx.shadowOffsetY = 14;
      ctx.fillStyle = '#fdfbf7'; // warm photo paper
      this.roundRect(ctx, x, y, w, h, 6, true, false);

      const margin = Math.round(w * 0.08);
      const photoW = w - margin * 2;
      const photoH = photoW;
      const photoX = x + margin;
      const photoY = y + margin;

      ctx.shadowColor = 'transparent';
      ctx.fillStyle = '#000000';
      ctx.fillRect(photoX, photoY, photoW, photoH);
      ctx.save();
      ctx.beginPath();
      ctx.rect(photoX, photoY, photoW, photoH);
      ctx.clip();
      this.drawCoverImage(ctx, img, photoX, photoY, photoW, photoH);
      ctx.restore();

      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(photoX, photoY, photoW, photoH);
      ctx.restore();
    } else if (placement === 'stamp-perforated-corner') {
      // Perforated Postage Stamp
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 8;
      ctx.fillStyle = '#fafaf9';
      ctx.fillRect(x, y, w, h);

      // Scalloped perforated border punch holes
      ctx.fillStyle = styles.background || '#18181b';
      const holeRadius = 3.5;
      const step = 14;
      for (let px = x + step; px < x + w - 4; px += step) {
        ctx.beginPath();
        ctx.arc(px, y, holeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px, y + h, holeRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      for (let py = y + step; py < y + h - 4; py += step) {
        ctx.beginPath();
        ctx.arc(x, py, holeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + w, py, holeRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Inner stamp photo
      const sPad = 12;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x + sPad, y + sPad, w - sPad * 2, h - sPad * 2);
      ctx.clip();
      this.drawCoverImage(ctx, img, x + sPad, y + sPad, w - sPad * 2, h - sPad * 2);
      ctx.restore();

      // Stamp cancellation postmark
      ctx.strokeStyle = `${accentColor}88`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x + w - 24, y + 24, 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else if (placement === 'film-cell-inset') {
      // 35mm Cinema Film Cell
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.45)';
      ctx.shadowBlur = 24;
      ctx.fillStyle = '#09090b';
      this.roundRect(ctx, x, y, w, h, 8, true, false);

      // Film Sprocket Holes (Top and Bottom)
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      const spw = 10;
      const sph = 8;
      for (let sx = x + 14; sx < x + w - 14; sx += 22) {
        this.roundRect(ctx, sx, y + 6, spw, sph, 2, true, false);
        this.roundRect(ctx, sx, y + h - 14, spw, sph, 2, true, false);
      }

      // Film Frame Photo Inset
      const innerY = y + 20;
      const innerH = h - 40;
      const innerX = x + 10;
      const innerW = w - 20;
      ctx.save();
      ctx.beginPath();
      ctx.rect(innerX, innerY, innerW, innerH);
      ctx.clip();
      this.drawCoverImage(ctx, img, innerX, innerY, innerW, innerH);
      ctx.restore();

      ctx.font = '700 8px monospace';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('35mm • 24A', x + 14, y + 16);
      ctx.restore();
    } else if (placement === 'bookmark-vertical-strip') {
      // Vertical Bookmark Ribbon
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x + w / 2, y + h - 28); // chevron V-notch
      ctx.lineTo(x, y + h);
      ctx.closePath();
      ctx.fillStyle = `${accentColor}22`;
      ctx.fill();
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Portrait inside bookmark upper area
      const bPad = 12;
      const bPhotoH = Math.round(w * 1.1);
      ctx.save();
      ctx.beginPath();
      this.roundRect(ctx, x + bPad, y + 18, w - bPad * 2, bPhotoH, 8, false, false);
      ctx.clip();
      this.drawCoverImage(ctx, img, x + bPad, y + 18, w - bPad * 2, bPhotoH);
      ctx.restore();
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2;
      this.roundRect(ctx, x + bPad, y + 18, w - bPad * 2, bPhotoH, 8, false, true);
      ctx.restore();
    } else if (placement === 'monogram-seal-top') {
      // Royal Wax Seal / Medallion
      const cx = x + w / 2;
      const cy = y + h / 2;
      const r = Math.min(w, h) / 2;
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 24;

      // Scalloped medallion perimeter
      ctx.beginPath();
      const points = 24;
      for (let i = 0; i < points; i++) {
        const angle = (i * Math.PI * 2) / points;
        const rad = i % 2 === 0 ? r : r * 0.88;
        const px = cx + Math.cos(angle) * rad;
        const py = cy + Math.sin(angle) * rad;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      const waxGrad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, 10, cx, cy, r);
      waxGrad.addColorStop(0, '#eab308');
      waxGrad.addColorStop(0.7, '#ca8a04');
      waxGrad.addColorStop(1, '#854d0e');
      ctx.fillStyle = waxGrad;
      ctx.fill();

      // Photo inside seal center
      const innerR = r * 0.72;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
      ctx.clip();
      this.drawCoverImage(ctx, img, cx - innerR, cy - innerR, innerR * 2, innerR * 2);
      ctx.restore();

      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else if (placement === 'pedestal-base-center') {
      // Classical Museum Pedestal Base
      const pedH = 36;
      const bustH = h - pedH;
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 24;

      // Portrait in upper arch
      const r = w / 2;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x + 8, y + bustH);
      ctx.lineTo(x + 8, y + r);
      ctx.arc(x + r, y + r, r - 8, Math.PI, 0, false);
      ctx.lineTo(x + w - 8, y + bustH);
      ctx.closePath();
      ctx.fillStyle = '#18181b';
      ctx.fill();
      ctx.clip();
      this.drawCoverImage(ctx, img, x + 8, y, w - 16, bustH);
      ctx.restore();

      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + 8, y + bustH);
      ctx.lineTo(x + 8, y + r);
      ctx.arc(x + r, y + r, r - 8, Math.PI, 0, false);
      ctx.lineTo(x + w - 8, y + bustH);
      ctx.closePath();
      ctx.stroke();

      // Stepped Pedestal Base Plinth
      ctx.fillStyle = '#27272a';
      this.roundRect(ctx, x, y + bustH, w, 14, 4, true, false);
      ctx.fillStyle = '#3f3f46';
      this.roundRect(ctx, x - 10, y + bustH + 14, w + 20, 16, 4, true, false);
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 1.5;
      this.roundRect(ctx, x - 10, y + bustH + 14, w + 20, 16, 4, false, true);
      ctx.restore();
    } else if (placement === 'shadowbox-inset-right' || placement === 'shadowbox-inset-left') {
      // Modern Hard Offset Shadowbox
      ctx.save();
      ctx.fillStyle = accentColor;
      this.roundRect(ctx, x + 10, y + 10, w, h, 14, true, false);

      ctx.fillStyle = '#18181b';
      this.roundRect(ctx, x, y, w, h, 14, true, false);
      ctx.save();
      ctx.beginPath();
      this.roundRect(ctx, x, y, w, h, 14, false, false);
      ctx.clip();
      this.drawCoverImage(ctx, img, x, y, w, h);
      ctx.restore();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      this.roundRect(ctx, x, y, w, h, 14, false, true);
      ctx.restore();
    } else if (placement === 'rounded-card-center') {
      // Floating Squircle Card
      ctx.save();
      ctx.shadowColor = accentColor ? `${accentColor}66` : 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 28;
      ctx.shadowOffsetY = 10;
      ctx.fillStyle = '#18181b';
      this.roundRect(ctx, x, y, w, h, 24, true, false);
      ctx.save();
      ctx.beginPath();
      this.roundRect(ctx, x, y, w, h, 24, false, false);
      ctx.clip();
      this.drawCoverImage(ctx, img, x, y, w, h);
      ctx.restore();

      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2.5;
      this.roundRect(ctx, x, y, w, h, 24, false, true);
      ctx.restore();
    }
    ctx.restore();
  }

  /**
   * Draw Avatar in multiple geometrical frames
   */
  static drawAvatarPlacement(ctx, img, x, y, size, placement, styles) {
    if (!img) return;
    ctx.save();
    const cx = x + size / 2;
    const cy = y + size / 2;
    const radius = size / 2;
    const accentColor = styles.accentColor || '#3b82f6';

    if (placement === 'oval-cameo-center') {
      // Victorian oval cameo
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 8;
      ctx.beginPath();
      ctx.ellipse(cx, cy, radius * 0.85, radius * 1.15, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#18181b';
      ctx.fill();
      ctx.clip();
      this.drawCoverImage(ctx, img, cx - radius * 0.85, cy - radius * 1.15, radius * 1.7, radius * 2.3);
      ctx.restore();

      // Double antique gold rim
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.ellipse(cx, cy, radius * 0.85, radius * 1.15, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cx, cy, radius * 0.85 + 4, radius * 1.15 + 4, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (placement === 'hexagon-badge-top') {
      // Regular Hexagon
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        const hx = cx + radius * Math.cos(a);
        const hy = cy + radius * Math.sin(a);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fillStyle = '#18181b';
      ctx.fill();
      ctx.clip();
      this.drawCoverImage(ctx, img, x, y, size, size);
      ctx.restore();

      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        const hx = cx + radius * Math.cos(a);
        const hy = cy + radius * Math.sin(a);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.stroke();
    } else if (placement === 'avatar-double-ring') {
      // Luxury Concentric Double Rings with Diamond Sparkle Pips
      ctx.save();
      ctx.shadowColor = accentColor ? `${accentColor}88` : 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 18;

      ctx.beginPath();
      ctx.arc(cx, cy, radius - 6, 0, Math.PI * 2);
      ctx.fillStyle = '#18181b';
      ctx.fill();
      ctx.clip();
      this.drawCoverImage(ctx, img, cx - radius + 6, cy - radius + 6, (radius - 6) * 2, (radius - 6) * 2);
      ctx.restore();

      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radius - 6, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = `${accentColor}88`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 2, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = accentColor;
      const pipDist = radius + 2;
      [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].forEach(ang => {
        const px = cx + Math.cos(ang) * pipDist;
        const py = cy + Math.sin(ang) * pipDist;
        ctx.fillRect(px - 2.5, py - 2.5, 5, 5);
      });
    } else if (placement === 'avatar-quote-inline') {
      // Inline Speech Badge with Quote Tail
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();
      this.drawCoverImage(ctx, img, x, y, size, size);
      ctx.restore();

      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.moveTo(cx + radius * 0.7, cy + radius * 0.7);
      ctx.lineTo(cx + radius * 1.2, cy + radius * 1.2);
      ctx.lineTo(cx + radius * 0.3, cy + radius * 1.0);
      ctx.closePath();
      ctx.fill();
    } else {
      // Standard circular avatar
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#18181b';
      ctx.fill();
      ctx.clip();
      this.drawCoverImage(ctx, img, x, y, size, size);
      ctx.restore();

      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  static drawCutoutPortrait(ctx, img, x, y, w, h, styles, placement = 'cutout-right') {
    if (!img) return;
    ctx.save();

    const imgW = img.naturalWidth || img.width || 1;
    const imgH = img.naturalHeight || img.height || 1;
    const imgRatio = imgW / imgH;

    let drawW = w;
    let drawH = drawW / imgRatio;
    if (drawH > h) {
      drawH = h;
      drawW = drawH * imgRatio;
    }

    let drawX = x + (w - drawW) / 2;
    let drawY = y + (h - drawH);

    // Hero center portrait behind quote
    if (placement === 'cutout-hero-center') {
      ctx.globalAlpha = 0.30;
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();
      return;
    }

    if (placement === 'cutout-angle-bottom') {
      ctx.translate(drawX + drawW / 2, drawY + drawH);
      ctx.rotate(-0.06); // -3.5 deg tilt
      ctx.translate(-(drawX + drawW / 2), -(drawY + drawH));
    } else if (placement === 'cutout-side-peek') {
      ctx.translate(drawX + drawW, drawY + drawH);
      ctx.rotate(0.08); // +4.5 deg tilt
      ctx.translate(-(drawX + drawW), -(drawY + drawH));
    }

    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 32;
    ctx.shadowOffsetY = 16;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.restore();
  }

  static drawHeader(ctx, { showCategory, category, showDate, date, x, y, width, styles, activeLayout, loadedAuthorImg, effectivePlacement }) {
    ctx.save();
    const metaColor = styles.metaColor || '#71717a';
    const accentColor = styles.accentColor || '#3b82f6';
    const font = styles.authorFontFamily || 'Plus Jakarta Sans';

    let headerOffsetX = 0;
    if (effectivePlacement === 'avatar-header-badge' && loadedAuthorImg) {
      const hAvSize = 38;
      this.drawAvatarPlacement(ctx, loadedAuthorImg, x, y, hAvSize, 'avatar-round', styles);
      headerOffsetX = hAvSize + 12;
    }

    if (showCategory && category) {
      const catText = category.toUpperCase();
      ctx.font = `700 24px "${font}", sans-serif`;
      ctx.textBaseline = 'middle';
      const textWidth = ctx.measureText(catText).width;
      const badgeX = x + headerOffsetX;

      if (styles.badgeStyle === 'neon-pill') {
        const pillW = textWidth + 36;
        const pillH = 44;
        ctx.fillStyle = `${accentColor}22`;
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 2;
        this.roundRect(ctx, badgeX, y, pillW, pillH, 22, true, true);
        ctx.fillStyle = accentColor;
        ctx.fillText(catText, badgeX + 18, y + pillH / 2);
      } else if (styles.badgeStyle === 'gold-badge') {
        ctx.fillStyle = accentColor;
        ctx.fillText(`✦ ${catText} ✦`, badgeX, y + 20);
      } else if (styles.badgeStyle === 'bold-block') {
        const pillW = textWidth + 24;
        const pillH = 38;
        ctx.fillStyle = accentColor;
        ctx.fillRect(badgeX, y, pillW, pillH);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(catText, badgeX + 12, y + pillH / 2);
      } else if (styles.badgeStyle === 'brutalist-badge') {
        const pillW = textWidth + 24;
        const pillH = 40;
        ctx.fillStyle = '#000000';
        ctx.fillRect(badgeX, y, pillW, pillH);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(catText, badgeX + 12, y + pillH / 2);
      } else {
        const pillW = textWidth + 30;
        const pillH = 42;
        ctx.fillStyle = `${accentColor}18`;
        this.roundRect(ctx, badgeX, y, pillW, pillH, 12, true, false);
        ctx.fillStyle = accentColor;
        ctx.fillText(catText, badgeX + 15, y + pillH / 2);
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
      if (effectivePlacement === 'avatar-footer-card') {
        const cardH = 72;
        const cardW = Math.min(width, 420);
        let cardX = x;
        if (textAlign === 'center') cardX = x + (width - cardW) / 2;
        if (textAlign === 'right') cardX = x + width - cardW;

        ctx.fillStyle = 'rgba(24, 24, 27, 0.78)';
        this.roundRect(ctx, cardX, y - 8, cardW, cardH, 36, true, false);
        ctx.strokeStyle = accentColor ? `${accentColor}55` : 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1.5;
        this.roundRect(ctx, cardX, y - 8, cardW, cardH, 36, false, true);

        const avSize = 52;
        this.drawAvatarPlacement(ctx, loadedAuthorImg, cardX + 10, y + 2, avSize, 'avatar-round', styles);

        ctx.textAlign = 'left';
        ctx.font = `700 26px "${font}", sans-serif`;
        ctx.fillStyle = textColor;
        ctx.fillText(author, cardX + avSize + 22, y + 16);

        if (handle) {
          ctx.font = `500 18px "${font}", sans-serif`;
          ctx.fillStyle = accentColor;
          ctx.fillText(handle, cardX + avSize + 22, y + 42);
        }

        if (showWatermark && watermark) {
          ctx.font = `600 20px "${font}", sans-serif`;
          ctx.fillStyle = `${metaColor}88`;
          ctx.textAlign = 'right';
          ctx.fillText(watermark.toUpperCase(), x + width, y + 78);
        }
        ctx.restore();
        return;
      }

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
