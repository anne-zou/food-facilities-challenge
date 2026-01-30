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

## Docusaurus

```bash
cd docs
npm install
npm start          # Dev server at http://localhost:3000
npm run build      # Production build to build/
npm run serve      # Serve production build
```

## File Structure
```
- food-facilities-challenge/
  - index.html (landing HTML)
  - public/jswasm/ (client-side SQLite)
  - Mobile_Food_Facility_Permit.csv (dataset)

  - src/
    - main.jsx (mounts React)
    - App.jsx (top-level component)
    - SearchLayout.jsx (page layout)
    - index.css (global styles)

    - db/
      - init.js (initialize DB)
      - schema.js (DB schema)

    - contexts/
      - SearchContext.jsx (context for managing search state)

    - components/
      - SearchForm.jsx
      - SearchFieldsFilter.jsx
      - StatusFilter.jsx
      - ResultsTable.jsx
      - Pagination.jsx
      
  - docs/ (documentation site - Docusaurus)
    - docusaurus.config.ts (site config)
    - sidebars.ts (sidebar nav)
    - src/
      - pages/index.tsx (docs homepage)
      - components/HomepageFeatures/index.tsx (homepage items)
    - docs/
      - intro.md (project intro)
      - getting-started.md (quickstart and usage)
      - search-context.md (search state handling)

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
