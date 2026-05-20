// components/CSVImportModal.tsx
import React, { useState } from 'react';
import type { Cell } from '../types';
import { csvToData, detectDelimiter } from '../utils/csvUtils';
import { formatValue } from '../formulas';

interface CSVImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (data: Cell[][], headers: string[]) => void;
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({ isOpen, onClose, onImport }) => {
    const [csvContent, setCsvContent] = useState('');
    const [delimiter, setDelimiter] = useState(',');
    const [hasHeader, setHasHeader] = useState(true);
    const [previewData, setPreviewData] = useState<{ headers: string[]; data: Cell[][] } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setCsvContent(content);
            
            const firstLine = content.split(/\r?\n/)[0];
            const detectedDelimiter = detectDelimiter(firstLine);
            setDelimiter(detectedDelimiter);
            
            try {
                const result = csvToData(content, detectedDelimiter, hasHeader);
                setPreviewData(result);
                setError(null);
            } catch (err) {
                setError('Ошибка при разборе CSV файла');
            }
        };
        reader.readAsText(file, 'UTF-8');
    };

    const updatePreview = () => {
        if (csvContent) {
            try {
                const result = csvToData(csvContent, delimiter, hasHeader);
                setPreviewData(result);
                setError(null);
            } catch (err) {
                setError('Ошибка при разборе CSV файла');
            }
        }
    };

    const handleImport = () => {
        if (previewData && previewData.data.length > 0) {
            onImport(previewData.data, previewData.headers);
            onClose();
            setCsvContent('');
            setPreviewData(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                <h2 style={titleStyle}>Импорт CSV файла</h2>
                
                <div style={fieldStyle}>
                    <label style={labelStyle}>Выберите CSV файл:</label>
                    <input type="file" accept=".csv,.txt" onChange={handleFileUpload} style={inputStyle} />
                </div>
                
                {csvContent && (
                    <>
                        <div style={settingsStyle}>
                            <h3 style={subtitleStyle}>Настройки импорта</h3>
                            <div style={fieldRowStyle}>
                                <div style={fieldStyle}>
                                    <label style={labelStyle}>Разделитель:</label>
                                    <select value={delimiter} onChange={(e) => { setDelimiter(e.target.value); setTimeout(updatePreview, 0); }} style={selectStyle}>
                                        <option value=",">Запятая (,)</option>
                                        <option value=";">Точка с запятой (;)</option>
                                        <option value="\t">Табуляция</option>
                                        <option value="|">Вертикальная черта (|)</option>
                                    </select>
                                </div>
                                <div style={fieldStyle}>
                                    <label style={labelStyle}>
                                        <input type="checkbox" checked={hasHeader} onChange={(e) => { setHasHeader(e.target.checked); setTimeout(updatePreview, 0); }} />
                                        Первая строка - заголовки
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        {previewData && (
                            <div style={previewContainerStyle}>
                                <h3 style={subtitleStyle}>Предпросмотр</h3>
                                <div style={tableWrapperStyle}>
                                    <table style={previewTableStyle}>
                                        <thead>
                                            <tr>
                                                {previewData.headers.slice(0, 5).map((header, i) => (
                                                    <th key={i} style={previewHeaderStyle}>{header || `Колонка ${i + 1}`}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {previewData.data.slice(0, 5).map((row, i) => (
                                                <tr key={i}>
                                                    {row.slice(0, 5).map((cell, j) => (
                                                        <td key={j} style={previewCellStyle}>{formatValue(cell.value)}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div style={infoStyle}>Всего строк: {previewData.data.length} | Столбцов: {previewData.headers.length}</div>
                            </div>
                        )}
                        
                        {error && <div style={errorStyle}>⚠️ {error}</div>}
                        
                        <div style={buttonRowStyle}>
                            <button onClick={onClose} style={cancelButtonStyle}>Отмена</button>
                            <button onClick={handleImport} style={createButtonStyle}>Импортировать</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// СТИЛИ
const overlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 };
const modalStyle: React.CSSProperties = { backgroundColor: 'white', borderRadius: '8px', padding: '24px', minWidth: '500px', maxWidth: '90vw', maxHeight: '80vh', overflow: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' };
const titleStyle: React.CSSProperties = { margin: '0 0 20px 0', fontSize: '20px' };
const subtitleStyle: React.CSSProperties = { margin: '0 0 15px 0', fontSize: '16px', color: '#333' };
const fieldStyle: React.CSSProperties = { marginBottom: '15px' };
const fieldRowStyle: React.CSSProperties = { display: 'flex', gap: '20px', flexWrap: 'wrap' };
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '5px', fontSize: '14px', color: '#333' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' };
const selectStyle: React.CSSProperties = { padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', minWidth: '150px' };
const settingsStyle: React.CSSProperties = { padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', marginBottom: '20px' };
const previewContainerStyle: React.CSSProperties = { marginBottom: '20px' };
const tableWrapperStyle: React.CSSProperties = { overflowX: 'auto', maxHeight: '250px', border: '1px solid #ddd', borderRadius: '4px' };
const previewTableStyle: React.CSSProperties = { borderCollapse: 'collapse', width: '100%', fontSize: '12px' };
const previewHeaderStyle: React.CSSProperties = { border: '1px solid #ddd', padding: '8px', backgroundColor: '#f0f0f0', fontWeight: 'bold' };
const previewCellStyle: React.CSSProperties = { border: '1px solid #ddd', padding: '6px', textAlign: 'left' };
const infoStyle: React.CSSProperties = { marginTop: '10px', fontSize: '12px', color: '#666' };
const errorStyle: React.CSSProperties = { padding: '10px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '15px' };
const buttonRowStyle: React.CSSProperties = { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' };
const cancelButtonStyle: React.CSSProperties = { padding: '8px 16px', backgroundColor: '#ccc', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const createButtonStyle: React.CSSProperties = { padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };