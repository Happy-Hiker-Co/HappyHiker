import { useState } from "react"
import "./App.css"
import AudioPlayer from "./components/AudioPlayer"
import Search from "./components/Search"
import Map from "./components/Map"

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
      <Search onSearch={handleSearch} />
      <Map
        trailCoordinates={trailData.trailCoordinates}
        origin={trailData.origin}
        destination={trailData.destination}
        distance={trailData.distance}
        elevationGain={trailData.elevationGain}
      />
      <AudioPlayer />
    </>
  )
}

export default App
