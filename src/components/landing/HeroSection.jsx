import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function HeroSection() {
  const navigate = useNavigate();
  return (
    <section className="relative pt-0 pb-16 lg:pb-24 px-6 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 items-center">

        {/* Left: Emotional Copy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-xl"
        >
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-violet-100 text-violet-700 text-sm font-medium tracking-wide">
            Your safe space, redefined.
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-[72px] font-semibold tracking-tight text-text-main leading-[1.05] mb-8">
            Speak freely.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-plum-500">
              Heal safely.
            </span>
          </h1>
          <p className="text-lg md:text-[22px] text-text-muted mb-10 leading-relaxed font-medium">
            Connect with verified professionals securely. Voice-first sessions, encrypted chats, and a space built for your privacy—no real name needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-4 px-10 bg-violet-600 text-white rounded-2xl font-bold shadow-soft hover:bg-violet-700 hover:shadow-float hover:-translate-y-0.5 transition-all text-[16px]"
            >
              Get Started Safely
            </button>
            <button
              onClick={() => navigate('/signin')}
              className="px-8 py-4 bg-white/80 backdrop-blur border border-lilac-200 text-text-main rounded-2xl font-bold hover:bg-lilac-100 transition-colors text-[16px]"
            >
              I am a Professional
            </button>
          </div>
        </motion.div>

        {/* Right: Floating Collage / Editorial Art */}
        <div className="relative h-[600px] lg:h-[700px] w-full hidden md:block perspective-1000">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="absolute inset-0"
          >
            {/* Main Art Area with existing vector illustration */}
            <div className="absolute -top-16 right-0 w-full lg:w-[110%] h-[110%] flex items-center justify-end overflow-visible pointer-events-none">
              <img
                src="/images/therapy2.png"
                alt="Therapy untangling"
                className="w-full max-w-[650px] object-contain mix-blend-multiply opacity-95 transition-transform hover:scale-105 duration-1000"
              />
            </div>

            {/* Floating UI Card 1: Mood */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute bottom-20 left-10 w-64 bg-white/90 backdrop-blur-xl p-4 rounded-3xl shadow-float border border-white"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🌱</span>
                <span className="font-bold text-sm text-text-main">Feeling Calm</span>
              </div>
              <div className="h-2 w-full bg-lilac-100 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-sage-500 rounded-full"></div>
              </div>
            </motion.div>

            {/* Floating UI Card 2: Voice Session Active */}
            <motion.div
              animate={{ y: [0, 15, 0] }}
              transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
              className="absolute top-20 right-10 w-56 bg-violet-600 p-5 rounded-3xl shadow-float border border-violet-500 text-white"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">🎙️</div>
                <span className="text-[11px] font-bold tracking-widest uppercase bg-white/20 px-2.5 py-1 rounded-full">Live</span>
              </div>
              <div className="text-[15px] font-bold">Session with Dr. J</div>
              <div className="text-xs text-violet-200 mt-1 font-medium">14:02</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
