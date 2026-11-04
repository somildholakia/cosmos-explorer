import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Search, Compass, Orbit, SlidersHorizontal, Info, ChevronRight, X, Crosshair, RotateCcw, Sparkles, Menu, Shuffle, Bookmark, Globe2, Layers3, Telescope, Play, Pause, Clock3 } from 'lucide-react'
const Universe = lazy(() => import('./Universe'))
import { objects, objectProfiles, type SpaceObject } from './data'

const filters = ['All', 'Planet', 'Star', 'Moon', 'Galaxy', 'Nebula', 'Black hole', 'Saved'] as const
const formatKind = (kind: string) => kind.toUpperCase()

export default function App() {
  const [selected, setSelected] = useState<SpaceObject>(objects[3])
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem('cosmos:saved-worlds') ?? '[]')
      return Array.isArray(stored) ? stored.filter((id): id is string => typeof id === 'string' && objects.some(item => item.id === id)) : []
    } catch {
      return []
    }
  })
  const [activeFilter, setActiveFilter] = useState<string>('All')
  const [query, setQuery] = useState('')
  const [showInfo, setShowInfo] = useState(true)
  const [showCatalogue, setShowCatalogue] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [simulationRunning, setSimulationRunning] = useState(true)
  const [simulationSpeed, setSimulationSpeed] = useState('1')
  const discover = () => {
    const candidates = objects.filter(item => item.id !== selected.id)
    const next = candidates[Math.floor(Math.random() * candidates.length)]
    if (next) choose(next)
  }
  const toggleSaved = () => setSavedIds(current => current.includes(selected.id)
    ? current.filter(id => id !== selected.id)
    : [...current, selected.id])
  const isSaved = savedIds.includes(selected.id)
  const selectedProfile = objectProfiles[selected.id]
  const planetCount = objects.filter(item => item.kind === 'Planet').length
  const deepSpaceCount = objects.filter(item => ['Galaxy', 'Nebula', 'Black hole'].includes(item.kind)).length

  useEffect(() => {
    try { localStorage.setItem('cosmos:saved-worlds', JSON.stringify(savedIds)) } catch { /* Storage can be unavailable in private browsing. */ }
  }, [savedIds])
  const searchInputRef = useRef<HTMLInputElement>(null)
  const catalogueSearchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setShowCatalogue(true)
      }
      if (event.key === 'Escape') {
        setShowCatalogue(false)
        setShowMobileMenu(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (showCatalogue) catalogueSearchRef.current?.focus()
  }, [showCatalogue])
  const filtered = useMemo(() => objects.filter(o => (activeFilter === 'All' || (activeFilter === 'Saved' ? savedIds.includes(o.id) : o.kind === activeFilter)) && (o.name.toLowerCase().includes(query.toLowerCase()) || o.subtitle.toLowerCase().includes(query.toLowerCase()) || o.description.toLowerCase().includes(query.toLowerCase()) || o.fact.toLowerCase().includes(query.toLowerCase()))), [activeFilter, query, savedIds])
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
    <section className="overview-strip" aria-label="Observatory overview">
      <div className="overview-intro">
        <span className="eyebrow">MISSION CONTROL <i> / </i> YOUR OBSERVATORY</span>
        <h2>A universe of <em>possibilities.</em></h2>
        <p>One view. Countless stories. Start with a world that sparks your curiosity.</p>
      </div>
      <div className="overview-metrics">
        <button className="overview-metric metric-violet" onClick={()=>{setActiveFilter('All');setQuery('');setShowCatalogue(true)}}>
          <span className="metric-icon"><Globe2 size={16}/></span><b>{objects.length}</b><span>OBJECTS MAPPED</span><small>Across the cosmos</small>
        </button>
        <button className="overview-metric metric-cyan" onClick={()=>{setActiveFilter('Planet');setQuery('');setShowCatalogue(true)}}>
          <span className="metric-icon"><Orbit size={16}/></span><b>{planetCount}</b><span>PLANETS</span><small>Rocky &amp; giant worlds</small>
        </button>
        <button className="overview-metric metric-coral" onClick={()=>{setActiveFilter('All');setQuery('');setShowCatalogue(true)}}>
          <span className="metric-icon"><Telescope size={16}/></span><b>{deepSpaceCount}</b><span>DEEP SPACE</span><small>Beyond our solar system</small>
        </button>
        <button className="overview-metric metric-gold" onClick={()=>{setActiveFilter('Saved');setQuery('');setShowCatalogue(true)}}>
          <span className="metric-icon"><Bookmark size={16}/></span><b>{savedIds.length}</b><span>YOUR SAVED WORLDS</span><small>Personal collection</small>
        </button>
      </div>
    </section>
    <section className="workspace" id="explore">
      <aside className="left-rail">
        <div className="rail-kicker">FIELD NOTES <span>01 — 08</span></div>
        <div className="rail-heading">Explore the<br/><em>unexplored.</em></div>
        <p className="rail-copy">A living map of the cosmos. Move through space, discover extraordinary worlds, and get closer to the science behind them.</p>
        <div className="search-box"><Search size={16}/><input ref={searchInputRef} value={query} onChange={e=>{setQuery(e.target.value);setShowCatalogue(true)}} placeholder="Find a world..." aria-label="Search celestial objects"/><kbd>⌘ K</kbd></div>
        <div className="section-row"><span>OBJECT TYPES</span><SlidersHorizontal size={14}/></div>
        <div className="filter-list">{filters.map(f=><button key={f} className={activeFilter===f?'filter-chip chosen':'filter-chip'} onClick={()=>{setActiveFilter(f);setShowCatalogue(true)}}><span className={'filter-dot '+f.toLowerCase().replace(' ','-')}/>{f}<span className="filter-count">{f==='All'?objects.length:f==='Saved'?savedIds.length:objects.filter(o=>o.kind===f).length}</span></button>)}</div>
        <div className="rail-bottom"><div className="tiny-orbit"><Orbit size={17}/></div><div><b>THE KNOWN UNIVERSE</b><small>One small step at a time.</small></div></div>
      </aside>
      <section className="universe-stage">
        <div className="stage-topline"><div><span className="eyebrow">OBSERVATION DECK</span><span className="stage-coordinate"> / SOL SYSTEM · LOCAL GROUP</span></div><div className="stage-tools"><div className="simulation-controls"><span><Clock3 size={12}/> ORBIT CLOCK</span><select value={simulationSpeed} onChange={e=>setSimulationSpeed(e.target.value)} aria-label="Simulation speed"><option value="1">1×</option><option value="5">5×</option><option value="20">20×</option><option value="100">100×</option></select><button className={simulationRunning?'tool-button sim-toggle is-running':'tool-button sim-toggle'} onClick={()=>setSimulationRunning(value=>!value)} aria-label={simulationRunning?'Pause planetary motion':'Resume planetary motion'} title={simulationRunning?'Pause simulation':'Resume simulation'}>{simulationRunning?<Pause size={13}/>:<Play size={13}/>}</button></div><span className="scale-label">AUTO QUALITY <b>DEVICE OPTIMISED</b></span><button className={focusMode?'tool-button selected-tool':'tool-button'} onClick={()=>setFocusMode(!focusMode)} title="Toggle focus mode"><Crosshair size={15}/></button><button className="tool-button" onClick={()=>choose(objects[3])} title="Return to Earth"><RotateCcw size={15}/></button><button className="tool-button" onClick={()=>{setActiveFilter('Saved');setQuery('');setShowCatalogue(true)}} title="Open saved worlds" aria-label="Open saved worlds"><Bookmark size={15}/></button><button className="tool-button discover-button" onClick={discover} title="Discover a random world" aria-label="Discover a random world"><Shuffle size={15}/></button></div></div>
        <div className="canvas-wrap"><Suspense fallback={<div className="scene-loading">Preparing the starfield…</div>}><Universe items={objects} selected={selected} onSelect={choose} simulationRunning={simulationRunning} simulationSpeed={Number(simulationSpeed)}/></Suspense><div className="canvas-vignette"/><div className="canvas-label top-left"><span className="label-line"/> MILKY WAY · LOCAL VIEW</div><div className="canvas-label bottom-left"><span className="pulse-dot"/> GRAVITY FIELD ACTIVE</div><div className="canvas-hint"><span>DRAG TO ROTATE</span><span>PINCH TO ZOOM</span></div>
          {!focusMode && <div className="object-tooltip"><span className="tooltip-index">SELECTED OBJECT</span><b>{selected.name}</b><small>{formatKind(selected.kind)} · {selected.distance}</small></div>}
        </div>
        <div className="stage-footer"><span>01 <i/> {objects.length} CELESTIAL OBJECTS</span><span>TOUCH FRIENDLY · ADAPTIVE RENDERING</span><span>J2000 · KEPLERIAN ORBITS</span></div>
      </section>
      {showInfo && <aside className="info-panel">
        <div className="panel-top"><span className="eyebrow">CELESTIAL DOSSIER <span className="gold">✳</span></span><div className="panel-actions"><button className={isSaved?'icon-button saved-toggle is-saved':'icon-button saved-toggle'} onClick={toggleSaved} aria-label={isSaved?'Remove from saved worlds':'Save this world'} aria-pressed={isSaved} title={isSaved?'Saved to your collection':'Save this world'}><Bookmark size={16} fill={isSaved?'currentColor':'none'}/></button><button className="icon-button" onClick={()=>setShowInfo(false)} aria-label="Close information"><X size={17}/></button></div></div>
        <div className={`object-art object-art-${selected.id}`} style={{'--planet-color':selected.color} as React.CSSProperties}><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-planet"/><div className="art-glow"/></div>
        <div className="object-title"><span className="object-type">{selected.kind.toUpperCase()} <i/> {selected.id.toUpperCase()}</span><h1>{selected.name}</h1><p>{selected.subtitle}</p></div>
        <div className="stat-grid"><div><span>DISTANCE</span><b>{selected.distance}</b></div><div><span>DIAMETER</span><b>{selected.diameter}</b></div><div className="wide-stat"><span>TEMPERATURE</span><b>{selected.temperature}</b></div></div>
        <div className="world-classification"><span>{selectedProfile.classification}</span><small>{selectedProfile.companions}</small></div>
        <div className="world-profile-grid">
          <div className="profile-tile tile-atmosphere"><span>ATMOSPHERE</span><b>{selectedProfile.atmosphere}</b></div>
          <div className="profile-tile tile-composition"><span>COMPOSITION</span><b>{selectedProfile.composition}</b></div>
          <div className="profile-tile tile-rotation"><span>ROTATION</span><b>{selectedProfile.rotation}</b></div>
          <div className="profile-tile tile-gravity"><span>GRAVITY</span><b>{selectedProfile.gravity}</b></div>
        </div>
        <div className="about-section"><div className="section-row"><span>OVERVIEW</span><Info size={14}/></div><p>{selected.description}</p></div>
        <section className="structure-card">
          <div className="structure-heading"><div><span className="eyebrow">ANATOMY / COMPOSITION</span><b>{selectedProfile.structureTitle}</b></div><Layers3 size={17}/></div>
          <div className="structure-stack" aria-label={selectedProfile.structureTitle}>
            {selectedProfile.structure.map((layer,index)=><div className="structure-layer" key={layer.label}>
              <span className="layer-swatch" style={{background:layer.color}}/>
              <span className="layer-copy"><b>{layer.label}</b><small>{layer.detail}</small></span>
              <span className="layer-index">{String(index+1).padStart(2,'0')}</span>
            </div>)}
          </div>
          <div className="profile-extra"><span>ORBIT / CYCLE</span><b>{selectedProfile.year}</b></div>
          <a className="profile-source" href={selectedProfile.sourceUrl} target="_blank" rel="noreferrer">REFERENCE: {selectedProfile.sourceLabel} ↗</a>
        </section>
        <div className="fact-card"><div className="fact-heading"><Sparkles size={14}/> DID YOU KNOW?</div><p>{selected.fact}</p></div>
        <button className="more-button" onClick={()=>setShowCatalogue(true)}>Explore more objects <ChevronRight size={16}/></button>
        <div className="panel-foot"><span>OBJECT ID: {selected.id.toUpperCase()}</span><span>EDUCATIONAL REFERENCE NOTES</span></div>
      </aside>}
      {!showInfo && <button className="reopen-info" onClick={()=>setShowInfo(true)}><Info size={16}/> Object details</button>}
    </section>
    {showCatalogue && <div className="modal-backdrop" onClick={()=>setShowCatalogue(false)}><section className="catalogue-modal" onClick={e=>e.stopPropagation()}><div className="catalogue-head"><div><span className="eyebrow">THE COSMIC INDEX</span><h2>Find your next <em>destination.</em></h2></div><button className="icon-button" onClick={()=>setShowCatalogue(false)} aria-label="Close catalogue"><X size={18}/></button></div><div className="catalogue-search"><Search size={17}/><input ref={catalogueSearchRef} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search objects, types, descriptions..."/></div><div className="catalogue-filters">{filters.map(f=><button key={f} className={activeFilter===f?'active':''} onClick={()=>setActiveFilter(f)}>{f}</button>)}</div><div className="catalogue-list">{filtered.map((item,i)=><button className="catalogue-item" key={item.id} onClick={()=>choose(item)}><span className="catalogue-number">{String(i+1).padStart(2,'0')}</span><span className="catalogue-orb" style={{'--planet-color':item.color} as React.CSSProperties}/><span className="catalogue-name"><b>{item.name}</b><small>{item.subtitle}</small></span><span className="catalogue-kind">{item.kind}</span><span className="catalogue-distance">{item.distance}</span><ChevronRight size={16}/></button>)}{filtered.length===0&&<p className="empty-state">{activeFilter==='Saved'?'Your collection is empty. Save an object from its dossier and it will appear here.':'No objects found. Try another search.'}</p>}</div><div className="catalogue-foot">{filtered.length} OBJECTS IN VIEW <span>SELECT AN OBJECT TO OPEN ITS DOSSIER</span></div></section></div>}
    <footer className="bottom-bar"><span>© 2026 COSMOS EXPLORER</span><span>MADE FOR THE CURIOUS <i>✳</i></span><a href="https://www.solarsystemscope.com/textures/" target="_blank" rel="noreferrer">SURFACE MAPS: SOLAR SYSTEM SCOPE ↗</a></footer>
  </main>
}