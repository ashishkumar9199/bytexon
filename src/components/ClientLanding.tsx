import React from 'react';
import { AdminConfig } from '../types';
import { motion } from 'motion/react';
import BytexonLogo from './BytexonLogo';
import Interactive3DCard from './Interactive3DCard';
import { 
 Sparkles, ChevronRight,
 Code, Server, Database, Cloud, Brain, Laptop, Terminal, Layers
} from 'lucide-react';

interface ClientLandingProps {
 onAccessPortal: (id: string) => void;
 adminConfig: AdminConfig;
 onLaunchPlanner: (tab?: 'create' | 'track', prefillPrice?: number, prefillDesc?: string) => void;
}

export default function ClientLanding({ onAccessPortal, adminConfig, onLaunchPlanner }: ClientLandingProps) {
 return (
 <div className="bg-slate-50 min-h-screen text-slate-900 selection:bg-indigo-600 selection:text-white pb-16 overflow-x-hidden">
 
 {/* 3D FLOATING ACCENTS BACKGROUND LAYER */}
 <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
 {/* Floating gradient circles */}
 <div className="absolute top-20 left-[10%] w-72 h-72 bg-indigo-300/30 rounded-full blur-3xl animate-float-1" />
 <div className="absolute top-80 right-[15%] w-96 h-96 bg-pink-300/25 rounded-full blur-3xl animate-float-2" />
 <div className="absolute bottom-40 left-[20%] w-80 h-80 bg-amber-200/20 rounded-full blur-3xl animate-pulse-glow" />
 
 {/* Decorative 3D grid lines in background */}
 <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,#000_70%,transparent_100%)] opacity-40" />
 </div>

 <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
 
 {/* Liquid Glass Hero Section */}
 <section className="relative overflow-hidden py-16 lg:py-24 px-6 sm:px-12 border border-white/40 rounded-3xl bg-white/40 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] transition-all">
 <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/10 opacity-50 rounded-3xl pointer-events-none" />
 
 <div className="max-w-4xl mx-auto text-center space-y-8 flex flex-col items-center relative z-10">
 
 {/* Centered Logo with dynamic scale on hover */}
 <motion.div 
 whileHover={{ scale: 1.05 }}
 className="flex justify-center cursor-pointer filter drop-shadow-[0_4px_12px_rgba(99,102,241,0.15)]"
 >
 <BytexonLogo showText={true} theme="light" height={64} />
 </motion.div>
 
 <div className="inline-flex items-center space-x-2 border border-white/60 bg-white/50 backdrop-blur-md px-4 py-1.5 rounded-full text-slate-800 text-[11px] font-medium tracking-wide shadow-sm">
 <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
 <span>Architectural Digital Ecosystems</span>
 </div>

 <h1 className="text-4xl sm:text-6xl lg:text-7xl font-sans font-bold leading-[1.1] text-slate-800">
 Engineering <br />
 <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient-text">
 Digital
 </span> <br />
 Breakthroughs
 </h1>

 <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl font-sans text-center">
 Bytexon builds high-performance web products, scalable database backends, and bespoke digital ecosystems. Submit your specifications, track request progression, and chat directly with tech leads.
 </p>

 {/* Action CTAs: Glassy Buttons */}
 <div className="flex flex-col sm:flex-row gap-5 w-full justify-center max-w-md pt-4">
 <button
 onClick={() => onLaunchPlanner('create')}
 className="bg-indigo-600/90 backdrop-blur-md text-white font-sans font-medium py-3.5 px-6 text-sm tracking-wide transition-all cursor-pointer border border-indigo-400/50 rounded-2xl flex items-center justify-center space-x-2 shrink-0 shadow-[0_4px_16px_rgba(79,70,229,0.3)] hover:bg-indigo-500 hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 text-center"
 >
 <span>Launch Project Planner</span>
 <ChevronRight className="w-4 h-4 text-indigo-100" />
 </button>
 <button
 onClick={() => onLaunchPlanner('track')}
 className="bg-white/60 backdrop-blur-md text-slate-800 font-sans font-medium py-3.5 px-6 text-sm tracking-wide transition-all cursor-pointer border border-white/80 rounded-2xl flex items-center justify-center space-x-2 shrink-0 shadow-sm hover:bg-white/80 hover:shadow-md hover:-translate-y-0.5 text-center"
 >
 <span>Track Workspace</span>
 </button>
 </div>

 {/* Quick stats with beautiful glassy boxes */}
 <div className="pt-10 grid grid-cols-3 gap-4 sm:gap-6 border-t border-slate-200/50 w-full max-w-2xl mt-4">
 <div className="border border-white/60 p-4 bg-white/40 backdrop-blur-md rounded-2xl shadow-sm transition-transform hover:scale-105 duration-300">
 <p className="text-2xl sm:text-3xl font-sans font-bold text-indigo-600">100%</p>
 <p className="text-slate-600 text-[10px] font-medium tracking-wide mt-1">UPI VERIFIED</p>
 </div>
 <div className="border border-white/60 p-4 bg-white/40 backdrop-blur-md rounded-2xl shadow-sm transition-transform hover:scale-105 duration-300">
 <p className="text-2xl sm:text-3xl font-sans font-bold text-pink-600">&lt; 2 HR</p>
 <p className="text-slate-600 text-[10px] font-medium tracking-wide mt-1">TECH REVIEW</p>
 </div>
 <div className="border border-white/60 p-4 bg-white/40 backdrop-blur-md rounded-2xl shadow-sm transition-transform hover:scale-105 duration-300">
 <p className="text-2xl sm:text-3xl font-sans font-bold text-amber-500">LIVE</p>
 <p className="text-slate-600 text-[10px] font-medium tracking-wide mt-1">DIRECT CHAT</p>
 </div>
 </div>
 </div>
 </section>

 {/* Capabilities Section */}
 <section className="py-20 px-4 max-w-7xl mx-auto text-center space-y-12">
 <div className="max-w-2xl mx-auto space-y-3">
 <p className="text-[10px] font-bold text-indigo-500 font-mono">Our capabilities</p>
 <h2 className="text-3xl sm:text-4xl font-sans font-bold text-slate-800">
 Architected Solutions For High-Growth Ecosystems
 </h2>
 <p className="text-slate-600 text-sm leading-relaxed font-sans">
 Bytexon pairs clean product engineering with high-capacity transaction pipelines to deliver production-ready software layouts.
 </p>
 </div>

 {/* Liquid Glass Cards for Capabilities */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
 <Interactive3DCard 
 glowColor="rgba(99, 102, 241, 0.4)" 
 className="h-full cursor-pointer"
 >
 <div className="border border-white/60 p-6 bg-white/40 backdrop-blur-xl text-left space-y-4 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] h-full flex flex-col justify-between transition-all hover:bg-white/50">
 <div className="space-y-4">
 <div className="w-12 h-12 rounded-2xl border border-indigo-200/50 bg-indigo-50/80 text-indigo-600 flex items-center justify-center shadow-sm">
 <Code className="w-5 h-5" />
 </div>
 <h3 className="text-base font-sans font-bold text-slate-800">Custom Web Architectures</h3>
 <p className="text-slate-600 text-sm leading-relaxed font-sans">
 Blazing-fast single page applications constructed with strict, secure code standards using React, Vite, and production-tested API patterns.
 </p>
 </div>
 <div className="pt-4 text-xs font-medium text-indigo-500 flex items-center space-x-1.5">
 <span>View Details</span>
 <ChevronRight className="w-3.5 h-3.5" />
 </div>
 </div>
 </Interactive3DCard>

 <Interactive3DCard 
 glowColor="rgba(236, 72, 153, 0.4)" 
 className="h-full cursor-pointer"
 >
 <div className="border border-white/60 p-6 bg-white/40 backdrop-blur-xl text-left space-y-4 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] h-full flex flex-col justify-between transition-all hover:bg-white/50">
 <div className="space-y-4">
 <div className="w-12 h-12 rounded-2xl border border-pink-200/50 bg-pink-50/80 text-pink-600 flex items-center justify-center shadow-sm">
 <Database className="w-5 h-5" />
 </div>
 <h3 className="text-base font-sans font-bold text-slate-800">Relational & Cloud Stores</h3>
 <p className="text-slate-600 text-sm leading-relaxed font-sans">
 From Firebase clusters to enterprise Postgres relational servers, we configure highly scalable transaction databases.
 </p>
 </div>
 <div className="pt-4 text-xs font-medium text-pink-500 flex items-center space-x-1.5">
 <span>Data Modeling</span>
 <ChevronRight className="w-3.5 h-3.5" />
 </div>
 </div>
 </Interactive3DCard>

 <Interactive3DCard 
 glowColor="rgba(245, 158, 11, 0.4)" 
 className="h-full cursor-pointer"
 >
 <div className="border border-white/60 p-6 bg-white/40 backdrop-blur-xl text-left space-y-4 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] h-full flex flex-col justify-between transition-all hover:bg-white/50">
 <div className="space-y-4">
 <div className="w-12 h-12 rounded-2xl border border-amber-200/50 bg-amber-50/80 text-amber-600 flex items-center justify-center shadow-sm">
 <Server className="w-5 h-5" />
 </div>
 <h3 className="text-base font-sans font-bold text-slate-800">Bespoke System Integrations</h3>
 <p className="text-slate-600 text-sm leading-relaxed font-sans">
 Connecting automated CRM pipelines, secure UPI ledger networks, third-party authentication services, and custom webhook callbacks.
 </p>
 </div>
 <div className="pt-4 text-xs font-medium text-amber-500 flex items-center space-x-1.5">
 <span>API Ecosystem</span>
 <ChevronRight className="w-3.5 h-3.5" />
 </div>
 </div>
 </Interactive3DCard>
 </div>
 </section>

 </div>
 </div>
 );
}
