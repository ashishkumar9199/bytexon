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
