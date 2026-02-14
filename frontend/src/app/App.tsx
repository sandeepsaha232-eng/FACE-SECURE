import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { PublicLandingPage } from './components/public/PublicLandingPage';
import { LogoTransitionOverlay } from './components/shared/LogoTransitionOverlay';
import { AnimatePresence } from 'motion/react';
import { authService } from './services/authService';

function AppContent() {
  const navigate = useNavigate();
  const [transitionTarget, setTransitionTarget] = useState<string | null>(null);

  const startTransition = useCallback((target: string) => {
    setTransitionTarget(target);
  }, []);

  const handleTransitionComplete = () => {
    if (transitionTarget) {
      navigate(transitionTarget);
      setTransitionTarget(null);
    }
  };

  // Check authentication status
  const isAuthenticated = authService.isAuthenticated();

  return (
    <>
      <AnimatePresence>
        {transitionTarget && (
          <LogoTransitionOverlay onComplete={handleTransitionComplete} />
        )}
      </AnimatePresence>

      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />}
        />
        <Route path="/login" element={<LoginPage onLoginSuccess={() => startTransition('/dashboard')} />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" replace />}
        />
        <Route path="/verify" element={<PublicLandingPage onVerifySuccess={() => startTransition('/dashboard')} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}