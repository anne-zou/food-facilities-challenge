---
sidebar_position: 2
---

# Getting Started

## Prerequisites

- Node.js 18.0+
- npm

## Application

```bash
npm install
npm run dev        # Dev server at http://localhost:5173
npm run build      # Production build to dist/
npm run preview    # Preview production build
```

## Testing

```bash
npm test           # Run all tests
npm run test:watch # Run tests in watch mode
```

## Docusaurus

```bash
cd docs
npm install
npm start          # Dev server at http://localhost:3000
npm run build      # Production build to build/
npm run serve      # Serve production build
```

## Troubleshooting

**Port in use:**
```bash
lsof -ti:5173 | xargs kill -9  # App
lsof -ti:3000 | xargs kill -9  # Docusaurus
```

**Module errors:**
```bash
rm -rf node_modules package-lock.json && npm install
```

**Build errors:**
```bash
rm -rf node_modules/.vite && npm run build
```
