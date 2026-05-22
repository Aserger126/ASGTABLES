import type { ReactNode } from 'react';  //
import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { checkAuth } from '../store/slices/authSlice';

interface ProtectedRouteProps {
    children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const location = useLocation();
    const dispatch = useAppDispatch();
    const { isAuthenticated, isLoading } = useAppSelector(state => state.auth);
    
    useEffect(() => {
        if (!isAuthenticated && !isLoading) {
            dispatch(checkAuth());
        }
    }, [dispatch, isAuthenticated, isLoading]);
    
    if (isLoading) {
        return <div style={loadingStyle}>Загрузка...</div>;
    }
    
    if (!isAuthenticated) {
        // СОХРАНЯЕМ МАРШРУТ, КУДА ХОТЕЛ ПОПАСТЬ ПОЛЬЗОВАТЕЛЬ
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    return <>{children}</>;
};

const loadingStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '16px',
    color: '#666'
};