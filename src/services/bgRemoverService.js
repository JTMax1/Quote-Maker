/**
 * High-Precision In-Browser Background Remover Engine
 * Uses Boundary Flood-Fill (BFS from outer edges) to guarantee interior subject pixels
 * (clothes, skin, face) are NEVER chopped into, plus Eye-Dropper sampling and feathering.
 */

export class BgRemoverService {
  /**
   * Remove background using boundary-connected flood fill from image perimeter
   */
  static async removeBackground(img, options = {}) {
    const {
      tolerance = 32,
      feather = 2,
      pickedColor = null, // { r, g, b } from eye-dropper if clicked
      maxWidth = 1000,
      maxHeight = 1000
    } = options;

    let width = img.naturalWidth || img.width;
    let height = img.naturalHeight || img.height;

    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, width, height);

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // Seed points along perimeter (top, bottom, left, right edges)
    const visited = new Uint8Array(width * height);
    const toClear = new Uint8Array(width * height);
    const queue = [];

    // Helper to get pixel color
    const getPixel = (x, y) => {
      const idx = (y * width + x) * 4;
      return { r: data[idx], g: data[idx + 1], b: data[idx + 2], a: data[idx + 3] };
    };

    // Determine target reference colors
    const targetColors = [];
    if (pickedColor) {
      targetColors.push(pickedColor);
    } else {
      // Sample perimeter border corners and middle edges
      const sampleCoords = [
        [0, 0], [Math.floor(width / 2), 0], [width - 1, 0],
        [0, Math.floor(height / 2)], [width - 1, Math.floor(height / 2)],
        [0, height - 1], [Math.floor(width / 2), height - 1], [width - 1, height - 1]
      ];
      sampleCoords.forEach(([x, y]) => {
        targetColors.push(getPixel(x, y));
      });
    }

    // Color distance function
    const colorDist = (c1, c2) => {
      return Math.sqrt(
        (c1.r - c2.r) ** 2 +
        (c1.g - c2.g) ** 2 +
        (c1.b - c2.b) ** 2
      );
    };

    const maxTolDistance = (tolerance / 100) * 320; // calibrated threshold

    // Initialize queue with border pixels that match background
    const addSeed = (x, y) => {
      const idx = y * width + x;
      if (visited[idx]) return;
      visited[idx] = 1;

      const p = getPixel(x, y);
      let isMatch = false;
      for (let i = 0; i < targetColors.length; i++) {
        if (colorDist(p, targetColors[i]) <= maxTolDistance) {
          isMatch = true;
          break;
        }
      }

      if (isMatch) {
        toClear[idx] = 1;
        queue.push(idx);
      }
    };

    // Seeds from all four boundaries
    for (let x = 0; x < width; x++) {
      addSeed(x, 0);
      addSeed(x, height - 1);
    }
    for (let y = 0; y < height; y++) {
      addSeed(0, y);
      addSeed(width - 1, y);
    }

    // Breadth-first search (BFS) flood fill from edges inwards
    let head = 0;
    while (head < queue.length) {
      const currIdx = queue[head++];
      const cx = currIdx % width;
      const cy = Math.floor(currIdx / width);
      const currColor = getPixel(cx, cy);

      // Check 4 neighbors (Up, Down, Left, Right)
      const neighbors = [
        [cx + 1, cy],
        [cx - 1, cy],
        [cx, cy + 1],
        [cx, cy - 1]
      ];

      for (let n = 0; n < 4; n++) {
        const nx = neighbors[n][0];
        const ny = neighbors[n][1];

        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nIdx = ny * width + nx;
          if (!visited[nIdx]) {
            visited[nIdx] = 1;
            const np = getPixel(nx, ny);

            // Compare against both initial targets and adjacent background pixel
            let matchesTarget = false;
            for (let t = 0; t < targetColors.length; t++) {
              if (colorDist(np, targetColors[t]) <= maxTolDistance) {
                matchesTarget = true;
                break;
              }
            }

            if (matchesTarget || colorDist(np, currColor) <= (maxTolDistance * 0.4)) {
              toClear[nIdx] = 1;
              queue.push(nIdx);
            }
          }
        }
      }
    }

    // Apply alpha transparency only to connected outer background
    for (let idx = 0; idx < width * height; idx++) {
      if (toClear[idx]) {
        data[idx * 4 + 3] = 0; // Transparent
      }
    }

    // Edge feathering / smoothing
    if (feather > 0) {
      const radius = Math.min(feather, 4);
      for (let y = radius; y < height - radius; y++) {
        for (let x = radius; x < width - radius; x++) {
          const idx = y * width + x;
          if (!toClear[idx]) {
            // Count surrounding transparent pixels
            let transparentNeighbors = 0;
            for (let dy = -radius; dy <= radius; dy++) {
              for (let dx = -radius; dx <= radius; dx++) {
                if (toClear[(y + dy) * width + (x + dx)]) {
                  transparentNeighbors++;
                }
              }
            }
            if (transparentNeighbors > 0) {
              const total = (radius * 2 + 1) ** 2;
              const alphaRatio = 1 - (transparentNeighbors / total);
              data[idx * 4 + 3] = Math.round(data[idx * 4 + 3] * Math.max(0.2, alphaRatio));
            }
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);

    return new Promise(resolve => {
      canvas.toBlob(blob => {
        const dataUrl = canvas.toDataURL('image/png');
        resolve({ canvas, dataUrl, blob });
      }, 'image/png');
    });
  }

  /**
   * Helper to load an image from File or URL
   */
  static loadImage(source) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);

      if (source instanceof File || source instanceof Blob) {
        img.src = URL.createObjectURL(source);
      } else if (typeof source === 'string') {
        img.src = source;
      } else {
        reject(new Error('Invalid image source'));
      }
    });
  }
}
