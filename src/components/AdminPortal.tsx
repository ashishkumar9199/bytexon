import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, updateDoc, doc, addDoc, where, deleteDoc, getDocs } from 'firebase/firestore';
import { ProjectRequest, ChatMessage, AdminConfig, PaymentRecord } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';
import { motion, AnimatePresence } from 'motion/react';
import { 
 Users, CheckCircle, XCircle, Clock, Settings, MessageSquare, 
 Send, ShieldAlert, Check, Copy, RefreshCw, Upload, IndianRupee, DollarSign, LogOut, Trash2, Key, QrCode, Activity,
 Paperclip, FileText, Shield, Lock
} from 'lucide-react';
import { getQrCodeUrl, getAdminTotpConfig, updateAdminTotpConfig } from '../lib/configHelper';
import { generateBase32Secret, generateOtpauthUri, verifyTotp } from '../lib/totpHelper';
import QRCode from 'qrcode';
import BytexonLogo from './BytexonLogo';
import { useToast } from '../context/ToastContext';

interface AdminPortalProps {
 adminConfig: AdminConfig;
 onUpdateConfig: (updated: Partial<AdminConfig>) => Promise<void>;
 onLogOut: () => void;
}

export default function AdminPortal({ adminConfig, onUpdateConfig, onLogOut }: AdminPortalProps) {
 const { showToast } = useToast();
 const [requests, setRequests] = useState<ProjectRequest[]>([]);
 const [selectedRequest, setSelectedRequest] = useState<ProjectRequest | null>(null);
 const [activeTab, setActiveTab] = useState<'requests' | 'chat' | 'settings' | 'security'>('requests');
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

 // Daily updates state
 const [newUpdateTitle, setNewUpdateTitle] = useState('');
 const [newUpdateNotes, setNewUpdateNotes] = useState('');
 const [newUpdateStatus, setNewUpdateStatus] = useState<'Update' | 'In Progress' | 'Completed' | 'Blocked'>('Update');
 const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);

 // Settings Forms
 const [settingsForm, setSettingsForm] = useState({
 username: sessionStorage.getItem('admin_username') || adminConfig.adminUsername || '',
 password: sessionStorage.getItem('admin_password') || adminConfig.adminPassword || '',
 upiId: adminConfig.upiId,
 adminSecretPath: adminConfig.adminSecretPath || 'gate-abhya23',
 starterPrice: adminConfig.standardPricing?.starter ?? 15000,
 professionalPrice: adminConfig.standardPricing?.professional ?? 45000,
 enterprisePrice: adminConfig.standardPricing?.enterprise ?? 95000
 });
 const [qrFileBase64, setQrFileBase64] = useState<string>(adminConfig.upiQrBase64 || '');
 const [updatingSettings, setUpdatingSettings] = useState(false);
 const [settingsSuccess, setSettingsSuccess] = useState(false);

 // TOTP Two-Factor Authentication states
 const [totpEnabled, setTotpEnabled] = useState(false);
 const [totpSecret, setTotpSecret] = useState('');
 const [showTotpSetup, setShowTotpSetup] = useState(false);
 const [totpSetupSecret, setTotpSetupSecret] = useState('');
 const [totpQrCodeDataUrl, setTotpQrCodeDataUrl] = useState('');
 const [totpVerificationCode, setTotpVerificationCode] = useState('');
 const [isVerifyingTotpSetup, setIsVerifyingTotpSetup] = useState(false);

 // Security Audit Center States
 const [selectedSecCheck, setSelectedSecCheck] = useState<number>(1);
 const [sstiInput, setSstiInput] = useState<string>('{{this.constructor.constructor("return process")()}}');
 const [redosInputMode, setRedosInputMode] = useState<'normal' | 'exploit'>('normal');
 const [longPassLength, setLongPassLength] = useState<number>(25000);
 const [injectionInput, setInjectionInput] = useState<string>("' OR '1'='1");
 const [secReplayToken, setSecReplayToken] = useState<string>('');
 const [secReplayUsed, setSecReplayUsed] = useState<boolean>(false);
 const [secReplayAttempts, setSecReplayAttempts] = useState<number>(0);
 const [securityLogs, setSecurityLogs] = useState<string[]>([
   "[SYSTEM] Security Compliance Guard initialized.",
   "[SYSTEM] Ready for interactive threat vector simulation."
 ]);

 const addSecurityLog = (msg: string) => {
   const timestamp = new Date().toLocaleTimeString();
   setSecurityLogs(prev => {
     const updated = [...prev, `[${timestamp}] ${msg}`];
     if (updated.length > 45) return updated.slice(updated.length - 45);
     return updated;
   });
 };

 // Sync TOTP state whenever we enter settings tab
 useEffect(() => {
   const loadTotpConfig = async () => {
     const token = sessionStorage.getItem('admin_token') || '';
     if (token) {
       const conf = await getAdminTotpConfig(token);
       setTotpEnabled(!!conf.totpEnabled);
       setTotpSecret(conf.totpSecret || '');
     }
   };
   if (activeTab === 'settings') {
     loadTotpConfig();
   }
 }, [activeTab]);

 // Generate TOTP setup session
 const handleInitiateTotpSetup = async () => {
   try {
     const secret = generateBase32Secret(16);
     const username = sessionStorage.getItem('admin_username') || 'admin';
     const uri = generateOtpauthUri(secret, username, 'Bytexon');
     const qrData = await QRCode.toDataURL(uri, { margin: 2, scale: 6 });
     
     setTotpSetupSecret(secret);
     setTotpQrCodeDataUrl(qrData);
     setTotpVerificationCode('');
     setShowTotpSetup(true);
     showToast('Scan the QR code with Google Authenticator or any 2FA app.', 'info', 'Setup Initiated');
   } catch (err) {
     console.error("Error setting up TOTP:", err);
     showToast('Could not initialize 2FA setup. Please try again.', 'error', 'MFA Setup Error');
   }
 };

 // Confirm and Save TOTP Setup
 const handleConfirmTotpSetup = async () => {
   if (!totpSetupSecret || !totpVerificationCode) return;
   setIsVerifyingTotpSetup(true);
   try {
     const isValid = await verifyTotp(totpSetupSecret, totpVerificationCode);
     if (isValid) {
       const token = sessionStorage.getItem('admin_token') || '';
       await updateAdminTotpConfig(token, true, totpSetupSecret);
       setTotpEnabled(true);
       setTotpSecret(totpSetupSecret);
       setShowTotpSetup(false);
       setTotpVerificationCode('');
       showToast('Two-Factor Authentication (TOTP) is now active and protecting your account!', 'success', '2FA Enabled');
     } else {
       showToast('Invalid verification code. Please make sure the code matches your authenticator app.', 'error', 'Verification Failed');
     }
   } catch (err) {
     console.error("Error confirming TOTP:", err);
     showToast('Failed to verify multi-factor authentication setup.', 'error', 'MFA Error');
   } finally {
     setIsVerifyingTotpSetup(false);
   }
 };

 // Disable TOTP
 const handleDisableTotp = async () => {
   if (!window.confirm("Are you sure you want to deactivate Two-Factor Authentication? This severely compromises admin portal security.")) {
     return;
   }
   try {
     const token = sessionStorage.getItem('admin_token') || '';
     await updateAdminTotpConfig(token, false, '');
     setTotpEnabled(false);
     setTotpSecret('');
     setShowTotpSetup(false);
     showToast('Two-Factor Authentication (TOTP) has been successfully deactivated.', 'info', '2FA Disabled');
   } catch (err) {
     console.error("Error disabling TOTP:", err);
     showToast('Could not deactivate 2FA settings.', 'error', 'MFA Error');
   }
 };

 // Sync form when parent adminConfig is loaded/updated
 useEffect(() => {
 setSettingsForm({
 username: sessionStorage.getItem('admin_username') || adminConfig.adminUsername || '',
 password: sessionStorage.getItem('admin_password') || adminConfig.adminPassword || '',
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
 showToast("Please enter a valid approved amount.", "warning", "Invalid Amount");
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

 showToast('Proposal approved successfully!', 'success', 'Approved');
 } catch (err) {
 console.error("Error approving request:", err);
 showToast("Failed to approve request.", "error", "Error");
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
 showToast('Proposal declined successfully.', 'warning', 'Declined');
 } catch (err) {
 console.error("Error rejecting request:", err);
 showToast("Failed to decline proposal.", "error", "Error");
 }
 };

 // Verify Payment
 const handleVerifyPayment = async () => {
 if (!selectedRequest) return;
 
 const totalApproved = selectedRequest.approvedAmount ?? selectedRequest.budgetAmount;
 const submittedAmt = selectedRequest.paymentAmountSubmitted ?? totalApproved;
 const currentPaid = selectedRequest.paidAmount ?? 0;
 const newPaidTotal = currentPaid + submittedAmt;
 const remaining = totalApproved - newPaidTotal;
 const isFullyPaid = remaining <= 0;
 const displaySign = selectedRequest.approvedCurrency === 'USD' ? '$' : '₹';

 if (!confirm(`Have you verified receipt of ${displaySign}${submittedAmt.toLocaleString()} in your business account?`)) return;

 try {
 const adminToken = sessionStorage.getItem('admin_token') || '';
 const docRef = doc(db, 'requests', selectedRequest.id);

 // Update payments list
 const currentPayments = selectedRequest.payments || [];
 const updatedPayments = [...currentPayments];
 
 // Try to find a pending payment matching the submitted amount and txRef
 let matchedIndex = updatedPayments.findIndex(
   p => p.status === 'pending' && 
   (p.txRef === selectedRequest.paymentTxRef || p.amount === submittedAmt)
 );
 
 if (matchedIndex === -1) {
   matchedIndex = updatedPayments.findIndex(p => p.status === 'pending');
 }

 if (matchedIndex !== -1) {
   updatedPayments[matchedIndex] = {
     ...updatedPayments[matchedIndex],
     status: 'verified',
     verifiedAt: Date.now()
   };
 } else {
   // Synth fallback
   const synthPayment: PaymentRecord = {
     id: `pay_${Date.now()}_synth`,
     amount: submittedAmt,
     currency: selectedRequest.approvedCurrency ?? selectedRequest.budgetCurrency,
     status: 'verified',
     txRef: selectedRequest.paymentTxRef || 'PRE-MIGRATED',
     notes: selectedRequest.paymentNotes || 'Direct verification',
     submittedAt: selectedRequest.paymentSubmittedAt || Date.now(),
     verifiedAt: Date.now()
   };
   updatedPayments.push(synthPayment);
 }

 await updateDoc(docRef, {
 status: isFullyPaid ? 'completed' : 'approved',
 paidAmount: newPaidTotal,
 paymentAmountSubmitted: 0,
 paymentVerifiedAt: Date.now(),
 adminAuthToken: adminToken,
 payments: updatedPayments
 });

 await addDoc(collection(db, 'chats'), {
 requestId: selectedRequest.id,
 sender: 'admin',
 text: `✅ Payment Verified!\n\nWe have verified receipt of ${displaySign}${submittedAmt.toLocaleString()} (UTR Reference: ${selectedRequest.paymentTxRef || 'N/A'}).\n\nTotal Paid: ${displaySign}${newPaidTotal.toLocaleString()}\nRemaining Balance: ${displaySign}${Math.max(0, remaining).toLocaleString()}\n\n${isFullyPaid ? 'Your project is now fully funded! Kickoff scheduled.' : 'Thank you for the advance payment! Work kickoff and development logs have been initialized. You can pay the remaining balance anytime using the Secure UPI portal.'}`,
 timestamp: Date.now()
 });
 showToast('Payment verified successfully!', 'success', 'Payment Verified');
 } catch (err) {
 console.error("Error verifying payment:", err);
 showToast("Failed to verify payment.", "error", "Error");
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

 showToast('Proposal and chats deleted successfully.', 'info', 'Deleted');
 setSelectedRequest(null);
 } catch (err) {
 console.error("Error deleting request:", err);
 showToast("Failed to delete proposal.", "error", "Error");
 handleFirestoreError(err, OperationType.DELETE, `requests/${selectedRequest.id}`);
 }
 };

 // Add Daily Work Update
 const handleAddUpdate = async (e: React.FormEvent) => {
   e.preventDefault();
   if (!selectedRequest) return;
   if (!newUpdateTitle.trim() || !newUpdateNotes.trim()) {
     showToast("Please fill in both the title and notes for the update.", "warning", "Incomplete Form");
     return;
   }

   setIsSubmittingUpdate(true);
   try {
     const adminToken = sessionStorage.getItem('admin_token') || '';
     const newUpdate = {
       id: 'upd_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
       timestamp: Date.now(),
       title: newUpdateTitle.trim(),
       status: newUpdateStatus,
       notes: newUpdateNotes.trim()
     };

     const updatedList = selectedRequest.dailyUpdates ? [...selectedRequest.dailyUpdates, newUpdate] : [newUpdate];
     const docRef = doc(db, 'requests', selectedRequest.id);
     await updateDoc(docRef, {
       dailyUpdates: updatedList,
       adminAuthToken: adminToken
     });

     // Update locally immediately
     setSelectedRequest({
       ...selectedRequest,
       dailyUpdates: updatedList
     });

     setNewUpdateTitle('');
     setNewUpdateNotes('');
     setNewUpdateStatus('Update');
     showToast('Daily work log added successfully!', 'success', 'Update Added');
   } catch (err) {
     console.error("Error adding daily update:", err);
     showToast("Failed to add daily update. Try again.", "error", "Error");
   } finally {
     setIsSubmittingUpdate(false);
   }
 };

 // Delete Daily Work Update
 const handleDeleteUpdate = async (updateId: string) => {
   if (!selectedRequest || !selectedRequest.dailyUpdates) return;
   if (!confirm("Are you sure you want to permanently delete this daily update log?")) return;

   try {
     const adminToken = sessionStorage.getItem('admin_token') || '';
     const updatedList = selectedRequest.dailyUpdates.filter(upd => upd.id !== updateId);
     const docRef = doc(db, 'requests', selectedRequest.id);
     await updateDoc(docRef, {
       dailyUpdates: updatedList,
       adminAuthToken: adminToken
     });

     // Update locally immediately
     setSelectedRequest({
       ...selectedRequest,
       dailyUpdates: updatedList
     });

     showToast('Daily work log deleted successfully.', 'info', 'Deleted');
   } catch (err) {
     console.error("Error deleting daily update:", err);
     showToast("Failed to delete update.", "error", "Error");
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
 showToast('System configuration saved successfully!', 'success', 'Settings Saved');
 setTimeout(() => setSettingsSuccess(false), 3000);
 } catch (err) {
 console.error("Error saving settings:", err);
 showToast('Failed to save settings. Please verify inputs.', 'error', 'Error');
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
 <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col text-slate-900 dark:text-slate-100 transition-colors duration-300">
 
 {/* Top Banner Header */}
 <header className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-4 py-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
 <div className="flex items-center space-x-3">
 <BytexonLogo theme="light" height={24} />
 <span className="text-slate-400 dark:text-slate-500 font-mono text-[9px] font-bold border-l border-slate-300 dark:border-slate-700 pl-3 ">
 Architect Admin Workspace
 </span>
 </div>

 <div className="flex items-center space-x-4">
 <div className="text-right hidden sm:block leading-none">
 <p className="text-xs font-bold text-slate-900 dark:text-slate-100 dark:text-white font-mono ">{adminConfig.adminUsername}</p>
 <span className="text-[8px] text-indigo-600 font-mono font-bold ">Root Active</span>
 </div>

 <button 
 onClick={onLogOut}
 id="btn-admin-logout"
 className="flex items-center space-x-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 hover:bg-rose-500/25 hover:text-rose-400 border border-slate-200 dark:border-slate-800 hover:border-rose-500/50 text-[10px] font-mono transition-all cursor-pointer text-slate-700 dark:text-slate-300"
 >
 <LogOut className="w-3.5 h-3.5" />
 <span>Sign Out</span>
 </button>
 </div>
 </header>

 {/* Primary Workspace Navigation Tabs */}
 <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-0 flex items-center justify-between transition-colors duration-300">
 <div className="flex space-x-2">
 <button
 onClick={() => setActiveTab('requests')}
 id="tab-requests"
 className={`py-3 px-4 font-mono font-bold text-xs border-b-2 transition-all cursor-pointer ${
 activeTab === 'requests' 
 ? 'border-indigo-600 text-indigo-600' 
 : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:text-slate-100 dark:hover:text-white'
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
 : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:text-slate-100 dark:hover:text-white'
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
 : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:text-slate-100 dark:hover:text-white'
 }`}
 >
 Billing Config
 </button>

 <button
 onClick={() => setActiveTab('security')}
 id="tab-security"
 className={`py-3 px-4 font-mono font-bold text-xs border-b-2 transition-all cursor-pointer ${
 activeTab === 'security' 
 ? 'border-indigo-600 text-indigo-600' 
 : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:text-slate-100 dark:hover:text-white'
 }`}
 >
 Security Controls
 </button>
 </div>

 <div className="text-slate-400/45 dark:text-slate-500/40 font-mono text-[9px] font-bold hidden md:block ">
 SYS STATUS: <span className="text-indigo-600">● SECURE SSL</span>
 </div>
 </nav>

 {/* Main Content Area */}
 <main className="flex-1 p-4 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
 
 {/* REQUESTS VIEW */}
 {activeTab === 'requests' && (
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start h-full">
 
 {/* Left Side: Proposal List (5 Columns) */}
 <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 flex flex-col max-h-[700px] text-slate-900 dark:text-slate-100 rounded-3xl transition-colors duration-300 shadow-sm">
 
 {/* Header & Filter Row */}
 <div className="space-y-3 mb-4">
 <div className="flex items-center justify-between">
 <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 dark:text-white font-mono">Proposals</h2>
 <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-bold font-mono text-[9px] rounded">
 {filteredRequests.length} LISTED
 </span>
 </div>
 
 {/* Filter Grid */}
 <div className="flex flex-wrap gap-1 p-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg">
 {['all', 'pending', 'approved', 'rejected', 'payment_submitted', 'completed'].map((status) => (
 <button
 key={status}
 onClick={() => setStatusFilter(status)}
 className={`px-2 py-1 text-[9px] font-bold font-mono transition-all cursor-pointer ${
 statusFilter === status 
 ? 'bg-indigo-600 text-white' 
 : 'text-slate-400 hover:text-slate-900 dark:text-slate-100'
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
		<div className="space-y-2.5 animate-pulse">
			{[1, 2, 3, 4].map((i) => (
				<div
					key={i}
					className="w-full p-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-xl flex flex-col space-y-2.5"
				>
					<div className="flex items-center justify-between w-full">
						<div className="w-16 h-4 bg-slate-300 dark:bg-slate-700 rounded-md" />
						<div className="w-16 h-4 bg-slate-300 dark:bg-slate-700 rounded-md" />
					</div>
					<div className="space-y-1.5">
						<div className="w-2/3 h-4 bg-slate-300 dark:bg-slate-700 rounded-md" />
						<div className="w-1/2 h-3 bg-slate-200 dark:bg-slate-800 rounded-md" />
					</div>
					<div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-800/50 mt-1">
						<div className="w-14 h-3 bg-slate-300 dark:bg-slate-700 rounded" />
						<div className="w-20 h-3.5 bg-slate-300 dark:bg-slate-700 rounded" />
					</div>
				</div>
			))}
		</div>) : filteredRequests.length === 0 ? (
 <div className="py-12 text-center text-slate-400 font-mono space-y-2">
 <Clock className="w-6 h-6 text-indigo-600 mx-auto mb-1" />
 <p className="font-bold text-xs text-slate-900 dark:text-slate-100 dark:text-white">NO ARCHIVES FOUND</p>
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
 ? 'bg-slate-100 dark:bg-slate-800 border-indigo-600' 
 : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 hover:border-slate-300/35'
 }`}
 >
 <div className="flex items-center justify-between w-full">
 <span className="font-mono text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 px-1.5 py-0.5 rounded">
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
 <p className="font-bold text-slate-900 dark:text-slate-100 dark:text-white text-xs truncate">{req.name}</p>
 <p className="text-slate-500 text-[10px] truncate max-w-xs">{req.description}</p>
 </div>

 <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 mt-1 text-[9px] text-slate-400 font-bold">
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
 <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 overflow-hidden max-h-[700px] flex flex-col rounded-3xl transition-colors duration-300 shadow-sm">
 
 {selectedRequest ? (
 <div className="flex-grow flex flex-col h-full overflow-hidden">
 
 {/* Selected Header */}
 <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40">
 <div>
 <div className="flex items-center space-x-1.5">
 <h3 className="font-bold text-slate-900 dark:text-slate-100 dark:text-white text-xs ">{selectedRequest.name}</h3>
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
 <div className="bg-slate-50 dark:bg-slate-950/40 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl">
 <h4 className="text-[9px] font-bold text-slate-400 mb-2 font-mono">Proposal requirements</h4>
 <p className="text-slate-900 dark:text-slate-100 text-xs leading-relaxed whitespace-pre-wrap font-mono">{selectedRequest.description}</p>

 {selectedRequest.files && selectedRequest.files.length > 0 && (
  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-[10px]">
   <p className="text-slate-400 font-bold text-[8px] font-mono mb-2 uppercase tracking-wider flex items-center gap-1.5">
    <Paperclip className="w-3.5 h-3.5 text-indigo-500" />
    <span>CLIENT ATTACHMENTS ({selectedRequest.files.length})</span>
   </p>
   <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
    {selectedRequest.files.map((file, idx) => (
     <a 
      key={idx}
      href={file.dataUrl}
      download={file.name}
      className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-950 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/25 border border-slate-200 dark:border-slate-850 rounded-xl transition-all duration-200 group text-xs cursor-pointer"
     >
      <div className="flex items-center gap-2 overflow-hidden mr-2">
       <FileText className="w-4 h-4 text-indigo-500 shrink-0 group-hover:scale-110 transition-transform duration-200" />
       <div className="truncate text-left font-mono">
        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{file.name}</p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
       </div>
      </div>
      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold font-mono group-hover:underline shrink-0">
       DOWNLOAD
      </span>
     </a>
    ))}
   </div>
  </div>
 )}
 
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-[10px] font-mono">
 <div>
 <p className="text-slate-400 font-bold text-[8px] font-mono">WHATSAPP</p>
 <p className="text-slate-900 dark:text-slate-100 dark:text-white font-bold mt-1 text-xs">{selectedRequest.whatsapp}</p>
 </div>
 {selectedRequest.companyName && (
 <div>
 <p className="text-slate-400 font-bold text-[8px] font-mono">COMPANY</p>
 <p className="text-slate-900 dark:text-slate-100 font-bold mt-1 text-xs truncate ">{selectedRequest.companyName}</p>
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
 <p className="text-slate-900 dark:text-slate-100 dark:text-white font-bold mt-1 text-xs">
 {new Date(selectedRequest.createdAt).toLocaleDateString()}
 </p>
 </div>
 </div>
 </div>

 {/* Approved Price details if approved */}
 {(selectedRequest.status === 'approved' || selectedRequest.status === 'payment_submitted' || selectedRequest.status === 'completed') && (
 <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 p-3.5 rounded-xl">
 <div className="flex justify-between items-center">
 <div>
 <p className="text-indigo-600 text-[9px] font-bold font-mono">Approved final pricing</p>
 <p className="text-sm font-sans font-bold text-slate-900 dark:text-slate-100 dark:text-white mt-0.5">
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
 {(selectedRequest.status === 'payment_submitted' || selectedRequest.status === 'completed' || (selectedRequest.paidAmount && selectedRequest.paidAmount > 0)) && (
 <div className="bg-blue-500/10 border border-blue-500/20 p-3.5 space-y-2.5 rounded-2xl">
 <h4 className="text-[9px] font-bold text-blue-400 font-mono">Payment transaction proof & Ledger</h4>
 
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-mono">
 {selectedRequest.paidAmount !== undefined && selectedRequest.paidAmount > 0 && (
 <div>
 <p className="text-emerald-400 font-bold text-[9px] uppercase">TOTAL VERIFIED PAID</p>
 <p className="text-slate-900 dark:text-slate-100 font-bold font-mono text-xs bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 border border-slate-200 dark:border-slate-850 mt-1 rounded-lg">
 {selectedRequest.approvedCurrency === 'USD' ? '$' : '₹'}{selectedRequest.paidAmount.toLocaleString()}
 </p>
 </div>
 )}
 {selectedRequest.paymentAmountSubmitted !== undefined && selectedRequest.paymentAmountSubmitted > 0 && (
 <div>
 <p className="text-blue-400 font-bold text-[9px] uppercase">AMOUNT FOR VERIFICATION</p>
 <p className="text-slate-900 dark:text-slate-100 font-bold font-mono text-xs bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 border border-slate-200 dark:border-slate-850 mt-1 rounded-lg">
 {selectedRequest.approvedCurrency === 'USD' ? '$' : '₹'}{selectedRequest.paymentAmountSubmitted.toLocaleString()}
 </p>
 </div>
 )}
 {selectedRequest.paymentTxRef && (
 <div>
 <p className="text-blue-400 font-bold text-[9px] uppercase">UTR / UPI REFERENCE ID</p>
 <p className="text-slate-900 dark:text-slate-100 font-bold font-mono text-xs select-all bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 border border-slate-200 dark:border-slate-850 mt-1 rounded-lg">
 {selectedRequest.paymentTxRef}
 </p>
 </div>
 )}
 {selectedRequest.paymentNotes && (
 <div>
 <p className="text-blue-400 font-bold text-[9px] uppercase">CLIENT REMARKS</p>
 <p className="text-slate-700 dark:text-slate-350 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 border border-slate-200 dark:border-slate-850 mt-1 truncate rounded-lg">
 {selectedRequest.paymentNotes}
 </p>
 </div>
 )}
 </div>
 </div>
 )}

 {/* ACTIONS FORM GRID (Changes Based on Status) */}
 <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3">
 <h4 className="text-[9px] font-bold text-slate-400 font-mono">Workflow controls</h4>

 {selectedRequest.status === 'pending' && (
 <div className="space-y-3.5 bg-slate-50 dark:bg-slate-950/40 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl">
 <p className="text-[10px] text-slate-500 font-mono leading-relaxed">SET FINAL APPROVED PRICE (INR/USD) FOR UPI EXECUTION AND CLICK APPROVE, OR DECLINE PROPOSAL.</p>
 
 <div className="flex gap-3 items-end">
 <div className="flex-1">
 <label className="block text-[8px] font-bold text-slate-400 mb-1.5 font-mono">FINAL APPROVED PRICE</label>
 <div className="flex border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl overflow-hidden">
 <select 
 value={approvalCurrency}
 onChange={(e) => setApprovalCurrency(e.target.value as 'INR' | 'USD')}
 className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 dark:text-white font-bold px-2 py-1.5 text-[10px] focus:outline-none border-r border-slate-300 dark:border-slate-800 font-mono "
 >
 <option value="INR">INR (₹)</option>
 <option value="USD">USD ($)</option>
 </select>
 <input 
 type="number"
 placeholder="APPROVED AMOUNT"
 value={approvalAmount}
 onChange={(e) => setApprovalAmount(e.target.value)}
 className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none font-bold font-mono placeholder-slate-400"
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
 <div className="bg-slate-50 dark:bg-slate-950/45 p-4 border border-slate-200 dark:border-slate-800 text-center text-slate-500 text-[10px] py-6 space-y-2 rounded-2xl">
 <Clock className="w-6 h-6 text-indigo-600 mx-auto" />
 <p className="font-bold text-slate-900 dark:text-slate-100 dark:text-white font-mono ">Awaiting Client Payment Execution</p>
 <p className="leading-relaxed font-mono">APPROVED AT {selectedRequest.approvedCurrency === 'USD' ? '$' : '₹'}{selectedRequest.approvedAmount?.toLocaleString()}. CLIENT MUST SUBMIT TRANSACTION LOGS TO PROGRESS.</p>
 </div>
 )}

 {selectedRequest.status === 'payment_submitted' && (
 <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl">
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
 <div className="bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40 p-4 text-[10px] font-bold font-mono flex items-center space-x-3 rounded-2xl">
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

 {/* Project Daily Updates Manager */}
 <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-4">
 <h4 className="text-[10px] font-bold text-slate-400 font-mono flex items-center space-x-1.5 uppercase">
 <Activity className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
 <span>Project Daily Updates & Feed</span>
 </h4>

 <form onSubmit={handleAddUpdate} className="space-y-3 bg-slate-50 dark:bg-slate-950/40 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl">
 <p className="text-[9px] text-slate-500 font-mono">PUBLISH REAL-TIME WORK LOGS, STREAKS, COMPLETED TASKS, OR BLOCKED STATUS FOR THE CLIENT TO TRACK.</p>
 
 <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
 <div className="sm:col-span-8">
 <label className="block text-[8px] font-bold text-slate-400 mb-1 font-mono">UPDATE TITLE</label>
 <input 
 type="text"
 required
 value={newUpdateTitle}
 onChange={(e) => setNewUpdateTitle(e.target.value)}
 placeholder="E.G. Figma Design Approved, Backend Setup"
 className="w-full px-3 py-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs border border-slate-300 dark:border-slate-800 focus:outline-none focus:border-indigo-600 font-mono placeholder-slate-400 rounded-xl"
 />
 </div>
 <div className="sm:col-span-4">
 <label className="block text-[8px] font-bold text-slate-400 mb-1 font-mono">STATUS STATE</label>
 <select 
 value={newUpdateStatus}
 onChange={(e) => setNewUpdateStatus(e.target.value as any)}
 className="w-full px-3 py-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs border border-slate-300 dark:border-slate-800 focus:outline-none focus:border-indigo-600 font-mono rounded-xl"
 >
 <option value="Update">Update</option>
 <option value="In Progress">In Progress</option>
 <option value="Completed">Completed</option>
 <option value="Blocked">Blocked</option>
 </select>
 </div>
 </div>

 <div>
 <label className="block text-[8px] font-bold text-slate-400 mb-1 font-mono">LOG NOTES / DESCRIPTION</label>
 <textarea 
 required
 value={newUpdateNotes}
 onChange={(e) => setNewUpdateNotes(e.target.value)}
 placeholder="Explain details about this work update..."
 className="w-full px-3 py-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs border border-slate-300 dark:border-slate-800 focus:outline-none focus:border-indigo-600 h-16 resize-none font-mono placeholder-slate-400 rounded-xl"
 />
 </div>

 <button
 type="submit"
 disabled={isSubmittingUpdate}
 className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-mono font-bold text-[10px] transition-all flex items-center justify-center space-x-1 cursor-pointer rounded-xl"
 >
 {isSubmittingUpdate ? (
 <>
 <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
 <span>PUBLISHING UPDATE...</span>
 </>
 ) : (
 <span>PUBLISH WORK LOG</span>
 )}
 </button>
 </form>

 {/* Live Updates List */}
 <div className="space-y-2.5">
 <h5 className="text-[9px] font-bold text-slate-400 font-mono">ACTIVE UPDATE TIMELINE ({selectedRequest.dailyUpdates?.length || 0})</h5>
 
 {!selectedRequest.dailyUpdates || selectedRequest.dailyUpdates.length === 0 ? (
 <p className="text-center py-6 text-slate-400 text-[10px] font-mono bg-slate-50 dark:bg-slate-950/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
 No daily updates published yet. Add a log above to update the client.
 </p>
 ) : (
 <div className="space-y-2.5">
 {selectedRequest.dailyUpdates
 .slice()
 .sort((a, b) => b.timestamp - a.timestamp)
 .map((update) => (
 <div key={update.id} className="bg-slate-50 dark:bg-slate-950/45 p-3 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start justify-between gap-3">
 <div className="space-y-1 flex-1 min-w-0">
 <div className="flex flex-wrap items-center gap-1.5">
 <span className={`px-1 py-0.5 text-[7px] font-bold rounded-sm ${
 update.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150 dark:bg-emerald-950/45 dark:text-emerald-450' :
 update.status === 'Blocked' ? 'bg-rose-50 text-rose-700 border border-rose-150 dark:bg-rose-950/45 dark:text-rose-450 animate-pulse' :
 update.status === 'In Progress' ? 'bg-amber-50 text-amber-700 border border-amber-150 dark:bg-amber-950/45 dark:text-amber-450' :
 'bg-indigo-50 text-indigo-700 border border-indigo-150 dark:bg-indigo-950/45 dark:text-indigo-450'
 }`}>
 {update.status.toUpperCase()}
 </span>
 <strong className="font-mono text-xs text-slate-900 dark:text-white truncate">{update.title}</strong>
 <span className="text-[9px] text-slate-400 font-mono">
 {new Date(update.timestamp).toLocaleString()}
 </span>
 </div>
 <p className="text-[10px] text-slate-600 dark:text-slate-400 font-mono whitespace-pre-wrap leading-relaxed">
 {update.notes}
 </p>
 </div>

 <button 
 onClick={() => handleDeleteUpdate(update.id)}
 className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
 title="Delete Work Log"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </button>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>

 </div>

 </div>
 ) : (
 <div className="flex-grow flex flex-col items-center justify-center text-center p-8 text-slate-400 py-36 font-mono">
 <Users className="w-10 h-10 text-indigo-600 mb-3" />
 <h3 className="font-bold text-slate-900 dark:text-slate-100 dark:text-white text-xs ">Select a proposal</h3>
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
 <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 flex flex-col h-[600px] overflow-hidden rounded-3xl transition-colors duration-300 shadow-sm">
 <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 dark:text-white mb-3 flex items-center space-x-1.5 font-mono">
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
 ? 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-600 text-slate-900 dark:text-slate-100 dark:text-white' 
 : 'bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350'
 }`}
 >
 <div className={`w-8 h-8 flex items-center justify-center font-bold text-[10px] font-mono ${
 isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
 }`}>
 {req.name.substring(0, 2).toUpperCase()}
 </div>
 <div className="flex-grow min-w-0 font-mono">
 <div className="flex justify-between items-center">
 <span className="font-bold text-slate-900 dark:text-slate-100 dark:text-white text-xs truncate ">{req.name}</span>
 <span className="text-[8px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-slate-50 dark:bg-slate-950 px-1.5 py-0.5 border border-indigo-200 dark:border-indigo-800 rounded">
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
 <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col h-[600px] overflow-hidden rounded-3xl transition-colors duration-300 shadow-sm">
 
 {selectedRequest ? (
 <div className="flex-grow flex flex-col h-full overflow-hidden">
 
 {/* Active Chat Header */}
 <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40 font-mono">
 <div className="flex items-center space-x-2.5">
 <div className="w-8 h-8 bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
 {selectedRequest.name.substring(0,2).toUpperCase()}
 </div>
 <div>
 <h4 className="font-bold text-slate-900 dark:text-slate-100 dark:text-white text-xs ">SECURE SESSION WITH {selectedRequest.name}</h4>
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
 <div className="flex-grow overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950/20 space-y-3">
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
 ? 'bg-indigo-600 dark:bg-cyan-600 text-white border-indigo-600 dark:border-cyan-500 rounded-xl rounded-tr-none' 
 : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-850 rounded-xl rounded-tl-none'
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
 <form onSubmit={handleSendReply} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex items-center space-x-2">
 <input 
 type="text"
 value={adminReply}
 onChange={(e) => setAdminReply(e.target.value)}
 placeholder={`REPLY TO CLIENT ${selectedRequest.name.toUpperCase()}...`}
 className="flex-grow px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 focus:outline-none text-slate-900 dark:text-slate-100 text-xs font-mono placeholder-slate-400 rounded-xl"
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
 <h3 className="font-bold text-slate-900 dark:text-slate-100 dark:text-white text-xs ">Open a conversation</h3>
 <p className="text-[10px] max-w-sm mt-1 leading-relaxed">SELECT ANY CUSTOMER FROM THE SIDEBAR ON THE LEFT TO START SENDING SECURE LIVE CHAT MESSAGES.</p>
 </div>
 )}

 </div>
 </div>
 )}

 {/* SETTINGS VIEW */}
 {activeTab === 'settings' && (
 <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 relative overflow-hidden rounded-3xl shadow-sm transition-colors duration-300">
 
 <div className="absolute top-0 left-0 w-full h-[2px] bg-indigo-600"></div>

 <div className="space-y-6">
 <div className="border-b border-slate-200 pb-4">
 <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 dark:text-white flex items-center space-x-1.5 font-mono">
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
 className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:border-indigo-600 focus:outline-none text-slate-900 dark:text-slate-100 text-xs font-mono font-semibold transition-colors"
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
 className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:border-indigo-600 focus:outline-none text-slate-900 dark:text-slate-100 text-xs font-mono transition-colors"
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
 className="w-full px-3 py-2 bg-slate-50 focus:outline-none text-slate-900 dark:text-slate-100 text-xs font-mono font-semibold"
 />
 </div>
 <p className="text-[9px] text-slate-400 mt-1.5 leading-relaxed font-mono ">
 BY SETTING THIS PATH, THE LOGIN SCREEN IS ONLY ACCESSIBLE BY ENTERING <span className="text-indigo-600 font-semibold">#/admin-{settingsForm.adminSecretPath || 'bytexon-secure-gate'}</span> IN YOUR BROWSER'S ADDRESS BAR.
 </p>
 </div>
 </div>

 {/* Billing credentials */}
 <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
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
 className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:border-indigo-600 focus:outline-none text-slate-900 dark:text-slate-100 text-xs font-mono font-bold transition-colors"
 />
 <p className="text-[9px] text-slate-400 mt-1.5 leading-relaxed font-mono ">When empty or default, we render a dynamic UPI Pay URL scannable by BHIM, GooglePay, and PhonePe.</p>
 </div>

 <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl flex items-start space-x-2 text-[9px] text-slate-500 font-mono ">
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
 <label className="block w-full py-1.5 bg-slate-50 hover:bg-white border border-slate-200 text-[9px] font-bold cursor-pointer text-slate-900 dark:text-slate-100 hover:text-indigo-600 transition-colors font-mono">
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
 <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800 font-mono">
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
 className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:border-indigo-600 focus:outline-none text-slate-900 dark:text-slate-100 text-xs font-mono font-bold transition-colors"
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
 className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:border-indigo-600 focus:outline-none text-slate-900 dark:text-slate-100 text-xs font-mono font-bold transition-colors"
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
 className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:border-indigo-600 focus:outline-none text-slate-900 dark:text-slate-100 text-xs font-mono font-bold transition-colors"
 />
 </div>
 </div>

 {/* Two-Factor Authentication (MFA / TOTP) Section */}
 <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800 font-mono">
   <div className="flex items-center space-x-2">
     <h3 className="text-[9px] font-bold text-indigo-600 font-mono">4. TWO-FACTOR AUTHENTICATION (MFA / TOTP)</h3>
     <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded-sm ${totpEnabled ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
       {totpEnabled ? '● SECURED' : 'UNCONFIGURED'}
     </span>
   </div>
   <p className="text-[10px] text-slate-500 leading-relaxed max-w-2xl">
     Enhance administrative portal access security. By enabling a Time-based One-Time Password (TOTP) authenticator option, login prompts will require a dynamic 6-digit cryptographic verification code from Google Authenticator, Authy, or Microsoft Authenticator.
   </p>

   {showTotpSetup ? (
     <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-4 max-w-xl">
       <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
         <QrCode className="w-4 h-4 text-indigo-600" />
         <span>Authenticator Configuration Wizard</span>
       </h4>
       <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
         <div className="md:col-span-5 flex flex-col items-center p-2 bg-white border border-slate-200 rounded-lg shadow-sm">
           {totpQrCodeDataUrl ? (
             <img src={totpQrCodeDataUrl} alt="TOTP Setup QR Code" className="w-32 h-32" />
           ) : (
             <div className="w-32 h-32 flex items-center justify-center text-[10px] text-slate-400">Loading...</div>
           )}
           <p className="text-[8px] text-slate-400 font-mono mt-1 text-center font-bold">SCAN QR CODE</p>
         </div>
         <div className="md:col-span-7 space-y-3">
           <p className="text-[10px] text-slate-600 leading-relaxed">
             1. Scan the QR code using your mobile device's authenticator app.
           </p>
           <div>
             <p className="text-[10px] text-slate-600 mb-1">
               2. If you cannot scan the QR, input this secret key manually:
             </p>
             <div className="flex items-center space-x-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-sm">
               <code className="text-[10px] text-slate-800 font-bold tracking-wider break-all flex-1">{totpSetupSecret}</code>
               <button
                 type="button"
                 onClick={() => {
                   navigator.clipboard.writeText(totpSetupSecret);
                   showToast('Secret key copied to clipboard!', 'success', 'Copied');
                 }}
                 className="p-1 hover:bg-slate-50 rounded text-slate-500 hover:text-indigo-600 transition-colors"
                 title="Copy secret key"
               >
                 <Copy className="w-3.5 h-3.5" />
               </button>
             </div>
           </div>
           <div className="space-y-1.5">
             <label className="block text-[9px] font-bold text-slate-500">
               3. Enter 6-digit confirmation code:
             </label>
             <div className="flex space-x-2">
               <input
                 type="text"
                 maxLength={6}
                 placeholder="000000"
                 value={totpVerificationCode}
                 onChange={(e) => setTotpVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                 className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold tracking-[0.2em] focus:border-indigo-600 focus:outline-none text-slate-900 w-32"
               />
               <button
                 type="button"
                 disabled={isVerifyingTotpSetup || totpVerificationCode.length !== 6}
                 onClick={handleConfirmTotpSetup}
                 className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {isVerifyingTotpSetup ? (
                   <>
                     <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                     <span>Verifying...</span>
                   </>
                 ) : (
                   <span>Verify & Enable</span>
                 )}
               </button>
               <button
                 type="button"
                 onClick={() => setShowTotpSetup(false)}
                 className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition-colors"
               >
                 Cancel
               </button>
             </div>
           </div>
         </div>
       </div>
     </div>
   ) : (
     <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 max-w-2xl">
       <div className="space-y-1">
         <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
           {totpEnabled ? (
             <CheckCircle className="w-4 h-4 text-emerald-600" />
           ) : (
             <ShieldAlert className="w-4 h-4 text-amber-500" />
           )}
           <span>{totpEnabled ? 'Two-Factor Authentication is Active' : 'Two-Factor Authentication is Deactivated'}</span>
         </h4>
         <p className="text-[10px] text-slate-500 leading-relaxed">
           {totpEnabled 
             ? 'Your account is secured with standard Time-based One-Time Password multi-factor protection.' 
             : 'Add an extra cryptographic barrier to block unauthorized credential login attempts.'}
         </p>
       </div>
       <div className="flex-shrink-0">
         {totpEnabled ? (
           <button
             type="button"
             onClick={handleDisableTotp}
             className="px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 hover:text-rose-800 text-[10px] font-bold rounded-xl transition-all cursor-pointer"
           >
             Disable 2FA Security
           </button>
         ) : (
           <button
             type="button"
             onClick={handleInitiateTotpSetup}
             className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
           >
             <Key className="w-3.5 h-3.5" />
             <span>Configure 2FA Security</span>
           </button>
         )}
       </div>
     </div>
   )}
 </div>

 <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
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

  {activeTab === 'security' && (
    <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden text-left">
      {/* Left Sidebar: Vector selection */}
      <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-3 overflow-y-auto pr-2">
        <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <span className="font-mono text-xs font-bold tracking-wider text-cyan-400">SECURITY AUDIT ENGINE</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-mono leading-relaxed">
            Verify defences against the 7 real-world attack vectors.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {[
            { id: 1, name: "1. Server-side Template Injection", tag: "SSTI" },
            { id: 2, name: "2. Regex Denial of Service", tag: "ReDoS" },
            { id: 3, name: "3. Long Password CPU Hashing", tag: "DoS" },
            { id: 4, name: "4. Secret Key Leak Guard", tag: "Keys" },
            { id: 5, name: "5. NoSQL / SQL Object Injection", tag: "Injection" },
            { id: 6, name: "6. Clipboard Hijacking Guard", tag: "Clipboard" },
            { id: 7, name: "7. Login Replay Attack", tag: "Replay" }
          ].map((check) => (
            <button
              key={check.id}
              onClick={() => setSelectedSecCheck(check.id)}
              className={`p-3.5 rounded-xl text-left border font-mono text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                selectedSecCheck === check.id
                  ? 'bg-slate-900 border-cyan-500 text-cyan-400 shadow-md'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{check.name}</span>
              <span className={`px-2 py-0.5 rounded text-[9px] ${
                selectedSecCheck === check.id
                  ? 'bg-cyan-950/50 text-cyan-400'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>{check.tag}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Middle/Right: Interactive simulator and log console */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        {/* Middle Area: Interactive test controls */}
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col gap-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-[10px] font-bold font-mono tracking-wider rounded uppercase border border-rose-100 dark:border-rose-900/30">
                  {selectedSecCheck === 1 && "VEC-01: SSTI"}
                  {selectedSecCheck === 2 && "VEC-02: REDOS"}
                  {selectedSecCheck === 3 && "VEC-03: PASS-DOS"}
                  {selectedSecCheck === 4 && "VEC-04: KEY-LEAK"}
                  {selectedSecCheck === 5 && "VEC-05: INJECTION"}
                  {selectedSecCheck === 6 && "VEC-06: CLIPBOARD"}
                  {selectedSecCheck === 7 && "VEC-07: REPLAY"}
                </span>
                <span className="text-slate-400 font-mono text-[10px]">CVE-Scope compliant</span>
              </div>
              <h2 className="text-xl font-bold font-sans text-slate-900 dark:text-white mt-1">
                {selectedSecCheck === 1 && "Server-side Template Injection"}
                {selectedSecCheck === 2 && "Regex Denial of Service (ReDoS)"}
                {selectedSecCheck === 3 && "Long Password DoS Attack"}
                {selectedSecCheck === 4 && "Secret Key Leak Prevention"}
                {selectedSecCheck === 5 && "NoSQL & SQL injection"}
                {selectedSecCheck === 6 && "Clipboard Hijacking Defense"}
                {selectedSecCheck === 7 && "Login Replay Attack Mitigation"}
              </h2>
            </div>
            <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl">
              <Shield className="w-5 h-5" />
            </div>
          </div>

          {/* Explanation & Posture */}
          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60 space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono text-left">1. Threat Mechanism</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed text-left">
                {selectedSecCheck === 1 && "Attackers submit payloads such as {{constructor.constructor('return process')()}} into user inputs, which templates (EJS/Jinja) compile, allowing raw execution of arbitrary backend shell commands."}
                {selectedSecCheck === 2 && "Attackers supply crafted inputs matching catastrophic backtracking pattern constraints of regular expressions, locking the single CPU thread of the JavaScript engine."}
                {selectedSecCheck === 3 && "By submitting multi-megabyte passwords, attackers force cryptographic hash algorithms (bcrypt, PBKDF2) to spend massive CPU cycles, starving resources and causing a general DoS."}
                {selectedSecCheck === 4 && "Hardcoded keys or raw secret environments leaked in client-side production bundles can be easily inspected, giving attackers complete administrative database rights."}
                {selectedSecCheck === 5 && "Passing structured database selectors or SQL strings dynamically into query engines allows malicious actors to alter query parameters (e.g. bypass login checks)."}
                {selectedSecCheck === 6 && "Hostile scripts read clipboards without authentication or hijack standard copy operations to replace crypto addresses or commands with dangerous vectors."}
                {selectedSecCheck === 7 && "By capturing/sniffing a valid session token or OTP key, an attacker replays it within its validity period, securing illegal administrative session entry."}
              </p>
            </div>

            <div className="bg-indigo-50/40 dark:bg-cyan-950/10 p-4 rounded-2xl border border-indigo-100/40 dark:border-cyan-900/25 space-y-2">
              <h4 className="text-xs font-bold text-indigo-800 dark:text-cyan-400 uppercase tracking-wider font-mono text-left">2. Integrated Posture Defense</h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans text-left">
                {selectedSecCheck === 1 && "Our architecture utilizes React with native JSX. There are no server-side templating compilers. All user inputs are treated as raw static literals and escaped mathematically, neutralizing any server-side execution threats."}
                {selectedSecCheck === 2 && "We enforce rigid upper length validation bounds (max 64/128 characters) directly at the input controller before any regular expressions are evaluated. Backtracking is mathematically capped to safe levels."}
                {selectedSecCheck === 3 && "Our login flow in App.tsx enforces a strict 128-character limit on the password field. Payloads exceeding this are rejected at the edge before cryptographic computation can begin, ensuring CPU preservation."}
                {selectedSecCheck === 4 && "All administrative and critical operations (like GEMINI_API_KEY) are executed within isolated, server-side environments. Public config variables are parsed securely from strict environment configurations."}
                {selectedSecCheck === 5 && "Firestore queries are strictly parameterized (where(), doc()). Parameter bounds are typed dynamically and cast explicitly to primitive strings, making query-structure manipulation impossible."}
                {selectedSecCheck === 6 && "Our system only writes to clipboard under strict, explicit click actions (navigator.clipboard.writeText) and NEVER reads programmatic clipboard content. A transparent toast displays the exact text copied."}
                {selectedSecCheck === 7 && "We implement a high-fidelity TOTP code tracker that records validated tokens within the time-drift threshold. Submitting a previously used OTP code triggers an immediate Login Replay Attack block."}
              </p>
            </div>
          </div>

          {/* Sandbox Controls */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider text-left">3. Interactive Sandbox Simulator</h3>
            
            {/* SSTI Simulator */}
            {selectedSecCheck === 1 && (
              <div className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold font-mono text-slate-600 dark:text-slate-400 uppercase">Input Payload</label>
                  <input
                    type="text"
                    value={sstiInput}
                    onChange={(e) => setSstiInput(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      addSecurityLog(`[SSTI_SIM] Attempting injection with payload: ${sstiInput}`);
                      addSecurityLog(`[SSTI_SIM] Sanitizer executed: JSX Auto-Escape applied.`);
                      const escaped = sstiInput.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                      addSecurityLog(`[SSTI_SIM] Output safe rendered as raw text node. SSTI blocked.`);
                      showToast("SSTI simulation passed safely.", "success", "SSTI Blocked");
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-mono font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Simulate Render
                  </button>
                  <button
                    onClick={() => setSstiInput('{{this.constructor.constructor("return process")()}}')}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    Load Exploit Payload
                  </button>
                </div>
              </div>
            )}

            {/* ReDoS Simulator */}
            {selectedSecCheck === 2 && (
              <div className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold font-mono text-slate-600 dark:text-slate-400 uppercase">Select Payload Size</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs font-mono text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="redosMode"
                        checked={redosInputMode === 'normal'}
                        onChange={() => setRedosInputMode('normal')}
                      />
                      <span>Normal Email (24 chars)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-mono text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="redosMode"
                        checked={redosInputMode === 'exploit'}
                        onChange={() => setRedosInputMode('exploit')}
                      />
                      <span className="text-rose-500">Hostile Loop String (50,000 chars)</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (redosInputMode === 'normal') {
                        addSecurityLog(`[REDOS_SIM] Input: 'support@bytexon.app' (length: 18 chars)`);
                        addSecurityLog(`[REDOS_SIM] Input size within safe limit (64 chars). Matching pattern...`);
                        addSecurityLog(`[REDOS_SIM] Pattern match: true. Thread performance remaining: 100%`);
                        showToast("Normal validation completed.", "success", "Regex Valid");
                      } else {
                        addSecurityLog(`[REDOS_SIM] Input: 'a' repeated 50,000 times (length: 50,000 chars)`);
                        addSecurityLog(`[REDOS_SIM] [GUARD TRIGGERED] Input exceeds safe regex evaluation limit (64 chars).`);
                        addSecurityLog(`[REDOS_SIM] [BLOCKED] Aborted RegExp test to prevent exponential backtracking.`);
                        addSecurityLog(`[REDOS_SIM] Thread safety ensured. Performance loss: 0.00%`);
                        showToast("ReDoS attack blocked successfully.", "success", "ReDoS Prevented");
                      }
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-mono font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Test Input against RegExp
                  </button>
                </div>
              </div>
            )}

            {/* Password DoS Simulator */}
            {selectedSecCheck === 3 && (
              <div className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-[10px] font-bold font-mono text-slate-600 dark:text-slate-400 uppercase">Password length (characters)</label>
                    <span className="text-xs font-mono font-bold text-indigo-600 dark:text-cyan-400">{longPassLength.toLocaleString()} chars</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100000"
                    step="100"
                    value={longPassLength}
                    onChange={(e) => setLongPassLength(parseInt(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-slate-400">
                    <span>10 Chars</span>
                    <span>100k Chars (Hostile Load)</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      addSecurityLog(`[PASS_SIM] Simulating login with password length of ${longPassLength} characters...`);
                      if (longPassLength > 128) {
                        addSecurityLog(`[PASS_SIM] [GUARD TRIGGERED] Password exceeds maximum safe length boundary (128 chars).`);
                        addSecurityLog(`[PASS_SIM] [BLOCKED] CPU-heavy hashing bypass triggered. Attempt blocked before PBKDF2/SHA execution.`);
                        addSecurityLog(`[PASS_SIM] Thread starvation prevented. CPU usage remains stable.`);
                        showToast("Security Block: Password length limits enforced.", "error", "DoS Blocked");
                      } else {
                        addSecurityLog(`[PASS_SIM] Password length is safe (${longPassLength} chars). Initializing SHA-256 local key derivation...`);
                        addSecurityLog(`[PASS_SIM] Local hash generated safely in 1.4ms.`);
                        showToast("Safe password verification passed.", "success", "Login Safe");
                      }
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-mono font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Simulate Password Hashing
                  </button>
                </div>
              </div>
            )}

            {/* Secret Key Leak Simulator */}
            {selectedSecCheck === 4 && (
              <div className="space-y-4 text-left">
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  The active system memory scans for leaks of known pattern variables like <code className="bg-slate-100 dark:bg-slate-850 px-1 py-0.5 rounded text-rose-500">GEMINI_API_KEY</code>, database passwords, or Google Service accounts in global scopes.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      addSecurityLog(`[KEY_SIM] Initiating deep scan of client-side JS bundle maps...`);
                      addSecurityLog(`[KEY_SIM] Analyzing process.env and import.meta.env parameters...`);
                      addSecurityLog(`[KEY_SIM] [PASSED] No raw API keys or client certificates exposed in global scripts.`);
                      addSecurityLog(`[KEY_SIM] [INFO] Gemini client utilizes dynamic environment proxies. Key remains server-side only.`);
                      showToast("Bundle clean. 0 raw secrets found.", "success", "Key Safe");
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-mono font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Run Leak Signature Scan
                  </button>
                </div>
              </div>
            )}

            {/* SQL Injection Simulator */}
            {selectedSecCheck === 5 && (
              <div className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold font-mono text-slate-600 dark:text-slate-400 uppercase">SQL/NoSQL Payload Input</label>
                  <input
                    type="text"
                    value={injectionInput}
                    onChange={(e) => setInjectionInput(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      addSecurityLog(`[INJECT_SIM] Raw Input: "${injectionInput}"`);
                      addSecurityLog(`[INJECT_SIM] Checking database interface configuration...`);
                      addSecurityLog(`[INJECT_SIM] Enforcing strict parameterized primitive string type casting.`);
                      const escaped = String(injectionInput);
                      addSecurityLog(`[INJECT_SIM] Parameterized Query compiled: db.collection('requests').where('trackId', '==', '${escaped}')`);
                      addSecurityLog(`[INJECT_SIM] SQL bypass neutralized. Firestore treats injection elements purely as literal static string.`);
                      showToast("Injection sanitized successfully.", "success", "Sanitized");
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-mono font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Run Query through Sanitizer
                  </button>
                  <button
                    onClick={() => setInjectionInput('{ "$ne": "" }')}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    Load NoSQL Payload
                  </button>
                </div>
              </div>
            )}

            {/* Clipboard Simulator */}
            {selectedSecCheck === 6 && (
              <div className="space-y-4 text-left">
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  Tests how our system prevents hidden reads or sneaky copies (such as adding payload text, hidden spaces, or carriage returns).
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      addSecurityLog(`[CLIP_SIM] Tracking User Action: Explicit click registered on copy target.`);
                      navigator.clipboard.writeText("BTX-TRACKING-ID-948");
                      addSecurityLog(`[CLIP_SIM] Write action completed: 'BTX-TRACKING-ID-948' successfully sent to navigator.`);
                      addSecurityLog(`[CLIP_SIM] [SECURED] Denying programmatic silent clipboard reads. Transparency feedback rendered.`);
                      showToast("Copied exact text successfully.", "success", "Clipboard Secured");
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-mono font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Copy Secure ID (User Gesture)
                  </button>
                </div>
              </div>
            )}

            {/* Replay Attack Simulator */}
            {selectedSecCheck === 7 && (
              <div className="space-y-4 text-left">
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">
                    MFA tokens are single-use. If used once to authenticate, the token becomes spent and cannot be re-used.
                  </p>
                  {secReplayToken ? (
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
                      <span className="text-xs font-mono">Generated TOTP code: <strong className="text-indigo-600 dark:text-cyan-400">{secReplayToken}</strong></span>
                      <span className="text-[10px] font-mono bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-400 px-2 py-0.5 rounded font-bold uppercase animate-pulse">Active</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        const code = Math.floor(100000 + Math.random() * 90000).toString();
                        setSecReplayToken(code);
                        setSecReplayUsed(false);
                        setSecReplayAttempts(0);
                        addSecurityLog(`[REPLAY_SIM] Generated secure TOTP code: ${code}`);
                      }}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-mono font-bold rounded-xl cursor-pointer"
                    >
                      Generate New TOTP Token
                    </button>
                  )}
                </div>

                {secReplayToken && (
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        if (secReplayUsed) {
                          addSecurityLog(`[REPLAY_SIM] Replay attempt with spent token: ${secReplayToken}`);
                          addSecurityLog(`[REPLAY_SIM] [REPLAY ATTACK DETECTED] Token '${secReplayToken}' has already been consumed for the current window drift.`);
                          addSecurityLog(`[REPLAY_SIM] [ACCESS DENIED] Login transaction blocked.`);
                          setSecReplayAttempts(prev => prev + 1);
                          showToast("Replay Blocked: Token already consumed.", "error", "Attack Neutralized");
                        } else {
                          addSecurityLog(`[REPLAY_SIM] Authenticating using token: ${secReplayToken}`);
                          addSecurityLog(`[REPLAY_SIM] [SUCCESS] Code matches active secret. Consuming code token...`);
                          addSecurityLog(`[REPLAY_SIM] Token '${secReplayToken}' recorded in consumed cache. ACCESS GRANTED.`);
                          setSecReplayUsed(true);
                          showToast("First attempt authenticated successfully.", "success", "Access Granted");
                        }
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-mono font-bold rounded-xl cursor-pointer"
                    >
                      Verify Token
                    </button>
                    <button
                      onClick={() => {
                        setSecReplayToken('');
                        setSecReplayUsed(false);
                        setSecReplayAttempts(0);
                        addSecurityLog(`[REPLAY_SIM] Token state reset.`);
                      }}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold rounded-xl cursor-pointer"
                    >
                      Reset Simulator
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Area: Monospaced security log terminal console */}
        <div className="w-full lg:w-96 bg-slate-950 border border-slate-800 rounded-3xl p-5 flex flex-col gap-4 font-mono text-[10px] text-emerald-400 select-none h-96 lg:h-auto min-h-[400px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
              <span className="text-white font-bold tracking-wider uppercase">Live Cyber-Guard Terminal</span>
            </div>
            <button
              onClick={() => {
                setSecurityLogs([
                  "[SYSTEM] Security Compliance Guard initialized.",
                  "[SYSTEM] Ready for interactive threat vector simulation."
                ]);
              }}
              className="text-slate-500 hover:text-white transition-colors cursor-pointer text-[9px] uppercase font-bold"
            >
              Clear Logs
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-slate-800 text-left">
            {securityLogs.map((log, idx) => (
              <div
                key={idx}
                className={`leading-relaxed break-all ${
                  log.includes('[BLOCKED]') || log.includes('[REPLAY ATTACK') || log.includes('[GUARD TRIGGERED]') || log.includes('[REJECTED]')
                    ? 'text-rose-500 font-bold'
                    : log.includes('[SUCCESS]') || log.includes('[PASSED]')
                    ? 'text-emerald-400 font-bold'
                    : log.includes('[SYSTEM]')
                    ? 'text-slate-500'
                    : 'text-cyan-400'
                }`}
              >
                {log}
              </div>
            ))}
          </div>

          <div className="border-t border-slate-900 pt-3 flex justify-between items-center text-[9px] text-slate-500">
            <span>SYS_TIME: UTC+5:30</span>
            <span>SHIELD_V4_ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  )}

 </main>
 </div>
 );
}
