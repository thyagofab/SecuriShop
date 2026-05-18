export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const demoFlag = import.meta.env.VITE_ENABLE_XSS_DEMO;
export const ENABLE_XSS_DEMO =
  !demoFlag || !['false', '0', 'off'].includes(demoFlag.toLowerCase());
