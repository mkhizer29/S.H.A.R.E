import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  PhoneOff, Mic, MicOff, Video, VideoOff, 
  MessageSquare, Lock, Zap
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import Spinner from '../../components/ui/Spinner';

export default function LiveSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuthStore();
  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dynamically load Jitsi External API script
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    
    script.onload = () => {
      if (!jitsiContainerRef.current) return;
      
      const domain = 'meet.jit.si';
      const isPro = role === 'professional';
      
      const options = {
        // Using a more unique prefix to avoid restricted public rooms
        roomName: `SHARE-v1-Private-Session-${id}`,
        width: '100%',
        height: '100%',
        parentNode: jitsiContainerRef.current,
        userInfo: {
          displayName: isPro ? (user?.name || 'Professional') : (user?.alias || 'Patient'),
        },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: true,
          prejoinPageEnabled: false,
          // Features for a better experience
          disableModeratorIndicator: false,
          enableUserRoles: true,
          // Allow professional to have more control
          defaultRemoteDisplayName: 'Participant',
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: isPro ? [
            'microphone', 'camera', 'hangup', 'chat', 'settings',
            'mute-everyone', 'mute-video-everyone', 'raisehand', 'tileview'
          ] : [
            'microphone', 'camera', 'hangup', 'chat', 'raisehand'
          ],
          // Hide redundant elements for a cleaner premium feel
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
        },
      };

      const api = new window.JitsiMeetExternalAPI(domain, options);
      jitsiApiRef.current = api;
      setLoading(false);

      // Listen for 'readyToClose' event (user hangs up via Jitsi UI)
      api.addEventListener('readyToClose', () => {
        handleEndSession();
      });
    };

    document.body.appendChild(script);

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }
      document.body.removeChild(script);
    };
  }, [id, role, user]);

  const handleEndSession = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.dispose();
    }
    navigate(role === 'professional' ? '/pro' : '/patient');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1A1A] flex flex-col items-center justify-center font-sans overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-accent-hover/5 blur-[100px] pointer-events-none" />

      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 h-20 px-8 flex items-center justify-between z-20 pointer-events-none">
        <div className="flex items-center gap-3 bg-[#2D2A32]/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/5 pointer-events-auto">
          <Lock size={14} className="text-primary-light" />
          <span className="text-[12px] font-bold tracking-widest uppercase text-white/80">Encrypted Session</span>
        </div>
        <div className="flex items-center gap-3 pointer-events-auto">
            <span className="bg-primary/20 text-primary-light text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-widest border border-primary/30 flex items-center gap-1.5">
               <Zap size={10} fill="currentColor" />
               Live Connection
            </span>
        </div>
      </div>

      {/* Call Area */}
      <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8 pt-24">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-30">
             <Spinner size="lg" color="white" />
             <p className="mt-6 text-white/40 font-bold tracking-widest uppercase text-[12px] animate-pulse">Establishing Secure Link</p>
          </div>
        )}
        
        <div 
          ref={jitsiContainerRef} 
          className={`w-full h-full rounded-[40px] overflow-hidden shadow-2xl border border-white/5 transition-opacity duration-1000 ${loading ? 'opacity-0' : 'opacity-100'}`}
        />
      </div>

      {/* Branding Footer */}
      <div className="absolute bottom-6 left-8 z-20 pointer-events-none opacity-40">
        <p className="text-white font-serif text-xl tracking-tighter">SHARE <span className="text-[10px] tracking-widest font-sans font-bold uppercase ml-2 opacity-60">Connected care</span></p>
      </div>
    </div>
  );
}
