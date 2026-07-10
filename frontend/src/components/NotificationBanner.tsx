// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';

interface NotificationBannerProps {
  type: 'success' | 'error';
  message: string;
  onDismiss: () => void;
  autoDismissMs?: number;
}

export default function NotificationBanner({ type, message, onDismiss, autoDismissMs = 5000 }: NotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setIsVisible(true));

    // Auto dismiss
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(onDismiss, 300); // Wait for fade out animation
    }, autoDismissMs);

    return () => clearTimeout(timer);
  }, [autoDismissMs, onDismiss]);

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(onDismiss, 300);
  };

  const baseClasses = 'fixed top-24 right-6 z-[60] max-w-md px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md transition-all duration-300';
  const typeClasses = type === 'success'
    ? 'bg-green-500/10 border-green-500/20 text-green-400'
    : 'bg-red-500/10 border-red-500/20 text-red-400';
  const visibilityClasses = isVisible && !isLeaving
    ? 'opacity-100 translate-x-0'
    : 'opacity-0 translate-x-8';

  return (
    <div className={`${baseClasses} ${typeClasses} ${visibilityClasses}`}>
      <div className="flex items-start gap-3">
        <iconify-icon
          icon={type === 'success' ? 'lucide:check-circle' : 'lucide:alert-circle'}
          class="text-xl shrink-0 mt-0.5"
        />
        <p className="text-sm font-medium flex-1">{message}</p>
        <button
          onClick={handleDismiss}
          className="text-white/40 hover:text-white transition-colors shrink-0"
        >
          <iconify-icon icon="lucide:x" class="text-lg" />
        </button>
      </div>
    </div>
  );
}
