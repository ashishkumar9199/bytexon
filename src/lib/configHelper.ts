import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { AdminConfig } from '../types';
import { handleFirestoreError, OperationType } from './firestoreErrorHandler';

const CONFIG_DOC_ID = 'admin_settings';

export const DEFAULT_CONFIG: AdminConfig = {
  id: CONFIG_DOC_ID,
  adminUsername: 'admin',
  adminPassword: 'admin123',
  upiId: 'bytexon@upi',
  adminSecretPath: 'bytexon-secure-gate',
  upiQrBase64: '', // Empty means use dynamically generated UPI QR
  standardPricing: {
    starter: 15000,
    professional: 45000,
    enterprise: 95000
  }
};

export async function getAdminConfig(): Promise<AdminConfig> {
  const path = `config/${CONFIG_DOC_ID}`;
  try {
    const docRef = doc(db, 'config', CONFIG_DOC_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { ...DEFAULT_CONFIG, ...docSnap.data() } as AdminConfig;
    } else {
      // Create default configuration on first load
      try {
        await setDoc(docRef, DEFAULT_CONFIG);
      } catch (writeErr) {
        handleFirestoreError(writeErr, OperationType.WRITE, path);
      }
      return DEFAULT_CONFIG;
    }
  } catch (error) {
    console.error('Error fetching admin config:', error);
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function updateAdminConfig(updates: Partial<AdminConfig>): Promise<void> {
  const path = `config/${CONFIG_DOC_ID}`;
  try {
    const docRef = doc(db, 'config', CONFIG_DOC_ID);
    await setDoc(docRef, updates, { merge: true });
  } catch (error) {
    console.error('Error updating admin config:', error);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Generate a valid, scannable UPI pay URL
export function generateUpiUrl(upiId: string, amount: number, payeeName: string = 'Bytexon'): string {
  const cleanUpiId = upiId.trim();
  const encodedName = encodeURIComponent(payeeName);
  return `upi://pay?pa=${cleanUpiId}&pn=${encodedName}&am=${amount}&cu=INR`;
}

// Generate QR Code image URL using a free, high-performance API or custom helper
export function getQrCodeUrl(upiId: string, amount: number, customQrBase64?: string): string {
  if (customQrBase64 && customQrBase64.startsWith('data:image')) {
    return customQrBase64;
  }
  const upiUrl = generateUpiUrl(upiId, amount);
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUrl)}`;
}
