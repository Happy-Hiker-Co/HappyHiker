import { useState, useEffect } from "react"
import axios from "axios"

const Search = ({ onSearch }) => {
  const [destinationPoint, setDestinationPoint] = useState("")
  const [startPoint, setStartPoint] = useState("")
  const [activeFilter, setActiveFilter] = useState(null)
  const [filteredTrails, setFilteredTrails] = useState([])
  const [startPointError, setStartPointError] = useState("")
  const [destinationPointError, setDestinationPointError] = useState("")
  const [trails, setTrails] = useState([]) // Store backend trails

  // Fetch trails from backend on component mount
  useEffect(() => {
    const fetchTrails = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/trails/")
        setTrails(
          Array.isArray(response.data) ? response.data : [response.data],
        ) // Handle array or single object
        // Do not set filteredTrails here to keep it empty until a filter is applied
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
    // Toggle: If the same filter is clicked again, hide the results
    if (activeFilter === filter) {
      setActiveFilter(null)
      setFilteredTrails([]) // Clear the displayed trails
      return
    }

    setActiveFilter(filter)

    let results = [...trails]
    if (filter === "dogFriendly") {
      results = results.filter((trail) => trail.is_dog_friendly)
    } else if (filter === "difficulty") {
      results = results.filter(
        (trail) => trail.difficulty.toLowerCase() === "moderate",
      )
    } else if (filter === "popularity") {
      results.sort((a, b) => b.id - a.id) // Placeholder sorting by ID
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
    minWidth: "27vw",
    width: "27vw",
    wordWrap: "break-word",
    marginLeft: "5px",
    marginBottom: "10px",
    lineHeight: "1.2",
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
            placeholder="Enter starting trail (e.g., Become a Yosemite Junior Ranger)"
            style={{
              padding: "5px",
              marginBottom: "5px",
              minWidth: "27vw",
              borderRadius: "5px",
            }}
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
            placeholder="Enter destination trail (e.g., Ride a bike in Yosemite Valley)"
            style={{
              padding: "5px",
              marginBottom: "5px",
              minWidth: "27vw",
              borderRadius: "5px",
            }}
          />
          {destinationPointError && (
            <div style={errorStyle}>{destinationPointError}</div>
          )}
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

      {activeFilter && (
        <div style={{ marginTop: "20px" }}>
          <h3>Available Trails:</h3>
          {filteredTrails.length > 0 ? (
            filteredTrails.map((trail) => (
              <div
                key={trail.id}
                style={{
                  border: "1px solid #ddd",
                  padding: "10px",
                  marginBottom: "10px",
                  borderRadius: "5px",
                }}
              >
                <h4>{trail.name}</h4>
                <p>Distance: {trail.distance} miles</p>
                <p>Elevation: {trail.elevation} feet</p>
                <p>Difficulty: {trail.difficulty}</p>
                <p>Dog-Friendly: {trail.is_dog_friendly ? "Yes" : "No"}</p>
                {trail.images.length > 0 && (
                  <img
                    src={trail.images[0].image}
                    alt={trail.images[0].caption}
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                )}
              </div>
            ))
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

// import { useState } from "react"
// import axios from "axios"

// const Search = ({ onSearch }) => {
//   const [trailName, setTrailName] = useState("")
//   const [startPoint, setStartPoint] = useState("")
//   const [activeFilter, setActiveFilter] = useState(null)
//   const [filteredTrails, setFilteredTrails] = useState([])
//   const [startPointError, setStartPointError] = useState("")
//   const [trailNameError, setTrailNameError] = useState("")

//   const sampleTrails = [
//     {
//       name: "Half Dome",
//       distance: 14.2,
//       dogFriendly: false,
//       difficulty: "hard",
//       popularity: 4.9,
//     },
//     {
//       name: "Yosemite Falls",
//       distance: 7.2,
//       dogFriendly: false,
//       difficulty: "moderate",
//       popularity: 4.7,
//     },
//     {
//       name: "Mirror Lake",
//       distance: 2.4,
//       dogFriendly: true,
//       difficulty: "easy",
//       popularity: 4.3,
//     },
//     {
//       name: "Glacier Point",
//       distance: 1.0,
//       dogFriendly: true,
//       difficulty: "easy",
//       popularity: 4.8,
//     },
//   ]

//   const searchTrail = async () => {
//     // Reset errors before validation
//     setStartPointError("")
//     setTrailNameError("")

//     // Check if fields are populated
//     if (!startPoint) {
//       setStartPointError(
//         "Both starting point and destination point must be populated.",
//       )
//       return
//     }
//     if (!trailName) {
//       setTrailNameError(
//         "Both starting point and destination point must be populated.",
//       )
//       return
//     }

//     try {
//       const originResponse = await axios.post(
//         "/api/places/v1/places:searchText",
//         { textQuery: `${startPoint} trailhead Yosemite National Park` },
//         {
//           headers: {
//             "Content-Type": "application/json",
//             "X-Goog-Api-Key": import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
//             "X-Goog-FieldMask": "places.id,places.location",
//           },
//         },
//       )
//       const originPlace = originResponse.data.places[0]
//       console.log(originPlace) // logs starting location
//       if (!originPlace) {
//         setStartPointError("Starting point not found in Google Places")
//         return
//       }
//       const originLatLng = originPlace.location

//       const placesResponse = await axios.post(
//         "/api/places/v1/places:searchText",
//         { textQuery: `${trailName} Yosemite National Park` },
//         {
//           headers: {
//             "Content-Type": "application/json",
//             "X-Goog-Api-Key": import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
//             "X-Goog-FieldMask": "places.id,places.location",
//           },
//         },
//       )
//       const place = placesResponse.data.places[0]
//       if (!place) {
//         setTrailNameError("Trail not found in Google Places")
//         return
//       }
//       const placeId = place.id
//       const destinationLatLng = place.location
//       console.log(destinationLatLng) // logs destination latlng
//       const routePayload = {
//         origin: {
//           location: {
//             latLng: {
//               latitude: originLatLng.latitude,
//               longitude: originLatLng.longitude,
//             },
//           },
//         },
//         destination: { placeId },
//         travelMode: "WALK",
//       }

//       const routesResponse = await axios.post(
//         "/api/routes/directions/v2:computeRoutes",
//         routePayload,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             "X-Goog-Api-Key": import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
//             "X-Goog-FieldMask":
//               "routes.polyline.encodedPolyline,routes.distanceMeters",
//           },
//         },
//       )
//       const route = routesResponse.data.routes[0]
//       if (!route || !route.polyline?.encodedPolyline) {
//         setTrailNameError("Route not found")
//         return
//       }

//       const path = decodePolyline(route.polyline.encodedPolyline)
//       const distanceMeters = route.distanceMeters || 0
//       const distanceMiles = (distanceMeters * 0.000621371).toFixed(2)
//       const distanceKm = (distanceMeters / 1000).toFixed(2)

//       const sampledPoints = path.filter(
//         (_, i) => i % Math.max(1, Math.floor(path.length / 100)) === 0,
//       )
//       const elevationResponse = await axios.get(
//         "/api/google/maps/api/elevation/json",
//         {
//           params: {
//             locations: sampledPoints.map((p) => `${p[1]},${p[0]}`).join("|"),
//             key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
//           },
//         },
//       )
//       const elevations = elevationResponse.data.results.map((r) => r.elevation)
//       let elevationGain = 0
//       for (let i = 1; i < elevations.length; i++) {
//         const diff = elevations[i] - elevations[i - 1]
//         if (diff > 0) elevationGain += diff
//       }
//       const elevationGainFeet = (elevationGain * 3.28084).toFixed(2)

//       onSearch({
//         trailCoordinates: path,
//         origin: [originLatLng.longitude, originLatLng.latitude],
//         destination: [destinationLatLng.longitude, destinationLatLng.latitude],
//         distance: { miles: distanceMiles, km: distanceKm },
//         elevationGain: elevationGainFeet,
//       })
//     } catch (error) {
//       console.error("API Error:", error.response?.data || error.message)
//       setTrailNameError("Could not locate the trail or starting point")
//     }
//   }

//   const handleKeyPress = (e) => {
//     if (e.key === "Enter") {
//       e.preventDefault()
//       searchTrail()
//     }
//   }

//   const applyFilter = (filter) => {
//     if (activeFilter === filter && filteredTrails.length > 0) {
//       setActiveFilter(null)
//       setFilteredTrails([])
//       return
//     }

//     setActiveFilter(filter)

//     let results = [...sampleTrails]
//     if (filter === "dogFriendly") {
//       results = results.filter((trail) => trail.dogFriendly)
//     } else if (filter === "difficulty") {
//       results = results.filter((trail) => trail.difficulty === "moderate")
//     } else if (filter === "popularity") {
//       results.sort((a, b) => b.popularity - a.popularity)
//     }

//     setFilteredTrails(results)
//   }

//   const getTrails = async () => {

//   }

//   const buttonStyle = (filter) => ({
//     padding: "5px 10px",
//     marginRight: "10px",
//     backgroundColor: activeFilter === filter ? "#4CAF50" : "#f0f0f0",
//     color: activeFilter === filter ? "white" : "black",
//     border: "1px solid #ccc",
//     borderRadius: "5px",
//     cursor: "pointer",
//   })

//   const errorStyle = {
//     color: "red",
//     fontSize: "12px",
//     minWidth: "27vw",
//     width: "27vw",
//     wordWrap: "break-word",
//     marginLeft: "5px",
//     marginBottom: "10px",
//     lineHeight: "1.2",
//   }

//   return (
//     <div className="search-container">
//       <form onSubmit={(e) => e.preventDefault()}>
//         <div style={{ marginTop: "10px" }}>
//           <input
//             type="text"
//             value={startPoint}
//             onChange={(e) => {
//               setStartPoint(e.target.value)
//               setStartPointError("")
//             }}
//             onKeyPress={handleKeyPress}
//             placeholder="Enter starting point (e.g., Happy Isles)"
//             style={{
//               padding: "5px",
//               marginBottom: "5px",
//               minWidth: "27vw",
//               borderRadius: "5px",
//             }}
//           />
//           {startPointError && <div style={errorStyle}>{startPointError}</div>}
//         </div>
//         <div>
//           <input
//             type="text"
//             value={trailName}
//             onChange={(e) => {
//               setTrailName(e.target.value)
//               setTrailNameError("")
//             }}
//             onKeyPress={handleKeyPress}
//             placeholder="Enter destination point (e.g., Half Dome)"
//             style={{
//               padding: "5px",
//               marginBottom: "5px",
//               minWidth: "27vw",
//               borderRadius: "5px",
//             }}
//           />
//           {trailNameError && <div style={errorStyle}>{trailNameError}</div>}
//         </div>
//       </form>

//       <div style={{ marginTop: "20px" }}>
//         <button
//           style={buttonStyle("dogFriendly")}
//           onClick={() => applyFilter("dogFriendly")}
//         >
//           Dog-Friendly
//         </button>
//         <button
//           style={buttonStyle("difficulty")}
//           onClick={() => applyFilter("difficulty")}
//         >
//           Difficulty Level
//         </button>
//         <button
//           style={buttonStyle("popularity")}
//           onClick={() => applyFilter("popularity")}
//         >
//           Popularity
//         </button>
//       </div>

//       {filteredTrails.length > 0 && (
//         <div style={{ marginTop: "20px" }}>
//           <h3>Filtered Trails:</h3>
//           {filteredTrails.map((trail, index) => (
//             <div
//               key={index}
//               style={{
//                 border: "1px solid #ddd",
//                 padding: "10px",
//                 marginBottom: "10px",
//                 borderRadius: "5px",
//               }}
//             >
//               <h4>{trail.name}</h4>
//               <p>Distance: {trail.distance} miles</p>
//               <p>Dog-Friendly: {trail.dogFriendly ? "Yes" : "No"}</p>
//               <p>Difficulty: {trail.difficulty}</p>
//               <p>Popularity: {trail.popularity}/5</p>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }

// function decodePolyline(encoded) {
//   let points = []
//   let index = 0,
//     len = encoded.length
//   let lat = 0,
//     lng = 0

//   while (index < len) {
//     let b,
//       shift = 0,
//       result = 0
//     do {
//       b = encoded.charCodeAt(index++) - 63
//       result |= (b & 0x1f) << shift
//       shift += 5
//     } while (b >= 0x20)
//     let dlat = result & 1 ? ~(result >> 1) : result >> 1
//     lat += dlat

//     shift = 0
//     result = 0
//     do {
//       b = encoded.charCodeAt(index++) - 63
//       result |= (b & 0x1f) << shift
//       shift += 5
//     } while (b >= 0x20)
//     let dlng = result & 1 ? ~(result >> 1) : result >> 1
//     lng += dlng

//     points.push([lng * 1e-5, lat * 1e-5])
//   }
//   return points
// }

// export default Search
