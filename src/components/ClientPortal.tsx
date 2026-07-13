import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { ProjectRequest, ChatMessage, AdminConfig } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';
import { motion, AnimatePresence } from 'motion/react';
import { 
 ArrowLeft, CheckCircle2, AlertCircle, Clock, Send, CreditCard, 
 Copy, Check, MessageSquare, Briefcase, FileText, UploadCloud, IndianRupee, DollarSign 
} from 'lucide-react';
import { getQrCodeUrl, getAdminConfig } from '../lib/configHelper';
import { useToast } from '../context/ToastContext';

interface ClientPortalProps {
 requestId: string;
 onBack: () => void;
 adminConfig: AdminConfig;
}

export default function ClientPortal({ requestId, onBack, adminConfig }: ClientPortalProps) {
 const { showToast } = useToast();
 const [request, setRequest] = useState<ProjectRequest | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [messages, setMessages] = useState<ChatMessage[]>([]);
 const [newMessage, setNewMessage] = useState('');
 const [txRef, setTxRef] = useState('');
 const [payNotes, setPayNotes] = useState('');
 const [copied, setCopied] = useState(false);
 const [submittingPayment, setSubmittingPayment] = useState(false);

 const chatEndRef = useRef<HTMLDivElement>(null);

 // Load the Project Request in real-time
 useEffect(() => {
 setLoading(true);
 const docRef = doc(db, 'requests', requestId);
 
 const unsubscribe = onSnapshot(docRef, (docSnap) => {
 if (docSnap.exists()) {
 setRequest({ id: docSnap.id, ...docSnap.data() } as ProjectRequest);
 setError(null);
 } else {
 setError('Project request not found. Please double-check your tracking ID.');
 }
 setLoading(false);
 }, (err) => {
 console.warn("Error loading request (likely offline or database initializing):", err);
 setError('Failed to fetch request details. Please check your network connection.');
 setLoading(false);
 });

 return () => unsubscribe();
 }, [requestId]);

 // Load chats in real-time
 useEffect(() => {
 const chatsRef = collection(db, 'chats');
 const q = query(chatsRef, where('requestId', '==', requestId));

 const unsubscribe = onSnapshot(q, (snapshot) => {
 const msgs: ChatMessage[] = [];
 snapshot.forEach((doc) => {
 msgs.push({ id: doc.id, ...doc.data() } as ChatMessage);
 });
 // Sort client-side by timestamp to avoid requiring manual firestore index creation
 msgs.sort((a, b) => a.timestamp - b.timestamp);
 setMessages(msgs);
 }, (err) => {
 console.warn("Error loading chat messages (likely offline or database initializing):", err);
 });

 return () => unsubscribe();
 }, [requestId]);

 // Auto Scroll Chat
 useEffect(() => {
 chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
 }, [messages]);

 // Send Chat Message
 const handleSendMessage = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!newMessage.trim() || !request) return;

 const messageText = newMessage.trim();
 setNewMessage('');

 try {
 await addDoc(collection(db, 'chats'), {
 requestId: request.id,
 sender: 'client',
 text: messageText,
 timestamp: Date.now()
 });
 } catch (err) {
 console.error('Error sending message:', err);
 handleFirestoreError(err, OperationType.CREATE, 'chats');
 }
 };

 // Submit Payment Details
 const handlePaymentSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!txRef.trim() || !request) return;

 setSubmittingPayment(true);
 try {
 const docRef = doc(db, 'requests', request.id);
 await updateDoc(docRef, {
 status: 'payment_submitted',
 paymentTxRef: txRef.trim(),
 paymentNotes: payNotes.trim(),
 paymentSubmittedAt: Date.now()
 });

 // Send automated system chat notice
 await addDoc(collection(db, 'chats'), {
 requestId: request.id,
 sender: 'client',
 text: `💳 [System notification] Client submitted payment proof. Tx Ref: ${txRef.trim()}`,
 timestamp: Date.now()
 });

 setTxRef('');
 setPayNotes('');
 showToast('Payment proof submitted successfully! Our finance team is verifying.', 'success', 'Payment Saved');
 } catch (err) {
 console.error('Error updating payment info:', err);
 showToast('Failed to submit payment details. Please try again.', 'error', 'Payment Failed');
 handleFirestoreError(err, OperationType.WRITE, `requests/${request.id}`);
 } finally {
 setSubmittingPayment(false);
 }
 };

 const handleCopyUpi = () => {
 navigator.clipboard.writeText(adminConfig.upiId);
 setCopied(true);
 showToast('UPI ID copied to clipboard!', 'success', 'UPI Copied');
 setTimeout(() => setCopied(false), 2000);
 };

 if (loading) {
	return (
		<div className="max-w-7xl mx-auto px-6 py-8 font-sans text-slate-900 dark:text-slate-100 animate-pulse">
			{/* Top Navigation Back Button Skeleton */}
			<div className="flex items-center space-x-2 mb-6">
				<div className="w-4 h-4 bg-slate-300 dark:bg-slate-700 rounded-full" />
				<div className="w-28 h-3.5 bg-slate-300 dark:bg-slate-700 rounded" />
			</div>

			{/* Header Panel Skeleton */}
			<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 mb-6 rounded-3xl">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
					<div className="space-y-3 flex-1">
						<div className="flex items-center gap-2">
							<div className="w-20 h-5 bg-slate-300 dark:bg-slate-700 rounded-full" />
							<div className="w-24 h-5 bg-slate-300 dark:bg-slate-700 rounded-full" />
						</div>
						<div className="w-2/3 h-7 bg-slate-300 dark:bg-slate-700 rounded-lg" />
						<div className="w-1/2 h-4 bg-slate-300 dark:bg-slate-700 rounded" />
					</div>
					
					<div className="w-40 h-16 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-3 rounded-2xl flex items-center space-x-3">
						<div className="w-8 h-8 bg-slate-300 dark:bg-slate-700 rounded-lg" />
						<div className="space-y-2 flex-1">
							<div className="w-16 h-3 bg-slate-300 dark:bg-slate-700 rounded" />
							<div className="w-20 h-4 bg-slate-300 dark:bg-slate-700 rounded" />
						</div>
					</div>
				</div>

				{/* Dynamic Progress Tracker Skeleton */}
				<div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-6">
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
						{[1, 2, 3, 4].map((step) => (
							<div key={step} className="flex items-center space-x-2.5">
								<div className="w-8 h-8 bg-slate-300 dark:bg-slate-700 rounded-xl flex-shrink-0" />
								<div className="space-y-2 flex-1 min-w-0">
									<div className="w-20 h-3 bg-slate-300 dark:bg-slate-700 rounded" />
									<div className="w-16 h-2.5 bg-slate-300 dark:bg-slate-700 rounded" />
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Main Body Grid Skeleton */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
				{/* Left Column: Details (6 Columns) */}
				<div className="lg:col-span-6 space-y-4">
					{/* Status Alert Banner Skeleton */}
					<div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-5 rounded-3xl flex items-start space-x-3">
						<div className="w-5 h-5 bg-slate-300 dark:bg-slate-700 rounded-full flex-shrink-0" />
						<div className="space-y-2 flex-1">
							<div className="w-32 h-4 bg-slate-300 dark:bg-slate-700 rounded" />
							<div className="w-full h-3 bg-slate-300 dark:bg-slate-700 rounded" />
							<div className="w-4/5 h-3 bg-slate-300 dark:bg-slate-700 rounded" />
						</div>
					</div>

					{/* Scope Details Card Skeleton */}
					<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-5">
						<div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
							<div className="w-4 h-4 bg-slate-300 dark:bg-slate-700 rounded" />
							<div className="w-36 h-4 bg-slate-300 dark:bg-slate-700 rounded" />
						</div>
						
						<div className="space-y-4">
							<div className="space-y-2">
								<div className="w-24 h-3 bg-slate-300 dark:bg-slate-700 rounded" />
								<div className="w-40 h-4 bg-slate-300 dark:bg-slate-700 rounded" />
							</div>
							<div className="space-y-2.5">
								<div className="w-28 h-3 bg-slate-300 dark:bg-slate-700 rounded" />
								<div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-850 rounded-2xl">
									<div className="w-full h-3.5 bg-slate-300 dark:bg-slate-700 rounded" />
									<div className="w-11/12 h-3.5 bg-slate-300 dark:bg-slate-700 rounded" />
									<div className="w-4/5 h-3.5 bg-slate-300 dark:bg-slate-700 rounded" />
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Right Column: Chat Panel (6 Columns) */}
				<div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col h-[520px] overflow-hidden">
					{/* Chat Header Skeleton */}
					<div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40">
						<div className="flex items-center space-x-3">
							<div className="w-8 h-8 bg-slate-300 dark:bg-slate-700 rounded-full" />
							<div className="space-y-1.5">
								<div className="w-28 h-3.5 bg-slate-300 dark:bg-slate-700 rounded" />
								<div className="w-16 h-2.5 bg-slate-300 dark:bg-slate-700 rounded" />
							</div>
						</div>
						<div className="w-16 h-5 bg-slate-300 dark:bg-slate-700 rounded-full" />
					</div>

					{/* Chat Messages Skeleton */}
					<div className="flex-grow p-5 bg-slate-50/50 dark:bg-slate-950/10 space-y-4 overflow-y-auto">
						<div className="flex justify-start">
							<div className="max-w-[70%] p-3 bg-slate-200 dark:bg-slate-800 rounded-2xl space-y-2 w-48">
								<div className="w-full h-3 bg-slate-300 dark:bg-slate-700 rounded" />
								<div className="w-2/3 h-3 bg-slate-300 dark:bg-slate-700 rounded" />
							</div>
						</div>
						<div className="flex justify-end">
							<div className="max-w-[70%] p-3 bg-slate-300 dark:bg-slate-700 rounded-2xl space-y-2 w-52">
								<div className="w-full h-3 bg-slate-400 dark:bg-slate-600 rounded" />
								<div className="w-1/2 h-3 bg-slate-400 dark:bg-slate-600 rounded" />
							</div>
						</div>
						<div className="flex justify-start">
							<div className="max-w-[70%] p-3 bg-slate-200 dark:bg-slate-800 rounded-2xl space-y-2 w-56">
								<div className="w-full h-3 bg-slate-300 dark:bg-slate-700 rounded" />
								<div className="w-4/5 h-3 bg-slate-300 dark:bg-slate-700 rounded" />
							</div>
						</div>
					</div>

					{/* Chat Input Skeleton */}
					<div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center space-x-3">
						<div className="flex-grow h-10 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-850" />
						<div className="w-10 h-10 bg-slate-300 dark:bg-slate-700 rounded-2xl flex-shrink-0" />
					</div>
				</div>
			</div>
		</div>
	);
}

 if (error || !request) {
 return (
 <div className="max-w-md mx-auto p-6 bg-white dark:bg-slate-900 border-2 border-indigo-600 dark:border-cyan-500 mt-12 text-center text-slate-900 dark:text-slate-100 rounded-3xl shadow-sm">
 <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
 <h2 className="text-sm font-sans font-bold text-slate-900 dark:text-white mb-1">Access Denied</h2>
 <p className="text-xs text-slate-500 font-mono mb-4">{error || 'Unable to retrieve your portal data.'}</p>
 <button 
 onClick={onBack}
 className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white font-mono font-bold text-xs transition-colors cursor-pointer"
 >
 Return to Home
 </button>
 </div>
 );
 }

 const budgetSign = request.budgetCurrency === 'USD' ? '$' : '₹';
 const displayAmount = request.approvedAmount ?? request.budgetAmount;
 const displayCurrency = request.approvedCurrency ?? request.budgetCurrency;
 const displaySign = displayCurrency === 'USD' ? '$' : '₹';

 // Determine active stages
 const isApproved = request.status === 'approved' || request.status === 'payment_submitted' || request.status === 'completed';
 const isPaymentSubmitted = request.status === 'payment_submitted' || request.status === 'completed';
 const isCompleted = request.status === 'completed';

 return (
 <div className="max-w-7xl mx-auto px-6 py-8 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
 {/* Top Navigation */}
 <button 
 onClick={onBack}
 id="btn-portal-back"
 className="flex items-center space-x-1.5 text-slate-500 hover:text-indigo-600 mb-6 transition-colors group cursor-pointer font-mono text-[10px] "
 >
 <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
 <span>Back to Bytexon Home</span>
 </button>

 {/* Header Panel */}
 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 mb-6 rounded-3xl transition-colors duration-300 shadow-sm">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <div className="flex flex-wrap items-center gap-2 mb-2">
 <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-[9px] font-bold text-indigo-600 font-mono">
 ID: {request.id}
 </span>
 <span className={`px-2 py-0.5 text-[9px] font-bold font-mono border ${
 request.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
 request.status === 'approved' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
 request.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
 request.status === 'payment_submitted' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
 'bg-teal-500/10 text-teal-400 border-teal-500/30'
 }`}>
 {request.status.replace('_', ' ')}
 </span>
 </div>
 <h1 className="text-xl sm:text-2xl font-sans font-bold text-slate-900 dark:text-white leading-tight ">
 Project: {request.description.substring(0, 45)}{request.description.length > 45 ? '...' : ''}
 </h1>
 <p className="text-slate-500 text-[11px] font-mono mt-1">
 Submitted by <strong className="text-slate-900 dark:text-white">{request.name.toUpperCase()}</strong> ({request.email.toUpperCase()})
 </p>
 </div>
 
 <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-850 p-3 border border-slate-200 dark:border-slate-750 self-start md:self-auto rounded-2xl">
 <div className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-cyan-400 flex-shrink-0 rounded-xl">
 <Briefcase className="w-4 h-4" />
 </div>
 <div>
 <p className="text-slate-400 text-[9px] font-mono font-bold ">Estimated Budget</p>
 <p className="text-base font-sans font-bold text-indigo-600 leading-none mt-1">
 {budgetSign}{request.budgetAmount.toLocaleString()}
 </p>
 </div>
 </div>
 </div>

 {/* Dynamic Progress Tracker */}
 <div className="mt-6 border-t border-slate-200 dark:border-slate-850 pt-6">
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative">
 
 {/* Step 1: Submission */}
 <div className="flex items-center space-x-2.5">
 <div className="w-8 h-8 flex items-center justify-center bg-indigo-600 text-white text-xs border border-indigo-200 flex-shrink-0">
 <FileText className="w-4 h-4" />
 </div>
 <div className="min-w-0">
 <p className="font-bold text-xs text-slate-900 dark:text-white truncate font-mono">[01] WORK REQUEST</p>
 <p className="text-[10px] text-indigo-600 font-semibold font-mono truncate">SUBMITTED</p>
 </div>
 </div>

 {/* Step 2: Review/Approval */}
 <div className="flex items-center space-x-2.5">
 <div className={`w-8 h-8 flex items-center justify-center transition-colors duration-300 border flex-shrink-0 text-xs ${
 isApproved ? 'bg-indigo-600 text-white border-indigo-600' : 
 request.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-slate-50 text-slate-300 border-slate-200'
 }`}>
 {request.status === 'rejected' ? <AlertCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
 </div>
 <div className="min-w-0">
 <p className={`font-bold text-xs truncate font-mono ${isApproved ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>[02] ADMIN REVIEW</p>
 <p className={`text-[10px] font-semibold font-mono truncate ${
 request.status === 'rejected' ? 'text-rose-400' :
 isApproved ? 'text-indigo-600' : 'text-slate-300'
 }`}>
 {request.status === 'rejected' ? 'REJECTED' : isApproved ? 'APPROVED' : 'AWAITING REVIEW'}
 </p>
 </div>
 </div>

 {/* Step 3: Payment */}
 <div className="flex items-center space-x-2.5">
 <div className={`w-8 h-8 flex items-center justify-center transition-colors duration-300 border flex-shrink-0 text-xs ${
 isPaymentSubmitted ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-300 border-slate-200'
 }`}>
 <CreditCard className="w-4 h-4" />
 </div>
 <div className="min-w-0">
 <p className={`font-bold text-xs truncate font-mono ${isPaymentSubmitted ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>[03] UPI PAYMENT</p>
 <p className={`text-[10px] font-semibold font-mono truncate ${
 isPaymentSubmitted ? 'text-indigo-600' :
 isApproved ? 'text-amber-400' : 'text-slate-300'
 }`}>
 {isPaymentSubmitted ? 'PROOF SENT' : isApproved ? 'AWAITING PAY' : 'PENDING'}
 </p>
 </div>
 </div>

 {/* Step 4: Kickoff */}
 <div className="flex items-center space-x-2.5">
 <div className={`w-8 h-8 flex items-center justify-center transition-colors duration-300 border flex-shrink-0 text-xs ${
 isCompleted ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-300 border-slate-200'
 }`}>
 <CheckCircle2 className="w-4 h-4" />
 </div>
 <div className="min-w-0">
 <p className={`font-bold text-xs truncate font-mono ${isCompleted ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>[04] KICKOFF</p>
 <p className={`text-[10px] font-semibold font-mono truncate ${isCompleted ? 'text-indigo-600' : 'text-slate-300'}`}>
 {isCompleted ? 'KICKOFF SCHEDULED' : 'PENDING'}
 </p>
 </div>
 </div>

 </div>
 </div>
 </div>

 {/* Main Body Grid */}
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
 
 {/* Left Side: Details & Payment (6 Columns) */}
 <div className="lg:col-span-6 space-y-4">
 
 {/* Status-specific alert banners */}
 <AnimatePresence mode="wait">
 {request.status === 'pending' && (
 <motion.div 
 initial={{ opacity: 0, y: 5 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -5 }}
 className="bg-amber-500/10 border border-amber-500/20 p-4 flex items-start space-x-3 text-slate-900 dark:text-slate-100 rounded-2xl"
 >
 <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
 <div>
 <h3 className="font-bold text-amber-400 text-xs font-mono">[ STATUS: UNDER REVIEW ]</h3>
 <p className="text-slate-700 text-xs mt-1 leading-relaxed">
 Your request is being evaluated. We will draft milestone prices and reach out. You can chat live with our support team using the console on the right.
 </p>
 </div>
 </motion.div>
 )}

 {request.status === 'rejected' && (
 <motion.div 
 initial={{ opacity: 0, y: 5 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -5 }}
 className="bg-rose-500/10 border border-rose-500/20 p-4 flex items-start space-x-3 text-slate-900 dark:text-slate-100 rounded-2xl"
 >
 <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
 <div>
 <h3 className="font-bold text-rose-400 text-xs font-mono">[ STATUS: DECLINED ]</h3>
 <p className="text-slate-700 text-xs mt-1 leading-relaxed">
 We are unable to accept this project at this specified budget. Use the chat panel to clarify or adjust proposals.
 </p>
 </div>
 </motion.div>
 )}

 {request.status === 'completed' && (
 <motion.div 
 initial={{ opacity: 0, y: 5 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -5 }}
 className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 p-4 flex items-start space-x-3 text-slate-900 dark:text-slate-100 rounded-2xl"
 >
 <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
 <div>
 <h3 className="font-bold text-indigo-600 text-xs font-mono">[ STATUS: CONFIRMED ]</h3>
 <p className="text-slate-700 text-xs mt-1 leading-relaxed">
 Your payment has been verified! Our engineering team has scheduled your kickoff. We will coordinate details in live chat.
 </p>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Core Request Description Panel */}
 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm transition-colors duration-300">
 <h2 className="text-xs font-bold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-1.5">
 <FileText className="w-4 h-4 text-indigo-600" />
 <span>Project Scope Details</span>
 </h2>
 
 <dl className="space-y-4 text-xs">
 <div>
 <dt className="text-slate-400 font-bold text-[9px] font-mono">Whatsapp contact</dt>
 <dd className="text-slate-900 dark:text-white font-mono mt-1 text-sm font-bold">{request.whatsapp}</dd>
 </div>
 {request.companyName && (
 <div>
 <dt className="text-slate-400 font-bold text-[9px] font-mono">Company name</dt>
 <dd className="text-slate-900 dark:text-white mt-1 text-xs font-bold ">{request.companyName}</dd>
 </div>
 )}
 <div>
 <dt className="text-slate-400 font-bold text-[9px] font-mono">Project description</dt>
 <dd className="text-slate-700 dark:text-slate-300 mt-2 p-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-850 text-xs leading-relaxed whitespace-pre-wrap font-mono rounded-2xl">
 {request.description}
 </dd>
 </div>
 </dl>
 </div>

 {/* Payment Panel: Only visible if Approved / Payment Submitted / Completed */}
 {isApproved && (
 <motion.div 
 initial={{ opacity: 0, scale: 0.98 }}
 animate={{ opacity: 1, scale: 1 }}
 className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 text-slate-900 dark:text-slate-100 rounded-3xl shadow-sm transition-colors duration-300"
 >
 <h2 className="text-xs font-bold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-1.5">
 <CreditCard className="w-4 h-4 text-indigo-600" />
 <span>Secure UPI Payment Portal</span>
 </h2>

 <div className="space-y-4">
 
 {/* Approved Price Notice */}
 <div className="flex justify-between items-center bg-indigo-50 dark:bg-indigo-950/40 p-3.5 border border-indigo-200 dark:border-indigo-900/50 rounded-2xl">
 <div>
 <p className="text-indigo-600 text-[9px] font-bold font-mono">Final approved price</p>
 <p className="text-lg font-sans font-bold text-slate-900 dark:text-white mt-0.5">
 {displaySign}{displayAmount.toLocaleString()}
 </p>
 </div>
 <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-bold font-mono">
 UPI TARGET
 </span>
 </div>

 {request.status === 'approved' ? (
 <>
 <p className="text-slate-500 text-xs leading-relaxed font-mono">
 Please transfer using the secure details below. Then, paste your transaction UPI Reference ID (UTR) in the form below.
 </p>

 {/* QR Code and UPI ID Grid */}
 <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 dark:bg-slate-850/55 border border-slate-200 dark:border-slate-800 rounded-2xl">
 
 {/* UPI QR Generated */}
 <div className="bg-white dark:bg-slate-950 p-2 border border-slate-300 dark:border-slate-800 flex-shrink-0 rounded-xl">
 <img 
 src={getQrCodeUrl(adminConfig.upiId, displayAmount, adminConfig.upiQrBase64)}
 alt="Bytexon UPI QR"
 className="w-28 h-28 object-contain"
 referrerPolicy="no-referrer"
 />
 <p className="text-black text-[8px] text-center mt-1 font-mono font-bold">Scan with UPI App</p>
 </div>

 {/* UPI Copy Action */}
 <div className="space-y-3.5 w-full text-center sm:text-left">
 <div>
 <p className="text-slate-400 text-[9px] font-mono font-bold ">Official upi id</p>
 <div className="flex items-center justify-center sm:justify-start space-x-2 mt-1">
 <span className="font-mono text-xs font-bold bg-white dark:bg-slate-950 px-2.5 py-1.5 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white select-all rounded-lg">
 {adminConfig.upiId}
 </span>
 <button 
 onClick={handleCopyUpi}
 className="p-1.5 bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white transition-colors cursor-pointer"
 title="Copy UPI ID"
 >
 {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
 </button>
 </div>
 </div>
 <ul className="text-slate-500 text-[10px] space-y-0.5 pl-3 list-disc text-left leading-normal font-mono ">
 <li>Instant kickoff scheduled on receipt</li>
 <li>Accepts GPay, PhonePe, Paytm, BHIM</li>
 </ul>
 </div>
 </div>

 {/* Payment Form */}
 <form onSubmit={handlePaymentSubmit} className="space-y-3 pt-1">
 <div>
 <label className="block text-slate-500 text-[10px] font-bold mb-1 font-mono">
 UPI TRANSACTION REFERENCE (UTR / TX ID) <span className="text-rose-500">*</span>
 </label>
 <input 
 type="text"
 required
 value={txRef}
 onChange={(e) => setTxRef(e.target.value)}
 placeholder="E.G. 314569874123"
 className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-300 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 focus:outline-none font-mono text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 rounded-xl transition-all"
 />
 </div>

 <div>
 <label className="block text-slate-500 text-[10px] font-bold mb-1 font-mono">
 ADDITIONAL PAYMENT NOTES (OPTIONAL)
 </label>
 <textarea 
 value={payNotes}
 onChange={(e) => setPayNotes(e.target.value)}
 placeholder="SENDER ACCOUNT NAME, BANK DETAILS, OR REMARKS"
 className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-300 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 focus:outline-none text-xs h-12 resize-none font-mono text-slate-900 dark:text-slate-100 placeholder-slate-400 rounded-xl transition-all"
 />
 </div>

 <button
 type="submit"
 disabled={submittingPayment}
 className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white font-mono font-bold text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer rounded-2xl shadow-sm"
 >
 {submittingPayment ? (
 <>
 <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
 <span>SUBMITTING PROOF...</span>
 </>
 ) : (
 <>
 <UploadCloud className="w-4 h-4" />
 <span>SUBMIT PAYMENT PROOF</span>
 </>
 )}
 </button>
 </form>
 </>
 ) : request.status === 'payment_submitted' ? (
 <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 text-center space-y-3 rounded-2xl">
 <Clock className="w-8 h-8 text-amber-400 mx-auto animate-pulse" />
 <div>
 <h4 className="font-bold text-slate-900 dark:text-white text-xs font-mono">Payment proof under audit</h4>
 <p className="text-[11px] text-slate-500 mt-1 font-mono">
 UTR ID: <strong className="text-indigo-600">{request.paymentTxRef}</strong>
 </p>
 <p className="text-slate-500 text-[11px] mt-3 leading-relaxed font-mono">
 WE ARE CURRENTLY MATCHING YOUR TRANSACTION REFERENCE WITH BANK LOGS. VERIFIED WITHIN 15 MINUTES TO 2 HOURS. USE CHAT BELOW FOR RAPID CLEARANCE.
 </p>
 </div>
 </div>
 ) : (
 <div className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-cyan-450 p-4 border border-indigo-200 dark:border-indigo-900/50 flex items-center space-x-3 rounded-2xl">
 <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0" />
 <div>
 <h4 className="font-bold text-xs font-mono">[ PAYMENT VERIFIED & COMPLETE ]</h4>
 <p className="text-[11px] text-slate-700 mt-1 font-mono">
 UTR ID REFERENCE: <span className="font-mono font-bold text-white bg-indigo-600 px-1.5 py-0.5">{request.paymentTxRef}</span>
 </p>
 </div>
 </div>
 )}

 </div>
 </motion.div>
 )}

 </div>

 {/* Right Side: Live Chat Panel (6 Columns) */}
 <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col h-[520px] overflow-hidden text-slate-900 dark:text-slate-100 rounded-3xl shadow-sm">
 
 {/* Chat Header */}
 <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40">
 <div className="flex items-center space-x-3">
 <div className="w-8 h-8 bg-indigo-600 text-white flex items-center justify-center font-sans font-bold text-xs ">
 BY
 </div>
 <div>
 <h3 className="font-bold text-slate-900 dark:text-white text-xs tracking-wide">Bytexon Lead Architect</h3>
 <p className="text-indigo-600 text-[10px] font-bold flex items-center font-mono">
 <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full mr-1.5 animate-pulse"></span>
 ONLINE & READY
 </p>
 </div>
 </div>
 
 <div className="px-2 py-0.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[9px] text-slate-500 font-bold font-mono rounded">
 Live Console
 </div>
 </div>

 {/* Chat Bubble Container */}
 <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950/20 space-y-3.5">
 {messages.length === 0 ? (
 <div className="flex flex-col items-center justify-center h-full text-center p-4 text-slate-400 space-y-2">
 <MessageSquare className="w-6 h-6 text-indigo-600" />
 <p className="text-xs font-bold text-slate-900 dark:text-white font-mono">Console session opened</p>
 <p className="text-[11px] max-w-xs leading-relaxed text-slate-500 font-mono">
 Introduce yourself, ask questions about your budget, or clarify project milestones. Our architects will respond instantly.
 </p>
 </div>
 ) : (
 messages.map((msg) => {
 const isAdmin = msg.sender === 'admin';
 return (
 <div 
 key={msg.id}
 className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}
 >
 <div className={`max-w-[85%] p-3 text-xs font-mono leading-relaxed ${
 isAdmin 
 ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl rounded-tl-none' 
 : 'bg-indigo-600 dark:bg-cyan-600 text-white font-bold rounded-xl rounded-tr-none'
 }`}>
 <p className="whitespace-pre-wrap">{msg.text}</p>
 <span className={`block text-[8px] text-right mt-1.5 font-bold font-mono ${
 isAdmin ? 'text-slate-400' : 'text-white/75'
 }`}>
 {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
 </span>
 </div>
 </div>
 );
 })
 )}
 <div ref={chatEndRef} />
 </div>

 {/* Chat Form */}
 <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center space-x-2">
 <input 
 type="text"
 value={newMessage}
 onChange={(e) => setNewMessage(e.target.value)}
 placeholder="Type message to Bytexon Architect..."
 className="flex-grow px-3 py-2 bg-slate-50 dark:bg-slate-950/40 border border-slate-300 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 focus:outline-none text-xs font-mono text-slate-900 dark:text-slate-100 placeholder-slate-400 rounded-xl"
 />
 <button 
 type="submit"
 className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white hover:text-indigo-600 border border-indigo-600 transition-colors flex-shrink-0 cursor-pointer"
 >
 <Send className="w-4 h-4" />
 </button>
 </form>

 </div>

 </div>
 </div>
 );
}
