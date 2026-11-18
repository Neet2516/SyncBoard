import React from 'react'
import { CinematicPreloader } from './CinematicPreloader'

/**
 * Loader Component
 * 
 * Replaced the earlier 12-dot loader with the current SyncBoard preloader.
 */
const Loader: React.FC = () => {
  return <CinematicPreloader isReady={false} />
}

export default Loader
