// pages/DashboardPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchDocuments, createDocument } from '../store/slices/documentsSlice';
import { setShowCreateModal } from '../store/slices/uiSlice';
import { DocumentDashboard } from '../components/DocumentDashboard';
import { CreateDocumentModal } from '../components/CreateDocumentModal';

export const DashboardPage = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { showCreateModal } = useAppSelector(state => state.ui);
    const { list: documents, isLoading } = useAppSelector(state => state.documents);
    
    useEffect(() => {
        dispatch(fetchDocuments());
    }, [dispatch]);
    
    const handleSelectDocument = (docId: string) => {
        navigate(`/documents/${docId}`);
    };
    
    const handleCreateDocument = async (name: string, rows: number, cols: number) => {
        const result = await dispatch(createDocument({ name, rows, cols }));
        if (result.payload) {
            const docId = (result.payload as any).id;
            navigate(`/documents/${docId}`);
        }
    };
    
    const handleOpenCreateModal = () => {
        dispatch(setShowCreateModal(true));
    };
    
    if (isLoading) {
        return <div style={loadingStyle}>Загрузка документов...</div>;
    }
    
    return (
        <>
            <DocumentDashboard
                onSelectDocument={handleSelectDocument}
                onCreateNew={handleOpenCreateModal}
            />
            <CreateDocumentModal
                isOpen={showCreateModal}
                onClose={() => dispatch(setShowCreateModal(false))}
                onCreate={handleCreateDocument}
            />
        </>
    );
};

const loadingStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    fontSize: '16px',
    color: '#666'
};