import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, Code2, Database, Network, Cpu, Cloud, Compass, Check, Sparkles, 
  Layers, HardDrive, ShieldCheck, ArrowRight, RefreshCw, Zap
} from 'lucide-react';

interface TechItem {
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'infra' | 'ai';
  iconName: string;
  desc: string;
  badge: 'Core' | 'Standard' | 'Enterprise' | 'Scale';
}

const TECH_CATALOG: TechItem[] = [
  // Frontend
  { name: 'React 18+', category: 'frontend', iconName: 'React', desc: 'Component-driven, optimized UI library for building modular, responsive clients.', badge: 'Core' },
  { name: 'Next.js 14', category: 'frontend', iconName: 'Next', desc: 'Hybrid SSR/SSG production framework for optimal search indexation and cold starts.', badge: 'Scale' },
  { name: 'Tailwind CSS', category: 'frontend', iconName: 'Tailwind', desc: 'Utility-first utility styling system for robust, lightweight, fluid layouts.', badge: 'Core' },
  { name: 'TypeScript', category: 'frontend', iconName: 'TS', desc: 'Strict runtime compilation and compile-time type-safety preventing UI crashes.', badge: 'Core' },
  { name: 'Vite & esbuild', category: 'frontend', iconName: 'Vite', desc: 'Ultra-fast bundle assembler and compiler delivering low-latency local loads.', badge: 'Standard' },
  
  // Backend
  { name: 'Node.js (LTS)', category: 'backend', iconName: 'Node', desc: 'Async non-blocking event-driven runtime ideal for highly concurrent services.', badge: 'Core' },
  { name: 'Express / tsx', category: 'backend', iconName: 'Express', desc: 'Pragmatic, unopinionated routing structure for REST endpoints and secure gates.', badge: 'Core' },
  { name: 'Golang', category: 'backend', iconName: 'Go', desc: 'Native binary compiler delivering extreme memory safety and concurrency control.', badge: 'Scale' },
  { name: 'FastAPI', category: 'backend', iconName: 'FastAPI', desc: 'Python-driven spec generator, perfect for streaming JSON or token queues.', badge: 'Standard' },
  
  // Database
  { name: 'PostgreSQL', category: 'database', iconName: 'Postgres', desc: 'Industrial relational model database supporting ACID, compound indexes, and JSONB.', badge: 'Core' },
  { name: 'Google Cloud Spanner', category: 'database', iconName: 'Spanner', desc: 'Globally distributed relational database engine with absolute serializable consistency.', badge: 'Enterprise' },
  { name: 'Firebase Firestore', category: 'database', iconName: 'Firestore', desc: 'Real-time document collection store ideal for reactive dashboards and profiles.', badge: 'Standard' },
  { name: 'Redis Store', category: 'database', iconName: 'Redis', desc: 'Ultra-low latency in-memory data grid for transient sessions and API caches.', badge: 'Scale' },
  { name: 'Drizzle ORM', category: 'database', iconName: 'Drizzle', desc: 'Next-generation TypeScript ORM enabling fast SQL transactions and schemas.', badge: 'Core' },

  // Cloud/Infra
  { name: 'Docker Containers', category: 'infra', iconName: 'Docker', desc: 'Declarative, isolated runtime environments ensuring identical dev and production parity.', badge: 'Core' },
  { name: 'Google Cloud Run', category: 'infra', iconName: 'CloudRun', desc: 'Fully managed serverless container runner scaling gracefully based on incoming requests.', badge: 'Standard' },
  { name: 'Kubernetes (GKE)', category: 'infra', iconName: 'K8s', desc: 'Automated cluster scheduling, health probes, and horizontal pod scaling.', badge: 'Enterprise' },
  { name: 'GitHub Actions', category: 'infra', iconName: 'CI', desc: 'Automated verification, linting, compilation, and cloud release automation.', badge: 'Core' },

  // AI & Large Language Models
  { name: 'Google Gemini API', category: 'ai', iconName: 'Gemini', desc: 'Multimodal model suite delivering massive token context windows and structural JSON outputs.', badge: 'Standard' },
  { name: 'LangChain & VectorDB', category: 'ai', iconName: 'Lang', desc: 'Custom context retrieval pipelines supporting agentic reasoning workflows.', badge: 'Standard' }
];

interface ProjectBlueprint {
  id: string;
  name: string;
  tagline: string;
  description: string;
  idealScale: 'Seed Stage' | 'Growth Startup' | 'High-Load Enterprise';
  techChoices: {
    frontend: string[];
    backend: string[];
    database: string[];
    infra: string[];
    ai?: string[];
  };
  architectJustification: string;
}

