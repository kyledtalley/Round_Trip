import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./LandingPage.css";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      // we can optionally stagger children here if needed
      when: "beforeChildren",
    },
  },
  exit: { opacity: 0 },
};

const stampVariants = {
  hidden: { scale: 0.8 },
  visible: { scale: 1 },
  exit: { y: -600, rotate: 720, scale: 0.5 },
};

const LandingPage = ({ onEnter }) => {
  const [clicked, setClicked] = useState(false);

  const handleClickStamp = () => {
    setClicked(true); 
  };

  const handleContainerAnimationComplete = (variant) => {
    if (variant === "exit") {
      onEnter();
    }
  };

  return (
    <AnimatePresence>

      {!clicked && (
        <motion.div
          className="landing-page"
          // animate the container
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onAnimationComplete={(variant) => handleContainerAnimationComplete(variant)}
        >
          <motion.div
            className="landing-stamp"
            variants={stampVariants}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            initial="hidden"
            animate="visible"
            exit="exit"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClickStamp}
          >
            CLICK TO ENTER
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LandingPage;
