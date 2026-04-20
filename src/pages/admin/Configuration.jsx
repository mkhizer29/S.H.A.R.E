import React, { useState } from 'react';
import { ToggleLeft, ToggleRight, Save, ShieldAlert, Key } from 'lucide-react';

const Configuration = () => {
  const [flags, setFlags] = useState({
    asyncMode: true,
    moodTracker: true,
    voiceNotes: false,
    aiSentiment: true,
    newRegistration: true
  });

  const toggleFlag = (key) => setFlags(prev => ({ ...prev, [key]: !prev[key] }));

  const Toggle = ({ active, onClick }) => (
    <button 
      onClick={onClick}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-offset-2 ${
        active ? 'bg-brand-teal' : 'bg-sage-medium'
      }`}
    >
      <span 
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          active ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-serif text-text-primary">System Config</h1>
          <p className="text-text-secondary mt-1">Manage global platform rules, feature flags, and API keys.</p>
        </div>
        <button className="flex items-center gap-2 bg-brand-teal text-warm-white-pure hover:bg-brand-teal-dark px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Save className="w-4 h-4" /> Save All Changes
        </button>
      </div>

      <div className="grid gap-6">
         {/* Feature Flags */}
         <div className="bg-warm-white-pure rounded-2xl border border-sage-light shadow-sm overflow-hidden">
            <div className="p-5 border-b border-sage-light bg-warm-white/50">
               <h2 className="font-medium text-text-primary">Feature Flags</h2>
            </div>
            <div className="p-0">
               <div className="flex items-center justify-between p-5 border-b border-sage-light last:border-0 hover:bg-sage-light/20 transition-colors">
                  <div>
                    <p className="font-medium text-text-primary text-sm flex items-center gap-2">
                       Asynchronous Messaging
                    </p>
                    <p className="text-xs text-text-secondary mt-1">Allow users to send messages when professional is offline.</p>
                  </div>
                  <Toggle active={flags.asyncMode} onClick={() => toggleFlag('asyncMode')} />
               </div>

               <div className="flex items-center justify-between p-5 border-b border-sage-light last:border-0 hover:bg-sage-light/20 transition-colors">
                  <div>
                    <p className="font-medium text-text-primary text-sm">Patient Mood Tracker Widget</p>
                    <p className="text-xs text-text-secondary mt-1">Enable the daily emoji check-in on patient dashboard.</p>
                  </div>
                  <Toggle active={flags.moodTracker} onClick={() => toggleFlag('moodTracker')} />
               </div>

               <div className="flex items-center justify-between p-5 border-b border-sage-light last:border-0 hover:bg-sage-light/20 transition-colors">
                  <div>
                    <p className="font-medium text-text-primary text-sm flex items-center gap-2">
                       E2E Voice Notes <span className="bg-trust-purple-light text-trust-purple text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">Beta</span>
                    </p>
                    <p className="text-xs text-text-secondary mt-1">Allow encrypted audio attachments in chat.</p>
                  </div>
                  <Toggle active={flags.voiceNotes} onClick={() => toggleFlag('voiceNotes')} />
               </div>

               <div className="flex items-center justify-between p-5 border-b border-sage-light last:border-0 hover:bg-sage-light/20 transition-colors">
                  <div>
                    <p className="font-medium text-text-primary text-sm flex items-center gap-2">
                       AI Sentiment Analysis
                       <ShieldAlert className="w-4 h-4 text-alert-coral" title="Required for Crisis Monitor" />
                    </p>
                    <p className="text-xs text-text-secondary mt-1">Client-side keyword scanning for extreme crisis detection.</p>
                  </div>
                  <Toggle active={flags.aiSentiment} onClick={() => toggleFlag('aiSentiment')} />
               </div>

               <div className="flex items-center justify-between p-5 border-b border-sage-light last:border-0 hover:bg-sage-light/20 transition-colors">
                  <div>
                    <p className="font-medium text-text-primary text-sm">New Professional Registrations</p>
                    <p className="text-xs text-text-secondary mt-1">Allow new professionals to apply via public portal.</p>
                  </div>
                  <Toggle active={flags.newRegistration} onClick={() => toggleFlag('newRegistration')} />
               </div>
            </div>
         </div>

         {/* Variables */}
         <div className="bg-warm-white-pure rounded-2xl border border-sage-light shadow-sm overflow-hidden">
            <div className="p-5 border-b border-sage-light bg-warm-white/50">
               <h2 className="font-medium text-text-primary">Global Parameters</h2>
            </div>
            <div className="p-6 grid sm:grid-cols-2 gap-6">
               <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Standard Commission Rate (%)</label>
                  <input type="number" defaultValue={15.0} className="w-full bg-white border border-sage-medium rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal" />
                  <p className="text-xs text-text-muted mt-1">Effective for all new payouts unless overridden.</p>
               </div>
               <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Crisis Response SLA Time (Mins)</label>
                  <input type="number" defaultValue={15} className="w-full bg-white border border-sage-medium rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal" />
                  <p className="text-xs text-text-muted mt-1">Target response time for High/Critical flags.</p>
               </div>
            </div>
         </div>

         {/* Third-Party Integrations */}
         <div className="bg-warm-white-pure rounded-2xl border border-sage-light shadow-sm overflow-hidden">
            <div className="p-5 border-b border-sage-light bg-warm-white/50 flex items-center gap-2">
               <Key className="w-4 h-4 text-text-secondary" />
               <h2 className="font-medium text-text-primary">Service Keys (Mock View)</h2>
            </div>
            <div className="p-6 space-y-4">
               <div>
                 <div className="flex justify-between items-end mb-1">
                    <label className="block text-sm font-medium text-text-primary">Stripe Connect API Key</label>
                    <span className="text-[10px] text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded">Connected</span>
                 </div>
                 <input type="password" value="sk_test_1234567890abcdef" readOnly className="w-full bg-sage-light/30 border border-sage-medium rounded-lg py-2 px-3 text-sm font-mono text-text-muted focus:outline-none" />
               </div>
               <div>
                 <div className="flex justify-between items-end mb-1">
                    <label className="block text-sm font-medium text-text-primary">Jitsi Video Domain</label>
                    <span className="text-[10px] text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded">Active</span>
                 </div>
                 <input type="text" value="meet.share-platform.secure" readOnly className="w-full bg-sage-light/30 border border-sage-medium rounded-lg py-2 px-3 text-sm font-mono text-text-muted focus:outline-none" />
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Configuration;
