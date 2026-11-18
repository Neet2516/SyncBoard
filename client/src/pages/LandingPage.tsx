import { useEffect, useId, useState, type CSSProperties, type MouseEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import Lenis from 'lenis'

import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Loader from '../components/Loader'
import { DirectionAwareFooter } from '../components/DirectionAwareFooter'

type HeroNoteColor = 'yellow' | 'pink' | 'cyan' | 'blue' | 'green'

type HeroNote = {
  id: string
  color: HeroNoteColor
  title: string
  body: string
  style: {
    top?: string
    bottom?: string
    left?: string
    right?: string
    rotate: number
    delay: number
  }
}

type EphemeralEffect = {
  id: string
  x: number
  y: number
  color: HeroNoteColor
  rotate: number
}

const NOTE_THEMES: Record<
  HeroNoteColor,
  {
    surface: string
    border: string
    header: string
    pin: string
    title: string
    text: string
  }
> = {
  yellow: {
    surface: 'linear-gradient(165deg, rgba(254,249,195,0.85) 0%, rgba(254,240,138,0.68) 100%)',
    border: 'rgba(250,204,21,0.55)',
    header: 'linear-gradient(180deg, rgba(254,240,138,0.55), rgba(254,249,195,0.2))',
    pin: 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)',
    title: '#713f12',
    text: '#854d0e',
  },
  pink: {
    surface: 'linear-gradient(165deg, rgba(252,231,243,0.85) 0%, rgba(249,168,212,0.64) 100%)',
    border: 'rgba(244,114,182,0.48)',
    header: 'linear-gradient(180deg, rgba(249,168,212,0.5), rgba(252,231,243,0.18))',
    pin: 'linear-gradient(180deg, #fb7185 0%, #e11d48 100%)',
    title: '#831843',
    text: '#9d174d',
  },
  cyan: {
    surface: 'linear-gradient(165deg, rgba(207,250,254,0.85) 0%, rgba(103,232,249,0.6) 100%)',
    border: 'rgba(56,189,248,0.48)',
    header: 'linear-gradient(180deg, rgba(165,243,252,0.52), rgba(207,250,254,0.2))',
    pin: 'linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%)',
    title: '#0c4a6e',
    text: '#0369a1',
  },
  blue: {
    surface: 'linear-gradient(165deg, rgba(226,240,255,0.85) 0%, rgba(191,219,254,0.68) 100%)',
    border: 'rgba(147,197,253,0.58)',
    header: 'linear-gradient(180deg, rgba(191,219,254,0.55), rgba(219,234,254,0.2))',
    pin: 'linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)',
    title: '#1e3a8a',
    text: '#1d4ed8',
  },
  green: {
    surface: 'linear-gradient(165deg, rgba(220,252,231,0.85) 0%, rgba(187,247,208,0.68) 100%)',
    border: 'rgba(110,231,183,0.55)',
    header: 'linear-gradient(180deg, rgba(187,247,208,0.52), rgba(220,252,231,0.2))',
    pin: 'linear-gradient(180deg, #22c55e 0%, #15803d 100%)',
    title: '#14532d',
    text: '#166534',
  },
}

const HERO_NOTES: HeroNote[] = [
  {
    id: 'note-1',
    color: 'yellow',
    title: 'Sprint notes',
    body: 'Map ideas, drop notes, connect the dots.',
    style: { top: '18%', left: '7%', rotate: -7, delay: 0.1 },
  },
  {
    id: 'note-2',
    color: 'pink',
    title: 'Live cursors',
    body: 'Everyone shows up on the same shared space.',
    style: { top: '20%', right: '10%', rotate: 8, delay: 0.2 },
  },
  {
    id: 'note-3',
    color: 'cyan',
    title: 'Sticky flow',
    body: 'Capture thoughts before they disappear.',
    style: { bottom: '24%', left: '12%', rotate: 6, delay: 0.3 },
  },
  {
    id: 'note-4',
    color: 'green',
    title: 'Board rhythm',
    body: 'Sketch, arrange, and refine in real time.',
    style: { bottom: '24%', right: '11%', rotate: -5, delay: 0.4 },
  },
]

const EFFECT_COLORS: HeroNoteColor[] = ['yellow', 'pink', 'cyan', 'green']

const WORKFLOW_STEPS = [
  {
    step: '01',
    kicker: 'Free-form Ideation',
    title: 'Pin, color-code, and organize without boundaries',
    desc: 'Break out of linear docs. Drop sticky notes anywhere on an infinite zoomable canvas, choose from 5 vibrant paper themes, and format thoughts with Quill rich text.',
    accent: 'border-amber-300 text-amber-700 bg-amber-500/10',
    tag: '5 Color Themes • Quill Rich Text',
  },
  {
    step: '02',
    kicker: 'Multiplayer Engine',
    title: 'See teammates move and edit in sub-millisecond sync',
    desc: 'Collaborate live with zero conflict locks. Yjs CRDTs and WebSockets synchronize every stroke, cursor motion, and text modification instantly across peers.',
    accent: 'border-blue-300 text-blue-700 bg-blue-500/10',
    tag: 'Live Cursors • Conflict-Free CRDTs',
  },
  {
    step: '03',
    kicker: 'Connect & Export',
    title: 'Draw smart vector connectors and export high-DPI PDFs',
    desc: 'Link cards to build flowcharts and idea maps. When your brainstorm is complete, generate publication-ready high-DPI PDFs with pristine vector lines in one click.',
    accent: 'border-emerald-300 text-emerald-700 bg-emerald-500/10',
    tag: 'Smart Orthogonal Lines • 1-Click PDF',
  },
]

type BookColorKey = 'amber' | 'blue' | 'emerald' | 'purple' | 'rose'

interface BookPalette {
  name: string
  dotClass: string
  coverBg: string
  coverBorder: string
  insideCoverBg: string
  spine: string
  ribbon: string
  glow: string
  tagBg: string
  numColor: string
  badge: string
  insideWash: string
  shimmer: string
}

