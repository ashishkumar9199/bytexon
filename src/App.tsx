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
import ContactUs from './components/ContactUs';
import ProjectPlanner from './components/ProjectPlanner';
import FeedbackWidget from './components/FeedbackWidget';
import BiytexonLogo from './components/BiytexonLogo';
import { motion, AnimatePresence } from 'motion/react';
import { verifyTotp } from './lib/totpHelper';
import { Shield, Sparkles, Layout, User, Lock, ArrowLeft, ArrowRight, ArrowUp, Activity, Briefcase, Layers, FileText, Menu, X, Terminal, Sun, Moon, Loader2, Eye, EyeOff, Key, QrCode, Palette } from 'lucide-react';
import { useToast } from './context/ToastContext';

export const PALETTES = {
  corporate: {
    name: 'Classic Slate',
    light: {
      '--color-bg-primary': '#FAF9F6',
      '--color-bg-secondary': '#FFFFFF',
      '--color-text-primary': '#111827',
      '--color-text-secondary': '#4B5563',
      '--color-border': 'rgba(15, 23, 42, 0.06)',
      '--color-brand-accent': '#009BB8',
      '--color-brand-gradient': 'linear-gradient(135deg, #0F172A 0%, #009BB8 100%)',
    },
    dark: {
      '--color-bg-primary': '#06080F',
      '--color-bg-secondary': '#0F131E',
      '--color-text-primary': '#F8FAFC',
      '--color-text-secondary': '#94A3B8',
      '--color-border': 'rgba(255, 255, 255, 0.06)',
      '--color-brand-accent': '#00C2E8',
      '--color-brand-gradient': 'linear-gradient(135deg, #020617 0%, #00C2E8 100%)',
    }
  },
  alabaster: {
    name: 'Basalt Warmth',
    light: {
      '--color-bg-primary': '#FAF7F2',
      '--color-bg-secondary': '#FFFFFF',
      '--color-text-primary': '#2D2721',
      '--color-text-secondary': '#5E544A',
      '--color-border': 'rgba(45, 39, 33, 0.06)',
      '--color-brand-accent': '#8C6A4C',
      '--color-brand-gradient': 'linear-gradient(135deg, #2D2721 0%, #8C6A4C 100%)',
    },
    dark: {
      '--color-bg-primary': '#0C0B0A',
      '--color-bg-secondary': '#1A1816',
      '--color-text-primary': '#FAF6F0',
      '--color-text-secondary': '#A3968A',
      '--color-border': 'rgba(255, 255, 255, 0.06)',
      '--color-brand-accent': '#D9A05B',
      '--color-brand-gradient': 'linear-gradient(135deg, #0C0B0A 0%, #D9A05B 100%)',
    }
  },
  emerald: {
    name: 'Emerald Sage',
    light: {
      '--color-bg-primary': '#F2F6F3',
      '--color-bg-secondary': '#FFFFFF',
      '--color-text-primary': '#111A14',
      '--color-text-secondary': '#4A5B4F',
      '--color-border': 'rgba(17, 26, 20, 0.06)',
      '--color-brand-accent': '#0E6856',
      '--color-brand-gradient': 'linear-gradient(135deg, #111A14 0%, #0E6856 100%)',
    },
    dark: {
      '--color-bg-primary': '#050A07',
      '--color-bg-secondary': '#0D1611',
      '--color-text-primary': '#ECF2EE',
      '--color-text-secondary': '#819688',
      '--color-border': 'rgba(255, 255, 255, 0.06)',
      '--color-brand-accent': '#10B981',
      '--color-brand-gradient': 'linear-gradient(135deg, #050A07 0%, #10B981 100%)',
    }
  },
  violet: {
    name: 'Amethyst Velvet',
    light: {
      '--color-bg-primary': '#F6F4FA',
      '--color-bg-secondary': '#FFFFFF',
      '--color-text-primary': '#1A1521',
      '--color-text-secondary': '#544D5E',
      '--color-border': 'rgba(26, 21, 33, 0.06)',
      '--color-brand-accent': '#6C38DE',
      '--color-brand-gradient': 'linear-gradient(135deg, #1A1521 0%, #6C38DE 100%)',
    },
    dark: {
      '--color-bg-primary': '#07050A',
      '--color-bg-secondary': '#110D18',
      '--color-text-primary': '#F5F2FA',
      '--color-text-secondary': '#938B9E',
      '--color-border': 'rgba(255, 255, 255, 0.06)',
      '--color-brand-accent': '#A78BFA',
      '--color-brand-gradient': 'linear-gradient(135deg, #07050A 0%, #A78BFA 100%)',
    }
  },
  terracotta: {
    name: 'Rose Sand',
    light: {
      '--color-bg-primary': '#FAF5F5',
      '--color-bg-secondary': '#FFFFFF',
      '--color-text-primary': '#2D1B1B',
      '--color-text-secondary': '#614E4E',
      '--color-border': 'rgba(45, 27, 27, 0.06)',
      '--color-brand-accent': '#C24141',
      '--color-brand-gradient': 'linear-gradient(135deg, #2D1B1B 0%, #C24141 100%)',
    },
    dark: {
      '--color-bg-primary': '#0C0606',
      '--color-bg-secondary': '#180F0F',
      '--color-text-primary': '#FBF3F3',
      '--color-text-secondary': '#A38B8B',
      '--color-border': 'rgba(255, 255, 255, 0.06)',
      '--color-brand-accent': '#F87171',
      '--color-brand-gradient': 'linear-gradient(135deg, #0C0606 0%, #F87171 100%)',
    }
  }
};

