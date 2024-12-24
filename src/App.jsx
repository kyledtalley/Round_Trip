import React, { useState } from "react";
import { LoadScript } from "@react-google-maps/api";
import LandingPage from "./components/LandingPage";
import LocationForm from "./components/LocationForm";
import Map from "./components/Map";
import RouteDetails from "./components/RouteDetails";
import { getElevationsForLocations } from "./utils/ElevationService";
import roundTripLogo from './assets/RoundTripLogo.png'
import "./App.css";

function App() {
  // track whether we've "entered" the main app
  const [showLanding, setShowLanding] = useState(true);

  const [directions, setDirections] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [elevations, setElevations] = useState(null);

  const handleDirectionsReady = (result) => {
    setDirections(result);
    const route = result.routes?.[0];
    if (!route) return;

    // fetch elevation data...
    const legs = route.legs || [];
    const locations = legs.map((leg) => ({
      lat: leg.start_location.lat(),
      lng: leg.start_location.lng(),
    }));
    getElevationsForLocations(locations)
      .then((results) => setElevations(results))
      .catch((err) => console.error("Elevation error:", err));
  };

  const handleEnter = () => {
    setShowLanding(false);
  };

  return (
    <>
      {showLanding && <LandingPage onEnter={handleEnter} />}

      <div className="app-background" />

      <LoadScript
        googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
        libraries={["places"]}
      >
        {!showLanding && (
          <div className="app-container">
            <img
              src={roundTripLogo}
              alt="Round Trip Logo"
              style={{ width: "350px", margin: "0 auto", display: "block" }}
            />
            <div className="main-content">
              <div className="form-container">
                <LocationForm
                  onDirectionsReady={handleDirectionsReady}
                  setMapCenter={setMapCenter}
                />
              </div>
              <div className="map-container">
                <Map directions={directions} center={mapCenter} />
              </div>
            </div>
            <RouteDetails directions={directions} elevationData={elevations} />
          </div>
        )}
      </LoadScript>
    </>
  );
}

export default App;
