import React from 'react';
import type { SaveStatus } from '../types';

interface SaveIndicatorProps {
    status: SaveStatus;
}

export const SaveIndicator: React.FC<SaveIndicatorProps> = ({ status }) => {
    const getIcon = () => {
        switch (status.state) {
            case 'saved':
                return '✅';
            case 'saving':
                return '💾';
            case 'error':
                return '⚠️';
            default:
                return '';
        }
    };

    const getText = () => {
        switch (status.state) {
            case 'saved':
                return status.lastSaved ? `Сохранено ${status.lastSaved.toLocaleTimeString()}` : 'Сохранено';
            case 'saving':
                return 'Сохранение...';
            case 'error':
                return status.errorMessage || 'Ошибка сохранения';
            default:
                return '';
        }
    };

    const getColor = () => {
        switch (status.state) {
            case 'saved':
                return '#4CAF50';
            case 'saving':
                return '#FF9800';
            case 'error':
                return '#f44336';
            default:
                return '#666';
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            fontSize: '12px',
            color: getColor()
        }}>
            <span>{getIcon()}</span>
            <span>{getText()}</span>
        </div>
    );
};