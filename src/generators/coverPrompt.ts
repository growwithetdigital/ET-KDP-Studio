import { BookTheme, CoverPromptData, TargetAudience } from '../types';

export function generate4kCoverPrompt(
  theme: BookTheme,
  audience: TargetAudience,
  totalPageCount = 108
): CoverPromptData {
  const cleanTheme = theme.name.trim();
  const title = theme.kdpTitle || `The ${cleanTheme} Activity Book`;
  const subtitle =
    theme.kdpSubtitle ||
    '100 Calibrated Logic Puzzles, Word Searches, Labyrinths & Mindful Coloring Art';

  // Aesthetic styling based on theme keywords
  let visualStyle = 'Luxurious editorial matte cover with embossed gold-foil filigree';
  let lighting = 'Warm volumetric ambient lighting, soft cinematic rim highlights';
  let primaryElements = `A captivating central centerpiece celebrating ${cleanTheme}`;
  let palette = ['#1E1B4B', '#4F46E5', '#F59E0B', '#10B981', '#FAF5FF'];

  if (cleanTheme.toLowerCase().includes('marvel') || cleanTheme.toLowerCase().includes('hero')) {
    visualStyle = 'Bold graphic novel comic aesthetic with dynamic metallic accents and celestial energy';
    lighting = 'High-contrast dramatic rim lighting, vibrant cosmic glows, neon energy embers';
    primaryElements = 'Stylized heroic emblems, dynamic cosmic energy lines, bold geometric typography';
    palette = ['#0F172A', '#DC2626', '#EAB308', '#2563EB', '#F8FAFC'];
  } else if (cleanTheme.toLowerCase().includes('disney') || cleanTheme.toLowerCase().includes('fairy')) {
    visualStyle = 'Whimsical storybook watercolor and gilded gold vintage illumination';
    lighting = 'Ethereal fairy dust glow, soft pastel sunset illumination, enchanted starlight';
    primaryElements = 'Intricate fairytale castle spires, enchanted glowing flora, delicate filigree scrollwork';
    palette = ['#4C1D95', '#EC4899', '#FDE047', '#38BDF8', '#FFFBEB'];
  } else if (cleanTheme.toLowerCase().includes('coffee') || cleanTheme.toLowerCase().includes('cozy')) {
    visualStyle = 'Cozy rustic Scandinavian hygge with warm linen textures and artisan line art';
    lighting = 'Warm golden amber candlelight, soft rainy-window diffused morning light';
    primaryElements = 'Steaming ceramic mug, stack of vintage leather books, botanical eucalyptus leaves';
    palette = ['#292524', '#78350F', '#D97706', '#E2E8F0', '#FEF3C7'];
  } else if (cleanTheme.toLowerCase().includes('space') || cleanTheme.toLowerCase().includes('galaxy')) {
    visualStyle = 'Spectacular astrophotography fantasy with deep nebulas and laser-etched constellation lines';
    lighting = 'Deep space bioluminescence, vibrant pulsar lens flares, ultraviolet and cyan nebula haze';
    primaryElements = 'Swirling celestial galaxy, orbital rings, sacred astronomical charts and constellations';
    palette = ['#030712', '#4338CA', '#06B6D4', '#E11D48', '#F1F5F9'];
  }

  const spineWidthEstimate = (totalPageCount * 0.002252).toFixed(3);

  const fullMidjourneyPrompt = [
    `Professional full wrap book cover for "${title}", subtitle "${subtitle}".`,
    `Front cover featuring ${primaryElements}, masterfully integrated with elegant serif typography.`,
    `Aesthetic: ${visualStyle}. Lighting: ${lighting}.`,
    `Clean, premium commercial book layout, centered title text with immaculate kerning.`,
    `Includes dedicated spine (${spineWidthEstimate}" thickness) and back cover with elegant blurb container.`,
    `Hyper-detailed 4K render, 300 DPI, award-winning graphic design, octane render, trending on ArtStation, no messy artifacts, ultra-sharp vector details --ar 16:9 --v 6.1 --style raw --q 2`,
  ].join(' ');

  const dalleGeminiPrompt = [
    `Create a stunning, 4K quality professional commercial book cover for an activity book titled "${title}".`,
    `Subtitle: "${subtitle}".`,
    `Theme: ${cleanTheme}. Target Audience: ${audience}.`,
    `Visual Style: ${visualStyle}.`,
    `Key Visual Elements: ${primaryElements}.`,
    `Lighting and Mood: ${lighting}.`,
    `The typography should be majestic, perfectly centered, and easy to read.`,
    `High-end editorial composition with clean border ornamentation, suitable for Amazon Kindle Direct Publishing and luxury physical print. 300 DPI print quality, masterpiece detail.`,
  ].join(' ');

  return {
    bookTitle: title,
    bookSubtitle: subtitle,
    themePrompt: cleanTheme,
    artisticStyle: visualStyle,
    fullMidjourneyPrompt,
    dalleGeminiPrompt,
    recommendedPalette: palette,
    dimensionsRecommendation: `8.5" x 11" Trim Size (Full Wrap Spread with Bleed: 17.5" x 11.25", Spine approx ${spineWidthEstimate}")`,
  };
}
