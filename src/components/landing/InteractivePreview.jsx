import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MessageCircle, Leaf, User, Shield, Check, X } from 'lucide-react';

const tabs = [
  { id: 'voice', label: 'Voice Sessions', icon: Mic },
  { id: 'chat', label: 'Secure Chat', icon: MessageCircle },
  { id: 'mood', label: 'Check-ins', icon: Leaf }
];

export default function InteractivePreview() {
  const [activeTab, setActiveTab] = useState('voice');

  return (
    <section className="px-6 max-w-6xl mx-auto py-24">
      <div className="text-center mb-20">
        <h2 className="text-4xl md:text-[40px] font-semibold mb-4 tracking-tight">Experience the platform</h2>
        <p className="text-xl text-text-muted font-medium">Designed for comfort. Built for security.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center lg:items-start">

        {/* Navigation Tabs */}
        <div className="flex flex-row lg:flex-col gap-3 w-full lg:w-80 overflow-x-auto pb-4 lg:pb-0 hide-scrollbar scroll-smooth">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-5 px-6 py-5 rounded-[24px] transition-all text-left whitespace-nowrap border ${isActive
                  ? 'bg-white shadow-float text-violet-700 border-white font-bold'
                  : 'text-text-muted hover:bg-white/40 border-transparent font-medium'
                  }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-lilac-100/50' : 'bg-transparent'}`}>
                  <Icon size={22} className={isActive ? 'text-violet-600' : 'text-text-muted'} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[18px]">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Dynamic Visual Area */}
        <div className="flex-1 w-full bg-white/60 backdrop-blur-md rounded-[3rem] p-3 shadow-float border border-white">
          <div className="bg-lilac-50 rounded-[2.5rem] w-full h-[500px] lg:h-[550px] relative overflow-hidden flex items-stretch justify-center border border-lilac-100/50">
            <AnimatePresence mode="wait">

              {activeTab === 'voice' && (
                <motion.div
                  key="voice"
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full bg-violet-600 p-8 lg:p-12 flex flex-col justify-between text-white"
                >
                  <div className="flex justify-between items-center mb-10">
                    <span className="bg-white/20 font-semibold tracking-wider px-5 py-2 rounded-full text-[11px] uppercase border border-white/10 flex items-center gap-2">
                      <Shield size={14} /> End-to-End Encrypted
                    </span>
                    <span className="w-25 h-6 bg-sage-400 rounded-full animate-pulse-soft shadow-[0_0_12px_rgba(169,203,184,0.8)]"></span>
                  </div>
                  <div className="text-center flex-1 flex flex-col justify-center">
                    <div className="w-32 h-32 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-8 relative">
                      <div className="absolute inset-0 border-2 border-white/20 rounded-full animate-ping opacity-20"></div>
                      <User size={48} className="text-white/60" />
                    </div>
                    <h3 className="text-3xl font-semibold mb-2 tracking-tight">Dr. Sarah Jenkins</h3>
                    <p className="text-violet-200 font-medium text-lg">Voice connection active...</p>
                  </div>
                  <div className="mt-12 flex justify-center gap-6">
                    <button className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                      <Mic size={24} />
                    </button>
                    <button className="w-16 h-16 rounded-full bg-alert flex items-center justify-center hover:bg-red-500 transition-colors text-white">
                      <X size={24} strokeWidth={3} />
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'chat' && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full bg-white p-8 lg:p-12 flex flex-col"
                >
                  <div className="flex items-center gap-4 border-b border-lilac-50 pb-5 mb-6">
                    <div className="w-100 h-14 bg-lilac-100 rounded-full flex items-center justify-center">
                      <User size={24} className="text-violet-600" />
                    </div>
                    <div>
                      <p className="font-bold text-text-main text-lg tracking-tight">Dr. Sarah Jenkins</p>
                      <p className="text-[13px] text-sage-500 font-bold uppercase tracking-wider flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-sage-500"></span> Online
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-6 pb-4">
                    <div className="w-full flex">
                      <div className="bg-surface-warm border border-lilac-100 text-text-main font-medium px-5 py-4 rounded-3xl rounded-tl-sm max-w-[90%] shadow-sm leading-relaxed text-[16px]">
                        Hi there. Welcome strictly to your private space. Ready to unpack?
                      </div>
                    </div>
                    <div className="w-full flex justify-end">
                      <div className="bg-violet-600 text-white font-medium px-5 py-4 rounded-3xl rounded-tr-sm max-w-[85%] shadow-sm leading-relaxed text-[16px]">
                        I've been feeling incredibly overwhelmed lately.
                      </div>
                    </div>
                    <div className="w-full flex">
                      <div className="bg-surface-warm border border-lilac-100 text-text-main font-medium px-5 py-4 rounded-3xl rounded-tl-sm max-w-[90%] shadow-sm leading-relaxed text-[16px]">
                        I hear you. Let's break it down together. When did you first notice this feeling?
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-lilac-50 mt-auto flex items-center gap-3">
                    <div className="flex-1 bg-surface-warm rounded-full px-5 py-3 border border-lilac-100 text-text-muted font-medium text-[15px]">
                      Message securely...
                    </div>
                    <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center text-white cursor-pointer hover:scale-105 transition-transform shadow-soft">
                      <MessageCircle size={20} className="fill-white" />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'mood' && (
                <motion.div
                  key="mood"
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full bg-white p-8 lg:p-12 flex flex-col justify-between"
                >
                  <div className="text-center flex-1 flex flex-col justify-center">
                    <div className="w-16 h-16 mx-auto bg-lilac-100 rounded-full flex items-center justify-center mb-6">
                      <Leaf size={32} className="text-violet-600" />
                    </div>
                    <h3 className="text-3xl font-bold tracking-tight mb-8">How are you feeling?</h3>
                    <div className="flex flex-wrap justify-center gap-3 mb-10">
                      {['Anxious', 'Calm', 'Overwhelmed', 'Hopeful'].map(m => (
                        <div key={m} className={`px-6 py-4 rounded-[20px] font-semibold text-[16px] cursor-pointer transition-colors border ${m === 'Calm' ? 'bg-violet-600 text-white border-violet-600 shadow-soft' : 'bg-surface-warm text-text-muted hover:bg-lilac-50 border-lilac-100'}`}>
                          {m}
                        </div>
                      ))}
                    </div>
                    <div className="w-full bg-surface-warm rounded-3xl p-5 text-left border border-lilac-100">
                      <p className="text-[13px] uppercase tracking-widest font-bold text-text-muted mb-2">Daily Note</p>
                      <p className="text-[16px] font-medium text-text-main/50">Add a few thoughts...</p>
                    </div>
                  </div>
                  <button className="mt-8 w-full py-5 bg-text-main text-white rounded-2xl font-bold hover:bg-black transition-colors text-[16px] flex items-center justify-center gap-2">
                    <Check size={20} /> Save Check-in
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

      </div>
    </section>
  );
}
