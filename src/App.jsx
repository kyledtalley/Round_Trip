import React, { useState } from "react";
import { LoadScript } from "@react-google-maps/api";
import LocationForm from "./components/LocationForm";
import Map from "./components/Map";
import RouteDetails from "./components/RouteDetails";
import { getElevationsForLocations } from "./utils/ElevationService"; // if you have an ElevationService utility
import "./App.css"; // optional for styling

function App() {
  const [directions, setDirections] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [elevations, setElevations] = useState(null);

  // This function is called by LocationForm when directions are successfully fetched
  const handleDirectionsReady = (result) => {
    // 1) Store the directions in state
    setDirections(result);

    // 2) (Optional) fetch elevation data for each leg’s start location
    const route = result.routes?.[0];
    if (!route) return;

    const legs = route.legs || [];
    // Gather lat/lng of each leg's start
    const locations = legs.map((leg) => ({
      lat: leg.start_location.lat(),
      lng: leg.start_location.lng(),
    }));

    // 3) Call the ElevationService utility if you want to display elevation data
    getElevationsForLocations(locations)
      .then((results) => {
        setElevations(results);
      })
      .catch((err) => console.error("Elevation error:", err));
  };

  return (
    <LoadScript
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
      libraries={["places"]}
    >
      <div className="app-container">
        <h1>Round Trip Route with Elevation</h1>

        <div className="main-content">
          {/* FORM COLUMN */}
          <div className="form-container">
            <LocationForm
              // Instead of passing setDirections directly, pass handleDirectionsReady
              // so we can do additional logic (like fetching elevation) in App.
              onDirectionsReady={handleDirectionsReady}
              setMapCenter={setMapCenter}
            />
          </div>

          {/* MAP COLUMN */}
          <div className="map-container">
            <Map directions={directions} center={mapCenter} />
          </div>
        </div>

        {/* Display route details (distance, duration, toll warnings, elevation, etc.) */}
        <RouteDetails directions={directions} elevationData={elevations} />
      </div>
    </LoadScript>
  );
}

export default App;
