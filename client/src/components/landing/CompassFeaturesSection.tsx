import { useState } from 'react'
import { motion } from 'framer-motion'

export const GRID_FEATURES = [
  {
    id: 'quill',
    direction: 'NW',
    bearing: '315° NORTH-WEST',
    angle: -45,
    coords: 'VEC: [X: -160, Y: -120]',
    title: 'Quill Rich-Text Formatting',
    desc: 'Write bold statements, checklists, code snippets, and ordered lists directly inside sticky notes with intuitive inline controls.',
    badge: 'Rich Editor',
    position: 'Top-Left (NW)',
    surface: 'linear-gradient(165deg, rgba(254,249,195,0.92) 0%, rgba(254,240,138,0.74) 100%)',
    border: 'rgba(250,204,21,0.65)',
    pin: 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)',
    badgeClass: 'bg-amber-100/90 text-amber-800 border-amber-300',
    rotation: '-rotate-[2deg]',
    cursor: { name: 'Alex', color: 'bg-amber-500' },
    glow: 'rgba(245,158,11,0.22)',
  },
  {
    id: 'vectors',
    direction: 'N',
    bearing: '000° NORTH',
    angle: 0,
    coords: 'VEC: [X: 000, Y: -180]',
    title: 'Dynamic Vector Connectors',
    desc: 'Connect note handles effortlessly. Smart orthogonal routes adapt dynamically as you move notes across the board.',
    badge: 'Vector Routing',
    position: 'Top-Center (N)',
    surface: 'linear-gradient(165deg, rgba(224,242,254,0.92) 0%, rgba(186,230,253,0.74) 100%)',
    border: 'rgba(147,197,253,0.7)',
    pin: 'linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)',
    badgeClass: 'bg-blue-100/90 text-blue-800 border-blue-300',
    rotation: 'rotate-[1.4deg]',
    cursor: { name: 'Sarah', color: 'bg-blue-600' },
    glow: 'rgba(37,99,235,0.22)',
  },
  {
    id: 'crdt',
    direction: 'NE',
    bearing: '045° NORTH-EAST',
    angle: 45,
    coords: 'VEC: [X: +160, Y: -120]',
    title: 'Zero-Conflict CRDT Merging',
    desc: 'Powered by Yjs CRDTs. Multiple collaborators can type into the same board simultaneously without overwriting data.',
    badge: 'Y.js CRDT',
    position: 'Top-Right (NE)',
    surface: 'linear-gradient(165deg, rgba(220,252,231,0.92) 0%, rgba(187,247,208,0.74) 100%)',
    border: 'rgba(110,231,183,0.7)',
    pin: 'linear-gradient(180deg, #22c55e 0%, #15803d 100%)',
    badgeClass: 'bg-emerald-100/90 text-emerald-800 border-emerald-300',
    rotation: 'rotate-[2.2deg]',
    cursor: { name: 'Navneet', color: 'bg-emerald-600' },
    glow: 'rgba(34,197,94,0.22)',
  },
  {
    id: 'pdf',
    direction: 'SW',
    bearing: '225° SOUTH-WEST',
    angle: -135,
    coords: 'VEC: [X: -160, Y: +120]',
    title: 'High-DPI PDF Generation',
    desc: 'Export your boards into crystal-clear vector documents preserving pins, gradients, typography, and connector paths.',
    badge: 'Vector Export',
    position: 'Bottom-Left (SW)',
    surface: 'linear-gradient(165deg, rgba(255,228,230,0.92) 0%, rgba(254,205,211,0.74) 100%)',
    border: 'rgba(251,113,133,0.7)',
    pin: 'linear-gradient(180deg, #fb7185 0%, #e11d48 100%)',
    badgeClass: 'bg-rose-100/90 text-rose-800 border-rose-300',
    rotation: 'rotate-[1.8deg]',
    cursor: { name: 'Maya', color: 'bg-rose-500' },
    glow: 'rgba(244,63,94,0.22)',
  },
  {
    id: 'presence',
    direction: 'S',
    bearing: '180° SOUTH',
    angle: 180,
    coords: 'VEC: [X: 000, Y: +180]',
    title: 'Live Room Presence',
    desc: 'Share custom room links, see connected teammate counters, and follow live cursor pointers across the shared space.',
    badge: 'Real-Time',
    position: 'Bottom-Center (S)',
    surface: 'linear-gradient(165deg, rgba(243,232,255,0.92) 0%, rgba(233,213,255,0.74) 100%)',
    border: 'rgba(216,180,254,0.7)',
    pin: 'linear-gradient(180deg, #a855f7 0%, #7e22ce 100%)',
    badgeClass: 'bg-purple-100/90 text-purple-800 border-purple-300',
    rotation: '-rotate-[1.5deg]',
    cursor: { name: 'Leo', color: 'bg-purple-600' },
    glow: 'rgba(168,85,247,0.22)',
  },
  {
    id: 'demo',
    direction: 'SE',
    bearing: '135° SOUTH-EAST',
    angle: 135,
    coords: 'VEC: [X: +160, Y: +120]',
    title: 'Instant 1-Click Demo User',
    desc: 'No passwords, verification emails, or accounts required to test. Click once and immediately enter a live canvas.',
    badge: 'Guest Friendly',
    position: 'Bottom-Right (SE)',
    surface: 'linear-gradient(165deg, rgba(207,250,254,0.92) 0%, rgba(165,243,252,0.74) 100%)',
    border: 'rgba(103,232,249,0.7)',
    pin: 'linear-gradient(180deg, #06b6d4 0%, #0891b2 100%)',
    badgeClass: 'bg-cyan-100/90 text-cyan-800 border-cyan-300',
    rotation: '-rotate-[2.2deg]',
    cursor: { name: 'You (Guest)', color: 'bg-cyan-600' },
    glow: 'rgba(6,182,212,0.22)',
  },
]

