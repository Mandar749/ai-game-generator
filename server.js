const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
const PORT = 3000;
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'missing-openai-api-key',
});

app.use(cors({ origin: '*' }));
app.use(express.json());


app.post('/api/generate-game', async (req, res) => {
  const { prompt } = req.body;

  if (typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Request body must include a prompt string.' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: 'OpenAI API key is not configured.',
      details: 'Set OPENAI_API_KEY before calling /api/generate-game.',
    });
  }

  try {
    const architectureResponse = await openai.responses.create({
      model: 'gpt-5.6',
      input: [
        {
          role: 'system',
          content: [
            'You are the Game Architect for a high-speed 2D HTML5 Canvas game engine.',
            'Convert the user prompt into a concise, implementation-ready browser game blueprint.',
            'Prioritize fast interactive 2D canvas mechanics, immediate restart after game over, and reliable requestAnimationFrame gameplay.',
          ].join(' '),
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'game_architecture',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              title: { type: 'string' },
              genre: { type: 'string' },
              gameVariables: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    name: { type: 'string' },
                    type: { type: 'string' },
                    initialValue: { type: 'string' },
                    purpose: { type: 'string' },
                  },
                  required: ['name', 'type', 'initialValue', 'purpose'],
                },
              },
              characterNames: {
                type: 'array',
                items: { type: 'string' },
              },
              winConditions: {
                type: 'array',
                items: { type: 'string' },
              },
              lossConditions: {
                type: 'array',
                items: { type: 'string' },
              },
              emojiAssetMap: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    assetName: { type: 'string' },
                    emoji: { type: 'string' },
                    usage: { type: 'string' },
                  },
                  required: ['assetName', 'emoji', 'usage'],
                },
              },
            },
            required: [
              'title',
              'genre',
              'gameVariables',
              'characterNames',
              'winConditions',
              'lossConditions',
              'emojiAssetMap',
            ],
          },
        },
      },
    });

    const architectureBlueprint = JSON.parse(architectureResponse.output_text);

    const codexResponse = await openai.responses.create({
      model: 'codex-agent',
      input: [
        {
          role: 'system',
          content: [
            'You are an expert, high-speed 2D HTML5 Canvas Game Engine.',
            'Generate ONLY a complete, single-file runnable HTML document as a single raw string.',
            'Do not include markdown, explanations, conversational intro/outro text, or ```html formatting fences.',
            'Use no console logs, no decorative CSS, and no external libraries.',
            'Focus strictly on 2D HTML canvas graphics using standard requestAnimationFrame.',
            'Keep boilerplate minimal: reset margins, use a full-bleed canvas, and a dark background.',
            'Build fully interactive gameplay with immediate state resets, including restart on game over.',
            'The HTML must be self-contained and ready to run inside an iframe srcdoc.',
          ].join(' '),
        },
        {
          role: 'user',
          content: `Build the game from this architecture JSON blueprint:
${JSON.stringify(architectureBlueprint, null, 2)}`,
        },
      ],
    });

    const html = codexResponse.output_text.trim();

    return res.json({ html });
  } catch (error) {
    return res.status(502).json({
      error: 'Failed to generate game with OpenAI.',
      details: error instanceof Error ? error.message : 'Unknown OpenAI API error.',
    });
  }
});

app.listen(PORT);
