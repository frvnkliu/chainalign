import { useRef, useEffect, useState } from 'react';
import './AnimatedChainIndex.css';

interface AnimatedChainIndexProps {
  index: number;
}

export default function AnimatedChainIndex({ index }: AnimatedChainIndexProps) {
  const prevIndexRef = useRef(index);
  const [displayIndex, setDisplayIndex] = useState(index);
  const [isAnimating, setIsAnimating] = useState(false);

  const displayStr = displayIndex.toString().padStart(2, '0');
  const prevStr = prevIndexRef.current.toString().padStart(2, '0');

  // Track if digit changed
  const digitChanged = (i: number) => prevStr[i] !== displayStr[i];

  useEffect(() => {
    if (index !== prevIndexRef.current) {
      // Delay animation by 350ms (after chain deletion animation completes)
      const delayTimer = setTimeout(() => {
        setDisplayIndex(index);
        setIsAnimating(true);

        // After animation completes, update ref and reset animation state
        const animationTimer = setTimeout(() => {
          prevIndexRef.current = index;
          setIsAnimating(false);
        }, 200);

        return () => clearTimeout(animationTimer);
      }, 350);

      return () => clearTimeout(delayTimer);
    }
  }, [index]);

  return (
    <div className="animated-chain-index">
      {displayStr.split('').map((digit, i) => {
        const changed = digitChanged(i) && isAnimating;

        return (
          <div key={i} className="animated-chain-index__digit-wrapper">
            <div className="animated-chain-index__digit">
              {digit}
            </div>
            {changed && (
              <div className="animated-chain-index__reveal" />
            )}
          </div>
        );
      })}
      <span className="animated-chain-index__period">.</span>
    </div>
  );
}
