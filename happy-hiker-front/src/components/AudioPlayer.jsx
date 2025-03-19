import React, { useState } from "react";
import ReactHowler from "react-howler";

const AudioPlayer = () => {
  const [playing, setPlaying] = useState(false);

 

  return (
    <div>
      <ReactHowler src="https://happyhiker-audio.s3.us-east-2.amazonaws.com/file_example_MP3_700KB.mp3" playing={playing} />
      <button onClick={() => setPlaying(!playing)}>
        {playing ? "Pause" : "Play"}
      </button>
    </div>
  );
};

export default AudioPlayer;

