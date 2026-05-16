// App.tsx
import { useState, useEffect } from 'react';
import { Table } from './components/SimpleTable';
import { FormulaBar } from './components/FormulaBar';
import { TableControls } from './components/TableControls';
import { DocumentDashboard } from './components/DocumentDashboard';
import { CreateDocumentModal } from './components/CreateDocumentModal';
import { SaveIndicator } from './components/SaveIndicator';
import type { Cell, CellValue, FindReplaceOptions } from './types';
import { formatValue } from './formulas';
import { useSpreadsheetHistory } from './hooks/useSpreadsheetHistory';
import { useAutoSave } from './hooks/useAutoSave';
import { api } from './services/api';

function App() {
    // СОСТОЯНИЕ ДЛЯ УПРАВЛЕНИЯ ДОКУМЕНТАМИ
    const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null);
    const [showDashboard, setShowDashboard] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [sheetData, setSheetData] = useState<Cell[][]>([]);
    const [rows, setRows] = useState(50);
    const [cols, setCols] = useState(26);
    const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
    const [documentName, setDocumentName] = useState('');

    // ПОДКЛЮЧАЕМ ИСТОРИЮ
    const { saveState, undo, redo, canUndo, canRedo } = useSpreadsheetHistory(sheetData);

    // ПОДКЛЮЧАЕМ АВТОСОХРАНЕНИЕ
    const { saveStatus, save, hasUnsavedChanges } = useAutoSave({
        documentId: currentDocumentId,
        data: sheetData,
        rows,
        cols
    });

    // ЗАГРУЗКА ДОКУМЕНТА ПРИ ВЫБОРЕ
    const loadDocument = async (docId: string) => {
        const doc = await api.getDocument(docId);
        if (doc) {
            setSheetData(doc.data);
            setRows(doc.rows);
            setCols(doc.cols);
            setDocumentName(doc.name);
            setCurrentDocumentId(doc.id);
            setShowDashboard(false);
            api.setCurrentDocumentId(docId);
        }
    };

    // СОЗДАНИЕ НОВОГО ДОКУМЕНТА
    const handleCreateDocument = async (name: string, newRows: number, newCols: number) => {
        const newDoc = await api.createDocument(name, newRows, newCols);
        await loadDocument(newDoc.id);
    };

    // ВОССТАНОВЛЕНИЕ ПОСЛЕДНЕГО ДОКУМЕНТА ПРИ ЗАГРУЗКЕ
    useEffect(() => {
        const lastDocId = api.getCurrentDocumentId();
        if (lastDocId) {
            loadDocument(lastDocId);
        }
    }, []);

    // ОБНОВЛЕНИЕ ДАННЫХ С СОХРАНЕНИЕМ В ИСТОРИЮ
    const updateData = (newData: Cell[][], description: string) => {
        setSheetData(newData);
        saveState(newData, description);
    };

    const getActiveCellValue = () => {
        if (!activeCell) return '';
        const cell = sheetData[activeCell.row]?.[activeCell.col];
        if (cell?.type === 'formula' && cell.formula) {
            return cell.formula;
        }
        return formatValue(cell?.value ?? '');
    };

    const handleCellChange = (row: number, col: number, value: CellValue, formula?: string) => {
        const newData = [...sheetData];
        newData[row] = [...newData[row]];
        
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
        
        newData[row][col] = {
            value,
            displayValue,
            type,
            formula
        };
        
        updateData(newData, `Изменена ячейка ${String.fromCharCode(65 + col)}${row + 1}`);
        setActiveCell({ row, col });
    };

    const handleFormulaChange = (value: string) => {
        if (!activeCell) return;
        const newData = [...sheetData];
        newData[activeCell.row] = [...newData[activeCell.row]];
        newData[activeCell.row][activeCell.col] = {
            ...newData[activeCell.row][activeCell.col],
            displayValue: value.startsWith('=') ? value : value,
            formula: value.startsWith('=') ? value : undefined
        };
        setSheetData(newData);
    };

    const handleFormulaAccept = () => {
        if (!activeCell) return;
        const cell = sheetData[activeCell.row][activeCell.col];
        const value = cell.displayValue;
        if (value.startsWith('=')) {
            handleCellChange(activeCell.row, activeCell.col, value, value);
        } else {
            handleCellChange(activeCell.row, activeCell.col, value);
        }
    };

    // CRUD: ДОБАВЛЕНИЕ СТРОКИ
    const handleAddRow = (afterRow?: number) => {
        const newData = [...sheetData];
        const targetRow = afterRow !== undefined ? afterRow + 1 : newData.length;
        const newRow: Cell[] = Array(cols).fill(null).map(() => ({
            value: '',
            displayValue: '',
            type: 'string'
        }));
        newData.splice(targetRow, 0, newRow);
        updateData(newData, `Добавлена строка ${targetRow + 1}`);
        setRows(rows + 1);
    };

    // CRUD: УДАЛЕНИЕ СТРОКИ
    const handleDeleteRow = (row: number) => {
        if (sheetData.length <= 1) {
            alert('Нельзя удалить последнюю строку!');
            return;
        }
        const newData = [...sheetData];
        newData.splice(row, 1);
        updateData(newData, `Удалена строка ${row + 1}`);
        setRows(rows - 1);
    };

    // CRUD: ДОБАВЛЕНИЕ СТОЛБЦА
    const handleAddColumn = (afterCol?: number) => {
        const targetCol = afterCol !== undefined ? afterCol + 1 : cols;
        const newData = sheetData.map(row => {
            const newRow = [...row];
            newRow.splice(targetCol, 0, {
                value: '',
                displayValue: '',
                type: 'string'
            });
            return newRow;
        });
        updateData(newData, `Добавлен столбец ${String.fromCharCode(65 + targetCol)}`);
        setCols(cols + 1);
    };

    // CRUD: УДАЛЕНИЕ СТОЛБЦА
    const handleDeleteColumn = (col: number) => {
        if (cols <= 1) {
            alert('Нельзя удалить последний столбец!');
            return;
        }
        const newData = sheetData.map(row => {
            const newRow = [...row];
            newRow.splice(col, 1);
            return newRow;
        });
        updateData(newData, `Удален столбец ${String.fromCharCode(65 + col)}`);
        setCols(cols - 1);
    };

    // CRUD: ОЧИСТКА ВСЕЙ ТАБЛИЦЫ
    const handleClearAll = () => {
        if (window.confirm('Вы уверены, что хотите очистить все данные? Отменить будет невозможно!')) {
            const newData = sheetData.map(row =>
                row.map(cell => ({
                    value: '',
                    displayValue: '',
                    type: 'string' as const
                }))
            );
            updateData(newData, 'Очистка всей таблицы');
        }
    };

    // CRUD: ПОИСК И ЗАМЕНА
    const handleFindReplace = (options: FindReplaceOptions) => {
        const { searchText, replaceText, matchCase, wholeWord } = options;
        if (!searchText) return;

        let replaceCount = 0;
        const newData = JSON.parse(JSON.stringify(sheetData));

        for (let i = 0; i < newData.length; i++) {
            for (let j = 0; j < newData[i].length; j++) {
                const cell = newData[i][j];
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
                        replaceCount++;
                    }
                } else {
                    if (cellText.includes(searchFor)) {
                        const newValue = cellText.split(searchFor).join(replaceText);
                        cell.value = newValue;
                        cell.displayValue = newValue;
                        replaceCount++;
                    }
                }
            }
        }

        updateData(newData, `Поиск и замена: "${searchText}" → "${replaceText}" (${replaceCount} замен)`);
        alert(`Выполнено замен: ${replaceCount}`);
    };

    // CRUD: ЭКСПОРТ ДАННЫХ
    const handleExportData = () => {
        const exportData = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            rows: sheetData.length,
            cols: sheetData[0].length,
            data: sheetData
        };
        
        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${documentName}_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        alert('Данные экспортированы в JSON файл!');
    };

    // ЭКСПОРТ В CSV
    const handleExportCSV = () => {
        const csvRows = sheetData.map(row =>
            row.map(cell => {
                const value = formatValue(cell.value);
                // ЭСКЕЙПИНГ ДЛЯ CSV
                if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',')
        ).join('\n');
        
        const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${documentName}_${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        
        alert('Данные экспортированы в CSV файл!');
    };

    // ИМПОРТ ДАННЫХ
    const handleImportData = (jsonData: string) => {
        try {
            const parsed = JSON.parse(jsonData);
            if (parsed.data && Array.isArray(parsed.data)) {
                updateData(parsed.data, 'Импорт данных из файла');
                setRows(parsed.data.length);
                setCols(parsed.data[0]?.length || 26);
                alert('Данные успешно импортированы!');
            } else {
                throw new Error('Неверный формат данных');
            }
        } catch (error) {
            alert('Ошибка при импорте: неверный JSON формат');
        }
    };

    // ОТМЕНА
    const handleUndo = () => {
        const previousData = undo();
        if (previousData) {
            setSheetData(previousData);
        }
    };

    // ПОВТОР
    const handleRedo = () => {
        const nextData = redo();
        if (nextData) {
            setSheetData(nextData);
        }
    };

    // ЕСЛИ НЕТ ВЫБРАННОГО ДОКУМЕНТА, ПОКАЗЫВАЕМ ДАШБОРД
    if (showDashboard) {
        return (
            <>
                <DocumentDashboard 
                    onSelectDocument={(id) => {
                        loadDocument(id);
                    }}
                    onCreateNew={() => setShowCreateModal(true)}
                />
                <CreateDocumentModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onCreate={handleCreateDocument}
                />
            </>
        );
    }

    // ОСНОВНОЙ ИНТЕРФЕЙС ТАБЛИЦЫ
    return (
        <div>
            {/* ВЕРХНЯЯ ПАНЕЛЬ С НАЗВАНИЕМ ДОКУМЕНТА И ИНДИКАТОРОМ */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 20px',
                backgroundColor: '#fff',
                borderBottom: '1px solid #ddd'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button 
                        onClick={() => setShowDashboard(true)}
                        style={backButtonStyle}
                    >
                        ← Назад к документам
                    </button>
                    <h1 style={{ margin: 0 }}>{documentName}</h1>
                </div>
                <SaveIndicator status={saveStatus} />
            </div>
            
            {/* ПАНЕЛЬ УПРАВЛЕНИЯ */}
            <TableControls
                onAddRow={() => handleAddRow()}
                onAddColumn={() => handleAddColumn()}
                onClearAll={handleClearAll}
                onFindReplace={handleFindReplace}
                onExportData={handleExportData}
                onImportData={handleImportData}
                canUndo={canUndo}
                canRedo={canRedo}
                onUndo={handleUndo}
                onRedo={handleRedo}
            />
            
            {/* ПАНЕЛЬ ФОРМУЛ */}
            <FormulaBar
                activeCell={activeCell}
                cellValue={getActiveCellValue()}
                onFormulaChange={handleFormulaChange}
                onAccept={handleFormulaAccept}
            />
            
            {/* ТАБЛИЦА */}
            <Table
                data={sheetData}
                rows={rows}
                cols={cols}
                onCellChange={handleCellChange}
                onAddRow={handleAddRow}
                onDeleteRow={handleDeleteRow}
                onAddColumn={handleAddColumn}
                onDeleteColumn={handleDeleteColumn}
            />

            {/* КНОПКА РУЧНОГО СОХРАНЕНИЯ (Ctrl+S) */}
            <div style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                fontSize: '12px',
                color: '#999'
            }}>
                💾 Ctrl+S для сохранения
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