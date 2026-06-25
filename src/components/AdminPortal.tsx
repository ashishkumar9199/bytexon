import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, updateDoc, doc, addDoc, where } from 'firebase/firestore';
import { ProjectRequest, ChatMessage, AdminConfig } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, CheckCircle, XCircle, Clock, Settings, MessageSquare, 
  Send, ShieldAlert, Check, Copy, RefreshCw, Upload, IndianRupee, DollarSign, LogOut
} from 'lucide-react';
import { getQrCodeUrl } from '../lib/configHelper';

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
    username: adminConfig.adminUsername,
    password: adminConfig.adminPassword,
    upiId: adminConfig.upiId,
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
      username: adminConfig.adminUsername,
      password: adminConfig.adminPassword,
      upiId: adminConfig.upiId,
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
      console.error("Error loading admin requests:", err);
      setLoadingRequests(false);
      handleFirestoreError(err, OperationType.LIST, 'requests');
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
      console.error("Error loading chat messages:", err);
      handleFirestoreError(err, OperationType.LIST, 'chats');
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
      const docRef = doc(db, 'requests', selectedRequest.id);
      await updateDoc(docRef, {
        status: 'approved',
        approvedAmount: amountNum,
        approvedCurrency: approvalCurrency,
        approvedAt: Date.now()
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
      const docRef = doc(db, 'requests', selectedRequest.id);
      await updateDoc(docRef, {
        status: 'rejected'
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
      const docRef = doc(db, 'requests', selectedRequest.id);
      await updateDoc(docRef, {
        status: 'completed',
        paymentVerifiedAt: Date.now()
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
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      
      {/* Top Banner Header */}
      <header className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2">
          <div className="px-2.5 py-0.5 bg-indigo-600 font-display font-black text-xs rounded-sm tracking-wide">
            BYTEXON
          </div>
          <span className="text-slate-400 font-mono text-[10px] font-bold tracking-widest border-l border-slate-700 pl-2">
            ARCHITECT ADMIN WORKSPACE
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block leading-none">
            <p className="text-xs font-bold text-slate-100">{adminConfig.adminUsername}</p>
            <span className="text-[8px] text-emerald-400 font-mono font-bold uppercase tracking-wider">Root Active</span>
          </div>

          <button 
            onClick={onLogOut}
            id="btn-admin-logout"
            className="flex items-center space-x-1 px-2 py-1 bg-slate-800 hover:bg-rose-950 hover:text-rose-200 border border-slate-700 hover:border-rose-900 rounded-sm text-[10px] font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Primary Workspace Navigation Tabs */}
      <nav className="bg-white border-b border-slate-300 px-4 py-0 flex items-center justify-between">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('requests')}
            id="tab-requests"
            className={`py-2 px-3 font-bold text-xs border-b-2 transition-all cursor-pointer ${
              activeTab === 'requests' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Project Proposals ({requests.length})
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
            className={`py-2 px-3 font-bold text-xs border-b-2 transition-all cursor-pointer ${
              activeTab === 'chat' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Real-time Chatroom Console
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            id="tab-settings"
            className={`py-2 px-3 font-bold text-xs border-b-2 transition-all cursor-pointer ${
              activeTab === 'settings' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            System & Billing Config
          </button>
        </div>

        <div className="text-slate-400 font-mono text-[9px] font-bold hidden md:block">
          SYS STATUS: <span className="text-emerald-600">● SECURE SSL</span>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-3 overflow-hidden">
        
        {/* REQUESTS VIEW */}
        {activeTab === 'requests' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start h-full">
            
            {/* Left Side: Proposal List (5 Columns) */}
            <div className="lg:col-span-5 bg-white border border-slate-300 rounded-sm p-3 shadow-xs flex flex-col max-h-[700px]">
              
              {/* Header & Filter Row */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-extrabold uppercase text-slate-800 tracking-wider">Proposal Submissions</h2>
                  <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 font-bold font-mono text-[10px] rounded-sm">
                    {filteredRequests.length} LISTED
                  </span>
                </div>
                
                {/* Filter Grid */}
                <div className="flex flex-wrap gap-1 p-0.5 bg-slate-50 rounded-sm border border-slate-250">
                  {['all', 'pending', 'approved', 'rejected', 'payment_submitted', 'completed'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-2 py-0.5 text-[9px] font-bold rounded-sm capitalize transition-colors cursor-pointer ${
                        statusFilter === status 
                          ? 'bg-white text-indigo-700 shadow-2xs border border-slate-250' 
                          : 'text-slate-500 hover:text-slate-900'
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
                  <div className="py-12 text-center text-slate-400 font-sans">
                    <div className="w-5 h-5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <span className="text-xs">Fetching requests...</span>
                  </div>
                ) : filteredRequests.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 font-sans">
                    <Clock className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                    <p className="font-bold text-xs text-slate-500">No proposals match</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Adjust status filters above</p>
                  </div>
                ) : (
                  filteredRequests.map((req) => {
                    const isSelected = selectedRequest?.id === req.id;
                    const bSign = req.budgetCurrency === 'USD' ? '$' : '₹';
                    return (
                      <button
                        key={req.id}
                        onClick={() => setSelectedRequest(req)}
                        className={`w-full text-left p-2.5 rounded-sm border transition-all flex flex-col space-y-1 cursor-pointer ${
                          isSelected 
                            ? 'bg-indigo-50/50 border-indigo-400 shadow-2xs ring-1 ring-indigo-200' 
                            : 'bg-white border-slate-250 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-mono text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1 py-0.5 rounded-sm">
                            {req.id}
                          </span>
                          <span className={`px-1 py-0.5 text-[8px] font-black uppercase rounded-sm border ${
                            req.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            req.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            req.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            req.status === 'payment_submitted' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 animate-pulse' :
                            'bg-teal-50 text-teal-700 border-teal-200'
                          }`}>
                            {req.status.replace('_', ' ')}
                          </span>
                        </div>

                        <div>
                          <p className="font-bold text-slate-900 text-xs truncate">{req.name}</p>
                          <p className="text-slate-500 text-[11px] truncate max-w-xs">{req.description}</p>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-200 mt-1 text-[9px] text-slate-400 font-bold">
                          <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                          <span className="text-slate-700 font-mono">
                            Budget: {bSign}{req.budgetAmount.toLocaleString()}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

            </div>

            {/* Right Side: Request Details, Approvals, & Chats (7 Columns) */}
            <div className="lg:col-span-7 bg-white border border-slate-300 rounded-sm shadow-xs overflow-hidden max-h-[700px] flex flex-col">
              
              {selectedRequest ? (
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                  
                  {/* Selected Header */}
                  <div className="p-3 border-b border-slate-250 flex items-center justify-between bg-slate-50">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h3 className="font-extrabold text-slate-950 text-xs">{selectedRequest.name}</h3>
                        <span className="text-[11px] text-slate-500">({selectedRequest.email})</span>
                      </div>
                      <p className="text-slate-400 text-[9px] mt-0.5 font-mono">Reference Tracking ID: {selectedRequest.id}</p>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button 
                        onClick={() => {
                          setActiveTab('chat');
                        }}
                        className="p-1 px-2 bg-white border border-slate-250 hover:bg-slate-100 text-slate-700 rounded-sm transition-all cursor-pointer flex items-center space-x-1"
                        title="View Full Screen Chat"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="text-[10px] font-bold font-sans">Open Chat</span>
                      </button>
                    </div>
                  </div>

                  {/* Details & Actions Split Body */}
                  <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
                    
                    {/* Description Details Card */}
                    <div className="bg-slate-50 p-3 rounded-sm border border-slate-250">
                      <h4 className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">PROPOSAL REQUIREMENTS</h4>
                      <p className="text-slate-800 text-xs leading-relaxed whitespace-pre-wrap font-sans font-medium">{selectedRequest.description}</p>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-200 text-[10px] text-slate-500 font-sans">
                        <div>
                          <p className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">WhatsApp</p>
                          <p className="text-slate-800 font-bold font-mono mt-0.5 text-xs">{selectedRequest.whatsapp}</p>
                        </div>
                        {selectedRequest.companyName && (
                          <div>
                            <p className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">Company</p>
                            <p className="text-slate-800 font-bold mt-0.5 text-xs truncate">{selectedRequest.companyName}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">Client Budget</p>
                          <p className="text-slate-800 font-black font-mono mt-0.5 text-xs">
                            {selectedRequest.budgetCurrency === 'USD' ? '$' : '₹'}{selectedRequest.budgetAmount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">Submitted</p>
                          <p className="text-slate-800 font-bold mt-0.5 text-xs">
                            {new Date(selectedRequest.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Approved Price details if approved */}
                    {(selectedRequest.status === 'approved' || selectedRequest.status === 'payment_submitted' || selectedRequest.status === 'completed') && (
                      <div className="bg-indigo-50/70 border border-indigo-150 p-2.5 rounded-sm">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-indigo-800 text-[9px] font-bold uppercase tracking-wider">Approved Final Pricing</p>
                            <p className="text-sm font-display font-black text-indigo-950 mt-0.5">
                              {selectedRequest.approvedCurrency === 'USD' ? '$' : '₹'}{selectedRequest.approvedAmount?.toLocaleString()}
                            </p>
                          </div>
                          <span className="px-1.5 py-0.5 bg-white text-indigo-700 text-[9px] font-bold rounded-sm border border-indigo-200 shadow-3xs uppercase">
                            Approved
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Payment Proof Details if submitted */}
                    {(selectedRequest.status === 'payment_submitted' || selectedRequest.status === 'completed') && (
                      <div className="bg-teal-50 border border-teal-150 p-2.5 rounded-sm space-y-2">
                        <h4 className="text-[9px] font-extrabold text-teal-800 uppercase tracking-widest font-mono">PAYMENT TRANSACTION PROOF</h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-sans">
                          <div>
                            <p className="text-teal-600 font-bold text-[9px] uppercase">UTR / UPI Reference ID</p>
                            <p className="text-slate-900 font-bold font-mono text-xs select-all bg-white px-2 py-1 rounded-sm border border-teal-200 mt-0.5">
                              {selectedRequest.paymentTxRef}
                            </p>
                          </div>
                          {selectedRequest.paymentNotes && (
                            <div>
                              <p className="text-teal-600 font-bold text-[9px] uppercase">Client Remarks</p>
                              <p className="text-slate-700 font-medium bg-white px-2 py-1 rounded-sm border border-teal-200 mt-0.5 truncate">
                                {selectedRequest.paymentNotes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ACTIONS FORM GRID (Changes Based on Status) */}
                    <div className="border-t border-slate-200 pt-3.5 space-y-2">
                      <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">WORKFLOW CONTROLS</h4>

                      {selectedRequest.status === 'pending' && (
                        <div className="space-y-3 bg-slate-50 p-2.5 rounded-sm border border-slate-250">
                          <p className="text-[10px] text-slate-500 font-sans leading-relaxed">Set final approved price (INR/USD) for UPI execution and click Approve, or decline proposal.</p>
                          
                          <div className="flex gap-2 items-end">
                            <div className="flex-1">
                              <label className="block text-[8px] font-bold text-slate-700 uppercase tracking-wider mb-1">Final Approved Price</label>
                              <div className="flex rounded-sm overflow-hidden border border-slate-300">
                                <select 
                                  value={approvalCurrency}
                                  onChange={(e) => setApprovalCurrency(e.target.value as 'INR' | 'USD')}
                                  className="bg-slate-100 text-slate-700 font-bold px-1.5 py-1 text-[10px] focus:outline-none border-r border-slate-300"
                                >
                                  <option value="INR">INR (₹)</option>
                                  <option value="USD">USD ($)</option>
                                </select>
                                <input 
                                  type="number"
                                  placeholder="Approved Amount"
                                  value={approvalAmount}
                                  onChange={(e) => setApprovalAmount(e.target.value)}
                                  className="w-full px-2 py-1 bg-white text-xs focus:outline-none font-bold font-mono"
                                />
                              </div>
                            </div>

                            <button
                              onClick={handleApprove}
                              disabled={isApproving}
                              id="btn-admin-approve"
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white text-[10px] font-bold uppercase tracking-wider rounded-sm border border-indigo-700 transition-all flex items-center space-x-1 cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>{isApproving ? 'Approving...' : 'Approve'}</span>
                            </button>

                            <button
                              onClick={handleReject}
                              id="btn-admin-reject"
                              className="px-2 py-1.5 bg-white hover:bg-rose-50 border border-slate-300 hover:border-rose-300 text-rose-600 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all flex items-center space-x-1 cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Decline</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {selectedRequest.status === 'approved' && (
                        <div className="bg-slate-50 p-3 rounded-sm border border-slate-250 text-center text-slate-500 text-[10px] py-4 space-y-1">
                          <Clock className="w-6 h-6 text-indigo-500 mx-auto" />
                          <p className="font-bold text-slate-700">Awaiting Client Payment Execution</p>
                          <p className="leading-relaxed">Approved at {selectedRequest.approvedCurrency === 'USD' ? '$' : '₹'}{selectedRequest.approvedAmount?.toLocaleString()}. Client must submit transaction logs to progress.</p>
                        </div>
                      )}

                      {selectedRequest.status === 'payment_submitted' && (
                        <div className="bg-teal-50 border border-teal-200 p-3 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                          <div className="text-left space-y-0.5">
                            <h5 className="font-extrabold text-teal-900 text-xs flex items-center space-x-1">
                              <span>Action Required: Confirm Transaction ID</span>
                            </h5>
                            <p className="text-[10px] text-teal-800 max-w-md leading-relaxed">
                              Match business statements for reference <strong className="font-mono text-teal-950">{selectedRequest.paymentTxRef}</strong>. If received, verify kickoff.
                            </p>
                          </div>

                          <div className="flex gap-1 w-full sm:w-auto">
                            <button
                              onClick={handleVerifyPayment}
                              id="btn-admin-verify-pay"
                              className="w-full sm:w-auto px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-sm border border-teal-700 transition-all flex items-center justify-center space-x-1 cursor-pointer shadow-sm"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Verify & Kickoff</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {selectedRequest.status === 'completed' && (
                        <div className="bg-emerald-50 text-emerald-800 border border-emerald-150 p-2.5 rounded-sm text-[10px] font-bold flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <div>
                            <p>This request is fully verified and kicked off!</p>
                            <p className="text-emerald-700 mt-0.5 text-[9px] font-mono uppercase font-normal">Kicked off: {selectedRequest.paymentVerifiedAt ? new Date(selectedRequest.paymentVerifiedAt).toLocaleString() : 'N/A'}</p>
                          </div>
                        </div>
                      )}

                      {selectedRequest.status === 'rejected' && (
                        <div className="bg-rose-50 text-rose-800 border border-rose-150 p-2.5 rounded-sm text-[10px] font-bold flex items-center space-x-2">
                          <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                          <div>
                            <p>This project request has been declined.</p>
                            <p className="text-rose-700 mt-0.5 font-normal text-[9px]">Clients can communicate with you in live chat to renegotiate milestones.</p>
                          </div>
                        </div>
                      )}

                    </div>

                  </div>

                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-10 text-slate-400 py-32">
                  <Users className="w-10 h-10 text-slate-300 mb-2" />
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Select a Proposal</h3>
                  <p className="text-[11px] max-w-sm mt-0.5">Click any proposal on the left sidebar to manage its state, view specifications, adjust prices, and verify transactions.</p>
                </div>
              )}

            </div>

          </div>
        )}

        {/* CHATROOM CONSOLE VIEW */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start h-full max-h-[700px]">
            
            {/* Chat List Sidebar (4 Columns) */}
            <div className="lg:col-span-4 bg-white border border-slate-350 rounded-sm p-3 shadow-xs flex flex-col h-[600px] overflow-hidden">
              <h3 className="text-xs font-extrabold uppercase text-slate-800 mb-2 flex items-center space-x-1.5 tracking-wider">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                <span>Active Client Chats</span>
              </h3>
              
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                {requests.length === 0 ? (
                  <p className="text-slate-400 text-xs text-center py-20">No clients available for chat.</p>
                ) : (
                  requests.map((req) => {
                    const isSelected = selectedRequest?.id === req.id;
                    return (
                      <button
                        key={req.id}
                        onClick={() => setSelectedRequest(req)}
                        className={`w-full text-left p-2 rounded-sm border transition-all flex items-center space-x-2.5 cursor-pointer ${
                          isSelected 
                            ? 'bg-indigo-50 border-indigo-400' 
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-sm bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                          {req.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-950 text-xs truncate">{req.name}</span>
                            <span className="text-[8px] font-mono font-bold text-indigo-700 uppercase bg-white px-1 py-0.5 rounded-sm border border-slate-150">
                              {req.id}
                            </span>
                          </div>
                          <p className="text-slate-500 text-[10px] truncate mt-0.5">{req.description}</p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Main Chat Conversation (8 Columns) */}
            <div className="lg:col-span-8 bg-white border border-slate-350 rounded-sm shadow-xs flex flex-col h-[600px] overflow-hidden">
              
              {selectedRequest ? (
                <div className="flex-grow flex flex-col h-full overflow-hidden">
                  
                  {/* Active Chat Header */}
                  <div className="p-2.5 border-b border-slate-250 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-sm bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                        {selectedRequest.name.substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-950 text-xs">Chatting with {selectedRequest.name}</h4>
                        <p className="text-slate-400 text-[9px] font-mono leading-none mt-0.5">ID: {selectedRequest.id} | WhatsApp: {selectedRequest.whatsapp}</p>
                      </div>
                    </div>

                    <span className={`px-1.5 py-0.5 text-[8px] font-extrabold uppercase rounded-sm border ${
                      selectedRequest.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      selectedRequest.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      selectedRequest.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      selectedRequest.status === 'payment_submitted' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                      'bg-teal-50 text-teal-700 border-teal-200'
                    }`}>
                      {selectedRequest.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Messaging Panel */}
                  <div className="flex-grow overflow-y-auto p-3 bg-slate-50/50 space-y-2">
                    {chatMessages.length === 0 ? (
                      <div className="text-center py-20 text-slate-400 text-xs">No logs exist. Say hello first!</div>
                    ) : (
                      chatMessages.map((msg) => {
                        const isMe = msg.sender === 'admin';
                        return (
                          <div 
                            key={msg.id}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[85%] rounded-sm p-2.5 text-xs shadow-2xs ${
                              isMe 
                                ? 'bg-slate-900 text-white rounded-tr-none' 
                                : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
                            }`}>
                              <p className="leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</p>
                              <span className={`block text-[8px] text-right mt-1 font-bold font-mono text-slate-400`}>
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
                  <form onSubmit={handleSendReply} className="p-2 border-t border-slate-200 bg-white flex items-center space-x-1.5">
                    <input 
                      type="text"
                      value={adminReply}
                      onChange={(e) => setAdminReply(e.target.value)}
                      placeholder={`Reply to client ${selectedRequest.name}...`}
                      className="flex-grow px-3 py-1.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-500 focus:outline-none rounded-sm text-xs transition-all font-medium"
                    />
                    <button 
                      type="submit"
                      className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-sm border border-indigo-700 transition-all flex-shrink-0 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>

                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-10 text-slate-400 py-32">
                  <MessageSquare className="w-10 h-10 text-slate-300 mb-2" />
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Open a Conversation</h3>
                  <p className="text-[11px] max-w-sm mt-0.5">Select any customer from the sidebar on the left to start sending real-time secure chat logs.</p>
                </div>
              )}

            </div>

          </div>
        )}

        {/* SETTINGS VIEW */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto bg-white border border-slate-350 rounded-sm p-4 shadow-xs relative overflow-hidden">
            
            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600"></div>

            <div className="space-y-5">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-xs font-extrabold uppercase text-slate-800 flex items-center space-x-1.5 tracking-wider">
                  <Settings className="w-4 h-4 text-indigo-600" />
                  <span>Platform System Settings</span>
                </h2>
                <p className="text-slate-500 text-[10px] mt-0.5">Manage admin credentials, update payment gateway settings, adjust standard plans, and upload UPI QR codes.</p>
              </div>

              {settingsSuccess && (
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-250 p-2 rounded-sm flex items-center space-x-1.5 text-[10px] font-bold shadow-xs">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>System configuration saved! Updates are live.</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-5">
                
                {/* Credentials block */}
                <div className="space-y-3">
                  <h3 className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">1. Admin Credentials change</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 text-[9px] font-bold uppercase tracking-wider mb-1">
                        System Username
                      </label>
                      <input 
                        type="text"
                        required
                        value={settingsForm.username}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, username: e.target.value }))}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-500 focus:outline-none rounded-sm text-xs font-semibold transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 text-[9px] font-bold uppercase tracking-wider mb-1">
                        System Password
                      </label>
                      <input 
                        type="text"
                        required
                        value={settingsForm.password}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-500 focus:outline-none rounded-sm text-xs font-mono transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Billing credentials */}
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <h3 className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">2. UPI Payment gateway config</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    
                    <div className="md:col-span-7 space-y-3">
                      <div>
                        <label className="block text-slate-700 text-[9px] font-bold uppercase tracking-wider mb-1">
                          Commercial UPI ID <span className="text-rose-500">*</span>
                        </label>
                        <input 
                          type="text"
                          required
                          value={settingsForm.upiId}
                          onChange={(e) => setSettingsForm(prev => ({ ...prev, upiId: e.target.value }))}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-500 focus:outline-none rounded-sm text-xs font-mono font-bold text-slate-800 transition-all"
                        />
                        <p className="text-[9px] text-slate-400 mt-1 leading-relaxed">When empty or default, we render a dynamic UPI Pay URL scannable by BHIM, GooglePay, and PhonePe.</p>
                      </div>

                      <div className="p-2 bg-slate-50 rounded-sm border border-slate-200 flex items-start space-x-1.5 text-[10px] text-slate-500">
                        <ShieldAlert className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <span>UPI Transactions require instant local UTR ID checks. Keep this UPI target accurate.</span>
                      </div>
                    </div>
                    {/* QR Code Uploader */}
                    <div className="md:col-span-5 bg-slate-50 p-3 rounded-sm border border-slate-250 text-center space-y-2 flex flex-col items-center">
                      <p className="text-[9px] font-bold text-slate-700 uppercase">Optional Custom UPI QR Code</p>
                      
                      {qrFileBase64 ? (
                        <div className="relative group">
                          <img 
                            src={qrFileBase64} 
                            alt="Uploaded UPI QR"
                            className="w-20 h-20 object-contain bg-white p-1 rounded-sm border border-slate-300 shadow-2xs"
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
                        <div className="w-20 h-20 rounded-sm border-2 border-dashed border-slate-300 flex flex-col items-center justify-center bg-white text-slate-400 text-xs p-2">
                          <Upload className="w-4 h-4 mb-0.5 text-slate-300" />
                          <span className="text-[8px]">No Custom QR</span>
                        </div>
                      )}

                      <div className="w-full">
                        <label className="block w-full py-1 bg-white hover:bg-slate-100 border border-slate-300 text-[9px] font-bold uppercase rounded-sm cursor-pointer text-slate-700 transition-colors">
                          <input 
                            type="file"
                            accept="image/*"
                            onChange={handleQrUpload}
                            className="hidden"
                          />
                          Upload QR Image
                        </label>
                        <p className="text-[8px] text-slate-400 mt-0.5">Stored as secure inline data-URL.</p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Standard Plan Price change */}
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <h3 className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">3. Price table updates</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">Adjust standard starter template pricing. Changes are applied immediately to standard plan cards on the client landing page.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-700 text-[9px] font-bold uppercase tracking-wider mb-1">
                        Starter Price (INR)
                      </label>
                      <input 
                        type="number"
                        required
                        value={settingsForm.starterPrice}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, starterPrice: Number(e.target.value) }))}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-500 focus:outline-none rounded-sm text-xs font-mono font-bold transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 text-[9px] font-bold uppercase tracking-wider mb-1">
                        Professional Price (INR)
                      </label>
                      <input 
                        type="number"
                        required
                        value={settingsForm.professionalPrice}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, professionalPrice: Number(e.target.value) }))}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-500 focus:outline-none rounded-sm text-xs font-mono font-bold transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 text-[9px] font-bold uppercase tracking-wider mb-1">
                        Enterprise Price (INR)
                      </label>
                      <input 
                        type="number"
                        required
                        value={settingsForm.enterprisePrice}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, enterprisePrice: Number(e.target.value) }))}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-500 focus:outline-none rounded-sm text-xs font-mono font-bold transition-all"
                      />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-200 flex justify-end">
                  <button
                    type="submit"
                    disabled={updatingSettings}
                    id="btn-save-settings"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white text-[10px] font-bold uppercase tracking-wider border border-indigo-700 rounded-sm transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    {updatingSettings ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
