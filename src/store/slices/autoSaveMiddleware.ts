// store/middleware/autoSaveMiddleware.ts
import type { Middleware } from '@reduxjs/toolkit';
import { updateDocument } from '../slices/documentsSlice';
import { setSaveStatus } from '../slices/uiSlice';
import type { RootState } from '../index';

let saveTimeout: number | null = null;
let lastSavedData = '';

// ФУНКЦИЯ ДЛЯ ПРОВЕРКИ, НУЖНО ЛИ СОХРАНЕНИЕ
const isActionNeedsSave = (actionType: string): boolean => {
    const actionsThatNeedSave = [
        'spreadsheet/updateCell',
        'spreadsheet/addRow',
        'spreadsheet/deleteRow',
        'spreadsheet/addColumn',
        'spreadsheet/deleteColumn',
        'spreadsheet/clearAll',
        'spreadsheet/findAndReplace'
    ];
    return actionsThatNeedSave.includes(actionType);
};

// ФУНКЦИЯ СОХРАНЕНИЯ
const performSave = async (store: any, documentId: string, data: any[][], rows: number, cols: number) => {
    try {
        await store.dispatch(updateDocument({
            id: documentId,
            data,
            rows,
            cols
        })).unwrap();
        
        return { success: true };
    } catch (error) {
        console.error('Save error:', error);
        return { success: false, error };
    }
};

export const autoSaveMiddleware: Middleware = (store) => (next) => (action) => {
    const result = next(action);
    
    const actionType = (action as { type?: string }).type;
    
    if (actionType && isActionNeedsSave(actionType)) {
        const state = store.getState() as RootState;
        const { currentDocumentId } = state.documents;
        const { data, rows, cols } = state.spreadsheet;
        
        if (currentDocumentId && data.length > 0) {
            const currentDataString = JSON.stringify(data);
            
            if (currentDataString === lastSavedData) {
                return result;
            }
            
            store.dispatch(setSaveStatus({ state: 'saving', lastSaved: null }));
            
            if (saveTimeout) {
                clearTimeout(saveTimeout);
            }
            
            saveTimeout = window.setTimeout(async () => {
                const { success } = await performSave(store, currentDocumentId, data, rows, cols);
                
                if (success) {
                    lastSavedData = currentDataString;
                    store.dispatch(setSaveStatus({ state: 'saved', lastSaved: new Date() }));
                } else {
                    store.dispatch(setSaveStatus({ 
                        state: 'error', 
                        lastSaved: null,
                        errorMessage: 'Ошибка сохранения'
                    }));
                    
                    setTimeout(() => {
                        const currentState = store.getState() as RootState;
                        if (currentState.ui.saveStatus.state === 'error') {
                            store.dispatch(setSaveStatus({ state: 'saved', lastSaved: new Date() }));
                        }
                    }, 3000);
                }
            }, 500);
        }
    }
    
    return result;
};