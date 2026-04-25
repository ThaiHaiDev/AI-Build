import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;

export const MailIcon = (p: P) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

export const LockIcon = (p: P) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...p}>
    <rect x="4" y="11" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

export const UserIcon = (p: P) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...p}>
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
    <path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

export const TeamIcon = (p: P) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...p}>
    <path d="M3 19c.8-2.5 3-4 5-4s4.2 1.5 5 4M14 19c.8-2.5 3-4 5-4 .7 0 1.4.2 2 .5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="8" cy="9" r="3" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="17" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

export const EyeIcon = (p: P) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

export const EyeOffIcon = (p: P) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...p}>
    <path d="M3 3l18 18M10.6 6.1A10.8 10.8 0 0112 6c6.5 0 10 7 10 7a17.5 17.5 0 01-3.3 4.2M6.3 7.5A17.5 17.5 0 002 13s3.5 7 10 7c1.7 0 3.2-.4 4.5-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const ArrowRightIcon = (p: P) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const GlobeIcon = (p: P) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" {...p}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
    <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

export const CheckIcon = (p: P) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" {...p}>
    <path d="M4 12l6 6L20 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const SpinIcon = (p: P) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="animate-spin" {...p}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".25" strokeWidth="2.5" />
    <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const AlertCircleIcon = (p: P) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...p}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
    <path d="M12 8v5M12 16v.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
