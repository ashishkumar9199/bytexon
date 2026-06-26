import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, doc, setDoc, query, where, getDocs } from 'firebase/firestore';
import { ProjectRequest, AdminConfig } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Check, Key, HelpCircle, ArrowRight, ShieldCheck, 
  Send, Database, FileText, User, Mail, MessageSquare, IndianRupee, DollarSign 
} from 'lucide-react';

interface ProjectPlannerProps {
  onAccessPortal: (id: string) => void;
  adminConfig: AdminConfig;
  initialTab?: 'create' | 'track';
  initialBudgetAmount?: number;
  initialDescription?: string;
}

export default function ProjectPlanner({ 
  onAccessPortal, 
  adminConfig,
  initialTab = 'create',
  initialBudgetAmount,
  initialDescription
}: ProjectPlannerProps) {
  // Tabs: 'create' for new requests, 'track' to find existing ones
  const [bentoTab, setBentoTab] = useState<'create' | 'track'>(initialTab);

  // Sync prop tab changes
  React.useEffect(() => {
    setBentoTab(initialTab);
  }, [initialTab]);

  // Tracking search state
  const [trackId, setTrackId] = useState('');
  const [trackEmail, setTrackEmail] = useState('');
  const [trackError, setTrackError] = useState<string | null>(null);
  const [matchingRequests, setMatchingRequests] = useState<ProjectRequest[]>([]);
  const [searching, setSearching] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    companyName: '',
    whatsapp: '',
    description: initialDescription || '',
    budgetAmount: initialBudgetAmount ? initialBudgetAmount.toString() : '',
    budgetCurrency: 'INR' as 'INR' | 'USD'
  });

  // Sync prefill settings on changes
  React.useEffect(() => {
    if (initialDescription !== undefined || initialBudgetAmount !== undefined) {
      setFormData(prev => ({
        ...prev,
        description: initialDescription || prev.description,
        budgetAmount: initialBudgetAmount !== undefined ? initialBudgetAmount.toString() : prev.budgetAmount
      }));
    }
  }, [initialDescription, initialBudgetAmount]);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [successRequest, setSuccessRequest] = useState<ProjectRequest | null>(null);

  // Form Submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const customId = `BTX-${randomHex}`;

    const payload: Omit<ProjectRequest, 'id'> = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      companyName: formData.companyName.trim() || undefined,
      whatsapp: formData.whatsapp.trim(),
      description: formData.description.trim(),
      budgetAmount: parseFloat(formData.budgetAmount),
      budgetCurrency: formData.budgetCurrency,
      status: 'pending',
      createdAt: Date.now()
    };

    try {
      const requestRef = doc(db, 'requests', customId);
      try {
        await setDoc(requestRef, payload);
      } catch (writeErr) {
        handleFirestoreError(writeErr, OperationType.WRITE, `requests/${customId}`);
      }

      const savedRequest: ProjectRequest = {
        id: customId,
        ...payload
      };

      setSuccessRequest(savedRequest);
      
      try {
        await addDoc(collection(db, 'chats'), {
          requestId: customId,
          sender: 'admin',
          text: `👋 Hello ${payload.name}! Thank you for choosing Bytexon. We have received your project request for "${payload.description.substring(0, 30)}...". Our architects are reviewing it and will get back to you shortly in this live chat!`,
          timestamp: Date.now()
        });
      } catch (chatErr) {
        handleFirestoreError(chatErr, OperationType.CREATE, 'chats');
      }

      setFormData({
        name: '',
        email: '',
        companyName: '',
        whatsapp: '',
        description: '',
        budgetAmount: '',
        budgetCurrency: 'INR'
      });
    } catch (err) {
      console.error('Error submitting project request:', err);
      alert('Error submitting request. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Track Handlers
  const handleTrackById = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackId.trim()) return;
    onAccessPortal(trackId.trim().toUpperCase());
  };

  const handleTrackByEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackEmail.trim()) return;

    setSearching(true);
    setTrackError(null);
    setMatchingRequests([]);

    try {
      const q = query(
        collection(db, 'requests'), 
        where('email', '==', trackEmail.trim().toLowerCase())
      );
      let snapshot;
      try {
        snapshot = await getDocs(q);
      } catch (getErr) {
        handleFirestoreError(getErr, OperationType.GET, 'requests');
      }
      
      if (snapshot.empty) {
        setTrackError('No project requests found with that email address.');
      } else {
        const list: ProjectRequest[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as ProjectRequest);
        });
        list.sort((a, b) => b.createdAt - a.createdAt);
        setMatchingRequests(list);
      }
    } catch (err) {
      console.error('Error tracking email:', err);
      setTrackError('An error occurred. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Banner */}
      <section className="bg-white border-b border-slate-200 py-12 px-6 sm:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 opacity-60"></div>
        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center space-x-1.5 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full text-indigo-700 text-xs font-semibold font-mono tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Project Board</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
            Secure Project Space & Workspace Tracking
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Formulate your structural requirements below to secure pricing estimates and access your exclusive, real-time lead architect chat room.
          </p>
        </div>
      </section>

      {/* Main Grid Workspace */}
      <section className="max-w-7xl w-full mx-auto px-6 py-10 sm:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        
        {/* Left Column - Instructions and Security Accents (Col Span: 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 space-y-4 shadow-sm">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 block border-b border-slate-100 pb-2">
              Submission Walkthrough
            </span>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-indigo-100">
                  1
                </div>
                <div>
                  <h4 className="font-display font-bold text-xs text-slate-900 uppercase">Input parameters</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans mt-0.5">
                    Specify your budget, currency preference, contact details, and outline the general features or backend requirements.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-indigo-100">
                  2
                </div>
                <div>
                  <h4 className="font-display font-bold text-xs text-slate-900 uppercase">Secure tracking id</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans mt-0.5">
                    Our system generates a unique identifier (e.g. BTX-4A9FCE) which immediately allocates secure sandbox environments in Firestore.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-indigo-100">
                  3
                </div>
                <div>
                  <h4 className="font-display font-bold text-xs text-slate-900 uppercase">Direct Architect Chat</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans mt-0.5">
                    Enter your workspace to chat with our architects, download invoices, review developer logs, and verify payment states via UPI.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-slate-300 border border-slate-800 rounded-lg p-5 sm:p-6 space-y-4">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 block border-b border-slate-800 pb-2">
              Vulnerability & Encryption Guard
            </span>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed font-sans text-slate-300">
                  All requirements, messages, and contact details are fully encrypted and securely isolated using strict Firestore security rules.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Key className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed font-sans text-slate-300">
                  Only the assigned tech leads and owners of the secure workspace ID can read or update transaction parameters.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Planner/Tracker Card (Col Span: 7) */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm">
            
            {/* Tab header buttons - Modern Vibrant 3D Capsule */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] mb-8">
              <button 
                onClick={() => setBentoTab('create')}
                className={`flex-1 text-center py-3 text-xs uppercase tracking-widest font-black transition-all cursor-pointer rounded-xl font-display ${
                  bentoTab === 'create' 
                    ? 'bg-indigo-600 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] border-2 border-slate-900' 
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200 border-2 border-transparent'
                }`}
              >
                [01] START PROJECT
              </button>
              <button 
                onClick={() => setBentoTab('track')}
                className={`flex-1 text-center py-3 text-xs uppercase tracking-widest font-black transition-all cursor-pointer rounded-xl font-display ${
                  bentoTab === 'track' 
                    ? 'bg-amber-400 text-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] border-2 border-slate-900' 
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200 border-2 border-transparent'
                }`}
              >
                [02] TRACK ACCESS
              </button>
            </div>

            <AnimatePresence mode="wait">
              {bentoTab === 'create' ? (
                <motion.div
                  key="create-proposal"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4"
                >
                  {!successRequest ? (
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                      <div>
                        <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">Full Name *</label>
                        <input 
                          type="text"
                          required
                          placeholder="E.G. RAHUL SHARMA"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="bg-transparent border-2 border-slate-900 text-slate-900 p-3 w-full font-mono text-xs focus:outline-none focus:border-indigo-600 transition-all uppercase placeholder:text-slate-300 rounded-xl shadow-[2px_2px_0px_0px_rgba(15,23,42,0.1)] focus:shadow-[4px_4px_0px_0px_rgba(99,102,241,1)]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">Email *</label>
                          <input 
                            type="email"
                            required
                            placeholder="EMAIL@DOMAIN.COM"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="bg-transparent border-2 border-slate-900 text-slate-900 p-3 w-full font-mono text-xs focus:outline-none focus:border-indigo-600 transition-all uppercase placeholder:text-slate-300 rounded-xl shadow-[2px_2px_0px_0px_rgba(15,23,42,0.1)] focus:shadow-[4px_4px_0px_0px_rgba(99,102,241,1)]"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">WhatsApp *</label>
                          <input 
                            type="text"
                            required
                            placeholder="+91 XXXXX XXXXX"
                            value={formData.whatsapp}
                            onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                            className="bg-transparent border-2 border-slate-900 text-slate-900 p-3 w-full font-mono text-xs focus:outline-none focus:border-indigo-600 transition-all uppercase placeholder:text-slate-300 rounded-xl shadow-[2px_2px_0px_0px_rgba(15,23,42,0.1)] focus:shadow-[4px_4px_0px_0px_rgba(99,102,241,1)]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">Company Name (Optional)</label>
                        <input 
                          type="text"
                          placeholder="E.G. ACME INC"
                          value={formData.companyName}
                          onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                          className="bg-transparent border-2 border-slate-900 text-slate-900 p-3 w-full font-mono text-xs focus:outline-none focus:border-indigo-600 transition-all uppercase placeholder:text-slate-300 rounded-xl shadow-[2px_2px_0px_0px_rgba(15,23,42,0.1)] focus:shadow-[4px_4px_0px_0px_rgba(99,102,241,1)]"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">Description of work *</label>
                        <textarea 
                          required
                          rows={4}
                          placeholder="OUTLINE THE CORE MODULES AND TARGET INTEGRATIONS..."
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          className="bg-transparent border-2 border-slate-900 text-slate-900 p-3 w-full font-mono text-xs focus:outline-none focus:border-indigo-600 transition-all uppercase placeholder:text-slate-300 resize-none rounded-xl shadow-[2px_2px_0px_0px_rgba(15,23,42,0.1)] focus:shadow-[4px_4px_0px_0px_rgba(99,102,241,1)]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-1">
                          <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">Currency</label>
                          <select 
                            value={formData.budgetCurrency}
                            onChange={(e) => setFormData(prev => ({ ...prev, budgetCurrency: e.target.value as 'INR' | 'USD' }))}
                            className="bg-white border-2 border-slate-900 text-slate-900 p-3 w-full font-mono text-xs focus:outline-none focus:border-indigo-600 transition-colors uppercase cursor-pointer rounded-xl shadow-[2px_2px_0px_0px_rgba(15,23,42,0.1)]"
                          >
                            <option value="INR">INR (₹)</option>
                            <option value="USD">USD ($)</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">Estimated Budget *</label>
                          <input 
                            type="number"
                            required
                            min="1"
                            placeholder="AMOUNT"
                            value={formData.budgetAmount}
                            onChange={(e) => setFormData(prev => ({ ...prev, budgetAmount: e.target.value }))}
                            className="bg-transparent border-2 border-slate-900 text-slate-900 p-3 w-full font-mono text-xs focus:outline-none focus:border-indigo-600 transition-all uppercase placeholder:text-slate-300 rounded-xl shadow-[2px_2px_0px_0px_rgba(15,23,42,0.1)] focus:shadow-[4px_4px_0px_0px_rgba(99,102,241,1)]"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={formSubmitting}
                        className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-sans font-black py-4 px-6 uppercase tracking-widest text-xs transition-all cursor-pointer disabled:bg-slate-300 border-2 border-slate-900 rounded-xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-y-0.5 active:translate-x-0.5 active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] mt-4 block text-center"
                      >
                        {formSubmitting ? '[ SUBMITTING REQUIREMENTS... ]' : 'SUBMIT PROJECT PROPOSAL'}
                      </button>
                    </form>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center space-y-6 py-6"
                    >
                      <div className="w-20 h-20 bg-emerald-100 border-2 border-slate-900 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 shadow-[4px_4px_0px_0px_rgba(16,185,129,1)] animate-bounce-slow">
                        <Check className="w-10 h-10 stroke-[3]" />
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-display font-black uppercase text-xl text-slate-900 tracking-tight">PROPOSAL SECURED!</h3>
                        <p className="text-slate-600 text-xs leading-relaxed max-w-sm mx-auto">
                          YOUR REQUEST HAS BEEN RECORDED. AN ENGINEER HAS BEEN ALLOCATED FOR TRACKING PROGRESS.
                        </p>
                      </div>

                      <div className="bg-emerald-50 p-5 border-2 border-slate-900 space-y-2 rounded-2xl shadow-[4px_4px_0px_0px_rgba(16,185,129,0.2)]">
                        <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest block font-mono">YOUR WORKSPACE TRACKING ID</span>
                        <strong className="text-2xl font-mono text-indigo-600 tracking-widest block select-all font-bold">{successRequest.id}</strong>
                      </div>

                      <div className="space-y-4 pt-4">
                        <button
                          onClick={() => onAccessPortal(successRequest.id)}
                          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-sans font-bold py-3.5 px-6 uppercase tracking-widest text-xs transition-all cursor-pointer border-2 border-slate-900 rounded-xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-y-0.5 active:translate-x-0.5 active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]"
                        >
                          OPEN CLIENT PORTAL
                        </button>
                        <button
                          onClick={() => setSuccessRequest(null)}
                          className="w-full bg-transparent text-slate-500 hover:text-slate-950 font-bold py-2 px-4 uppercase text-[10px] tracking-wider transition-colors cursor-pointer"
                        >
                          [ SUBMIT NEW PROPOSAL ]
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="track-requests"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-6"
                >
                  {/* Track by ID */}
                  <form onSubmit={handleTrackById} className="space-y-2">
                    <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">Track with Project ID</label>
                    <div className="flex gap-3">
                      <input 
                        type="text"
                        required
                        placeholder="E.G. BTX-FA39CD"
                        value={trackId}
                        onChange={(e) => setTrackId(e.target.value)}
                        className="flex-1 bg-transparent border-2 border-slate-900 text-slate-900 p-3.5 font-mono text-xs focus:outline-none focus:border-indigo-600 transition-all uppercase placeholder:text-slate-300 rounded-xl shadow-[2px_2px_0px_0px_rgba(15,23,42,0.1)] focus:shadow-[4px_4px_0px_0px_rgba(99,102,241,1)]"
                      />
                      <button 
                        type="submit"
                        className="bg-amber-400 text-slate-900 font-sans font-black px-6 py-3.5 uppercase text-xs tracking-widest transition-all cursor-pointer border-2 border-slate-900 rounded-xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-y-0.5 active:translate-x-0.5"
                      >
                        FIND
                      </button>
                    </div>
                  </form>

                  <div className="relative flex items-center justify-center py-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-slate-200"></div></div>
                    <span className="relative bg-white px-3 text-[9px] uppercase tracking-widest font-mono text-slate-400">OR EMAIL ADDRESS</span>
                  </div>

                  {/* Track by Email */}
                  <form onSubmit={handleTrackByEmail} className="space-y-2">
                    <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">Search Registered Email</label>
                    <div className="flex gap-3">
                      <input 
                        type="email"
                        required
                        placeholder="CLIENT@EMAIL.COM"
                        value={trackEmail}
                        onChange={(e) => setTrackEmail(e.target.value)}
                        className="flex-1 bg-transparent border-2 border-slate-900 text-slate-900 p-3.5 font-mono text-xs focus:outline-none focus:border-indigo-600 transition-all uppercase placeholder:text-slate-300 rounded-xl shadow-[2px_2px_0px_0px_rgba(15,23,42,0.1)] focus:shadow-[4px_4px_0px_0px_rgba(99,102,241,1)]"
                      />
                      <button 
                        type="submit"
                        disabled={searching}
                        className="bg-slate-900 text-white font-sans font-bold px-6 py-3.5 uppercase text-xs tracking-widest transition-all cursor-pointer border-2 border-slate-900 rounded-xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-y-0.5 active:translate-x-0.5 shrink-0 disabled:opacity-40"
                      >
                        {searching ? '...' : 'SEARCH'}
                      </button>
                    </div>
                  </form>

                  {/* Results */}
                  <AnimatePresence mode="wait">
                    {trackError && (
                      <motion.p 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        className="text-[11px] text-pink-600 border-2 border-slate-900 bg-pink-50 p-4 font-mono rounded-xl shadow-[4px_4px_0px_0px_rgba(219,39,119,0.15)]"
                      >
                        [ ERROR: {trackError.toUpperCase()} ]
                      </motion.p>
                    )}

                    {matchingRequests.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3 bg-slate-50 p-4 border-2 border-slate-900 max-h-56 overflow-y-auto rounded-2xl shadow-[4px_4px_0px_0px_rgba(15,23,42,0.1)]"
                      >
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Select Workspace:</p>
                        {matchingRequests.map((req) => (
                          <button
                            key={req.id}
                            onClick={() => onAccessPortal(req.id)}
                            className="w-full text-left p-4 hover:bg-white border-2 border-slate-900 rounded-xl flex items-center justify-between text-xs transition-all hover:scale-[1.02] cursor-pointer font-mono shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] duration-150"
                          >
                            <div className="truncate pr-2">
                              <p className="font-bold text-indigo-600 text-[11px] tracking-wide">{req.id}</p>
                              <p className="text-slate-600 truncate text-[10px] mt-0.5">{req.description.toUpperCase()}</p>
                            </div>
                            <span className="flex-shrink-0 px-2.5 py-1 text-[9px] font-black uppercase border-2 border-slate-900 text-indigo-700 bg-indigo-50 rounded-lg shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]">
                              {req.status}
                            </span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </section>
    </div>
  );
}
