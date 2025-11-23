import { useState, useRef, useEffect } from 'react';
import ChainSelector from './ChainSelector';
import { Model, ChainItem, ChainWithId } from '../types/chain';
import './MultiChainSelector.css';

interface MultiChainSelectorProps {
  availableModels: Model[];
  initialChains?: ChainItem[][];
}

export default function MultiChainSelector({
  availableModels,
  initialChains = []
}: MultiChainSelectorProps) {
  const nextChainIdRef = useRef(0);

  // Initialize chains from prop
  const initializeChains = (): ChainWithId[] => {
    if (initialChains.length === 0) {
      return [{
        id: nextChainIdRef.current++,
        items: []
      }];
    }
    return initialChains.map(models => ({
      id: nextChainIdRef.current++,
      items: models.map(model => ({ model: model.model, animationState: 'idle' as const }))
    }));
  };

  const [chains, setChains] = useState<ChainWithId[]>(initializeChains());
  const viewportRef = useRef<HTMLDivElement>(null);

  // Center first chain on mount
  useEffect(() => {
    if (viewportRef.current) {
      const firstChain = viewportRef.current.querySelector('.multi-chain-selector__chain');
      if (firstChain) {
        firstChain.scrollIntoView({ block: 'center' });
      }
    }
  }, []);

  // Add new chain
  const handleAddChain = () => {
    console.log('Adding new chain\n Before:', chains);
    setChains(prev => [...prev, {
      id: nextChainIdRef.current++,
      items: []
    }]);
    console.log("After:", chains);
    
    // Scroll to bottom to show new chain
    setTimeout(() => {
      if (viewportRef.current) {
        viewportRef.current.scrollTo({
          top: viewportRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  // Delete chain by id
  const handleDeleteChain = (id: number) => {
    if (chains.length === 1) return; // Don't delete the last chain
    setChains(prev => prev.filter(chain => chain.id !== id));
  };

  // Handle changes to individual chain models
  const handleChainChange = (id: number, models: Model[]) => {
    setChains(prev => prev.map(chain =>
      chain.id === id
        ? { ...chain, items: models.map(model => ({ model, animationState: 'idle' as const })) }
        : chain
    ));
  };

  return (
    <div className="multi-chain-selector">
      <h2 className="multi-chain-selector__heading">
        Select Your Chains
      </h2>

      <div className="multi-chain-selector__viewport" ref={viewportRef}>
        {chains.map((chain, index) => (
          <div
            key={chain.id}
            className="multi-chain-selector__chain"
          >
            <ChainSelector
              availableModels={availableModels}
              models={chain.items.map(item => item.model).filter((m): m is Model => m !== undefined)}
              onDeleteChain={chains.length > 1 ? () => handleDeleteChain(chain.id) : undefined}
              chainIndex={index + 1}
              onChange={(models) => handleChainChange(chain.id, models)}
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
          {chains.length} {chains.length === 1 ? 'Chain' : 'Chains'}
        </div>
      </div>
    </div>
  );
}
