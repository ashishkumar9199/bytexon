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
            
            {/* Tab header buttons */}
            <div className="flex border-b border-slate-200 pb-4 mb-6">
              <button 
                onClick={() => setBentoTab('create')}
                className={`flex-1 text-center py-2 text-xs uppercase tracking-widest font-bold transition-all border-b-2 cursor-pointer ${
                  bentoTab === 'create' 
                    ? 'border-indigo-600 text-indigo-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                [01] START PROJECT
              </button>
              <button 
                onClick={() => setBentoTab('track')}
                className={`flex-1 text-center py-2 text-xs uppercase tracking-widest font-bold transition-all border-b-2 cursor-pointer ${
                  bentoTab === 'track' 
                    ? 'border-indigo-600 text-indigo-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-900'
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
                          className="bg-transparent border border-slate-250 text-slate-900 p-3 w-full font-mono text-xs focus:outline-none focus:border-indigo-600 transition-colors uppercase placeholder:text-slate-300 rounded"
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
                            className="bg-transparent border border-slate-250 text-slate-900 p-3 w-full font-mono text-xs focus:outline-none focus:border-indigo-600 transition-colors uppercase placeholder:text-slate-300 rounded"
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
                            className="bg-transparent border border-slate-250 text-slate-900 p-3 w-full font-mono text-xs focus:outline-none focus:border-indigo-600 transition-colors uppercase placeholder:text-slate-300 rounded"
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
                          className="bg-transparent border border-slate-250 text-slate-900 p-3 w-full font-mono text-xs focus:outline-none focus:border-indigo-600 transition-colors uppercase placeholder:text-slate-300 rounded"
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
                          className="bg-transparent border border-slate-250 text-slate-900 p-3 w-full font-mono text-xs focus:outline-none focus:border-indigo-600 transition-colors uppercase placeholder:text-slate-300 resize-none rounded"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-1">
                          <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">Currency</label>
                          <select 
                            value={formData.budgetCurrency}
                            onChange={(e) => setFormData(prev => ({ ...prev, budgetCurrency: e.target.value as 'INR' | 'USD' }))}
                            className="bg-white border border-slate-250 text-slate-900 p-3 w-full font-mono text-xs focus:outline-none focus:border-indigo-600 transition-colors uppercase cursor-pointer rounded"
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
                            className="bg-transparent border border-slate-250 text-slate-900 p-3 w-full font-mono text-xs focus:outline-none focus:border-indigo-600 transition-colors uppercase placeholder:text-slate-300 rounded"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={formSubmitting}
                        className="bg-slate-900 text-white hover:bg-indigo-600 hover:text-white font-sans font-bold py-3.5 px-6 uppercase w-full tracking-widest text-[11px] transition-colors cursor-pointer disabled:bg-slate-900/30 mt-2 rounded"
                      >
                        {formSubmitting ? '[ SUBMITTING REQUIREMENTS... ]' : 'SUBMIT PROJECT PROPOSAL'}
                      </button>
                    </form>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-6 space-y-6"
                    >
                      <div className="w-12 h-12 border-2 border-indigo-600 text-indigo-600 flex items-center justify-center mx-auto">
                        <Check className="w-6 h-6" />
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="font-display font-black text-lg uppercase text-indigo-600">Proposal received</h3>
                        <p className="text-[11px] text-slate-700 leading-relaxed max-w-xs mx-auto">
                          YOUR REQUEST HAS BEEN RECORDED. AN ENGINEER HAS BEEN ALLOCATED FOR TRACKING PROGRESS.
                        </p>
                      </div>

                      <div className="bg-slate-50 p-4 border border-slate-300 space-y-2 rounded">
                        <span className="text-slate-400 text-[9px] font-bold uppercase tracking-widest block font-mono">YOUR WORKSPACE TRACKING ID</span>
                        <strong className="text-lg font-mono text-indigo-600 tracking-widest block select-all font-bold">{successRequest.id}</strong>
                      </div>

                      <div className="space-y-2 pt-2">
                        <button
                          onClick={() => onAccessPortal(successRequest.id)}
                          className="bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white font-bold py-2.5 px-6 uppercase w-full tracking-wider text-xs transition-colors cursor-pointer rounded"
                        >
                          OPEN CLIENT PORTAL
                        </button>
                        <button
                          onClick={() => setSuccessRequest(null)}
                          className="bg-transparent text-slate-500 hover:text-slate-900 font-bold py-2 px-4 uppercase w-full text-[10px] tracking-wider transition-colors cursor-pointer"
                        >
                          Submit new proposal
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
                    <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Track with Project ID</label>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        required
                        placeholder="E.G. BTX-FA39CD"
                        value={trackId}
                        onChange={(e) => setTrackId(e.target.value)}
                        className="flex-1 bg-transparent border border-slate-250 text-slate-900 p-3 font-mono text-xs focus:outline-none focus:border-indigo-600 transition-colors uppercase placeholder:text-slate-300 rounded"
                      />
                      <button 
                        type="submit"
                        className="bg-slate-900 text-white hover:bg-indigo-600 hover:text-white px-5 py-2 font-bold uppercase text-[11px] tracking-widest transition-colors cursor-pointer rounded"
                      >
                        FIND
                      </button>
                    </div>
                  </form>

                  <div className="relative flex items-center justify-center py-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                    <span className="relative bg-white px-3 text-[9px] uppercase tracking-widest font-mono text-slate-400">OR EMAIL ADDRESS</span>
                  </div>

                  {/* Track by Email */}
                  <form onSubmit={handleTrackByEmail} className="space-y-2">
                    <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Search Registered Email</label>
                    <div className="flex gap-2">
                      <input 
                        type="email"
                        required
                        placeholder="CLIENT@EMAIL.COM"
                        value={trackEmail}
                        onChange={(e) => setTrackEmail(e.target.value)}
                        className="flex-1 bg-transparent border border-slate-250 text-slate-900 p-3 font-mono text-xs focus:outline-none focus:border-indigo-600 transition-colors uppercase placeholder:text-slate-300 rounded"
                      />
                      <button 
                        type="submit"
                        disabled={searching}
                        className="bg-slate-900 text-white hover:bg-indigo-600 hover:text-white px-5 py-2 font-bold uppercase text-[11px] tracking-widest transition-colors cursor-pointer disabled:opacity-40 rounded shrink-0"
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
                        className="text-[11px] text-indigo-600 border border-indigo-200 bg-indigo-600/5 p-3 font-mono rounded"
                      >
                        [ ERROR: {trackError.toUpperCase()} ]
                      </motion.p>
                    )}

                    {matchingRequests.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-2 bg-slate-50 p-3 border border-slate-200 max-h-48 overflow-y-auto rounded"
                      >
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Select Workspace:</p>
                        {matchingRequests.map((req) => (
                          <button
                            key={req.id}
                            onClick={() => onAccessPortal(req.id)}
                            className="w-full text-left p-3 hover:bg-white border border-slate-200 rounded-sm flex items-center justify-between text-xs transition-colors cursor-pointer font-mono"
                          >
                            <div className="truncate pr-2">
                              <p className="font-bold text-indigo-600 text-[11px] tracking-wide">{req.id}</p>
                              <p className="text-slate-500 truncate text-[10px] mt-0.5">{req.description.toUpperCase()}</p>
                            </div>
                            <span className="flex-shrink-0 px-2 py-0.5 text-[9px] font-black uppercase border border-indigo-200 text-indigo-600 bg-indigo-50">
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
