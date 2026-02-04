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
const OwnerDashboard = lazy(() => import('./pages/OwnerDashboard'));

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const AppContent = () => {
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
        <main className="min-h-screen">
          <AnimatePresence mode='wait'>
            <Routes>
              {/* Landing Page (Platform Home) */}
              <Route path="/" element={<Splash />} />

              {/* Admin Dashboard (Global or Tenant) */}
              <Route 
                path="/gestao-casamento-2026" 
                element={
                  <Suspense fallback={<LoadingSkeleton type="dashboard" />}>
                    <AdminDashboard />
                  </Suspense>
                } 
              />

              {/* Global Owner Dashboard */}
              <Route 
                path="/plataforma/admin" 
                element={
                  <Suspense fallback={<LoadingSkeleton type="dashboard" />}>
                    <OwnerDashboard />
                  </Suspense>
                } 
              />

              {/* Legacy Redirects (Backward Compatibility for Binth & Jubílio) */}
              <Route path="/home" element={<Navigate to="/binth-jubilio/home" replace />} />
              <Route path="/historia" element={<Navigate to="/binth-jubilio/historia" replace />} />
              <Route path="/evento" element={<Navigate to="/binth-jubilio/evento" replace />} />
              <Route path="/rsvp" element={<Navigate to="/binth-jubilio/rsvp" replace />} />
              <Route path="/galeria" element={<Navigate to="/binth-jubilio/galeria" replace />} />
              <Route path="/presentes" element={<Navigate to="/binth-jubilio/presentes" replace />} />
              <Route path="/contato" element={<Navigate to="/binth-jubilio/contato" replace />} />
              <Route path="/mensagens" element={<Navigate to="/binth-jubilio/mensagens" replace />} />

              {/* Event Specific Routes */}
              <Route path="/:eventSlug/*" element={<EventRoutes />} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </ErrorBoundary>
  );
}

import { useParams } from 'react-router-dom';
import { EventProvider, useEvent } from './contexts/EventContext';

const EventRoutes = () => {
  const { eventSlug } = useParams();
  
  return (
    <EventProvider eventSlug={eventSlug}>
      <EventLayout />
    </EventProvider>
  );
};

const EventLayout = () => {
  const { loading, error } = useEvent();
  
  if (loading) return <LoadingSkeleton type="page" />;
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-2">Evento não encontrado</h1>
      <p className="text-neutral-500 mb-4">O link que você acessou pode estar incorreto ou o evento não existe.</p>
      <button 
        onClick={() => window.location.href = '/'}
        className="px-6 py-2 bg-gold text-white rounded-full hover:bg-gold/90 transition-colors"
      >
        Voltar para o Início
      </button>
    </div>
  );

  return (
    <>
      <ScrollProgressIndicator />
      <Header />
      <Routes>
        <Route path="home" element={<Home />} />
        <Route path="historia" element={<Historia />} />
        <Route path="evento" element={<Evento />} />
        <Route path="rsvp" element={<RSVP />} />
        <Route path="galeria" element={
          <Suspense fallback={<LoadingSkeleton type="gallery" />}>
            <Galeria />
          </Suspense>
        } />
        <Route path="presentes" element={
          <Suspense fallback={<LoadingSkeleton type="page" />}>
            <Presentes />
          </Suspense>
        } />
        <Route path="contato" element={<Contato />} />
        <Route path="mensagens" element={
          <Suspense fallback={<LoadingSkeleton type="page" />}>
            <MessagesWall />
          </Suspense>
        } />
        <Route 
          path="ticket/:rsvpId" 
          element={
            <Suspense fallback={<LoadingSkeleton type="page" />}>
              <TicketPage />
            </Suspense>
          } 
        />
        {/* Default event page */}
        <Route index element={<Navigate to="home" replace />} />
      </Routes>
      <Footer />
      <MusicPlayer />
      <MessagesButton />
      <MobileBottomNav />
      <QuizTrigger />
      <PWAInstallPrompt />
    </>
  );
};

const QuizTrigger = () => {
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Don't trigger on splash or admin pages
    const excludedPaths = ['/', '/gestao-casamento-2026', '/ticket'];
    const isExcluded = excludedPaths.some(path => location.pathname.startsWith(path));
    
    if (isExcluded) return;

    // Check if quiz was already shown in this session
    const quizShown = sessionStorage.getItem('wedding_quiz_shown');
    
    if (!quizShown) {
      const timer = setTimeout(() => {
        setIsQuizOpen(true);
        sessionStorage.setItem('wedding_quiz_shown', 'true');
      }, 8000); // Trigger after 8 seconds of interaction

      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  return (
    <Suspense fallback={null}>
      <QuizPopup 
        isOpen={isQuizOpen} 
        onClose={() => setIsQuizOpen(false)} 
      />
    </Suspense>
  );
};

const QuizPopup = lazy(() => import('./components/QuizPopup'));
const PWAInstallPrompt = lazy(() => import('./components/PWAInstallPrompt'));


function AppWrapper() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default AppWrapper;
