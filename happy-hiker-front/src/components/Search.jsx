import { useState } from "react"
import axios from "axios"

const Search = ({ onSearch }) => {
  const [trailName, setTrailName] = useState("")

  const searchTrail = async () => {
    if (!trailName) return alert("Please enter a trail name")

    try {
      const npsResponse = await axios.get(
        "https://developer.nps.gov/api/v1/places",
        {
          params: {
            api_key: "NPS_API_KEY",
            parkCode: "yose",
            q: trailName,
          },
        },
      )

      const places = npsResponse.data.data
      if (places.length > 0) {
        const trail = places[0]
        const [lng, lat] = trail.latitudeLongitude.split(",").map(Number)
        onSearch({ center: [lng, lat] })
      } else {
        await fallbackSearch(trailName)
      }
    } catch (error) {
      console.error("NPS API Error:", error)
      await fallbackSearch(trailName)
    }
  }

  const fallbackSearch = async (name) => {
    try {
      const query = `
                [out:json];
                (
                    way["highway"="path"]["name"~"${name}",i](37.5,-119.7,38.0,-119.2);
                    way["highway"="footway"]["name"~"${name}",i](37.5,-119.7,38.0,-119.2);
                );
                out geom;
            `
      const overpassResponse = await axios.post(
        "https://overpass-api.de/api/interpreter",
        query,
      )
      const trails = overpassResponse.data.elements

      if (trails.length > 0) {
        const trail = trails[0]
        const coordinates = trail.geometry.map((point) => [
          point.lon,
          point.lat,
        ])
        onSearch({ trailCoordinates: coordinates })
      } else {
        alert("Trail not found")
      }
    } catch (error) {
      console.error("OSM Error:", error)
      alert("Could not locate the trail")
    }
  }

  return (
    <div style={{ margin: "20px" }}>
      <input
        type="text"
        value={trailName}
        onChange={(e) => setTrailName(e.target.value)}
        placeholder="Enter trail name (e.g., Mist Trail)"
        style={{ padding: "5px", marginRight: "10px" }}
      />
      <button onClick={searchTrail}>Search</button>
    </div>
  )
}

export default Search
