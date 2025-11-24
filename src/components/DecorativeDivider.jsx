import React from 'react';
import { motion } from 'framer-motion';

const DecorativeDivider = ({ variant = 'default' }) => {
  const variants = {
    default: (
      <div className="flex items-center justify-center my-12">
        <div className="flex-1 border-t border-gray-300"></div>
        <div className="px-4">
          <svg className="w-8 h-8 text-gold" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L9.19 8.63L2 9.24l5.46 4.73L5.82 21L12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
          </svg>
        </div>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>
    ),
    hearts: (
      <div className="flex items-center justify-center my-12">
        <div className="flex-1 border-t border-gray-300"></div>
        <div className="px-6 flex gap-2">
          <span className="text-gold text-xl">♥</span>
          <span className="text-gold text-2xl">♥</span>
          <span className="text-gold text-xl">♥</span>
        </div>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>
    ),
    rings: (
      <div className="flex items-center justify-center my-12">
        <div className="flex-1 border-t border-gray-300"></div>
        <div className="px-4">
          <svg width="40" height="40" viewBox="0 0 60 60" fill="none" className="text-gold">
            <circle cx="20" cy="30" r="12" stroke="currentColor" strokeWidth="2" fill="none" />
            <circle cx="40" cy="30" r="12" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </div>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>
    ),
    ornament: (
      <div className="flex items-center justify-center my-12">
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-xs h-px bg-gradient-to-r from-transparent via-gold to-transparent"
        />
      </div>
    ),
  };

  return variants[variant] || variants.default;
};

export default DecorativeDivider;
