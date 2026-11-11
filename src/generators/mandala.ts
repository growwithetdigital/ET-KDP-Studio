import { MandalaPuzzle } from '../types';

export function generate25Mandalas(coloringPrompts: string[] = []): MandalaPuzzle[] {
  const styles: MandalaPuzzle['style'][] = [
    'sacred-geometry',
    'floral-rosette',
    'kaleidoscope',
    'star-burst',
    'celtic-knot',
  ];

  const mandalas: MandalaPuzzle[] = [];
  for (let i = 1; i <= 25; i++) {
    const style = styles[(i - 1) % styles.length];
    const defaultTitle = `Zen Mandala #${i} (${style.replace('-', ' ')})`;
    const prompt = coloringPrompts[(i - 1) % coloringPrompts.length] || `Relaxing themed coloring art page #${i}`;

    mandalas.push({
      id: `mandala-${i}`,
      puzzleNumber: i,
      title: defaultTitle,
      style,
      seed: 1000 + i * 293,
      promptDescription: prompt,
    });
  }
  return mandalas;
}

// Draw algorithmic mandala onto an HTML5 Canvas context
export function drawMandalaToCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  mandala: MandalaPuzzle
) {
  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = Math.min(width, height) * 0.44;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const seed = mandala.seed;
  const numPetals = 8 + ((seed % 5) * 2); // 8, 10, 12, 14, 16-fold symmetry
  const rings = 4 + (seed % 4); // 4 to 7 concentric layers

  // Outer decorative border
  ctx.beginPath();
  ctx.arc(cx, cy, maxRadius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, maxRadius - 10, 0, Math.PI * 2);
  ctx.stroke();

  // Draw small circular beads around outer ring
  const beadCount = numPetals * 3;
  for (let i = 0; i < beadCount; i++) {
    const angle = (i * 2 * Math.PI) / beadCount;
    const bx = cx + (maxRadius - 5) * Math.cos(angle);
    const by = cy + (maxRadius - 5) * Math.sin(angle);
    ctx.beginPath();
    ctx.arc(bx, by, 3, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Draw concentric mandala layers according to style
  for (let r = 1; r <= rings; r++) {
    const currentRadius = (maxRadius * r) / rings;
    const prevRadius = (maxRadius * (r - 1)) / rings;

    ctx.save();
    ctx.translate(cx, cy);

    for (let p = 0; p < numPetals; p++) {
      const angle = (p * 2 * Math.PI) / numPetals;
      ctx.rotate((2 * Math.PI) / numPetals);

      if (mandala.style === 'floral-rosette') {
        // Curved petal curves
        ctx.beginPath();
        ctx.moveTo(0, prevRadius);
        ctx.quadraticCurveTo(
          currentRadius * 0.45,
          (prevRadius + currentRadius) / 2,
          0,
          currentRadius
        );
        ctx.quadraticCurveTo(
          -currentRadius * 0.45,
          (prevRadius + currentRadius) / 2,
          0,
          prevRadius
        );
        ctx.stroke();

        // Inner petal vein
        ctx.beginPath();
        ctx.moveTo(0, prevRadius + 5);
        ctx.lineTo(0, currentRadius - 8);
        ctx.stroke();
      } else if (mandala.style === 'sacred-geometry') {
        // Intersecting circles & diamond arches
        ctx.beginPath();
        ctx.arc(0, currentRadius * 0.6, currentRadius * 0.4, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-currentRadius * 0.25, prevRadius);
        ctx.lineTo(0, currentRadius);
        ctx.lineTo(currentRadius * 0.25, prevRadius);
        ctx.stroke();
      } else if (mandala.style === 'star-burst') {
        // Sharp star facets and rays
        const midR = (prevRadius + currentRadius) / 2;
        ctx.beginPath();
        ctx.moveTo(0, currentRadius);
        ctx.lineTo(currentRadius * 0.22, midR);
        ctx.lineTo(0, prevRadius);
        ctx.lineTo(-currentRadius * 0.22, midR);
        ctx.closePath();
        ctx.stroke();

        // Radiating sun ray
        ctx.beginPath();
        ctx.moveTo(0, midR);
        ctx.lineTo(0, currentRadius - 4);
        ctx.stroke();
      } else if (mandala.style === 'kaleidoscope') {
        // Scalloped teardrops and hearts
        ctx.beginPath();
        ctx.arc(0, (prevRadius + currentRadius) / 2, (currentRadius - prevRadius) * 0.45, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, prevRadius);
        ctx.lineTo(currentRadius * 0.35, currentRadius);
        ctx.lineTo(-currentRadius * 0.35, currentRadius);
        ctx.closePath();
        ctx.stroke();
      } else {
        // Celtic / woven ribbons
        ctx.beginPath();
        ctx.arc(currentRadius * 0.3, prevRadius * 0.5, currentRadius * 0.35, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(-currentRadius * 0.3, prevRadius * 0.5, currentRadius * 0.35, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.restore();

    // Concentric boundary circle
    ctx.beginPath();
    ctx.arc(cx, cy, currentRadius, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Central flower medallion
  ctx.beginPath();
  ctx.arc(cx, cy, maxRadius * 0.12, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, maxRadius * 0.05, 0, Math.PI * 2);
  ctx.stroke();

  // Subtle interior corner flourish frames
  const cornerDist = maxRadius * 1.18;
  const corners = [
    [cx - cornerDist * 0.7, cy - cornerDist * 0.7],
    [cx + cornerDist * 0.7, cy - cornerDist * 0.7],
    [cx - cornerDist * 0.7, cy + cornerDist * 0.7],
    [cx + cornerDist * 0.7, cy + cornerDist * 0.7],
  ];

  for (const [cornX, cornY] of corners) {
    ctx.beginPath();
    ctx.arc(cornX, cornY, 16, 0, Math.PI * 2);
    ctx.stroke();
  }
}
