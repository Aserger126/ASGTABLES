// pages/SpreadsheetPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table } from '../components/SimpleTable';
import { FormulaBar } from '../components/FormulaBar';
import { TableControls } from '../components/TableControls';
import { CSVImportModal } from '../components/CSVImportModal';
import { FormattingToolbar } from '../components/FormattingToolbar';
import { ThemeToolbar } from '../components/ThemeToolbar';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchDocumentById, clearCurrentDocument } from '../store/slices/documentsSlice';
import {
    initSheet,
    updateCell,
    addRow,
    deleteRow,
    addColumn,
    deleteColumn,
    clearAll,
    findAndReplace,
    undo,
    redo,
    applyStyleToSelection,
    copyRange,
    pasteRange,
    clearCells,
    selectAll,
    selectCanUndo,
    selectCanRedo
} from '../store/slices/spreadsheetSlice';
import {
    setActiveCell,
    setShowCSVImportModal,
    showNotification
} from '../store/slices/uiSlice';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { dataToCSV } from '../utils/csvUtils';
import type { Cell, CellValue, FindReplaceOptions } from '../types';

export const SpreadsheetPage = () => {
    const { documentId } = useParams<{ documentId: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    
    // ЛОКАЛЬНОЕ СОСТОЯНИЕ ДЛЯ FORMULA BAR
    const [formulaInputValue, setFormulaInputValue] = useState('');
    
    // REDUX STATE
    const { currentDocument, isLoading } = useAppSelector(state => state.documents);
    const { showCSVImportModal, activeCell, saveStatus } = useAppSelector(state => state.ui);
    const { data: sheetData, rows, cols, selection } = useAppSelector(state => state.spreadsheet);
    const canUndo = useAppSelector(selectCanUndo);
    const canRedo = useAppSelector(selectCanRedo);
    
    // ПРОВЕРКА НА НЕСОХРАНЁННЫЕ ИЗМЕНЕНИЯ
    const hasUnsavedChanges = (saveStatus.state === 'saving') || 
        Boolean(currentDocument && JSON.stringify(sheetData) !== JSON.stringify(currentDocument.data));
    
    useUnsavedChanges({ hasUnsavedChanges });
    
    // ЗАГРУЗКА ДОКУМЕНТА ПО ID ИЗ URL
    useEffect(() => {
        if (documentId) {
            dispatch(fetchDocumentById(documentId));
        }
        return () => {
            dispatch(clearCurrentDocument());
        };
    }, [documentId, dispatch]);
    
    // ИНИЦИАЛИЗАЦИЯ ТАБЛИЦЫ
    useEffect(() => {
        if (currentDocument) {
            dispatch(initSheet({
                data: currentDocument.data,
                rows: currentDocument.rows,
                cols: currentDocument.cols
            }));
        }
    }, [currentDocument, dispatch]);
    
    // ОБНОВЛЕНИЕ FORMULA BAR ПРИ СМЕНЕ ЯЧЕЙКИ
    useEffect(() => {
        if (activeCell) {
            const cell = sheetData[activeCell.row]?.[activeCell.col];
            if (cell?.type === 'formula' && cell.formula) {
                setFormulaInputValue(cell.formula);
            } else {
                setFormulaInputValue(cell?.displayValue || '');
            }
        }
    }, [activeCell, sheetData]);
    
    // ОБРАБОТЧИКИ
    const handleCellChange = (row: number, col: number, value: CellValue, formula?: string) => {
        dispatch(updateCell({ row, col, value, formula }));
        dispatch(setActiveCell({ row, col }));
    };
    
    const handleFormulaChange = (value: string) => {
        setFormulaInputValue(value);
    };
    
    const handleFormulaAccept = () => {
        if (!activeCell) return;
        const value = formulaInputValue;
        if (value.startsWith('=')) {
            dispatch(updateCell({ row: activeCell.row, col: activeCell.col, value, formula: value }));
        } else {
            dispatch(updateCell({ row: activeCell.row, col: activeCell.col, value }));
        }
    };
    
    const handleExportCSV = () => {
        const csvString = dataToCSV(sheetData, ',');
        const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentDocument?.name || 'table'}_${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        dispatch(showNotification({ message: 'Экспорт CSV выполнен', type: 'success' }));
    };
    
    const handleExportJSON = () => {
        const exportData = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            rows: sheetData.length,
            cols: sheetData[0]?.length || 26,
            data: sheetData
        };
        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentDocument?.name || 'table'}_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        dispatch(showNotification({ message: 'Экспорт JSON выполнен', type: 'success' }));
    };
    
    const handleImportCSV = (newData: Cell[][], _headers: string[]) => {
        if (window.confirm(`Импортировать ${newData.length} строк? Текущие данные будут заменены.`)) {
            for (let i = 0; i < newData.length; i++) {
                for (let j = 0; j < newData[i].length; j++) {
                    dispatch(updateCell({
                        row: i,
                        col: j,
                        value: newData[i][j].value,
                        formula: newData[i][j].formula
                    }));
                }
            }
            dispatch(showNotification({ message: `Импортировано ${newData.length} строк`, type: 'success' }));
        }
    };
    
    // ОБРАБОТЧИКИ ДЛЯ ГОРЯЧИХ КЛАВИШ
    const handleCopy = () => {
        if (selection) dispatch(copyRange(selection));
    };
    
    const handleCut = () => {
        if (selection) {
            dispatch(copyRange(selection));
            dispatch(clearCells(selection));
        }
    };
    
    const handlePaste = () => {
        if (selection) {
            dispatch(pasteRange({ startRow: selection.startRow, startCol: selection.startCol }));
        }
    };
    
    const handleDelete = () => {
        if (selection) dispatch(clearCells(selection));
    };
    
    const handleSelectAll = () => {
        dispatch(selectAll());
    };
    
    const handleBold = () => {
        if (selection) {
            dispatch(applyStyleToSelection({ selection, style: { bold: true } }));
        }
    };
    
    const handleItalic = () => {
        if (selection) {
            dispatch(applyStyleToSelection({ selection, style: { italic: true } }));
        }
    };
    
    const handleUnderline = () => {
        if (selection) {
            dispatch(applyStyleToSelection({ selection, style: { underline: true } }));
        }
    };
    
    // ХУК ДЛЯ ГОРЯЧИХ КЛАВИШ
    useKeyboardShortcuts({
        onSave: handleExportJSON,
        onBold: handleBold,
        onItalic: handleItalic,
        onUnderline: handleUnderline,
        onCut: handleCut,
        onCopy: handleCopy,
        onPaste: handlePaste,
        onDelete: handleDelete,
        onSelectAll: handleSelectAll
    });
    
    if (isLoading) {
        return <div style={loadingStyle}>Загрузка документа...</div>;
    }
    
    if (!currentDocument) {
        return <div style={errorStyle}>Документ не найден</div>;
    }
    
    return (
        <div>
            {/* ВЕРХНЯЯ ПАНЕЛЬ С ФОРМАТИРОВАНИЕМ И ТЕМАМИ */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                borderBottom: '1px solid #e0e0e0',
                flexWrap: 'wrap'
            }}>
                <FormattingToolbar />
                <ThemeToolbar />
            </div>
            
            <TableControls
                onAddRow={() => dispatch(addRow({ afterRow: rows - 1 }))}
                onAddColumn={() => dispatch(addColumn({ afterCol: cols - 1 }))}
                onClearAll={() => { if (window.confirm('Очистить все данные?')) dispatch(clearAll()); }}
                onFindReplace={(options: FindReplaceOptions) => dispatch(findAndReplace(options))}
                onExportData={handleExportJSON}
                onExportCSV={handleExportCSV}
                onImportData={() => {}}
                onImportCSV={() => dispatch(setShowCSVImportModal(true))}
                canUndo={canUndo}
                canRedo={canRedo}
                onUndo={() => dispatch(undo())}
                onRedo={() => dispatch(redo())}
            />
            
            <FormulaBar
                activeCell={activeCell}
                cellValue={formulaInputValue}
                onFormulaChange={handleFormulaChange}
                onAccept={handleFormulaAccept}
            />
            
            <Table
                data={sheetData}
                rows={rows}
                cols={cols}
                onCellChange={handleCellChange}
                onAddRow={(afterRow) => dispatch(addRow({ afterRow }))}
                onDeleteRow={(row) => dispatch(deleteRow({ row }))}
                onAddColumn={(afterCol) => dispatch(addColumn({ afterCol }))}
                onDeleteColumn={(col) => dispatch(deleteColumn({ col }))}
            />
            
            <CSVImportModal
                isOpen={showCSVImportModal}
                onClose={() => dispatch(setShowCSVImportModal(false))}
                onImport={handleImportCSV}
            />
            
            <div style={shortcutStyle}>
                💾 Ctrl+S - сохранить | Ctrl+Z - отменить | Ctrl+Y - повторить | Ctrl+C/V - копировать/вставить
            </div>
        </div>
    );
};

const loadingStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    fontSize: '16px',
    color: '#666'
};

const errorStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    fontSize: '16px',
    color: '#f44336'
};

const shortcutStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    fontSize: '12px',
    color: '#999',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: '8px 12px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
};