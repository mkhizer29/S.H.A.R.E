import React, { useEffect, useState } from 'react';
import { Users, AlertTriangle, ShieldCheck, DollarSign, Activity, FileText } from 'lucide-react';
import { collection, getCountFromServer, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPros: 0,
    pendingProofs: 0,
    activeBookings: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersCount = await getCountFromServer(collection(db, 'users'));
        const prosCount = await getCountFromServer(collection(db, 'professionals'));
        const proofsCount = await getCountFromServer(query(collection(db, 'payment_proofs'), where('status', '==', 'pending')));
        const bookingsCount = await getCountFromServer(query(collection(db, 'bookings'), where('status', 'in', ['upcoming', 'confirmed', 'in_progress'])));
        
        const recentQ = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'), limit(4));
        const recentSnaps = await getDocs(recentQ);
        const recentActivity = recentSnaps.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setStats({
          totalUsers: usersCount.data().count,
          totalPros: prosCount.data().count,
          pendingProofs: proofsCount.data().count,
          activeBookings: bookingsCount.data().count,
          recentActivity
        });
      } catch (err) {
        console.error("Failed to fetch admin stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h1 className="text-3xl font-serif text-text-primary">Command Center</h1>
        <p className="text-text-secondary mt-1">System overview and critical metrics.</p>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-warm-white-pure rounded-2xl border border-sage-light"></div>)}
          </div>
        </div>
      ) : (
        <>
          {/* Live Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-warm-white-pure p-6 rounded-2xl border border-sage-light shadow-sm">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-sage-light rounded-xl">
                  <Users className="w-6 h-6 text-brand-teal" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-text-secondary text-sm font-medium mb-1">Total Users</p>
                <h3 className="text-3xl font-serif text-text-primary">{stats.totalUsers.toLocaleString()}</h3>
              </div>
            </div>
            
            <div className="bg-warm-white-pure p-6 rounded-2xl border border-sage-light shadow-sm">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-trust-purple-light rounded-xl">
                  <ShieldCheck className="w-6 h-6 text-trust-purple" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-text-secondary text-sm font-medium mb-1">Professionals</p>
                <h3 className="text-3xl font-serif text-text-primary">{stats.totalPros.toLocaleString()}</h3>
              </div>
            </div>

            <div className="bg-warm-white-pure p-6 rounded-2xl border border-sage-light shadow-sm">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-sage-light rounded-xl">
                  <Activity className="w-6 h-6 text-brand-teal" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-text-secondary text-sm font-medium mb-1">Active Bookings</p>
                <h3 className="text-3xl font-serif text-text-primary">{stats.activeBookings.toLocaleString()}</h3>
              </div>
            </div>

            <div className={`bg-warm-white-pure p-6 rounded-2xl border ${stats.pendingProofs > 0 ? 'border-alert-coral/30' : 'border-sage-light'} shadow-sm relative overflow-hidden`}>
              {stats.pendingProofs > 0 && <div className="absolute top-0 right-0 w-16 h-16 bg-alert-coral-light rounded-bl-full opacity-50"></div>}
              <div className="flex justify-between items-start relative z-10">
                <div className={`p-3 rounded-xl ${stats.pendingProofs > 0 ? 'bg-alert-coral/10' : 'bg-sage-light'}`}>
                  <FileText className={`w-6 h-6 ${stats.pendingProofs > 0 ? 'text-alert-coral' : 'text-brand-teal'}`} />
                </div>
              </div>
              <div className="mt-4 relative z-10">
                <p className="text-text-secondary text-sm font-medium mb-1">Pending Proofs</p>
                <h3 className={`text-3xl font-serif ${stats.pendingProofs > 0 ? 'text-alert-coral' : 'text-text-primary'}`}>{stats.pendingProofs}</h3>
                {stats.pendingProofs > 0 && (
                  <button className="mt-3 text-xs bg-alert-coral text-warm-white-pure px-3 py-1.5 rounded-full hover:bg-alert-coral/90 transition-colors">
                    Review Required
                  </button>
                )}
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
                      <p className="font-medium text-text-primary text-sm">Database & Storage</p>
                      <p className="text-xs text-text-secondary">Firestore & Bucket Access</p>
                   </div>
                   <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-md">Operational</span>
                </div>
                <div className="flex justify-between items-end pb-2">
                   <div>
                      <p className="font-medium text-text-primary text-sm">E2E Key Infrastructure</p>
                      <p className="text-xs text-text-secondary">Cryptographic material distribution</p>
                   </div>
                   <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-md">Operational</span>
                </div>
              </div>
            </div>

            <div className="bg-warm-white-pure rounded-2xl border border-sage-light shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-serif text-text-primary">Recent Bookings</h3>
              </div>
              <div className="space-y-4">
                {stats.recentActivity.length === 0 ? (
                  <p className="text-sm text-text-muted">No recent bookings found.</p>
                ) : stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex gap-4">
                     <div className={`w-2 rounded-full ${activity.status === 'upcoming' ? 'bg-brand-teal' : 'bg-sage-medium'}`}></div>
                     <div>
                        <p className="text-sm font-medium text-text-primary">New booking for {activity.proName}</p>
                        <p className="text-xs text-text-muted">
                          {activity.createdAt ? new Date(activity.createdAt.toDate()).toLocaleString() : 'Just now'} • ID: {activity.id.split('_')[1] || activity.id}
                        </p>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
