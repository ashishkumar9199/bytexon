import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Code, Server, Database, Cloud, Brain, Shield, Sparkles, 
  ChevronRight, ArrowRight, Clock, Cpu, Layers, CheckCircle2 
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Header */}
      <section className="bg-white border-b border-slate-200 py-16 px-6 sm:px-12 relative overflow-hidden">
        {/* Subtle decorative mesh background */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] opacity-60"></div>
        
        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center space-x-1.5 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full text-indigo-700 text-xs font-semibold font-mono tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Premium Core Offerings</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
            High-Performance Software Services
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-sans">
            Bytexon translates complex system constraints into clean, high-performance web applications, reliable APIs, and production-hardened database systems.
          </p>
        </div>
      </section>

      {/* Main Services Container */}
      <section className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 sm:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Service Selector Menu (Col Span: 4) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase pl-1 mb-2">
            Service Catalog
          </div>
          <div className="flex flex-col gap-2">
            {SERVICES_DATA.map((service) => {
              const ServiceIcon = service.icon;
              const isSelected = service.id === selectedId;
              
              return (
                <button
                  key={service.id}
                  onClick={() => setSelectedId(service.id)}
                  className={`w-full text-left p-4 rounded-lg border transition-all flex items-start gap-3 cursor-pointer group ${
                    isSelected 
                      ? 'bg-white border-indigo-600 shadow-sm shadow-indigo-100' 
                      : 'bg-transparent border-slate-200 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className={`p-2 rounded-md shrink-0 transition-colors ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'
                  }`}>
                    <ServiceIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-display font-extrabold text-slate-900 text-sm tracking-tight flex items-center justify-between">
                      <span>{service.title}</span>
                      <ChevronRight className={`w-4 h-4 transition-transform shrink-0 ${
                        isSelected ? 'text-indigo-600 translate-x-1' : 'text-slate-400 group-hover:translate-x-0.5'
                      }`} />
                    </div>
                    <p className="text-slate-500 text-xs mt-0.5 truncate leading-relaxed">
                      {service.shortDesc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-5 mt-6 space-y-3 text-center lg:text-left">
            <h4 className="font-display font-bold text-xs text-indigo-900 uppercase tracking-wide">
              Have unique specifications?
            </h4>
            <p className="text-xs text-indigo-700 leading-relaxed">
              Our architects craft tailored plans matching custom requirements. Use our interactive planner to secure an estimation.
            </p>
            <button
              onClick={onPlanProject}
              className="w-full mt-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-1 cursor-pointer"
            >
              <span>Launch Project Planner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column - Selected Service Deep Dive (Col Span: 8) */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedId}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm space-y-6"
            >
              {/* Header Profile */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-6">
                <div className="flex items-start gap-4">
                  <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-600 shrink-0">
                    <IconComponent className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-xl font-display font-extrabold text-slate-900 tracking-tight">
                      {selectedService.title}
                    </h2>
                    <p className="text-xs font-mono font-medium text-indigo-600 uppercase tracking-wider">
                      {selectedService.tagline}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 shrink-0">
                  <div className="inline-flex items-center space-x-1.5 bg-slate-100 px-3 py-1 rounded-full text-slate-700 text-xs font-semibold">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{selectedService.duration}</span>
                  </div>
                  <div className={`inline-flex items-center justify-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedService.difficulty === 'Expert' 
                      ? 'bg-rose-50 text-rose-700 border border-rose-100'
                      : selectedService.difficulty === 'Advanced'
                      ? 'bg-amber-50 text-amber-700 border border-amber-100'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  }`}>
                    <Cpu className="w-3.5 h-3.5" />
                    <span>{selectedService.difficulty} Stack</span>
                  </div>
                </div>
              </div>

              {/* Long Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Service Description
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {selectedService.longDesc}
                </p>
              </div>

              {/* Technologies Included */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Tech Stack Integration
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {selectedService.techStack.map((tech) => (
                    <span 
                      key={tech} 
                      className="px-2.5 py-1 bg-slate-50 border border-slate-250 text-slate-700 font-mono text-[10px] font-bold rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* High-Level Deliverables */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Standard Deliverables
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedService.deliverables.map((item, index) => (
                    <div 
                      key={index} 
                      className="flex items-start gap-2 bg-slate-50/50 border border-slate-100 rounded-md p-3 text-xs text-slate-600"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="leading-relaxed font-sans">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Architecture Blueprint Section */}
              <div className="border-t border-slate-100 pt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Recommended Architectural Blueprint</span>
                  </h3>
                  <span className="text-[9px] font-mono font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded uppercase">
                    Interactive Preview
                  </span>
                </div>

                <div className="bg-slate-900 rounded-lg p-4 font-mono text-[11px] text-slate-300 space-y-3.5 overflow-x-auto select-none">
                  {/* Layer 1: Client Ingress */}
                  <div className="flex items-center justify-between bg-slate-800/60 p-2 border border-slate-700/50 rounded-md">
                    <span className="text-indigo-400 font-bold">Client Side</span>
                    <span className="text-slate-400">{selectedService.architectureDiagram.client}</span>
                  </div>

                  {/* Flow Arrow */}
                  <div className="flex justify-center my-1 text-slate-500 h-3 leading-none">↓ HTTPS API / JSON</div>

                  {/* Layer 2: Routing / Ingress Gateway */}
                  <div className="flex items-center justify-between bg-slate-800/60 p-2 border border-slate-700/50 rounded-md">
                    <span className="text-cyan-400 font-bold">Ingress Gateway</span>
                    <span className="text-slate-400">{selectedService.architectureDiagram.gateway}</span>
                  </div>

                  {/* Flow Arrow */}
                  <div className="flex justify-center my-1 text-slate-500 h-3 leading-none">↓ Cluster VPC routing</div>

                  {/* Layer 3: Services & Controllers */}
                  <div className="bg-slate-800/60 p-3 border border-slate-700/50 rounded-md space-y-1.5">
                    <span className="text-emerald-400 font-bold block mb-1 border-b border-slate-700/80 pb-1">Application Layer Services</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedService.architectureDiagram.services.map((srv, i) => (
                        <span key={i} className="bg-slate-900 border border-slate-700 text-slate-300 px-2 py-0.5 rounded text-[10px]">
                          {srv}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Flow Arrow */}
                  <div className="flex justify-center my-1 text-slate-500 h-3 leading-none">↓ Database Pool / Secure Sockets</div>

                  {/* Layer 4: Storage DB */}
                  <div className="flex items-center justify-between bg-slate-800/60 p-2 border border-slate-700/50 rounded-md">
                    <span className="text-amber-400 font-bold">Durable Storage</span>
                    <span className="text-slate-400">{selectedService.architectureDiagram.database}</span>
                  </div>
                </div>
              </div>

              {/* Action Area */}
              <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-100 gap-4">
                <div className="text-xs text-slate-500 text-center sm:text-left leading-relaxed max-w-sm">
                  Ready to draft spec matching this stack? Our project planner lets you calculate cost and secure tracking immediately.
                </div>
                <button
                  onClick={onPlanProject}
                  className="w-full sm:w-auto shrink-0 py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Select & Launch Planner</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

      </section>
    </div>
  );
}
