// App.tsx (ПОЛНОСТЬЮ ИСПРАВЛЕННАЯ ВЕРСИЯ)
import { useEffect, useState } from 'react';
import { Table } from './components/SimpleTable';
import { FormulaBar } from './components/FormulaBar';
import { TableControls } from './components/TableControls';
import { DocumentDashboard } from './components/DocumentDashboard';
import { CreateDocumentModal } from './components/CreateDocumentModal';
import { CSVImportModal } from './components/CSVImportModal';
import { SaveIndicator } from './components/SaveIndicator';
import { useAppDispatch, useAppSelector } from './store/hooks';
import {
    fetchDocuments,
    fetchDocumentById,
    createDocument,
    setCurrentDocumentId,
    clearCurrentDocument
} from './store/slices/documentsSlice';
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
    selectCanUndo,
    selectCanRedo
} from './store/slices/spreadsheetSlice';
import {
    setShowDashboard,
    setShowCreateModal,
    setShowCSVImportModal,
    setActiveCell,
    showNotification
} from './store/slices/uiSlice';
import { dataToCSV } from './utils/csvUtils';
import type { Cell, CellValue, FindReplaceOptions } from './types';

function App() {
    const dispatch = useAppDispatch();
    
    // ЛОКАЛЬНОЕ СОСТОЯНИЕ ДЛЯ FORMULA BAR
    const [formulaInputValue, setFormulaInputValue] = useState('');
    
    // REDUX STATE
    const { currentDocument } = useAppSelector(state => state.documents);
    const { showDashboard, showCreateModal, showCSVImportModal, activeCell, saveStatus } = useAppSelector(state => state.ui);
    const { data: sheetData, rows, cols } = useAppSelector(state => state.spreadsheet);
    const canUndo = useAppSelector(selectCanUndo);
    const canRedo = useAppSelector(selectCanRedo);
    
    // ЗАГРУЗКА ДОКУМЕНТОВ ПРИ СТАРТЕ
    useEffect(() => {
        dispatch(fetchDocuments());
    }, [dispatch]);
    
    // ВОССТАНОВЛЕНИЕ ПОСЛЕДНЕГО ДОКУМЕНТА
    useEffect(() => {
        const lastDocId = localStorage.getItem('spreadsheet_current_doc');
        if (lastDocId && !currentDocument) {
            handleLoadDocument(lastDocId);
        }
    }, []);
    
    // ИНИЦИАЛИЗАЦИЯ ТАБЛИЦЫ ПРИ ЗАГРУЗКЕ ДОКУМЕНТА
    useEffect(() => {
        if (currentDocument) {
            dispatch(initSheet({
                data: currentDocument.data,
                rows: currentDocument.rows,
                cols: currentDocument.cols
            }));
        }
    }, [currentDocument, dispatch]);
    
    // ПРИ СМЕНЕ АКТИВНОЙ ЯЧЕЙКИ ОБНОВЛЯЕМ FORMULA BAR
    useEffect(() => {
        if (activeCell) {
            const cell = sheetData[activeCell.row]?.[activeCell.col];
            if (cell?.type === 'formula' && cell.formula) {
                setFormulaInputValue(cell.formula);
            } else {
                setFormulaInputValue(cell?.displayValue || '');
            }
        } else {
            setFormulaInputValue('');
        }
    }, [activeCell, sheetData]);
    
    const handleLoadDocument = async (docId: string) => {
        await dispatch(fetchDocumentById(docId));
        dispatch(setCurrentDocumentId(docId));
        dispatch(setShowDashboard(false));
    };
    
    const handleCreateDocument = async (name: string, newRows: number, newCols: number) => {
        const result = await dispatch(createDocument({ name, rows: newRows, cols: newCols }));
        if (result.payload) {
            dispatch(setShowDashboard(false));
        }
    };
    
    const handleCellChange = (row: number, col: number, value: CellValue, formula?: string) => {
        dispatch(updateCell({ row, col, value, formula }));
        dispatch(setActiveCell({ row, col }));
    };
    
    // ФУНКЦИЯ ДЛЯ FORMULA BAR - ПРИ ИЗМЕНЕНИИ ТЕКСТА
    const handleFormulaChange = (value: string) => {
        setFormulaInputValue(value);
    };
    
    // ФУНКЦИЯ ДЛЯ FORMULA BAR - ПРИ ПРИМЕНЕНИИ (ENTER ИЛИ КНОПКА)
    const handleFormulaAccept = () => {
        if (!activeCell) return;
        const value = formulaInputValue;
        if (value.startsWith('=')) {
            dispatch(updateCell({ 
                row: activeCell.row, 
                col: activeCell.col, 
                value, 
                formula: value 
            }));
        } else {
            dispatch(updateCell({ 
                row: activeCell.row, 
                col: activeCell.col, 
                value 
            }));
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
    
    // DASHBOARD VIEW
    if (showDashboard) {
        return (
            <>
                <DocumentDashboard
                    onSelectDocument={handleLoadDocument}
                    onCreateNew={() => dispatch(setShowCreateModal(true))}
                />
                <CreateDocumentModal
                    isOpen={showCreateModal}
                    onClose={() => dispatch(setShowCreateModal(false))}
                    onCreate={handleCreateDocument}
                />
            </>
        );
    }
    
    // MAIN TABLE VIEW
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', backgroundColor: '#fff', borderBottom: '1px solid #ddd' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={() => { dispatch(setShowDashboard(true)); dispatch(clearCurrentDocument()); }} style={backButtonStyle}>← Назад к документам</button>
                    <h1 style={{ margin: 0 }}>{currentDocument?.name || 'Новый документ'}</h1>
                </div>
                <SaveIndicator status={saveStatus} />
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
            
            <div style={{ position: 'fixed', bottom: '20px', right: '20px', fontSize: '12px', color: '#999' }}>
                💾 Ctrl+Z - отменить | Ctrl+Y - повторить
            </div>
        </div>
    );
}

const backButtonStyle: React.CSSProperties = {
    padding: '6px 12px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
};

export default App;