import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
 FileSearch, PenTool, GitBranch, ShieldAlert, Rocket, MessageSquare, 
 Check, ArrowRight, Sparkles, ClipboardList, Target, Milestone, UserCheck 
} from 'lucide-react';

interface ProcessStep {
 stepNumber: number;
 id: string;
 title: string;
 phase: string;
 icon: React.ComponentType<any>;
 duration: string;
 shortDesc: string;
 detailedDesc: string;
 clientRole: string;
 deliverables: string[];
 checklist: string[];
}

const PROCESS_STEPS: ProcessStep[] = [
 {
 stepNumber: 1,
 id: 'scope',
 title: 'Requirement Formulation',
 phase: 'Phase 01: Discovery',
 icon: FileSearch,
 duration: '1 - 2 Days',
 shortDesc: 'Submit project parameters, budget limits, and general descriptions via our interactive planner.',
 detailedDesc: 'Our technical team analyzes your project parameters, user flows, and integrations. We clarify any ambiguous constraints and formalize the functional requirements document to establish a transparent baseline.',
 clientRole: 'Provide clear user scenarios, target budget, and specific business goals.',
 deliverables: [
 'Refined requirements overview document',
 'Recommended standard pricing tier estimate',
 'Unique Tracking Space identifier'
 ],
 checklist: [
 'Formulate core project objectives',
 'Estimate monthly user activity',
 'Establish technical third-party dependencies'
 ]
 },
 {
 stepNumber: 2,
 id: 'blueprint',
 title: 'Architectural Blueprinting',
 phase: 'Phase 02: Design',
 icon: PenTool,
 duration: '2 - 4 Days',
 shortDesc: 'Draft relational database schemas, type maps, and responsive user layout blueprints.',
 detailedDesc: 'Before writing any code, we map out the complete architectural blueprint. This includes relational Postgres / Firestore schemas, API endpoint specs, security parameters, and modular UI layouts. This ensures bulletproof, scale-ready systems.',
 clientRole: 'Review mock schemas, approve layout visual design system direction.',
 deliverables: [
 'Interactive wireframe layouts',
 'Database entity-relation schema map',
 'Detailed API route directory'
 ],
 checklist: [
 'Verify schema fields map logically to goals',
 'Approve design typography and theme colors',
 'Confirm security authentication guidelines'
 ]
 },
 {
 stepNumber: 3,
 id: 'milestones',
 title: 'Agile Feature Iterations',
 phase: 'Phase 03: Development',
 icon: GitBranch,
 duration: '1 - 3 Weeks',
 shortDesc: 'We construct your application in rapid, containerized sprints, integrating features incrementally.',
 detailedDesc: 'Our engineering squad writes modular React frontend components and secure backend endpoints. We follow strict TypeScript type guidelines, preventing run-time exceptions and ensuring a durable foundation.',
 clientRole: 'Test incremental releases and provide feature-level feedback loops.',
 deliverables: [
 'Modular TypeScript codebase',
 'Integrated API middleware functions',
 'Fluid page and view transitions'
 ],
 checklist: [
 'Verify button and form states on mobile viewport',
 'Ensure form validation handles incorrect formats',
 'Inspect local caching and bundle sizes'
 ]
 },
 {
 stepNumber: 4,
 id: 'portal',
 title: 'Client Tracking Workspace',
 phase: 'Phase 04: Monitoring',
 icon: MessageSquare,
 duration: 'Continuous',
 shortDesc: 'Access your dedicated, real-time Bytexon Portal to watch logs, chat with lead architects, and verify milestones.',
 detailedDesc: 'This is where Bytexon excels. You receive an exclusive, secure tracking workspace. Log in using your BTX tracking ID to chat directly with tech leads, review real-time feedback, upload assets, and coordinate payments via secure UPI QR codes.',
 clientRole: 'Monitor progress updates, provide input in real-time chat, upload required assets.',
 deliverables: [
 'Live tracking dashboard accessible 24/7',
 'Direct chat line with Bytexon Lead Architect',
 'Secure ledger logs detailing payment verifications'
 ],
 checklist: [
 'Save tracking ID in browser local storage',
 'Review architect developer notes and comments',
 'Confirm budget allocations and billing verifications'
 ]
 },
 {
 stepNumber: 5,
 id: 'testing',
 title: 'Verification & QA Check',
 phase: 'Phase 05: Hardening',
 icon: ShieldAlert,
 duration: '2 - 4 Days',
 shortDesc: 'Rigorous manual and automated test sweeps covering responsiveness, security, and schema edge cases.',
 detailedDesc: 'We perform complete integration tests, performance tuning, and layout QA under simulated load constraints. We review API endpoint speeds, check secure connection pooling, and verify that mobile touch targets remain accessible.',
 clientRole: 'Conduct final User Acceptance Testing (UAT) and log minor UI adjustments.',
 deliverables: [
 'QA resolution log and performance scores',
 'Secured backend endpoints matching security policies',
 'Fully checked mobile responsive screens'
 ],
 checklist: [
 'Confirm page loads in under 1.5 seconds',
 'Validate form submissions with special characters',
 'Cross-check layout consistency on iOS & Android devices'
 ]
 },
 {
 stepNumber: 6,
 id: 'launch',
 title: 'Cloud Run Launch',
 phase: 'Phase 06: Rollout',
 icon: Rocket,
 duration: '1 - 2 Days',
 shortDesc: 'Application is bundled, containerized with Docker, and deployed serverless onto Cloud Run.',
 detailedDesc: 'We package your application in a production-ready multi-stage Docker container. We deploy this to a serverless scaling engine, establishing reliable CDN endpoints, and configure automated analytics dashboards.',
 clientRole: 'Formally receive production codebase ownership; configure your permanent custom domain.',
 deliverables: [
 'Deployable production Docker bundle',
 'Vite/Next production assets (.dist folder)',
 '30-Day post-launch SLA technical maintenance'
 ],
 checklist: [
 'Assign custom domain DNS entries',
 'Verify serverless autoscaling ranges',
 'Hand over administrative keys and parameters'
 ]
 }
];

