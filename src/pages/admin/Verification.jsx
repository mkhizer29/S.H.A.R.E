import React from 'react';
import { Search, Filter, Shield, AlertCircle, CheckCircle, XCircle, FileText } from 'lucide-react';

const Verification = () => {
  const queue = [
    { id: 'APP-8832', name: 'Dr. Michael Chen', type: 'Psychiatrist', date: 'Oct 15, 2023', status: 'Pending Review', risk: 'Low' },
    { id: 'APP-8831', name: 'Elena Rodriguez', type: 'Clinical Social Worker', date: 'Oct 14, 2023', status: 'Documents Required', risk: 'Low' },
    { id: 'APP-8829', name: 'James Wilson', type: 'Counselor', date: 'Oct 12, 2023', status: 'Flagged', risk: 'High' },
  ];

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-serif text-text-primary">Verification Queue</h1>
          <p className="text-text-secondary mt-1">Review and approve professional applications.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by ID or name..." 
              className="w-full bg-warm-white-pure border border-sage-medium rounded-full py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
            />
          </div>
          <button className="p-2 border border-sage-medium rounded-full bg-warm-white-pure text-text-secondary hover:bg-sage-light transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
         {/* Queue List */}
         <div className="lg:col-span-1 bg-warm-white-pure rounded-2xl border border-sage-light shadow-sm overflow-hidden flex flex-col h-[calc(100vh-16rem)]">
            <div className="p-4 border-b border-sage-light bg-sage-light/30 font-medium text-sm text-text-primary flex justify-between items-center">
              Pending Applications <span className="bg-trust-purple text-white px-2 py-0.5 rounded-full text-xs">15</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
               {queue.map((app, idx) => (
                 <div key={idx} className={`p-4 rounded-xl border cursor-pointer transition-colors ${idx === 0 ? 'bg-sage-light/40 border-brand-teal ring-1 ring-brand-teal/50' : 'bg-warm-white hover:bg-sage-light/20 border-sage-light'}`}>
                   <div className="flex justify-between items-start mb-2">
                     <span className="text-xs font-mono text-text-muted">{app.id}</span>
                     {app.status === 'Flagged' && <AlertCircle className="w-4 h-4 text-alert-coral" />}
                   </div>
                   <h4 className="font-medium text-text-primary text-sm">{app.name}</h4>
                   <p className="text-xs text-text-secondary mt-0.5">{app.type}</p>
                   <div className="mt-3 text-xs text-text-secondary flex justify-between items-center">
                      <span>{app.date}</span>
                      <span className={`px-2 py-0.5 rounded-full ${app.status === 'Flagged' ? 'bg-alert-coral/10 text-alert-coral' : 'bg-warm-white-pure border border-sage-medium'}`}>{app.status}</span>
                   </div>
                 </div>
               ))}
            </div>
         </div>

         {/* Detail View */}
         <div className="lg:col-span-2 bg-warm-white-pure rounded-2xl border border-sage-light shadow-sm flex flex-col h-[calc(100vh-16rem)]">
            <div className="p-6 border-b border-sage-light flex justify-between items-start">
               <div>
                 <div className="flex items-center gap-3 mb-1">
                   <h2 className="text-2xl font-serif text-text-primary">Dr. Michael Chen</h2>
                   <span className="bg-sage-medium/30 text-text-primary text-xs px-2 py-1 rounded font-medium">New Application</span>
                 </div>
                 <p className="text-text-secondary text-sm">Psychiatrist • Applied Oct 15, 2023</p>
               </div>
               <div className="flex gap-2">
                  <button className="flex items-center gap-1.5 px-4 py-2 border border-alert-coral text-alert-coral rounded-lg text-sm font-medium hover:bg-alert-coral/5 transition-colors">
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                  <button className="flex items-center gap-1.5 px-4 py-2 bg-brand-teal text-warm-white-pure rounded-lg text-sm font-medium hover:bg-brand-teal-dark transition-colors shadow-sm">
                    <CheckCircle className="w-4 h-4" /> Approve & Verify
                  </button>
               </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
               <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                     <div>
                       <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">Identity Information</h3>
                       <div className="bg-warm-white p-4 rounded-xl border border-sage-light space-y-3">
                          <div>
                            <p className="text-xs text-text-muted">Full Legal Name</p>
                            <p className="text-sm font-medium">Michael David Chen</p>
                          </div>
                          <div>
                            <p className="text-xs text-text-muted">Contact Email</p>
                            <p className="text-sm font-medium">m.chen.md@example.com</p>
                          </div>
                          <div>
                            <p className="text-xs text-text-muted">Location</p>
                            <p className="text-sm font-medium">San Francisco, CA, USA</p>
                          </div>
                       </div>
                     </div>
                     <div>
                       <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">License & Credentials</h3>
                       <div className="bg-warm-white p-4 rounded-xl border border-sage-light space-y-3">
                          <div>
                            <p className="text-xs text-text-muted">NPI Number</p>
                            <p className="text-sm font-mono font-medium">1932458902</p>
                          </div>
                          <div>
                            <p className="text-xs text-text-muted">State License (CA)</p>
                            <p className="text-sm font-mono font-medium">G82934 • Exp: 12/2025</p>
                          </div>
                       </div>
                     </div>
                  </div>

                  <div>
                     <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">Submitted Documents</h3>
                     <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border border-sage-medium rounded-xl hover:bg-sage-light/30 transition-colors cursor-pointer text-sm">
                           <div className="flex items-center gap-3">
                             <FileText className="w-5 h-5 text-trust-purple" />
                             <span className="font-medium text-text-primary">State_License_CA.pdf</span>
                           </div>
                           <span className="text-xs text-brand-teal font-medium">View</span>
                        </div>
                        <div className="flex items-center justify-between p-3 border border-sage-medium rounded-xl hover:bg-sage-light/30 transition-colors cursor-pointer text-sm">
                           <div className="flex items-center gap-3">
                             <FileText className="w-5 h-5 text-trust-purple" />
                             <span className="font-medium text-text-primary">Gov_Issue_ID.pdf</span>
                           </div>
                           <span className="text-xs text-brand-teal font-medium">View</span>
                        </div>
                     </div>

                     <div className="mt-8 bg-trust-purple-light/30 border border-trust-purple/20 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                           <Shield className="w-5 h-5 text-trust-purple shrink-0 mt-0.5" />
                           <div>
                              <p className="text-sm font-medium text-trust-purple mb-1">Automated Checks Passed</p>
                              <p className="text-xs text-text-secondary">NPI database lookup verified name and status. No disciplinary actions found on state record.</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Verification;
