import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Lock, MoreVertical, Phone, MessageSquare, Sparkles } from 'lucide-react'
import { useChatStore } from '../../stores/chatStore'
import { useAuthStore } from '../../stores/authStore'
import { useNavigate } from 'react-router-dom'
import ChatBubble from '../../components/ChatBubble'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'

export default function Chat() {
  const { user } = useAuthStore()
  const { 
    conversations, 
    activeMessages, 
    activeConvId, 
    setActiveConv, 
    sendMessage, 
    fetchConversations,
    cleanup,
    isTyping, 
    getActiveConv 
  } = useChatStore()
  
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const activeConv = getActiveConv()
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.uid) {
      fetchConversations(user.uid, 'patient')
    }
    return () => cleanup()
  }, [user?.uid, fetchConversations, cleanup])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [activeMessages, isTyping])

  const handleSend = () => {
    if (!input.trim()) return
    sendMessage(input.trim())
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const startSession = (withVideo = false) => {
    if (activeConv) {
      navigate(`/patient/session/${activeConv.proId}?video=${withVideo}`)
    }
  }

  // Handle empty conversation list
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center bg-surface border border-neutral-200 rounded-[40px] p-12 text-center shadow-soft h-full">
        <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mb-6">
          <MessageSquare size={32} className="text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 tracking-tight mb-2">No Conversations Yet</h2>
        <p className="text-[15px] text-neutral-500 mb-8 max-w-sm mx-auto">
          Start your journey by connecting with one of our verified professionals.
        </p>
        <Button variant="primary" onClick={() => navigate('/patient/directory')} className="shadow-float flex items-center gap-2">
          <Sparkles size={18} />
          Find a Specialist
        </Button>
      </div>
    )
  }

  return (
    <div className="flex bg-surface border border-neutral-200 shadow-soft overflow-hidden h-full">
      {/* Conversation list */}
      <div className="w-[320px] border-r border-neutral-200 bg-surface-tinted flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-neutral-200">
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight mb-4">Messages</h2>
          <div className="flex items-center gap-2 bg-accent-light/50 rounded-xl px-4 py-2 border border-accent-light">
            <Lock size={14} className="text-accent-hover" />
            <span className="text-[12px] text-accent-hover font-bold uppercase tracking-wide">End-to-end encrypted</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {conversations.map((conv) => {
            const unreadCount = conv.unreadCount?.[user?.uid] || 0
            return (
              <motion.button
                key={conv.id}
                whileHover={{ scale: 0.99 }}
                onClick={() => setActiveConv(conv.id)}
                className={`w-full px-4 py-4 rounded-2xl flex items-start gap-4 text-left transition-all ${
                  activeConvId === conv.id 
                    ? 'bg-primary-light shadow-inner-soft' 
                    : 'hover:bg-neutral-100'
                }`}
              >
                <Avatar name={conv.proName} size="md" online={true} />
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className={`text-[15px] font-bold truncate ${activeConvId === conv.id ? 'text-primary' : 'text-neutral-900'}`}>
                      {conv.proName}
                    </p>
                    <span className="text-[11px] font-semibold text-neutral-400 flex-shrink-0">{conv.lastTime}</span>
                  </div>
                  <p className="text-[13px] font-medium text-neutral-500 truncate">{conv.lastMessage}</p>
                </div>
                {unreadCount > 0 && (
                  <span className="w-5 h-5 bg-alert rounded-full text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Active chat */}
      {activeConv ? (
        <div className="flex-1 flex flex-col min-w-0 bg-surface">
          {/* Chat header */}
          <div className="px-6 py-4 border-b border-neutral-200 bg-surface flex items-center gap-4 flex-shrink-0 relative">
            <Avatar name={activeConv.proName} size="md" online={true} />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-neutral-900 text-lg tracking-tight truncate">{activeConv.proName}</p>
              <p className="text-[13.5px] font-medium text-neutral-500 truncate">{activeConv.proSpecialty}</p>
            </div>
            
            <div className="flex items-center gap-3 flex-shrink-0">
              <Badge variant="accent" icon={<Lock size={12} />}>Encrypted</Badge>
              
              <div className="flex items-center bg-primary-light/50 p-1 rounded-2xl border border-primary-light">
                <button 
                  onClick={() => startSession(false)}
                  className="px-4 py-2 flex items-center gap-2 rounded-xl text-[14px] font-bold text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                >
                  <Phone size={16} /> 
                  <span className="hidden lg:inline">Voice Call</span>
                </button>
              </div>

              <button className="w-10 h-10 flex items-center justify-center rounded-full text-neutral-400 hover:text-primary hover:bg-primary-light transition-all">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col">
            {activeMessages.map((msg, i) => (
              <ChatBubble key={msg.id} message={msg} index={i} />
            ))}

            {/* Typing indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="flex justify-start mb-4"
                >
                  <div className="bg-surface border border-neutral-200 text-neutral-900 rounded-[24px] rounded-bl-[8px] py-4 px-5 flex items-center gap-1.5 shadow-sm">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2.5 h-2.5 bg-neutral-300 rounded-full"
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-6 py-4 border-t border-neutral-200 bg-surface-tinted flex-shrink-0">
            <div className="flex items-end gap-4">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message... (Enter to send)"
                  rows={1}
                  className="w-full bg-surface border-2 border-neutral-200 rounded-[20px] outline-none transition-all placeholder:text-neutral-400 text-neutral-900 text-[15px] py-4 px-5 pr-14 resize-none max-h-32 focus:border-primary focus:ring-4 focus:ring-primary/10"
                  style={{ overflow: 'hidden', height: 'auto' }}
                  onInput={(e) => {
                    e.target.style.height = 'auto'
                    e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px'
                  }}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={!input.trim()}
                className={`w-[52px] h-[52px] rounded-2xl flex items-center justify-center transition-all flex-shrink-0 ${
                  input.trim() ? 'bg-primary text-white shadow-soft' : 'bg-neutral-200 text-neutral-400'
                }`}
              >
                <Send size={20} className="ml-1" />
              </motion.button>
            </div>
            <p className="text-[12px] font-medium text-neutral-400 mt-3 flex items-center justify-center gap-1.5 text-center">
              <Lock size={10} />
              Messages are encrypted end-to-end. Your specialist cannot share them.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-surface">
          <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mb-6">
            <MessageSquare size={32} className="text-primary" />
          </div>
          <p className="text-2xl font-bold text-neutral-900 tracking-tight">Your Messages</p>
          <p className="text-[15px] text-neutral-500 mt-2">Select a conversation to start chatting privately.</p>
        </div>
      )}
    </div>
  )
}
