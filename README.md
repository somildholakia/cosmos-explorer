# COSMOS — An atlas of everything

COSMOS is a browser-based 3D universe explorer. It combines a navigable spatial scene with a searchable catalogue and concise science dossiers for planets, moons, stars, nebulae, galaxies and black holes.

## Experience
- 3D starfield with mouse/touch orbit, pan and zoom controls
- Select any visible celestial object to open its dossier and focus the camera
- Searchable catalogue with object-type filters
- Dedicated visual treatments for stars, ringed planets, nebulae, galaxies and black holes
- Responsive observatory-style interface for desktop and mobile
- Keyboard shortcut: `Ctrl/⌘ + K` opens the catalogue; `Esc` closes it

## Technology
- React 19 + TypeScript + Vite
- Three.js, React Three Fiber and Drei
- Lucide icons

## Run locally
```bash
npm install
npm run dev
```

## Production build
```bash
npm run build
npm run preview
```

## Scientific scope
This release is an educational, navigable concept model—not a precision ephemeris or scale-accurate map. Planet sizes and distances are intentionally compressed so that the objects can be explored in one scene. Catalogue values are concise reference summaries; this project will continue adding mission imagery, object-level source citations, and more accurate orbital data.

## Planned next milestones
1. Source-backed object dossiers with NASA/ESA imagery and citations.
2. Better object-specific surface maps and physically based materials.
3. Guided missions, constellation navigation and deep-space discovery routes.
4. Mobile touch controls, performance profiling and accessibility testing.


## Asset credits
See [CREDITS.md](./CREDITS.md) for the source and CC BY 4.0 attribution for planetary surface textures.
