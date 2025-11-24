import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import EasterEgg from './EasterEgg';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [easterEggClicks, setEasterEggClicks] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
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

  const links = [
    { name: 'Home', path: '/home' },
    { name: 'Nossa História', path: '/historia' },
    { name: 'O Evento', path: '/evento' },
    { name: 'Galeria', path: '/galeria' },
    { name: 'Lista de Presentes', path: '/presentes' },
    { name: 'Contato', path: '/contato' },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg' 
          : 'bg-white shadow-md'
      }`}
    >
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link 
            to="/home"
            onClick={handleLogoClick}
            className={`text-2xl font-serif font-bold transition-colors ${
              isScrolled ? 'text-neutral-gray' : 'text-neutral-gray'
            }`}
          >
            B & J
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
            <Link
              to="/rsvp"
              className="bg-gold text-white px-6 py-2 rounded-full hover:bg-opacity-90 transition-all hover:scale-105 hover:shadow-lg"
            >
              RSVP
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-neutral-gray focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              />
              
              {/* Menu Panel */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="md:hidden fixed right-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 overflow-y-auto"
              >
                {/* Close button */}
                <div className="flex justify-end p-4">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-neutral-gray hover:text-gold transition-colors"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <nav className="flex flex-col p-6 space-y-6">
                  {links.map((link, index) => (
                    <motion.div
                      key={link.path}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={link.path}
                        onClick={() => setIsOpen(false)}
                        className={`block text-lg transition-colors ${
                          location.pathname === link.path
                            ? 'text-gold font-semibold'
                            : 'text-neutral-gray hover:text-gold'
                        }`}
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  ))}
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: links.length * 0.1 }}
                  >
                    <Link
                      to="/rsvp"
                      onClick={() => setIsOpen(false)}
                      className="block bg-gold text-white text-center py-3 rounded-full hover:bg-opacity-90 transition-all"
                    >
                      Confirmar Presença
                    </Link>
                  </motion.div>
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>
      
      {/* Easter Egg */}
      {showEasterEgg && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none"
        >
          <div className="bg-gradient-to-br from-gold/90 to-gold/70 backdrop-blur-lg rounded-3xl p-12 shadow-2xl max-w-md mx-4">
            <p className="text-3xl text-center mb-4">🎉✨💕</p>
            <p className="text-white text-center font-serif text-xl mb-2">
              Descobriu o nosso segredo!
            </p>
            <p className="text-white/90 text-center text-sm">
              Obrigado por explorar nosso site com tanto carinho. 
              Mal podemos esperar para celebrar consigo!
            </p>
            <p className="text-white text-center font-serif text-lg mt-4">
              - Binth & Jubílio ♥
            </p>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Header;
