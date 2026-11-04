export type SpaceObject = {
  id: string
  name: string
  kind: 'Star' | 'Planet' | 'Moon' | 'Galaxy' | 'Black hole' | 'Nebula'
  subtitle: string
  distance: string
  diameter: string
  temperature: string
  description: string
  fact: string
  color: string
  size: number
  orbit: number
  speed: number
  texture?: string
}

export const objects: SpaceObject[] = [
  { id:'sun', name:'The Sun', kind:'Star', subtitle:'Our home star', distance:'0 AU', diameter:'1.39 million km', temperature:'5,500°C (surface)', description:'A G-type main-sequence star at the centre of our solar system. Its gravity holds the planets, asteroids and comets in orbit.', fact:'Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.', color:'#ffc56d', size:1.22, orbit:0, speed:0 },
  { id:'mercury', name:'Mercury', kind:'Planet', subtitle:'The swift planet', distance:'0.39 AU', diameter:'4,879 km', temperature:'167°C (mean)', description:'The smallest planet and the closest to the Sun. Its ancient, cratered surface records billions of years of impacts.', fact:'A single solar day on Mercury lasts 176 Earth days.', color:'#b7a99a', size:.22, orbit:2.1, speed:1.55 },
  { id:'venus', name:'Venus', kind:'Planet', subtitle:'Earth’s brilliant neighbour', distance:'0.72 AU', diameter:'12,104 km', temperature:'464°C (mean)', description:'A rocky world wrapped in dense clouds of carbon dioxide. A runaway greenhouse effect makes it the hottest planet.', fact:'Venus rotates in the opposite direction to most planets.', color:'#e8b978', size:.34, orbit:3.1, speed:1.12 },
  { id:'earth', name:'Earth', kind:'Planet', subtitle:'The pale blue dot', distance:'1.00 AU', diameter:'12,742 km', temperature:'15°C (mean)', description:'Our ocean world is the only place known to harbour life. Its atmosphere, magnetic field and liquid water make it remarkably habitable.', fact:'Earth is the only planet not named after a Greek or Roman deity.', color:'#5ca8d8', size:.38, orbit:4.25, speed:.86 },
  { id:'moon', name:'The Moon', kind:'Moon', subtitle:'Earth’s natural satellite', distance:'384,400 km from Earth', diameter:'3,475 km', temperature:'−20°C (mean)', description:'Earth’s only natural satellite shapes ocean tides and stabilises our planet’s axial tilt. Humans first walked here in 1969.', fact:'The Moon is moving about 3.8 cm farther from Earth every year.', color:'#c9cbd0', size:.13, orbit:4.8, speed:1.9 },
  { id:'mars', name:'Mars', kind:'Planet', subtitle:'The red planet', distance:'1.52 AU', diameter:'6,779 km', temperature:'−65°C (mean)', description:'A cold desert world with ancient river valleys, polar ice caps and the tallest volcano in the solar system: Olympus Mons.', fact:'A sunset on Mars can appear blue near the Sun.', color:'#d97957', size:.29, orbit:5.55, speed:.69 },
  { id:'jupiter', name:'Jupiter', kind:'Planet', subtitle:'King of the planets', distance:'5.20 AU', diameter:'139,820 km', temperature:'−110°C (cloud tops)', description:'A gas giant with powerful storms, faint rings and dozens of moons. Its Great Red Spot is a storm larger than Earth.', fact:'Jupiter has a day lasting just under 10 hours.', color:'#d8ad87', size:.78, orbit:7.55, speed:.37 },
  { id:'saturn', name:'Saturn', kind:'Planet', subtitle:'The ringed giant', distance:'9.58 AU', diameter:'116,460 km', temperature:'−140°C (cloud tops)', description:'A gas giant whose spectacular rings are made mostly of countless pieces of water ice and rock, from dust grains to house-sized chunks.', fact:'Saturn is less dense than water on average.', color:'#e5cb91', size:.68, orbit:9.65, speed:.25 },
  { id:'uranus', name:'Uranus', kind:'Planet', subtitle:'The sideways ice giant', distance:'19.2 AU', diameter:'50,724 km', temperature:'−195°C (mean)', description:'An ice giant with a blue-green atmosphere containing methane. Its extreme axial tilt gives it unusual seasons.', fact:'Uranus rotates on its side, with an axial tilt of about 98 degrees.', color:'#8bd4d5', size:.49, orbit:11.6, speed:.17 },
  { id:'neptune', name:'Neptune', kind:'Planet', subtitle:'The distant blue world', distance:'30.1 AU', diameter:'49,244 km', temperature:'−200°C (mean)', description:'A dark, cold and windy ice giant. Its deep blue atmosphere hosts some of the fastest winds measured in the solar system.', fact:'Neptune was mathematically predicted before it was directly observed.', color:'#527de2', size:.47, orbit:13.45, speed:.13 },
  { id:'sirius', name:'Sirius', kind:'Star', subtitle:'The brightest star in our night sky', distance:'8.6 light-years', diameter:'2.4 × Sun', temperature:'9,940°C (surface)', description:'A binary star system in Canis Major. Sirius A is a luminous main-sequence star; its companion Sirius B is a dense white dwarf.', fact:'Sirius appears so bright partly because it is relatively close to the Sun.', color:'#b9d8ff', size:.56, orbit:17.2, speed:.045 },
  { id:'andromeda', name:'Andromeda Galaxy', kind:'Galaxy', subtitle:'Our neighbouring spiral galaxy', distance:'2.5 million light-years', diameter:'~220,000 light-years', temperature:'—', description:'A vast spiral galaxy and the largest member of the Local Group. The Milky Way and Andromeda are moving toward a gradual merger.', fact:'Andromeda contains roughly one trillion stars.', color:'#b5a3e8', size:1.12, orbit:21, speed:.018 },
  { id:'orion', name:'Orion Nebula', kind:'Nebula', subtitle:'A stellar nursery', distance:'1,344 light-years', diameter:'~24 light-years', temperature:'~10,000 K (gas)', description:'A nearby region of active star formation where young stars illuminate and sculpt clouds of gas and dust.', fact:'The Orion Nebula is visible to the naked eye as a fuzzy patch in Orion’s sword.', color:'#e28eae', size:.85, orbit:18.8, speed:.024 },
  { id:'m87', name:'M87*', kind:'Black hole', subtitle:'The first black hole imaged', distance:'~55 million light-years', diameter:'Event horizon ~38 billion km', temperature:'—', description:'The supermassive black hole at the centre of galaxy Messier 87. The Event Horizon Telescope revealed its bright ring in 2019.', fact:'M87* has a mass about 6.5 billion times that of the Sun.', color:'#f29b69', size:.72, orbit:24, speed:.012 }
]

