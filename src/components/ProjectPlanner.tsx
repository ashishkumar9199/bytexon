import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, doc, setDoc, query, where, getDocs } from 'firebase/firestore';
import { ProjectRequest, AdminConfig } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';
import { motion, AnimatePresence } from 'motion/react';
import Interactive3DCard from './Interactive3DCard';
import { 
 Sparkles, Check, Key, ArrowRight, ShieldCheck, 
 Database, User, Mail, MessageSquare, Copy, Terminal, Zap, ShieldAlert, Rocket
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
 useEffect(() => {
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
 useEffect(() => {
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
 
 // High-Tech Staging Animation State
 const [isLaunching, setIsLaunching] = useState(false);
 const [launchStep, setLaunchStep] = useState(0);
 const [copiedId, setCopiedId] = useState(false);

 const stagingLogs = [
 "🚀 INITIATING LAUNCH PROTOCOL FOR CLIENT BRIEF...",
 "🛰️ GENERATING SECURE COMPARTMENTALIZED ID AND ALLOCATING CLOUD SANDBOX...",
 "🔐 APPLYING HASHED SECURITY POLICIES AND FIREBASE STORAGE ACCESS RULES...",
 "💬 PROVISIONING DIRECT ENCRYPTED CHAT TUNNEL TO CHIEF DIGITAL ARCHITECT...",
 "✅ STAGING FINALIZED! PREPARING WORKSPACE DASHBOARD REDIRECT..."
 ];

 // Copy to Clipboard
 const handleCopyId = (id: string) => {
 navigator.clipboard.writeText(id);
 setCopiedId(true);
 setTimeout(() => setCopiedId(false), 2000);
 };

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

 // Start the spectacular launch sequence!
 setSuccessRequest(savedRequest);
 setIsLaunching(true);
 setLaunchStep(0);

 // Advance through steps
 const interval = setInterval(() => {
 setLaunchStep(prev => {
 if (prev < stagingLogs.length - 1) {
 return prev + 1;
 }
 return prev;
 });
 }, 700);

 setTimeout(() => {
 clearInterval(interval);
 setIsLaunching(false);
 }, 3500);

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
 
 if (!snapshot || snapshot.empty) {
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

 // 3D ROCKET LAUNCH SIMULATOR COMPONENT
 const RocketLaunchSimulation = () => {
 return (
 <div className="relative py-12 px-6 text-center space-y-8 overflow-hidden bg-slate-900 border-2 border-slate-950 rounded-3xl shadow-[0_20px_50px_rgba(99,102,241,0.25)] text-white">
 
 {/* Particle/Star stream in background */}
 <div className="absolute inset-0 pointer-events-none overflow-hidden">
 {[...Array(12)].map((_, i) => (
 <motion.div
 key={i}
 className="absolute w-1 h-3 bg-indigo-400 rounded-full"
 style={{
 top: `${Math.random() * 100}%`,
 left: `${Math.random() * 100}%`,
 }}
 animate={{
 y: [0, 200],
 opacity: [0, 1, 0]
 }}
 transition={{
 duration: 0.8 + Math.random() * 0.8,
 repeat: Infinity,
 ease: "linear",
 delay: Math.random() * 1.5
 }}
 />
 ))}
 </div>

 {/* 3D Flying SVG Rocket with real exhaust glow */}
 <div className="relative h-44 flex items-center justify-center">
 <motion.div
 animate={{ 
 y: [-10, 10, -10],
 rotate: [-2, 2, -2]
 }}
 transition={{
 duration: 2,
 repeat: Infinity,
 ease: "easeInOut"
 }}
 className="relative"
 >
 <Rocket className="w-20 h-20 text-indigo-400 filter drop-shadow-[0_0_20px_rgba(129,140,248,0.8)] rotate-45 transform" />
 
 {/* Real Particle Flame trail */}
 <motion.div
 animate={{
 scaleY: [1, 1.6, 1.2, 1.8, 1],
 opacity: [0.8, 1, 0.9, 1, 0.8]
 }}
 transition={{
 duration: 0.15,
 repeat: Infinity,
 ease: "linear"
 }}
 className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-4 h-12 origin-top bg-gradient-to-b from-orange-500 via-pink-500 to-yellow-300 rounded-b-full filter blur-[1px]"
 />
 </motion.div>
 </div>

 {/* Dynamic Console Loading State */}
 <div className="space-y-4 max-w-lg mx-auto relative z-10">
 <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-400/30 px-3.5 py-1.5 rounded-full text-indigo-300 text-[10px] font-mono font-bold animate-pulse">
 <Zap className="w-3.5 h-3.5" />
 <span>Launch Sequence Engaged</span>
 </div>
 
 <h3 className="font-sans font-bold text-xl text-white">
 Constructing Workspace
 </h3>

 {/* Staging Logs Console Output */}
 <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-left font-mono text-[10px] text-slate-400 space-y-1.5 shadow-inner">
 {stagingLogs.map((log, index) => (
 <motion.div
 key={index}
 initial={{ opacity: 0, x: -5 }}
 animate={{ 
 opacity: index <= launchStep ? 1 : 0.25,
 x: index <= launchStep ? 0 : -5,
 color: index === launchStep ? "#818cf8" : index < launchStep ? "#34d399" : "#64748b"
 }}
 transition={{ duration: 0.2 }}
 className="flex items-center space-x-2"
 >
 <span className="shrink-0">{index < launchStep ? "✓" : index === launchStep ? "▶" : "•"}</span>
 <span className="truncate">{log}</span>
 </motion.div>
 ))}
 </div>
 </div>

 </div>
 );
 };

 return (
 <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden pb-12">
 
 {/* Interactive visual background dots */}
 <div className="absolute inset-0 bg-grid-slate-100 opacity-60 pointer-events-none z-0" />

 {/* Header Banner */}
 <section className="bg-white border-b border-slate-200 py-12 px-6 sm:px-12 relative overflow-hidden z-10">
 <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
 <div className="inline-flex items-center space-x-1.5 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full text-indigo-700 text-xs font-semibold font-mono tracking-wide ">
 <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin" style={{ animationDuration: '4s' }} />
 <span>Interactive Project Board</span>
 </div>
 <h1 className="text-3xl sm:text-4xl font-sans font-bold text-slate-900 ">
 Secure Project Space & Workspace Tracking
 </h1>
 <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
 Formulate your structural requirements below to secure pricing estimates and access your exclusive, real-time lead architect chat room.
 </p>
 </div>
 </section>

 {/* Main Grid Workspace */}
 <section className="max-w-7xl w-full mx-auto px-6 py-10 sm:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 relative z-10">
 
 {/* Left Column - Instructions and Security Accents with Interactive 3D Perspective Card (Col Span: 5) */}
 <div className="lg:col-span-5 space-y-6">
 
 <Interactive3DCard glowColor="rgba(99, 102, 241, 0.25)">
 <div className="bg-white border-2 border-slate-900 rounded-2xl p-6 space-y-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] h-full">
 <span className="text-[9px] font-mono font-bold text-slate-400 block border-b border-slate-100 pb-2">
 Submission Walkthrough
 </span>

 <div className="space-y-4">
 <div className="flex gap-3">
 <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-indigo-100">
 1
 </div>
 <div>
 <h4 className="font-sans font-bold text-xs text-slate-900 ">Input parameters</h4>
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
 <h4 className="font-sans font-bold text-xs text-slate-900 ">Secure tracking id</h4>
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
 <h4 className="font-sans font-bold text-xs text-slate-900 ">Direct Architect Chat</h4>
 <p className="text-[11px] text-slate-500 leading-relaxed font-sans mt-0.5">
 Enter your workspace to chat with our architects, download invoices, review developer logs, and verify payment states via UPI.
 </p>
 </div>
 </div>
 </div>
 </div>
 </Interactive3DCard>

 <Interactive3DCard glowColor="rgba(244, 63, 94, 0.2)">
 <div className="bg-slate-900 text-slate-300 border-2 border-slate-950 rounded-2xl p-6 space-y-4 shadow-[4px_4px_0px_0px_rgba(244,63,94,1)]">
 <span className="text-[9px] font-mono font-bold text-slate-500 block border-b border-slate-800 pb-2">
 Vulnerability & Encryption Guard
 </span>
 <div className="space-y-3.5">
 <div className="flex items-start gap-2.5">
 <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
 <span className="text-[11px] leading-relaxed font-sans text-slate-300">
 All requirements, messages, and contact details are fully encrypted and securely isolated using strict Firestore security rules.
 </span>
 </div>
 <div className="flex items-start gap-2.5">
 <Key className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
 <span className="text-[11px] leading-relaxed font-sans text-slate-300">
 Only the assigned tech leads and owners of the secure workspace ID can read or update transaction parameters.
 </span>
 </div>
 </div>
 </div>
 </Interactive3DCard>
 </div>

 {/* Right Column - Planner/Tracker Card with full 3D interactive tilt alignment (Col Span: 7) */}
 <div className="lg:col-span-7">
 <Interactive3DCard glowColor="rgba(139, 92, 246, 0.25)" maxTilt={6}>
 <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
 
 {/* Tab header buttons - Modern Vibrant 3D Capsule */}
 <div className="flex bg-slate-100 p-1.5 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] mb-8">
 <button 
 onClick={() => setBentoTab('create')}
 className={`flex-1 text-center py-3 text-[10px] sm:text-xs font-bold transition-all cursor-pointer rounded-xl font-sans ${
 bentoTab === 'create' 
 ? 'bg-indigo-600 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] border-2 border-slate-900' 
 : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200 border-2 border-transparent'
 }`}
 >
 [01] START PROJECT
 </button>
 <button 
 onClick={() => setBentoTab('track')}
 className={`flex-1 text-center py-3 text-[10px] sm:text-xs font-bold transition-all cursor-pointer rounded-xl font-sans ${
 bentoTab === 'track' 
 ? 'bg-amber-400 text-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] border-2 border-slate-900' 
 : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200 border-2 border-transparent'
 }`}
 >
 [02] TRACK ACCESS
 </button>
 </div>

 <AnimatePresence mode="wait">
 {isLaunching ? (
 <motion.div
 key="launching-staging"
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.95 }}
 >
 <RocketLaunchSimulation />
 </motion.div>
 ) : bentoTab === 'create' ? (
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
 
 {/* Interactive dual-glowing 3D Input boxes */}
 <motion.div 
 whileHover={{ scale: 1.005 }}
 className="space-y-1.5 focus-within:shadow-[4px_4px_0px_0px_rgba(99,102,241,1)] transition-shadow border-2 border-slate-900 rounded-xl p-3 bg-slate-50/50"
 >
 <label className="block text-slate-500 text-[10px] font-mono font-bold flex items-center space-x-1.5">
 <User className="w-3.5 h-3.5 text-indigo-500" />
 <span>Full Name *</span>
 </label>
 <input 
 type="text"
 required
 placeholder="E.G. RAHUL SHARMA"
 value={formData.name}
 onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
 className="bg-transparent text-slate-950 w-full font-mono text-xs focus:outline-none placeholder:text-slate-350"
 />
 </motion.div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <motion.div 
 whileHover={{ scale: 1.005 }}
 className="space-y-1.5 focus-within:shadow-[4px_4px_0px_0px_rgba(99,102,241,1)] transition-shadow border-2 border-slate-900 rounded-xl p-3 bg-slate-50/50"
 >
 <label className="block text-slate-500 text-[10px] font-mono font-bold flex items-center space-x-1.5">
 <Mail className="w-3.5 h-3.5 text-indigo-500" />
 <span>Email *</span>
 </label>
 <input 
 type="email"
 required
 placeholder="EMAIL@DOMAIN.COM"
 value={formData.email}
 onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
 className="bg-transparent text-slate-950 w-full font-mono text-xs focus:outline-none placeholder:text-slate-350"
 />
 </motion.div>

 <motion.div 
 whileHover={{ scale: 1.005 }}
 className="space-y-1.5 focus-within:shadow-[4px_4px_0px_0px_rgba(99,102,241,1)] transition-shadow border-2 border-slate-900 rounded-xl p-3 bg-slate-50/50"
 >
 <label className="block text-slate-500 text-[10px] font-mono font-bold flex items-center space-x-1.5">
 <Zap className="w-3.5 h-3.5 text-indigo-500" />
 <span>WhatsApp *</span>
 </label>
 <input 
 type="text"
 required
 placeholder="+91 XXXXX XXXXX"
 value={formData.whatsapp}
 onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
 className="bg-transparent text-slate-950 w-full font-mono text-xs focus:outline-none placeholder:text-slate-350"
 />
 </motion.div>
 </div>

 <motion.div 
 whileHover={{ scale: 1.005 }}
 className="space-y-1.5 focus-within:shadow-[4px_4px_0px_0px_rgba(99,102,241,1)] transition-shadow border-2 border-slate-900 rounded-xl p-3 bg-slate-50/50"
 >
 <label className="block text-slate-500 text-[10px] font-mono font-bold flex items-center space-x-1.5">
 <Terminal className="w-3.5 h-3.5 text-indigo-500" />
 <span>Company Name (Optional)</span>
 </label>
 <input 
 type="text"
 placeholder="E.G. ACME INC"
 value={formData.companyName}
 onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
 className="bg-transparent text-slate-950 w-full font-mono text-xs focus:outline-none placeholder:text-slate-350"
 />
 </motion.div>

 <motion.div 
 whileHover={{ scale: 1.005 }}
 className="space-y-1.5 focus-within:shadow-[4px_4px_0px_0px_rgba(99,102,241,1)] transition-shadow border-2 border-slate-900 rounded-xl p-3 bg-slate-50/50"
 >
 <label className="block text-slate-500 text-[10px] font-mono font-bold flex items-center space-x-1.5">
 <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
 <span>Description of work *</span>
 </label>
 <textarea 
 required
 rows={4}
 placeholder="OUTLINE THE CORE MODULES AND TARGET INTEGRATIONS..."
 value={formData.description}
 onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
 className="bg-transparent text-slate-950 w-full font-mono text-xs focus:outline-none placeholder:text-slate-350 resize-none"
 />
 </motion.div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div className="sm:col-span-1 border-2 border-slate-900 rounded-xl p-3 bg-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
 <label className="block text-slate-500 text-[10px] font-mono font-bold mb-1">Currency</label>
 <select 
 value={formData.budgetCurrency}
 onChange={(e) => setFormData(prev => ({ ...prev, budgetCurrency: e.target.value as 'INR' | 'USD' }))}
 className="bg-white text-slate-900 w-full font-mono text-xs focus:outline-none cursor-pointer"
 >
 <option value="INR">INR (₹)</option>
 <option value="USD">USD ($)</option>
 </select>
 </div>
 <motion.div 
 whileHover={{ scale: 1.005 }}
 className="sm:col-span-2 space-y-1.5 focus-within:shadow-[4px_4px_0px_0px_rgba(99,102,241,1)] transition-shadow border-2 border-slate-900 rounded-xl p-3 bg-slate-50/50"
 >
 <label className="block text-slate-500 text-[10px] font-mono font-bold ">Estimated Budget *</label>
 <input 
 type="number"
 required
 min="1"
 placeholder="AMOUNT"
 value={formData.budgetAmount}
 onChange={(e) => setFormData(prev => ({ ...prev, budgetAmount: e.target.value }))}
 className="bg-transparent text-slate-950 w-full font-mono text-xs focus:outline-none placeholder:text-slate-350"
 />
 </motion.div>
 </div>

 <button
 type="submit"
 disabled={formSubmitting}
 className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-sans font-bold py-4 px-6 text-xs transition-all cursor-pointer disabled:bg-slate-300 border-2 border-slate-900 rounded-xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-y-0.5 active:translate-x-0.5 active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] mt-4 block text-center"
 >
 {formSubmitting ? '[ RUNNING COMPLIANCE... ]' : 'SUBMIT PROJECT PROPOSAL'}
 </button>
 </form>
 ) : (
 <motion.div 
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 className="text-center space-y-6 py-6"
 >
 {/* Dynamic Holographic Secure Badge */}
 <div className="w-20 h-20 bg-emerald-100 border-2 border-slate-900 rounded-3xl flex items-center justify-center mx-auto text-emerald-600 shadow-[4px_4px_0px_0px_rgba(16,185,129,1)] animate-bounce" style={{ animationDuration: '3s' }}>
 <Check className="w-10 h-10 stroke-[3]" />
 </div>

 <div className="space-y-2">
 <h3 className="font-sans font-bold text-xl text-slate-900 ">Proposal Secured!</h3>
 <p className="text-slate-600 text-[11px] leading-relaxed max-w-sm mx-auto">
 Your proposal has been written to the ledger. An architect has been allocated to review your goals.
 </p>
 </div>

 {/* Interactive Copyable Project Workspace Ticket */}
 <div className="bg-emerald-50/40 p-5 border-2 border-slate-900 space-y-3 rounded-2xl relative shadow-[4px_4px_0px_0px_rgba(16,185,129,0.2)]">
 <span className="text-slate-400 text-[9px] font-bold block font-mono">WORKSPACE SECURE TICKET ID</span>
 
 <div className="flex items-center justify-center space-x-2.5">
 <strong className="text-2xl font-mono text-indigo-700 font-bold select-all">{successRequest.id}</strong>
 <button
 onClick={() => handleCopyId(successRequest.id)}
 className="p-1.5 rounded-lg border border-slate-300 hover:border-slate-900 bg-white transition-colors cursor-pointer text-slate-500 hover:text-slate-900 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]"
 title="Copy ID to Clipboard"
 >
 {copiedId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
 </button>
 </div>
 {copiedId && <span className="text-[9px] font-mono text-emerald-600 font-bold block animate-pulse">Copied to Clipboard!</span>}
 </div>

 <div className="space-y-4 pt-4">
 <button
 onClick={() => onAccessPortal(successRequest.id)}
 className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-sans font-bold py-3.5 px-6 text-xs transition-all cursor-pointer border-2 border-slate-900 rounded-xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-y-0.5 active:translate-x-0.5 active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]"
 >
 OPEN CLIENT PORTAL
 </button>
 <button
 onClick={() => setSuccessRequest(null)}
 className="w-full bg-transparent text-slate-500 hover:text-slate-950 font-bold py-2 px-4 text-[10px] transition-colors cursor-pointer font-mono"
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
 <form onSubmit={handleTrackById} className="space-y-3">
 <label className="block text-slate-500 text-[10px] font-bold font-mono">Track with Project ID</label>
 <div className="flex gap-3">
 <input 
 type="text"
 required
 placeholder="E.G. BTX-FA39CD"
 value={trackId}
 onChange={(e) => setTrackId(e.target.value)}
 className="flex-1 bg-transparent border-2 border-slate-900 text-slate-900 p-3.5 font-mono text-xs focus:outline-none focus:border-indigo-600 transition-all placeholder:text-slate-300 rounded-xl shadow-[2px_2px_0px_0px_rgba(15,23,42,0.1)] focus:shadow-[4px_4px_0px_0px_rgba(99,102,241,1)]"
 />
 <button 
 type="submit"
 className="bg-amber-400 text-slate-900 font-sans font-bold px-6 py-3.5 text-xs transition-all cursor-pointer border-2 border-slate-900 rounded-xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-y-0.5 active:translate-x-0.5"
 >
 FIND
 </button>
 </div>
 </form>

 <div className="relative flex items-center justify-center py-2">
 <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-slate-200"></div></div>
 <span className="relative bg-white px-3 text-[9px] font-mono text-slate-400">OR EMAIL ADDRESS</span>
 </div>

 {/* Track by Email */}
 <form onSubmit={handleTrackByEmail} className="space-y-3">
 <label className="block text-slate-500 text-[10px] font-bold font-mono">Search Registered Email</label>
 <div className="flex gap-3">
 <input 
 type="email"
 required
 placeholder="CLIENT@EMAIL.COM"
 value={trackEmail}
 onChange={(e) => setTrackEmail(e.target.value)}
 className="flex-1 bg-transparent border-2 border-slate-900 text-slate-900 p-3.5 font-mono text-xs focus:outline-none focus:border-indigo-600 transition-all placeholder:text-slate-300 rounded-xl shadow-[2px_2px_0px_0px_rgba(15,23,42,0.1)] focus:shadow-[4px_4px_0px_0px_rgba(99,102,241,1)]"
 />
 <button 
 type="submit"
 disabled={searching}
 className="bg-slate-900 text-white font-sans font-bold px-6 py-3.5 text-xs transition-all cursor-pointer border-2 border-slate-900 rounded-xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-y-0.5 active:translate-x-0.5 shrink-0 disabled:opacity-40"
 >
 {searching ? '...' : 'SEARCH'}
 </button>
 </div>
 </form>

 {/* Results */}
 <AnimatePresence mode="wait">
 {trackError && (
 <motion.div 
 initial={{ opacity: 0 }} 
 animate={{ opacity: 1 }} 
 className="text-[11px] text-pink-600 border-2 border-slate-900 bg-pink-50 p-4 font-mono rounded-xl shadow-[4px_4px_0px_0px_rgba(219,39,119,0.15)] flex items-center space-x-2"
 >
 <ShieldAlert className="w-4 h-4" />
 <span>[ ERROR: {trackError.toUpperCase()} ]</span>
 </motion.div>
 )}

 {matchingRequests.length > 0 && (
 <motion.div 
 initial={{ opacity: 0, y: 5 }}
 animate={{ opacity: 1, y: 0 }}
 className="space-y-3 bg-slate-50 p-4 border-2 border-slate-900 max-h-56 overflow-y-auto rounded-2xl shadow-[4px_4px_0px_0px_rgba(15,23,42,0.1)]"
 >
 <p className="text-[9px] font-bold text-slate-500 font-mono">Select Workspace:</p>
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
 <span className="flex-shrink-0 px-2.5 py-1 text-[9px] font-bold border-2 border-slate-900 text-indigo-700 bg-indigo-50 rounded-lg shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]">
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
 </Interactive3DCard>
 </div>

 </section>
 </div>
 );
}
