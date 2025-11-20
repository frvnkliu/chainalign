import { useState, useEffect, useRef } from 'react';
import ChainNode from './ChainNode';

interface Model {
  id: string;
  name: string;
}

interface ChainLinkProps {
  models: Model[];
  selectedModel?: Model;
  onSelect: (model: Model) => void;
  onDelete?: () => void;
  animationState?: 'add' | 'delete' | 'idle';
  onAnimationComplete?: () => void;
}

export default function ChainLink({
  models,
  selectedModel,
  onSelect,
  onDelete,
  animationState = 'idle',
  onAnimationComplete,
}: ChainLinkProps) {
  const [currentState, setCurrentState] = useState<'add' | 'delete' | 'idle'>(animationState);
  const linkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentState(animationState);
  }, [animationState]);

  useEffect(() => {
    if (currentState === 'idle') return;

    let animationCount = 0;
    const expectedAnimations = 2; // Line + Node

    const handleAnimationEnd = () => {
      animationCount++;

      // Only complete after both line and node animations finish
      if (animationCount >= expectedAnimations) {
        setCurrentState('idle');
        onAnimationComplete?.();
      }
    };

    const element = linkRef.current;
    if (!element) return;

    element.addEventListener('animationend', handleAnimationEnd);

    return () => {
      element.removeEventListener('animationend', handleAnimationEnd);
    };
  }, [currentState, onAnimationComplete]);

  const linkClasses = [
    'chain-link',
    currentState === 'add' && 'chain-link--add',
    currentState === 'delete' && 'chain-link--delete',
    selectedModel ? 'chain-link--filled' : 'chain-link--empty'
  ].filter(Boolean).join(' ');

  return (
    <div ref={linkRef} className={linkClasses}>
      <div className="chain-link__line" />

      <div className="chain-link__node-wrapper">
        <ChainNode
          models={models}
          selectedModel={selectedModel}
          onSelect={onSelect}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
