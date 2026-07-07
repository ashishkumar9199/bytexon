import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, updateDoc, doc, addDoc, where, deleteDoc, getDocs } from 'firebase/firestore';
import { ProjectRequest, ChatMessage, AdminConfig } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';
import { motion, AnimatePresence } from 'motion/react';
import { 
 Users, CheckCircle, XCircle, Clock, Settings, MessageSquare, 
 Send, ShieldAlert, Check, Copy, RefreshCw, Upload, IndianRupee, DollarSign, LogOut, Trash2
} from 'lucide-react';
import { getQrCodeUrl } from '../lib/configHelper';
import BytexonLogo from './BytexonLogo';

interface AdminPortalProps {
 adminConfig: AdminConfig;
 onUpdateConfig: (updated: Partial<AdminConfig>) => Promise<void>;
 onLogOut: () => void;
}

export default function AdminPortal({ adminConfig, onUpdateConfig, onLogOut }: AdminPortalProps) {
 const [requests, setRequests] = useState<ProjectRequest[]>([]);
 const [selectedRequest, setSelectedRequest] = useState<ProjectRequest | null>(null);
 const [activeTab, setActiveTab] = useState<'requests' | 'chat' | 'settings'>('requests');
 const [statusFilter, setStatusFilter] = useState<string>('all');
 const [loadingRequests, setLoadingRequests] = useState(true);

 // Chat settings
 const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
 const [adminReply, setAdminReply] = useState('');
 const chatEndRef = useRef<HTMLDivElement>(null);

 // Price adjustment during approval
 const [approvalAmount, setApprovalAmount] = useState<string>('');
 const [approvalCurrency, setApprovalCurrency] = useState<'INR' | 'USD'>('INR');
 const [isApproving, setIsApproving] = useState(false);

 // Settings Forms
 const [settingsForm, setSettingsForm] = useState({
 username: sessionStorage.getItem('admin_username') || adminConfig.adminUsername || 'admin',
 password: sessionStorage.getItem('admin_password') || adminConfig.adminPassword || 'admin123',
 upiId: adminConfig.upiId,
 adminSecretPath: adminConfig.adminSecretPath || 'gate-abhya23',
 starterPrice: adminConfig.standardPricing?.starter ?? 15000,
 professionalPrice: adminConfig.standardPricing?.professional ?? 45000,
 enterprisePrice: adminConfig.standardPricing?.enterprise ?? 95000
 });
 const [qrFileBase64, setQrFileBase64] = useState<string>(adminConfig.upiQrBase64 || '');
 const [updatingSettings, setUpdatingSettings] = useState(false);
 const [settingsSuccess, setSettingsSuccess] = useState(false);

 // Sync form when parent adminConfig is loaded/updated
 useEffect(() => {
 setSettingsForm({
 username: sessionStorage.getItem('admin_username') || adminConfig.adminUsername || 'admin',
 password: sessionStorage.getItem('admin_password') || adminConfig.adminPassword || 'admin123',
 upiId: adminConfig.upiId,
 adminSecretPath: adminConfig.adminSecretPath || 'gate-abhya23',
 starterPrice: adminConfig.standardPricing?.starter ?? 15000,
 professionalPrice: adminConfig.standardPricing?.professional ?? 45000,
 enterprisePrice: adminConfig.standardPricing?.enterprise ?? 95000
 });
 setQrFileBase64(adminConfig.upiQrBase64 || '');
 }, [adminConfig]);

 // Load All Requests in Real-time
 useEffect(() => {
 setLoadingRequests(true);
 const q = collection(db, 'requests');
 const unsubscribe = onSnapshot(q, (snapshot) => {
 const list: ProjectRequest[] = [];
 snapshot.forEach((doc) => {
 list.push({ id: doc.id, ...doc.data() } as ProjectRequest);
 });
 // Sort newest first
 list.sort((a, b) => b.createdAt - a.createdAt);
 setRequests(list);
 setLoadingRequests(false);

 // Keep selectedRequest synced with real-time updates
 if (selectedRequest) {
 const updated = list.find(r => r.id === selectedRequest.id);
 if (updated) setSelectedRequest(updated);
 }
 }, (err) => {
 console.warn("Error loading admin requests (likely offline or database initializing):", err);
 setLoadingRequests(false);
 });

 return () => unsubscribe();
 }, [selectedRequest?.id]);

 // Load selected request's chat in real-time
 useEffect(() => {
 if (!selectedRequest) {
 setChatMessages([]);
 return;
 }

 const chatsRef = collection(db, 'chats');
 const q = query(chatsRef, where('requestId', '==', selectedRequest.id));

 const unsubscribe = onSnapshot(q, (snapshot) => {
 const msgs: ChatMessage[] = [];
 snapshot.forEach((doc) => {
 msgs.push({ id: doc.id, ...doc.data() } as ChatMessage);
 });
 // Sort client-side
 msgs.sort((a, b) => a.timestamp - b.timestamp);
 setChatMessages(msgs);
 }, (err) => {
 console.warn("Error loading chat messages (likely offline or database initializing):", err);
 });

 return () => unsubscribe();
 }, [selectedRequest?.id]);

 // Auto-scroll chat
 useEffect(() => {
 chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
 }, [chatMessages]);

 // Sync pricing adjustment input whenever selected request changes
 useEffect(() => {
 if (selectedRequest) {
 setApprovalAmount(selectedRequest.budgetAmount.toString());
 setApprovalCurrency(selectedRequest.budgetCurrency);
 }
 }, [selectedRequest?.id]);

 // Admin approval flow
 const handleApprove = async () => {
 if (!selectedRequest) return;
 const amountNum = parseFloat(approvalAmount);
 if (isNaN(amountNum) || amountNum <= 0) {
 alert("Please enter a valid approved amount.");
 return;
 }

 setIsApproving(true);
 try {
 const adminToken = sessionStorage.getItem('admin_token') || '';
 const docRef = doc(db, 'requests', selectedRequest.id);
 await updateDoc(docRef, {
 status: 'approved',
 approvedAmount: amountNum,
 approvedCurrency: approvalCurrency,
 approvedAt: Date.now(),
 adminAuthToken: adminToken
 });

 // Send automated system chat notice
 await addDoc(collection(db, 'chats'), {
 requestId: selectedRequest.id,
 sender: 'admin',
 text: `🎉 Good news! Bytexon has approved your project request. The final approved price is set to ${approvalCurrency === 'USD' ? '$' : '₹'}${amountNum.toLocaleString()}. You can now complete your payment through our secure UPI gateway.`,
 timestamp: Date.now()
 });

 } catch (err) {
 console.error("Error approving request:", err);
 alert("Failed to approve request.");
 } finally {
 setIsApproving(false);
 }
 };

 // Reject Request
 const handleReject = async () => {
 if (!selectedRequest) return;
 if (!confirm("Are you sure you want to decline this project request?")) return;

 try {
 const adminToken = sessionStorage.getItem('admin_token') || '';
 const docRef = doc(db, 'requests', selectedRequest.id);
 await updateDoc(docRef, {
 status: 'rejected',
 adminAuthToken: adminToken
 });

 await addDoc(collection(db, 'chats'), {
 requestId: selectedRequest.id,
 sender: 'admin',
 text: `⚠️ [System Notification] This request has been declined. If you would like to renegotiate the scope or budget, please feel free to message our lead architect directly in this console.`,
 timestamp: Date.now()
 });
 } catch (err) {
 console.error("Error rejecting request:", err);
 }
 };

 // Verify Payment
 const handleVerifyPayment = async () => {
 if (!selectedRequest) return;
 if (!confirm("Have you verified this transaction in your business UPI bank account?")) return;

 try {
 const adminToken = sessionStorage.getItem('admin_token') || '';
 const docRef = doc(db, 'requests', selectedRequest.id);
 await updateDoc(docRef, {
 status: 'completed',
 paymentVerifiedAt: Date.now(),
 adminAuthToken: adminToken
 });

 await addDoc(collection(db, 'chats'), {
 requestId: selectedRequest.id,
 sender: 'admin',
 text: `✅ Payment Verified! Thank you for completing your transaction. We have verified reference UTR ${selectedRequest.paymentTxRef}. Your project kickoff has been scheduled.`,
 timestamp: Date.now()
 });
 } catch (err) {
 console.error("Error verifying payment:", err);
 }
 };

 // Delete Proposal Request
 const handleDeleteRequest = async () => {
 if (!selectedRequest) return;
 if (!confirm(`Are you sure you want to permanently delete the proposal "${selectedRequest.name}"? This will also delete all associated chat logs. This action cannot be undone.`)) return;

 try {
 // 1. Delete associated chat messages
 const chatsRef = collection(db, 'chats');
 const q = query(chatsRef, where('requestId', '==', selectedRequest.id));
 const chatSnapshot = await getDocs(q);
 const chatPromises = chatSnapshot.docs.map(docSnap => deleteDoc(doc(db, 'chats', docSnap.id)));
 await Promise.all(chatPromises);

 // 2. Delete the request itself
 const requestDocRef = doc(db, 'requests', selectedRequest.id);
 await deleteDoc(requestDocRef);

 alert("Proposal and associated chats deleted successfully.");
 setSelectedRequest(null);
 } catch (err) {
 console.error("Error deleting request:", err);
 handleFirestoreError(err, OperationType.DELETE, `requests/${selectedRequest.id}`);
 }
 };

 // Send Admin Chat Reply
 const handleSendReply = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!adminReply.trim() || !selectedRequest) return;

 const textMsg = adminReply.trim();
 setAdminReply('');

 try {
 await addDoc(collection(db, 'chats'), {
 requestId: selectedRequest.id,
 sender: 'admin',
 text: textMsg,
 timestamp: Date.now()
 });
 } catch (err) {
 console.error("Error sending admin chat:", err);
 }
 };

 // Handle QR code file upload and conversion to base64
 const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (!file) return;

 const reader = new FileReader();
 reader.onload = () => {
 if (typeof reader.result === 'string') {
 setQrFileBase64(reader.result);
 }
 };
 reader.readAsDataURL(file);
 };

 // Update Settings in Firebase config
 const handleSaveSettings = async (e: React.FormEvent) => {
 e.preventDefault();
 setUpdatingSettings(true);
 setSettingsSuccess(false);

 try {
 await onUpdateConfig({
 adminUsername: settingsForm.username.trim(),
 adminPassword: settingsForm.password.trim(),
 upiId: settingsForm.upiId.trim(),
 adminSecretPath: settingsForm.adminSecretPath.trim(),
 upiQrBase64: qrFileBase64,
 standardPricing: {
 starter: Number(settingsForm.starterPrice),
 professional: Number(settingsForm.professionalPrice),
 enterprise: Number(settingsForm.enterprisePrice)
 }
 });
 setSettingsSuccess(true);
 setTimeout(() => setSettingsSuccess(false), 3000);
 } catch (err) {
 console.error("Error saving settings:", err);
 alert("Failed to save settings.");
 } finally {
 setUpdatingSettings(false);
 }
 };

 // Filter requests
 const filteredRequests = requests.filter(req => {
 if (statusFilter === 'all') return true;
 return req.status === statusFilter;
 });

 return (
 <div className="min-h-screen bg-slate-50 font-sans flex flex-col text-slate-900">
 
 {/* Top Banner Header */}
 <header className="bg-white text-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-200">
 <div className="flex items-center space-x-3">
 <BytexonLogo theme="light" height={24} />
 <span className="text-slate-400 font-mono text-[9px] font-bold border-l border-slate-300 pl-3 ">
 Architect Admin Workspace
 </span>
 </div>

 <div className="flex items-center space-x-4">
 <div className="text-right hidden sm:block leading-none">
 <p className="text-xs font-bold text-slate-900 font-mono ">{adminConfig.adminUsername}</p>
 <span className="text-[8px] text-indigo-600 font-mono font-bold ">Root Active</span>
 </div>

 <button 
 onClick={onLogOut}
 id="btn-admin-logout"
 className="flex items-center space-x-1 px-3 py-1.5 bg-slate-50 hover:bg-rose-500/25 hover:text-rose-400 border border-slate-200 hover:border-rose-500/50 text-[10px] font-mono transition-all cursor-pointer"
 >
 <LogOut className="w-3.5 h-3.5" />
 <span>Sign Out</span>
 </button>
 </div>
 </header>

 {/* Primary Workspace Navigation Tabs */}
 <nav className="bg-white border-b border-slate-200 px-4 py-0 flex items-center justify-between">
 <div className="flex space-x-2">
 <button
 onClick={() => setActiveTab('requests')}
 id="tab-requests"
 className={`py-3 px-4 font-mono font-bold text-xs border-b-2 transition-all cursor-pointer ${
 activeTab === 'requests' 
 ? 'border-indigo-600 text-indigo-600' 
 : 'border-transparent text-slate-400 hover:text-slate-900'
 }`}
 >
 Proposals ({requests.length})
 </button>
 
 <button
 onClick={() => {
 setActiveTab('chat');
 // Auto select first request if none selected
 if (!selectedRequest && requests.length > 0) {
 setSelectedRequest(requests[0]);
 }
 }}
 id="tab-chat"
 className={`py-3 px-4 font-mono font-bold text-xs border-b-2 transition-all cursor-pointer ${
 activeTab === 'chat' 
 ? 'border-indigo-600 text-indigo-600' 
 : 'border-transparent text-slate-400 hover:text-slate-900'
 }`}
 >
 Chatroom Console
 </button>

 <button
 onClick={() => setActiveTab('settings')}
 id="tab-settings"
 className={`py-3 px-4 font-mono font-bold text-xs border-b-2 transition-all cursor-pointer ${
 activeTab === 'settings' 
 ? 'border-indigo-600 text-indigo-600' 
 : 'border-transparent text-slate-400 hover:text-slate-900'
 }`}
 >
 Billing Config
 </button>
 </div>

 <div className="text-slate-900/35 font-mono text-[9px] font-bold hidden md:block ">
 SYS STATUS: <span className="text-indigo-600">● SECURE SSL</span>
 </div>
 </nav>

 {/* Main Content Area */}
 <main className="flex-1 p-4 overflow-hidden bg-slate-50">
 
 {/* REQUESTS VIEW */}
 {activeTab === 'requests' && (
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start h-full">
 
 {/* Left Side: Proposal List (5 Columns) */}
 <div className="lg:col-span-5 bg-white border border-slate-200 p-4 flex flex-col max-h-[700px] text-slate-900">
 
 {/* Header & Filter Row */}
 <div className="space-y-3 mb-4">
 <div className="flex items-center justify-between">
 <h2 className="text-xs font-bold text-slate-900 font-mono">Proposals</h2>
 <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-600 font-bold font-mono text-[9px] ">
 {filteredRequests.length} LISTED
 </span>
 </div>
 
 {/* Filter Grid */}
 <div className="flex flex-wrap gap-1 p-1 bg-slate-50 border border-slate-200">
 {['all', 'pending', 'approved', 'rejected', 'payment_submitted', 'completed'].map((status) => (
 <button
 key={status}
 onClick={() => setStatusFilter(status)}
 className={`px-2 py-1 text-[9px] font-bold font-mono transition-all cursor-pointer ${
 statusFilter === status 
 ? 'bg-indigo-600 text-white' 
 : 'text-slate-400 hover:text-slate-900'
 }`}
 >
 {status.replace('_', ' ')}
 </button>
 ))}
 </div>
 </div>

 {/* Scrollable list */}
 <div className="flex-grow overflow-y-auto space-y-2 pr-1">
 {loadingRequests ? (
 <div className="py-12 text-center text-slate-400 font-mono">
 <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
 <span className="text-xs">FETCHING ARCHIVE...</span>
 </div>
 ) : filteredRequests.length === 0 ? (
 <div className="py-12 text-center text-slate-400 font-mono space-y-2">
 <Clock className="w-6 h-6 text-indigo-600 mx-auto mb-1" />
 <p className="font-bold text-xs text-slate-900">NO ARCHIVES FOUND</p>
 <p className="text-[10px] text-slate-400">ADJUST STATUS FILTERS ABOVE</p>
 </div>
 ) : (
 filteredRequests.map((req) => {
 const isSelected = selectedRequest?.id === req.id;
 const bSign = req.budgetCurrency === 'USD' ? '$' : '₹';
 return (
 <button
 key={req.id}
 onClick={() => setSelectedRequest(req)}
 className={`w-full text-left p-3 border transition-all flex flex-col space-y-2 cursor-pointer font-mono ${
 isSelected 
 ? 'bg-slate-50 border-indigo-600' 
 : 'bg-slate-50 border-slate-200 hover:border-slate-300/35'
 }`}
 >
 <div className="flex items-center justify-between w-full">
 <span className="font-mono text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5">
 ID: {req.id}
 </span>
 <span className={`px-1.5 py-0.5 text-[8px] font-bold border ${
 req.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
 req.status === 'approved' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
 req.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
 req.status === 'payment_submitted' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 animate-pulse' :
 'bg-teal-500/10 text-teal-400 border-teal-500/30'
 }`}>
 {req.status.replace('_', ' ')}
 </span>
 </div>

 <div>
 <p className="font-bold text-slate-900 text-xs truncate">{req.name}</p>
 <p className="text-slate-500 text-[10px] truncate max-w-xs">{req.description}</p>
 </div>

 <div className="flex items-center justify-between pt-2 border-t border-slate-200 mt-1 text-[9px] text-slate-400 font-bold">
 <span>{new Date(req.createdAt).toLocaleDateString()}</span>
 <span className="text-indigo-600">
 BUDGET: {bSign}{req.budgetAmount.toLocaleString()}
 </span>
 </div>
 </button>
 );
 })
 )}
 </div>

 </div>

 {/* Right Side: Request Details, Approvals, & Chats (7 Columns) */}
 <div className="lg:col-span-7 bg-white border border-slate-200 text-slate-900 overflow-hidden max-h-[700px] flex flex-col">
 
 {selectedRequest ? (
 <div className="flex-grow flex flex-col h-full overflow-hidden">
 
 {/* Selected Header */}
 <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
 <div>
 <div className="flex items-center space-x-1.5">
 <h3 className="font-bold text-slate-900 text-xs ">{selectedRequest.name}</h3>
 <span className="text-[10px] text-slate-500 font-mono">({selectedRequest.email.toUpperCase()})</span>
 </div>
 <p className="text-slate-400 text-[9px] mt-1 font-mono">REFERENCE TRACKING ID: {selectedRequest.id}</p>
 </div>

 <div className="flex items-center space-x-1.5">
 <button 
 onClick={() => {
 setActiveTab('chat');
 }}
 className="p-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white hover:text-indigo-600 transition-colors font-mono text-[9px] font-bold cursor-pointer flex items-center space-x-1"
 title="View Full Screen Chat"
 >
 <MessageSquare className="w-3.5 h-3.5" />
 <span>Open Chat</span>
 </button>

 <button 
 onClick={handleDeleteRequest}
 className="p-1.5 px-3 bg-rose-50 hover:bg-rose-600/20 text-rose-600 hover:text-rose-700 border border-rose-200 hover:border-rose-300 transition-colors font-mono text-[9px] font-bold cursor-pointer flex items-center space-x-1"
 title="Delete Proposal permanently"
 >
 <Trash2 className="w-3.5 h-3.5" />
 <span>Delete</span>
 </button>
 </div>
 </div>

 {/* Details & Actions Split Body */}
 <div className="flex-grow overflow-y-auto p-4 space-y-4">
 
 {/* Description Details Card */}
 <div className="bg-slate-50 p-4 border border-slate-200">
 <h4 className="text-[9px] font-bold text-slate-400 mb-2 font-mono">Proposal requirements</h4>
 <p className="text-slate-900 text-xs leading-relaxed whitespace-pre-wrap font-mono">{selectedRequest.description}</p>
 
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-200 text-[10px] font-mono">
 <div>
 <p className="text-slate-400 font-bold text-[8px] font-mono">WHATSAPP</p>
 <p className="text-slate-900 font-bold mt-1 text-xs">{selectedRequest.whatsapp}</p>
 </div>
 {selectedRequest.companyName && (
 <div>
 <p className="text-slate-400 font-bold text-[8px] font-mono">COMPANY</p>
 <p className="text-slate-900 font-bold mt-1 text-xs truncate ">{selectedRequest.companyName}</p>
 </div>
 )}
 <div>
 <p className="text-slate-400 font-bold text-[8px] font-mono">CLIENT BUDGET</p>
 <p className="text-indigo-600 font-bold mt-1 text-xs">
 {selectedRequest.budgetCurrency === 'USD' ? '$' : '₹'}{selectedRequest.budgetAmount.toLocaleString()}
 </p>
 </div>
 <div>
 <p className="text-slate-400 font-bold text-[8px] font-mono">SUBMITTED</p>
 <p className="text-slate-900 font-bold mt-1 text-xs">
 {new Date(selectedRequest.createdAt).toLocaleDateString()}
 </p>
 </div>
 </div>
 </div>

 {/* Approved Price details if approved */}
 {(selectedRequest.status === 'approved' || selectedRequest.status === 'payment_submitted' || selectedRequest.status === 'completed') && (
 <div className="bg-indigo-50 border border-indigo-200 p-3">
 <div className="flex justify-between items-center">
 <div>
 <p className="text-indigo-600 text-[9px] font-bold font-mono">Approved final pricing</p>
 <p className="text-sm font-sans font-bold text-slate-900 mt-0.5">
 {selectedRequest.approvedCurrency === 'USD' ? '$' : '₹'}{selectedRequest.approvedAmount?.toLocaleString()}
 </p>
 </div>
 <span className="px-2 py-0.5 bg-indigo-600 text-white text-[9px] font-bold font-mono">
 APPROVED
 </span>
 </div>
 </div>
 )}

 {/* Payment Proof Details if submitted */}
 {(selectedRequest.status === 'payment_submitted' || selectedRequest.status === 'completed') && (
 <div className="bg-blue-500/10 border border-blue-500/20 p-3.5 space-y-2.5">
 <h4 className="text-[9px] font-bold text-blue-400 font-mono">Payment transaction proof</h4>
 
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-mono">
 <div>
 <p className="text-blue-400 font-bold text-[9px] ">UTR / UPI REFERENCE ID</p>
 <p className="text-slate-900 font-bold font-mono text-xs select-all bg-slate-50 px-2.5 py-1.5 border border-slate-200 mt-1">
 {selectedRequest.paymentTxRef}
 </p>
 </div>
 {selectedRequest.paymentNotes && (
 <div>
 <p className="text-blue-400 font-bold text-[9px] ">CLIENT REMARKS</p>
 <p className="text-slate-700 bg-slate-50 px-2.5 py-1.5 border border-slate-200 mt-1 truncate">
 {selectedRequest.paymentNotes}
 </p>
 </div>
 )}
 </div>
 </div>
 )}

 {/* ACTIONS FORM GRID (Changes Based on Status) */}
 <div className="border-t border-slate-200 pt-4 space-y-3">
 <h4 className="text-[9px] font-bold text-slate-400 font-mono">Workflow controls</h4>

 {selectedRequest.status === 'pending' && (
 <div className="space-y-3.5 bg-slate-50 p-4 border border-slate-200">
 <p className="text-[10px] text-slate-500 font-mono leading-relaxed">SET FINAL APPROVED PRICE (INR/USD) FOR UPI EXECUTION AND CLICK APPROVE, OR DECLINE PROPOSAL.</p>
 
 <div className="flex gap-3 items-end">
 <div className="flex-1">
 <label className="block text-[8px] font-bold text-slate-400 mb-1.5 font-mono">FINAL APPROVED PRICE</label>
 <div className="flex border border-slate-300 bg-white">
 <select 
 value={approvalCurrency}
 onChange={(e) => setApprovalCurrency(e.target.value as 'INR' | 'USD')}
 className="bg-slate-50 text-slate-900 font-bold px-2 py-1.5 text-[10px] focus:outline-none border-r border-slate-300 font-mono "
 >
 <option value="INR">INR (₹)</option>
 <option value="USD">USD ($)</option>
 </select>
 <input 
 type="number"
 placeholder="APPROVED AMOUNT"
 value={approvalAmount}
 onChange={(e) => setApprovalAmount(e.target.value)}
 className="w-full px-3 py-1.5 bg-white text-slate-900 text-xs focus:outline-none font-bold font-mono placeholder-slate-400"
 />
 </div>
 </div>

 <button
 onClick={handleApprove}
 disabled={isApproving}
 id="btn-admin-approve"
 className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white hover:text-indigo-600 text-[10px] font-mono font-bold border border-indigo-600 transition-colors flex items-center space-x-1 cursor-pointer"
 >
 <CheckCircle className="w-3.5 h-3.5" />
 <span>{isApproving ? 'APPROVING...' : 'APPROVE'}</span>
 </button>

 <button
 onClick={handleReject}
 id="btn-admin-reject"
 className="px-3 py-2 bg-slate-50 hover:bg-rose-500/20 border border-slate-200 hover:border-rose-500/45 text-rose-400 text-[10px] font-mono font-bold transition-colors flex items-center space-x-1 cursor-pointer"
 >
 <XCircle className="w-3.5 h-3.5" />
 <span>Decline</span>
 </button>
 </div>
 </div>
 )}

 {selectedRequest.status === 'approved' && (
 <div className="bg-slate-50 p-4 border border-slate-200 text-center text-slate-500 text-[10px] py-6 space-y-2">
 <Clock className="w-6 h-6 text-indigo-600 mx-auto" />
 <p className="font-bold text-slate-900 font-mono ">Awaiting Client Payment Execution</p>
 <p className="leading-relaxed font-mono">APPROVED AT {selectedRequest.approvedCurrency === 'USD' ? '$' : '₹'}{selectedRequest.approvedAmount?.toLocaleString()}. CLIENT MUST SUBMIT TRANSACTION LOGS TO PROGRESS.</p>
 </div>
 )}

 {selectedRequest.status === 'payment_submitted' && (
 <div className="bg-indigo-50 border border-indigo-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
 <div className="text-left space-y-1">
 <h5 className="font-bold text-indigo-600 text-xs flex items-center space-x-1.5 font-mono">
 <span>Action Required: Confirm Transaction ID</span>
 </h5>
 <p className="text-[10px] text-slate-700 max-w-md leading-relaxed font-mono">
 MATCH BUSINESS STATEMENTS FOR REFERENCE <strong className="text-indigo-600 font-bold">{selectedRequest.paymentTxRef}</strong>. IF RECEIVED, VERIFY KICKOFF.
 </p>
 </div>

 <div className="flex gap-2 w-full sm:w-auto">
 <button
 onClick={handleVerifyPayment}
 id="btn-admin-verify-pay"
 className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white hover:text-indigo-600 text-[10px] font-mono font-bold border border-indigo-600 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
 >
 <CheckCircle className="w-3.5 h-3.5" />
 <span>Verify & Kickoff</span>
 </button>
 </div>
 </div>
 )}

 {selectedRequest.status === 'completed' && (
 <div className="bg-indigo-50 text-indigo-600 border border-indigo-200 p-3 text-[10px] font-bold font-mono flex items-center space-x-3">
 <CheckCircle className="w-4 h-4 text-indigo-600 flex-shrink-0" />
 <div>
 <p className=" ">[ TRANSACTION FULLY VERIFIED & COMPLETE ]</p>
 <p className="text-slate-500 mt-1 ">Kicked off: {selectedRequest.paymentVerifiedAt ? new Date(selectedRequest.paymentVerifiedAt).toLocaleString() : 'N/A'}</p>
 </div>
 </div>
 )}

 {selectedRequest.status === 'rejected' && (
 <div className="bg-rose-500/10 text-rose-400 border border-rose-500/30 p-3 text-[10px] font-bold font-mono flex items-center space-x-3">
 <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
 <div>
 <p className=" ">Request declined</p>
 <p className="text-slate-500 mt-1">CLIENTS CAN CHAT LIVE TO ADJUST BUDGET PROPOSALS.</p>
 </div>
 </div>
 )}

 </div>

 </div>

 </div>
 ) : (
 <div className="flex-grow flex flex-col items-center justify-center text-center p-8 text-slate-400 py-36 font-mono">
 <Users className="w-10 h-10 text-indigo-600 mb-3" />
 <h3 className="font-bold text-slate-900 text-xs ">Select a proposal</h3>
 <p className="text-[10px] max-w-sm mt-1 leading-relaxed">CLICK ANY PROPOSAL ON THE LEFT SIDEBAR TO MANAGE ITS STATE, VIEW SPECIFICATIONS, ADJUST PRICES, AND VERIFY TRANSACTIONS.</p>
 </div>
 )}

 </div>

 </div>
 )}

 {/* CHATROOM CONSOLE VIEW */}
 {activeTab === 'chat' && (
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start h-full max-h-[700px]">
 
 {/* Chat List Sidebar (4 Columns) */}
 <div className="lg:col-span-4 bg-white border border-slate-200 p-3 flex flex-col h-[600px] overflow-hidden">
 <h3 className="text-xs font-bold text-slate-900 mb-3 flex items-center space-x-1.5 font-mono">
 <MessageSquare className="w-4 h-4 text-indigo-600" />
 <span>Client chats</span>
 </h3>
 
 <div className="flex-grow overflow-y-auto space-y-2 pr-1">
 {requests.length === 0 ? (
 <p className="text-slate-400 text-xs text-center py-20 font-mono">No clients available for chat.</p>
 ) : (
 requests.map((req) => {
 const isSelected = selectedRequest?.id === req.id;
 return (
 <button
 key={req.id}
 onClick={() => setSelectedRequest(req)}
 className={`w-full text-left p-3 border transition-colors flex items-center space-x-3 cursor-pointer ${
 isSelected 
 ? 'bg-indigo-50 border-indigo-600 text-slate-900' 
 : 'bg-slate-50 hover:bg-slate-50 border-slate-200 text-slate-700'
 }`}
 >
 <div className={`w-8 h-8 flex items-center justify-center font-bold text-[10px] font-mono ${
 isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-900'
 }`}>
 {req.name.substring(0, 2).toUpperCase()}
 </div>
 <div className="flex-grow min-w-0 font-mono">
 <div className="flex justify-between items-center">
 <span className="font-bold text-slate-900 text-xs truncate ">{req.name}</span>
 <span className="text-[8px] font-mono font-bold text-indigo-600 bg-slate-50 px-1.5 py-0.5 border border-indigo-200">
 {req.id}
 </span>
 </div>
 <p className="text-slate-500 text-[9px] truncate mt-1">{req.description.toUpperCase()}</p>
 </div>
 </button>
 );
 })
 )}
 </div>
 </div>

 {/* Main Chat Conversation (8 Columns) */}
 <div className="lg:col-span-8 bg-white border border-slate-200 flex flex-col h-[600px] overflow-hidden">
 
 {selectedRequest ? (
 <div className="flex-grow flex flex-col h-full overflow-hidden">
 
 {/* Active Chat Header */}
 <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50 font-mono">
 <div className="flex items-center space-x-2.5">
 <div className="w-8 h-8 bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
 {selectedRequest.name.substring(0,2).toUpperCase()}
 </div>
 <div>
 <h4 className="font-bold text-slate-900 text-xs ">SECURE SESSION WITH {selectedRequest.name}</h4>
 <p className="text-slate-400 text-[9px] font-mono mt-0.5">REFERENCE: {selectedRequest.id} | WHATSAPP: {selectedRequest.whatsapp}</p>
 </div>
 </div>

 <span className={`px-2 py-0.5 text-[8px] font-bold border ${
 selectedRequest.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
 selectedRequest.status === 'approved' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
 selectedRequest.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
 selectedRequest.status === 'payment_submitted' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30' :
 'bg-teal-500/10 text-teal-400 border-teal-500/30'
 }`}>
 {selectedRequest.status.replace('_', ' ')}
 </span>
 </div>

 {/* Messaging Panel */}
 <div className="flex-grow overflow-y-auto p-4 bg-slate-50 space-y-3">
 {chatMessages.length === 0 ? (
 <div className="text-center py-24 text-slate-300 text-xs font-mono ">[ NO LOGS EXIST. SAY HELLO FIRST ]</div>
 ) : (
 chatMessages.map((msg) => {
 const isMe = msg.sender === 'admin';
 return (
 <div 
 key={msg.id}
 className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
 >
 <div className={`max-w-[85%] p-3 text-xs font-mono border ${
 isMe 
 ? 'bg-indigo-600 text-white border-indigo-600' 
 : 'bg-white text-slate-900 border-slate-200'
 }`}>
 <p className="leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</p>
 <span className={`block text-[8px] text-right mt-1.5 font-bold ${isMe ? 'text-white/60' : 'text-slate-400'}`}>
 {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
 </span>
 </div>
 </div>
 );
 })
 )}
 <div ref={chatEndRef} />
 </div>

 {/* Reply form */}
 <form onSubmit={handleSendReply} className="p-3 border-t border-slate-200 bg-slate-50 flex items-center space-x-2">
 <input 
 type="text"
 value={adminReply}
 onChange={(e) => setAdminReply(e.target.value)}
 placeholder={`REPLY TO CLIENT ${selectedRequest.name.toUpperCase()}...`}
 className="flex-grow px-3.5 py-2 bg-white border border-slate-200 focus:border-indigo-600 focus:outline-none text-slate-900 text-xs font-mono placeholder-slate-400"
 />
 <button 
 type="submit"
 className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white hover:text-indigo-600 transition-colors flex-shrink-0 cursor-pointer border border-indigo-600"
 >
 <Send className="w-4 h-4" />
 </button>
 </form>

 </div>
 ) : (
 <div className="flex-grow flex flex-col items-center justify-center text-center p-8 text-slate-400 py-36 font-mono">
 <MessageSquare className="w-10 h-10 text-indigo-600 mb-3" />
 <h3 className="font-bold text-slate-900 text-xs ">Open a conversation</h3>
 <p className="text-[10px] max-w-sm mt-1 leading-relaxed">SELECT ANY CUSTOMER FROM THE SIDEBAR ON THE LEFT TO START SENDING SECURE LIVE CHAT MESSAGES.</p>
 </div>
 )}

 </div>
 </div>
 )}

 {/* SETTINGS VIEW */}
 {activeTab === 'settings' && (
 <div className="max-w-2xl mx-auto bg-white border border-slate-200 p-6 relative overflow-hidden">
 
 <div className="absolute top-0 left-0 w-full h-[2px] bg-indigo-600"></div>

 <div className="space-y-6">
 <div className="border-b border-slate-200 pb-4">
 <h2 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5 font-mono">
 <Settings className="w-4 h-4 text-indigo-600" />
 <span>Platform system settings</span>
 </h2>
 <p className="text-slate-500 text-[10px] mt-1 font-mono ">Manage admin credentials, update payment gateway settings, adjust standard plans, and upload UPI QR codes.</p>
 </div>

 {settingsSuccess && (
 <div className="bg-indigo-50 text-indigo-600 border border-indigo-200 p-3 flex items-center space-x-2 text-[10px] font-mono font-bold">
 <Check className="w-4 h-4 text-indigo-600" />
 <span>System configuration saved successfully. Changes are live.</span>
 </div>
 )}

 <form onSubmit={handleSaveSettings} className="space-y-6">
 
 {/* Credentials block */}
 <div className="space-y-4">
 <h3 className="text-[9px] font-bold text-indigo-600 font-mono">1. ADMIN CREDENTIALS & SECURE ACCESS PATH</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-slate-500 text-[9px] font-bold mb-1.5 font-mono">
 System Username
 </label>
 <input 
 type="text"
 required
 value={settingsForm.username}
 onChange={(e) => setSettingsForm(prev => ({ ...prev, username: e.target.value }))}
 className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:outline-none text-slate-900 text-xs font-mono font-semibold transition-colors"
 />
 </div>

 <div>
 <label className="block text-slate-500 text-[9px] font-bold mb-1.5 font-mono">
 System Password
 </label>
 <input 
 type="text"
 required
 value={settingsForm.password}
 onChange={(e) => setSettingsForm(prev => ({ ...prev, password: e.target.value }))}
 className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:outline-none text-slate-900 text-xs font-mono transition-colors"
 />
 </div>
 </div>

 <div>
 <label className="block text-slate-500 text-[9px] font-bold mb-1.5 font-mono">
 Secret Admin URL Access Path Hash
 </label>
 <div className="flex border border-slate-200 bg-slate-50 overflow-hidden focus-within:border-indigo-600 transition-colors">
 <span className="px-3 py-2 text-[10px] text-slate-400 font-mono bg-white border-r border-slate-200 select-none">
 #/admin-
 </span>
 <input 
 type="text"
 required
 placeholder="e.g. secret-entry"
 value={settingsForm.adminSecretPath}
 onChange={(e) => setSettingsForm(prev => ({ ...prev, adminSecretPath: e.target.value.replace(/[^a-zA-Z0-9_-]/g, '') }))}
 className="w-full px-3 py-2 bg-slate-50 focus:outline-none text-slate-900 text-xs font-mono font-semibold"
 />
 </div>
 <p className="text-[9px] text-slate-400 mt-1.5 leading-relaxed font-mono ">
 BY SETTING THIS PATH, THE LOGIN SCREEN IS ONLY ACCESSIBLE BY ENTERING <span className="text-indigo-600 font-semibold">#/admin-{settingsForm.adminSecretPath || 'bytexon-secure-gate'}</span> IN YOUR BROWSER'S ADDRESS BAR.
 </p>
 </div>
 </div>

 {/* Billing credentials */}
 <div className="space-y-4 pt-4 border-t border-slate-200">
 <h3 className="text-[9px] font-bold text-indigo-600 font-mono">2. UPI PAYMENT GATEWAY CONFIG</h3>
 
 <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
 
 <div className="md:col-span-7 space-y-4">
 <div>
 <label className="block text-slate-500 text-[9px] font-bold mb-1.5 font-mono">
 Commercial UPI ID <span className="text-rose-500">*</span>
 </label>
 <input 
 type="text"
 required
 value={settingsForm.upiId}
 onChange={(e) => setSettingsForm(prev => ({ ...prev, upiId: e.target.value }))}
 className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:outline-none text-slate-900 text-xs font-mono font-bold transition-colors"
 />
 <p className="text-[9px] text-slate-400 mt-1.5 leading-relaxed font-mono ">When empty or default, we render a dynamic UPI Pay URL scannable by BHIM, GooglePay, and PhonePe.</p>
 </div>

 <div className="p-3 bg-slate-50 border border-slate-200 flex items-start space-x-2 text-[9px] text-slate-500 font-mono ">
 <ShieldAlert className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 mt-0.5" />
 <span>UPI Transactions require instant local UTR ID checks. Keep this UPI target accurate.</span>
 </div>
 </div>
 {/* QR Code Uploader */}
 <div className="md:col-span-5 bg-slate-50 p-4 border border-slate-200 text-center space-y-3 flex flex-col items-center">
 <p className="text-[9px] font-bold text-slate-500 font-mono ">UPI QR Code</p>
 
 {qrFileBase64 ? (
 <div className="relative group">
 <img 
 src={qrFileBase64} 
 alt="Uploaded UPI QR"
 className="w-24 h-24 object-contain bg-white p-1 rounded-sm border border-slate-300 shadow-sm"
 />
 <button
 type="button"
 onClick={() => setQrFileBase64('')}
 className="absolute -top-1.5 -right-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-0.5 shadow-md transition-colors cursor-pointer"
 title="Remove image"
 >
 <XCircle className="w-3.5 h-3.5" />
 </button>
 </div>
 ) : (
 <div className="w-24 h-24 border border-dashed border-slate-300 flex flex-col items-center justify-center bg-slate-50 text-slate-300 text-xs p-2">
 <Upload className="w-4 h-4 mb-1 text-slate-200" />
 <span className="text-[8px] font-mono ">NO IMAGE</span>
 </div>
 )}

 <div className="w-full">
 <label className="block w-full py-1.5 bg-slate-50 hover:bg-white border border-slate-200 text-[9px] font-bold cursor-pointer text-slate-900 hover:text-indigo-600 transition-colors font-mono">
 <input 
 type="file"
 accept="image/*"
 onChange={handleQrUpload}
 className="hidden"
 />
 Upload QR Image
 </label>
 <p className="text-[8px] text-slate-400 mt-1 font-mono ">Stored as secure inline data-URL.</p>
 </div>
 </div>

 </div>
 </div>

 {/* Standard Plan Price change */}
 <div className="space-y-4 pt-4 border-t border-slate-200 font-mono">
 <h3 className="text-[9px] font-bold text-indigo-600 font-mono">3. PRICE TABLE UPDATES</h3>
 <p className="text-[10px] text-slate-500 leading-relaxed ">Adjust standard starter template pricing. Changes are applied immediately to standard plan cards on the client landing page.</p>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <div>
 <label className="block text-slate-500 text-[9px] font-bold mb-1.5">
 Starter (INR)
 </label>
 <input 
 type="number"
 required
 value={settingsForm.starterPrice}
 onChange={(e) => setSettingsForm(prev => ({ ...prev, starterPrice: Number(e.target.value) }))}
 className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:outline-none text-slate-900 text-xs font-mono font-bold transition-colors"
 />
 </div>

 <div>
 <label className="block text-slate-500 text-[9px] font-bold mb-1.5">
 Professional (INR)
 </label>
 <input 
 type="number"
 required
 value={settingsForm.professionalPrice}
 onChange={(e) => setSettingsForm(prev => ({ ...prev, professionalPrice: Number(e.target.value) }))}
 className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:outline-none text-slate-900 text-xs font-mono font-bold transition-colors"
 />
 </div>

 <div>
 <label className="block text-slate-500 text-[9px] font-bold mb-1.5">
 Enterprise (INR)
 </label>
 <input 
 type="number"
 required
 value={settingsForm.enterprisePrice}
 onChange={(e) => setSettingsForm(prev => ({ ...prev, enterprisePrice: Number(e.target.value) }))}
 className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:outline-none text-slate-900 text-xs font-mono font-bold transition-colors"
 />
 </div>
 </div>
 <div className="pt-4 border-t border-slate-200 flex justify-end">
 <button
 type="submit"
 disabled={updatingSettings}
 id="btn-save-settings"
 className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white hover:text-indigo-600 disabled:bg-slate-50 disabled:text-slate-200 disabled:border-slate-200 text-[10px] font-bold border border-indigo-600 transition-colors flex items-center space-x-1.5 cursor-pointer"
 >
 {updatingSettings ? (
 <>
 <div className="w-3.5 h-3.5 border border-white border-t-transparent animate-spin"></div>
 <span>Saving...</span>
 </>
 ) : (
 <>
 <Check className="w-3.5 h-3.5" />
 <span>Save Configuration</span>
 </>
 )}
 </button>
 </div>
 </div>

 </form>
 </div>
 </div>
 )}

 </main>
 </div>
 );
}
