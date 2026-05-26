// components/ThemeToolbar.tsx
import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setGlobalTheme, setGlobalFont, setGlobalFontSize } from '../store/slices/uiSlice';

interface ThemeColors {
    background: string;
    headerBackground: string;
    cellBackground: string;
    cellTextColor: string;
    borderColor: string;
    selectedCellColor: string;
}

const lightTheme: ThemeColors = {
    background: '#f5f5f5',
    headerBackground: '#f0f0f0',
    cellBackground: '#ffffff',
    cellTextColor: '#000000',
    borderColor: '#ccc',
    selectedCellColor: '#e3f2fd'
};

const darkTheme: ThemeColors = {
    background: '#1e1e1e',
    headerBackground: '#2d2d2d',
    cellBackground: '#252526',
    cellTextColor: '#d4d4d4',
    borderColor: '#3e3e42',
    selectedCellColor: '#264f78'
};

const fonts = [
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Times New Roman', value: 'Times New Roman, serif' },
    { name: 'Courier New', value: 'Courier New, monospace' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Verdana', value: 'Verdana, sans-serif' },
    { name: 'Roboto', value: 'Roboto, sans-serif' },
    { name: 'Open Sans', value: 'Open Sans, sans-serif' },
    { name: 'Segoe UI', value: 'Segoe UI, sans-serif' }
];

const fontSizes = [10, 11, 12, 13, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72];

export const ThemeToolbar: React.FC = () => {
    const dispatch = useAppDispatch();
    const { globalTheme, globalFont, globalFontSize } = useAppSelector(state => state.ui);
    const [isDark, setIsDark] = useState(false);

    // ПРИМЕНЕНИЕ ТЕМЫ
    const applyTheme = (theme: ThemeColors) => {
        const root = document.documentElement;
        root.style.setProperty('--bg-color', theme.background);
        root.style.setProperty('--header-bg', theme.headerBackground);
        root.style.setProperty('--cell-bg', theme.cellBackground);
        root.style.setProperty('--cell-text', theme.cellTextColor);
        root.style.setProperty('--border-color', theme.borderColor);
        root.style.setProperty('--selected-bg', theme.selectedCellColor);
    };

    const toggleTheme = () => {
        const newIsDark = !isDark;
        setIsDark(newIsDark);
        applyTheme(newIsDark ? darkTheme : lightTheme);
        dispatch(setGlobalTheme(newIsDark ? 'dark' : 'light'));
    };

    const handleFontChange = (font: string) => {
        dispatch(setGlobalFont(font));
        document.documentElement.style.setProperty('--global-font', font);
    };

    const handleFontSizeChange = (size: number) => {
        dispatch(setGlobalFontSize(size));
        document.documentElement.style.setProperty('--global-font-size', `${size}px`);
    };

    // ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ
    useEffect(() => {
        if (globalTheme === 'dark') {
            setIsDark(true);
            applyTheme(darkTheme);
        } else {
            applyTheme(lightTheme);
        }
        
        if (globalFont) {
            document.documentElement.style.setProperty('--global-font', globalFont);
        }
        if (globalFontSize) {
            document.documentElement.style.setProperty('--global-font-size', `${globalFontSize}px`);
        }
    }, []);

    return (
        <div style={toolbarStyle}>
            <div style={groupStyle}>
                <span style={labelStyle}>🎨 Тема:</span>
                <button
                    onClick={toggleTheme}
                    style={themeButtonStyle}
                    title={isDark ? 'Светлая тема' : 'Тёмная тема'}
                >
                    {isDark ? '☀️ Светлая' : '🌙 Тёмная'}
                </button>
            </div>

            <div style={groupStyle}>
                <span style={labelStyle}>🔤 Шрифт:</span>
                <select
                    value={globalFont || 'Arial, sans-serif'}
                    onChange={(e) => handleFontChange(e.target.value)}
                    style={selectStyle}
                >
                    {fonts.map(font => (
                        <option key={font.value} value={font.value}>
                            {font.name}
                        </option>
                    ))}
                </select>
            </div>

            <div style={groupStyle}>
                <span style={labelStyle}>📏 Размер:</span>
                <select
                    value={globalFontSize || 14}
                    onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                    style={selectSmallStyle}
                >
                    {fontSizes.map(size => (
                        <option key={size} value={size}>
                            {size}px
                        </option>
                    ))}
                </select>
            </div>

            <div style={groupStyle}>
                <button
                    onClick={() => {
                        handleFontChange('Arial, sans-serif');
                        handleFontSizeChange(14);
                        if (isDark) toggleTheme();
                    }}
                    style={resetButtonStyle}
                >
                    🔄 Сбросить
                </button>
            </div>
        </div>
    );
};

// СТИЛИ
const toolbarStyle: React.CSSProperties = {
    padding: '8px 12px',
    backgroundColor: '#f9f9f9',
    borderBottom: '1px solid #e0e0e0',
    borderLeft: '1px solid #e0e0e0',
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    alignItems: 'center'
};

const groupStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    padding: '0 8px',
    borderRight: '1px solid #e0e0e0'
};

const labelStyle: React.CSSProperties = {
    fontSize: '13px',
    color: '#666',
    fontWeight: '500'
};

const themeButtonStyle: React.CSSProperties = {
    padding: '6px 12px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500'
};

const selectStyle: React.CSSProperties = {
    padding: '6px 10px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
    minWidth: '130px'
};

const selectSmallStyle: React.CSSProperties = {
    padding: '6px 8px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
    width: '70px'
};

const resetButtonStyle: React.CSSProperties = {
    padding: '6px 12px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ccc',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px'
};