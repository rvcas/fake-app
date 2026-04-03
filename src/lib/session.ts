import type { PasskeyCredential } from "./passkey";

const STORAGE_KEY = "midnightos-passkey-credential";

export function saveCredential(credential: PasskeyCredential) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(credential));
}

export function loadCredential(): PasskeyCredential | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as PasskeyCredential;
  } catch {
    return null;
  }
}

export function clearCredential() {
  localStorage.removeItem(STORAGE_KEY);
}
