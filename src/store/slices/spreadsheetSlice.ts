// store/slices/spreadsheetSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Cell, CellValue, CellStyle, Selection, ColumnWidth, RowHeight } from '../../types';
import { formatValue, evaluateFormula } from '../../formulas';
import { defaultStyle } from '../../components/CellStyles';

// СОСТОЯНИЕ СЛАЙСА
interface SpreadsheetState {
    data: Cell[][];
    rows: number;
    cols: number;
    selection: Selection | null;
    lastSelectedCell: { row: number; col: number } | null;
    editingCell: { row: number; col: number } | null;
    editValue: string;
    columnWidths: ColumnWidth;
    rowHeights: RowHeight;
    cellStyles: CellStyle[][];
    history: {
        past: Cell[][][];
        future: Cell[][][];
    };
}

// НАЧАЛЬНОЕ СОСТОЯНИЕ
const initialState: SpreadsheetState = {
    data: [],
    rows: 50,
    cols: 26,
    selection: null,
    lastSelectedCell: null,
    editingCell: null,
    editValue: '',
    columnWidths: {},
    rowHeights: {},
    cellStyles: [],
    history: {
        past: [],
        future: []
    }
};

// ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ ПОЛУЧЕНИЯ ЗНАЧЕНИЯ ЯЧЕЙКИ
const getCellValueForFormula = (data: Cell[][], row: number, col: number): any => {
    if (row >= 0 && row < data.length && col >= 0 && col < data[0]?.length && data[row]?.[col]) {
        const cell = data[row][col];
        if (cell.type === 'formula') {
            return cell.value;
        }
        return cell.value;
    }
    return null;
};

// ПЕРЕСЧЁТ ВСЕХ ФОРМУЛ
const reevaluateAllFormulas = (data: Cell[][]): Cell[][] => {
    const newData = JSON.parse(JSON.stringify(data));
    for (let i = 0; i < newData.length; i++) {
        for (let j = 0; j < newData[i].length; j++) {
            const cell = newData[i][j];
            if (cell?.type === 'formula' && cell.formula) {
                const result = evaluateFormula(cell.formula, (row, col) => 
                    getCellValueForFormula(newData, row, col)
                );
                if (result !== cell.value) {
                    cell.value = result;
                    cell.displayValue = formatValue(result);
                }
            }
        }
    }
    return newData;
};

