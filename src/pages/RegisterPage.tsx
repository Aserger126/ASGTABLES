// pages/RegisterPage.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { register, clearError } from '../store/slices/authSlice';

export const RegisterPage = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { isLoading, error, isAuthenticated } = useAppSelector(state => state.auth);
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [validationError, setValidationError] = useState('');
    
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError('');
        dispatch(clearError());
        
        if (password !== confirmPassword) {
            setValidationError('Пароли не совпадают');
            return;
        }
        if (password.length < 8) {
            setValidationError('Пароль должен быть не менее 8 символов');
            return;
        }
        
        await dispatch(register({ name, email, password, confirmPassword }));
    };
    
    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <h1 style={titleStyle}>Регистрация</h1>
                
                <form onSubmit={handleSubmit} style={formStyle}>
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Имя</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>
                    
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>
                    
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Пароль (мин. 8 символов)</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>
                    
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Подтверждение пароля</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>
                    
                    {(validationError || error) && (
                        <div style={errorStyle}>❌ {validationError || error}</div>
                    )}
                    
                    <button type="submit" disabled={isLoading} style={buttonStyle}>
                        {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                    </button>
                </form>
                
                <p style={footerStyle}>
                    Уже есть аккаунт? <Link to="/login" style={linkStyle}>Войти</Link>
                </p>
            </div>
        </div>
    );
};

// СТИЛИ (те же, что в LoginPage)
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
    outline: 'none'
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