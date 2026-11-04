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