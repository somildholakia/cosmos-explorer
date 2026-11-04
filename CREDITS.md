# Third-party asset credits

## Solar System Scope surface maps

The following equirectangular maps are loaded from Solar System Scope:
https://www.solarsystemscope.com/textures/

The source distributes its texture pack under Creative Commons Attribution 4.0 International (CC BY 4.0):
https://creativecommons.org/licenses/by/4.0/

Base and selected-body maps used:
- Sun, Mercury, Venus surface, Earth day/night/cloud layers, Moon, Mars, Jupiter, Saturn, Saturn rings, Uranus and Neptune.
- Ceres, Haumea, Makemake and Eris use Solar System Scope's explicitly labelled fictional maps. Those maps are representative artistic surfaces based on available NASA elevation/imagery data; they are not complete scientific global mosaics.
- On desktop, the focused Sun, Mercury, Venus, Earth, Moon, Mars, Jupiter and Saturn may load the source's 8K variant. Mobile and constrained devices stay on 2K maps. High-resolution maps are requested only for the currently selected body.

Attribution: Solar System Scope (solarsystemscope.com), CC BY 4.0.

## Voyager / Galileo moon maps

Several moon maps are loaded from the NASA/JPL Solar System Simulator:
https://space.jpl.nasa.gov/tmaps/jupiter.html
https://space.jpl.nasa.gov/tmaps/saturn.html

- Io — jup1vss2.jpg (Voyager/Galileo colour mosaic; JPL/Caltech)
- Europa — jup2vss2.jpg (Voyager/USGS cleaned mosaic; JPL/Caltech)
- Ganymede — jup3vss2.jpg (Voyager/USGS cleaned mosaic; JPL/Caltech)
- Callisto — jup4vss2.jpg (Voyager/USGS cleaned mosaic; JPL/Caltech)
- Enceladus — sat2vss2.jpg (Voyager/USGS cleaned mosaic; JPL/Caltech)

NASA/JPL notes that some global maps contain data gaps and may be processed or enhanced for visualization. They are used here as educational visual maps, not for scientific measurement.

## Original procedural surface maps

Bodies without a suitable global image map receive a deterministic, original CanvasTexture generated at runtime. These are visual fallback textures and are not presented as spacecraft imagery or scientific elevation data.
