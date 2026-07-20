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
import OtherServices from './components/OtherServices';
import OurStacks from './components/OurStacks';
import WorkProcess from './components/WorkProcess';
import ProjectPlanner from './components/ProjectPlanner';
import ContactUs from './components/ContactUs';
import FeedbackWidget from './components/FeedbackWidget';
import BytexonLogo from './components/BytexonLogo';
import { motion, AnimatePresence } from 'motion/react';
import LaptopIntro from './components/LaptopIntro';
import { Shield, Sparkles, Layout, User, Lock, ArrowLeft, ArrowRight, ArrowUp, Activity, Briefcase, Layers, FileText, Menu, X, Terminal, Sun, Moon, Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from './context/ToastContext';

export default function App() {
 const { showToast } = useToast();
 const [showIntro, setShowIntro] = useState<boolean>(() => {
 return sessionStorage.getItem('bytexon_intro_completed') !== 'true';
 });
 const [view, setView] = useState<'client-landing' | 'client-portal' | 'admin-login' | 'admin-dashboard' | 'our-services' | 'other-services' | 'our-stacks' | 'work-process' | 'project-planner' | 'contact-us'>('client-landing');
 const [plannerTab, setPlannerTab] = useState<'create' | 'track'>('create');
 const [plannerPrefillPrice, setPlannerPrefillPrice] = useState<number | undefined>(undefined);
 const [plannerPrefillDesc, setPlannerPrefillDesc] = useState<string | undefined>(undefined);
 const [activeRequestId, setActiveRequestId] = useState<string>('');
 const [adminConfig, setAdminConfig] = useState<AdminConfig>(DEFAULT_CONFIG);
 const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
 const [showScrollTop, setShowScrollTop] = useState(false);
 const [theme, setTheme] = useState<'light' | 'dark'>(() => {
   return (localStorage.getItem('bytexon_theme') as 'light' | 'dark') || 'light';
 });

 // Apply theme class to document element
 useEffect(() => {
   if (theme === 'dark') {
     document.documentElement.classList.add('dark');
   } else {
     document.documentElement.classList.remove('dark');
   }
   localStorage.setItem('bytexon_theme', theme);
 }, [theme]);

 // Scroll listener to toggle visibility of scroll to top button
 useEffect(() => {
   const handleScroll = () => {
     if (window.scrollY > 400) {
       setShowScrollTop(true);
     } else {
       setShowScrollTop(false);
     }
   };
   window.addEventListener('scroll', handleScroll, { passive: true });
   return () => window.removeEventListener('scroll', handleScroll);
 }, []);

 const scrollToTop = () => {
   window.scrollTo({
     top: 0,
     behavior: 'smooth'
   });
 };
 
 // Admin Login Inputs
 const [loginUsername, setLoginUsername] = useState('');
 const [loginPassword, setLoginPassword] = useState('');
 const [loginError, setLoginError] = useState<string | null>(null);
 const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
 const [isAdminSubmitting, setIsAdminSubmitting] = useState(false);
 const [showLoginPassword, setShowLoginPassword] = useState(false);
 const [shouldShakeAdmin, setShouldShakeAdmin] = useState(false);

 // Rate limiter state
 const [failedAttempts, setFailedAttempts] = useState<number>(() => {
   return Number(localStorage.getItem('admin_failed_attempts') || 0);
 });
 const [lockoutUntil, setLockoutUntil] = useState<number>(() => {
   return Number(localStorage.getItem('admin_lockout_until') || 0);
 });
 const [lockoutCountdown, setLockoutCountdown] = useState<number>(0);

 // Countdown timer for rate limiting lockout
 useEffect(() => {
   if (!lockoutUntil || lockoutUntil <= Date.now()) {
     setLockoutCountdown(0);
     return;
   }

   const updateCountdown = () => {
     const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
     setLockoutCountdown(remaining);
     if (remaining === 0) {
       clearInterval(interval);
     }
   };

   updateCountdown();
   const interval = setInterval(updateCountdown, 1000);
   return () => clearInterval(interval);
 }, [lockoutUntil]);

 const isEnvCredentialsMissing = !adminConfig.customAuthActive && (!import.meta.env.VITE_ADMIN_USERNAME || !import.meta.env.VITE_ADMIN_PASSWORD);

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
  } else if (newView === 'other-services') {
  path = '/other-services';
 } else if (newView === 'our-stacks') {
 path = '/tech-stacks';
 } else if (newView === 'work-process') {
 path = '/work-process';
 } else if (newView === 'client-portal') {
 path = '/portal';
 } else if (newView === 'contact-us') {
 path = '/contact';
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

 if (lockoutCountdown > 0) {
   setLoginError(`Too many failed attempts. Locked out for ${lockoutCountdown} more seconds.`);
   return;
 }

 setLoginError(null);
 setIsAdminSubmitting(true);

 const username = loginUsername.trim();
 const password = loginPassword.trim();

 const handleLoginFailure = (customMsg?: string) => {
   const nextAttempts = failedAttempts + 1;
   setFailedAttempts(nextAttempts);
   localStorage.setItem('admin_failed_attempts', String(nextAttempts));

   setShouldShakeAdmin(true);
   setTimeout(() => setShouldShakeAdmin(false), 500);

   if (nextAttempts >= 5) {
     const unlockTime = Date.now() + 60000;
     setLockoutUntil(unlockTime);
     localStorage.setItem('admin_lockout_until', String(unlockTime));
     setFailedAttempts(0);
     localStorage.setItem('admin_failed_attempts', '0');

     setLoginError('Too many failed attempts. Access locked for 60 seconds.');
     showToast('Brute-force protection activated. Form locked for 60 seconds.', 'error', 'Security Lockout');
   } else {
     const remaining = 5 - nextAttempts;
     setLoginError(customMsg || `Invalid administrator username or password credentials. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`);
     showToast('Authentication failed. Please verify credentials.', 'error', 'Login Failed');
   }
 };

 if (username === 'admin' && password === 'admin123') {
   setIsAdminSubmitting(false);
   handleLoginFailure('Default credentials (admin/admin123) are permanently deactivated for security.');
   return;
 }

 try {
   if (!adminConfig.customAuthActive) {
   // Default config active using environment variables
   const allowedUser = import.meta.env.VITE_ADMIN_USERNAME;
   const allowedPass = import.meta.env.VITE_ADMIN_PASSWORD;
   if (allowedUser && allowedPass && username === allowedUser && password === allowedPass) {
   const hash = await sha256(`${username}:${password}`);
   const token = `auth_${hash}`;
   setIsAdminLoggedIn(true);
   localStorage.removeItem('admin_failed_attempts');
   localStorage.removeItem('admin_lockout_until');
   setFailedAttempts(0);
   setLockoutUntil(0);
   sessionStorage.setItem('admin_token', token);
   sessionStorage.setItem('admin_username', username);
   sessionStorage.setItem('admin_password', password);
   setView('admin-dashboard');
   setLoginUsername('');
   setLoginPassword('');
   showToast('Admin session established successfully!', 'success', 'Admin Signed In');
   } else {
   handleLoginFailure();
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
   localStorage.removeItem('admin_failed_attempts');
   localStorage.removeItem('admin_lockout_until');
   setFailedAttempts(0);
   setLockoutUntil(0);
   sessionStorage.setItem('admin_token', token);
   sessionStorage.setItem('admin_username', username);
   sessionStorage.setItem('admin_password', password);
   setView('admin-dashboard');
   setLoginUsername('');
   setLoginPassword('');
   showToast('Admin session established successfully!', 'success', 'Admin Signed In');
   } else {
   handleLoginFailure();
   }
   } catch (err) {
   console.error("Error verifying admin credentials:", err);
   handleLoginFailure('An error occurred during authentication. Please verify your network.');
   }
   }
 } finally {
   setIsAdminSubmitting(false);
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
 showToast('Successfully signed out of workspace.', 'info', 'Admin Logged Out');
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
  } else if (path === '/other-services' || path === '/otherservices') {
  setView('other-services');
 } else if (path === '/tech-stacks' || path === '/our-stacks' || path === '/techstacks') {
 setView('our-stacks');
 } else if (path === '/work-process' || path === '/work-process' || path === '/workprocess') {
 setView('work-process');
 } else if (path === '/portal' || path === '/client-portal') {
 setView('client-portal');
 } else if (path === '/contact' || path === '/contact-us') {
 setView('contact-us');
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100 antialiased selection:bg-indigo-500/10 selection:text-indigo-900">
      
      {/* Premium Apple-inspired Sticky Top Header */}
      {!view.startsWith('admin') && (
        <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/70 dark:bg-slate-950/80 border-b border-slate-200/40 dark:border-slate-800/80 select-none transition-all">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo */}
            <div 
              onClick={() => {
                setActiveRequestId('');
                navigateTo('client-landing');
              }}
              className="cursor-pointer flex items-center hover:opacity-85 transition-opacity"
            >
              <BytexonLogo showText={true} theme={theme} height={28} />
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8 text-[13px] font-medium text-slate-600 dark:text-slate-350">
              <button 
                onClick={() => {
                  setActiveRequestId('');
                  navigateTo('client-landing');
                }}
                className={`transition-colors hover:text-indigo-600 dark:hover:text-cyan-400 ${view === 'client-landing' ? 'text-slate-950 dark:text-white font-semibold' : ''}`}
              >
                Overview
              </button>
              <button 
                onClick={() => navigateTo('our-services')}
                className={`transition-colors hover:text-indigo-600 dark:hover:text-cyan-400 ${view === 'our-services' ? 'text-slate-950 dark:text-white font-semibold' : ''}`}
              >
                Services
              </button>
              <button 
                onClick={() => navigateTo('other-services')}
                className={`transition-colors hover:text-indigo-600 dark:hover:text-cyan-400 ${view === 'other-services' ? 'text-slate-950 dark:text-white font-semibold' : ''}`}
              >
                Other Services
              </button>
              <button 
                onClick={() => navigateTo('our-stacks')}
                className={`transition-colors hover:text-indigo-600 dark:hover:text-cyan-400 ${view === 'our-stacks' ? 'text-slate-950 dark:text-white font-semibold' : ''}`}
              >
                Tech Stacks
              </button>
              <button 
                onClick={() => navigateTo('work-process')}
                className={`transition-colors hover:text-indigo-600 dark:hover:text-cyan-400 ${view === 'work-process' ? 'text-slate-950 dark:text-white font-semibold' : ''}`}
              >
                Process
              </button>
              <button 
                onClick={() => {
                  navigateTo('project-planner', { tab: 'create', prefillPrice: undefined, prefillDesc: undefined });
                }}
                className={`transition-colors hover:text-indigo-600 dark:hover:text-cyan-400 ${view === 'project-planner' ? 'text-slate-950 dark:text-white font-semibold' : ''}`}
              >
                Planner
              </button>
              <button 
                onClick={() => navigateTo('contact-us')}
                className={`transition-colors hover:text-indigo-600 dark:hover:text-cyan-400 ${view === 'contact-us' ? 'text-slate-950 dark:text-white font-semibold' : ''}`}
              >
                Contact
              </button>
            </nav>

            {/* Header Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {view !== 'project-planner' && (
                <button
                  onClick={() => {
                    navigateTo('project-planner', { tab: 'track', prefillPrice: undefined, prefillDesc: undefined });
                  }}
                  className="text-xs font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-350 dark:hover:text-cyan-400 transition-colors"
                >
                  Track Project
                </button>
              )}
              <button
                onClick={() => {
                  navigateTo('project-planner', { tab: 'create', prefillPrice: undefined, prefillDesc: undefined });
                }}
                className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 text-white text-xs font-medium px-4 py-2 rounded-full transition-all shadow-sm hover:shadow"
              >
                Start Workspace
              </button>
              
              {/* Theme Toggle Button */}
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="text-slate-500 hover:text-indigo-600 dark:text-slate-450 dark:hover:text-cyan-400 transition-all p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                aria-label="Toggle Theme"
              >
                {theme === 'light' ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4 text-cyan-400" />
                )}
              </button>


            </div>

            {/* Mobile Menu & Theme Actions */}
            <div className="md:hidden flex items-center space-x-2">
              {/* Theme Toggle Button */}
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-all p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                aria-label="Toggle Theme"
              >
                {theme === 'light' ? (
                  <Moon className="w-4.5 h-4.5" />
                ) : (
                  <Sun className="w-4.5 h-4.5 text-cyan-400" />
                )}
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-350 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
                className="md:hidden border-t border-slate-200/50 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg overflow-hidden"
              >
                <div className="px-5 py-4 space-y-3.5 flex flex-col text-sm font-medium text-slate-600 dark:text-slate-350">
                  <button 
                    onClick={() => {
                      setActiveRequestId('');
                      navigateTo('client-landing');
                    }}
                    className={`text-left py-1 hover:text-indigo-600 dark:hover:text-cyan-400 ${view === 'client-landing' ? 'text-indigo-600 dark:text-white font-semibold' : ''}`}
                  >
                    Overview
                  </button>
                  <button 
                    onClick={() => navigateTo('our-services')}
                    className={`text-left py-1 hover:text-indigo-600 dark:hover:text-cyan-400 ${view === 'our-services' ? 'text-indigo-600 dark:text-white font-semibold' : ''}`}
                  >
                    Services
                  </button>
                  <button 
                    onClick={() => navigateTo('other-services')}
                    className={`text-left py-1 hover:text-indigo-600 dark:hover:text-cyan-400 ${view === 'other-services' ? 'text-indigo-600 dark:text-white font-semibold' : ''}`}
                  >
                    Other Services
                  </button>
                  <button 
                    onClick={() => navigateTo('our-stacks')}
                    className={`text-left py-1 hover:text-indigo-600 dark:hover:text-cyan-400 ${view === 'our-stacks' ? 'text-indigo-600 dark:text-white font-semibold' : ''}`}
                  >
                    Tech Stacks
                  </button>
                  <button 
                    onClick={() => navigateTo('work-process')}
                    className={`text-left py-1 hover:text-indigo-600 dark:hover:text-cyan-400 ${view === 'work-process' ? 'text-indigo-600 dark:text-white font-semibold' : ''}`}
                  >
                    Process
                  </button>
                  <button 
                    onClick={() => {
                      navigateTo('project-planner', { tab: 'create', prefillPrice: undefined, prefillDesc: undefined });
                    }}
                    className={`text-left py-1 hover:text-indigo-600 dark:hover:text-cyan-400 ${view === 'project-planner' ? 'text-indigo-600 dark:text-white font-semibold' : ''}`}
                  >
                    Planner
                  </button>
                  <button 
                    onClick={() => navigateTo('contact-us')}
                    className={`text-left py-1 hover:text-indigo-600 dark:hover:text-cyan-400 ${view === 'contact-us' ? 'text-indigo-600 dark:text-white font-semibold' : ''}`}
                  >
                    Contact
                  </button>
                  <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-1" />
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => {
                        navigateTo('project-planner', { tab: 'track', prefillPrice: undefined, prefillDesc: undefined });
                      }}
                      className="text-xs font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-350 dark:hover:text-cyan-400 transition-colors"
                    >
                      Track Project
                    </button>
                    <button
                      onClick={() => {
                        navigateTo('project-planner', { tab: 'create', prefillPrice: undefined, prefillDesc: undefined });
                      }}
                      className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 text-white text-xs font-medium px-4 py-2 rounded-full transition-all"
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

  {/* 1.55. OTHER SERVICES PAGE */}
  {view === 'other-services' && (
  <OtherServices 
  onBackToLanding={() => navigateTo('client-landing')}
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

 {/* 1.9. CONTACT US PAGE */}
 {view === 'contact-us' && (
 <ContactUs 
 onBackToLanding={() => navigateTo('client-landing')}
 onPlanProject={() => navigateTo('project-planner', { tab: 'create' })}
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
 <div className={`max-w-sm mx-auto my-12 bg-white border border-slate-350 p-5 rounded-md shadow-sm relative overflow-hidden ${shouldShakeAdmin ? 'animate-shake' : ''}`}>
 <div className="absolute top-0 left-0 w-full h-1 bg-slate-900"></div>

 <div className="text-center space-y-1.5 mb-5">
 <div className="w-8 h-8 bg-slate-100 text-slate-900 rounded-sm flex items-center justify-center mx-auto border border-slate-250">
 <Lock className="w-4 h-4" />
 </div>
 <h2 className="text-base font-sans font-bold text-slate-900 ">Bytexon Administrator Login</h2>
 <p className="text-[11px] text-slate-500 max-w-xs mx-auto">Authorize root environment settings using platform credentials.</p>
 </div>

 <form onSubmit={handleAdminLogin} className="space-y-3">
 {isEnvCredentialsMissing && (
 <div className="mb-4 p-2.5 bg-amber-50 border border-amber-200 rounded text-[10px] text-amber-800 leading-relaxed font-medium">
 ⚠️ <span className="font-bold">Security Action Required:</span> Default credentials have been fully removed. Please configure the <code className="font-mono bg-amber-100 px-1 rounded">VITE_ADMIN_USERNAME</code> and <code className="font-mono bg-amber-100 px-1 rounded">VITE_ADMIN_PASSWORD</code> environment variables to establish secure access.
 </div>
 )}

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
 disabled={lockoutCountdown > 0}
 placeholder={lockoutCountdown > 0 ? "Form locked out" : "Enter your username"}
 value={loginUsername}
 onChange={(e) => setLoginUsername(e.target.value)}
 className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-600 focus:outline-none rounded-sm text-xs transition-all font-medium disabled:opacity-60 disabled:cursor-not-allowed"
 />
 </div>

 <div>
 <label className="block text-slate-700 text-[10px] font-bold mb-1">Password Credentials</label>
 <div className="relative">
 <input 
 type={showLoginPassword ? 'text' : 'password'}
 required
 disabled={lockoutCountdown > 0}
 placeholder={lockoutCountdown > 0 ? "Form locked out" : "Enter your password"}
 value={loginPassword}
 onChange={(e) => setLoginPassword(e.target.value)}
 className="w-full pl-2.5 pr-8 py-1.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-600 focus:outline-none rounded-sm text-xs transition-all font-mono disabled:opacity-60 disabled:cursor-not-allowed"
 />
 <button
 type="button"
 id="btn-toggle-login-password-visibility"
 disabled={lockoutCountdown > 0}
 onClick={() => setShowLoginPassword(!showLoginPassword)}
 className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors cursor-pointer flex items-center justify-center focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
 title={showLoginPassword ? 'Hide password' : 'Show password'}
 >
 {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
 </button>
 </div>
 </div>

 <button
 type="submit"
 id="btn-submit-login"
 disabled={isAdminSubmitting || lockoutCountdown > 0 || isEnvCredentialsMissing}
 className="w-full py-2 bg-slate-900 hover:bg-indigo-700 text-white font-bold rounded-sm text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer border border-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {lockoutCountdown > 0 ? (
   <>
     <Shield className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
     <span>Locked Out ({lockoutCountdown}s)</span>
   </>
 ) : isAdminSubmitting ? (
   <>
     <Loader2 className="w-3.5 h-3.5 animate-spin" />
     <span>Authenticating...</span>
   </>
 ) : (
   <>
     <span>Sign In Securely</span>
     <ArrowRight className="w-3.5 h-3.5" />
   </>
 )}
 </button>


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

  {/* Global Footer with Copyright and All Rights Reserved */}
  {!view.startsWith('admin') && (
    <footer className="w-full bg-white border-t border-slate-200/40 select-none py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <BytexonLogo showText={true} theme="light" height={22} />
          <p className="text-[11px] text-slate-400 font-sans mt-1">
            © 2026 BYTEXON. All rights reserved.
          </p>
        </div>
        <div className="flex items-center space-x-8 text-[11px] font-medium text-slate-400">
          <button onClick={() => navigateTo('client-landing')} className="hover:text-indigo-600 transition-colors cursor-pointer">Overview</button>
          <button onClick={() => navigateTo('our-services')} className="hover:text-indigo-600 transition-colors cursor-pointer">Services</button>
          <button onClick={() => navigateTo('other-services')} className="hover:text-indigo-600 transition-colors cursor-pointer">Other Services</button>
          <button onClick={() => navigateTo('our-stacks')} className="hover:text-indigo-600 transition-colors cursor-pointer">Tech Stacks</button>
          <button onClick={() => navigateTo('work-process')} className="hover:text-indigo-600 transition-colors cursor-pointer">Process</button>
          <button 
            onClick={() => navigateTo('project-planner', { tab: 'create' })}
            className="hover:text-indigo-600 transition-colors cursor-pointer"
          >
            Planner
          </button>
          <button 
            onClick={() => navigateTo('contact-us')}
            className="hover:text-indigo-600 transition-colors cursor-pointer"
          >
            Contact
          </button>
        </div>
      </div>
    </footer>
  )}

   {/* Floating Smooth Scroll to Top Button */}
   <AnimatePresence>
     {showScrollTop && (
       <motion.button
         initial={{ opacity: 0, scale: 0.8, y: 15 }}
         animate={{ opacity: 1, scale: 1, y: 0 }}
         exit={{ opacity: 0, scale: 0.8, y: 15 }}
         transition={{ type: "spring", stiffness: 260, damping: 20 }}
         onClick={scrollToTop}
         id="scroll-to-top"
         className="fixed bottom-6 right-6 z-50 p-3.5 bg-[#132B4F] hover:bg-[#00c2e8] text-white hover:text-slate-950 rounded-full shadow-2xl cursor-pointer transition-all duration-250 flex items-center justify-center border border-slate-700/20 group outline-none focus:ring-4 focus:ring-[#00c2e8]/30"
         title="Scroll to Top"
         aria-label="Scroll to Top"
       >
         <ArrowUp className="w-5 h-5 transition-transform duration-200 group-hover:-translate-y-0.5" />
       </motion.button>
     )}
   </AnimatePresence>

   {/* Persistent Feedback Widget in Bottom-Left */}
   <FeedbackWidget />

  </div>
  );
}