const BOOK_COLOR_PALETTES: Record<BookColorKey, BookPalette> = {
  amber: {
    name: 'Amber Gold',
    dotClass: 'bg-amber-500 hover:ring-amber-300',
    coverBg: 'bg-[#fef3c7]',
    coverBorder: 'border-amber-300',
    insideCoverBg: 'bg-[#fffbeb]',
    spine: 'bg-gradient-to-r from-amber-600 via-amber-400 to-amber-200 border-r border-amber-400',
    ribbon: 'bg-amber-500 shadow-amber-500/40',
    glow: 'hover:shadow-[0_24px_55px_rgba(245,158,11,0.26)]',
    tagBg: 'bg-amber-100 border-amber-300 text-amber-800',
    numColor: 'text-amber-700',
    badge: 'border-amber-400 text-amber-800 bg-amber-100',
    insideWash: 'rgba(245, 158, 11, 0.08)',
    shimmer: 'rgba(251, 191, 36, 0.18)',
  },
  blue: {
    name: 'Sapphire Blue',
    dotClass: 'bg-blue-600 hover:ring-blue-300',
    coverBg: 'bg-[#dbeafe]',
    coverBorder: 'border-blue-300',
    insideCoverBg: 'bg-[#eff6ff]',
    spine: 'bg-gradient-to-r from-blue-600 via-blue-400 to-blue-200 border-r border-blue-400',
    ribbon: 'bg-blue-600 shadow-blue-600/40',
    glow: 'hover:shadow-[0_24px_55px_rgba(37,99,235,0.26)]',
    tagBg: 'bg-blue-100 border-blue-300 text-blue-800',
    numColor: 'text-blue-700',
    badge: 'border-blue-400 text-blue-800 bg-blue-100',
    insideWash: 'rgba(37, 99, 235, 0.08)',
    shimmer: 'rgba(59, 130, 246, 0.18)',
  },
  emerald: {
    name: 'Emerald Jade',
    dotClass: 'bg-emerald-500 hover:ring-emerald-300',
    coverBg: 'bg-[#d1fae5]',
    coverBorder: 'border-emerald-300',
    insideCoverBg: 'bg-[#ecfdf5]',
    spine: 'bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-200 border-r border-emerald-400',
    ribbon: 'bg-emerald-500 shadow-emerald-500/40',
    glow: 'hover:shadow-[0_24px_55px_rgba(16,185,129,0.26)]',
    tagBg: 'bg-emerald-100 border-emerald-300 text-emerald-800',
    numColor: 'text-emerald-700',
    badge: 'border-emerald-400 text-emerald-800 bg-emerald-100',
    insideWash: 'rgba(16, 185, 129, 0.08)',
    shimmer: 'rgba(16, 185, 129, 0.18)',
  },
  purple: {
    name: 'Amethyst Purple',
    dotClass: 'bg-purple-600 hover:ring-purple-300',
    coverBg: 'bg-[#f3e8ff]',
    coverBorder: 'border-purple-300',
    insideCoverBg: 'bg-[#faf5ff]',
    spine: 'bg-gradient-to-r from-purple-600 via-purple-400 to-purple-200 border-r border-purple-400',
    ribbon: 'bg-purple-600 shadow-purple-600/40',
    glow: 'hover:shadow-[0_24px_55px_rgba(147,51,234,0.26)]',
    tagBg: 'bg-purple-100 border-purple-300 text-purple-800',
    numColor: 'text-purple-700',
    badge: 'border-purple-400 text-purple-800 bg-purple-100',
    insideWash: 'rgba(147, 51, 234, 0.08)',
    shimmer: 'rgba(147, 51, 234, 0.18)',
  },
  rose: {
    name: 'Ruby Rose',
    dotClass: 'bg-rose-500 hover:ring-rose-300',
    coverBg: 'bg-[#ffe4e6]',
    coverBorder: 'border-rose-300',
    insideCoverBg: 'bg-[#fff1f2]',
    spine: 'bg-gradient-to-r from-rose-600 via-rose-400 to-rose-200 border-r border-rose-400',
    ribbon: 'bg-rose-500 shadow-rose-500/40',
    glow: 'hover:shadow-[0_24px_55px_rgba(244,63,94,0.26)]',
    tagBg: 'bg-rose-100 border-rose-300 text-rose-800',
    numColor: 'text-rose-700',
    badge: 'border-rose-400 text-rose-800 bg-rose-100',
    insideWash: 'rgba(244, 63, 94, 0.08)',
    shimmer: 'rgba(244, 63, 94, 0.18)',
  },
}

const GRID_FEATURES = [
  {
    id: 'quill',
    direction: 'NW',
    bearing: '315° NORTH-WEST',
    angle: -45,
    coords: 'VEC: [X: -160, Y: -120]',
    title: 'Quill Rich-Text Formatting',
    desc: 'Write bold statements, checklists, code snippets, and ordered lists directly inside sticky notes with intuitive inline controls.',
    badge: 'Rich Editor',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    position: 'Top-Left (NW)',
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
    color: 'bg-amber-50 border-amber-200 text-amber-700',
    position: 'Top-Center (N)',
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
    color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    position: 'Top-Right (NE)',
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
    color: 'bg-rose-50 border-rose-200 text-rose-700',
    position: 'Bottom-Left (SW)',
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
    color: 'bg-purple-50 border-purple-200 text-purple-700',
    position: 'Bottom-Center (S)',
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
    color: 'bg-cyan-50 border-cyan-200 text-cyan-700',
    position: 'Bottom-Right (SE)',
  },
]

const TECH_STACK = [
  {
    name: 'ReactFlow & GSAP',
    category: 'Canvas Engine & Motion',
    desc: 'Hardware-accelerated infinite panning, smooth zooming, physics-based note pins, and fluid transitions.',
  },
  {
    name: 'Y.js & WebSockets',
    category: 'CRDT Sync Engine',
    desc: 'Sub-millisecond state convergence ensuring deterministic multi-user editing without central locks.',
  },
  {
    name: 'Redis Pub/Sub',
    category: 'Real-Time Messaging',
    desc: 'High-throughput cluster communication and fast room presence dispatching for distributed instances.',
  },
  {
    name: 'MongoDB & Docker',
    category: 'Persistence & Cloud',
    desc: 'Containerized micro-services with automatic board state recovery and persistent user documents.',
  },
]

