import { useEffect, useId, useMemo, useState, type CSSProperties, type MouseEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import Lenis from 'lenis'

import { useAuth } from '../context/AuthContext'
import Loader from '../components/Loader'

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

const DEVELOPER_PROFILE = {
  name: 'Navneet',
  role: 'Full-stack developer',
  blurb:
    'SyncBoard was designed and built by Navneet as a real-time collaboration workspace for teams that think visually and move fast.',
  email: 'getneet.25@gmail.com',
  github: 'https://github.com/Neet2516',
  linkedin: 'https://www.linkedin.com/in/navneet-sinha-ba0853375/',
  discord: 'https://discord.com/users/kailler_53339',
}

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

const CANVAS_FEATURES = [
  {
    title: 'Quill Rich-Text Formatting',
    desc: 'Write bold statements, checklists, code snippets, and ordered lists directly inside sticky notes with intuitive inline controls.',
    badge: 'Rich Editor',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
  },
  {
    title: 'Dynamic Vector Connectors',
    desc: 'Connect note handles effortlessly. Smart orthogonal routes adapt dynamically as you move notes across the board.',
    badge: 'Vector Routing',
    color: 'bg-amber-50 border-amber-200 text-amber-700',
  },
  {
    title: 'Zero-Conflict CRDT Merging',
    desc: 'Powered by Yjs CRDTs. Multiple collaborators can type into the same board simultaneously without overwriting data.',
    badge: 'Y.js CRDT',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  },
  {
    title: 'High-DPI PDF Generation',
    desc: 'Export your boards into crystal-clear vector documents preserving pins, gradients, typography, and connector paths.',
    badge: 'Vector Export',
    color: 'bg-rose-50 border-rose-200 text-rose-700',
  },
  {
    title: 'Live Room Presence',
    desc: 'Share custom room links, see connected teammate counters, and follow live cursor pointers across the shared space.',
    badge: 'Real-Time',
    color: 'bg-purple-50 border-purple-200 text-purple-700',
  },
  {
    title: 'Instant 1-Click Demo User',
    desc: 'No passwords, verification emails, or accounts required to test. Click once and immediately enter a live canvas.',
    badge: 'Guest Friendly',
    color: 'bg-cyan-50 border-cyan-200 text-cyan-700',
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
  },
  {
    q: 'Why choose a spatial canvas over standard linear documents?',
    a: 'Linear docs force your thoughts into a strict top-to-bottom hierarchy. A spatial canvas mirrors how human minds naturally organize thoughts—allowing you to cluster related topics, draw arrows between ideas, and see the full map of your project at a single glance.',
  },
  {
    q: 'How does real-time synchronization work without conflicts?',
    a: 'SyncBoard is powered by Yjs Conflict-Free Replicated Data Types (CRDTs) over WebSockets. Rather than locking notes or relying on last-write-wins collisions, changes are deterministically merged in real time, so every collaborator sees consistent state immediately.',
  },
  {
    q: 'Can I export my board to share with non-SyncBoard users?',
    a: 'Yes! SyncBoard features a custom high-DPI PDF export engine that rasterizes your canvas with full fidelity—preserving note pins, gradient surfaces, rich text styling, and vector connection paths without clipping or blurry artifacts.',
  },
  {
    q: 'Can I invite other teammates to the same board?',
    a: 'Yes! Every board has a unique Room ID. Simply copy your room link or code and share it with your teammates. They can sign in or jump in as a Demo User and collaborate with you on the same screen instantly.',
  },
]

/**
 * LandingPage Component
 *
 * The public-facing entry point of SyncBoard with landing page animation
 */
export function LandingPage() {
  const navigate = useNavigate()
  const { loginAsDemo, isAuthenticated, isLoading } = useAuth()
  const [effects, setEffects] = useState<EphemeralEffect[]>([])
  const [cursorVisible, setCursorVisible] = useState(false)
  const [parallax, setParallax] = useState({ x: 0, y: 0 })
  const [demoLoading, setDemoLoading] = useState(false)
  const [demoError, setDemoError] = useState<string | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const cursorX = useMotionValue(-80)
  const cursorY = useMotionValue(-80)
  const springX = useSpring(cursorX, { stiffness: 520, damping: 42, mass: 0.24 })
  const springY = useSpring(cursorY, { stiffness: 520, damping: 42, mass: 0.24 })
  const idBase = useId()

  const stats = useMemo(
    () => [
      { label: 'Shared boards', value: 'Live' },
      { label: 'Team presence', value: 'Visible' },
      { label: 'Ideas saved', value: 'Persistent' },
    ],
    [],
  )

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

  if (isAuthenticated) {
    return <Navigate to="/boards" replace />
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
          <div className="flex min-w-0 items-center space-x-3">
            <img src="/favicon.svg" alt="SyncBoard Logo" className="h-8 w-8 sm:h-9 sm:w-9" />
            <span className="brand-mark text-xl text-blue-600 sm:text-3xl">SyncBoard</span>
          </div>
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
              </motion.div>

              {demoError && (
                <div className="mx-auto mt-4 max-w-md rounded-xl border border-red-200 bg-red-50 p-2 text-sm font-medium text-red-600">
                  {demoError}
                </div>
              )}

              <p className="mt-3.5 text-xs font-medium text-slate-500 sm:text-sm">
                ⚡ No sign-up required — test real-time collaboration instantly with a ready-to-use demo session.
              </p>

              <motion.div
                className="mt-11 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-3"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
              >
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[1.6rem] border border-white/60 bg-white/48 px-5 py-4 shadow-[0_14px_32px_rgba(15,23,42,0.08)] backdrop-blur-xl"
                  >
                    <p className="text-xl font-black tracking-[-0.03em] text-slate-900">{stat.value}</p>
                    <p className="stat-label mt-1 text-sm text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
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
              {WORKFLOW_STEPS.map((step) => (
                <div
                  key={step.step}
                  className="paper-card relative flex flex-col justify-between rounded-[2rem] p-8 transition hover:-translate-y-1.5"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-3xl font-black text-blue-600/80">{step.step}</span>
                      <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${step.accent}`}>
                        {step.kicker}
                      </span>
                    </div>

                    <h3 className="mt-6 text-xl font-bold tracking-tight text-slate-900">
                      {step.title}
                    </h3>
                    <p className="section-copy mt-3 text-sm leading-relaxed sm:text-base">
                      {step.desc}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-slate-100 pt-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {step.tag}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 3: CANVAS FEATURES GRID */}
        <section className="relative z-10 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="brand-kicker">Engineered for Spatial Thinking</p>
              <h2 className="section-title mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
                Everything you need to map thoughts
              </h2>
              <p className="section-copy mt-4 text-base sm:text-lg">
                Crafted specifically for rapid visual brainstorming, system architecture diagrams, and real-time team sprints.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {CANVAS_FEATURES.map((feat) => (
                <div
                  key={feat.title}
                  className="paper-card group relative flex flex-col justify-between rounded-[1.8rem] p-7 transition hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.12)]"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`rounded-full border px-3 py-0.5 text-xs font-bold ${feat.color}`}>
                        {feat.badge}
                      </span>
                    </div>

                    <h3 className="mt-5 text-lg font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="section-copy mt-2.5 text-sm leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-blue-600">
                    <span>Feature included</span>
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              ))}
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
        <section className="relative z-10 py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="brand-kicker">Got questions?</p>
              <h2 className="section-title mt-2 text-3xl font-extrabold text-slate-950 sm:text-4xl">
                Frequently Asked Questions
              </h2>
              <p className="section-copy mt-4 text-base">
                Everything you need to know about using SyncBoard as a guest, team, or developer.
              </p>
            </div>

            <div className="mt-12 space-y-4">
              {FAQS.map((faq, index) => {
                const isOpen = openFaq === index
                return (
                  <div
                    key={faq.q}
                    className="overflow-hidden rounded-2xl border border-white/80 bg-white/60 shadow-sm backdrop-blur-xl transition"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="flex w-full items-center justify-between px-6 py-5 text-left text-base font-bold text-slate-900 transition hover:text-blue-600 sm:text-lg"
                    >
                      <span>{faq.q}</span>
                      <span className={`ml-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-transform ${isOpen ? 'rotate-180 bg-blue-100 text-blue-600' : ''}`}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </button>
                    {isOpen && (
                      <div className="border-t border-slate-100/80 px-6 pb-6 pt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                        {faq.a}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* SECTION 6: HIGH-CONVERTING BOTTOM CTA BANNER */}
        <section className="relative z-10 pb-20 pt-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-blue-200/80 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-6 py-14 shadow-[0_28px_70px_rgba(37,99,235,0.32)] sm:px-12 sm:py-18 lg:px-20 text-white">
              {/* Background ambient accents */}
              <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />

              <div className="relative z-10 mx-auto max-w-3xl text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-blue-100 backdrop-blur-md">
                  ⚡ Ready to collaborate?
                </span>
                <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
                  Start mapping your next idea right now
                </h2>
                <p className="mt-4 text-base font-medium text-blue-100 sm:text-lg">
                  No sign-up or password required to test. Click below to jump straight in as a Demo User, or create a free account to save your boards forever.
                </p>

                <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleDemoLogin}
                    disabled={demoLoading}
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-blue-600 shadow-lg transition hover:-translate-y-1 hover:bg-slate-50 active:translate-y-0 sm:w-auto"
                  >
                    <svg className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    {demoLoading ? 'Starting Instant Demo...' : 'Instant Demo User (1-Click)'}
                  </button>

                  <Link
                    to="/register"
                    className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/40 bg-white/10 px-8 py-4 text-base font-bold text-white backdrop-blur-md transition hover:-translate-y-1 hover:bg-white/20 active:translate-y-0 sm:w-auto"
                  >
                    Create Free Account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/60 bg-white/42 py-12 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-white/60 bg-white/42 p-8 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div>
              <p className="brand-kicker mb-3">About the developer</p>
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <h2 className="section-title text-3xl text-slate-950">
                    Built by {DEVELOPER_PROFILE.name}
                  </h2>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-blue-600/90">
                    {DEVELOPER_PROFILE.role}
                  </p>
                  <p className="section-copy mt-4 text-base">
                    {DEVELOPER_PROFILE.blurb} It blends shared presence, sticky-note thinking, and a board-first workflow into one polished canvas.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 lg:max-w-[38rem] lg:justify-end">
                  <ContactCard
                    href={`mailto:${DEVELOPER_PROFILE.email}`}
                    label="Email"
                    value={DEVELOPER_PROFILE.email}
                    icon={<MailIcon />}
                  />
                  <ContactCard
                    href={DEVELOPER_PROFILE.linkedin}
                    label="LinkedIn"
                    value="Professional profile"
                    icon={<LinkedInIcon />}
                  />
                  <ContactCard
                    href={DEVELOPER_PROFILE.github}
                    label="GitHub"
                    value="@Neet2516"
                    icon={<GitHubIcon />}
                  />
                  <ContactCard
                    href={DEVELOPER_PROFILE.discord}
                    label="Discord"
                    value="Direct message"
                    icon={<DiscordIcon />}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-white/55 pt-5">
              <p className="section-copy text-sm text-slate-500">
                Designed for collaborative thinking, persistent notes, and a smoother team flow.
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <span className="stat-label text-sm text-slate-500">&copy; 2026 SyncBoard. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function ContactCard({
  href,
  label,
  value,
  icon,
}: {
  href: string
  label: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <a
      href={href}
      target={href.startsWith('mailto:') ? undefined : '_blank'}
      rel={href.startsWith('mailto:') ? undefined : 'noreferrer'}
      className="flex min-w-[220px] flex-1 items-center gap-4 rounded-[1.4rem] border border-white/70 bg-white/58 px-4 py-4 shadow-[0_14px_32px_rgba(15,23,42,0.08)] backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/78 lg:max-w-[260px]"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_14px_28px_rgba(37,99,235,0.24)]">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold text-slate-900">{label}</span>
        <span className="block truncate text-sm text-slate-500">{value}</span>
      </span>
    </a>
  )
}

function MailIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v12H4z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 7 8 6 8-6" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.94 8.5a1.44 1.44 0 1 1 0-2.88 1.44 1.44 0 0 1 0 2.88ZM5.7 9.74h2.5V18H5.7V9.74Zm4.07 0h2.4v1.13h.03c.33-.63 1.15-1.29 2.37-1.29 2.54 0 3.01 1.67 3.01 3.83V18h-2.5v-4.04c0-.97-.02-2.22-1.35-2.22-1.36 0-1.57 1.06-1.57 2.15V18h-2.4V9.74Z" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5a12 12 0 0 0-3.8 23.39c.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.42-4.04-1.42-.55-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.08 1.84 2.84 1.31 3.54 1 .11-.79.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.39 1.24-3.23-.13-.3-.54-1.53.11-3.19 0 0 1.01-.32 3.3 1.23a11.4 11.4 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.89.12 3.19.77.84 1.24 1.92 1.24 3.23 0 4.61-2.81 5.62-5.49 5.92.43.37.82 1.11.82 2.23v3.31c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" />
    </svg>
  )
}

function DiscordIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.32 4.37a16.7 16.7 0 0 0-4.1-1.28.06.06 0 0 0-.07.03c-.18.32-.38.74-.52 1.07a15.48 15.48 0 0 0-4.67 0 10.7 10.7 0 0 0-.53-1.07.06.06 0 0 0-.07-.03 16.62 16.62 0 0 0-4.1 1.28.05.05 0 0 0-.03.02C3.63 8.18 2.9 11.87 3.26 15.52a.07.07 0 0 0 .03.05 16.8 16.8 0 0 0 4.94 2.5.06.06 0 0 0 .07-.02c.38-.52.73-1.07 1.03-1.64a.06.06 0 0 0-.03-.08 10.9 10.9 0 0 1-1.57-.75.06.06 0 0 1-.01-.1c.1-.08.2-.16.29-.24a.06.06 0 0 1 .07-.01c3.3 1.5 6.87 1.5 10.13 0a.06.06 0 0 1 .07 0c.1.08.2.16.3.24a.06.06 0 0 1-.01.1c-.5.3-1.03.56-1.57.75a.06.06 0 0 0-.03.08c.3.57.65 1.12 1.03 1.64a.06.06 0 0 0 .07.02 16.74 16.74 0 0 0 4.94-2.5.06.06 0 0 0 .03-.05c.43-4.22-.72-7.88-2.97-11.13a.05.05 0 0 0-.03-.02ZM9.85 13.3c-.99 0-1.8-.91-1.8-2.03 0-1.12.8-2.03 1.8-2.03 1 0 1.81.92 1.8 2.03 0 1.12-.8 2.03-1.8 2.03Zm4.3 0c-.99 0-1.8-.91-1.8-2.03 0-1.12.8-2.03 1.8-2.03 1 0 1.81.92 1.8 2.03 0 1.12-.8 2.03-1.8 2.03Z" />
    </svg>
  )
}
