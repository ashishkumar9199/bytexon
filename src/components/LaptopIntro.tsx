import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Shield, Power, ChevronRight, Zap, Play, Volume2, Sparkles } from 'lucide-react';

interface LaptopIntroProps {
  onComplete: () => void;
}

export default function LaptopIntro({ onComplete }: LaptopIntroProps) {
  const [bootState, setBootState] = useState<'off' | 'opening' | 'booting' | 'loaded' | 'zooming' | 'done'>('off');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);

  // Mouse coordinate state for dynamic 3D perspective hover effect
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (bootState === 'zooming') return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    // Normalized coordinates from -0.5 to 0.5
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // Skip animation completely
  const handleSkip = () => {
    setBootState('done');
    onComplete();
  };

  // Trigger boot sequence
  const handlePowerOn = () => {
    if (bootState !== 'off') return;
    setBootState('opening');

    // Step 1: Laptop opens (lid rotates up)
    setTimeout(() => {
      setBootState('booting');
    }, 1200);
  };

  // Auto-boot after brief delay on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      handlePowerOn();
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Terminal logging BIOS simulator
  useEffect(() => {
    if (bootState !== 'booting') return;

    const logs = [
      "BYTEXON BOOT SYSTEM VERSION 2.06 INIT...",
      "LOADING KERNEL CORRECTIONS... OK",
      "ESTABLISHING FIRESTORE PERSISTENCE CLIENT...",
      "ISOLATING ENVIRONMENT SECURITY RULES [COMPLIANT]",
      "PROVISIONING DUAL CHAT CHANNELS...",
      "LAUNCHING INTERACTIVE METRICS...",
      "PREPARING HIGH-PERFORMANCE 3D INTERFACES...",
      "DECRYPTING SECURE SEED PARAMS...",
      "STARTUP SUCCESSFUL. REDIRECTING ENGINE..."
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logs.length) {
        setTerminalLogs((prev) => [...prev, `[system@bytexon-os]:~# ${logs[currentLogIndex]}`]);
        currentLogIndex++;
      } else {
        clearInterval(interval);
        // Step 2: Show Landing page on screen first
        setTimeout(() => {
          setBootState('loaded');
        }, 500);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [bootState]);

  // Transition from loaded to zooming
  useEffect(() => {
    if (bootState === 'loaded') {
      const timer = setTimeout(() => {
        setBootState('zooming');
      }, 2000); // Display landing page in laptop screen for 2 seconds
      return () => clearTimeout(timer);
    }
  }, [bootState]);

  // Complete animation after zoom
  useEffect(() => {
    if (bootState === 'zooming') {
      const timer = setTimeout(() => {
        setBootState('done');
        onComplete();
      }, 2000); // 2 seconds zoom transition duration
      return () => clearTimeout(timer);
    }
  }, [bootState, onComplete]);

  // Rotation & Translate parameters based on boot state
  // When zooming, we flatten the angle entirely for screen align
  const laptopRotateX = bootState === 'zooming' ? 0 : (mousePos.y * -18);
  const laptopRotateY = bootState === 'zooming' ? 0 : (mousePos.x * 22);
  const laptopScale = bootState === 'zooming' ? 2.8 : 1;
  const laptopTranslateY = bootState === 'zooming' ? 80 : 0;
  const laptopZ = bootState === 'zooming' ? 600 : 0;

  // Screen opens from flat (-95) to upright (-12). Tilts directly upright (0) when zooming.
  const screenRotateX = bootState === 'off' ? -95 : bootState === 'zooming' ? 0 : -12;

  return (
    <motion.div 
      animate={{ 
        opacity: bootState === 'zooming' ? [1, 1, 0] : 1,
        backgroundColor: bootState === 'zooming' ? 'rgb(248, 250, 252)' : 'rgb(2, 6, 23)',
      }}
      transition={{
        duration: 2.0,
        times: [0, 0.75, 1],
        ease: 'easeInOut'
      }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden font-mono select-none"
    >
      
      {/* Background Grid & Ambient Glows */}
      <motion.div 
        animate={{ opacity: bootState === 'zooming' ? 0 : 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 pointer-events-none overflow-hidden"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Falling binary matrix dust */}
        {bootState === 'booting' && [...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-emerald-500/20 text-[8px]"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{ y: [0, 180], opacity: [0, 1, 0] }}
            transition={{
              duration: 1 + Math.random() * 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {Math.random() > 0.5 ? '1' : '0'}
          </motion.div>
        ))}
      </motion.div>

      {/* Skip button with fade out on zooming */}
      <AnimatePresence>
        {bootState !== 'zooming' && (
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={handleSkip}
            className="absolute top-6 right-6 z-50 border-2 border-slate-800 hover:border-indigo-500 bg-slate-900/90 px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center space-x-2 shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_rgba(30,41,59,1)]"
          >
            <span>Skip Intro</span>
            <ChevronRight className="w-4 h-4 text-indigo-400" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main 3D Interactive Stage */}
      <div 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full max-w-4xl h-[600px] flex items-center justify-center perspective-[2000px] preserve-3d"
      >
        <motion.div
          animate={{
            rotateX: laptopRotateX,
            rotateY: laptopRotateY,
            scale: laptopScale,
            y: laptopTranslateY,
            z: laptopZ,
          }}
          transition={{
            type: 'spring',
            stiffness: bootState === 'zooming' ? 45 : 80,
            damping: bootState === 'zooming' ? 15 : 22,
          }}
          style={{
            transformStyle: 'preserve-3d',
          }}
          className="relative flex flex-col items-center"
        >
          {/* ==================== THE LAPTOP LID (SCREEN) ==================== */}
          <motion.div
            animate={{ 
              rotateX: screenRotateX,
              padding: bootState === 'zooming' ? '0px' : '10px',
              borderRadius: bootState === 'zooming' ? '0px' : '16px',
              borderWidth: bootState === 'zooming' ? '0px' : '6px',
            }}
            transition={{
              type: 'spring',
              stiffness: 60,
              damping: 16,
            }}
            style={{
              transformOrigin: 'bottom center',
              transformStyle: 'preserve-3d',
            }}
            className="relative w-[500px] h-[320px] bg-slate-900 border-slate-800 shadow-2xl flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Outer metallic hinge detail */}
            <motion.div 
              animate={{ opacity: bootState === 'zooming' ? 0 : 1 }}
              className="absolute -bottom-1.5 w-32 h-3 bg-slate-950 border border-slate-800 rounded-b" 
            />

            {/* Glowing Screen Content */}
            <div className="w-full h-full bg-black rounded-sm overflow-hidden relative flex flex-col">
              
              {/* Screen LED Backlight overlay */}
              {bootState !== 'off' && (
                <div className="absolute inset-0 bg-indigo-500/5 mix-blend-screen pointer-events-none animate-pulse z-20" />
              )}

              {/* View 1: Blank Screen (Laptop Off) */}
              {bootState === 'off' && (
                <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-4">
                  <div className="w-12 h-12 rounded-full border border-slate-800 flex items-center justify-center text-slate-600 animate-pulse">
                    <Power className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] text-slate-600 mt-3 tracking-widest font-mono uppercase">
                    SYS.POWER: OFFLINE
                  </p>
                </div>
              )}

              {/* View 2: Hardware Opening Check */}
              {bootState === 'opening' && (
                <div className="absolute inset-0 bg-black flex flex-col items-center justify-center p-6 space-y-4">
                  <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                  <p className="text-xs text-indigo-400 font-mono tracking-widest uppercase animate-pulse">
                    DETECTING HARDWARE FRAMEWORK...
                  </p>
                </div>
              )}

              {/* View 3: Boot Logs Terminal */}
              {bootState === 'booting' && (
                <div className="absolute inset-0 bg-slate-950 p-4 font-mono text-[9px] text-emerald-400 flex flex-col justify-between overflow-hidden">
                  <div className="space-y-1 overflow-y-auto max-h-[240px] scrollbar-none text-left">
                    <div className="flex items-center space-x-2 text-indigo-400 border-b border-slate-900 pb-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      <span className="font-bold uppercase tracking-wider text-[10px]">Bytexon Diagnostic BIOS</span>
                    </div>
                    {terminalLogs.map((log, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="leading-relaxed"
                      >
                        {log}
                      </motion.div>
                    ))}
                    
                    {/* Glowing blink cursor */}
                    <div className="flex items-center space-x-1">
                      <span className="text-slate-500">[system@bytexon-os]:~#</span>
                      <span className="w-1.5 h-3.5 bg-emerald-400 animate-pulse" />
                    </div>
                  </div>

                  <div className="border-t border-slate-900 pt-1.5 flex justify-between items-center text-slate-500 text-[8px]">
                    <span>SYSTEM CHECK: SECURE</span>
                    <span>TEMP: 32°C</span>
                  </div>
                </div>
              )}

              {/* View 4: Gorgeous High-Fidelity Replica Landing Page (Loaded & Zooming states) */}
              {(bootState === 'loaded' || bootState === 'zooming') && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 bg-slate-50 text-slate-900 font-sans p-4 overflow-hidden flex flex-col justify-between select-none"
                >
                  {/* Replica Header */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 shrink-0">
                    <div className="flex items-center space-x-1">
                      <div className="w-3.5 h-3.5 bg-indigo-600 rounded-sm flex items-center justify-center text-[7px] text-white font-mono font-bold">B</div>
                      <span className="text-[8px] font-black tracking-widest font-mono text-slate-900">BYTEXON</span>
                    </div>
                    <div className="flex items-center space-x-2 text-[5px] font-mono font-black text-slate-400 uppercase">
                      <span>SERVICES</span>
                      <span>•</span>
                      <span>TECH STACKS</span>
                      <span className="bg-indigo-600 text-white px-1.5 py-0.5 rounded text-[4px] font-sans font-bold">START WORKSPACE</span>
                    </div>
                  </div>

                  {/* Replica Hero Content */}
                  <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-2 space-y-1.5">
                    <div className="inline-flex items-center space-x-1 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full text-[4px] font-bold text-indigo-700 uppercase tracking-widest font-mono">
                      <Sparkles className="w-1.5 h-1.5 text-indigo-600 animate-pulse" />
                      <span>Elite Digital Architects</span>
                    </div>
                    <h2 className="text-[12px] sm:text-[13px] font-display font-black uppercase tracking-tight text-slate-900 leading-tight max-w-[280px]">
                      Digital Architecture & Cognitive Applications
                    </h2>
                    <p className="text-[5.5px] text-slate-500 leading-normal max-w-[250px] mx-auto">
                      We formulate, design, and orchestrate elite full-stack solutions with ironclad security models and persistent real-time workspaces.
                    </p>
                    
                    <div className="flex space-x-1.5 pt-1 scale-90">
                      <div className="bg-slate-900 text-white text-[4.5px] font-bold px-2.5 py-1 rounded border border-slate-950 flex items-center space-x-0.5 shadow-sm">
                        <span>LAUNCH WORKSPACE</span>
                        <ChevronRight className="w-1 h-1 text-slate-300" />
                      </div>
                      <div className="bg-white text-slate-600 text-[4.5px] font-bold px-2.5 py-1 rounded border border-slate-200 flex items-center space-x-0.5 shadow-sm">
                        <span>ADMIN PORTAL</span>
                      </div>
                    </div>
                  </div>

                  {/* Replica Footer Bento Tech stack elements */}
                  <div className="grid grid-cols-3 gap-2 shrink-0 border-t border-slate-150 pt-2 scale-95">
                    <div className="bg-white border border-slate-200/80 p-1.5 rounded-lg text-left space-y-0.5 shadow-sm">
                      <span className="text-[5px] font-bold font-mono text-indigo-600 block uppercase">Full-Stack Server</span>
                      <p className="text-[3.5px] text-slate-400 font-sans leading-none">Express API orchestrator with high speed routing.</p>
                    </div>
                    <div className="bg-white border border-slate-200/80 p-1.5 rounded-lg text-left space-y-0.5 shadow-sm">
                      <span className="text-[5px] font-bold font-mono text-emerald-600 block uppercase">Secure Database</span>
                      <p className="text-[3.5px] text-slate-400 font-sans leading-none">Firestore persistence under isolated security rules.</p>
                    </div>
                    <div className="bg-white border border-slate-200/80 p-1.5 rounded-lg text-left space-y-0.5 shadow-sm">
                      <span className="text-[5px] font-bold font-mono text-cyan-600 block uppercase">Real-Time Chat</span>
                      <p className="text-[3.5px] text-slate-400 font-sans leading-none">Instantly connect to lead architect console.</p>
                    </div>
                  </div>
                </motion.div>
              )}

            </div>
          </motion.div>

          {/* ==================== THE LAPTOP HINGE AREA ==================== */}
          <motion.div 
            animate={{ opacity: bootState === 'zooming' ? 0 : 1 }}
            transition={{ duration: 0.5 }}
            style={{ transform: 'translateZ(-2px)' }}
            className="w-[510px] h-3 bg-slate-950 border-x-4 border-slate-800 shrink-0" 
          />

          {/* ==================== THE LAPTOP KEYBOARD BASE ==================== */}
          <motion.div
            animate={{ 
              opacity: bootState === 'zooming' ? 0 : 1,
            }}
            transition={{ duration: 0.5 }}
            style={{
              transform: 'rotateX(75deg) translateY(-28px)',
              transformStyle: 'preserve-3d',
            }}
            className="relative w-[520px] h-[340px] bg-slate-800 rounded-b-2xl border-t-2 border-slate-700 shadow-[0_30px_60px_rgba(0,0,0,0.8)] p-6 flex flex-col justify-between"
          >
            {/* Shadow under laptop in space */}
            <div className="absolute -inset-4 bg-black/65 blur-xl -z-10 rounded-full opacity-60" />

            {/* Power Button */}
            <div className="absolute top-3 right-8 flex items-center space-x-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${bootState !== 'off' ? 'bg-indigo-400 animate-pulse' : 'bg-red-500'}`} />
              <button
                disabled={bootState !== 'off'}
                onClick={handlePowerOn}
                className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                  bootState === 'off' 
                    ? 'bg-slate-900 border-slate-600 text-red-500 hover:bg-slate-950 hover:text-red-400 cursor-pointer shadow-md' 
                    : 'bg-slate-950 border-slate-800 text-slate-700'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Keyboard Layout Grid Decoration */}
            <div className="w-full h-44 bg-slate-900/80 border border-slate-700/60 rounded-xl p-3 flex flex-col justify-between mt-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-1 h-5 w-full">
                  {[...Array(i === 4 ? 6 : i === 0 ? 14 : i === 1 ? 13 : i === 2 ? 12 : 11)].map((_, j) => (
                    <div 
                      key={j} 
                      className={`h-full border border-slate-800/40 rounded bg-slate-950/60 transition-all ${
                        bootState !== 'off' ? 'shadow-[0_0_4px_rgba(99,102,241,0.2)] bg-indigo-950/30 border-indigo-900/40' : ''
                      } ${
                        i === 4 && j === 2 ? 'flex-1' : 'w-6'
                      }`} 
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Trackpad area */}
            <div className="w-32 h-16 bg-slate-900/60 border border-slate-700/40 rounded-lg mx-auto shadow-inner" />
          </motion.div>
        </motion.div>
      </div>

      {/* Control Console Overlay (For Off State Only) */}
      <AnimatePresence>
        {bootState === 'off' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-lg px-6"
          >
            <div className="inline-flex items-center space-x-2 border border-indigo-400/30 bg-indigo-500/5 px-4 py-1.5 rounded-full text-indigo-300 text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span>Bytexon Interactive Simulation</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight">
                Engage Bytexon Workspace
              </h2>
              <p className="text-slate-400 text-xs leading-relaxed">
                Click the power switch or sit back and watch the laptop load the production workspace automatically.
              </p>
            </div>

            <button
              onClick={handlePowerOn}
              className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold py-4 px-8 rounded-2xl border-2 border-slate-950 uppercase tracking-widest text-xs flex items-center space-x-3 transition-all cursor-pointer shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_45px_rgba(99,102,241,0.6)] hover:-translate-y-0.5 active:translate-y-0.5"
            >
              <Power className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
              <span>Power On System</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Bar */}
      <motion.div 
        animate={{ opacity: bootState === 'zooming' ? 0 : 1 }}
        className="absolute bottom-6 left-6 text-[10px] font-mono text-slate-500 flex items-center space-x-2"
      >
        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
        <span>GATEPORT HYPERSTATION ACTIVE</span>
      </motion.div>
    </motion.div>
  );
}