export type StructureLayer = { label: string; color: string; detail: string }
export type ObjectProfile = {
  classification: string; composition: string; atmosphere: string; rotation: string;
  year: string; gravity: string; companions: string; structureTitle: string;
  structure: StructureLayer[]; sourceLabel: string; sourceUrl: string
}

/** Conceptual educational layers; diagrams are not scale-accurate cross-sections. */
export const objectProfiles: Record<string, ObjectProfile> = {
  sun:{classification:'G2V main-sequence star',composition:'Mostly hydrogen and helium, with trace heavier elements',atmosphere:'Photosphere, chromosphere and an extended corona',rotation:'About 25 days at the equator; differential rotation',year:'About 225–250 million years around the Milky Way',gravity:'274 m/s² at the visible surface',companions:'8 planets · dwarf planets · small bodies',structureTitle:'Layers of a star',structure:[
    {label:'Core',color:'#ffcf72',detail:'Hydrogen nuclei fuse into helium and release energy'},
    {label:'Radiative zone',color:'#f59b56',detail:'Energy moves outward mainly through radiation'},
    {label:'Convective zone',color:'#e77847',detail:'Hot plasma rises while cooler plasma sinks'},
    {label:'Photosphere',color:'#ffe6a0',detail:'The visible layer from which most sunlight escapes'}],sourceLabel:'NASA · Solar System Facts',sourceUrl:'https://science.nasa.gov/solar-system/solar-system-facts/'},
  mercury:{classification:'Terrestrial · rocky planet',composition:'Silicate rock surrounding an unusually large iron-rich core',atmosphere:'Very thin exosphere: oxygen, sodium, hydrogen, helium and potassium',rotation:'58.6 Earth days',year:'88 Earth days',gravity:'3.7 m/s²',companions:'No natural moons · no rings',structureTitle:'Rocky interior',structure:[
    {label:'Crust',color:'#b6a99b',detail:'Ancient, heavily cratered silicate surface'},
    {label:'Silicate mantle',color:'#c47c5a',detail:'A comparatively thin rocky mantle'},
    {label:'Iron-rich core',color:'#ef9c61',detail:'A very large metallic core dominates the interior'}],sourceLabel:'NASA · Planetary Fact Sheet',sourceUrl:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/'},
  venus:{classification:'Terrestrial · rocky planet',composition:'Silicate rock with a substantial metallic core',atmosphere:'Extremely dense carbon dioxide; clouds contain sulfuric-acid droplets',rotation:'243 Earth days · retrograde',year:'225 Earth days',gravity:'8.9 m/s²',companions:'No natural moons · no rings',structureTitle:'Rocky interior',structure:[
    {label:'Crust',color:'#e6c08b',detail:'Basaltic surface shaped by volcanism and tectonics'},
    {label:'Silicate mantle',color:'#d88c52',detail:'Hot rock that transfers heat through the planet'},
    {label:'Metallic core',color:'#a95845',detail:'Likely iron-rich; details remain uncertain'},
    {label:'Cloud deck',color:'#f5dfb2',detail:'Dense reflective clouds hide the surface from visible light'}],sourceLabel:'NASA · Planetary Fact Sheet',sourceUrl:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/'},
  earth:{classification:'Terrestrial · ocean world',composition:'Iron-nickel core, silicate mantle and a thin rocky crust',atmosphere:'78% nitrogen · 21% oxygen · trace gases and variable water vapour',rotation:'23 hours 56 minutes',year:'365.256 days',gravity:'9.81 m/s²',companions:'1 natural moon · no rings',structureTitle:'Inside Earth',structure:[
    {label:'Crust',color:'#64b7b2',detail:'Thin, rigid outer shell beneath oceans and continents'},
    {label:'Mantle',color:'#e58c58',detail:'Hot silicate rock that slowly convects'},
    {label:'Outer core',color:'#f0bd58',detail:'Liquid iron alloy; its motion helps generate the magnetic field'},
    {label:'Inner core',color:'#fff0a6',detail:'Solid iron-nickel centre under immense pressure'}],sourceLabel:'NASA · Planetary Fact Sheet',sourceUrl:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/'},
  moon:{classification:'Natural satellite · rocky body',composition:'Silicate crust and mantle with a small iron-rich core',atmosphere:'Extremely tenuous surface-bound exosphere',rotation:'27.3 days · synchronous with its orbit around Earth',year:'27.3 days around Earth',gravity:'1.62 m/s²',companions:'Orbits Earth · no known natural satellites of its own',structureTitle:'Lunar interior',structure:[
    {label:'Crust',color:'#c9cbd0',detail:'Anorthositic highlands and darker basaltic maria'},
    {label:'Mantle',color:'#a9a4a0',detail:'Mostly solid silicate rock'},
    {label:'Small core',color:'#d98e65',detail:'Metal-rich central region with a partially liquid outer portion'}],sourceLabel:'NASA · Planetary Fact Sheet',sourceUrl:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/'},
  mars:{classification:'Terrestrial · rocky planet',composition:'Basaltic crust, silicate mantle and iron-rich core',atmosphere:'Thin carbon-dioxide atmosphere with nitrogen and argon',rotation:'24 hours 37 minutes',year:'687 Earth days',gravity:'3.71 m/s²',companions:'2 small moons · Phobos and Deimos',structureTitle:'Rocky interior',structure:[
    {label:'Crust',color:'#d77a57',detail:'Dusty basaltic surface with ancient impact basins'},
    {label:'Mantle',color:'#a95440',detail:'Silicate rock beneath the rigid crust'},
    {label:'Core',color:'#e7a05d',detail:'Iron, nickel and sulfur-rich interior'},
    {label:'Polar ice',color:'#c9e4ed',detail:'Seasonal carbon-dioxide frost and water ice deposits'}],sourceLabel:'NASA · Planetary Fact Sheet',sourceUrl:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/'},
  jupiter:{classification:'Gas giant · largest planet',composition:'Mostly hydrogen and helium, with heavier material deeper inside',atmosphere:'Hydrogen and helium with ammonia and water clouds',rotation:'About 9 hours 56 minutes',year:'11.86 Earth years',gravity:'24.8 m/s² near the cloud tops',companions:'Large satellite system · faint rings',structureTitle:'A giant without a solid surface',structure:[
    {label:'Cloud atmosphere',color:'#d9b48d',detail:'Ammonia and water clouds form belts, zones and giant storms'},
    {label:'Molecular hydrogen',color:'#c28a68',detail:'Hydrogen becomes progressively denser with depth'},
    {label:'Metallic hydrogen',color:'#a96a54',detail:'Extreme pressure turns hydrogen into an electrically conducting fluid'},
    {label:'Diffuse core',color:'#f0c47d',detail:'Heavy elements may be mixed gradually into the surrounding layers'}],sourceLabel:'NASA · Jupiter Facts',sourceUrl:'https://science.nasa.gov/jupiter/jupiter-facts/'},
  saturn:{classification:'Gas giant · ringed planet',composition:'Mostly hydrogen and helium',atmosphere:'Hydrogen and helium with ammonia, water and other trace compounds',rotation:'About 10 hours 33 minutes',year:'29.45 Earth years',gravity:'10.4 m/s² near the cloud tops',companions:'Extensive moon system · bright icy rings',structureTitle:'A layered gas giant',structure:[
    {label:'Cloud atmosphere',color:'#ead5a2',detail:'Pale ammonia-rich cloud tops and fast-moving winds'},
    {label:'Molecular hydrogen',color:'#d9ae75',detail:'Deep, dense hydrogen and helium fluid'},
    {label:'Metallic hydrogen',color:'#b77c55',detail:'Conducting hydrogen under immense pressure'},
    {label:'Dense core region',color:'#7d5c59',detail:'Heavy elements in a likely extended, diffuse core'},
    {label:'Ring system',color:'#f0d6a3',detail:'Separate icy particle populations with gaps and resonances'}],sourceLabel:'NASA · Planetary Fact Sheet',sourceUrl:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/'},
  uranus:{classification:'Ice giant · extreme axial tilt',composition:'Water-, ammonia- and methane-rich interior beneath hydrogen and helium',atmosphere:'Hydrogen and helium with methane, which absorbs red light',rotation:'About 17 hours 14 minutes · retrograde',year:'84 Earth years',gravity:'8.7 m/s²',companions:'Moon system · dark, narrow rings',structureTitle:'An ice giant interior',structure:[
    {label:'Atmosphere',color:'#b9ece7',detail:'Hydrogen, helium and methane above the cloud layers'},
    {label:'Icy mantle',color:'#70c6c9',detail:'Hot, dense water, ammonia and methane-rich material'},
    {label:'Rocky core',color:'#4d869c',detail:'A compact central region of heavier elements'},
    {label:'Ring system',color:'#a6b5bd',detail:'Narrow, dark rings orbit around its tilted equator'}],sourceLabel:'NASA · Planetary Fact Sheet',sourceUrl:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/'},
  neptune:{classification:'Ice giant · outermost planet',composition:'Water-, ammonia- and methane-rich interior beneath hydrogen and helium',atmosphere:'Hydrogen and helium with methane and dynamic cloud systems',rotation:'About 16 hours 6 minutes',year:'164.8 Earth years',gravity:'11.2 m/s²',companions:'Moon system · faint rings and arcs',structureTitle:'An ice giant interior',structure:[
    {label:'Atmosphere',color:'#7ea8ef',detail:'Fast winds and changing bright cloud features'},
    {label:'Icy mantle',color:'#456fcb',detail:'Dense hot fluids rich in water, ammonia and methane'},
    {label:'Rocky core',color:'#273c82',detail:'Central region of heavier elements'},
    {label:'Ring system',color:'#a8b4d4',detail:'Faint rings with clumpy arcs'}],sourceLabel:'NASA · Planetary Fact Sheet',sourceUrl:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/'},
  sirius:{classification:'Binary star system',composition:'Sirius A is a hydrogen-burning star; Sirius B is a carbon–oxygen white dwarf',atmosphere:'Stellar photospheres with very different temperatures and densities',rotation:'Sirius A rotates rapidly; Sirius B is a compact remnant',year:'About 50 years for the binary orbit',gravity:'Varies dramatically between the two stars',companions:'Two stars · Sirius A and Sirius B',structureTitle:'A two-star system',structure:[
    {label:'Sirius A',color:'#b9d8ff',detail:'Bright main-sequence star, roughly twice the Sun’s mass'},
    {label:'Shared orbit',color:'#8e9bd1',detail:'Both stars orbit a common centre of mass'},
    {label:'Sirius B',color:'#f0e8d7',detail:'Dense white dwarf about the size of Earth'}],sourceLabel:'NASA · Stars',sourceUrl:'https://science.nasa.gov/universe/stars/'},
  andromeda:{classification:'Spiral galaxy · Local Group',composition:'Stars, gas, dust, dark matter and globular clusters',atmosphere:'No single planetary-style atmosphere; a very extended galactic halo',rotation:'Differential rotation across its stellar and gas disk',year:'Hundreds of millions of years for outer disk regions to orbit',gravity:'A vast gravitational field dominated by visible and dark matter',companions:'Satellite galaxies · interacts gravitationally with the Milky Way',structureTitle:'Anatomy of a spiral galaxy',structure:[
    {label:'Central bulge',color:'#f5d18d',detail:'Dense concentration of older stars around the centre'},
    {label:'Spiral disk',color:'#c4a5ed',detail:'Curving arms containing stars, gas and dust'},
    {label:'Star-forming regions',color:'#e58eac',detail:'Bright clouds where new stars are born'},
    {label:'Dark matter halo',color:'#6472b8',detail:'Extended unseen mass inferred from gravitational effects'}],sourceLabel:'NASA · Galaxies',sourceUrl:'https://science.nasa.gov/universe/galaxies/'},
  orion:{classification:'Emission nebula · stellar nursery',composition:'Ionised hydrogen, oxygen, dust and molecular gas',atmosphere:'Interstellar gas illuminated and ionised by young massive stars',rotation:'Gas and dust move turbulently; no single rotation period',year:'Not applicable',gravity:'Local gravity shapes dense star-forming clumps',companions:'Young stellar cluster · protoplanetary disks',structureTitle:'Inside a stellar nursery',structure:[
    {label:'Ionised cavity',color:'#f0a3bc',detail:'Energetic starlight ionises the surrounding gas'},
    {label:'Molecular cloud',color:'#a78be0',detail:'Cool, dense gas and dust behind the bright nebula'},
    {label:'Young stars',color:'#f5d29b',detail:'Newly formed stars illuminate and sculpt the cloud'},
    {label:'Proplyds',color:'#78c9d0',detail:'Young planetary systems forming inside dusty disks'}],sourceLabel:'NASA · Hubble Messier Catalog',sourceUrl:'https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-42/'},
  m87:{classification:'Supermassive black hole · M87 galaxy',composition:'Central black hole surrounded by superheated infalling plasma',atmosphere:'No ordinary atmosphere; hot accretion flow emits across the spectrum',rotation:'Spin is inferred from the surrounding accretion flow and jet physics',year:'Not applicable',gravity:'Extreme spacetime curvature near the event horizon',companions:'Relativistic jet · surrounding stars and gas',structureTitle:'Black hole environment',structure:[
    {label:'Relativistic jet',color:'#82c8d7',detail:'Narrow outflow launched from the central region'},
    {label:'Accretion flow',color:'#f2b26d',detail:'Superheated matter spiralling toward the black hole'},
    {label:'Photon region',color:'#f4dfb6',detail:'Light can follow strongly bent paths near the black hole'},
    {label:'Event horizon',color:'#171923',detail:'Boundary beyond which light cannot escape'}],sourceLabel:'Event Horizon Telescope',sourceUrl:'https://eventhorizontelescope.org/'}
}


export type OrbitalElements = {
  semiMajorAxisAU:number; eccentricity:number; inclinationDeg:number; ascendingNodeDeg:number;
  argumentOfPerihelionDeg:number; meanAnomalyAtEpochDeg:number; periodDays:number;
  axialTiltDeg:number; visualSpinSeconds:number; retrograde?:boolean
}
/** Approximate J2000 mean orbital elements; not a live high-precision ephemeris. */
export const orbitalElements:Record<string,OrbitalElements> = {
 mercury:{semiMajorAxisAU:.38709843,eccentricity:.20563661,inclinationDeg:7.005594,ascendingNodeDeg:48.339618,argumentOfPerihelionDeg:29.1181,meanAnomalyAtEpochDeg:174.79395,periodDays:87.969,axialTiltDeg:.03,visualSpinSeconds:36},
 venus:{semiMajorAxisAU:.72332102,eccentricity:.00676399,inclinationDeg:3.397775,ascendingNodeDeg:76.672615,argumentOfPerihelionDeg:55.0949,meanAnomalyAtEpochDeg:50.21215,periodDays:224.701,axialTiltDeg:177.4,visualSpinSeconds:44,retrograde:true},
 earth:{semiMajorAxisAU:1.00000018,eccentricity:.01673163,inclinationDeg:-.000543,ascendingNodeDeg:-5.112604,argumentOfPerihelionDeg:108.04266,meanAnomalyAtEpochDeg:357.53686,periodDays:365.256,axialTiltDeg:23.44,visualSpinSeconds:20},
 mars:{semiMajorAxisAU:1.52371243,eccentricity:.09336511,inclinationDeg:1.851819,ascendingNodeDeg:49.71321,argumentOfPerihelionDeg:286.36934,meanAnomalyAtEpochDeg:19.34932,periodDays:686.98,axialTiltDeg:25.19,visualSpinSeconds:20},
 jupiter:{semiMajorAxisAU:5.20248019,eccentricity:.04853590,inclinationDeg:1.298614,ascendingNodeDeg:100.292827,argumentOfPerihelionDeg:273.98213,meanAnomalyAtEpochDeg:20.05984,periodDays:4332.59,axialTiltDeg:3.13,visualSpinSeconds:8.3},
 saturn:{semiMajorAxisAU:9.54149883,eccentricity:.05550825,inclinationDeg:2.494241,ascendingNodeDeg:113.639987,argumentOfPerihelionDeg:339.22137,meanAnomalyAtEpochDeg:317.21435,periodDays:10759.2,axialTiltDeg:26.73,visualSpinSeconds:9.1},
 uranus:{semiMajorAxisAU:19.18797948,eccentricity:.04685740,inclinationDeg:.772981,ascendingNodeDeg:73.962502,argumentOfPerihelionDeg:98.47154,meanAnomalyAtEpochDeg:141.76872,periodDays:30685.4,axialTiltDeg:97.77,visualSpinSeconds:14.4,retrograde:true},
 neptune:{semiMajorAxisAU:30.06952752,eccentricity:.00895439,inclinationDeg:1.770055,ascendingNodeDeg:131.786359,argumentOfPerihelionDeg:274.89523,meanAnomalyAtEpochDeg:257.54131,periodDays:60189,axialTiltDeg:28.32,visualSpinSeconds:13.5}
}
export const lunarOrbit={semiMajorAxisScene:.48,eccentricity:.0549,inclinationDeg:5.145,periodDays:27.3217,meanAnomalyAtEpochDeg:115}
