/**
 * Secure native Time-Based One-Time Password (TOTP) utility.
 * Implements RFC 6238 TOTP using browser native Web Crypto API (SubtleCrypto).
 */

// Helper to convert Base32 string to Uint8Array bytes
export function base32ToBytes(base32: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const clean = base32.toUpperCase().replace(/[\s-]/g, '').replace(/=+$/, '');
  let bits = '';
  for (let i = 0; i < clean.length; i++) {
    const val = alphabet.indexOf(clean[i]);
    if (val === -1) {
      throw new Error(`Invalid base32 character: ${clean[i]}`);
    }
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.substring(i * 8, (i + 1) * 8), 2);
  }
  return bytes;
}

// Generate secure random Base32 secret for setup
export function generateBase32Secret(length: number = 16): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += alphabet[array[i] % 32];
  }
  return result;
}

// Generate the 6-digit TOTP code for a secret at a given timestamp
export async function generateTotp(secret: string, timeMs: number = Date.now()): Promise<string> {
  const keyBytes = base32ToBytes(secret);
  const epochSeconds = Math.floor(timeMs / 1000);
  const counter = Math.floor(epochSeconds / 30);

  // Counter must be an 8-byte big-endian array
  const counterBytes = new Uint8Array(8);
  let temp = counter;
  for (let i = 7; i >= 0; i--) {
    counterBytes[i] = temp & 0xff;
    temp = Math.floor(temp / 256);
  }

  // Import raw key bytes into SubtleCrypto for HMAC-SHA1
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: { name: 'SHA-1' } },
    false,
    ['sign']
  );

  // Sign counter with HMAC-SHA1
  const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, counterBytes);
  const hmac = new Uint8Array(signature);

  // Dynamic truncation to extract 4-byte dynamic binary code
  const offset = hmac[hmac.length - 1] & 0xf;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
}

// Verify a 6-digit code against a secret with +/- 1 window drift tolerance
export async function verifyTotp(secret: string, code: string): Promise<boolean> {
  const cleanCode = code.trim().replace(/\s/g, '');
  if (cleanCode.length !== 6 || isNaN(Number(cleanCode))) {
    return false;
  }

  const now = Date.now();
  // Check -30s, 0s, +30s drift window
  for (let i = -1; i <= 1; i++) {
    try {
      const calculated = await generateTotp(secret, now + i * 30000);
      if (calculated === cleanCode) {
        return true;
      }
    } catch (err) {
      console.error("Error generating validation TOTP:", err);
    }
  }
  return false;
}

// Generate the otpauth URI for scan QR code
export function generateOtpauthUri(secret: string, username: string = 'admin', issuer: string = 'Bytexon'): string {
  const cleanSecret = secret.toUpperCase().replace(/[\s-]/g, '').replace(/=+$/, '');
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(username)}?secret=${cleanSecret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}
