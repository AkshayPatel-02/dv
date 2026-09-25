import React, { useState, useEffect } from 'react';
import { DataVedhiIntro } from './components/DataVedhiIntro';
import { CosmicParticles } from './components/CosmicParticles';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { EventJourneySection } from './components/EventJourneySection';
import { TeamSection } from './components/TeamSection';
import { RegistrationFlow } from './components/RegistrationFlow';
import { PaymentSuccessModal } from './components/PaymentSuccessModal';
import { SquadPassView } from './components/SquadPassView';
import { RegistrationPassDocument } from './components/RegistrationPassDocument';
import { TrackPassModal } from './components/TrackPassModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginModal } from './components/AdminLoginModal';
import { PublicVerifyPage } from './components/PublicVerifyPage';
import { Footer } from './components/Footer';
import { ollaverseApi } from './services/ollaverseApi';
import { Registration, AdminUser } from './types';

export default function App() {
  // Intro Sequence state
  const [showIntro, setShowIntro] = useState<boolean>(true);

  // Modals & Navigation state
  const [squadPassReg, setSquadPassReg] = useState<Registration | null>(null);
  const [verifiedSuccessReg, setVerifiedSuccessReg] = useState<Registration | null>(null);
  const [showAdminDashboard, setShowAdminDashboard] = useState<boolean>(false);
  const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);
  const [showTrackModal, setShowTrackModal] = useState<boolean>(false);

  // Check URL routing for public QR code scans & admin direct links
  const [publicVerifyId, setPublicVerifyId] = useState<string | null>(() => {
    try {
      const path = window.location.pathname;
      if (path.startsWith('/verify/')) {
        const id = path.replace('/verify/', '').split('?')[0].split('/')[0];
        if (id) return decodeURIComponent(id);
      }
      const params = new URLSearchParams(window.location.search);
      if (params.get('verify')) {
        return params.get('verify');
      }
      if (params.get('token')) {
        return params.get('token');
      }
      if (window.location.hash.startsWith('#/verify/')) {
        return window.location.hash.replace('#/verify/', '').split('?')[0];
      }
    } catch {
      // ignore
    }
    return null;
  });

  useEffect(() => {
    // Check if initial URL asks for admin
    if (window.location.pathname === '/admin' || window.location.hash === '#admin' || window.location.search.includes('admin=true')) {
      if (ollaverseApi.getCurrentAdmin()) {
        setShowAdminDashboard(true);
      } else {
        setShowAdminLogin(true);
      }
    }

    // Subscribe to admin session updates
    return ollaverseApi.subscribe(() => {
      // triggers re-renders if config or state changes
    });
  }, []);

  const handleNavigate = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenAdmin = () => {
    if (ollaverseApi.getCurrentAdmin()) {
      setShowAdminDashboard(true);
    } else {
      setShowAdminLogin(true);
    }
  };

  const handleAdminLoginSuccess = () => {
    setShowAdminLogin(false);
    setShowAdminDashboard(true);
  };

  const handleAdminLogout = () => {
    ollaverseApi.logoutAdmin();
    setShowAdminDashboard(false);
  };

  const handleRegistrationSuccess = (reg: Registration) => {
    // Show the payment success modal with VIEW SQUAD CTA
    setVerifiedSuccessReg(reg);
  };

  // If scanning verification URL directly, show public verification screen
  if (publicVerifyId) {
    return (
      <PublicVerifyPage
        registrationId={publicVerifyId}
        onGoHome={() => {
          setPublicVerifyId(null);
          try {
            window.history.pushState({}, '', '/');
          } catch {
            // ignore
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 relative selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 1. DATA VEDHI INTRO & CINEMATIC PORTAL TRANSITION */}
      {showIntro && <DataVedhiIntro onComplete={() => setShowIntro(false)} />}

      {/* 2. AMBIENT COSMIC PARTICLES BACKGROUND */}
      <CosmicParticles density={45} />

      {/* 3. GLASSMORPHISM NAVBAR */}
      <Navbar
        onNavigate={handleNavigate}
        onOpenAdmin={handleOpenAdmin}
        onOpenTrack={() => setShowTrackModal(true)}
      />

      {/* MAIN WEBSITE SECTIONS */}
      <main className="relative z-10">
        {/* HERO SECTION WITH AI PORTAL & OLLAMA RABBIT EMERGENCE */}
        <HeroSection onEnter={() => handleNavigate('register')} />

        {/* ABOUT OLLAVERSE & FEATURE CARDS (LEARN / BUILD / COMPETE) */}
        <AboutSection onRegisterClick={() => handleNavigate('register')} />

        {/* EVENT JOURNEY (DAY 01 DISCOVER / DAY 02 CREATE) */}
        <EventJourneySection onRegisterClick={() => handleNavigate('register')} />

        {/* TEAM UP SECTION (2–4 MEMBERS / TEAM) */}
        <TeamSection onRegisterClick={() => handleNavigate('register')} />

        {/* HOLOGRAPHIC MULTI-STEP REGISTRATION FLOW & SCAN-TO-PAY */}
        <RegistrationFlow
          onSuccess={handleRegistrationSuccess}
          onCancel={() => handleNavigate('hero')}
        />
      </main>

      {/* FOOTER */}
      <Footer
        onNavigate={handleNavigate}
        onOpenAdmin={handleOpenAdmin}
        onOpenTrack={() => setShowTrackModal(true)}
      />

      {/* ====================================================
          MODALS & OVERLAYS
         ==================================================== */}

      {/* PAYMENT SUCCESS POPUP & CINEMATIC CHECKMARK WITH "VIEW SQUAD →" */}
      {verifiedSuccessReg && (
        <PaymentSuccessModal
          registration={verifiedSuccessReg}
          onViewSquad={() => {
            setSquadPassReg(verifiedSuccessReg);
            setVerifiedSuccessReg(null);
          }}
          onViewRegistration={() => {
            setSquadPassReg(verifiedSuccessReg);
            setVerifiedSuccessReg(null);
          }}
          onDownloadConfirmation={() => {
            setSquadPassReg(verifiedSuccessReg);
            setVerifiedSuccessReg(null);
          }}
          onBackToHome={() => {
            setVerifiedSuccessReg(null);
            handleNavigate('hero');
          }}
        />
      )}

      {/* SQUAD PASS VIEW (OFFICIAL OLLAVERSE SQUAD PASS WITH REAL QR CODE) */}
      {squadPassReg && (
        <SquadPassView
          registration={squadPassReg}
          onClose={() => setSquadPassReg(null)}
          onBack={() => setSquadPassReg(null)}
        />
      )}

      {/* TRACK PASS LOOKUP MODAL */}
      {showTrackModal && (
        <TrackPassModal
          onClose={() => setShowTrackModal(false)}
          onSelectRegistration={(reg) => {
            setSquadPassReg(reg);
            setShowTrackModal(false);
          }}
        />
      )}

      {/* ADMIN LOGIN MODAL */}
      {showAdminLogin && (
        <AdminLoginModal
          onSuccess={handleAdminLoginSuccess}
          onClose={() => setShowAdminLogin(false)}
        />
      )}

      {/* ADMIN CONSOLE DASHBOARD */}
      {showAdminDashboard && (
        <AdminDashboard
          onClose={() => setShowAdminDashboard(false)}
          onViewPass={(reg) => {
            setSquadPassReg(reg);
          }}
          onLogout={handleAdminLogout}
        />
      )}
    </div>
  );
}
