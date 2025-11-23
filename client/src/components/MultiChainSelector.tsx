import { useState, useRef, useEffect } from 'react';
import ChainSelector from './ChainSelector';
import './MultiChainSelector.css';

interface Model {
  id: string;
  name: string;
}

interface ChainItem {
  model: Model | undefined;
  animationState: 'add' | 'delete' | 'idle';
}

interface MultiChainSelectorProps {
  availableModels: Model[];
  initialChains?: Model[][];
}

export default function MultiChainSelector({
  availableModels,
  initialChains = []
}: MultiChainSelectorProps) {
  // Initialize chains from prop
  const initializeChains = () => {
    if (initialChains.length === 0) {
      return [[{ model: undefined, animationState: 'add' as const }]];
    }
    return initialChains.map(models =>
      models.map(model => ({ model, animationState: 'idle' as const }))
    );
  };

  const [chains, setChains] = useState<ChainItem[][]>(initializeChains());
  const [activeChainIndex, setActiveChainIndex] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const chainRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isProgrammaticScrollRef = useRef(false);

  // Scroll to active chain when it changes programmatically
  useEffect(() => {
    const activeChainElement = chainRefs.current[activeChainIndex];
    const viewport = viewportRef.current;

    if (activeChainElement && viewport && !isProgrammaticScrollRef.current) {
      isProgrammaticScrollRef.current = true;

      // Calculate scroll position to center the element in viewport
      const elementTop = activeChainElement.offsetTop;
      const viewportHeight = viewport.clientHeight;
      const elementHeight = activeChainElement.clientHeight;
      const scrollTo = elementTop - (viewportHeight / 2) + (elementHeight / 2);

      // Scroll only the viewport, not parent containers
      viewport.scrollTo({
        top: scrollTo,
        behavior: 'smooth'
      });

      // Reset flag after scroll completes
      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 500);
    }
  }, [activeChainIndex]);

  // Update active chain based on scroll position
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    let scrollTimeout: number;
    const handleScroll = () => {
      // Debounce scroll events
      clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(() => {
        if (isProgrammaticScrollRef.current) return;

        // Find which chain is most visible (closest to center)
        const viewportHeight = viewport.clientHeight;

        let closestIndex = 0;
        let closestDistance = Infinity;

        chainRefs.current.forEach((ref, index) => {
          if (ref) {
            const rect = ref.getBoundingClientRect();
            const viewportRect = viewport.getBoundingClientRect();
            const elementCenter = rect.top - viewportRect.top + rect.height / 2;
            const distance = Math.abs(elementCenter - viewportHeight / 2);

            if (distance < closestDistance) {
              closestDistance = distance;
              closestIndex = index;
            }
          }
        });

        if (closestIndex !== activeChainIndex) {
          setActiveChainIndex(closestIndex);
        }
      }, 150);
    };

    viewport.addEventListener('scroll', handleScroll);
    return () => {
      viewport.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [chains, activeChainIndex]);

  // Handle chain click
  const handleChainClick = (index: number) => {
    if (index !== activeChainIndex && index < chains.length) {
      setActiveChainIndex(index);
    }
  };

  // Add new chain
  const handleAddChain = () => {
    setChains(prev => [...prev, [{ model: undefined, animationState: 'add' }]]);
    setActiveChainIndex(chains.length);
  };

  // Delete active chain
  const handleDeleteChain = () => {
    if (chains.length === 1) return; // Don't delete the last chain

    setChains(prev => prev.filter((_, index) => index !== activeChainIndex));
    setActiveChainIndex(prev => Math.max(0, Math.min(prev, chains.length - 2)));
  };

  return (
    <div className="multi-chain-selector">
      <h2 className="multi-chain-selector__heading">
        Select Your Chains
      </h2>

      <div className="multi-chain-selector__viewport" ref={viewportRef}>
        {chains.map((_, index) => (
          <div
            key={index}
            ref={(el) => (chainRefs.current[index] = el)}
            className={`multi-chain-selector__chain ${
              index === activeChainIndex ? 'multi-chain-selector__chain--active' : ''
            }`}
            onClick={() => handleChainClick(index)}
          >
            <ChainSelector
              availableModels={availableModels}
              models={chains[index].map(item => item.model).filter((m): m is Model => m !== undefined)}
              onDeleteChain={index === activeChainIndex && chains.length > 1 ? handleDeleteChain : undefined}
            />
          </div>
        ))}
      </div>

      <div className="multi-chain-selector__footer">
        <div
          className="multi-chain-selector__add-indicator"
          onClick={handleAddChain}
        >
          <div className="multi-chain-selector__add-text">+ Add New Chain</div>
        </div>

        <div className="multi-chain-selector__counter">
          Chain {activeChainIndex + 1} of {chains.length}
        </div>
      </div>
    </div>
  );
}
