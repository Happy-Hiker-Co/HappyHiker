import './App.css'
import React, { useState } from 'react'
import { AudioProvider } from './contexts/AudioContext'
import AudioPlayer from './components/AudioPlayer'

function App() {
 

  return (
    <>
      <AudioProvider>
        < AudioPlayer />
      </AudioProvider>
    </>
  )
}

export default App
