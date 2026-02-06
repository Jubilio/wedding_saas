import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEvent } from '../contexts/EventContext';
import { MessageSquareHeart } from 'lucide-react';

const MobileBottomNav = () => {
  const location = useLocation();
  const { eventSlug } = useEvent();
  
  // Don't show on splash page or admin dashboard
  if (location.pathname === '/' || location.pathname === '/gestao-casamento-2026') {
    return null;
  }

  const navItems = [
    { name: 'Início', path: `/${eventSlug}/home`, icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    { name: 'Mural', path: `/${eventSlug}/mensagens`, icon: (
      <MessageSquareHeart className="w-6 h-6" />
    )},
    { name: 'Evento', path: `/${eventSlug}/evento`, icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )},
    { name: 'Presentes', path: `/${eventSlug}/presentes`, icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    )},
  ];

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 px-4 py-2 flex justify-around items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
    >
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 transition-colors duration-300 ${
              isActive ? 'text-gold' : 'text-gray-400 hover:text-gray-600'
            }`
          }
        >
          {item.icon}
          <span className="text-[10px] uppercase tracking-wider font-medium">
            {item.name}
          </span>
          {location.pathname === item.path && (
            <motion.div
              layoutId="bottomNavDot"
              className="w-1 h-1 bg-gold rounded-full"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
        </NavLink>
      ))}
    </motion.nav>
  );
};

export default MobileBottomNav;
