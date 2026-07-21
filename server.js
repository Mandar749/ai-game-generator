const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = 3000;

app.use(cors({
  origin: '*',
}));
app.use(express.json());

app.post('/api/generate-game', async (req, res) => {
  const { prompt } = req.body;

  if (typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Request body must include a prompt string.' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ 
      error: 'GEMINI_API_KEY environment variable is missing on the server.' 
    });
  }

  try {
    // Pass the API key explicitly to the constructor to initialize all internal namespaces correctly
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // FIX: Using the active 2026 generation track model string
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash', 
      contents: `You are an expert AI Game Developer. Your objective is to build a 100% functional, highly interactive, complete 2D browser game inside an HTML5 canvas based on the user's prompt.
      
      User Game Concept: "${prompt}"
      
      CRITICAL GENERATION CONSTRAINTS:
      1. OUTPUT THE RAW CODE ONLY. Do not wrap code blocks in markdown code fences (no \`\`\`html tags). Start directly with <!DOCTYPE html> and end with </html>.
      2. SELF-CONTAINED: Embed all CSS custom styles in a <style> tag and all interactive mechanics/game loops in a <script> tag.
      3. VISUALS & CONTROLS: Draw assets, players, obstacles, and items nicely on the canvas (using smooth retro colors or clear emoji characters). Use proper keyboard or mouse listener event tracking.
      4. CORE MECHANICS: Ensure there is a running score/UI text layer displayed on screen, logical win/loss loops, and a restart mechanism if the game ends.`,
    });

    const rawGameHtml = response.text.trim();

    return res.json({ html: rawGameHtml });

  } catch (apiError) {
    console.error('Gemini Pipeline Exception:', apiError);
    return res.status(502).json({ 
      error: 'Failed to process free Gemini generation loop.',
      details: apiError.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Free AI game generator backend listening on http://localhost:${PORT}`);
});