export const spreadsheetSlice = createSlice({
    name: 'spreadsheet',
    initialState,
    reducers: {
        // ИНИЦИАЛИЗАЦИЯ ТАБЛИЦЫ
        initSheet: (state, action: PayloadAction<{ data: Cell[][]; rows: number; cols: number }>) => {
            state.data = action.payload.data;
            state.rows = action.payload.rows;
            state.cols = action.payload.cols;
            state.cellStyles = Array(state.rows).fill(null).map(() => 
                Array(state.cols).fill(null).map(() => ({ ...defaultStyle }))
            );
            state.history.past = [];
            state.history.future = [];
        },

        // ИЗМЕНЕНИЕ ЯЧЕЙКИ
        updateCell: (state, action: PayloadAction<{
            row: number;
            col: number;
            value: CellValue;
            formula?: string;
        }>) => {
            const { row, col, value, formula } = action.payload;
            
            // СОХРАНЯЕМ ТЕКУЩЕЕ СОСТОЯНИЕ В ИСТОРИЮ
            state.history.past.push(JSON.parse(JSON.stringify(state.data)));
            state.history.future = [];
            
            // ОГРАНИЧИВАЕМ ИСТОРИЮ 50 ДЕЙСТВИЯМИ
            if (state.history.past.length > 50) {
                state.history.past.shift();
            }
            
            // ОБНОВЛЯЕМ ЯЧЕЙКУ
            if (!state.data[row]) {
                state.data[row] = [];
            }
            
            let displayValue = formatValue(value);
            let type: 'string' | 'number' | 'boolean' | 'formula' = 'string';
            
            if (formula) {
                type = 'formula';
            } else if (typeof value === 'number') {
                type = 'number';
            } else if (typeof value === 'boolean') {
                type = 'boolean';
            } else {
                type = 'string';
            }
            
            state.data[row][col] = {
                value,
                displayValue,
                type,
                formula,
                style: state.cellStyles[row]?.[col] || { ...defaultStyle }
            };
            
            // ПЕРЕСЧИТЫВАЕМ ФОРМУЛЫ
            state.data = reevaluateAllFormulas(state.data);
        },

        // УСТАНОВИТЬ ВЫДЕЛЕНИЕ
        setSelection: (state, action: PayloadAction<Selection | null>) => {
            state.selection = action.payload;
        },

        // УСТАНОВИТЬ ПОСЛЕДНЮЮ ВЫБРАННУЮ ЯЧЕЙКУ
        setLastSelectedCell: (state, action: PayloadAction<{ row: number; col: number } | null>) => {
            state.lastSelectedCell = action.payload;
        },

        // ДОБАВЛЕНИЕ/УДАЛЕНИЕ СТРОК
        addRow: (state, action: PayloadAction<{ afterRow: number }>) => {
            state.history.past.push(JSON.parse(JSON.stringify(state.data)));
            const newRow: Cell[] = Array(state.cols).fill(null).map(() => ({
                value: '',
                displayValue: '',
                type: 'string'
            }));
            const newStyleRow: CellStyle[] = Array(state.cols).fill(null).map(() => ({ ...defaultStyle }));
            state.data.splice(action.payload.afterRow + 1, 0, newRow);
            state.cellStyles.splice(action.payload.afterRow + 1, 0, newStyleRow);
            state.rows++;
            state.data = reevaluateAllFormulas(state.data);
        },
        
        deleteRow: (state, action: PayloadAction<{ row: number }>) => {
            if (state.data.length <= 1) return;
            state.history.past.push(JSON.parse(JSON.stringify(state.data)));
            state.data.splice(action.payload.row, 1);
            state.cellStyles.splice(action.payload.row, 1);
            state.rows--;
            state.data = reevaluateAllFormulas(state.data);
        },

        // ДОБАВЛЕНИЕ/УДАЛЕНИЕ СТОЛБЦОВ
        addColumn: (state, action: PayloadAction<{ afterCol: number }>) => {
            state.history.past.push(JSON.parse(JSON.stringify(state.data)));
            const targetCol = action.payload.afterCol + 1;
            state.data = state.data.map(row => {
                const newRow = [...row];
                newRow.splice(targetCol, 0, {
                    value: '',
                    displayValue: '',
                    type: 'string'
                });
                return newRow;
            });
            state.cellStyles = state.cellStyles.map(row => {
                const newRow = [...row];
                newRow.splice(targetCol, 0, { ...defaultStyle });
                return newRow;
            });
            state.cols++;
            state.data = reevaluateAllFormulas(state.data);
        },
        
        deleteColumn: (state, action: PayloadAction<{ col: number }>) => {
            if (state.cols <= 1) return;
            state.history.past.push(JSON.parse(JSON.stringify(state.data)));
            state.data = state.data.map(row => {
                const newRow = [...row];
                newRow.splice(action.payload.col, 1);
                return newRow;
            });
            state.cellStyles = state.cellStyles.map(row => {
                const newRow = [...row];
                newRow.splice(action.payload.col, 1);
                return newRow;
            });
            state.cols--;
            state.data = reevaluateAllFormulas(state.data);
        },

        // ОЧИСТКА ВСЕХ ДАННЫХ
        clearAll: (state) => {
            state.history.past.push(JSON.parse(JSON.stringify(state.data)));
            state.data = state.data.map(row =>
                row.map(() => ({
                    value: '',
                    displayValue: '',
                    type: 'string'
                }))
            );
            state.cellStyles = state.cellStyles.map(row =>
                row.map(() => ({ ...defaultStyle }))
            );
            state.data = reevaluateAllFormulas(state.data);
        },

        // UNDO/REDO
        undo: (state) => {
            if (state.history.past.length === 0) return;
            const previous = state.history.past.pop()!;
            state.history.future.push(JSON.parse(JSON.stringify(state.data)));
            state.data = previous;
            state.data = reevaluateAllFormulas(state.data);
        },
        
        redo: (state) => {
            if (state.history.future.length === 0) return;
            const next = state.history.future.pop()!;
            state.history.past.push(JSON.parse(JSON.stringify(state.data)));
            state.data = next;
            state.data = reevaluateAllFormulas(state.data);
        },

        // ПОИСК И ЗАМЕНА
        findAndReplace: (state, action: PayloadAction<{
            searchText: string;
            replaceText: string;
            matchCase: boolean;
            wholeWord: boolean;
        }>) => {
            const { searchText, replaceText, matchCase, wholeWord } = action.payload;
            if (!searchText) return;
            
            state.history.past.push(JSON.parse(JSON.stringify(state.data)));
            
            for (let i = 0; i < state.data.length; i++) {
                for (let j = 0; j < state.data[i].length; j++) {
                    const cell = state.data[i][j];
                    let cellText = formatValue(cell.value);
                    
                    if (!matchCase) {
                        cellText = cellText.toLowerCase();
                    }
                    
                    let searchFor = searchText;
                    if (!matchCase) {
                        searchFor = searchFor.toLowerCase();
                    }
                    
                    if (wholeWord) {
                        const regex = new RegExp(`\\b${searchFor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, matchCase ? 'g' : 'gi');
                        if (regex.test(cellText)) {
                            const newValue = cellText.replace(regex, replaceText);
                            cell.value = newValue;
                            cell.displayValue = newValue;
                        }
                    } else {
                        if (cellText.includes(searchFor)) {
                            const newValue = cellText.split(searchFor).join(replaceText);
                            cell.value = newValue;
                            cell.displayValue = newValue;
                        }
                    }
                }
            }
            
            state.data = reevaluateAllFormulas(state.data);
        },

        // ИЗМЕНЕНИЕ РАЗМЕРОВ
        setColumnWidth: (state, action: PayloadAction<{ col: number; width: number }>) => {
            state.columnWidths[action.payload.col] = action.payload.width;
        },
        
        setRowHeight: (state, action: PayloadAction<{ row: number; height: number }>) => {
            state.rowHeights[action.payload.row] = action.payload.height;
        },

        // ========== НОВЫЕ РЕДЬЮСЕРЫ ДЛЯ ФОРМАТИРОВАНИЯ ==========
        
        // ПРИМЕНИТЬ СТИЛЬ К ВЫДЕЛЕНИЮ
        applyStyleToSelection: (state, action: PayloadAction<{
            selection: Selection;
            style: Partial<CellStyle>;
        }>) => {
            const { selection, style } = action.payload;
            const minRow = Math.min(selection.startRow, selection.endRow);
            const maxRow = Math.max(selection.startRow, selection.endRow);
            const minCol = Math.min(selection.startCol, selection.endCol);
            const maxCol = Math.max(selection.startCol, selection.endCol);
            
            // ИНИЦИАЛИЗИРУЕМ cellStyles ЕСЛИ НУЖНО
            if (!state.cellStyles || state.cellStyles.length === 0) {
                state.cellStyles = Array(state.rows).fill(null).map(() => 
                    Array(state.cols).fill(null).map(() => ({ ...defaultStyle }))
                );
            }
            
            for (let row = minRow; row <= maxRow; row++) {
                for (let col = minCol; col <= maxCol; col++) {
                    if (!state.cellStyles[row]) state.cellStyles[row] = [];
                    if (!state.cellStyles[row][col]) state.cellStyles[row][col] = { ...defaultStyle };
                    state.cellStyles[row][col] = { ...state.cellStyles[row][col], ...style };
                    
                    // ТАКЖЕ ОБНОВЛЯЕМ СТИЛЬ В САМОЙ ЯЧЕЙКЕ ДЛЯ ОТОБРАЖЕНИЯ
                    if (state.data[row] && state.data[row][col]) {
                        state.data[row][col].style = { ...state.cellStyles[row][col] };
                    }
                }
            }
        },

        // КОПИРОВАТЬ ДИАПАЗОН
        copyRange: (state, action: PayloadAction<Selection>) => {
            const { startRow, startCol, endRow, endCol } = action.payload;
            const minRow = Math.min(startRow, endRow);
            const maxRow = Math.max(startRow, endRow);
            const minCol = Math.min(startCol, endCol);
            const maxCol = Math.max(startCol, endCol);
            
            const copyData: Cell[][] = [];
            const copyStyles: CellStyle[][] = [];
            
            for (let row = minRow; row <= maxRow; row++) {
                const dataRow: Cell[] = [];
                const styleRow: CellStyle[] = [];
                for (let col = minCol; col <= maxCol; col++) {
                    dataRow.push({ ...state.data[row][col] });
                    styleRow.push({ ...(state.cellStyles[row]?.[col] || defaultStyle) });
                }
                copyData.push(dataRow);
                copyStyles.push(styleRow);
            }
            
            localStorage.setItem('clipboard_data', JSON.stringify(copyData));
            localStorage.setItem('clipboard_styles', JSON.stringify(copyStyles));
        },

        // ВСТАВИТЬ ДИАПАЗОН
        pasteRange: (state, action: PayloadAction<{ startRow: number; startCol: number }>) => {
            const { startRow, startCol } = action.payload;
            const copiedData = localStorage.getItem('clipboard_data');
            const copiedStyles = localStorage.getItem('clipboard_styles');
            
            if (!copiedData || !copiedStyles) return;
            
            const data: Cell[][] = JSON.parse(copiedData);
            const styles: CellStyle[][] = JSON.parse(copiedStyles);
            
            state.history.past.push(JSON.parse(JSON.stringify(state.data)));
            
            for (let row = 0; row < data.length; row++) {
                const targetRow = startRow + row;
                if (targetRow >= state.rows) break;
                for (let col = 0; col < data[row].length; col++) {
                    const targetCol = startCol + col;
                    if (targetCol >= state.cols) break;
                    state.data[targetRow][targetCol] = { ...data[row][col] };
                    if (!state.cellStyles[targetRow]) state.cellStyles[targetRow] = [];
                    state.cellStyles[targetRow][targetCol] = { ...styles[row][col] };
                    
                    // ОБНОВЛЯЕМ СТИЛЬ В ЯЧЕЙКЕ
                    if (state.data[targetRow][targetCol]) {
                        state.data[targetRow][targetCol].style = { ...styles[row][col] };
                    }
                }
            }
            
            state.data = reevaluateAllFormulas(state.data);
        },

        // ОЧИСТИТЬ ВЫДЕЛЕННЫЕ ЯЧЕЙКИ
        clearCells: (state, action: PayloadAction<Selection>) => {
            const { startRow, startCol, endRow, endCol } = action.payload;
            const minRow = Math.min(startRow, endRow);
            const maxRow = Math.max(startRow, endRow);
            const minCol = Math.min(startCol, endCol);
            const maxCol = Math.max(startCol, endCol);
            
            state.history.past.push(JSON.parse(JSON.stringify(state.data)));
            
            for (let row = minRow; row <= maxRow; row++) {
                for (let col = minCol; col <= maxCol; col++) {
                    state.data[row][col] = {
                        value: '',
                        displayValue: '',
                        type: 'string',
                        style: state.cellStyles[row]?.[col] || { ...defaultStyle }
                    };
                }
            }
            
            state.data = reevaluateAllFormulas(state.data);
        },

        // ВЫДЕЛИТЬ ВСЁ
        selectAll: (state) => {
            state.selection = {
                startRow: 0,
                startCol: 0,
                endRow: state.rows - 1,
                endCol: state.cols - 1
            };
        },

        // ОБНОВИТЬ СТИЛЬ ОДНОЙ ЯЧЕЙКИ
        updateCellStyle: (state, action: PayloadAction<{
            row: number;
            col: number;
            style: Partial<CellStyle>;
        }>) => {
            const { row, col, style } = action.payload;
            if (!state.cellStyles[row]) {
                state.cellStyles[row] = [];
            }
            if (!state.cellStyles[row][col]) {
                state.cellStyles[row][col] = { ...defaultStyle };
            }
            state.cellStyles[row][col] = { ...state.cellStyles[row][col], ...style };
            
            // ОБНОВЛЯЕМ СТИЛЬ В ЯЧЕЙКЕ
            if (state.data[row] && state.data[row][col]) {
                state.data[row][col].style = { ...state.cellStyles[row][col] };
            }
        }
    }
});

// СЕЛЕКТОРЫ
export const selectCanUndo = (state: { spreadsheet: SpreadsheetState }) => state.spreadsheet.history.past.length > 0;
export const selectCanRedo = (state: { spreadsheet: SpreadsheetState }) => state.spreadsheet.history.future.length > 0;

export const {
    initSheet,
    updateCell,
    setSelection,
    setLastSelectedCell,
    addRow,
    deleteRow,
    addColumn,
    deleteColumn,
    setColumnWidth,
    setRowHeight,
    clearAll,
    undo,
    redo,
    findAndReplace,
    applyStyleToSelection,
    copyRange,
    pasteRange,
    clearCells,
    selectAll,
    updateCellStyle
} = spreadsheetSlice.actions;

export default spreadsheetSlice.reducer;