// types.ts
export type CellValue = string | number | boolean | null;
export type CellType = 'string' | 'number' | 'boolean' | 'formula';

export interface Cell {
    value: CellValue;
    displayValue: string;
    formula?: string; // исходная формула (если есть - ?)
    type: CellType;
}

export interface Selection {
    startRow: number;
    startCol: number;
    endRow: number;
    endCol: number;
}

export interface Checker{
    compliten:boolean;
}

export interface ColumnWidth {
    [key: number]: number;
}

export interface RowHeight {
    [key: number]: number;
}

export interface HistoryState {
    data: Cell[][];
    timestamp: number;
    description: string;
}

export interface ClipboardData {
    data: Cell[][];
    rows: number;
    cols: number;
}

export interface FindReplaceOptions {
    searchText: string;
    replaceText: string;
    matchCase: boolean;
    wholeWord: boolean;
}

//ИСКЛЮЧИТЕЛЬНО ПУНК КРУДОВ ТУТ ОТ СЮДА ТОЛЬКО ЭКСПОРТИРУЕМ
//этот тип отвечает за отоброжение в превью
export interface Document {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    rows: number;
    cols: number;
    previewData?: Cell[][]; // первые 3x3 ячейки для превью
}
// в отличии от Document, DocumentData инффа о фулл данных файла
export interface DocumentData {
    id: string;
    name: string;
    data: Cell[][];
    rows: number;
    cols: number;
    createdAt: string;
    updatedAt: string;
}
// для статуса сохранения
export interface SaveStatus { 
    state: 'saved' | 'saving' | 'error';
    lastSaved: Date | null;
    errorMessage?: string;
}

// ИЛЮХ ТУТ У НАС НЕТ ИМПОРТОВ, ТУТ НАШИ ТИПЫ ДАННЫХ, МЫ ОТ СЮДА ТОЛЬКО ЭКСПОРТИРУЕМ