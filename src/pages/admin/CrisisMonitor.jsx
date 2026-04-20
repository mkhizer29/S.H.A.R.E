import React from 'react';
import { AlertOctagon, Clock, User, ShieldAlert, ArrowRight, MessageSquare } from 'lucide-react';

const CrisisMonitor = () => {
  const flags = [
    { id: 'CR-1042', user: 'LostWanderer', trigger: 'Keyword Match', severity: 'High', time: '4 mins ago', status: 'Unassigned' },
    { id: 'CR-1041', user: 'SilentStorm', trigger: 'Pattern Alt', severity: 'Medium', time: '18 mins ago', status: 'Reviewing', assignedTo: 'Admin-Sarah' },
    { id: 'CR-1040', user: 'NightSky', trigger: 'Panic Button', severity: 'Critical', time: '1 hr ago', status: 'Resolved', assignedTo: 'Admin-Mike', resolution: 'Connected to 988' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-serif text-text-primary">Crisis Monitor</h1>
          <p className="text-alert-coral mt-1 font-medium">Real-time triage queue for potential high-risk events.</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
           <span className="text-sm font-medium text-text-secondary">Monitoring Live</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
         {/* Live Feed List */}
         <div className="lg:col-span-1 border border-alert-coral/30 rounded-2xl bg-warm-white overflow-hidden shadow-sm flex flex-col h-[calc(100vh-14rem)]">
            <div className="bg-alert-coral-light p-4 border-b border-alert-coral/20 font-medium text-alert-coral flex justify-between items-center">
              Active Flags
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
               {flags.map((flag, idx) => (
                 <div key={idx} className={`p-4 rounded-xl border cursor-pointer ${idx === 0 ? 'bg-white border-alert-coral shadow-md' : 'bg-white/50 border-sage-light hover:bg-white'}`}>
                   <div className="flex justify-between items-start mb-2">
                     <span className="text-xs font-mono font-bold text-text-primary">{flag.id}</span>
                     <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        flag.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                        flag.severity === 'High' ? 'bg-orange-100 text-orange-700' :
                        'bg-yellow-100 text-yellow-700'
                     }`}>{flag.severity}</span>
                   </div>
                   <h4 className="font-medium text-text-primary text-sm flex items-center gap-1.5 mb-1">
                      <User className="w-3.5 h-3.5 text-text-muted" /> {flag.user}
                   </h4>
                   <p className="text-xs text-text-secondary mt-2 flex items-center justify-between">
                     <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {flag.time}</span>
                     <span className="font-medium">{flag.status}</span>
                   </p>
                 </div>
               ))}
            </div>
         </div>

         {/* Detail & Action View */}
         <div className="lg:col-span-2 bg-warm-white-pure rounded-2xl border border-sage-light shadow-sm flex flex-col h-[calc(100vh-14rem)]">
            <div className="p-6 border-b border-sage-light flex justify-between items-start">
               <div>
                 <div className="flex items-center gap-3 mb-2">
                   <AlertOctagon className="w-6 h-6 text-alert-coral" />
                   <h2 className="text-2xl font-serif text-text-primary">CR-1042</h2>
                   <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded font-bold uppercase tracking-wide">High Risk</span>
                 </div>
                 <p className="text-text-secondary text-sm">Alias: <strong className="text-text-primary">LostWanderer</strong> • Trigger: Algorithm detected high-risk keywords in latest mood journal entry.</p>
               </div>
               <button className="px-4 py-2 bg-brand-teal text-warm-white-pure rounded-lg text-sm font-medium hover:bg-brand-teal-dark transition-colors shadow-sm">
                 Assign to Me
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                   <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">Escalation Protocol</h3>
                   <div className="flex flex-col sm:flex-row gap-3">
                      <button className="flex-1 flex flex-col items-center justify-center gap-2 p-4 border border-sage-medium rounded-xl hover:bg-sage-light/50 transition-colors">
                         <MessageSquare className="w-5 h-5 text-trust-purple" />
                         <span className="text-sm font-medium">Send Check-in Prompt</span>
                      </button>
                      <button className="flex-1 flex flex-col items-center justify-center gap-2 p-4 border border-sage-medium rounded-xl hover:bg-sage-light/50 transition-colors">
                         <ShieldAlert className="w-5 h-5 text-orange-500" />
                         <span className="text-sm font-medium">Alert Pro (if assigned)</span>
                      </button>
                      <button className="flex-1 flex flex-col items-center justify-center gap-2 p-4 border border-alert-coral rounded-xl hover:bg-alert-coral/5 transition-colors text-alert-coral">
                         <ArrowRight className="w-5 h-5" />
                         <span className="text-sm font-medium">Display Resources Override</span>
                      </button>
                   </div>
                </div>

                <div className="pt-4 border-t border-sage-light">
                   <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">Context Snapshot</h3>
                   <div className="bg-warm-white p-4 rounded-xl border border-sage-light text-sm text-text-primary italic">
                     "...I just don't see the point anymore. Everything is falling apart and I want it to stop."
                   </div>
                   <p className="text-xs text-text-muted mt-2 text-right">Note: Context is provided via automated sentiment flag. Full history requires decryption by user.</p>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default CrisisMonitor;
