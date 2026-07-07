import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { AdminConfig } from '../types';
import { handleFirestoreError, OperationType } from './firestoreErrorHandler';
import { sha256 } from './hashHelper';

const CONFIG_DOC_ID = 'admin_settings';

export const DEFAULT_CONFIG: AdminConfig = {
 id: CONFIG_DOC_ID,
 adminUsername: '', // Empty on standard client-side config
 adminPassword: '', // Empty on standard client-side config
 upiId: 'bytexon@upi',
 adminSecretPath: 'gate-abhya23',
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
 // Create initial default configuration on first load (only public fields)
 try {
 const { adminUsername, adminPassword, ...publicDefault } = DEFAULT_CONFIG;
 await setDoc(docRef, publicDefault);
 } catch (writeErr) {
 console.warn("Failed to write initial default config, using memory default:", writeErr);
 }
 return DEFAULT_CONFIG;
 }
 } catch (error) {
 console.warn('Firestore is offline or unreachable. Falling back to local DEFAULT_CONFIG:', error);
 return DEFAULT_CONFIG;
 }
}

export async function updateAdminConfig(updates: Partial<AdminConfig>): Promise<void> {
 const path = `config/${CONFIG_DOC_ID}`;
 try {
 const { adminUsername, adminPassword, ...publicUpdates } = updates;
 const oldToken = sessionStorage.getItem('admin_token') || '';

 // Save public parameters
 const docRef = doc(db, 'config', CONFIG_DOC_ID);
 await setDoc(docRef, {
 ...publicUpdates,
 adminAuthToken: oldToken
 }, { merge: true });

 // Save credentials in separate cryptographically hashed document ID
 if (adminUsername && adminPassword) {
 const usernameClean = adminUsername.trim();
 const passwordClean = adminPassword.trim();
 const newHash = await sha256(`${usernameClean}:${passwordClean}`);
 const newToken = `auth_${newHash}`;

 const authDocRef = doc(db, 'config', newToken);
 await setDoc(authDocRef, {
 adminUsername: usernameClean,
 adminPassword: passwordClean,
 authorized: true,
 adminAuthToken: oldToken
 });

 // Update public settings document to indicate custom auth has been set
 await setDoc(docRef, {
 customAuthActive: true,
 adminAuthToken: oldToken
 }, { merge: true });

 // Disable old token document if changed
 if (oldToken && oldToken !== newToken) {
 try {
 const oldDocRef = doc(db, 'config', oldToken);
 await setDoc(oldDocRef, {
 authorized: false,
 adminAuthToken: oldToken
 }, { merge: true });
 } catch (delErr) {
 console.warn("Failed to disable old auth document:", delErr);
 }
 }

 // Update session storage
 sessionStorage.setItem('admin_token', newToken);
 sessionStorage.setItem('admin_username', usernameClean);
 sessionStorage.setItem('admin_password', passwordClean);
 }
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

