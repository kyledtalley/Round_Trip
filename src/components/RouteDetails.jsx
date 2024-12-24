import React from "react";
import { AnimatePresence, motion } from "framer-motion";

const RouteDetails = ({ directions, elevationData }) => {
  if (!directions) return null;
  const route = directions.routes[0];
  if (!route) return null;

  const { warnings = [] } = route;
  const legs = route.legs || [];

  // A simple variant for the container
  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        // We'll stagger children a bit for a sequential reveal
        staggerChildren: 0.05,
      },
    },
    exit: { opacity: 0, y: 10 },
  };

  // A simple variant for each item (leg or warning)
  const itemVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.2 },
    },
  };

  return (
    <AnimatePresence>
      {/* The entire container animates in and out */}
      <motion.div
        className="route-details-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <h3>Route Details:</h3>

        {/* Warnings (often mentions tolls, closures, etc.) */}
        {warnings.length > 0 && (
          <motion.div
            style={{ color: "red", marginBottom: "1rem" }}
            variants={itemVariants}
          >
            <strong>Warnings:</strong>
            <ul>
              {warnings.map((warning, i) => (
                // Each warning can be an item, too
                <motion.li key={i} variants={itemVariants}>
                  {warning}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Animate each leg */}
        {legs.map((leg, i) => {
          // If you fetched elevation data for each leg's start:
          const elevationInfo = elevationData?.[i] || null;

          return (
            <motion.div
              key={i}
              style={{ marginBottom: "1rem" }}
              variants={itemVariants}
            >
              <p>
                <strong>Leg {i + 1}:</strong> {leg.start_address} &rarr;{" "}
                {leg.end_address}
              </p>
              <p>Distance: {leg.distance.text}</p>
              <p>Duration: {leg.duration.text}</p>
              {elevationInfo && (
                <p>
                  Elevation at start: {elevationInfo.elevation.toFixed(2)} meters
                </p>
              )}
            </motion.div>
          );
        })}

        <motion.a
          href={getGoogleMapsLink(legs)}
          target="_blank"
          rel="noopener noreferrer"
          variants={itemVariants}
          style={{ display: "inline-block", marginTop: "1rem" }}
        >
          Open in Google Maps
        </motion.a>
      </motion.div>
    </AnimatePresence>
  );
};

function getGoogleMapsLink(legs) {
  if (!legs.length) return "#";
  const { start_address } = legs[0];
  const { end_address } = legs[legs.length - 1];
  const waypointAddresses = legs.slice(0, -1).map((leg) => leg.end_address);
  const baseUrl = "https://www.google.com/maps/dir/";
  const allLocations = [start_address, ...waypointAddresses, end_address];
  const encoded = allLocations.map((loc) => encodeURIComponent(loc)).join("/");
  return `${baseUrl}${encoded}`;
}

export default RouteDetails;
