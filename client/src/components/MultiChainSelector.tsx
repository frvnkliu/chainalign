import { useState, useRef } from 'react';
import ChainSelector from './ChainSelector';
import { Model, ChainItem } from '../types/chain';
import './MultiChainSelector.css';

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
  const viewportRef = useRef<HTMLDivElement>(null);

  // Add new chain
  const handleAddChain = () => {
    setChains(prev => [...prev, [{ model: undefined, animationState: 'add' }]]);
  };

  // Delete chain by index
  const handleDeleteChain = (index: number) => {
    if (chains.length === 1) return; // Don't delete the last chain
    setChains(prev => prev.filter((_, i) => i !== index));
  };

  // Handle changes to individual chain models
  const handleChainChange = (index: number, models: Model[]) => {
    setChains(prev => {
      const newChains = [...prev];
      newChains[index] = models.map(model => ({ model, animationState: 'idle' as const }));
      return newChains;
    });
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
            className="multi-chain-selector__chain"
          >
            <ChainSelector
              availableModels={availableModels}
              models={chains[index].map(item => item.model).filter((m): m is Model => m !== undefined)}
              onDeleteChain={chains.length > 1 ? () => handleDeleteChain(index) : undefined}
              chainIndex={index + 1}
              onChange={(models) => handleChainChange(index, models)}
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
