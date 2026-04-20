import React from 'react';
import { Users, AlertTriangle, ShieldCheck, DollarSign, Activity } from 'lucide-react';

const AdminDashboard = () => {
  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h1 className="text-3xl font-serif text-text-primary">Command Center</h1>
        <p className="text-text-secondary mt-1">System overview and critical metrics.</p>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-warm-white-pure p-6 rounded-2xl border border-sage-light shadow-sm">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-sage-light rounded-xl">
              <Users className="w-6 h-6 text-brand-teal" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">+12%</span>
          </div>
          <div className="mt-4">
            <p className="text-text-secondary text-sm font-medium mb-1">Total Users</p>
            <h3 className="text-3xl font-serif text-text-primary">12,450</h3>
          </div>
        </div>
        
        <div className="bg-warm-white-pure p-6 rounded-2xl border border-sage-light shadow-sm">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-trust-purple-light rounded-xl">
              <ShieldCheck className="w-6 h-6 text-trust-purple" />
            </div>
            <span className="text-xs font-bold text-trust-purple bg-trust-purple-light px-2 py-1 rounded-full">15 Pending</span>
          </div>
          <div className="mt-4">
            <p className="text-text-secondary text-sm font-medium mb-1">Active Professionals</p>
            <h3 className="text-3xl font-serif text-text-primary">842</h3>
          </div>
        </div>

        <div className="bg-warm-white-pure p-6 rounded-2xl border border-sage-light shadow-sm line-through opacity-80">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-sage-light rounded-xl">
              <DollarSign className="w-6 h-6 text-brand-teal" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">+5%</span>
          </div>
          <div className="mt-4">
            <p className="text-text-secondary text-sm font-medium mb-1">Revenue MTD</p>
            <h3 className="text-3xl font-serif text-text-primary">$42K</h3>
          </div>
        </div>

        <div className="bg-warm-white-pure p-6 rounded-2xl border border-alert-coral/30 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-alert-coral-light rounded-bl-full opacity-50"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="p-3 bg-alert-coral/10 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-alert-coral" />
            </div>
          </div>
          <div className="mt-4 relative z-10">
            <p className="text-text-secondary text-sm font-medium mb-1">Open Crisis Flags</p>
            <h3 className="text-3xl font-serif text-alert-coral">3</h3>
            <button className="mt-3 text-xs bg-alert-coral text-warm-white-pure px-3 py-1.5 rounded-full hover:bg-alert-coral/90 transition-colors">
              Review Immediately
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-warm-white-pure rounded-2xl border border-sage-light shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-serif text-text-primary">System Health</h3>
            <Activity className="w-5 h-5 text-green-500" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-end border-b border-sage-light pb-4">
               <div>
                  <p className="font-medium text-text-primary text-sm">Auth Services</p>
                  <p className="text-xs text-text-secondary">Authentication & Token issuance</p>
               </div>
               <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-md">Operational</span>
            </div>
            <div className="flex justify-between items-end border-b border-sage-light pb-4">
               <div>
                  <p className="font-medium text-text-primary text-sm">E2E Encryption Keyserver</p>
                  <p className="text-xs text-text-secondary">Key exchange protocol</p>
               </div>
               <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-md">Operational</span>
            </div>
            <div className="flex justify-between items-end pb-2">
               <div>
                  <p className="font-medium text-text-primary text-sm">WebSocket Chat</p>
                  <p className="text-xs text-text-secondary">Real-time messaging delivery</p>
               </div>
               <span className="text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded-md">Degraded</span>
            </div>
          </div>
        </div>

        <div className="bg-warm-white-pure rounded-2xl border border-sage-light shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-serif text-text-primary">Recent Activity Log</h3>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4">
                 <div className="w-2 rounded-full bg-brand-teal/20"></div>
                 <div>
                    <p className="text-sm font-medium text-text-primary">New professional application received</p>
                    <p className="text-xs text-text-muted">10 mins ago • ID: APP-8832</p>
                 </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 text-sm font-medium text-text-secondary hover:text-text-primary border border-sage-medium rounded-lg py-2 transition-colors">
            View All Logs
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
