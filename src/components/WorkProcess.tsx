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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Banner */}
      <section className="bg-white border-b border-slate-200 py-16 px-6 sm:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 opacity-60"></div>
        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center space-x-1.5 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full text-indigo-700 text-xs font-semibold font-mono tracking-wide uppercase">
            <Milestone className="w-3.5 h-3.5" />
            <span>Structured Agile Lifecycle</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
            How Bytexon Delivers Software
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            From initial requirement draft to serverless container deployment. We leverage systematic milestones, deep architectural plans, and a dedicated tracking portal.
          </p>
        </div>
      </section>

      {/* Interactive Process Pipeline */}
      <section className="max-w-7xl w-full mx-auto px-6 py-10 sm:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Process Stepper (Col Span: 5) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase pl-1">
            Execution Pipeline Milestones
          </div>

          <div className="relative pl-6 border-l border-slate-200 space-y-4 ml-3">
            {PROCESS_STEPS.map((step) => {
              const IconComp = step.icon;
              const isSelected = step.id === activeStepId;

              return (
                <div key={step.id} className="relative">
                  {/* Step Bubble Indicator */}
                  <div 
                    onClick={() => setActiveStepId(step.id)}
                    className={`absolute -left-10 top-0.5 w-8 h-8 rounded-full border flex items-center justify-center font-mono text-[11px] font-extrabold cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-100 scale-105'
                        : 'bg-white border-slate-250 text-slate-500 hover:border-slate-350 hover:bg-slate-50'
                    }`}
                  >
                    0{step.stepNumber}
                  </div>

                  {/* Step Brief Card */}
                  <div
                    onClick={() => setActiveStepId(step.id)}
                    className={`p-4 rounded-lg border text-left cursor-pointer transition-all group ${
                      isSelected
                        ? 'bg-white border-indigo-600 shadow-sm'
                        : 'bg-transparent border-transparent hover:bg-white hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono font-bold text-indigo-600 uppercase">
                        {step.phase}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[9px] font-mono text-slate-400 font-semibold uppercase">
                        {step.duration}
                      </span>
                    </div>
                    <h3 className="font-display font-extrabold text-slate-900 text-sm tracking-tight mt-0.5 group-hover:text-indigo-600 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-slate-500 text-[11px] leading-relaxed mt-1 line-clamp-2">
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
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm space-y-6"
            >
              {/* Stepper Detail Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-600">
                    <StepIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-extrabold text-indigo-600 uppercase tracking-widest block leading-none mb-1">
                      {selectedStep.phase} • Step 0{selectedStep.stepNumber}
                    </span>
                    <h2 className="text-lg sm:text-xl font-display font-extrabold text-slate-900 tracking-tight leading-none">
                      {selectedStep.title}
                    </h2>
                  </div>
                </div>

                <div className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-slate-700 text-xs font-semibold font-mono shrink-0">
                  {selectedStep.duration}
                </div>
              </div>

              {/* Detailed Explanation */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Phase Objectives & Context</span>
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-sans">
                  {selectedStep.detailedDesc}
                </p>
              </div>

              {/* Client Role & Action Required */}
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-4 space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Client's Active Role</span>
                </h4>
                <p className="text-xs text-indigo-800 leading-relaxed font-sans">
                  {selectedStep.clientRole}
                </p>
              </div>

              {/* Checklist & Deliverables Split */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                {/* Deliverables Column */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Milestone className="w-3.5 h-3.5 text-slate-500" />
                    <span>Tangible Deliverables</span>
                  </h4>
                  <div className="space-y-1.5">
                    {selectedStep.deliverables.map((del, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-100 p-2.5 rounded">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="leading-relaxed font-sans">{del}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Checklist Column */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <ClipboardList className="w-3.5 h-3.5 text-slate-500" />
                    <span>Agile Quality Checklist</span>
                  </h4>
                  <div className="space-y-1.5">
                    {selectedStep.checklist.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-100 p-2.5 rounded">
                        <div className="w-4 h-4 rounded border border-slate-300 flex items-center justify-center text-[10px] text-indigo-600 font-bold font-mono shrink-0 bg-white mt-0.5">
                          ✓
                        </div>
                        <span className="leading-relaxed font-sans">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Secure Spaces CTA */}
              <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-slate-500 text-[11px] leading-relaxed max-w-sm text-center sm:text-left">
                  Our system-generated tracking gates are deployed instantly upon submission. Establish your project parameters today.
                </div>
                <button
                  onClick={onPlanProject}
                  className="w-full sm:w-auto py-2.5 px-5 bg-slate-900 hover:bg-indigo-600 hover:text-white text-white font-bold rounded-md text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer border border-slate-800"
                >
                  <span>Secure Project Space</span>
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
