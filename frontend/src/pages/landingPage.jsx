import React from 'react';
import "../styles/landingPage.css";
import { useNavigate } from 'react-router-dom';

export default function landingPage() {
  const router = useNavigate();
  return (
    <div className="landing-container">
      <nav className="glass-panel nav-bar">
        <div className="logo-container">
          <img src="/meetflow_logo.png" alt="MeetFlow Logo" style={{ width: '65px', height: '65px', borderRadius: '8px', marginRight: '10px' }} />
          <span className="logo-text">MeetFlow</span>
        </div>
        <div className="nav-actions">

          <button className="btn-glass" onClick={() => router("/auth", { state: { formMode: 0 } })}>Log In</button>
          <button className="btn-glass" onClick={() => router("/auth", { state: { formMode: 1 } })}>Register</button>
        </div>
      </nav>
      <main className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Connect with <br />
            <span className="gradient-text">your loved ones</span>
          </h1>
          <p className="hero-subtitle">cover a distance by MeetFlow</p>
          <button
            className="btn-primary hero-btn"
            onClick={() => router("/auth", { state: { formMode: 1 } })}
          >
            Get Started
          </button>
        </div>

        <div className="hero-illustration">
          <img src="/mobile.png" alt="mobile" className="real-mobile-img" />
        </div>
      </main>
    </div>
  )
}

