// services/api.ts
import type { Document, DocumentData, Cell } from '../types';

// БАЗОВЫЙ КЛЮЧ (без привязки к пользователю - только для текущего документа)
const CURRENT_DOC_KEY = 'spreadsheet_current_doc';

// ФУНКЦИЯ ДЛЯ ПОЛУЧЕНИЯ КЛЮЧА С ПРЕФИКСОМ ПОЛЬЗОВАТЕЛЯ
const getUserKey = (baseKey: string, userId: string): string => {
    return `user_${userId}_${baseKey}`;
};

// ПОЛУЧИТЬ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ ИЗ STORE (вспомогательная функция)
const getCurrentUserId = (): string | null => {
    try {
        const authState = localStorage.getItem('redux_state_auth');
        if (authState) {
            const parsed = JSON.parse(authState);
            return parsed.user?.id || null;
        }
    } catch (e) {
        console.error('Failed to get user id:', e);
    }
    return null;
};

// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ РАБОТЫ С LOCALSTORAGE (с учётом пользователя)
const getStoredDocuments = (userId: string): Map<string, DocumentData> => {
    const key = getUserKey('spreadsheet_documents', userId);
    const stored = localStorage.getItem(key);
    if (!stored) {
        return new Map();
    }
    const obj = JSON.parse(stored);
    return new Map(Object.entries(obj));
};

const setStoredDocuments = (userId: string, docs: Map<string, DocumentData>) => {
    const key = getUserKey('spreadsheet_documents', userId);
    const obj = Object.fromEntries(docs);
    localStorage.setItem(key, JSON.stringify(obj));
};

// API ДЛЯ РАБОТЫ С ДОКУМЕНТАМИ (с учётом пользователя)
export const api = {
    // ПОЛУЧИТЬ ВСЕ ДОКУМЕНТЫ ПОЛЬЗОВАТЕЛЯ
    async getDocuments(userId?: string): Promise<Document[]> {
        await new Promise(resolve => setTimeout(resolve, 100));

        const uid = userId || getCurrentUserId();
        if (!uid) return [];

        const docs = getStoredDocuments(uid);
        const documents: Document[] = [];

        for (const [id, docData] of docs) {
            const previewData = docData.data.slice(0, 3).map(row => row.slice(0, 3));

            documents.push({
                id,
                name: docData.name,
                createdAt: docData.createdAt,
                updatedAt: docData.updatedAt,
                rows: docData.rows,
                cols: docData.cols,
                previewData
            });
        }

        return documents.sort((a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    },

    // ПОЛУЧИТЬ ОДИН ДОКУМЕНТ ПО ID
    async getDocument(id: string, userId?: string): Promise<DocumentData | null> {
        await new Promise(resolve => setTimeout(resolve, 100));

        const uid = userId || getCurrentUserId();
        if (!uid) return null;

        const docs = getStoredDocuments(uid);
        return docs.get(id) || null;
    },

    // СОЗДАТЬ НОВЫЙ ДОКУМЕНТ
    async createDocument(name: string, rows: number, cols: number, userId?: string): Promise<DocumentData> {
        await new Promise(resolve => setTimeout(resolve, 200));

        const uid = userId || getCurrentUserId();
        if (!uid) throw new Error('No user logged in');

        const id = `${uid}_${Date.now()}`;
        const now = new Date().toISOString();

        const data: Cell[][] = [];
        for (let i = 0; i < rows; i++) {
            const row: Cell[] = [];
            for (let j = 0; j < cols; j++) {
                row.push({
                    value: '',
                    displayValue: '',
                    type: 'string'
                });
            }
            data.push(row);
        }

        const newDoc: DocumentData = {
            id,
            name,
            data,
            rows,
            cols,
            createdAt: now,
            updatedAt: now
        };

        const docs = getStoredDocuments(uid);
        docs.set(id, newDoc);
        setStoredDocuments(uid, docs);

        return newDoc;
    },

    // ОБНОВИТЬ ДОКУМЕНТ
    async updateDocument(id: string, data: Cell[][], rows: number, cols: number, userId?: string): Promise<DocumentData> {
        await new Promise(resolve => setTimeout(resolve, 300));

        const uid = userId || getCurrentUserId();
        if (!uid) throw new Error('No user logged in');

        const docs = getStoredDocuments(uid);
        const existingDoc = docs.get(id);

        if (!existingDoc) {
            throw new Error('Document not found');
        }

        const updatedDoc: DocumentData = {
            ...existingDoc,
            data: JSON.parse(JSON.stringify(data)),
            rows,
            cols,
            updatedAt: new Date().toISOString()
        };

        docs.set(id, updatedDoc);
        setStoredDocuments(uid, docs);

        return updatedDoc;
    },

    // ПЕРЕИМЕНОВАТЬ ДОКУМЕНТ
    async renameDocument(id: string, newName: string, userId?: string): Promise<DocumentData> {
        await new Promise(resolve => setTimeout(resolve, 100));

        const uid = userId || getCurrentUserId();
        if (!uid) throw new Error('No user logged in');

        const docs = getStoredDocuments(uid);
        const existingDoc = docs.get(id);

        if (!existingDoc) {
            throw new Error('Document not found');
        }

        const renamedDoc: DocumentData = {
            ...existingDoc,
            name: newName,
            updatedAt: new Date().toISOString()
        };

        docs.set(id, renamedDoc);
        setStoredDocuments(uid, docs);

        return renamedDoc;
    },

    // УДАЛИТЬ ДОКУМЕНТ
    async deleteDocument(id: string, userId?: string): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 100));

        const uid = userId || getCurrentUserId();
        if (!uid) throw new Error('No user logged in');

        const docs = getStoredDocuments(uid);
        docs.delete(id);
        setStoredDocuments(uid, docs);
    },

    // ДУБЛИРОВАТЬ ДОКУМЕНТ
    async duplicateDocument(id: string, userId?: string): Promise<DocumentData> {
        await new Promise(resolve => setTimeout(resolve, 200));

        const uid = userId || getCurrentUserId();
        if (!uid) throw new Error('No user logged in');

        const docs = getStoredDocuments(uid);
        const existingDoc = docs.get(id);

        if (!existingDoc) {
            throw new Error('Document not found');
        }

        const newId = `${uid}_${Date.now()}`;
        const now = new Date().toISOString();

        const duplicatedDoc: DocumentData = {
            ...existingDoc,
            id: newId,
            name: `${existingDoc.name} (копия)`,
            createdAt: now,
            updatedAt: now
        };

        docs.set(newId, duplicatedDoc);
        setStoredDocuments(uid, docs);

        return duplicatedDoc;
    },

    // СОХРАНИТЬ ТЕКУЩИЙ ДОКУМЕНТ В localStorage ДЛЯ ВОССТАНОВЛЕНИЯ
    setCurrentDocumentId(id: string | null, userId?: string) {
        const uid = userId || getCurrentUserId();
        if (id && uid) {
            const key = getUserKey(CURRENT_DOC_KEY, uid);
            localStorage.setItem(key, id);
        } else if (uid) {
            const key = getUserKey(CURRENT_DOC_KEY, uid);
            localStorage.removeItem(key);
        }
    },

    getCurrentDocumentId(userId?: string): string | null {
        const uid = userId || getCurrentUserId();
        if (!uid) return null;
        const key = getUserKey(CURRENT_DOC_KEY, uid);
        return localStorage.getItem(key);
    }
};