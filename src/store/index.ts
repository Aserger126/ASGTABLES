// store/index.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import spreadsheetReducer from './slices/spreadsheetSlice';
import documentsReducer from './slices/documentsSlice';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';
import { autoSaveMiddleware } from './slices/autoSaveMiddleware';
import type { RootState as RootStateType } from './index';

// СОЗДАЁМ КОРНЕВОЙ REDUCER ЯВНО
const rootReducer = combineReducers({
    spreadsheet: spreadsheetReducer,
    documents: documentsReducer,
    ui: uiReducer,
    auth: authReducer
});

// ФУНКЦИЯ ДЛЯ ЗАГРУЗКИ СОСТОЯНИЯ ИЗ localStorage
const loadState = () => {
    try {
        const serializedState = localStorage.getItem('redux_state');
        if (serializedState === null) {
            return undefined;
        }
        const parsed = JSON.parse(serializedState);
        // ВОССТАНАВЛИВАЕМ ТОЛЬКО auth СОСТОЯНИЕ
        return {
            auth: parsed.auth
        };
    } catch (err) {
        console.error('Failed to load state:', err);
        return undefined;
    }
};

// ФУНКЦИЯ ДЛЯ СОХРАНЕНИЯ СОСТОЯНИЯ
const saveState = (state: RootStateType) => {
    try {
        const serializedState = JSON.stringify({
            auth: state.auth
        });
        localStorage.setItem('redux_state', serializedState);
    } catch (err) {
        console.error('Failed to save state:', err);
    }
};

const preloadedState = loadState();

// СОЗДАЁМ STORE
export const store = configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false
        }).concat(autoSaveMiddleware)
});

// ПОДПИСЫВАЕМСЯ НА ИЗМЕНЕНИЯ STORE
store.subscribe(() => {
    saveState(store.getState());
});

// ЭКСПОРТИРУЕМ ТИПЫ
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;