const BLUEPRINTS: ProjectBlueprint[] = [
  {
    id: 'ai-saas',
    name: 'Cognitive AI SaaS Platform',
    tagline: 'Best for real-time generative applications, context-aware agents, or smart tools.',
    description: 'A cutting-edge architecture designed to pipeline complex prompts, process dynamic contextual databases, and stream structural answers to clients with ultra-low latency.',
    idealScale: 'Growth Startup',
    techChoices: {
      frontend: ['React 18+', 'Tailwind CSS', 'TypeScript'],
      backend: ['Node.js (LTS)', 'FastAPI'],
      database: ['Firebase Firestore', 'Redis Store', 'Drizzle ORM'],
      infra: ['Docker Containers', 'Google Cloud Run', 'GitHub Actions'],
      ai: ['Google Gemini API', 'LangChain & VectorDB']
    },
    architectJustification: 'FastAPI manages heavy async operations and easily proxies streaming LLM tokens, while Gemini handles advanced semantic reasoning. Firestore syncs the conversational status in real-time.'
  },
  {
    id: 'fintech-dashboard',
    name: 'High-Concurrency FinTech SaaS',
    tagline: 'Best for transaction pipelines, analytical ledgers, and secure administrative portals.',
    description: 'An ironclad, relational ecosystem designed for extreme compliance, zero-data-loss ledgers, complex mathematical queries, and live dashboard metrics tracking.',
    idealScale: 'High-Load Enterprise',
    techChoices: {
      frontend: ['React 18+', 'Next.js 14', 'Tailwind CSS', 'TypeScript'],
      backend: ['Golang', 'Express / tsx'],
      database: ['PostgreSQL', 'Redis Store', 'Drizzle ORM'],
      infra: ['Docker Containers', 'Kubernetes (GKE)', 'GitHub Actions']
    },
    architectJustification: 'Golang handles transaction logic with unparalleled CPU efficiency and concurrency safety. Postgres serves as a bulletproof relational ledger, while Kubernetes coordinates resilient fallback pools.'
  },
  {
    id: 'lean-mvp',
    name: 'Validated Launch MVP',
    tagline: 'Best for validating product hypotheses, secure directories, and landing pages quickly.',
    description: 'An extremely cost-efficient, streamlined stack optimized for agile iteration, simple data modeling, and lightning-fast time-to-market.',
    idealScale: 'Seed Stage',
    techChoices: {
      frontend: ['React 18+', 'Tailwind CSS', 'TypeScript', 'Vite & esbuild'],
      backend: ['Node.js (LTS)', 'Express / tsx'],
      database: ['Firebase Firestore'],
      infra: ['Google Cloud Run', 'GitHub Actions']
    },
    architectJustification: 'Vite and React construct a fast, lightweight layout, while Firestore hosts dynamic pages without requiring heavy relational configuration. Scaled to zero when idle to save hosting budget.'
  },
  {
    id: 'realtime-collab',
    name: 'Collaborative Multi-User Hub',
    tagline: 'Best for shared boards, chat hubs, or live operations.',
    description: 'Engineered for instant state replication, minimal socket latency, and persistent concurrent connections. Ideal for live collaborative interfaces.',
    idealScale: 'Growth Startup',
    techChoices: {
      frontend: ['React 18+', 'Tailwind CSS', 'TypeScript'],
      backend: ['Node.js (LTS)', 'Express / tsx'],
      database: ['PostgreSQL', 'Redis Store', 'Drizzle ORM'],
      infra: ['Docker Containers', 'Google Cloud Run']
    },
    architectJustification: 'Redis acts as the transient in-memory message broker, while PostgreSQL records permanent audit trails. Google Cloud Run dynamically boots handles websocket channels smoothly.'
  }
];

interface OurStacksProps {
  onPlanProject: () => void;
}

