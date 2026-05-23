// store/slices/spreadsheetSlice.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import spreadsheetReducer, {
    initSheet,
    updateCell,
    addRow,
    deleteRow,
    addColumn,
    deleteColumn,
    clearAll,
    undo,
    redo,
    findAndReplace,
    setColumnWidth,
    setRowHeight,
    selectCanUndo,
    selectCanRedo
} from './spreadsheetSlice';
import type { Cell } from '../../types';

describe('spreadsheetSlice', () => {
    const createEmptyCell = (): Cell => ({
        value: '',
        displayValue: '',
        type: 'string'
    });

    const createNumberCell = (value: number): Cell => ({
        value,
        displayValue: value.toString(),
        type: 'number'
    });

    const initialState = {
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

    const mockData: Cell[][] = [
        [createEmptyCell(), createEmptyCell()],
        [createEmptyCell(), createEmptyCell()]
    ];

    it('should return initial state', () => {
        expect(spreadsheetReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    describe('initSheet', () => {
        it('should initialize sheet with data', () => {
            const action = initSheet({ data: mockData, rows: 2, cols: 2 });
            const actual = spreadsheetReducer(initialState, action);
            
            expect(actual.data).toEqual(mockData);
            expect(actual.rows).toBe(2);
            expect(actual.cols).toBe(2);
            expect(actual.history.past).toEqual([]);
            expect(actual.history.future).toEqual([]);
        });
    });

    describe('updateCell', () => {
        it('should update cell value and save to history', () => {
            const stateWithData = { ...initialState, data: mockData };
            const action = updateCell({ row: 0, col: 0, value: 'new value' });
            const actual = spreadsheetReducer(stateWithData, action);
            
            expect(actual.data[0][0].value).toBe('new value');
            expect(actual.history.past.length).toBe(1);
            expect(actual.history.future).toEqual([]);
        });

        it('should update cell with formula', () => {
            const stateWithData = { ...initialState, data: mockData };
            const action = updateCell({ row: 0, col: 0, value: '=SUM(A1:A2)', formula: '=SUM(A1:A2)' });
            const actual = spreadsheetReducer(stateWithData, action);
            
            expect(actual.data[0][0].type).toBe('formula');
            expect(actual.data[0][0].formula).toBe('=SUM(A1:A2)');
        });

        it('should update cell with number', () => {
            const stateWithData = { ...initialState, data: mockData };
            const action = updateCell({ row: 0, col: 0, value: 42 });
            const actual = spreadsheetReducer(stateWithData, action);
            
            expect(actual.data[0][0].type).toBe('number');
            expect(actual.data[0][0].value).toBe(42);
        });

        it('should update cell with boolean', () => {
            const stateWithData = { ...initialState, data: mockData };
            const action = updateCell({ row: 0, col: 0, value: true });
            const actual = spreadsheetReducer(stateWithData, action);
            
            expect(actual.data[0][0].type).toBe('boolean');
            expect(actual.data[0][0].value).toBe(true);
        });
    });

    describe('addRow', () => {
        it('should add new row after specified index', () => {
            const stateWithData = { ...initialState, data: mockData, rows: 2, cols: 2 };
            const action = addRow({ afterRow: 0 });
            const actual = spreadsheetReducer(stateWithData, action);
            
            expect(actual.data.length).toBe(3);
            expect(actual.rows).toBe(3);
            expect(actual.history.past.length).toBe(1);
        });
    });

    describe('deleteRow', () => {
        it('should delete row at specified index', () => {
            const stateWithData = { ...initialState, data: mockData, rows: 2, cols: 2 };
            const action = deleteRow({ row: 0 });
            const actual = spreadsheetReducer(stateWithData, action);
            
            expect(actual.data.length).toBe(1);
            expect(actual.rows).toBe(1);
            expect(actual.history.past.length).toBe(1);
        });

        it('should not delete last row', () => {
            const singleRowData = [mockData[0]];
            const stateWithData = { ...initialState, data: singleRowData, rows: 1, cols: 2 };
            const action = deleteRow({ row: 0 });
            const actual = spreadsheetReducer(stateWithData, action);
            
            expect(actual.data.length).toBe(1);
        });
    });

    describe('addColumn', () => {
        it('should add new column after specified index', () => {
            const stateWithData = { ...initialState, data: mockData, rows: 2, cols: 2 };
            const action = addColumn({ afterCol: 0 });
            const actual = spreadsheetReducer(stateWithData, action);
            
            expect(actual.data[0].length).toBe(3);
            expect(actual.cols).toBe(3);
            expect(actual.history.past.length).toBe(1);
        });
    });

    describe('deleteColumn', () => {
        it('should delete column at specified index', () => {
            const stateWithData = { ...initialState, data: mockData, rows: 2, cols: 2 };
            const action = deleteColumn({ col: 0 });
            const actual = spreadsheetReducer(stateWithData, action);
            
            expect(actual.data[0].length).toBe(1);
            expect(actual.cols).toBe(1);
            expect(actual.history.past.length).toBe(1);
        });

        it('should not delete last column', () => {
            const singleColData = mockData.map(row => [row[0]]);
            const stateWithData = { ...initialState, data: singleColData, rows: 2, cols: 1 };
            const action = deleteColumn({ col: 0 });
            const actual = spreadsheetReducer(stateWithData, action);
            
            expect(actual.data[0].length).toBe(1);
        });
    });

    describe('clearAll', () => {
        it('should clear all data and save to history', () => {
            const filledData: Cell[][] = [
                [createNumberCell(10), createNumberCell(20)],
                [createNumberCell(30), createNumberCell(40)]
            ];
            const stateWithData = { ...initialState, data: filledData, rows: 2, cols: 2 };
            const action = clearAll();
            const actual = spreadsheetReducer(stateWithData, action);
            
            expect(actual.data[0][0].value).toBe('');
            expect(actual.data[0][1].value).toBe('');
            expect(actual.history.past.length).toBe(1);
        });
    });

    describe('undo/redo', () => {
        it('should undo last action', () => {
            const stateWithHistory = {
                ...initialState,
                data: [{ ...mockData[0] }],
                history: {
                    past: [[...mockData]],
                    future: []
                }
            };
            const action = undo();
            const actual = spreadsheetReducer(stateWithHistory, action);
            
            expect(actual.data).toEqual(mockData);
            expect(actual.history.future.length).toBe(1);
        });

        it('should redo undone action', () => {
            const stateWithFuture = {
                ...initialState,
                data: [...mockData],
                history: {
                    past: [],
                    future: [[{ ...mockData[0] }]]
                }
            };
            const action = redo();
            const actual = spreadsheetReducer(stateWithFuture, action);
            
            expect(actual.data).toEqual([{ ...mockData[0] }]);
            expect(actual.history.past.length).toBe(1);
        });
    });

    describe('findAndReplace', () => {
        it('should replace text in cells', () => {
            const dataWithText: Cell[][] = [
                [{ ...createEmptyCell(), value: 'hello', displayValue: 'hello' }],
                [{ ...createEmptyCell(), value: 'world', displayValue: 'world' }]
            ];
            const stateWithData = { ...initialState, data: dataWithText };
            const action = findAndReplace({
                searchText: 'hello',
                replaceText: 'hi',
                matchCase: true,
                wholeWord: false
            });
            const actual = spreadsheetReducer(stateWithData, action);
            
            expect(actual.data[0][0].value).toBe('hi');
        });
    });

    describe('setColumnWidth', () => {
        it('should set column width', () => {
            const action = setColumnWidth({ col: 0, width: 150 });
            const actual = spreadsheetReducer(initialState, action);
            
            expect(actual.columnWidths[0]).toBe(150);
        });
    });

    describe('setRowHeight', () => {
        it('should set row height', () => {
            const action = setRowHeight({ row: 0, height: 50 });
            const actual = spreadsheetReducer(initialState, action);
            
            expect(actual.rowHeights[0]).toBe(50);
        });
    });

    describe('selectors', () => {
        it('selectCanUndo should return true when past has items', () => {
            const state = {
                spreadsheet: {
                    ...initialState,
                    history: { past: [mockData], future: [] }
                }
            };
            expect(selectCanUndo(state)).toBe(true);
        });

        it('selectCanUndo should return false when past is empty', () => {
            const state = {
                spreadsheet: {
                    ...initialState,
                    history: { past: [], future: [] }
                }
            };
            expect(selectCanUndo(state)).toBe(false);
        });

        it('selectCanRedo should return true when future has items', () => {
            const state = {
                spreadsheet: {
                    ...initialState,
                    history: { past: [], future: [mockData] }
                }
            };
            expect(selectCanRedo(state)).toBe(true);
        });
    });
});