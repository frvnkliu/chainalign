import { useState } from 'react';
import ChainLink from './ChainLink';

interface Model {
  id: string;
  name: string;
}

interface ChainSelectorProps {
  availableModels: Model[];
}

interface ChainItem {
  model: Model;
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

export default function ChainSelector({ availableModels }: ChainSelectorProps) {
  const [chain, setChain] = useState<ChainItem[]>([]);
  const [pendingDeletions, setPendingDeletions] = useState<Set<number>>(new Set());

  const handleSelect = (index: number, model: Model) => {
    setChain(prev => prev.map((item, i) =>
      i === index ? { ...item, model, animationState: 'idle' } : item
    ));
  };

  const handleDelete = (index: number) => {
    // Set all nodes from index onwards to delete state
    const indicesToDelete = new Set<number>();
    for (let i = index; i < chain.length; i++) {
      indicesToDelete.add(i);
    }
    setPendingDeletions(indicesToDelete);

    setChain(prev => prev.map((item, i) =>
      i >= index ? { ...item, animationState: 'delete' } : item
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
        setChain(prev => prev.slice(0, minIndex));
        setPendingDeletions(new Set());
      }
    }
  };

  const handleAddModel = (model: Model) => {
    setChain(prev => [...prev, { model, animationState: 'add' }]);
  };

  const handleNewNodeAnimationComplete = () => {
    // After add animation completes, set state to idle
    setChain(prev => prev.map(item => ({ ...item, animationState: 'idle' })));
  };

  return (
    <div style={{ padding: '2rem 0', minHeight: '400px', display: 'flex', alignItems: 'center' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        }}
      >
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

        {/* Empty node to add next model */}
        <ChainLink
          models={availableModels}
          selectedModel={undefined}
          onSelect={handleAddModel}
          animationState={chain.length > 0 && chain[chain.length - 1].animationState === 'add' ? 'add' : 'idle'}
          onAnimationComplete={handleNewNodeAnimationComplete}
        />

        <ArrowLine />

        <div style={{ fontWeight: 'bold', fontSize: '0.875rem', marginLeft: '0.5rem' }}>
          OUTPUT
        </div>
      </div>
    </div>
  );
}
