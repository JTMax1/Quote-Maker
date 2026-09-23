/**
 * layoutRenderer.js
 * Comprehensive Drawing Engine for 100 Dynamic Quote Layouts
 * 
 * Provides dedicated layout chrome, visual backgrounds, author placeholders,
 * and decorative framing across all 5 layout categories:
 * 1. Author & Cutout Focus (1-20)
 * 2. Magazine & Editorial (21-40)
 * 3. Expressive & Display (41-60)
 * 4. Clean & Minimalist (61-80)
 * 5. Creative & Novelty (81-100)
 */

export class LayoutRenderer {
  /**
   * Helper to draw a rounded rectangle
   */
  static roundRect(ctx, x, y, width, height, radius, fill = true, stroke = false) {
    if (typeof radius === 'number') {
      radius = { tl: radius, tr: radius, br: radius, bl: radius };
    } else {
      radius = { tl: 0, tr: 0, br: 0, bl: 0, ...radius };
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  /**
   * Draw an author visual (image or stylish fallback placeholder)
   */
  static drawAuthorVisualOrPlaceholder(ctx, img, x, y, w, h, placement, styles, authorName = 'Author') {
    ctx.save();
    const accentColor = styles.accentColor || '#3b82f6';
    const isDark = styles.background && (styles.background.includes('#0') || styles.background.includes('#1') || styles.background.includes('#2'));
    const initial = (authorName || 'A').trim().charAt(0).toUpperCase();

    if (img) {
      // Draw real image inside container
      ctx.save();
      this.roundRect(ctx, x, y, w, h, 14, false, false);
      ctx.clip();
      const imgW = img.naturalWidth || img.width || 1;
      const imgH = img.naturalHeight || img.height || 1;
      const ratio = imgW / imgH;
      let dw = w;
      let dh = dw / ratio;
      if (dh < h) {
        dh = h;
        dw = dh * ratio;
      }
      ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
      ctx.restore();

      // Border accent
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2;
      this.roundRect(ctx, x, y, w, h, 14, false, true);
      ctx.restore();
      return;
    }

    // High-end Vector Silhouette / Monogram Placeholder
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 8;

    // Card backdrop
    const grad = ctx.createLinearGradient(x, y, x + w, y + h);
    grad.addColorStop(0, isDark ? 'rgba(39, 39, 42, 0.95)' : 'rgba(244, 244, 245, 0.95)');
    grad.addColorStop(1, isDark ? 'rgba(24, 24, 27, 0.98)' : 'rgba(228, 228, 231, 0.98)');
    ctx.fillStyle = grad;
    this.roundRect(ctx, x, y, w, h, 16, true, false);

    // Accent hairline border
    ctx.strokeStyle = `${accentColor}88`;
    ctx.lineWidth = 1.5;
    this.roundRect(ctx, x, y, w, h, 16, false, true);

    // Subtle inner grid or concentric rings
    const cx = x + w / 2;
    const cy = y + h * 0.42;
    const avatarR = Math.min(w * 0.32, 54);

    ctx.beginPath();
    ctx.arc(cx, cy, avatarR + 6, 0, Math.PI * 2);
    ctx.strokeStyle = `${accentColor}44`;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Monogram Circle
    const circleGrad = ctx.createLinearGradient(cx - avatarR, cy - avatarR, cx + avatarR, cy + avatarR);
    circleGrad.addColorStop(0, accentColor);
    circleGrad.addColorStop(1, `${accentColor}bb`);
    ctx.fillStyle = circleGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, avatarR, 0, Math.PI * 2);
    ctx.fill();

    // Initial Letter
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${Math.round(avatarR * 1.05)}px "Plus Jakarta Sans", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initial, cx, cy + 2);

    // Studio Profile Bust Silhouette representation
    const bustY = y + h * 0.72;
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.85)' : '#18181b';
    ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(authorName || 'AUTHOR', cx, bustY);

    // Subtitle Badge
    ctx.fillStyle = accentColor;
    ctx.font = '700 9px monospace';
    ctx.fillText('PORTRAIT PROFILE', cx, bustY + 18);

