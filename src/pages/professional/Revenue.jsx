import React, { useState } from 'react';
import { DollarSign, TrendingUp, Download, CheckCircle, Clock } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const Revenue = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const history = [
    { id: '1', date: 'Oct 15, 2023', description: 'Session with BlueJay', amount: '$75.00', status: 'Completed', fee: '$11.25', net: '$63.75' },
    { id: '2', date: 'Oct 14, 2023', description: 'Session with RiverStone', amount: '$75.00', status: 'Completed', fee: '$11.25', net: '$63.75' },
    { id: '3', date: 'Oct 12, 2023', description: 'Payout to Bank ****4829', amount: '-$420.50', status: 'Processed', fee: '$0.00', net: '-$420.50' },
    { id: '4', date: 'Oct 10, 2023', description: 'Session with ForestWalker', amount: '$75.00', status: 'Completed', fee: '$11.25', net: '$63.75' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8 px-1">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Revenue</h1>
          <p className="text-[15px] font-medium text-neutral-500 mt-2">Track your earnings and manage payouts securely.</p>
        </div>
        <Button variant="secondary" icon={<Download size={16} />}>
          Export CSV
        </Button>
      </div>

      {/* Aggregate Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card hover={true} className="p-8 h-full">
           <div className="flex items-center gap-3 mb-4">
             <div className="p-3 bg-primary-light rounded-2xl shadow-inner-soft">
               <DollarSign className="w-5 h-5 text-primary" />
             </div>
             <h3 className="text-[13px] font-bold text-neutral-400 tracking-wide uppercase">Expected Next Payout</h3>
           </div>
           <p className="text-4xl font-bold text-neutral-900 tracking-tight mt-2">$382.50</p>
           <p className="text-[13px] font-semibold text-neutral-500 mt-3">Processing on Oct 20</p>
        </Card>
        
        <Card hover={true} className="p-8 h-full">
           <div className="flex items-center gap-3 mb-4">
             <div className="p-3 bg-[#E6EFEA] rounded-2xl shadow-inner-soft">
               <TrendingUp className="w-5 h-5 text-[#4A7F75]" />
             </div>
             <h3 className="text-[13px] font-bold text-neutral-400 tracking-wide uppercase">Earned this Month (Net)</h3>
           </div>
           <p className="text-4xl font-bold text-neutral-900 tracking-tight mt-2">$1,240.00</p>
           <p className="text-[13px] font-bold text-[#6DA398] mt-3">+12% from last month</p>
        </Card>

        <Card hover={true} className="p-8 h-full flex flex-col justify-between">
           <div>
             <div className="flex items-center gap-3 mb-4">
               <div className="p-3 bg-accent-light/50 rounded-2xl shadow-inner-soft">
                 <DollarSign className="w-5 h-5 text-accent-hover" />
               </div>
               <h3 className="text-[13px] font-bold text-neutral-400 tracking-wide uppercase">Total Earned (YTD)</h3>
             </div>
             <p className="text-4xl font-bold text-neutral-900 tracking-tight mt-2">$24,500.00</p>
           </div>
           <div className="mt-4 pt-4 border-t border-neutral-100 flex justify-between items-center">
              <span className="text-[13px] font-medium text-neutral-500">Standard Fee: 15%</span>
              <button className="text-[13px] font-bold text-primary hover:text-primary-hover transition-colors">View Breakdown</button>
           </div>
        </Card>
      </div>

      <div className="bg-surface rounded-[32px] border border-neutral-200 shadow-soft overflow-hidden">
        <div className="border-b border-neutral-100 flex overflow-x-auto bg-surface-tinted/30 px-6">
          <button 
            className={`px-4 py-5 font-bold text-[14px] border-b-[3px] transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-neutral-500 hover:text-neutral-900'}`}
            onClick={() => setActiveTab('overview')}
          >
            Transaction History
          </button>
          <button 
            className={`px-4 py-5 font-bold text-[14px] border-b-[3px] transition-colors whitespace-nowrap ml-4 ${activeTab === 'settings' ? 'border-primary text-primary' : 'border-transparent text-neutral-500 hover:text-neutral-900'}`}
            onClick={() => setActiveTab('settings')}
          >
            Payout Settings
          </button>
        </div>
        
        <div>
          {activeTab === 'overview' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-100 bg-surface-tinted text-neutral-400">
                    <th className="px-8 py-5 text-[12px] font-bold tracking-wider uppercase">Date</th>
                    <th className="px-6 py-5 text-[12px] font-bold tracking-wider uppercase">Description</th>
                    <th className="px-6 py-5 text-[12px] font-bold tracking-wider uppercase">Gross</th>
                    <th className="px-6 py-5 text-[12px] font-bold tracking-wider uppercase">Fee (15%)</th>
                    <th className="px-6 py-5 text-[12px] font-bold tracking-wider uppercase">Net Amount</th>
                    <th className="px-8 py-5 text-[12px] font-bold tracking-wider uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {history.map((row) => (
                    <tr key={row.id} className="text-[15px] hover:bg-neutral-50 transition-colors group">
                      <td className="px-8 py-5 font-bold text-neutral-900">{row.date}</td>
                      <td className="px-6 py-5 text-neutral-600 font-medium">{row.description}</td>
                      <td className="px-6 py-5 text-neutral-600 font-medium">{row.amount}</td>
                      <td className="px-6 py-5 text-neutral-400 font-medium">{row.fee}</td>
                      <td className={`px-6 py-5 font-bold ${row.net.startsWith('-') ? 'text-neutral-900' : 'text-[#6DA398]'}`}>{row.net}</td>
                      <td className="px-8 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold tracking-wide uppercase ${
                          row.status === 'Completed' ? 'bg-[#E6EFEA] text-[#6DA398] border border-[#6DA398]/30' : 
                          'bg-surface-tinted text-neutral-600 border border-neutral-200'
                        }`}>
                          {row.status === 'Completed' ? <CheckCircle size={14} strokeWidth={2.5} /> : <Clock size={14} strokeWidth={2.5} />}
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="max-w-3xl space-y-8 p-8">
               <div className="bg-primary-light/30 border border-primary-light rounded-[24px] p-6 shadow-inner-soft">
                  <h3 className="font-bold text-[16px] text-neutral-900 mb-4 tracking-tight">Connected Bank Account</h3>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-[16px] border border-neutral-200 flex items-center justify-center font-bold text-xl shadow-sm">
                        🏦
                      </div>
                      <div>
                        <p className="font-bold text-[15px] text-neutral-900 mb-0.5">Chase Checkings ****4829</p>
                        <p className="text-[14px] font-medium text-neutral-500">Routing: ******890</p>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm" className="bg-white">Update</Button>
                  </div>
               </div>
               
               <div>
                  <h3 className="font-bold text-[16px] text-neutral-900 mb-5 tracking-tight">Payout Schedule</h3>
                  <div className="space-y-4">
                    <label className="flex items-start gap-4 p-5 rounded-[20px] border border-neutral-200 hover:border-primary-light transition-colors cursor-pointer group">
                      <div className="relative mt-0.5 flex items-center justify-center">
                         <input type="radio" name="payout" className="peer appearance-none w-5 h-5 rounded-full border-2 border-neutral-300 checked:border-primary transition-colors cursor-pointer" defaultChecked />
                         <div className="absolute w-2.5 h-2.5 rounded-full bg-primary opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                      <div>
                        <p className="font-bold text-neutral-900 text-[15px] mb-1">Weekly (Every Friday)</p>
                        <p className="text-[14px] font-medium text-neutral-500 group-hover:text-neutral-600 transition-colors">Standard 2-3 day processing time.</p>
                      </div>
                    </label>
                    <label className="flex items-start gap-4 p-5 rounded-[20px] border border-neutral-200 hover:border-primary-light transition-colors cursor-pointer group">
                      <div className="relative mt-0.5 flex items-center justify-center">
                         <input type="radio" name="payout" className="peer appearance-none w-5 h-5 rounded-full border-2 border-neutral-300 checked:border-primary transition-colors cursor-pointer" />
                         <div className="absolute w-2.5 h-2.5 rounded-full bg-primary opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                      <div>
                        <p className="font-bold text-neutral-900 text-[15px] mb-1">Monthly (1st of Month)</p>
                        <p className="text-[14px] font-medium text-neutral-500 group-hover:text-neutral-600 transition-colors">Lower overall bank transfer fees.</p>
                      </div>
                    </label>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Revenue;
