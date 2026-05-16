import React from 'react';
import type { Cell } from '../types.ts';

interface FormulaBarProps {
  activeCell: { row: number; col: number } | null;
  cellValue: string; // 
  onFormulaChange: (value: string) => void;
  onAccept: () => void;
}

export const FormulaBar: React.FC<FormulaBarProps> = ({ 
  activeCell, 
  cellValue, 
  onFormulaChange, 
  onAccept 
}) => {
  const getCellAddress = () => {
    if (!activeCell) return '';
    const colLetter = String.fromCharCode(65 + activeCell.col);
    return `${colLetter}${activeCell.row + 1}`;
  };

  return (
    <div style={{
      padding: '8px',
      borderBottom: '1px solid #ccc',
      borderRadius:'10px',
      backgroundColor: '#6d6d6d',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }}>
      <div style={{
        width: '80px',
        fontWeight: 'bold',
        textAlign: 'center',
        padding: '4px',
        backgroundColor: '#ffffff',
        border: '1px solid #000000',
        borderRadius: '3px'
      }}>
        {getCellAddress() || '—'}
      </div>
      <div style={{ flex: 1 }}>
        <input
          type="text"
          value={cellValue}
          onChange={(e) => onFormulaChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onAccept();
            }
          }}
          style={{
            width: '100%',
            padding: '6px',
            fontSize: '14px',
            border: '1px solid #ccc',
            borderRadius: '3px',
            outline: 'none'
          }}
          placeholder="Введите значение или формулу (начинающуюся с =)..."
        />
      </div>
      <button
        onClick={onAccept}
        style={{
          padding: '6px 12px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '3px',
          cursor: 'pointer'
        }}
      >
        ✓
      </button>
    </div>
  );
};