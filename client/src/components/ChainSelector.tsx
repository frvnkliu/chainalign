import { useState } from 'react';
import ChainLink from './ChainLink';

interface Model {
  id: string;
  name: string;
}

interface ChainSelectorProps {
  availableModels: Model[];
  models?: Model[];
  onDeleteChain?: () => void;
}

interface ChainItem {
  model: Model | undefined;
  animationState: 'add' | 'delete' | 'idle';
}

const ArrowLine = () => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <div style={{ width: '60px', height: '3px', background: 'black' }} />
    <div
      style={{
        width: '0',
        height: '0',
        borderLeft: '6px solid black',
        borderTop: '4px solid transparent',
        borderBottom: '4px solid transparent',
      }}
    />
  </div>
);

export default function ChainSelector({ availableModels, models, onDeleteChain }: ChainSelectorProps) {
  const initializeChain = (): ChainItem[] => {
    if (models && models.length > 0) {
      return [
        ...models.map(model => ({ model, animationState: 'idle' as const }))
      ];
    }
    return [{ model: undefined, animationState: 'add' as const }];
  };

  const [chain, setChain] = useState<ChainItem[]>(initializeChain());
  const [pendingDeletions, setPendingDeletions] = useState<Set<number>>(new Set());

  const handleSelect = (index: number, model: Model) => {
    const new_chain = [...chain]
    new_chain[index] = {model, animationState: 'idle'};
    if (index === chain.length - 1) {
      new_chain.push({model: undefined, animationState: 'add'});
    }
    setChain(new_chain);
  };

  const handleDelete = (index: number) => {
    // Set all nodes from index onwards to delete state
    const indicesToDelete = new Set<number>();
    for (let i = index; i < chain.length-1; i++) {
      indicesToDelete.add(i);
    }
    setPendingDeletions(indicesToDelete);

    setChain(prev => prev.map((item, i) =>
      i >= index && i != chain.length -1 ? { ...item, animationState: 'delete' } : item
    ));
  };

  const handleAnimationComplete = (index: number) => {
    if (pendingDeletions.has(index)) {
      // Check if all pending deletions have completed
      const allCompleted = Array.from(pendingDeletions).every(i =>
        chain[i]?.animationState === 'delete'
      );

      if (allCompleted) {
        // Remove all items that were marked for deletion
        const minIndex = Math.min(...Array.from(pendingDeletions));
        const new_chain = chain.slice(0, minIndex).concat([{model: undefined, animationState: 'idle'}]);
        setChain(new_chain);
        setPendingDeletions(new Set());
      }
    }
  };


  return (
    <div style={{ padding: '1rem 0', minHeight: '120px', display: 'flex', alignItems: 'center' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        {onDeleteChain && (
          <button
            className="chain-selector__delete-btn"
            onClick={onDeleteChain}
            style={{ marginRight: '1rem' }}
          >
            <span className="chain-selector__delete-icon">×</span>
            <span className="chain-selector__delete-text">Delete Chain</span>
          </button>
        )}

        <div style={{ fontWeight: 'bold', fontSize: '0.875rem', marginRight: '0.5rem' }}>
          INPUT
        </div>

        {chain.map((item, index) => (
          <ChainLink
            key={index}
            models={availableModels}
            selectedModel={item.model}
            onSelect={(model) => handleSelect(index, model)}
            onDelete={() => handleDelete(index)}
            animationState={item.animationState}
            onAnimationComplete={() => handleAnimationComplete(index)}
          />
        ))}

        <ArrowLine />

        <div style={{ fontWeight: 'bold', fontSize: '0.875rem', marginLeft: '0.5rem' }}>
          OUTPUT
        </div>
      </div>
    </div>
  );
}