export default function App() {
 const { showToast } = useToast();
 const [palette, setPalette] = useState<'corporate' | 'alabaster' | 'emerald' | 'violet' | 'terracotta'>(() => {
   return (localStorage.getItem('biytexon_palette') as any) || 'corporate';
 });
 const [showPaletteMenu, setShowPaletteMenu] = useState(false);
 const [showIntro, setShowIntro] = useState<boolean>(() => {
 return sessionStorage.getItem('biytexon_intro_completed') !== 'true';
 });
 const [view, setView] = useState<'client-landing' | 'client-portal' | 'admin-login' | 'admin-dashboard' | 'our-services' | 'other-services' | 'our-stacks' | 'work-process' | 'contact-us' | 'project-planner'>('client-landing');
 const [plannerTab, setPlannerTab] = useState<'create' | 'track'>('create');
 const [plannerPrefillPrice, setPlannerPrefillPrice] = useState<number | undefined>(undefined);
 const [plannerPrefillDesc, setPlannerPrefillDesc] = useState<string | undefined>(undefined);
 const [activeRequestId, setActiveRequestId] = useState<string>('');
 const [adminConfig, setAdminConfig] = useState<AdminConfig>(DEFAULT_CONFIG);
 const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
 const [showScrollTop, setShowScrollTop] = useState(false);
 const [theme, setTheme] = useState<'light' | 'dark'>(() => {
   return (localStorage.getItem('biytexon_theme') as 'light' | 'dark') || 'light';
 });

 // Apply theme class to document element
 useEffect(() => {
   if (theme === 'dark') {
     document.documentElement.classList.add('dark');
   } else {
     document.documentElement.classList.remove('dark');
   }
   localStorage.setItem('biytexon_theme', theme);
    const activePalette = PALETTES[palette] || PALETTES.corporate;
    const colors = activePalette[theme];
    Object.entries(colors).forEach(([key, val]) => {
      document.documentElement.style.setProperty(key, String(val));
    });
    localStorage.setItem('biytexon_palette', palette);
 }, [theme, palette]);

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

 // Session Expiration States
 const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);
 const [showSessionWarning, setShowSessionWarning] = useState<boolean>(false);
 const [warningCountdown, setWarningCountdown] = useState<number>(120);

 // TOTP Challenge login state
 const [showTotpChallenge, setShowTotpChallenge] = useState(false);
 const [pendingAuth, setPendingAuth] = useState<{ token: string; username: string; password: string; secret: string } | null>(null);
 const [totpInputCode, setTotpInputCode] = useState('');

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

 // Monitor Admin Logged-In state & set up timers
 useEffect(() => {
   if (isAdminLoggedIn) {
     // 15 Minutes session lifetime
     setSessionExpiresAt(Date.now() + 15 * 60 * 1000);
     setShowSessionWarning(false);
   } else {
     setSessionExpiresAt(null);
     setShowSessionWarning(false);
   }
 }, [isAdminLoggedIn]);

 // Check session expiration on interval
 useEffect(() => {
   if (!isAdminLoggedIn || !sessionExpiresAt) return;

   const interval = setInterval(() => {
     const now = Date.now();
     const timeRemainingMs = sessionExpiresAt - now;

     if (timeRemainingMs <= 2 * 60 * 1000) {
       setShowSessionWarning(true);
       const secs = Math.max(0, Math.round(timeRemainingMs / 1000));
       setWarningCountdown(secs);
     } else {
       setShowSessionWarning(false);
     }

     if (timeRemainingMs <= 0) {
       handleAdminLogOut();
       setShowSessionWarning(false);
       setSessionExpiresAt(null);
       showToast('Your session has expired due to inactivity. You have been securely logged out.', 'warning', 'Session Expired');
     }
   }, 1000);

   return () => clearInterval(interval);
 }, [isAdminLoggedIn, sessionExpiresAt]);

 // Keep session extended silently on user keyboard/mouse activity (up to 15m)
 useEffect(() => {
   if (!isAdminLoggedIn || showSessionWarning) return;

   const handleActivity = () => {
     const now = Date.now();
     if (sessionExpiresAt && (sessionExpiresAt - now) < 14 * 60 * 1000) {
       setSessionExpiresAt(now + 15 * 60 * 1000);
     }
   };

   window.addEventListener('mousemove', handleActivity);
   window.addEventListener('keypress', handleActivity);
   window.addEventListener('click', handleActivity);
   window.addEventListener('scroll', handleActivity);

   return () => {
     window.removeEventListener('mousemove', handleActivity);
     window.removeEventListener('keypress', handleActivity);
     window.removeEventListener('click', handleActivity);
     window.removeEventListener('scroll', handleActivity);
   };
 }, [isAdminLoggedIn, sessionExpiresAt, showSessionWarning]);

 const handleExtendSession = () => {
   setSessionExpiresAt(Date.now() + 15 * 60 * 1000);
   setShowSessionWarning(false);
   showToast('Your administrator session has been successfully extended for 15 minutes.', 'success', 'Session Extended');
 };

 const formatTime = (seconds: number) => {
   const m = Math.floor(seconds / 60);
   const s = seconds % 60;
   return `${m}:${s < 10 ? '0' : ''}${s}`;
 };

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

 // Shared handler for failed administration authentication attempts
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

 // Verify TOTP 2FA challenge code
 const handleVerifyTotpChallenge = async (e: React.FormEvent) => {
   e.preventDefault();
   if (!pendingAuth) return;

   if (lockoutCountdown > 0) {
     setLoginError(`Too many failed attempts. Locked out for ${lockoutCountdown} more seconds.`);
     return;
   }

   setIsAdminSubmitting(true);
   setLoginError(null);

   try {
     const cleanCode = totpInputCode.trim().replace(/\s/g, '');
     
     // Structure check & length limit to prevent long-input CPU hogging
     if (cleanCode.length > 10) {
       setTotpInputCode('');
       handleLoginFailure('MFA Error: Invalid code structure.');
       return;
     }

     // Replay Attack protection: check and record tokens within validity steps
     const usedTotpCodesKey = `used_totp_codes_${pendingAuth.token}`;
     const usedCodesStr = sessionStorage.getItem(usedTotpCodesKey) || '[]';
     let usedCodes: { code: string; timestamp: number }[] = [];
     try {
       usedCodes = JSON.parse(usedCodesStr);
     } catch (err) {
       usedCodes = [];
     }
     
     const now = Date.now();
     const validUsedCodes = usedCodes.filter(item => (now - item.timestamp) < 90000);
     
     if (validUsedCodes.some(item => item.code === cleanCode)) {
       setTotpInputCode('');
       handleLoginFailure('MFA Error: Login Replay Attack Detected. Each verification code can only be used once.');
       return;
     }

     const isValid = await verifyTotp(pendingAuth.secret, totpInputCode);
     if (isValid) {
       // Mark this token as consumed in current active period
       validUsedCodes.push({ code: cleanCode, timestamp: now });
       sessionStorage.setItem(usedTotpCodesKey, JSON.stringify(validUsedCodes));

       setIsAdminLoggedIn(true);
       localStorage.removeItem('admin_failed_attempts');
       localStorage.removeItem('admin_lockout_until');
       setFailedAttempts(0);
       setLockoutUntil(0);
       sessionStorage.setItem('admin_token', pendingAuth.token);
       sessionStorage.setItem('admin_username', pendingAuth.username);
       sessionStorage.setItem('admin_password', pendingAuth.password);
       setView('admin-dashboard');

       setLoginUsername('');
       setLoginPassword('');
       setTotpInputCode('');
       setShowTotpChallenge(false);
       setPendingAuth(null);
       showToast('Two-Factor authentication passed. Welcome to admin workspace!', 'success', 'Admin Signed In');
     } else {
       setTotpInputCode('');
       handleLoginFailure('Incorrect 6-digit verification code. Please check your authenticator.');
     }
   } catch (err) {
     console.error("Error verifying TOTP challenge:", err);
     handleLoginFailure('An error occurred during multi-factor validation.');
   } finally {
     setIsAdminSubmitting(false);
   }
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

 // Secure input length restrictions to mitigate CPU exhaustion / Long Password DoS
 if (username.length > 64) {
   setIsAdminSubmitting(false);
   setLoginError('Security violation: Username exceeds maximum allowed length of 64 characters.');
   showToast('Input length violation.', 'error', 'Security Block');
   return;
 }

 if (password.length > 128) {
   setIsAdminSubmitting(false);
   setLoginError('Security violation: Password exceeds maximum allowed length of 128 characters.');
   showToast('Password length restricted to prevent CPU exhaustion DoS.', 'error', 'Security Block');
   return;
 }

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

   // Check if TOTP is enabled for default credentials too (stored in its private doc)
   const docRef = doc(db, 'config', token);
   const docSnap = await getDoc(docRef);
   if (docSnap.exists() && docSnap.data()?.totpEnabled) {
     setPendingAuth({
       token,
       username,
       password,
       secret: docSnap.data().totpSecret || ''
     });
     setShowTotpChallenge(true);
     showToast('Two-Factor Authentication is required for this administrator account.', 'info', 'MFA Required');
     return;
   }

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
   if (authDocSnap.data()?.totpEnabled) {
     setPendingAuth({
       token,
       username,
       password,
       secret: authDocSnap.data().totpSecret || ''
     });
     setShowTotpChallenge(true);
     showToast('Two-Factor Authentication is required for this administrator account.', 'info', 'MFA Required');
     return;
   }

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
        <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/70 dark:bg-slate-950/80 border-b border-slate-200/40 dark:border-slate-800/80 select-none transition-all rounded-none">
          <div className="w-full px-4 sm:px-8 lg:px-12 h-16 flex items-center justify-between rounded-none">
            {/* Logo */}
            <div 
              onClick={() => {
                setActiveRequestId('');
                navigateTo('client-landing');
              }}
              className="cursor-pointer flex items-center hover:opacity-85 transition-opacity"
            >
              <BiytexonLogo showText={true} theme={theme} height={28} />
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
                onClick={() => navigateTo('contact-us')}
                className={`transition-colors hover:text-indigo-600 dark:hover:text-cyan-400 ${view === 'contact-us' ? 'text-slate-950 dark:text-white font-semibold' : ''}`}
              >
                Contact
              </button>
            </nav>

            {/* Header Actions */}
            <div className="hidden md:flex items-center space-x-4">
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

              {/* Theme Customizer Popover */}
              <div className="relative">
                <button
                  onClick={() => setShowPaletteMenu(!showPaletteMenu)}
                  className="text-slate-500 hover:text-indigo-600 dark:text-slate-450 dark:hover:text-cyan-400 transition-all p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-center"
                  title="Customize Colors & Themes"
                  aria-label="Customize Colors"
                >
                  <Palette className="w-4 h-4" />
                </button>
                
                <AnimatePresence>
                  {showPaletteMenu && (
                    <>
                      {/* Backdrop to close */}
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowPaletteMenu(false)}
                      />
                      
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl z-50 p-4 space-y-3"
                      >
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider font-mono">
                            Select Website Theme
                          </h4>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed font-sans">
                            Instant real-time palette rendering
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-1.5">
                          {Object.entries(PALETTES).map(([key, item]) => {
                            const isSelected = palette === key;
                            const previewColors = item[theme];
                            return (
                              <button
                                key={key}
                                onClick={() => {
                                  setPalette(key);
                                  setShowPaletteMenu(false);
                                  showToast('Applied ' + item.name + ' theme!', 'success', 'Theme Updated');
                                }}
                                className={'w-full flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer text-left border ' + (
                                  isSelected 
                                    ? 'bg-slate-50 dark:bg-slate-850/60 border-slate-350 dark:border-slate-700 font-semibold' 
                                    : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-850/30'
                                )}
                              >
                                <span className="text-xs text-slate-800 dark:text-slate-200">
                                  {item.name}
                                </span>
                                <div className="flex items-center space-x-1.5">
                                  <span 
                                    className="w-3 h-3 rounded-full border border-black/10 dark:border-white/10" 
                                    style={{ backgroundColor: previewColors['--color-bg-primary'] }} 
                                  />
                                  <span 
                                    className="w-3 h-3 rounded-full border border-black/10 dark:border-white/10" 
                                    style={{ backgroundColor: previewColors['--color-brand-accent'] }} 
                                  />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile Menu & Theme Actions */}
            <div className="md:hidden flex items-center space-x-2">
              {/* Theme Toggle Button */}
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="text-slate-500 hover:text-indigo-600 dark:text-slate-450 dark:hover:text-cyan-400 transition-all p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                aria-label="Toggle Theme"
              >
                {theme === 'light' ? (
                  <Moon className="w-4.5 h-4.5" />
                ) : (
                  <Sun className="w-4.5 h-4.5 text-cyan-400" />
                )}
              </button>

              {/* Mobile Theme Customizer */}
              <div className="relative">
                <button
                  onClick={() => setShowPaletteMenu(!showPaletteMenu)}
                  className="text-slate-500 hover:text-indigo-600 dark:text-slate-450 dark:hover:text-cyan-400 transition-all p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-center"
                  title="Customize Colors & Themes"
                  aria-label="Customize Colors"
                >
                  <Palette className="w-4.5 h-4.5" />
                </button>
                
                <AnimatePresence>
                  {showPaletteMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowPaletteMenu(false)}
                      />
                      
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl z-50 p-3 space-y-2.5"
                      >
                        <div className="space-y-0.5 px-1">
                          <h4 className="text-[10px] font-bold text-slate-800 dark:text-white uppercase tracking-wider font-mono">
                            Website Theme
                          </h4>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-1">
                          {Object.entries(PALETTES).map(([key, item]) => {
                            const isSelected = palette === key;
                            const previewColors = item[theme];
                            return (
                              <button
                                key={key}
                                onClick={() => {
                                  setPalette(key as any);
                                  setShowPaletteMenu(false);
                                  showToast('Applied ' + item.name + ' theme!', 'success', 'Theme Updated');
                                }}
                                className={'w-full flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer text-left border ' + (
                                  isSelected ? 'bg-slate-50 dark:bg-slate-850/60 border-slate-300 dark:border-slate-700 font-semibold' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-850/30'
                                )}
                              >
                                <span className="text-[11px] text-slate-800 dark:text-slate-200">
                                  {item.name}
                                </span>
                                <div className="flex items-center space-x-1">
                                  <span 
                                    className="w-2.5 h-2.5 rounded-full border border-black/10 dark:border-white/10" 
                                    style={{ backgroundColor: previewColors['--color-bg-primary'] }} 
                                  />
                                  <span 
                                    className="w-2.5 h-2.5 rounded-full border border-black/10 dark:border-white/10" 
                                    style={{ backgroundColor: previewColors['--color-brand-accent'] }} 
                                  />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

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
                    onClick={() => navigateTo('contact-us')}
                    className={`text-left py-1 hover:text-indigo-600 dark:hover:text-cyan-400 ${view === 'contact-us' ? 'text-indigo-600 dark:text-white font-semibold' : ''}`}
                  >
                    Contact
                  </button>

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
 onLaunchPlanner={(tab) => {
 navigateTo('project-planner', { tab: tab || 'create' });
 }}
 />
 )}

 {/* 1.5. OUR SERVICES PAGE */}
 {view === 'our-services' && (
 <OurServices 
 onPlanProject={() => {
 navigateTo('project-planner', { tab: 'create' });
 }}
 />
 )}

  {/* 1.55. OTHER SERVICES PAGE */}
  {view === 'other-services' && (
  <OtherServices 
  onBackToLanding={() => navigateTo('client-landing')}
  onPlanProject={() => {
  navigateTo('project-planner', { tab: 'create' });
  }}
  />
  )}

 {/* 1.6. OUR STACKS PAGE */}
 {view === 'our-stacks' && (
 <OurStacks 
 onPlanProject={() => {
 navigateTo('project-planner', { tab: 'create' });
 }}
 />
 )}

 {/* 1.7. WORK PROCESS PAGE */}
 {view === 'work-process' && (
 <WorkProcess 
 onPlanProject={() => {
 navigateTo('project-planner', { tab: 'create' });
 }}
 />
 )}

 {/* 1.8. INTERACTIVE PROJECT PLANNER & TRACKER */}
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

 {showTotpChallenge ? (
   <>
     <div className="text-center space-y-1.5 mb-5">
       <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-sm flex items-center justify-center mx-auto border border-indigo-150 animate-pulse">
         <Key className="w-4 h-4" />
       </div>
       <h2 className="text-base font-sans font-bold text-slate-900">2FA Verification Required</h2>
       <p className="text-[11px] text-slate-500 max-w-xs mx-auto">Please enter the 6-digit verification code from your authenticator app to authorize this session.</p>
     </div>

     <form onSubmit={handleVerifyTotpChallenge} className="space-y-4">
       {loginError && (
         <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 p-2 rounded-sm">
           {loginError}
         </p>
       )}

       <div>
         <label className="block text-slate-700 text-[10px] font-bold mb-1.5 text-center font-mono">6-DIGIT AUTHENTICATOR CODE</label>
         <input 
           type="text"
           required
           autoFocus
           maxLength={6}
           disabled={lockoutCountdown > 0}
           placeholder={lockoutCountdown > 0 ? "LOCKED" : "000000"}
           value={totpInputCode}
           onChange={(e) => setTotpInputCode(e.target.value.replace(/\s/g, '').replace(/[^0-9]/g, ''))}
           className="w-full text-center px-3 py-2 bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-600 focus:outline-none rounded-sm text-lg tracking-[0.25em] transition-all font-mono font-bold disabled:opacity-60 disabled:cursor-not-allowed"
         />
       </div>

       <button
         type="submit"
         id="btn-submit-totp-challenge"
         disabled={isAdminSubmitting || lockoutCountdown > 0}
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
             <span>Verifying Code...</span>
           </>
         ) : (
           <>
             <span>Verify & Continue</span>
             <ArrowRight className="w-3.5 h-3.5" />
           </>
         )}
       </button>

       <button
         type="button"
         onClick={() => {
           setShowTotpChallenge(false);
           setPendingAuth(null);
           setTotpInputCode('');
           setLoginError(null);
         }}
         className="w-full text-center text-[10px] text-slate-500 hover:text-indigo-600 transition-colors font-semibold py-1 focus:outline-none"
       >
         Cancel and return to login
       </button>
     </form>
   </>
 ) : (
   <>
     <div className="text-center space-y-1.5 mb-5">
     <div className="w-8 h-8 bg-slate-100 text-slate-900 rounded-sm flex items-center justify-center mx-auto border border-slate-250">
     <Lock className="w-4 h-4" />
     </div>
     <h2 className="text-base font-sans font-bold text-slate-900 ">Biytexon Administrator Login</h2>
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
   </>
 )}
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
    <footer className="w-full bg-white border-t border-slate-200/40 select-none py-12 mt-auto rounded-none">
      <div className="w-full px-4 sm:px-8 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6 rounded-none">
        <div className="flex flex-col items-center md:items-start gap-2">
          <BiytexonLogo showText={true} theme="light" height={22} />
          <p className="text-[11px] text-slate-400 font-sans mt-1">
            © 2026 BIYTEXON. All rights reserved.
          </p>
        </div>
        <div className="flex items-center space-x-8 text-[11px] font-medium text-slate-400">
          <button onClick={() => navigateTo('client-landing')} className="hover:text-indigo-600 transition-colors cursor-pointer">Overview</button>
          <button onClick={() => navigateTo('our-services')} className="hover:text-indigo-600 transition-colors cursor-pointer">Services</button>
          <button onClick={() => navigateTo('other-services')} className="hover:text-indigo-600 transition-colors cursor-pointer">Other Services</button>
          <button onClick={() => navigateTo('our-stacks')} className="hover:text-indigo-600 transition-colors cursor-pointer">Tech Stacks</button>
          <button onClick={() => navigateTo('work-process')} className="hover:text-indigo-600 transition-colors cursor-pointer">Process</button>

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

   {/* Admin Session Expiration Warning Modal */}
   <AnimatePresence>
     {showSessionWarning && (
       <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
         <motion.div
           initial={{ opacity: 0, scale: 0.95, y: 15 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           exit={{ opacity: 0, scale: 0.95, y: 15 }}
           transition={{ type: "spring", stiffness: 350, damping: 30 }}
           className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden font-mono"
           id="session-expiry-warning-modal"
         >
           {/* Header with decorative warning color line */}
           <div className="bg-amber-500 h-1.5 w-full animate-pulse" />
           
           <div className="p-6 space-y-4">
             <div className="flex items-start space-x-4">
               <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
                 <Shield className="w-6 h-6 animate-pulse" />
               </div>
               <div className="flex-1 space-y-1">
                 <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                   Session Expiring Soon
                 </h3>
                 <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                   For your security, inactive administrator sessions are automatically logged out. Extend your session now to continue working without losing unsaved changes.
                 </p>
               </div>
             </div>

             {/* Countdown Tracker */}
             <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-800/80 rounded-xl p-4 flex items-center justify-between">
               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                 AUTO-LOGOUT IN
               </span>
               <div className="flex items-center space-x-2 font-mono text-lg font-black text-amber-500 dark:text-amber-400">
                 <span className="bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                   {formatTime(warningCountdown)}
                 </span>
               </div>
             </div>

             {/* Action Buttons */}
             <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 pt-2">
               <button
                 onClick={handleExtendSession}
                 id="btn-extend-session"
                 className="flex-1 py-2.5 bg-slate-900 hover:bg-indigo-600 dark:bg-white dark:hover:bg-indigo-600 dark:hover:text-white text-white dark:text-slate-900 font-bold text-xs rounded-xl transition-all cursor-pointer border border-transparent shadow-sm hover:shadow-indigo-500/10 text-center"
               >
                 EXTEND SESSION
               </button>
               <button
                 onClick={handleAdminLogOut}
                 id="btn-force-logout"
                 className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 hover:border-rose-500/40 text-slate-400 dark:text-slate-500 hover:text-rose-500 transition-all font-bold text-xs rounded-xl cursor-pointer text-center"
               >
                 LOG OUT
               </button>
             </div>
           </div>
         </motion.div>
       </div>
     )}
   </AnimatePresence>

   {/* Persistent Feedback Widget in Bottom-Left */}
   <FeedbackWidget />

  </div>
  );
}
