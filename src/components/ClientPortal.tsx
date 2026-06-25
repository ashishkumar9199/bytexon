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

interface ClientPortalProps {
  requestId: string;
  onBack: () => void;
  adminConfig: AdminConfig;
}

export default function ClientPortal({ requestId, onBack, adminConfig }: ClientPortalProps) {
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
    } catch (err) {
      console.error('Error updating payment info:', err);
      alert('Failed to submit payment details. Please try again.');
      handleFirestoreError(err, OperationType.WRITE, `requests/${request.id}`);
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(adminConfig.upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-sans">Connecting to portal...</p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="max-w-md mx-auto p-5 bg-white rounded-sm shadow-sm border border-slate-300 mt-12 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-base font-display font-extrabold text-slate-900 mb-1">Access Denied</h2>
        <p className="text-xs text-slate-600 mb-4">{error || 'Unable to retrieve your portal data.'}</p>
        <button 
          onClick={onBack}
          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-sm font-sans font-bold text-xs transition-all cursor-pointer border border-indigo-700"
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
    <div className="max-w-7xl mx-auto px-4 py-4 font-sans">
      {/* Top Navigation */}
      <button 
        onClick={onBack}
        id="btn-portal-back"
        className="flex items-center space-x-1.5 text-slate-500 hover:text-slate-900 mb-4 transition-colors group cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        <span className="font-bold text-xs">Back to Bytexon Home</span>
      </button>

      {/* Header Panel */}
      <div className="bg-white rounded-sm border border-slate-300 p-4 shadow-xs mb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-[10px] font-bold rounded-sm uppercase tracking-wider font-mono">
                ID: {request.id}
              </span>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-sm uppercase tracking-wider border ${
                request.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                request.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                request.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                request.status === 'payment_submitted' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                'bg-teal-50 text-teal-700 border-teal-200'
              }`}>
                {request.status.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-lg font-display font-extrabold text-slate-900 leading-tight">
              Project: {request.description.substring(0, 45)}{request.description.length > 45 ? '...' : ''}
            </h1>
            <p className="text-slate-500 text-[11px] mt-0.5">Submitted by <strong className="text-slate-700">{request.name}</strong> ({request.email})</p>
          </div>
          
          <div className="flex items-center gap-2.5 bg-slate-50 p-2 rounded-sm border border-slate-200 self-start md:self-auto">
            <div className="p-1.5 bg-white rounded-sm border border-slate-200 text-indigo-600 shadow-xs flex-shrink-0">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Estimated Budget</p>
              <p className="text-sm font-display font-black text-slate-900 leading-none mt-0.5">
                {budgetSign}{request.budgetAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Progress Tracker */}
        <div className="mt-4 border-t border-slate-200 pt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative">
            
            {/* Step 1: Submission */}
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-sm flex items-center justify-center bg-indigo-600 text-white shadow-xs text-xs border border-indigo-700 flex-shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs text-slate-900 truncate">1. Work Request</p>
                <p className="text-[10px] text-emerald-600 font-semibold truncate">Submitted</p>
              </div>
            </div>

            {/* Step 2: Review/Approval */}
            <div className="flex items-center space-x-2">
              <div className={`w-7 h-7 rounded-sm flex items-center justify-center transition-colors duration-300 border flex-shrink-0 text-xs ${
                isApproved ? 'bg-indigo-600 text-white border-indigo-700' : 
                request.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}>
                {request.status === 'rejected' ? <AlertCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <p className={`font-bold text-xs truncate ${isApproved ? 'text-slate-900' : 'text-slate-500'}`}>2. Admin Review</p>
                <p className={`text-[10px] font-semibold truncate ${
                  request.status === 'rejected' ? 'text-rose-600' :
                  isApproved ? 'text-emerald-600' : 'text-slate-400'
                }`}>
                  {request.status === 'rejected' ? 'Rejected' : isApproved ? 'Approved' : 'Awaiting Review'}
                </p>
              </div>
            </div>

            {/* Step 3: Payment */}
            <div className="flex items-center space-x-2">
              <div className={`w-7 h-7 rounded-sm flex items-center justify-center transition-colors duration-300 border flex-shrink-0 text-xs ${
                isPaymentSubmitted ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}>
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className={`font-bold text-xs truncate ${isPaymentSubmitted ? 'text-slate-900' : 'text-slate-500'}`}>3. UPI Payment</p>
                <p className={`text-[10px] font-semibold truncate ${
                  isPaymentSubmitted ? 'text-emerald-600' :
                  isApproved ? 'text-amber-600' : 'text-slate-400'
                }`}>
                  {isPaymentSubmitted ? 'Proof Sent' : isApproved ? 'Awaiting Pay' : 'Pending'}
                </p>
              </div>
            </div>

            {/* Step 4: Kickoff */}
            <div className="flex items-center space-x-2">
              <div className={`w-7 h-7 rounded-sm flex items-center justify-center transition-colors duration-300 border flex-shrink-0 text-xs ${
                isCompleted ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className={`font-bold text-xs truncate ${isCompleted ? 'text-slate-900' : 'text-slate-500'}`}>4. Kickoff</p>
                <p className={`text-[10px] font-semibold truncate ${isCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {isCompleted ? 'Kickoff Scheduled' : 'Pending'}
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
                className="bg-amber-50 border border-amber-200 rounded-sm p-3 flex items-start space-x-2"
              >
                <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-amber-900 text-xs uppercase tracking-wider">Under Review</h3>
                  <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
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
                className="bg-rose-50 border border-rose-200 rounded-sm p-3 flex items-start space-x-2"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-rose-900 text-xs uppercase tracking-wider">Proposal Declined</h3>
                  <p className="text-rose-800 text-[11px] mt-0.5 leading-relaxed">
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
                className="bg-teal-50 border border-teal-200 rounded-sm p-3 flex items-start space-x-2"
              >
                <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-teal-900 text-xs uppercase tracking-wider">Project Kickoff Confirmed!</h3>
                  <p className="text-teal-800 text-[11px] mt-0.5 leading-relaxed">
                    Your payment has been verified! Our engineering team has scheduled your kickoff. We will coordinate details in live chat.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Core Request Description Panel */}
          <div className="bg-white rounded-sm border border-slate-300 p-4 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 pb-2 border-b border-slate-200 flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Project Scope Details</span>
            </h2>
            
            <dl className="space-y-3.5 text-xs">
              <div>
                <dt className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">WhatsApp Contact</dt>
                <dd className="text-slate-900 font-mono mt-0.5 text-sm font-bold">{request.whatsapp}</dd>
              </div>
              {request.companyName && (
                <div>
                  <dt className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Company Name</dt>
                  <dd className="text-slate-900 mt-0.5 text-xs font-semibold">{request.companyName}</dd>
                </div>
              )}
              <div>
                <dt className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Project Description</dt>
                <dd className="text-slate-700 mt-1 p-2.5 bg-slate-50 rounded-sm border border-slate-200 text-xs leading-relaxed whitespace-pre-wrap font-medium">
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
              className="bg-white rounded-sm border border-slate-300 p-4 shadow-xs"
            >
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 pb-2 border-b border-slate-200 flex items-center space-x-1.5">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                <span>Secure UPI Payment Portal</span>
              </h2>

              <div className="space-y-4">
                
                {/* Approved Price Notice */}
                <div className="flex justify-between items-center bg-indigo-50/55 p-2.5 rounded-sm border border-indigo-150">
                  <div>
                    <p className="text-indigo-800 text-[9px] font-bold uppercase tracking-wider">Final Approved Price</p>
                    <p className="text-lg font-display font-black text-indigo-950 mt-0.5">
                      {displaySign}{displayAmount.toLocaleString()}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 bg-white text-indigo-700 text-[10px] font-bold rounded-sm border border-indigo-200 shadow-xs">
                    UPI Target
                  </span>
                </div>

                {request.status === 'approved' ? (
                  <>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      Please transfer using the secure details below. Then, paste your transaction UPI Reference ID (UTR) in the form below.
                    </p>

                    {/* QR Code and UPI ID Grid */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-slate-50 rounded-sm border border-slate-200">
                      
                      {/* UPI QR Generated */}
                      <div className="bg-white p-2 rounded-sm border border-slate-250 shadow-xs flex-shrink-0">
                        <img 
                          src={getQrCodeUrl(adminConfig.upiId, displayAmount, adminConfig.upiQrBase64)}
                          alt="Bytexon UPI QR"
                          className="w-28 h-28 object-contain"
                          referrerPolicy="no-referrer"
                        />
                        <p className="text-slate-400 text-[8px] text-center mt-1 font-mono uppercase tracking-wider">Scan with UPI App</p>
                      </div>

                      {/* UPI Copy Action */}
                      <div className="space-y-2 w-full text-center sm:text-left">
                        <div>
                          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Official UPI ID</p>
                          <div className="flex items-center justify-center sm:justify-start space-x-1.5 mt-0.5">
                            <span className="font-mono text-xs font-bold bg-white px-2 py-1 rounded-sm border border-slate-250 text-slate-800 select-all">
                              {adminConfig.upiId}
                            </span>
                            <button 
                              onClick={handleCopyUpi}
                              className="p-1 bg-white hover:bg-slate-100 rounded-sm border border-slate-250 text-slate-500 hover:text-slate-800 transition-colors"
                              title="Copy UPI ID"
                            >
                              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                        <ul className="text-slate-500 text-[10px] space-y-0.5 pl-3 list-disc text-left leading-normal font-medium">
                          <li>Instant kickoff scheduled on receipt</li>
                          <li>Accepts GPay, PhonePe, Paytm, BHIM</li>
                        </ul>
                      </div>
                    </div>

                    {/* Payment Form */}
                    <form onSubmit={handlePaymentSubmit} className="space-y-3 pt-1">
                      <div>
                        <label className="block text-slate-700 text-[10px] font-bold uppercase tracking-wider mb-1">
                          UPI Transaction Reference (UTR / Tx ID) <span className="text-rose-500">*</span>
                        </label>
                        <input 
                          type="text"
                          required
                          value={txRef}
                          onChange={(e) => setTxRef(e.target.value)}
                          placeholder="e.g. 314569874123"
                          className="w-full px-2.5 py-1.5 bg-slate-50 rounded-sm border border-slate-300 focus:bg-white focus:border-indigo-600 focus:outline-none font-mono text-xs font-semibold transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 text-[10px] font-bold uppercase tracking-wider mb-1">
                          Additional Payment Notes (Optional)
                        </label>
                        <textarea 
                          value={payNotes}
                          onChange={(e) => setPayNotes(e.target.value)}
                          placeholder="Sender account name, bank details, or remarks"
                          className="w-full px-2.5 py-1.5 bg-slate-50 rounded-sm border border-slate-300 focus:bg-white focus:border-indigo-600 focus:outline-none text-xs h-12 resize-none transition-all font-medium"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submittingPayment}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-sm font-sans font-bold text-xs uppercase tracking-wider shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer border border-indigo-700"
                      >
                        {submittingPayment ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-4 h-4" />
                            <span>Submit Payment Proof</span>
                          </>
                        )}
                      </button>
                    </form>
                  </>
                ) : request.status === 'payment_submitted' ? (
                  <div className="bg-slate-50 rounded-sm p-4 text-center border border-slate-200 space-y-2">
                    <Clock className="w-8 h-8 text-amber-500 mx-auto animate-pulse" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">Payment Proof Under Audit</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        UTR ID: <strong className="font-mono text-indigo-700 font-bold">{request.paymentTxRef}</strong>
                      </p>
                      <p className="text-slate-600 text-[11px] mt-2 leading-relaxed">
                        We are currently matching your transaction reference with bank logs. Verified within 15 minutes to 2 hours. Use chat below for rapid clearance.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-50 text-emerald-800 rounded-sm p-3 border border-emerald-200 flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wide">Payment Verified & Complete</h4>
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        UTR ID Reference: <span className="font-mono font-bold text-slate-900 bg-white px-1.5 py-0.5 border border-slate-200 rounded-sm">{request.paymentTxRef}</span>
                      </p>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          )}

        </div>

        {/* Right Side: Live Chat Panel (6 Columns) */}
        <div className="lg:col-span-6 bg-white rounded-sm border border-slate-300 shadow-xs flex flex-col h-[500px] overflow-hidden">
          
          {/* Chat Header */}
          <div className="p-2.5 border-b border-slate-350 flex items-center justify-between bg-slate-50">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-sm bg-indigo-600 border border-indigo-700 text-white flex items-center justify-center font-display font-black text-[10px] tracking-wider">
                BY
              </div>
              <div>
                <h3 className="font-extrabold text-slate-950 text-xs">Bytexon Lead Architect</h3>
                <p className="text-emerald-600 text-[10px] font-bold flex items-center">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1 animate-pulse"></span>
                  Active Agent Online
                </p>
              </div>
            </div>
            
            <div className="px-2 py-0.5 bg-white border border-slate-300 text-[9px] text-slate-500 font-bold rounded-sm font-mono uppercase">
              Live Support Console
            </div>
          </div>

          {/* Chat Bubble Container */}
          <div className="flex-1 overflow-y-auto p-3 bg-slate-100/30 space-y-2.5">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4 text-slate-400 space-y-1.5">
                <MessageSquare className="w-6 h-6 text-slate-300" />
                <p className="text-xs font-bold text-slate-700">Console Session Opened</p>
                <p className="text-[11px] max-w-xs leading-relaxed text-slate-400">
                  Send a message to our architect! Introduce yourself, ask questions about your budget, or clarify project milestones.
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
                    <div className={`max-w-[85%] rounded-sm p-2 text-xs shadow-2xs font-medium leading-normal ${
                      isAdmin 
                        ? 'bg-white text-slate-800 rounded-tl-none border border-slate-250' 
                        : 'bg-indigo-600 text-white rounded-tr-none'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      <span className={`block text-[8px] text-right mt-1 font-bold font-mono ${
                        isAdmin ? 'text-slate-400' : 'text-indigo-200'
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
          <form onSubmit={handleSendMessage} className="p-2 border-t border-slate-200 bg-white flex items-center space-x-1.5">
            <input 
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type message to Bytexon Architect..."
              className="flex-grow px-2.5 py-1.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-600 focus:outline-none rounded-sm text-xs transition-all font-medium"
            />
            <button 
              type="submit"
              className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-sm transition-all flex-shrink-0 cursor-pointer border border-indigo-700"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
