import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../context/ToastContext';
import { 
  MessageSquarePlus, X, Send, Sparkles, Bug, Lightbulb, 
  HelpCircle, ShieldCheck, CheckCircle2, User, Mail, Text
} from 'lucide-react';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export default function FeedbackWidget() {
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  
  // Form State
  const [type, setType] = useState<'bug' | 'feature' | 'other'>('bug');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  };

  const handleClose = () => {
    setIsOpen(false);
    // Only reset state if it was successful, so users don't lose typed text if they accidentally close
    if (isSubmitted) {
      setIsSubmitted(false);
      setType('bug');
      setName('');
      setEmail('');
      setSubject('');
      setDescription('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim()) {
      showToast('Please enter a brief subject/summary.', 'warning', 'Validation');
      return;
    }
    if (!description.trim()) {
      showToast('Please describe your feedback details.', 'warning', 'Validation');
      return;
    }

    setIsSubmitting(true);
    const feedbackPath = 'feedback';
    
    try {
      await addDoc(collection(db, feedbackPath), {
        name: name.trim() || 'Anonymous User',
        email: email.trim() || 'Not Provided',
        type,
        subject: subject.trim(),
        description: description.trim(),
        createdAt: Date.now(),
        status: 'new'
      });

      setIsSubmitted(true);
      showToast('Thank you! Your feedback has been saved.', 'success', 'Feedback Saved');
      
      // Auto close modal after 2.5 seconds on success
      setTimeout(() => {
        handleClose();
      }, 2500);

    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.CREATE, feedbackPath);
      } catch (wrappedError) {
        showToast('Failed to submit feedback. Please try again later.', 'error', 'Error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Sticky Button in bottom-left */}
      <div className="fixed bottom-6 left-6 z-[9990]">
        <button
          id="btn-feedback-floating"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-sans text-xs font-bold rounded-full shadow-lg border border-slate-850 dark:border-slate-100 hover:scale-105 active:scale-95 hover:bg-indigo-650 dark:hover:bg-slate-50 transition-all cursor-pointer group"
        >
          <MessageSquarePlus className="w-4 h-4 text-indigo-400 dark:text-cyan-500 group-hover:rotate-12 transition-transform duration-300" />
          <span>Feedback</span>
        </button>
      </div>

      {/* Modal Dialog */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9995] flex items-center justify-center p-4">
            {/* Backdrop Overlay */}
            <motion.div
              id="feedback-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              id="feedback-modal-box"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 w-full max-w-lg rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header Gradient Accent line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-cyan-500"></div>

              {/* Header Section */}
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
                    <span>Submit Platform Feedback</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    Help us iterate on our design system & planner tools.
                  </p>
                </div>
                <button
                  id="btn-close-feedback-modal"
                  onClick={handleClose}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <AnimatePresence mode="wait">
                  {isSubmitted ? (
                    <motion.div
                      key="success-state"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="py-12 text-center space-y-4"
                    >
                      <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100/40 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-bold text-slate-950 dark:text-white">Feedback Logged Successfully</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                          Your report has been securely saved to our database. Our architecture team reviews submissions twice daily to prioritize fixes.
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* Select Feedback Category */}
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider mb-2">
                          Category <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          <button
                            type="button"
                            onClick={() => setType('bug')}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                              type === 'bug'
                                ? 'bg-rose-500/10 border-rose-500/40 text-rose-600 dark:text-rose-400 font-bold'
                                : 'bg-slate-50 hover:bg-slate-100/60 dark:bg-slate-800 dark:hover:bg-slate-700/60 border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <Bug className="w-4.5 h-4.5 mb-1.5" />
                            <span className="text-[10px] tracking-tight">Bug Report</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setType('feature')}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                              type === 'feature'
                                ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-600 dark:text-indigo-400 font-bold'
                                : 'bg-slate-50 hover:bg-slate-100/60 dark:bg-slate-800 dark:hover:bg-slate-700/60 border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <Lightbulb className="w-4.5 h-4.5 mb-1.5" />
                            <span className="text-[10px] tracking-tight">Feature Request</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setType('other')}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                              type === 'other'
                                ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-600 dark:text-cyan-400 font-bold'
                                : 'bg-slate-50 hover:bg-slate-100/60 dark:bg-slate-800 dark:hover:bg-slate-700/60 border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <HelpCircle className="w-4.5 h-4.5 mb-1.5" />
                            <span className="text-[10px] tracking-tight">Other/Inquiry</span>
                          </button>
                        </div>
                      </div>

                      {/* Optional Contact fields */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            <span>Name (Optional)</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Satoshi"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 focus:bg-white dark:bg-slate-800/40 dark:focus:bg-slate-950 border border-slate-200 dark:border-slate-750 focus:border-indigo-500 dark:focus:border-cyan-400 focus:outline-none rounded-xl text-xs transition-all font-medium text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>Email (Optional)</span>
                          </label>
                          <input
                            type="email"
                            placeholder="e.g. feedback@domain.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 focus:bg-white dark:bg-slate-800/40 dark:focus:bg-slate-950 border border-slate-200 dark:border-slate-750 focus:border-indigo-500 dark:focus:border-cyan-400 focus:outline-none rounded-xl text-xs transition-all font-medium text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>

                      {/* Subject */}
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <Text className="w-3 h-3 text-slate-400" />
                          <span>Brief Subject <span className="text-rose-500">*</span></span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={
                            type === 'bug'
                              ? 'e.g. Interactive price calculator slider is laggy on mobile'
                              : type === 'feature'
                              ? 'e.g. Add dark mode toggle on header'
                              : 'e.g. Question about customization services'
                          }
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white dark:bg-slate-800/40 dark:focus:bg-slate-950 border border-slate-200 dark:border-slate-750 focus:border-indigo-500 dark:focus:border-cyan-400 focus:outline-none rounded-xl text-xs transition-all font-medium text-slate-900 dark:text-white"
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                          Details / Description <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                          required
                          rows={4}
                          placeholder={
                            type === 'bug'
                              ? 'Please explain the steps to reproduce the bug. Include what you expected versus what actually happened.'
                              : type === 'feature'
                              ? 'Provide details of the feature you want. Explain how it would help your experience.'
                              : 'Enter any other observations or comments you have...'
                          }
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white dark:bg-slate-800/40 dark:focus:bg-slate-950 border border-slate-200 dark:border-slate-750 focus:border-indigo-500 dark:focus:border-cyan-400 focus:outline-none rounded-xl text-xs transition-all font-medium text-slate-900 dark:text-white resize-none"
                        ></textarea>
                      </div>

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full min-h-[44px] py-3 bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 cursor-pointer shadow-md"
                      >
                        {isSubmitting ? (
                          <span>Saving to Secure Storage...</span>
                        ) : (
                          <>
                            <span>Submit Feedback</span>
                            <Send className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer Trust Info */}
              <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-450 dark:text-slate-500 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-500/80 dark:text-cyan-500/80" />
                  <span>Secure Sandbox Isolation</span>
                </span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">
                  v1.2.0-secure
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
