import { useState, useEffect, useRef } from 'react';
import { Model } from '../types/chain';

interface ChainNodeProps {
  models: Model[];
  selectedModel: Model | null;
  onSelect: (model: Model) => void;
  onDelete?: () => void;
}

export default function ChainNode({ models, selectedModel, onSelect, onDelete }: ChainNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const allowHoverExpansionRef = useRef(true);
  const ITEMS_PER_PAGE = 9;

  // Temporarily disable hover expansion on mount (in case element appeared under cursor via scroll)
  useEffect(() => {
    allowHoverExpansionRef.current = false;
    const timer = setTimeout(() => {
      allowHoverExpansionRef.current = true;
    }, 500); // Wait 500ms after mount before allowing hover expansion

    return () => clearTimeout(timer);
  }, []);

  // Reset to page 0 when expanded state changes
  useEffect(() => {
    if (isExpanded) {
      setCurrentPage(0);
    }
  }, [isExpanded]);

  const groupIntoRows = (items: Model[]) => {
    const rows: Model[][] = [];
    for (let i = 0; i < items.length; i += 3) {
      rows.push(items.slice(i, i + 3));
    }
    return rows;
  };

  // Paginate models
  const totalPages = Math.ceil(models.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedModels = models.slice(startIndex, endIndex);

  // Pad to 9 items to maintain 3x3 grid
  const paddedModels = [...paginatedModels];
  while (paddedModels.length < ITEMS_PER_PAGE) {
    paddedModels.push(null as any); // Add null placeholders
  }

  const rows = groupIntoRows(paddedModels);

  const shouldExpandOnHover = !selectedModel;
  const shouldShowExpanded = isExpanded;

  const goToNextPage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleMouseEnter = () => {
    console.log("Mouse entered, shouldExpandOnHover:", shouldExpandOnHover, "allowHover:", allowHoverExpansionRef.current);
    setIsHovering(true);
    if (shouldExpandOnHover && allowHoverExpansionRef.current) {
      setIsExpanded(true);
    }
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
        <>
          <div className="chain-node__grid">
            {rows.map((row, rowIndex) => (
              <div key={rowIndex} className="chain-node__row">
                {row.map((model, colIndex) => (
                  model ? (
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
                  ) : (
                    <div
                      key={`empty-${rowIndex}-${colIndex}`}
                      className="chain-node__option chain-node__option--empty"
                    />
                  )
                ))}
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="chain-node__pagination">
              <button
                className="chain-node__page-btn"
                onClick={goToPrevPage}
                disabled={currentPage === 0}
              >
                ←
              </button>
              <span className="chain-node__page-info">
                {currentPage + 1}/{totalPages}
              </span>
              <button
                className="chain-node__page-btn"
                onClick={goToNextPage}
                disabled={currentPage === totalPages - 1}
              >
                →
              </button>
            </div>
          )}
        </>
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
