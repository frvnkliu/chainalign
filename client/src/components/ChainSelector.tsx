import { useState, useEffect, useRef } from 'react';
import ChainLink from './ChainLink';
import { Model, ChainItem } from '../types/chain';

interface ChainSelectorProps {
  availableModels: Model[];
  models: Model[];
  onDeleteChain?: () => void;
  chainIndex?: number;
  onChange: (models: Model[]) => void;
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

export default function ChainSelector({ availableModels, models, onDeleteChain, chainIndex, onChange }: ChainSelectorProps) {
  const initializeChain = (): ChainItem[] => {
    if (models.length > 0) {
      return [
        ...models.map(model => ({ model, animationState: 'idle' as const })),
        { model: null, animationState: 'add' as const }
      ];
    }
    return [{ model: null, animationState: 'add' as const }];
  };

  const [chain, setChain] = useState<ChainItem[]>(initializeChain());
  const [pendingDeletions, setPendingDeletions] = useState<Set<number>>(new Set());
  const isInternalUpdateRef = useRef(false);

  // Sync with external models prop changes (only when parent updates)
  // This effect is necessary to keep child state synchronized with parent props
  useEffect(() => {
    // Skip if this update came from our own onChange call
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;
      return;
    }

    // Check if models actually changed - use functional setState to avoid chain dependency
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChain(prevChain => {
      const currentModels = prevChain
        .map(item => item.model)
        .filter((m): m is Model => m !== null);

      const modelsChanged =
        models.length !== currentModels.length ||
        models.some((m, i) => m.id !== currentModels[i]?.id);

      if (modelsChanged) {
        return [
          ...models.map(model => ({ model, animationState: 'idle' as const })),
          { model: null, animationState: 'add' as const }
        ];
      }
      return prevChain;
    });
  }, [models]);

  const handleSelect = (index: number, model: Model) => {
    const new_chain = [...chain]
    new_chain[index] = {model, animationState: 'idle'};
    if (index === chain.length - 1) {
      new_chain.push({model: null, animationState: 'add'});
    }
    setChain(new_chain);

    // Notify parent of model changes
    isInternalUpdateRef.current = true;
    const modelsList = new_chain
      .map(item => item.model)
      .filter((m): m is Model => m !== null);
    onChange(modelsList);
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
        const new_chain = chain.slice(0, minIndex).concat([{model: null, animationState: 'idle'}]);
        setChain(new_chain);
        setPendingDeletions(new Set());

        // Notify parent of model changes after deletion
        isInternalUpdateRef.current = true;
        const modelsList = new_chain
          .map(item => item.model)
          .filter((m): m is Model => m !== null);
        onChange(modelsList);
      }
    }
  };


  return (
    <div style={{
      minHeight: '120px',
      display: 'grid',
      gridTemplateColumns: '1fr auto 1fr',
      alignItems: 'center',
      width: '100%',
      padding: '1rem 0',
    }}>
      {/* Left side - delete button and INPUT */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '1rem',
      }}>
        {onDeleteChain && (
          <button
            className="chain-selector__delete-btn"
            onClick={onDeleteChain}
          >
            <span className="chain-selector__delete-icon">×</span>
            <span className="chain-selector__delete-text">Delete Chain</span>
          </button>
        )}

        {chainIndex !== undefined && (
          <div style={{ fontWeight: 'bold', fontSize: '0.875rem', marginRight: '0.5rem' }}>
            {chainIndex.toString().padStart(2, '0')}.
          </div>
        )}

        <div style={{ fontWeight: 'bold', fontSize: '0.875rem', marginRight: '4px' }}>
          INPUT
        </div>
      </div>

      {/* Center - anchor wrapper for chain + arrow */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 0 0 6px',
      }}>
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
      </div>

      {/* Right side - OUTPUT */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start'
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '0.875rem', marginLeft: '10px' }}>
          OUTPUT
        </div>
      </div>
    </div>
  );
}
