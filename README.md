# ai-game-generator

A lightweight split-screen AI game generator sandbox with a single-file frontend and an Express mock backend.

## Install dependencies

```bash
npm install
```

If you are starting from an empty Node project, install the backend dependencies directly:

```bash
npm install express cors openai
```

## Run the backend server

```bash
OPENAI_API_KEY=your_api_key_here npm start
```

Set `OPENAI_API_KEY` before starting the server. The Express server listens on `http://localhost:3000` and exposes `POST /api/generate-game`.

## Run the frontend

Open `index.html` in a browser, or serve the repository with any static file server, for example:

```bash
python3 -m http.server 4173
```

Then visit `http://localhost:4173/index.html`.
