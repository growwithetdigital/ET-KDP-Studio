import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.json({ limit: '15mb' }));

// Initialize GoogleGenAI client on server
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API: Generate Themed Word Search Vocabularies & Book Metadata
app.post('/api/ai/theme-enrichment', async (req, res) => {
  try {
    const { theme = 'Dog Lovers', audience = 'adults' } = req.body;
    const ai = getAiClient();

    if (!ai) {
      return res.status(200).json({
        fallback: true,
        message: 'No GEMINI_API_KEY detected. Using high-grade algorithmic generators.',
      });
    }

    const audienceGuidelines =
      audience === 'kids'
        ? 'Target Audience: Kids Ages 4–8. Words should be accessible, length 3 to 7 letters, positive, fun. Coloring prompts must feature big bold vehicles/animals with thick lines. Title should highlight "Kids Ages 4-8" and "Fun Activities".'
        : audience === 'seniors'
        ? 'Target Audience: Seniors & Older Adults (Large Print). Words should evoke warmth, nostalgia, relaxation, and cognitive sharpness. Highlight "Large Print" and "Memory Brain Games" in Title.'
        : 'Target Audience: Adults & Teens. Hyper-specific niche focus (e.g. Dog Lovers, Botanical Calm, etc.) avoiding generic titles. Focus on stress relief and engaging puzzles.';

    const prompt = `You are a professional Amazon KDP Puzzle and Activity Book publishing expert specializing in bestseller sub-niches.
The user wants to publish an Activity Book on Amazon KDP targeting the niche: "${theme}".
${audienceGuidelines}

Generate the following in JSON format:
1. "title": Catchy, hyper-specific Amazon bestseller title avoiding generic names (e.g. "The Dog Lovers Word Search & Puzzle Book" or "Construction Vehicle Activity Book for Kids Ages 4–8" or "Large Print Brain Games for Seniors")
2. "subtitle": High-converting KDP subtitle packed with customer search terms
3. "kdpKeywords": Array of 7 Amazon KDP backend search keywords (each under 50 characters, high search volume, no punctuation)
4. "kdpCategories": Array of 2 optimal Amazon book categories
5. "kdpDescription": Compelling KDP book description formatted with clean HTML tags (<b>, <h3>, <ul>, <li>). Emphasize that all puzzles have guaranteed matching solution keys included at the back, 8.5x11 format.
6. "wordSearchSets": An array of 25 themed word search puzzle lists. Each item must have:
   - "title": Sub-theme title
   - "words": Array of 8 to 12 uppercase single-word keywords (no spaces or hyphens)
7. "coloringPrompts": An array of 25 distinct descriptive prompts for coloring book pages matching the "${theme}" niche.

Respond strictly with valid JSON conforming to this structure without markdown code blocks.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      // Clean up markdown block if present
      const cleaned = text.replace(/```json\n?|```/g, '').trim();
      data = JSON.parse(cleaned);
    }

    return res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error generating theme enrichment:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate theme enrichment',
    });
  }
});

// API: Generate Coloring Book Line Art Image
app.post('/api/ai/coloring-page', async (req, res) => {
  try {
    const { prompt = 'A superhero in action', theme = 'Superhero' } = req.body;
    const ai = getAiClient();

    if (!ai) {
      return res.status(400).json({
        error: 'GEMINI_API_KEY is not configured in environment secrets.',
      });
    }

    const enhancedPrompt = `Clean black and white coloring book page line art, adult and kids coloring book style, theme: ${theme}. Subject: ${prompt}. Pure white background, high contrast, clean vector style bold outlines, no grayscale shading, no colored pixels, no dithering, printable 300 DPI coloring page interior for Amazon KDP book.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [{ text: enhancedPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: '3:4',
        },
      },
    });

    let imageUrl = '';
    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData?.data) {
        const mime = part.inlineData.mimeType ?? 'image/png';
        imageUrl = `data:${mime};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUrl) {
      return res.status(500).json({ error: 'No image was generated by model' });
    }

    return res.json({ success: true, imageUrl });
  } catch (error: any) {
    console.error('Error generating coloring art:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate coloring art image',
    });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Setup Vite or Static File Serving
async function startServer() {
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VibeBook Forge Studio server running on port ${PORT} (prod=${isProd})`);
  });
}

startServer();
