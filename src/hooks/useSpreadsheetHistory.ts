import { useState, useCallback, useRef } from 'react';
import type { Cell, HistoryState } from '../types';

export const useSpreadsheetHistory = (initialData: Cell[][]) => {
    const [history, setHistory] = useState<HistoryState[]>([{
        data: JSON.parse(JSON.stringify(initialData)),
        timestamp: Date.now(),
        description: 'Начальное состояние'
    }]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const isUndoRedoRef = useRef(false);
    const timeoutRef = useRef<number | null>(null); // number вместо NodeJS.Timeout

    const saveState = useCallback((newData: Cell[][], description: string) => {
        if (isUndoRedoRef.current) {
            isUndoRedoRef.current = false;
            return;
        }

        const newState: HistoryState = {
            data: JSON.parse(JSON.stringify(newData)),
            timestamp: Date.now(),
            description
        };

        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newState);
        
        if (newHistory.length > 50) {
            newHistory.shift();
        } else {
            setHistoryIndex(newHistory.length - 1);
        }
        
        setHistory(newHistory);
    }, [history, historyIndex]);

    const undo = useCallback((): Cell[][] | null => {
        if (historyIndex > 0) {
            isUndoRedoRef.current = true;
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            return JSON.parse(JSON.stringify(history[newIndex].data));
        }
        return null;
    }, [history, historyIndex]);

    const redo = useCallback((): Cell[][] | null => {
        if (historyIndex < history.length - 1) {
            isUndoRedoRef.current = true;
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            return JSON.parse(JSON.stringify(history[newIndex].data));
        }
        return null;
    }, [history, historyIndex]);

    return {
        saveState,
        undo,
        redo,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1
    };
};
//ЭТО ЗАГЛУШКА, ЧТОБЫ НЕ ВЫЛЕТАЛО ПРИ ИМПОРТЕ