const FAQS = [
  {
    q: 'Why should I use the Demo User instead of creating an account?',
    a: 'We built the Demo User for speed and convenience! You do not need to fill out sign-up forms, verify emails, or remember passwords just to test SyncBoard or brainstorm for a quick session. One click gives you full access to create notes, connect them, and export boards.',
    tag: 'Instant Access',
  },
  {
    q: 'Why choose a spatial canvas over standard linear documents?',
    a: 'Linear docs force your thoughts into a strict top-to-bottom hierarchy. A spatial canvas mirrors how human minds naturally organize thoughts—allowing you to cluster related topics, draw arrows between ideas, and see the full map of your project at a single glance.',
    tag: 'Spatial Canvas',
  },
  {
    q: 'How does real-time synchronization work without conflicts?',
    a: 'SyncBoard is powered by Yjs Conflict-Free Replicated Data Types (CRDTs) over WebSockets. Rather than locking notes or relying on last-write-wins collisions, changes are deterministically merged in real time, so every collaborator sees consistent state immediately.',
    tag: 'CRDT Sync',
  },
  {
    q: 'Can I export my board to share with non-SyncBoard users?',
    a: 'Yes! SyncBoard features a custom high-DPI PDF export engine that rasterizes your canvas with full fidelity—preserving note pins, gradient surfaces, rich text styling, and vector connection paths without clipping or blurry artifacts.',
    tag: 'High-DPI PDF',
  },
  {
    q: 'Can I invite other teammates to the same board?',
    a: 'Yes! Every board has a unique Room ID. Simply copy your room link or code and share it with your teammates. They can sign in or jump in as a Demo User and collaborate with you on the same screen instantly.',
    tag: 'Team Presence',
  },
]

/**
 * LandingPage Component
 *
 * The public-facing entry point of SyncBoard with landing page animation
 */
