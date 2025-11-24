import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import MusicPlayer from './components/MusicPlayer';
import MessagesButton from './components/MessagesButton';
import ScrollProgressIndicator from './components/ScrollProgressIndicator';
import LoadingSkeleton from './components/LoadingSkeleton';

// Core Pages (always needed)
import Splash from './pages/Splash';
import Home from './pages/Home';
import Historia from './pages/Historia';
import Evento from './pages/Evento';
import RSVP from './pages/RSVP';
import Contato from './pages/Contato';

// Lazy load heavy/secondary pages
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Galeria = lazy(() => import('./pages/Galeria'));
const PhotoBooth = lazy(() => import('./pages/PhotoBooth'));
const Presentes = lazy(() => import('./pages/Presentes'));
const MessagesWall = lazy(() => import('./pages/MessagesWall'));

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const AppContent = () => {
  const location = useLocation();
  const [isSplash, setIsSplash] = useState(location.pathname === '/');

  // Update isSplash when location changes
  useEffect(() => {
    setIsSplash(location.pathname === '/');
  }, [location.pathname]);

  return (
    <div className="font-sans text-neutral-gray antialiased selection:bg-gold selection:text-white">
      <ScrollToTop />
      {!isSplash && <ScrollProgressIndicator />}
      {!isSplash && location.pathname !== '/gestao-casamento-2026' && <Header />}
      <main className="min-h-screen">
        <AnimatePresence mode='wait'>
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/home" element={<Home />} />
            <Route path="/historia" element={<Historia />} />
            <Route path="/evento" element={<Evento />} />
            <Route path="/rsvp" element={<RSVP />} />
            <Route path="/galeria" element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div></div>}>
                <Galeria />
              </Suspense>
            } />
            <Route path="/presentes" element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div></div>}>
                <Presentes />
              </Suspense>
            } />
            <Route path="/contato" element={<Contato />} />
            <Route path="/photo-booth" element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div></div>}>
                <PhotoBooth />
              </Suspense>
            } />
            <Route path="/mensagens" element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div></div>}>
                <MessagesWall />
              </Suspense>
            } />
            <Route 
              path="/gestao-casamento-2026" 
              element={
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div></div>}>
                  <AdminDashboard />
                </Suspense>
              } 
            />
          </Routes>
        </AnimatePresence>
      </main>
      {!isSplash && location.pathname !== '/gestao-casamento-2026' && <Footer />}
      {!isSplash && <MusicPlayer />}
      {!isSplash && <MessagesButton />}
    </div>
  );
}

function AppWrapper() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default AppWrapper;
