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

  return (
    <div className="bg-slate-50 min-h-screen">
          {/* Premium Hero Section */}
      <section className="relative overflow-hidden py-10 px-4 bg-white border-b border-slate-200">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 left-6 w-48 h-48 bg-indigo-100 rounded-full blur-2xl"></div>
          <div className="absolute bottom-4 right-6 w-64 h-64 bg-sky-100 rounded-full blur-2xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Hero Content (7 Columns) */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-4 text-left">
            <div className="inline-flex self-start items-center space-x-1 px-2.5 py-0.5 bg-indigo-50 border border-indigo-200 rounded-sm text-indigo-700 text-[10px] font-bold uppercase tracking-wider font-sans">
              <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" />
              <span>Full-Stack Software Architecture Agency</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight leading-tight">
              Engineering Your <br />
              <span className="bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">Digital Breakthrough</span>
            </h1>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-xl font-medium">
              Bytexon builds high-performance web products, scalable database backends, and bespoke digital ecosystems. Submit your requirements, chat instantly with our tech leads, and launch your project with secure UPI processing.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a 
                href="#quote"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-bold rounded-sm shadow-xs transition-all flex items-center space-x-1.5 text-xs"
              >
                <span>Launch Project Planner</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
              <a 
                href="#pricing"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans font-bold rounded-sm text-xs transition-all border border-slate-250"
              >
                Browse Price Plans
              </a>
            </div>

            {/* Credibility highlights */}
            <div className="pt-4 border-t border-slate-200 grid grid-cols-3 gap-2">
              <div>
                <p className="text-lg sm:text-xl font-display font-black text-slate-900">100%</p>
                <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">UPI Verified Trans</p>
              </div>
              <div>
                <p className="text-lg sm:text-xl font-display font-black text-slate-900">&lt; 2 Hr</p>
                <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Architect Review</p>
              </div>
              <div>
                <p className="text-lg sm:text-xl font-display font-black text-slate-900">Live</p>
                <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Client-Admin Chat</p>
              </div>
            </div>
          </div>

          {/* Tracking Panel (5 Columns) */}
          <div className="lg:col-span-5 bg-slate-50 border border-slate-300 p-4 rounded-sm shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-display font-bold text-slate-900 flex items-center space-x-1.5">
                <Search className="w-4.5 h-4.5 text-indigo-600" />
                <span>Track Existing Project</span>
              </h2>
              <p className="text-slate-500 text-[11px] mt-0.5">Track approval status, chat with developers, or submit payments.</p>
            </div>

            {/* Track by ID */}
            <form onSubmit={handleTrackById} className="space-y-1.5">
              <label className="block text-slate-700 text-[10px] font-bold uppercase tracking-wider">Track with Project ID</label>
              <div className="flex space-x-1.5">
                <input 
                  type="text"
                  required
                  placeholder="e.g. BTX-FA39CD"
                  value={trackId}
                  onChange={(e) => setTrackId(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 focus:border-indigo-600 focus:outline-none rounded-sm text-xs font-mono uppercase transition-all"
                />
                <button 
                  type="submit"
                  id="btn-track-id"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-sm text-xs font-bold transition-all cursor-pointer"
                >
                  Track ID
                </button>
              </div>
            </form>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-2 text-slate-400 text-[9px] uppercase font-bold font-mono">Or Search Email</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Track by Email */}
            <form onSubmit={handleTrackByEmail} className="space-y-1.5">
              <label className="block text-slate-700 text-[10px] font-bold uppercase tracking-wider">Search by Registered Email</label>
              <div className="flex space-x-1.5">
                <input 
                  type="email"
                  required
                  placeholder="e.g. yourname@example.com"
                  value={trackEmail}
                  onChange={(e) => setTrackEmail(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 focus:border-indigo-600 focus:outline-none rounded-sm text-xs transition-all font-medium"
                />
                <button 
                  type="submit"
                  disabled={searching}
                  id="btn-track-email"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white rounded-sm text-xs font-bold transition-all cursor-pointer"
                >
                  {searching ? '...' : 'Search'}
                </button>
              </div>
            </form>

            {/* Search Results / Status */}
            <AnimatePresence mode="wait">
              {trackError && (
                <motion.p 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="text-[11px] text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-sm"
                >
                  {trackError}
                </motion.p>
              )}

              {matchingRequests.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-1.5 bg-white p-2.5 rounded-sm border border-slate-300 max-h-40 overflow-y-auto"
                >
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Project Request:</p>
                  {matchingRequests.map((req) => (
                    <button
                       key={req.id}
                       onClick={() => onAccessPortal(req.id)}
                       className="w-full text-left p-2 hover:bg-slate-50 border border-slate-200 rounded-sm flex items-center justify-between text-xs transition-colors"
                     >
                       <div className="truncate pr-2">
                         <p className="font-mono font-bold text-indigo-700 text-[11px]">{req.id}</p>
                         <p className="text-slate-500 truncate text-[10px]">{req.description}</p>
                       </div>
                       <span className={`flex-shrink-0 px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded-sm ${
                         req.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                         req.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                         req.status === 'rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                         'bg-indigo-50 text-indigo-700 border border-indigo-200'
                       }`}>
                         {req.status}
                       </span>
                     </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
 
        </div>
      </section>

      {/* Capabilities / Services */}
      <section className="py-10 px-4 max-w-7xl mx-auto text-center space-y-6">
        <div className="max-w-2xl mx-auto space-y-1.5">
          <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono">Our Capabilities</p>
          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 tracking-tight">
            We architect solutions for digital-first enterprises.
          </h2>
          <p className="text-slate-500 text-xs leading-normal">
            Bytexon pairs clean product engineering with dynamic data pipelines to deliver production-ready infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-sm border border-slate-200 text-left shadow-xs space-y-2">
            <div className="w-9 h-9 bg-indigo-50 rounded-sm flex items-center justify-center text-indigo-600 border border-indigo-100">
              <Code className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-sm font-display font-bold text-slate-900">Custom Web Applications</h3>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              We design and construct blazing-fast single page architectures with high security standards using React, Vite, and Node.js.
            </p>
          </div>

          <div className="bg-white p-4 rounded-sm border border-slate-200 text-left shadow-xs space-y-2">
            <div className="w-9 h-9 bg-sky-50 rounded-sm flex items-center justify-center text-sky-600 border border-sky-100">
              <Server className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-sm font-display font-bold text-slate-900">Cloud & SQL Databases</h3>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              From enterprise Firestore setups to highly relational Cloud SQL databases, we architect reliable transaction layers.
            </p>
          </div>

          <div className="bg-white p-4 rounded-sm border border-slate-200 text-left shadow-xs space-y-2">
            <div className="w-9 h-9 bg-indigo-50 rounded-sm flex items-center justify-center text-indigo-600 border border-indigo-100">
              <Smartphone className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-sm font-display font-bold text-slate-900">Custom System Integrations</h3>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              We tie together CRM integrations, payment engines (UPI QR/UPI ID), messaging webhooks, and third-party security layers.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Plans Section */}
      <section id="pricing" className="py-10 px-4 bg-white border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-1.5">
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono">Pricing Tiers</p>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 tracking-tight">
              Honest, Transparent Project Rates
            </h2>
            <p className="text-slate-500 text-xs leading-normal">
              Choose an entry tier for baseline prototypes or submit a custom planner for tailor-made full-scale agency squads.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch max-w-5xl mx-auto text-left">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index}
                className={`bg-slate-50 rounded-sm border p-4.5 flex flex-col h-full transition-all ${
                  plan.popular 
                    ? 'border-indigo-600 border-2 bg-white relative shadow-xs' 
                    : 'border-slate-300'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-indigo-600 text-white text-[9px] font-extrabold uppercase tracking-widest rounded-sm">
                    Most Popular
                  </span>
                )}
                
                <div className="space-y-3 flex-1">
                  <div>
                    <h3 className="text-sm font-display font-bold text-slate-900">{plan.name}</h3>
                    <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">{plan.desc}</p>
                  </div>
                  
                  <div className="py-2.5 border-b border-slate-200">
                    <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Starting From</p>
                    <p className="text-2xl font-display font-black text-slate-900 mt-0.5">
                      ₹{plan.price.toLocaleString()}
                    </p>
                  </div>

                  <ul className="space-y-2 py-2 text-[11px] font-sans text-slate-600">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start space-x-1.5">
                        <Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a 
                  href="#quote"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      budgetAmount: plan.price.toString(),
                      description: `Requesting standard plan: ${plan.name}\n\n[Please describe your specific work features here...]`
                    }));
                  }}
                  className={`block text-center py-2 rounded-sm font-sans font-bold text-[10px] uppercase tracking-wider transition-all mt-4 cursor-pointer ${
                    plan.popular
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs border border-indigo-700'
                      : 'bg-slate-800 hover:bg-slate-900 text-white'
                  }`}
                >
                  Request This Plan
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Request Form Section */}
      <section id="quote" className="py-10 px-4 max-w-3xl mx-auto">
        <div className="bg-white rounded-sm border border-slate-350 p-4 sm:p-6 shadow-sm relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600"></div>

          <AnimatePresence mode="wait">
            {!successRequest ? (
              <motion.div 
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                <div className="text-center space-y-1.5">
                  <Briefcase className="w-8 h-8 text-indigo-600 mx-auto" />
                  <h2 className="text-lg font-display font-bold text-slate-900 tracking-tight">Start Your Project Workspace</h2>
                  <p className="text-slate-500 text-xs max-w-md mx-auto">
                    Fill out our architectural planner below. We will draft your project milestones and open a direct client-to-admin communication panel.
                  </p>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-3.5">
                  
                  {/* Row 1: Name and Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-slate-700 text-[10px] font-bold uppercase tracking-wider mb-1">
                        Your Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-600 focus:outline-none rounded-sm text-xs transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 text-[10px] font-bold uppercase tracking-wider mb-1">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        type="email"
                        required
                        placeholder="e.g. rahul@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-600 focus:outline-none rounded-sm text-xs transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Row 2: WhatsApp & Company Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-slate-700 text-[10px] font-bold uppercase tracking-wider mb-1">
                        WhatsApp Contact <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. +91 9876543210"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-600 focus:outline-none rounded-sm text-xs transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 text-[10px] font-bold uppercase tracking-wider mb-1">
                        Company Name <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <input 
                        type="text"
                        placeholder="e.g. Acme Tech Solutions"
                        value={formData.companyName}
                        onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-600 focus:outline-none rounded-sm text-xs transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Description of work */}
                  <div>
                    <label className="block text-slate-700 text-[10px] font-bold uppercase tracking-wider mb-1">
                      Detailed Description of Work Details <span className="text-rose-500">*</span>
                    </label>
                    <textarea 
                      required
                      rows={4}
                      placeholder="Please outline the main features, target audience, core modules, and any integrations required."
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-600 focus:outline-none rounded-sm text-xs transition-all font-medium"
                    />
                  </div>

                  {/* Budget input with currency selector */}
                  <div>
                    <label className="block text-slate-700 text-[10px] font-bold uppercase tracking-wider mb-1">
                      Project Estimated Budget <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex rounded-sm overflow-hidden border border-slate-300">
                      <select 
                        value={formData.budgetCurrency}
                        onChange={(e) => setFormData(prev => ({ ...prev, budgetCurrency: e.target.value as 'INR' | 'USD' }))}
                        className="bg-slate-100 text-slate-800 font-bold px-3 py-1.5 focus:outline-none border-r border-slate-300 text-xs"
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                      </select>
                      <input 
                        type="number"
                        required
                        min="1"
                        placeholder="Enter budget amount"
                        value={formData.budgetAmount}
                        onChange={(e) => setFormData(prev => ({ ...prev, budgetAmount: e.target.value }))}
                        className="flex-grow px-2.5 py-1.5 bg-slate-50 focus:bg-white focus:outline-none text-xs transition-all font-semibold font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={formSubmitting}
                    id="btn-submit-request"
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white text-xs font-bold rounded-sm uppercase tracking-wider shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer border border-indigo-700"
                  >
                    {formSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting Requirements...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Project Proposal</span>
                      </>
                    )}
                  </button>

                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-2 space-y-4"
              >
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-sm flex items-center justify-center mx-auto border border-emerald-200">
                  <Check className="w-5 h-5" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-display font-extrabold text-slate-900 tracking-tight">Proposal Received!</h3>
                  <p className="text-slate-500 text-xs max-w-sm mx-auto leading-normal">
                    Your request has been successfully saved. An engineer has been allocated to draft your milestone architecture.
                  </p>
                </div>

                {/* Tracking Code Highlight Box */}
                <div className="max-w-md mx-auto bg-slate-50 p-4 rounded-sm border border-slate-300 space-y-2">
                  <div>
                    <span className="text-slate-400 text-[9px] font-bold uppercase tracking-widest font-mono block">Your Unique Tracking ID</span>
                    <strong className="text-xl font-mono text-indigo-700 tracking-wider block mt-0.5 select-all">{successRequest.id}</strong>
                  </div>
                  <div className="border-t border-slate-250 pt-2 flex justify-between text-[11px] text-slate-500 font-sans px-1">
                    <span>WhatsApp: {successRequest.whatsapp}</span>
                    <span>Budget: {successRequest.budgetCurrency === 'USD' ? '$' : '₹'}{Number(successRequest.budgetAmount).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-xs mx-auto pt-2">
                  <button
                    onClick={() => onAccessPortal(successRequest.id)}
                    className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-sm text-xs transition-all cursor-pointer"
                  >
                    Open Client Portal
                  </button>
                  <button
                    onClick={() => setSuccessRequest(null)}
                    className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-sm text-xs transition-all border border-slate-250 cursor-pointer"
                  >
                    Create Another Request
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-250 py-4 bg-white text-center text-slate-400 text-[10px]">
        <p>&copy; {new Date().getFullYear()} Bytexon Systems Inc. All rights reserved. Premium digital software architecture & development.</p>
      </footer>
    </div>
  );
}
