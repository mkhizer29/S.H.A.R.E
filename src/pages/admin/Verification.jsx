import React, { useEffect, useState } from 'react';
import { Search, Filter, Shield, AlertCircle, CheckCircle, XCircle, User } from 'lucide-react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const Verification = () => {
  const [queue, setQueue] = useState([]);
  const [selectedPro, setSelectedPro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const q = query(collection(db, 'professionals'), where('verified', '==', false));
      const snaps = await getDocs(q);
      const pros = snaps.docs.map(d => ({ id: d.id, ...d.data() }));
      setQueue(pros);
      if (pros.length > 0 && !selectedPro) {
        setSelectedPro(pros[0]);
      }
    } catch (err) {
      console.error("Error fetching queue:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'professionals', id), { verified: true });
      setQueue(prev => prev.filter(p => p.id !== id));
      setSelectedPro(null);
    } catch (err) {
      console.error("Error verifying:", err);
      alert("Failed to verify professional.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-serif text-text-primary">Verification Queue</h1>
          <p className="text-text-secondary mt-1">Review and approve professional applications.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by ID or name..." 
              className="w-full bg-warm-white-pure border border-sage-medium rounded-full py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
            />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
         {/* Queue List */}
         <div className="lg:col-span-1 bg-warm-white-pure rounded-2xl border border-sage-light shadow-sm overflow-hidden flex flex-col h-[calc(100vh-16rem)]">
            <div className="p-4 border-b border-sage-light bg-sage-light/30 font-medium text-sm text-text-primary flex justify-between items-center">
              Pending Applications <span className="bg-trust-purple text-white px-2 py-0.5 rounded-full text-xs">{queue.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
               {loading ? (
                 <p className="text-sm text-text-muted text-center py-8">Loading queue...</p>
               ) : queue.length === 0 ? (
                 <p className="text-sm text-text-muted text-center py-8">No pending applications.</p>
               ) : queue.map((app) => (
                 <div 
                   key={app.id} 
                   onClick={() => setSelectedPro(app)}
                   className={`p-4 rounded-xl border cursor-pointer transition-colors ${selectedPro?.id === app.id ? 'bg-sage-light/40 border-brand-teal ring-1 ring-brand-teal/50' : 'bg-warm-white hover:bg-sage-light/20 border-sage-light'}`}
                 >
                   <div className="flex justify-between items-start mb-2">
                     <span className="text-xs font-mono text-text-muted">{app.id.substring(0, 8)}...</span>
                   </div>
                   <h4 className="font-medium text-text-primary text-sm">{app.name}</h4>
                   <p className="text-xs text-text-secondary mt-0.5">{app.specialties?.join(', ') || 'Specialist'}</p>
                   <div className="mt-3 text-xs text-text-secondary flex justify-between items-center">
                      <span>{app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Recent'}</span>
                      <span className="px-2 py-0.5 rounded-full bg-warm-white-pure border border-sage-medium">Pending Review</span>
                   </div>
                 </div>
               ))}
            </div>
         </div>

         {/* Detail View */}
         <div className="lg:col-span-2 bg-warm-white-pure rounded-2xl border border-sage-light shadow-sm flex flex-col h-[calc(100vh-16rem)]">
            {selectedPro ? (
              <>
                <div className="p-6 border-b border-sage-light flex justify-between items-start">
                   <div>
                     <div className="flex items-center gap-3 mb-1">
                       <h2 className="text-2xl font-serif text-text-primary">{selectedPro.name}</h2>
                       <span className="bg-sage-medium/30 text-text-primary text-xs px-2 py-1 rounded font-medium">New Application</span>
                     </div>
                     <p className="text-text-secondary text-sm">{selectedPro.specialties?.join(', ') || 'Specialist'} • Applied {selectedPro.createdAt ? new Date(selectedPro.createdAt).toLocaleDateString() : 'Recently'}</p>
                   </div>
                   <div className="flex gap-2">
                      <button className="flex items-center gap-1.5 px-4 py-2 border border-alert-coral text-alert-coral rounded-lg text-sm font-medium hover:bg-alert-coral/5 transition-colors">
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                      <button 
                        onClick={() => handleApprove(selectedPro.id)}
                        disabled={actionLoading}
                        className={`flex items-center gap-1.5 px-4 py-2 bg-brand-teal text-warm-white-pure rounded-lg text-sm font-medium hover:bg-brand-teal-dark transition-colors shadow-sm ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <CheckCircle className="w-4 h-4" /> {actionLoading ? 'Verifying...' : 'Approve & Verify'}
                      </button>
                   </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6">
                   <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                         <div>
                           <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">Identity Information</h3>
                           <div className="bg-warm-white p-4 rounded-xl border border-sage-light space-y-3">
                              <div>
                                <p className="text-xs text-text-muted">Professional Alias / Name</p>
                                <p className="text-sm font-medium">{selectedPro.name}</p>
                              </div>
                              <div>
                                <p className="text-xs text-text-muted">Contact Email</p>
                                <p className="text-sm font-medium">{selectedPro.email}</p>
                              </div>
                              <div>
                                <p className="text-xs text-text-muted">Role</p>
                                <p className="text-sm font-medium capitalize">{selectedPro.role}</p>
                              </div>
                           </div>
                         </div>
                      </div>

                      <div>
                         <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">Account Details</h3>
                         <div className="bg-warm-white p-4 rounded-xl border border-sage-light space-y-3">
                            <div>
                              <p className="text-xs text-text-muted">Account ID</p>
                              <p className="text-sm font-mono font-medium">{selectedPro.id}</p>
                            </div>
                         </div>
                         <div className="mt-8 bg-trust-purple-light/30 border border-trust-purple/20 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                               <Shield className="w-5 h-5 text-trust-purple shrink-0 mt-0.5" />
                               <div>
                                  <p className="text-sm font-medium text-trust-purple mb-1">Manual Verification Required</p>
                                  <p className="text-xs text-text-secondary">Please ensure you have communicated with this professional out-of-band before approving their account access.</p>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-text-muted">
                <User className="w-12 h-12 mb-4 opacity-20" />
                <p>Select an application to review</p>
              </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default Verification;
