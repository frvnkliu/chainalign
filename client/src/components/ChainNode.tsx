import { useState } from 'react';

interface Model {
  id: string;
  name: string;
}

interface ChainNodeProps {
  models: Model[];
  selectedModel?: Model;
  onSelect: (model: Model) => void;
  onDelete?: () => void;
}

export default function ChainNode({ models, selectedModel, onSelect, onDelete }: ChainNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

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
    setIsHovering(true);
    if (shouldExpandOnHover) setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (shouldExpandOnHover) setIsExpanded(false);
  };

  const handleClick = () => {
    if (selectedModel) setIsExpanded(!isExpanded);
  };

  const handleSelectModel = (model: Model) => {
    onSelect(model);
    setIsExpanded(false);
    setIsHovering(false);
  };

  const nodeClasses = [
    'chain-node',
    !selectedModel && 'chain-node--empty',
    shouldShowExpanded && 'chain-node--expanded',
    selectedModel && isHovering && !shouldShowExpanded && 'chain-node--hovering'
  ].filter(Boolean).join(' ');

  return (
    <div
      className={nodeClasses}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {selectedModel && onDelete && isHovering && !shouldShowExpanded && (
        <button
          className="chain-node__delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          ×
        </button>
      )}

      {shouldShowExpanded ? (
        <div className="chain-node__grid">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="chain-node__row">
              {row.map((model) => (
                <button
                  key={model.id}
                  className={`chain-node__option ${selectedModel?.id === model.id ? 'chain-node__option--selected' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectModel(model);
                  }}
                >
                  {model.name}
                </button>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <>
          {selectedModel ? (
            <div className="chain-node__content">
              {selectedModel.name}
            </div>
          ) : (
            <div className="chain-node__empty-icon" />
          )}
        </>
      )}
    </div>
  );
}
