import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Code, Server, Database, Cloud, Brain, 
  ChevronRight, ArrowRight, Clock, Cpu, Layers, CheckCircle2, Check
} from 'lucide-react';

interface ServiceDetail {
  id: string;
  title: string;
  tagline: string;
  icon: React.ComponentType<any>;
  shortDesc: string;
  longDesc: string;
  duration: string;
  difficulty: 'Standard' | 'Advanced' | 'Expert';
  deliverables: string[];
  techStack: string[];
  architectureDiagram: {
    client: string;
    gateway: string;
    services: string[];
    database: string;
  };
}

const SERVICES_DATA: ServiceDetail[] = [
  {
    id: 'web-apps',
    title: 'Custom Web Applications',
    tagline: 'High-performance React & Next.js systems engineered with precision.',
    icon: Code,
    shortDesc: 'Modern responsive web systems built with Vite, React, and Tailwind CSS. Tailored to dynamic, real-time responsive workflows.',
    longDesc: 'We construct lightning-fast, modular web applications optimized for speed, safety, and seamless responsive performance. Leveraging advanced state management, lightweight bundle delivery, and component-driven micro-interactions to create a robust frontend.',
    duration: '2 - 4 Weeks',
    difficulty: 'Standard',
    deliverables: [
      'Responsive, modular React/Next.js frontend framework',
      'Advanced Tailwind design system matching your corporate brand',
      'State synchronization engine (Zustand, React Context)',
      'Optimized Core Web Vitals and SEO readiness'
    ],
    techStack: ['React', 'Next.js', 'Vite', 'Tailwind CSS', 'TypeScript', 'Motion'],
    architectureDiagram: {
      client: 'Modern Web Browser / Mobile Touchscreen',
      gateway: 'Vite / Next.js Vercel Router',
      services: ['Client UI Framework', 'Dynamic Responsive Router', 'Local Cache Controller'],
      database: 'Local Session Storage / API Sync'
    }
  },
  {
    id: 'backend-systems',
    title: 'Scalable Backends & APIs',
    tagline: 'Fault-tolerant, high-concurrency server pipelines and REST/GraphQL APIs.',
    icon: Server,
    shortDesc: 'Server infrastructures engineered in Node.js, Express, and Go to handle extreme database transactions and API routing.',
    longDesc: 'Our backend designs focus on extreme data concurrency, modular route planning, and strict security protocol execution. We build high-speed APIs, message-brokers, and multi-tenant systems designed to support high request volume.',
    duration: '3 - 6 Weeks',
    difficulty: 'Advanced',
    deliverables: [
      'Comprehensive REST or GraphQL API endpoints with OpenAPI specs',
      'Secure JSON Web Token (JWT) or session authentication gates',
      'Middleware layers for telemetry, rate-limiting, and error-catching',
      'Integrated test suite covering endpoints and data validations'
    ],
    techStack: ['Node.js', 'Express', 'Go (Golang)', 'FastAPI', 'JWT Auth', 'Swagger / OpenAPI'],
    architectureDiagram: {
      client: 'SPA client / Mobile App / Webhooks',
      gateway: 'Nginx Reverse Proxy & Cloud Run Ingress',
      services: ['REST API Controllers', 'Authentication Gateway', 'Telemetry & Loggers'],
      database: 'PostgreSQL DB / Redis Memory Store'
    }
  },
  {
    id: 'database-infra',
    title: 'Database Architecture & Cloud',
    tagline: 'Secure, relational, and real-time database schema modeling.',
    icon: Database,
    shortDesc: 'Production-ready database planning, indexing, and migration using PostgreSQL, Cloud Spanner, and Firestore.',
    longDesc: 'We specialize in designing efficient schema structures, writing optimized query layers, and configuring bulletproof hosting infrastructure. We ensure low-latency indexing, secure Row Level Security (RLS) configurations, and reliable backup schedules.',
    duration: '2 - 3 Weeks',
    difficulty: 'Advanced',
    deliverables: [
      'Pragmatic database schema models & entity relations diagrams',
      'Highly optimized compound indexes and caching schemes',
      'CI/CD deployment script templates (Terraform, Docker Compose)',
      'Secure Firestore / PostgreSQL connection pooling configurations'
    ],
    techStack: ['PostgreSQL', 'Firestore', 'Cloud Spanner', 'Redis Cache', 'Docker', 'Drizzle ORM'],
    architectureDiagram: {
      client: 'App Servers / Compute Instances',
      gateway: 'Database Connection Pool Manager (PgBouncer)',
      services: ['Primary DB Instance', 'Read Replicas', 'In-Memory Cache Cache Store'],
      database: 'Durable Relational Disk (Encrypted at Rest)'
    }
  },
  {
    id: 'cloud-scale',
    title: 'Cloud Orchestration & DevOps',
    tagline: 'Automated CI/CD workflows and serverless horizontal scaling structures.',
    icon: Cloud,
    shortDesc: 'Containerized deployment via Docker and Google Cloud Run, backed by automated GitHub Actions build systems.',
    longDesc: 'Say goodbye to fragile deployment routines. We build robust, declarative infrastructure pipelines. All our applications are containerized and deployed to serverless scaling cloud engines, optimizing operational spend while ensuring maximum uptime.',
    duration: '1 - 2 Weeks',
    difficulty: 'Standard',
    deliverables: [
      'Fully customized GitHub Actions pipeline files (.github/workflows)',
      'Secure, lightweight production Dockerfiles with multi-stage builds',
      'Cloud Run or Kubernetes service descriptor templates',
      'Environment variable and API secret keys provisioning maps'
    ],
    techStack: ['Docker', 'Google Cloud Run', 'GitHub Actions', 'Google Cloud Platform', 'AWS', 'Vercel'],
    architectureDiagram: {
      client: 'Developer Git Push / Release Trigger',
      gateway: 'GitHub Actions Build Runner',
      services: ['Docker Container Compiler', 'Security Vulnerability Auditor', 'Cloud Artifact Registry'],
      database: 'Serverless Cloud Container Ingress'
    }
  },
  {
    id: 'ai-integration',
    title: 'AI & Large Language Models',
    tagline: 'Smarter business systems driven by modern Gemini & generative AI models.',
    icon: Brain,
    shortDesc: 'Cognitive features, automated categorization, and intelligent search engines powered by Gemini API.',
    longDesc: 'We integrate semantic reasoning and generation into regular line-of-business software. From real-time meeting summarizers and automated text categorization to search grounding and custom agents, we harness AI for real commercial workflows.',
    duration: '2 - 5 Weeks',
    difficulty: 'Expert',
    deliverables: [
      'Gemini API server-side proxy routes and token managers',
      'Vector search integration or smart database tagging schemas',
      'Clean prompt templates and structured JSON parsing wrappers',
      'Robust graceful fallback states for rate limits or missing keys'
    ],
    techStack: ['Google Gemini API', '@google/genai SDK', 'LangChain', 'Pinecone / Vector DB', 'Python / TS'],
    architectureDiagram: {
      client: 'Client Chat Interface / Data Grid',
      gateway: 'Server Proxy API Route (Secured Secret Keys)',
      services: ['Gemini Model Handler', 'Context Injector / Vector Router', 'Output Parser & Sanitizer'],
      database: 'Durable Logs & Structured Agent States'
    }
  }
];

