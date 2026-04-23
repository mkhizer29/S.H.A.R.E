import React, { useState, useEffect, useRef } from 'react';
import ChatBubble from '../../components/ChatBubble';
import { Send, Search, Lock, MoreVertical, Phone, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';

const Inbox = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    conversations, 
    activeMessages, 
    activeConvId, 
    setActiveConv, 
    sendMessage, 
    fetchConversations,
    cleanup,
    getActiveConv 
  } = useChatStore();
  
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const activeConv = getActiveConv();

  useEffect(() => {
    if (user?.uid) {
      fetchConversations(user.uid, 'pro');
    }
    return () => cleanup();
  }, [user?.uid, fetchConversations, cleanup]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startSession = () => {
    if (activeConv) {
      navigate(`/pro/session/${activeConv.patientName}`);
    }
  };

  if (conversations.length === 0) {
    return (
      <div className="h-[calc(100vh-120px)] bg-surface rounded-[32px] border border-neutral-200 shadow-soft flex flex-col items-center justify-center p-12 text-center">
        <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mb-6">
          <MessageSquare size={32} className="text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 tracking-tight mb-2">No Active Clients</h2>
        <p className="text-[15px] text-neutral-500 max-w-sm mx-auto">
          When a patient connects with you, their conversation will appear here securely.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] bg-surface rounded-[32px] border border-neutral-200 shadow-soft flex overflow-hidden">
      
      {/* Sidebar */}
      <div className="w-[320px] border-r border-neutral-200 flex flex-col bg-surface-tinted">
        <div className="p-6 border-b border-neutral-200">
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight mb-4">Inbox</h2>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search clients..." 
              className="w-full bg-surface border border-neutral-200 rounded-2xl py-2.5 pl-10 pr-4 text-[14px] font-medium text-neutral-900 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-neutral-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {conversations.map((conv) => {
            const unreadCount = conv.unreadCount?.[user?.uid] || 0;
            return (
              <div 
                key={conv.id} 
                onClick={() => setActiveConv(conv.id)}
                className={`p-4 rounded-2xl cursor-pointer flex gap-4 transition-all ${
                  activeConvId === conv.id 
                    ? 'bg-primary-light shadow-inner-soft' 
                    : 'hover:bg-neutral-100'
                }`}
              >
                <Avatar name={conv.patientName || 'Patient'} size="md" online={activeConvId === conv.id} />
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className={`text-[15px] font-bold truncate ${activeConvId === conv.id ? 'text-primary' : 'text-neutral-900'}`}>
                      {conv.patientName || 'Anonymous'}
                    </h4>
                    <span className={`text-[11px] font-semibold ${unreadCount > 0 ? 'text-alert' : 'text-neutral-400'}`}>
                      {conv.lastTime}
                    </span>
                  </div>
                  <p className={`text-[13px] truncate ${unreadCount > 0 ? 'text-neutral-900 font-bold' : 'text-neutral-500 font-medium'}`}>
                    {conv.lastMessage}
                  </p>
                </div>
                {unreadCount > 0 && (
                  <div className="w-5 h-5 rounded-full bg-alert text-white flex items-center justify-center text-[11px] font-bold self-center shadow-sm -ml-2">
                    {unreadCount}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      {activeConv ? (
        <div className="flex-1 flex flex-col bg-surface">
          {/* Header */}
          <div className="px-6 py-5 border-b border-neutral-200/80 bg-surface flex justify-between items-center">
            <div className="items-center gap-4 flex">
              <Avatar name={activeConv.patientName || 'Patient'} size="md" online={true} />
              <div>
                <h3 className="font-bold text-lg text-neutral-900 tracking-tight">{activeConv.patientName || 'Patient'}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge variant="accent" icon={<Lock size={10} />}>Encrypted</Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-primary-light/50 p-1 rounded-2xl border border-primary-light">
                <button 
                  onClick={startSession}
                  className="px-4 py-2 flex items-center gap-2 rounded-xl text-[14px] font-bold text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                >
                  <Phone size={16} /> 
                  <span>Start Voice Session</span>
                </button>
              </div>
              <button className="w-10 h-10 flex items-center justify-center rounded-full text-neutral-400 hover:text-primary hover:bg-primary-light transition-all">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col">
            {activeMessages.map((msg, i) => (
              <ChatBubble key={msg.id} message={msg} index={i} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-6 py-5 border-t border-neutral-200 bg-surface-tinted">
            <div className="flex items-center gap-4">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Write your securely encrypted message..." 
                className="flex-1 bg-surface border-2 border-neutral-200 rounded-[20px] py-4 px-5 text-[15px] font-medium text-neutral-900 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-neutral-400"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim()}
                className={`w-[52px] h-[52px] rounded-2xl flex justify-center items-center shadow-soft transition-all flex-shrink-0 ${
                  input.trim() ? 'bg-primary text-white hover:bg-primary-hover' : 'bg-neutral-200 text-neutral-400'
                }`}
              >
                <Send className="w-5 h-5 ml-1" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-surface">
          <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mb-6">
            <MessageSquare size={32} className="text-primary" />
          </div>
          <p className="text-2xl font-bold text-neutral-900 tracking-tight">Your Client Messages</p>
          <p className="text-[15px] text-neutral-500 mt-2">Select a client to start a secure clinical conversation.</p>
        </div>
      )}
    </div>
  );
};

export default Inbox;
