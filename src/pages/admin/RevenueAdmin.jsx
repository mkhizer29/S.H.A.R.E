import React, { useEffect, useState } from 'react';
import { Banknote, Percent, Download, Activity, RefreshCw, FileImage, CheckCircle, XCircle, X } from 'lucide-react';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const RevenueAdmin = () => {
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProof, setSelectedProof] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProofs = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'payment_proofs'), orderBy('createdAt', 'desc'));
      const snaps = await getDocs(q);
      const data = snaps.docs.map(d => ({ id: d.id, ...d.data() }));
      setProofs(data);
    } catch (err) {
      console.error("Failed to fetch proofs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProofs();
  }, []);

  const handleAction = async (status) => {
    if (!selectedProof) return;
    setActionLoading(true);
    try {
      // Update proof document
      await updateDoc(doc(db, 'payment_proofs', selectedProof.id), {
        status,
        reviewedAt: new Date().toISOString()
      });

      // Update booking document
      const paymentStatus = status === 'approved' ? 'paid' : 'rejected';
      const bookingUpdates = { paymentStatus };
      if (status === 'rejected') {
        bookingUpdates.status = 'cancelled';
      }
      await updateDoc(doc(db, 'bookings', selectedProof.bookingId), bookingUpdates);

      // Update local state
      setProofs(prev => prev.map(p => p.id === selectedProof.id ? { ...p, status } : p));
      setSelectedProof(null);
    } catch (err) {
      console.error("Action failed:", err);
      alert("Failed to process action.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl relative">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-serif text-text-primary">Revenue Control</h1>
          <p className="text-text-secondary mt-1">Platform financials, commission settings, and payment reviews.</p>
        </div>
      </div>

      <div className="bg-warm-white-pure rounded-2xl border border-sage-light shadow-sm overflow-hidden">
        <div className="p-4 border-b border-sage-light flex justify-between items-center bg-warm-white/50">
          <h3 className="font-medium text-text-primary">Payment Proofs Review</h3>
          <button onClick={fetchProofs} className="text-xs flex items-center gap-1 font-medium text-text-secondary hover:text-text-primary transition-colors">
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sage-light/30 text-text-secondary text-xs uppercase tracking-wider">
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Booking ID</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-light text-sm">
               {loading ? (
                 <tr><td colSpan="5" className="px-6 py-8 text-center text-text-muted">Loading payment proofs...</td></tr>
               ) : proofs.length === 0 ? (
                 <tr><td colSpan="5" className="px-6 py-8 text-center text-text-muted">No payment proofs found.</td></tr>
               ) : proofs.map((item) => (
                 <tr key={item.id} className="hover:bg-warm-white/50 transition-colors">
                    <td className="px-6 py-4 text-text-secondary">
                      {item.createdAt ? new Date(item.createdAt.toDate()).toLocaleString() : 'Recent'}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{item.bookingId.split('_')[1] || item.bookingId}</td>
                    <td className="px-6 py-4 font-mono">{item.currency} {item.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                       <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${
                         item.status === 'approved' ? 'bg-green-100 text-green-700' : 
                         item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                         'bg-yellow-100 text-yellow-700'
                       }`}>
                         {item.status}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button 
                         onClick={() => setSelectedProof(item)}
                         className="text-brand-teal hover:underline font-medium text-xs flex items-center gap-1 justify-end w-full"
                       >
                         <FileImage className="w-3 h-3" /> View Proof
                       </button>
                    </td>
                 </tr>
               ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proof Modal */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b flex justify-between items-center bg-sage-light/30">
              <h3 className="font-bold text-lg text-text-primary">Review Payment Proof</h3>
              <button onClick={() => setSelectedProof(null)} className="text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto bg-gray-50 flex items-center justify-center">
              {selectedProof.fileUrl ? (
                <img src={selectedProof.fileUrl} alt="Payment Proof" className="max-w-full h-auto rounded shadow-sm border border-gray-200" />
              ) : (
                <p className="text-text-muted">No valid image URL found.</p>
              )}
            </div>

            <div className="p-4 border-t bg-white space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-text-muted">Amount:</span> <span className="font-mono font-bold">{selectedProof.currency} {selectedProof.amount}</span></div>
                <div><span className="text-text-muted">Booking:</span> <span className="font-mono">{selectedProof.bookingId}</span></div>
                <div><span className="text-text-muted">Patient:</span> <span className="font-mono">{selectedProof.patientId}</span></div>
                <div><span className="text-text-muted">Pro:</span> <span className="font-mono">{selectedProof.professionalId}</span></div>
              </div>

              {selectedProof.status === 'pending' && (
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => handleAction('rejected')}
                    disabled={actionLoading}
                    className="flex-1 py-2.5 border border-alert-coral text-alert-coral font-bold rounded-xl hover:bg-alert-coral/10 transition flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" /> Reject & Cancel
                  </button>
                  <button 
                    onClick={() => handleAction('approved')}
                    disabled={actionLoading}
                    className="flex-1 py-2.5 bg-brand-teal text-white font-bold rounded-xl hover:bg-brand-teal-dark transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve Payment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueAdmin;
