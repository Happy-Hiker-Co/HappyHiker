import { useState } from "react"
import axios from "axios"

const Search = ({ onSearch }) => {
  const [trailName, setTrailName] = useState("")
  const [startPoint, setStartPoint] = useState("")
  const [activeFilter, setActiveFilter] = useState(null)
  const [filteredTrails, setFilteredTrails] = useState([])
  const [startPointError, setStartPointError] = useState("") // Error for startPoint
  const [trailNameError, setTrailNameError] = useState("") // Error for trailName

  const sampleTrails = [
    {
      name: "Half Dome",
      distance: 14.2,
      dogFriendly: false,
      difficulty: "hard",
      popularity: 4.9,
    },
    {
      name: "Yosemite Falls",
      distance: 7.2,
      dogFriendly: false,
      difficulty: "moderate",
      popularity: 4.7,
    },
    {
      name: "Mirror Lake",
      distance: 2.4,
      dogFriendly: true,
      difficulty: "easy",
      popularity: 4.3,
    },
    {
      name: "Glacier Point",
      distance: 1.0,
      dogFriendly: true,
      difficulty: "easy",
      popularity: 4.8,
    },
  ]

  const searchTrail = async () => {
    // Reset errors before validation
    setStartPointError("")
    setTrailNameError("")

    // Check if fields are populated
    if (!startPoint) {
      setStartPointError(
        "Both starting point and destination point must be populated",
      )
      return
    }
    if (!trailName) {
      setTrailNameError(
        "Both starting point and destination point must be populated",
      )
      return
    }

    try {
      const originResponse = await axios.post(
        "/api/places/v1/places:searchText",
        { textQuery: `${startPoint} trailhead Yosemite National Park` },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
            "X-Goog-FieldMask": "places.id,places.location",
          },
        },
      )
      const originPlace = originResponse.data.places[0]
      if (!originPlace) {
        setStartPointError("Starting point not found in Google Places")
        return
      }
      const originLatLng = originPlace.location

      const placesResponse = await axios.post(
        "/api/places/v1/places:searchText",
        { textQuery: `${trailName} Yosemite National Park` },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
            "X-Goog-FieldMask": "places.id,places.location",
          },
        },
      )
      const place = placesResponse.data.places[0]
      if (!place) {
        setTrailNameError("Trail not found in Google Places")
        return
      }
      const placeId = place.id
      const destinationLatLng = place.location

      const routePayload = {
        origin: {
          location: {
            latLng: {
              latitude: originLatLng.latitude,
              longitude: originLatLng.longitude,
            },
          },
        },
        destination: { placeId },
        travelMode: "WALK",
      }

      const routesResponse = await axios.post(
        "/api/routes/directions/v2:computeRoutes",
        routePayload,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
            "X-Goog-FieldMask":
              "routes.polyline.encodedPolyline,routes.distanceMeters",
          },
        },
      )
      const route = routesResponse.data.routes[0]
      if (!route || !route.polyline?.encodedPolyline) {
        setTrailNameError("Route not found")
        return
      }

      const path = decodePolyline(route.polyline.encodedPolyline)
      const distanceMeters = route.distanceMeters || 0
      const distanceMiles = (distanceMeters * 0.000621371).toFixed(2)
      const distanceKm = (distanceMeters / 1000).toFixed(2)

      const sampledPoints = path.filter(
        (_, i) => i % Math.max(1, Math.floor(path.length / 100)) === 0,
      )
      const elevationResponse = await axios.get(
        "/api/google/maps/api/elevation/json",
        {
          params: {
            locations: sampledPoints.map((p) => `${p[1]},${p[0]}`).join("|"),
            key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
          },
        },
      )
      const elevations = elevationResponse.data.results.map((r) => r.elevation)
      let elevationGain = 0
      for (let i = 1; i < elevations.length; i++) {
        const diff = elevations[i] - elevations[i - 1]
        if (diff > 0) elevationGain += diff
      }
      const elevationGainFeet = (elevationGain * 3.28084).toFixed(2)

      onSearch({
        trailCoordinates: path,
        origin: [originLatLng.longitude, originLatLng.latitude],
        destination: [destinationLatLng.longitude, destinationLatLng.latitude],
        distance: { miles: distanceMiles, km: distanceKm },
        elevationGain: elevationGainFeet,
      })
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message)
      setTrailNameError("Could not locate the trail or starting point")
    }
  }

  // Handle Enter key press on individual inputs
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      searchTrail()
    }
  }

  const applyFilter = (filter) => {
    if (activeFilter === filter && filteredTrails.length > 0) {
      setActiveFilter(null)
      setFilteredTrails([])
      return
    }

    setActiveFilter(filter)

    let results = [...sampleTrails]
    if (filter === "dogFriendly") {
      results = results.filter((trail) => trail.dogFriendly)
    } else if (filter === "difficulty") {
      results = results.filter((trail) => trail.difficulty === "moderate")
    } else if (filter === "popularity") {
      results.sort((a, b) => b.popularity - a.popularity)
    }

    setFilteredTrails(results)
  }

  const buttonStyle = (filter) => ({
    padding: "5px 10px",
    marginRight: "10px",
    backgroundColor: activeFilter === filter ? "#4CAF50" : "#f0f0f0",
    color: activeFilter === filter ? "white" : "black",
    border: "1px solid #ccc",
    borderRadius: "5px",
    cursor: "pointer",
  })

  const errorStyle = {
    color: "red",
    fontSize: "12px",
    marginTop: "5px",
  }

  return (
    <div style={{ margin: "20px" }}>
      <form onSubmit={(e) => e.preventDefault()}>
        <div>
          <input
            type="text"
            value={startPoint}
            onChange={(e) => {
              setStartPoint(e.target.value)
              setStartPointError("") // Clear error when typing
            }}
            onKeyPress={handleKeyPress}
            placeholder="Enter starting point (e.g., Happy Isles)"
            style={{
              padding: "5px",
              marginRight: "10px",
              marginBottom: "10px",
            }}
          />
          {startPointError && <div style={errorStyle}>{startPointError}</div>}
        </div>
        <div>
          <input
            type="text"
            value={trailName}
            onChange={(e) => {
              setTrailName(e.target.value)
              setTrailNameError("") // Clear error when typing
            }}
            onKeyPress={handleKeyPress}
            placeholder="Enter destination point (e.g., Half Dome)"
            style={{ padding: "5px", marginRight: "10px" }}
          />
          {trailNameError && <div style={errorStyle}>{trailNameError}</div>}
        </div>
      </form>

      <div style={{ marginTop: "20px" }}>
        <button
          style={buttonStyle("dogFriendly")}
          onClick={() => applyFilter("dogFriendly")}
        >
          Dog-Friendly
        </button>
        <button
          style={buttonStyle("difficulty")}
          onClick={() => applyFilter("difficulty")}
        >
          Difficulty Level
        </button>
        <button
          style={buttonStyle("popularity")}
          onClick={() => applyFilter("popularity")}
        >
          Popularity
        </button>
      </div>

      {filteredTrails.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Filtered Trails:</h3>
          {filteredTrails.map((trail, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "5px",
              }}
            >
              <h4>{trail.name}</h4>
              <p>Distance: {trail.distance} miles</p>
              <p>Dog-Friendly: {trail.dogFriendly ? "Yes" : "No"}</p>
              <p>Difficulty: {trail.difficulty}</p>
              <p>Popularity: {trail.popularity}/5</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function decodePolyline(encoded) {
  let points = []
  let index = 0,
    len = encoded.length
  let lat = 0,
    lng = 0

  while (index < len) {
    let b,
      shift = 0,
      result = 0
    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    let dlat = result & 1 ? ~(result >> 1) : result >> 1
    lat += dlat

    shift = 0
    result = 0
    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    let dlng = result & 1 ? ~(result >> 1) : result >> 1
    lng += dlng

    points.push([lng * 1e-5, lat * 1e-5])
  }
  return points
}

export default Search
