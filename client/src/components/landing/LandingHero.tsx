import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export type HeroNoteColor = 'yellow' | 'pink' | 'cyan' | 'blue' | 'green'

export type HeroNote = {
  id: string
  color: HeroNoteColor
  title: string
  body: string
  from: {
    x: number
    y: number
    rotate: number
  }
  cursor?: {
    label: string
  }
  style: {
    top?: string
    bottom?: string
    left?: string
    right?: string
    rotate: number
    delay: number
  }
}

export const NOTE_THEMES: Record<
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
    from: { x: -480, y: -260, rotate: -32 },
    cursor: { label: 'You' },
    style: { top: '18%', left: '7%', rotate: -7, delay: 0.15 },
  },
  {
    id: 'note-2',
    color: 'pink',
    title: 'Live cursors',
    body: 'Everyone shows up on the same shared space.',
    from: { x: 480, y: -260, rotate: 34 },
    style: { top: '20%', right: '10%', rotate: 8, delay: 0.28 },
  },
  {
    id: 'note-3',
    color: 'cyan',
    title: 'Sticky flow',
    body: 'Capture thoughts before they disappear.',
    from: { x: -480, y: 320, rotate: 26 },
    style: { bottom: '24%', left: '12%', rotate: 6, delay: 0.42 },
  },
  {
    id: 'note-4',
    color: 'green',
    title: 'Board rhythm',
    body: 'Sketch, arrange, and refine in real time.',
    from: { x: 480, y: 320, rotate: -26 },
    style: { bottom: '24%', right: '11%', rotate: -5, delay: 0.55 },
  },
]

interface LandingHeroProps {
  isAuthenticated: boolean
  demoLoading: boolean
  demoError: string | null
  onDemoLogin: () => void
  onExploreFeatures: () => void
}

export function LandingHero({
  isAuthenticated,
  demoLoading,
  demoError,
  onDemoLogin,
  onExploreFeatures,
}: LandingHeroProps) {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-7xl items-center justify-center px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="absolute inset-0 hidden md:block">
          {HERO_NOTES.map((note) => {
            const theme = NOTE_THEMES[note.color]
            return (
              <motion.article
                key={note.id}
                className="hero-notenode absolute select-none cursor-pointer"
                style={{
                  ...note.style,
                  width: 'min(240px, 24vw)',
                  minWidth: '190px',
                }}
                initial={{
                  opacity: 0,
                  x: note.from.x,
                  y: note.from.y,
                  rotate: note.from.rotate,
                  scale: 0.78,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  y: 0,
                  rotate: note.style.rotate,
                  scale: 1,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 65,
                  damping: 13,
                  mass: 0.9,
                  delay: note.style.delay,
                }}
                whileHover={{
                  y: -10,
                  scale: 1.04,
                  rotate: note.style.rotate + (note.style.rotate > 0 ? 1.8 : -1.8),
                  transition: { duration: 0.2 },
                }}
              >
                {/* Pushpin matching NoteNode */}
                <motion.div
                  className="pointer-events-none absolute inset-x-0 -top-3.5 z-30 flex justify-center"
                  initial={{ scale: 0, y: -26, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 280,
                    damping: 15,
                    delay: note.style.delay + 0.38,
                  }}
                >
                  <div
                    className="relative h-7 w-7 rounded-full border border-white/80 shadow-[0_8px_18px_rgba(15,23,42,0.25)]"
                    style={{ background: theme.pin }}
                  >
                    <div className="absolute inset-[3.5px] rounded-full bg-white/45 blur-[0.5px]" />
                    <div className="absolute left-1/2 top-[18px] h-5 w-[2px] -translate-x-1/2 rounded-full bg-slate-500/60" />
                    <div className="absolute left-1/2 top-[22px] h-0 w-0 -translate-x-1/2 border-l-[3.5px] border-r-[3.5px] border-t-[8px] border-l-transparent border-r-transparent border-t-slate-500/65" />
                  </div>
                </motion.div>

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

                {/* Real-time collaborator cursor badge (matching live canvas presence) */}
                {note.cursor && (
                  <motion.div
                    className="pointer-events-none absolute -bottom-3 -right-2 z-30 flex items-center gap-1"
                    initial={{ opacity: 0, scale: 0, x: -10, y: -10 }}
                    animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 220,
                      damping: 14,
                      delay: note.style.delay + 0.55,
                    }}
                  >
                    <svg
                      className="h-4 w-4 text-blue-600 drop-shadow-[0_2px_4px_rgba(37,99,235,0.35)]"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M4 2l16 11.5-6.5 1.5 4 8-3 1.5-4-8-4.5 4.5V2z" />
                    </svg>
                    <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-[0_4px_10px_rgba(37,99,235,0.35)]">
                      {note.cursor.label}
                    </span>
                  </motion.div>
                )}

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
                  onClick={onExploreFeatures}
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-slate-200/80 bg-white/68 px-8 py-4 text-base font-semibold tracking-wide text-slate-700 shadow-[0_16px_32px_rgba(15,23,42,0.09)] backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/84 md:min-w-[210px] md:w-auto"
                >
                  Explore Features &darr;
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onDemoLogin}
                  disabled={demoLoading}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-full bg-blue-600 px-8 py-4 text-base font-semibold tracking-wide text-white shadow-[0_24px_45px_rgba(37,99,235,0.34)] transition hover:-translate-y-1 hover:bg-blue-700 active:translate-y-0 md:min-w-[240px] md:w-auto"
                >
                  <svg className="h-5 w-5 text-amber-300" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                      clipRule="evenodd"
                    />
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
  )
}
