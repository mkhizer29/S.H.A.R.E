import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone } from 'lucide-react';
import Button from './ui/Button';
import { useSessionTimer } from '../hooks/useSessionTimer';

export default function JoinSessionButton({ startsAt, sessionId, role = 'patient', size = 'sm' }) {
  const navigate = useNavigate();
  const { isJoinable, timeLeft, isStarted } = useSessionTimer(startsAt);

  const handleJoin = () => {
    if (isJoinable) {
       navigate(`/${role === 'professional' ? 'pro' : 'patient'}/session/${sessionId}`);
    }
  };

  return (
    <Button 
      variant={isJoinable ? 'primary' : 'neutral'} 
      size={size} 
      icon={<Phone size={size === 'sm' ? 14 : 18} />} 
      className={`font-semibold shadow-sm transition-all ${!isJoinable ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
      onClick={handleJoin}
      disabled={!isJoinable}
    >
      {isJoinable ? (isStarted ? 'Join Now' : 'Join Session') : `Join in ${timeLeft}`}
    </Button>
  );
}
