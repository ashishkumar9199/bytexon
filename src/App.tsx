import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { AdminConfig } from './types';
import { getAdminConfig, updateAdminConfig, DEFAULT_CONFIG } from './lib/configHelper';
import { handleFirestoreError, OperationType } from './lib/firestoreErrorHandler';
import ClientLanding from './components/ClientLanding';
import ClientPortal from './components/ClientPortal';
import AdminPortal from './components/AdminPortal';
import OurServices from './components/OurServices';
import OurStacks from './components/OurStacks';
import WorkProcess from './components/WorkProcess';
import ProjectPlanner from './components/ProjectPlanner';
import BytexonLogo from './components/BytexonLogo';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sparkles, Layout, User, Lock, ArrowLeft, ArrowRight, Activity, Briefcase, Layers, FileText } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'client-landing' | 'client-portal' | 'admin-login' | 'admin-dashboard' | 'our-services' | 'our-stacks' | 'work-process' | 'project-planner'>('client-landing');
  const [plannerTab, setPlannerTab] = useState<'create' | 'track'>('create');
  const [plannerPrefillPrice, setPlannerPrefillPrice] = useState<number | undefined>(undefined);
  const [plannerPrefillDesc, setPlannerPrefillDesc] = useState<string | undefined>(undefined);
  const [activeRequestId, setActiveRequestId] = useState<string>('');
  const [adminConfig, setAdminConfig] = useState<AdminConfig>(DEFAULT_CONFIG);
  
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

  // Handle Client accessing their portal via tracking ID
  const handleAccessPortal = (id: string) => {
    setActiveRequestId(id);
    setView('client-portal');
  };

  // Handle Admin configuration updates
  const handleUpdateConfig = async (updates: Partial<AdminConfig>) => {
    await updateAdminConfig(updates);
    // Local state will update via the onSnapshot listener
  };

  // Admin Login form submit
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const matchUsername = adminConfig.adminUsername.trim();
    const matchPassword = adminConfig.adminPassword.trim();

    if (loginUsername.trim() === matchUsername && loginPassword.trim() === matchPassword) {
      setIsAdminLoggedIn(true);
      setView('admin-dashboard');
      setLoginUsername('');
      setLoginPassword('');
    } else {
      setLoginError('Invalid administrator username or password credentials.');
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

  // Listen for hash/query/path changes to route to admin login or dashboard
  useEffect(() => {
    const handleUrlRoute = () => {
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
      }
    };

    handleUrlRoute();

    window.addEventListener('popstate', handleUrlRoute);
    window.addEventListener('hashchange', handleUrlRoute);
    return () => {
      window.removeEventListener('popstate', handleUrlRoute);
      window.removeEventListener('hashchange', handleUrlRoute);
    };
  }, [isAdminLoggedIn, adminConfig.adminSecretPath]);

  // Keep URL updated when view changes
  useEffect(() => {
    const secret = adminConfig.adminSecretPath || 'gate-abhya23';
    const expectedHash = '#/admin-' + secret;
    const expectedHashAlt = '#admin-' + secret;

    if (view === 'admin-login' || view === 'admin-dashboard') {
      if (window.location.hash !== expectedHash && window.location.hash !== expectedHashAlt && window.location.search !== `?admin=${secret}`) {
        window.history.pushState(null, '', expectedHash);
      }
    } else if (view === 'client-landing') {
      if (window.location.hash === expectedHash || window.location.hash === expectedHashAlt) {
        window.history.pushState(null, '', window.location.pathname + window.location.search);
      }
    }
  }, [view, adminConfig.adminSecretPath]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900 antialiased">
      
      {/* Mobile Top Header - Only on public pages on mobile screens */}
      {!view.startsWith('admin') && (
        <header className="md:hidden border-b border-slate-200 bg-white sticky top-0 z-40 select-none flex flex-col">
          {/* Top Bar: Logo */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-white">
            <div 
              onClick={() => {
                setView('client-landing');
                setActiveRequestId('');
              }}
              className="cursor-pointer flex items-center"
            >
              <BytexonLogo theme="light" height={24} />
            </div>
            
            <span className="text-[8px] font-mono bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold px-2 py-0.5 rounded uppercase">
              V 2.06
            </span>
          </div>

          {/* Sub Navigation Bar: Scrollable Menu */}
          <nav className="flex items-center space-x-6 px-5 py-2.5 overflow-x-auto scrollbar-none text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-slate-50/55">
            <button 
              onClick={() => {
                setView('client-landing');
                setActiveRequestId('');
              }}
              className={`shrink-0 transition-colors cursor-pointer ${view === 'client-landing' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-0.5' : 'hover:text-indigo-600'}`}
            >
              Home Portal
            </button>
            <button 
              onClick={() => {
                setPlannerTab('create');
                setPlannerPrefillPrice(undefined);
                setPlannerPrefillDesc(undefined);
                setView('project-planner');
              }}
              className={`shrink-0 transition-colors cursor-pointer ${view === 'project-planner' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-0.5' : 'hover:text-indigo-600'}`}
            >
              Planner
            </button>
            <button 
              onClick={() => setView('our-services')}
              className={`shrink-0 transition-colors cursor-pointer ${view === 'our-services' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-0.5' : 'hover:text-indigo-600'}`}
            >
              Services
            </button>
            <button 
              onClick={() => setView('our-stacks')}
              className={`shrink-0 transition-colors cursor-pointer ${view === 'our-stacks' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-0.5' : 'hover:text-indigo-600'}`}
            >
              Tech Stacks
            </button>
            <button 
              onClick={() => setView('work-process')}
              className={`shrink-0 transition-colors cursor-pointer ${view === 'work-process' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-0.5' : 'hover:text-indigo-600'}`}
            >
              Work Process
            </button>
          </nav>
        </header>
      )}

      {/* Left Navigation Bar (Desktop Aside) - Only on public/client pages */}
      {!view.startsWith('admin') && (
        <aside className="hidden md:flex w-[240px] border-r border-slate-200 flex-col justify-between p-6 shrink-0 min-h-screen sticky top-0 bg-white select-none">
          <div className="space-y-8">
            {/* Logo */}
            <div 
              onClick={() => {
                setView('client-landing');
                setActiveRequestId('');
              }}
              className="cursor-pointer flex items-center justify-start border-b border-slate-100 pb-5"
            >
              <BytexonLogo showText={true} theme="light" height={34} />
            </div>

            {/* Menu Links */}
            <div className="space-y-1.5">
              <div className="text-[9px] font-mono font-bold tracking-widest text-slate-400 uppercase pl-3 mb-2">
                Main Menu
              </div>
              
              <button 
                onClick={() => {
                  setView('client-landing');
                  setActiveRequestId('');
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  view === 'client-landing' 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                }`}
              >
                <Layout className="w-4 h-4" />
                <span>Home Portal</span>
              </button>

              <button 
                onClick={() => {
                  setPlannerTab('create');
                  setPlannerPrefillPrice(undefined);
                  setPlannerPrefillDesc(undefined);
                  setView('project-planner');
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  view === 'project-planner' 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Project Planner</span>
              </button>

              <button 
                onClick={() => setView('our-services')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  view === 'our-services' 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Our Services</span>
              </button>

              <button 
                onClick={() => setView('our-stacks')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  view === 'our-stacks' 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Our Tech Stacks</span>
              </button>

              <button 
                onClick={() => setView('work-process')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  view === 'work-process' 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Work Process</span>
              </button>
            </div>

            {/* Quick Actions / Shortcut Anchor Section */}
            {view === 'client-landing' && (
              <div className="space-y-1.5 pt-4 border-t border-slate-100">
                <div className="text-[9px] font-mono font-bold tracking-widest text-slate-400 uppercase pl-3 mb-2">
                  Jump To Section
                </div>
                
                <button 
                  onClick={() => {
                    setPlannerTab('create');
                    setPlannerPrefillPrice(undefined);
                    setPlannerPrefillDesc(undefined);
                    setView('project-planner');
                  }} 
                  className="w-full text-left flex items-center space-x-3 px-3 py-2 text-[11px] font-mono font-bold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  <span className="text-slate-300">#</span>
                  <span>Project Planner</span>
                </button>

              </div>
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="border-t border-slate-100 pt-5 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pl-1">
              <span>BYTEXON SYSTEM</span>
              <span>V 2.06</span>
            </div>
          </div>
        </aside>
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
                  setPlannerTab(tab || 'create');
                  setPlannerPrefillPrice(price);
                  setPlannerPrefillDesc(desc);
                  setView('project-planner');
                }}
              />
            )}

            {/* 1.5. OUR SERVICES PAGE */}
            {view === 'our-services' && (
              <OurServices 
                onPlanProject={() => {
                  setPlannerTab('create');
                  setPlannerPrefillPrice(undefined);
                  setPlannerPrefillDesc(undefined);
                  setView('project-planner');
                }}
              />
            )}

            {/* 1.6. OUR STACKS PAGE */}
            {view === 'our-stacks' && (
              <OurStacks 
                onPlanProject={() => {
                  setPlannerTab('create');
                  setPlannerPrefillPrice(undefined);
                  setPlannerPrefillDesc(undefined);
                  setView('project-planner');
                }}
              />
            )}

            {/* 1.7. WORK PROCESS PAGE */}
            {view === 'work-process' && (
              <WorkProcess 
                onPlanProject={() => {
                  setPlannerTab('create');
                  setPlannerPrefillPrice(undefined);
                  setPlannerPrefillDesc(undefined);
                  setView('project-planner');
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
                  <h2 className="text-base font-display font-extrabold text-slate-900 tracking-tight">Bytexon Administrator Login</h2>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">Authorize root environment settings using platform credentials.</p>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-3">
                  {loginError && (
                    <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 p-2 rounded-sm">
                      {loginError}
                    </p>
                  )}

                  <div>
                    <label className="block text-slate-700 text-[10px] font-bold uppercase tracking-wider mb-1">Username Credentials</label>
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
                    <label className="block text-slate-700 text-[10px] font-bold uppercase tracking-wider mb-1">Password Credentials</label>
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
                    className="w-full py-2 bg-slate-900 hover:bg-indigo-700 text-white font-bold rounded-sm text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-1 cursor-pointer border border-slate-800"
                  >
                    <span>Sign In Securely</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {adminConfig.adminUsername === 'admin' && adminConfig.adminPassword === 'admin123' && (
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
