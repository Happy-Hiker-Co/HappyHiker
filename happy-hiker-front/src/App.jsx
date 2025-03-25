import "./App.css"
import React, { useState } from 'react'
import { UserTokenProvider } from './contexts/UserTokenContext'
import { UserInfoProvider } from "./contexts/UserContext"
import { AudioProvider } from './contexts/AudioContext'
import Search from "./components/Search"
import Map from "./components/Map"
import BottomNavBar from "./components/BottomNavBar"

function App() {
  const [trailData, setTrailData] = useState({
    trailCoordinates: [],
    origin: null,
    destination: null,
    distance: null,
    elevationGain: null,
  })

  const handleSearch = ({
    trailCoordinates,
    origin,
    destination,
    distance,
    elevationGain,
  }) => {
    setTrailData({
      trailCoordinates,
      origin,
      destination,
      distance,
      elevationGain,
    })
  }

  return (
    <>
      <userTokenProvider>
        <UserInfoProvider>
          <AudioProvider>
            <Search onSearch={handleSearch} />
            <Map
              trailCoordinates={trailData.trailCoordinates}
              origin={trailData.origin}
              destination={trailData.destination}
              distance={trailData.distance}
              elevationGain={trailData.elevationGain}
            />
            < BottomNavBar /> 
          </AudioProvider>
        </UserInfoProvider>
      </userTokenProvider>
    </>
  )
}

export default App
