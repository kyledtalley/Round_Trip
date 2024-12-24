import React, { useState, useRef } from "react";
import { Autocomplete } from "@react-google-maps/api";

const LocationForm = ({ onDirectionsReady, setMapCenter }) => {
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [routeLocations, setRouteLocations] = useState([]);
  const [isUsingCurrentStart, setIsUsingCurrentStart] = useState(false);
  const [isUsingCurrentEnd, setIsUsingCurrentEnd] = useState(false);

  // store Autocomplete instances in a ref so they persist across renders
  const autocompleteRefs = useRef({});

  // add a blank route entry
  const addRouteLocation = () => {
    setRouteLocations((prev) => [
      ...prev,
      { id: crypto.randomUUID(), address: "" }
    ]);
  };

  // update the address of a particular route
  const updateRouteLocation = (id, newValue) => {
    setRouteLocations((prev) =>
      prev.map((loc) => (loc.id === id ? { ...loc, address: newValue } : loc))
    );
  };

  // remove a route by array index
  const removeRouteLocation = (index) => {
    setRouteLocations((prev) => prev.filter((_, i) => i !== index));
  };

  // when the user submits the form, build the directions request and call onDirectionsReady
  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!startLocation || routeLocations.length === 0) {
      alert("Please provide valid start and route locations.");
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();

    // convert route locations into Google waypoints
    const waypoints = routeLocations.map((loc) => ({
      location: loc.address,
      stopover: true,
    }));

    const request = {
      origin: startLocation,
      destination: endLocation || startLocation,
      waypoints,
      optimizeWaypoints: true,
      travelMode: window.google.maps.TravelMode.DRIVING,
    };

    directionsService.route(request, (result, status) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        // Instead of calling setDirections, call onDirectionsReady
        onDirectionsReady(result);
      } else {
        console.error("Directions request failed:", status);
      }
    });
  };

  // helper to get the user's current location and set in the form
  const getCurrentLocation = (setLocation, setIsUsingCurrent) => {
    if (navigator.geolocation) {
      setIsUsingCurrent(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const latLng = new window.google.maps.LatLng(latitude, longitude);

          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: latLng }, (results, status) => {
            if (
              status === window.google.maps.GeocoderStatus.OK &&
              results[0]
            ) {
              setLocation(results[0].formatted_address);
              setMapCenter({ lat: latitude, lng: longitude });
            } else {
              alert("Failed to retrieve your location. Please try again.");
              setIsUsingCurrent(false);
            }
          });
        },
        (error) => {
          alert(
            "Location access denied or unavailable. You can manually enter your location."
          );
          console.error("Geolocation error:", error.message);
          setIsUsingCurrent(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setIsUsingCurrent(false);
    }
  };

  // called when a place is selected in Autocomplete
  const onPlaceChanged = (index, setLocation, autocompleteRef) => {
    if (autocompleteRef && autocompleteRef.getPlace) {
      const place = autocompleteRef.getPlace();
      if (place && place.formatted_address) {
        setLocation(place.formatted_address);
        // If it's one of the middle route waypoints
        if (index !== null) {
          updateRouteLocation(index, place.formatted_address);
        }
      } else {
        console.warn("Place or formatted_address is undefined.");
      }
    } else {
      console.warn("Autocomplete reference is not initialized.");
    }
  };

  return (
    <form onSubmit={handleFormSubmit}>
      {/* Start Location */}
      <div className="form-group">
        <label>Start Location:</label>
        <Autocomplete
          onLoad={(autocomplete) => (autocompleteRefs.current.start = autocomplete)}
          onPlaceChanged={() =>
            onPlaceChanged(null, setStartLocation, autocompleteRefs.current.start)
          }
        >
          <input
            type="text"
            value={startLocation}
            onChange={(e) => setStartLocation(e.target.value)}
            placeholder="Enter start location"
            disabled={isUsingCurrentStart}
          />
        </Autocomplete>
        <button
          type="button"
          onClick={() => getCurrentLocation(setStartLocation, setIsUsingCurrentStart)}
        >
          Use Current
        </button>
      </div>

      {/* Middle Routes */}
      <div className="middle-routes-container">
        {routeLocations.map(({ id, address }, index) => (
          <div key={id}>
            <Autocomplete
              onLoad={(autocomplete) => {
                //save autocomplete instance by ID
                autocompleteRefs.current[id] = autocomplete;
              }}
              onPlaceChanged={() => {
                const instance = autocompleteRefs.current[id];
                if (!instance) {
                  console.warn("Autocomplete instance not ready yet.");
                  return;
                }
                const place = instance.getPlace();
                if (place && place.formatted_address) {
                  updateRouteLocation(id, place.formatted_address);
                } else {
                  console.warn("Place or formatted_address is undefined.");
                }
              }}
            >
              <input
                type="text"
                value={address}
                onChange={(e) => updateRouteLocation(id, e.target.value)}
                placeholder="Enter location"
              />
            </Autocomplete>

            <button type="button" onClick={() => removeRouteLocation(index)}>
              Remove This Route
            </button>
          </div>
        ))}

        <button type="button" onClick={addRouteLocation}>
          Add Route Location
        </button>
      </div>

      {/* End Location */}
      <div className="form-group">
        <label>End Location (optional):</label>
        <Autocomplete
          onLoad={(autocomplete) => (autocompleteRefs.current.end = autocomplete)}
          onPlaceChanged={() =>
            onPlaceChanged(null, setEndLocation, autocompleteRefs.current.end)
          }
        >
          <input
            type="text"
            value={endLocation}
            onChange={(e) => setEndLocation(e.target.value)}
            placeholder="Enter end location"
            disabled={isUsingCurrentEnd}
          />
        </Autocomplete>
        <button
          type="button"
          onClick={() => getCurrentLocation(setEndLocation, setIsUsingCurrentEnd)}
        >
          Use Current
        </button>
      </div>

      <button type="submit">Generate Route</button>
    </form>
  );
};

export default LocationForm;
