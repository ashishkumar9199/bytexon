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
      {/* Brutalist Hero Section with Colorful Ambient Blobs */}
      <section className="relative overflow-hidden py-16 lg:py-24 px-6 sm:px-12 max-w-7xl mx-auto border-2 border-slate-900 rounded-3xl bg-white mt-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all hover:shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
        {/* Colorful Gradient Blobs in the background */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-35 animate-float-1 pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float-2 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-amber-200 rounded-full mix-blend-multiply filter blur-2xl opacity-25 animate-pulse-glow pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto text-center space-y-8 flex flex-col items-center relative z-10">
          
          {/* Centered Logo on top of landing page */}
          <div className="flex justify-center transition-transform hover:scale-110 duration-300 cursor-pointer filter drop-shadow-[0_4px_12px_rgba(99,102,241,0.2)]">
            <BytexonLogo showText={true} theme="light" height={64} />
          </div>
          
          <div className="inline-flex items-center space-x-2 border-2 border-slate-900 bg-amber-100 px-4 py-1.5 rounded-lg text-slate-900 text-[11px] font-bold uppercase tracking-widest font-mono shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin" style={{ animationDuration: '3s' }} />
            <span>Architectural digital ecosystems</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7.5xl font-display font-black leading-[0.95] uppercase tracking-tighter text-slate-900">
            Engineering <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-pink-500 to-amber-500 animate-gradient-text drop-shadow-[0_2px_8px_rgba(99,102,241,0.25)]">
              Digital
            </span> <br />
            Breakthroughs
          </h1>

          <p className="text-slate-700 text-sm sm:text-base leading-relaxed max-w-2xl font-sans text-center">
            Bytexon builds high-performance web products, scalable database backends, and bespoke digital ecosystems. Submit your specifications, track request progression, and chat directly with tech leads.
          </p>

          {/* Action CTAs: 3D Tactical Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 w-full justify-center max-w-md pt-4">
            <button
              onClick={() => onLaunchPlanner('create')}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-sans font-bold py-4 px-6 uppercase text-xs tracking-widest transition-all cursor-pointer border-2 border-slate-900 rounded-xl flex items-center justify-center space-x-2 shrink-0 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-1 hover:-translate-x-1 active:translate-y-0.5 active:translate-x-0.5 active:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] font-bold text-center"
            >
              <span>Launch Project Planner</span>
              <ChevronRight className="w-4 h-4 animate-pulse text-yellow-300" />
            </button>
            <button
              onClick={() => onLaunchPlanner('track')}
              className="bg-amber-400 text-slate-900 font-sans font-bold py-4 px-6 uppercase text-xs tracking-widest transition-all cursor-pointer border-2 border-slate-900 rounded-xl flex items-center justify-center space-x-2 shrink-0 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-1 hover:-translate-x-1 active:translate-y-0.5 active:translate-x-0.5 active:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] font-bold text-center"
            >
              <span>Track Workspace</span>
            </button>
          </div>

          {/* Quick stats with beautiful colorful 3D metric boxes */}
          <div className="pt-10 grid grid-cols-3 gap-4 sm:gap-6 border-t-2 border-slate-900 w-full max-w-2xl mt-4">
            <div className="border-2 border-slate-900 p-4 bg-indigo-50 rounded-xl shadow-[4px_4px_0px_0px_rgba(79,70,229,1)] transition-transform hover:scale-105 duration-200">
              <p className="text-2xl sm:text-3xl font-display font-black text-indigo-700">100%</p>
              <p className="text-slate-700 text-[9px] font-bold uppercase tracking-wider mt-1">UPI VERIFIED</p>
            </div>
            <div className="border-2 border-slate-900 p-4 bg-pink-50 rounded-xl shadow-[4px_4px_0px_0px_rgba(219,39,119,1)] transition-transform hover:scale-105 duration-200">
              <p className="text-2xl sm:text-3xl font-display font-black text-pink-700">&lt; 2 HR</p>
              <p className="text-slate-700 text-[9px] font-bold uppercase tracking-wider mt-1">TECH REVIEW</p>
            </div>
            <div className="border-2 border-slate-900 p-4 bg-amber-50 rounded-xl shadow-[4px_4px_0px_0px_rgba(217,119,6,1)] transition-transform hover:scale-105 duration-200">
              <p className="text-2xl sm:text-3xl font-display font-black text-amber-700">LIVE</p>
              <p className="text-slate-700 text-[9px] font-bold uppercase tracking-wider mt-1">DIRECT CHAT</p>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="py-20 px-6 sm:px-12 max-w-7xl mx-auto text-center space-y-12 border-b-2 border-slate-300">
        <div className="max-w-2xl mx-auto space-y-3">
          <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono">Our capabilities</p>
          <h2 className="text-3xl sm:text-4xl font-display font-black uppercase tracking-tight text-slate-900">
            Architected Solutions For High-Growth Ecosystems
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-mono">
            Bytexon pairs clean product engineering with high-capacity transaction pipelines to deliver production-ready software layouts.
          </p>
        </div>

        {/* 3D Cards for Capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="border-2 border-slate-900 p-6 bg-white text-left space-y-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(79,70,229,1)] transition-all hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(79,70,229,1)]">
            <div className="w-12 h-12 rounded-xl border-2 border-slate-900 bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
              [C]
            </div>
            <h3 className="text-base font-display font-black uppercase tracking-wider text-slate-900">Custom Web Architectures</h3>
            <p className="text-slate-600 text-xs leading-relaxed font-sans">
              Blazing-fast single page applications constructed with strict, secure code standards using React, Vite, and production-tested API patterns.
            </p>
          </div>

          <div className="border-2 border-slate-900 p-6 bg-white text-left space-y-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(219,39,119,1)] transition-all hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(219,39,119,1)]">
            <div className="w-12 h-12 rounded-xl border-2 border-slate-900 bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-lg shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
              [D]
            </div>
            <h3 className="text-base font-display font-black uppercase tracking-wider text-slate-900">Relational & Cloud Stores</h3>
            <p className="text-slate-600 text-xs leading-relaxed font-sans">
              From Firebase clusters to enterprise Postgres relational servers, we configure highly scalable transaction databases.
            </p>
          </div>

          <div className="border-2 border-slate-900 p-6 bg-white text-left space-y-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(217,119,6,1)] transition-all hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(217,119,6,1)]">
            <div className="w-12 h-12 rounded-xl border-2 border-slate-900 bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
              [I]
            </div>
            <h3 className="text-base font-display font-black uppercase tracking-wider text-slate-900">Bespoke System Integrations</h3>
            <p className="text-slate-600 text-xs leading-relaxed font-sans">
              Connecting automated CRM pipelines, secure UPI ledger networks, third-party authentication services, and custom webhook callbacks.
            </p>
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
