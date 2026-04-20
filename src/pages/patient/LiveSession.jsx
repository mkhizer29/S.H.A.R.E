import { motion } from 'framer-motion';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  PhoneOff, Mic, MicOff, Video, VideoOff, 
  MessageSquare, Settings, Lock, Share2
} from 'lucide-react';
import { useRTC } from '../../hooks/useRTC';
import Avatar from '../../components/ui/Avatar';
import Spinner from '../../components/ui/Spinner';

export default function LiveSession() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const initialVideo = searchParams.get('video') === 'true';
  const { 
    isConnected, isAudioMuted, isVideoEnabled, 
    duration, toggleAudio, toggleVideo, leaveSession 
  } = useRTC(id, initialVideo);

  const handleEndSession = () => {
    leaveSession();
    navigate(-1); // go back
  };

  return (
    <div className="fixed inset-0 z-50 bg-surface flex flex-col pt-12 overflow-hidden items-center">
      {/* Abstract Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary-light/50 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-accent-light/40 blur-[100px] pointer-events-none" />
      
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 h-20 px-8 flex items-center justify-between z-10 border-b border-neutral-100/50 bg-white/30 backdrop-blur-md">
        <div className="flex items-center gap-3 bg-white/50 px-4 py-2 rounded-2xl border border-neutral-200 backdrop-blur-lg">
          <Lock size={14} className="text-primary" />
          <span className="text-[13px] font-bold tracking-wide uppercase text-neutral-600">Secure Voice Session</span>
        </div>
        <div className="font-mono text-xl font-bold tracking-widest text-neutral-900 bg-white/50 px-4 py-2 rounded-2xl border border-neutral-200 backdrop-blur-lg">
          {isConnected ? duration : 'Connecting...'}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-5xl flex flex-col items-center justify-center p-8 z-10">
        
        {/* Remote Video or Avatar */}
        <div className="relative w-full max-w-3xl aspect-video rounded-[40px] bg-white/60 border-2 border-white backdrop-blur-xl shadow-float flex flex-col items-center justify-center overflow-hidden mb-12">
          {!isConnected ? (
            <div className="flex flex-col items-center">
              <Spinner size="lg" className="mb-6" />
              <p className="text-lg font-bold text-neutral-600 tracking-tight">Connecting to Professional...</p>
            </div>
          ) : (
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
               className="flex flex-col items-center"
             >
               {/* Pulsing Avatar for Voice-First */}
               <div className="relative">
                 <motion.div 
                    className="absolute inset-0 bg-primary/20 rounded-full"
                    animate={{ scale: [1, 1.4, 1] }} 
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                 />
                 <Avatar name="Dr. Professional" size="xl" className="relative z-10 shadow-lg" />
               </div>
               <h2 className="mt-8 text-3xl font-bold text-neutral-900 tracking-tight">Dr. Professional</h2>
               <p className="text-[15px] font-medium text-neutral-500 mt-2 bg-white/50 px-4 py-1.5 rounded-full border border-neutral-200">Audio only connection active</p>
             </motion.div>
          )}

          {/* Self Video PIP (Picture in Picture) if enabled */}
          {isConnected && isVideoEnabled && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-6 right-6 w-48 aspect-video bg-neutral-900 rounded-[20px] shadow-lg border-2 border-white overflow-hidden flex items-center justify-center"
            >
               <p className="text-white text-sm font-medium">Camera Active</p>
            </motion.div>
          )}
        </div>
        
        {/* Controls */}
        <motion.div 
          initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
          className="flex items-center gap-6 bg-white/80 backdrop-blur-xl p-4 rounded-[32px] border border-white shadow-float"
        >
           <button 
             onClick={toggleAudio}
             className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
               isAudioMuted ? 'bg-alert-light text-alert' : 'bg-surface border border-neutral-200 text-neutral-600 hover:text-primary hover:border-primary-light hover:bg-primary-light'
             }`}
           >
             {isAudioMuted ? <MicOff size={24} /> : <Mic size={24} />}
           </button>

           <button 
             onClick={toggleVideo}
             className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
               !isVideoEnabled ? 'bg-surface border border-neutral-200 text-neutral-600 hover:text-primary hover:border-primary-light hover:bg-primary-light' : 'bg-primary-light text-primary border border-primary-light'
             }`}
             title={isVideoEnabled ? "Disable Camera" : "Turn on optional video"}
           >
             {isVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
           </button>

           <div className="w-px h-8 bg-neutral-200 mx-2" />

           <button 
             className="w-16 h-16 rounded-full flex items-center justify-center bg-surface border border-neutral-200 text-neutral-600 hover:text-primary hover:border-primary-light hover:bg-primary-light transition-all position-relative"
           >
             <MessageSquare size={24} />
           </button>

           <div className="w-px h-8 bg-neutral-200 mx-2" />

           <button 
             onClick={handleEndSession}
             className="w-20 h-16 rounded-3xl flex items-center justify-center bg-alert hover:bg-red-500 text-white shadow-sm hover:shadow-md transition-all"
           >
             <PhoneOff size={24} />
           </button>
        </motion.div>
        
        <p className="mt-8 text-[13px] font-medium text-neutral-400 text-center max-w-md mx-auto">
          You are completely anonymous. This session is never recorded and is end-to-end encrypted.
        </p>

      </div>
    </div>
  );
}
