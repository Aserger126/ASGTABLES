// store/slices/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User, LoginCredentials, RegisterCredentials, AuthState } from '../../types';
import { authApi } from '../../services/authApi';

// НАЧАЛЬНОЕ СОСТОЯНИЕ
const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
};

// АСИНХРОННЫЕ THUNKS
export const login = createAsyncThunk(
    'auth/login',
    async (credentials: LoginCredentials, { rejectWithValue }) => {
        try {
            const response = await authApi.login(credentials);
            return response;
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async (credentials: RegisterCredentials, { rejectWithValue }) => {
        try {
            // ПРОВЕРКА ПАРОЛЕЙ
            if (credentials.password !== credentials.confirmPassword) {
                throw new Error('Пароли не совпадают');
            }
            if (credentials.password.length < 8) {
                throw new Error('Пароль должен быть не менее 8 символов');
            }
            const response = await authApi.register(credentials);
            return response;
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const logout = createAsyncThunk(
    'auth/logout',
    async () => {
        await authApi.logout();
    }
);

export const checkAuth = createAsyncThunk(
    'auth/check',
    async () => {
        const user = await authApi.getCurrentUser();
        if (!user) {
            throw new Error('Not authenticated');
        }
        return { user, accessToken: '' };
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setAuth: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
            state.user = action.payload.user;
            state.isAuthenticated = true;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // LOGIN
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // REGISTER
            .addCase(register.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(register.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // LOGOUT
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.error = null;
            })
            // CHECK AUTH
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.user = action.payload.user;
                state.isAuthenticated = true;
            })
            .addCase(checkAuth.rejected, (state) => {
                state.user = null;
                state.isAuthenticated = false;
            });
    }
});

export const { clearError, setAuth } = authSlice.actions;
export default authSlice.reducer;