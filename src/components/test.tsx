import CryptoJS from 'crypto-js';

const SECRET_KEY = 'your-same-secret-key'; // (NOTE: Fernet is NOT exactly AES; This is for demo. Secure differently in production!)

export function encryptData(data) {
    const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
    return ciphertext;
}

export function decryptData(ciphertext) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptedData;
}
import React from 'react';
import { encryptData, decryptData } from '../utils/encryption';

const CallButton = () => {
  const handleApiCall = async () => {
    const payload = {
      schema_name: "test_schema",
      agent_code: "agent_123",
      quick_campaign_id: "quick_456",
      name: "John Doe"
    };

    const encryptedPayload = encryptData(payload);

    try {
      const response = await fetch('http://localhost:8000/api/create-retell-call/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(encryptedPayload)
      });

      const data = await response.json();
      const decryptedResponse = decryptData(data.data);

      console.log('Decrypted Response:', decryptedResponse);

    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <button onClick={handleApiCall}>
      Start Retell Web Call
    </button>
  );
};

export default CallButton;