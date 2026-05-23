import type { CellStyle } from '../types';

export const defaultStyle: CellStyle = {
    bold: false,
    italic: false,
    underline: false,
    backgroundColor: '#ffffff',
    textColor: '#000000',
    horizontalAlign: 'left',
    numberFormat: 'number',
    fontSize: 14,
    fontFamily: 'Arial, sans-serif'
};

export const getCellStyle = (style?: CellStyle): React.CSSProperties => {
    const s = { ...defaultStyle, ...(style || {}) };
    
    return {
        fontWeight: s.bold ? 'bold' : 'normal',
        fontStyle: s.italic ? 'italic' : 'normal',
        textDecoration: s.underline ? 'underline' : 'none',
        backgroundColor: s.backgroundColor,
        color: s.textColor,
        textAlign: s.horizontalAlign,
        fontSize: `${s.fontSize}px`,
        fontFamily: s.fontFamily,
        padding: '4px'
    };
};

export const formatNumber = (value: number, format: string): string => {
    switch (format) {
        case 'percent':
            return `${(value * 100).toFixed(2)}%`;
        case 'currency':
            return `$${value.toFixed(2)}`;
        case 'date':
            return new Date(value).toLocaleDateString();
        default:
            return value.toString();
    }
};