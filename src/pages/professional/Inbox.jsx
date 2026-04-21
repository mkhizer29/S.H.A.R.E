import React, { useState } from 'react';
import ChatBubble from '../../components/ChatBubble';
import { Send, Search, Lock, MoreVertical, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';

const Inbox = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState('');

  const contacts = [
    { id: 1, alias: 'BlueJay', lastMessage: 'See you tomorrow!', time: '10:45 AM', unread: 0, active: true },
    { id: 2, alias: 'RiverStone', lastMessage: 'Can we reschedule?', time: 'Yesterday', unread: 2 },
    { id: 3, alias: 'MountainPine', lastMessage: 'Thank you for the resources.', time: 'Monday', unread: 0 },
  ];

  const messages = [
    { id: 1, text: "I've been feeling really overwhelmed with work lately.", time: "10:30 AM", from: "them", read: true },
    { id: 2, text: "I hear you. The transition back to the office can be a lot. How are you managing your evenings?", time: "10:32 AM", from: "me", read: true },
    { id: 3, text: "Mostly just doomscrolling. I can't seem to disconnect.", time: "10:40 AM", from: "them", read: true },
    { id: 4, text: "I understand completely. We can work on strategies for that tomorrow.", time: "10:43 AM", from: "me", read: true },
    { id: 5, text: "See you tomorrow!", time: "10:45 AM", from: "them", read: true },
  ];

  const startSession = () => {
    navigate(`/pro/session/BlueJay`);
  };

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
              placeholder="Search conversations..." 
              className="w-full bg-surface border border-neutral-200 rounded-2xl py-2.5 pl-10 pr-4 text-[14px] font-medium text-neutral-900 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-neutral-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {contacts.map((contact, idx) => (
            <div 
              key={idx} 
              className={`p-4 rounded-2xl cursor-pointer flex gap-4 transition-all ${
                contact.active 
                  ? 'bg-primary-light shadow-inner-soft' 
                  : 'hover:bg-neutral-100'
              }`}
            >
              <Avatar name={contact.alias} size="md" online={contact.active} />
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex justify-between items-center mb-1">
                  <h4 className={`text-[15px] font-bold truncate ${contact.active ? 'text-primary' : 'text-neutral-900'}`}>
                    {contact.alias}
                  </h4>
                  <span className={`text-[11px] font-semibold ${contact.unread ? 'text-alert' : 'text-neutral-400'}`}>
                    {contact.time}
                  </span>
                </div>
                <p className={`text-[13px] truncate ${contact.unread ? 'text-neutral-900 font-bold' : 'text-neutral-500 font-medium'}`}>
                  {contact.lastMessage}
                </p>
              </div>
              {contact.unread > 0 && (
                <div className="w-5 h-5 rounded-full bg-alert text-white flex items-center justify-center text-[11px] font-bold self-center shadow-sm -ml-2">
                  {contact.unread}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-surface">
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-200/80 bg-surface flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Avatar name="BlueJay" size="md" online={true} />
            <div>
              <h3 className="font-bold text-lg text-neutral-900 tracking-tight">BlueJay</h3>
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
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col space-y-2">
           <div className="text-center my-4">
             <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 bg-surface-tinted px-4 py-1.5 rounded-full border border-neutral-200">Today</span>
           </div>
           
           {messages.map((msg, i) => (
             <ChatBubble key={msg.id} message={msg} index={i} />
           ))}
        </div>

        {/* Templates Panel (Professional specific feature) */}
        <div className="px-6 py-3 border-t border-neutral-100 flex gap-2 overflow-x-auto">
           <button className="text-[13px] font-bold tracking-wide text-primary bg-primary-light/50 px-4 py-2 rounded-full flex-shrink-0 border border-primary-light/50 hover:bg-primary hover:text-white transition-all">
              Intake form reminder
           </button>
           <button className="text-[13px] font-bold tracking-wide text-primary bg-primary-light/50 px-4 py-2 rounded-full flex-shrink-0 border border-primary-light/50 hover:bg-primary hover:text-white transition-all">
              Scheduling link
           </button>
           <button className="text-[13px] font-bold tracking-wide text-primary bg-primary-light/50 px-4 py-2 rounded-full flex-shrink-0 border border-primary-light/50 hover:bg-primary hover:text-white transition-all">
              Crisis resources
           </button>
        </div>

        {/* Input */}
        <div className="px-6 py-5 border-t border-neutral-200 bg-surface-tinted">
          <div className="flex items-center gap-4">
             <input 
               type="text" 
               value={input}
               onChange={(e) => setInput(e.target.value)}
               placeholder="Write your securely encrypted message..." 
               className="flex-1 bg-surface border-2 border-neutral-200 rounded-[20px] py-4 px-5 text-[15px] font-medium text-neutral-900 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-neutral-400"
             />
             <button className="w-[52px] h-[52px] rounded-2xl bg-primary text-white flex justify-center items-center hover:bg-primary-hover shadow-soft transition-all flex-shrink-0">
               <Send className="w-5 h-5 ml-1" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inbox;
