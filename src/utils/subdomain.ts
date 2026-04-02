/**
 * Utility to identify the current platform segment based on the active subdomain.
 */
export const getSubdomain = (): string | null => {
  const host = window.location.hostname;
  
  // For local development, treat localhost:3000 as main, and admin.localhost:3000 as admin
  // For production, yourdomain.com vs admin.yourdomain.com
  const parts = host.split('.');
  
  if (parts.length > 2) {
    return parts[0];
  }
  
  // Special case for localhost subdomains (e.g., admin.localhost)
  if (host.includes('localhost') && parts.length >= 2 && parts[0] !== 'localhost') {
     return parts[0];
  }
  
  return null;
};

export const isAdminSubdomain = (): boolean => getSubdomain() === 'admin';

export const isAdminEmail = (email: string | null | undefined): boolean => {
   if (!email) return false;
   // In a real app, this would be a secure backend check.
   // Here we use a safe environment-based check as requested.
   const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || 'admin@anisell.com').split(',');
   return adminEmails.includes(email);
};

export const getMainDomainUrl = (): string => {
   const protocol = window.location.protocol;
   const host = window.location.host; // e.g. admin.localhost:3000
   
   // If current domain has admin. prefix, remove it.
   const mainHost = host.replace(/^admin\./, '');
   return `${protocol}//${mainHost}`;
};

export const getAdminSubdomainUrl = (): string => {
   const protocol = window.location.protocol;
   const host = window.location.host;
   
   if (host.startsWith('admin.')) return `${protocol}//${host}`;
   return `${protocol}//admin.${host}`;
};
