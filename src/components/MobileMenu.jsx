import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const MobileMenu = ({ isOpen, onClose, links, currentPath }) => {
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Use a slight delay for visibility to allow exit animations to finish
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300); // Match duration-300
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // We keep the component mounted but use CSS for visibility/transitions
  // However, completely unmounting (via isVisible check after timeout) 
  // can be useful if the menu has heavy content, but for this specific request
  // we want to avoid "mounting condicionalmente uma árvore de elementos inteira ao abrir".
  // So we will keep it mounted but hidden with visibility: hidden to avoid layout work,
  // or just use pointer-events-none and opacity-0.
  
  // To strictly follow "Don't mount conditionally entire tree on open", 
  // we should render it always but control visibility.
  // BUT, if we want to save memory when closed for a long time, we might check requirements.
  // The requirement says: "A correção deve: Garantir que a toggle do menu ocorra imediatamente no clique"
  // "Evitar estruturas condicionais complexas que remountem elementos inteiros."
  
  // So standard pattern: Render always, toggle CSS.

  return (
    <div 
      className={`fixed inset-0 z-50 transition-all duration-300 ease-in-out ${
        isOpen ? 'pointer-events-auto visible' : 'pointer-events-none invisible delay-300'
      }`}
    >
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div 
        className={`absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl transition-transform duration-300 ease-out transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header / Close Button */}
        <div className="flex justify-end p-4">
          <button
            onClick={onClose}
            className="text-neutral-gray hover:text-gold transition-colors p-2"
            aria-label="Close menu"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Links */}
        <nav className="flex flex-col p-6 space-y-6">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={onClose}
              className={`block text-lg transition-transform duration-300 transform ${
                isOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
              } ${
                currentPath === link.path
                  ? 'text-gold font-semibold'
                  : 'text-neutral-gray hover:text-gold'
              }`}
              style={{ transitionDelay: isOpen ? `${links.indexOf(link) * 50}ms` : '0ms' }}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default MobileMenu;
