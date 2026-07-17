const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors({
  origin: ['http://localhost:4173', 'http://127.0.0.1:4173'],
}));
app.use(express.json());

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  })[character]);
}

function buildMockCanvasGame(prompt) {
  const safePrompt = escapeHtml(prompt.trim() || 'No prompt provided.');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      background: #111827;
      color: #f9fafb;
      font-family: Arial, sans-serif;
    }

    .game-wrap {
      width: min(720px, 92vw);
      text-align: center;
    }

    canvas {
      width: 100%;
      max-width: 640px;
      border: 3px solid #f87171;
      border-radius: 12px;
      background: #030712;
    }

    p {
      color: #d1d5db;
    }
  </style>
</head>
<body>
  <main class="game-wrap">
    <h1>Mock Generated Canvas Game</h1>
    <p><strong>Prompt:</strong> ${safePrompt}</p>
    <canvas id="gameCanvas" width="640" height="360"></canvas>
    <p>Use the arrow keys to move the red box.</p>
  </main>
  <script>
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const player = { x: 40, y: 40, size: 40, speed: 16 };
    const keys = new Set();

    window.addEventListener('keydown', (event) => keys.add(event.key));
    window.addEventListener('keyup', (event) => keys.delete(event.key));

    function update() {
      if (keys.has('ArrowLeft')) player.x -= player.speed;
      if (keys.has('ArrowRight')) player.x += player.speed;
      if (keys.has('ArrowUp')) player.y -= player.speed;
      if (keys.has('ArrowDown')) player.y += player.speed;

      player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
      player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(player.x, player.y, player.size, player.size);
      ctx.fillStyle = '#f9fafb';
      ctx.font = '20px Arial';
      ctx.fillText('Move me with arrow keys', 20, 330);
    }

    function loop() {
      update();
      draw();
      requestAnimationFrame(loop);
    }

    loop();
  <\/script>
</body>
</html>`;
}

app.post('/api/generate-game', (req, res) => {
  const { prompt } = req.body;

  if (typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Request body must include a prompt string.' });
  }

  /*
   * Placeholder Step A:
   * Call GPT-5.6 with the user's prompt to produce structured game architecture JSON.
   * Example future shape:
   * const architecture = await gpt56Client.responses.create({
   *   model: 'gpt-5.6',
   *   input: `Create structured game architecture JSON for: ${prompt}`,
   * });
   */

  /*
   * Placeholder Step B:
   * Pass the structured architecture JSON to the Codex agent so it can generate
   * the final raw, self-contained HTML/CSS/JS game string.
   * Example future shape:
   * const html = await codexAgent.generate({
   *   task: 'Build a single-file browser game from this architecture JSON.',
   *   input: architecture.output_json,
   * });
   */

  return res.json({ html: buildMockCanvasGame(prompt) });
});

app.listen(PORT, () => {
  console.log(`AI game generator backend listening on http://localhost:${PORT}`);
});
