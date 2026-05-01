import React from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar as CalendarIcon, Banknote, MessageSquare, CheckCircle, TrendingUp, Phone, Clock } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import { useBookingStore } from '../../stores/bookingStore';
import { useChatStore } from '../../stores/chatStore';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import JoinSessionButton from '../../components/JoinSessionButton';

const ProDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { sessions, loadBookings, isLoading } = useBookingStore();
  const { conversations, fetchConversations } = useChatStore();

  useEffect(() => {
    if (user?.uid) {
      loadBookings(user.uid, 'professional')
      fetchConversations(user.uid, 'pro')
    }
  }, [user?.uid, loadBookings, fetchConversations])

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Active Clients: Unique patient IDs from bookings and conversations
  const activeClients = new Set([
    ...sessions.filter(s => s.patientId).map(s => s.patientId),
    ...conversations.filter(c => c.patientUid).map(c => c.patientUid)
  ]).size;

  // Sessions This Week: Bookings from the start of the current week (Sunday)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const sessionsThisWeek = sessions.filter(s => {
    const d = new Date(s.startsAt);
    return d >= startOfWeek && s.status === 'upcoming';
  }).length;

  const sessionsToday = sessions.filter(s => {
    const d = new Date(s.startsAt);
    return d.toDateString() === now.toDateString() && s.status === 'upcoming';
  }).length;

  // Earnings MTD: Sum of amounts for non-cancelled sessions this month
  const earningsMTD = sessions
    .filter(s => {
      const d = new Date(s.startsAt);
      return d.getMonth() === currentMonth && 
             d.getFullYear() === currentYear && 
             s.status !== 'cancelled';
    })
    .reduce((sum, s) => sum + (Number(s.amount) || 0), 0);

  const stats = [
    { 
      label: 'Active Clients', 
      value: activeClients.toString(), 
      icon: Users, 
      trend: activeClients > 0 ? 'Practice growing' : 'Awaiting first client' 
    },
    { 
      label: 'Sessions This Week', 
      value: sessionsThisWeek.toString(), 
      icon: CalendarIcon, 
      trend: `${sessionsToday} today` 
    },
    { 
      label: 'Earnings MTD', 
      value: `PKR ${earningsMTD.toLocaleString()}`, 
      icon: Banknote, 
      trend: earningsMTD > 0 ? 'Revenue tracked' : 'Monthly overview' 
    },
  ];

  const upcomingSessions = sessions
    .filter(s => {
      const d = new Date(s.startsAt);
      return d.toDateString() === now.toDateString() && s.status === 'upcoming';
    })
    .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt))
    .slice(0, 3);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex justify-between items-end px-1">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Welcome, {user?.name || 'Dr. Professional'}</h1>
          <p className="text-[15px] font-medium text-neutral-500 mt-2">Here's your practice overview for today.</p>
        </div>
        {!user?.verified && (
          <Badge variant="alert">Verification Pending</Badge>
        )}
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
          >
            <Card hover={true} className="p-6 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-primary-light rounded-[16px]">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <span className="text-[12px] font-bold text-primary bg-primary-light px-2.5 py-1 rounded-full flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {stat.trend.split(' ')[0]}
                </span>
              </div>
              <div>
                <p className="text-[13px] font-bold text-neutral-400 tracking-wide uppercase mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-neutral-900 tracking-tight">{stat.value}</h3>
                <p className="text-[13px] font-medium text-neutral-500 mt-2">{stat.trend}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <Card hover={false} className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-neutral-900 tracking-tight">Today's Schedule</h3>
              <button className="text-[14px] font-semibold text-primary hover:text-primary-hover transition-colors">View Calendar →</button>
            </div>
            <div className="space-y-4">
              {isLoading ? (
                <div className="py-12 flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <p className="text-neutral-400 font-medium animate-pulse">Fetching your schedule...</p>
                </div>
              ) : upcomingSessions.length === 0 ? (
                <div className="py-12 text-center bg-surface-tinted rounded-2xl border border-dashed border-neutral-200">
                   <CalendarIcon size={32} className="text-neutral-300 mx-auto mb-3" />
                   <p className="text-neutral-500 font-medium">No sessions scheduled for today.</p>
                </div>
              ) : (
                upcomingSessions.map((session, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 rounded-2xl bg-surface-tinted border border-neutral-100 hover:border-primary-light transition-colors group">
                    <div className="flex items-center gap-4">
                      <Avatar name={session.patientAlias || 'Anonymous'} size="md" />
                      <div>
                        <p className="font-bold text-[15px] text-neutral-900">{session.patientAlias || 'Anonymous'}</p>
                        <p className="text-[13px] font-medium text-neutral-500">{session.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-[14px] font-medium text-neutral-500">
                        <Clock size={16} className="text-primary" />
                        <span>
                          {new Date(session.startsAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {' '}
                          {new Date(session.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <JoinSessionButton 
                        startsAt={session.startsAt} 
                        sessionId={session.id} 
                        role="professional" 
                        size="sm"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
          <Card hover={false} className="p-6 md:p-8 h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-neutral-900 tracking-tight">Recent Activity</h3>
              <button onClick={() => navigate('/pro/inbox')} className="text-[14px] font-semibold text-primary hover:text-primary-hover transition-colors">View All →</button>
            </div>
            <div className="space-y-4">
              {conversations.length === 0 ? (
                <div className="py-8 text-center bg-surface-tinted rounded-2xl border border-dashed border-neutral-200">
                  <MessageSquare size={24} className="text-neutral-300 mx-auto mb-2" />
                  <p className="text-neutral-500 text-sm font-medium">No recent messages.</p>
                </div>
              ) : (
                conversations.slice(0, 2).map((conv) => {
                  const unreadCount = conv.unreadBy?.includes(user?.uid) || (conv.unreadCount?.[user?.uid] > 0)
                  return (
                    <div key={conv.id} className={`p-5 rounded-2xl border flex gap-4 items-start transition-all ${unreadCount ? 'bg-primary-light/40 border-primary-light' : 'bg-surface-tinted border-neutral-100'}`}>
                      <Avatar name={conv.patientName || 'Patient'} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-bold text-neutral-900 text-[15px] truncate">{conv.patientName || 'Anonymous'}</p>
                          <span className="text-[11px] font-semibold text-neutral-400">{conv.lastTime}</span>
                        </div>
                        <p className="text-[14px] font-medium text-neutral-600 truncate">{conv.lastMessage}</p>
                        <button onClick={() => navigate('/pro/inbox')} className="text-[13px] font-bold text-primary mt-2 hover:text-primary-hover transition-colors">Reply →</button>
                      </div>
                    </div>
                  )
                })
              )}
              <div className="p-5 rounded-2xl bg-alert-light/50 border border-alert-light flex gap-4 items-start">
                <CheckCircle className="w-5 h-5 text-alert mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-neutral-900 text-[15px] mb-1">Action Required: Intake Notes</p>
                  <p className="text-[14px] font-medium text-neutral-600">Please complete your notes for recent sessions.</p>
                  <button onClick={() => navigate('/pro/clients')} className="text-[13px] font-bold text-alert mt-3 hover:text-red-500 transition-colors">Complete Notes →</button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ProDashboard;
