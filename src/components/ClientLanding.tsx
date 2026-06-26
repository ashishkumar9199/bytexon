import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, doc, setDoc, query, where, getDocs } from 'firebase/firestore';
import { ProjectRequest, AdminConfig } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, Send, Shield, Zap, Search, ChevronRight, Check,
  Sparkles, Code, Server, Smartphone, Layers, Globe, Mail, Landmark, MessageSquare, PhoneCall
} from 'lucide-react';

interface ClientLandingProps {
  onAccessPortal: (id: string) => void;
  adminConfig: AdminConfig;
}

export default function ClientLanding({ onAccessPortal, adminConfig }: ClientLandingProps) {
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
    description: '',
    budgetAmount: '',
    budgetCurrency: 'INR' as 'INR' | 'USD'
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [successRequest, setSuccessRequest] = useState<ProjectRequest | null>(null);

  // Standard Pricing from config
  const pricingPlans = [
    {
      name: "Starter Prototype",
      desc: "Perfect for MVPs, landing pages, and validated proof-of-concepts.",
      price: adminConfig.standardPricing?.starter ?? 15000,
      features: [
        "1 Core Prototype Developer",
        "Responsive React Application",
        "Basic Database Schema",
        "Deployable Prototype",
        "Bytexon PM & Architecture support"
      ]
    },
    {
      name: "Professional Web App",
      desc: "Robust full-stack web products built for scaling startups.",
      price: adminConfig.standardPricing?.professional ?? 45000,
      features: [
        "Dedicated Frontend + Backend Engineers",
        "Advanced Security & Authentication",
        "Custom APIs & CRM Integrations",
        "High-scale Postgres / Firestore Storage",
        "30 Days Post-Kickoff SLA Support"
      ],
      popular: true
    },
    {
      name: "Enterprise Solution",
      desc: "Custom high-availability architectures and complex business tooling.",
      price: adminConfig.standardPricing?.enterprise ?? 95000,
      features: [
        "Full Multi-Disciplinary Agile Squad",
        "Cloud-Native Kubernetes Deployment",
        "Real-Time Collaboration Features",
        "Premium SLA Guarantee & Security Audit",
        "Direct CTO Consulting"
      ]
    }
  ];

  // Request Submission Handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    
    // Generate a beautiful, custom Tracking ID
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
      // Set doc with explicit custom readable ID
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
      
      // Auto pre-populate some starter messages in chat for the client
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

      // Reset form
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

  // Tracking Search Handlers
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
        // Sort newest first
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

  // Track mode toggling inside the bento card
  const [bentoTab, setBentoTab] = useState<'create' | 'track'>('create');

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 selection:bg-indigo-600 selection:text-white">
      {/* Brutalist Hero Section */}
      <section className="relative overflow-hidden py-12 lg:py-20 px-6 sm:px-12 max-w-7xl mx-auto border-b-2 border-slate-300">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Big Syne Typography Heading */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 border border-indigo-200 bg-indigo-50 px-3 py-1 rounded-sm text-indigo-600 text-[11px] font-bold uppercase tracking-widest font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Architectural digital ecosystems</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7.5xl font-display font-black leading-[0.85] uppercase tracking-tighter text-slate-900">
              Engineering <br />
              <span 
                className="text-transparent"
                style={{ WebkitTextStroke: "1px #0f172a" }}
              >
                Digital
              </span> <br />
              Breakthroughs
            </h1>

            <p className="text-slate-700 text-sm sm:text-base leading-relaxed max-w-xl font-sans">
              Bytexon builds high-performance web products, scalable database backends, and bespoke digital ecosystems. Submit your specifications, track request progression, and chat directly with tech leads.
            </p>

            {/* Quick stats with brutalist metric boxes */}
            <div className="pt-8 grid grid-cols-3 gap-4 border-t border-slate-200">
              <div className="border border-slate-200 p-3 bg-white">
                <p className="text-xl sm:text-2xl font-display font-black text-indigo-600">100%</p>
                <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mt-1">UPI VERIFIED</p>
              </div>
              <div className="border border-slate-200 p-3 bg-white">
                <p className="text-xl sm:text-2xl font-display font-black text-indigo-600">&lt; 2 HR</p>
                <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mt-1">TECH REVIEW</p>
              </div>
              <div className="border border-slate-200 p-3 bg-white">
                <p className="text-xl sm:text-2xl font-display font-black text-indigo-600">LIVE</p>
                <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mt-1">DIRECT CHAT</p>
              </div>
            </div>
          </div>

          {/* Right Column: Unified Brutalist Interactive Card */}
          <div id="quote" className="lg:col-span-5 bg-white border-2 border-slate-300 p-6 sm:p-8 relative">
            {/* Tab header buttons */}
            <div className="flex border-b border-slate-300 pb-4 mb-6">
              <button 
                onClick={() => setBentoTab('create')}
                className={`flex-1 text-center py-2 text-xs uppercase tracking-widest font-bold transition-all border-b-2 ${
                  bentoTab === 'create' 
                    ? 'border-indigo-600 text-indigo-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                [01] START PROJECT
              </button>
              <button 
                onClick={() => setBentoTab('track')}
                className={`flex-1 text-center py-2 text-xs uppercase tracking-widest font-bold transition-all border-b-2 ${
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
                  className="space-y-4"
                >
                  {!successRequest ? (
                    <form onSubmit={handleFormSubmit} className="space-y-3">
                      <div>
                        <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">Full Name *</label>
                        <input 
                          type="text"
                          required
                          placeholder="E.G. RAHUL SHARMA"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="bg-transparent border border-slate-300 text-slate-900 p-3 w-full font-mono text-xs focus:outline-none focus:border-indigo-600 transition-colors uppercase placeholder:text-slate-200"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">Email *</label>
                          <input 
                            type="email"
                            required
                            placeholder="EMAIL@DOMAIN.COM"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="bg-transparent border border-slate-300 text-slate-900 p-3 w-full font-mono text-xs focus:outline-none focus:border-indigo-600 transition-colors uppercase placeholder:text-slate-200"
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
                            className="bg-transparent border border-slate-300 text-slate-900 p-3 w-full font-mono text-xs focus:outline-none focus:border-indigo-600 transition-colors uppercase placeholder:text-slate-200"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">Description of work *</label>
                        <textarea 
                          required
                          rows={3}
                          placeholder="OUTLINE THE CORE MODULES AND TARGET INTEGRATIONS..."
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          className="bg-transparent border border-slate-300 text-slate-900 p-3 w-full font-mono text-xs focus:outline-none focus:border-indigo-600 transition-colors uppercase placeholder:text-slate-200 resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="sm:col-span-1">
                          <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">Currency</label>
                          <select 
                            value={formData.budgetCurrency}
                            onChange={(e) => setFormData(prev => ({ ...prev, budgetCurrency: e.target.value as 'INR' | 'USD' }))}
                            className="bg-white border border-slate-300 text-slate-900 p-3 w-full font-mono text-xs focus:outline-none focus:border-indigo-600 transition-colors uppercase cursor-pointer"
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
                            className="bg-transparent border border-slate-300 text-slate-900 p-3 w-full font-mono text-xs focus:outline-none focus:border-indigo-600 transition-colors uppercase placeholder:text-slate-200"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={formSubmitting}
                        className="bg-slate-900 text-white hover:bg-indigo-600 hover:text-white font-sans font-bold py-3.5 px-6 uppercase w-full tracking-widest text-[11px] transition-colors cursor-pointer disabled:bg-slate-900/30 mt-2"
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

                      <div className="bg-slate-50 p-4 border border-slate-300 space-y-2">
                        <span className="text-slate-400 text-[9px] font-bold uppercase tracking-widest block font-mono">YOUR WORKSPACE TRACKING ID</span>
                        <strong className="text-lg font-mono text-indigo-600 tracking-widest block select-all font-bold">{successRequest.id}</strong>
                      </div>

                      <div className="space-y-2 pt-2">
                        <button
                          onClick={() => onAccessPortal(successRequest.id)}
                          className="bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white font-bold py-2.5 px-6 uppercase w-full tracking-wider text-xs transition-colors cursor-pointer"
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
                        className="flex-1 bg-transparent border border-slate-300 text-slate-900 p-3 font-mono text-xs focus:outline-none focus:border-indigo-600 transition-colors uppercase placeholder:text-slate-200"
                      />
                      <button 
                        type="submit"
                        className="bg-slate-900 text-white hover:bg-indigo-600 hover:text-white px-4 py-2 font-bold uppercase text-[11px] tracking-widest transition-colors cursor-pointer"
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
                        className="flex-1 bg-transparent border border-slate-300 text-slate-900 p-3 font-mono text-xs focus:outline-none focus:border-indigo-600 transition-colors uppercase placeholder:text-slate-200"
                      />
                      <button 
                        type="submit"
                        disabled={searching}
                        className="bg-slate-900 text-white hover:bg-indigo-600 hover:text-white px-4 py-2 font-bold uppercase text-[11px] tracking-widest transition-colors cursor-pointer disabled:opacity-40"
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
                        className="text-[11px] text-indigo-600 border border-indigo-200 bg-indigo-600/5 p-3 font-mono"
                      >
                        [ ERROR: {trackError.toUpperCase()} ]
                      </motion.p>
                    )}

                    {matchingRequests.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-2 bg-slate-50 p-3 border border-slate-200 max-h-48 overflow-y-auto"
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

      {/* Capabilities Section */}
      <section className="py-16 px-6 sm:px-12 max-w-7xl mx-auto text-center space-y-12 border-b-2 border-slate-300">
        <div className="max-w-2xl mx-auto space-y-3">
          <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono">Our capabilities</p>
          <h2 className="text-2xl sm:text-3xl font-display font-black uppercase tracking-tight text-slate-900">
            Architected Solutions For High-Growth Ecosystems
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-mono">
            Bytexon pairs clean product engineering with high-capacity transaction pipelines to deliver production-ready software layouts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-slate-200 p-6 bg-white text-left space-y-4">
            <div className="w-10 h-10 border border-indigo-600 text-indigo-600 flex items-center justify-center font-bold">
              [C]
            </div>
            <h3 className="text-sm font-display font-black uppercase tracking-wider text-slate-900">Custom Web Architectures</h3>
            <p className="text-slate-500 text-xs leading-relaxed font-sans">
              Blazing-fast single page applications constructed with strict, secure code standards using React, Vite, and production-tested API patterns.
            </p>
          </div>

          <div className="border border-slate-200 p-6 bg-white text-left space-y-4">
            <div className="w-10 h-10 border border-indigo-600 text-indigo-600 flex items-center justify-center font-bold">
              [D]
            </div>
            <h3 className="text-sm font-display font-black uppercase tracking-wider text-slate-900">Relational & Cloud Stores</h3>
            <p className="text-slate-500 text-xs leading-relaxed font-sans">
              From Firebase clusters to enterprise Postgres relational servers, we configure highly scalable transaction databases.
            </p>
          </div>

          <div className="border border-slate-200 p-6 bg-white text-left space-y-4">
            <div className="w-10 h-10 border border-indigo-600 text-indigo-600 flex items-center justify-center font-bold">
              [I]
            </div>
            <h3 className="text-sm font-display font-black uppercase tracking-wider text-slate-900">Bespoke System Integrations</h3>
            <p className="text-slate-500 text-xs leading-relaxed font-sans">
              Connecting automated CRM pipelines, secure UPI ledger networks, third-party authentication services, and custom webhook callbacks.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Plans Section */}
      <section id="pricing" className="py-16 px-6 sm:px-12 bg-white border-b-2 border-slate-300">
        <div className="max-w-7xl mx-auto text-center space-y-12">
          <div className="max-w-2xl mx-auto space-y-3">
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono">Standard development plans</p>
            <h2 className="text-2xl sm:text-3xl font-display font-black uppercase tracking-tight text-slate-900">
              Transparent Structural Pricing Rates
            </h2>
            <p className="text-slate-500 text-xs leading-relaxed font-sans">
              Choose a standard developmental blueprint below or initiate the custom project planner to scale up a dedicated multidisciplinary engineering squad.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch max-w-5xl mx-auto text-left">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index}
                className={`bg-slate-50 border-2 p-6 flex flex-col h-full transition-all relative ${
                  plan.popular 
                    ? 'border-indigo-600 shadow-lg shadow-indigo-500/10' 
                    : 'border-slate-300'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-6 px-2 py-0.5 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest">
                    RECOMMENDEDBLUEPRINT
                  </span>
                )}
                
                <div className="space-y-4 flex-grow">
                  <div>
                    <h3 className="text-base font-display font-black uppercase tracking-wider text-slate-900">{plan.name}</h3>
                    <p className="text-slate-500 text-[11px] mt-1 leading-relaxed font-mono">{plan.desc.toUpperCase()}</p>
                  </div>

                  <ul className="space-y-2 py-4 border-t border-b border-slate-200 text-[11px] font-mono text-slate-700">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start space-x-2">
                        <Check className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <span>{feat.toUpperCase()}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a 
                  href="#quote"
                  onClick={() => {
                    setBentoTab('create');
                    setFormData(prev => ({
                      ...prev,
                      budgetAmount: plan.price.toString(),
                      description: `Requesting development plan: ${plan.name}\n\n[Outline target features here]`
                    }));
                    setTimeout(() => {
                      document.getElementById('quote')?.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                  }}
                  className={`block text-center py-3.5 mt-6 font-mono font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer ${
                    plan.popular
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white'
                      : 'bg-transparent text-slate-900 hover:text-indigo-600 border border-slate-300 hover:border-indigo-600'
                  }`}
                >
                  Acquire plan
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 sm:px-12 bg-slate-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 pt-8">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
            © 2026 BYTEXON SYSTEMS. SOFTWARE ARCHITECTURE.
          </div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
            ALL CODE DEPLOYMENTS ARE SECURED VIA CRYPTO & UPI TRANSACTIONS.
          </div>
        </div>
      </footer>
    </div>
  );
}
