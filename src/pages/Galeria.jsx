import React from 'react';
import { motion } from 'framer-motion';
import Gallery from '../components/Gallery';

const Galeria = () => {
  return (
    <div className="pt-24 pb-20">
      <div className="container mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-serif text-center text-neutral-gray mb-12"
        >
          Nossa Galeria
        </motion.h1>
        
        <Gallery />
      </div>
    </div>
  );
};

export default Galeria;
