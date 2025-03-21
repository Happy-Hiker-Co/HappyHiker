import * as React from 'react';
import { useState, useEffect, useRef } from "react";
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import ReactHowler from "react-howler";
import Happy_Hiker_Logo from "../assets/Happy_Hiker_Logo.jpg"

export default function AudioPlayer() {
  //track and change volume
  const [volume, setVolume] = useState(50)
  // track button status 
  const [clickedButton, setClickedButton] = useState(null)
  // key is used to force player to reset (play from start)
  const [audioKey, setAudioKey] = useState(0)
  //keeps the reference to the interval - need to stop when we de-select
  const intervalRef = useRef(null)

  // forces a re-render by incrementing value of audiokey - this will start play when a button is selected
  const playAudio = () => {
    setAudioKey((prevKey) => prevKey + 1)
  }

  const handleClick = (time) => {
    if (clickedButton !== time) {
      // set time once you choose a button
      setClickedButton(time);
    } else {
      // toggle off if button is clicked again
      setClickedButton(null);  
    }
  }

  const stopAudio = () => {
    // Stop the interval
    clearInterval(intervalRef.current)
    // Reset the selected time
    setClickedButton(null) 
  };

  useEffect(() => {
    // the use effect will wait for a button click and set accordingely 
    if (clickedButton) {
      const timeInMs = {
        "30s": 30000,
        "1m": 60000,
        "2m": 120000,
      }[clickedButton]
      
      //calls play audio
      playAudio()

      intervalRef.current = setInterval(() => {
        // Re-trigger audio play on interval
        playAudio() 
      }, timeInMs)

      //used here to clean and stop interval
      return () => clearInterval(intervalRef.current)
    }
  }, [clickedButton])
  
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "20px", background:"#F5F5DC", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)", borderRadius: "10px"}}>
      <img src={Happy_Hiker_Logo} alt="Left Logo" style={{ width: "100px", height: "100px" }} />
        <div>
          <ReactHowler
          key={audioKey}
          src="https://happyhiker-audio.s3.us-east-2.amazonaws.com/Check+in+with+yourself.+How+does+your+body+feel++What%E2%80%99s+your+energy+level.mp3"
          // Play only if a button is selected
          playing={clickedButton !== null} 
          volume={volume / 100}
          initialVolume={50}
        />
      
        <div>
          <label htmlFor="slider" style={{ color: "#f15a29"}} >Volume</label>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            className="slider"
            onChange={(e) => setVolume(Number(e.target.value))}
            style={{
              marginBottom:"20px",
              accentColor:"#F15A29",
              width: "100%",
            }}
          />
          <Stack direction="row" spacing={2}>
            <Button 
              variant={clickedButton === '30s' ? 'contained' : 'outlined'}
              onClick={() => handleClick('30s')}
              sx={{
                color: clickedButton === '30s' ? "#000000" : "#F15A29", // Black text for contained, orange for outlined
                backgroundColor: clickedButton === '30s' ? "#6B8E23" : "transparent", // Olive Green for contained
                borderColor: clickedButton === '30s' ? "#6B8E23" : "#F15A29", // Olive Green border for contained, orange border for outlined
                "&:hover": {
                  backgroundColor: clickedButton === '30s' ? "#6B8E23" : "transparent", // Same hover color as the background
                  borderColor: clickedButton === '30s' ? "#6B8E23" : "#F15A29", // Same hover border as the selected button
                }
               }}
              >
              30 seconds
              </Button>
              <Button
                variant={clickedButton === '1m' ? 'contained' : 'outlined'}
                onClick={() => handleClick('1m')}
                sx={{
                color: clickedButton === '1m' ? "#000000" : "#F15A29", // Black text for contained, orange for outlined
                backgroundColor: clickedButton === '1m' ? "#6B8E23" : "transparent", // Olive Green for contained
                borderColor: clickedButton === '1m' ? "#6B8E23" : "#F15A29", // Olive Green border for contained, orange border for outlined
                "&:hover": {
                  backgroundColor: clickedButton === '1m' ? "#6B8E23" : "transparent", // Same hover color as the background
                  borderColor: clickedButton === '1m' ? "#6B8E23" : "#F15A29", // Same hover border as the selected button
                }
                }}
              >
              1 min
              </Button>
              <Button
                variant={clickedButton === '2m' ? 'contained' : 'outlined'}
                onClick={() => handleClick('2m')}
                sx={{
                  color: clickedButton === '2m' ? "#000000" : "#F15A29", // Black text for contained, orange for outlined
                  backgroundColor: clickedButton === '2m' ? "#6B8E23" : "transparent", // Olive Green for contained
                  borderColor: clickedButton === '2m' ? "#6B8E23" : "#F15A29", // Olive Green border for contained, orange border for outlined
                  "&:hover": {
                  backgroundColor: clickedButton === '2m' ? "#6B8E23" : "transparent", // Same hover color as the background
                  borderColor: clickedButton === '2m' ? "#6B8E23" : "#F15A29", // Same hover border as the selected button
                }
                }}
              >
              2 min
              </Button>
            </Stack>
            <h4 style={{ color: "#F15A29"}}> Select how often you would like to hear a message</h4>
          </div>
        </div>
      <img src={Happy_Hiker_Logo} alt="Right Logo" style={{ width: "100px", height: "100px" }} />
    </div>
  )
}
