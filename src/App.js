import * as React from "react";
import { ethers } from "ethers";
import './App.css';

export default function App() {

  const wave = () => {
    
  }
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
         🔆 gm!
        </div>

        <div className="bio">
        "We say good morning to each other because we are a friendly happy optimistic global community and it is nice to say good morning to your friends as you start your day" - 6529
        </div>

        <button className="waveButton" onClick={wave}>
          Say gm
        </button>
      </div>
    </div>
  );
}
