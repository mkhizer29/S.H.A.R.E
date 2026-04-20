import { motion } from 'framer-motion';
import { AnnouncementBar, TrustStrip, HowItWorks, Testimonials, FinalCTA, Footer } from '../../components/landing/SharedLandingComponents';
import HeroSection from '../../components/landing/HeroSection';
import EditorialProblem from '../../components/landing/EditorialProblem';
import InteractivePreview from '../../components/landing/InteractivePreview';
import FeatureShowcase from '../../components/landing/FeatureShowcase';
import Navbar from '../../components/layout/Navbar';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8F7FA] text-text-main overflow-hidden font-sans selection:bg-violet-200">
      <AnnouncementBar />
      <Navbar />
      
      {/* Soft background ambient glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-200/40 blur-[140px]"></div>
        <div className="absolute top-[40%] right-[-10%] w-[40%] h-[40%] rounded-full bg-sage-200/30 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-plum-500/10 blur-[140px]"></div>
      </div>

      <div className="relative z-10 pt-10">
        <HeroSection />
        <TrustStrip />
        <EditorialProblem />
        <InteractivePreview />
        <HowItWorks />
        <FeatureShowcase />
        <Testimonials />
        <FinalCTA />
      </div>
      
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
