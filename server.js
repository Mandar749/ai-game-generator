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
          content: 'You are the Game Architect. Convert the user prompt into a concise, implementation-ready browser game blueprint.',
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
            'You are the Codex coding agent for a browser game generator.',
            'Output ONLY one raw, execution-ready HTML document as a single string.',
            'Do not include markdown, explanations, or ```html formatting fences.',
            'The HTML must be self-contained and include all CSS and JavaScript needed to run inside an iframe srcdoc.',
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

    return res.json({ html, architecture: architectureBlueprint });
  } catch (error) {
    console.error('OpenAI game generation failed:', error);

    return res.status(502).json({
      error: 'Failed to generate game with OpenAI.',
      details: error instanceof Error ? error.message : 'Unknown OpenAI API error.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`AI game generator backend listening on http://localhost:${PORT}`);
});
