import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Banknote, TrendingUp, CheckCircle, Clock, Calendar, AlertCircle, ArrowDownRight, ArrowUpRight, Settings2, Info, FileText } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import ProofModal from '../../components/ui/ProofModal';
import { useAuthStore } from '../../stores/authStore';
import { useBookingStore } from '../../stores/bookingStore';

/* ─── Constants ─────────────────────────────────────────────── */

const PLATFORM_FEE_RATE = 0.15; // 15% platform fee

/** Format a number as PKR with commas */
const formatPKR = (n) => `PKR ${Math.round(n).toLocaleString('en-PK')}`;

/** Short date from ISO string */
const shortDate = (iso) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

/** Get next Friday from today */
const getNextFriday = () => {
  const d = new Date();
  const day = d.getDay();
  const daysUntilFri = (5 - day + 7) % 7 || 7; // if today is Fri, next Fri
  d.setDate(d.getDate() + daysUntilFri);
  return d;
};

/* ─── Component ─────────────────────────────────────────────── */

const Revenue = () => {
  const { user } = useAuthStore();
  const { sessions, loadBookings, isLoading } = useBookingStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProof, setSelectedProof] = useState(null);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      loadBookings(user.uid, 'professional');
    }
  }, [user?.uid, loadBookings]);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  /* ─── Derived financials ─── */

  /** Only non-cancelled bookings with a positive amount are revenue */
  const revenueBookings = useMemo(() =>
    sessions.filter(s => s.status !== 'cancelled' && Number(s.amount) > 0),
  [sessions]);

  /** This month's earnings */
  const monthlyGross = useMemo(() =>
    revenueBookings
      .filter(s => {
        const d = new Date(s.startsAt);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, s) => sum + Number(s.amount || 0), 0),
  [revenueBookings, currentMonth, currentYear]);

  const monthlyFee = monthlyGross * PLATFORM_FEE_RATE;
  const monthlyNet = monthlyGross - monthlyFee;

  /** Previous month comparison */
  const prevMonthNet = useMemo(() => {
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const gross = revenueBookings
      .filter(s => {
        const d = new Date(s.startsAt);
        return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
      })
      .reduce((sum, s) => sum + Number(s.amount || 0), 0);
    return gross - (gross * PLATFORM_FEE_RATE);
  }, [revenueBookings, currentMonth, currentYear]);

  const monthOverMonthPct = prevMonthNet > 0
    ? Math.round(((monthlyNet - prevMonthNet) / prevMonthNet) * 100)
    : null;

  /** YTD earnings */
  const ytdGross = useMemo(() =>
    revenueBookings
      .filter(s => new Date(s.startsAt).getFullYear() === currentYear)
      .reduce((sum, s) => sum + Number(s.amount || 0), 0),
  [revenueBookings, currentYear]);

  const ytdFee = ytdGross * PLATFORM_FEE_RATE;
  const ytdNet = ytdGross - ytdFee;

  /** Estimated next payout — net of upcoming completed sessions not yet "paid" */
  const estimatedPayout = useMemo(() => {
    // Simple model: completed sessions from the current week that haven't been "paid out"
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const gross = revenueBookings
      .filter(s => {
        const d = new Date(s.startsAt);
        return d >= startOfWeek && s.status === 'completed';
      })
      .reduce((sum, s) => sum + Number(s.amount || 0), 0);
    return gross - (gross * PLATFORM_FEE_RATE);
  }, [revenueBookings, now]);

  const nextPayoutDate = getNextFriday();

  /** Transaction history — all bookings sorted newest first */
  const transactions = useMemo(() =>
    [...sessions]
      .filter(s => s.startsAt)
      .sort((a, b) => new Date(b.startsAt) - new Date(a.startsAt)),
  [sessions]);

  /* ─── Stat cards config ─── */

  const stats = [
    {
      label: 'Expected Next Payout',
      value: formatPKR(estimatedPayout),
      subtitle: estimatedPayout > 0
        ? `Est. ${nextPayoutDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}`
        : 'No completed sessions this week',
      icon: Banknote,
      color: 'bg-primary-light',
      iconColor: 'text-primary',
      note: 'Estimated · payouts not yet configured',
    },
    {
      label: 'Earned this Month (Net)',
      value: formatPKR(monthlyNet),
      subtitle: monthOverMonthPct !== null
        ? `${monthOverMonthPct >= 0 ? '+' : ''}${monthOverMonthPct}% vs last month`
        : 'First month of data',
      icon: TrendingUp,
      color: 'bg-[#E6EFEA]',
      iconColor: 'text-[#4A7F75]',
      trendPositive: monthOverMonthPct !== null ? monthOverMonthPct >= 0 : null,
    },
    {
      label: `Total Earned ${currentYear} (Net)`,
      value: formatPKR(ytdNet),
      subtitle: `Gross ${formatPKR(ytdGross)} · Fee ${formatPKR(ytdFee)}`,
      icon: Banknote,
      color: 'bg-accent-light/50',
      iconColor: 'text-accent-hover',
    },
  ];

  /* ─── Status helpers ─── */

  const statusConfig = {
    upcoming: { label: 'Upcoming', cls: 'bg-primary-light/50 text-primary border-primary-light', icon: Clock },
    completed: { label: 'Completed', cls: 'bg-[#E6EFEA] text-[#6DA398] border-[#6DA398]/30', icon: CheckCircle },
    cancelled: { label: 'Cancelled', cls: 'bg-alert-light text-alert border-alert-light', icon: AlertCircle },
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* ─── Page Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-4 px-1"
      >
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Revenue</h1>
          <p className="text-[15px] font-medium text-neutral-500 mt-2">
            Track your earnings from completed sessions.
          </p>
        </div>
        <Badge variant="neutral" icon={<Info size={13} />}>
          {revenueBookings.length} qualifying session{revenueBookings.length !== 1 ? 's' : ''}
        </Badge>
      </motion.div>

      {/* ─── Stat Cards ─── */}
      <div className="grid md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
          >
            <Card hover={true} className="p-8 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 ${stat.color} rounded-2xl shadow-inner-soft`}>
                    <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                  <h3 className="text-[13px] font-bold text-neutral-400 tracking-wide uppercase">{stat.label}</h3>
                </div>
                {isLoading ? (
                  <div className="h-10 w-36 bg-neutral-100 rounded-xl animate-pulse mt-2" />
                ) : (
                  <p className="text-4xl font-bold text-neutral-900 tracking-tight mt-2">{stat.value}</p>
                )}
              </div>
              <div className="mt-4">
                {stat.trendPositive !== undefined && stat.trendPositive !== null && (
                  <span className={`inline-flex items-center gap-1 text-[12px] font-bold mr-2 ${stat.trendPositive ? 'text-[#6DA398]' : 'text-alert'}`}>
                    {stat.trendPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  </span>
                )}
                <span className="text-[13px] font-semibold text-neutral-500">{stat.subtitle}</span>
                {stat.note && (
                  <p className="text-[11px] font-medium text-neutral-400 mt-1 italic">{stat.note}</p>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ─── Fee Breakdown Banner ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.3 }}
      >
        <div className="bg-surface-tinted border border-neutral-200 rounded-2xl px-6 py-4 flex flex-wrap items-center gap-x-8 gap-y-2 text-[13px] font-medium text-neutral-500">
          <span className="font-bold text-neutral-700">Fee Structure</span>
          <span>Gross = session booking amount</span>
          <span>Platform Fee = 15% of gross</span>
          <span className="font-bold text-neutral-700">Net = Gross − 15% fee</span>
        </div>
      </motion.div>

      {/* ─── Tabs & Content ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
      >
        <div className="bg-surface rounded-[32px] border border-neutral-200 shadow-soft overflow-hidden">
          <div className="border-b border-neutral-100 flex overflow-x-auto bg-surface-tinted/30 px-6">
            <button
              className={`px-4 py-5 font-bold text-[14px] border-b-[3px] transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-neutral-500 hover:text-neutral-900'}`}
              onClick={() => setActiveTab('overview')}
            >
              Transaction History
            </button>
            <button
              className={`px-4 py-5 font-bold text-[14px] border-b-[3px] transition-colors whitespace-nowrap ml-4 ${activeTab === 'settings' ? 'border-primary text-primary' : 'border-transparent text-neutral-500 hover:text-neutral-900'}`}
              onClick={() => setActiveTab('settings')}
            >
              Payout Settings
            </button>
          </div>

          <div>
            {/* ─── Transaction History Tab ─── */}
            {activeTab === 'overview' && (
              <div>
                {isLoading ? (
                  <div className="py-16 flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-neutral-400 font-medium text-sm animate-pulse">Loading transactions…</p>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="py-16 text-center">
                    <Calendar size={32} className="text-neutral-300 mx-auto mb-3" />
                    <p className="text-neutral-500 font-medium">No transactions yet</p>
                    <p className="text-neutral-400 text-[13px] mt-1">Revenue will appear here once you have bookings.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-neutral-100 bg-surface-tinted text-neutral-400">
                          <th className="px-8 py-5 text-[12px] font-bold tracking-wider uppercase">Date</th>
                          <th className="px-6 py-5 text-[12px] font-bold tracking-wider uppercase">Client</th>
                          <th className="px-6 py-5 text-[12px] font-bold tracking-wider uppercase">Type</th>
                          <th className="px-6 py-5 text-[12px] font-bold tracking-wider uppercase text-right">Gross</th>
                          <th className="px-6 py-5 text-[12px] font-bold tracking-wider uppercase text-right">Fee (15%)</th>
                          <th className="px-6 py-5 text-[12px] font-bold tracking-wider uppercase text-right">Net</th>
                          <th className="px-8 py-5 text-[12px] font-bold tracking-wider uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {transactions.map((row) => {
                          const gross = Number(row.amount || 0);
                          const fee = row.status !== 'cancelled' ? gross * PLATFORM_FEE_RATE : 0;
                          const net = gross - fee;
                          const cfg = statusConfig[row.status] || statusConfig.upcoming;
                          const StatusIcon = cfg.icon;

                          return (
                            <tr key={row.id} className="text-[15px] hover:bg-neutral-50/60 transition-colors group">
                              <td className="px-8 py-5 font-bold text-neutral-900 whitespace-nowrap">
                                {row.startsAt ? shortDate(row.startsAt) : '—'}
                              </td>
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                  <Avatar name={row.patientAlias || 'Client'} size="xs" />
                                  <span className="font-medium text-neutral-700 truncate max-w-[160px]">
                                    {row.patientAlias || 'Anonymous'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-5 text-neutral-500 font-medium capitalize">
                                {row.type || '—'}
                              </td>
                              <td className={`px-6 py-5 font-medium text-right ${row.status === 'cancelled' ? 'text-neutral-300 line-through' : 'text-neutral-700'}`}>
                                {gross > 0 ? formatPKR(gross) : '—'}
                              </td>
                              <td className={`px-6 py-5 font-medium text-right ${row.status === 'cancelled' ? 'text-neutral-300' : 'text-neutral-400'}`}>
                                {row.status === 'cancelled' ? '—' : (gross > 0 ? formatPKR(fee) : '—')}
                              </td>
                              <td className={`px-6 py-5 font-bold text-right ${row.status === 'cancelled' ? 'text-neutral-300' : 'text-[#6DA398]'}`}>
                                {row.status === 'cancelled' ? '—' : (gross > 0 ? formatPKR(net) : '—')}
                              </td>
                              <td className="px-8 py-5">
                                <div className="flex items-center gap-3">
                                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold tracking-wide uppercase border ${cfg.cls}`}>
                                    <StatusIcon size={14} strokeWidth={2.5} />
                                    {cfg.label}
                                  </span>
                                  {row.paymentProof && (
                                    <button 
                                      onClick={() => {
                                        setSelectedProof(row);
                                        setIsProofModalOpen(true);
                                      }}
                                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-all text-[11px] font-bold border border-neutral-200"
                                    >
                                      <FileText size={13} strokeWidth={2.5} />
                                      <span>Proof</span>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Totals row */}
                    <div className="border-t-2 border-neutral-200 bg-surface-tinted px-8 py-5 flex flex-wrap items-center gap-x-10 gap-y-2">
                      <span className="text-[13px] font-bold text-neutral-400 uppercase tracking-wider">
                        {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
                      </span>
                      <span className="text-[14px] font-medium text-neutral-600">
                        Gross: <span className="font-bold text-neutral-900">{formatPKR(revenueBookings.reduce((s, b) => s + Number(b.amount || 0), 0))}</span>
                      </span>
                      <span className="text-[14px] font-medium text-neutral-600">
                        Fees: <span className="font-bold text-neutral-500">{formatPKR(revenueBookings.reduce((s, b) => s + Number(b.amount || 0), 0) * PLATFORM_FEE_RATE)}</span>
                      </span>
                      <span className="text-[14px] font-medium text-neutral-600">
                        Net: <span className="font-bold text-[#4A7F75]">{formatPKR(revenueBookings.reduce((s, b) => s + Number(b.amount || 0), 0) * (1 - PLATFORM_FEE_RATE))}</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── Payout Settings Tab ─── */}
            {activeTab === 'settings' && (
              <div className="max-w-3xl space-y-8 p-8">
                {/* Bank Account — Truthful Placeholder */}
                <div className="bg-surface-tinted border border-dashed border-neutral-300 rounded-[24px] p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-neutral-100 rounded-2xl">
                      <Settings2 size={20} className="text-neutral-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-[16px] text-neutral-900 mb-1 tracking-tight">Bank Account</h3>
                      <p className="text-[14px] font-medium text-neutral-500 mb-4">
                        No bank account connected yet. Payout configuration will be available in a future update.
                      </p>
                      <Badge variant="neutral" icon={<Clock size={12} />}>Coming Soon</Badge>
                    </div>
                  </div>
                </div>

                {/* Payout Schedule — Truthful Placeholder */}
                <div className="bg-surface-tinted border border-dashed border-neutral-300 rounded-[24px] p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-neutral-100 rounded-2xl">
                      <Calendar size={20} className="text-neutral-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-[16px] text-neutral-900 mb-1 tracking-tight">Payout Schedule</h3>
                      <p className="text-[14px] font-medium text-neutral-500 mb-4">
                        Automatic payouts are not yet configured. Once enabled, you'll be able to choose between weekly and monthly disbursement cycles.
                      </p>
                      <Badge variant="neutral" icon={<Clock size={12} />}>Coming Soon</Badge>
                    </div>
                  </div>
                </div>

                {/* Info Banner */}
                <div className="flex items-start gap-3 bg-primary-light/30 border border-primary-light rounded-2xl p-5">
                  <Info size={18} className="text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[14px] font-bold text-neutral-900 mb-1">How revenue is calculated</p>
                    <p className="text-[13px] font-medium text-neutral-600 leading-relaxed">
                      Your net earnings are calculated as the session booking amount minus a 15% platform fee.
                      Cancelled sessions are excluded from all revenue totals.
                      The "Expected Next Payout" reflects completed sessions from the current week.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
      <ProofModal 
        isOpen={isProofModalOpen} 
        onClose={() => setIsProofModalOpen(false)} 
        proofData={selectedProof?.paymentProof}
        sessionData={selectedProof}
      />
    </div>
  );
};

export default Revenue;
