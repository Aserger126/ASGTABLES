// store/slices/spreadsheetSlice.ts
import { createSlice, createSelector } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Cell, CellValue, Selection, ColumnWidth, RowHeight } from '../../types';
import { formatValue, evaluateFormula } from '../../formulas';

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
                formula
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
            state.data.splice(action.payload.afterRow + 1, 0, newRow);
            state.rows++;
            state.data = reevaluateAllFormulas(state.data);
        },
        
        deleteRow: (state, action: PayloadAction<{ row: number }>) => {
            if (state.data.length <= 1) return;
            state.history.past.push(JSON.parse(JSON.stringify(state.data)));
            state.data.splice(action.payload.row, 1);
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
    findAndReplace
} = spreadsheetSlice.actions;

export default spreadsheetSlice.reducer;