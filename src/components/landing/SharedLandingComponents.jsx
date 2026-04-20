import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function AnnouncementBar() {
  return (
    <div className="w-full bg-surface-warm border-b border-lilac-100 py-3 px-4 text-center text-[13px] md:text-sm font-medium text-text-muted flex justify-center items-center gap-2">
      <span className="w-2 h-2 bg-sage-500 rounded-full animate-pulse-soft"></span>
      No credit card required. No real name needed. Delete everything anytime.
    </div>
  );
}

export function TrustStrip() {
  return (
    <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
      {['Anonymous by Design', 'Verified Professionals', 'Encrypted Sessions', 'Voice-First Approach'].map((text, i) => (
        <div key={i} className="bg-white/80 backdrop-blur-md rounded-[32px] p-8 text-center border border-white shadow-soft flex flex-col items-center justify-center gap-4 transition-transform hover:-translate-y-1 duration-500">
          <svg className="w-19 h-20 text-sage-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="text-[20px] font-bold text-text-main tracking-tight">{text}</span>
        </div>
      ))}
    </div>
  );
}

export function HowItWorks() {
  const steps = [
    { step: '01', title: 'Create an Alias', desc: 'Sign up with just a username — no email, no phone, no real name required.' },
    { step: '02', title: 'Browse & Match', desc: 'Filter professionals by specialty, language, and availability. Read realistic reviews.' },
    { step: '03', title: 'Talk Your Way', desc: 'Chat through encrypted text, or start a live voice-first session when ready.' },
  ];

  return (
    <section id="how-it-works" className="px-6 max-w-6xl mx-auto py-24 scroll-mt-24">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-[40px] font-semibold text-text-main tracking-tight mb-4">Start talking in minutes.</h2>
        <p className="text-lg text-text-muted">A straightforward process to find the right connection.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((step, i) => (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, duration: 0.6 }}
            className="bg-surface-warm p-8 rounded-[2.5rem] border border-lilac-100/50 shadow-soft hover:shadow-float transition-shadow group"
          >
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center font-bold text-violet-600 text-xl shadow-sm mb-6 border border-lilac-50 group-hover:scale-110 transition-transform">
              {step.step}
            </div>
            <h3 className="text-2xl font-semibold text-text-main mb-3">{step.title}</h3>
            <p className="text-text-muted leading-relaxed font-medium">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function Testimonials() {
  const reviews = [
    { alias: 'BlueSky42', text: 'For the first time, I could talk about my anxiety without the fear of being judged by someone who knows me. This felt genuinely safe.' },
    { alias: 'GoldenLeaf', text: 'The voice-first approach removed my biggest barrier. I had tried therapy before but always hated being on camera. Here, I actually opened up.' },
    { alias: 'QuietMoon', text: 'My therapist responded within the hour. The encrypted chat made me feel completely protected. I’ve recommended it to three friends.' },
  ];

  return (
    <section className="px-6 max-w-7xl mx-auto py-24">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-[40px] font-semibold text-text-main tracking-tight">Real Stories. Real Healing.</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {reviews.map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/80 backdrop-blur-md p-10 rounded-[3rem] shadow-soft border border-white flex flex-col justify-between"
          >
            <p className="text-lg text-text-muted italic leading-relaxed mb-8">"{r.text}"</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-lilac-100 rounded-full flex items-center justify-center text-violet-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
              </div>
              <div>
                <p className="font-semibold text-text-main">{r.alias}</p>
                <p className="text-[12px] font-medium text-text-muted">Anonymous Patient</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function FinalCTA() {
  const navigate = useNavigate();
  return (
    <section className="px-6 max-w-4xl mx-auto py-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="bg-violet-600 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-float"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-plum-500/30 to-transparent mix-blend-overlay"></div>
        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-semibold text-white mb-6 tracking-tight leading-tight">Your wellbeing deserves<br />a safe space.</h2>
          <p className="text-violet-100 text-lg md:text-xl font-medium mb-10 max-w-2xl mx-auto">Join thousands who chose to heal — securely, privately, and on their own terms.</p>
          <button onClick={() => navigate('/signup')} className="px-10 py-5 bg-white text-violet-700 font-semibold rounded-2xl hover:scale-105 transition-transform shadow-lg text-lg">
            Begin Your Journey
          </button>
        </div>
      </motion.div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="w-full bg-surface-warm py-12 px-6 border-t border-lilac-100/50">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-100 rounded-[12px] flex items-center justify-center">
            <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <span className="font-bold text-xl text-text-main tracking-tight">SHARE</span>
        </div>
        <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-text-muted">
          <button className="hover:text-violet-600">Privacy Policy</button>
          <button className="hover:text-violet-600">Terms of Service</button>
          <button className="hover:text-violet-600">Pro Portal</button>
        </div>
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">End-to-End Encrypted</p>
      </div>
    </footer>
  );
}
