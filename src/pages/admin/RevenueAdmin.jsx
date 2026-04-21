import React from 'react';
import { DollarSign, Percent, Download, Activity, RefreshCw } from 'lucide-react';

const RevenueAdmin = () => {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-serif text-text-primary">Revenue Control</h1>
          <p className="text-text-secondary mt-1">Platform financials, commission settings, and payout queues.</p>
        </div>
        <button className="flex items-center gap-2 bg-text-primary text-warm-white-pure hover:bg-text-secondary px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Download className="w-4 h-4" />
          Export Financial Report
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-warm-white-pure p-6 rounded-2xl border border-sage-light shadow-sm">
           <h3 className="text-sm font-medium text-text-secondary mb-1">Platform Revenue (MTD)</h3>
           <p className="text-3xl font-serif text-text-primary mb-2">Rs. 3.4M</p>
           <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2 py-1 rounded inline-flex">
              <Activity className="w-3 h-3" /> +15.2% vs last month
           </div>
        </div>
        <div className="bg-warm-white-pure p-6 rounded-2xl border border-sage-light shadow-sm">
           <h3 className="text-sm font-medium text-text-secondary mb-1">Pending Payouts</h3>
           <p className="text-3xl font-serif text-text-primary mb-2">Rs. 920,400</p>
           <div className="text-xs text-text-secondary mt-2">
              Next batch processing: Tomorrow
           </div>
        </div>
        <div className="bg-brand-teal/10 p-6 rounded-2xl border border-brand-teal/20 shadow-sm relative overflow-hidden">
           <Percent className="absolute right-[-10px] bottom-[-10px] w-24 h-24 text-brand-teal opacity-10" />
           <h3 className="text-sm font-medium text-brand-teal mb-1 relative z-10">Global Commission Rate</h3>
           <div className="flex items-center gap-4 mb-2 relative z-10">
             <p className="text-4xl font-serif text-text-primary">15.0%</p>
             <button className="text-xs font-medium bg-white text-text-primary border border-sage-medium px-2 py-1 rounded hover:bg-sage-light transition-colors">Edit</button>
           </div>
           <p className="text-xs text-text-secondary relative z-10">Applies to 815 professionals.</p>
        </div>
      </div>

      <div className="bg-warm-white-pure rounded-2xl border border-sage-light shadow-sm overflow-hidden">
        <div className="p-4 border-b border-sage-light flex justify-between items-center bg-warm-white/50">
          <h3 className="font-medium text-text-primary">Payout Queue</h3>
          <button className="text-xs flex items-center gap-1 font-medium text-text-secondary hover:text-text-primary transition-colors">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sage-light/30 text-text-secondary text-xs uppercase tracking-wider">
                <th className="px-6 py-3 font-medium">Professional</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Method</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-light text-sm">
               {[
                 { pro: 'Dr. Sarah Jenkins', amt: 'Rs. 4,500', method: 'Stripe Connect', status: 'Ready' },
                 { pro: 'Michael Chen, MD', amt: 'Rs. 3,800', method: 'Bank Transfer', status: 'Processing' },
                 { pro: 'Elena Rodriguez, LCSW', amt: 'Rs. 3,200', method: 'Stripe Connect', status: 'Ready' },
               ].map((item, idx) => (
                 <tr key={idx} className="hover:bg-warm-white/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-text-primary">{item.pro}</td>
                    <td className="px-6 py-4 font-mono">{item.amt}</td>
                    <td className="px-6 py-4 text-text-secondary">{item.method}</td>
                    <td className="px-6 py-4">
                       <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                         item.status === 'Ready' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                       }`}>
                         {item.status}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="text-brand-teal hover:underline font-medium text-xs">Review Details</button>
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

export default RevenueAdmin;
