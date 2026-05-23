// components/FormattingToolbar.tsx
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { applyStyleToSelection } from '../store/slices/spreadsheetSlice';
import type { CellStyle } from '../types';

export const FormattingToolbar: React.FC = () => {
    const dispatch = useAppDispatch();
    const { selection } = useAppSelector(state => state.spreadsheet);
    const [selectedColor, setSelectedColor] = useState('#ffffff');
    const [selectedTextColor, setSelectedTextColor] = useState('#000000');

    const applyStyle = (style: Partial<CellStyle>) => {
        if (selection) {
            dispatch(applyStyleToSelection({ selection, style }));
        }
    };

    return (
        <div style={toolbarStyle}>
            <div style={groupStyle}>
                <button onClick={() => applyStyle({ bold: true })} style={buttonStyle} title="Жирный (Ctrl+B)">
                    <strong>B</strong>
                </button>
                <button onClick={() => applyStyle({ italic: true })} style={buttonStyle} title="Курсив (Ctrl+I)">
                    <em>I</em>
                </button>
                <button onClick={() => applyStyle({ underline: true })} style={buttonStyle} title="Подчёркивание (Ctrl+U)">
                    <u>U</u>
                </button>
            </div>

            <div style={groupStyle}>
                <button onClick={() => applyStyle({ horizontalAlign: 'left' })} style={buttonStyle}>⬅️</button>
                <button onClick={() => applyStyle({ horizontalAlign: 'center' })} style={buttonStyle}>⬌</button>
                <button onClick={() => applyStyle({ horizontalAlign: 'right' })} style={buttonStyle}>➡️</button>
            </div>

            <div style={groupStyle}>
                <span style={labelStyle}>🎨 Фон:</span>
                <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => {
                        setSelectedColor(e.target.value);
                        applyStyle({ backgroundColor: e.target.value });
                    }}
                    style={colorPickerStyle}
                />
            </div>

            <div style={groupStyle}>
                <span style={labelStyle}>✏️ Текст:</span>
                <input
                    type="color"
                    value={selectedTextColor}
                    onChange={(e) => {
                        setSelectedTextColor(e.target.value);
                        applyStyle({ textColor: e.target.value });
                    }}
                    style={colorPickerStyle}
                />
            </div>

            <div style={groupStyle}>
                <select 
                    onChange={(e) => applyStyle({ numberFormat: e.target.value as CellStyle['numberFormat'] })}
                    style={selectStyle}
                >
                    <option value="number">1234 (Число)</option>
                    <option value="percent">% (Процент)</option>
                    <option value="currency">$ (Валюта)</option>
                    <option value="date">📅 (Дата)</option>
                </select>
            </div>
        </div>
    );
};

const toolbarStyle: React.CSSProperties = {
    padding: '8px 12px',
    backgroundColor: '#f9f9f9',
    borderBottom: '1px solid #e0e0e0',
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    alignItems: 'center'
};

const groupStyle: React.CSSProperties = {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
    padding: '0 8px',
    borderRight: '1px solid #e0e0e0'
};

const buttonStyle: React.CSSProperties = {
    width: '32px',
    height: '32px',
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};

const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#666',
    marginRight: '4px'
};

const colorPickerStyle: React.CSSProperties = {
    width: '32px',
    height: '32px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer'
};

const selectStyle: React.CSSProperties = {
    padding: '6px 10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer'
};