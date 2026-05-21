// components/ProtectedRoute.tsx
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
    children: ReactNode;
}

// ВРЕМЕННО ВСЕГДА ПРОПУСКАЕМ (ДЛЯ 5 НЕДЕЛИ)
// ПОТОМ ЗДЕСЬ БУДЕТ ПРОВЕРКА АВТОРИЗАЦИИ
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    // ВРЕМЕННЫЙ MOCK - ВСЕГДА АВТОРИЗОВАН
    const isAuthenticated = true;
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    return <>{children}</>;
};