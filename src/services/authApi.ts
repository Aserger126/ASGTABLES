// services/authApi.ts
import type { User, AuthResponse, LoginCredentials, RegisterCredentials } from '../types';

// БАЗА ДАННЫХ ПОЛЬЗОВАТЕЛЕЙ (теперь с хранением в localStorage)
const USERS_KEY = 'spreadsheet_users';

// ЗАГРУЗКА ПОЛЬЗОВАТЕЛЕЙ ИЗ localStorage
const loadUsers = (): Map<string, { id: string; name: string; email: string; password: string }> => {
    const stored = localStorage.getItem(USERS_KEY);
    if (!stored) {
        // СОЗДАЁМ ТЕСТОВОГО ПОЛЬЗОВАТЕЛЯ ПРИ ПЕРВОМ ЗАПУСКЕ
        const defaultUsers = new Map();
        defaultUsers.set('test@example.com', {
            id: 'user_1',
            name: 'Тестовый Пользователь',
            email: 'test@example.com',
            password: 'password123'
        });
        return defaultUsers;
    }
    const obj = JSON.parse(stored);
    return new Map(Object.entries(obj));
};

// СОХРАНЕНИЕ ПОЛЬЗОВАТЕЛЕЙ
const saveUsers = (users: Map<string, any>) => {
    const obj = Object.fromEntries(users);
    localStorage.setItem(USERS_KEY, JSON.stringify(obj));
};

// ПОЛУЧАЕМ НАЧАЛЬНУЮ БАЗУ
let usersDB = loadUsers();

// ПЕРИОДИЧЕСКИ СОХРАНЯЕМ ИЗМЕНЕНИЯ
const persistUsers = () => {
    saveUsers(usersDB);
};

// ГЕНЕРАЦИЯ ТОКЕНОВ
const generateAccessToken = (userId: string): string => {
    const payload = { userId, exp: Date.now() + 15 * 60 * 1000 };
    return btoa(JSON.stringify(payload));
};

const generateRefreshToken = (userId: string): string => {
    const payload = { userId, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 };
    return btoa(JSON.stringify(payload));
};

export const authApi = {
    async register(credentials: RegisterCredentials): Promise<AuthResponse> {
        await new Promise(resolve => setTimeout(resolve, 500));

        if (usersDB.has(credentials.email)) {
            throw new Error('Пользователь с таким email уже существует');
        }

        const newUser = {
            id: `user_${Date.now()}`,
            name: credentials.name,
            email: credentials.email,
            password: credentials.password
        };
        usersDB.set(credentials.email, newUser);
        persistUsers();

        const accessToken = generateAccessToken(newUser.id);
        const refreshToken = generateRefreshToken(newUser.id);

        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('currentUserId', newUser.id);

        return {
            user: { id: newUser.id, name: newUser.name, email: newUser.email },
            accessToken
        };
    },

    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        await new Promise(resolve => setTimeout(resolve, 500));

        const user = usersDB.get(credentials.email);

        if (!user || user.password !== credentials.password) {
            throw new Error('Неверный email или пароль');
        }

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('currentUserId', user.id);

        return {
            user: { id: user.id, name: user.name, email: user.email },
            accessToken
        };
    },

    async refreshAccessToken(): Promise<{ accessToken: string }> {
        await new Promise(resolve => setTimeout(resolve, 300));

        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            throw new Error('No refresh token');
        }

        try {
            const payload = JSON.parse(atob(refreshToken));
            if (payload.exp < Date.now()) {
                localStorage.removeItem('refreshToken');
                throw new Error('Refresh token expired');
            }
            const newAccessToken = generateAccessToken(payload.userId);
            return { accessToken: newAccessToken };
        } catch {
            throw new Error('Invalid refresh token');
        }
    },

    async logout(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 200));
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('currentUserId');
        // НЕ ОЧИЩАЕМ ДАННЫЕ ПОЛЬЗОВАТЕЛЯ - они остаются в хранилище
    },

    async getCurrentUser(): Promise<User | null> {
        const refreshToken = localStorage.getItem('refreshToken');
        const userId = localStorage.getItem('currentUserId');

        if (!refreshToken || !userId) return null;

        try {
            const payload = JSON.parse(atob(refreshToken));
            if (payload.exp < Date.now()) {
                localStorage.removeItem('refreshToken');
                return null;
            }

            // ИЩЕМ ПОЛЬЗОВАТЕЛЯ ПО ID
            for (const [_, user] of usersDB) {
                if (user.id === userId) {
                    return { id: user.id, name: user.name, email: user.email };
                }
            }
        } catch {
            return null;
        }

        return null;
    }
};