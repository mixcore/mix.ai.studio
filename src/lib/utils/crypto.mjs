import aesjs from 'aes-js';
// Environment-safe crypto initialization
/** @type {Crypto|undefined} */
let crypto;
if (typeof window !== 'undefined') {
  crypto = window.crypto;
} else if (typeof globalThis !== 'undefined' && globalThis.crypto) {
  crypto = globalThis.crypto;
}

/**
 * @param {string} plainText
 * @param {Uint8Array} key 
 * @returns {string}
 */
export function encryptAES(plainText, key) {
  const textBytes = aesjs.utils.utf8.toBytes(plainText);
  const aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
  const encryptedBytes = aesCtr.encrypt(textBytes);
  return aesjs.utils.hex.fromBytes(encryptedBytes);
}

/**
 * @param {string} encryptedHex 
 * @param {Uint8Array} key
 * @returns {string} 
 */
export function decryptAES(encryptedHex, key) {
  const encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex);
  const aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
  const decryptedBytes = aesCtr.decrypt(encryptedBytes);
  return aesjs.utils.utf8.fromBytes(decryptedBytes);
}

export function generateKey(length = 32) {
  const key = new Uint8Array(length);
  
  // Browser environment
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(key);
  } 
  // Node.js environment (for SSR/testing)
  else if (typeof crypto !== 'undefined') {
    crypto.getRandomValues(key);
  }
  // Fallback for unsupported environments
  else {
    for (let i = 0; i < length; i++) {
      key[i] = Math.floor(Math.random() * 256);
    }
  }
  
  return key;
}
