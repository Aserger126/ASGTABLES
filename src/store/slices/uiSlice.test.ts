// store/slices/uiSlice.test.ts
import { describe, it, expect } from 'vitest';
import uiReducer, {
    setShowDashboard,
    setShowCreateModal,
    setShowCSVImportModal,
    setActiveCell,
    setSaveStatus,
    showNotification,
    hideNotification,
    setNavigationBlocked
} from './uiSlice';
import type { SaveStatus } from '../../types';

describe('uiSlice', () => {
    const initialState = {
        showDashboard: true,
        showCreateModal: false,
        showCSVImportModal: false,
        isNavigationBlocked: false,
        activeCell: null,
        saveStatus: {
            state: 'saved' as const,  // ← ДОБАВЛЯЕМ as const
            lastSaved: null
        },
        notification: null
    };

    it('should return initial state', () => {
        expect(uiReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle setShowDashboard', () => {
        const actual = uiReducer(initialState, setShowDashboard(false));
        expect(actual.showDashboard).toBe(false);
    });

    it('should handle setShowCreateModal', () => {
        const actual = uiReducer(initialState, setShowCreateModal(true));
        expect(actual.showCreateModal).toBe(true);
    });

    it('should handle setShowCSVImportModal', () => {
        const actual = uiReducer(initialState, setShowCSVImportModal(true));
        expect(actual.showCSVImportModal).toBe(true);
    });

    it('should handle setActiveCell', () => {
        const activeCell = { row: 5, col: 3 };
        const actual = uiReducer(initialState, setActiveCell(activeCell));
        expect(actual.activeCell).toEqual(activeCell);
    });

    it('should handle setActiveCell with null', () => {
        const stateWithCell = { ...initialState, activeCell: { row: 5, col: 3 } };
        const actual = uiReducer(stateWithCell, setActiveCell(null));
        expect(actual.activeCell).toBeNull();
    });

    it('should handle setSaveStatus', () => {
        const saveStatus: SaveStatus = { state: 'saving', lastSaved: null };
        const actual = uiReducer(initialState, setSaveStatus(saveStatus));
        expect(actual.saveStatus).toEqual(saveStatus);
    });

    it('should handle showNotification', () => {
        const notification = { message: 'Test message', type: 'success' as const };
        const actual = uiReducer(initialState, showNotification(notification));
        expect(actual.notification).toEqual(notification);
    });

    it('should handle hideNotification', () => {
        const stateWithNotification = {
            ...initialState,
            notification: { message: 'Test', type: 'success' as const }
        };
        const actual = uiReducer(stateWithNotification, hideNotification());
        expect(actual.notification).toBeNull();
    });

    it('should handle setNavigationBlocked', () => {
        const actual = uiReducer(initialState, setNavigationBlocked(true));
        expect(actual.isNavigationBlocked).toBe(true);
    });
});