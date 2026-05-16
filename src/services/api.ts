// тут чисто иммитация API для работы с документами, используем localStorage для хранения данных В реальном приложении это бы был бэк  сервер с базой данных.
import type { Document, DocumentData, Cell } from '../types';

const STORAGE_KEY = 'spreadsheet_documents';
const CURRENT_DOC_KEY = 'spreadsheet_current_doc';

// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ РАБОТЫ С LOCALSTORAGE
const getStoredDocuments = (): Map<string, DocumentData> => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        return new Map();
    }
    const obj = JSON.parse(stored);
    return new Map(Object.entries(obj));
};

const setStoredDocuments = (docs: Map<string, DocumentData>) => {
    const obj = Object.fromEntries(docs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
};

// API ДЛЯ РАБОТЫ С ДОКУМЕНТАМИ
export const api = {
    // ПОЛУЧИТЬ ВСЕ ДОКУМЕНТЫ ПОЛЬЗОВАТЕЛЯ
    async getDocuments(): Promise<Document[]> {
        // ИМИТАЦИЯ ЗАДЕРЖКИ СЕТИ
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const docs = getStoredDocuments();
        const documents: Document[] = [];
        
        for (const [id, docData] of docs) {
            // СОЗДАЕМ ПРЕВЬЮ (первые 3x3 ячейки)
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
        
        // СОРТИРУЕМ ПО ДАТЕ ИЗМЕНЕНИЯ (сначала новые)
        return documents.sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    },

    // ПОЛУЧИТЬ ОДИН ДОКУМЕНТ ПО ID
    async getDocument(id: string): Promise<DocumentData | null> {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const docs = getStoredDocuments();
        return docs.get(id) || null;
    },

    // СОЗДАТЬ НОВЫЙ ДОКУМЕНТ
    async createDocument(name: string, rows: number, cols: number): Promise<DocumentData> {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const id = Date.now().toString();
        const now = new Date().toISOString();
        
        // СОЗДАЕМ ПУСТУЮ ТАБЛИЦУ
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
        
        const docs = getStoredDocuments();
        docs.set(id, newDoc);
        setStoredDocuments(docs);
        
        return newDoc;
    },

    // ОБНОВИТЬ ДОКУМЕНТ (ЧАСТИЧНОЕ ОБНОВЛЕНИЕ - PATCH)
    async updateDocument(id: string, data: Cell[][], rows: number, cols: number): Promise<DocumentData> {
        await new Promise(resolve => setTimeout(resolve, 300)); // ИМИТАЦИЯ СЕТИ
        
        const docs = getStoredDocuments();
        const existingDoc = docs.get(id);
        
        if (!existingDoc) {
            throw new Error('Document not found');
        }
        
        const updatedDoc: DocumentData = {
            ...existingDoc,
            data: JSON.parse(JSON.stringify(data)), // ГЛУБОКАЯ КОПИЯ
            rows,
            cols,
            updatedAt: new Date().toISOString()
        };
        
        docs.set(id, updatedDoc);
        setStoredDocuments(docs);
        
        return updatedDoc;
    },

    // ПЕРЕИМЕНОВАТЬ ДОКУМЕНТ
    async renameDocument(id: string, newName: string): Promise<DocumentData> {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const docs = getStoredDocuments();
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
        setStoredDocuments(docs);
        
        return renamedDoc;
    },

    // УДАЛИТЬ ДОКУМЕНТ
    async deleteDocument(id: string): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const docs = getStoredDocuments();
        docs.delete(id);
        setStoredDocuments(docs);
    },

    // ДУБЛИРОВАТЬ ДОКУМЕНТ
    async duplicateDocument(id: string): Promise<DocumentData> {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const docs = getStoredDocuments();
        const existingDoc = docs.get(id);
        
        if (!existingDoc) {
            throw new Error('Document not found');
        }
        
        const newId = Date.now().toString();
        const now = new Date().toISOString();
        
        const duplicatedDoc: DocumentData = {
            ...existingDoc,
            id: newId,
            name: `${existingDoc.name} (копия)`,
            createdAt: now,
            updatedAt: now
        };
        
        docs.set(newId, duplicatedDoc);
        setStoredDocuments(docs);
        
        return duplicatedDoc;
    },

    // СОХРАНИТЬ ТЕКУЩИЙ ДОКУМЕНТ В localStorage ДЛЯ ВОССТАНОВЛЕНИЯ ПРИ ОБНОВЛЕНИИ
    setCurrentDocumentId(id: string | null) {
        if (id) {
            localStorage.setItem(CURRENT_DOC_KEY, id);
        } else {
            localStorage.removeItem(CURRENT_DOC_KEY);
        }
    },

    getCurrentDocumentId(): string | null {
        return localStorage.getItem(CURRENT_DOC_KEY);
    }
};