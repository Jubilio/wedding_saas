import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import MobileMenu from './MobileMenu';
import { useEvent } from '../contexts/EventContext';

const Header = () => {
  const { eventSlug, eventData } = useEvent();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [easterEggClicks, setEasterEggClicks] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoClick = () => {
    setEasterEggClicks(prev => prev + 1);
    if (easterEggClicks + 1 === 5) {
      setShowEasterEgg(true);
      setTimeout(() => {
        setShowEasterEgg(false);
        setEasterEggClicks(0);
      }, 5000);
    }
  };
  
  const toggleMenu = () => setIsOpen(prev => !prev);
  const closeMenu = () => setIsOpen(false);

  const links = [
    { name: 'Home', path: `/${eventSlug}/home` },
    { name: 'Nossa História', path: `/${eventSlug}/historia` },
    { name: 'O Evento', path: `/${eventSlug}/evento` },
    { name: 'Galeria', path: `/${eventSlug}/galeria` },
    { name: 'Lista de Presentes', path: `/${eventSlug}/presentes` },
    { name: 'Mensagens', path: `/${eventSlug}/mensagens` },
    { name: 'Contato', path: `/${eventSlug}/contato` },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-lg' 
            : 'bg-white shadow-md'
        }`}
      >
        <nav className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link 
              to={`/${eventSlug}/home`}
              onClick={handleLogoClick}
              className="text-2xl font-serif font-bold text-neutral-gray"
            >
              {eventData?.title.split(' ').map(w => w[0]).join(' & ') || 'B & J'}
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`transition-all duration-300 group ${
                    location.pathname === link.path
                      ? 'text-gold font-semibold'
                      : 'text-neutral-gray hover:text-gold'
                  }`}
                >
                  <span className="relative">
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold transition-all duration-300 group-hover:w-full"></span>
                  </span>
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden text-neutral-gray focus:outline-none p-2 z-50 relative"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
            >
              {/* Simple swapping SVG to ensure immediate feedback without layout thrashing */}
              {isOpen ? (
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 </svg>
              ) : (
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                 </svg>
              )}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu Component - Mounted at top level equivalent, or effectively decoupled from Header re-renders if optimized further, but here passing state down is cleaner than huge inline JSX */}
      <MobileMenu 
        isOpen={isOpen} 
        onClose={closeMenu} 
        links={links} 
        currentPath={location.pathname} 
      />
      
      {/* Easter Egg */}
      {showEasterEgg && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none transition-opacity duration-500">
          <div className="bg-gradient-to-br from-gold/90 to-gold/70 backdrop-blur-lg rounded-3xl p-12 shadow-2xl max-w-md mx-4 animate-bounce-in">
            <p className="text-3xl text-center mb-4">🎉✨💕</p>
            <p className="text-white text-center font-serif text-xl mb-2">
              Descobriu o nosso segredo!
            </p>
            <p className="text-white/90 text-center text-sm">
              Obrigado por explorar nosso site com tanto carinho. 
              Mal podemos esperar para celebrar consigo!
            </p>
            <p className="text-white text-center font-serif text-lg mt-4">
              - {eventData?.title || 'Binth & Jubílio'} ♥
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
