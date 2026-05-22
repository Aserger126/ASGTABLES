// hooks/useUnsavedChanges.ts
import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';

interface UseUnsavedChangesProps {
    hasUnsavedChanges: boolean;  // ТОЛЬКО BOOLEAN, НЕ NULL
    message?: string;
}

export const useUnsavedChanges = ({ 
    hasUnsavedChanges, 
    message = 'У вас есть несохранённые изменения. Вы уверены, что хотите покинуть страницу?' 
}: UseUnsavedChangesProps) => {
    // БЛОКИРОВКА НАВИГАЦИИ ВНУТРИ ПРИЛОЖЕНИЯ
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname
    );

    // БЛОКИРОВКА ЗАКРЫТИЯ ВКЛАДКИ
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = message;
                return message;
            }
        };
        
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges, message]);

    // ПОКАЗЫВАЕМ ДИАЛОГ ПРИ ПОПЫТКЕ УЙТИ
    useEffect(() => {
        if (blocker.state === 'blocked') {
            const confirmLeave = window.confirm(message);
            if (confirmLeave) {
                blocker.proceed();
            } else {
                blocker.reset();
            }
        }
    }, [blocker, message]);

    return { blocker };
};