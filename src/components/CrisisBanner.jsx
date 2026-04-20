import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CrisisBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="bg-alert-coral-light border-b border-alert-coral/20 px-4 py-3 sticky top-0 z-50 w-full"
      >
        <div className="max-w-7xl mx-auto flex items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-alert-coral flex-shrink-0 mt-0.5 sm:mt-0" />
            <div className="text-sm text-text-primary">
              <span className="font-semibold">In a crisis?</span> Call or text <strong>988</strong> in the US/Canada, or contact your local emergency services immediately.
            </div>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-text-muted hover:text-text-primary transition-colors p-1"
            aria-label="Dismiss banner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CrisisBanner;
