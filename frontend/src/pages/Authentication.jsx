import * as React from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Snackbar } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/AuthPage.css";
import "../styles/MeetFlow_DesignSystem.css";

export default function Authentication() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const router = useNavigate();
  const location = useLocation();
  const [formState, setFormState] = useState(0);

  const [open, setOpen] = React.useState(false);

  const { handleRegister, handleLogin } = React.useContext(AuthContext);

  useEffect(() => {
    if (location.state?.formMode !== undefined) {
      setFormState(location.state.formMode);
    }
  }, [location.state]);


  let handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (formState === 0) {
        await handleLogin(username, password);
      }
      if (formState === 1) {
        let result = await handleRegister(email, username, password);
        setMessage(result);
        setOpen(true);
        setError("");
        await handleLogin(username, password);
      }
    } catch (err) {
      console.log(err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong. Please try again.";
      setError(message);
    }
  };

  return (
    <div className="auth-minimal-container">
      <div className="auth-card glass-panel glitter-sedge">
        <div className="auth-tabs">
          <button
            type="button"
            className={`tab-btn ${formState === 0 ? 'active' : ''}`}
            onClick={() => { setFormState(0); setError(""); }}
          >Sign In</button>
          <button
            type="button"
            className={`tab-btn ${formState === 1 ? 'active' : ''}`}
            onClick={() => { setFormState(1); setError(""); }}
          >Sign Up</button>
        </div>


        <div className="auth-logo-section">
          <img src="/meetflow_logo.jpg.jpg"
            alt="MeetFlow Logo"
            style={{ width: '50px', height: '50px', borderRadius: '12px' }}
          />
          <h2 className="logo-text">MeetFlow</h2>
        </div>

        <form className="auth-form" onSubmit={handleAuth}>
          {formState === 1 && (
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                className="glass-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              className="glass-input"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              className="glass-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="btn-primary auth-submit">
            {formState === 0 ? "Login" : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          {formState === 0 ? (
            <p>Don't have an account? <span onClick={() => { setFormState(1); setError(""); }}>Sign Up</span></p>
          ) : (
            <p>Already have an account? <span onClick={() => { setFormState(0); setError(""); }}>Sign In</span></p>
          )}
        </div>
      </div>

      <Snackbar open={open}
        autoHideDuration={4000}
        message={message}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
