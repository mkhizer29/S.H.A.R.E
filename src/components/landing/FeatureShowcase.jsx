import { motion } from 'framer-motion';

export default function FeatureShowcase() {
  const features = [
    {
      title: "Anonymous by design.",
      desc: "Connect under a pseudonym. Your real identity is never exposed, giving you the complete freedom to be honest about how you feel.",
      image: "/images/anon.png"
    },
    {
      title: "Voice-first by default.",
      desc: "Remove the anxiety of video calls. Our platform prioritizes voice connections so you can talk in your pajamas, from your bed, without judgment.",
      image: "/images/voice_waves.png"
    }
  ];

  return (
    <section id="features" className="px-6 max-w-7xl mx-auto py-24 scroll-mt-24">
      <div className="space-y-32">
        {features.map((f, i) => (
          <div key={i} className={`flex flex-col lg:flex-row items-center gap-16 lg:gap-24 ${i % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
            {/* Image side */}
            <motion.div 
              initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className="flex-1 w-full"
            >
              <div className="relative aspect-[4/3] bg-lilac-100/50 rounded-[3rem] overflow-hidden flex items-center justify-center border border-white shadow-inner-soft p-0">
                <img src={f.image} alt={f.title} className="w-full h-full object-cover mix-blend-multiply opacity-95 transition-transform hover:scale-105 duration-700" />
              </div>
            </motion.div>

            {/* Text side */}
            <motion.div 
              initial={{ opacity: 0, x: i % 2 === 0 ? 40 : -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className="flex-1"
            >
              <p className="text-[13px] font-bold text-violet-500 uppercase tracking-widest mb-4">Core Philosophy {i + 1}</p>
              <h2 className="text-4xl lg:text-[48px] font-semibold text-text-main mb-8 tracking-tight leading-[1.1]">{f.title}</h2>
              <p className="text-xl text-text-muted leading-relaxed font-medium">{f.desc}</p>
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
}
