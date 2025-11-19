import { useState } from 'react';
import ChainNode from './ChainNode';

interface Model {
  id: string;
  name: string;
  logo?: string;
}

interface ChainSelectorProps {
  chainLength?: number;
  availableModels: Model[];
}

export default function ChainSelector({ chainLength = 3, availableModels }: ChainSelectorProps) {
  const [selectedModels, setSelectedModels] = useState<(Model | undefined)[]>(
    Array(chainLength).fill(undefined)
  );

  const handleSelect = (position: number, model: Model) => {
    const newSelected = [...selectedModels];
    newSelected[position] = model;
    setSelectedModels(newSelected);
  };

  return (
    <div style={{ padding: '2rem 0' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0',
        }}
      >
        {selectedModels.map((selected, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
            <ChainNode
              models={availableModels}
              selectedModel={selected}
              onSelect={(model) => handleSelect(index, model)}
              position={index + 1}
            />
            {index < selectedModels.length - 1 && (
              <div
                style={{
                  width: '60px',
                  height: '3px',
                  background: 'black',
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
