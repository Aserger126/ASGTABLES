// store/slices/authSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    user: {
        id: '1',
        name: 'Тестовый Пользователь',
        email: 'test@example.com'
    },
    isAuthenticated: true // ВРЕМЕННО, ДО 5 НЕДЕЛИ
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User | null>) => {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
        }
    }
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;