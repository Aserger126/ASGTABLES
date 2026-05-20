// utils/csvUtils.ts
import type { Cell, CellValue } from '../types';
import { formatValue } from '../formulas';

// ОПРЕДЕЛЯЕМ РАЗДЕЛИТЕЛЬ CSV
export const detectDelimiter = (firstLine: string): string => {
    const delimiters = [',', ';', '\t', '|'];
    for (const delimiter of delimiters) {
        if (firstLine.includes(delimiter)) {
            return delimiter;
        }
    }
    return ','; // по умолчанию запятая
};

// ПАРСИМ CSV СТРОКУ С УЧЁТОМ КАВЫЧЕК
export const parseCSVLine = (line: string, delimiter: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    
    // Убираем кавычки вокруг значений
    return result.map(cell => {
        if (cell.startsWith('"') && cell.endsWith('"')) {
            return cell.slice(1, -1).replace(/""/g, '"');
        }
        return cell;
    });
};

// КОНВЕРТИРУЕМ CSV В МАССИВ ДАННЫХ
export const csvToData = (
    csvContent: string, 
    delimiter: string = ',',
    hasHeader: boolean = true
): { headers: string[]; data: Cell[][] } => {
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim());
    if (lines.length === 0) {
        return { headers: [], data: [] };
    }
    
    const parsedLines = lines.map(line => parseCSVLine(line, delimiter));
    
    let headers: string[] = [];
    let startIndex = 0;
    
    if (hasHeader && parsedLines.length > 0) {
        headers = parsedLines[0];
        startIndex = 1;
    } else {
        // СОЗДАЁМ ЗАГОЛОВКИ ПО УМОЛЧАНИЮ
        const maxCols = Math.max(...parsedLines.map(line => line.length));
        headers = Array.from({ length: maxCols }, (_, i) => `Колонка ${String.fromCharCode(65 + i)}`);
    }
    
    // КОНВЕРТИРУЕМ В НАШ ФОРМАТ Cell[][]
    const data: Cell[][] = [];
    for (let i = startIndex; i < parsedLines.length; i++) {
        const row: Cell[] = [];
        for (let j = 0; j < headers.length; j++) {
            const rawValue = parsedLines[i]?.[j] || '';
            let value: CellValue = rawValue;
            let type: 'string' | 'number' | 'boolean' = 'string';
            
            if (rawValue.toLowerCase() === 'true') {
                value = true;
                type = 'boolean';
            } else if (rawValue.toLowerCase() === 'false') {
                value = false;
                type = 'boolean';
            } else if (!isNaN(Number(rawValue)) && rawValue !== '') {
                value = Number(rawValue);
                type = 'number';
            } else {
                value = rawValue;
                type = 'string';
            }
            
            row.push({
                value,
                displayValue: formatValue(value),
                type
            });
        }
        data.push(row);
    }
    
    return { headers, data };
};

// КОНВЕРТИРУЕМ ДАННЫЕ В CSV СТРОКУ
export const dataToCSV = (data: Cell[][], delimiter: string = ','): string => {
    return data.map(row => 
        row.map(cell => {
            const value = formatValue(cell.value);
            if (value.includes(delimiter) || value.includes('"') || value.includes('\n')) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        }).join(delimiter)
    ).join('\n');
};