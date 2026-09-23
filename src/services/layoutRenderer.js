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

    // Monogram Circle
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

    // Studio Profile Bust Silhouette
    const bustY = y + h * 0.74;
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.85)' : '#18181b';
    ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(authorName || 'AUTHOR', cx, bustY);

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

    // 4. Glitch Matrix Terminal Scanlines (Luminous Green phosphor)
    if (id === 'glitch-matrix') {
      ctx.save();
      ctx.fillStyle = '#020d06';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(34, 197, 94, 0.05)';
      for (let y = 0; y < height; y += 4) {
        ctx.fillRect(0, y, width, 1.5);
      }
      ctx.fillStyle = '#4ade80';
      ctx.font = '700 11px monospace';
      ctx.fillText('01001001 01001110 01010011 01010000 01001001', 32, 40);
      ctx.fillText('[SEC.SYS // OK] PROTOCOL MATRIX 0x7F', width - 300, 40);
      ctx.restore();
    }

    // 5. Retro Synthwave Outrun Perspective Grid
    if (id === 'retro-synthwave') {
      ctx.save();
      const horizonY = height * 0.58;
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0, '#090014');
      skyGrad.addColorStop(0.7, '#2b0938');
      skyGrad.addColorStop(1, '#ff007f');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, horizonY);

      // Sun glow
      const sunR = Math.min(width, height) * 0.18;
      const sunGrad = ctx.createLinearGradient(0, horizonY - sunR, 0, horizonY);
      sunGrad.addColorStop(0, '#fef08a');
      sunGrad.addColorStop(0.5, '#f43f5e');
      sunGrad.addColorStop(1, '#9333ea');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(width / 2, horizonY, sunR, Math.PI, 0, false);
      ctx.fill();

      // Sun stripes
      ctx.fillStyle = '#2b0938';
      for (let sy = horizonY - sunR + 20; sy < horizonY; sy += 12) {
        ctx.fillRect(width / 2 - sunR, sy, sunR * 2, 3);
      }

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
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(width, height * 0.7);
      ctx.stroke();
      ctx.restore();
    }

    // 8. Vinyl Album Sleeve & Peeking LP Record
    if (id === 'vinyl-album-sleeve') {
      ctx.save();
      const cx = width * 0.88;
      const cy = height / 2;
      const recordR = Math.min(width, height) * 0.44;

      // Vinyl Disc
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(cx, cy, recordR, 0, Math.PI * 2);
      ctx.fill();

      // Grooves
      ctx.strokeStyle = 'rgba(255,255,255,0.07)';
      ctx.lineWidth = 1;
      for (let r = 80; r < recordR - 10; r += 14) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Center Spindle Label
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(cx, cy, 64, 0, Math.PI * 2);
      ctx.fill();

      // Spindle Hole
      ctx.fillStyle = '#090a0f';
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 9. Bauhaus Primary Shapes
    if (id === 'bauhaus-geometry') {
      ctx.save();
      ctx.fillStyle = 'rgba(239, 68, 68, 0.18)'; // Primary Red Circle
      ctx.beginPath();
      ctx.arc(width * 0.18, height * 0.22, 90, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(234, 179, 8, 0.18)'; // Primary Yellow Triangle
      ctx.beginPath();
      ctx.moveTo(width * 0.85, height * 0.12);
      ctx.lineTo(width * 0.96, height * 0.34);
      ctx.lineTo(width * 0.74, height * 0.34);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = 'rgba(59, 130, 246, 0.18)'; // Primary Blue Rectangle
      ctx.fillRect(width * 0.78, height * 0.72, 110, 110);
      ctx.restore();
    }

    // 10. Organic Liquid Blobs
    if (id === 'liquid-blobs-pop') {
      ctx.save();
      const blobGrad1 = ctx.createLinearGradient(0, 0, width * 0.4, height * 0.4);
      blobGrad1.addColorStop(0, `${accent}44`);
      blobGrad1.addColorStop(1, 'rgba(236, 72, 153, 0.25)');
      ctx.fillStyle = blobGrad1;
      ctx.beginPath();
      ctx.ellipse(width * 0.12, height * 0.16, 160, 120, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      const blobGrad2 = ctx.createLinearGradient(width * 0.6, height * 0.6, width, height);
      blobGrad2.addColorStop(0, 'rgba(168, 85, 247, 0.25)');
      blobGrad2.addColorStop(1, `${accent}44`);
      ctx.fillStyle = blobGrad2;
      ctx.beginPath();
      ctx.ellipse(width * 0.88, height * 0.84, 180, 140, -Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 11. Swiss Duotone Poster
    if (id === 'duotone-poster') {
      ctx.save();
      const dtGrad = ctx.createLinearGradient(0, 0, width, height);
      dtGrad.addColorStop(0, '#0284c7');
      dtGrad.addColorStop(0.5, '#0369a1');
      dtGrad.addColorStop(1, '#0c4a6e');
      ctx.fillStyle = dtGrad;
      ctx.fillRect(0, 0, width, height);

      // Colossal watermark glyph
      ctx.font = '900 480px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Q', width / 2, height / 2);
      ctx.restore();
    }

    // 12. Gothic Dark Occult
    if (id === 'heavy-metal-blackletter') {
      ctx.save();
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      // Sharp medieval corner dagger spikes
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      const spikeLen = 48;
      // Top-left
      ctx.beginPath();
      ctx.moveTo(32, 32 + spikeLen); ctx.lineTo(32, 32); ctx.lineTo(32 + spikeLen, 32);
      ctx.moveTo(32, 32); ctx.lineTo(32 + spikeLen * 0.7, 32 + spikeLen * 0.7);
      ctx.stroke();
      // Top-right
      ctx.beginPath();
      ctx.moveTo(width - 32, 32 + spikeLen); ctx.lineTo(width - 32, 32); ctx.lineTo(width - 32 - spikeLen, 32);
      ctx.moveTo(width - 32, 32); ctx.lineTo(width - 32 - spikeLen * 0.7, 32 + spikeLen * 0.7);
      ctx.stroke();
      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(32, height - 32 - spikeLen); ctx.lineTo(32, height - 32); ctx.lineTo(32 + spikeLen, height - 32);
      ctx.moveTo(32, height - 32); ctx.lineTo(32 + spikeLen * 0.7, height - 32 - spikeLen * 0.7);
      ctx.stroke();
      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(width - 32, height - 32 - spikeLen); ctx.lineTo(width - 32, height - 32); ctx.lineTo(width - 32 - spikeLen, height - 32);
      ctx.moveTo(width - 32, height - 32); ctx.lineTo(width - 32 - spikeLen * 0.7, height - 32 - spikeLen * 0.7);
      ctx.stroke();
      ctx.restore();
    }

    // 13. Street Stencil Graffiti
    if (id === 'stencil-spray') {
      ctx.save();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 3;
      ctx.setLineDash([14, 10]);
      this.roundRect(ctx, 32, 32, width - 64, height - 64, 8, false, true);
      ctx.setLineDash([]);

      // Spray splatter dots around corners
      ctx.fillStyle = `${accent}66`;
      for (let i = 0; i < 30; i++) {
        const sx = 20 + Math.random() * 80;
        const sy = 20 + Math.random() * 80;
        ctx.beginPath();
        ctx.arc(sx, sy, 1 + Math.random() * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 14. Diagonal Kinetic Type
    if (id === 'diagonal-kinetic') {
      ctx.save();
      ctx.strokeStyle = `${accent}33`;
      ctx.lineWidth = 4;
      for (let k = -200; k < width + 400; k += 120) {
        ctx.beginPath();
        ctx.moveTo(k, 0);
        ctx.lineTo(k - 200, height);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 15. Architectural Crosshair Grid
    if (id === 'minimal-crosshair') {
      ctx.save();
      ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';
      ctx.lineWidth = 1;

      // Full canvas crosshair axes
      ctx.beginPath();
      ctx.moveTo(width / 2, 0); ctx.lineTo(width / 2, height);
      ctx.moveTo(0, height / 2); ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Center crosshair ring
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 36, 0, Math.PI * 2);
      ctx.stroke();

      // 4 Drafting ticks
      ctx.fillStyle = isDark ? '#a1a1aa' : '#71717a';
      ctx.font = '700 9px monospace';
      ctx.fillText('+ 0.00', 40, 40);
      ctx.fillText('+ 120.0', width - 80, 40);
      ctx.fillText('+ 240.0', 40, height - 30);
      ctx.fillText('+ 360.0', width - 80, height - 30);
      ctx.restore();
    }

    // 16. Swiss Asymmetric 4-Quadrant Grid
    if (id === 'swiss-asymmetric') {
      ctx.save();
      ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)';
      ctx.lineWidth = 1.5;

      const splitX = width * 0.38;
      const splitY = height * 0.32;

      ctx.beginPath();
      ctx.moveTo(splitX, 0); ctx.lineTo(splitX, height);
      ctx.moveTo(0, splitY); ctx.lineTo(width, splitY);
      ctx.stroke();

      // Top right quadrant index number
      ctx.fillStyle = accent;
      ctx.font = '900 64px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('01', width - 40, splitY - 24);

      ctx.fillStyle = isDark ? '#a1a1aa' : '#71717a';
      ctx.font = '700 10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('SWISS GRID SYSTEM // 4-QUADRANT', 40, splitY - 24);
      ctx.restore();
    }

    // 17. Stark Monochrome Grid
    if (id === 'monochrome-stark') {
      ctx.save();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 6;
      ctx.strokeRect(20, 20, width - 40, height - 40);
      ctx.restore();
    }

    // 18. Semicircle Edge Portal (Author Focus)
    if (id === 'author-circle-side') {
      ctx.save();
      const cx = width;
      const cy = height / 2;
      const pr = Math.min(width, height) * 0.36;

      ctx.beginPath();
      ctx.arc(cx, cy, pr, Math.PI * 0.5, Math.PI * 1.5, false);
      ctx.fillStyle = `${accent}25`;
      ctx.fill();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Inner ring
      ctx.beginPath();
      ctx.arc(cx, cy, pr - 14, Math.PI * 0.5, Math.PI * 1.5, false);
      ctx.strokeStyle = `${accent}55`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }

    // 19. Cinematic Header Banner Container
    if (id === 'author-header-banner') {
      ctx.save();
      const bH = Math.round(height * 0.34);
      ctx.fillStyle = `${accent}22`;
      ctx.fillRect(0, 0, width, bH);
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, bH);
      ctx.lineTo(width, bH);
      ctx.stroke();
      ctx.restore();
    }

    // 20. Diagonal Photo Angle Split
    if (id === 'diagonal-photo-angle' || id === 'author-split-diagonal') {
      ctx.save();
      ctx.fillStyle = `${accent}25`;
      ctx.beginPath();
      ctx.moveTo(width * 0.4, 0);
      ctx.lineTo(width, 0);
      ctx.lineTo(width, height);
      ctx.lineTo(width * 0.6, height);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(width * 0.4, 0);
      ctx.lineTo(width * 0.6, height);
      ctx.stroke();
      ctx.restore();
    }

    // 21. Industrial Hazard Strip (Yellow & Black Diagonal Warning Stripes)
    if (id === 'cyber-warning-hazard') {
      ctx.save();
      const hazardColor = styles.accentColor || '#ffd000';
      const stripeH = 36;
      
      const drawHazardBar = (barY) => {
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, barY, width, stripeH);
        ctx.clip();
        
        // Safety yellow background
        ctx.fillStyle = hazardColor;
        ctx.fillRect(0, barY, width, stripeH);
        
        // 45-degree diagonal jet black hazard stripes
        ctx.fillStyle = '#000000';
        for (let hx = -stripeH * 2; hx < width + stripeH * 2; hx += 38) {
          ctx.beginPath();
          ctx.moveTo(hx, barY);
          ctx.lineTo(hx + 20, barY);
          ctx.lineTo(hx + 20 - stripeH, barY + stripeH);
          ctx.lineTo(hx - stripeH, barY + stripeH);
          ctx.closePath();
          ctx.fill();
        }
        
        // Heavy border line separating hazard tape
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        if (barY === 0) {
          ctx.moveTo(0, stripeH);
          ctx.lineTo(width, stripeH);
        } else {
          ctx.moveTo(0, barY);
          ctx.lineTo(width, barY);
        }
        ctx.stroke();
        ctx.restore();
      };

      // Draw top and bottom warning bars
      drawHazardBar(0);
      drawHazardBar(height - stripeH);

      // Industrial technical corner crosshair ticks
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      const cornerInset = 54;
      const tickLen = 16;
      const corners = [
        [cornerInset, cornerInset],
        [width - cornerInset, cornerInset],
        [cornerInset, height - cornerInset],
        [width - cornerInset, height - cornerInset]
      ];
      corners.forEach(([cx, cy]) => {
        ctx.beginPath();
        ctx.moveTo(cx - tickLen, cy);
        ctx.lineTo(cx + tickLen, cy);
        ctx.moveTo(cx, cy - tickLen);
        ctx.lineTo(cx, cy + tickLen);
        ctx.stroke();
      });

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

    // 1. Post-It Yellow Sticky Note
    if (id === 'sticky-note') {
      ctx.save();
      const tilt = -0.035;
      const cx = x + w / 2;
      const cy = y + h / 2;
      ctx.translate(cx, cy);
      ctx.rotate(tilt);
      ctx.translate(-cx, -cy);

      ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
      ctx.shadowBlur = 32;
      ctx.shadowOffsetY = 16;
      ctx.fillStyle = '#fef08a';
      this.roundRect(ctx, x, y, w, h, 6, true, false);

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

      // Flight header banner
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
      return;
    }

    // 3. Thermal Register Store Receipt
    if (id === 'receipt-pos') {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.22)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 12;
      ctx.fillStyle = '#fafaf9';
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

      ctx.strokeStyle = '#a8a29e';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(x + 20, y + 68); ctx.lineTo(x + w - 20, y + 68);
      ctx.moveTo(x + 20, y + h - 75); ctx.lineTo(x + w - 20, y + h - 75);
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
      return;
    }

    // 4. Kodak 35mm Film Roll Negative
    if (id === 'film-strip') {
      ctx.save();
      ctx.fillStyle = '#09090b';
      this.roundRect(ctx, x, y, w, h, 8, true, false);

      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      const spW = 12;
      const spH = 16;
      for (let sx = x + 16; sx < x + w - 16; sx += 26) {
        this.roundRect(ctx, sx, y + 8, spW, spH, 3, true, false);
        this.roundRect(ctx, sx, y + h - 24, spW, spH, 3, true, false);
      }

      ctx.fillStyle = '#eab308';
      ctx.font = '700 9px monospace';
      ctx.fillText('KODAK PORTRA 400 • 24A', x + 20, y + 36);
      ctx.fillText('SAFETY FILM • 25', x + w - 160, y + 36);

      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 2;
      this.roundRect(ctx, x + 14, y + 42, w - 28, h - 76, 6, false, true);
      ctx.restore();
      return;
    }

    // 5. Vintage Mixtape Cassette Label
    if (id === 'cassette-tape') {
      ctx.save();
      ctx.fillStyle = isDark ? '#18181b' : '#27272a';
      this.roundRect(ctx, x, y, w, h, 20, true, false);

      const lPad = 32;
      ctx.fillStyle = '#fefce8';
      this.roundRect(ctx, x + lPad, y + 30, w - lPad * 2, h - 60, 10, true, false);

      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x + lPad, y + 30, (w - lPad * 2) * 0.5, 8);
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(x + lPad + (w - lPad * 2) * 0.5, y + 30, (w - lPad * 2) * 0.5, 8);

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

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(winX + 40, winY + 24, 14, 0, Math.PI * 2);
      ctx.arc(winX + winW - 40, winY + 24, 14, 0, Math.PI * 2);
      ctx.fill();

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

      ctx.fillStyle = styles.background || '#090a0f';
      const holeR = 6;
      const spacing = 18;
      for (let px = x + spacing; px < x + w; px += spacing) {
        ctx.beginPath();
        ctx.arc(px, y, holeR, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath();
        ctx.arc(px, y + h, holeR, 0, Math.PI * 2); ctx.fill();
      }
      for (let py = y + spacing; py < y + h; py += spacing) {
        ctx.beginPath();
        ctx.arc(x, py, holeR, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath();
        ctx.arc(x + w, py, holeR, 0, Math.PI * 2); ctx.fill();
      }

      ctx.strokeStyle = `${accent}66`;
      ctx.lineWidth = 2.5;
      const markX = x + w - 110;
      const markY = y + 90;
      ctx.beginPath();
      ctx.arc(markX, markY, 44, 0, Math.PI * 2);
      ctx.stroke();

      for (let i = -16; i <= 16; i += 8) {
        ctx.beginPath();
        ctx.moveTo(markX - 110, markY + i);
        ctx.bezierCurveTo(markX - 80, markY + i - 6, markX - 60, markY + i + 6, markX - 44, markY + i);
        ctx.stroke();
      }

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

      const bThickness = 12;
      const segW = 24;
      for (let bx = x; bx < x + w; bx += segW * 2) {
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(bx, y); ctx.lineTo(bx + segW, y);
        ctx.lineTo(bx + segW - bThickness, y + bThickness);
        ctx.lineTo(bx - bThickness, y + bThickness);
        ctx.closePath(); ctx.fill();

        ctx.fillStyle = '#2563eb';
        ctx.beginPath();
        ctx.moveTo(bx + segW, y); ctx.lineTo(bx + segW * 2, y);
        ctx.lineTo(bx + segW * 2 - bThickness, y + bThickness);
        ctx.lineTo(bx + segW - bThickness, y + bThickness);
        ctx.closePath(); ctx.fill();
      }

      // Par Avion pill stamp
      ctx.fillStyle = '#2563eb';
      this.roundRect(ctx, x + 24, y + 24, 130, 32, 6, true, false);
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 12px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('PAR AVION', x + 44, y + 45);

      ctx.restore();
      return;
    }

    // 8. 3.5-Inch Retro Floppy Diskette
    if (id === 'retro-floppy-disk') {
      ctx.save();
      ctx.fillStyle = isDark ? '#18181b' : '#1e293b';
      this.roundRect(ctx, x, y, w, h, 16, true, false);

      ctx.fillStyle = '#94a3b8';
      this.roundRect(ctx, x + (w - 180) / 2, y, 180, 56, { tl: 0, tr: 0, bl: 8, br: 8 }, true, false);
      ctx.fillStyle = '#0f172a';
      this.roundRect(ctx, x + (w - 70) / 2, y + 16, 70, 24, 4, true, false);

      const pY = y + 74;
      const pH = h - 100;
      ctx.fillStyle = '#ffffff';
      this.roundRect(ctx, x + 24, pY, w - 48, pH, 10, true, false);

      ctx.fillStyle = accent;
      ctx.fillRect(x + 24, pY, w - 48, 12);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      for (let ly = pY + 36; ly < pY + pH - 16; ly += 24) {
        ctx.beginPath();
        ctx.moveTo(x + 36, ly); ctx.lineTo(x + w - 36, ly);
        ctx.stroke();
      }

      ctx.restore();
      return;
    }

    // 9. Perforated Ticket Stub (Museum / Cinema)
    if (id === 'museum-ticket-stub') {
      ctx.save();
      ctx.fillStyle = '#fef3c7'; // warm ticket buff
      this.roundRect(ctx, x, y, w, h, 12, true, false);

      // Perforation line at 75% width
      const stubX = x + Math.round(w * 0.74);
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(stubX, y);
      ctx.lineTo(stubX, y + h);
      ctx.stroke();
      ctx.setLineDash([]);

      // Top & Bottom circular punchout notches
      ctx.fillStyle = styles.background || '#090a0f';
      ctx.beginPath(); ctx.arc(stubX, y, 14, 0, Math.PI); ctx.fill();
      ctx.beginPath(); ctx.arc(stubX, y + h, 14, Math.PI, 0); ctx.fill();

      // Right stub details
      ctx.fillStyle = '#78350f';
      ctx.font = '800 13px monospace';
      ctx.fillText('ADMIT ONE', stubX + 18, y + 42);
      ctx.font = '700 11px monospace';
      ctx.fillText('№ 084291', stubX + 18, y + 66);
      ctx.fillText('$15.00', stubX + 18, y + 88);

      // Mini barcode on stub
      for (let bx = stubX + 18; bx < x + w - 18; bx += 4) {
        ctx.fillRect(bx, y + h - 60, (bx % 3 === 0) ? 2.5 : 1.2, 36);
      }

      ctx.restore();
      return;
    }

    // 10. Smith-Corona Typewriter Page
    if (id === 'vintage-typewriter') {
      ctx.save();
      ctx.fillStyle = '#f7f4ec'; // aged typewriter bond paper
      this.roundRect(ctx, x, y, w, h, 4, true, false);

      // Top metal bail bar
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(x, y, w, 20);
      ctx.fillStyle = '#475569';
      ctx.font = '700 8px monospace';
      ctx.fillText('0 • 10 • 20 • 30 • 40 • 50 • 60 • 70 • 80', x + 24, y + 13);

      // Red margin line
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + 44, y + 20);
      ctx.lineTo(x + 44, y + h);
      ctx.stroke();

      ctx.restore();
      return;
    }

    // 11. 16-Bit Retro Game Cartridge
    if (id === 'retro-game-cartridge') {
      ctx.save();
      ctx.fillStyle = '#334155'; // SNES cartridge plastic
      this.roundRect(ctx, x, y, w, h, 20, true, false);

      // Top insertion grip notches
      ctx.fillStyle = '#1e293b';
      for (let gx = x + 40; gx < x + w - 40; gx += 28) {
        ctx.fillRect(gx, y + 8, 14, 20);
      }

      // Large label sticker in center
      const sPad = 28;
      ctx.fillStyle = '#f8fafc';
      this.roundRect(ctx, x + sPad, y + 40, w - sPad * 2, h - 80, 10, true, false);

      // Gold Seal of Quality
      const sealX = x + w - sPad - 54;
      const sealY = y + 74;
      ctx.fillStyle = '#eab308';
      ctx.beginPath(); ctx.arc(sealX, sealY, 26, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('ORIGINAL', sealX, sealY - 4);
      ctx.fillText('QUALITY', sealX, sealY + 6);

      ctx.restore();
      return;
    }

    // 12. Now Playing Music Lockscreen
    if (id === 'music-player-lockscreen') {
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 28;
      this.roundRect(ctx, x, y, w, h, 24, true, false);
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1.5;
      this.roundRect(ctx, x, y, w, h, 24, false, true);

      // Top banner
      ctx.fillStyle = '#94a3b8';
      ctx.font = '700 11px monospace';
      ctx.fillText('NOW PLAYING • PODCAST & AUDIO', x + 32, y + 36);

      // Bottom scrub bar
      const scrubY = y + h - 65;
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x + 32, scrubY);
      ctx.lineTo(x + w - 32, scrubY);
      ctx.stroke();

      // Progress bar (40% complete)
      const progW = (w - 64) * 0.42;
      ctx.strokeStyle = accent;
      ctx.beginPath();
      ctx.moveTo(x + 32, scrubY);
      ctx.lineTo(x + 32 + progW, scrubY);
      ctx.stroke();

      // Scrub circle
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x + 32 + progW, scrubY, 7, 0, Math.PI * 2);
      ctx.fill();

      // Timestamps
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 10px monospace';
      ctx.fillText('01:42', x + 32, scrubY + 22);
      ctx.textAlign = 'right';
      ctx.fillText('-02:18', x + w - 32, scrubY + 22);

      ctx.restore();
      return;
    }

    // 13. Archival Newsprint Clipping with Paperclip
    if (id === 'newspaper-clipping') {
      ctx.save();
      const tilt = -0.03;
      const cx = x + w / 2;
      const cy = y + h / 2;
      ctx.translate(cx, cy);
      ctx.rotate(tilt);
      ctx.translate(-cx, -cy);

      ctx.fillStyle = '#fefce8';
      this.roundRect(ctx, x, y, w, h, 4, true, false);

      // Silver Paperclip on top-left edge
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      const pcX = x + 44;
      const pcY = y - 10;
      ctx.beginPath();
      ctx.moveTo(pcX, pcY + 44);
      ctx.lineTo(pcX, pcY + 12);
      ctx.arc(pcX + 8, pcY + 12, 8, Math.PI, 0);
      ctx.lineTo(pcX + 16, pcY + 48);
      ctx.arc(pcX + 8, pcY + 48, 8, 0, Math.PI);
      ctx.lineTo(pcX, pcY + 24);
      ctx.stroke();

      ctx.restore();
      return;
    }

    // 14. Grand Hotel Key Fob
    if (id === 'hotel-keycard-tag') {
      ctx.save();
      ctx.fillStyle = '#064e3b'; // deep emerald acrylic tag
      this.roundRect(ctx, x, y, w, h, 28, true, false);
      ctx.strokeStyle = '#fbbf24'; // gold border
      ctx.lineWidth = 3;
      this.roundRect(ctx, x, y, w, h, 28, false, true);

      // Top brass grommet hole
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(x + w / 2, y + 36, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = styles.background || '#090a0f';
      ctx.beginPath();
      ctx.arc(x + w / 2, y + 36, 6, 0, Math.PI * 2);
      ctx.fill();

      // Hotel typography header
      ctx.fillStyle = '#fef08a';
      ctx.font = '700 12px "Playfair Display", serif';
      ctx.textAlign = 'center';
      ctx.fillText('THE GRAND HOTEL', x + w / 2, y + 74);
      ctx.font = '900 32px "Playfair Display", serif';
      ctx.fillText('№ 312', x + w / 2, y + 115);

      ctx.restore();
      return;
    }

    // 15. Artisan Coffee Cup Sleeve
    if (id === 'coffee-shop-cup') {
      ctx.save();
      ctx.fillStyle = '#d97706'; // kraft cardboard
      this.roundRect(ctx, x, y, w, h, 14, true, false);

      // Corrugated texture ribs
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      for (let ry = y + 16; ry < y + h - 16; ry += 12) {
        ctx.fillRect(x, ry, w, 4);
      }

      // Dark coffee stain ring
      ctx.strokeStyle = 'rgba(67, 20, 7, 0.35)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(x + w - 80, y + 80, 52, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
      return;
    }

    // 16. Elevated Studio Plaque
    if (id === 'floating-white-card') {
      ctx.save();
      ctx.fillStyle = isDark ? '#27272a' : '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 36;
      ctx.shadowOffsetY = 16;
      this.roundRect(ctx, x, y, w, h, 20, true, false);
      ctx.strokeStyle = isDark ? '#3f3f46' : '#e4e4e7';
      ctx.lineWidth = 1.5;
      this.roundRect(ctx, x, y, w, h, 20, false, true);
      ctx.restore();
      return;
    }

    // 17. Neat Inset Border
    if (id === 'framed-inset') {
      ctx.save();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      this.roundRect(ctx, x + 24, y + 24, w - 48, h - 48, 8, false, true);
      this.roundRect(ctx, x + 30, y + 30, w - 60, h - 60, 4, false, true);
      ctx.restore();
      return;
    }

    // 18. Architectural Brackets
    if (id === 'bracket-container') {
      ctx.save();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 4;
      const bLen = 45;
      ctx.beginPath();
      ctx.moveTo(x + bLen, y); ctx.lineTo(x, y); ctx.lineTo(x, y + h); ctx.lineTo(x + bLen, y + h);
      ctx.moveTo(x + w - bLen, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w - bLen, y + h);
      ctx.stroke();
      ctx.restore();
      return;
    }

    // 19. Cyberpunk HUD Reticles & Targeting Brackets
    if (id === 'cyberpunk-hud') {
      ctx.save();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2.5;
      const tLen = 32;
      ctx.beginPath();
      ctx.moveTo(x, y + tLen); ctx.lineTo(x, y); ctx.lineTo(x + tLen, y);
      ctx.moveTo(x + w - tLen, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + tLen);
      ctx.moveTo(x, y + h - tLen); ctx.lineTo(x, y + h); ctx.lineTo(x + tLen, y + h);
      ctx.moveTo(x + w - tLen, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - tLen);
      ctx.stroke();

      ctx.fillStyle = accent;
      ctx.font = '700 10px monospace';
      ctx.fillText('[TARGET.ACQ // 0x4FF8]', x + 16, y - 10);
      ctx.fillText('[SYS.STATUS: LOCKED]', x + w - 170, y - 10);
      ctx.fillText('REC • 60 FPS', x + 16, y + h + 18);
      ctx.restore();
      return;
    }

    // 20. Broadway Marquee Ticker with Illuminated Bulbs
    if (id === 'marquee-ticker') {
      ctx.save();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 4;
      this.roundRect(ctx, x, y, w, h, 14, false, true);
      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#eab308';
      ctx.shadowBlur = 12;
      for (let bx = x + 18; bx < x + w - 10; bx += 38) {
        ctx.beginPath(); ctx.arc(bx, y, 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(bx, y + h, 4, 0, Math.PI * 2); ctx.fill();
      }
      for (let by = y + 18; by < y + h - 10; by += 38) {
        ctx.beginPath(); ctx.arc(x, by, 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + w, by, 4, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
      return;
    }

    // 21. Neon Tube Signboard
    if (id === 'neon-signboard') {
      ctx.save();
      ctx.shadowColor = accent;
      ctx.shadowBlur = 24;
      ctx.strokeStyle = accent;
      ctx.lineWidth = 3.5;
      this.roundRect(ctx, x + 8, y + 8, w - 16, h - 16, 24, false, true);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      this.roundRect(ctx, x + 8, y + 8, w - 16, h - 16, 24, false, true);
      ctx.restore();
      return;
    }

    // 22. Status Pill Tag Header
    if (id === 'pill-tag-header') {
      ctx.save();
      ctx.fillStyle = isDark ? '#27272a' : '#f4f4f5';
      this.roundRect(ctx, x + 24, y + 20, 160, 32, 16, true, false);
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.5;
      this.roundRect(ctx, x + 24, y + 20, 160, 32, 16, false, true);

      // Glowing green dot
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(x + 40, y + 36, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = isDark ? '#ffffff' : '#18181b';
      ctx.font = '700 11px monospace';
      ctx.fillText('DAILY INSIGHT', x + 54, y + 40);
      ctx.restore();
      return;
    }

    // 23. Vertical Japanese Spine text rail
    if (id === 'vertical-spine-text') {
      ctx.save();
      const spineW = 64;
      ctx.fillStyle = `${accent}18`;
      ctx.fillRect(x, y, spineW, h);
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + spineW, y);
      ctx.lineTo(x + spineW, y + h);
      ctx.stroke();
      ctx.restore();
      return;
    }
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
      const mastheadY = cardY + 16;
      ctx.textAlign = 'center';
      ctx.fillStyle = isDark ? '#ffffff' : '#18181b';
      ctx.font = '900 42px "Playfair Display", serif';
      ctx.fillText('THE DAILY DISPATCH', width / 2, mastheadY + 40);

      // Date / Weather / Edition rule bar
      ctx.strokeStyle = isDark ? '#52525b' : '#27272a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cardX + 20, mastheadY + 52);
      ctx.lineTo(cardX + cardW - 20, mastheadY + 52);
      ctx.stroke();

      ctx.font = '700 11px monospace';
      ctx.fillStyle = isDark ? '#a1a1aa' : '#52525b';
      ctx.fillText(`VOL. CXLII • NO. 48 • ${category.toUpperCase()} • ${date || 'SPECIAL EDITION'} • PRICE $1.50`, width / 2, mastheadY + 68);

      ctx.beginPath();
      ctx.moveTo(cardX + 20, mastheadY + 78);
      ctx.lineTo(cardX + cardW - 20, mastheadY + 78);
      ctx.stroke();
    }

    // 2. Front-Page Lead Story
    if (id === 'front-page-lead') {
      ctx.fillStyle = '#000000';
      ctx.fillRect(cardX, cardY, cardW, 44);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 16px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('★ SPECIAL REPORT // EDITORIAL LEAD ★', width / 2, cardY + 28);
    }

    // 3. Inverted Masthead Banner
    if (id === 'broadsheet-banner') {
      ctx.fillStyle = accent;
      this.roundRect(ctx, cardX, cardY, cardW, 54, { tl: 14, tr: 14, bl: 0, br: 0 }, true, false);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 24px "Playfair Display", serif';
      ctx.textAlign = 'center';
      ctx.fillText('THE GLOBAL HERALD', width / 2, cardY + 36);
    }

    // 4. Open Book Spread Gutter Crease
    if (id === 'book-spread') {
      const cx = width / 2;
      const foldGrad = ctx.createLinearGradient(cx - 30, 0, cx + 30, 0);
      foldGrad.addColorStop(0, 'rgba(0,0,0,0)');
      foldGrad.addColorStop(0.5, 'rgba(0,0,0,0.25)');
      foldGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = foldGrad;
      ctx.fillRect(cx - 30, cardY, 60, cardH);

      ctx.font = 'italic 11px "Playfair Display", serif';
      ctx.fillStyle = isDark ? '#a1a1aa' : '#71717a';
      ctx.textAlign = 'left';
      ctx.fillText('CHAPTER IV • REFLECTIONS', cardX + 28, cardY + 34);
      ctx.textAlign = 'right';
      ctx.fillText(author || 'COLLECTED WORKS', cardX + cardW - 28, cardY + 34);
    }

    // 5. Numbered Manifesto Principle (Giant Roman Numeral watermark)
    if (id === 'manifesto-numbered') {
      ctx.save();
      ctx.font = '900 160px "Playfair Display", serif';
      ctx.fillStyle = `${accent}25`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('01.', width / 2, cardY + 28);
      ctx.restore();
    }

    // 6. Museum Plaque Label
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

    // 7. Monocle Global Brief Coordinates
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

    // 8. Podcast Audio Waveform Bars
    if (id === 'audio-wave') {
      const waveY = cardY + cardH - 100;
      const waveH = 40;
      const waveW = cardW - 60;
      ctx.fillStyle = accent;
      const numBars = 48;
      const barSpacing = waveW / numBars;
      for (let i = 0; i < numBars; i++) {
        const heightFactor = Math.sin(i * 0.35) * 0.5 + Math.cos(i * 0.8) * 0.4 + 0.5;
        const bHeight = Math.max(8, heightFactor * waveH);
        const bx = cardX + 30 + i * barSpacing;
        this.roundRect(ctx, bx, waveY + (waveH - bHeight) / 2, barSpacing * 0.6, bHeight, 2, true, false);
      }

      ctx.fillStyle = isDark ? '#a1a1aa' : '#71717a';
      ctx.font = '700 11px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('▶ 01:24 / 03:45', cardX + 30, waveY + waveH + 24);
      ctx.textAlign = 'right';
      ctx.fillText('EPISODE 42 • MASTER AUDIO', cardX + cardW - 30, waveY + waveH + 24);
    }

    // 9. Academic Thesis Footnote Citation
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

    // 10. Glossy Spread Kicker Header Bar
    if (id === 'glossy-spread') {
      ctx.fillStyle = accent;
      ctx.fillRect(cardX, cardY, cardW, 14);
      ctx.font = '800 11px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText(category ? category.toUpperCase() : 'FEATURE STORY', cardX + 16, cardY + 34);
    }

    // 11. Classical Manuscript Fleurons
    if (id === 'manuscript-parchment') {
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 2;
      this.roundRect(ctx, cardX + 14, cardY + 14, cardW - 28, cardH - 28, 8, false, true);
      this.roundRect(ctx, cardX + 22, cardY + 22, cardW - 44, cardH - 44, 4, false, true);

      ctx.fillStyle = '#d4af37';
      ctx.font = '22px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('❦', cardX + 34, cardY + 34);
      ctx.fillText('❦', cardX + cardW - 34, cardY + 34);
      ctx.fillText('❦', cardX + 34, cardY + cardH - 34);
      ctx.fillText('❦', cardX + cardW - 34, cardY + cardH - 34);
    }

    // 12. Poetry Anthology Floral Flourish
    if (id === 'poetry-anthology') {
      ctx.fillStyle = accent;
      ctx.font = '26px serif';
      ctx.textAlign = 'center';
      ctx.fillText('❦  ·  ✦  ·  ❦', width / 2, cardY + 36);
    }

    // 13. Daily Calendar Tear-Off Page
    if (id === 'calendar-tear-off') {
      ctx.fillStyle = '#dc2626';
      this.roundRect(ctx, cardX, cardY, cardW, 64, { tl: 14, tr: 14, bl: 0, br: 0 }, true, false);

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TODAY', width / 2, cardY + 40);

      ctx.fillStyle = '#dc2626';
      ctx.font = '900 84px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('23', width / 2, cardY + 160);
    }

    // 14. Typography Specimen Poster
    if (id === 'catalog-specimen') {
      ctx.fillStyle = isDark ? '#a1a1aa' : '#71717a';
      ctx.font = '700 10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('TYPE SPECIMEN // DISPLAY SERIF 72PT • LEADING 1.4', cardX + 24, cardY + 28);
      ctx.fillText('A B C D E F G H I J K L M N O P Q R S T U V W X Y Z', cardX + 24, cardY + 44);
      ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cardX + 24, cardY + 54);
      ctx.lineTo(cardX + cardW - 24, cardY + 54);
      ctx.stroke();
    }

    // 15. The Atlantic Op-Ed Essayist
    if (id === 'the-atlantic-op') {
      ctx.fillStyle = accent;
      ctx.font = '800 11px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('IDEAS & ESSAYS', cardX + 24, cardY + 28);
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cardX + 24, cardY + 36);
      ctx.lineTo(cardX + 90, cardY + 36);
      ctx.stroke();
    }

    // 16. Center Badge Minimal Monogram Seal
    if (id === 'center-badge-minimal') {
      const sealR = 24;
      const sealX = width / 2;
      const sealY = cardY + 38;

      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(sealX, sealY, sealR, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(sealX, sealY, sealR - 4, 0, Math.PI * 2); ctx.stroke();

      ctx.fillStyle = accent;
      ctx.font = '700 14px "Playfair Display", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((author || 'Q').charAt(0).toUpperCase(), sealX, sealY + 1);
    }

    // 17. Social Verified Tweet Card (Header & Actions Bar)
    if (id === 'tweet-card') {
      const tX = cardX + 28;
      const tY = cardY + 24;
      const avR = 24;

      // Author round avatar
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(tX + avR, tY + avR, avR, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((author || 'A').charAt(0).toUpperCase(), tX + avR, tY + avR + 1);

      // Name & verified badge
      ctx.textAlign = 'left';
      ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
      ctx.font = '700 19px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(author || 'Author', tX + avR * 2 + 14, tY + 18);
      const nameW = ctx.measureText(author || 'Author').width;

      // Blue verified check circle
      const checkX = tX + avR * 2 + 14 + nameW + 12;
      const checkY = tY + 14;
      ctx.fillStyle = '#1d9bf0';
      ctx.beginPath();
      ctx.arc(checkX, checkY, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✓', checkX, checkY + 0.5);

      // @handle
      ctx.textAlign = 'left';
      ctx.fillStyle = '#64748b';
      ctx.font = '500 15px "Plus Jakarta Sans", sans-serif';
      const handleText = `@${(author || 'author').toLowerCase().replace(/\s+/g, '')}`;
      ctx.fillText(handleText, tX + avR * 2 + 14, tY + 38);

      // X / Twitter bird logo top right
      ctx.fillStyle = isDark ? '#ffffff' : '#0f172a';
      ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('𝕏', cardX + cardW - 28, tY + 24);

      // Bottom tweet metrics bar
      const actY = cardY + cardH - 36;
      ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cardX + 28, actY - 14);
      ctx.lineTo(cardX + cardW - 28, actY - 14);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '500 13px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('💬 482     🔁 1.4K     ❤️ 12.8K     🔖 690     ↗️', cardX + 32, actY + 4);
    }

    // 18. Split Editorial Columns Divider Rule
    if (id === 'editorial-two-column') {
      const cx = width / 2;
      ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx, cardY + 40);
      ctx.lineTo(cx, cardY + cardH - 40);
      ctx.stroke();
    }

    // 19. Pinned Polaroid in Corner (Author Focus)
    if (id === 'author-polaroid-stack') {
      const polW = 140;
      const polH = 170;
      const polX = cardX + cardW - polW - 20;
      const polY = cardY + 20;

      ctx.save();
      ctx.translate(polX + polW / 2, polY + polH / 2);
      ctx.rotate(-0.08); // -4.5 deg tilt
      ctx.translate(-(polX + polW / 2), -(polY + polH / 2));

      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 10;
      ctx.fillStyle = '#ffffff';
      this.roundRect(ctx, polX, polY, polW, polH, 6, true, false);

      // Photo slot
      ctx.fillStyle = isDark ? '#1e293b' : '#f1f5f9';
      this.roundRect(ctx, polX + 10, polY + 10, polW - 20, polH - 45, 4, true, false);

      // Adhesive tape at top
      ctx.fillStyle = 'rgba(254, 240, 138, 0.7)'; // yellow masking tape
      ctx.fillRect(polX + 35, polY - 10, 70, 20);

      ctx.restore();
    }

    // 20. Industrial Hazard Strip Chrome
    if (id === 'cyber-warning-hazard') {
      ctx.save();
      const textColor = styles.textColor || '#ffd000';
      
      // Top Caution Banner inside card
      ctx.fillStyle = textColor;
      ctx.font = '900 13px "Space Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('⚠️ CAUTION // INDUSTRIAL HAZARD // DANGER ⚠️', width / 2, cardY + 24);

      // Warning Divider Line
      ctx.strokeStyle = textColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cardX + 24, cardY + 44);
      ctx.lineTo(cardX + cardW - 24, cardY + 44);
      ctx.stroke();

      // Bottom Industrial Placard Specs
      ctx.font = '700 11px "Space Mono", monospace';
      ctx.fillStyle = styles.metaColor || '#a1a1aa';
      ctx.fillText('REF: ISO-7010 // HAZARD CLASSIFICATION 4.2 // HEAVY MACHINERY', width / 2, cardY + cardH - 24);
      ctx.restore();
    }

    ctx.restore();
  }
}
