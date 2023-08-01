// Obsolete - rewrite into the login screen login, where the user nickname
// will be sanitized and rewritten into an ID such as in the case of Facebook

import { nanoid } from 'nanoid';

// Helper function to sanitize the key
export function sanitizeKey(key:string) {
  const forbidden = /[.,$#[\]/]/g;
  return key.replace(forbidden, '_');
};

// Create a new key
export function createKey(length:number = 100){
  if (length <= 0) {
    throw new Error('The key must be of at least length 1');
  }
  // Generate a new key
  const rawKey = nanoid();
  // Clean up and return a clean key
  const sanitizedKey = sanitizeKey(rawKey);
  const truncatedKey = sanitizedKey.substring(0,length);
  return truncatedKey;
};


// When a new user account is created
export function onAccountCreated(newUser:any){
  // Generate a unique key for the new user
  const userKey = createKey();
  // Save the key and user data to your database
  // ... your database code goes here ...
};