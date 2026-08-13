import React from 'react';
import '../App.css';
import { Link } from 'react-router-dom';

export default function landingPage() {
  return <div className="landingPageContainer">
    <nav>
      <div className="navHeader">
        <h2>Apna Video Call</h2>
      </div>
      <div className="navList">
        <div role="button">
          <Link to="/auth" state={{ formMode: 1 }} style={{ textDecoration: 'none', color: 'inherit' }}>
            <p>Register</p>
          </Link>
        </div>
        <div role="button">
          <Link to="/auth" state={{ formMode: 0 }} style={{ textDecoration: 'none', color: 'inherit' }}>
            <p>Login</p>
          </Link>
        </div>
      </div>
    </nav>


    <div className="landingMainContainer">

      <div>
        <h1><span style={{ color: "#FF9839" }}>connect</span> <span style={{ color: "white" }}>with your loved ones</span></h1>
        <p style={{ textAlign: "left" }}>cover a distance by apna video call</p>
        <div role="button">
          <Link to={"/auth"}>Get Started</Link>
        </div>
      </div>

      <div>
        <img src="/mobile.png" />
      </div>

    </div>
  </div>;
}

