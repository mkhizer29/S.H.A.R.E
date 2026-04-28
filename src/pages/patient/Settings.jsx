import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Download, Trash2, Bell, Eye, Lock, ChevronRight } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

export default function Settings() {
  const { user } = useAuthStore()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [notifications, setNotifications] = useState({ sessions: true, messages: true, moodReminders: true, weeklyReport: false })

  const toggleNotif = (key) => setNotifications((n) => ({ ...n, [key]: !n[key] }))

  const sections = [
    {
      title: 'Privacy & Security',
      icon: Shield,
      items: [
        { label: 'Your Alias', value: user?.alias || 'WillowDream', desc: 'Your anonymous identifier on the platform' },
        { label: 'Encryption Status', value: 'Active', desc: 'All messages encrypted with 256-bit E2E encryption', positive: true },
        { label: 'Last Login', value: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), desc: 'New device? Contact support immediately' },
      ]
    }
  ]

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl text-text-primary mb-1">Settings</h1>
        <p className="text-text-secondary text-sm">Manage your account, privacy, and preferences</p>
      </motion.div>

      {/* Privacy section */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={16} className="text-brand-teal" />
          <h2 className="font-display text-lg text-text-primary">Privacy & Security</h2>
        </div>
        <Card hover={false} className="divide-y divide-border-subtle">
          {sections[0].items.map((item) => (
            <div key={item.label} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-text-primary">{item.label}</p>
                <p className="text-xs text-text-muted">{item.desc}</p>
              </div>
              <span className={`text-sm font-medium ${item.positive ? 'text-brand-teal' : 'text-text-secondary'}`}>{item.value}</span>
            </div>
          ))}
        </Card>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Bell size={16} className="text-brand-teal" />
          <h2 className="font-display text-lg text-text-primary">Notifications</h2>
        </div>
        <Card hover={false} className="divide-y divide-border-subtle">
          {[
            { key: 'sessions', label: 'Session reminders', desc: '24hr before your next booking' },
            { key: 'messages', label: 'New messages', desc: 'When your specialist replies' },
            { key: 'moodReminders', label: 'Mood check-in reminders', desc: 'Daily at 9:00 AM' },
            { key: 'weeklyReport', label: 'Weekly wellbeing report', desc: 'Summary of your progress each Sunday' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-text-primary">{item.label}</p>
                <p className="text-xs text-text-muted">{item.desc}</p>
              </div>
              <button
                onClick={() => toggleNotif(item.key)}
                className={`relative w-11 h-6 rounded-full transition-all ${notifications[item.key] ? 'bg-brand-teal' : 'bg-border-subtle'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${notifications[item.key] ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </Card>
      </motion.div>

      {/* Data controls */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Lock size={16} className="text-brand-teal" />
          <h2 className="font-display text-lg text-text-primary">Your Data</h2>
        </div>
        <Card hover={false} className="divide-y divide-border-subtle">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-alert-coral-light transition-all"
          >
            <div className="flex items-center gap-3">
              <Trash2 size={15} className="text-alert-coral" />
              <div className="text-left">
                <p className="text-sm font-medium text-alert-coral">Delete Account</p>
                <p className="text-xs text-text-muted">Permanently delete your account and all associated data</p>
              </div>
            </div>
            <ChevronRight size={15} className="text-alert-coral" />
          </button>
        </Card>
      </motion.div>

      {/* Delete account modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Account Request">
        <div className="text-center">
          <div className="w-14 h-14 bg-alert-coral-light rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trash2 size={22} className="text-alert-coral" />
          </div>
          <p className="text-text-secondary text-sm mb-4">
            Automated account deletion is currently disabled for security. To permanently delete your account and all associated data, please contact our support team.
          </p>
          <div className="flex gap-3 mt-6">
            <Button 
              variant="secondary" 
              onClick={() => {
                window.location.href = 'mailto:support@share.platform?subject=Account Deletion Request';
                setShowDeleteModal(false);
              }} 
              className="flex-1"
            >
              Contact Support
            </Button>
            <Button variant="primary" onClick={() => setShowDeleteModal(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
