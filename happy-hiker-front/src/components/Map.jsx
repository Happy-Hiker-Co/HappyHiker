import { useEffect, useRef } from "react"
import mapboxgl from "mapbox-gl"

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

const Map = ({ center, trailCoordinates }) => {
  const mapContainer = useRef(null)
  const map = useRef(null)

  useEffect(() => {
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/outdoors-v11",
        center: center || [-119.5383, 37.8651],
        zoom: 9,
        interactive: true,
      })
    }

    const currentMap = map.current
    if (center && center.length === 2) {
      currentMap.flyTo({ center, zoom: 12 })
    }

    if (trailCoordinates && trailCoordinates.length > 0) {
      currentMap.flyTo({ center: trailCoordinates[0], zoom: 13 })

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
        currentMap.on("load", () => {
          currentMap.addSource("trail", {
            type: "geojson",
            data: trailData,
          })
          currentMap.addLayer({
            id: "trail-layer",
            type: "line",
            source: "trail",
            paint: {
              "line-color": "#ff0000",
              "line-width": 3,
            },
          })
        })
      }
    }
    return () => {
      if (currentMap) {
        currentMap.remove()
        map.current = null
      }
    }
  }, [center, trailCoordinates])

  return <div ref={mapContainer} style={{ width: "100%", height: "500px" }} />
}

export default Map
