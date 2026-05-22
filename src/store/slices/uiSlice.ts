// store/slices/uiSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SaveStatus } from '../../types';

interface UiState {
    showDashboard: boolean;
    showCreateModal: boolean;
    showCSVImportModal: boolean;
    activeCell: { row: number; col: number } | null;
    saveStatus: SaveStatus;
    notification: { message: string; type: 'success' | 'error' | 'info' } | null;
    isNavigationBlocked: boolean;
}


const initialState: UiState = {
    showDashboard: true,
    showCreateModal: false,
    showCSVImportModal: false,
    isNavigationBlocked: false,
    activeCell: null,
    saveStatus: {
        state: 'saved',
        lastSaved: null
    },
    notification: null
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setShowDashboard: (state, action: PayloadAction<boolean>) => {
            state.showDashboard = action.payload;
        },
        setShowCreateModal: (state, action: PayloadAction<boolean>) => {
            state.showCreateModal = action.payload;
        },
        setShowCSVImportModal: (state, action: PayloadAction<boolean>) => {
            state.showCSVImportModal = action.payload;
        },
        setActiveCell: (state, action: PayloadAction<{ row: number; col: number } | null>) => {
            state.activeCell = action.payload;
        },
        setSaveStatus: (state, action: PayloadAction<SaveStatus>) => {
            state.saveStatus = action.payload;
        },
        showNotification: (state, action: PayloadAction<{ message: string; type: 'success' | 'error' | 'info' }>) => {
            state.notification = action.payload;
        },
        hideNotification: (state) => {
            state.notification = null;
        },
        setNavigationBlocked: (state, action: PayloadAction<boolean>) => {
            state.isNavigationBlocked = action.payload;
},
    }
});

export const {
    setShowDashboard,
    setShowCreateModal,
    setShowCSVImportModal,
    setActiveCell,
    setSaveStatus,
    showNotification,
    hideNotification
} = uiSlice.actions;

export default uiSlice.reducer;