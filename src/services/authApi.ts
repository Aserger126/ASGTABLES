import type { User, AuthResponse, LoginCredentials, RegisterCredentials } from '../types';

// ИМИТАЦИЯ БАЗЫ ДАННЫХ ПОЛЬЗОВАТЕЛЕЙ
const usersDB = new Map<string, { id: string; name: string; email: string; password: string }>();

// ИНИЦИАЛИЗИРУЕМ ТЕСТОВОГО ПОЛЬЗОВАТЕЛЯ
usersDB.set('test@example.com', {
    id: '1',
    name: 'Тестовый Пользователь',
    email: 'test@example.com',
    password: 'password123'
});

// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ ТОКЕНОВ
const generateAccessToken = (userId: string): string => {
    // ПРОСТАЯ ИМИТАЦИЯ JWT (base64)
    const payload = { userId, exp: Date.now() + 15 * 60 * 1000 }; // 15 минут
    return btoa(JSON.stringify(payload));
};

const generateRefreshToken = (userId: string): string => {
    const payload = { userId, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }; // 7 дней
    return btoa(JSON.stringify(payload));
};

const verifyToken = (token: string): { userId: string; exp: number } | null => {
    try {
        return JSON.parse(atob(token));
    } catch {
        return null;
    }
};

// API ЗАГЛУШКА
export const authApi = {
    // РЕГИСТРАЦИЯ
    async register(credentials: RegisterCredentials): Promise<AuthResponse> {
        await new Promise(resolve => setTimeout(resolve, 500)); // ИМИТАЦИЯ ЗАДЕРЖКИ
        
        // ПРОВЕРКА, СУЩЕСТВУЕТ ЛИ ПОЛЬЗОВАТЕЛЬ
        if (usersDB.has(credentials.email)) {
            throw new Error('Пользователь с таким email уже существует');
        }
        
        // СОЗДАЁМ НОВОГО ПОЛЬЗОВАТЕЛЯ
        const newUser = {
            id: Date.now().toString(),
            name: credentials.name,
            email: credentials.email,
            password: credentials.password
        };
        usersDB.set(credentials.email, newUser);
        
        const accessToken = generateAccessToken(newUser.id);
        const refreshToken = generateRefreshToken(newUser.id);
        
        // СОХРАНЯЕМ REFRESH TOKEN В localStorage
        localStorage.setItem('refreshToken', refreshToken);
        
        return {
            user: { id: newUser.id, name: newUser.name, email: newUser.email },
            accessToken
        };
    },
    
    // ВХОД
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const user = usersDB.get(credentials.email);
        
        if (!user || user.password !== credentials.password) {
            throw new Error('Неверный email или пароль');
        }
        
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);
        
        localStorage.setItem('refreshToken', refreshToken);
        
        return {
            user: { id: user.id, name: user.name, email: user.email },
            accessToken
        };
    },
    
    // ОБНОВЛЕНИЕ ACCESS TOKEN
    async refreshAccessToken(): Promise<{ accessToken: string }> {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            throw new Error('No refresh token');
        }
        
        const payload = verifyToken(refreshToken);
        if (!payload || payload.exp < Date.now()) {
            localStorage.removeItem('refreshToken');
            throw new Error('Refresh token expired');
        }
        
        const newAccessToken = generateAccessToken(payload.userId);
        return { accessToken: newAccessToken };
    },
    
    // ВЫХОД
    async logout(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 200));
        localStorage.removeItem('refreshToken');
    },
    
    // ПОЛУЧИТЬ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ ПО ТОКЕНУ
    async getCurrentUser(): Promise<User | null> {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) return null;
        
        const payload = verifyToken(refreshToken);
        if (!payload || payload.exp < Date.now()) return null;
        
        // ИЩЕМ ПОЛЬЗОВАТЕЛЯ В БАЗЕ
        for (const [_, user] of usersDB) {
            if (user.id === payload.userId) {
                return { id: user.id, name: user.name, email: user.email };
            }
        }
        
        return null;
    }
};