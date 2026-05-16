import React, { useState } from 'react';
import type { FindReplaceOptions } from '../types';

interface TableControlsProps {
    onAddRow: () => void;
    onAddColumn: () => void;
    onClearAll: () => void;
    onFindReplace: (options: FindReplaceOptions) => void;
    onExportData: () => void;
    onImportData: (jsonData: string) => void;
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
}

export const TableControls: React.FC<TableControlsProps> = ({
    onAddRow,
    onAddColumn,
    onClearAll,
    onFindReplace,
    onExportData,
    onImportData,
    canUndo,
    canRedo,
    onUndo,
    onRedo
}) => {
    const [showFindReplace, setShowFindReplace] = useState(false);
    const [findText, setFindText] = useState('');
    const [replaceText, setReplaceText] = useState('');
    const [matchCase, setMatchCase] = useState(false);
    const [wholeWord, setWholeWord] = useState(false);
    const [showImportExport, setShowImportExport] = useState(false);
    const [importJson, setImportJson] = useState('');

    // ЭКСПОРТ В CSV
    const handleExportCSV = () => {
        onExportData();
        // ВЫЗОВЕТ ЭКСПОРТ JSON, НО МОЖНО РАСШИРИТЬ
    };

    const handleFindReplaceLocal = () => {
        onFindReplace({
            searchText: findText,
            replaceText: replaceText,
            matchCase: matchCase,
            wholeWord: wholeWord
        });
        setShowFindReplace(false);
    };

    return (
        <div style={{
            padding: '10px',
            backgroundColor: '#f5f5f5',
            borderBottom: '1px solid #ddd',
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            alignItems: 'center'
        }}>
            <button onClick={onAddRow} style={buttonStyle}>➕ Строку</button>
            <button onClick={onAddColumn} style={buttonStyle}>➕ Столбец</button>
            
            <button onClick={onUndo} disabled={!canUndo} style={{ ...buttonStyle, opacity: canUndo ? 1 : 0.5 }}>↩ Отменить</button>
            <button onClick={onRedo} disabled={!canRedo} style={{ ...buttonStyle, opacity: canRedo ? 1 : 0.5 }}>↪ Вернуть</button>
            
            <button onClick={() => setShowFindReplace(!showFindReplace)} style={buttonStyle}>🔍 Найти/Заменить</button>
            
            <button onClick={() => setShowImportExport(!showImportExport)} style={buttonStyle}>📁 Импорт/Экспорт</button>
            
            <button onClick={onClearAll} style={{ ...buttonStyle, backgroundColor: '#ff4444', color: 'white' }}>🗑 Очистить всё</button>

            {/* МОДАЛКА ПОИСКА */}
            {showFindReplace && (
                <div style={modalStyle}>
                    <input type="text" placeholder="Найти..." value={findText} onChange={(e) => setFindText(e.target.value)} style={inputStyle} />
                    <input type="text" placeholder="Заменить на..." value={replaceText} onChange={(e) => setReplaceText(e.target.value)} style={inputStyle} />
                    <div>
                        <label><input type="checkbox" checked={matchCase} onChange={(e) => setMatchCase(e.target.checked)} /> Учитывать регистр</label>
                        <label><input type="checkbox" checked={wholeWord} onChange={(e) => setWholeWord(e.target.checked)} /> Только целые слова</label>
                    </div>
                    <button onClick={handleFindReplaceLocal} style={buttonPrimaryStyle}>Заменить все</button>
                    <button onClick={() => setShowFindReplace(false)} style={buttonStyle}>Отмена</button>
                </div>
            )}

            {/* МОДАЛКА ИМПОРТА/ЭКСПОРТА */}
            {showImportExport && (
                <div style={modalStyle}>
                    <button onClick={handleExportCSV} style={{ ...buttonStyle, width: '100%', marginBottom: '10px' }}>📤 Экспорт в CSV/JSON</button>
                    <textarea placeholder="Вставьте JSON для импорта..." value={importJson} onChange={(e) => setImportJson(e.target.value)} rows={3} style={inputStyle} />
                    <button onClick={() => onImportData(importJson)} style={buttonPrimaryStyle}>📥 Импорт</button>
                    <button onClick={() => setShowImportExport(false)} style={buttonPrimaryStyle}> Закрыть</button>
                </div>
            )}
        </div>
    );
};
const buttonStyle: React.CSSProperties = {
    padding: '6px 12px',
    backgroundColor: '#ffffff',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
};

const buttonPrimaryStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#4CAF50',
    color: 'white'
};

const modalStyle: React.CSSProperties = {
    position: 'absolute',
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '15px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    zIndex: 1000,
    marginTop: '5px',
    minWidth: '300px'
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '6px',
    marginBottom: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px'
};
//ЭТО ЗАГЛУШКА