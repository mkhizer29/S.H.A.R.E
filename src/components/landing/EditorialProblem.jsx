import { motion } from 'framer-motion';

export default function EditorialProblem() {
  return (
    <section id="about" className="px-6 max-w-7xl mx-auto py-24 scroll-mt-24">
      <div className="bg-surface-warm rounded-[3rem] p-8 md:p-16 shadow-soft border border-lilac-100">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Illustration / Quote area */}
          <div className="relative">
            <div className="aspect-[4/5] bg-lilac-100 rounded-[2rem] overflow-hidden relative border border-white">
              <img src="/images/hero2.png" alt="Abstract calm figure" className="w-full h-full object-cover opacity-90 mix-blend-multiply" />
            </div>
            {/* Overlapping quote card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="absolute -bottom-8 -right-8 bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-float max-w-[320px] border border-white hidden md:block"
            >
              <p className="text-text-main font-semibold text-lg leading-relaxed">
                "Finding help shouldn't feel like filling out tax forms. It should feel like stepping into a sanctuary."
              </p>
            </motion.div>
          </div>

          {/* Right: The Shift */}
          <div className="space-y-12">
            <div>
              <p className="text-[13px] font-bold text-violet-500 uppercase tracking-widest mb-4">The Shift</p>
              <h2 className="text-4xl md:text-[40px] font-semibold mb-6 tracking-tight leading-[1.1]">The old way is clinical. <br/>We built a sanctuary.</h2>
              <p className="text-lg text-text-muted leading-relaxed font-medium">
                Traditional platforms demand your real name, display cold corporate dashboards, and default to video—adding friction when you're already feeling vulnerable.
              </p>
            </div>

            <div className="space-y-8">
              <ComparisonItem 
                title="Privacy First, Always" 
                desc="Choose an alias. Your identity remains entirely yours." 
              />
              <ComparisonItem 
                title="Voice by Default" 
                desc="Pajamas? Tears? Messy room? Voice-first means zero pressure." 
              />
              <ComparisonItem 
                title="Gentle Environment" 
                desc="A warm, modern UI designed to lower your heart rate." 
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function ComparisonItem({ title, desc }) {
  return (
    <div className="flex gap-5">
      <div className="w-14 h-14 shrink-0 rounded-[20px] bg-lilac-50 flex items-center justify-center text-violet-600 shadow-inner-soft border border-white">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div className="pt-1">
        <h4 className="text-[18px] font-bold text-text-main tracking-tight">{title}</h4>
        <p className="text-text-muted mt-1 font-medium leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
