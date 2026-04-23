import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useMoodStore } from '../../stores/moodStore'
import { useAuthStore } from '../../stores/authStore'
import { useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import Button from '../../components/ui/Button'
import { useNavigate } from 'react-router-dom'

const MOOD_EMOJIS = { 1: '😔', 2: '😟', 3: '😐', 4: '🙂', 5: '😊' }
const MOOD_COLORS = { 1: '#D85A30', 2: '#E8904A', 3: '#8FA3A0', 4: '#0F6E56', 5: '#0A5440' }
const MOOD_BG = { 1: 'bg-alert-coral-light', 2: 'bg-orange-50', 3: 'bg-sage-light/50', 4: 'bg-sage-light', 5: 'bg-sage-light' }

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const score = payload[0].value
    return (
      <div className="bg-warm-white-pure border border-border-subtle rounded-xl px-3 py-2 shadow-card">
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-sm font-medium text-text-primary">{MOOD_EMOJIS[score]} {['Very Low','Low','Okay','Good','Great'][score-1]}</p>
      </div>
    )
  }
  return null
}

export default function MoodHistory() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { history, fetchMoods, getChartData, getWeeklyAverage, openModal, checkedToday } = useMoodStore()

  useEffect(() => {
    if (user?.uid) {
      fetchMoods(user.uid)
    }
  }, [user?.uid, fetchMoods])

  const chartData = getChartData()
  const weeklyAvg = parseFloat(getWeeklyAverage())
  const prevWeekData = history.slice(-14, -7)
  const prevAvg = prevWeekData.length ? (prevWeekData.reduce((s, e) => s + e.score, 0) / prevWeekData.length).toFixed(1) : null
  const trend = prevAvg ? weeklyAvg - prevAvg : 0

  const insights = []
  if (weeklyAvg >= 4) insights.push({ text: 'Your mood has been consistently positive this week. 🌟', type: 'positive' })
  if (trend > 0.5) insights.push({ text: `Your mood improved by ${trend.toFixed(1)} points compared to last week.`, type: 'positive' })
  if (trend < -0.5) insights.push({ text: 'Your mood dipped this week. Consider booking a session.', type: 'concern' })
  if (weeklyAvg < 3) insights.push({ text: 'You\'ve been going through a tough time. You\'re not alone.', type: 'concern' })

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display text-3xl text-text-primary mb-1">Mood Journal</h1>
        <p className="text-text-secondary text-sm">Your emotional wellbeing over time</p>
      </motion.div>

      {/* Weekly avg card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-teal-gradient rounded-2xl p-6 mb-6 flex items-center justify-between"
      >
        <div>
          <p className="text-sage-light/70 text-sm mb-1">7-Day Average</p>
          <p className="font-display text-5xl text-sage-light">{weeklyAvg}</p>
          <p className="text-sage-light/60 text-xs mt-1">out of 5.0</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1.5 justify-end mb-2">
            {trend > 0 ? <TrendingUp size={18} className="text-sage-light" /> :
             trend < 0 ? <TrendingDown size={18} className="text-alert-coral-light" /> :
             <Minus size={18} className="text-sage-light/60" />}
            <span className={`text-sm font-medium ${trend > 0 ? 'text-sage-light' : trend < 0 ? 'text-alert-coral-light' : 'text-sage-light/60'}`}>
              {trend > 0 ? '+' : ''}{trend.toFixed(1)} vs last week
            </span>
          </div>
          {!checkedToday && (
            <Button variant="ghost" size="sm" onClick={openModal} className="bg-white/20 text-white hover:bg-white/30">
              Check in today
            </Button>
          )}
        </div>
      </motion.div>

      {/* Insights */}
      {insights.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="space-y-2 mb-6">
          {insights.map((ins, i) => (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${ins.type === 'positive' ? 'bg-sage-light' : 'bg-alert-coral-light'}`}>
              <span className="text-lg">{ins.type === 'positive' ? '💚' : '💛'}</span>
              <p className={`text-sm ${ins.type === 'positive' ? 'text-brand-teal-dark' : 'text-alert-coral'}`}>{ins.text}</p>
            </div>
          ))}
          {weeklyAvg < 3 && (
            <div className="mt-3">
              <Button variant="primary" size="sm" onClick={() => navigate('/patient/directory')}>Book a Session →</Button>
            </div>
          )}
        </motion.div>
      )}

      {/* Area chart */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-5 mb-6">
        <h2 className="font-display text-lg text-text-primary mb-4">14-Day Trend</h2>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <defs>
              <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0F6E56" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0F6E56" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5EBE9" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8FA3A0' }} />
            <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: '#8FA3A0' }} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="score" stroke="#0F6E56" strokeWidth={2.5} fill="url(#moodGradient)" dot={{ fill: '#0F6E56', r: 4 }} activeDot={{ r: 6 }} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Recent log */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="card p-5">
        <h2 className="font-display text-lg text-text-primary mb-4">Recent Check-ins</h2>
        <div className="space-y-2">
          {history.slice(-10).reverse().map((entry) => (
            <div key={entry.id} className="flex items-center gap-3 py-2 border-b border-border-subtle last:border-0">
              <span className="text-2xl">{entry.emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">{entry.label}</p>
                {entry.note && <p className="text-xs text-text-muted">{entry.note}</p>}
              </div>
              <span className="text-xs text-text-muted">{entry.date}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
