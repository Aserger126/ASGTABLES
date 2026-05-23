// store/slices/documentsSlice.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import documentsReducer, {
    fetchDocuments,
    fetchDocumentById,
    createDocument,
    updateDocument,
    renameDocument,
    deleteDocument,
    duplicateDocument,
    setCurrentDocumentId,
    clearCurrentDocument
} from './documentsSlice';
import type { Document, DocumentData, Cell } from '../../types';

// МОКАЕМ API
vi.mock('../../services/api', () => ({
    api: {
        getDocuments: vi.fn(),
        getDocument: vi.fn(),
        createDocument: vi.fn(),
        updateDocument: vi.fn(),
        renameDocument: vi.fn(),
        deleteDocument: vi.fn(),
        duplicateDocument: vi.fn(),
        setCurrentDocumentId: vi.fn()
    }
}));

import { api } from '../../services/api';

describe('documentsSlice', () => {
    const initialState = {
        list: [],
        currentDocument: null,
        currentDocumentId: null,
        isLoading: false,
        error: null
    };

    const mockDocument: Document = {
        id: '1',
        name: 'Test Document',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rows: 50,
        cols: 26,
        previewData: []
    };

    const mockDocumentData: DocumentData = {
        id: '1',
        name: 'Test Document',
        data: [],
        rows: 50,
        cols: 26,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return initial state', () => {
        expect(documentsReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    describe('reducers', () => {
        it('should handle setCurrentDocumentId', () => {
            const actual = documentsReducer(initialState, setCurrentDocumentId('123'));
            expect(actual.currentDocumentId).toBe('123');
        });

        it('should handle clearCurrentDocument', () => {
            const stateWithDoc = {
                ...initialState,
                currentDocument: mockDocumentData,
                currentDocumentId: '1'
            };
            const actual = documentsReducer(stateWithDoc, clearCurrentDocument());
            expect(actual.currentDocument).toBeNull();
            expect(actual.currentDocumentId).toBeNull();
        });
    });

    describe('fetchDocuments', () => {
        it('should handle pending', () => {
            const action = { type: fetchDocuments.pending.type };
            const actual = documentsReducer(initialState, action);
            expect(actual.isLoading).toBe(true);
            expect(actual.error).toBeNull();
        });

        it('should handle fulfilled', () => {
            const action = { type: fetchDocuments.fulfilled.type, payload: [mockDocument] };
            const actual = documentsReducer(initialState, action);
            expect(actual.isLoading).toBe(false);
            expect(actual.list).toEqual([mockDocument]);
        });

        it('should handle rejected', () => {
            const action = { type: fetchDocuments.rejected.type, error: { message: 'Error' } };
            const actual = documentsReducer(initialState, action);
            expect(actual.isLoading).toBe(false);
            expect(actual.error).toBe('Error');
        });
    });

    describe('fetchDocumentById', () => {
        it('should handle fulfilled', () => {
            const action = { type: fetchDocumentById.fulfilled.type, payload: mockDocumentData };
            const actual = documentsReducer(initialState, action);
            expect(actual.currentDocument).toEqual(mockDocumentData);
            expect(actual.currentDocumentId).toBe('1');
        });
    });

    describe('createDocument', () => {
        it('should handle fulfilled and add to list', () => {
            const action = { type: createDocument.fulfilled.type, payload: mockDocumentData };
            const actual = documentsReducer(initialState, action);
            
            expect(actual.list).toHaveLength(1);
            expect(actual.list[0].id).toBe('1');
            expect(actual.currentDocument).toEqual(mockDocumentData);
            expect(actual.currentDocumentId).toBe('1');
        });
    });

    describe('updateDocument', () => {
        it('should handle fulfilled and update current document', () => {
            const stateWithDoc = {
                ...initialState,
                list: [mockDocument],
                currentDocument: mockDocumentData
            };
            const updatedDoc = { ...mockDocumentData, name: 'Updated Name' };
            const action = { type: updateDocument.fulfilled.type, payload: updatedDoc };
            const actual = documentsReducer(stateWithDoc, action);
            
            expect(actual.currentDocument?.name).toBe('Updated Name');
        });
    });

    describe('renameDocument', () => {
        it('should handle fulfilled and update document name', () => {
            const stateWithDoc = {
                ...initialState,
                list: [mockDocument],
                currentDocument: mockDocumentData
            };
            const renamedDoc = { ...mockDocumentData, name: 'Renamed Document' };
            const action = { type: renameDocument.fulfilled.type, payload: renamedDoc };
            const actual = documentsReducer(stateWithDoc, action);
            
            expect(actual.currentDocument?.name).toBe('Renamed Document');
            expect(actual.list[0].name).toBe('Renamed Document');
        });
    });

    describe('deleteDocument', () => {
        it('should handle fulfilled and remove from list', () => {
            const stateWithDoc = {
                ...initialState,
                list: [mockDocument],
                currentDocumentId: '1'
            };
            const action = { type: deleteDocument.fulfilled.type, payload: '1' };
            const actual = documentsReducer(stateWithDoc, action);
            
            expect(actual.list).toHaveLength(0);
            expect(actual.currentDocumentId).toBeNull();
        });
    });

    describe('duplicateDocument', () => {
        it('should handle fulfilled and add duplicate to list', () => {
            const duplicatedDoc = { ...mockDocumentData, id: '2', name: 'Test Document (копия)' };
            const action = { type: duplicateDocument.fulfilled.type, payload: duplicatedDoc };
            const actual = documentsReducer(initialState, action);
            
            expect(actual.list).toHaveLength(1);
            expect(actual.list[0].name).toBe('Test Document (копия)');
        });
    });
});