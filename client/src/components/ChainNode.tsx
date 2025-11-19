import { useState } from 'react';

interface Model {
  id: string;
  name: string;
}

interface ChainNodeProps {
  models: Model[];
  selectedModel?: Model;
  onSelect: (model: Model) => void;
}

export default function ChainNode({ models, selectedModel, onSelect }: ChainNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const groupIntoRows = (items: Model[]) => {
    const rows: Model[][] = [];
    for (let i = 0; i < items.length; i += 3) {
      rows.push(items.slice(i, i + 3));
    }
    return rows;
  };

  const rows = groupIntoRows(models);
  const shouldExpandOnHover = !selectedModel;
  const shouldShowExpanded = isExpanded;

  const handleMouseEnter = () => {
    if (shouldExpandOnHover) setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    if (shouldExpandOnHover) setIsExpanded(false);
  };

  const handleClick = () => {
    if (selectedModel) setIsExpanded(!isExpanded);
  };

  const handleSelectModel = (model: Model) => {
    onSelect(model);
    setIsExpanded(false);
  };

  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      onMouseEnter={() => {
        setIsHovering(true);
        handleMouseEnter();
      }}
      onMouseLeave={() => {
        setIsHovering(false);
        handleMouseLeave();
      }}
      onClick={handleClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '3px solid black',
        background: selectedModel && isHovering && !shouldShowExpanded ? '#f0f0f0' : 'white',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        minWidth: '80px',
        minHeight: '80px',
        width: shouldShowExpanded ? 'auto' : '80px',
        height: shouldShowExpanded ? 'auto' : '80px',
        padding: shouldShowExpanded ? '1rem' : '0',
      }}
    >
      {shouldShowExpanded ? (
        <div>
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectModel(model);
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
      ) : (
        <div
          style={{
            fontWeight: 'bold',
            fontSize: '0.75rem',
            textAlign: 'center',
            padding: '0.5rem',
          }}
        >
          {selectedModel?.name || ''}
        </div>
      )}
    </div>
  );
}
