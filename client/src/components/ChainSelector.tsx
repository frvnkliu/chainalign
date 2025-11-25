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
    const hasCompatibleModels = availableModels.some(m => m.inputType === model.outputType);

    // Check if there's a next node with a model that's incompatible
    const nextNode = chain[index + 1];
    const hasIncompatibleNext = nextNode?.model && nextNode.model.inputType !== model.outputType;

    if (hasIncompatibleNext) {
      // Build new chain with updated model at index
      const new_chain = chain.map((item, i) =>
        i === index ? { model, animationState: 'idle' as const } : item
      );

      // Set up deletion animation for all nodes after current
      const indicesToDelete = new Set<number>();
      const hasTrailingEmpty = !chain[chain.length - 1]?.model;
      const shouldMorphLastNode = !hasTrailingEmpty;

      for (let i = index + 1; i < chain.length; i++) {
        if (hasTrailingEmpty && i === chain.length - 1) {
          continue;
        }
        if (shouldMorphLastNode && i === chain.length - 1) {
          continue;
        }
        indicesToDelete.add(i);
      }

      setPendingDeletions(indicesToDelete);

      const updated_chain = new_chain.map((item, i) => {
        if (hasTrailingEmpty && i === chain.length - 1) {
          return item;
        }
        if (shouldMorphLastNode && i === chain.length - 1) {
          return { ...item, animationState: 'clear' as const };
        }
        return i > index ? { ...item, animationState: 'delete' as const } : item;
      });

      setChain(updated_chain);

      // Don't notify parent yet - wait for animation to complete
      return;
    }

    // Build new chain with the selected model
    const new_chain = [...chain];
    new_chain[index] = {model, animationState: 'idle'};

    // Check if there's currently a trailing empty node
    const hasTrailingEmpty = chain.length > index + 1 && !chain[chain.length - 1]?.model;

    // Handle trailing node logic
    if (hasTrailingEmpty) {
      // There's already a trailing empty node
      if (!hasCompatibleModels) {
        // No compatible models - remove the trailing empty node with animation
        new_chain[chain.length - 1] = {...new_chain[chain.length - 1], animationState: 'delete'};
        setPendingDeletions(new Set([chain.length - 1]));
      }
      // If there are compatible models, keep the trailing empty node
    } else {
      // No trailing empty node
      if (index === chain.length - 1 && hasCompatibleModels) {
        // Selecting on the last node and there are compatible models - add trailing empty node
        new_chain.push({model: null, animationState: 'add'});
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
    const indicesToDelete = new Set<number>();
    const hasTrailingEmpty = !chain[chain.length - 1]?.model;

    // Determine if we need to morph the last selected node into an empty node
    const shouldMorphLastNode = !hasTrailingEmpty;

    for (let i = index; i < chain.length; i++) {
      // If we have a trailing empty node, skip it
      if (hasTrailingEmpty && i === chain.length - 1) {
        continue;
      }
      // If morphing, don't delete the last node - we'll clear it instead
      if (shouldMorphLastNode && i === chain.length - 1) {
        continue;
      }
      indicesToDelete.add(i);
    }

    setPendingDeletions(indicesToDelete);

    setChain(prev => prev.map((item, i) => {
      // Skip trailing empty node
      if (hasTrailingEmpty && i === chain.length - 1) {
        return item;
      }
      // Morph last node to empty instead of deleting
      if (shouldMorphLastNode && i === chain.length - 1) {
        return { ...item, animationState: 'clear' };
      }
      // Delete nodes in range
      return i >= index ? { ...item, animationState: 'delete' } : item;
    }));
  };

  const handleAnimationComplete = (index: number) => {
    // Handle 'clear' animation completion - transform to empty node
    if (chain[index]?.animationState === 'clear') {
      // Check if there are any pending deletions
      const hasPendingDeletions = pendingDeletions.size > 0;

      if (hasPendingDeletions) {
        // If there are pending deletions, wait for all to complete
        const allDeletionsCompleted = Array.from(pendingDeletions).every(i =>
          chain[i]?.animationState === 'delete'
        );

        if (allDeletionsCompleted) {
          // All delete animations done, now finalize everything
          const minIndex = Math.min(...Array.from(pendingDeletions));
          const new_chain = chain.slice(0, minIndex);
          // Add the cleared node as empty
          new_chain.push({ model: null, animationState: 'idle' });

          setChain(new_chain);
          setPendingDeletions(new Set());

          // Notify parent of model changes
          isInternalUpdateRef.current = true;
          const modelsList = new_chain
            .map(item => item.model)
            .filter((m): m is Model => m !== null);
          onChange(modelsList);
        }
      } else {
        // No pending deletions, just transform this node to empty
        setChain(prev => prev.map((item, i) =>
          i === index ? { model: null, animationState: 'idle' } : item
        ));

        // Notify parent of model changes
        isInternalUpdateRef.current = true;
        const modelsList = chain
          .slice(0, index)
          .map(item => item.model)
          .filter((m): m is Model => m !== null);
        onChange(modelsList);
      }
      return;
    }

    // Handle 'delete' animation completion
    if (pendingDeletions.has(index)) {
      const allCompleted = Array.from(pendingDeletions).every(i =>
        chain[i]?.animationState === 'delete'
      );

      // Check if there's also a 'clear' animation happening
      const lastNode = chain[chain.length - 1];
      const hasClearNode = lastNode?.animationState === 'clear';

      if (allCompleted && !hasClearNode) {
        // All deletions done and no clear animation
        const minIndex = Math.min(...Array.from(pendingDeletions));
        const new_chain = chain.slice(0, minIndex);

        // Keep trailing empty node if it exists and we are not purposely removing it
        if (!lastNode?.model && chain.length-1 > minIndex) {
          new_chain.push({ model: null, animationState: 'idle' });
        }

        setChain(new_chain);
        setPendingDeletions(new Set());

        // Notify parent of model changes
        isInternalUpdateRef.current = true;
        const modelsList = new_chain
          .map(item => item.model)
          .filter((m): m is Model => m !== null);
        onChange(modelsList);
      }
      // If hasClearNode, wait for clear animation to complete
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

        <div style={{
          fontWeight: 'bold',
          fontSize: '0.875rem',
          marginRight: '4px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <div>Input</div>
          {chainInputType && (
            <div style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>
              ({formatMediaType(chainInputType)})
            </div>
          )}
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
        <div style={{
          fontWeight: 'bold',
          fontSize: '0.875rem',
          marginLeft: '10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <div>Output</div>
          {chainOutputType && (
            <div style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>
              ({formatMediaType(chainOutputType)})
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
