import {
  FrontPageData,
  TocData,
  ForewordData,
  SectionDividerData,
  BookTheme,
  BookSectionConfig,
  TocEntry,
  PuzzleType,
} from '../types';

export function createFrontPageData(
  theme: BookTheme,
  totalPuzzles: number
): FrontPageData {
  return {
    title: theme.kdpTitle || `The ${theme.name} Activity Book`,
    subtitle:
      theme.kdpSubtitle ||
      'A Calming Collection of Sudoku, Word Searches, Mazes & Meditative Coloring Pages',
    themeName: theme.name,
    authorNote: 'An Intentional Mindful Activity Companion for Focus, Calm & Stress Relief',
    audienceLabel: theme.targetAgeLabel || 'All Ages & Busy Minds',
    totalPuzzles,
  };
}

export function createSectionDividerData(
  sectionType: PuzzleType,
  theme: BookTheme,
  partNumber: string,
  totalSectionPages: number
): SectionDividerData {
  switch (sectionType) {
    case 'sudoku':
      return {
        partNumber,
        sectionType: 'sudoku',
        title: 'Sudoku Logic Grids',
        subtitle: 'The Meditative Rhythm of Order and Deduction',
        curatedDescription: `Step into pure, uncluttered contemplation. Sudoku requires zero guesswork—only patient observation, pattern recognition, and the steady uncovering of order. Calibrated across Easy (1/3), Medium (2/3), and Hard (3/3) tiers, each grid offers a sanctuary of single-pointed focus for the ${theme.name} collection.`,
        quote: {
          text: 'Pure mathematics is, in its way, the poetry of logical ideas.',
          author: 'Albert Einstein',
          sourceOrRole: 'Theoretical Physicist & Nobel Laureate',
        },
        totalSectionPages,
        difficultySummary: '1/3 Easy • 1/3 Medium • 1/3 Hard',
      };
    case 'wordsearch':
      return {
        partNumber,
        sectionType: 'wordsearch',
        title: 'Themed Word Searches',
        subtitle: 'A Tapestry of Language, Discovery, and Focus',
        curatedDescription: `Engage your subconscious pattern-seeking mind. Exploring horizontal, vertical, and diagonal word tracks activates peripheral awareness and cognitive agility. Each word list in this section is hand-curated to evoke the rich spirit of ${theme.name}.`,
        quote: {
          text: 'Words mean more than what is set down on paper. It takes the human heart to infuse them with deeper shades of meaning.',
          author: 'Maya Angelou',
          sourceOrRole: 'Poet, Memoirist & Civil Rights Champion',
        },
        totalSectionPages,
        difficultySummary: 'Curated Themed Vocabularies • 8 Directions',
      };
    case 'maze':
      return {
        partNumber,
        sectionType: 'maze',
        title: 'Labyrinth Pathfinding',
        subtitle: 'Navigating Twists, Branching Paths, and Inner Poise',
        curatedDescription: `A maze is not a trap; it is a moving meditation. Tracing your way through intricate corridors trains resilience, spatial foresight, and calm determination. Whenever a dead end appears, pause, breathe, and find the alternative path waiting to be discovered.`,
        quote: {
          text: 'The impediment to action advances action. What stands in the way becomes the way.',
          author: 'Marcus Aurelius',
          sourceOrRole: 'Roman Emperor & Stoic Philosopher',
        },
        totalSectionPages,
        difficultySummary: 'Gentle Openings to Intricate Sacred Mazes',
      };
    case 'coloring':
      return {
        partNumber,
        sectionType: 'coloring',
        title: 'Mindful Coloring Art',
        subtitle: 'Sacred Symmetry, Expressive Color, and Quiet Release',
        curatedDescription: `Immerse yourself in harmonic vector mandalas and themed motifs. Coloring engages bilateral brain hemispheres—blending geometric structure with creative freedom. Allow your hand to choose tones instinctively and watch anxiety dissolve into vibrant stillness.`,
        quote: {
          text: 'I found I could say things with color and shapes that I couldn’t say any other way—things I had no words for.',
          author: 'Georgia O’Keeffe',
          sourceOrRole: 'Pioneering Modernist Artist',
        },
        totalSectionPages,
        difficultySummary: 'Clean Crisp Vector Line Art • Ready to Fill',
      };
  }
}

