import React from 'react';
import { AdminConfig } from '../types';
import { motion } from 'motion/react';
import BiytexonLogo from './BiytexonLogo';
import Interactive3DCard from './Interactive3DCard';
import { 
  Sparkles, ChevronRight,
  Code, Server, Database, Cloud, Brain, Laptop, Terminal, Layers, ArrowRight, Rocket, Activity
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
        <div className="absolute top-[40%] left-[5%] w-[500px] h-[500px] bg-gradient-to-br from-pink-100/20 dark:from-pink-950/10 to-blue-100/30 dark:to-blue-950/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full">
        
        {/* Apple-style Immersive Hero Card */}
        <section className="relative overflow-hidden rounded-none bg-[#f5f5f7] dark:bg-slate-900/50 border-b border-black/[0.03] dark:border-slate-800 shadow-sm transition-all duration-500 w-full">
          <div className="absolute inset-0 bg-radial-gradient from-white/30 dark:from-white/5 to-transparent pointer-events-none" />
          
          <div className="max-w-4xl mx-auto text-center px-6 py-20 sm:py-28 flex flex-col items-center relative z-10 space-y-8">
            

            {/* Huge Display Heading with perfect optical kerning */}
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-[#1d1d1f] dark:text-white font-sans"
            >
              Digital Architecture. <br />
              <span className="text-black dark:text-white">
                Engineered to scale.
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-slate-500 dark:text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl text-center"
            >
              Biytexon translates complex organizational constraints into incredibly sleek, performant software. Submit specs in our interactive planner, secure live trackers, and collaborate directly with lead engineers.
            </motion.p>

            {/* Premium CTA Button Group */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full pt-4 relative z-20"
            >
              <button
                onClick={() => onLaunchPlanner('create')}
                className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-sm tracking-wide transition-all duration-300 shadow-lg shadow-indigo-600/10 dark:shadow-cyan-500/10 flex items-center justify-center space-x-2 rounded-xl cursor-pointer hover:scale-[1.02] active:scale-95"
              >
                <Rocket className="w-4.5 h-4.5 animate-bounce-subtle" />
                <span>Launch Project</span>
              </button>
              
              <button
                onClick={() => onLaunchPlanner('track')}
                className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-600 dark:hover:border-cyan-400 text-slate-700 dark:text-slate-200 font-bold text-sm tracking-wide transition-all duration-300 shadow-sm flex items-center justify-center space-x-2 rounded-xl cursor-pointer hover:scale-[1.02] active:scale-95"
              >
                <Activity className="w-4.5 h-4.5 text-indigo-500 dark:text-cyan-450" />
                <span>Track Project</span>
              </button>
            </motion.div>



            {/* Apple-style Bento Stats Grid */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="pt-14 grid grid-cols-3 gap-4 sm:gap-6 border-t border-slate-200/50 dark:border-slate-800/80 w-full max-w-2xl mt-8"
            >
              <div className="p-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-none border border-black/[0.02] dark:border-slate-800 shadow-sm flex flex-col justify-between text-left h-24">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-indigo-600 dark:text-cyan-400">100%</span>
                <span className="text-slate-400 dark:text-slate-500 text-[10px] font-semibold tracking-wider uppercase">UPI Verified</span>
              </div>
              <div className="p-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-none border border-black/[0.02] dark:border-slate-800 shadow-sm flex flex-col justify-between text-left h-24">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-purple-600 dark:text-purple-450">&lt; 2 Hr</span>
                <span className="text-slate-400 dark:text-slate-500 text-[10px] font-semibold tracking-wider uppercase">Tech Review</span>
              </div>
              <div className="p-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-none border border-black/[0.02] dark:border-slate-800 shadow-sm flex flex-col justify-between text-left h-24">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#ff7b00] dark:text-amber-500">Live</span>
                <span className="text-slate-400 dark:text-slate-500 text-[10px] font-semibold tracking-wider uppercase">Architect Line</span>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="relative z-10 w-full px-4 sm:px-8 lg:px-12 pt-16 sm:pt-24 pb-12 space-y-24 max-w-7xl mx-auto">
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
              <div className="border border-black/[0.03] dark:border-slate-800 p-8 bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-900/85 backdrop-blur-xl text-left space-y-6 rounded-none shadow-sm h-full flex flex-col justify-between transition-all duration-300">
                <div className="space-y-4">
                  <div className="w-11 h-11 rounded-none bg-[#f5f5f7] dark:bg-slate-800 border border-slate-100 dark:border-slate-750 text-indigo-600 dark:text-cyan-400 flex items-center justify-center">
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
              <div className="border border-black/[0.03] dark:border-slate-800 p-8 bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-900/85 backdrop-blur-xl text-left space-y-6 rounded-none shadow-sm h-full flex flex-col justify-between transition-all duration-300">
                <div className="space-y-4">
                  <div className="w-11 h-11 rounded-none bg-[#f5f5f7] dark:bg-slate-800 border border-slate-100 dark:border-slate-750 text-purple-600 dark:text-purple-400 flex items-center justify-center">
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
              <div className="border border-black/[0.03] dark:border-slate-800 p-8 bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-900/85 backdrop-blur-xl text-left space-y-6 rounded-none shadow-sm h-full flex flex-col justify-between transition-all duration-300">
                <div className="space-y-4">
                  <div className="w-11 h-11 rounded-none bg-[#f5f5f7] dark:bg-slate-800 border border-slate-100 dark:border-slate-750 text-pink-600 dark:text-pink-450 flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1d1d1f] dark:text-white">Secure Integration Tiers</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    Connecting automated CRM pipelines, secure UPI payment gateways, state storage nodes, and cloud-native serverless functions running on Google Cloud.
                  </p>
                </div>
                <div className="pt-2 text-xs font-semibold text-pink-600 dark:text-pink-450 flex items-center space-x-1 hover:text-pink-500 dark:hover:text-pink-300 transition-colors">
                  <span>Read Process</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Interactive3DCard>
          </div>
        </section>

        </div>
      </div>
    </div>
  );
}
