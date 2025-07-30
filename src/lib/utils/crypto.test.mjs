import { encryptAES, decryptAES, generateKey } from './crypto.mjs';

const testEncryption = () => {
  const key = generateKey();
  const originalText = 'Secret message 123';
  
  console.log('Original:', originalText);
  
  const encrypted = encryptAES(originalText, key);
  console.log('Encrypted:', encrypted);
  
  const decrypted = decryptAES(encrypted, key);
  console.log('Decrypted:', decrypted);
  
  if (originalText === decrypted) {
    console.log('✅ Encryption test passed');
    return true;
  } else {
    console.error('❌ Encryption test failed');
    return false;
  }
};

// Run the test
testEncryption();
