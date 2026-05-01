import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, Download, Trash2, Bell, Eye, Lock, 
  ChevronRight, User, Fingerprint, Globe, CheckCircle,
  AlertCircle, Save, Edit3, X
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Avatar from '../../components/ui/Avatar'

export default function Settings() {
  const { user, updateProfile } = useAuthStore()
  const [activeTab, setActiveTab] = useState('privacy')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isEditingAlias, setIsEditingAlias] = useState(false)
  const [newAlias, setNewAlias] = useState(user?.alias || '')
  const [isUpdating, setIsUpdating] = useState(false)
  const [notifications, setNotifications] = useState({ 
    sessions: true, 
    messages: true, 
    moodReminders: true, 
    weeklyReport: false 
  })

  const toggleNotif = (key) => setNotifications((n) => ({ ...n, [key]: !n[key] }))

  const handleUpdateAlias = async () => {
    if (!newAlias.trim() || newAlias === user?.alias) {
      setIsEditingAlias(false)
      return
    }
    
    setIsUpdating(true)
    const success = await updateProfile({ alias: newAlias })
    setIsUpdating(false)
    if (success) {
      setIsEditingAlias(false)
    }
  }

  const handleDownloadData = () => {
    const userData = {
      alias: user?.alias,
      role: user?.role,
      email: user?.email,
      encryptionKey: 'Verified (Local Only)',
      preferences: notifications,
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `share_data_${user?.alias}.json`
    a.click()
  }

  const tabs = [
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Account & Data', icon: Lock },
  ]

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Premium Header */}
      <div className="mb-10 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-neutral-900 tracking-tight mb-3">Workspace Settings</h1>
          <p className="text-[16px] font-medium text-neutral-500">Manage your anonymous identity and secure preferences.</p>
        </motion.div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 px-4">
        {/* Side Navigation */}
        <div className="w-full md:w-64 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold text-[15px] transition-all ${
                activeTab === tab.id 
                  ? 'bg-primary text-white shadow-float' 
                  : 'text-neutral-500 hover:bg-neutral-100'
              }`}
            >
              <tab.icon size={20} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="tabIndicator" className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  {/* Alias Card */}
                  <Card className="p-8">
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex items-center gap-5">
                        <Avatar name={user?.alias} size="xl" />
                        <div>
                          <h3 className="text-xl font-bold text-neutral-900 tracking-tight">Your Anonymous Alias</h3>
                          <p className="text-[14px] text-neutral-500 font-medium mt-1">This is how you appear to professionals.</p>
                        </div>
                      </div>
                      {!isEditingAlias ? (
                        <button 
                          onClick={() => setIsEditingAlias(true)}
                          className="p-2.5 text-primary hover:bg-primary-light rounded-xl transition-colors"
                        >
                          <Edit3 size={20} />
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button 
                            onClick={handleUpdateAlias}
                            disabled={isUpdating}
                            className="p-2.5 text-accent-hover hover:bg-accent-light rounded-xl transition-colors"
                          >
                            <Save size={20} />
                          </button>
                          <button 
                            onClick={() => setIsEditingAlias(false)}
                            className="p-2.5 text-neutral-400 hover:bg-neutral-100 rounded-xl transition-colors"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      {isEditingAlias ? (
                        <input 
                          type="text" 
                          value={newAlias}
                          onChange={(e) => setNewAlias(e.target.value)}
                          className="w-full bg-surface border-2 border-primary-light rounded-2xl py-4 px-6 text-lg font-bold text-neutral-900 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                          autoFocus
                        />
                      ) : (
                        <div className="w-full bg-surface-tinted border border-neutral-100 rounded-2xl py-4 px-6 flex items-center justify-between">
                          <span className="text-lg font-bold text-neutral-900">{user?.alias}</span>
                          <span className="text-[12px] font-bold text-accent-hover uppercase tracking-widest bg-accent-light px-3 py-1 rounded-lg">Verified Alias</span>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Security Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-6 rounded-[28px] bg-accent-light/30 border border-accent-light flex flex-col justify-between h-40">
                      <div className="w-10 h-10 bg-accent-light rounded-xl flex items-center justify-center text-accent-hover">
                        <Fingerprint size={20} />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-accent-hover uppercase tracking-widest mb-1">E2E Encryption</p>
                        <p className="text-[15px] font-bold text-neutral-900">Active & Secured</p>
                      </div>
                    </div>
                    <div className="p-6 rounded-[28px] bg-primary-light/30 border border-primary-light flex flex-col justify-between h-40">
                      <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center text-primary">
                        <Globe size={20} />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-primary uppercase tracking-widest mb-1">Data Sovereignty</p>
                        <p className="text-[15px] font-bold text-neutral-900">Stored in EU (GDPR)</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <Card className="overflow-hidden">
                  <div className="p-8 border-b border-neutral-100">
                    <h3 className="text-xl font-bold text-neutral-900 tracking-tight">Communication Preferences</h3>
                    <p className="text-[14px] text-neutral-500 font-medium mt-1">Control how and when we reach out to you.</p>
                  </div>
                  <div className="divide-y divide-neutral-100">
                    {[
                      { key: 'sessions', label: 'Session Reminders', desc: 'Alerts 24h before your scheduled meetings', icon: Calendar },
                      { key: 'messages', label: 'New Messages', desc: 'When a professional sends you a secure message', icon: MessageSquare },
                      { key: 'moodReminders', label: 'Mood Check-ins', desc: 'Gentle nudges for your daily wellbeing journal', icon: Star },
                      { key: 'weeklyReport', label: 'Weekly Summary', desc: 'A Sunday overview of your progress and trends', icon: Globe },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-8 hover:bg-neutral-50/50 transition-colors">
                        <div className="flex items-center gap-5">
                          <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center text-neutral-500">
                            <item.icon size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-neutral-900 text-[15px]">{item.label}</p>
                            <p className="text-[13px] font-medium text-neutral-500 mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleNotif(item.key)}
                          className={`relative w-12 h-7 rounded-full transition-all duration-300 ${
                            notifications[item.key] ? 'bg-primary' : 'bg-neutral-200'
                          }`}
                        >
                          <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
                            notifications[item.key] ? 'left-6' : 'left-1'
                          }`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {activeTab === 'data' && (
                <div className="space-y-6">
                  {/* Data Export Card */}
                  <Card className="p-8 flex items-center justify-between group hover:border-primary/30 transition-all cursor-pointer" onClick={handleDownloadData}>
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-primary-light rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Download size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-neutral-900 tracking-tight">Download My Data</h3>
                        <p className="text-[14px] text-neutral-500 font-medium">Get a full archive of your activity and notes.</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-neutral-300 group-hover:text-primary transition-colors" />
                  </Card>

                  {/* Danger Zone */}
                  <div className="pt-6">
                    <div className="flex items-center gap-2 mb-4 px-2">
                       <AlertCircle size={16} className="text-alert" />
                       <h4 className="text-[12px] font-bold text-alert uppercase tracking-widest">Danger Zone</h4>
                    </div>
                    <Card className="border-alert/20 overflow-hidden">
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="w-full flex items-center justify-between p-8 hover:bg-alert-light transition-all group"
                      >
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 bg-alert-light rounded-2xl flex items-center justify-center text-alert group-hover:scale-110 transition-transform">
                            <Trash2 size={20} />
                          </div>
                          <div className="text-left">
                            <p className="text-lg font-bold text-alert">Request Account Deletion</p>
                            <p className="text-[14px] font-medium text-neutral-500">Permanently erase your identity and all records.</p>
                          </div>
                        </div>
                        <ChevronRight size={20} className="text-alert/40" />
                      </button>
                    </Card>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Delete account modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Security Protocol">
        <div className="text-center p-2">
          <div className="w-20 h-20 bg-alert-light rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Shield size={32} className="text-alert" />
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 tracking-tight mb-3">Manual Verification Required</h3>
          <p className="text-neutral-500 font-medium leading-relaxed mb-8">
            To ensure your sensitive data is handled securely, account deletion requires a manual verification step. Our trust and safety team will process your request within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              fullWidth
              onClick={() => {
                window.location.href = 'mailto:support@share.platform?subject=Account Deletion Request';
                setShowDeleteModal(false);
              }} 
            >
              Contact Trust & Safety
            </Button>
            <button 
              onClick={() => setShowDeleteModal(false)} 
              className="px-6 py-3 rounded-2xl font-bold text-neutral-500 hover:bg-neutral-100 transition-all flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

