import React from 'react'
import './Loader.css'

/**
 * Loader Component
 * 
 * Displays a full-page loading state with custom animations.
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
