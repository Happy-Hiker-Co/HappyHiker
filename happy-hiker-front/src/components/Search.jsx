import { useState } from "react"
import axios from "axios"

const Search = ({ onSearch }) => {
  const [trailName, setTrailName] = useState("")
  const [startPoint, setStartPoint] = useState("")

  const searchTrail = async () => {
    if (!trailName) return alert("Please enter a trail name")
    if (!startPoint) return alert("Please enter a starting point")

    try {
      // Get origin coordinates
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
      console.log("Origin Response:", originResponse.data)

      const originPlace = originResponse.data.places[0]
      if (!originPlace) {
        alert("Starting point not found in Google Places")
        return
      }
      const originLatLng = originPlace.location

      // Get destination (trail) placeId and coordinates
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
      console.log("Places Response:", placesResponse.data)

      const place = placesResponse.data.places[0]
      if (!place) {
        alert("Trail not found in Google Places")
        return
      }
      const placeId = place.id
      const destinationLatLng = place.location
      console.log("Place ID:", placeId)

      // Compute route with distance
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
      console.log("Routes Request:", routePayload)

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
      console.log("Routes Response:", routesResponse.data)

      const route = routesResponse.data.routes[0]
      if (!route || !route.polyline?.encodedPolyline) {
        alert("Route not found")
        return
      }

      const path = decodePolyline(route.polyline.encodedPolyline)
      const distanceMeters = route.distanceMeters || 0
      const distanceMiles = (distanceMeters * 0.000621371).toFixed(2) // Meters to miles
      const distanceKm = (distanceMeters / 1000).toFixed(2) // Meters to km

      // Sample points for elevation (e.g., every 10th point or max 100)
      const sampledPoints = path.filter(
        (_, i) => i % Math.max(1, Math.floor(path.length / 100)) === 0,
      )
      const elevationResponse = await axios.get(
        "/api/google/maps/api/elevation/json",
        {
          params: {
            locations: sampledPoints.map((p) => `${p[1]},${p[0]}`).join("|"), // lat,lng format
            key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
          },
        },
      )
      console.log("Elevation Response:", elevationResponse.data)

      const elevations = elevationResponse.data.results.map((r) => r.elevation)
      let elevationGain = 0
      for (let i = 1; i < elevations.length; i++) {
        const diff = elevations[i] - elevations[i - 1]
        if (diff > 0) elevationGain += diff // Sum positive changes
      }
      const elevationGainFeet = (elevationGain * 3.28084).toFixed(2) // Meters to feet

      onSearch({
        trailCoordinates: path,
        origin: [originLatLng.longitude, originLatLng.latitude],
        destination: [destinationLatLng.longitude, destinationLatLng.latitude],
        distance: { miles: distanceMiles, km: distanceKm },
        elevationGain: elevationGainFeet, // In feet
      })
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message)
      alert("Could not locate the trail or starting point")
    }
  }

  return (
    <div style={{ margin: "20px" }}>
      <input
        type="text"
        value={startPoint}
        onChange={(e) => setStartPoint(e.target.value)}
        placeholder="Enter starting point (e.g., Happy Isles)"
        style={{ padding: "5px", marginRight: "10px", marginBottom: "10px" }}
      />
      <input
        type="text"
        value={trailName}
        onChange={(e) => setTrailName(e.target.value)}
        placeholder="Enter destination point (e.g., Half Dome)"
        style={{ padding: "5px", marginRight: "10px" }}
      />
      <button onClick={searchTrail}>Search</button>
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
