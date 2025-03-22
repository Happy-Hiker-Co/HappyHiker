import { useEffect, useRef } from "react"
import mapboxgl from "mapbox-gl"

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

const Map = ({
  trailCoordinates,
  origin,
  destination,
  distance,
  elevationGain,
}) => {
  const mapContainer = useRef(null)
  const map = useRef(null)

  useEffect(() => {
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/outdoors-v11",
        center: [-119.5383, 37.8651],
        zoom: 9,
        interactive: true,
      })
    }

    const currentMap = map.current

    // Add route
    if (trailCoordinates && trailCoordinates.length > 0) {
      currentMap.on("load", () => {
        const trailData = {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: trailCoordinates,
          },
        }

        if (currentMap.getSource("trail")) {
          currentMap.getSource("trail").setData(trailData)
        } else {
          currentMap.addSource("trail", {
            type: "geojson",
            data: trailData,
          })
          currentMap.addLayer({
            id: "trail-layer",
            type: "line",
            source: "trail",
            paint: {
              "line-color": "#FF0000",
              "line-width": 3,
              "line-dasharray": [2, 2],
            },
          })
        }

        const bounds = trailCoordinates.reduce(
          (bounds, coord) => bounds.extend(coord),
          new mapboxgl.LngLatBounds(trailCoordinates[0], trailCoordinates[0]),
        )
        currentMap.fitBounds(bounds, { padding: 50 })
      })

      if (currentMap.isStyleLoaded()) {
        if (currentMap.getSource("trail")) {
          currentMap.getSource("trail").setData({
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: trailCoordinates,
            },
          })
        }
      }
    }

    // Add markers
    if (origin && origin.length === 2) {
      new mapboxgl.Marker({ color: "#000000" })
        .setLngLat(origin)
        .addTo(currentMap)
    }
    if (destination && destination.length === 2) {
      new mapboxgl.Marker({ color: "#FF0000" })
        .setLngLat(destination)
        .addTo(currentMap)
    }

    // Add info overlay
    if (distance && elevationGain) {
      const infoDiv = document.createElement("div")
      infoDiv.style.position = "absolute"
      infoDiv.style.top = "10px"
      infoDiv.style.left = "10px"
      infoDiv.style.background = "rgba(255, 255, 255, 0.8)"
      infoDiv.style.padding = "5px 10px"
      infoDiv.style.borderRadius = "3px"
      infoDiv.innerHTML = `
                <strong>Distance:</strong> ${distance.miles} mi (${distance.km} km)<br>
                <strong>Elevation Gain:</strong> ${elevationGain} ft
            `
      mapContainer.current.appendChild(infoDiv)
    }

    return () => {
      if (currentMap) {
        currentMap.remove()
        map.current = null
      }
    }
  }, [trailCoordinates, origin, destination, distance, elevationGain])

  return <div ref={mapContainer} style={{ width: "100%", height: "500px" }} />
}

export default Map
