import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, doc, setDoc, query, where, getDocs } from 'firebase/firestore';
import { ProjectRequest, AdminConfig } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';
import { motion, AnimatePresence } from 'motion/react';
import BytexonLogo from './BytexonLogo';
import { 
  Briefcase, Send, Shield, Zap, Search, ChevronRight, Check,
  Sparkles, Code, Server, Smartphone, Layers, Globe, Mail, Landmark, MessageSquare, PhoneCall
} from 'lucide-react';

interface ClientLandingProps {
  onAccessPortal: (id: string) => void;
  adminConfig: AdminConfig;
  onLaunchPlanner: (tab?: 'create' | 'track', prefillPrice?: number, prefillDesc?: string) => void;
}

export default function ClientLanding({ onAccessPortal, adminConfig, onLaunchPlanner }: ClientLandingProps) {
  // Standard Pricing from config
  const pricingPlans = [
    {
      name: "Starter Prototype",
      desc: "Perfect for MVPs, landing pages, and validated proof-of-concepts.",
      price: adminConfig.standardPricing?.starter ?? 15000,
      features: [
        "1 Core Prototype Developer",
        "Responsive React Application",
        "Basic Database Schema",
        "Deployable Prototype",
        "Bytexon PM & Architecture support"
      ]
    },
    {
      name: "Professional Web App",
      desc: "Robust full-stack web products built for scaling startups.",
      price: adminConfig.standardPricing?.professional ?? 45000,
      features: [
        "Dedicated Frontend + Backend Engineers",
        "Advanced Security & Authentication",
        "Custom APIs & CRM Integrations",
        "High-scale Postgres / Firestore Storage",
        "30 Days Post-Kickoff SLA Support"
      ],
      popular: true
    },
    {
      name: "Enterprise Solution",
      desc: "Custom high-availability architectures and complex business tooling.",
      price: adminConfig.standardPricing?.enterprise ?? 95000,
      features: [
        "Full Multi-Disciplinary Agile Squad",
        "Cloud-Native Kubernetes Deployment",
        "Real-Time Collaboration Features",
        "Premium SLA Guarantee & Security Audit",
        "Direct CTO Consulting"
      ]
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 selection:bg-indigo-600 selection:text-white">
      {/* Brutalist Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24 px-6 sm:px-12 max-w-7xl mx-auto border-b-2 border-slate-300">
        <div className="max-w-4xl mx-auto text-center space-y-8 flex flex-col items-center">
          
          {/* Centered Logo on top of landing page */}
          <div className="flex justify-center transition-transform hover:scale-102 duration-300">
            <BytexonLogo showText={true} theme="light" height={60} />
          </div>
          
          <div className="inline-flex items-center space-x-2 border border-indigo-200 bg-indigo-50 px-3 py-1 rounded-sm text-indigo-600 text-[11px] font-bold uppercase tracking-widest font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Architectural digital ecosystems</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7.5xl font-display font-black leading-[0.95] uppercase tracking-tighter text-slate-900">
            Engineering <br />
            <span 
              className="text-transparent"
              style={{ WebkitTextStroke: "1px #0f172a" }}
            >
              Digital
            </span> <br />
            Breakthroughs
          </h1>

          <p className="text-slate-700 text-sm sm:text-base leading-relaxed max-w-2xl font-sans text-center">
            Bytexon builds high-performance web products, scalable database backends, and bespoke digital ecosystems. Submit your specifications, track request progression, and chat directly with tech leads.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md pt-4">
            <button
              onClick={() => onLaunchPlanner('create')}
              className="bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white font-sans font-bold py-4 px-6 uppercase text-xs tracking-widest transition-all cursor-pointer border border-indigo-600 rounded-lg flex items-center justify-center space-x-2 shrink-0 shadow-sm font-bold"
            >
              <span>Launch Project Planner</span>
              <ChevronRight className="w-4 h-4 animate-pulse" />
            </button>
            <button
              onClick={() => onLaunchPlanner('track')}
              className="bg-white text-slate-800 hover:bg-slate-50 font-sans font-bold py-4 px-6 uppercase text-xs tracking-widest transition-all cursor-pointer border border-slate-300 rounded-lg flex items-center justify-center space-x-2 shrink-0 font-bold"
            >
              <span>Track Active Workspace</span>
            </button>
          </div>

          {/* Quick stats with brutalist metric boxes */}
          <div className="pt-10 grid grid-cols-3 gap-4 sm:gap-6 border-t border-slate-200 w-full max-w-2xl mt-4">
            <div className="border border-slate-200 p-4 bg-white rounded-lg shadow-sm">
              <p className="text-2xl sm:text-3xl font-display font-black text-indigo-600">100%</p>
              <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mt-1">UPI VERIFIED</p>
            </div>
            <div className="border border-slate-200 p-4 bg-white rounded-lg shadow-sm">
              <p className="text-2xl sm:text-3xl font-display font-black text-indigo-600">&lt; 2 HR</p>
              <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mt-1">TECH REVIEW</p>
            </div>
            <div className="border border-slate-200 p-4 bg-white rounded-lg shadow-sm">
              <p className="text-2xl sm:text-3xl font-display font-black text-indigo-600">LIVE</p>
              <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mt-1">DIRECT CHAT</p>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="py-16 px-6 sm:px-12 max-w-7xl mx-auto text-center space-y-12 border-b-2 border-slate-300">
        <div className="max-w-2xl mx-auto space-y-3">
          <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono">Our capabilities</p>
          <h2 className="text-2xl sm:text-3xl font-display font-black uppercase tracking-tight text-slate-900">
            Architected Solutions For High-Growth Ecosystems
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-mono">
            Bytexon pairs clean product engineering with high-capacity transaction pipelines to deliver production-ready software layouts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-slate-200 p-6 bg-white text-left space-y-4">
            <div className="w-10 h-10 border border-indigo-600 text-indigo-600 flex items-center justify-center font-bold">
              [C]
            </div>
            <h3 className="text-sm font-display font-black uppercase tracking-wider text-slate-900">Custom Web Architectures</h3>
            <p className="text-slate-500 text-xs leading-relaxed font-sans">
              Blazing-fast single page applications constructed with strict, secure code standards using React, Vite, and production-tested API patterns.
            </p>
          </div>

          <div className="border border-slate-200 p-6 bg-white text-left space-y-4">
            <div className="w-10 h-10 border border-indigo-600 text-indigo-600 flex items-center justify-center font-bold">
              [D]
            </div>
            <h3 className="text-sm font-display font-black uppercase tracking-wider text-slate-900">Relational & Cloud Stores</h3>
            <p className="text-slate-500 text-xs leading-relaxed font-sans">
              From Firebase clusters to enterprise Postgres relational servers, we configure highly scalable transaction databases.
            </p>
          </div>

          <div className="border border-slate-200 p-6 bg-white text-left space-y-4">
            <div className="w-10 h-10 border border-indigo-600 text-indigo-600 flex items-center justify-center font-bold">
              [I]
            </div>
            <h3 className="text-sm font-display font-black uppercase tracking-wider text-slate-900">Bespoke System Integrations</h3>
            <p className="text-slate-500 text-xs leading-relaxed font-sans">
              Connecting automated CRM pipelines, secure UPI ledger networks, third-party authentication services, and custom webhook callbacks.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Plans Section */}
      <section id="pricing" className="py-16 px-6 sm:px-12 bg-white border-b-2 border-slate-300">
        <div className="max-w-7xl mx-auto text-center space-y-12">
          <div className="max-w-2xl mx-auto space-y-3">
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono">Standard development plans</p>
            <h2 className="text-2xl sm:text-3xl font-display font-black uppercase tracking-tight text-slate-900">
              Transparent Structural Pricing Rates
            </h2>
            <p className="text-slate-500 text-xs leading-relaxed font-sans">
              Choose a standard developmental blueprint below or initiate the custom project planner to scale up a dedicated multidisciplinary engineering squad.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch max-w-5xl mx-auto text-left">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index}
                className={`bg-slate-50 border-2 p-6 flex flex-col h-full transition-all relative ${
                  plan.popular 
                    ? 'border-indigo-600 shadow-lg shadow-indigo-500/10' 
                    : 'border-slate-300'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-6 px-2 py-0.5 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest">
                    RECOMMENDEDBLUEPRINT
                  </span>
                )}
                
                <div className="space-y-4 flex-grow">
                  <div>
                    <h3 className="text-base font-display font-black uppercase tracking-wider text-slate-900">{plan.name}</h3>
                    <p className="text-slate-500 text-[11px] mt-1 leading-relaxed font-mono">{plan.desc.toUpperCase()}</p>
                  </div>

                  <ul className="space-y-2 py-4 border-t border-b border-slate-200 text-[11px] font-mono text-slate-700">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start space-x-2">
                        <Check className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <span>{feat.toUpperCase()}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={() => {
                    onLaunchPlanner(
                      'create', 
                      plan.price, 
                      `Requesting development plan: ${plan.name}\n\n[Outline target features here]`
                    );
                  }}
                  className={`w-full block text-center py-3.5 mt-6 font-mono font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer rounded-lg ${
                    plan.popular
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white'
                      : 'bg-transparent text-slate-900 hover:text-indigo-600 border border-slate-300 hover:border-indigo-600'
                  }`}
                >
                  Acquire plan
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 sm:px-12 bg-slate-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 pt-8">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
            © 2026 BYTEXON SYSTEMS. SOFTWARE ARCHITECTURE.
          </div>
        </div>
      </footer>
    </div>
  );
}
