import React, { useEffect, useState } from 'react';
import { Search, Filter, Shield, AlertCircle, CheckCircle, XCircle, User, ArrowRight } from 'lucide-react';
import { collection, query, where, getDocs, doc, writeBatch, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../stores/authStore';
import { useProfileChangeRequestStore } from '../../stores/profileChangeRequestStore';

const Verification = () => {
  const [activeQueue, setActiveQueue] = useState('applications');
  const [queue, setQueue] = useState([]);
  const [selectedPro, setSelectedPro] = useState(null);
  const [selectedProfileRequest, setSelectedProfileRequest] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const {
    requests: profileRequests,
    fetchPendingRequests,
    approveRequest: approveProfileRequest,
    rejectRequest: rejectProfileRequest,
    isLoading: requestLoading
  } = useProfileChangeRequestStore();

  useEffect(() => {
    fetchQueue();
    fetchPendingRequests();
  }, []);

  const fetchQueue = async () => {
    try {
      const q = query(collection(db, 'professionals'), where('approvalStatus', '==', 'pending'));
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
      const adminUser = useAuthStore.getState().user;
      const batch = writeBatch(db);
      
      batch.update(doc(db, 'users', id), {
        approvalStatus: "approved",
        reviewedAt: serverTimestamp(),
        reviewedBy: adminUser?.uid || "admin",
        updatedAt: serverTimestamp()
      });

      batch.update(doc(db, 'professionals', id), {
        approvalStatus: "approved",
        verified: true,
        reviewedAt: serverTimestamp(),
        reviewedBy: adminUser?.uid || "admin",
        rejectionReason: "",
        updatedAt: serverTimestamp()
      });

      await batch.commit();

      await addDoc(collection(db, 'notifications'), {
        userId: id,
        type: "system",
        title: "Professional application approved",
        body: "Your professional account has been approved. You can now access your professional workspace.",
        link: "/pro",
        read: false,
        createdAt: serverTimestamp()
      });

      setQueue(prev => prev.filter(p => p.id !== id));
      setSelectedPro(null);
    } catch (err) {
      console.error("Error verifying:", err);
      alert("Failed to verify professional.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Enter rejection reason:");
    if (!reason) return;

    setActionLoading(true);
    try {
      const adminUser = useAuthStore.getState().user;
      const batch = writeBatch(db);

      batch.update(doc(db, 'users', id), {
        approvalStatus: "rejected",
        reviewedAt: serverTimestamp(),
        reviewedBy: adminUser?.uid || "admin",
        updatedAt: serverTimestamp()
      });

      batch.update(doc(db, 'professionals', id), {
        approvalStatus: "rejected",
        verified: false,
        reviewedAt: serverTimestamp(),
        reviewedBy: adminUser?.uid || "admin",
        rejectionReason: reason,
        updatedAt: serverTimestamp()
      });

      await batch.commit();

      await addDoc(collection(db, 'notifications'), {
        userId: id,
        type: "system",
        title: "Professional application not approved",
        body: reason,
        link: "/professional-rejected",
        read: false,
        createdAt: serverTimestamp()
      });

      setQueue(prev => prev.filter(p => p.id !== id));
      setSelectedPro(null);
    } catch (err) {
      console.error("Error rejecting:", err);
      alert("Failed to reject professional.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveProfileChange = async (reqId) => {
    setActionLoading(true);
    const adminUser = useAuthStore.getState().user;
    try {
      const success = await approveProfileRequest(reqId, selectedProfileRequest, adminUser?.uid);
      if (success) {
        setSelectedProfileRequest(null);
        await fetchPendingRequests();
      } else {
        alert("Failed to approve profile changes.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectProfileChange = async (reqId) => {
    const reason = window.prompt("Enter rejection reason:");
    if (!reason) return;

    setActionLoading(true);
    const adminUser = useAuthStore.getState().user;
    try {
      const success = await rejectProfileRequest(reqId, selectedProfileRequest, reason, adminUser?.uid);
      if (success) {
        setSelectedProfileRequest(null);
        await fetchPendingRequests();
      } else {
        alert("Failed to reject profile changes.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-serif text-text-primary">Verification Queue</h1>
          <p className="text-text-secondary mt-1">Review and approve professional applications and profile changes.</p>
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

      <div className="flex gap-4 border-b border-sage-medium mb-6">
        <button 
          onClick={() => setActiveQueue('applications')}
          className={`pb-3 px-2 font-medium text-sm transition-colors border-b-2 ${activeQueue === 'applications' ? 'border-brand-teal text-brand-teal' : 'border-transparent text-text-muted hover:text-text-primary'}`}
        >
          Professional Applications
        </button>
        <button 
          onClick={() => setActiveQueue('profileChanges')}
          className={`pb-3 px-2 font-medium text-sm transition-colors border-b-2 ${activeQueue === 'profileChanges' ? 'border-brand-teal text-brand-teal' : 'border-transparent text-text-muted hover:text-text-primary'}`}
        >
          Profile Changes
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
         {/* Queue List */}
         <div className="lg:col-span-1 bg-warm-white-pure rounded-2xl border border-sage-light shadow-sm overflow-hidden flex flex-col h-[calc(100vh-18rem)]">
            <div className="p-4 border-b border-sage-light bg-sage-light/30 font-medium text-sm text-text-primary flex justify-between items-center">
              {activeQueue === 'applications' ? 'Pending Applications' : 'Pending Profile Changes'} 
              <span className="bg-trust-purple text-white px-2 py-0.5 rounded-full text-xs">
                {activeQueue === 'applications' ? queue.length : profileRequests.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
               {activeQueue === 'applications' ? (
                 loading ? (
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
                 ))
               ) : (
                 requestLoading ? (
                   <p className="text-sm text-text-muted text-center py-8">Loading profile changes...</p>
                 ) : profileRequests.length === 0 ? (
                   <p className="text-sm text-text-muted text-center py-8">No pending profile changes.</p>
                 ) : profileRequests.map((req) => (
                   <div 
                     key={req.id} 
                     onClick={() => setSelectedProfileRequest(req)}
                     className={`p-4 rounded-xl border cursor-pointer transition-colors ${selectedProfileRequest?.id === req.id ? 'bg-sage-light/40 border-brand-teal ring-1 ring-brand-teal/50' : 'bg-warm-white hover:bg-sage-light/20 border-sage-light'}`}
                   >
                     <div className="flex justify-between items-start mb-2">
                       <span className="text-xs font-mono text-text-muted">{req.id.substring(0, 8)}...</span>
                     </div>
                     <h4 className="font-medium text-text-primary text-sm">{req.professionalName}</h4>
                     <p className="text-xs text-text-secondary mt-0.5">
                       {req.requestedSpecialties?.length || 0} Specialties • {req.requestedPricePerSession} {req.requestedCurrency}
                     </p>
                     <div className="mt-3 text-xs text-text-secondary flex justify-between items-center">
                        <span>{req.submittedAt ? new Date(req.submittedAt.toMillis()).toLocaleDateString() : 'Recent'}</span>
                        <span className="px-2 py-0.5 rounded-full bg-warm-white-pure border border-sage-medium">Pending Review</span>
                     </div>
                   </div>
                 ))
               )}
            </div>
         </div>

         {/* Detail View */}
         <div className="lg:col-span-2 bg-warm-white-pure rounded-2xl border border-sage-light shadow-sm flex flex-col h-[calc(100vh-18rem)]">
            {activeQueue === 'applications' ? (
              selectedPro ? (
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
                        <button 
                          onClick={() => handleReject(selectedPro.id)}
                          disabled={actionLoading}
                          className={`flex items-center gap-1.5 px-4 py-2 border border-alert-coral text-alert-coral rounded-lg text-sm font-medium hover:bg-alert-coral/5 transition-colors ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
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
                                <div>
                                  <p className="text-xs text-text-muted">Specialties</p>
                                  <p className="text-sm font-medium">{selectedPro.specialties?.join(', ') || 'None specified'}</p>
                                </div>
                                {selectedPro.languages && (
                                  <div>
                                    <p className="text-xs text-text-muted">Languages</p>
                                    <p className="text-sm font-medium">{selectedPro.languages?.join(', ')}</p>
                                  </div>
                                )}
                                <div>
                                  <p className="text-xs text-text-muted">Applied On</p>
                                  <p className="text-sm font-medium">{selectedPro.submittedAt ? new Date(selectedPro.submittedAt).toLocaleDateString() : selectedPro.createdAt ? new Date(selectedPro.createdAt).toLocaleDateString() : 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-text-muted">Status</p>
                                  <p className="text-sm font-medium capitalize">{selectedPro.approvalStatus || 'pending'}</p>
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
              )
            ) : (
              selectedProfileRequest ? (
                <>
                  <div className="p-6 border-b border-sage-light flex justify-between items-start">
                     <div>
                       <div className="flex items-center gap-3 mb-1">
                         <h2 className="text-2xl font-serif text-text-primary">{selectedProfileRequest.professionalName}</h2>
                         <span className="bg-brand-teal/10 text-brand-teal text-xs px-2 py-1 rounded font-medium">Profile Update</span>
                       </div>
                       <p className="text-text-secondary text-sm">{selectedProfileRequest.professionalEmail}</p>
                     </div>
                     <div className="flex gap-2">
                        <button 
                          onClick={() => handleRejectProfileChange(selectedProfileRequest.id)}
                          disabled={actionLoading || requestLoading}
                          className={`flex items-center gap-1.5 px-4 py-2 border border-alert-coral text-alert-coral rounded-lg text-sm font-medium hover:bg-alert-coral/5 transition-colors ${actionLoading || requestLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <XCircle className="w-4 h-4" /> Reject Changes
                        </button>
                        <button 
                          onClick={() => handleApproveProfileChange(selectedProfileRequest.id)}
                          disabled={actionLoading || requestLoading}
                          className={`flex items-center gap-1.5 px-4 py-2 bg-brand-teal text-warm-white-pure rounded-lg text-sm font-medium hover:bg-brand-teal-dark transition-colors shadow-sm ${actionLoading || requestLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <CheckCircle className="w-4 h-4" /> Approve Profile Changes
                        </button>
                     </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6">
                     <div className="grid md:grid-cols-2 gap-8">
                        {/* Current Profile */}
                        <div className="space-y-6">
                           <div>
                             <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">Current Approved Profile</h3>
                             <div className="bg-warm-white p-4 rounded-xl border border-sage-light space-y-4">
                                <div>
                                  <p className="text-xs text-text-muted mb-1">Session Fee</p>
                                  <p className="text-sm font-medium">{selectedProfileRequest.currentPricePerSession} {selectedProfileRequest.currentCurrency}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-text-muted mb-1">Specialties</p>
                                  <div className="flex flex-wrap gap-1">
                                    {selectedProfileRequest.currentSpecialties?.length ? selectedProfileRequest.currentSpecialties.map(s => (
                                      <span key={s} className="bg-sage-light/50 text-text-primary px-2 py-1 rounded text-xs">{s}</span>
                                    )) : <span className="text-xs text-text-muted">None</span>}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs text-text-muted mb-1">Languages</p>
                                  <div className="flex flex-wrap gap-1">
                                    {selectedProfileRequest.currentLanguages?.length ? selectedProfileRequest.currentLanguages.map(l => (
                                      <span key={l} className="bg-sage-light/50 text-text-primary px-2 py-1 rounded text-xs">{l}</span>
                                    )) : <span className="text-xs text-text-muted">None</span>}
                                  </div>
                                </div>
                             </div>
                           </div>
                        </div>

                        {/* Requested Changes */}
                        <div className="space-y-6">
                           <div>
                             <h3 className="text-sm font-medium text-brand-teal uppercase tracking-wider mb-3">Requested Changes</h3>
                             <div className="bg-brand-teal/5 p-4 rounded-xl border border-brand-teal/20 space-y-4">
                                <div>
                                  <p className="text-xs text-text-muted mb-1">Session Fee</p>
                                  <p className="text-sm font-bold text-brand-teal">{selectedProfileRequest.requestedPricePerSession} {selectedProfileRequest.requestedCurrency}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-text-muted mb-1">Specialties</p>
                                  <div className="flex flex-wrap gap-1">
                                    {selectedProfileRequest.requestedSpecialties?.length ? selectedProfileRequest.requestedSpecialties.map(s => (
                                      <span key={s} className="bg-brand-teal/10 border border-brand-teal/20 text-brand-teal px-2 py-1 rounded text-xs font-medium">{s}</span>
                                    )) : <span className="text-xs text-text-muted">None</span>}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs text-text-muted mb-1">Languages</p>
                                  <div className="flex flex-wrap gap-1">
                                    {selectedProfileRequest.requestedLanguages?.length ? selectedProfileRequest.requestedLanguages.map(l => (
                                      <span key={l} className="bg-brand-teal/10 border border-brand-teal/20 text-brand-teal px-2 py-1 rounded text-xs font-medium">{l}</span>
                                    )) : <span className="text-xs text-text-muted">None</span>}
                                  </div>
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
                  <p>Select a profile change request to review</p>
                </div>
              )
            )}
         </div>
      </div>
    </div>
  );
};

export default Verification;
