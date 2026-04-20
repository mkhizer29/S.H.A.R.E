import React from 'react';
import { Search, MoreHorizontal, FileText, MessageSquare } from 'lucide-react';
import Avatar from '../../components/ui/Avatar';

const Clients = () => {
  const clientsList = [
    { id: 1, alias: 'BlueJay', sessions: 12, lastActive: '2 days ago', status: 'Active', nextSession: 'Tomorrow, 10:00 AM' },
    { id: 2, alias: 'ForestWalker', sessions: 4, lastActive: 'Today', status: 'Active', nextSession: 'Oct 20, 1:00 PM' },
    { id: 3, alias: 'OceanBreeze', sessions: 1, lastActive: 'Yesterday', status: 'Pending Intake', nextSession: 'Needs Scheduling' },
    { id: 4, alias: 'MountainPine', sessions: 8, lastActive: '1 week ago', status: 'Inactive', nextSession: null },
    { id: 5, alias: 'RiverStone', sessions: 24, lastActive: '3 hours ago', status: 'Active', nextSession: 'Oct 22, 4:00 PM' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 px-1">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">My Clients</h1>
          <p className="text-[15px] font-medium text-neutral-500 mt-2">Manage your active roster and secure case notes.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by alias..." 
            className="w-full bg-surface border-2 border-neutral-200 rounded-[20px] py-3.5 pl-11 pr-5 text-[15px] font-medium text-neutral-900 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-neutral-400 shadow-sm"
          />
        </div>
      </div>

      <div className="bg-surface rounded-[32px] border border-neutral-200 shadow-soft overflow-hidden">
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-neutral-100 bg-surface-tinted/50">
                <th className="px-8 py-5 text-[12px] font-bold tracking-wider uppercase text-neutral-400">Alias</th>
                <th className="px-6 py-5 text-[12px] font-bold tracking-wider uppercase text-neutral-400">Status</th>
                <th className="px-6 py-5 text-[12px] font-bold tracking-wider uppercase text-neutral-400">Total Sessions</th>
                <th className="px-6 py-5 text-[12px] font-bold tracking-wider uppercase text-neutral-400">Next Session</th>
                <th className="px-6 py-5 text-[12px] font-bold tracking-wider uppercase text-neutral-400">Last Active</th>
                <th className="px-8 py-5 text-[12px] font-bold tracking-wider uppercase text-neutral-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {clientsList.map((client) => (
                <tr key={client.id} className="hover:bg-neutral-50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <Avatar name={client.alias} size="md" />
                      <span className="font-bold text-[15px] text-neutral-900">{client.alias}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wide ${
                      client.status === 'Active' ? 'bg-[#E6EFEA] text-[#6DA398] border border-[#6DA398]/30' :
                      client.status === 'Inactive' ? 'bg-surface-tinted text-neutral-500 border border-neutral-200' :
                      'bg-orange-100 text-orange-600 border border-orange-200'
                    }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-neutral-500 font-medium text-[15px]">
                    {client.sessions}
                  </td>
                  <td className="px-6 py-5">
                    {client.nextSession ? (
                      <span className="text-[14px] font-bold text-primary bg-primary-light/40 px-3 py-1.5 rounded-xl border border-primary-light/50">
                        {client.nextSession}
                      </span>
                    ) : (
                      <span className="text-[14px] font-medium text-neutral-400 italic">None Scheduled</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-neutral-500 font-medium text-[15px]">
                    {client.lastActive}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2.5 text-neutral-400 hover:text-primary hover:bg-primary-light transition-colors rounded-xl border border-transparent hover:border-primary-light" title="Message">
                        <MessageSquare size={18} />
                      </button>
                      <button className="p-2.5 text-neutral-400 hover:text-primary hover:bg-primary-light transition-colors rounded-xl border border-transparent hover:border-primary-light" title="Secure Notes">
                        <FileText size={18} />
                      </button>
                      <button className="p-2.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200 transition-colors rounded-xl">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Clients;
