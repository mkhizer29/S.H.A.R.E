import React from 'react';
import { motion } from 'framer-motion';
import { Camera, ShieldCheck, CheckCircle, Award, BookOpen, User } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const Profile = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, duration: 0.6 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 max-w-5xl mx-auto pb-16 font-sans"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2">
        <div>
          <h1 className="text-4xl font-serif text-neutral-900 tracking-tight">Professional Profile</h1>
          <p className="text-[15px] font-medium text-neutral-500 mt-2">Curate your public presence within the directory.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-2.5 rounded-2xl font-bold text-[14px] text-neutral-500 hover:bg-neutral-100 transition-all">Preview Profile</button>
          <button className="px-6 py-2.5 rounded-2xl font-bold text-[14px] bg-primary text-white shadow-float hover:bg-primary-hover transition-all">Save Changes</button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Profile Card */}
        <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6">
          <div className="glass p-8 rounded-[32px] border border-white flex flex-col items-center text-center">
            <div className="relative group">
              <div className="w-40 h-40 rounded-[48px] bg-primary-light flex items-center justify-center text-primary font-serif text-6xl border-4 border-white shadow-float overflow-hidden transition-transform duration-500 group-hover:scale-[1.02]">
                 {/* Placeholder for uploaded image */}
                 S
              </div>
              <button className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-white text-primary flex items-center justify-center hover:bg-neutral-50 transition-all border border-neutral-100 shadow-float">
                <Camera size={20} />
              </button>
            </div>
            
            <div className="mt-8 space-y-2">
              <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Dr. Sarah Jenkins</h2>
              <p className="text-[15px] font-medium text-neutral-500">Ph.D, Licensed Psychologist</p>
            </div>

            <div className="mt-6 flex items-center gap-2 text-accent-hover bg-accent-light/50 px-4 py-2 rounded-full text-[13px] font-bold border border-accent-light">
              <ShieldCheck size={16} />
              Verified Expert
            </div>

            <div className="w-full mt-10 pt-10 border-t border-neutral-100/50 space-y-4">
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-neutral-400 font-bold uppercase tracking-wider">Profile Strength</span>
                <span className="text-primary font-bold">85%</span>
              </div>
              <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: '85%' }} />
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-[24px] border border-neutral-200 p-6 space-y-4">
            <h3 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest px-1">Verification Status</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-tinted border border-neutral-100">
                <div className="p-2 bg-accent-light rounded-lg">
                  <CheckCircle size={14} className="text-accent-hover" />
                </div>
                <span className="text-[13px] font-bold text-neutral-900">Identity Verified</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-tinted border border-neutral-100 opacity-60">
                <div className="p-2 bg-neutral-100 rounded-lg">
                  <BookOpen size={14} className="text-neutral-400" />
                </div>
                <span className="text-[13px] font-bold text-neutral-500">License Validated</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Editing Sections */}
        <motion.div variants={itemVariants} className="lg:col-span-8 space-y-8">
          {/* Personal Info */}
          <section className="bg-surface rounded-[32px] border border-neutral-200 shadow-soft p-8 md:p-10 space-y-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 bg-primary-light/50 rounded-xl flex items-center justify-center text-primary">
                <User size={20} />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 tracking-tight">Account Essentials</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 pt-4">
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-neutral-400 uppercase tracking-wide ml-1">Display Name</label>
                <input 
                  type="text" 
                  defaultValue="Dr. Sarah Jenkins"
                  className="w-full bg-surface-tinted border-2 border-transparent border-b-neutral-200 py-3 px-4 text-[15px] font-medium focus:outline-none focus:border-b-primary transition-all bg-transparent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-neutral-400 uppercase tracking-wide ml-1">Credentials</label>
                <input 
                  type="text" 
                  defaultValue="Ph.D, Licensed Clinical Psychologist"
                  className="w-full bg-surface-tinted border-2 border-transparent border-b-neutral-200 py-3 px-4 text-[15px] font-medium focus:outline-none focus:border-b-primary transition-all bg-transparent"
                />
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <div className="flex justify-between items-end mb-1">
                <label className="text-[13px] font-bold text-neutral-400 uppercase tracking-wide ml-1">Professional Bio</label>
                <span className="text-[11px] font-bold text-neutral-300 tracking-wider uppercase">240 / 500</span>
              </div>
              <textarea 
                rows="4"
                defaultValue="I specialize in cognitive behavioral therapy for anxiety and depression. My approach is client-centered, focusing on building practical coping strategies in a safe, non-judgmental environment."
                className="w-full bg-surface-tinted border border-neutral-100 rounded-2xl py-4 px-5 text-[15px] font-medium focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all resize-none shadow-inner-soft"
              ></textarea>
            </div>
          </section>

          {/* Expertise */}
          <section className="bg-surface rounded-[32px] border border-neutral-200 shadow-soft p-8 md:p-10 space-y-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 bg-accent-light rounded-xl flex items-center justify-center text-accent-hover">
                <Award size={20} />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 tracking-tight">Areas of Expertise</h3>
            </div>
            
            <div className="pt-2">
              <div className="flex flex-wrap gap-3">
                 {['Anxiety Disorders', 'Post-Traumatic Stress', 'Relationship Dynamics', 'Mindfulness'].map((tag) => (
                   <div key={tag} className="bg-white border border-neutral-100 text-neutral-900 px-4 py-2 rounded-xl text-[14px] font-bold flex items-center gap-2 shadow-sm group hover:border-primary transition-colors cursor-default">
                     {tag}
                     <button className="text-neutral-300 hover:text-alert transition-colors font-sans text-lg leading-none">&times;</button>
                   </div>
                 ))}
                 <button className="bg-surface-tinted border border-dashed border-neutral-300 text-neutral-500 hover:text-primary hover:border-primary px-4 py-2 rounded-xl text-[14px] font-bold transition-all flex items-center gap-2">
                   + Add Specialty
                 </button>
              </div>
            </div>
          </section>

          {/* Verification */}
          <section className="bg-[#2D2A32] rounded-[32px] shadow-float p-8 md:p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
            
            <div className="relative z-10 space-y-8">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                   <h3 className="text-xl font-bold tracking-tight">Clinical Verification</h3>
                   <p className="text-neutral-400 text-[14px] font-medium">Manage your professional credentials.</p>
                </div>
                <Badge variant="accent" className="bg-[#4A7F75] text-white border-none px-4 py-1.5 shadow-float">Verified</Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-4 pt-2">
                 <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex justify-between items-center group hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400 shadow-inner">
                        <CheckCircle size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-[14px]">State License (CA)</p>
                        <p className="text-[12px] text-neutral-400">Verified Jan 2023</p>
                      </div>
                    </div>
                 </div>
                 <button className="p-5 rounded-2xl border border-dashed border-white/20 hover:border-white/40 hover:bg-white/5 transition-all text-center">
                    <p className="font-bold text-[14px]">+ Upload Certification</p>
                    <p className="text-[11px] text-neutral-500 mt-1 uppercase tracking-widest font-bold">PDF, JPG (Max 5MB)</p>
                 </button>
              </div>
            </div>
          </section>

          {/* Footer Actions */}
          <div className="pt-4 flex justify-end gap-4 px-2">
             <button className="px-8 py-3 rounded-2xl font-bold text-neutral-500 hover:bg-neutral-100 transition-all">Cancel</button>
             <button className="px-10 py-3 rounded-2xl font-bold bg-primary text-white shadow-float hover:shadow-lg transition-all">Publish Profile</button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Profile;

