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

export default function ChainSelector({ availableModels }: ChainSelectorProps) {
  const [chain, setChain] = useState<ChainItem[]>([{model: undefined, animationState: 'add'}]);
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

        <ArrowLine />

        <div style={{ fontWeight: 'bold', fontSize: '0.875rem', marginLeft: '0.5rem' }}>
          OUTPUT
        </div>
      </div>
    </div>
  );
}
