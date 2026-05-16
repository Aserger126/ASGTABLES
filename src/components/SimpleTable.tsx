// SimpleTable.tsx
import React, { useState, useRef, useEffect, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent } from 'react';
import type { Cell, Selection, ColumnWidth, RowHeight, CellValue } from '../types';
import { evaluateFormula, formatValue, isNumber } from '../formulas';

interface TableProps { // пропс смешное слово
  data: Cell[][];
  rows: number;
  cols: number;
  onCellChange: (row: number, col: number, value: CellValue, formula?: string) => void;
  onAddRow: (afterRow: number) => void;
  onDeleteRow: (row: number) => void;
  onAddColumn: (afterCol: number) => void;
  onDeleteColumn: (col: number) => void;
}

interface ResizeState { // черня для изменения размера таблицы 
  type: 'col' | 'row';
  index: number;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
}

export const Table: React.FC<TableProps> = ({  //явно типизируем пропсики (смешное слово)
  data, rows, cols, onCellChange,
  onAddRow, onDeleteRow, onAddColumn, onDeleteColumn
}) => {
  const [selection, setSelection] = useState<Selection | null>(null);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [lastSelectedCell, setLastSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [columnWidths, setColumnWidths] = useState<ColumnWidth>({});
  const [rowHeights, setRowHeights] = useState<RowHeight>({});
  const [resizing, setResizing] = useState<ResizeState | null>(null);
  const [contextMenu, setContextMenu] = useState<{ row: number; col: number; x: number; y: number } | null>(null);
  
  const tableRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Фокус-покус на редактор при двойном клике
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell]);

  // Получение значения ячейки для формул
  const getCellValueForFormula = (row: number, col: number): any => {
    if (row >= 0 && row < rows && col >= 0 && col < cols && data[row]?.[col]) {
      const cell = data[row][col];
      if (cell.type === 'formula') {
        return cell.value;
      }
      return cell.value;
    }
    return null;
  };

  // Обновление всех формул при изменении данных
  const reevaluateFormulas = () => {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const cell = data[i]?.[j];
        if (cell?.type === 'formula' && cell.formula) {
          const result = evaluateFormula(cell.formula, getCellValueForFormula);
          if (result !== cell.value) {
            onCellChange(i, j, result, cell.formula);
          }
        }
      }
    }
  };

  // Выделение диапазона
  const handleCellClick = (row: number, col: number, e: ReactMouseEvent) => {
    e.stopPropagation();
    
    // Обработка с зажатым Shift
    if (e.shiftKey && lastSelectedCell) {
      // Расширяем выделение от lastSelectedCell до текущей ячейки
      setSelection({
        startRow: lastSelectedCell.row,
        startCol: lastSelectedCell.col,
        endRow: row,
        endCol: col
      });
    } 
    // Обработка с зажатым Ctrl (для множественного выбора, опционально)
    else if (e.ctrlKey) {
      // Можно добавить множественный выбор позже
      setSelection({
        startRow: row,
        startCol: col,
        endRow: row,
        endCol: col
      });
      setLastSelectedCell({ row, col });
    }
    // Обычный клик без модификаторов
    else {
      setSelection({
        startRow: row,
        startCol: col,
        endRow: row,
        endCol: col
      });
      setLastSelectedCell({ row, col });
    }
  };

  // Двойной клик для редактирования
  const handleDoubleClick = (row: number, col: number) => {
    const cell = data[row][col];
    let valueToEdit = '';
    if (cell?.type === 'formula' && cell.formula) {
      valueToEdit = cell.formula;
    } else {
      valueToEdit = formatValue(cell?.value ?? '');
    }
    setEditValue(valueToEdit);
    setEditingCell({ row, col });
  };

  // Обработка редактирования
  const handleEditAccept = () => {
    if (!editingCell) return;
    
    const { row, col } = editingCell;
    let newValue: CellValue = editValue;
    let cellType: 'string' | 'number' | 'boolean' | 'formula' = 'string';
    let formula: string | undefined = undefined;
    
    if (editValue.startsWith('=')) {
      // Это типа формула
      cellType = 'formula';
      formula = editValue;
      const computedValue = evaluateFormula(editValue, getCellValueForFormula);
      newValue = computedValue;
    } else if (editValue.toLowerCase() === 'true') {
      cellType = 'boolean';
      newValue = true;
    } else if (editValue.toLowerCase() === 'false') {
      cellType = 'boolean';
      newValue = false;
    } else if (!isNaN(Number(editValue)) && editValue.trim() !== '') {
      cellType = 'number';
      newValue = Number(editValue);
    } else {
      cellType = 'string';
      newValue = editValue;
    }
    
    onCellChange(row, col, newValue, formula);
    setEditingCell(null);
    reevaluateFormulas();
  };

  const handleKeyDown = (e: ReactKeyboardEvent) => {
    if (editingCell) {
      if (e.key === 'Enter') {
        handleEditAccept();
      } else if (e.key === 'Escape') {
        setEditingCell(null);
      }
    } else if (selection) {
      // Навигация клавишами
      const { endRow, endCol } = selection;
      if (e.key === 'ArrowUp' && endRow > 0) {
        setSelection({ ...selection, startRow: endRow - 1, endRow: endRow - 1 });
      } else if (e.key === 'ArrowDown' && endRow < rows - 1) {
        setSelection({ ...selection, startRow: endRow + 1, endRow: endRow + 1 });
      } else if (e.key === 'ArrowLeft' && endCol > 0) {
        setSelection({ ...selection, startCol: endCol - 1, endCol: endCol - 1 });
      } else if (e.key === 'ArrowRight' && endCol < cols - 1) {
        setSelection({ ...selection, startCol: endCol + 1, endCol: endCol + 1 });
      }
    }
  };

  // Изменение ширины колонки
  const startResizeCol = (colIndex: number, e: ReactMouseEvent) => {
    e.preventDefault();
    setResizing({
      type: 'col',
      index: colIndex,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: columnWidths[colIndex] || 100,
      startHeight: 0
    });
  };

  // Изменение высоты строки
  const startResizeRow = (rowIndex: number, e: ReactMouseEvent) => {
    e.preventDefault();
    setResizing({
      type: 'row',
      index: rowIndex,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: 0,
      startHeight: rowHeights[rowIndex] || 30
    });
  };

  // Обработка ресайза
  useEffect(() => {
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      if (!resizing) return;
      
      if (resizing.type === 'col') {
        const newWidth = resizing.startWidth + (e.clientX - resizing.startX);
        if (newWidth > 40) {
          setColumnWidths({ ...columnWidths, [resizing.index]: newWidth });
        }
      } else if (resizing.type === 'row') {
        const newHeight = resizing.startHeight + (e.clientY - resizing.startY);
        if (newHeight > 20) {
          setRowHeights({ ...rowHeights, [resizing.index]: newHeight });
        }
      }
    };
    
    const handleMouseUp = () => {
      setResizing(null);
    };
    
    if (resizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, columnWidths, rowHeights]);

  // Контекстное меню
  const handleContextMenu = (row: number, col: number, e: ReactMouseEvent) => {
    e.preventDefault();
    setContextMenu({ row, col, x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => setContextMenu(null);

  const handleAddRow = () => {
    if (contextMenu) {
      onAddRow(contextMenu.row);
      closeContextMenu();
    }
  };

  const handleDeleteRow = () => {
    if (contextMenu) {
      onDeleteRow(contextMenu.row);
      closeContextMenu();
    }
  };

  const handleAddColumn = () => {
    if (contextMenu) {
      onAddColumn(contextMenu.col);
      closeContextMenu();
    }
  };

  const handleDeleteColumn = () => {
    if (contextMenu) {
      onDeleteColumn(contextMenu.col);
      closeContextMenu();
    }
  };
  const closeContext = () => {
    if (contextMenu) {
      closeContextMenu();
    }
  };

  const getColumnLetter = (index: number): string => {
    let letter = '';
    let num = index + 1;
    while (num > 0) {
      num--;
      letter = String.fromCharCode(65 + (num % 26)) + letter;
      num = Math.floor(num / 26);
    }
    return letter;
  };

  const isCellInSelection = (row: number, col: number): boolean => {
    if (!selection) return false;
    const minRow = Math.min(selection.startRow, selection.endRow);
    const maxRow = Math.max(selection.startRow, selection.endRow);
    const minCol = Math.min(selection.startCol, selection.endCol);
    const maxCol = Math.max(selection.startCol, selection.endCol);
    return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
  };

  return (
    <div 
      ref={tableRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{ overflowX: 'auto', maxHeight: '80vh', outline: 'none' }}
      onClick={closeContextMenu}
    >
      <table style={{ borderCollapse: 'collapse', width: 'max-content' }}>
        <thead>
          <tr>
            <th style={{ 
              border: '1px solid #ccc', 
              padding: '8px', 
              background: '#f0f0f0',
              width: '40px'
            }}></th>
            {Array.from({ length: cols }).map((_, colIndex) => (
              <th 
                key={colIndex} 
                style={{ 
                  border: '1px solid #ccc', 
                  padding: '8px', 
                  minWidth: `${columnWidths[colIndex] || 100}px`,
                  background: '#f0f0f0',
                  position: 'relative'
                }}
              >
                {getColumnLetter(colIndex)}
                <div
                  style={{
                    position: 'absolute',
                    right: -3,
                    top: 0,
                    width: 6,
                    height: '100%',
                    cursor: 'col-resize',
                    zIndex: 10
                  }}
                  onMouseDown={(e) => startResizeCol(colIndex, e)}
                />
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              <td style={{ 
                border: '1px solid #ccc', 
                padding: '8px', 
                background: '#f0f0f0', 
                textAlign: 'center',
                position: 'relative',
                height: `${rowHeights[rowIndex] || 30}px`
              }}>
                {rowIndex + 1}
                <div
                  style={{
                    position: 'absolute',
                    bottom: -3,
                    left: 0,
                    width: '100%',
                    height: 6,
                    cursor: 'row-resize',
                    zIndex: 10
                  }}
                  onMouseDown={(e) => startResizeRow(rowIndex, e)}
                />
              </td>
              
              {Array.from({ length: cols }).map((_, colIndex) => {
                const cell = data[rowIndex]?.[colIndex];
                const displayValue = cell?.displayValue || formatValue(cell?.value);
                const isEditing = editingCell?.row === rowIndex && editingCell?.col === colIndex;
                const isSelected = isCellInSelection(rowIndex, colIndex);
                
                return (
                  <td
                    key={colIndex} 
                    style={{ 
                      border: '1px solid #ccc', 
                      padding: '4px',
                      backgroundColor: isSelected ? '#95aec0' : 'white',
                      height: `${rowHeights[rowIndex] || 30}px`
                    }}
                    onClick={(e) => handleCellClick(rowIndex, colIndex, e)}
                    onDoubleClick={() => handleDoubleClick(rowIndex, colIndex)}
                    onContextMenu={(e) => handleContextMenu(rowIndex, colIndex, e)}
                  >
                    {isEditing ? (
                      <input
                        ref={inputRef}
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleEditAccept}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleEditAccept();
                          if (e.key === 'Escape') setEditingCell(null);
                        }}
                        style={{ 
                          width: '90%', 
                          border: 'none', 
                          outline: '1px solid #000000',
                          padding: '4px',
                          fontSize: '14px'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        minHeight: '24px',
                        textAlign: cell?.type === 'number' ? 'right' : 'left',
                        fontWeight: cell?.type === 'formula' ? 'bold' : 'normal',
                        color: cell?.type === 'formula' ? '#1565c0' : 'inherit'
                      }}>
                        {displayValue}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Контекстное меню */}
      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            zIndex: 1000
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #55e613' }} onClick={handleAddRow}>
            Добавить строку
          </div>
          <div style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eb2525' }} onClick={handleDeleteRow}>
            Удалить строку
          </div>
          <div style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #55e613' }} onClick={handleAddColumn}>
            Добавить столбец
          </div>
          <div style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eb2525'}} onClick={handleDeleteColumn}>
            Удалить столбец
          </div>
          <div style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #7a7a7a' }} onClick={closeContext }>
            Закрыть меню
          </div>
        </div>
      )}
    </div>
  );
};