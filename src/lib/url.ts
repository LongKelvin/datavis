import { deflate, inflate } from 'pako';

const MAX_SHARE_SIZE = 50 * 1024; // 50 KB

export function encodeToUrl(text: string): string {
  if (text.length > MAX_SHARE_SIZE) {
    throw new Error('Payload too large for URL sharing (> 50 KB).');
  }
  const compressed = deflate(new TextEncoder().encode(text));
  const b64 = btoa(String.fromCharCode(...compressed));
  return `${window.location.origin}${window.location.pathname}#${encodeURIComponent(b64)}`;
}

export function decodeFromUrl(hash: string): string {
  if (!hash || hash.length <= 1) return '';
  const b64 = decodeURIComponent(hash.slice(1));
  const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  return inflate(bytes, { to: 'string' });
}
