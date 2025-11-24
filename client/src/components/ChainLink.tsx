import { useState, useEffect, useRef } from 'react';
import ChainNode from './ChainNode';
import { Model } from '../types/chain';

interface ChainLinkProps {
  models: Model[];
  selectedModel: Model | null;
  onSelect: (model: Model) => void;
  onDelete?: () => void;
  animationState?: 'add' | 'delete' | 'idle' | 'clear';
  onAnimationComplete: () => void;
}

export default function ChainLink({
  models,
  selectedModel,
  onSelect,
  onDelete,
  animationState = 'idle',
  onAnimationComplete,
}: ChainLinkProps) {
  const [currentState, setCurrentState] = useState<'add' | 'delete' | 'idle' | 'clear'>(animationState);
  const animationCountRef = useRef(0);

  useEffect(() => {
    setCurrentState(animationState);
    animationCountRef.current = 0; // Reset count when animation state changes
  }, [animationState]);

  const handleAnimationEnd = (e: React.AnimationEvent) => {
    // Only count animations from direct children (line and node-wrapper)
    const target = e.target as HTMLElement;
    const isLineOrNodeWrapper =
      target.classList.contains('chain-link__line') ||
      target.classList.contains('chain-link__node-wrapper');

    if (!isLineOrNodeWrapper) return;

    if (currentState === 'idle') return;

    animationCountRef.current++;

    // Clear state only animates node-wrapper (1 animation)
    // Add/Delete states animate both line and node-wrapper (2 animations)
    const requiredAnimations = currentState === 'clear' ? 1 : 2;

    if (animationCountRef.current >= requiredAnimations) {
      animationCountRef.current = 0;
      setCurrentState('idle');
      onAnimationComplete();
    }
  };

  const linkClasses = [
    'chain-link',
    currentState === 'add' && 'chain-link--add',
    currentState === 'delete' && 'chain-link--delete',
    currentState === 'clear' && 'chain-link--clear',
    selectedModel ? 'chain-link--filled' : 'chain-link--empty'
  ].filter(Boolean).join(' ');

  return (
    <div className={linkClasses} onAnimationEnd={handleAnimationEnd}>
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
