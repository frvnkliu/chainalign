import { useState } from 'react';

interface Model {
  id: string;
  name: string;
  logo?: string;
}

interface ChainNodeProps {
  models: Model[];
  selectedModel?: Model;
  onSelect: (model: Model) => void;
  position: number;
}

export default function ChainNode({ models, selectedModel, onSelect, position }: ChainNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const groupIntoRows = (items: Model[]) => {
    const rows: Model[][] = [];
    for (let i = 0; i < items.length; i += 3) {
      rows.push(items.slice(i, i + 3));
    }
    return rows;
  };

  const rows = groupIntoRows(models);

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
      }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Main square */}
      <div
        style={{
          width: '80px',
          height: '80px',
          border: '3px solid black',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '0.75rem',
          textAlign: 'center',
          padding: '0.5rem',
        }}
      >
        {selectedModel ? selectedModel.name : `NODE ${position}`}
      </div>

      {/* Expanded options */}
      <div
        style={{
          position: 'absolute',
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: '0.5rem',
          background: 'white',
          border: isExpanded ? '3px solid black' : '3px solid transparent',
          padding: isExpanded ? '1rem' : '0',
          maxHeight: isExpanded ? '500px' : '0',
          opacity: isExpanded ? 1 : 0,
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 10,
          minWidth: '200px',
        }}
      >
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.75rem',
              marginBottom: rowIndex < rows.length - 1 ? '0.75rem' : '0',
            }}
          >
            {row.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  onSelect(model);
                  setIsExpanded(false);
                }}
                style={{
                  width: '60px',
                  height: '60px',
                  border: '2px solid black',
                  background: selectedModel?.id === model.id ? 'black' : 'white',
                  color: selectedModel?.id === model.id ? 'white' : 'black',
                  cursor: 'pointer',
                  fontSize: '0.65rem',
                  fontWeight: 'bold',
                  padding: '0.25rem',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (selectedModel?.id !== model.id) {
                    e.currentTarget.style.background = 'black';
                    e.currentTarget.style.color = 'white';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedModel?.id !== model.id) {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.color = 'black';
                  }
                }}
              >
                {model.name}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
