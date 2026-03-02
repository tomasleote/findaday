/**
 * LoadingSpinner — Shared loading indicator component
 * Variants: default (centered text + spinner), inline (just spinner)
 */
import React from 'react';
import { RefreshCw } from 'lucide-react';

export function LoadingSpinner({ variant = 'default', label = 'Loading...', size = 'md' }) {
  const sizeClass = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }[size];

  if (variant === 'inline') {
    return (
      <RefreshCw className={`${sizeClass} animate-spin text-blue-400`} />
    );
  }

  // default: centered full-screen with label
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <RefreshCw className={`${sizeClass} animate-spin text-blue-400`} />
        <div className="text-lg text-gray-400">{label}</div>
      </div>
    </div>
  );
}

export default LoadingSpinner;
