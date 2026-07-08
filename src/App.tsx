import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { AdminConfig } from './types';
import { getAdminConfig, updateAdminConfig, DEFAULT_CONFIG } from './lib/configHelper';
import { handleFirestoreError, OperationType } from './lib/firestoreErrorHandler';
import { sha256 } from './lib/hashHelper';
import ClientLanding from './components/ClientLanding';
import ClientPortal from './components/ClientPortal';
import AdminPortal from './components/AdminPortal';
import OurServices from './components/OurServices';
import OurStacks from './components/OurStacks';
import WorkProcess from './components/WorkProcess';
import ProjectPlanner from './components/ProjectPlanner';
import BytexonLogo from './components/BytexonLogo';
import { motion, AnimatePresence } from 'motion/react';
import LaptopIntro from './components/LaptopIntro';
import { Shield, Sparkles, Layout, User, Lock, ArrowLeft, ArrowRight, Activity, Briefcase, Layers, FileText, Menu, X, Terminal, Laptop } from 'lucide-react';

export default function App() {
 const [showIntro, setShowIntro] = useState<boolean>(() => {
 return sessionStorage.getItem('bytexon_intro_completed') !== 'true';
 });
 const [view, setView] = useState<'client-landing' | 'client-portal' | 'admin-login' | 'admin-dashboard' | 'our-services' | 'our-stacks' | 'work-process' | 'project-planner'>('client-landing');
 const [plannerTab, setPlannerTab] = useState<'create' | 'track'>('create');
 const [plannerPrefillPrice, setPlannerPrefillPrice] = useState<number | undefined>(undefined);
 const [plannerPrefillDesc, setPlannerPrefillDesc] = useState<string | undefined>(undefined);
 const [activeRequestId, setActiveRequestId] = useState<string>('');
 const [adminConfig, setAdminConfig] = useState<AdminConfig>(DEFAULT_CONFIG);
 const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
 
 // Admin Login Inputs
 const [loginUsername, setLoginUsername] = useState('');
 const [loginPassword, setLoginPassword] = useState('');
 const [loginError, setLoginError] = useState<string | null>(null);
 const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

 // Sync admin configuration in real-time
 useEffect(() => {
 // Initial fetch and setup
 getAdminConfig().then((cfg) => {
 if (cfg) {
 setAdminConfig(cfg);
 }
 }).catch((err) => {
 console.warn("Failed to load admin config during startup, fallback defaults will be used:", err);
 });

 // Establish real-time listener for changes (e.g. from the admin panel itself)
 const docRef = doc(db, 'config', 'admin_settings');
 const unsubscribe = onSnapshot(docRef, (docSnap) => {
 if (docSnap.exists()) {
 setAdminConfig({ ...DEFAULT_CONFIG, ...docSnap.data() } as AdminConfig);
 }
 }, (error) => {
 console.warn("Firestore real-time config listener is offline or unreachable (using defaults):", error.message || error);
 });

 return () => unsubscribe();
 }, []);

 // Centralized Navigation helper that handles pathname updates
 const navigateTo = (newView: typeof view, extraState?: { tab?: 'create' | 'track'; prefillPrice?: number; prefillDesc?: string }) => {
 setView(newView);
 setIsMobileMenuOpen(false);
 
 if (extraState) {
 if (extraState.tab !== undefined) setPlannerTab(extraState.tab);
 if (extraState.prefillPrice !== undefined) setPlannerPrefillPrice(extraState.prefillPrice);
 if (extraState.prefillDesc !== undefined) setPlannerPrefillDesc(extraState.prefillDesc);
 }
 
 let path = '/';
 if (newView === 'project-planner') {
 path = '/projectplanner';
 } else if (newView === 'our-services') {
 path = '/services';
 } else if (newView === 'our-stacks') {
 path = '/tech-stacks';
 } else if (newView === 'work-process') {
 path = '/work-process';
 } else if (newView === 'client-portal') {
 path = '/portal';
 } else if (newView === 'client-landing') {
 path = '/';
 }

 if (window.location.pathname !== path) {
 window.history.pushState(null, '', path);
 }
 };

 // Handle Client accessing their portal via tracking ID
 const handleAccessPortal = (id: string) => {
 setActiveRequestId(id);
 navigateTo('client-portal');
 };

 // Handle Admin configuration updates
 const handleUpdateConfig = async (updates: Partial<AdminConfig>) => {
 await updateAdminConfig(updates);
 // Local state will update via the onSnapshot listener
 };

 // Admin Login form submit
 const handleAdminLogin = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoginError(null);

 const username = loginUsername.trim();
 const password = loginPassword.trim();

 if (!adminConfig.customAuthActive) {
 // Default config active
 if (username === 'admin' && password === 'admin123') {
 const hash = await sha256(`${username}:${password}`);
 const token = `auth_${hash}`;
 setIsAdminLoggedIn(true);
 sessionStorage.setItem('admin_token', token);
 sessionStorage.setItem('admin_username', username);
 sessionStorage.setItem('admin_password', password);
 setView('admin-dashboard');
 setLoginUsername('');
 setLoginPassword('');
 } else {
 setLoginError('Invalid administrator username or password credentials.');
 }
 } else {
 // Custom config active, check auth_XXX doc in firestore
 try {
 const hash = await sha256(`${username}:${password}`);
 const token = `auth_${hash}`;
 const authDocRef = doc(db, 'config', token);
 const authDocSnap = await getDoc(authDocRef);

 if (authDocSnap.exists() && authDocSnap.data()?.authorized !== false) {
 setIsAdminLoggedIn(true);
 sessionStorage.setItem('admin_token', token);
 sessionStorage.setItem('admin_username', username);
 sessionStorage.setItem('admin_password', password);
 setView('admin-dashboard');
 setLoginUsername('');
 setLoginPassword('');
 } else {
 setLoginError('Invalid administrator username or password credentials.');
 }
 } catch (err) {
 console.error("Error verifying admin credentials:", err);
 setLoginError('An error occurred during authentication. Please verify your network.');
 }
 }
 };

 // Log Out admin
 const handleAdminLogOut = () => {
 setIsAdminLoggedIn(false);
 setView('client-landing');
 const secret = adminConfig.adminSecretPath || 'gate-abhya23';
 const expectedHash = '#/admin-' + secret;
 const expectedHashAlt = '#admin-' + secret;
 if (window.location.hash === expectedHash || window.location.hash === expectedHashAlt) {
 window.history.pushState(null, '', window.location.pathname + window.location.search);
 }
 };

 // Listen for hash/query/path changes to route to different views
 useEffect(() => {
 const handleUrlRoute = () => {
 const path = window.location.pathname;
 const hash = window.location.hash;
 const params = new URLSearchParams(window.location.search);
 const secret = adminConfig.adminSecretPath || 'gate-abhya23';
 const expectedHash = '#/admin-' + secret;
 const expectedHashAlt = '#admin-' + secret;
 const hasSecretParam = params.get('admin') === secret;
 
 if (hash === expectedHash || hash === expectedHashAlt || hasSecretParam) {
 if (isAdminLoggedIn) {
 setView('admin-dashboard');
 } else {
 setView('admin-login');
 }
 return;
 }

 // Check pathname mapping
 if (path === '/projectplanner' || path === '/project-planner' || path === '/planner') {
 setView('project-planner');
 } else if (path === '/services' || path === '/our-services') {
 setView('our-services');
 } else if (path === '/tech-stacks' || path === '/our-stacks' || path === '/techstacks') {
 setView('our-stacks');
 } else if (path === '/work-process' || path === '/work-process' || path === '/workprocess') {
 setView('work-process');
 } else if (path === '/portal' || path === '/client-portal') {
 setView('client-portal');
 } else {
 setView('client-landing');
 }
 };

 handleUrlRoute();

 window.addEventListener('popstate', handleUrlRoute);
 window.addEventListener('hashchange', handleUrlRoute);
  return () => {
    window.removeEventListener('popstate', handleUrlRoute);
    window.removeEventListener('hashchange', handleUrlRoute);
  };
  }, [isAdminLoggedIn, adminConfig]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased selection:bg-indigo-500/10 selection:text-indigo-900">
      
      {/* Premium Apple-inspired Sticky Top Header */}
      {!view.startsWith('admin') && (
        <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/70 border-b border-slate-200/40 select-none transition-all">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo */}
            <div 
              onClick={() => {
                setActiveRequestId('');
                navigateTo('client-landing');
              }}
              className="cursor-pointer flex items-center hover:opacity-85 transition-opacity"
            >
              <BytexonLogo showText={true} theme="light" height={28} />
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8 text-[13px] font-medium text-slate-600">
              <button 
                onClick={() => {
                  setActiveRequestId('');
                  navigateTo('client-landing');
                }}
                className={`transition-colors hover:text-indigo-600 ${view === 'client-landing' ? 'text-slate-950 font-semibold' : ''}`}
              >
                Overview
              </button>
              <button 
                onClick={() => navigateTo('our-services')}
                className={`transition-colors hover:text-indigo-600 ${view === 'our-services' ? 'text-slate-950 font-semibold' : ''}`}
              >
                Services
              </button>
              <button 
                onClick={() => navigateTo('our-stacks')}
                className={`transition-colors hover:text-indigo-600 ${view === 'our-stacks' ? 'text-slate-950 font-semibold' : ''}`}
              >
                Tech Stacks
              </button>
              <button 
                onClick={() => navigateTo('work-process')}
                className={`transition-colors hover:text-indigo-600 ${view === 'work-process' ? 'text-slate-950 font-semibold' : ''}`}
              >
                Process
              </button>
              <button 
                onClick={() => {
                  navigateTo('project-planner', { tab: 'create', prefillPrice: undefined, prefillDesc: undefined });
                }}
                className={`transition-colors hover:text-indigo-600 ${view === 'project-planner' ? 'text-slate-950 font-semibold' : ''}`}
              >
                Planner
              </button>
            </nav>

            {/* Header Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {view !== 'project-planner' && (
                <button
                  onClick={() => {
                    navigateTo('project-planner', { tab: 'track', prefillPrice: undefined, prefillDesc: undefined });
                  }}
                  className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
                >
                  Track Project
                </button>
              )}
              <button
                onClick={() => {
                  navigateTo('project-planner', { tab: 'create', prefillPrice: undefined, prefillDesc: undefined });
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-4 py-2 rounded-full transition-all shadow-sm hover:shadow"
              >
                Start Workspace
              </button>
              <button
                onClick={() => {
                  sessionStorage.removeItem('bytexon_intro_completed');
                  setShowIntro(true);
                }}
                className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                title="Replay 3D Intro Animation"
              >
                <Laptop className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t border-slate-200/50 bg-white/95 backdrop-blur-lg overflow-hidden"
              >
                <div className="px-5 py-4 space-y-3.5 flex flex-col text-sm font-medium text-slate-600">
                  <button 
                    onClick={() => {
                      setActiveRequestId('');
                      navigateTo('client-landing');
                    }}
                    className={`text-left py-1 hover:text-indigo-600 ${view === 'client-landing' ? 'text-indigo-600 font-semibold' : ''}`}
                  >
                    Overview
                  </button>
                  <button 
                    onClick={() => navigateTo('our-services')}
                    className={`text-left py-1 hover:text-indigo-600 ${view === 'our-services' ? 'text-indigo-600 font-semibold' : ''}`}
                  >
                    Services
                  </button>
                  <button 
                    onClick={() => navigateTo('our-stacks')}
                    className={`text-left py-1 hover:text-indigo-600 ${view === 'our-stacks' ? 'text-indigo-600 font-semibold' : ''}`}
                  >
                    Tech Stacks
                  </button>
                  <button 
                    onClick={() => navigateTo('work-process')}
                    className={`text-left py-1 hover:text-indigo-600 ${view === 'work-process' ? 'text-indigo-600 font-semibold' : ''}`}
                  >
                    Process
                  </button>
                  <button 
                    onClick={() => {
                      navigateTo('project-planner', { tab: 'create', prefillPrice: undefined, prefillDesc: undefined });
                    }}
                    className={`text-left py-1 hover:text-indigo-600 ${view === 'project-planner' ? 'text-indigo-600 font-semibold' : ''}`}
                  >
                    Planner
                  </button>
                  <div className="h-[1px] bg-slate-100 my-1" />
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => {
                        navigateTo('project-planner', { tab: 'track', prefillPrice: undefined, prefillDesc: undefined });
                      }}
                      className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
                    >
                      Track Project
                    </button>
                    <button
                      onClick={() => {
                        navigateTo('project-planner', { tab: 'create', prefillPrice: undefined, prefillDesc: undefined });
                      }}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-4 py-2 rounded-full transition-all"
                    >
                      Start Workspace
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>
      )}

      {/* Main View Transition Frame */}
      <div className="flex-1 flex flex-col min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={view + activeRequestId}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="h-full"
          >
 
 {/* 1. PUBLIC LANDING PAGE */}
 {view === 'client-landing' && (
 <ClientLanding 
 onAccessPortal={handleAccessPortal} 
 adminConfig={adminConfig}
 onLaunchPlanner={(tab, price, desc) => {
 navigateTo('project-planner', { tab: tab || 'create', prefillPrice: price, prefillDesc: desc });
 }}
 />
 )}

 {/* 1.5. OUR SERVICES PAGE */}
 {view === 'our-services' && (
 <OurServices 
 onPlanProject={() => {
 navigateTo('project-planner', { tab: 'create', prefillPrice: undefined, prefillDesc: undefined });
 }}
 />
 )}

 {/* 1.6. OUR STACKS PAGE */}
 {view === 'our-stacks' && (
 <OurStacks 
 onPlanProject={() => {
 navigateTo('project-planner', { tab: 'create', prefillPrice: undefined, prefillDesc: undefined });
 }}
 />
 )}

 {/* 1.7. WORK PROCESS PAGE */}
 {view === 'work-process' && (
 <WorkProcess 
 onPlanProject={() => {
 navigateTo('project-planner', { tab: 'create', prefillPrice: undefined, prefillDesc: undefined });
 }}
 />
 )}

 {/* 1.8. PROJECT PLANNER PAGE */}
 {view === 'project-planner' && (
 <ProjectPlanner 
 onAccessPortal={handleAccessPortal}
 adminConfig={adminConfig}
 initialTab={plannerTab}
 initialBudgetAmount={plannerPrefillPrice}
 initialDescription={plannerPrefillDesc}
 />
 )}

 {/* 2. CLIENT TRACKING PORTAL */}
 {view === 'client-portal' && (
 <ClientPortal 
 requestId={activeRequestId} 
 onBack={() => {
 setView('client-landing');
 setActiveRequestId('');
 }}
 adminConfig={adminConfig}
 />
 )}

 {/* 3. ADMIN PORTAL LOGIN */}
 {view === 'admin-login' && (
 <div className="max-w-sm mx-auto my-12 bg-white border border-slate-350 p-5 rounded-md shadow-sm relative overflow-hidden">
 <div className="absolute top-0 left-0 w-full h-1 bg-slate-900"></div>

 <div className="text-center space-y-1.5 mb-5">
 <div className="w-8 h-8 bg-slate-100 text-slate-900 rounded-sm flex items-center justify-center mx-auto border border-slate-250">
 <Lock className="w-4 h-4" />
 </div>
 <h2 className="text-base font-sans font-bold text-slate-900 ">Bytexon Administrator Login</h2>
 <p className="text-[11px] text-slate-500 max-w-xs mx-auto">Authorize root environment settings using platform credentials.</p>
 </div>

 <form onSubmit={handleAdminLogin} className="space-y-3">
 {loginError && (
 <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 p-2 rounded-sm">
 {loginError}
 </p>
 )}

 <div>
 <label className="block text-slate-700 text-[10px] font-bold mb-1">Username Credentials</label>
 <input 
 type="text"
 required
 placeholder="e.g. admin"
 value={loginUsername}
 onChange={(e) => setLoginUsername(e.target.value)}
 className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-600 focus:outline-none rounded-sm text-xs transition-all font-medium"
 />
 </div>

 <div>
 <label className="block text-slate-700 text-[10px] font-bold mb-1">Password Credentials</label>
 <input 
 type="password"
 required
 placeholder="e.g. admin123"
 value={loginPassword}
 onChange={(e) => setLoginPassword(e.target.value)}
 className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-600 focus:outline-none rounded-sm text-xs transition-all font-mono"
 />
 </div>

 <button
 type="submit"
 id="btn-submit-login"
 className="w-full py-2 bg-slate-900 hover:bg-indigo-700 text-white font-bold rounded-sm text-xs transition-all flex items-center justify-center space-x-1 cursor-pointer border border-slate-800"
 >
 <span>Sign In Securely</span>
 <ArrowRight className="w-3.5 h-3.5" />
 </button>

 {!adminConfig.customAuthActive && (
 <div className="pt-2 border-t border-slate-200 flex flex-col space-y-1 text-[9px] text-indigo-600 font-semibold leading-relaxed bg-indigo-50/40 p-2 rounded-sm border border-indigo-100">
 <p>⚠️ Default configuration is active:</p>
 <div className="flex justify-between font-mono font-bold text-slate-700">
 <span>User: admin</span>
 <span>Pass: admin123</span>
 </div>
 <p className="text-[8px] text-slate-400 font-normal">Change this in "System & Billing Config" settings after signing in.</p>
 </div>
 )}
 </form>
 </div>
 )}

 {/* 4. ADMIN PORTAL WORKSPACE */}
 {view === 'admin-dashboard' && (
 <AdminPortal 
 adminConfig={adminConfig}
 onUpdateConfig={handleUpdateConfig}
 onLogOut={handleAdminLogOut}
 />
 )}

 </motion.div>
 </AnimatePresence>
 </div>
 </div>
 );
}
