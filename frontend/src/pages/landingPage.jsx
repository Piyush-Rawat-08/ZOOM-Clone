import React from 'react';
import "../styles/landingPage.css";
import { useNavigate } from 'react-router-dom';

export default function landingPage() {
  const router = useNavigate();
  const navigate = router;
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
          <div className="status-badge">
            <span className="pulse-dot"></span>
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
            <span className="hero-chip-item">
              <span className="hero-chip-icon">✓</span> End-to-End Encrypted
            </span>
          </div>
        </div>

        <div className="hero-animation-wrapper">
          {/* Ambient Background Radar Pulse Rings */}
          <div className="ambient-radar-ring ring-1"></div>
          <div className="ambient-radar-ring ring-2"></div>
          <div className="ambient-radar-ring ring-3"></div>

          {/* Floating Metric Badges */}
          <div className="hero-floating-pill pill-top">
            <span className="pill-dot"></span>
            <span className="pill-text">⚡ 18ms WebRTC Latency</span>
          </div>

          <div className="hero-floating-pill pill-bottom">
            <span className="pill-icon">🛡️</span>
            <span className="pill-text">256-Bit P2P Encrypted</span>
          </div>

          {/* Main Frosted Call Stage */}
          <div className="call-stage-card">
            {/* Stage Header */}
            <div className="stage-header">
              <div className="stage-status-live">
                <span className="rec-blink-dot"></span>
                <span className="rec-text">LIVE</span>
                <span className="rec-timer">00:14:32</span>
              </div>
              <div className="stage-room-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Room: meet-flow-hd</span>
              </div>
            </div>

            {/* Video Participants Grid */}
            <div className="stage-tiles-grid">
              {/* Participant 1: Host / Active Speaker */}
              <div className="stage-tile active-speaker">
                <div className="avatar-circle avatar-violet">
                  <span>PR</span>
                  <span className="avatar-mini-status"></span>
                </div>
                <div className="tile-info">
                  <span className="tile-name">You (Host)</span>
                  {/* Animated Audio Equalizer Bars */}
                  <div className="audio-equalizer">
                    <span className="eq-bar bar-1"></span>
                    <span className="eq-bar bar-2"></span>
                    <span className="eq-bar bar-3"></span>
                    <span className="eq-bar bar-4"></span>
                    <span className="eq-bar bar-5"></span>
                  </div>
                </div>
                <span className="speaking-tag">Speaking</span>
              </div>

              {/* Participant 2: Remote Peer */}
              <div className="stage-tile">
                <div className="avatar-circle avatar-cyan">
                  <span>AL</span>
                </div>
                <div className="tile-info">
                  <span className="tile-name">Alex R.</span>
                  <span className="tile-sub">Connected HD</span>
                </div>
                <div className="peer-signal">
                  <span className="signal-bar b1"></span>
                  <span className="signal-bar b2"></span>
                  <span className="signal-bar b3"></span>
                </div>
              </div>
            </div>

            {/* Live Data Stream Beam between participants */}
            <div className="stream-beam-wrapper">
              <div className="stream-beam-line">
                <span className="stream-particle"></span>
                <span className="stream-particle reverse"></span>
              </div>
            </div>

            {/* Stage Floating Controls */}
            <div className="stage-controls-bar">
              <div className="stage-control-btn active" title="Microphone On">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </div>
              <div className="stage-control-btn active" title="Camera On">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 7l-7 5 7 5V7z" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
              </div>
              <div className="stage-control-btn" title="Screen Share">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>
              <div className="stage-control-btn btn-end" title="End Call">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 .8 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
                  <line x1="23" y1="1" x2="1" y2="23" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Feature Highlights Section (Only Logical & Essential Capabilities) */}
      <section id="features" className="features-section">
        <div className="section-header">
          <span className="section-tag">Essential Features</span>
          <h2 className="section-title">Built for Speed, Clarity, and Connection</h2>
          <p className="section-subtitle">
            Every feature is designed to reduce friction and help you connect instantly with anyone.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feat-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <h3 className="feat-title">Instant 1-Click Rooms</h3>
            <p className="feat-desc">
              Generate instant room links or custom join codes in milliseconds. Invite teammates or friends with zero configuration.
            </p>
          </div>

          <div className="feature-card">
            <div className="feat-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 7l-7 5 7 5V7z" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </div>
            <h3 className="feat-title">Ultra HD Video & Audio</h3>
            <p className="feat-desc">
              WebRTC peer-to-peer streaming dynamically adjusts quality to match bandwidth, ensuring smooth 60 FPS video and crisp voice.
            </p>
          </div>

          <div className="feature-card">
            <div className="feat-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <h3 className="feat-title">Schedule Meetings</h3>
            <p className="feat-desc">
              Plan your video calls in advance with our intuitive scheduling system. Set dates, times, and participants effortlessly.
            </p>
          </div>

          <div className="feature-card">
            <div className="feat-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3 className="feat-title">Live In-Call Chat</h3>
            <p className="feat-desc">
              Share links, drop notes, and exchange messages in real-time during your call without disrupting the ongoing conversation.
            </p>
          </div>

          <div className="feature-card">
            <div className="feat-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="4" fill="currentColor" />
              </svg>
            </div>
            <h3 className="feat-title">
              Live Recordings
            </h3>
            <p className="feat-desc">
              Capture important meetings, lectures, or discussions with built-in recording capabilities. Automatically save files to secure cloud storage for later review.
            </p>
          </div>

          <div className="feature-card">
            <div className="feat-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <h3 className="feat-title">
              Screen Sharing
            </h3>
            <p className="feat-desc">
              Share your screen with other participants to show presentations, documents, or videos. Collaborate in real-time with screen sharing capabilities.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="steps-section">
        <div className="section-header">
          <span className="section-tag">Simple 3-Step Flow</span>
          <h2 className="section-title">Up and Running in 30 Seconds</h2>
          <p className="section-subtitle">No complicated setups. No sign-up friction.</p>
        </div>

        <div className="steps-grid">
          <div className="step-item">
            <span className="step-number">01</span>
            <h3 className="step-title">Create or Join Room</h3>
            <p className="step-desc">
              Click Start Instant Meeting to generate a room, or type in an existing code from your host.
            </p>
          </div>

          <div className="step-item">
            <span className="step-number">02</span>
            <h3 className="step-title">Share the Code</h3>
            <p className="step-desc">
              Send your room code or URL to team members. They can join directly from any modern web browser.
            </p>
          </div>

          <div className="step-item">
            <span className="step-number">03</span>
            <h3 className="step-title">Collaborate in HD</h3>
            <p className="step-desc">
              Enjoy high-definition video, crystal audio, screen sharing, and real-time chat with full privacy.
            </p>
          </div>
        </div>
      </section>

      {/* Security Section & Call to Action Banner */}
      <section id="security" className="cta-section">
        <div className="cta-card">
          <div className="security-badge-pill">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Enterprise-Grade Privacy & Security</span>
          </div>
          <h2 className="cta-title">Ready for Smoother Video Meetings?</h2>
          <p className="cta-sub">
            Join thousands of users having fast, clear, and secure video conversations every day on MeetFlow. Direct WebRTC peer-to-peer connection with end-to-end privacy.
          </p>
          <div className="cta-btns">
            <button
              className="btn-gradient"
              style={{ padding: '14px 34px', fontSize: '1.05rem' }}
              onClick={() => navigate('/auth', { state: { formMode: 1 } })}
            >
              Get Started Free
            </button>
            <button
              className="btn-glass"
              style={{ padding: '14px 28px', fontSize: '1.05rem' }}
              onClick={() => navigate('/auth', { state: { formMode: 0 } })}
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Minimal Clean Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: '700', color: 'white' }}>MeetFlow</span>
            <span>© {new Date().getFullYear()} MeetFlow Inc. All rights reserved.</span>
          </div>

          <div className="footer-status">
            <span className="pulse-dot"></span>
            <span>All Systems Operational</span>
          </div>

          <ul className="footer-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#security">Security</a></li>
            <li>
              <button
                onClick={() => navigate('/auth', { state: { formMode: 0 } })}
                style={{ background: 'none', border: 'none', color: 'var(--mlp-text-muted)', cursor: 'pointer', padding: 0 }}
              >
                Sign In
              </button>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  )
}

