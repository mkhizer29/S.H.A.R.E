import { useState, useMemo, useEffect } from 'react';
import { Search, MoreHorizontal, FileText, MessageSquare, Users, Loader2 } from 'lucide-react';
import Avatar from '../../components/ui/Avatar';
import Card from '../../components/ui/Card';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useBookingStore } from '../../stores/bookingStore';
import { useChatStore } from '../../stores/chatStore';

const Clients = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { sessions, loadBookings, isLoading: loadingSessions } = useBookingStore();
  const { conversations, fetchConversations, isLoading: loadingConvs, setActiveConv } = useChatStore();
  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => {
    if (user?.uid) {
      loadBookings(user.uid, 'professional');
      fetchConversations(user.uid, 'pro');
    }
  }, [user?.uid, loadBookings, fetchConversations]);

  const handleMessageClient = (clientId) => {
    // Find conversation for this client
    const conv = conversations.find(c => c.patientUid === clientId);
    if (conv) {
      setActiveConv(conv.id);
      navigate('/pro/inbox');
    }
  };

  const clients = useMemo(() => {
    const roster = {};
    const now = new Date();

    // 1. Process conversations first (initial connection)
    conversations.forEach(conv => {
      const uid = conv.patientUid;
      if (!uid) return;
      
      roster[uid] = {
        id: uid,
        alias: conv.patientAlias || conv.patientName || 'Anonymous',
        sessions: 0,
        lastActive: conv.lastTimestamp?.toDate ? conv.lastTimestamp.toDate() : new Date(0),
        status: 'Connected',
        nextSession: null
      };
    });

    // 2. Overlay booking data
    sessions.forEach(session => {
      const uid = session.patientId;
      if (!uid) return;

      if (!roster[uid]) {
        roster[uid] = {
          id: uid,
          alias: session.patientAlias || 'Anonymous',
          sessions: 0,
          lastActive: new Date(0),
          status: 'Active',
          nextSession: null
        };
      }

      // Update session count (non-cancelled)
      if (session.status !== 'cancelled') {
        roster[uid].sessions += 1;
      }

      // Update last active if session is newer
      const sessionDate = new Date(session.startsAt);
      if (sessionDate > roster[uid].lastActive) {
        roster[uid].lastActive = sessionDate;
      }

      // Update next session if in future
      if (session.status === 'upcoming' && sessionDate > now) {
        if (!roster[uid].nextSession || sessionDate < new Date(roster[uid].nextSession)) {
          roster[uid].nextSession = session.startsAt;
          roster[uid].status = 'Active';
        }
      }
    });

    const list = Object.values(roster).sort((a, b) => b.lastActive - a.lastActive);
    
    if (!searchQuery) return list;
    return list.filter(c => c.alias.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [sessions, conversations, searchQuery]);

  const formatLastActive = (date) => {
    if (!date || date.getTime() === 0) return 'Just connected';
    const diff = new Date() - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 px-1">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">My Clients</h1>
          <p className="text-[15px] font-medium text-neutral-500 mt-2">Manage your active roster and secure case notes.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by alias..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border-2 border-neutral-200 rounded-[20px] py-3.5 pl-11 pr-5 text-[15px] font-medium text-neutral-900 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-neutral-400 shadow-sm"
          />
        </div>
      </div>

      {(loadingSessions || loadingConvs) && clients.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center bg-surface rounded-[40px] border border-neutral-100">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-neutral-500 font-medium">Syncing client roster...</p>
        </div>
      ) : clients.length === 0 ? (
        <div className="py-20 text-center bg-surface rounded-[40px] border-2 border-dashed border-neutral-200">
          <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-6">
            <Users size={32} className="text-primary" />
          </div>
          <p className="text-2xl font-bold text-neutral-900 tracking-tight mb-2">No clients found</p>
          <p className="text-[15px] text-neutral-500 max-w-sm mx-auto">When patients connect with you or book sessions, they will appear here.</p>
        </div>
      ) : (
        <div className="bg-surface rounded-[32px] border border-neutral-200 shadow-soft overflow-hidden">
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-neutral-100 bg-surface-tinted/50">
                  <th className="px-8 py-5 text-[12px] font-bold tracking-wider uppercase text-neutral-400">Alias</th>
                  <th className="px-6 py-5 text-[12px] font-bold tracking-wider uppercase text-neutral-400">Status</th>
                  <th className="px-6 py-5 text-[12px] font-bold tracking-wider uppercase text-neutral-400">Total Sessions</th>
                  <th className="px-6 py-5 text-[12px] font-bold tracking-wider uppercase text-neutral-400">Next Session</th>
                  <th className="px-6 py-5 text-[12px] font-bold tracking-wider uppercase text-neutral-400">Last Active</th>
                  <th className="px-8 py-5 text-[12px] font-bold tracking-wider uppercase text-neutral-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-neutral-50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <Avatar name={client.alias} size="md" />
                        <span className="font-bold text-[15px] text-neutral-900">{client.alias}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wide ${
                        client.status === 'Active' ? 'bg-[#E6EFEA] text-[#6DA398] border border-[#6DA398]/30' :
                        'bg-surface-tinted text-neutral-500 border border-neutral-200'
                      }`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-neutral-500 font-medium text-[15px]">
                      {client.sessions}
                    </td>
                    <td className="px-6 py-5">
                      {client.nextSession ? (
                        <span className="text-[14px] font-bold text-primary bg-primary-light/40 px-3 py-1.5 rounded-xl border border-primary-light/50">
                          {new Date(client.nextSession).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(client.nextSession).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      ) : (
                        <span className="text-[14px] font-medium text-neutral-400 italic">None Scheduled</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-neutral-500 font-medium text-[15px]">
                      {formatLastActive(client.lastActive)}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleMessageClient(client.id)}
                          className="p-2.5 text-neutral-400 hover:text-primary hover:bg-primary-light transition-colors rounded-xl border border-transparent hover:border-primary-light" 
                          title="Message"
                        >
                          <MessageSquare size={18} />
                        </button>
                        <button className="p-2.5 text-neutral-400 hover:text-primary hover:bg-primary-light transition-colors rounded-xl border border-transparent hover:border-primary-light" title="Secure Notes">
                          <FileText size={18} />
                        </button>
                        <button className="p-2.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200 transition-colors rounded-xl">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
