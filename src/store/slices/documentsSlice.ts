// store/slices/documentsSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Document, DocumentData, Cell } from '../../types';
import { api } from '../../services/api';

// СОСТОЯНИЕ
interface DocumentsState {
    list: Document[];
    currentDocument: DocumentData | null;
    currentDocumentId: string | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: DocumentsState = {
    list: [],
    currentDocument: null,
    currentDocumentId: null,
    isLoading: false,
    error: null
};

// АСИНХРОННЫЕ THUNKS
export const fetchDocuments = createAsyncThunk(
    'documents/fetchAll',
    async () => {
        return await api.getDocuments();
    }
);

export const fetchDocumentById = createAsyncThunk(
    'documents/fetchById',
    async (id: string) => {
        return await api.getDocument(id);
    }
);

export const createDocument = createAsyncThunk(
    'documents/create',
    async ({ name, rows, cols }: { name: string; rows: number; cols: number }) => {
        return await api.createDocument(name, rows, cols);
    }
);

export const updateDocument = createAsyncThunk(
    'documents/update',
    async ({ id, data, rows, cols }: { id: string; data: Cell[][]; rows: number; cols: number }) => {
        return await api.updateDocument(id, data, rows, cols);
    }
);

export const renameDocument = createAsyncThunk(
    'documents/rename',
    async ({ id, newName }: { id: string; newName: string }) => {
        return await api.renameDocument(id, newName);
    }
);

export const deleteDocument = createAsyncThunk(
    'documents/delete',
    async (id: string) => {
        await api.deleteDocument(id);
        return id;
    }
);

export const duplicateDocument = createAsyncThunk(
    'documents/duplicate',
    async (id: string) => {
        return await api.duplicateDocument(id);
    }
);

const documentsSlice = createSlice({
    name: 'documents',
    initialState,
    reducers: {
        setCurrentDocumentId: (state, action: PayloadAction<string | null>) => {
            state.currentDocumentId = action.payload;
            if (action.payload) {
                api.setCurrentDocumentId(action.payload);
            }
        },
        clearCurrentDocument: (state) => {
            state.currentDocument = null;
            state.currentDocumentId = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // FETCH DOCUMENTS
            .addCase(fetchDocuments.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchDocuments.fulfilled, (state, action) => {
                state.isLoading = false;
                state.list = action.payload;
            })
            .addCase(fetchDocuments.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Ошибка загрузки документов';
            })
            // FETCH DOCUMENT BY ID
            .addCase(fetchDocumentById.fulfilled, (state, action) => {
                if (action.payload) {
                    state.currentDocument = action.payload;
                    state.currentDocumentId = action.payload.id;
                }
            })
            // CREATE DOCUMENT
            .addCase(createDocument.fulfilled, (state, action) => {
                state.list.unshift({
                    id: action.payload.id,
                    name: action.payload.name,
                    createdAt: action.payload.createdAt,
                    updatedAt: action.payload.updatedAt,
                    rows: action.payload.rows,
                    cols: action.payload.cols,
                    previewData: action.payload.data.slice(0, 3).map(row => row.slice(0, 3))
                });
                state.currentDocument = action.payload;
                state.currentDocumentId = action.payload.id;
            })
            // UPDATE DOCUMENT
            .addCase(updateDocument.fulfilled, (state, action) => {
                state.currentDocument = action.payload;
                // ОБНОВЛЯЕМ В СПИСКЕ
                const index = state.list.findIndex(d => d.id === action.payload.id);
                if (index !== -1) {
                    state.list[index] = {
                        ...state.list[index],
                        updatedAt: action.payload.updatedAt,
                        rows: action.payload.rows,
                        cols: action.payload.cols,
                        previewData: action.payload.data.slice(0, 3).map(row => row.slice(0, 3))
                    };
                }
            })
            // RENAME DOCUMENT
            .addCase(renameDocument.fulfilled, (state, action) => {
                if (state.currentDocument?.id === action.payload.id) {
                    state.currentDocument = action.payload;
                }
                const index = state.list.findIndex(d => d.id === action.payload.id);
                if (index !== -1) {
                    state.list[index] = {
                        ...state.list[index],
                        name: action.payload.name,
                        updatedAt: action.payload.updatedAt
                    };
                }
            })
            // DELETE DOCUMENT
            .addCase(deleteDocument.fulfilled, (state, action) => {
                state.list = state.list.filter(d => d.id !== action.payload);
                if (state.currentDocumentId === action.payload) {
                    state.currentDocument = null;
                    state.currentDocumentId = null;
                }
            })
            // DUPLICATE DOCUMENT
            .addCase(duplicateDocument.fulfilled, (state, action) => {
                state.list.unshift({
                    id: action.payload.id,
                    name: action.payload.name,
                    createdAt: action.payload.createdAt,
                    updatedAt: action.payload.updatedAt,
                    rows: action.payload.rows,
                    cols: action.payload.cols,
                    previewData: action.payload.data.slice(0, 3).map(row => row.slice(0, 3))
                });
            });
    }
});

export const { setCurrentDocumentId, clearCurrentDocument } = documentsSlice.actions;
export default documentsSlice.reducer;