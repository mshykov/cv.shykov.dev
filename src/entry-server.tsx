// Build-time prerender entry. NOT shipped to the browser and never imported by
// main.tsx — `scripts/prerender.mjs` compiles this on its own and throws the
// bundle away.
//
// Why this exists: the app used to ship `<div id="root"></div>` and nothing
// else. Google renders JavaScript eventually, but the AI crawlers (GPTBot,
// ClaudeBot, PerplexityBot, CCBot) do not run JS at all — they read the HTML
// they are served. They were seeing an empty page.
//
// Deliberately imports App and nothing else: `main.tsx` pulls in `index.css`
// and the pdf.js polyfills, which touch browser globals that do not exist here.
import { renderToString } from 'react-dom/server'
import App from './App.tsx'

export function render(): string {
  return renderToString(<App />)
}