interface OurServicesProps {
  onPlanProject: () => void;
}

export default function OurServices({ onPlanProject }: OurServicesProps) {
  const [selectedId, setSelectedId] = useState<string>(SERVICES_DATA[0].id);

  const selectedService = SERVICES_DATA.find(s => s.id === selectedId) || SERVICES_DATA[0];
  const IconComponent = selectedService.icon;

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-slate-900 selection:bg-indigo-500/10 selection:text-indigo-900 pb-24">
      
      {/* Sleek Minimalist Apple-style Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center space-y-4">
        <span className="text-xs font-semibold text-indigo-600 tracking-widest uppercase">CORE CATALOG</span>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#1d1d1f]">
          Architected Software Services
        </h1>
        <p className="text-slate-500 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Bytexon translates intricate system requirements into polished, scale-ready digital products with optimized latency.
        </p>
      </section>

      {/* Main Services Interactive Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
        
        {/* Left Column - Service Selector list */}
        <div className="lg:col-span-4 space-y-4">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block pl-1">
            Browse Services
          </span>
          <div className="flex flex-col gap-2.5">
            {SERVICES_DATA.map((service) => {
              const ServiceIcon = service.icon;
              const isSelected = service.id === selectedId;
              
              return (
                <button
                  key={service.id}
                  onClick={() => setSelectedId(service.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center gap-4 cursor-pointer ${
                    isSelected 
                      ? 'bg-white border-slate-200 shadow-sm' 
                      : 'bg-transparent border-transparent hover:bg-slate-100/60'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl border shrink-0 transition-all ${
                    isSelected 
                      ? 'bg-[#1d1d1f] border-[#1d1d1f] text-white' 
                      : 'bg-[#f5f5f7] border-slate-200/50 text-slate-500'
                  }`}>
                    <ServiceIcon className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-[#1d1d1f] text-sm flex items-center justify-between">
                      <span>{service.title}</span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform shrink-0 text-slate-400 ${
                        isSelected ? 'translate-x-0.5 text-indigo-600' : ''
                      }`} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Info Box */}
          <div className="bg-[#f5f5f7] border border-black/[0.02] rounded-3xl p-6 space-y-4 mt-8">
            <h4 className="font-bold text-sm text-[#1d1d1f]">
              Need specialized systems?
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our architects craft highly custom digital specifications matching unique corporate criteria. Calculate estimate directly.
            </p>
            <button
              onClick={onPlanProject}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-full text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
            >
              <span>Launch Project Planner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column - Selected Service Deep Dive Card */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
              className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8"
            >
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600 shrink-0">
                    <IconComponent className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#1d1d1f]">
                      {selectedService.title}
                    </h2>
                    <p className="text-xs font-medium text-indigo-600">
                      {selectedService.tagline}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-1.5 shrink-0">
                  <div className="inline-flex items-center space-x-1 bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-full text-slate-600 text-[10px] font-semibold">
                    <Clock className="w-3 h-3 text-slate-400 mr-1" />
                    <span>{selectedService.duration}</span>
                  </div>
                  <div className={`inline-flex items-center justify-center space-x-1 px-2.5 py-1 border rounded-full text-[10px] font-semibold ${
                    selectedService.difficulty === 'Expert' 
                      ? 'bg-rose-50 border-rose-100 text-rose-700'
                      : selectedService.difficulty === 'Advanced'
                      ? 'bg-amber-50 border-amber-100 text-amber-700'
                      : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                  }`}>
                    <Cpu className="w-3 h-3 mr-1" />
                    <span>{selectedService.difficulty}</span>
                  </div>
                </div>
              </div>

              {/* Long Description */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                  Service Description
                </span>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {selectedService.longDesc}
                </p>
              </div>

              {/* Technologies Included */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                  Integrated Technologies
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedService.techStack.map((tech) => (
                    <span 
                      key={tech} 
                      className="px-3 py-1 bg-slate-50 border border-slate-200/50 text-slate-600 text-xs rounded-full hover:bg-slate-100 transition-colors"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* High-Level Deliverables */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                  Standard Deliverables
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedService.deliverables.map((item, index) => (
                    <div 
                      key={index} 
                      className="flex items-start gap-2.5 bg-slate-50 border border-slate-200/30 rounded-2xl p-3.5 text-xs text-slate-600"
                    >
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Architecture Blueprint Section */}
              <div className="pt-6 border-t border-slate-100 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                    Architectural Blueprint
                  </span>
                  <span className="text-[9px] font-mono font-bold bg-pink-50 text-pink-600 border border-pink-100/80 px-2 py-0.5 rounded-full">
                    LIVE DATA FLOW
                  </span>
                </div>

                <div className="bg-[#1d1d1f] rounded-2xl p-5 text-slate-300 space-y-4 overflow-x-auto border border-black/10 select-none font-sans text-xs">
                  {/* Layer 1: Client Ingress */}
                  <div className="flex items-center justify-between bg-white/[0.03] p-3 border border-white/[0.05] rounded-xl hover:bg-white/[0.06] transition-all group">
                    <span className="text-indigo-400 font-semibold tracking-wider uppercase text-[10px]">Client Source</span>
                    <span className="text-slate-200 font-medium">{selectedService.architectureDiagram.client}</span>
                  </div>

                  {/* Flow Arrow */}
                  <div className="flex justify-center text-slate-600 text-[10px]">
                    ▼ Secure SSL Connection (JWT)
                  </div>

                  {/* Layer 2: Routing / Ingress Gateway */}
                  <div className="flex items-center justify-between bg-white/[0.03] p-3 border border-white/[0.05] rounded-xl hover:bg-white/[0.06] transition-all group">
                    <span className="text-cyan-400 font-semibold tracking-wider uppercase text-[10px]">Ingress Controller</span>
                    <span className="text-slate-200 font-medium">{selectedService.architectureDiagram.gateway}</span>
                  </div>

                  {/* Flow Arrow */}
                  <div className="flex justify-center text-slate-600 text-[10px]">
                    ▼ Rate-Limited Resource Routing
                  </div>

                  {/* Layer 3: Services & Controllers */}
                  <div className="bg-white/[0.03] p-4 border border-white/[0.05] rounded-xl hover:bg-white/[0.06] transition-all space-y-2">
                    <span className="text-emerald-400 font-semibold tracking-wider uppercase text-[10px] block">Dedicated Microservices</span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedService.architectureDiagram.services.map((srv, i) => (
                        <span key={i} className="bg-black/30 border border-white/[0.04] text-slate-300 px-2 py-0.5 rounded text-[10px]">
                          {srv}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Flow Arrow */}
                  <div className="flex justify-center text-slate-600 text-[10px]">
                    ▼ Direct Schema Transaction
                  </div>

                  {/* Layer 4: Storage DB */}
                  <div className="flex items-center justify-between bg-white/[0.03] p-3 border border-white/[0.05] rounded-xl hover:bg-white/[0.06] transition-all group">
                    <span className="text-amber-400 font-semibold tracking-wider uppercase text-[10px]">Durable Store</span>
                    <span className="text-slate-200 font-medium">{selectedService.architectureDiagram.database}</span>
                  </div>
                </div>
              </div>

              {/* Action Area */}
              <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-slate-100 gap-4 bg-slate-50 -mx-6 -mb-6 p-6 rounded-b-3xl mt-4">
                <div className="text-xs text-slate-500 text-center sm:text-left leading-relaxed max-w-sm">
                  Ready to map this architectural blueprint to your budget? Access our interactive planner to secure pricing.
                </div>
                <button
                  onClick={onPlanProject}
                  className="w-full sm:w-auto shrink-0 py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-full text-xs transition-all cursor-pointer shadow-sm"
                >
                  <span>Launch Project Planner</span>
                </button>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

      </section>
    </div>
  );
}