interface WorkProcessProps {
 onPlanProject: () => void;
}

export default function WorkProcess({ onPlanProject }: WorkProcessProps) {
 const [activeStepId, setActiveStepId] = useState<string>('scope');
 const selectedStep = PROCESS_STEPS.find(s => s.id === activeStepId) || PROCESS_STEPS[0];
 const StepIcon = selectedStep.icon;

 return (
 <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white pb-16">
 {/* Header Banner */}
 <section className="bg-white border-b-4 border-slate-900 py-20 px-6 sm:px-12 relative overflow-hidden">
 {/* Glow meshes */}
 <div className="absolute -left-12 -top-12 w-64 h-64 bg-emerald-300 rounded-full blur-3xl opacity-25 pointer-events-none"></div>
 <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-indigo-300 rounded-full blur-3xl opacity-25 pointer-events-none"></div>
 <div className="absolute inset-0 bg-grid-slate-100 opacity-60"></div>
 <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
 <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-100 to-emerald-200 border-2 border-slate-900 px-4 py-1.5 rounded-2xl text-slate-900 text-xs font-bold font-mono shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]">
 <Milestone className="w-4 h-4 text-emerald-600 animate-pulse" />
 <span>STRUCTURED AGILE LIFECYCLE</span>
 </div>
 <h1 className="text-4xl sm:text-5xl font-sans font-bold text-slate-900 leading-none">
 HOW BYTEXON <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600">DELIVERS SOFTWARE</span>
 </h1>
 <p className="text-slate-600 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-mono ">
 From initial requirement draft to serverless container deployment. We leverage systematic milestones, deep architectural plans, and a dedicated tracking portal.
 </p>
 </div>
 </section>

 {/* Interactive Process Pipeline */}
 <section className="max-w-7xl w-full mx-auto px-6 py-12 sm:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
 
 {/* Left Column - Process Stepper (Col Span: 5) */}
 <div className="lg:col-span-5 space-y-6">
 <div className="text-[10px] font-mono font-bold text-slate-400 pl-1">
 // EXECUTION PIPELINE MILESTONES_
 </div>

 <div className="relative pl-6 border-l-4 border-slate-900 space-y-5 ml-4">
 {PROCESS_STEPS.map((step) => {
 const isSelected = step.id === activeStepId;

 return (
 <div key={step.id} className="relative">
 {/* Step Bubble Indicator */}
 <button 
 onClick={() => setActiveStepId(step.id)}
 className={`absolute -left-[41px] top-1.5 w-9 h-9 rounded-full border-2 flex items-center justify-center font-mono text-xs font-bold cursor-pointer transition-all ${
 isSelected
 ? 'bg-emerald-400 border-slate-900 text-slate-950 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] scale-110 z-10'
 : 'bg-white border-slate-250 text-slate-500 hover:border-slate-900 hover:text-slate-900'
 }`}
 >
 0{step.stepNumber}
 </button>

 {/* Step Brief Card */}
 <div
 onClick={() => setActiveStepId(step.id)}
 className={`p-4 rounded-2xl border-2 text-left cursor-pointer transition-all group ${
 isSelected
 ? 'bg-white border-slate-900 shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]'
 : 'bg-transparent border-transparent hover:bg-white hover:border-slate-900 hover:shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]'
 }`}
 >
 <div className="flex items-center gap-2">
 <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border ${
 isSelected ? 'bg-emerald-50 border-emerald-300 text-emerald-850' : 'bg-slate-100 border-slate-200 text-slate-500'
 }`}>
 {step.phase}
 </span>
 <span className="text-slate-300">•</span>
 <span className="text-[9px] font-mono text-slate-500 font-bold ">
 {step.duration}
 </span>
 </div>
 <h3 className="font-sans font-bold text-slate-900 text-sm mt-1.5 group-hover:text-emerald-600 transition-colors">
 {step.title}
 </h3>
 <p className="text-slate-500 text-[11px] leading-relaxed mt-1 line-clamp-2 font-medium">
 {step.shortDesc}
 </p>
 </div>
 </div>
 );
 })}
 </div>
 </div>

 {/* Right Column - Step Detail Deep Dive (Col Span: 7) */}
 <div className="lg:col-span-7">
 <AnimatePresence mode="wait">
 <motion.div
 key={activeStepId}
 initial={{ opacity: 0, y: 15 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -15 }}
 transition={{ duration: 0.18 }}
 className="bg-white border-2 border-slate-900 rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] space-y-8"
 >
 {/* Stepper Detail Header */}
 <div className="flex items-center justify-between border-b-2 border-slate-100 pb-6 gap-4">
 <div className="flex items-center gap-4">
 <div className="p-4 bg-emerald-100 border-2 border-slate-900 rounded-2xl text-emerald-700 shrink-0 shadow-[3px_3px_0px_0px_rgba(16,185,129,1)]">
 <StepIcon className="w-6 h-6 stroke-[2.5]" />
 </div>
 <div>
 <span className="text-[9px] font-mono font-bold text-emerald-600 block mb-1">
 {selectedStep.phase} • STEP 0{selectedStep.stepNumber}
 </span>
 <h2 className="text-xl sm:text-2xl font-sans font-bold text-slate-900 ">
 {selectedStep.title}
 </h2>
 </div>
 </div>

 <div className="bg-slate-100 border-2 border-slate-900 px-3 py-1.5 rounded-xl text-slate-900 text-xs font-bold font-mono shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] shrink-0">
 {selectedStep.duration}
 </div>
 </div>

 {/* Detailed Explanation */}
 <div className="space-y-3">
 <h3 className="text-[10px] font-mono font-bold text-slate-450 border-l-2 border-slate-900 pl-2">
 // PHASE OBJECTIVES & CONTEXT_
 </h3>
 <p className="text-slate-700 text-xs sm:text-sm leading-relaxed font-sans font-medium">
 {selectedStep.detailedDesc}
 </p>
 </div>

 {/* Client Role & Action Required */}
 <div className="bg-indigo-50/70 border-2 border-slate-900 rounded-2xl p-5 space-y-3 shadow-[4px_4px_0px_0px_rgba(99,102,241,0.15)]">
 <h4 className="text-[9px] font-mono font-bold text-indigo-900 flex items-center gap-1.5">
 <UserCheck className="w-4 h-4 text-indigo-600 stroke-[2.5]" />
 <span>CLIENT ACCOUNTABILITY WORKFLOW_</span>
 </h4>
 <p className="text-xs text-slate-700 leading-relaxed font-sans font-semibold ">
 {selectedStep.clientRole}
 </p>
 </div>

 {/* Checklist & Deliverables Split */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
 {/* Deliverables Column */}
 <div className="space-y-3.5">
 <h4 className="text-[10px] font-mono font-bold text-slate-450 border-l-2 border-slate-900 pl-2">
 // DELIVERABLES_
 </h4>
 <div className="space-y-2">
 {selectedStep.deliverables.map((del, i) => (
 <div key={i} className="flex items-start gap-3 text-[10px] font-mono font-bold text-slate-800 bg-slate-50 border-2 border-slate-900 p-3.5 rounded-2xl shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
 <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
 <span className="leading-relaxed">{del}</span>
 </div>
 ))}
 </div>
 </div>

 {/* Checklist Column */}
 <div className="space-y-3.5">
 <h4 className="text-[10px] font-mono font-bold text-slate-450 border-l-2 border-slate-900 pl-2">
 // AGILE QUALITY CHECKLIST_
 </h4>
 <div className="space-y-2">
 {selectedStep.checklist.map((item, i) => (
 <div key={i} className="flex items-start gap-3 text-[10px] font-mono font-bold text-slate-800 bg-slate-50 border-2 border-slate-900 p-3.5 rounded-2xl shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
 <div className="w-4 h-4 rounded-md border-2 border-slate-900 flex items-center justify-center text-[8px] text-indigo-600 font-bold shrink-0 bg-white">
 ✓
 </div>
 <span className="leading-relaxed">{item}</span>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* Secure Spaces CTA */}
 <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t-2 border-slate-150 gap-4 bg-slate-50 -mx-6 -mb-6 p-6 rounded-b-3xl border-slate-900 mt-4">
 <div className="text-xs text-slate-600 text-center sm:text-left leading-relaxed max-w-sm font-medium">
 Our system-generated tracking gates are deployed instantly upon submission. Establish your project parameters today.
 </div>
 <button
 onClick={onPlanProject}
 className="w-full sm:w-auto shrink-0 py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-sans font-bold rounded-xl text-xs transition-all cursor-pointer border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-y-0.5 active:translate-x-0.5 active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]"
 >
 <span>Secure Project Space</span>
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
