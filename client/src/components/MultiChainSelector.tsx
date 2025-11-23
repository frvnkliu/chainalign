import { useState, useRef } from 'react';
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
  const isScrollingRef = useRef(false);

  // Handle wheel scrolling
  const handleWheel = (e: React.WheelEvent) => {
    if (isScrollingRef.current) return;

    const delta = e.deltaY;
    const threshold = 30;

    if (Math.abs(delta) > threshold) {
      isScrollingRef.current = true;

      if (delta > 0 && activeChainIndex < chains.length - 1) {
        // Scroll down
        setActiveChainIndex(prev => prev + 1);
      } else if (delta < 0 && activeChainIndex > 0) {
        // Scroll up
        setActiveChainIndex(prev => prev - 1);
      }

      setTimeout(() => {
        isScrollingRef.current = false;
      }, 400);
    }
  };

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


  // Calculate visible chains (max 5: current + 2 above/below)
  const getVisibleChains = () => {
    const visibleIndices: number[] = [];
    const start = Math.max(0, activeChainIndex - 2);
    const end = Math.min(chains.length, activeChainIndex + 3);

    for (let i = start; i < end; i++) {
      visibleIndices.push(i);
    }

    return visibleIndices ;
  };

  const visibleIndices = getVisibleChains();

  // Calculate opacity based on distance from active chain
  const getOpacity = (index: number) => {
    const distance = Math.abs(index - activeChainIndex);
    if (distance === 0) return 1;
    if (distance === 1) return 0.5;
    return 0.25;
  };

  // Calculate scale based on distance from active chain
  const getScale = (index: number) => {
    const distance = Math.abs(index - activeChainIndex);
    if (distance === 0) return 1;
    if (distance === 1) return 0.8;
    return 0.7;
  };

  return (
    <div className="multi-chain-selector">
      <h2 className="multi-chain-selector__heading">
        Select Your Chains
      </h2>

      <div className="multi-chain-selector__viewport" onWheel={handleWheel}>
        <div className="multi-chain-selector__container">
          {visibleIndices.map(index => (
            <div
              key={index}
              className={`multi-chain-selector__chain ${
                index === activeChainIndex ? 'multi-chain-selector__chain--active' : ''
              }`}
              style={{
                opacity: getOpacity(index),
                transform: `scale(${getScale(index)})`,
                pointerEvents: index === activeChainIndex ? 'auto' : 'all',
              }}
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
