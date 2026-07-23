import React from 'react';
import '../App.css';
import {Link} from 'react-router-dom';

export default function landingPage() {
  return <div className="landingPageContainer">
    <nav>
      <div className="navHeader">
        <h2>Apna Video Call</h2>
      </div>
      <div className="navList">
        <p>Join as Guest</p>
        <p>Register</p>
        <div role = "button">
          <p>Login</p>
        </div>
      </div>
    </nav>


    <div className="landingMainContainer">

      <div>
        <h1><span style={{color: "#FF9839"}}>connect</span> <span style={{color: "white"}}>with your loved ones</span></h1>
        <p style={{textAlign:"left"}}>cover a distance by apna video call</p>
        <div role="button">
          <Link to={"/home"}>Get Started</Link>
        </div>
      </div>

      <div>
        <img src="/mobile.png"/>
      </div>

    </div>
  </div>;
}

