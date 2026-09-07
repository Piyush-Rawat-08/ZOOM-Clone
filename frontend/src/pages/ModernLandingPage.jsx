import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ModernLandingPage.css';

export default function ModernLandingPage() {
  const navigate = useNavigate();

  // Direct join code input state
  const [meetingCode, setMeetingCode] = useState('');

  // Interactive Mock Call Stage States
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(1458); // in seconds (~24:18)
  const [reactions, setReactions] = useState([
    { id: 1, emoji: '🔥', left: '25%' },
    { id: 2, emoji: '❤️', left: '60%' },
  ]);

  // Live call duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format seconds into HH:MM:SS or MM:SS
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const pad = (num) => String(num).padStart(2, '0');
    return hours > 0 ? `${pad(hours)}:${pad(mins)}:${pad(secs)}` : `${pad(mins)}:${pad(secs)}`;
  };

  // Trigger floating reaction animation
  const triggerReaction = (emoji) => {
    const randomLeft = Math.floor(Math.random() * 65 + 15) + '%';
    const newReaction = {
      id: Date.now() + Math.random(),
      emoji,
      left: randomLeft,
    };
    setReactions((prev) => [...prev, newReaction]);

    // Auto cleanup reaction after animation ends (3.5s)
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 3600);
  };

  // Periodic ambient floating reactions to keep stage alive
  useEffect(() => {
    const ambientEmojis = ['❤️', '👏', '🔥', '🎉', '🚀', '👍'];
    const interval = setInterval(() => {
      const randomEmoji = ambientEmojis[Math.floor(Math.random() * ambientEmojis.length)];
      triggerReaction(randomEmoji);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  // Handle direct join
  const handleJoinMeeting = (e) => {
    e.preventDefault();
    if (meetingCode.trim()) {
      navigate(`/${meetingCode.trim()}`);
    } else {
      alert('Please enter a valid meeting code or ID');
    }
  };

  // Generate random meeting ID and launch
  const handleInstantMeeting = () => {
    const randomId =
      Math.random().toString(36).substring(2, 6) +
      '-' +
      Math.random().toString(36).substring(2, 6);
    navigate(`/${randomId}`);
  };

  return (
    <div className="mlp-container">
      {/* Background Animated Ambient Glow Orbs */}
      <div className="mlp-ambient-mesh" aria-hidden="true">
        <div className="mlp-orb mlp-orb-1"></div>
        <div className="mlp-orb mlp-orb-2"></div>
        <div className="mlp-orb mlp-orb-3"></div>
      </div>

      {/* Modern Navigation Bar */}
      <header className="mlp-navbar">
        <div className="mlp-nav-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="mlp-brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 10l5-4v12l-5-4v-4z" />
              <rect x="2" y="6" width="13" height="12" rx="3" />
            </svg>
          </div>
          <span className="mlp-brand-name">MeetFlow</span>
        </div>

        <nav>
          <ul className="mlp-nav-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#security">Security</a></li>
          </ul>
        </nav>

        <div className="mlp-nav-actions">
          <button
            className="mlp-btn-ghost"
            onClick={() => navigate('/auth', { state: { formMode: 0 } })}
          >
            Log In
          </button>
          <button
            className="mlp-btn-gradient"
            onClick={() => navigate('/auth', { state: { formMode: 1 } })}
          >
            Get Started Free
          </button>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="mlp-hero">
        {/* Left Column: Direct Action & Value Proposition */}
        <div className="mlp-hero-left">
          <div className="mlp-status-badge">
            <span className="mlp-pulse-dot"></span>
            <span>Ultra-Low Latency WebRTC • Free HD Calls</span>
          </div>

          <h1 className="mlp-hero-title">
            Connect Seamlessly With Anyone, <br />
            <span className="mlp-text-gradient">Anywhere in HD</span>
          </h1>

          <p className="mlp-hero-subtitle">
            Lag-free video meetings, crystal-clear spatial audio, and instant real-time
            collaboration right from your browser. No bloated downloads required.
          </p>

          {/* Quick Action Box */}
          <div className="mlp-action-box">
            <div className="mlp-quick-actions">
              <button
                className="mlp-btn-gradient mlp-instant-btn"
                onClick={handleInstantMeeting}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 10l5-4v12l-5-4v-4z" />
                  <rect x="2" y="6" width="13" height="12" rx="3" />
                </svg>
                Start Instant Meeting
              </button>
            </div>

            <div className="mlp-divider-or">
              <span>Or join existing</span>
            </div>

            <form className="mlp-join-form" onSubmit={handleJoinMeeting}>
              <div className="mlp-input-group">
                <span className="mlp-input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  type="text"
                  className="mlp-join-input"
                  placeholder="Enter meeting code or link"
                  value={meetingCode}
                  onChange={(e) => setMeetingCode(e.target.value)}
                />
              </div>
              <button type="submit" className="mlp-btn-glass mlp-join-btn">
                Join
              </button>
            </form>
          </div>

          {/* Trust Highlights */}
          <div className="mlp-hero-chips">
            <span className="mlp-chip-item">
              <span className="mlp-chip-icon">✓</span> 100% In-Browser
            </span>
            <span className="mlp-chip-item">
              <span className="mlp-chip-icon">✓</span> 1080p Crystal Audio
            </span>
            <span className="mlp-chip-item">
              <span className="mlp-chip-icon">✓</span> End-to-End Encrypted
            </span>
          </div>
        </div>

        {/* Right Column: Live Animated Meeting Stage (Replaces Static Image) */}
        <div className="mlp-hero-stage-wrapper">
          {/* Floating Metric Badges */}
          <div className="mlp-floating-badge mlp-badge-top">
            <div className="mlp-badge-icon-wrap" style={{ color: 'var(--mlp-secondary)' }}>
              ⚡
            </div>
            <div>
              <p className="mlp-badge-title">18ms Latency</p>
              <p className="mlp-badge-sub">Adaptive WebRTC</p>
            </div>
          </div>

          <div className="mlp-floating-badge mlp-badge-bottom">
            <div className="mlp-badge-icon-wrap" style={{ color: 'var(--mlp-emerald)' }}>
              🛡️
            </div>
            <div>
              <p className="mlp-badge-title">256-Bit Encrypted</p>
              <p className="mlp-badge-sub">Direct Peer-to-Peer</p>
            </div>
          </div>

          {/* Mock Interactive Meeting Room Window */}
          <div className="mlp-call-window">
            {/* Window Top Bar */}
            <div className="mlp-call-header">
              <div className="mlp-call-header-left">
                <div className="mlp-call-timer">
                  <span className="mlp-rec-dot"></span>
                  <span>{formatTime(callDuration)}</span>
                </div>
                <span className="mlp-call-title">Product & Design Sync</span>
              </div>
              <div className="mlp-call-header-right">
                <span className="mlp-encryption-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Secured
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--mlp-text-dim)' }}>
                  4 Connected
                </span>
              </div>
            </div>

            {/* Video Participant 2x2 Grid */}
            <div className="mlp-participants-grid">
              {/* Floating Reactions Overlay */}
              <div className="mlp-reactions-overlay">
                {reactions.map((r) => (
                  <span
                    key={r.id}
                    className="mlp-floating-reaction"
                    style={{ left: r.left }}
                  >
                    {r.emoji}
                  </span>
                ))}
              </div>

              {/* Tile 1: Active Speaker (Sarah Miller) with Audio Waveform */}
              <div className="mlp-video-tile mlp-tile-active-speaker">
                {!isMuted && (
                  <div className="mlp-soundwave" title="Speaking">
                    <span className="mlp-soundwave-bar"></span>
                    <span className="mlp-soundwave-bar"></span>
                    <span className="mlp-soundwave-bar"></span>
                    <span className="mlp-soundwave-bar"></span>
                    <span className="mlp-soundwave-bar"></span>
                  </div>
                )}
                <div className="mlp-tile-avatar mlp-avatar-1">
                  SM
                </div>
                <div className="mlp-tile-footer">
                  <span className="mlp-tile-name">Sarah Miller</span>
                  <span className="mlp-tile-icon" style={{ color: 'var(--mlp-emerald)' }}>
                    🎙️
                  </span>
                </div>
              </div>

              {/* Tile 2: Alex Chen */}
              <div className="mlp-video-tile">
                <div className="mlp-tile-avatar mlp-avatar-2">
                  AC
                </div>
                <div className="mlp-tile-footer">
                  <span className="mlp-tile-name">Alex Chen</span>
                  <span className="mlp-tile-icon" style={{ color: 'var(--mlp-rose)' }}>
                    🔇
                  </span>
                </div>
              </div>

              {/* Tile 3: Screen Share Simulation (Elena) */}
              <div className="mlp-video-tile">
                <div className="mlp-tile-screenshare">
                  <div className="mlp-code-preview">
                    <div className="mlp-code-line"></div>
                    <div className="mlp-code-line"></div>
                    <div className="mlp-code-line"></div>
                  </div>
                </div>
                <div className="mlp-tile-footer">
                  <span className="mlp-tile-name">Elena (Sharing Screen)</span>
                  <span className="mlp-tile-icon" style={{ color: 'var(--mlp-secondary)' }}>
                    🖥️
                  </span>
                </div>
              </div>

              {/* Tile 4: You (Host) */}
              <div className="mlp-video-tile" style={{ opacity: isVideoOff ? 0.6 : 1 }}>
                <div className="mlp-tile-avatar mlp-avatar-4">
                  {isVideoOff ? '👤' : 'You'}
                </div>
                <div className="mlp-tile-footer">
                  <span className="mlp-tile-name">You (Host)</span>
                  <span className="mlp-tile-icon">
                    {isVideoOff ? '📷 Off' : '✨ HD'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Interactive Control Dock */}
            <div className="mlp-call-controls">
              <div className="mlp-controls-left">
                {/* Microphone Toggle */}
                <button
                  className={`mlp-ctrl-btn ${isMuted ? 'off' : 'active'}`}
                  onClick={() => setIsMuted(!isMuted)}
                  title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                >
                  {isMuted ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="1" y1="1" x2="23" y2="23" />
                      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                  )}
                </button>

                {/* Camera Toggle */}
                <button
                  className={`mlp-ctrl-btn ${isVideoOff ? 'off' : 'active'}`}
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
                >
                  {isVideoOff ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="1" y1="1" x2="23" y2="23" />
                      <path d="M21 21l-4.5-4.5M21 7l-5 4v2" />
                      <rect x="2" y="6" width="14" height="12" rx="3" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 10l5-4v12l-5-4v-4z" />
                      <rect x="2" y="6" width="13" height="12" rx="3" />
                    </svg>
                  )}
                </button>

                {/* Screen Share Toggle */}
                <button
                  className={`mlp-ctrl-btn ${isScreenSharing ? 'active' : ''}`}
                  onClick={() => setIsScreenSharing(!isScreenSharing)}
                  title="Share Screen"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                </button>
              </div>

              {/* Interactive Emoji Reaction Bar */}
              <div className="mlp-reaction-picker" title="Click to send live reaction">
                {['❤️', '👏', '🔥', '🎉'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className="mlp-react-btn"
                    onClick={() => triggerReaction(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <div className="mlp-controls-right">
                <button
                  className="mlp-ctrl-btn mlp-ctrl-end"
                  onClick={() => alert('Demo Call: Click "Start Instant Meeting" or "Log In" above to start your actual meeting!')}
                  title="Leave Meeting"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-6-6 19.8 19.8 0 0 1-3.12-8.69A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
                    <line x1="23" y1="1" x2="1" y2="23" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Feature Highlights Section (Only Logical & Essential Capabilities) */}
      <section id="features" className="mlp-features-section">
        <div className="mlp-section-header">
          <span className="mlp-section-tag">Essential Features</span>
          <h2 className="mlp-section-title">Built for Speed, Clarity, and Connection</h2>
          <p className="mlp-section-subtitle">
            Every feature is designed to reduce friction and help you connect instantly with anyone.
          </p>
        </div>

        <div className="mlp-features-grid">
          {/* Card 1: 1-Click Meetings */}
          <div className="mlp-feature-card">
            <div className="mlp-feat-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <h3 className="mlp-feat-title">Instant 1-Click Rooms</h3>
            <p className="mlp-feat-desc">
              Generate instant room links or custom join codes in milliseconds. Invite teammates or friends with zero configuration.
            </p>
          </div>

          {/* Card 2: Adaptive HD Audio & Video */}
          <div className="mlp-feature-card">
            <div className="mlp-feat-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 7l-7 5 7 5V7z" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </div>
            <h3 className="mlp-feat-title">Ultra HD Video & Audio</h3>
            <p className="mlp-feat-desc">
              WebRTC peer-to-peer streaming dynamically adjusts quality to match bandwidth, ensuring smooth 60 FPS video and crisp voice.
            </p>
          </div>

          {/* Card 3: In-Call Collaboration & Real-Time Chat */}
          <div className="mlp-feature-card">
            <div className="mlp-feat-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3 className="mlp-feat-title">Live In-Call Chat</h3>
            <p className="mlp-feat-desc">
              Share links, drop notes, and exchange messages in real-time during your call without disrupting the ongoing conversation.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="mlp-steps-section">
        <div className="mlp-section-header">
          <span className="mlp-section-tag">Simple 3-Step Flow</span>
          <h2 className="mlp-section-title">Up and Running in 30 Seconds</h2>
          <p className="mlp-section-subtitle">No complicated setups. No sign-up friction.</p>
        </div>

        <div className="mlp-steps-grid">
          <div className="mlp-step-item">
            <span className="mlp-step-number">01</span>
            <h3 className="mlp-step-title">Create or Join Room</h3>
            <p className="mlp-step-desc">
              Click Start Instant Meeting to generate a room, or type in an existing code from your host.
            </p>
          </div>

          <div className="mlp-step-item">
            <span className="mlp-step-number">02</span>
            <h3 className="mlp-step-title">Share the Code</h3>
            <p className="mlp-step-desc">
              Send your room code or URL to team members. They can join directly from any modern web browser.
            </p>
          </div>

          <div className="mlp-step-item">
            <span className="mlp-step-number">03</span>
            <h3 className="mlp-step-title">Collaborate in HD</h3>
            <p className="mlp-step-desc">
              Enjoy high-definition video, crystal audio, screen sharing, and real-time chat with full privacy.
            </p>
          </div>
        </div>
      </section>

      {/* Security Section & Call to Action Banner */}
      <section id="security" className="mlp-cta-section">
        <div className="mlp-cta-card">
          <h2 className="mlp-cta-title">Ready for Smoother Video Meetings?</h2>
          <p className="mlp-cta-sub">
            Join thousands of users having fast, clear, and secure video conversations every day on MeetFlow.
          </p>
          <div className="mlp-cta-btns">
            <button
              className="mlp-btn-gradient"
              style={{ padding: '14px 34px', fontSize: '1.05rem' }}
              onClick={() => navigate('/auth', { state: { formMode: 1 } })}
            >
              Get Started Free
            </button>
            <button
              className="mlp-btn-glass"
              style={{ padding: '14px 28px', fontSize: '1.05rem' }}
              onClick={handleInstantMeeting}
            >
              Launch Instant Meeting
            </button>
          </div>
        </div>
      </section>

      {/* Minimal Clean Footer */}
      <footer className="mlp-footer">
        <div className="mlp-footer-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: '700', color: 'white' }}>MeetFlow</span>
            <span>© {new Date().getFullYear()} MeetFlow Inc. All rights reserved.</span>
          </div>

          <div className="mlp-footer-status">
            <span className="mlp-pulse-dot"></span>
            <span>All Systems Operational</span>
          </div>

          <ul className="mlp-footer-links">
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
  );
}
