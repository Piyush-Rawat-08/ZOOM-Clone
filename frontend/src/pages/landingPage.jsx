import React from 'react';
import "../styles/landingPage.css";
import { useNavigate } from 'react-router-dom';

export default function landingPage() {
  const router = useNavigate();
  return (
    <div className="landing-container">
      <header className="nav-bar">
        <div className="logo-container">
          <img src="/meetflow_logo.png" alt="MeetFlow Logo" style={{ width: '48px', height: '48px', borderRadius: '8px', marginRight: '10px', mixBlendMode: 'screen' }} />
          <span className="logo-text">MeetFlow</span>
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#security">Security</a>
        </div>
        <div className="nav-actions">
          <button className="btn-ghost" onClick={() => router("/auth", { state: { formMode: 0 } })}>Log In</button>
          <button className="btn-glass" onClick={() => router("/auth", { state: { formMode: 1 } })}>Get Started Free</button>
        </div>
      </header>
      <main className="hero-section">
        <div className="hero-content">
          <div className="mlp-status-badge">
            <span className="mlp-pulse-dot"></span>
            <span>Ultra-Low Latency WebRTC • Free HD Calls</span>
          </div>
          <h1 className="hero-title">
            Connect Seamlessly <br />
            <span className="gradient-text">With Loved Ones</span>
          </h1>
          <p className="hero-subtitle">Lag-free video meetings, crystal-clear spatial audio, and instant real-time
            collaboration right from your browser. No bloated downloads required.</p>
          <button
            className="btn-primary hero-btn"
            onClick={() => router("/auth", { state: { formMode: 1 } })}
          >
            Get Started
          </button>
          {/* Trust Highlights */}
          <div className="hero-chips">
            <span className="hero-chip-item">
              <span className="hero-chip-icon">✓</span> 100% In-Browser
            </span>
            <span className="hero-chip-item">
              <span className="hero-chip-icon">✓</span> 1080p Crystal Audio
            </span>
            <span className="mlp-chip-item">
              <span className="mlp-chip-icon">✓</span> End-to-End Encrypted
            </span>
          </div>
        </div>

        <div className="hero-illustration">
          <img src="/landingPage_img.png" alt="mobile"
            className="real-mobile-img"
            style={{ borderRadius: '20px', height: '600px', width: '600px' }}
          />
        </div>
      </main>
    </div>
  )
}

