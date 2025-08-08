import React from "react";
import Nav from './Components/Nav'
import About from "./pages/About";
import Skills from "./pages/Skills";

import './css/App.css'
import SolarSystem from "./Components/SolarSystem";

function App() {

  return (
    <>
      <div className="nav-solar">
        <div className="nav">
          <Nav/>
        </div>
        <SolarSystem/>
      </div>
      <About/>
      <Skills/>
      
    </>
  )
}

export default App
