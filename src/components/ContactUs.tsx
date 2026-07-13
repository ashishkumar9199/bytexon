import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../context/ToastContext';
import { 
  Mail, Copy, Check, MessageSquare, Send, Clock, Sparkles, ShieldCheck, 
  ArrowRight, PhoneCall, Globe, CheckCircle2 
} from 'lucide-react';

interface ContactUsProps {
  onBackToLanding?: () => void;
  onPlanProject?: () => void;
}

export default function ContactUs({ onBackToLanding, onPlanProject }: ContactUsProps) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('bbytexon@gmail.com');
    setCopied(true);
    showToast('Email address copied to clipboard!', 'success', 'Copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast('Please fill out all required fields.', 'warning', 'Validation');
      return;
    }

    setIsSubmitting(true);
    try {
      // Save directly to firestore
      await addDoc(collection(db, 'contact_inquiries'), {
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim() || 'General Inquiry',
        message: message.trim(),
        createdAt: Date.now(),
        status: 'new'
      });

      setIsSubmitted(true);
      showToast('Message sent successfully! We will get back to you soon.', 'success', 'Success');
      
      // Clear fields
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      console.error('Error saving contact inquiry:', err);
      showToast('Could not send message. Please try again or email directly.', 'error', 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center space-x-2 bg-indigo-50 dark:bg-slate-900 border border-indigo-100/40 dark:border-slate-800 px-3.5 py-1.5 rounded-full mb-4">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-cyan-400">
            Get In Touch
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
          Contact Bytexon
        </h1>
        <p className="mt-4 text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
          Have an elite project idea, a service question, or just want to collaborate? 
          Submit your message or email us directly. Our architecture team responds in under 12 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Premium Interactive Contact Cards */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Email Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-6 sm:p-8 rounded-2xl shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-cyan-500"></div>
            
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-50 dark:bg-slate-800 rounded-xl text-indigo-600 dark:text-cyan-400">
                <Mail className="w-6 h-6" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Primary Email
                </h3>
                <p className="text-lg sm:text-xl font-bold text-slate-950 dark:text-white font-mono break-all selection:bg-indigo-500/10">
                  bbytexon@gmail.com
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                  Send us technical specifications, requests for proposals, or general inquiries.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleCopyEmail}
                className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-xl transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-500" />
                    <span>Copy Address</span>
                  </>
                )}
              </button>

              <a
                href="mailto:bbytexon@gmail.com"
                className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-xs font-semibold text-white dark:text-slate-950 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Email Us Now</span>
              </a>
            </div>
          </div>

          {/* Response SLA Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm">
            <div className="flex gap-4">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-indigo-600 dark:text-cyan-400 h-fit">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Fast Turnaround Guarantee
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Our core development team monitors communication 24/7. 
                  Expect an initial technical assessment or proposal feedback in less than 12 hours.
                </p>
              </div>
            </div>
          </div>

          {/* Infrastructure Security Trust Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm">
            <div className="flex gap-4">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-indigo-600 dark:text-cyan-400 h-fit">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Secure Encrypted Ingress
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  All submissions are encrypted in transit and stored in our secure, partitioned Cloud Firestore database. 
                  Your proprietary business ideas are handled with ultimate confidentiality.
                </p>
              </div>
            </div>
          </div>

          {/* Global Operations Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm">
            <div className="flex gap-4">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-indigo-600 dark:text-cyan-400 h-fit">
                <Globe className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Global Distributed Delivery
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Operating globally to support clients across North America, Europe, Asia, and India.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Secure Interactive Inquiry Form */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-6 sm:p-8 rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />
              <span>Send Secure Inquiry</span>
            </h2>

            <AnimatePresence mode="wait">
              {isSubmitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8 space-y-4"
                >
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100/40 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Inquiry Received Successfully</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                      Thank you for contacting Bytexon. Your inquiry has been saved securely to our system. 
                      A lead architect will email you within 12 hours.
                    </p>
                  </div>
                  <div className="pt-4 flex flex-wrap justify-center gap-3">
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="min-h-[44px] px-4 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60 rounded-xl transition-colors cursor-pointer"
                    >
                      Send Another Message
                    </button>
                    {onPlanProject && (
                      <button
                        onClick={onPlanProject}
                        className="min-h-[44px] px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 text-xs font-semibold text-white rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Start Interactive Planner</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-350 text-[11px] font-bold uppercase tracking-wider mb-1.5">
                        Your Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Elon Musk"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white dark:bg-slate-800/40 dark:focus:bg-slate-950 border border-slate-250 dark:border-slate-850 focus:border-indigo-600 dark:focus:border-cyan-400 focus:outline-none rounded-xl text-xs transition-all font-medium text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-350 text-[11px] font-bold uppercase tracking-wider mb-1.5">
                        Your Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. client@brand.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white dark:bg-slate-800/40 dark:focus:bg-slate-950 border border-slate-250 dark:border-slate-850 focus:border-indigo-600 dark:focus:border-cyan-400 focus:outline-none rounded-xl text-xs transition-all font-medium text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-350 text-[11px] font-bold uppercase tracking-wider mb-1.5">
                      Subject / Topic
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Enterprise Web App development"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white dark:bg-slate-800/40 dark:focus:bg-slate-950 border border-slate-250 dark:border-slate-850 focus:border-indigo-600 dark:focus:border-cyan-400 focus:outline-none rounded-xl text-xs transition-all font-medium text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-350 text-[11px] font-bold uppercase tracking-wider mb-1.5">
                      Your Message / Details <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Describe your requirements, goals, budget guidelines, or other questions..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white dark:bg-slate-800/40 dark:focus:bg-slate-950 border border-slate-250 dark:border-slate-850 focus:border-indigo-600 dark:focus:border-cyan-400 focus:outline-none rounded-xl text-xs transition-all font-medium text-slate-900 dark:text-white resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full min-h-[44px] py-3 bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center space-x-1.5 hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    {isSubmitting ? (
                      <span>Sending Securely...</span>
                    ) : (
                      <>
                        <span>Submit Secure Inquiry</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
