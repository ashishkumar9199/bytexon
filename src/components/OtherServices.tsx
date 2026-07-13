import React from 'react';
import { motion } from 'motion/react';
import { 
  Activity, ArrowUpRight, ShieldCheck, Heart, 
  ExternalLink, Sparkles, ArrowLeft, Globe, Zap, Cpu
} from 'lucide-react';

interface OtherServicesProps {
  onBackToLanding: () => void;
  onPlanProject: () => void;
}

export default function OtherServices({ onBackToLanding, onPlanProject }: OtherServicesProps) {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-16 sm:py-24 relative overflow-hidden select-none">
      {/* Dynamic Background Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-12">
          <button 
            onClick={onBackToLanding}
            className="group flex items-center space-x-2 text-xs font-mono font-bold text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-cyan-450 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 transform group-hover:-translate-x-1 transition-transform" />
            <span>[ RETURN TO OVERVIEW ]</span>
          </button>
        </div>

        {/* Section Header */}
        <div className="max-w-3xl mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 px-3 py-1 rounded-full text-indigo-600 dark:text-cyan-450 text-[10px] font-bold tracking-widest uppercase font-mono shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-cyan-450 animate-pulse" />
            <span>VENTURES & SPECIALTY SERVICES</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-sans font-medium tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Specialized Solutions & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 font-bold">
              Sister Ecosystems
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl font-sans">
            Beyond corporate digital architecture, we actively incubate, build, and deploy groundbreaking consumer and industry-specific software ecosystems. Explore our premier partner applications.
          </p>
        </div>

        {/* Highlight Flagship Venture: MEDIFICATE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
          
          {/* Visual Showcase Card */}
          <div className="lg:col-span-7">
            <motion.div 
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[32px] p-6 sm:p-10 shadow-xl shadow-slate-100/40 dark:shadow-none relative overflow-hidden group"
            >
              {/* Premium Background Grid */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] opacity-35" />
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="relative z-10 space-y-8">
                {/* Venture Logo & Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-450 shadow-sm">
                      <Activity className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <div>
                      <h3 className="font-sans font-bold text-xl text-slate-900 dark:text-white tracking-tight">Medificate</h3>
                      <p className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">SaaS Ecosystem</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-lg border border-emerald-200/50 dark:border-emerald-900/45 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold tracking-wider font-mono">
                    LIVE NOW
                  </span>
                </div>

                {/* Subtitle / Hook */}
                <div className="space-y-3">
                  <h4 className="text-lg font-sans font-medium text-slate-800 dark:text-slate-200 leading-snug">
                    AI-Driven Medical Verification & Diagnostic Documentation.
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-sans">
                    Medificate is a high-security health-tech utility designed to digitize, verify, and deliver certified medical compliance documents. Purpose-built with cryptographic signing to prevent falsification and optimize doctor-patient-employer verification workflows.
                  </p>
                </div>

                {/* Key Features Bullet List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-start space-x-2.5">
                    <div className="mt-0.5 p-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-md border border-emerald-100 dark:border-emerald-900/50">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 font-sans">Cryptographic Certs</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">TAM-proof digital verification signatures.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <div className="mt-0.5 p-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-md border border-emerald-100 dark:border-emerald-900/50">
                      <Heart className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 font-sans">Seamless UX</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">Instant clinic check-ins & digital delivery.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <div className="mt-0.5 p-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-md border border-emerald-100 dark:border-emerald-900/50">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 font-sans">Real-time Checking</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">Instant database verification for compliance.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <div className="mt-0.5 p-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-md border border-emerald-100 dark:border-emerald-900/50">
                      <Cpu className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 font-sans">Bytexon Engine</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">Powered by our custom low-latency serverless stack.</p>
                    </div>
                  </div>
                </div>

                {/* Main Action Button */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                    DEPLOYMENT: <span className="font-bold text-slate-600 dark:text-slate-350">MEDIFICATE.VERCEL.APP</span>
                  </div>
                  <a 
                    href="https://medificate.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-emerald-600/10 hover:shadow-lg cursor-pointer"
                  >
                    <span>Launch Medificate Platform</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Description & Venture Backstory */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-cyan-455 uppercase tracking-wider">[ FEATURED SISTERS ]</span>
              <h2 className="text-2xl sm:text-3xl font-sans font-bold text-slate-900 dark:text-white tracking-tight">
                Architecting Health-Tech for the Next Generation.
              </h2>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-sans">
              As technology partners and co-creators of the Medificate platform, Bytexon designed the foundational security system, real-time sync hooks, and secure database parameters. 
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-sans">
              Medificate provides clinics, institutions, and individual practitioners with high-fidelity, secure, and easily-verifiable medical document generation tools, removing administrative friction completely.
            </p>

            <div className="p-5 border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm space-y-4">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono uppercase tracking-wider flex items-center space-x-2">
                <Globe className="w-4 h-4 text-indigo-500 dark:text-cyan-450" />
                <span>EXTERNAL RESOURCE HUB</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed font-sans">
                Visit Medificate directly to experience how Bytexon's premium engineering translates into specialized commercial ecosystems.
              </p>
              <a 
                href="https://medificate.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 dark:text-cyan-450 dark:hover:text-cyan-350 flex items-center space-x-1 transition-colors cursor-pointer"
              >
                <span>Visit medificate.vercel.app</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Custom Ecosystem Engineering Pitch */}
        <div className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 shadow-md relative overflow-hidden mt-12 text-center max-w-4xl mx-auto">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-60 h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
          
          <div className="max-w-2xl mx-auto space-y-6">
            <h3 className="text-xl sm:text-2xl font-sans font-bold text-slate-900 dark:text-white tracking-tight">
              Have a Proprietary Venture Concept?
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed font-sans">
              We specialize in turning advanced ideas (like secure certification systems, bespoke dashboards, and real-time ledger verification platforms) into functional, production-ready SaaS architectures. Let's design yours.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                onClick={onPlanProject}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 text-white text-xs font-bold px-6 py-3.5 rounded-xl transition-all shadow-sm hover:shadow cursor-pointer uppercase tracking-wider"
              >
                Consult an Architect
              </button>
              <button
                onClick={onBackToLanding}
                className="w-full sm:w-auto bg-transparent border border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-xs font-bold px-6 py-3.5 rounded-xl transition-all cursor-pointer uppercase tracking-wider"
              >
                Return to Overview
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
