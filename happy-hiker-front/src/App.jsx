
import { useState } from 'react'
import './App.css'
import AudioPlayer from './components/AudioPlayer'
import Search from "./components/Search"
import Map from "./components/Map"


function App() {
  const [mapData, setMapData] = useState({
    center: null,
    trailCoordinates: null,
  })

  const handleSearch = (data) => {
    setMapData(data)
  }

  return (
    <>

      < AudioPlayer />

      <h1>map and stuff goes here!</h1>
      <Search onSearch={handleSearch} />
      <Map
        center={mapData.center}
        trailCoordinates={mapData.trailCoordinates}
      />

    </>
  )
}

export default App