export function LandingPage() {
  const navigate = useNavigate()
  const { user, loginAsDemo, isAuthenticated, isLoading } = useAuth()
  const { showToast } = useToast()
  const [effects, setEffects] = useState<EphemeralEffect[]>([])
  const [cursorVisible, setCursorVisible] = useState(false)
  const [parallax, setParallax] = useState({ x: 0, y: 0 })
  const [demoLoading, setDemoLoading] = useState(false)
  const [demoError, setDemoError] = useState<string | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [openWorkflowCard, setOpenWorkflowCard] = useState<string | null>(null)
  const [bookColors, setBookColors] = useState<Record<string, BookColorKey>>({
    '01': 'amber',
    '02': 'blue',
    '03': 'emerald',
  })
  const [activeCompassIndex, setActiveCompassIndex] = useState(0)
  const cursorX = useMotionValue(-80)
  const cursorY = useMotionValue(-80)
  const springX = useSpring(cursorX, { stiffness: 520, damping: 42, mass: 0.24 })
  const springY = useSpring(cursorY, { stiffness: 520, damping: 42, mass: 0.24 })
  const idBase = useId()

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      touchMultiplier: 1,
    })

    let frame = 0

    const raf = (time: number) => {
      lenis.raf(time)
      frame = window.requestAnimationFrame(raf)
    }

    frame = window.requestAnimationFrame(raf)

    return () => {
      window.cancelAnimationFrame(frame)
      lenis.destroy()
    }
  }, [])

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      cursorX.set(event.clientX + 6)
      cursorY.set(event.clientY + 4)
      setCursorVisible(true)

      const { innerWidth, innerHeight } = window
      const offsetX = ((event.clientX / innerWidth) - 0.5) * 26
      const offsetY = ((event.clientY / innerHeight) - 0.5) * 24

      setParallax({ x: offsetX, y: offsetY })
    }

    const handlePointerLeave = () => {
      setCursorVisible(false)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerleave', handlePointerLeave)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerleave', handlePointerLeave)
    }
  }, [cursorX, cursorY])

  if (isLoading) {
    return <Loader />
  }

  const handleDemoLogin = async () => {
    setDemoLoading(true)
    setDemoError(null)
    try {
      await loginAsDemo()
      navigate('/boards', { replace: true })
    } catch (err) {
      console.error('[Demo Login] Error:', err)
      setDemoError(err instanceof Error ? err.message : 'Unable to sign in as demo user.')
    } finally {
      setDemoLoading(false)
    }
  }

  const spawnEffect = (clientX: number, clientY: number) => {
    const effectId = `${idBase}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const effect: EphemeralEffect = {
      id: effectId,
      x: clientX,
      y: clientY,
      color: EFFECT_COLORS[Math.floor(Math.random() * EFFECT_COLORS.length)],
      rotate: -10 + Math.random() * 20,
    }

    setEffects((current) => [...current, effect])

    window.setTimeout(() => {
      setEffects((current) => current.filter((entry) => entry.id !== effectId))
    }, 820)
  }

  const handleCanvasClick = (event: MouseEvent<HTMLElement>) => {
    if (!(event.target instanceof HTMLElement)) return

    const interactiveTarget = event.target.closest('a, button, input, textarea, select')
    if (interactiveTarget) return

    spawnEffect(event.clientX, event.clientY)
  }

  return (
    <div
      className="landing-shell relative min-h-screen overflow-hidden bg-transparent text-slate-950"
      onClick={handleCanvasClick}
      style={
        {
          '--grid-shift-x': `${parallax.x}px`,
          '--grid-shift-y': `${parallax.y}px`,
        } as CSSProperties
      }
    >
      <div className="landing-canvas fixed inset-0" aria-hidden="true">
        <div className="landing-canvas__wash" />
        <div className="landing-canvas__grid" />
        <div className="landing-canvas__glow" />
      </div>

      <AnimatePresence>
        {cursorVisible && (
          <motion.div
            className="landing-cursor pointer-events-none fixed left-0 top-0 z-[80]"
            style={{ x: springX, y: springY }}
            initial={{ opacity: 0, scale: 0.86 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.16 }}
          >
            <div className="landing-cursor__stack">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M6.1 13.2H5.9L5.75 13.34L1.2 17.55V2.2L12.28 13.2H6.1Z"
                  fill="#2563eb"
                  stroke="white"
                  strokeWidth="1.3"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="landing-cursor__badge">You</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {effects.map((effect) => (
          <motion.div key={effect.id} className="pointer-events-none fixed inset-0 z-[70]">
            <motion.span
              className="landing-ripple"
              style={{ left: effect.x, top: effect.y }}
              initial={{ opacity: 0.38, scale: 0.2 }}
              animate={{ opacity: 0, scale: 3.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />
            <motion.div
              className={`ghost-note ghost-note--${effect.color}`}
              style={{ left: effect.x + 20, top: effect.y - 18, rotate: `${effect.rotate}deg` }}
              initial={{ opacity: 0, scale: 0.8, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.08, y: -10 }}
              transition={{ duration: 0.42, ease: 'easeOut' }}
            >
              <div
                className="sticky-note__pin"
                style={{ background: NOTE_THEMES[effect.color]?.pin }}
              />
              <div className="ghost-note__inner" />
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>

      <nav className="relative z-20 border-b border-white/50 bg-white/42 backdrop-blur-xl">
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => {
              showToast('Welcome to SyncBoard! You are on the landing page 🚀', 'info')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="group flex min-w-0 items-center space-x-3 text-left transition hover:opacity-90 focus:outline-none"
            title="SyncBoard Home"
          >
            <img src="/favicon.svg" alt="SyncBoard Logo" className="h-8 w-8 transition-transform duration-200 group-hover:scale-110 sm:h-9 sm:w-9" />
            <span className="brand-mark text-xl text-blue-600 transition-colors group-hover:text-blue-700 sm:text-3xl">SyncBoard</span>
          </button>

          {isAuthenticated ? (
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              {user && (
                <span className="hidden sm:inline-block rounded-full border border-slate-200/80 bg-white/70 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-md">
                  {user.name}
                </span>
              )}
              <Link
                to="/boards"
                className="rounded-full bg-blue-600 px-4 py-2 text-xs sm:text-sm font-semibold tracking-wide text-white shadow-[0_14px_28px_rgba(37,99,235,0.28)] transition hover:-translate-y-0.5 hover:bg-blue-700 sm:px-5"
              >
                Go to Boards &rarr;
              </Link>
            </div>
          ) : (
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={demoLoading}
                className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/90 bg-blue-50/80 px-3.5 py-2 text-xs sm:text-sm font-semibold tracking-wide text-blue-700 backdrop-blur-md transition hover:bg-blue-100 hover:-translate-y-0.5 active:translate-y-0"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600"></span>
                </span>
                {demoLoading ? 'Starting...' : 'Try Demo User'}
              </button>
              <Link
                to="/login"
                className="rounded-full px-3 py-2 text-xs sm:text-sm font-semibold tracking-wide text-slate-600 transition-colors hover:text-blue-600 sm:px-4"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-blue-600 px-4 py-2 text-xs sm:text-sm font-semibold tracking-wide text-white shadow-[0_14px_28px_rgba(37,99,235,0.28)] transition hover:-translate-y-0.5 hover:bg-blue-700 sm:px-5"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </nav>

      <main className="relative z-10">
        <section className="relative isolate overflow-hidden">
          <div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-7xl items-center justify-center px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
            <div className="absolute inset-0 hidden md:block">
              {HERO_NOTES.map((note) => {
                const theme = NOTE_THEMES[note.color]
                return (
                  <motion.article
                    key={note.id}
                    className="hero-notenode absolute select-none"
                    style={{
                      ...note.style,
                      width: 'min(240px, 24vw)',
                      minWidth: '190px',
                    }}
                    initial={{ opacity: 0, y: 24, rotate: note.style.rotate - 3, scale: 0.94 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      rotate: note.style.rotate,
                      scale: 1,
                    }}
                    transition={{ duration: 0.65, delay: note.style.delay, ease: 'easeOut' }}
                    whileHover={{ y: -10, rotate: note.style.rotate + (note.style.rotate > 0 ? 1.8 : -1.8) }}
                  >
                    {/* Pushpin matching NoteNode */}
                    <div className="pointer-events-none absolute inset-x-0 -top-3.5 z-30 flex justify-center">
                      <div
                        className="relative h-7 w-7 rounded-full border border-white/80 shadow-[0_8px_18px_rgba(15,23,42,0.25)]"
                        style={{ background: theme.pin }}
                      >
                        <div className="absolute inset-[3.5px] rounded-full bg-white/45 blur-[0.5px]" />
                        <div className="absolute left-1/2 top-[18px] h-5 w-[2px] -translate-x-1/2 rounded-full bg-slate-500/60" />
                        <div className="absolute left-1/2 top-[22px] h-0 w-0 -translate-x-1/2 border-l-[3.5px] border-r-[3.5px] border-t-[8px] border-l-transparent border-r-transparent border-t-slate-500/65" />
                      </div>
                    </div>

                    {/* Card container matching NoteNode */}
                    <div
                      className="relative flex flex-col overflow-hidden rounded-[26px] border shadow-[0_24px_50px_rgba(15,23,42,0.11)] backdrop-blur-xl"
                      style={{
                        background: theme.surface,
                        borderColor: theme.border,
                        boxShadow: `0 24px 50px rgba(15,23,42,0.11), inset 0 1px 0 rgba(255,255,255,0.7)`,
                      }}
                    >
                      {/* Header bar with color dots and grip handle */}
                      <div
                        className="relative z-10 flex h-9 shrink-0 items-center justify-between px-3.5"
                        style={{
                          background: theme.header,
                          borderBottom: `1px solid ${theme.border}`,
                        }}
                      >
                        <div className="flex items-center gap-1.5 opacity-65">
                          <span className="h-2 w-2 rounded-full border border-white/60 bg-amber-400/80" />
                          <span className="h-2 w-2 rounded-full border border-white/60 bg-rose-400/80" />
                          <span className="h-2 w-2 rounded-full border border-white/60 bg-blue-400/80" />
                        </div>
                        <div className="flex items-center rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold text-slate-500/80 backdrop-blur-sm">
                          :::
                        </div>
                      </div>

                      {/* Note content */}
                      <div className="relative z-10 p-4 pt-3">
                        <h3
                          className="font-extrabold tracking-tight text-sm sm:text-[15px]"
                          style={{ color: theme.title }}
                        >
                          {note.title}
                        </h3>
                        <p
                          className="mt-1 font-serif text-xs sm:text-[13px] leading-relaxed"
                          style={{ color: theme.text }}
                        >
                          {note.body}
                        </p>
                      </div>
                    </div>

                    {/* 4 side connector handles matching NoteNode */}
                    <div className="pointer-events-none absolute -top-1 left-[30%] h-2.5 w-2.5 -translate-x-1/2 rounded-full border border-white/90 bg-slate-600/70 shadow-sm" />
                    <div className="pointer-events-none absolute -bottom-1 left-[70%] h-2.5 w-2.5 -translate-x-1/2 rounded-full border border-white/90 bg-slate-600/70 shadow-sm" />
                    <div className="pointer-events-none absolute -left-1 top-[70%] h-2.5 w-2.5 -translate-y-1/2 rounded-full border border-white/90 bg-slate-600/70 shadow-sm" />
                    <div className="pointer-events-none absolute -right-1 top-[30%] h-2.5 w-2.5 -translate-y-1/2 rounded-full border border-white/90 bg-slate-600/70 shadow-sm" />
                  </motion.article>
                )
              })}
            </div>

            <div className="relative z-10 mx-auto max-w-3xl text-center md:max-w-4xl">
              

              <motion.h1
                className="hero-display landing-headline mx-auto max-w-4xl text-[2.9rem] sm:text-5xl md:text-6xl lg:text-[5.35rem]"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.62, ease: 'easeOut', delay: 0.08 }}
              >
                <span className="marker-highlight">Collaborate in Real-Time</span>
              </motion.h1>

              <motion.p
                className="section-copy mx-auto mt-5 max-w-[32rem] px-2 text-[1.02rem] leading-8 sm:mt-7 sm:px-1 sm:text-lg sm:leading-8 md:text-[1.32rem]"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.58, ease: 'easeOut', delay: 0.14 }}
              >
                SyncBoard feels like one living workspace. Pin thoughts, move fast, and watch the same board
                evolve together without losing the texture of a real collaborative wall.
              </motion.p>

              <motion.div
                className="mt-9 flex flex-col items-stretch justify-center gap-4 md:mt-10 md:flex-row md:items-center"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: 'easeOut', delay: 0.22 }}
              >
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/boards"
                      className="inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-full bg-blue-600 px-8 py-4 text-base font-semibold tracking-wide text-white shadow-[0_24px_45px_rgba(37,99,235,0.34)] transition hover:-translate-y-1 hover:bg-blue-700 active:translate-y-0 md:min-w-[240px] md:w-auto"
                    >
                      Go to Your Boards &rarr;
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        showToast('Exploring SyncBoard canvas features ✨', 'info')
                        window.scrollBy({ top: 650, behavior: 'smooth' })
                      }}
                      className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-slate-200/80 bg-white/68 px-8 py-4 text-base font-semibold tracking-wide text-slate-700 shadow-[0_16px_32px_rgba(15,23,42,0.09)] backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/84 md:min-w-[210px] md:w-auto"
                    >
                      Explore Features &darr;
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleDemoLogin}
                      disabled={demoLoading}
                      className="inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-full bg-blue-600 px-8 py-4 text-base font-semibold tracking-wide text-white shadow-[0_24px_45px_rgba(37,99,235,0.34)] transition hover:-translate-y-1 hover:bg-blue-700 active:translate-y-0 md:min-w-[240px] md:w-auto"
                    >
                      <svg className="h-5 w-5 text-amber-300" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                      {demoLoading ? 'Starting Instant Demo...' : 'Instant Demo User (1-Click)'}
                    </button>
                    <Link
                      to="/register"
                      className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-slate-200/80 bg-white/68 px-8 py-4 text-base font-semibold tracking-wide text-slate-700 shadow-[0_16px_32px_rgba(15,23,42,0.09)] backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/84 md:min-w-[210px] md:w-auto"
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </motion.div>

              {demoError && (
                <div className="mx-auto mt-4 max-w-md rounded-xl border border-red-200 bg-red-50 p-2 text-sm font-medium text-red-600">
                  {demoError}
                </div>
              )}

            </div>
          </div>
        </section>

        {/* SECTION 1: OVERVIEW PILLARS */}
        <section className="relative z-10 pb-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="paper-card rounded-[2rem] p-8">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="panel-title mb-3 text-xl text-gray-900">Instant Sync</h3>
                <p className="section-copy text-base">
                  Powered by Y.js, experience sub-millisecond synchronization across all connected clients.
                </p>
              </div>

              <div className="paper-card rounded-[2rem] p-8">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100">
                  <svg className="h-6 w-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="panel-title mb-3 text-xl text-gray-900">Team Presence</h3>
                <p className="section-copy text-base">
                  See who&apos;s working with real-time cursors and status indicators for every collaborator.
                </p>
              </div>

              <div className="paper-card rounded-[2rem] p-8">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                  <svg className="h-6 w-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="panel-title mb-3 text-xl text-gray-900">Persistent Notes</h3>
                <p className="section-copy text-base">
                  Your ideas stay safe. Every stroke and note is carried forward with durable persistence.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: HOW SYNCBOARD WORKS (3-STEP WORKFLOW) */}
        <section className="relative z-10 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="brand-kicker">Workflow Architecture</p>
              <h2 className="section-title mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
                How SyncBoard Works
              </h2>
              <p className="section-copy mt-4 text-base sm:text-lg">
                From an empty canvas to an interconnected knowledge board in three simple steps.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-3">
              {WORKFLOW_STEPS.map((step) => {
                const isOpen = openWorkflowCard === step.step
                const colorKey: BookColorKey =
                  bookColors[step.step] ||
                  (step.step === '01' ? 'amber' : step.step === '02' ? 'blue' : 'emerald')
                const palette = BOOK_COLOR_PALETTES[colorKey]

                return (
                  <div
                    key={step.step}
                    onClick={() => setOpenWorkflowCard(isOpen ? null : step.step)}
                    className={`group relative h-full min-h-[350px] sm:min-h-[380px] rounded-[2rem] [perspective:2000px] [transform-style:preserve-3d] transition-all duration-500 hover:z-30 cursor-pointer ${palette.glow}`}
                  >
                    {/* Hanging Silk Ribbon Bookmark */}
                    <div
                      className={`absolute -top-1.5 left-8 z-30 w-4 h-9 ${palette.ribbon} shadow-md transition-all duration-500 group-hover:h-11 pointer-events-none`}
                      style={{
                        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 80%, 0% 100%)',
                      }}
                      title="Bookmark ribbon"
                    />

                    {/* Inside Book Page (Revealed when cover rotates open, 100% clear with zero cover overlap) */}
                    <div
                      className="paper-card relative flex h-full flex-col justify-between rounded-[2rem] bg-white pl-10 pr-8 py-8 shadow-[0_12px_32px_rgba(15,23,42,0.06)] border border-slate-200/80 [transform-style:preserve-3d] transition-all duration-500 overflow-hidden"
                      style={{
                        backgroundColor: '#ffffff',
                        backgroundImage: `radial-gradient(circle at top right, ${palette.insideWash}, transparent 70%)`,
                      }}
                    >
                      {/* Realistic Stacked Paper Leaf Texture (Right edge) */}
                      <div className="absolute right-0 top-5 bottom-5 w-1.5 flex flex-col justify-between py-1 opacity-70 pointer-events-none">
                        <div className="w-full h-full border-r-2 border-slate-300/80 rounded-r-sm" />
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <span className={`font-mono text-3xl font-black ${palette.numColor} transition-colors duration-500`}>
                            {step.step}
                          </span>
                          <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${palette.badge} transition-colors duration-500`}>
                            {step.kicker}
                          </span>
                        </div>

                        <h3 className="mt-6 text-xl font-bold tracking-tight text-slate-900">
                          {step.title}
                        </h3>
                        <p className="section-copy mt-3 text-sm leading-relaxed sm:text-base text-slate-600">
                          {step.desc}
                        </p>
                      </div>

                      <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          {step.tag}
                        </span>
                        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${palette.tagBg} transition-colors duration-500`}>
                          {palette.name}
                        </span>
                      </div>
                    </div>

                    {/* 3D Double-Sided Book Cover Wrapper (Swings open to -120deg to completely clear the book's text) */}
                    <div
                      className={`absolute inset-0 z-20 origin-left transition-all duration-500 ease-out [transform-style:preserve-3d] group-hover:[transform:rotateY(-120deg)] group-hover:shadow-[-14px_22px_42px_rgba(15,23,42,0.20)] ${
                        isOpen ? '[transform:rotateY(-120deg)] shadow-[-14px_22px_42px_rgba(15,23,42,0.20)]' : ''
                      }`}
                    >
                      {/* FRONT COVER (100% Solid, Zero Transparency, [backface-visibility:hidden]) */}
                      <div
                        className={`absolute inset-0 flex flex-col justify-between rounded-[2rem] border ${palette.coverBorder} ${palette.coverBg} p-8 shadow-[1px_1px_16px_rgba(15,23,42,0.08)] cursor-pointer [backface-visibility:hidden]`}
                      >
                        {/* Left book spine crease & hinge */}
                        <div className={`absolute left-0 top-0 bottom-0 w-4 rounded-l-[2rem] ${palette.spine} transition-colors duration-500`} />

                        {/* Top Bar: Volume Label & Interactive Color Swatches */}
                        <div className="flex items-center justify-between relative z-10 pl-2">
                          <span className={`font-mono text-xs font-black uppercase tracking-widest ${palette.numColor} transition-colors duration-500`}>
                            Vol. {step.step}
                          </span>

                          {/* Interactive Color Dots */}
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 rounded-full bg-white border border-slate-200/90 px-2 py-1 shadow-sm"
                            title="Pick book cover color"
                          >
                            {(Object.keys(BOOK_COLOR_PALETTES) as BookColorKey[]).map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => setBookColors((prev) => ({ ...prev, [step.step]: c }))}
                                className={`h-3 w-3 rounded-full transition-all duration-200 ${BOOK_COLOR_PALETTES[c].dotClass} ${
                                  colorKey === c
                                    ? 'scale-125 ring-2 ring-offset-1 ring-slate-400'
                                    : 'opacity-70 hover:opacity-100 hover:scale-110'
                                }`}
                                aria-label={`Select ${BOOK_COLOR_PALETTES[c].name} color`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Center: Book Cover Title (Clean, 100% opaque, zero bleed-through) */}
                        <div className="my-auto py-4 pl-2 text-center">
                          <p className="text-[20px] sm:text-2xl font-black tracking-tight text-slate-900 leading-snug">
                            {step.title}
                          </p>
                        </div>

                        {/* Bottom Bar: Color theme name & interactive prompt */}
                        <div className="flex items-center justify-between pl-2 pt-2 border-t border-slate-300/60 text-[11px] font-semibold text-slate-600">
                          <span className="uppercase tracking-wider font-bold">{palette.name}</span>
                          <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform text-slate-800">
                            Flip open &rarr;
                          </span>
                        </div>
                      </div>

                      {/* INSIDE OF FRONT COVER (Lining visible when flipped past 90deg, [transform:rotateY(180deg)] [backface-visibility:hidden]) */}
                      <div
                        className={`absolute inset-0 flex flex-col justify-between rounded-[2rem] border ${palette.coverBorder} ${palette.insideCoverBg} p-8 [transform:rotateY(180deg)] [backface-visibility:hidden] cursor-pointer shadow-inner`}
                      >
                        {/* Inside Spine binding on right edge of flipped cover */}
                        <div className="absolute right-0 top-0 bottom-0 w-4 rounded-r-[2rem] bg-gradient-to-l from-slate-300/40 via-transparent to-transparent border-l border-slate-200/50" />

                        <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400 uppercase tracking-widest pr-2">
                          <span>Vol. {step.step}</span>
                          <span>{palette.name}</span>
                        </div>

                        {/* Bookplate emblem */}
                        <div className="my-auto flex flex-col items-center justify-center text-center p-4 rounded-xl border border-dashed border-slate-300/80 bg-white/70">
                          <div className={`h-8 w-8 rounded-full ${palette.dotClass.split(' ')[0]} flex items-center justify-center text-white text-xs font-mono font-bold mb-1.5 shadow-sm`}>
                            {step.step}
                          </div>
                          <p className="font-serif italic text-xs text-slate-700 font-medium">
                            SyncBoard Architecture
                          </p>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mt-0.5">
                            {step.kicker}
                          </span>
                        </div>

                        <div className="text-[11px] font-semibold text-slate-400 text-center pr-2">
                          &larr; Click or hover away to close
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* SECTION 3: CANVAS FEATURES GRID WITH COMPASS CONNECTION */}
        <section className="relative z-10 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Header matching screenshot */}
            <div className="mx-auto max-w-3xl text-center">
              <p className="brand-kicker">ENGINEERED FOR SPATIAL THINKING</p>
              <h2 className="section-title mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
                Everything you need to map thoughts
              </h2>
              <p className="section-copy mt-4 text-base sm:text-lg">
                Crafted specifically for rapid visual brainstorming, system architecture diagrams, and real-time team sprints.
              </p>
            </div>

            {/* Spatial Feature Grid Surrounding Central Compass */}
            <div className="relative mt-12 sm:mt-16">
              {/* TOP ROW: 3 Cards (NW, N, NE) */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {GRID_FEATURES.slice(0, 3).map((feat, sliceIdx) => {
                  const index = sliceIdx
                  const isActive = activeCompassIndex === index

                  return (
                    <div
                      key={feat.title}
                      onMouseEnter={() => setActiveCompassIndex(index)}
                      onClick={() => setActiveCompassIndex(index)}
                      className={`paper-card group relative flex flex-col justify-between rounded-[2rem] p-7 transition-all duration-300 cursor-pointer ${
                        isActive
                          ? 'shadow-[0_24px_50px_rgba(37,99,235,0.18)] -translate-y-1.5 ring-2 ring-blue-500/80 bg-white'
                          : 'hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.12)]'
                      }`}
                    >
                      {/* Connector Handle at Bottom matching NoteNode */}
                      <div
                        className={`pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 h-4 w-4 rounded-full border-2 border-white shadow-md transition-all duration-300 ${
                          isActive
                            ? 'bg-blue-600 ring-4 ring-blue-300 scale-125'
                            : 'bg-slate-300 group-hover:bg-slate-400'
                        }`}
                      />

                      <div>
                        <div className="flex items-center justify-between">
                          <span className={`rounded-full border px-3 py-0.5 text-xs font-bold ${feat.color}`}>
                            {feat.badge}
                          </span>
                          <span className="font-mono text-[11px] font-semibold text-slate-400">
                            {feat.bearing}
                          </span>
                        </div>

                        <h3 className="mt-5 text-lg font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                          {feat.title}
                        </h3>
                        <p className="section-copy mt-2.5 text-sm leading-relaxed">
                          {feat.desc}
                        </p>
                      </div>

                      <div className="mt-5 flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600">
                          <span>Feature included</span>
                          <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>

                        {isActive && (
                          <span className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-ping" />
                            Compass Locked
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* CENTER HUB: Compass Instrument with Radial Vector Connections */}
              <div className="relative my-6 sm:my-8 flex flex-col items-center justify-center">
                {/* SVG Vector Connecting Lines radiating from Compass Hub to all 6 surrounding cards */}
                <div className="pointer-events-none absolute inset-0 hidden lg:block overflow-visible">
                  <svg className="h-full w-full overflow-visible" viewBox="0 0 1000 200" preserveAspectRatio="none">
                    <defs>
                      <filter id="glow-line" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#2563eb" floodOpacity="0.5" />
                      </filter>
                    </defs>

                    {/* Vector 0: to Top-Left Card (NW) */}
                    <path
                      d="M 167 0 C 167 60, 420 50, 440 60"
                      fill="none"
                      stroke={activeCompassIndex === 0 ? '#2563eb' : '#cbd5e1'}
                      strokeWidth={activeCompassIndex === 0 ? '2.5' : '1.5'}
                      strokeDasharray={activeCompassIndex === 0 ? 'none' : '5 5'}
                      filter={activeCompassIndex === 0 ? 'url(#glow-line)' : undefined}
                      className="transition-all duration-300"
                    />

                    {/* Vector 1: to Top-Center Card (N) */}
                    <path
                      d="M 500 0 L 500 20"
                      fill="none"
                      stroke={activeCompassIndex === 1 ? '#2563eb' : '#cbd5e1'}
                      strokeWidth={activeCompassIndex === 1 ? '2.5' : '1.5'}
                      strokeDasharray={activeCompassIndex === 1 ? 'none' : '5 5'}
                      filter={activeCompassIndex === 1 ? 'url(#glow-line)' : undefined}
                      className="transition-all duration-300"
                    />

                    {/* Vector 2: to Top-Right Card (NE) */}
                    <path
                      d="M 833 0 C 833 60, 580 50, 560 60"
                      fill="none"
                      stroke={activeCompassIndex === 2 ? '#2563eb' : '#cbd5e1'}
                      strokeWidth={activeCompassIndex === 2 ? '2.5' : '1.5'}
                      strokeDasharray={activeCompassIndex === 2 ? 'none' : '5 5'}
                      filter={activeCompassIndex === 2 ? 'url(#glow-line)' : undefined}
                      className="transition-all duration-300"
                    />

                    {/* Vector 3: to Bottom-Left Card (SW) */}
                    <path
                      d="M 167 200 C 167 140, 420 150, 440 140"
                      fill="none"
                      stroke={activeCompassIndex === 3 ? '#2563eb' : '#cbd5e1'}
                      strokeWidth={activeCompassIndex === 3 ? '2.5' : '1.5'}
                      strokeDasharray={activeCompassIndex === 3 ? 'none' : '5 5'}
                      filter={activeCompassIndex === 3 ? 'url(#glow-line)' : undefined}
                      className="transition-all duration-300"
                    />

                    {/* Vector 4: to Bottom-Center Card (S) */}
                    <path
                      d="M 500 200 L 500 180"
                      fill="none"
                      stroke={activeCompassIndex === 4 ? '#2563eb' : '#cbd5e1'}
                      strokeWidth={activeCompassIndex === 4 ? '2.5' : '1.5'}
                      strokeDasharray={activeCompassIndex === 4 ? 'none' : '5 5'}
                      filter={activeCompassIndex === 4 ? 'url(#glow-line)' : undefined}
                      className="transition-all duration-300"
                    />

                    {/* Vector 5: to Bottom-Right Card (SE) */}
                    <path
                      d="M 833 200 C 833 140, 580 150, 560 140"
                      fill="none"
                      stroke={activeCompassIndex === 5 ? '#2563eb' : '#cbd5e1'}
                      strokeWidth={activeCompassIndex === 5 ? '2.5' : '1.5'}
                      strokeDasharray={activeCompassIndex === 5 ? 'none' : '5 5'}
                      filter={activeCompassIndex === 5 ? 'url(#glow-line)' : undefined}
                      className="transition-all duration-300"
                    />
                  </svg>
                </div>

                {/* Ambient glow behind dial */}
                <div className="pointer-events-none absolute h-52 w-52 rounded-full bg-blue-500/10 blur-3xl" />

                {/* Circular Compass Dial */}
                <div className="relative z-10 flex h-40 w-40 sm:h-48 sm:w-48 items-center justify-center rounded-full border-2 border-white/95 bg-gradient-to-b from-white/95 via-slate-50/90 to-blue-50/70 p-3 shadow-[0_20px_50px_rgba(37,99,235,0.16),inset_0_2px_4px_rgba(255,255,255,0.95)] backdrop-blur-2xl">
                  {/* Outer & Inner Concentric Rings */}
                  <div className="absolute inset-2 rounded-full border border-slate-200/90" />
                  <div className="absolute inset-6 rounded-full border border-dashed border-blue-300/70" />

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
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/90 bg-white/90 px-3.5 py-1 text-xs font-mono font-bold tracking-wider text-blue-700 shadow-sm backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                    <span>{GRID_FEATURES[activeCompassIndex].bearing}</span>
                  </div>
                  <span className="hidden sm:inline-block font-mono text-[11px] text-slate-500">
                    {GRID_FEATURES[activeCompassIndex].coords}
                  </span>
                </div>
              </div>

              {/* BOTTOM ROW: 3 Cards (SW, S, SE) */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {GRID_FEATURES.slice(3, 6).map((feat, sliceIdx) => {
                  const index = sliceIdx + 3
                  const isActive = activeCompassIndex === index

                  return (
                    <div
                      key={feat.title}
                      onMouseEnter={() => setActiveCompassIndex(index)}
                      onClick={() => setActiveCompassIndex(index)}
                      className={`paper-card group relative flex flex-col justify-between rounded-[2rem] p-7 transition-all duration-300 cursor-pointer ${
                        isActive
                          ? 'shadow-[0_24px_50px_rgba(37,99,235,0.18)] -translate-y-1.5 ring-2 ring-blue-500/80 bg-white'
                          : 'hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.12)]'
                      }`}
                    >
                      {/* Connector Handle at Top matching NoteNode */}
                      <div
                        className={`pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 h-4 w-4 rounded-full border-2 border-white shadow-md transition-all duration-300 ${
                          isActive
                            ? 'bg-blue-600 ring-4 ring-blue-300 scale-125'
                            : 'bg-slate-300 group-hover:bg-slate-400'
                        }`}
                      />

                      <div>
                        <div className="flex items-center justify-between">
                          <span className={`rounded-full border px-3 py-0.5 text-xs font-bold ${feat.color}`}>
                            {feat.badge}
                          </span>
                          <span className="font-mono text-[11px] font-semibold text-slate-400">
                            {feat.bearing}
                          </span>
                        </div>

                        <h3 className="mt-5 text-lg font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                          {feat.title}
                        </h3>
                        <p className="section-copy mt-2.5 text-sm leading-relaxed">
                          {feat.desc}
                        </p>
                      </div>

                      <div className="mt-5 flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600">
                          <span>Feature included</span>
                          <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>

                        {isActive && (
                          <span className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-ping" />
                            Compass Locked
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

        {/* SECTION 4: TECH STACK & ARCHITECTURE */}
        <section className="relative z-10 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-[2.4rem] border border-white/70 bg-white/50 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl sm:p-12 lg:p-16">
              <div className="mx-auto max-w-3xl text-center">
                <p className="brand-kicker">High-Performance Foundation</p>
                <h2 className="section-title mt-2 text-3xl font-extrabold text-slate-950 sm:text-4xl">
                  Built on modern real-time engineering
                </h2>
                <p className="section-copy mt-4 text-base">
                  Zero centralized lock contention, sub-millisecond CRDT sync, and hardware-accelerated rendering.
                </p>
              </div>

              <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {TECH_STACK.map((tech) => (
                  <div
                    key={tech.name}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200/70 bg-white/70 p-6 shadow-sm backdrop-blur-sm"
                  >
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-600">{tech.category}</p>
                      <h3 className="mt-2 text-lg font-bold text-slate-900">{tech.name}</h3>
                      <p className="mt-2 text-xs leading-relaxed text-slate-600">{tech.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: FREQUENTLY ASKED QUESTIONS */}
        <section className="relative z-10 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl xl:max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-50/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-700 shadow-sm backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                Got questions?
              </span>
              <h2 className="section-title mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
                Frequently Asked Questions
              </h2>
              <p className="section-copy mt-4 text-base sm:text-lg max-w-2xl mx-auto">
                Everything you need to know about using SyncBoard as a guest, team, or developer.
              </p>
            </div>

            <div className="mt-12 space-y-4">
              {FAQS.map((faq, index) => {
                const isOpen = openFaq === index
                const num = String(index + 1).padStart(2, '0')

                return (
                  <div
                    key={faq.q}
                    className={`group relative overflow-hidden rounded-[1.6rem] border transition-all duration-300 ${
                      isOpen
                        ? 'border-blue-400/80 bg-white shadow-[0_16px_40px_rgba(37,99,235,0.12)] ring-1 ring-blue-500/15'
                        : 'border-slate-200/70 bg-white/70 shadow-sm backdrop-blur-xl hover:border-blue-300/80 hover:bg-white hover:shadow-[0_10px_28px_rgba(37,99,235,0.06)]'
                    }`}
                  >
                    {/* Left active vertical accent bar */}
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-[1.6rem] bg-gradient-to-b from-blue-600 via-indigo-600 to-blue-500 transition-all duration-300 ${
                        isOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-50'
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="flex w-full items-center justify-between gap-4 p-6 text-left transition-colors sm:p-7"
                    >
                      <div className="flex items-center gap-4 sm:gap-5">
                        {/* Number Index Badge */}
                        <span
                          className={`font-mono text-xs font-black px-2.5 py-1 rounded-lg transition-all duration-300 shrink-0 ${
                            isOpen
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                              : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'
                          }`}
                        >
                          {num}
                        </span>

                        <h3
                          className={`text-base font-extrabold tracking-tight sm:text-lg transition-colors duration-200 ${
                            isOpen
                              ? 'text-blue-950'
                              : 'text-slate-900 group-hover:text-blue-600'
                          }`}
                        >
                          {faq.q}
                        </h3>
                      </div>

                      {/* Morphing Animated Plus/Close Toggle Icon */}
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span
                          className={`hidden sm:inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors duration-200 ${
                            isOpen
                              ? 'border-blue-200 bg-blue-50 text-blue-700'
                              : 'border-slate-200 bg-slate-50 text-slate-400 group-hover:border-blue-200 group-hover:text-blue-600'
                          }`}
                        >
                          {faq.tag}
                        </span>

                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 ${
                            isOpen
                              ? 'border-blue-500 bg-blue-600 text-white rotate-45 shadow-sm shadow-blue-500/40'
                              : 'border-slate-200 bg-slate-50 text-slate-500 group-hover:border-blue-300 group-hover:bg-blue-50 group-hover:text-blue-600'
                          }`}
                        >
                          <svg
                            className="h-4 w-4 transition-transform duration-300"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                        </div>
                      </div>
                    </button>

                    {/* Smooth Height Expansion with Framer Motion AnimatePresence */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="faq-content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{
                            height: 'auto',
                            opacity: 1,
                            transition: {
                              height: { duration: 0.35, ease: [0.04, 0.62, 0.23, 0.98] },
                              opacity: { duration: 0.25, delay: 0.08 },
                            },
                          }}
                          exit={{
                            height: 0,
                            opacity: 0,
                            transition: {
                              height: { duration: 0.25, ease: [0.04, 0.62, 0.23, 0.98] },
                              opacity: { duration: 0.15 },
                            },
                          }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-slate-100/90 pl-14 sm:pl-16 pr-6 sm:pr-8 pb-7 pt-4 text-sm sm:text-base leading-relaxed text-slate-600">
                            <p className="section-copy text-slate-600 leading-relaxed font-normal">
                              {faq.a}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </main>

      <DirectionAwareFooter />
    </div>
  )
}
