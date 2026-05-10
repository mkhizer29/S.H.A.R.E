import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ShieldCheck, Calendar, User } from 'lucide-react';
import Button from './Button';

export default function ProofModal({ isOpen, onClose, proofData, sessionData }) {
  if (!isOpen) return null;

  const isDataUrl = typeof proofData === 'string' && proofData.startsWith('data:');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-8 pb-4 flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-light rounded-2xl flex items-center justify-center text-primary">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-neutral-900 tracking-tight">Payment Verification</h3>
                <p className="text-sm font-medium text-neutral-500">Review the transfer receipt below.</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-400 hover:text-neutral-900"
            >
              <X size={24} />
            </button>
          </div>

          {/* Session Details Info Bar */}
          {sessionData && (
            <div className="px-8 pb-6">
              <div className="bg-surface-tinted rounded-3xl p-4 flex flex-wrap gap-6 border border-neutral-100">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-neutral-400" />
                  <span className="text-sm font-bold text-neutral-700">{sessionData.patientAlias}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-neutral-400" />
                  <span className="text-sm font-bold text-neutral-700">
                    {new Date(sessionData.startsAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="ml-auto text-sm font-extrabold text-primary">
                  {sessionData.currency} {sessionData.amount?.toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {/* Proof Content */}
          <div className="px-8 pb-8">
            <div className="relative aspect-video w-full bg-neutral-50 rounded-[32px] border-2 border-dashed border-neutral-200 overflow-hidden flex items-center justify-center group">
              {isDataUrl ? (
                <img 
                  src={proofData} 
                  alt="Payment Proof" 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center p-12">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-300">
                    <Download size={32} />
                  </div>
                  <p className="text-neutral-400 font-medium">{proofData || 'No proof available'}</p>
                  <p className="text-xs text-neutral-400 mt-1 uppercase tracking-widest">Legacy Filename Format</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-8 pt-0 flex gap-4">
            <Button 
              fullWidth 
              variant="primary" 
              onClick={onClose}
              className="!rounded-2xl"
            >
              Close Preview
            </Button>
            {isDataUrl && (
               <a 
                 href={proofData} 
                 download="payment-proof.png" 
                 className="flex items-center justify-center gap-2 px-6 py-3 bg-neutral-100 hover:bg-neutral-200 rounded-2xl text-neutral-700 font-bold transition-all"
               >
                 <Download size={18} />
               </a>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
