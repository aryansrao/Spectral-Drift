'use client';

import { useEffect, useRef } from 'react';

interface RevealWrapperProps {
  children: React.ReactNode;
  delay?: 0 | 1 | 2 | 3;
  className?: string;
}

export default function RevealWrapper({
  children,
  delay = 0,
  className = '',
}: RevealWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          io.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const delayClass =
    delay === 1
      ? 'reveal-delay-1'
      : delay === 2
      ? 'reveal-delay-2'
      : delay === 3
      ? 'reveal-delay-3'
      : '';

  return (
    <div ref={ref} className={`reveal ${delayClass} ${className}`.trim()}>
      {children}
    </div>
  );
}