export function CompassFeaturesSection() {
  const [activeCompassIndex, setActiveCompassIndex] = useState(0)

  return (
    <section className="relative z-10 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="section-title mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
            Everything you need to map thoughts
          </h2>
        </div>

        {/* Spatial Feature Grid Surrounding Central Compass */}
        <div className="relative mt-12 sm:mt-16 rounded-[2.8rem] border border-white/80 bg-transparent p-6 sm:p-10 lg:p-12 shadow-[0_24px_70px_rgba(15,23,42,0.08),inset_0_2px_4px_rgba(255,255,255,0.95)] overflow-hidden">
          {/* Dot-Grid Canvas Background Texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              backgroundImage: 'radial-gradient(rgba(148, 163, 184, 0.35) 1.2px, transparent 1.2px)',
              backgroundSize: '28px 28px',
            }}
          />

          {/* Ambient Blueprint Glow */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blue-50/40 via-transparent to-slate-100/50" />

          {/* Board Canvas Top Header Strip (Authentic SyncBoard Workspace Header) */}
          <div className="relative z-20 mb-8 sm:mb-12 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/90 pb-4">
            {/* Left: Active Board Info */}
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
              </span>
              <span className="font-mono text-xs font-black uppercase tracking-wider text-slate-800">
                Board: <span className="text-blue-600">Spatial-Engine-Map</span>
              </span>
              <span className="hidden sm:inline-block rounded-full border border-slate-200/80 bg-white px-2.5 py-0.5 text-[10px] font-mono font-bold text-slate-600 shadow-sm">
                6 Pinned Notes
              </span>
            </div>

            {/* Center: Canvas Controls Pill */}
            <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/90 px-3.5 py-1 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-md">
              <span className="flex items-center gap-1 font-bold text-blue-600">
                <span>📌</span> Pinned Nodes
              </span>
              <span className="text-slate-300">•</span>
              <span>🧭 Compass Vector Routing</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-[11px] text-slate-500">100% Zoom</span>
            </div>

            {/* Right: Live Collaborative Presence Badges */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2 overflow-hidden">
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 font-mono text-[9px] font-bold text-white ring-2 ring-white shadow-sm"
                  title="Alex"
                >
                  A
                </div>
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 font-mono text-[9px] font-bold text-white ring-2 ring-white shadow-sm"
                  title="Sarah"
                >
                  S
                </div>
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 font-mono text-[9px] font-bold text-white ring-2 ring-white shadow-sm"
                  title="Navneet"
                >
                  N
                </div>
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-600 font-mono text-[9px] font-bold text-white ring-2 ring-white shadow-sm"
                  title="You"
                >
                  Y
                </div>
              </div>
              <span className="font-mono text-[11px] font-bold text-slate-500">4 Active</span>
            </div>
          </div>

          {/* TOP ROW: 3 Pinned Sticky Notes (NW, N, NE) */}
          <div className="relative z-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {GRID_FEATURES.slice(0, 3).map((feat, sliceIdx) => {
              const index = sliceIdx
              const isActive = activeCompassIndex === index

              return (
                <div
                  key={feat.title}
                  onMouseEnter={() => setActiveCompassIndex(index)}
                  onClick={() => setActiveCompassIndex(index)}
                  className={`group relative flex flex-col justify-between rounded-[28px] border p-6 transition-all duration-300 cursor-pointer select-none ${feat.rotation} hover:rotate-0 hover:scale-[1.03] hover:-translate-y-2 hover:z-30 ${
                    isActive ? 'scale-[1.03] rotate-0 -translate-y-2 z-30' : ''
                  }`}
                  style={{
                    background: feat.surface,
                    borderColor: feat.border,
                    boxShadow: isActive
                      ? `0 24px 60px ${feat.glow}, 0 4px 14px rgba(15,23,42,0.12), inset 0 1px 0 rgba(255,255,255,0.75)`
                      : '0 14px 34px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
                  }}
                >
                  {/* Authentic 3D Pushpin (From SyncBoard NoteNode) */}
                  <div className="pointer-events-none absolute inset-x-0 -top-3.5 z-40 flex justify-center">
                    <div
                      className={`relative h-7 w-7 rounded-full border border-white/80 shadow-[0_8px_18px_rgba(15,23,42,0.32)] transition-transform duration-300 ${
                        isActive ? 'scale-125 -translate-y-0.5' : 'group-hover:scale-115'
                      }`}
                      style={{ background: feat.pin }}
                    >
                      {/* Gloss Highlight */}
                      <div className="absolute inset-[3px] rounded-full bg-white/45 blur-[0.5px]" />
                      {/* Needle Shadow */}
                      <div className="absolute left-1/2 top-[18px] h-5 w-[2px] -translate-x-1/2 rounded-full bg-slate-600/50" />
                      <div className="absolute left-1/2 top-[20px] h-0 w-0 -translate-x-1/2 border-l-[3.5px] border-r-[3.5px] border-t-[8px] border-l-transparent border-r-transparent border-t-slate-600/60" />
                    </div>
                  </div>

                  {/* Multiplayer Live Cursor Tag */}
                  <div
                    className="absolute -top-3 -right-2 z-30 flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-mono font-bold text-white shadow-md transition-transform duration-200 group-hover:scale-110"
                    style={{
                      backgroundColor:
                        feat.cursor.color.replace('bg-', '') === 'blue-600'
                          ? '#2563eb'
                          : feat.cursor.color.replace('bg-', '') === 'amber-500'
                            ? '#f59e0b'
                            : feat.cursor.color.replace('bg-', '') === 'emerald-600'
                              ? '#059669'
                              : '#0284c7',
                    }}
                  >
                    <svg className="h-2.5 w-2.5 fill-current -rotate-45" viewBox="0 0 24 24">
                      <path d="M3 3l7 18 3-7 7-3L3 3z" />
                    </svg>
                    <span>{feat.cursor.name}</span>
                  </div>

                  {/* Note Node Header Bar with Color Swatches */}
                  <div className="relative -mx-6 -mt-6 mb-4 flex items-center justify-between border-b border-white/40 bg-white/30 px-5 py-2.5 rounded-t-[28px] backdrop-blur-sm">
                    <div className="flex items-center gap-1.5 opacity-80">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400 border border-white/60 shadow-xs" />
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-500 border border-white/60 shadow-xs" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 border border-white/60 shadow-xs" />
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-400 border border-white/60 shadow-xs" />
                      <span className="h-2.5 w-2.5 rounded-full bg-purple-500 border border-white/60 shadow-xs" />
                    </div>

                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {feat.bearing}
                    </span>
                  </div>

                  {/* Note Content */}
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold shadow-xs ${feat.badgeClass}`}>
                        {feat.badge}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">Node #{index + 1}</span>
                    </div>

                    <h3 className="mt-3.5 text-lg font-black tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="section-copy mt-2 text-sm leading-relaxed text-slate-700 font-normal">
                      {feat.desc}
                    </p>
                  </div>

                  {/* Bottom Footer & Connector Handle Port */}
                  <div className="mt-5 flex items-center justify-between border-t border-slate-300/50 pt-3">
                    <div className="flex items-center gap-1 text-xs font-bold text-blue-700">
                      <span>Pinned Note</span>
                      <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                    </div>

                    {isActive && (
                      <span className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-ping" />
                        Active Wire
                      </span>
                    )}
                  </div>

                  {/* Connector Handle at Bottom Port (originating wire to compass) */}
                  <div
                    className={`pointer-events-none absolute -bottom-2.5 left-1/2 -translate-x-1/2 h-5 w-5 rounded-full border-2 border-white shadow-md transition-all duration-300 flex items-center justify-center ${
                      isActive
                        ? 'bg-blue-600 ring-4 ring-blue-300 scale-125'
                        : 'bg-slate-400 group-hover:bg-blue-500 group-hover:scale-110'
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  </div>
                </div>
              )
            })}
          </div>

          {/* CENTER HUB: Compass Instrument with Flowing Animated Radial Vector Lines */}
          <div className="relative my-8 sm:my-10 flex flex-col items-center justify-center">
            {/* SVG Vector Connecting Lines radiating from Compass Hub to all 6 surrounding cards */}
            <div className="pointer-events-none absolute inset-0 hidden lg:block overflow-visible">
              <svg className="h-full w-full overflow-visible" viewBox="0 0 1000 200" preserveAspectRatio="none">
                <defs>
                  <filter id="glow-line" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#2563eb" floodOpacity="0.75" />
                  </filter>
                </defs>

                {/* Vector 0: to Top-Left Card (NW) */}
                <path
                  id="wire-0"
                  d="M 167 0 C 167 60, 420 50, 440 60"
                  fill="none"
                  stroke={activeCompassIndex === 0 ? '#2563eb' : '#94a3b8'}
                  strokeWidth={activeCompassIndex === 0 ? '3' : '1.5'}
                  strokeDasharray={activeCompassIndex === 0 ? 'none' : '5 5'}
                  filter={activeCompassIndex === 0 ? 'url(#glow-line)' : undefined}
                  className="transition-all duration-300"
                />
                <circle r="3.5" fill={activeCompassIndex === 0 ? '#2563eb' : '#94a3b8'} filter="url(#glow-line)">
                  <animateMotion
                    dur={activeCompassIndex === 0 ? '1.4s' : '3.2s'}
                    repeatCount="indefinite"
                    path="M 167 0 C 167 60, 420 50, 440 60"
                  />
                </circle>

                {/* Vector 1: to Top-Center Card (N) */}
                <path
                  id="wire-1"
                  d="M 500 0 L 500 20"
                  fill="none"
                  stroke={activeCompassIndex === 1 ? '#2563eb' : '#94a3b8'}
                  strokeWidth={activeCompassIndex === 1 ? '3' : '1.5'}
                  strokeDasharray={activeCompassIndex === 1 ? 'none' : '5 5'}
                  filter={activeCompassIndex === 1 ? 'url(#glow-line)' : undefined}
                  className="transition-all duration-300"
                />
                <circle r="3.5" fill={activeCompassIndex === 1 ? '#2563eb' : '#94a3b8'} filter="url(#glow-line)">
                  <animateMotion
                    dur={activeCompassIndex === 1 ? '1.2s' : '2.8s'}
                    repeatCount="indefinite"
                    path="M 500 0 L 500 20"
                  />
                </circle>

                {/* Vector 2: to Top-Right Card (NE) */}
                <path
                  id="wire-2"
                  d="M 833 0 C 833 60, 580 50, 560 60"
                  fill="none"
                  stroke={activeCompassIndex === 2 ? '#2563eb' : '#94a3b8'}
                  strokeWidth={activeCompassIndex === 2 ? '3' : '1.5'}
                  strokeDasharray={activeCompassIndex === 2 ? 'none' : '5 5'}
                  filter={activeCompassIndex === 2 ? 'url(#glow-line)' : undefined}
                  className="transition-all duration-300"
                />
                <circle r="3.5" fill={activeCompassIndex === 2 ? '#2563eb' : '#94a3b8'} filter="url(#glow-line)">
                  <animateMotion
                    dur={activeCompassIndex === 2 ? '1.4s' : '3.2s'}
                    repeatCount="indefinite"
                    path="M 833 0 C 833 60, 580 50, 560 60"
                  />
                </circle>

                {/* Vector 3: to Bottom-Left Card (SW) */}
                <path
                  id="wire-3"
                  d="M 167 200 C 167 140, 420 150, 440 140"
                  fill="none"
                  stroke={activeCompassIndex === 3 ? '#2563eb' : '#94a3b8'}
                  strokeWidth={activeCompassIndex === 3 ? '3' : '1.5'}
                  strokeDasharray={activeCompassIndex === 3 ? 'none' : '5 5'}
                  filter={activeCompassIndex === 3 ? 'url(#glow-line)' : undefined}
                  className="transition-all duration-300"
                />
                <circle r="3.5" fill={activeCompassIndex === 3 ? '#2563eb' : '#94a3b8'} filter="url(#glow-line)">
                  <animateMotion
                    dur={activeCompassIndex === 3 ? '1.4s' : '3.2s'}
                    repeatCount="indefinite"
                    path="M 167 200 C 167 140, 420 150, 440 140"
                  />
                </circle>

                {/* Vector 4: to Bottom-Center Card (S) */}
                <path
                  id="wire-4"
                  d="M 500 200 L 500 180"
                  fill="none"
                  stroke={activeCompassIndex === 4 ? '#2563eb' : '#94a3b8'}
                  strokeWidth={activeCompassIndex === 4 ? '3' : '1.5'}
                  strokeDasharray={activeCompassIndex === 4 ? 'none' : '5 5'}
                  filter={activeCompassIndex === 4 ? 'url(#glow-line)' : undefined}
                  className="transition-all duration-300"
                />
                <circle r="3.5" fill={activeCompassIndex === 4 ? '#2563eb' : '#94a3b8'} filter="url(#glow-line)">
                  <animateMotion
                    dur={activeCompassIndex === 4 ? '1.2s' : '2.8s'}
                    repeatCount="indefinite"
                    path="M 500 200 L 500 180"
                  />
                </circle>

                {/* Vector 5: to Bottom-Right Card (SE) */}
                <path
                  id="wire-5"
                  d="M 833 200 C 833 140, 580 150, 560 140"
                  fill="none"
                  stroke={activeCompassIndex === 5 ? '#2563eb' : '#94a3b8'}
                  strokeWidth={activeCompassIndex === 5 ? '3' : '1.5'}
                  strokeDasharray={activeCompassIndex === 5 ? 'none' : '5 5'}
                  filter={activeCompassIndex === 5 ? 'url(#glow-line)' : undefined}
                  className="transition-all duration-300"
                />
                <circle r="3.5" fill={activeCompassIndex === 5 ? '#2563eb' : '#94a3b8'} filter="url(#glow-line)">
                  <animateMotion
                    dur={activeCompassIndex === 5 ? '1.4s' : '3.2s'}
                    repeatCount="indefinite"
                    path="M 833 200 C 833 140, 580 150, 560 140"
                  />
                </circle>
              </svg>
            </div>

            {/* Ambient glow behind dial */}
            <div className="pointer-events-none absolute h-52 w-52 rounded-full bg-blue-500/15 blur-3xl animate-pulse" />

            {/* Circular Compass Dial Instrument */}
            <div className="relative z-10 flex h-40 w-40 sm:h-48 sm:w-48 items-center justify-center rounded-full border-2 border-white bg-gradient-to-b from-white via-slate-50 to-blue-50/80 p-3 shadow-[0_20px_50px_rgba(37,99,235,0.18),inset_0_2px_4px_rgba(255,255,255,0.95)] backdrop-blur-2xl">
              {/* Outer & Inner Concentric Calibration Rings */}
              <div className="absolute inset-2 rounded-full border border-slate-200/90" />
              <div className="absolute inset-6 rounded-full border border-dashed border-blue-300/80" />

              {/* Cardinal degree indicators */}
              <span className="absolute top-2.5 text-[9px] font-mono font-bold text-slate-500">0° N</span>
              <span className="absolute right-2.5 text-[9px] font-mono font-bold text-slate-500">90° E</span>
              <span className="absolute bottom-2.5 text-[9px] font-mono font-bold text-slate-500">180° S</span>
              <span className="absolute left-2.5 text-[9px] font-mono font-bold text-slate-500">270° W</span>

              {/* Cardinal Crosshairs */}
              <div className="absolute inset-x-5 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-slate-300/80 to-transparent" />
              <div className="absolute inset-y-5 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-slate-300/80 to-transparent" />

              {/* Animated 3D Magnetic Needle */}
              <motion.div
                className="pointer-events-none absolute z-20 flex h-32 w-5 sm:h-40 items-center justify-center"
                animate={{ rotate: GRID_FEATURES[activeCompassIndex].angle }}
                transition={{ type: 'spring', stiffness: 220, damping: 20, mass: 0.8 }}
              >
                {/* North Pointer (Red) */}
                <div className="absolute top-0 h-16 w-0 border-l-[7px] border-r-[7px] border-b-[64px] border-l-transparent border-r-transparent border-b-rose-500 drop-shadow-[0_2px_8px_rgba(244,63,94,0.45)]" />
                {/* South Pointer (Silver/Slate) */}
                <div className="absolute bottom-0 h-16 w-0 border-l-[7px] border-r-[7px] border-t-[64px] border-l-transparent border-r-transparent border-t-slate-400 drop-shadow-[0_2px_6px_rgba(15,23,42,0.18)]" />
              </motion.div>

              {/* Center Hub */}
              <div className="relative z-30 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-white shadow-lg">
                <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping opacity-75" />
                <div className="absolute h-2.5 w-2.5 rounded-full bg-cyan-400" />
              </div>
            </div>

            {/* Digital Compass HUD */}
            <div className="relative z-10 mt-3 flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/90 bg-white/95 px-3.5 py-1 text-xs font-mono font-bold tracking-wider text-blue-700 shadow-sm backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                <span>{GRID_FEATURES[activeCompassIndex].bearing}</span>
              </div>
              <span className="hidden sm:inline-block font-mono text-[11px] text-slate-500">
                {GRID_FEATURES[activeCompassIndex].coords}
              </span>
            </div>
          </div>

          {/* BOTTOM ROW: 3 Pinned Sticky Notes (SW, S, SE) */}
          <div className="relative z-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {GRID_FEATURES.slice(3, 6).map((feat, sliceIdx) => {
              const index = sliceIdx + 3
              const isActive = activeCompassIndex === index

              return (
                <div
                  key={feat.title}
                  onMouseEnter={() => setActiveCompassIndex(index)}
                  onClick={() => setActiveCompassIndex(index)}
                  className={`group relative flex flex-col justify-between rounded-[28px] border p-6 transition-all duration-300 cursor-pointer select-none ${feat.rotation} hover:rotate-0 hover:scale-[1.03] hover:-translate-y-2 hover:z-30 ${
                    isActive ? 'scale-[1.03] rotate-0 -translate-y-2 z-30' : ''
                  }`}
                  style={{
                    background: feat.surface,
                    borderColor: feat.border,
                    boxShadow: isActive
                      ? `0 24px 60px ${feat.glow}, 0 4px 14px rgba(15,23,42,0.12), inset 0 1px 0 rgba(255,255,255,0.75)`
                      : '0 14px 34px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
                  }}
                >
                  {/* Authentic 3D Pushpin (From SyncBoard NoteNode) */}
                  <div className="pointer-events-none absolute inset-x-0 -top-3.5 z-40 flex justify-center">
                    <div
                      className={`relative h-7 w-7 rounded-full border border-white/80 shadow-[0_8px_18px_rgba(15,23,42,0.32)] transition-transform duration-300 ${
                        isActive ? 'scale-125 -translate-y-0.5' : 'group-hover:scale-115'
                      }`}
                      style={{ background: feat.pin }}
                    >
                      {/* Gloss Highlight */}
                      <div className="absolute inset-[3px] rounded-full bg-white/45 blur-[0.5px]" />
                      {/* Needle Shadow */}
                      <div className="absolute left-1/2 top-[18px] h-5 w-[2px] -translate-x-1/2 rounded-full bg-slate-600/50" />
                      <div className="absolute left-1/2 top-[20px] h-0 w-0 -translate-x-1/2 border-l-[3.5px] border-r-[3.5px] border-t-[8px] border-l-transparent border-r-transparent border-t-slate-600/60" />
                    </div>
                  </div>

                  {/* Multiplayer Live Cursor Tag */}
                  <div
                    className="absolute -top-3 -right-2 z-30 flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-mono font-bold text-white shadow-md transition-transform duration-200 group-hover:scale-110"
                    style={{
                      backgroundColor:
                        feat.cursor.color.replace('bg-', '') === 'rose-500'
                          ? '#e11d48'
                          : feat.cursor.color.replace('bg-', '') === 'purple-600'
                            ? '#9333ea'
                            : '#0891b2',
                    }}
                  >
                    <svg className="h-2.5 w-2.5 fill-current -rotate-45" viewBox="0 0 24 24">
                      <path d="M3 3l7 18 3-7 7-3L3 3z" />
                    </svg>
                    <span>{feat.cursor.name}</span>
                  </div>

                  {/* Connector Handle at Top Port (receiving wire from compass) */}
                  <div
                    className={`pointer-events-none absolute -top-2.5 left-1/2 -translate-x-1/2 h-5 w-5 rounded-full border-2 border-white shadow-md transition-all duration-300 flex items-center justify-center ${
                      isActive
                        ? 'bg-blue-600 ring-4 ring-blue-300 scale-125'
                        : 'bg-slate-400 group-hover:bg-blue-500 group-hover:scale-110'
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  </div>

                  {/* Note Node Header Bar with Color Swatches */}
                  <div className="relative -mx-6 -mt-6 mb-4 flex items-center justify-between border-b border-white/40 bg-white/30 px-5 py-2.5 rounded-t-[28px] backdrop-blur-sm">
                    <div className="flex items-center gap-1.5 opacity-80">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400 border border-white/60 shadow-xs" />
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-500 border border-white/60 shadow-xs" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 border border-white/60 shadow-xs" />
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-400 border border-white/60 shadow-xs" />
                      <span className="h-2.5 w-2.5 rounded-full bg-purple-500 border border-white/60 shadow-xs" />
                    </div>

                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {feat.bearing}
                    </span>
                  </div>

                  {/* Note Content */}
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold shadow-xs ${feat.badgeClass}`}>
                        {feat.badge}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">Node #{index + 1}</span>
                    </div>

                    <h3 className="mt-3.5 text-lg font-black tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="section-copy mt-2 text-sm leading-relaxed text-slate-700 font-normal">
                      {feat.desc}
                    </p>
                  </div>

                  {/* Bottom Footer */}
                  <div className="mt-5 flex items-center justify-between border-t border-slate-300/50 pt-3">
                    <div className="flex items-center gap-1 text-xs font-bold text-blue-700">
                      <span>Pinned Note</span>
                      <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                    </div>

                    {isActive && (
                      <span className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-ping" />
                        Active Wire
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
