import React from 'react';
import { Camera, ShieldCheck, CheckCircle } from 'lucide-react';

const Profile = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-serif text-text-primary">Public Profile</h1>
        <p className="text-text-secondary mt-1">Manage how clients see you in the directory.</p>
      </div>

      <div className="bg-warm-white-pure rounded-2xl border border-sage-light shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row gap-8">
          
          {/* Photo Section */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl bg-trust-purple-light flex items-center justify-center text-trust-purple font-serif text-5xl mb-4 border-2 border-warm-white-pure shadow-md overflow-hidden">
                 {/* Placeholder for uploaded image */}
                 S
              </div>
              <button className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-brand-teal text-warm-white flex items-center justify-center hover:bg-brand-teal-dark transition-colors border-2 border-warm-white-pure shadow-sm">
                <Camera className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mt-4 flex items-center gap-1.5 text-trust-purple bg-trust-purple-light/50 px-3 py-1.5 rounded-full text-xs font-medium border border-trust-purple/20">
              <ShieldCheck className="w-4 h-4" />
              Verified Professional
            </div>
          </div>

          {/* Form Section */}
          <div className="flex-1 space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Display Name</label>
                <input 
                  type="text" 
                  defaultValue="Dr. Sarah Jenkins"
                  className="w-full bg-warm-white border border-sage-medium rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Title / Credentials</label>
                <input 
                  type="text" 
                  defaultValue="Ph.D, Licensed Clinical Psychologist"
                  className="w-full bg-warm-white border border-sage-medium rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Professional Bio</label>
              <textarea 
                rows="4"
                defaultValue="I specialize in cognitive behavioral therapy for anxiety and depression. My approach is client-centered, focusing on building practical coping strategies in a safe, non-judgmental environment."
                className="w-full bg-warm-white border border-sage-medium rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal resize-none"
              ></textarea>
              <p className="text-xs text-text-muted mt-1 text-right">240 / 500 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Specialties (Max 5)</label>
              <div className="flex flex-wrap gap-2">
                 {['Anxiety', 'Depression', 'Trauma'].map((tag) => (
                   <div key={tag} className="bg-sage-medium/30 text-text-primary px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 border border-sage-medium/50">
                     {tag}
                     <button className="text-text-muted hover:text-alert-coral transition-colors">&times;</button>
                   </div>
                 ))}
                 <button className="bg-warm-white border border-dashed border-sage-medium text-text-secondary hover:text-text-primary px-3 py-1.5 rounded-lg text-sm flex items-center transition-colors">
                   + Add Specialty
                 </button>
              </div>
            </div>

            <div className="pt-6 border-t border-sage-light">
               <h3 className="text-lg font-serif text-text-primary mb-4">Credentials & Verification</h3>
               <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-sage-medium rounded-xl bg-warm-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-text-primary text-sm">State License (CA)</p>
                        <p className="text-xs text-text-secondary">Verified on Jan 10, 2023</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">Approved</span>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-dashed border-sage-medium rounded-xl hover:bg-sage-light/30 transition-colors cursor-pointer block">
                    <div className="text-center w-full">
                      <p className="font-medium text-brand-teal text-sm">+ Upload Additional Certification</p>
                      <p className="text-xs text-text-muted mt-1">PDF, JPG, or PNG (Max 5MB)</p>
                    </div>
                  </div>
               </div>
            </div>

            <div className="pt-6 flex justify-end gap-3">
               <button className="px-5 py-2.5 rounded-lg font-medium text-text-secondary hover:bg-sage-light transition-colors">
                 Cancel
               </button>
               <button className="px-5 py-2.5 rounded-lg font-medium bg-brand-teal text-warm-white-pure hover:bg-brand-teal-dark transition-colors shadow-sm">
                 Save Changes
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
