# Noesis

Noesis is a real-time audio-reactive visualizer built with [Three.js](https://threejs.org/) and GLSL shaders. It uses your microphone input to generate dynamic visual effects, blending trails and particles based on live audio frequency analysis.

## Features

- **Audio Analysis:** Uses your microphone to analyze bass, mid, and treble frequencies.
- **Shader Visuals:** Custom GLSL shaders for trails and particles.
- **Mode Switching:** Automatically cycles between trail, particle, and hybrid visual modes.
- **Responsive:** Adapts to your browser window size.

## Project Structure

- main.js: Main application logic and rendering loop.
- audio.js: Microphone audio analyzer.
- getFrequencyBands.js: Utility for splitting frequency data.
- shaders: GLSL shader files for visual effects.
- index.html: Entry HTML file.
- style.css: Global styles.
- vite.config.js: Vite configuration for GLSL imports.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- Microphone access enabled in your browser

### Installation

```sh
npm install
```

### Development

Start the development server:

```sh
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage

- Allow microphone access when prompted.
- Visual modes switch automatically every 15 seconds.
- Resize your browser window for responsive visuals.

## Dependencies

- [`three`](https://www.npmjs.com/package/three)
- [`vite`](https://vitejs.dev/)
- [`vite-plugin-string`](https://www.npmjs.com/package/vite-plugin-string)

## License

MIT

---