export default function OurStacks({ onPlanProject }: OurStacksProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'frontend' | 'backend' | 'database' | 'infra' | 'ai'>('all');
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>(BLUEPRINTS[0].id);

  const filteredCatalog = activeCategory === 'all' 
    ? TECH_CATALOG 
    : TECH_CATALOG.filter(t => t.category === activeCategory);

  const selectedBlueprint = BLUEPRINTS.find(b => b.id === selectedBlueprintId) || BLUEPRINTS[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white pb-16">
      {/* Header Banner */}
      <section className="bg-white border-b-4 border-slate-900 py-20 px-6 sm:px-12 relative overflow-hidden">
        {/* Glow meshes */}
        <div className="absolute -left-12 -top-12 w-64 h-64 bg-cyan-300 rounded-full blur-3xl opacity-25 pointer-events-none"></div>
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-300 rounded-full blur-3xl opacity-25 pointer-events-none"></div>
        <div className="absolute inset-0 bg-grid-slate-100 opacity-60"></div>
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-100 to-cyan-200 border-2 border-slate-900 px-4 py-1.5 rounded-2xl text-slate-900 text-xs font-black font-mono tracking-wider uppercase shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]">
            <Compass className="w-4 h-4 text-cyan-600 animate-spin-slow" />
            <span>THE TECH STACK CATALOG</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-black text-slate-900 tracking-tight uppercase leading-none">
            MODERN, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-indigo-600 to-amber-600">INDUSTRIAL STACKS</span>
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-mono uppercase">
            We avoid outdated legacy patterns. Bytexon deploys type-safe, compiled, and horizontally scaling stacks optimized for responsive layouts and fast database performance.
          </p>
        </div>
      </section>

      {/* Interactive Blueprint Selector Section */}
      <section className="max-w-7xl w-full mx-auto px-6 py-12 sm:px-12">
        <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-slate-100 pb-6 gap-6">
            <div>
              <span className="text-[9px] font-mono font-black bg-indigo-100 text-indigo-700 border-2 border-slate-900 px-3 py-1 rounded-xl uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                INTERACTIVE ARCHITECTURE MATCHER
              </span>
              <h2 className="text-xl sm:text-2xl font-display font-black text-slate-900 tracking-tight uppercase mt-2.5">
                Architectural Blueprint Matcher
              </h2>
            </div>
            
            {/* Blueprint Buttons */}
            <div className="flex flex-wrap gap-2.5">
              {BLUEPRINTS.map((bp) => (
                <button
                  key={bp.id}
                  onClick={() => setSelectedBlueprintId(bp.id)}
                  className={`px-4 py-2 text-xs font-mono font-black uppercase tracking-wider rounded-xl border-2 transition-all cursor-pointer ${
                    bp.id === selectedBlueprintId
                      ? 'bg-indigo-600 text-white border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] -translate-y-0.5'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {bp.name.split(' ')[0]} {bp.name.split(' ').slice(1).join(' ').substring(0, 8)}..
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedBlueprintId}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.18 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Blueprint description */}
              <div className="lg:col-span-5 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-display font-black text-slate-900 uppercase">
                    {selectedBlueprint.name}
                  </h3>
                  <p className="text-xs font-mono text-indigo-600 font-extrabold bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg w-fit">
                    {selectedBlueprint.tagline}
                  </p>
                </div>

                <p className="text-slate-700 text-xs sm:text-sm leading-relaxed font-sans font-medium">
                  {selectedBlueprint.description}
                </p>

                <div className="p-4 bg-emerald-50/60 border-2 border-slate-900 rounded-2xl space-y-2.5 shadow-[4px_4px_0px_0px_rgba(16,185,129,0.15)]">
                  <span className="text-[9px] font-mono font-black uppercase tracking-widest text-emerald-800 block">
                    // SYSTEM SCALABILITY SCOPE_
                  </span>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span className="text-xs font-black text-slate-900 uppercase font-mono tracking-wide">{selectedBlueprint.idealScale}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[9px] font-mono font-black uppercase tracking-widest text-slate-450 block mb-1.5">
                    // LEAD ARCHITECT ASSESSMENT_
                  </span>
                  <p className="text-[11px] text-slate-600 font-medium italic leading-relaxed border-l-4 border-slate-900 pl-4 bg-slate-50 p-3 rounded-r-xl">
                    "{selectedBlueprint.architectJustification}"
                  </p>
                </div>
              </div>

              {/* Resolved Stack Diagram (Bento Grid) */}
              <div className="lg:col-span-7 bg-slate-50 border-2 border-slate-900 rounded-3xl p-5 sm:p-6 space-y-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                <span className="text-[9px] font-mono font-black uppercase tracking-wider text-slate-450 flex items-center gap-2 border-b border-slate-200 pb-2.5">
                  <Layers className="w-4 h-4 text-indigo-600 stroke-[2.5]" />
                  <span>RESOLVED SYSTEM HARDWARE TIER ARCHITECTURE_</span>
                </span>

                <div className="space-y-4">
                  {/* Frontend Tier */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono font-black text-slate-450 uppercase tracking-widest block">// FRONTEND TIER_</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedBlueprint.techChoices.frontend.map(tech => (
                        <span key={tech} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-slate-900 text-slate-900 font-mono text-[10px] font-black rounded-xl shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:bg-indigo-50 transition-colors cursor-default">
                          <Code2 className="w-3.5 h-3.5 text-indigo-600 stroke-[2.5]" />
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Backend Tier */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono font-black text-slate-450 uppercase tracking-widest block">// BACKEND PIPELINE_</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedBlueprint.techChoices.backend.map(tech => (
                        <span key={tech} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-slate-900 text-slate-900 font-mono text-[10px] font-black rounded-xl shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:bg-cyan-50 transition-colors cursor-default">
                          <Cpu className="w-3.5 h-3.5 text-cyan-600 stroke-[2.5]" />
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Database Tier */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono font-black text-slate-450 uppercase tracking-widest block">// DATABASE PERSISTENCE_</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedBlueprint.techChoices.database.map(tech => (
                        <span key={tech} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-slate-900 text-slate-900 font-mono text-[10px] font-black rounded-xl shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:bg-amber-50 transition-colors cursor-default">
                          <Database className="w-3.5 h-3.5 text-amber-600 stroke-[2.5]" />
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Infrastructure Tier */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono font-black text-slate-450 uppercase tracking-widest block">// CONTAINER INFRA & CI/CD_</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedBlueprint.techChoices.infra.map(tech => (
                        <span key={tech} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-slate-900 text-slate-900 font-mono text-[10px] font-black rounded-xl shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:bg-emerald-50 transition-colors cursor-default">
                          <Cloud className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* AI Tier (Optional) */}
                  {selectedBlueprint.techChoices.ai && (
                    <div className="space-y-2">
                      <span className="text-[9px] font-mono font-black text-slate-450 uppercase tracking-widest block">// COGNITIVE REASONING_</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedBlueprint.techChoices.ai.map(tech => (
                          <span key={tech} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border-2 border-slate-900 text-purple-950 font-mono text-[10px] font-black rounded-xl shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:bg-purple-100 transition-colors cursor-default">
                            <Sparkles className="w-3.5 h-3.5 text-purple-600 stroke-[2.5]" />
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Final Cta */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider font-semibold">
                    Ready to build this architecture?
                  </span>
                  <button
                    onClick={onPlanProject}
                    className="py-2.5 px-4 bg-slate-900 hover:bg-indigo-600 text-white font-sans font-bold border-2 border-slate-900 rounded-xl text-xs uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] hover:text-white active:translate-y-0.5 active:translate-x-0.5 active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]"
                  >
                    <span>Use Blueprint</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Tech Catalog Grid */}
      <section className="max-w-7xl w-full mx-auto px-6 py-6 sm:px-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b-2 border-slate-200 pb-5">
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-display font-black text-slate-900 tracking-tight uppercase">
              Bytexon Verified Technologies
            </h2>
            <p className="text-xs text-slate-500 font-mono uppercase">
              // ONLY ROBUST, INDUSTRIALLY ACCEPTED, AND HIGHLY SCALABLE CHIPS PASS VETTING_
            </p>
          </div>

          {/* Filter Categories */}
          <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]">
            {(['all', 'frontend', 'backend', 'database', 'infra', 'ai'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 text-[10px] font-mono font-black rounded-xl transition-all uppercase tracking-wider cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCatalog.map((tech) => {
            const displayCat = tech.category === 'ai' ? 'AI MODEL' : tech.category.toUpperCase();
            
            return (
              <div 
                key={tech.name} 
                className="bg-white border-2 border-slate-900 rounded-2xl p-5 space-y-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[6px_6px_0px_0px_rgba(99,102,241,0.2)] hover:border-indigo-500 transition-all group relative overflow-hidden"
              >
                {/* Visual badge top right */}
                <div className="absolute top-4.5 right-4 text-[8px] font-mono font-black bg-slate-50 border-2 border-slate-900 px-2 py-0.5 rounded-lg text-slate-700 uppercase tracking-widest">
                  {tech.badge}
                </div>

                <div className="space-y-1.5">
                  <div className="text-[9px] font-mono font-black text-indigo-650 uppercase tracking-widest">
                    // {displayCat}_
                  </div>
                  <h3 className="text-base font-display font-black text-slate-900 tracking-tight uppercase">
                    {tech.name}
                  </h3>
                </div>

                <p className="text-slate-600 text-xs leading-relaxed font-sans font-medium">
                  {tech.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
