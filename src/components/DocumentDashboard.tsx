import React, { useState, useEffect } from 'react';
import type { Document, Cell } from '../types';
import { api } from '../services/api';
import { formatValue } from '../formulas';

interface DocumentDashboardProps {
    onSelectDocument: (docId: string) => void;
    onCreateNew: () => void;
}

export const DocumentDashboard: React.FC<DocumentDashboardProps> = ({ onSelectDocument, onCreateNew }) => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [newName, setNewName] = useState('');

    // ЗАГРУЗКА ДОКУМЕНТОВ
    const loadDocuments = async () => {
        setLoading(true);
        try {
            const docs = await api.getDocuments();
            setDocuments(docs);
        } catch (error) {
            console.error('Failed to load documents:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDocuments();
    }, []);

    // УДАЛЕНИЕ ДОКУМЕНТА
    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Вы уверены, что хотите удалить документ "${name}"?`)) {
            try {
                await api.deleteDocument(id);
                await loadDocuments();
            } catch (error) {
                alert('Ошибка при удалении документа');
            }
        }
    };

    // ДУБЛИРОВАНИЕ ДОКУМЕНТА
    const handleDuplicate = async (id: string) => {
        try {
            await api.duplicateDocument(id);
            await loadDocuments();
        } catch (error) {
            alert('Ошибка при дублировании документа');
        }
    };

    // ПЕРЕИМЕНОВАНИЕ
    const handleRename = async (id: string) => {
        if (!newName.trim()) return;
        try {
            await api.renameDocument(id, newName);
            setRenamingId(null);
            setNewName('');
            await loadDocuments();
        } catch (error) {
            alert('Ошибка при переименовании');
        }
    };

    // ФОРМАТИРОВАНИЕ ДАТЫ
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // РЕНДЕР ПРЕВЬЮ ТАБЛИЦЫ (3x3)
    const renderPreview = (previewData?: Cell[][]) => {
        if (!previewData || previewData.length === 0) {
            return <div style={previewEmptyStyle}>Нет данных</div>;
        }
        
        return (
            <table style={previewTableStyle}>
                <tbody>
                    {previewData.map((row, i) => (
                        <tr key={i}>
                            {row.map((cell, j) => (
                                <td key={j} style={previewCellStyle}>
                                    {formatValue(cell.value)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    if (loading) {
        return <div style={dashboardStyle}>Загрузка документов...</div>;
    }

    return (
        <div style={dashboardStyle}>
            <div style={headerStyle}>
                <h2>ASG TABLES</h2>
                <button onClick={onCreateNew} style={createButtonStyle}>
                    + Создать новый документ
                </button>
            </div>
            
            {documents.length === 0 ? (
                <div style={emptyStyle}>
                    <p>У вас пока нет документов</p>
                    <button onClick={onCreateNew} style={createButtonStyle}>
                        Создать первый документ
                    </button>
                </div>
            ) : (
                <div style={gridStyle}>
                    {documents.map(doc => (
                        <div key={doc.id} style={cardStyle}>
                            <div style={cardHeaderStyle}>
                                {renamingId === doc.id ? (
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleRename(doc.id);
                                            if (e.key === 'Escape') setRenamingId(null);
                                        }}
                                        autoFocus
                                        style={renameInputStyle}
                                    />
                                ) : (
                                    <h3 style={titleStyle}>{doc.name}</h3>
                                )}
                                <div style={cardActionsStyle}>
                                    {renamingId === doc.id ? (
                                        <>
                                            <button onClick={() => handleRename(doc.id)} style={actionButtonStyle}>✓</button>
                                            <button onClick={() => setRenamingId(null)} style={actionButtonStyle}>✗</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => {
                                                setRenamingId(doc.id);
                                                setNewName(doc.name);
                                            }} style={actionButtonStyle}>✎</button>
                                            <button onClick={() => handleDuplicate(doc.id)} style={actionButtonStyle}>📋</button>
                                            <button onClick={() => handleDelete(doc.id, doc.name)} style={{ ...actionButtonStyle, color: '#ff4444' }}>🗑</button>
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            <div style={previewContainerStyle}>
                                {renderPreview(doc.previewData)}
                            </div>
                            
                            <div style={infoStyle}>
                                <div>Строк: {doc.rows} | Столбцов: {doc.cols}</div>
                                <div style={dateStyle}>Изменён: {formatDate(doc.updatedAt)}</div>
                                <div style={dateStyle}>Создан: {formatDate(doc.createdAt)}</div>
                            </div>
                            
                            <button 
                                onClick={() => onSelectDocument(doc.id)}
                                style={openButtonStyle}
                            >
                                Открыть
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// СТИЛИ
const dashboardStyle: React.CSSProperties = {
    padding: '20px',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5'
};

const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '15px'
};

const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px'
};

const cardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '15px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer'
};

const cardHeaderStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
};

const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: '18px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
};

const cardActionsStyle: React.CSSProperties = {
    display: 'flex',
    gap: '5px'
};

const actionButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '4px 6px',
    borderRadius: '4px',
    transition: 'background-color 0.2s'
};

const previewContainerStyle: React.CSSProperties = {
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    padding: '10px',
    marginBottom: '15px',
    overflow: 'auto'
};

const previewTableStyle: React.CSSProperties = {
    borderCollapse: 'collapse',
    width: '100%'
};

const previewCellStyle: React.CSSProperties = {
    border: '1px solid #ddd',
    padding: '4px',
    fontSize: '12px',
    textAlign: 'left',
    minWidth: '40px'
};

const previewEmptyStyle: React.CSSProperties = {
    textAlign: 'center',
    color: '#999',
    padding: '20px'
};

const infoStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#666',
    marginBottom: '15px'
};

const dateStyle: React.CSSProperties = {
    marginTop: '4px'
};

const openButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
};

const createButtonStyle: React.CSSProperties = {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
};

const emptyStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '60px',
    color: '#666'
};

const renameInputStyle: React.CSSProperties = {
    padding: '4px 8px',
    fontSize: '16px',
    border: '1px solid #4CAF50',
    borderRadius: '4px',
    width: '150px'
};