import { useEffect, useId, useMemo, useState, type CSSProperties, type MouseEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import Lenis from 'lenis'

import { useAuth } from '../context/AuthContext'
import Loader from '../components/Loader'

type HeroNote = {
  id: string
  color: 'yellow' | 'pink' | 'cyan'
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
  color: HeroNote['color']
  rotate: number
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
    color: 'yellow',
    title: 'Board rhythm',
    body: 'Sketch, arrange, and refine in real time.',
    style: { bottom: '24%', right: '11%', rotate: -5, delay: 0.4 },
  },
]

const EFFECT_COLORS: HeroNote['color'][] = ['yellow', 'pink', 'cyan']

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

/**
 * LandingPage Component
 *
 * The public-facing entry point of SyncBoard with landing page animation
 */
export function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [effects, setEffects] = useState<EphemeralEffect[]>([])
  const [cursorVisible, setCursorVisible] = useState(false)
  const [parallax, setParallax] = useState({ x: 0, y: 0 })
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
              <div className="sticky-note__pin" />
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
            <Link
              to="/login"
              className="rounded-full px-3 py-3 text-sm font-semibold tracking-wide text-slate-600 transition-colors hover:text-blue-600 sm:px-4"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold tracking-wide text-white shadow-[0_18px_34px_rgba(37,99,235,0.28)] transition hover:-translate-y-0.5 hover:bg-blue-700 sm:px-6"
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
              {HERO_NOTES.map((note) => (
                <motion.article
                  key={note.id}
                  className={`sticky-note sticky-note--${note.color}`}
                  style={note.style}
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
                  <div className="sticky-note__pin" />
                  <div className="sticky-note__shine" />
                  <p className="sticky-note__title">{note.title}</p>
                  <p className="sticky-note__body">{note.body}</p>
                </motion.article>
              ))}
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
                <Link
                  to="/register"
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-blue-600 px-8 py-4 text-base font-semibold tracking-wide text-white shadow-[0_24px_45px_rgba(37,99,235,0.34)] transition hover:-translate-y-1 hover:bg-blue-700 md:min-w-[230px] md:w-auto"
                >
                  Start Creating Now
                </Link>
                <Link
                  to="/login"
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-slate-200/80 bg-white/68 px-8 py-4 text-base font-semibold tracking-wide text-slate-700 shadow-[0_16px_32px_rgba(15,23,42,0.09)] backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/84 md:min-w-[210px] md:w-auto"
                >
                  Live Demo
                </Link>
              </motion.div>

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

        <section className="relative z-10 pb-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
              <div className="paper-card rounded-[2rem] p-8">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
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
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-100">
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
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
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
