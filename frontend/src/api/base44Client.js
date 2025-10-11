import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68e9b1f0860a27269db49e3d", 
  requiresAuth: true // Ensure authentication is required for all operations
});
