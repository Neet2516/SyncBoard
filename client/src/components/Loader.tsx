import React from 'react'
import './Loader.css'

/**
 * Loader Component
 * 
 * A high-quality interactive loader with custom animations.
 * Adapted from Uiverse.io by Nawsome.
 */
const Loader: React.FC = () => {
  return (
    <div className="pl-container">
      <div className="pl">
        <div className="pl__dot"></div>
        <div className="pl__dot"></div>
        <div className="pl__dot"></div>
        <div className="pl__dot"></div>
        <div className="pl__dot"></div>
        <div className="pl__dot"></div>
        <div className="pl__dot"></div>
        <div className="pl__dot"></div>
        <div className="pl__dot"></div>
        <div className="pl__dot"></div>
        <div className="pl__dot"></div>
        <div className="pl__dot"></div>
        <div className="pl__text">Loading…</div>
      </div>
    </div>
  )
}

export default Loader
