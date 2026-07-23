export interface ProjectUpdate {
 id: string;
 timestamp: number;
 title: string;
 status: 'In Progress' | 'Completed' | 'Blocked' | 'Update';
 notes: string;
}

export interface ProjectFile {
  name: string;
  type: string;
  size: number;
  dataUrl: string; // base64 representation of file
}

export interface PaymentRecord {
 id: string;
 amount: number;
 currency: 'INR' | 'USD';
 status: 'pending' | 'verified' | 'rejected';
 txRef: string;
 notes?: string;
 submittedAt: number;
 verifiedAt?: number;
}

export interface ProjectRequest {
 id: string;
 name: string;
 email: string;
 companyName?: string;
 whatsapp: string;
 description: string;
 budgetAmount: number;
 budgetCurrency: 'INR' | 'USD';
 status: 'pending' | 'approved' | 'rejected' | 'payment_submitted' | 'completed';
 createdAt: number;
 approvedAt?: number;
 approvedAmount?: number; // Final payable price, updated by admin if needed
 approvedCurrency?: 'INR' | 'USD';
 paymentTxRef?: string;
 paymentNotes?: string;
 paymentSubmittedAt?: number;
 paymentVerifiedAt?: number;
 paidAmount?: number;
 paymentAmountSubmitted?: number;
 dailyUpdates?: ProjectUpdate[];
 files?: ProjectFile[];
 payments?: PaymentRecord[];
}

export interface ChatMessage {
 id: string;
 requestId: string;
 sender: 'client' | 'admin';
 text: string;
 timestamp: number;
}

export interface AdminConfig {
  id: string;
  adminUsername: string;
  adminPassword: string;
  upiId: string;
  adminSecretPath?: string;
  upiQrBase64?: string; // Stored as data URL
  standardPricing?: {
    starter: number;
    professional: number;
    enterprise: number;
  };
  customAuthActive?: boolean;
  adminAuthToken?: string;
  totpEnabled?: boolean;
  totpSecret?: string;
}
