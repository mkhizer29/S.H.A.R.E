import React from 'react';
import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-text-primary text-warm-white py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center mb-4 bg-white/90 p-2 rounded-xl">
            <img src="/logo.jpg" alt="SHARE Logo" className="h-8 object-contain" />
          </div>
          <p className="text-text-muted text-sm text-center md:text-left max-w-sm">
            End-to-end encrypted, fully anonymous mental health support. Your privacy is our priority.
          </p>
        </div>
        
        <div className="flex space-x-8 text-sm text-sage-medium">
          <Link to="#" className="hover:text-warm-white transition-colors">Privacy Policy</Link>
          <Link to="#" className="hover:text-warm-white transition-colors">Terms of Service</Link>
          <Link to="#" className="hover:text-warm-white transition-colors">Crisis Resources</Link>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-text-secondary/30 text-center text-text-muted text-xs">
        &copy; {new Date().getFullYear()} SHARE Platform. All rights reserved. Not a replacement for emergency services.
      </div>
    </footer>
  );
};

export default Footer;
