import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login, clearError } from '../store/slices/authSlice';

export const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();
    const { isLoading, error, isAuthenticated } = useAppSelector(state => state.auth);
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const from = (location.state as { from?: Location })?.from?.pathname || '/dashboard';
    
    useEffect(() => {
        if (isAuthenticated) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, from]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(clearError());
        await dispatch(login({ email, password }));
    };
    
    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <h1 style={titleStyle}>Вход в ASG Table</h1>
                
                <form onSubmit={handleSubmit} style={formStyle}>
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={inputStyle}
                            placeholder="test@example.com"
                        />
                    </div>
                    
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Пароль</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={inputStyle}
                            placeholder="password123"
                        />
                    </div>
                    
                    {error && <div style={errorStyle}>❌ {error}</div>}
                    
                    <button type="submit" disabled={isLoading} style={buttonStyle}>
                        {isLoading ? 'Вход...' : 'Войти'}
                    </button>
                </form>
                
                <p style={footerStyle}>
                    Нет аккаунта? <Link to="/register" style={linkStyle}>Зарегистрироваться</Link>
                </p>
            </div>
        </div>
    );
};

// СТИЛИ
const containerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5'
};

const cardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '32px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
};

const titleStyle: React.CSSProperties = {
    margin: '0 0 24px 0',
    fontSize: '24px',
    textAlign: 'center',
    color: '#333'
};

const formStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
};

const fieldStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
};

const labelStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333'
};

const inputStyle: React.CSSProperties = {
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s'
};

const buttonStyle: React.CSSProperties = {
    padding: '12px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '8px'
};

const errorStyle: React.CSSProperties = {
    padding: '10px',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderRadius: '6px',
    fontSize: '14px',
    textAlign: 'center'
};

const footerStyle: React.CSSProperties = {
    marginTop: '24px',
    textAlign: 'center',
    fontSize: '14px',
    color: '#666'
};

const linkStyle: React.CSSProperties = {
    color: '#4CAF50',
    textDecoration: 'none'
};