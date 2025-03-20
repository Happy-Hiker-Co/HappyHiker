import { useEffect, useRef } from "react"
import mapboxgl from "mapbox-gl"

mapboxgl.accessToken = "MAPBOX_TOKEN"

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
      })
    }

    if (trailCoordinates && trailCoordinates.length > 0) {
      map.current.flyTo({ center: trailCoordinates[0], zoom: 13 })

      if (map.current.getSource("trail")) {
        map.current.getSource("trail").setData({
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: trailCoordinates,
          },
        })
      } else {
        map.current.on("load", () => {
          map.current.addSource("trail", {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: trailCoordinates,
              },
            },
          })
          map.current.addLayer({
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
  }, [center, trailCoordinates])

  return <div ref={mapContainer} style={{ width: "100%", height: "500px" }} />
}

export default Map
