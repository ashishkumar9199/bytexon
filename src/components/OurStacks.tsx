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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Banner */}
      <section className="bg-white border-b border-slate-200 py-16 px-6 sm:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 opacity-60"></div>
        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center space-x-1.5 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full text-indigo-700 text-xs font-semibold font-mono tracking-wide uppercase">
            <Compass className="w-3.5 h-3.5" />
            <span>The Tech Stack Catalog</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight animate-fade-in">
            Modern, Industrial Technology Stacks
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            We avoid outdated legacy patterns. Bytexon deploys type-safe, compiled, and horizontally scaling stacks optimized for responsive layouts and fast database performance.
          </p>
        </div>
      </section>

      {/* Interactive Blueprint Selector Section */}
      <section className="max-w-7xl w-full mx-auto px-6 py-10 sm:px-12">
        <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-5 gap-4">
            <div>
              <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded uppercase">
                Interactive Planner Tool
              </span>
              <h2 className="text-lg sm:text-xl font-display font-extrabold text-slate-900 tracking-tight mt-1">
                Architectural Blueprint Matcher
              </h2>
            </div>
            
            {/* Blueprint Buttons */}
            <div className="flex flex-wrap gap-2">
              {BLUEPRINTS.map((bp) => (
                <button
                  key={bp.id}
                  onClick={() => setSelectedBlueprintId(bp.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md border transition-all cursor-pointer ${
                    bp.id === selectedBlueprintId
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {bp.name.split(' ')[0]} {bp.name.split(' ').slice(1).join(' ').substring(0, 10)}...
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedBlueprintId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Blueprint description */}
              <div className="lg:col-span-5 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-display font-extrabold text-slate-900">
                    {selectedBlueprint.name}
                  </h3>
                  <p className="text-xs font-mono text-indigo-600 font-bold">
                    {selectedBlueprint.tagline}
                  </p>
                </div>

                <p className="text-slate-600 text-xs leading-relaxed font-sans">
                  {selectedBlueprint.description}
                </p>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-md space-y-2">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                    Ideal Scale & Demands
                  </span>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-xs font-bold text-slate-800 font-sans">{selectedBlueprint.idealScale}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Architect's Assessment
                  </span>
                  <p className="text-[11px] text-slate-500 italic leading-relaxed border-l-2 border-indigo-200 pl-3">
                    "{selectedBlueprint.architectJustification}"
                  </p>
                </div>
              </div>

              {/* Resolved Stack Diagram (Bento Grid) */}
              <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-lg p-5 sm:p-6 space-y-5">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Resolved Stack Blueprint Modules</span>
                </span>

                <div className="space-y-3.5">
                  {/* Frontend Tier */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Frontend Tier</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedBlueprint.techChoices.frontend.map(tech => (
                        <span key={tech} className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-250 text-slate-800 font-mono text-[10px] font-bold rounded-md shadow-sm">
                          <Code2 className="w-3 h-3 text-indigo-600" />
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Backend Tier */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Backend Tier</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedBlueprint.techChoices.backend.map(tech => (
                        <span key={tech} className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-250 text-slate-800 font-mono text-[10px] font-bold rounded-md shadow-sm">
                          <Cpu className="w-3 h-3 text-cyan-600" />
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Database Tier */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Database & Storage Tier</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedBlueprint.techChoices.database.map(tech => (
                        <span key={tech} className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-250 text-slate-800 font-mono text-[10px] font-bold rounded-md shadow-sm">
                          <Database className="w-3 h-3 text-amber-600" />
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Infrastructure Tier */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Cloud & CI/CD Tier</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedBlueprint.techChoices.infra.map(tech => (
                        <span key={tech} className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-250 text-slate-800 font-mono text-[10px] font-bold rounded-md shadow-sm">
                          <Cloud className="w-3 h-3 text-emerald-600" />
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* AI Tier (Optional) */}
                  {selectedBlueprint.techChoices.ai && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Generative AI Tier</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedBlueprint.techChoices.ai.map(tech => (
                          <span key={tech} className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 border border-indigo-100 text-indigo-800 font-mono text-[10px] font-bold rounded-md shadow-sm">
                            <Sparkles className="w-3 h-3 text-indigo-600" />
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Final Cta */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Ready to build this architecture?
                  </span>
                  <button
                    onClick={onPlanProject}
                    className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md text-xs uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer"
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
      <section className="max-w-7xl w-full mx-auto px-6 py-6 sm:px-12 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <h2 className="text-xl font-display font-extrabold text-slate-900 tracking-tight">
              Bytexon Verified Technologies
            </h2>
            <p className="text-xs text-slate-500">
              Only robust, industrially accepted, and highly scalable technologies pass our vetting standards.
            </p>
          </div>

          {/* Filter Categories */}
          <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
            {(['all', 'frontend', 'backend', 'database', 'infra', 'ai'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all uppercase tracking-wider cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredCatalog.map((tech) => {
            const displayCat = tech.category === 'ai' ? 'AI Model' : tech.category;
            
            return (
              <div 
                key={tech.name} 
                className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-sm hover:border-slate-350 hover:shadow-md transition-all group relative overflow-hidden"
              >
                {/* Visual badge top right */}
                <div className="absolute top-3 right-3 text-[8px] font-mono font-bold bg-slate-50 border border-slate-150 px-1.5 py-0.5 rounded text-slate-500 uppercase tracking-widest">
                  {tech.badge}
                </div>

                <div className="space-y-1">
                  <div className="text-[9px] font-mono font-bold text-indigo-600 uppercase tracking-wider">
                    {displayCat}
                  </div>
                  <h3 className="text-sm font-display font-bold text-slate-900 tracking-tight">
                    {tech.name}
                  </h3>
                </div>

                <p className="text-slate-500 text-[11px] leading-relaxed font-sans">
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