export function createTocData(
  theme: BookTheme,
  sections: BookSectionConfig[],
  forewordPage = 3
): TocData {
  const entries: TocEntry[] = [
    {
      title: 'Foreword: The Architecture of Calm',
      startPage: forewordPage,
      pageCount: 1,
      subtitle: 'The restorative science of tactile puzzles for busy minds',
      type: 'foreword',
    },
  ];

  let currentStart = forewordPage + 1;

  sections.forEach((sec, idx) => {
    const roman = ['I', 'II', 'III', 'IV', 'V', 'VI'][idx] || `${idx + 1}`;
    let formatTitle = '';
    let author = '';

    switch (sec.type) {
      case 'sudoku':
        formatTitle = `Part ${roman}: Sudoku Logic Grids`;
        author = 'Albert Einstein';
        break;
      case 'wordsearch':
        formatTitle = `Part ${roman}: Themed Word Searches`;
        author = 'Maya Angelou';
        break;
      case 'maze':
        formatTitle = `Part ${roman}: Labyrinth Pathfinding`;
        author = 'Marcus Aurelius';
        break;
      case 'coloring':
        formatTitle = `Part ${roman}: Mindful Coloring Art`;
        author = 'Georgia O’Keeffe';
        break;
    }

    // 1 divider page + sec.pageCount puzzle pages
    const sectionTotalPages = 1 + sec.pageCount;
    const endPage = currentStart + sectionTotalPages - 1;

    entries.push({
      title: formatTitle,
      startPage: currentStart,
      endPage,
      pageCount: sectionTotalPages,
      subtitle: `Intro & Quote by ${author} • ${sec.pageCount} Puzzles`,
      type: sec.type,
    });

    currentStart += sectionTotalPages;
  });

  entries.push({
    title: 'Complete Solutions Appendix',
    startPage: currentStart,
    pageCount: Math.ceil(
      sections.reduce((acc, s) => (s.type !== 'coloring' ? acc + s.pageCount : acc), 0) / 4
    ),
    subtitle: '100% Verified 4-Up Grid Answer Keys with Path Tracing',
    type: 'sudoku',
  });

  return {
    title: 'TABLE OF CONTENTS',
    subtitle: 'Your structured journey through quiet focus, flow, and anxiety relief',
    entries,
  };
}

export function createForewordData(themeName: string): ForewordData {
  return {
    title: 'The Architecture of Calm',
    subtitle: 'Why Tactile Puzzles Soothe the Overstimulated Mind',
    paragraphs: [
      'In our hyper-connected world, modern life places an unprecedented demand on human attention. We transition from screens to meetings, notifications to deadlines, trapped in a state of continuous partial attention. For busy professionals, caregivers, and restless minds, this constant digital stimulation often creates a paradoxical exhaustion: we feel simultaneously drained and anxiously bored.',
      `This ${themeName} activity guide was crafted as an intentional antidote. Unlike passive entertainment or endless phone scrolling, tactile pen-and-paper puzzles invite your mind into an active, serene flow state. When your fingers hold a pencil to trace a labyrinth, deduct a Sudoku number, or search for hidden words, your nervous system gently down-regulates from high-alert stress into restorative equilibrium.`,
      'Psychologists and cognitive scientists have long celebrated the restorative benefits of structured, low-stakes analog challenges:',
      'Whether you have five stolen minutes between obligations or an hour of evening quiet, treat these pages as your personal sanctuary. There are no notifications here, no algorithms competing for your gaze, and no judgment. Take a quiet breath, pick up your pencil, and enjoy the simple pleasure of being present.',
    ],
    keyBenefits: [
      {
        title: 'Cognitive Reset & Flow State',
        desc: 'Replaces fractured multitasking with rhythmic single-task immersion, quieting the brain\'s internal worry loop (the Default Mode Network).',
      },
      {
        title: 'Healthy Mindful Dopamine',
        desc: 'Delivers genuine micro-victories and closure without the hollow dopamine crashes triggered by infinite social feeds.',
      },
      {
        title: 'Tactile Grounding & Screen Detox',
        desc: 'Physical paper engagement relaxes ocular strain, reduces blue-light fatigue, and anchors your sensory awareness in the physical present.',
      },
      {
        title: 'Calibrated Stress Reduction',
        desc: 'Our progressive 1/3 difficulty structure (Easy, Medium, Hard) builds confidence gradually, replacing boredom and anxiety with calm capability.',
      },
    ],
  };
}
