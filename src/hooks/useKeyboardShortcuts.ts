// hooks/useKeyboardShortcuts.ts
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { undo, redo } from '../store/slices/spreadsheetSlice';

interface UseKeyboardShortcutsProps {
    onSave: () => void;
    onBold: () => void;
    onItalic: () => void;
    onUnderline: () => void;
    onCut: () => void;
    onCopy: () => void;
    onPaste: () => void;
    onDelete: () => void;
    onSelectAll: () => void;
}

export const useKeyboardShortcuts = ({
    onSave,
    onBold,
    onItalic,
    onUnderline,
    onCut,
    onCopy,
    onPaste,
    onDelete,
    onSelectAll
}: UseKeyboardShortcutsProps) => {
    const dispatch = useAppDispatch();
    const { canUndo, canRedo, selection } = useAppSelector(state => ({
        canUndo: state.spreadsheet.history.past.length > 0,
        canRedo: state.spreadsheet.history.future.length > 0,
        selection: state.spreadsheet.selection
    }));

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isCtrl = e.ctrlKey || e.metaKey;
            
            if (isCtrl && e.key === 's') {
                e.preventDefault();
                onSave();
            }
            
            if (isCtrl && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                if (canUndo) dispatch(undo());
            }
            
            if ((isCtrl && e.key === 'y') || (isCtrl && e.shiftKey && e.key === 'Z')) {
                e.preventDefault();
                if (canRedo) dispatch(redo());
            }
            
            if (isCtrl && e.key === 'b') {
                e.preventDefault();
                onBold();
            }
            
            if (isCtrl && e.key === 'i') {
                e.preventDefault();
                onItalic();
            }
            
            if (isCtrl && e.key === 'u') {
                e.preventDefault();
                onUnderline();
            }
            
            if (isCtrl && e.key === 'x') {
                e.preventDefault();
                onCut();
            }
            
            if (isCtrl && e.key === 'c') {
                e.preventDefault();
                onCopy();
            }
            
            if (isCtrl && e.key === 'v') {
                e.preventDefault();
                onPaste();
            }
            
            if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault();
                if (selection) onDelete();
            }
            
            if (isCtrl && e.key === 'a') {
                e.preventDefault();
                onSelectAll();
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [dispatch, canUndo, canRedo, selection, onSave, onBold, onItalic, onUnderline, onCut, onCopy, onPaste, onDelete, onSelectAll]);
};