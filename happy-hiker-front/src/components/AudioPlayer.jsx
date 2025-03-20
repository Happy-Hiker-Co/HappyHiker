import React, { useState } from "react";
import ReactHowler from "react-howler";

const AudioPlayer = () => {
  const [playing, setPlaying] = useState(false);
  // need to make a state to control volume
  const [volume, setVolume] = useState(50)

 

  return (
    <div className="Audio-Player">
      <ReactHowler src="https://happyhiker-audio.s3.us-east-2.amazonaws.com/Breathe+in+confidence%2C+exhale+doubt.mp3" 
        playing={playing}
        volume = { volume / 100 }
        initialVolume = {50}
      />
      <button onClick={() => setPlaying(!playing)}>
        {playing ? "Pause" : "Play"}
      </button>
      <div>
        <label for="slider">Volume</label>
        <input
          type = "range"
          min = "0"
          max = "100"
          value = { volume }
          className = "slider"
          onChange={(e) => setVolume(Number(e.target.value))}
        />
      </div>
    </div>
  );
};

export default AudioPlayer;

