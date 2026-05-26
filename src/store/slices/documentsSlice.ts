// store/slices/documentsSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Document, DocumentData, Cell } from '../../types';
import { api } from '../../services/api';
import type { RootState } from '../index';

// ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ ПОЛУЧЕНИЯ userId ИЗ STATE
const getUserId = (getState: () => unknown): string | null => {
    const state = getState() as RootState;
    return state.auth.user?.id || null;
};

// ОБНОВЛЁННЫЕ THUNKS С ПЕРЕДАЧЕЙ userId
export const fetchDocuments = createAsyncThunk(
    'documents/fetchAll',
    async (_, { getState }) => {
        const userId = getUserId(getState);
        return await api.getDocuments(userId || undefined);
    }
);

export const fetchDocumentById = createAsyncThunk(
    'documents/fetchById',
    async (id: string, { getState }) => {
        const userId = getUserId(getState);
        const doc = await api.getDocument(id, userId || undefined);
        if (!doc) {
            throw new Error('Document not found');
        }
        return doc;
    }
);

export const createDocument = createAsyncThunk(
    'documents/create',
    async ({ name, rows, cols }: { name: string; rows: number; cols: number }, { getState }) => {
        const userId = getUserId(getState);
        return await api.createDocument(name, rows, cols, userId || undefined);
    }
);

export const updateDocument = createAsyncThunk(
    'documents/update',
    async ({ id, data, rows, cols }: { id: string; data: Cell[][]; rows: number; cols: number }, { getState }) => {
        const userId = getUserId(getState);
        return await api.updateDocument(id, data, rows, cols, userId || undefined);
    }
);

export const renameDocument = createAsyncThunk(
    'documents/rename',
    async ({ id, newName }: { id: string; newName: string }, { getState }) => {
        const userId = getUserId(getState);
        return await api.renameDocument(id, newName, userId || undefined);
    }
);

export const deleteDocument = createAsyncThunk(
    'documents/delete',
    async (id: string, { getState }) => {
        const userId = getUserId(getState);
        await api.deleteDocument(id, userId || undefined);
        return id;
    }
);

export const duplicateDocument = createAsyncThunk(
    'documents/duplicate',
    async (id: string, { getState }) => {
        const userId = getUserId(getState);
        return await api.duplicateDocument(id, userId || undefined);
    }
);

// СОСТОЯНИЕ
interface DocumentsState {
    documents: Document[];
    currentDocument: DocumentData | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: DocumentsState = {
    documents: [],
    currentDocument: null,
    isLoading: false,
    error: null
};

// SLICE
const documentsSlice = createSlice({
    name: 'documents',
    initialState,
    reducers: {
        clearCurrentDocument: (state) => {
            state.currentDocument = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // FETCH DOCUMENTS
            .addCase(fetchDocuments.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchDocuments.fulfilled, (state, action: PayloadAction<Document[]>) => {
                state.isLoading = false;
                state.documents = action.payload;
            })
            .addCase(fetchDocuments.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch documents';
            })
            // FETCH DOCUMENT BY ID
            .addCase(fetchDocumentById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchDocumentById.fulfilled, (state, action: PayloadAction<DocumentData>) => {
                state.isLoading = false;
                state.currentDocument = action.payload;
            })
            .addCase(fetchDocumentById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch document';
            })
            // CREATE DOCUMENT
            .addCase(createDocument.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createDocument.fulfilled, (state, action: PayloadAction<DocumentData>) => {
                state.isLoading = false;
                const newDocument: Document = {
                    id: action.payload.id,
                    name: action.payload.name,
                    createdAt: action.payload.createdAt,
                    updatedAt: action.payload.updatedAt,
                    rows: action.payload.rows,
                    cols: action.payload.cols,
                    previewData: action.payload.data.slice(0, 3).map(row => row.slice(0, 3))
                };
                state.documents.unshift(newDocument);
                state.currentDocument = action.payload;
            })
            .addCase(createDocument.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to create document';
            })
            // UPDATE DOCUMENT
            .addCase(updateDocument.fulfilled, (state, action: PayloadAction<DocumentData>) => {
                state.currentDocument = action.payload;
                const index = state.documents.findIndex(doc => doc.id === action.payload.id);
                if (index !== -1) {
                    state.documents[index] = {
                        ...state.documents[index],
                        updatedAt: action.payload.updatedAt,
                        rows: action.payload.rows,
                        cols: action.payload.cols,
                        previewData: action.payload.data.slice(0, 3).map(row => row.slice(0, 3))
                    };
                }
            })
            // RENAME DOCUMENT
            .addCase(renameDocument.fulfilled, (state, action: PayloadAction<DocumentData>) => {
                if (state.currentDocument?.id === action.payload.id) {
                    state.currentDocument.name = action.payload.name;
                }
                const index = state.documents.findIndex(doc => doc.id === action.payload.id);
                if (index !== -1) {
                    state.documents[index].name = action.payload.name;
                    state.documents[index].updatedAt = action.payload.updatedAt;
                }
            })
            // DELETE DOCUMENT
            .addCase(deleteDocument.fulfilled, (state, action: PayloadAction<string>) => {
                state.documents = state.documents.filter(doc => doc.id !== action.payload);
                if (state.currentDocument?.id === action.payload) {
                    state.currentDocument = null;
                }
            })
            // DUPLICATE DOCUMENT
            .addCase(duplicateDocument.fulfilled, (state, action: PayloadAction<DocumentData>) => {
                const newDocument: Document = {
                    id: action.payload.id,
                    name: action.payload.name,
                    createdAt: action.payload.createdAt,
                    updatedAt: action.payload.updatedAt,
                    rows: action.payload.rows,
                    cols: action.payload.cols,
                    previewData: action.payload.data.slice(0, 3).map(row => row.slice(0, 3))
                };
                state.documents.unshift(newDocument);
            });
    }
});

export const { clearCurrentDocument, clearError } = documentsSlice.actions;
export default documentsSlice.reducer;