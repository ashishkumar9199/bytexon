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
    <div className="min-h-screen bg-[#fbfbfd] dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500/10 selection:text-indigo-900 pb-24">
      
      {/* Premium Apple-style Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center space-y-4">
        <span className="text-xs font-semibold text-indigo-600 dark:text-cyan-450 tracking-widest uppercase">AGILE LIFECYCLE</span>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#1d1d1f] dark:text-white">
          How Bytexon Delivers
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          From the initial requirement formulation in our interactive planner to secure cloud deployment, we adhere to strict engineering phases.
        </p>
      </section>

      {/* Interactive Process Pipeline Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
        
        {/* Left Column - Stepper List */}
        <div className="lg:col-span-5 space-y-6">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase block pl-1">
            Execution Pipeline
          </span>

          <div className="relative pl-6 border-l border-slate-200 dark:border-slate-800 space-y-4 ml-4">
            {PROCESS_STEPS.map((step) => {
              const isSelected = step.id === activeStepId;

              return (
                <div key={step.id} className="relative">
                  {/* Step Bubble Indicator */}
                  <button 
                    onClick={() => setActiveStepId(step.id)}
                    className={`absolute -left-[41px] top-1.5 w-8 h-8 rounded-full border flex items-center justify-center text-xs font-semibold cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600 dark:bg-cyan-500 dark:border-cyan-500 dark:text-slate-950 text-white shadow-sm scale-110 z-10'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-550 hover:border-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                  >
                    0{step.stepNumber}
                  </button>

                  {/* Step Card */}
                  <div
                    onClick={() => setActiveStepId(step.id)}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
                        : 'bg-transparent border-transparent hover:bg-slate-100/60 dark:hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className={`font-semibold px-2 py-0.5 rounded-full border ${
                        isSelected 
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400' 
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-200/50 dark:border-slate-750 text-slate-400 dark:text-slate-500'
                      }`}>
                        {step.phase.split(': ')[1] || step.phase}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="font-medium text-slate-400 dark:text-slate-500">
                        {step.duration}
                      </span>
                    </div>
                    <h3 className="font-bold text-[#1d1d1f] dark:text-white text-sm mt-2 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mt-1 line-clamp-2">
                      {step.shortDesc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column - Step Details Panel */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStepId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
              className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8"
            >
              {/* Stepper Detail Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-6 gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-2xl shrink-0">
                    <StepIcon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-cyan-450 tracking-wider uppercase block">
                      {selectedStep.phase}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#1d1d1f] dark:text-white">
                      {selectedStep.title}
                    </h2>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-750 px-3 py-1.5 rounded-full text-slate-600 dark:text-slate-350 text-xs font-semibold shrink-0">
                  {selectedStep.duration}
                </div>
              </div>

              {/* Detailed Description */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase block">
                  Phase Objectives
                </span>
                <p className="text-slate-600 dark:text-slate-350 text-sm leading-relaxed">
                  {selectedStep.detailedDesc}
                </p>
              </div>

              {/* Client Role & Action Required */}
              <div className="bg-indigo-50/30 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 rounded-2xl p-5 space-y-2">
                <h4 className="text-[10px] font-bold text-indigo-700 dark:text-indigo-350 flex items-center gap-1.5 uppercase">
                  <UserCheck className="w-4 h-4 text-indigo-600 dark:text-cyan-450" />
                  <span>Client Accountability</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {selectedStep.clientRole}
                </p>
              </div>

              {/* Checklist & Deliverables Split */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                {/* Deliverables Column */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase block">
                    Deliverables
                  </span>
                  <div className="space-y-2">
                    {selectedStep.deliverables.map((del, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-850 border border-slate-200/30 dark:border-slate-750 p-3.5 rounded-2xl">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-450 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{del}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Checklist Column */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase block">
                    Quality Checklist
                  </span>
                  <div className="space-y-2">
                    {selectedStep.checklist.map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-850 border border-slate-200/30 dark:border-slate-750 p-3.5 rounded-2xl">
                        <div className="w-4 h-4 rounded border border-slate-300 dark:border-slate-700 flex items-center justify-center text-[8px] text-indigo-600 dark:text-cyan-450 font-bold shrink-0 bg-white dark:bg-slate-900 mt-0.5">
                          ✓
                        </div>
                        <span className="leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Secure Spaces CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800 gap-4 bg-slate-50 dark:bg-slate-850/50 -mx-6 -mb-6 p-6 rounded-b-3xl mt-4 border-t dark:border-slate-800/85">
                <div className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left leading-relaxed max-w-sm">
                  Ready to secure a workspace tracking ID matching these development phases? Formulate parameters in our project planner.
                </div>
                <button
                  onClick={onPlanProject}
                  className="w-full sm:w-auto shrink-0 py-2.5 px-5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 font-semibold rounded-full text-xs transition-all cursor-pointer shadow-sm"
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
