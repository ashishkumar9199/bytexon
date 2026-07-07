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
 <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white pb-16">
 {/* Hero Header */}
 <section className="bg-white border-b-4 border-slate-900 py-20 px-6 sm:px-12 relative overflow-hidden">
 {/* Colorful decorative glow blobs */}
 <div className="absolute -left-12 -top-12 w-64 h-64 bg-indigo-300 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
 <div className="absolute -right-12 -bottom-12 w-72 h-72 bg-purple-300 rounded-full blur-3xl opacity-35 pointer-events-none"></div>
 <div className="absolute inset-0 bg-grid-slate-100 opacity-60 pointer-events-none"></div>
 
 <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
 <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-100 to-amber-200 border-2 border-slate-900 px-4 py-1.5 rounded-2xl text-slate-900 text-xs font-bold font-mono shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] animate-bounce-slow">
 <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
 <span>PREMIUM CORE OFFERINGS</span>
 </div>
 <h1 className="text-4xl sm:text-5xl font-sans font-bold text-slate-900 leading-none">
 HIGH-PERFORMANCE <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">SOFTWARE SERVICES</span>
 </h1>
 <p className="text-slate-600 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-mono ">
 Bytexon translates complex system constraints into clean, high-performance web applications, reliable APIs, and production-hardened database systems.
 </p>
 </div>
 </section>

 {/* Main Services Container */}
 <section className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 sm:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
 
 {/* Left Column - Service Selector Menu (Col Span: 4) */}
 <div className="lg:col-span-4 space-y-6">
 <div className="text-[10px] font-mono font-bold text-slate-400 pl-1">
 // SERVICE CATALOG_
 </div>
 <div className="flex flex-col gap-3">
 {SERVICES_DATA.map((service) => {
 const ServiceIcon = service.icon;
 const isSelected = service.id === selectedId;
 
 return (
 <button
 key={service.id}
 onClick={() => setSelectedId(service.id)}
 className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-4 cursor-pointer group ${
 isSelected 
 ? 'bg-indigo-50/70 border-slate-900 shadow-[4px_4px_0px_0px_rgba(79,70,229,1)] scale-[1.01]' 
 : 'bg-white border-slate-200 shadow-[2px_2px_0px_0px_rgba(15,23,42,0.05)] hover:border-slate-900 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-0.5 hover:-translate-x-0.5'
 }`}
 >
 <div className={`p-3 rounded-xl border-2 shrink-0 transition-all ${
 isSelected 
 ? 'bg-indigo-600 border-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]' 
 : 'bg-slate-100 border-transparent text-slate-500 group-hover:bg-amber-100 group-hover:border-slate-900 group-hover:text-slate-900'
 }`}>
 <ServiceIcon className="w-5 h-5" />
 </div>
 <div className="min-w-0 flex-1">
 <div className="font-sans font-bold text-slate-900 text-sm flex items-center justify-between ">
 <span>{service.title}</span>
 <ChevronRight className={`w-4 h-4 transition-transform shrink-0 ${
 isSelected ? 'text-indigo-600 translate-x-1 stroke-[3]' : 'text-slate-450 group-hover:translate-x-0.5'
 }`} />
 </div>
 <p className="text-slate-500 text-xs mt-1 truncate leading-relaxed font-sans">
 {service.shortDesc}
 </p>
 </div>
 </button>
 );
 })}
 </div>

 <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-slate-900 rounded-3xl p-6 space-y-4 text-center lg:text-left shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
 <h4 className="font-sans font-bold text-sm text-slate-950 ">
 Have unique specifications?
 </h4>
 <p className="text-xs text-slate-600 leading-relaxed">
 Our architects craft tailored plans matching custom requirements. Use our interactive planner to secure an estimation.
 </p>
 <button
 onClick={onPlanProject}
 className="w-full mt-2 py-3 px-4 bg-amber-400 hover:bg-amber-500 text-slate-950 border-2 border-slate-900 font-sans font-bold rounded-xl text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 active:translate-x-0.5 active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]"
 >
 <span>Launch Project Planner</span>
 <ArrowRight className="w-4 h-4 stroke-[3]" />
 </button>
 </div>
 </div>

 {/* Right Column - Selected Service Deep Dive (Col Span: 8) */}
 <div className="lg:col-span-8">
 <AnimatePresence mode="wait">
 <motion.div
 key={selectedId}
 initial={{ opacity: 0, y: 15 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -15 }}
 transition={{ duration: 0.18 }}
 className="bg-white border-2 border-slate-900 rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] space-y-8"
 >
 {/* Header Profile */}
 <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-slate-100 pb-6">
 <div className="flex items-start gap-4">
 <div className="p-4 bg-indigo-100 border-2 border-slate-900 rounded-2xl text-indigo-700 shrink-0 shadow-[3px_3px_0px_0px_rgba(99,102,241,1)]">
 <IconComponent className="w-8 h-8 stroke-[2.5]" />
 </div>
 <div className="space-y-1.5">
 <h2 className="text-2xl font-sans font-bold text-slate-900 ">
 {selectedService.title}
 </h2>
 <p className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 w-fit rounded-md">
 {selectedService.tagline}
 </p>
 </div>
 </div>

 <div className="flex sm:flex-col gap-2 shrink-0">
 <div className="inline-flex items-center space-x-1.5 bg-slate-100 border-2 border-slate-900 px-3 py-1 rounded-xl text-slate-900 text-xs font-bold font-mono shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
 <Clock className="w-3.5 h-3.5 text-slate-600 stroke-[2.5]" />
 <span>{selectedService.duration}</span>
 </div>
 <div className={`inline-flex items-center justify-center space-x-1.5 px-3 py-1 border-2 border-slate-900 rounded-xl text-xs font-bold font-mono shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] ${
 selectedService.difficulty === 'Expert' 
 ? 'bg-rose-100 text-rose-800'
 : selectedService.difficulty === 'Advanced'
 ? 'bg-amber-100 text-amber-850'
 : 'bg-emerald-100 text-emerald-800'
 }`}>
 <Cpu className="w-3.5 h-3.5 stroke-[2.5]" />
 <span>{selectedService.difficulty}</span>
 </div>
 </div>
 </div>

 {/* Long Description */}
 <div className="space-y-3">
 <h3 className="text-[10px] font-mono font-bold text-slate-450 border-l-2 border-slate-900 pl-2">
 // SERVICE DESCRIPTION_
 </h3>
 <p className="text-slate-700 text-xs sm:text-sm leading-relaxed font-sans font-medium">
 {selectedService.longDesc}
 </p>
 </div>

 {/* Technologies Included */}
 <div className="space-y-3">
 <h3 className="text-[10px] font-mono font-bold text-slate-450 border-l-2 border-slate-900 pl-2">
 // TECH STACK INTEGRATION_
 </h3>
 <div className="flex flex-wrap gap-2">
 {selectedService.techStack.map((tech) => (
 <span 
 key={tech} 
 className="px-3.5 py-1.5 bg-slate-50 border-2 border-slate-900 text-slate-900 font-mono text-[10px] font-bold rounded-xl shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:bg-amber-100 hover:scale-[1.03] transition-all cursor-default"
 >
 {tech}
 </span>
 ))}
 </div>
 </div>

 {/* High-Level Deliverables */}
 <div className="space-y-3.5">
 <h3 className="text-[10px] font-mono font-bold text-slate-450 border-l-2 border-slate-900 pl-2">
 // STANDARD DELIVERABLES_
 </h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 {selectedService.deliverables.map((item, index) => (
 <div 
 key={index} 
 className="flex items-start gap-3 bg-slate-50 border-2 border-slate-900 rounded-2xl p-4 text-xs font-semibold text-slate-800 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]"
 >
 <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 stroke-[2.5]" />
 <span className="leading-relaxed font-mono text-[10px]">{item}</span>
 </div>
 ))}
 </div>
 </div>

 {/* Architecture Blueprint Section */}
 <div className="border-t-2 border-dashed border-slate-200 pt-6 space-y-4">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
 <h3 className="text-xs font-mono font-bold text-slate-900 flex items-center gap-2">
 <Layers className="w-4 h-4 text-indigo-600 stroke-[2.5]" />
 <span>RECOMMENDED ARCHITECTURAL BLUEPRINT</span>
 </h3>
 <span className="text-[9px] font-mono font-bold bg-pink-100 text-pink-700 border-2 border-slate-900 px-2.5 py-1 rounded-lg shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] animate-pulse">
 LIVE DATA ROUTE
 </span>
 </div>

 <div className="bg-slate-950 rounded-2xl p-5 font-mono text-[10px] text-slate-300 space-y-4 overflow-x-auto border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] select-none">
 {/* Layer 1: Client Ingress */}
 <div className="flex items-center justify-between bg-slate-900 p-3 border-2 border-slate-800 rounded-xl hover:border-indigo-500 transition-all duration-150 group">
 <div className="flex items-center gap-2">
 <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping"></span>
 <span className="text-indigo-400 font-bold ">CLIENT SOURCE</span>
 </div>
 <span className="text-slate-200 group-hover:text-indigo-300 transition-colors ">{selectedService.architectureDiagram.client}</span>
 </div>

 {/* Flow Arrow */}
 <div className="flex justify-center my-1 text-slate-500 font-bold animate-pulse ">
 ▼ SECURED SSL HANDSHAKE (JWT READY)
 </div>

 {/* Layer 2: Routing / Ingress Gateway */}
 <div className="flex items-center justify-between bg-slate-900 p-3 border-2 border-slate-800 rounded-xl hover:border-cyan-500 transition-all duration-150 group">
 <div className="flex items-center gap-2">
 <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
 <span className="text-cyan-400 font-bold ">INGRESS CONTROL</span>
 </div>
 <span className="text-slate-200 group-hover:text-cyan-300 transition-colors ">{selectedService.architectureDiagram.gateway}</span>
 </div>

 {/* Flow Arrow */}
 <div className="flex justify-center my-1 text-slate-500 font-bold animate-pulse ">
 ▼ VIRTUAL ROUTER (RATE-LIMITED POOL)
 </div>

 {/* Layer 3: Services & Controllers */}
 <div className="bg-slate-900 p-4 border-2 border-slate-800 rounded-xl hover:border-emerald-500 transition-all duration-150 space-y-2.5">
 <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
 <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
 <span className="text-emerald-400 font-bold ">DEDICATED SERVICES</span>
 </div>
 <div className="flex flex-wrap gap-2">
 {selectedService.architectureDiagram.services.map((srv, i) => (
 <span key={i} className="bg-slate-950 border-2 border-slate-800 text-slate-250 px-2.5 py-1 rounded-lg tracking-wide text-[9px] hover:text-white hover:border-slate-700 transition-all">
 {srv}
 </span>
 ))}
 </div>
 </div>

 {/* Flow Arrow */}
 <div className="flex justify-center my-1 text-slate-500 font-bold animate-pulse ">
 ▼ POOLED CONNECTION (ENCRYPTED)
 </div>

 {/* Layer 4: Storage DB */}
 <div className="flex items-center justify-between bg-slate-900 p-3 border-2 border-slate-800 rounded-xl hover:border-amber-500 transition-all duration-150 group">
 <div className="flex items-center gap-2">
 <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
 <span className="text-amber-400 font-bold ">DURABLE PERSISTENCE</span>
 </div>
 <span className="text-slate-200 group-hover:text-amber-300 transition-colors ">{selectedService.architectureDiagram.database}</span>
 </div>
 </div>
 </div>

 {/* Action Area */}
 <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t-2 border-slate-150 gap-4 bg-slate-50 -mx-6 -mb-6 p-6 rounded-b-3xl border-slate-900 mt-4">
 <div className="text-xs text-slate-600 text-center sm:text-left leading-relaxed max-w-sm font-medium">
 Ready to draft spec matching this stack? Our project planner lets you calculate cost and secure tracking immediately.
 </div>
 <button
 onClick={onPlanProject}
 className="w-full sm:w-auto shrink-0 py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-sans font-bold rounded-xl text-xs transition-all cursor-pointer border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-y-0.5 active:translate-x-0.5 active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]"
 >
 <span>Select & Launch Planner</span>
 <ArrowRight className="w-4 h-4 stroke-[3]" />
 </button>
 </div>

 </motion.div>
 </AnimatePresence>
 </div>

 </section>
 </div>
 );
}
