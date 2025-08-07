'use client';

import { motion } from 'framer-motion';

export const IntroEffect = ({ children, className = '', delay=0, type="random" }) => {
  // Randomly select an animation effect
  const effects = [
    { scale: [0.6, 1], opacity: [0, 1] }, // Zoom in
    { y: [50, 0], opacity: [0, 1] }, // Slide up
    { x: [50, 0], opacity: [0, 1] }, // Slide in from left
    { x: [-50, 0], opacity: [0, 1] }, // Slide in from right
  ];

  const types = {
    zoom: effects[0],
    slideUp: effects[1],
    slideLeft: effects[2],
    slideRight: effects[3],
  };

  const getEffect = () => {
    if (type === "random") {
      return effects[Math.floor(Math.random() * effects.length)];
    } else {
      return types[type];
    }
  }

  const randomEffect = effects[Math.floor(Math.random() * effects.length)];

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut', delay:delay }} // Smooth easing
      viewport={{ once: true }} // Trigger animation only once
      whileInView={getEffect} // Apply the randomly selected effect
    >
      {children}
    </motion.div>
  );
};

export default IntroEffect;