    ctx.restore();
  }

  /**
   * Draw specialized background elements for layouts
   */
  static drawLayoutBackground(ctx, width, height, activeLayout, styles) {
    if (!activeLayout) return;
    const id = activeLayout.id;
    const accent = styles.accentColor || '#3b82f6';
    const isDark = styles.background && (styles.background.includes('#0') || styles.background.includes('#1') || styles.background.includes('#2'));

    ctx.save();

    // 1. Zen Circle (Ensō ink ring)
    if (id === 'zen-circle') {
      const cx = width / 2;
      const cy = height / 2;
      const r = Math.min(width, height) * 0.32;
      ctx.save();
      ctx.strokeStyle = `${accent}33`;
      ctx.lineWidth = 28;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI * 0.85, Math.PI * 0.9, false);
      ctx.stroke();
      ctx.strokeStyle = `${accent}66`;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(cx, cy, r - 6, -Math.PI * 0.8, Math.PI * 0.85, false);
      ctx.stroke();
      ctx.restore();
    }

    // 2. Precision Dot Grid Matrix
    if (id === 'dotted-grid-bg') {
      ctx.save();
      ctx.fillStyle = isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)';
      const step = 28;
      for (let gx = step; gx < width; gx += step) {
        for (let gy = step; gy < height; gy += step) {
          ctx.beginPath();
          ctx.arc(gx, gy, 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // 3. Technical Blueprint Cyan Grid
    if (id === 'blueprint-cyan' || id === 'subtle-grid-blueprint') {
      ctx.save();
      if (id === 'blueprint-cyan') {
        ctx.fillStyle = '#0a2540';
        ctx.fillRect(0, 0, width, height);
      }
      ctx.strokeStyle = id === 'blueprint-cyan' ? 'rgba(255,255,255,0.12)' : `${accent}20`;
      ctx.lineWidth = 1;
      const gStep = 32;
      for (let x = 0; x < width; x += gStep) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gStep) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 4. Glitch Matrix Terminal Scanlines
    if (id === 'glitch-matrix') {
      ctx.save();
      ctx.fillStyle = '#020d06';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(34, 197, 94, 0.04)';
      for (let y = 0; y < height; y += 4) {
        ctx.fillRect(0, y, width, 1.5);
      }
      ctx.fillStyle = 'rgba(34, 197, 94, 0.1)';
      ctx.font = '700 12px monospace';
      ctx.fillText('01001001 01001110 01010011 01010000 01001001', 30, 40);
      ctx.fillText('[SEC.SYS // OK] PROTOCOL MATRIX 0x7F', width - 320, 40);
      ctx.restore();
    }

    // 5. Retro Synthwave Outrun Perspective Grid
    if (id === 'retro-synthwave') {
      ctx.save();
      const horizonY = height * 0.58;
      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0, '#090014');
      skyGrad.addColorStop(0.7, '#2b0938');
      skyGrad.addColorStop(1, '#ff007f');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, horizonY);

      // Sun glow
      ctx.save();
      const sunR = Math.min(width, height) * 0.18;
      const sunGrad = ctx.createLinearGradient(0, horizonY - sunR, 0, horizonY);
      sunGrad.addColorStop(0, '#fef08a');
      sunGrad.addColorStop(0.5, '#f43f5e');
      sunGrad.addColorStop(1, '#9333ea');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(width / 2, horizonY, sunR, Math.PI, 0, false);
      ctx.fill();
      // Sun horizontal stripes
      ctx.fillStyle = '#2b0938';
      for (let sy = horizonY - sunR + 20; sy < horizonY; sy += 12) {
        ctx.fillRect(width / 2 - sunR, sy, sunR * 2, 3);
      }
      ctx.restore();

      // Floor grid
      ctx.fillStyle = '#0a0012';
      ctx.fillRect(0, horizonY, width, height - horizonY);
      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 1.2;
      const vpX = width / 2;
      for (let fx = -width * 0.5; fx <= width * 1.5; fx += 70) {
        ctx.beginPath();
        ctx.moveTo(vpX, horizonY);
        ctx.lineTo(fx, height);
        ctx.stroke();
      }
      for (let fy = 1; fy <= 10; fy++) {
        const py = horizonY + (height - horizonY) * Math.pow(fy / 10, 2);
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(width, py);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 6. Pop-Art Comic Halftone Burst
    if (id === 'comic-pop') {
      ctx.save();
      ctx.fillStyle = 'rgba(250, 204, 21, 0.12)';
      ctx.fillRect(0, 0, width, height);
      // Comic speed burst rays
      const cx = width * 0.85;
      const cy = height * 0.15;
      ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 10) {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * width * 1.5, cy + Math.sin(a) * width * 1.5);
        ctx.lineTo(cx + Math.cos(a + 0.15) * width * 1.5, cy + Math.sin(a + 0.15) * width * 1.5);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // 7. Minimalist Diagonal Split
    if (id === 'split-diagonal' || id === 'author-split-diagonal') {
      ctx.save();
      ctx.fillStyle = `${accent}22`;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(width, height * 0.7);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = `${accent}55`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(width, height * 0.7);
      ctx.stroke();
      ctx.restore();
    }

    // 8. Vinyl Album Sleeve concentric groove rings
    if (id === 'vinyl-album-sleeve') {
      ctx.save();
      const cx = width * 0.88;
      const cy = height / 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      for (let r = 80; r < Math.min(width, height) * 0.85; r += 14) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 9. Bauhaus Primary Shapes
    if (id === 'bauhaus-geometry') {
      ctx.save();
      // Primary Red Circle
      ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
      ctx.beginPath();
      ctx.arc(width * 0.18, height * 0.22, 90, 0, Math.PI * 2);
      ctx.fill();
      // Primary Yellow Triangle
      ctx.fillStyle = 'rgba(234, 179, 8, 0.15)';
      ctx.beginPath();
      ctx.moveTo(width * 0.85, height * 0.12);
      ctx.lineTo(width * 0.95, height * 0.32);
      ctx.lineTo(width * 0.75, height * 0.32);
      ctx.closePath();
      ctx.fill();
      // Primary Blue Rectangle
      ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
      ctx.fillRect(width * 0.78, height * 0.72, 110, 110);
      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * Draw specialized card frames and novelty containers
   */
  static drawLayoutCard(ctx, x, y, w, h, activeLayout, styles) {
    if (!activeLayout) return;
    const id = activeLayout.id;
    const accent = styles.accentColor || '#3b82f6';
    const isDark = styles.background && (styles.background.includes('#0') || styles.background.includes('#1') || styles.background.includes('#2'));

    ctx.save();

    // 1. Post-It Yellow Sticky Note
    if (id === 'sticky-note') {
      ctx.save();
      const tilt = -0.035; // ~-2 deg
      const cx = x + w / 2;
      const cy = y + h / 2;
      ctx.translate(cx, cy);
      ctx.rotate(tilt);
      ctx.translate(-cx, -cy);

      // Deep realistic drop shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
      ctx.shadowBlur = 32;
      ctx.shadowOffsetY = 16;
      ctx.fillStyle = '#fef08a'; // classic post-it yellow
      this.roundRect(ctx, x, y, w, h, 6, true, false);

      // Sticky adhesive top strip
      ctx.fillStyle = 'rgba(253, 224, 71, 0.6)';
      ctx.fillRect(x, y, w, 36);

      // Red round pushpin at top center
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(cx, y + 16, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f87171';
      ctx.beginPath();
      ctx.arc(cx - 3, y + 13, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      ctx.restore();
      return;
    }

    // 2. Airline Boarding Pass
    if (id === 'boarding-pass') {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.2)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 10;
      ctx.fillStyle = isDark ? '#1c1917' : '#ffffff';
      this.roundRect(ctx, x, y, w, h, 16, true, false);
      ctx.strokeStyle = isDark ? '#44403c' : '#e7e5e4';
      ctx.lineWidth = 2;
      this.roundRect(ctx, x, y, w, h, 16, false, true);

      // Top flight header banner
      ctx.fillStyle = accent;
      this.roundRect(ctx, x, y, w, 44, { tl: 16, tr: 16, bl: 0, br: 0 }, true, false);
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('BOARDING PASS // FIRST CLASS', x + 24, y + 27);
      ctx.font = '700 12px monospace';
      ctx.fillText('GATE 04 • ZONE A', x + w - 160, y + 27);

      // Perforated coupon tear line on the right
      const perfX = x + w - 140;
      ctx.strokeStyle = isDark ? '#57534e' : '#a8a29e';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(perfX, y + 44);
      ctx.lineTo(perfX, y + h);
      ctx.stroke();
      ctx.setLineDash([]);

      // Top and bottom notch cutouts
      ctx.fillStyle = styles.background || '#090a0f';
      ctx.beginPath();
      ctx.arc(perfX, y, 12, 0, Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(perfX, y + h, 12, Math.PI, 0);
      ctx.fill();

      // Barcode on coupon stub
      ctx.fillStyle = isDark ? '#e7e5e4' : '#1c1917';
      const bY = y + h - 80;
      for (let bx = perfX + 16; bx < x + w - 16; bx += 4) {
        const barW = (bx % 3 === 0) ? 2.5 : 1.2;
        ctx.fillRect(bx, bY, barW, 48);
      }

      ctx.restore();
      ctx.restore();
      return;
    }

    // 3. Thermal Register Store Receipt
    if (id === 'receipt-pos') {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.22)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 12;
      ctx.fillStyle = '#fafaf9'; // warm off-white receipt paper
      ctx.fillRect(x, y, w, h);

      // Zigzag serrated tear edges top and bottom
      ctx.fillStyle = styles.background || '#090a0f';
      const serration = 10;
      for (let sx = x; sx < x + w; sx += serration * 2) {
        ctx.beginPath();
        ctx.moveTo(sx, y);
        ctx.lineTo(sx + serration, y + serration);
        ctx.lineTo(sx + serration * 2, y);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(sx, y + h);
        ctx.lineTo(sx + serration, y + h - serration);
        ctx.lineTo(sx + serration * 2, y + h);
        ctx.closePath();
        ctx.fill();
      }

      // Receipt Header
      ctx.fillStyle = '#1c1917';
      ctx.font = '700 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('*** QUOTE & WISDOM CO. ***', x + w / 2, y + 36);
      ctx.font = '500 10px monospace';
      ctx.fillText('STORE #0492 • TRANSACTION #8912', x + w / 2, y + 54);

      // Dashed receipt divider lines
      ctx.strokeStyle = '#a8a29e';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(x + 20, y + 68);
      ctx.lineTo(x + w - 20, y + 68);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x + 20, y + h - 75);
      ctx.lineTo(x + w - 20, y + h - 75);
      ctx.stroke();
      ctx.setLineDash([]);

      // Barcode at bottom
      ctx.fillStyle = '#1c1917';
      const rbcY = y + h - 55;
      for (let bx = x + 40; bx < x + w - 40; bx += 3.5) {
        const bw = (bx % 3 === 0) ? 2.5 : 1;
        ctx.fillRect(bx, rbcY, bw, 32);
      }

      ctx.restore();
      ctx.restore();
      return;
    }

    // 4. Kodak 35mm Film Roll Negative
    if (id === 'film-strip') {
      ctx.save();
      ctx.fillStyle = '#09090b';
      this.roundRect(ctx, x, y, w, h, 8, true, false);

      // Top and bottom sprocket hole strips
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      const spW = 12;
      const spH = 16;
      for (let sx = x + 16; sx < x + w - 16; sx += 26) {
        this.roundRect(ctx, sx, y + 8, spW, spH, 3, true, false);
        this.roundRect(ctx, sx, y + h - 24, spW, spH, 3, true, false);
      }

      // Golden Kodak frame marking
      ctx.fillStyle = '#eab308';
      ctx.font = '700 9px monospace';
      ctx.fillText('KODAK PORTRA 400 • 24A', x + 20, y + 36);
      ctx.fillText('SAFETY FILM • 25', x + w - 160, y + 36);

      // Film aperture window
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 2;
      this.roundRect(ctx, x + 14, y + 42, w - 28, h - 76, 6, false, true);

      ctx.restore();
      ctx.restore();
      return;
    }

    // 5. Vintage Mixtape Cassette Label
    if (id === 'cassette-tape') {
      ctx.save();
      ctx.fillStyle = isDark ? '#18181b' : '#27272a';
      this.roundRect(ctx, x, y, w, h, 20, true, false);

      // Paper tape label insert
      const lPad = 32;
      ctx.fillStyle = '#fefce8'; // warm cassette label paper
      this.roundRect(ctx, x + lPad, y + 30, w - lPad * 2, h - 60, 10, true, false);

      // Top red/blue color bars
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x + lPad, y + 30, (w - lPad * 2) * 0.5, 8);
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(x + lPad + (w - lPad * 2) * 0.5, y + 30, (w - lPad * 2) * 0.5, 8);

      // A-Side badge
      ctx.fillStyle = '#18181b';
      ctx.font = '900 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('SIDE A', x + lPad + 20, y + 64);
      ctx.font = '700 11px monospace';
      ctx.fillText('NR [STEREO] 90 MIN', x + w - lPad - 150, y + 62);

      // Center Spool Window
      const winW = w * 0.46;
      const winH = 48;
      const winX = x + (w - winW) / 2;
      const winY = y + h - 130;
      ctx.fillStyle = '#18181b';
      this.roundRect(ctx, winX, winY, winW, winH, 8, true, false);

      // Dual plastic spool cog circles
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(winX + 40, winY + 24, 14, 0, Math.PI * 2);
      ctx.arc(winX + winW - 40, winY + 24, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      ctx.restore();
      return;
    }

    // 6. Vintage Postage Stamp Scalloped Edges
    if (id === 'postage-stamp') {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.18)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 10;
      ctx.fillStyle = isDark ? '#1c1917' : '#ffffff';
      ctx.fillRect(x, y, w, h);

      // Scallop perforation holes around edge
      ctx.fillStyle = styles.background || '#090a0f';
      const holeR = 6;
      const spacing = 18;
      for (let px = x + spacing; px < x + w; px += spacing) {
        ctx.beginPath();
        ctx.arc(px, y, holeR, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px, y + h, holeR, 0, Math.PI * 2);
        ctx.fill();
      }
      for (let py = y + spacing; py < y + h; py += spacing) {
        ctx.beginPath();
        ctx.arc(x, py, holeR, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + w, py, holeR, 0, Math.PI * 2);
        ctx.fill();
      }

      // Postal cancellation postmark stamp
      ctx.strokeStyle = `${accent}66`;
      ctx.lineWidth = 2.5;
      const markX = x + w - 110;
      const markY = y + 90;
      ctx.beginPath();
      ctx.arc(markX, markY, 44, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(markX, markY, 36, 0, Math.PI * 2);
      ctx.stroke();

      // Wavy date cancellation lines
      for (let i = -16; i <= 16; i += 8) {
        ctx.beginPath();
        ctx.moveTo(markX - 110, markY + i);
        ctx.bezierCurveTo(markX - 80, markY + i - 6, markX - 60, markY + i + 6, markX - 44, markY + i);
        ctx.stroke();
      }

      ctx.restore();
      ctx.restore();
      return;
    }

    // 7. Par Avion Airmail Envelope
    if (id === 'vintage-envelope-letter') {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.18)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 10;
      ctx.fillStyle = isDark ? '#1c1917' : '#ffffff';
      this.roundRect(ctx, x, y, w, h, 12, true, false);

      // Red and Blue diagonal chevron border
      const bThickness = 12;
      const segW = 24;
      for (let bx = x; bx < x + w; bx += segW * 2) {
        ctx.fillStyle = '#dc2626'; // red chevron
        ctx.beginPath();
        ctx.moveTo(bx, y);
        ctx.lineTo(bx + segW, y);
        ctx.lineTo(bx + segW - bThickness, y + bThickness);
        ctx.lineTo(bx - bThickness, y + bThickness);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#2563eb'; // blue chevron
        ctx.beginPath();
        ctx.moveTo(bx + segW, y);
        ctx.lineTo(bx + segW * 2, y);
        ctx.lineTo(bx + segW * 2 - bThickness, y + bThickness);
        ctx.lineTo(bx + segW - bThickness, y + bThickness);
        ctx.closePath();
        ctx.fill();
      }

      // Par Avion pill stamp
      ctx.fillStyle = '#2563eb';
      this.roundRect(ctx, x + 24, y + 24, 130, 32, 6, true, false);
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 12px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('PAR AVION', x + 44, y + 45);

      ctx.restore();
      ctx.restore();
      return;
    }

    // 8. 3.5-Inch Retro Floppy Diskette
    if (id === 'retro-floppy-disk') {
      ctx.save();
      ctx.fillStyle = isDark ? '#18181b' : '#1e293b';
      this.roundRect(ctx, x, y, w, h, 16, true, false);

      // Metal sliding drive shutter at top
      ctx.fillStyle = '#94a3b8';
      this.roundRect(ctx, x + (w - 180) / 2, y, 180, 56, { tl: 0, tr: 0, bl: 8, br: 8 }, true, false);
      ctx.fillStyle = '#0f172a';
      this.roundRect(ctx, x + (w - 70) / 2, y + 16, 70, 24, 4, true, false);

      // Paper Disk Label
      const pY = y + 74;
      const pH = h - 100;
      ctx.fillStyle = '#ffffff';
      this.roundRect(ctx, x + 24, pY, w - 48, pH, 10, true, false);

      // Label color top strip & ruled lines
      ctx.fillStyle = accent;
      ctx.fillRect(x + 24, pY, w - 48, 12);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      for (let ly = pY + 36; ly < pY + pH - 16; ly += 24) {
        ctx.beginPath();
        ctx.moveTo(x + 36, ly);
        ctx.lineTo(x + w - 36, ly);
        ctx.stroke();
      }

      ctx.restore();
      ctx.restore();
      return;
    }

    // 9. Modern Left Accent Bar
    if (id === 'left-accent-bar') {
      ctx.fillStyle = accent;
      ctx.fillRect(x, y, 12, h);
    }

    // 10. Architectural Brackets
    if (id === 'bracket-container') {
      ctx.strokeStyle = accent;
      ctx.lineWidth = 4;
      const bLen = 45;
      // Left bracket [
      ctx.beginPath();
      ctx.moveTo(x + bLen, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y + h);
      ctx.lineTo(x + bLen, y + h);
      ctx.stroke();
      // Right bracket ]
      ctx.beginPath();
      ctx.moveTo(x + w - bLen, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x + w - bLen, y + h);
      ctx.stroke();
    }

    // 11. 16:9 Cinema Letterbox Bars
    if (id === 'cinema-subtitles') {
      ctx.fillStyle = '#000000';
      const barH = Math.round(h * 0.16);
      ctx.fillRect(0, 0, styles.width || 1200, barH);
      ctx.fillRect(0, (styles.height || 1200) - barH, styles.width || 1200, barH);
    }

    // 12. Cyberpunk HUD Reticles & Targeting Brackets
    if (id === 'cyberpunk-hud') {
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2.5;
      const tLen = 32;
      // 4 Targeting Corners
      ctx.beginPath();
      ctx.moveTo(x, y + tLen); ctx.lineTo(x, y); ctx.lineTo(x + tLen, y);
      ctx.moveTo(x + w - tLen, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + tLen);
      ctx.moveTo(x, y + h - tLen); ctx.lineTo(x, y + h); ctx.lineTo(x + tLen, y + h);
      ctx.moveTo(x + w - tLen, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - tLen);
      ctx.stroke();

      // Telemetry metadata
      ctx.fillStyle = accent;
      ctx.font = '700 10px monospace';
      ctx.fillText('[TARGET.ACQ // 0x4FF8]', x + 16, y - 10);
      ctx.fillText('[SYS.STATUS: LOCKED]', x + w - 170, y - 10);
      ctx.fillText('REC • 60 FPS', x + 16, y + h + 18);
    }

    // 13. Broadway Marquee Ticker with Illuminated Bulbs
    if (id === 'marquee-ticker') {
      ctx.strokeStyle = accent;
      ctx.lineWidth = 4;
      this.roundRect(ctx, x, y, w, h, 14, false, true);
      // Bulbs along perimeter
      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#eab308';
      ctx.shadowBlur = 12;
      for (let bx = x + 18; bx < x + w - 10; bx += 38) {
        ctx.beginPath();
        ctx.arc(bx, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(bx, y + h, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      for (let by = y + 18; by < y + h - 10; by += 38) {
        ctx.beginPath();
        ctx.arc(x, by, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + w, by, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 14. Neon Tube Signboard
    if (id === 'neon-signboard') {
      ctx.shadowColor = accent;
      ctx.shadowBlur = 24;
      ctx.strokeStyle = accent;
      ctx.lineWidth = 3.5;
      this.roundRect(ctx, x + 8, y + 8, w - 16, h - 16, 24, false, true);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      this.roundRect(ctx, x + 8, y + 8, w - 16, h - 16, 24, false, true);
    }

    ctx.restore();
  }

  /**
   * Draw specialized header / masthead chrome
   */
  static drawLayoutChrome(ctx, activeLayout, { width, height, cardX, cardY, cardW, cardH, styles, quote, author, date, category }) {
    if (!activeLayout) return;
    const id = activeLayout.id;
    const accent = styles.accentColor || '#3b82f6';
    const isDark = styles.background && (styles.background.includes('#0') || styles.background.includes('#1') || styles.background.includes('#2'));

    ctx.save();

    // 1. Broadsheet Newspaper Front Page Headline
    if (id === 'newspaper-headline') {
      const mastheadY = cardY + 20;
      ctx.textAlign = 'center';
      ctx.fillStyle = isDark ? '#ffffff' : '#18181b';
      ctx.font = '900 38px "Playfair Display", serif';
      ctx.fillText('THE DAILY DISPATCH', width / 2, mastheadY + 36);

      // Date / Weather / Edition rule bar
      ctx.strokeStyle = isDark ? '#52525b' : '#27272a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cardX + 20, mastheadY + 48);
      ctx.lineTo(cardX + cardW - 20, mastheadY + 48);
      ctx.stroke();

      ctx.font = '700 11px monospace';
      ctx.fillText(`VOL. CXLII • NO. 48 • ${date || 'DAILY SPECIAL EDITION'} • PRICE $1.50`, width / 2, mastheadY + 64);

      ctx.beginPath();
      ctx.moveTo(cardX + 20, mastheadY + 74);
      ctx.lineTo(cardX + cardW - 20, mastheadY + 74);
      ctx.stroke();
    }

    // 2. Open Book Spread Gutter Crease
    if (id === 'book-spread') {
      const cx = width / 2;
      // Gutter shadow
      const foldGrad = ctx.createLinearGradient(cx - 30, 0, cx + 30, 0);
      foldGrad.addColorStop(0, 'rgba(0,0,0,0)');
      foldGrad.addColorStop(0.5, 'rgba(0,0,0,0.25)');
      foldGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = foldGrad;
      ctx.fillRect(cx - 30, cardY, 60, cardH);

      // Book header folios
      ctx.font = 'italic 11px "Playfair Display", serif';
      ctx.fillStyle = isDark ? '#a1a1aa' : '#71717a';
      ctx.textAlign = 'left';
      ctx.fillText('CHAPTER IV • REFLECTIONS', cardX + 28, cardY + 34);
      ctx.textAlign = 'right';
      ctx.fillText(author || 'COLLECTED WORKS', cardX + cardW - 28, cardY + 34);
    }

    // 3. Numbered Manifesto Principle (Giant Roman Numeral watermark)
    if (id === 'manifesto-numbered') {
      ctx.save();
      ctx.font = '900 160px "Playfair Display", serif';
      ctx.fillStyle = `${accent}25`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('01.', width / 2, cardY + 28);
      ctx.restore();
    }

    // 4. Museum Plaque Label
    if (id === 'museum-plaque') {
      const pW = 280;
      const pH = 74;
      const pX = cardX + cardW - pW - 24;
      const pY = cardY + cardH - pH - 24;
      ctx.fillStyle = isDark ? '#27272a' : '#f4f4f5';
      this.roundRect(ctx, pX, pY, pW, pH, 6, true, false);
      ctx.strokeStyle = isDark ? '#52525b' : '#d4d4d8';
      ctx.lineWidth = 1.2;
      this.roundRect(ctx, pX, pY, pW, pH, 6, false, true);

      ctx.fillStyle = isDark ? '#ffffff' : '#18181b';
      ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(author ? author.toUpperCase() : 'UNKNOWN ARTIST', pX + 14, pY + 24);
      ctx.font = '400 9.5px monospace';
      ctx.fillStyle = isDark ? '#a1a1aa' : '#71717a';
      ctx.fillText('INV. 2026.49 • OIL ON LINEN CANVAS', pX + 14, pY + 42);
      ctx.fillText('GIFT OF THE FOUNDATION • 120 × 120 CM', pX + 14, pY + 58);
    }

    // 5. Monocle Global Brief Coordinates
    if (id === 'monocle-brief') {
      ctx.fillStyle = accent;
      this.roundRect(ctx, cardX + 24, cardY + 24, 110, 24, 4, true, false);
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('DISPATCH', cardX + 79, cardY + 40);

      ctx.fillStyle = isDark ? '#a1a1aa' : '#71717a';
      ctx.font = '600 10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('GLOBAL BRIEF // COORD: 51.5074° N, 0.1278° W', cardX + 145, cardY + 40);
    }

    // 6. Podcast Audio Waveform Bars
    if (id === 'audio-wave') {
      const waveY = cardY + cardH - 100;
      const waveH = 40;
      const waveW = cardW - 60;
      ctx.fillStyle = accent;
      // Wave bars
      const numBars = 48;
      const barSpacing = waveW / numBars;
      for (let i = 0; i < numBars; i++) {
        const heightFactor = Math.sin(i * 0.35) * 0.5 + Math.cos(i * 0.8) * 0.4 + 0.5;
        const bHeight = Math.max(8, heightFactor * waveH);
        const bx = cardX + 30 + i * barSpacing;
        this.roundRect(ctx, bx, waveY + (waveH - bHeight) / 2, barSpacing * 0.6, bHeight, 2, true, false);
      }

      // Timecode
      ctx.fillStyle = isDark ? '#a1a1aa' : '#71717a';
      ctx.font = '700 11px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('▶ 01:24 / 03:45', cardX + 30, waveY + waveH + 24);
      ctx.textAlign = 'right';
      ctx.fillText('EPISODE 42 • MASTER AUDIO', cardX + cardW - 30, waveY + waveH + 24);
    }

    // 7. Academic Thesis Footnote Citation
    if (id === 'literary-footnote') {
      const fnY = cardY + cardH - 60;
      ctx.strokeStyle = isDark ? '#3f3f46' : '#d4d4d8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cardX + 24, fnY);
      ctx.lineTo(cardX + 180, fnY);
      ctx.stroke();

      ctx.fillStyle = isDark ? '#a1a1aa' : '#71717a';
      ctx.font = '400 10px "Playfair Display", serif';
      ctx.textAlign = 'left';
      ctx.fillText(`[1] ${author || 'Author'}, Selected Philosophical Treatises, Vol. II, p. 118.`, cardX + 24, fnY + 22);
    }

    // 8. Glossy Spread Kicker Header Bar
    if (id === 'glossy-spread') {
      ctx.fillStyle = accent;
      ctx.fillRect(cardX, cardY, cardW, 14);
      ctx.font = '800 11px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText(category ? category.toUpperCase() : 'FEATURE STORY', cardX + 16, cardY + 34);
    }

    // 9. Classical Manuscript Fleurons
    if (id === 'manuscript-parchment') {
      ctx.strokeStyle = '#d4af37'; // antique gold
      ctx.lineWidth = 2;
      this.roundRect(ctx, cardX + 14, cardY + 14, cardW - 28, cardH - 28, 8, false, true);
      this.roundRect(ctx, cardX + 22, cardY + 22, cardW - 44, cardH - 44, 4, false, true);

      // Corner ornamental fleurons
      ctx.fillStyle = '#d4af37';
      ctx.font = '22px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('❦', cardX + 34, cardY + 34);
      ctx.fillText('❦', cardX + cardW - 34, cardY + 34);
      ctx.fillText('❦', cardX + 34, cardY + cardH - 34);
      ctx.fillText('❦', cardX + cardW - 34, cardY + cardH - 34);
    }

    // 10. Poetry Anthology Floral Flourish
    if (id === 'poetry-anthology') {
      ctx.fillStyle = accent;
      ctx.font = '26px serif';
      ctx.textAlign = 'center';
      ctx.fillText('❦  ·  ✦  ·  ❦', width / 2, cardY + 36);
    }

    // 11. Daily Calendar Tear-Off Page
    if (id === 'calendar-tear-off') {
      // Top red binding stub
      ctx.fillStyle = '#dc2626';
      this.roundRect(ctx, cardX, cardY, cardW, 64, { tl: 14, tr: 14, bl: 0, br: 0 }, true, false);

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TODAY', width / 2, cardY + 40);

      // Big red calendar day number
      ctx.fillStyle = '#dc2626';
      ctx.font = '900 84px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('23', width / 2, cardY + 160);
    }

    ctx.restore();
  }
}
