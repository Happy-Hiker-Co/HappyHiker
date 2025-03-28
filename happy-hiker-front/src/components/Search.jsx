import { useState, useEffect, useRef } from "react"
import axios from "axios"

const Search = ({ onSearch }) => {
  const [destinationPoint, setDestinationPoint] = useState("")
  const [startPoint, setStartPoint] = useState("")
  const [activeFilter, setActiveFilter] = useState(null)
  const [filteredTrails, setFilteredTrails] = useState([])
  const [startPointError, setStartPointError] = useState("")
  const [destinationPointError, setDestinationPointError] = useState("")
  const [trails, setTrails] = useState([])
  const [isFirstSelection, setIsFirstSelection] = useState(true)
  const [visibleResults, setVisibleResults] = useState(12)
  const startInputRef = useRef(null)
  const destInputRef = useRef(null)

  // Fetch trails from backend on component mount
  useEffect(() => {
    const fetchTrails = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/trails/")
        console.log(response)
        setTrails(
          Array.isArray(response.data) ? response.data : [response.data],
        )
      } catch (error) {
        console.error("Error fetching trails:", error)
      }
    }
    fetchTrails()
  }, [])

  const searchTrail = async () => {
    setStartPointError("")
    setDestinationPointError("")

    if (!startPoint) {
      setStartPointError(
        "Both starting point and destination point must be populated.",
      )
      return
    }
    if (!destinationPoint) {
      setDestinationPointError(
        "Both starting point and destination point must be populated.",
      )
      return
    }

    try {
      const startTrail = trails.find(
        (trail) => trail.name.toLowerCase() === startPoint.toLowerCase(),
      )
      if (!startTrail) {
        setStartPointError("Starting point trail not found in database")
        return
      }
      const originLatLng = {
        latitude: startTrail.lat,
        longitude: startTrail.long,
      }

      const destTrail = trails.find(
        (trail) => trail.name.toLowerCase() === destinationPoint.toLowerCase(),
      )
      if (!destTrail) {
        setDestinationPointError("Destination trail not found in database")
        return
      }
      const destinationLatLng = {
        latitude: destTrail.lat,
        longitude: destTrail.long,
      }

      const routePayload = {
        origin: {
          location: {
            latLng: {
              latitude: originLatLng.latitude,
              longitude: originLatLng.longitude,
            },
          },
        },
        destination: {
          location: {
            latLng: {
              latitude: destinationLatLng.latitude,
              longitude: destinationLatLng.longitude,
            },
          },
        },
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
        setDestinationPointError("Route not found between these points")
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

      setActiveFilter(null)
      setFilteredTrails([])
      setVisibleResults(12)
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message)
      setDestinationPointError("Could not route between the trails")
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      searchTrail()
    }
  }

  const applyFilter = (filter) => {
    if (activeFilter === filter) {
      setActiveFilter(null)
      setFilteredTrails([])
      setVisibleResults(12)
      return
    }

    setActiveFilter(filter)
    setVisibleResults(12)

    let results = [...trails]
    if (filter === "dogFriendly") {
      results = results.filter((trail) => trail.is_dog_friendly)
    } else if (filter === "difficulty") {
      results = results.filter(
        (trail) => trail.difficulty.toLowerCase() === "moderate",
      )
    } else if (filter === "favorites") {
      results.sort((a, b) => b.id - a.id)
    }

    setFilteredTrails(results)
  }

  const handleTrailClick = (trailName) => {
    if (!startPoint) {
      setStartPoint(trailName)
      setStartPointError("")
      if (destinationPoint && startInputRef.current) {
        startInputRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        })
        startInputRef.current.focus()
      }
    } else if (!destinationPoint) {
      setDestinationPoint(trailName)
      setDestinationPointError("")
      if (startInputRef.current) {
        startInputRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        })
        startInputRef.current.focus()
      }
    } else {
      setStartPoint(trailName)
      setStartPointError("")
      setDestinationPoint("")
      setDestinationPointError("")
    }
    if (startPoint && destinationPoint) {
      setIsFirstSelection(true)
    }
  }

  const handleShowMore = () => {
    if (visibleResults >= filteredTrails.length) {
      // If all results are shown, hide back to initial 12
      setVisibleResults(12)
    } else {
      // Show 12 more results
      setVisibleResults((prev) => prev + 12)
    }
  }

  const buttonStyle = (filter) => ({
    padding: "5px 10px",
    backgroundColor: activeFilter === filter ? "#4CAF50" : "#f0f0f0",
    color: activeFilter === filter ? "white" : "black",
    border: "1px solid #ccc",
    borderRadius: "5px",
    cursor: "pointer",
  })

  const showMoreButtonStyle = {
    padding: "8px 16px",
    backgroundColor: "#007BFF",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "20px",
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
  }

  const errorStyle = {
    color: "red",
    fontSize: "12px",
    minWidth: "27vw",
    width: "27vw",
    wordWrap: "break-word",
    marginLeft: "5px",
    marginBottom: "10px",
    lineHeight: "1.2",
  }

  const trailContainerStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    justifyContent: "space-around",
    marginTop: "20px",
  }

  const trailStyle = {
    display: "flex",
    alignItems: "center",
    width: "300px",
    border: "1px solid #ddd",
    padding: "10px",
    borderRadius: "5px",
    cursor: "pointer",
    backgroundColor: "#f9f9f9",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  }

  const trailInfoStyle = {
    flex: 1,
    paddingRight: "10px",
  }

  const trailImageStyle = {
    width: "100px",
    height: "100px",
    objectFit: "cover",
    borderRadius: "5px",
  }

  return (
    <div className="search-container">
      <form onSubmit={(e) => e.preventDefault()}>
        <div style={{ marginTop: "10px" }}>
          <input
            type="text"
            value={startPoint}
            onChange={(e) => {
              setStartPoint(e.target.value)
              setStartPointError("")
            }}
            onKeyPress={handleKeyPress}
            placeholder="Enter starting trail (e.g., Lower Yosemite Fall Trailhead"
            style={{
              padding: "5px",
              marginBottom: "5px",
              minWidth: "27vw",
              borderRadius: "5px",
            }}
            ref={startInputRef}
          />
          {startPointError && <div style={errorStyle}>{startPointError}</div>}
        </div>
        <div>
          <input
            type="text"
            value={destinationPoint}
            onChange={(e) => {
              setDestinationPoint(e.target.value)
              setDestinationPointError("")
            }}
            onKeyPress={handleKeyPress}
            placeholder="Enter destination trail (e.g., John Muir Trail)"
            style={{
              padding: "5px",
              marginBottom: "5px",
              minWidth: "27vw",
              borderRadius: "5px",
            }}
            ref={destInputRef}
          />
          {destinationPointError && (
            <div style={errorStyle}>{destinationPointError}</div>
          )}
        </div>
      </form>

      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
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
          style={buttonStyle("favorites")}
          onClick={() => applyFilter("favorites")}
        >
          Favorites
        </button>
      </div>

      {activeFilter && (
        <div style={{ marginTop: "20px" }}>
          <h3 style={{ marginLeft: "30px" }}>Available Trail Locations:</h3>
          {filteredTrails.length > 0 ? (
            <>
              <div style={trailContainerStyle}>
                {filteredTrails.slice(0, visibleResults).map((trail) => (
                  <div
                    key={trail.id}
                    style={trailStyle}
                    onClick={() => handleTrailClick(trail.name)}
                  >
                    <div style={trailInfoStyle}>
                      <h4 style={{ margin: "0 0 5px 0" }}>{trail.name}</h4>
                      <p style={{ margin: "2px 0" }}>Latitude: {trail.lat}</p>
                      <p style={{ margin: "2px 0" }}>Longitude: {trail.long}</p>
                      <p style={{ margin: "2px 0" }}>
                        Difficulty: {trail.difficulty}
                      </p>
                      <p style={{ margin: "2px 0" }}>
                        Dog-Friendly: {trail.is_dog_friendly ? "Yes" : "No"}
                      </p>
                    </div>
                    {trail.images.length > 0 && (
                      <img
                        src={trail.images[0].image}
                        alt={trail.images[0].caption}
                        style={trailImageStyle}
                      />
                    )}
                  </div>
                ))}
              </div>
              {filteredTrails.length > 12 && (
                <button style={showMoreButtonStyle} onClick={handleShowMore}>
                  {visibleResults >= filteredTrails.length
                    ? "Hide Results"
                    : "Show More Results"}
                </button>
              )}
            </>
          ) : (
            <p>No search results found that meet the selected criteria.</p>
          )}
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
