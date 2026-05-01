import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, Plus, Trash2, Calendar as CalendarIcon, 
  ChevronRight, Save, Info, AlertCircle, CheckCircle2,
  CalendarDays, Power
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useAvailabilityStore } from '../../stores/availabilityStore';

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ManageSchedule() {
  const { user } = useAuthStore();
  const { 
    availabilities, 
    loadAvailability, 
    addAvailability, 
    updateAvailability, 
    deleteAvailability,
    isLoading 
  } = useAvailabilityStore();

  const [activeDay, setActiveDay] = useState(new Date().getDay());
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user?.uid) {
      loadAvailability(user.uid);
    }
  }, [user?.uid, loadAvailability]);

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const dayAvailabilities = availabilities.filter(a => Number(a.dayOfWeek) === activeDay);

  const handleAddRule = async () => {
    if (!user?.uid) return;
    
    try {
      await addAvailability({
        professionalId: user.uid,
        dayOfWeek: activeDay,
        startTime: '09:00',
        endTime: '17:00',
        slotDuration: 50,
        breakMinutes: 10,
        isActive: true,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      showSuccess('Availability block added');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-neutral-900 tracking-tight">Manage Schedule</h1>
          <p className="mt-2 text-neutral-500 font-medium max-w-xl">
            Define your recurring weekly availability. These rules determine the time slots 
            patients see when booking a session with you.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2 px-4 py-2 bg-brand-teal/10 text-brand-teal rounded-xl text-sm font-bold border border-brand-teal/20"
              >
                <CheckCircle2 size={16} />
                {successMessage}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-8">
        {/* Day Selector Sidebar */}
        <div className="space-y-2">
          <div className="px-3 mb-3 text-[11px] font-extrabold uppercase tracking-widest text-neutral-400">
            Select Day to Manage
          </div>
          {DAY_LABELS.map((day, index) => {
            const isActive = activeDay === index;
            const dayRules = availabilities.filter(a => Number(a.dayOfWeek) === index);
            const isDayEnabled = dayRules.some(r => r.isActive);

            return (
              <button
                key={day}
                onClick={() => setActiveDay(index)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary text-white shadow-float-primary' 
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:border-primary-light hover:bg-primary-light/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${isDayEnabled ? 'bg-brand-teal' : 'bg-neutral-300'}`} />
                  <span className="font-bold">{day}</span>
                </div>
                <div className="flex items-center gap-2">
                  {dayRules.length > 0 && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-500'
                    }`}>
                      {dayRules.length} blocks
                    </span>
                  )}
                  <ChevronRight size={16} className={isActive ? 'opacity-100' : 'opacity-30'} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Editor Section */}
        <div className="space-y-6">
          <motion.div
            key={activeDay}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-neutral-200 rounded-[32px] p-8 shadow-soft"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-light/30 rounded-2xl flex items-center justify-center text-primary">
                  <CalendarDays size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900">{DAY_LABELS[activeDay]}</h2>
                  <p className="text-sm text-neutral-500">Configure your working hours for this day</p>
                </div>
              </div>

              <button
                onClick={handleAddRule}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-sm font-bold shadow-float-primary hover:opacity-95 transition-all"
              >
                <Plus size={18} />
                Add Time Block
              </button>
            </div>

            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4 text-neutral-400">
                <div className="w-8 h-8 border-3 border-neutral-200 border-t-primary rounded-full animate-spin" />
                <span className="text-sm font-medium">Syncing schedule...</span>
              </div>
            ) : dayAvailabilities.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-neutral-100 rounded-[28px] bg-neutral-50/50">
                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Clock size={24} className="text-neutral-300" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900">No availability set</h3>
                <p className="text-neutral-500 text-sm mt-1 mb-6">Patients won't be able to book you on {DAY_LABELS[activeDay]}s.</p>
                <button
                  onClick={handleAddRule}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-neutral-200 text-neutral-700 rounded-xl text-sm font-bold hover:border-primary-light hover:text-primary transition-all"
                >
                  <Plus size={16} />
                  Start by adding a block
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {dayAvailabilities.map((rule, idx) => (
                  <AvailabilityBlock 
                    key={rule.id} 
                    rule={rule} 
                    onUpdate={(data) => updateAvailability(rule.id, data)}
                    onDelete={() => deleteAvailability(rule.id)}
                    showSuccess={showSuccess}
                  />
                ))}
              </div>
            )}

            {/* Info Card */}
            <div className="mt-8 p-6 bg-sage-medium/10 rounded-3xl border border-sage-medium/20 flex gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 text-sage-medium shadow-sm">
                <Info size={20} />
              </div>
              <div className="text-sm text-neutral-600 leading-relaxed">
                <span className="font-bold text-neutral-900 block mb-1">How it works</span>
                Slots are automatically generated between your start and end times based on the slot duration. 
                Existing bookings and breaks are factored in to ensure you're never double-booked.
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function AvailabilityBlock({ rule, onUpdate, onDelete, showSuccess }) {
  const [localRule, setLocalRule] = useState(rule);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalRule(rule);
    setHasChanges(false);
  }, [rule]);

  const handleChange = (field, value) => {
    setLocalRule(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (localRule.startTime >= localRule.endTime) {
      alert("End time must be after start time");
      return;
    }
    await onUpdate(localRule);
    setHasChanges(false);
    showSuccess('Block updated');
  };

  const handleToggleActive = async () => {
    const newState = !localRule.isActive;
    handleChange('isActive', newState);
    await onUpdate({ ...localRule, isActive: newState });
    showSuccess(newState ? 'Block enabled' : 'Block disabled');
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative group bg-white border rounded-[28px] p-6 transition-all duration-300 ${
        localRule.isActive 
          ? 'border-neutral-200 shadow-sm' 
          : 'border-neutral-100 bg-neutral-50/50 grayscale opacity-75'
      }`}
    >
      <div className="grid md:grid-cols-[1fr_1fr_1fr_1fr_auto] items-end gap-4">
        {/* Time Range */}
        <div className="space-y-2">
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 ml-1">Working Hours</label>
          <div className="flex items-center gap-2">
            <input 
              type="time" 
              value={localRule.startTime}
              onChange={(e) => handleChange('startTime', e.target.value)}
              className="w-full bg-surface border border-neutral-200 rounded-xl px-3 py-2 text-sm font-bold text-neutral-900 focus:border-primary outline-none transition-colors"
            />
            <span className="text-neutral-300">to</span>
            <input 
              type="time" 
              value={localRule.endTime}
              onChange={(e) => handleChange('endTime', e.target.value)}
              className="w-full bg-surface border border-neutral-200 rounded-xl px-3 py-2 text-sm font-bold text-neutral-900 focus:border-primary outline-none transition-colors"
            />
          </div>
        </div>

        {/* Slot Duration */}
        <div className="space-y-2">
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 ml-1">Slot Length</label>
          <div className="relative">
            <select 
              value={localRule.slotDuration}
              onChange={(e) => handleChange('slotDuration', Number(e.target.value))}
              className="w-full bg-surface border border-neutral-200 rounded-xl px-3 py-2 text-sm font-bold text-neutral-900 appearance-none focus:border-primary outline-none transition-colors"
            >
              <option value={30}>30 mins</option>
              <option value={45}>45 mins</option>
              <option value={50}>50 mins</option>
              <option value={60}>60 mins</option>
              <option value={90}>90 mins</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
              <ChevronRight size={14} className="rotate-90" />
            </div>
          </div>
        </div>

        {/* Break Duration */}
        <div className="space-y-2">
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 ml-1">Break Time</label>
          <div className="relative">
            <select 
              value={localRule.breakMinutes}
              onChange={(e) => handleChange('breakMinutes', Number(e.target.value))}
              className="w-full bg-surface border border-neutral-200 rounded-xl px-3 py-2 text-sm font-bold text-neutral-900 appearance-none focus:border-primary outline-none transition-colors"
            >
              <option value={0}>No break</option>
              <option value={5}>5 mins</option>
              <option value={10}>10 mins</option>
              <option value={15}>15 mins</option>
              <option value={20}>20 mins</option>
              <option value={30}>30 mins</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
              <ChevronRight size={14} className="rotate-90" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 h-[42px]">
          {hasChanges ? (
            <button
              onClick={handleSave}
              className="flex-1 h-full flex items-center justify-center gap-2 px-4 bg-brand-teal text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-teal/20 hover:opacity-90 transition-all"
            >
              <Save size={14} />
              Save
            </button>
          ) : (
            <button
              onClick={handleToggleActive}
              className={`flex-1 h-full flex items-center justify-center gap-2 px-4 rounded-xl text-xs font-bold transition-all ${
                localRule.isActive 
                  ? 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200' 
                  : 'bg-primary text-white shadow-float-primary hover:opacity-90'
              }`}
            >
              <Power size={14} />
              {localRule.isActive ? 'Disable' : 'Enable'}
            </button>
          )}

          <button
            onClick={onDelete}
            className="w-[42px] h-full flex items-center justify-center bg-alert-light text-alert rounded-xl hover:bg-alert hover:text-white transition-all"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Validation Message */}
      {localRule.startTime >= localRule.endTime && (
        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-alert">
          <AlertCircle size={14} />
          Invalid time range: End time must be after start time.
        </div>
      )}
    </motion.div>
  );
}
