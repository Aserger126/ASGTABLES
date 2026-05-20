// components/TableControls.tsx
import React, { useState } from 'react';
import type { FindReplaceOptions } from '../types';

interface TableControlsProps {
    onAddRow: () => void;
    onAddColumn: () => void;
    onClearAll: () => void;
    onFindReplace: (options: FindReplaceOptions) => void;
    onExportData: () => void;
    onExportCSV: () => void;
    onImportData: (jsonData: string) => void;
    onImportCSV: () => void;
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
    onExportCSV,
    onImportData,
    onImportCSV,
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

    const handleFindReplaceLocal = () => {
        onFindReplace({
            searchText: findText,
            replaceText: replaceText,
            matchCase: matchCase,
            wholeWord: wholeWord
        });
        setShowFindReplace(false);
        setFindText('');
        setReplaceText('');
        setMatchCase(false);
        setWholeWord(false);
    };

    const handleCloseImportExport = () => {
        setShowImportExport(false);
        setImportJson('');
    };

    const handleImportDataLocal = () => {
        if (importJson.trim()) {
            onImportData(importJson);
            setImportJson('');
            handleCloseImportExport();
        }
    };

    return (
        <div style={toolbarStyle}>
            <button onClick={onAddRow} style={buttonStyle}>➕ Строку</button>
            <button onClick={onAddColumn} style={buttonStyle}>➕ Столбец</button>
            
            <button onClick={onUndo} disabled={!canUndo} style={{ ...buttonStyle, opacity: canUndo ? 1 : 0.5 }}>↩ Отменить</button>
            <button onClick={onRedo} disabled={!canRedo} style={{ ...buttonStyle, opacity: canRedo ? 1 : 0.5 }}>↪ Вернуть</button>
            
            <button onClick={() => setShowFindReplace(!showFindReplace)} style={buttonStyle}>🔍 Найти/Заменить</button>
            
            <button onClick={() => setShowImportExport(true)} style={buttonStyle}>📁 Импорт/Экспорт</button>
            
            <button onClick={onClearAll} style={{ ...buttonStyle, backgroundColor: '#ff4444', color: 'white' }}>🗑 Очистить всё</button>

            {/* МОДАЛКА ПОИСКА - ТОЖЕ УЛУЧШИМ */}
            {showFindReplace && (
                <div style={overlayStyle} onClick={() => setShowFindReplace(false)}>
                    <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                        <h3 style={modalTitleStyle}>Найти и заменить</h3>
                        <input 
                            type="text" 
                            placeholder="Найти..." 
                            value={findText} 
                            onChange={(e) => setFindText(e.target.value)} 
                            style={modalInputStyle} 
                        />
                        <input 
                            type="text" 
                            placeholder="Заменить на..." 
                            value={replaceText} 
                            onChange={(e) => setReplaceText(e.target.value)} 
                            style={modalInputStyle} 
                        />
                        <div style={checkboxGroupStyle}>
                            <label style={checkboxStyle}>
                                <input type="checkbox" checked={matchCase} onChange={(e) => setMatchCase(e.target.checked)} />
                                Учитывать регистр
                            </label>
                            <label style={checkboxStyle}>
                                <input type="checkbox" checked={wholeWord} onChange={(e) => setWholeWord(e.target.checked)} />
                                Только целые слова
                            </label>
                        </div>
                        <div style={modalButtonGroupStyle}>
                            <button onClick={handleFindReplaceLocal} style={primaryButtonStyle}>Заменить все</button>
                            <button onClick={() => setShowFindReplace(false)} style={secondaryButtonStyle}>Отмена</button>
                        </div>
                    </div>
                </div>
            )}

            {/* МОДАЛКА ИМПОРТА/ЭКСПОРТА - КАК ПРИ СОЗДАНИИ ДОКУМЕНТА */}
            {showImportExport && (
                <div style={overlayStyle} onClick={handleCloseImportExport}>
                    <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                        <h3 style={modalTitleStyle}>Импорт / Экспорт</h3>
                        
                        <button onClick={onExportCSV} style={modalActionButtonStyle}>
                            📤 Экспорт в CSV
                        </button>
                        <button onClick={onExportData} style={modalActionButtonStyle}>
                            📤 Экспорт в JSON
                        </button>
                        <button onClick={onImportCSV} style={modalActionButtonStyle}>
                            📥 Импорт из CSV
                        </button>
                        
                        <div style={dividerStyle} />
                        
                        <textarea
                            placeholder="Вставьте JSON для импорта..."
                            value={importJson}
                            onChange={(e) => setImportJson(e.target.value)}
                            rows={5}
                            style={modalTextareaStyle}
                        />
                        
                        <div style={modalButtonGroupStyle}>
                            <button onClick={handleImportDataLocal} style={primaryButtonStyle}>
                                📥 Импорт JSON
                            </button>
                            <button onClick={handleCloseImportExport} style={secondaryButtonStyle}>
                                Закрыть
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// СТИЛИ
const toolbarStyle: React.CSSProperties = {
    padding: '10px',
    backgroundColor: '#f5f5f5',
    borderBottom: '1px solid #ddd',
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    alignItems: 'center',
    position: 'relative'
};

const buttonStyle: React.CSSProperties = {
    padding: '6px 12px',
    backgroundColor: '#ffffff',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s'
};

// СТИЛИ ДЛЯ МОДАЛЬНЫХ ОКОН (КАК В CreateDocumentModal)
const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000
};

const modalStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    minWidth: '400px',
    maxWidth: '500px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
};

const modalTitleStyle: React.CSSProperties = {
    margin: '0 0 20px 0',
    fontSize: '20px',
    fontWeight: '500',
    color: '#333'
};

const modalInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box'
};

const modalTextareaStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'monospace',
    boxSizing: 'border-box',
    resize: 'vertical'
};

const modalActionButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    textAlign: 'left',
    transition: 'background-color 0.2s'
};

const dividerStyle: React.CSSProperties = {
    height: '1px',
    backgroundColor: '#eee',
    margin: '15px 0'
};

const checkboxGroupStyle: React.CSSProperties = {
    marginBottom: '20px'
};

const checkboxStyle: React.CSSProperties = {
    display: 'inline-block',
    marginRight: '20px',
    fontSize: '14px',
    cursor: 'pointer'
};

const modalButtonGroupStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '10px'
};

const primaryButtonStyle: React.CSSProperties = {
    padding: '8px 16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
};

const secondaryButtonStyle: React.CSSProperties = {
    padding: '8px 16px',
    backgroundColor: '#f5f5f5',
    color: '#333',
    border: '1px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
};