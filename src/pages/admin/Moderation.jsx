import React, { useState, useEffect } from 'react';
import { Search, SearchX, Shield, Ban, Trash2, StopCircle, User } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const Moderation = () => {
  const [activeTab, setActiveTab] = useState('patients'); // 'patients' | 'professionals'
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchRecent = async () => {
    setLoading(true);
    setHasSearched(false);
    try {
      if (activeTab === 'patients') {
        const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(50));
        const snaps = await getDocs(q);
        const data = snaps.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.role === 'patient').slice(0, 10);
        setItems(data);
      } else {
        const q = query(collection(db, 'professionals'), orderBy('createdAt', 'desc'), limit(10));
        const snaps = await getDocs(q);
        setItems(snaps.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecent();
    setSearchQuery('');
  }, [activeTab]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      return fetchRecent();
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const collectionName = activeTab === 'patients' ? 'users' : 'professionals';
      
      const qEmail = query(collection(db, collectionName), where('email', '==', searchQuery.trim().toLowerCase()));
      const snapsEmail = await getDocs(qEmail);
      let results = snapsEmail.docs.map(d => ({ id: d.id, ...d.data() }));

      if (results.length === 0) {
        // We assume 'name' for professionals and 'alias' for users
        const nameField = activeTab === 'patients' ? 'alias' : 'name';
        const qAlias = query(collection(db, collectionName), 
          where(nameField, '>=', searchQuery),
          where(nameField, '<=', searchQuery + '\uf8ff'),
          limit(10)
        );
        const snapsAlias = await getDocs(qAlias);
        results = snapsAlias.docs.map(d => ({ id: d.id, ...d.data() }));
      }

      if (activeTab === 'patients') {
        results = results.filter(u => u.role === 'patient');
      }
      setItems(results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-serif text-text-primary">Moderation</h1>
        <p className="text-text-secondary mt-1">Manage user status, handle reports, and enforce platform guidelines.</p>
      </div>

      <div className="bg-warm-white-pure rounded-2xl border border-sage-light shadow-sm overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
         {/* Tabs */}
         <div className="flex gap-6 border-b border-sage-light px-6 pt-4 bg-warm-white/30">
            <button 
              onClick={() => setActiveTab('patients')}
              className={`pb-3 px-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'patients' ? 'border-brand-teal text-brand-teal' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
            >
              Patients
            </button>
            <button 
              onClick={() => setActiveTab('professionals')}
              className={`pb-3 px-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'professionals' ? 'border-brand-teal text-brand-teal' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
            >
              Professionals
            </button>
         </div>

         {/* Search Header */}
         <form onSubmit={handleSearch} className="p-4 border-b border-sage-light bg-warm-white/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab === 'patients' ? 'exact email or alias' : 'exact email or name'}...`}
                className="w-full bg-white border border-sage-medium rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
              />
            </div>
            <div className="flex gap-2 text-sm w-full sm:w-auto">
               <button type="submit" className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-text-primary text-warm-white-pure rounded-lg hover:bg-text-secondary transition-colors font-medium">
                  Search
               </button>
            </div>
         </form>

         {/* Content Area */}
         <div className="flex-1 overflow-y-auto p-0 bg-white">
           {loading ? (
             <div className="flex items-center justify-center h-full">
               <p className="text-text-muted animate-pulse">Loading directory...</p>
             </div>
           ) : items.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-warm-white/30">
                <div className="w-16 h-16 bg-sage-light rounded-full flex items-center justify-center mb-4 border border-sage-medium/50 shadow-sm">
                  <SearchX className="w-8 h-8 text-text-muted" />
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">No {activeTab === 'patients' ? 'Patients' : 'Professionals'} Found</h3>
                <p className="text-sm text-text-secondary max-w-md">
                  {hasSearched ? "Try searching with an exact email address." : `The platform currently has no ${activeTab === 'patients' ? 'patients' : 'professionals'} to display.`}
                </p>
             </div>
           ) : (
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-sage-light/20 text-text-secondary text-xs uppercase tracking-wider">
                   <th className="px-6 py-4 font-medium">User Profile</th>
                   <th className="px-6 py-4 font-medium">Status</th>
                   <th className="px-6 py-4 font-medium">Joined</th>
                   <th className="px-6 py-4 font-medium text-right">Moderation Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-sage-light/60 text-sm">
                 {items.map((item) => (
                   <tr key={item.id} className="hover:bg-warm-white/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal font-bold text-sm uppercase shadow-sm border border-brand-teal/20">
                            {(item.alias || item.name) ? (item.alias || item.name).charAt(0) : <User className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-medium text-text-primary text-base">{item.alias || item.name || 'Unknown'}</p>
                            <p className="text-xs text-text-muted">{item.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         {activeTab === 'professionals' && item.verified === false ? (
                           <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                             Unverified
                           </span>
                         ) : (
                           <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                             Active
                           </span>
                         )}
                      </td>
                      <td className="px-6 py-4 text-text-secondary text-sm">
                        {item.createdAt ? new Date(item.createdAt.toDate ? item.createdAt.toDate() : item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex items-center justify-end gap-2">
                           <button className="flex items-center gap-1.5 text-xs font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-lg hover:bg-yellow-100 transition shadow-sm">
                             <StopCircle className="w-3.5 h-3.5" /> Suspend
                           </button>
                           <button className="flex items-center gap-1.5 text-xs font-medium text-alert-coral bg-alert-coral/10 border border-alert-coral/20 px-3 py-1.5 rounded-lg hover:bg-alert-coral/20 transition shadow-sm">
                             <Ban className="w-3.5 h-3.5" /> Ban
                           </button>
                         </div>
                      </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           )}
         </div>
      </div>
    </div>
  );
};

export default Moderation;
