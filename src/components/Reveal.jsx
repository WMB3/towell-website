import { memo } from 'react';
import { useReveal } from '../hooks/useReveal';

const Reveal = memo(({ children, delay = 0, className = '' }) => {
  const ref = useReveal(delay);

  return (
    <div ref={ref} className={`translate-y-8 opacity-0 transition-all duration-700 ease-out ${className}`}>
      {children}
    </div>
  );
});

export default Reveal;
