import { useEffect, useRef, useState, useCallback } from 'react';
import type { Cell, SaveStatus } from '../types';
import { api } from '../services/api';

interface UseAutoSaveProps {
    documentId: string | null;
    data: Cell[][];
    rows: number;
    cols: number;
    onSaveComplete?: () => void;
}

export const useAutoSave = ({ documentId, data, rows, cols, onSaveComplete }: UseAutoSaveProps) => {
    const [saveStatus, setSaveStatus] = useState<SaveStatus>({
        state: 'saved',
        lastSaved: null
    });
    
    const timeoutRef = useRef<number | null>(null); // number вместо NodeJS.Timeout
    const isSavingRef = useRef(false);
    const lastSavedDataRef = useRef<string>('');
    const hasUnsavedChangesRef = useRef(false);

    const save = useCallback(async () => {
        if (!documentId || isSavingRef.current) return;
        
        const currentDataString = JSON.stringify(data);
        if (currentDataString === lastSavedDataRef.current) {
            setSaveStatus({ state: 'saved', lastSaved: new Date() });
            return;
        }
        
        isSavingRef.current = true;
        setSaveStatus({ state: 'saving', lastSaved: null });
        
        try {
            await api.updateDocument(documentId, data, rows, cols);
            lastSavedDataRef.current = currentDataString;
            hasUnsavedChangesRef.current = false;
            setSaveStatus({ state: 'saved', lastSaved: new Date() });
            onSaveComplete?.();
        } catch (error) {
            console.error('Save error:', error);
            setSaveStatus({ 
                state: 'error', 
                lastSaved: null,
                errorMessage: 'Ошибка сохранения'
            });
            
            setTimeout(() => {
                if (saveStatus.state === 'error') {
                    setSaveStatus(prev => ({ ...prev, state: 'saved' }));
                }
            }, 3000);
        } finally {
            isSavingRef.current = false;
        }
    }, [documentId, data, rows, cols, onSaveComplete, saveStatus.state]);

    // АВТОСОХРАНЕНИЕ С ДЕБАНСОМ
    useEffect(() => {
        if (!documentId) return;
        
        const currentDataString = JSON.stringify(data);
        if (currentDataString === lastSavedDataRef.current) return;
        
        hasUnsavedChangesRef.current = true;
        
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);// отменяем предыдущий таймер
        }
        
        timeoutRef.current = window.setTimeout(() => { // window.setTimeout вместо просто setTimeout
            save();//cохраняем только после паузы
        }, 500);// запускается при КАЖДОМ изменении data
        
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [data, documentId, save]);

    // РУЧНОЕ СОХРАНЕНИЕ (Ctrl+S)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (hasUnsavedChangesRef.current) {
                    save();
                }
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [save]);

    // BEFOREUNLOAD
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChangesRef.current) {
                e.preventDefault();
                e.returnValue = 'У вас есть несохраненные изменения. Вы уверены?';
                return e.returnValue;
            }
        };
        
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    // ИНИЦИАЛИЗАЦИЯ
    useEffect(() => {
        if (documentId && data.length > 0) {
            lastSavedDataRef.current = JSON.stringify(data);
            hasUnsavedChangesRef.current = false;
            setSaveStatus({ state: 'saved', lastSaved: new Date() });
        }
    }, [documentId]);

    return { saveStatus, save, hasUnsavedChanges: hasUnsavedChangesRef.current };
};