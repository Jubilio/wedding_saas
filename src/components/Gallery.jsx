import React, { useMemo } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';


// Import images
import beachKiss from '../assets/beach_kiss.jpg';
import beachHug from '../assets/beach_hug.jpg';
import beachHoldHands from '../assets/beach_hold_hands.jpg';
import beachSmile from '../assets/beach_smile.jpg';
import groomBench from '../assets/groom_bench.jpg';
import brideBench from '../assets/bride_bench.jpg';

const Gallery = () => {
  const images = useMemo(() => [
    { src: beachSmile, alt: 'Nós (Praia)', span: 'md:col-span-2 md:row-span-2' },
    { src: beachKiss, alt: 'O Beijo', span: 'md:col-span-1 md:row-span-1' },
    { src: beachHoldHands, alt: 'Juntos', span: 'md:col-span-1 md:row-span-1' },
    { src: beachHug, alt: 'Abraço', span: 'md:col-span-1 md:row-span-2' },
    { src: groomBench, alt: 'O Noivo', span: 'md:col-span-1 md:row-span-1' },
    { src: brideBench, alt: 'A Noiva', span: 'md:col-span-1 md:row-span-1' },
  ], []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
      {images.map((image, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            delay: index * 0.15,
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1]
          }}
          className={`relative overflow-hidden rounded-2xl shadow-xl group ${image.span}`}
        >
          {/* Image with Ken Burns effect on hover */}
          <img
            src={image.src}
            alt={image.alt}
            className="w-full h-full object-cover transition-transform duration-[5000ms] ease-out group-hover:scale-110"
          />
          
          {/* Elegant overlay with gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <p className="text-white font-serif text-lg">
                {image.alt}
              </p>
            </div>
          </div>
          
          {/* Subtle border animation */}
          <div className="absolute inset-0 border-2 border-gold/0 group-hover:border-gold/50 transition-all duration-500 rounded-2xl"></div>
        </motion.div>
      ))}
    </div>
  );
};

export default Gallery;
