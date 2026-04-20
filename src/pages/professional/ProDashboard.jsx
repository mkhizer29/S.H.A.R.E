import React from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar as CalendarIcon, DollarSign, MessageSquare, CheckCircle, TrendingUp, Phone } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const ProDashboard = () => {
  const { user } = useAuthStore();

  const stats = [
    { label: 'Active Clients', value: '12', icon: Users, trend: '+2 this month' },
    { label: 'Sessions This Week', value: '18', icon: CalendarIcon, trend: '4 today' },
    { label: 'Earnings MTD', value: '$2,450', icon: DollarSign, trend: '+15% vs last month' },
  ];

  const upcomingSessions = [
    { id: 1, client: 'BlueJay', time: '10:00 AM', type: 'Voice Session' },
    { id: 2, client: 'ForestWalker', time: '1:00 PM', type: 'Voice Session' },
    { id: 3, client: 'OceanBreeze', time: '3:30 PM', type: 'Text Chat' },
  ];

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
              {upcomingSessions.map((session, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 rounded-2xl bg-surface-tinted border border-neutral-100 hover:border-primary-light transition-colors group">
                  <div className="flex items-center gap-4">
                    <Avatar name={session.client} size="md" />
                    <div>
                      <p className="font-bold text-[15px] text-neutral-900">{session.client}</p>
                      <p className="text-[13px] font-medium text-neutral-500">{session.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold text-[14px] text-neutral-900">{session.time}</p>
                    <Button variant="primary" size="sm" icon={<Phone size={14} />} className="font-semibold shadow-sm">
                      Join
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
          <Card hover={false} className="p-6 md:p-8 h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-neutral-900 tracking-tight">Action Items</h3>
              <span className="bg-alert text-white text-[12px] font-bold px-3 py-1 rounded-full shadow-sm">2 Actions</span>
            </div>
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-accent-light/40 border border-accent-light flex gap-4 items-start">
                <MessageSquare className="w-5 h-5 text-accent-hover mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-neutral-900 text-[15px] mb-1">New message from RiverStone</p>
                  <p className="text-[14px] font-medium text-neutral-600">"I have a question about our next session..."</p>
                  <button className="text-[13px] font-bold text-accent-hover mt-3 hover:text-accent transition-colors">Reply Now →</button>
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-alert-light/50 border border-alert-light flex gap-4 items-start">
                <CheckCircle className="w-5 h-5 text-alert mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-neutral-900 text-[15px] mb-1">Action Required: Intake Notes</p>
                  <p className="text-[14px] font-medium text-neutral-600">Please complete your notes for the session with MountainPine.</p>
                  <button className="text-[13px] font-bold text-alert mt-3 hover:text-red-500 transition-colors">Complete Notes →</button>
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
