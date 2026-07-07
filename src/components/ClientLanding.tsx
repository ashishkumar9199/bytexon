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
        
        {/* Brutalist Hero Section */}
        <section className="relative overflow-hidden py-16 lg:py-24 px-6 sm:px-12 border-2 border-slate-900 rounded-3xl bg-white shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all hover:shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
          <div className="max-w-4xl mx-auto text-center space-y-8 flex flex-col items-center">
            
            {/* Centered Logo with dynamic scale on hover */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex justify-center cursor-pointer filter drop-shadow-[0_4px_12px_rgba(99,102,241,0.15)]"
            >
              <BytexonLogo showText={true} theme="light" height={64} />
            </motion.div>
            
            <div className="inline-flex items-center space-x-2 border-2 border-slate-900 bg-amber-100 px-4 py-1.5 rounded-lg text-slate-900 text-[11px] font-bold uppercase tracking-widest font-mono shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin" style={{ animationDuration: '3s' }} />
              <span>Architectural Digital Ecosystems</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-black leading-[0.95] uppercase tracking-tighter text-slate-900">
              Engineering <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-pink-500 to-amber-500 animate-gradient-text drop-shadow-[0_2px_8px_rgba(99,102,241,0.25)]">
                Digital
              </span> <br />
              Breakthroughs
            </h1>

            <p className="text-slate-700 text-sm sm:text-base leading-relaxed max-w-2xl font-sans text-center">
              Bytexon builds high-performance web products, scalable database backends, and bespoke digital ecosystems. Submit your specifications, track request progression, and chat directly with tech leads.
            </p>

            {/* Action CTAs: 3D Tactical Buttons */}
            <div className="flex flex-col sm:flex-row gap-5 w-full justify-center max-w-md pt-4">
              <button
                onClick={() => onLaunchPlanner('create')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-sans font-bold py-4 px-6 uppercase text-xs tracking-widest transition-all cursor-pointer border-2 border-slate-900 rounded-xl flex items-center justify-center space-x-2 shrink-0 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-1 hover:-translate-x-1 active:translate-y-0.5 active:translate-x-0.5 active:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] text-center"
              >
                <span>Launch Project Planner</span>
                <ChevronRight className="w-4 h-4 animate-pulse text-yellow-300" />
              </button>
              <button
                onClick={() => onLaunchPlanner('track')}
                className="bg-amber-400 text-slate-900 font-sans font-bold py-4 px-6 uppercase text-xs tracking-widest transition-all cursor-pointer border-2 border-slate-900 rounded-xl flex items-center justify-center space-x-2 shrink-0 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-1 hover:-translate-x-1 active:translate-y-0.5 active:translate-x-0.5 active:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] text-center"
              >
                <span>Track Workspace</span>
              </button>
            </div>

            {/* Quick stats with beautiful colorful 3D metric boxes */}
            <div className="pt-10 grid grid-cols-3 gap-4 sm:gap-6 border-t-2 border-slate-900 w-full max-w-2xl mt-4">
              <div className="border-2 border-slate-900 p-4 bg-indigo-50 rounded-xl shadow-[4px_4px_0px_0px_rgba(79,70,229,1)] transition-transform hover:scale-105 duration-200">
                <p className="text-2xl sm:text-3xl font-display font-black text-indigo-700">100%</p>
                <p className="text-slate-700 text-[9px] font-bold uppercase tracking-wider mt-1">UPI VERIFIED</p>
              </div>
              <div className="border-2 border-slate-900 p-4 bg-pink-50 rounded-xl shadow-[4px_4px_0px_0px_rgba(219,39,119,1)] transition-transform hover:scale-105 duration-200">
                <p className="text-2xl sm:text-3xl font-display font-black text-pink-700">&lt; 2 HR</p>
                <p className="text-slate-700 text-[9px] font-bold uppercase tracking-wider mt-1">TECH REVIEW</p>
              </div>
              <div className="border-2 border-slate-900 p-4 bg-amber-50 rounded-xl shadow-[4px_4px_0px_0px_rgba(217,119,6,1)] transition-transform hover:scale-105 duration-200">
                <p className="text-2xl sm:text-3xl font-display font-black text-amber-700">LIVE</p>
                <p className="text-slate-700 text-[9px] font-bold uppercase tracking-wider mt-1">DIRECT CHAT</p>
              </div>
            </div>
          </div>
        </section>

        {/* Capabilities Section */}
        <section className="py-20 px-4 max-w-7xl mx-auto text-center space-y-12">
          <div className="max-w-2xl mx-auto space-y-3">
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono">Our capabilities</p>
            <h2 className="text-3xl sm:text-4xl font-display font-black uppercase tracking-tight text-slate-900">
              Architected Solutions For High-Growth Ecosystems
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-mono">
              Bytexon pairs clean product engineering with high-capacity transaction pipelines to deliver production-ready software layouts.
            </p>
          </div>

          {/* 3D Cards for Capabilities */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Interactive3DCard 
              glowColor="rgba(99, 102, 241, 0.4)" 
              className="h-full cursor-pointer"
            >
              <div className="border-2 border-slate-900 p-6 bg-white text-left space-y-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(79,70,229,1)] h-full flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl border-2 border-slate-900 bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                    <Code className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-display font-black uppercase tracking-wider text-slate-900">Custom Web Architectures</h3>
                  <p className="text-slate-600 text-xs leading-relaxed font-sans">
                    Blazing-fast single page applications constructed with strict, secure code standards using React, Vite, and production-tested API patterns.
                  </p>
                </div>
                <div className="pt-4 text-xs font-mono font-bold text-indigo-600 flex items-center space-x-1.5">
                  <span>[ VIEW DETAILS ]</span>
                  <Terminal className="w-3.5 h-3.5" />
                </div>
              </div>
            </Interactive3DCard>

            <Interactive3DCard 
              glowColor="rgba(236, 72, 153, 0.4)" 
              className="h-full cursor-pointer"
            >
              <div className="border-2 border-slate-900 p-6 bg-white text-left space-y-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(219,39,119,1)] h-full flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl border-2 border-slate-900 bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-lg shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                    <Database className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-display font-black uppercase tracking-wider text-slate-900">Relational & Cloud Stores</h3>
                  <p className="text-slate-600 text-xs leading-relaxed font-sans">
                    From Firebase clusters to enterprise Postgres relational servers, we configure highly scalable transaction databases.
                  </p>
                </div>
                <div className="pt-4 text-xs font-mono font-bold text-pink-600 flex items-center space-x-1.5">
                  <span>[ DATA MODELING ]</span>
                  <Layers className="w-3.5 h-3.5" />
                </div>
              </div>
            </Interactive3DCard>

            <Interactive3DCard 
              glowColor="rgba(245, 158, 11, 0.4)" 
              className="h-full cursor-pointer"
            >
              <div className="border-2 border-slate-900 p-6 bg-white text-left space-y-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(217,119,6,1)] h-full flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl border-2 border-slate-900 bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                    <Server className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-display font-black uppercase tracking-wider text-slate-900">Bespoke System Integrations</h3>
                  <p className="text-slate-600 text-xs leading-relaxed font-sans">
                    Connecting automated CRM pipelines, secure UPI ledger networks, third-party authentication services, and custom webhook callbacks.
                  </p>
                </div>
                <div className="pt-4 text-xs font-mono font-bold text-amber-600 flex items-center space-x-1.5">
                  <span>[ API ECOSYSTEM ]</span>
                  <Laptop className="w-3.5 h-3.5" />
                </div>
              </div>
            </Interactive3DCard>
          </div>
        </section>

      </div>
    </div>
  );
}
