import "./App.css"
import React, { useState } from 'react'
import { UserTokenProvider } from './contexts/UserTokenContext'
import { UserInfoProvider } from "./contexts/UserContext"
import { AudioProvider } from './contexts/AudioContext'
import Search from "./components/Search"
import Map from "./components/Map"
import BottomNavBar from "./components/BottomNavBar"
import LoginButton from "./components/LoginButton"
import LogoutButton from "./components/LogoutButton"
import { useAuth0 } from "@auth0/auth0-react";
import RegisterUserWithBackend from "./components/RegisterUserWithBackend"

function App() {
  const { isAuthenticated, user, isLoading } = useAuth0();

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

  if (isLoading) return <p>Loading...</p>;

  return (
    <>
      <UserTokenProvider>
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
      </UserTokenProvider>
      {isAuthenticated ? (
        <p>Logged in as {user.name}</p>
      ) : (
        <p>Not logged in</p>
      )}
      <LoginButton />
      {isAuthenticated && <RegisterUserWithBackend />}
      <LogoutButton />
    </>
  )
}

export default App
