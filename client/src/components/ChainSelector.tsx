import { useState, useEffect } from 'react';
import ChainNode from './ChainNode';

interface Model {
  id: string;
  name: string;
}

interface ChainSelectorProps {
  availableModels: Model[];
}

const AnimatedLine = ({ animate }: { animate: boolean }) => (
  <div style={{
    width: '60px',
    height: '3px',
    background: 'black',
    animation: animate ? 'expandLine 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
  }} />
);

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
  const [chain, setChain] = useState<Model[]>([]);
  const [showEmpty, setShowEmpty] = useState(true);

  useEffect(() => {
    setShowEmpty(false);
    const timer = setTimeout(() => setShowEmpty(true), 10);
    return () => clearTimeout(timer);
  }, [chain.length]);

  const handleSelect = (index: number, model: Model) => {
    const newChain = [...chain];
    newChain[index] = model;
    setChain(newChain);
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
        <div style={{ fontWeight: 'bold', fontSize: '0.875rem', alignSelf: 'center', marginRight: '0.5rem' }}>INPUT</div>

        <AnimatedLine animate={chain.length === 0} />

        {chain.map((selected, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ChainNode
              models={availableModels}
              selectedModel={selected}
              onSelect={(model) => handleSelect(index, model)}
            />
            <AnimatedLine animate={index === chain.length - 1} />
          </div>
        ))}

        {/* Empty node to add next model */}
        {showEmpty && (
          <div style={{
            animation: 'popIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}>
            <ChainNode
              models={availableModels}
              selectedModel={undefined}
              onSelect={(model) => {
                setChain([...chain, model]);
              }}
            />
          </div>
        )}

        <ArrowLine />

        <div style={{ fontWeight: 'bold', fontSize: '0.875rem', alignSelf: 'center', marginLeft: '0.5rem' }}>OUTPUT</div>
      </div>
    </div>
  );
}
