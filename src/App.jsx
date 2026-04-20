import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
    // Redirect to their respective dashboard if they try to access wrong portal
    if (role === 'patient') return <Navigate to="/patient" replace />;
    if (role === 'professional') return <Navigate to="/pro" replace />;
    if (role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

// Main App Router
function App() {
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
