import { MandalaPuzzle, DifficultyLevel } from '../types';

const COLORING_PROMPTS = [
  'Breathe into the details. Feel the calming rhythm of coloring.',
  'Let color fill the quiet spaces of your mind.',
  'Release perfectionism. Any shade you choose is complete and peaceful.',
  'Notice the slow, soothing stroke of your pencil across paper.',
  'Mindful coloring settles the nervous system and anchors you here.',
  'A sacred sanctuary of lines, waiting for your creative calm.',
];

export function generateMandala(
  puzzleNumber: number,
  themePrompts?: { title: string; prompt: string; motif: MandalaPuzzle['style'] }[],
  seed = 1000,
  totalCount = 25,
  customDifficulty?: DifficultyLevel
): MandalaPuzzle {
  const third = Math.ceil(totalCount / 3);
  const difficulty: DifficultyLevel =
    customDifficulty ||
    (puzzleNumber <= third ? 'Easy' : puzzleNumber <= third * 2 ? 'Medium' : 'Hard');

  const tier: 1 | 2 | 3 = difficulty === 'Easy' ? 1 : difficulty === 'Medium' ? 2 : 3;

  const styles: MandalaPuzzle['style'][] =
    difficulty === 'Easy'
      ? ['floral-rosette', 'botanical-leaf', 'zen-waves']
      : difficulty === 'Medium'
      ? ['botanical-leaf', 'zen-waves', 'star-burst']
      : ['sacred-geometry', 'kaleidoscope', 'star-burst'];

  const themeItem = themePrompts ? themePrompts[(puzzleNumber - 1) % themePrompts.length] : undefined;
  const style = themeItem?.motif || styles[(puzzleNumber - 1) % styles.length];
  const title = themeItem?.title || `Coloring Art #${puzzleNumber}`;
  const promptDescription = themeItem?.prompt || `Serene ${style.replace('-', ' ')} meditative coloring artwork`;
  const mindfulPrompt = COLORING_PROMPTS[(puzzleNumber - 1) % COLORING_PROMPTS.length];

  return {
    id: `coloring-${puzzleNumber}`,
    puzzleNumber,
    title,
    mindfulPrompt,
    difficulty,
    difficultyTier: tier,
    style,
    seed: seed + puzzleNumber * 293,
    promptDescription,
  };
}

export function generateMandalaSection(
  count = 25,
  themePrompts?: { title: string; prompt: string; motif: MandalaPuzzle['style'] }[],
  baseSeed = 1000
): MandalaPuzzle[] {
  const list: MandalaPuzzle[] = [];
  for (let i = 1; i <= count; i++) {
    list.push(generateMandala(i, themePrompts, baseSeed, count));
  }
  return list;
}

// Draw vector mandala / theme coloring art onto an HTML5 Canvas context
export function drawMandalaToCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  mandala: MandalaPuzzle
) {
  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = Math.min(width, height) * 0.43;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = '#111111';
  ctx.lineWidth = mandala.difficulty === 'Easy' ? 2.8 : mandala.difficulty === 'Medium' ? 2.2 : 1.7;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const seed = mandala.seed;
  const symmetry =
    mandala.difficulty === 'Easy'
      ? 8
      : mandala.difficulty === 'Medium'
      ? 12
      : 16;

  const rings = mandala.difficulty === 'Easy' ? 4 : mandala.difficulty === 'Medium' ? 5 : 7;

  // Outer framing ring
  ctx.beginPath();
  ctx.arc(cx, cy, maxRadius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, maxRadius - 10, 0, Math.PI * 2);
  ctx.stroke();

  const beadCount = symmetry * 3;
  for (let i = 0; i < beadCount; i++) {
    const angle = (i * 2 * Math.PI) / beadCount;
    const bx = cx + (maxRadius - 5) * Math.cos(angle);
    const by = cy + (maxRadius - 5) * Math.sin(angle);
    ctx.beginPath();
    ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
    ctx.stroke();
  }

  for (let r = 1; r <= rings; r++) {
    const currentRadius = (maxRadius * r) / rings;
    const prevRadius = (maxRadius * (r - 1)) / rings;

    ctx.save();
    ctx.translate(cx, cy);

    for (let p = 0; p < symmetry; p++) {
      ctx.rotate((2 * Math.PI) / symmetry);

      if (mandala.style === 'botanical-leaf') {
        const midR = (prevRadius + currentRadius) / 2;
        ctx.beginPath();
        ctx.moveTo(0, prevRadius);
        ctx.quadraticCurveTo(currentRadius * 0.35, midR, 0, currentRadius);
        ctx.quadraticCurveTo(-currentRadius * 0.35, midR, 0, prevRadius);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, prevRadius + 4);
        ctx.lineTo(0, currentRadius - 6);
        ctx.stroke();
      } else if (mandala.style === 'zen-waves') {
        const arcR = (currentRadius - prevRadius) * 0.55;
        ctx.beginPath();
        ctx.arc(0, prevRadius + arcR, arcR, 0, Math.PI);
        ctx.stroke();
      } else if (mandala.style === 'sacred-geometry') {
        ctx.beginPath();
        ctx.arc(0, currentRadius * 0.6, currentRadius * 0.38, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-currentRadius * 0.22, prevRadius);
        ctx.lineTo(0, currentRadius);
        ctx.lineTo(currentRadius * 0.22, prevRadius);
        ctx.stroke();
      } else if (mandala.style === 'star-burst') {
        const midR = (prevRadius + currentRadius) / 2;
        ctx.beginPath();
        ctx.moveTo(0, currentRadius);
        ctx.lineTo(currentRadius * 0.2, midR);
        ctx.lineTo(0, prevRadius);
        ctx.lineTo(-currentRadius * 0.2, midR);
        ctx.closePath();
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(0, prevRadius);
        ctx.quadraticCurveTo(
          currentRadius * 0.42,
          (prevRadius + currentRadius) / 2,
          0,
          currentRadius
        );
        ctx.quadraticCurveTo(
          -currentRadius * 0.42,
          (prevRadius + currentRadius) / 2,
          0,
          prevRadius
        );
        ctx.stroke();
      }
    }

    ctx.restore();

    ctx.beginPath();
    ctx.arc(cx, cy, currentRadius, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.arc(cx, cy, maxRadius * 0.12, 0, Math.PI * 2);
  ctx.stroke();
}
