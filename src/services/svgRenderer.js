/**
 * SvgRenderer — Vector Graphics Export Engine for QuoteForge
 * Generates standards-compliant, beautifully styled SVG vector documents
 * suitable for vector editing (Figma, Illustrator, Inkscape), print scaling, and web delivery.
 */

import { CANVAS_FORMATS, LAYOUT_STYLES } from '../data/defaultPresets.js';
import { escapeHtml, sanitizeStyleValue } from '../utils/security.js';

export class SvgRenderer {
  /**
   * Wrap text into lines according to maximum character width estimate
   */
  static wrapText(text, maxCharsPerLine = 32) {
    const words = (text || '').trim().split(/\s+/);
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      if (!currentLine) {
        currentLine = word;
      } else if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines.length ? lines : [''];
  }

  /**
   * Parse simple linear-gradient string to SVG gradient def
   */
  static parseLinearGradientToSvg(gradientStr, id = 'quoteGradient') {
    if (!gradientStr || !gradientStr.includes('linear-gradient')) {
      return { id: null, def: '' };
    }

    // Default angle 135deg
    let x1 = '0%', y1 = '0%', x2 = '100%', y2 = '100%';
    if (gradientStr.includes('to right')) {
      x1 = '0%'; y1 = '0%'; x2 = '100%'; y2 = '0%';
    } else if (gradientStr.includes('to bottom')) {
      x1 = '0%'; y1 = '0%'; x2 = '0%'; y2 = '100%';
    }

    // Extract color stops (hex, rgba)
    const stopMatches = gradientStr.match(/(rgba?\([^)]+\)|#[a-fA-F0-9]{3,8})/g) || ['#0f172a', '#1e1b4b'];
    const stopsSvg = stopMatches.map((color, idx) => {
      const offset = Math.round((idx / (stopMatches.length - 1 || 1)) * 100);
      return `<stop offset="${offset}%" stop-color="${color}" />`;
    }).join('\n      ');

    const def = `
    <linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
      ${stopsSvg}
    </linearGradient>`;

    return { id, def };
  }

  /**
   * Generates SVG XML string from quote state data
   */
  static renderToSvg(data) {
    const {
      quote = "Your quote here...",
      author = "Author Name",
      handle = "",
      category = "Wisdom",
      date = "2026",
      watermark = "QuoteForge",
      showAuthor = true,
      showDate = true,
      showCategory = true,
      showWatermark = true,
      brandingStyle = "text",
      brandingPosition = "bottom-right",
      brandingOpacity = 0.55,
      brandingLogo = null,
      showAuthorImage = false,
      authorImage = null,
      authorImagePlacement = 'auto',
      layoutId = 'classic-centered',
      ratio = "1:1",
      customWidth = null,
      customHeight = null,
      styles = {}
    } = data;

    const formatInfo = CANVAS_FORMATS.find(f => f.id === ratio) || CANVAS_FORMATS[0];
    const width = (ratio === 'custom' && customWidth) ? Math.max(200, Math.min(6000, Number(customWidth))) : formatInfo.width;
    const height = (ratio === 'custom' && customHeight) ? Math.max(200, Math.min(6000, Number(customHeight))) : formatInfo.height;

    const activeLayout = LAYOUT_STYLES.find(l => l.id === layoutId) || LAYOUT_STYLES[0];

    // Colors & typography tokens
    const fontFamily = sanitizeStyleValue(styles.fontFamily, 'Playfair Display');
    const authorFontFamily = sanitizeStyleValue(styles.authorFontFamily, 'Plus Jakarta Sans');
    const textColor = sanitizeStyleValue(styles.textColor, '#f8fafc');
    const accentColor = sanitizeStyleValue(styles.accentColor, '#38bdf8');
    const background = styles.background || '#0a0d14';
    const gradient = styles.gradient || null;
    const textAlign = styles.textAlign || 'center';
    const cardStyle = styles.cardStyle || 'none';
    const cardBackground = styles.cardBackground || 'rgba(255, 255, 255, 0.05)';
    const borderColor = sanitizeStyleValue(styles.borderColor, accentColor);
    const borderStyle = styles.borderStyle || 'none';

    // Gradients
    const gradInfo = this.parseLinearGradientToSvg(gradient, 'bgGrad');

    // Dynamic sizing based on canvas area
    const minDim = Math.min(width, height);
    const quoteLength = (quote || '').length;
    let baseFontSize = Math.round(minDim * 0.052);
    if (quoteLength > 200) baseFontSize = Math.round(minDim * 0.038);
    else if (quoteLength > 120) baseFontSize = Math.round(minDim * 0.044);
    else if (quoteLength < 50) baseFontSize = Math.round(minDim * 0.062);

    const authorFontSize = Math.max(14, Math.round(baseFontSize * 0.46));
    const metaFontSize = Math.max(12, Math.round(authorFontSize * 0.85));
    const lineHeight = Math.round(baseFontSize * 1.45);

    // Padding & card dimensions
    const padX = Math.round(width * 0.1);
    const padY = Math.round(height * 0.12);
    const cardW = width - (padX * 2);
    const cardH = height - (padY * 2);

    // Text Wrapping
    const approxCharsPerLine = Math.max(18, Math.floor(cardW / (baseFontSize * 0.54)));
    const lines = this.wrapText(quote, approxCharsPerLine);
    const totalTextHeight = lines.length * lineHeight;

    // Alignment coordinates
    let textAnchor = 'middle';
    let textX = width / 2;
    if (textAlign === 'left') {
      textAnchor = 'start';
      textX = padX + (cardStyle !== 'none' ? 40 : 0);
    } else if (textAlign === 'right') {
      textAnchor = 'end';
      textX = width - padX - (cardStyle !== 'none' ? 40 : 0);
    }

    // Vertical positioning
    let startY = Math.round((height - totalTextHeight) / 2) - 10;
    if (showCategory) startY += 20;

    // Build SVG parts
    const encodedQuoteFont = encodeURIComponent(fontFamily);
    const encodedAuthorFont = encodeURIComponent(authorFontFamily);

    let defsContent = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=${encodedQuoteFont}:wght@400;600;700;800&amp;family=${encodedAuthorFont}:wght@400;500;600;700&amp;display=swap');
      .quote-text {
        font-family: '${fontFamily}', Georgia, serif;
        font-weight: ${styles.fontWeight || 600};
        fill: ${textColor};
      }
      .author-text {
        font-family: '${authorFontFamily}', -apple-system, sans-serif;
        font-weight: 600;
        fill: ${accentColor};
      }
      .meta-text {
        font-family: '${authorFontFamily}', -apple-system, sans-serif;
        font-weight: 500;
        fill: ${textColor};
        opacity: 0.65;
      }
      .watermark-text {
        font-family: '${authorFontFamily}', -apple-system, sans-serif;
        font-weight: 600;
        font-size: 13px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        fill: ${textColor};
        opacity: ${brandingOpacity};
      }
    </style>
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="24" flood-color="rgba(0,0,0,0.35)" />
    </filter>
    <clipPath id="authorClip">
      <rect x="0" y="0" width="${Math.round(width * 0.32)}" height="${Math.round(height * 0.42)}" rx="20" />
    </clipPath>
    `;

    if (gradInfo.id) {
      defsContent += gradInfo.def;
    }

    // Card background & borders
    let cardElements = '';
    if (cardStyle !== 'none') {
      const cardStroke = borderStyle === 'none' ? 'none' : borderColor;
      const strokeWidth = borderStyle === 'none' ? 0 : (borderStyle === 'thick' ? 4 : 1.5);
      const strokeDash = borderStyle === 'dashed' ? 'stroke-dasharray="8,8"' : '';
      cardElements = `
      <rect x="${padX}" y="${padY}" width="${cardW}" height="${cardH}" rx="24"
        fill="${cardBackground}" stroke="${cardStroke}" stroke-width="${strokeWidth}" ${strokeDash}
        filter="url(#cardShadow)" />
      `;
    }

    // Category Badge
    let categoryElement = '';
    if (showCategory && category) {
      const badgeY = padY + (cardStyle !== 'none' ? 36 : 20);
      categoryElement = `
      <g transform="translate(${textX}, ${badgeY})">
        <text class="meta-text" text-anchor="${textAnchor}" font-size="${metaFontSize}" font-weight="700" letter-spacing="0.1em" fill="${accentColor}" opacity="0.9">
          ${escapeHtml(category.toUpperCase())}
        </text>
      </g>`;
    }

    // Quote lines
    let quoteLinesSvg = '';
    lines.forEach((line, idx) => {
      const lineY = startY + (idx * lineHeight);
      quoteLinesSvg += `
      <text class="quote-text" x="${textX}" y="${lineY}" font-size="${baseFontSize}" text-anchor="${textAnchor}">
        ${escapeHtml(line)}
      </text>`;
    });

    // Author & Handle
    let authorElement = '';
    if (showAuthor && author) {
      const authorY = startY + (lines.length * lineHeight) + Math.round(authorFontSize * 1.5);
      const safeAuthor = escapeHtml(author);
      const safeHandle = handle ? ` <tspan class="meta-text" font-weight="400"> ${escapeHtml(handle)}</tspan>` : '';
      authorElement = `
      <text class="author-text" x="${textX}" y="${authorY}" font-size="${authorFontSize}" text-anchor="${textAnchor}">
        — ${safeAuthor}${safeHandle}
      </text>`;
    }

    // Date
    let dateElement = '';
    if (showDate && date) {
      const dateY = height - padY - 24;
      dateElement = `
      <text class="meta-text" x="${padX + 24}" y="${dateY}" font-size="${metaFontSize}" text-anchor="start">
        ${escapeHtml(date)}
      </text>`;
    }

    // Watermark
    let watermarkElement = '';
    if (showWatermark && watermark) {
      let wmX = width - padX - 24;
      let wmY = height - padY - 24;
      let wmAnchor = 'end';

      if (brandingPosition === 'bottom-left') {
        wmX = padX + 24;
        wmAnchor = 'start';
      } else if (brandingPosition === 'top-right') {
        wmX = width - padX - 24;
        wmY = padY + 36;
        wmAnchor = 'end';
      } else if (brandingPosition === 'top-left') {
        wmX = padX + 24;
        wmY = padY + 36;
        wmAnchor = 'start';
      } else if (brandingPosition === 'footer-center') {
        wmX = width / 2;
        wmAnchor = 'middle';
      }

      watermarkElement = `
      <text class="watermark-text" x="${wmX}" y="${wmY}" text-anchor="${wmAnchor}">
        ${escapeHtml(watermark)}
      </text>`;
    }

    // Author portrait image embed if enabled
    let authorImgElement = '';
    if (showAuthorImage && authorImage) {
      const portraitW = Math.round(width * 0.28);
      const portraitH = Math.round(height * 0.36);
      let pX = width - padX - portraitW;
      let pY = height - padY - portraitH;

      if (authorImagePlacement.includes('left')) {
        pX = padX;
      }

      authorImgElement = `
      <g transform="translate(${pX}, ${pY})">
        <rect width="${portraitW}" height="${portraitH}" rx="18" fill="rgba(255,255,255,0.06)" stroke="${accentColor}" stroke-width="1.5" />
        <image href="${escapeHtml(authorImage)}" width="${portraitW}" height="${portraitH}" rx="18" preserveAspectRatio="xMidYMid slice" />
      </g>`;
    }

    // Assemble entire SVG
    const bgFill = gradInfo.id ? `url(#${gradInfo.id})` : background;

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    ${defsContent}
  </defs>

  <!-- Background Canvas -->
  <rect width="100%" height="100%" fill="${bgFill}" />

  <!-- Layout Card & Frame -->
  ${cardElements}

  <!-- Author Cutout / Portrait -->
  ${authorImgElement}

  <!-- Category Badge -->
  ${categoryElement}

  <!-- Quote Lines -->
  ${quoteLinesSvg}

  <!-- Author Signature -->
  ${authorElement}

  <!-- Date -->
  ${dateElement}

  <!-- Watermark & Branding -->
  ${watermarkElement}
</svg>`;
  }

  /**
   * Export SVG Blob
   */
  static exportSvgBlob(data) {
    const svgString = this.renderToSvg(data);
    return new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  }
}
