// main.tsx
import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { store } from './store';
import { router } from './router';
import { checkAuth } from './store/slices/authSlice';
import './index.css';

// ФУНКЦИЯ ДЛЯ ПРОВЕРКИ АУТЕНТИФИКАЦИИ ПРИ ЗАГРУЗКЕ
const App = () => {
    useEffect(() => {
        store.dispatch(checkAuth());
    }, []);
    
    return (
        <Provider store={store}>
            <RouterProvider router={router} />
        </Provider>
    );
};

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);