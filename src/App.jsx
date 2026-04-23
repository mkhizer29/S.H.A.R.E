import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react'
import useAuthStore from './stores/authStore';

// Layouts
import AppShell from './components/layout/AppShell';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import About from './pages/public/About';
import SignIn from './pages/public/SignIn';
import SignUp from './pages/public/SignUp';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import Directory from './pages/patient/Directory';
import Chat from './pages/patient/Chat';
import Bookings from './pages/patient/Bookings';
import MoodHistory from './pages/patient/MoodHistory';
import Settings from './pages/patient/Settings';
import LiveSession from './pages/patient/LiveSession';

// Professional Pages
import ProDashboard from './pages/professional/ProDashboard';
import Inbox from './pages/professional/Inbox';
import Calendar from './pages/professional/Calendar';
import Clients from './pages/professional/Clients';
import Revenue from './pages/professional/Revenue';
import Profile from './pages/professional/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import Verification from './pages/admin/Verification';
import Analytics from './pages/admin/Analytics';
import CrisisMonitor from './pages/admin/CrisisMonitor';
import RevenueAdmin from './pages/admin/RevenueAdmin';
import Moderation from './pages/admin/Moderation';
import Configuration from './pages/admin/Configuration';



// Route Guards
const ProtectedRoute = ({ children, allowedRole }) => {
  const { isAuthenticated, role } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (allowedRole && role !== allowedRole) {
    return (
      <div className="min-h-screen bg-lilac-50 flex items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-soft border border-lilac-100">
          <div className="w-16 h-16 bg-alert-light rounded-2xl flex items-center justify-center mx-auto mb-6 text-alert">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-3 tracking-tight">Access Restricted</h2>
          <p className="text-neutral-500 mb-8 leading-relaxed">
            You're currently signed in as {role === 'professional' ? 'a professional' : role === 'admin' ? 'an admin' : 'a patient'}. 
            This area is reserved for {allowedRole}s.
          </p>
          <div className="flex flex-col gap-3">
             <Navigate to={role === 'patient' ? '/patient' : role === 'professional' ? '/pro' : '/admin'} replace />
             <p className="text-xs text-neutral-400 animate-pulse">Redirecting to your workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

// Main App Router
function App() {
  const { authInitialized, initializeAuth } = useAuthStore();

  useEffect(() => {
    // Start listening to auth state changes and restore profile from Firestore
    const unsubscribe = initializeAuth();
    return () => unsubscribe();
  }, [initializeAuth]);

  // Loading gate: wait until auth state is determined before rendering the app
  if (!authInitialized) {
    return (
      <div className="min-h-screen bg-lilac-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
          <p className="text-violet-600 font-bold text-sm tracking-wide uppercase animate-pulse">Initializing Secure Session...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Patient Portal */}
        <Route path="/patient" element={
          <ProtectedRoute allowedRole="patient">
            <AppShell />
          </ProtectedRoute>
        }>
          <Route index element={<PatientDashboard />} />
          <Route path="directory" element={<Directory />} />
          <Route path="chat" element={<Chat />} />
          <Route path="chat/:id" element={<Chat />} />
          <Route path="session/:id" element={<LiveSession />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="mood" element={<MoodHistory />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Professional Portal */}
        <Route path="/pro" element={
          <ProtectedRoute allowedRole="professional">
            <AppShell />
          </ProtectedRoute>
        }>
          <Route index element={<ProDashboard />} />
          <Route path="inbox" element={<Inbox />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="clients" element={<Clients />} />
          <Route path="revenue" element={<Revenue />} />
          <Route path="profile" element={<Profile />} />
          <Route path="session/:id" element={<LiveSession />} />
        </Route>

        {/* Admin Portal */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRole="admin">
            <AppShell />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="verification" element={<Verification />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="crisis" element={<CrisisMonitor />} />
          <Route path="revenue" element={<RevenueAdmin />} />
          <Route path="moderation" element={<Moderation />} />
          <Route path="config" element={<Configuration />} />
        </Route>

        {/* Fallback 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
