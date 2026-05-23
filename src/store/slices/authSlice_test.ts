// store/slices/authSlice.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import authReducer, {
    login,
    register,
    logout,
    checkAuth,
    clearError,
    setAuth
} from './authSlice';
import type { AuthState } from '../../types';

// МОКАЕМ API
vi.mock('../../services/authApi', () => ({
    authApi: {
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        getCurrentUser: vi.fn(),
    }
}));

import { authApi } from '../../services/authApi';

describe('authSlice', () => {
    const initialState: AuthState = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
    };

    const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com'
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('reducers', () => {
        it('should return initial state', () => {
            expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
        });

        it('should handle clearError', () => {
            const stateWithError: AuthState = {
                ...initialState,
                error: 'Some error'
            };
            const actual = authReducer(stateWithError, clearError());
            expect(actual.error).toBeNull();
        });

        it('should handle setAuth', () => {
            const actual = authReducer(initialState, setAuth({
                user: mockUser,
                accessToken: 'token123'
            }));
            expect(actual.user).toEqual(mockUser);
            expect(actual.isAuthenticated).toBe(true);
        });
    });

    describe('login async thunk', () => {
        it('should handle pending', () => {
            const action = { type: login.pending.type };
            const actual = authReducer(initialState, action);
            expect(actual.isLoading).toBe(true);
            expect(actual.error).toBeNull();
        });

        it('should handle fulfilled', async () => {
            const mockResponse = { user: mockUser, accessToken: 'token123' };
            (authApi.login as any).mockResolvedValue(mockResponse);
            
            const action = { type: login.fulfilled.type, payload: mockResponse };
            const actual = authReducer(initialState, action);
            
            expect(actual.isLoading).toBe(false);
            expect(actual.user).toEqual(mockUser);
            expect(actual.isAuthenticated).toBe(true);
            expect(actual.error).toBeNull();
        });

        it('should handle rejected', () => {
            const action = { type: login.rejected.type, payload: 'Invalid credentials' };
            const actual = authReducer(initialState, action);
            
            expect(actual.isLoading).toBe(false);
            expect(actual.error).toBe('Invalid credentials');
            expect(actual.isAuthenticated).toBe(false);
        });
    });

    describe('register async thunk', () => {
        it('should handle fulfilled', () => {
            const mockResponse = { user: mockUser, accessToken: 'token123' };
            const action = { type: register.fulfilled.type, payload: mockResponse };
            const actual = authReducer(initialState, action);
            
            expect(actual.isLoading).toBe(false);
            expect(actual.user).toEqual(mockUser);
            expect(actual.isAuthenticated).toBe(true);
        });
    });

    describe('logout async thunk', () => {
        it('should handle fulfilled', () => {
            const loggedInState: AuthState = {
                user: mockUser,
                isAuthenticated: true,
                isLoading: false,
                error: null
            };
            const action = { type: logout.fulfilled.type };
            const actual = authReducer(loggedInState, action);
            
            expect(actual.user).toBeNull();
            expect(actual.isAuthenticated).toBe(false);
        });
    });

    describe('checkAuth async thunk', () => {
        it('should handle fulfilled', () => {
            const action = { type: checkAuth.fulfilled.type, payload: { user: mockUser, accessToken: '' } };
            const actual = authReducer(initialState, action);
            
            expect(actual.user).toEqual(mockUser);
            expect(actual.isAuthenticated).toBe(true);
        });

        it('should handle rejected', () => {
            const action = { type: checkAuth.rejected.type };
            const actual = authReducer(initialState, action);
            
            expect(actual.user).toBeNull();
            expect(actual.isAuthenticated).toBe(false);
        });
    });
});