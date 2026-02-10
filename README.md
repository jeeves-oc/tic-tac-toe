# Tic-Tac-Toe

A polished browser-based Tic-Tac-Toe game with optional AI, persistent scoring, themes, animations, and automated tests.

## Features

- **Player vs Player** and **Player vs AI** modes
- **Unbeatable AI** (minimax)
- **Score tracking across rounds** persisted in `localStorage`
- **Responsive/mobile-friendly layout**
- **UI animations** for moves and winning line
- **Confetti celebration** when a winner is found
- **5 visual themes** with selector + persistence
- **Unit tests** (Vitest) for game logic
- **End-to-end tests** (Playwright)

## Run locally

```bash
npm install
npm run start
```

Then open <http://127.0.0.1:4173>.

## Testing

### Unit tests

```bash
npm run test:unit
```

### E2E tests

Install browser once:

```bash
npx playwright install chromium
```

Run tests:

```bash
npm run test:e2e
```

### CI-style full test run

```bash
npm test
```
