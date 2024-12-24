//takes lat/lng and returns a promise of elevation info from google
export function getElevationsForLocations(locations) {
    return new Promise((resolve, reject) => {
      if (!window.google?.maps?.ElevationService) {
        return reject(new Error("Google Maps ElevationService is not available."));
      }
  
      const elevator = new window.google.maps.ElevationService();
  
      elevator.getElevationForLocations({ locations }, (results, status) => {
        if (status === window.google.maps.ElevationStatus.OK) {
          // results is an array of objects: [{ elevation, location, resolution }]
          resolve(results);
        } else {
          reject(new Error(`Elevation request failed with status: ${status}`));
        }
      });
    });
  }
  