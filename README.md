# PwGen

A secure, offline-capable password generator PWA that brings the power of the `pwgen` CLI tool to the browser. Built with vanilla TypeScript — no frameworks, no server, no tracking.

## Features

- **Configurable generation** — length, character sets (lowercase, uppercase, digits, symbols), pronounceable mode, ambiguous character avoidance
- **Persistent config** — generator settings are remembered across sessions
- **Save & manage** — store passwords with labels, search, filter by strength, sort, edit, regenerate, delete
- **Copy & reveal** — one-click clipboard copy and show/hide toggle
- **Strength meter** — real-time entropy-based strength scoring with feedback
- **Dark mode** — light, dark, and system-auto themes
- **Offline-first PWA** — installable on any device, works without internet after first load
- **100% client-side** — all data stays in your browser's LocalStorage

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 22+
- npm (comes with Node.js)

### Development

```bash
npm install
npm run dev
```

Opens a dev server at `http://localhost:3000` with hot reload.

### Build

```bash
npm run build
```

Output goes to `dist/`.

### Other Commands

| Command              | Description                |
|----------------------|----------------------------|
| `npm run preview`    | Preview the production build |
| `npm run lint`       | Lint source files          |
| `npm run lint:fix`   | Lint and auto-fix          |
| `npm run type-check` | Run TypeScript type checks |

## Docker

Build and run with the provided scripts:

```bash
# Build the image
./scripts/build.sh

# Run the container (default port 3000)
./scripts/run.sh

# Or specify a port
PORT=8080 ./scripts/run.sh
```

The container serves the static build via Nginx on the specified port.

## Project Structure

```
src/
  main.ts          Entry point — theme, tabs, UI wiring
  core/
    generator.ts   Password generation (random & pronounceable)
    crypto.ts      Crypto utilities (UUID, secure random)
    strength.ts    Password strength calculation
  storage/
    storage.ts     LocalStorage CRUD layer
  types/
    index.ts       TypeScript interfaces
  styles/
    main.css       Tailwind CSS styles
  pwa/             Service worker (offline caching)
```

## Tech Stack

- **TypeScript** — strict mode, ES2020 target
- **Vite** — dev server and build
- **Tailwind CSS 4** — via PostCSS
- **ESLint** — with `@typescript-eslint`
- **Nginx** — production serving (Docker)

## Security

- Passwords are generated using the Web Crypto API (`crypto.getRandomValues`)
- All data is stored locally in the browser — nothing is transmitted
- No external dependencies at runtime
- Works fully offline after initial load

## License

MIT