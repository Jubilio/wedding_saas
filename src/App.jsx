import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import MusicPlayer from './components/MusicPlayer';
import MessagesButton from './components/MessagesButton';
import ScrollProgressIndicator from './components/ScrollProgressIndicator';
import LoadingSkeleton from './components/LoadingSkeleton';
import ErrorBoundary from './components/ErrorBoundary';
import MobileBottomNav from './components/MobileBottomNav';

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
const Presentes = lazy(() => import('./pages/Presentes'));
const MessagesWall = lazy(() => import('./pages/MessagesWall'));
const TicketPage = lazy(() => import('./pages/TicketPage'));

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
  
  // Initialize state based on current path to avoid sync setState in effect
  // If we are NOT on root, show the initial splash for 5s
  const [showInitialSplash, setShowInitialSplash] = useState(location.pathname !== '/');

  // Initial transition timer (5 seconds)
  useEffect(() => {
    if (showInitialSplash) {
      const timer = setTimeout(() => {
        setShowInitialSplash(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showInitialSplash]);

  // Calculate isSplash directly from location
  const isSplash = location.pathname === '/';

  if (showInitialSplash) {
    return (
      <ErrorBoundary>
        <Splash isAutomatic={true} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="font-sans text-neutral-gray antialiased selection:bg-gold selection:text-white">
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#333',
              borderRadius: '12px',
              padding: '16px',
            },
            success: {
              iconTheme: {
                primary: '#D4AF37',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
            },
          }}
        />
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
                <Suspense fallback={<LoadingSkeleton type="gallery" />}>
                  <Galeria />
                </Suspense>
              } />
              <Route path="/presentes" element={
                <Suspense fallback={<LoadingSkeleton type="page" />}>
                  <Presentes />
                </Suspense>
              } />
              <Route path="/contato" element={<Contato />} />
              <Route path="/mensagens" element={
                <Suspense fallback={<LoadingSkeleton type="page" />}>
                  <MessagesWall />
                </Suspense>
              } />
              <Route 
                path="/gestao-casamento-2026" 
                element={
                  <Suspense fallback={<LoadingSkeleton type="dashboard" />}>
                    <AdminDashboard />
                  </Suspense>
                } 
              />
              <Route 
                path="/ticket/:rsvpId" 
                element={
                  <Suspense fallback={<LoadingSkeleton type="page" />}>
                    <TicketPage />
                  </Suspense>
                } 
              />
            </Routes>
          </AnimatePresence>
        </main>
        {!isSplash && location.pathname !== '/gestao-casamento-2026' && <Footer />}
        {!isSplash && <MusicPlayer />}
        {!isSplash && <MessagesButton />}
        {!isSplash && <MobileBottomNav />}
      </div>
    </ErrorBoundary>
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
