import React, { useState } from 'react';

interface CreateDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (name: string, rows: number, cols: number) => void;
}

export const CreateDocumentModal: React.FC<CreateDocumentModalProps> = ({ isOpen, onClose, onCreate }) => {
    const [name, setName] = useState('Новый документ');
    const [rows, setRows] = useState(50);
    const [cols, setCols] = useState(26);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onCreate(name.trim(), rows, cols);
            setName('Новый документ');
            setRows(50);
            setCols(26);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                <h2 style={titleStyle}>Создать новый документ</h2>
                
                <form onSubmit={handleSubmit}>
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Название документа:</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                            style={inputStyle}
                        />
                    </div>
                    
                    <div style={fieldRowStyle}>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>Строки:</label>
                            <input
                                type="number"
                                value={rows}
                                onChange={(e) => setRows(Math.max(1, Math.min(1000, parseInt(e.target.value) || 1)))}
                                min={1}
                                max={1000}
                                style={inputSmallStyle}
                            />
                        </div>
                        
                        <div style={fieldStyle}>
                            <label style={labelStyle}>Столбцы:</label>
                            <input
                                type="number"
                                value={cols}
                                onChange={(e) => setCols(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                                min={1}
                                max={100}
                                style={inputSmallStyle}
                            />
                        </div>
                    </div>
                    
                    <div style={buttonRowStyle}>
                        <button type="button" onClick={onClose} style={cancelButtonStyle}>
                            Отмена
                        </button>
                        <button type="submit" style={createButtonStyle}>
                            Создать
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// СТИЛИ
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
    borderRadius: '8px',
    padding: '24px',
    minWidth: '400px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
};

const titleStyle: React.CSSProperties = {
    margin: '0 0 20px 0',
    fontSize: '20px'
};

const fieldStyle: React.CSSProperties = {
    marginBottom: '15px'
};

const fieldRowStyle: React.CSSProperties = {
    display: 'flex',
    gap: '20px',
    marginBottom: '15px'
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '5px',
    fontSize: '14px',
    color: '#333'
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px'
};

const inputSmallStyle: React.CSSProperties = {
    width: '100px',
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px'
};

const buttonRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px'
};

const cancelButtonStyle: React.CSSProperties = {
    padding: '8px 16px',
    backgroundColor: '#ccc',
    color: '#333',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
};

const createButtonStyle: React.CSSProperties = {
    padding: '8px 16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
};