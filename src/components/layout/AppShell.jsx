import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import PanicButton from '../PanicButton';
import { motion } from 'framer-motion';
import useAuthStore from '../../stores/authStore';

export default function AppShell() {
  const location = useLocation();
  const { role } = useAuthStore();

  return (
    <div className="fixed inset-0 flex bg-background overflow-hidden select-none">
      {/* Decorative ultra-light blurred blobs for the soft lilac vibe */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-light/40 blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-accent-light/40 blur-[100px] pointer-events-none z-0" />

      {/* Sidebar - Desktop Only */}
      <div className="hidden md:flex flex-shrink-0 relative z-10">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10 overflow-hidden">
        {/* Top Navigation */}
        <TopNav />

        {/* Scrollable Page Outlet with Framer Motion Page Fades */}
        <main className={`flex-1 overflow-x-hidden relative ${
          location.pathname.includes('/chat') || location.pathname.includes('/inbox') || location.pathname.includes('/messages')
            ? 'overflow-hidden' 
            : 'overflow-y-auto'
        }`}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={`w-full mx-auto ${
              location.pathname.includes('/chat') || location.pathname.includes('/inbox') || location.pathname.includes('/messages')
                ? 'h-full' 
                : 'min-h-full max-w-7xl p-4 sm:p-6 lg:p-8'
            }`}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Panic Button — Patient only, hidden on chat pages to avoid layout clutter */}
      {role === 'patient' && 
       !location.pathname.includes('/chat') && 
       !location.pathname.includes('/inbox') && 
       !location.pathname.includes('/messages') && 
       <PanicButton />}
    </div>
  );
}
