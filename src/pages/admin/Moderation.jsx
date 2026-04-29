import React from 'react';
import { Search, SearchX, Filter, Ban, Trash2, StopCircle } from 'lucide-react';

const Moderation = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-serif text-text-primary">Moderation</h1>
        <p className="text-text-secondary mt-1">Manage user status, handle reports, and enforce platform guidelines.</p>
      </div>

      <div className="bg-warm-white-pure rounded-2xl border border-sage-light shadow-sm overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
         {/* Search Header */}
         <div className="p-4 border-b border-sage-light bg-warm-white/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search by User Alias, UID, or Report ID..." 
                className="w-full bg-white border border-sage-medium rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
              />
            </div>
            <div className="flex gap-2 text-sm w-full sm:w-auto">
               <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-sage-medium rounded-lg text-text-secondary hover:bg-sage-light transition-colors">
                  <Filter className="w-4 h-4" /> Filters
               </button>
            </div>
         </div>

         {/* Content Area - Placeholder State */}
         <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-warm-white">
            <div className="w-16 h-16 bg-sage-light rounded-full flex items-center justify-center mb-4 border border-sage-medium/50">
              <SearchX className="w-8 h-8 text-text-muted" />
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-2">No Active Reports</h3>
            <p className="text-sm text-text-secondary max-w-md">
              Search for a specific user to view their status or take action. The platform is currently clear of user reports.
            </p>

            {/* Quick Actions */}
            <div className="mt-12 w-full max-w-2xl text-left">
               <h4 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4 border-b border-sage-light pb-2">Common Actions</h4>
               <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-sage-medium hover:border-brand-teal transition-colors cursor-pointer group">
                     <StopCircle className="w-5 h-5 text-yellow-600 mb-2 group-hover:scale-110 transition-transform" />
                     <h5 className="font-medium text-text-primary text-sm">Suspend User</h5>
                     <p className="text-xs text-text-secondary mt-1">Temporarily revoke platform access.</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-sage-medium hover:border-alert-coral transition-colors cursor-pointer group">
                     <Ban className="w-5 h-5 text-alert-coral mb-2 group-hover:scale-110 transition-transform" />
                     <h5 className="font-medium text-text-primary text-sm">Ban User Status</h5>
                     <p className="text-xs text-text-secondary mt-1">Permanent access revocation.</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-sage-medium hover:border-trust-purple transition-colors cursor-pointer group">
                     <Trash2 className="w-5 h-5 text-trust-purple mb-2 group-hover:scale-110 transition-transform" />
                     <h5 className="font-medium text-text-primary text-sm">Clear Session Data</h5>
                     <p className="text-xs text-text-secondary mt-1">Force delete user chat history (requires UID).</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Moderation;
