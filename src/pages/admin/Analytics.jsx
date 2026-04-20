import React from 'react';
import { BarChart3, Users, Clock, Activity, TrendingUp } from 'lucide-react';

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-serif text-text-primary">Platform Analytics</h1>
          <p className="text-text-secondary mt-1">Aggregated platform usage and retention data.</p>
        </div>
        <select className="bg-warm-white-pure border border-sage-medium px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal">
          <option>Last 30 Days</option>
          <option>Last 90 Days</option>
          <option>Year to Date</option>
          <option>All Time</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Daily Active Users', value: '4,250', trend: '+5%', icon: Users },
          { label: 'Avg Session Time', value: '42m', trend: '+2m', icon: Clock },
          { label: 'New Signups', value: '850', trend: '-2%', icon: TrendingUp },
          { label: 'Retention (30d)', value: '68%', trend: '+4%', icon: Activity },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-warm-white-pure p-5 rounded-xl border border-sage-light shadow-sm">
             <div className="flex justify-between items-start mb-2">
               <h3 className="text-xs text-text-secondary uppercase tracking-wider font-medium">{kpi.label}</h3>
               <kpi.icon className="w-4 h-4 text-brand-teal opacity-50" />
             </div>
             <div className="flex items-end gap-3 mt-2">
               <p className="text-2xl font-serif text-text-primary">{kpi.value}</p>
               <span className={`text-xs font-medium mb-1 ${kpi.trend.startsWith('+') ? 'text-green-600' : 'text-alert-coral'}`}>
                 {kpi.trend}
               </span>
             </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
         {/* Mock Chart Area 1 */}
         <div className="bg-warm-white-pure rounded-2xl border border-sage-light shadow-sm p-6">
            <h3 className="text-lg font-serif text-text-primary mb-6">User Growth (DAU vs MAU)</h3>
            <div className="h-64 flex items-end justify-between gap-2 pb-6 border-b border-sage-light relative">
               {/* Very basic CSS bar chart mock */}
               {[30,40,45,50,48,60,70,80,95,90,105,120].map((h, i) => (
                 <div key={i} className="w-full flex justify-center group relative">
                    <div className="w-4/5 bg-brand-teal/20 rounded-t-sm group-hover:bg-brand-teal/40 transition-colors" style={{ height: `${h}px` }}></div>
                    <div className="w-4/5 bg-brand-teal absolute bottom-0 rounded-t-sm group-hover:bg-brand-teal-dark transition-colors" style={{ height: `${h/3}px` }}></div>
                 </div>
               ))}
            </div>
            <div className="flex justify-center gap-6 mt-4">
               <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <div className="w-3 h-3 bg-brand-teal/20 rounded-sm"></div> MAU
               </div>
               <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <div className="w-3 h-3 bg-brand-teal rounded-sm"></div> DAU
               </div>
            </div>
         </div>

         {/* Mock Chart Area 2 */}
         <div className="bg-warm-white-pure rounded-2xl border border-sage-light shadow-sm p-6">
            <h3 className="text-lg font-serif text-text-primary mb-6">Session Volume by Specialty</h3>
            <div className="space-y-4">
               {[
                 { label: 'Anxiety & Stress', percent: 85 },
                 { label: 'Depression', percent: 65 },
                 { label: 'Relationships', percent: 45 },
                 { label: 'Trauma & PTSD', percent: 30 },
                 { label: 'Career/Burnout', percent: 25 },
               ].map((item, i) => (
                 <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-text-primary">{item.label}</span>
                      <span className="text-text-secondary">{item.percent}%</span>
                    </div>
                    <div className="w-full bg-sage-light rounded-full h-2">
                       <div className="bg-trust-purple h-2 rounded-full" style={{ width: `${item.percent}%` }}></div>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default Analytics;
