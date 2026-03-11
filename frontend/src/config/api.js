/**
 * Centralized API configuration
 * Decides whether to use the production Render URL or a local environment variable.
 */

// We use import.meta.env for Vite-based projects
const VITE_API_URL = import.meta.env.VITE_API_URL;

// Production fallback: If no environment variable is found, we default to the Render backend
export const API_BASE_URL = VITE_API_URL || 'https://land-measure-api.onrender.com/api';

console.log(`[Config] API Base URL set to: ${API_BASE_URL}`);
