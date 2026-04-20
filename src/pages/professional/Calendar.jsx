import React from 'react';
import { ChevronLeft, ChevronRight, Video, Phone, MessageSquare } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const Calendar = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Mock events for a modern calendar view
  const events = [
    { day: 1, time: '10:00 AM', client: 'BlueJay', type: 'video' },
    { day: 1, time: '1:00 PM', client: 'ForestWalker', type: 'audio' },
    { day: 2, time: '9:00 AM', client: 'OceanBreeze', type: 'chat' },
    { day: 3, time: '2:30 PM', client: 'MountainPine', type: 'video' },
    { day: 4, time: '11:00 AM', client: 'RiverStone', type: 'video' },
  ];

  const getIcon = (type) => {
    switch(type) {
      case 'video': return <Video size={14} strokeWidth={2.5} />;
      case 'audio': return <Phone size={14} strokeWidth={2.5} />;
      case 'chat': return <MessageSquare size={14} strokeWidth={2.5} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex justify-between items-end mb-8 px-1">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Calendar & Availability</h1>
          <p className="text-[15px] font-medium text-neutral-500 mt-2">Manage your schedule and availability blocks.</p>
        </div>
        <Button variant="primary">Set Availability</Button>
      </div>

      <div className="bg-surface rounded-[32px] border border-neutral-200 shadow-soft overflow-hidden">
        {/* Calendar Header */}
        <div className="p-6 md:p-8 border-b border-neutral-200 flex justify-between items-center bg-surface w-full">
          <div className="flex items-center gap-6">
            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">October 2023</h2>
            <div className="flex bg-neutral-100 rounded-xl p-1.5 border border-neutral-200">
              <button className="px-4 py-1.5 text-[14px] font-bold tracking-wide text-neutral-900 bg-surface rounded-lg shadow-sm border border-neutral-200">Week</button>
              <button className="px-4 py-1.5 text-[14px] font-bold tracking-wide text-neutral-500 hover:text-neutral-900 transition-colors">Month</button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center border border-neutral-200 rounded-xl text-neutral-500 hover:text-primary hover:border-primary-light hover:bg-primary-light transition-all">
              <ChevronLeft size={20} />
            </button>
            <button className="px-5 py-2 text-[14px] font-bold border border-neutral-200 rounded-xl text-neutral-700 hover:text-primary hover:border-primary-light hover:bg-primary-light transition-all">
              Today
            </button>
            <button className="w-10 h-10 flex items-center justify-center border border-neutral-200 rounded-xl text-neutral-500 hover:text-primary hover:border-primary-light hover:bg-primary-light transition-all">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Weekly View Mockup */}
        <div className="flex flex-col min-w-[800px] overflow-x-auto">
           {/* Day Headers */}
           <div className="grid grid-cols-8 border-b border-neutral-200 bg-surface-tinted">
             <div className="col-span-1 border-r border-neutral-200 p-4 text-center text-[12px] font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-center">GMT-5</div>
             {days.map((day, idx) => (
               <div key={idx} className={`col-span-1 border-r border-neutral-200 p-4 text-center ${idx === 1 ? 'bg-primary-light/30' : ''}`}>
                 <p className={`text-[12px] font-bold tracking-wider uppercase mb-1 ${idx === 1 ? 'text-primary' : 'text-neutral-500'}`}>{day}</p>
                 <p className={`text-2xl font-bold tracking-tight ${idx === 1 ? 'text-primary' : 'text-neutral-900'}`}>{16 + idx}</p>
               </div>
             ))}
           </div>

           {/* Time grid (simplistic mockup) */}
           <div className="relative h-[600px] overflow-y-auto bg-surface text-neutral-900">
              <div className="grid grid-cols-8 h-[900px]">
                 {/* Time labels */}
                 <div className="col-span-1 border-r border-neutral-200 bg-surface-tinted">
                   {['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'].map(time => (
                     <div key={time} className="h-24 border-b border-neutral-200 p-3 text-[12px] font-bold text-neutral-400 tracking-wider text-right uppercase">
                       {time}
                     </div>
                   ))}
                 </div>
                 
                 {/* Days columns */}
                 {days.map((day, dIdx) => (
                   <div key={dIdx} className={`col-span-1 border-r border-neutral-200 relative ${dIdx === 1 ? 'bg-primary-light/10' : ''}`}>
                      {/* Grid lines */}
                      {[...Array(9)].map((_, i) => (
                         <div key={i} className="h-24 border-b border-neutral-100"></div>
                      ))}

                      {/* Mock Availability Blocks */}
                      {(dIdx === 0 || dIdx === 2 || dIdx === 4) && (
                        <div className="absolute top-4 left-3 right-3 h-40 bg-surface-tinted border-2 border-dashed border-neutral-300 rounded-[16px] flex items-center justify-center z-0">
                           <span className="text-[12px] font-bold uppercase tracking-widest text-neutral-300">Available</span>
                        </div>
                      )}
                      
                      {/* Render Events */}
                      {events.filter(e => e.day === dIdx).map((event, eIdx) => {
                         let top = 0;
                         if (event.time.includes('10')) top = '6rem';
                         else if (event.time.includes('11')) top = '12rem';
                         else if (event.time.includes('1:00')) top = '24rem';
                         else if (event.time.includes('2:30')) top = '33rem';
                         else top = '0';

                         return (
                           <div 
                             key={eIdx} 
                             className="absolute left-2 right-2 bg-primary text-white p-4 rounded-[16px] shadow-float z-10 hover:-translate-y-1 transition-transform cursor-pointer border border-primary-hover border-b-2"
                             style={{ top, height: '5.5rem' }}
                           >
                             <div className="flex items-center gap-1.5 font-bold tracking-wide text-[11px] mb-2 bg-primary-hover/50 px-2.5 py-1 rounded-lg inline-flex">
                               {getIcon(event.type)} {event.time}
                             </div>
                             <p className="font-bold text-[14px] truncate">{event.client}</p>
                           </div>
                         )
                      })}
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
