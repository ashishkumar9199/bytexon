import React from 'react';
import { AdminConfig } from '../types';
import { motion } from 'motion/react';
import BytexonLogo from './BytexonLogo';
import Interactive3DCard from './Interactive3DCard';
import { 
  Sparkles, ChevronRight,
  Code, Server, Database, Cloud, Brain, Laptop, Terminal, Layers, ArrowRight
} from 'lucide-react';

interface ClientLandingProps {
  onAccessPortal: (id: string) => void;
  adminConfig: AdminConfig;
  onLaunchPlanner: (tab?: 'create' | 'track', prefillPrice?: number, prefillDesc?: string) => void;
}

export default function ClientLanding({ onAccessPortal, adminConfig, onLaunchPlanner }: ClientLandingProps) {
  return (
    <div className="bg-[#fbfbfd] dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 selection:bg-indigo-500/10 selection:text-indigo-900 pb-24 overflow-x-hidden">
      
      {/* Dynamic Ambient Backing Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-[15%] w-[600px] h-[600px] bg-gradient-to-br from-indigo-100/30 dark:from-indigo-950/20 to-purple-100/20 dark:to-purple-950/10 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] left-[5%] w-[500px] h-[500px] bg-gradient-to-br from-pink-100/20 dark:from-pink-950/10 to-blue-100/30 dark:to-blue-950/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 space-y-24">
        
        {/* Apple-style Immersive Hero Card */}
        <section className="relative overflow-hidden rounded-3xl bg-[#f5f5f7] dark:bg-slate-900/50 border border-black/[0.03] dark:border-slate-800 shadow-sm transition-all duration-500">
          <div className="absolute inset-0 bg-radial-gradient from-white/30 dark:from-white/5 to-transparent pointer-events-none" />
          
          <div className="max-w-4xl mx-auto text-center px-6 py-20 sm:py-28 flex flex-col items-center relative z-10 space-y-8">
            
            {/* Elegant Sub-badge */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="inline-flex items-center space-x-2 bg-white/80 dark:bg-slate-900/80 border border-black/[0.04] dark:border-slate-800 px-4 py-1 rounded-full text-slate-500 dark:text-slate-400 text-xs font-medium tracking-wide shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-cyan-450 animate-pulse" />
              <span>Premium Core Systems</span>
            </motion.div>
            
            {/* Huge Display Heading with perfect optical kerning */}
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-[#1d1d1f] dark:text-white font-sans"
            >
              Digital Architecture. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-cyan-400 dark:via-blue-500 dark:to-indigo-500">
                Engineered to scale.
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-slate-500 dark:text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl text-center"
            >
              Bytexon translates complex organizational constraints into incredibly sleek, performant software. Submit specs in our interactive planner, secure live trackers, and collaborate directly with lead engineers.
            </motion.p>

            {/* Micro Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md pt-4"
            >
              <button
                onClick={() => onLaunchPlanner('create')}
                className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 text-white font-medium py-3 px-6 text-xs sm:text-sm tracking-wide transition-all cursor-pointer rounded-full flex items-center justify-center space-x-2 shrink-0 shadow-sm hover:shadow"
              >
                <span>Launch Project Planner</span>
                <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-700" />
              </button>
              <button
                onClick={() => onLaunchPlanner('track')}
                className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-medium py-3 px-6 text-xs sm:text-sm tracking-wide transition-all cursor-pointer border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center space-x-2 shrink-0 shadow-sm hover:shadow"
              >
                <span>Track Workspace</span>
              </button>
            </motion.div>

            {/* Apple-style Bento Stats Grid */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="pt-14 grid grid-cols-3 gap-4 sm:gap-6 border-t border-slate-200/50 dark:border-slate-800/80 w-full max-w-2xl mt-8"
            >
              <div className="p-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-black/[0.02] dark:border-slate-800 shadow-sm flex flex-col justify-between text-left h-24">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-indigo-600 dark:text-cyan-400">100%</span>
                <span className="text-slate-400 dark:text-slate-500 text-[10px] font-semibold tracking-wider uppercase">UPI Verified</span>
              </div>
              <div className="p-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-black/[0.02] dark:border-slate-800 shadow-sm flex flex-col justify-between text-left h-24">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-purple-600 dark:text-purple-450">&lt; 2 Hr</span>
                <span className="text-slate-400 dark:text-slate-500 text-[10px] font-semibold tracking-wider uppercase">Tech Review</span>
              </div>
              <div className="p-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-black/[0.02] dark:border-slate-800 shadow-sm flex flex-col justify-between text-left h-24">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#ff7b00] dark:text-amber-500">Live</span>
                <span className="text-slate-400 dark:text-slate-500 text-[10px] font-semibold tracking-wider uppercase">Architect Line</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Capabilities Section */}
        <section className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-semibold text-indigo-600 dark:text-cyan-400 tracking-widest uppercase">Expertise Catalog</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1d1d1f] dark:text-white">
              Architected to solve hard constraints.
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              We orchestrate high-capacity web databases and polished user interfaces that align strictly with modern enterprise architectures.
            </p>
          </div>

          {/* Premium Glass-Style Bento Cards for Capabilities */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <Interactive3DCard glowColor="rgba(99, 102, 241, 0.15)" className="h-full">
              <div className="border border-black/[0.03] dark:border-slate-800 p-8 bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-900/85 backdrop-blur-xl text-left space-y-6 rounded-3xl shadow-sm h-full flex flex-col justify-between transition-all duration-300">
                <div className="space-y-4">
                  <div className="w-11 h-11 rounded-2xl bg-[#f5f5f7] dark:bg-slate-800 border border-slate-100 dark:border-slate-750 text-indigo-600 dark:text-cyan-400 flex items-center justify-center">
                    <Code className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1d1d1f] dark:text-white">Custom Web Frameworks</h3>
                  <p className="text-slate-950 dark:text-slate-100 text-sm leading-relaxed font-medium">
                    Lightning-fast, highly responsive single page applications engineered with strict type parameters, modular components, and premium motion flows.
                  </p>
                </div>
                <div className="pt-2 text-xs font-semibold text-indigo-600 dark:text-cyan-400 flex items-center space-x-1 hover:text-indigo-500 dark:hover:text-cyan-355 transition-colors">
                  <span>View Services</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Interactive3DCard>

            <Interactive3DCard glowColor="rgba(168, 85, 247, 0.15)" className="h-full">
              <div className="border border-black/[0.03] dark:border-slate-800 p-8 bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-900/85 backdrop-blur-xl text-left space-y-6 rounded-3xl shadow-sm h-full flex flex-col justify-between transition-all duration-300">
                <div className="space-y-4">
                  <div className="w-11 h-11 rounded-2xl bg-[#f5f5f7] dark:bg-slate-800 border border-slate-100 dark:border-slate-750 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Database className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1d1d1f] dark:text-white">Relational & Document Stores</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    From modular multi-tenant PostgreSQL systems with complex relational views to lightning-fast real-time Firestore clusters under strict row security.
                  </p>
                </div>
                <div className="pt-2 text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center space-x-1 hover:text-purple-500 dark:hover:text-purple-300 transition-colors">
                  <span>Explore Stacks</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Interactive3DCard>

            <Interactive3DCard glowColor="rgba(236, 72, 153, 0.15)" className="h-full">
              <div className="border border-black/[0.03] dark:border-slate-800 p-8 bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-900/85 backdrop-blur-xl text-left space-y-6 rounded-3xl shadow-sm h-full flex flex-col justify-between transition-all duration-300">
                <div className="space-y-4">
                  <div className="w-11 h-11 rounded-2xl bg-[#f5f5f7] dark:bg-slate-800 border border-slate-100 dark:border-slate-750 text-pink-600 dark:text-pink-450 flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1d1d1f] dark:text-white">Secure Integration Tiers</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    Connecting automated CRM pipelines, secure UPI payment gateways, state storage nodes, and cloud-native serverless functions running on Google Cloud.
                  </p>
                </div>
                <div className="pt-2 text-xs font-semibold text-pink-600 dark:text-pink-400 flex items-center space-x-1 hover:text-pink-500 dark:hover:text-pink-300 transition-colors">
                  <span>Read Process</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Interactive3DCard>
          </div>
        </section>

      </div>
    </div>
  );
}
