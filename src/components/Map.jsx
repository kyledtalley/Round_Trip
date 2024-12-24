import React, { useEffect, useRef } from "react";

const Map = ({ directions, center }) => {
  const mapRef = useRef(null);
  const directionsRendererRef = useRef(null);

  // init the map once when the component mounts or if "center" changes
  useEffect(() => {
    // make sure the Google API is loaded
    if (!window.google) {
      console.error("Google Maps JavaScript API not loaded.");
      return;
    }
    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 10,
      center: center || { lat: 37.681874, lng: -121.758582 },
    });

    
    const directionsRenderer = new window.google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);
    directionsRendererRef.current = directionsRenderer;
  }, [center]);

  
  useEffect(() => {
    if (directions && directionsRendererRef.current) {
      directionsRendererRef.current.setDirections(directions);
    }
  }, [directions]);

  
  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "100%",
      }}
    />
  );
};

export default Map;
