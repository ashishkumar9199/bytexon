import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Code2, Database, Cpu, Cloud, Compass, Check, Sparkles, 
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
    architectJustification: 'Redis acts as the transient in-memory message broker, while PostgreSQL records permanent audit trails. Google Cloud Run dynamically handles websocket channels smoothly.'
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
    <div className="min-h-screen bg-[#fbfbfd] dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500/10 selection:text-indigo-900 pb-24">
      
      {/* Premium Apple-style Header Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center space-y-4">
        <span className="text-xs font-semibold text-indigo-600 dark:text-cyan-450 tracking-widest uppercase">STABLE STANDARDS</span>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#1d1d1f] dark:text-white">
          Verified Technology Stacks
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          We construct modular full-stack solutions avoiding brittle dependencies, relying only on industry-tested compilers and storage networks.
        </p>
      </section>

      {/* Blueprint Matcher Board */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/85 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-6 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-indigo-600 dark:text-cyan-450 tracking-widest uppercase">System Orchestration</span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1d1d1f] dark:text-white">
                Architectural Blueprint Matcher
              </h2>
            </div>
            
            {/* Elegant Selector Pill Buttons */}
            <div className="flex flex-wrap gap-1.5 bg-slate-100/80 dark:bg-slate-800/85 p-1 rounded-2xl border border-black/[0.03] dark:border-slate-750">
              {BLUEPRINTS.map((bp) => {
                const isSelected = bp.id === selectedBlueprintId;
                return (
                  <button
                    key={bp.id}
                    onClick={() => setSelectedBlueprintId(bp.id)}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-white'
                    }`}
                  >
                    {bp.name.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedBlueprintId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left Details column */}
              <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-[#1d1d1f] dark:text-white">
                      {selectedBlueprint.name}
                    </h3>
                    <div className="inline-flex bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/50 px-3 py-1 rounded-full text-indigo-600 dark:text-cyan-450 text-xs font-medium">
                      {selectedBlueprint.tagline}
                    </div>
                  </div>

                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    {selectedBlueprint.description}
                  </p>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/40 rounded-2xl space-y-2">
                    <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 tracking-wider uppercase block">
                      Scalability Target
                    </span>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-450 shrink-0" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{selectedBlueprint.idealScale}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase block">
                      Lead Architect Assessment
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-350 italic leading-relaxed border-l-2 border-slate-300 dark:border-slate-750 pl-4 bg-[#f5f5f7]/60 dark:bg-slate-950/40 p-3.5 rounded-r-2xl">
                      "{selectedBlueprint.architectJustification}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Resolved Stack Diagram Right Column */}
              <div className="lg:col-span-7 bg-[#f5f5f7]/60 dark:bg-slate-950/50 border border-black/[0.02] dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-6 flex flex-col justify-between">
                <div className="space-y-5">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase flex items-center gap-2 border-b border-slate-200/50 dark:border-slate-800 pb-2.5">
                    <Layers className="w-4 h-4 text-indigo-600 dark:text-cyan-450" />
                    <span>RESOLVED HARDWARE TIER ARCHITECTURE</span>
                  </span>

                  <div className="space-y-4">
                    {/* Frontend Tier */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 block tracking-wider">FRONTEND TIER</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedBlueprint.techChoices.frontend.map(tech => (
                          <span key={tech} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-full cursor-default">
                            <Code2 className="w-3.5 h-3.5 text-indigo-500 dark:text-cyan-455" />
                            <span>{tech}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Backend Tier */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 block tracking-wider">BACKEND PIPELINE</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedBlueprint.techChoices.backend.map(tech => (
                          <span key={tech} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-full cursor-default">
                            <Cpu className="w-3.5 h-3.5 text-cyan-500" />
                            <span>{tech}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Database Tier */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 block tracking-wider">DATABASE STORAGE</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedBlueprint.techChoices.database.map(tech => (
                          <span key={tech} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-full cursor-default">
                            <Database className="w-3.5 h-3.5 text-amber-500" />
                            <span>{tech}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Infrastructure Tier */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 block tracking-wider">CONTAINER CLOUD INFRASTRUCTURE</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedBlueprint.techChoices.infra.map(tech => (
                          <span key={tech} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-full cursor-default">
                            <Cloud className="w-3.5 h-3.5 text-emerald-500" />
                            <span>{tech}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* AI Tier (Optional) */}
                    {selectedBlueprint.techChoices.ai && (
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 block tracking-wider">COGNITIVE INTEGRATION</span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedBlueprint.techChoices.ai.map(tech => (
                            <span key={tech} className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50 text-purple-700 dark:text-purple-300 text-xs rounded-full cursor-default">
                              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                              <span>{tech}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Final Cta */}
                <div className="pt-5 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Ready to build this architecture?
                  </span>
                  <button
                    onClick={onPlanProject}
                    className="py-2 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 font-semibold rounded-full text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>Use Blueprint</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Tech Catalog Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200/60 dark:border-slate-800 pb-5">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-indigo-600 dark:text-cyan-450 tracking-widest uppercase">Verified Catalog</span>
            <h2 className="text-2xl font-bold text-[#1d1d1f] dark:text-white">
              Bytexon Standard Modules
            </h2>
          </div>

          {/* Filter Categories */}
          <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-black/[0.03] dark:border-slate-750">
            {(['all', 'frontend', 'backend', 'database', 'infra', 'ai'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-855 dark:hover:text-white'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCatalog.map((tech) => {
            const displayCat = tech.category === 'ai' ? 'AI Model' : tech.category.charAt(0).toUpperCase() + tech.category.slice(1);
            
            return (
              <div 
                key={tech.name} 
                className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 space-y-4 hover:border-indigo-500 dark:hover:border-cyan-400 hover:shadow-sm transition-all duration-300 relative"
              >
                {/* Visual badge top right */}
                <div className="absolute top-5 right-5 text-[9px] font-semibold bg-slate-50 dark:bg-slate-850 border border-slate-200/50 dark:border-slate-750 px-2 py-0.5 rounded-full text-slate-500 dark:text-slate-450">
                  {tech.badge}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-indigo-500 dark:text-cyan-450 tracking-wider uppercase block">
                    {displayCat}
                  </span>
                  <h3 className="text-base font-bold text-[#1d1d1f] dark:text-white">
                    {tech.name}
                  </h3>
                </div>

                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
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
