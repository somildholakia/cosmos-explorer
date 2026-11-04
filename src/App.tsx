import { useMemo, useState } from 'react'
import { Search, Compass, Orbit, SlidersHorizontal, Info, ChevronRight, X, Crosshair, RotateCcw, Sparkles, Menu } from 'lucide-react'
import Universe from './Universe'
import { objects, type SpaceObject } from './data'

const filters = ['All', 'Planet', 'Star', 'Moon', 'Galaxy', 'Nebula', 'Black hole'] as const
const formatKind = (kind: string) => kind.toUpperCase()

export default function App() {
  const [selected, setSelected] = useState<SpaceObject>(objects[3])
  const [activeFilter, setActiveFilter] = useState<string>('All')
  const [query, setQuery] = useState('')
  const [showInfo, setShowInfo] = useState(true)
  const [showCatalogue, setShowCatalogue] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const filtered = useMemo(() => objects.filter(o => (activeFilter === 'All' || o.kind === activeFilter) && (o.name.toLowerCase().includes(query.toLowerCase()) || o.subtitle.toLowerCase().includes(query.toLowerCase()))), [activeFilter, query])
  const choose = (item: SpaceObject) => { setSelected(item); setShowInfo(true); setShowCatalogue(false) }
  return <main className="app-shell">
    <header className="topbar">
      <a className="brand" href="#" aria-label="Cosmos home"><span className="brand-mark"><Orbit size={19}/></span><span>COSMOS<span className="brand-period">.</span></span><span className="brand-divider"/><span className="brand-caption">AN ATLAS OF EVERYTHING</span></a>
      <nav className={showMobileMenu ? 'topnav open' : 'topnav'}>
        <a className="nav-link active" href="#explore"><Compass size={15}/> Explore</a>
        <a className="nav-link" href="#catalogue" onClick={(e)=>{e.preventDefault();setShowCatalogue(true)}}>Catalogue</a>
        <a className="nav-link" href="https://science.nasa.gov/solar-system/" target="_blank" rel="noreferrer">Learn ↗</a>
      </nav>
      <div className="top-actions"><span className="live-indicator"><i/> LIVE SIMULATION</span><button className="icon-button mobile-menu" onClick={()=>setShowMobileMenu(!showMobileMenu)} aria-label="Toggle menu"><Menu size={18}/></button><button className="avatar-button" title="Explorer profile">S</button></div>
    </header>
    <section className="workspace" id="explore">
      <aside className="left-rail">
        <div className="rail-kicker">FIELD NOTES <span>01 — 07</span></div>
        <div className="rail-heading">Explore the<br/><em>unexplored.</em></div>
        <p className="rail-copy">A living map of the cosmos. Move through space, discover extraordinary worlds, and get closer to the science behind them.</p>
        <div className="search-box"><Search size={16}/><input value={query} onChange={e=>{setQuery(e.target.value);setShowCatalogue(true)}} placeholder="Find a world..." aria-label="Search celestial objects"/><kbd>⌘ K</kbd></div>
        <div className="section-row"><span>OBJECT TYPES</span><SlidersHorizontal size={14}/></div>
        <div className="filter-list">{filters.map(f=><button key={f} className={activeFilter===f?'filter-chip chosen':'filter-chip'} onClick={()=>{setActiveFilter(f);setShowCatalogue(true)}}><span className={'filter-dot '+f.toLowerCase().replace(' ','-')}/>{f}<span className="filter-count">{f==='All'?objects.length:objects.filter(o=>o.kind===f).length}</span></button>)}</div>
        <div className="rail-bottom"><div className="tiny-orbit"><Orbit size={17}/></div><div><b>THE KNOWN UNIVERSE</b><small>One small step at a time.</small></div></div>
      </aside>
      <section className="universe-stage">
        <div className="stage-topline"><div><span className="eyebrow">OBSERVATION DECK</span><span className="stage-coordinate"> / SOL SYSTEM · LOCAL GROUP</span></div><div className="stage-tools"><span className="scale-label">SCALE <b>ILLUSTRATIVE</b></span><button className={focusMode?'tool-button selected-tool':'tool-button'} onClick={()=>setFocusMode(!focusMode)} title="Toggle focus mode"><Crosshair size={15}/></button><button className="tool-button" onClick={()=>choose(objects[3])} title="Reset selection"><RotateCcw size={15}/></button></div></div>
        <div className="canvas-wrap"><Universe items={objects} selected={selected} onSelect={choose}/><div className="canvas-vignette"/><div className="canvas-label top-left"><span className="label-line"/> MILKY WAY · LOCAL VIEW</div><div className="canvas-label bottom-left"><span className="pulse-dot"/> GRAVITY FIELD ACTIVE</div><div className="canvas-hint"><span>DRAG TO ROTATE</span><span>SCROLL TO ZOOM</span></div>
          {!focusMode && <div className="object-tooltip"><span className="tooltip-index">SELECTED OBJECT</span><b>{selected.name}</b><small>{formatKind(selected.kind)} · {selected.distance}</small></div>}
        </div>
        <div className="stage-footer"><span>01 <i/> 14 CELESTIAL OBJECTS</span><span>NOT TO SCALE · CONCEPTUAL SPATIAL MODEL</span><span>DATA: NASA / ESA REFERENCES</span></div>
      </section>
      {showInfo && <aside className="info-panel">
        <div className="panel-top"><span className="eyebrow">CELESTIAL DOSSIER <span className="gold">✳</span></span><button className="icon-button" onClick={()=>setShowInfo(false)} aria-label="Close information"><X size={17}/></button></div>
        <div className="object-art" style={{'--planet-color':selected.color} as React.CSSProperties}><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-planet"/><div className="art-glow"/></div>
        <div className="object-title"><span className="object-type">{selected.kind.toUpperCase()} <i/> {selected.id.toUpperCase()}</span><h1>{selected.name}</h1><p>{selected.subtitle}</p></div>
        <div className="stat-grid"><div><span>DISTANCE</span><b>{selected.distance}</b></div><div><span>DIAMETER</span><b>{selected.diameter}</b></div><div className="wide-stat"><span>TEMPERATURE</span><b>{selected.temperature}</b></div></div>
        <div className="about-section"><div className="section-row"><span>OVERVIEW</span><Info size={14}/></div><p>{selected.description}</p></div>
        <div className="fact-card"><div className="fact-heading"><Sparkles size={14}/> DID YOU KNOW?</div><p>{selected.fact}</p></div>
        <button className="more-button" onClick={()=>setShowCatalogue(true)}>Explore more objects <ChevronRight size={16}/></button>
        <div className="panel-foot"><span>OBJECT ID: {selected.id.toUpperCase()}</span><span>VERIFIED FACTS · 2026</span></div>
      </aside>}
      {!showInfo && <button className="reopen-info" onClick={()=>setShowInfo(true)}><Info size={16}/> Object details</button>}
    </section>
    {showCatalogue && <div className="modal-backdrop" onClick={()=>setShowCatalogue(false)}><section className="catalogue-modal" onClick={e=>e.stopPropagation()}><div className="catalogue-head"><div><span className="eyebrow">THE COSMIC INDEX</span><h2>Find your next <em>destination.</em></h2></div><button className="icon-button" onClick={()=>setShowCatalogue(false)} aria-label="Close catalogue"><X size={18}/></button></div><div className="catalogue-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search objects, types, descriptions..."/></div><div className="catalogue-filters">{filters.map(f=><button key={f} className={activeFilter===f?'active':''} onClick={()=>setActiveFilter(f)}>{f}</button>)}</div><div className="catalogue-list">{filtered.map((item,i)=><button className="catalogue-item" key={item.id} onClick={()=>choose(item)}><span className="catalogue-number">{String(i+1).padStart(2,'0')}</span><span className="catalogue-orb" style={{'--planet-color':item.color} as React.CSSProperties}/><span className="catalogue-name"><b>{item.name}</b><small>{item.subtitle}</small></span><span className="catalogue-kind">{item.kind}</span><span className="catalogue-distance">{item.distance}</span><ChevronRight size={16}/></button>)}{filtered.length===0&&<p className="empty-state">No objects found. Try another search.</p>}</div><div className="catalogue-foot">{filtered.length} OBJECTS IN VIEW <span>SELECT AN OBJECT TO OPEN ITS DOSSIER</span></div></section></div>}
    <footer className="bottom-bar"><span>© 2026 COSMOS EXPLORER</span><span>MADE FOR THE CURIOUS <i>✳</i></span><a href="https://science.nasa.gov/" target="_blank" rel="noreferrer">SCIENCE, NOT FICTION ↗</a></footer>
  </main>
}