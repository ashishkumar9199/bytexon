import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, doc, setDoc, query, where, getDocs } from 'firebase/firestore';
import { ProjectRequest, AdminConfig, ProjectFile } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';
import { motion, AnimatePresence } from 'motion/react';
import Interactive3DCard from './Interactive3DCard';
import { useToast } from '../context/ToastContext';
import { 
 Sparkles, Check, Key, ArrowRight, ShieldCheck, 
 Database, User, Mail, MessageSquare, Copy, Terminal, Zap, ShieldAlert, Rocket,
 Building2, Paperclip, UploadCloud, FileText, X
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
 const { showToast } = useToast();
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
 const [attachedFiles, setAttachedFiles] = useState<ProjectFile[]>([]);

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
 showToast('Tracking ID copied to clipboard!', 'success', 'ID Copied');
 setTimeout(() => setCopiedId(false), 2000);
 };

 const [isDragging, setIsDragging] = useState(false);

 const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault();
  setIsDragging(true);
 };

 const handleDragLeave = () => {
  setIsDragging(false);
 };

 const handleDrop = (e: React.DragEvent) => {
  e.preventDefault();
  setIsDragging(false);
  if (e.dataTransfer.files) {
   processFiles(Array.from(e.dataTransfer.files));
  }
 };

 const processFiles = (fileList: File[]) => {
  fileList.forEach(file => {
   if (file.size > 800 * 1024) {
    showToast('File size must be under 800 KB. For larger project plans, please link from Google Drive or Dropbox in the description box.', 'warning', 'File Too Large');
    return;
   }
   
   const reader = new FileReader();
   reader.onload = (event) => {
    const dataUrl = event.target?.result as string;
    if (dataUrl) {
     setAttachedFiles(prev => {
      if (prev.some(f => f.name === file.name)) {
       showToast(`File "${file.name}" is already attached.`, 'info', 'Duplicate File');
       return prev;
      }
      return [...prev, {
       name: file.name,
       type: file.type,
       size: file.size,
       dataUrl: dataUrl
      }];
     });
    }
   };
   reader.readAsDataURL(file);
  });
 };

 const handleRemoveFile = (fileName: string) => {
  setAttachedFiles(prev => prev.filter(f => f.name !== fileName));
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
 createdAt: Date.now(),
 files: attachedFiles.length > 0 ? attachedFiles : undefined
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

  setAttachedFiles([]);

 // Start the spectacular launch sequence!
 setSuccessRequest(savedRequest);
 setIsLaunching(true);
 setLaunchStep(0);
 showToast('Your project request has been launched successfully!', 'success', 'Request Created');

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
 showToast('Error submitting request. Please try again.', 'error', 'Submission Failed');
 } finally {
 setFormSubmitting(false);
 }
 };

 // Track Handlers
 const handleTrackById = (e: React.FormEvent) => {
 e.preventDefault();
 if (!trackId.trim()) return;
 onAccessPortal(trackId.trim().toUpperCase());
 showToast('Opening secure client portal tracking...', 'info', 'Portal Access');
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
 showToast('No requests found with that email address.', 'warning', 'No Results');
 } else {
 const list: ProjectRequest[] = [];
 snapshot.forEach((doc) => {
 list.push({ id: doc.id, ...doc.data() } as ProjectRequest);
 });
 list.sort((a, b) => b.createdAt - a.createdAt);
 setMatchingRequests(list);
 showToast(`Found ${list.length} project request(s) matching your email!`, 'success', 'Search Complete');
 }
 } catch (err) {
 console.error('Error tracking email:', err);
 setTrackError('An error occurred. Please try again.');
 showToast('Failed to search project requests. Please try again.', 'error', 'Error');
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
 };  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col relative overflow-hidden pb-12 transition-colors duration-300">
      
      {/* Interactive visual background dots */}
      <div className="absolute inset-0 bg-grid-slate-100 opacity-60 pointer-events-none z-0" />

      {/* Header Banner */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80 py-16 px-6 sm:px-12 relative overflow-hidden z-10 transition-colors duration-300">
        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-cyan-50/80 dark:bg-cyan-950/40 border border-cyan-100 dark:border-cyan-900/50 px-3.5 py-1.5 rounded-full text-cyan-800 dark:text-cyan-400 text-[10px] font-bold font-mono tracking-wider uppercase shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-cyan-500 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Interactive Project Board</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
            Secure Project Space & Workspace Tracking
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-sans">
            Formulate your structural requirements below to secure pricing estimates and access your exclusive, real-time lead architect chat room.
          </p>
        </div>
      </section>

      {/* Main Grid Workspace */}
      <section className="max-w-7xl w-full mx-auto px-6 py-12 sm:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 relative z-10">
        
        {/* Left Column - Walkthrough & Security Guard */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Submission Walkthrough Card */}
          <div className="p-6 bg-white/70 dark:bg-slate-900/75 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
            <span className="text-[11px] font-bold tracking-widest text-cyan-600 dark:text-cyan-400 uppercase font-mono block">
              Submission Walkthrough
            </span>

            <div className="mt-6 space-y-6">
              {[
                {
                  step: "01",
                  title: "INPUT PARAMETERS",
                  desc: "Specify your budget, currency preference, contact details, and outline the general features or backend requirements.",
                },
                {
                  step: "02",
                  title: "SECURE TRACKING ID",
                  desc: "Our system generates a unique identifier (e.g. BTX-4A9FCE) which immediately allocates secure sandbox environments in Firestore.",
                },
                {
                  step: "03",
                  title: "DIRECT ARCHITECT CHAT",
                  desc: "Enter your workspace to chat with our architects, download invoices, review developer logs, and verify payment states via UPI.",
                },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 items-start group">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-cyan-50 dark:bg-slate-800 border border-cyan-200/60 dark:border-cyan-900/40 text-cyan-700 dark:text-cyan-300 font-mono font-bold text-xs flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white transition-all duration-300">
                    {item.step}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-wider">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Box */}
          <div className="p-6 bg-slate-950 text-white rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all duration-500"></div>
            <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
              Vulnerability & Encryption Guard
            </span>
            <div className="mt-4 space-y-4 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <span className="text-cyan-400 text-base">🛡️</span>
                <p>All requirements, messages, and contact details are fully encrypted and securely isolated using strict Firestore security rules.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-cyan-400 text-base">🔑</span>
                <p>Only the assigned tech leads and owners of the secure workspace ID can read or update transaction parameters.</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column - Interactive Form Container */}
        <div className="lg:col-span-7">
          <Interactive3DCard glowColor="rgba(0, 194, 232, 0.2)" maxTilt={4}>
            <div className="bg-white/80 backdrop-blur-xl dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 p-8 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden transition-colors duration-300">
              {/* Dynamic Background Accents */}
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#0B4C8C]/5 rounded-full blur-[80px] pointer-events-none" />

              {/* Animated Toggle Tabs */}
              <div className="relative z-10 flex p-1.5 bg-slate-100 dark:bg-slate-950 rounded-xl mb-8 max-w-md mx-auto border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setBentoTab("create")}
                  className={`flex-1 py-2.5 text-xs font-bold tracking-wider rounded-lg transition-all duration-300 relative z-10 cursor-pointer ${
                    bentoTab === "create"
                      ? "text-white bg-slate-950 dark:bg-cyan-600 shadow-md"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  [01] START PROJECT
                </button>
                <button
                  type="button"
                  onClick={() => setBentoTab("track")}
                  className={`flex-1 py-2.5 text-xs font-bold tracking-wider rounded-lg transition-all duration-300 relative z-10 cursor-pointer ${
                    bentoTab === "track"
                      ? "text-white bg-slate-950 dark:bg-cyan-600 shadow-md"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  [02] TRACK ACCESS
                </button>
              </div>

              <AnimatePresence mode="wait">
                {isLaunching ? (
                  <motion.div
                    key="launching-staging"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    className="relative z-10"
                  >
                    <RocketLaunchSimulation />
                  </motion.div>
                ) : bentoTab === 'create' ? (
                  <motion.div
                    key="create-proposal"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6 relative z-10 text-left"
                  >
                    {!successRequest ? (
                      <form onSubmit={handleFormSubmit} className="space-y-8">
                        
                        {/* Clear Header for Project Planner Card */}
                        <div className="border-b border-slate-200 dark:border-slate-800/80 pb-5 mb-2 text-center sm:text-left">
                          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center justify-center sm:justify-start gap-3">
                            <span className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl text-indigo-600 dark:text-indigo-400">
                              <Rocket className="w-6 h-6 animate-pulse" />
                            </span>
                            <span>Project Planner</span>
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-sans leading-relaxed max-w-xl">
                            Outline your scope parameters below to securely initiate a dedicated developer workspace and live dialogue on our ledger.
                          </p>
                        </div>

                        {/* Section 1: Contact & Organization */}
                        <div className="bg-slate-50/50 dark:bg-slate-950/45 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-2xl space-y-6 shadow-sm">
                          <div className="flex items-center gap-3 border-b border-slate-200/65 dark:border-slate-800/80 pb-4">
                            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                              <User className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">1. Contact & Organization</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tell us who you are and where we can reach you.</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Full Name */}
                            <div className="space-y-2">
                              <label className="block text-[11px] font-bold tracking-wider text-slate-700 dark:text-slate-300 uppercase mb-2">
                                👤 Full Name *
                              </label>
                              <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-cyan-500 transition-colors duration-200">
                                  <User className="w-4 h-4" />
                                </div>
                                <input 
                                  type="text"
                                  required
                                  placeholder="E.g. Rahul Sharma"
                                  value={formData.name}
                                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                  className="w-full px-4 py-3 pl-11 bg-slate-50/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-950 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all duration-200"
                                />
                              </div>
                            </div>

                            {/* Company Name */}
                            <div className="space-y-2">
                              <label className="block text-[11px] font-bold tracking-wider text-slate-700 dark:text-slate-300 uppercase mb-2">
                                🏢 Company Name (Optional)
                              </label>
                              <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-cyan-500 transition-colors duration-200">
                                  <Building2 className="w-4 h-4" />
                                </div>
                                <input 
                                  type="text"
                                  placeholder="E.g. Acme Inc."
                                  value={formData.companyName}
                                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                                  className="w-full px-4 py-3 pl-11 bg-slate-50/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-950 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all duration-200"
                                />
                              </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                              <label className="block text-[11px] font-bold tracking-wider text-slate-700 dark:text-slate-300 uppercase mb-2">
                                ✉️ Email *
                              </label>
                              <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-cyan-500 transition-colors duration-200">
                                  <Mail className="w-4 h-4" />
                                </div>
                                <input 
                                  type="email"
                                  required
                                  placeholder="E.g. email@domain.com"
                                  value={formData.email}
                                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                  className="w-full px-4 py-3 pl-11 bg-slate-50/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-950 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all duration-200"
                                />
                              </div>
                            </div>

                            {/* WhatsApp */}
                            <div className="space-y-2">
                              <label className="block text-[11px] font-bold tracking-wider text-slate-700 dark:text-slate-300 uppercase mb-2">
                                💬 WhatsApp *
                              </label>
                              <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-cyan-500 transition-colors duration-200">
                                  <Zap className="w-4 h-4" />
                                </div>
                                <input 
                                  type="text"
                                  required
                                  placeholder="E.g. +91 XXXXX XXXXX"
                                  value={formData.whatsapp}
                                  onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                                  className="w-full px-4 py-3 pl-11 bg-slate-50/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-950 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all duration-200"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Section 2: Project Specifications */}
                        <div className="bg-slate-50/50 dark:bg-slate-950/45 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-2xl space-y-6 shadow-sm">
                          <div className="flex items-center gap-3 border-b border-slate-200/65 dark:border-slate-800/80 pb-4">
                            <div className="p-2.5 bg-cyan-50 dark:bg-slate-950/40 text-cyan-600 dark:text-cyan-400 rounded-xl">
                              <MessageSquare className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">2. Project Specifications</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Outline your budget parameters and work details.</p>
                            </div>
                          </div>

                          <div className="space-y-6">
                            {/* Description */}
                            <div className="space-y-2">
                              <label className="block text-[11px] font-bold tracking-wider text-slate-700 dark:text-slate-300 uppercase mb-2">
                                📝 Description of Work *
                              </label>
                              <div className="relative group">
                                <div className="absolute left-4 top-3.5 pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-cyan-500 transition-colors duration-200">
                                  <MessageSquare className="w-4 h-4" />
                                </div>
                                <textarea 
                                  required
                                  rows={4}
                                  placeholder="Outline core modules and integrations (e.g. admin panel, real-time chat, Firestore rules...)"
                                  value={formData.description}
                                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                  className="w-full bg-slate-50/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 rounded-xl text-slate-900 dark:text-slate-100 text-sm font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 font-sans pl-11 pr-4 py-3.5 shadow-sm focus:outline-none transition-all duration-200 resize-none leading-relaxed"
                                />
                              </div>
                            </div>

                            {/* PDF/File Attachment Panel */}
                            <div className="mt-3">
                                <div 
                                  onDragOver={handleDragOver}
                                  onDragLeave={handleDragLeave}
                                  onDrop={handleDrop}
                                  className={`border-2 border-dashed rounded-xl p-4 text-center transition-all duration-200 cursor-pointer ${
                                    isDragging 
                                      ? 'border-cyan-500 bg-cyan-50/30 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-400 scale-[1.01]' 
                                      : 'border-slate-200 dark:border-slate-800 hover:border-cyan-500 hover:bg-slate-50/50 dark:hover:bg-slate-950/30'
                                  }`}
                                  onClick={() => document.getElementById('brief-file-upload')?.click()}
                                >
                                  <input 
                                    id="brief-file-upload"
                                    type="file"
                                    multiple
                                    accept=".pdf,image/*,.doc,.docx,.txt"
                                    className="hidden"
                                    onChange={(e) => {
                                      if (e.target.files) {
                                        processFiles(Array.from(e.target.files));
                                      }
                                    }}
                                  />
                                  <div className="flex flex-col items-center justify-center gap-1.5 text-slate-500 dark:text-slate-400">
                                    <div className="p-2 bg-cyan-50 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 rounded-lg group-hover:scale-110 transition-transform duration-200">
                                      <UploadCloud className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                      Attach project briefs, wireframes or PDFs
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      Drag & drop or <span className="text-cyan-600 dark:text-cyan-400 font-medium">browse files</span> (PDF, PNG, JPG, DOCX, TXT)
                                    </p>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                                      Max size 800 KB per file. Large file? Use cloud links in text instead.
                                    </p>
                                  </div>
                                </div>

                                {/* Attached Files List */}
                                {attachedFiles.length > 0 && (
                                  <div className="mt-3 space-y-2">
                                    <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                                      <Paperclip className="w-3.5 h-3.5 animate-pulse" />
                                      <span>Attached Files ({attachedFiles.length})</span>
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {attachedFiles.map((file, idx) => (
                                        <div 
                                          key={idx} 
                                          className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                                        >
                                          <div className="flex items-center gap-2 overflow-hidden mr-2">
                                            <FileText className="w-4 h-4 text-cyan-500 shrink-0" />
                                            <div className="truncate">
                                              <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{file.name}</p>
                                              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{(file.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleRemoveFile(file.name);
                                            }}
                                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 rounded-md transition-colors"
                                            title="Remove Attachment"
                                          >
                                            <X className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                            </div>

                            {/* Budget & Currency Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                              {/* Currency Selector */}
                              <div className="space-y-2">
                                <label className="block text-[11px] font-bold tracking-wider text-slate-700 dark:text-slate-300 uppercase mb-2">
                                  💵 Currency
                                </label>
                                <div className="flex h-12 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                                  <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, budgetCurrency: 'INR' }))}
                                    className={`flex-1 text-xs font-bold font-mono rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                                      formData.budgetCurrency === 'INR'
                                        ? 'bg-slate-950 dark:bg-cyan-600 text-white shadow-sm font-extrabold'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                  >
                                    INR (₹)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, budgetCurrency: 'USD' }))}
                                    className={`flex-1 text-xs font-bold font-mono rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                                      formData.budgetCurrency === 'USD'
                                        ? 'bg-slate-950 dark:bg-cyan-600 text-white shadow-sm font-extrabold'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                  >
                                    USD ($)
                                  </button>
                                </div>
                              </div>

                              {/* Estimated Budget Input */}
                              <div className="md:col-span-2 space-y-2">
                                <label className="block text-[11px] font-bold tracking-wider text-slate-700 dark:text-slate-300 uppercase mb-2">
                                  💰 Estimated Budget *
                                </label>
                                <div className="relative group">
                                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="text-slate-500 dark:text-slate-400 font-bold font-mono text-base">
                                      {formData.budgetCurrency === 'INR' ? '₹' : '$'}
                                    </span>
                                  </div>
                                  <input 
                                    type="number"
                                    required
                                    min="1"
                                    placeholder="E.g. 50000"
                                    value={formData.budgetAmount}
                                    onChange={(e) => setFormData(prev => ({ ...prev, budgetAmount: e.target.value }))}
                                    className="w-full px-4 py-3 pl-10 bg-slate-50/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-950 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all duration-200"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Premium Sleek Brand Action Button */}
                        <motion.button
                          type="submit"
                          disabled={formSubmitting}
                          whileHover={{ scale: 1.01, boxShadow: '0 10px 30px -5px rgba(6,182,212,0.35)' }}
                          whileTap={{ scale: 0.99 }}
                          className="w-full relative mt-4 overflow-hidden rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-600 dark:from-cyan-600 dark:to-cyan-700 text-white font-mono font-bold py-4 px-6 text-xs tracking-widest uppercase transition-all duration-300 cursor-pointer disabled:from-slate-300 disabled:to-slate-400 shadow-md h-14"
                        >
                          <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
                          <span className="relative flex items-center justify-center gap-2">
                            {formSubmitting ? (
                              <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Running compliance...</span>
                              </>
                            ) : (
                              <>
                                <span>Submit Project Proposal</span>
                                <ArrowRight className="w-4 h-4 text-cyan-300" />
                              </>
                            )}
                          </span>
                        </motion.button>
                      </form>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-6 py-8"
                      >
                        {/* Dynamic Holographic Secure Badge */}
                        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-3xl flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/10 animate-bounce" style={{ animationDuration: '3.5s' }}>
                          <Check className="w-10 h-10 stroke-[2.5]" />
                        </div>

                        <div className="space-y-2">
                          <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white">Proposal Secured!</h3>
                          <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed max-w-sm mx-auto font-sans">
                            Your proposal has been written to the ledger. An architect has been allocated to review your goals.
                          </p>
                        </div>

                        {/* Interactive Copyable Project Workspace Ticket */}
                        <div className="bg-emerald-50/25 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/40 p-6 space-y-4 rounded-3xl relative shadow-xs max-w-md mx-auto font-sans">
                          <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold block font-mono tracking-widest">WORKSPACE SECURE TICKET ID</span>
                          
                          <div className="flex items-center justify-center space-x-3">
                            <strong className="text-2xl font-mono text-[#132B4F] dark:text-cyan-400 font-bold select-all tracking-wider">{successRequest.id}</strong>
                            <button
                              type="button"
                              onClick={() => handleCopyId(successRequest.id)}
                              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-white dark:bg-slate-950 transition-colors cursor-pointer text-slate-600 dark:text-slate-350 hover:text-slate-950 dark:hover:text-white shadow-xs"
                              title="Copy ID to Clipboard"
                            >
                              {copiedId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                          {copiedId && <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold block animate-pulse">Copied to Clipboard!</span>}
                        </div>

                        <div className="space-y-4 pt-6 max-w-sm mx-auto">
                          <button
                            type="button"
                            onClick={() => onAccessPortal(successRequest.id)}
                            className="w-full bg-[#132B4F] dark:bg-cyan-600 hover:bg-slate-800 dark:hover:bg-cyan-500 text-white font-mono font-bold py-4 px-6 text-xs tracking-widest uppercase transition-all cursor-pointer rounded-2xl shadow-sm"
                          >
                            Open Client Portal
                          </button>
                          <button
                            type="button"
                            onClick={() => setSuccessRequest(null)}
                            className="w-full bg-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold py-2 px-4 text-[10px] transition-colors cursor-pointer font-mono tracking-widest"
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
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-8 relative z-10 text-left"
                  >
                    {/* Clear Header for Project Tracker Card */}
                    <div className="border-b border-slate-200 dark:border-slate-800/80 pb-5 mb-2 text-center sm:text-left">
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center justify-center sm:justify-start gap-3">
                        <span className="p-2 bg-cyan-50 dark:bg-slate-950/50 rounded-2xl text-cyan-600 dark:text-cyan-400">
                          <Key className="w-6 h-6 animate-pulse" />
                        </span>
                        <span>Workspace Tracker</span>
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-sans leading-relaxed max-w-xl">
                        Access your secure, real-time client panel by searching with your unique Workspace Ticket ID or registered email.
                      </p>
                    </div>

                    {/* Track by ID */}
                    <div className="bg-slate-50/50 dark:bg-slate-950/45 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-2xl space-y-4 shadow-sm">
                      <div className="flex items-center gap-3 border-b border-slate-200/65 dark:border-slate-800/80 pb-4">
                        <div className="p-2.5 bg-cyan-50 dark:bg-slate-950/40 text-cyan-600 dark:text-cyan-400 rounded-xl">
                          <Key className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">Access by Project ID</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Use your secure BTX ticket code to access your workspace.</p>
                        </div>
                      </div>

                      <form onSubmit={handleTrackById} className="space-y-4 pt-2">
                        <div className="space-y-2">
                          <label className="block text-[11px] font-bold tracking-wider text-slate-700 dark:text-slate-300 uppercase mb-2">
                            🔑 Enter Project Workspace ID *
                          </label>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1 group">
                              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-cyan-500 transition-colors duration-200">
                                <Key className="w-4 h-4" />
                              </div>
                              <input 
                                type="text"
                                required
                                placeholder="E.g. BTX-FA39CD"
                                value={trackId}
                                onChange={(e) => setTrackId(e.target.value)}
                                className="w-full px-4 py-3 pl-11 bg-slate-50/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-950 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all duration-200 font-mono"
                              />
                            </div>
                            <button 
                              type="submit"
                              className="h-12 bg-slate-950 hover:bg-slate-900 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white font-mono font-bold px-6 text-xs tracking-widest uppercase transition-all duration-200 cursor-pointer rounded-xl shadow-md shrink-0 flex items-center justify-center min-h-[44px]"
                            >
                              Find Workspace
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>

                    <div className="relative flex items-center justify-center py-2">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800/80"></div></div>
                      <span className="relative bg-white dark:bg-slate-900 px-4 text-[10px] font-mono text-slate-600 dark:text-slate-400 font-extrabold tracking-widest uppercase transition-colors duration-300">OR REGISTERED EMAIL</span>
                    </div>

                    {/* Track by Email */}
                    <div className="bg-slate-50/50 dark:bg-slate-950/45 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-2xl space-y-4 shadow-sm">
                      <div className="flex items-center gap-3 border-b border-slate-200/65 dark:border-slate-800/80 pb-4">
                        <div className="p-2.5 bg-cyan-50 dark:bg-slate-950/40 text-cyan-600 dark:text-cyan-400 rounded-xl">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">Search Registered Email</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Lookup your account with your client email address.</p>
                        </div>
                      </div>

                      <form onSubmit={handleTrackByEmail} className="space-y-4 pt-2">
                        <div className="space-y-2">
                          <label className="block text-[11px] font-bold tracking-wider text-slate-700 dark:text-slate-300 uppercase mb-2">
                            ✉️ Enter Registered Email Address *
                          </label>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1 group">
                              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-cyan-500 transition-colors duration-200">
                                <Mail className="w-4 h-4" />
                              </div>
                              <input 
                                type="email"
                                required
                                placeholder="E.g. client@email.com"
                                value={trackEmail}
                                onChange={(e) => setTrackEmail(e.target.value)}
                                className="w-full px-4 py-3 pl-11 bg-slate-50/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-950 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all duration-200"
                              />
                            </div>
                            <button 
                              type="submit"
                              disabled={searching}
                              className="h-12 bg-slate-950 hover:bg-slate-900 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white font-mono font-bold px-6 text-xs tracking-widest uppercase transition-all duration-200 cursor-pointer rounded-xl shadow-md shrink-0 flex items-center justify-center min-h-[44px] disabled:opacity-40"
                            >
                              {searching ? 'Searching...' : 'Search Ledger'}
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>

                    {/* Results */}
                    <AnimatePresence mode="wait">
                      {trackError && (
                        <motion.div 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }} 
                          className="text-[11px] text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-900/40 bg-pink-50/50 dark:bg-pink-950/15 p-4 font-mono rounded-2xl flex items-center space-x-2.5"
                        >
                          <ShieldAlert className="w-4 h-4 text-pink-500 shrink-0" />
                          <span>[ ERROR: {trackError.toUpperCase()} ]</span>
                        </motion.div>
                      )}

                      {matchingRequests.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-2 bg-slate-50/55 dark:bg-slate-950/40 p-4 border border-slate-200 dark:border-slate-800 max-h-56 overflow-y-auto rounded-2xl"
                        >
                          <p className="text-[9px] font-bold text-slate-600 dark:text-slate-400 font-mono tracking-widest uppercase mb-1">SELECT WORKSPACE:</p>
                          {matchingRequests.map((req) => (
                            <button
                              key={req.id}
                              onClick={() => onAccessPortal(req.id)}
                              className="w-full text-left p-4 hover:bg-white dark:hover:bg-slate-900 border border-slate-200/80 dark:border-slate-850 hover:border-cyan-400 rounded-xl flex items-center justify-between text-xs transition-all duration-150 cursor-pointer shadow-xs hover:shadow-md"
                            >
                              <div className="truncate pr-3">
                                <p className="font-bold text-[#132B4F] dark:text-cyan-400 text-[12px] tracking-wider font-mono">{req.id}</p>
                                <p className="text-slate-700 dark:text-slate-350 truncate text-[11px] mt-1 uppercase font-mono font-medium">{req.description}</p>
                              </div>
                              <span className="flex-shrink-0 px-3 py-1.5 text-[9px] font-bold border border-cyan-200 dark:border-cyan-800/60 text-cyan-800 dark:text-cyan-300 bg-cyan-50/80 dark:bg-cyan-950/30 rounded-xl font-mono uppercase tracking-wider">
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