import { useState, useEffect, useRef } from 'react';
import ChainLink from './ChainLink';
import AnimatedChainIndex from './AnimatedChainIndex';
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

    const hasCompatibleModels = availableModels.some(m => m.inputType === model.outputType);

    // Handle trailing node logic
    if (index === chain.length - 1) {
      // Selecting on the last node
      if (hasCompatibleModels) {
        new_chain.push({model: null, animationState: 'add'});
      }
    } else if (index === chain.length - 2) {
      // Selecting on second-to-last node with a trailing empty node
      const hasTrailingEmpty = !chain[chain.length - 1].model;
      if (hasTrailingEmpty) {
        if (!hasCompatibleModels) {
          // Remove trailing empty node with animation
          new_chain[chain.length - 1] = {...new_chain[chain.length - 1], animationState: 'delete'};
          setPendingDeletions(new Set([chain.length - 1]));
        }
      }
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
    // Set all nodes from index onwards to delete state (except trailing empty "add" node)
    const indicesToDelete = new Set<number>();
    for (let i = index; i < chain.length; i++) {
      // Skip the last node if it's an empty "add" node
      if (i === chain.length - 1 && !chain[i].model) {
        continue;
      }
      indicesToDelete.add(i);
    }
    setPendingDeletions(indicesToDelete);

    setChain(prev => prev.map((item, i) => {
      // Skip the last node if it's an empty "add" node
      if (i === chain.length - 1 && !chain[i].model) {
        return item;
      }
      return i >= index ? { ...item, animationState: 'delete' } : item;
    }));
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
        const new_chain = chain.slice(0, minIndex);

        // Check if there's already a trailing empty node (not deleted)
        const hasTrailingEmptyNode = chain.length > minIndex && !chain[chain.length - 1].model;

        if (hasTrailingEmptyNode) {
          if (minIndex !== chain.length - 1) {
            // Keep the existing trailing empty node only if we didn't specifically delete it
            new_chain.push({model: null, animationState: 'idle'});
          }
        } else {
          // Add new trailing "add" node
          new_chain.push({model: null, animationState: 'add'});
        }

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

  // Filter available models based on previous node's output type and next node's input type
  const getFilteredModelsForIndex = (index: number): Model[] => {
    let filtered = availableModels;

    // Filter by previous node's output type
    if (index > 0) {
      const prevModel = chain[index - 1]?.model;
      if (!prevModel) return []; // No previous model selected yet
      filtered = filtered.filter(m => m.inputType === prevModel.outputType);
    }

    // Filter by next node's input type (if next node has a model selected)
    const nextModel = chain[index + 1]?.model;
    if (nextModel) {
      filtered = filtered.filter(m => m.outputType === nextModel.inputType);
    }

    return filtered;
  };

  // Get chain's overall input and output types
  const chainInputType = chain[0]?.model?.inputType;
  const chainOutputType = (() => {
    // Find the last selected model (excluding the trailing empty node)
    for (let i = chain.length - 1; i >= 0; i--) {
      const model = chain[i]?.model;
      if (model) return model.outputType;
    }
    return null;
  })();

  // Helper to capitalize media type
  const formatMediaType = (type: string | null | undefined) => {
    if (!type) return null;
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div style={{
      minHeight: '120px',
      display: 'grid',
      gridTemplateColumns: '1fr auto 1fr',
      alignItems: 'center',
      width: '100%',
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
          <AnimatedChainIndex index={chainIndex} />
        )}

        <div style={{ fontWeight: 'bold', fontSize: '0.875rem', marginRight: '4px' }}>
          Input{chainInputType ? ` (${formatMediaType(chainInputType)})` : ''}
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
            models={getFilteredModelsForIndex(index)}
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
          Output{chainOutputType ? ` (${formatMediaType(chainOutputType)})` : ''}
        </div>
      </div>
    </div>
  );
}
