import { useEffect, useId, useState, type CSSProperties, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import Lenis from 'lenis'

import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Loader from '../components/Loader'
import { DirectionAwareFooter } from '../components/DirectionAwareFooter'
import {
  LandingNavbar,
  LandingHero,
  CoreCapabilitiesSection,
  WorkflowBooksSection,
  CompassFeaturesSection,
  FaqSection,
  NOTE_THEMES,
  type HeroNoteColor,
} from '../components/landing'

type EphemeralEffect = {
  id: string
  x: number
  y: number
  color: HeroNoteColor
  rotate: number
}

const EFFECT_COLORS: HeroNoteColor[] = ['yellow', 'pink', 'cyan', 'green']

/**
 * LandingPage Component
 *
 * The public-facing entry point of SyncBoard with modular section components,
 * smooth Lenis scrolling, ephemeral click particles, and an authentic spatial canvas.
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
      const offsetX = (event.clientX / innerWidth - 0.5) * 26
      const offsetY = (event.clientY / innerHeight - 0.5) * 24

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

  const handleHomeClick = () => {
    showToast('Welcome to SyncBoard! You are on the landing page 🚀', 'info')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleExploreFeatures = () => {
    showToast('Exploring SyncBoard canvas features ✨', 'info')
    window.scrollBy({ top: 650, behavior: 'smooth' })
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
      {/* Background Spatial Grid */}
      <div className="landing-canvas fixed inset-0" aria-hidden="true">
        <div className="landing-canvas__wash" />
        <div className="landing-canvas__grid" />
        <div className="landing-canvas__glow" />
      </div>

      {/* Live Pointer Tracking Badge */}
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

      {/* Ephemeral Click Spawned Sticky Note Particles */}
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

      {/* Modular Section 0: Navigation Bar */}
      <LandingNavbar
        isAuthenticated={isAuthenticated}
        userName={user?.name}
        demoLoading={demoLoading}
        onDemoLogin={handleDemoLogin}
        onHomeClick={handleHomeClick}
      />

      {/* Main Content Sections */}
      <main className="relative z-10">
        {/* Modular Section 1: Hero */}
        <LandingHero
          isAuthenticated={isAuthenticated}
          demoLoading={demoLoading}
          demoError={demoError}
          onDemoLogin={handleDemoLogin}
          onExploreFeatures={handleExploreFeatures}
        />

        {/* Modular Section 2: Core Overview Pillars */}
        <CoreCapabilitiesSection />

        {/* Modular Section 3: 3D Interactive Workflow Books */}
        <WorkflowBooksSection />

        {/* Modular Section 4: Authentic Pinned Canvas Board with Compass Hub */}
        <CompassFeaturesSection />

        {/* Modular Section 5: Frequently Asked Questions */}
        <FaqSection />
      </main>

      {/* Modular Section 6: Direction Aware Developer Footer */}
      <DirectionAwareFooter />
    </div>
  )
}
