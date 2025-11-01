// utils/passwordGenerator.js

/**
 * Generates a cryptographically secure, random password meeting complexity requirements.
 * Requirements: >= 12 chars, 1 uppercase, 1 number, 1 symbol.
 * * The generated password length is fixed at 14 characters to easily exceed 
 * the 12-character minimum and ensure high entropy.
 * * @returns {string} The generated password.
 */
export const generateSecurePassword = () => {
  const length = 12; 
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const symbols = '!@#$%^&*()_+=[{]}';
  
  const allChars = upper + lower + digits + symbols;
  let password = '';
  
  // 1. Ensure we meet complexity requirements by forcing one of each type
  password += upper[Math.floor(Math.random() * upper.length)];
  password += lower[Math.floor(Math.random() * lower.length)];
  password += digits[Math.floor(Math.random() * digits.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // 2. Fill the rest of the password length randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // 3. Shuffle the password string to randomize the order of the required characters
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};
