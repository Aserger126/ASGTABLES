// pages/NotFoundPage.tsx
import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
    return (
        <div style={containerStyle}>
            <h1 style={titleStyle}>404</h1>
            <p style={messageStyle}>Страница не найдена</p>
            <Link to="/dashboard" style={linkStyle}>
                Вернуться на главную
            </Link>
        </div>
    );
};

const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '50vh',
    textAlign: 'center'
};

const titleStyle: React.CSSProperties = {
    fontSize: '72px',
    margin: '0',
    color: '#f44336'
};

const messageStyle: React.CSSProperties = {
    fontSize: '20px',
    color: '#666',
    marginBottom: '20px'
};

const linkStyle: React.CSSProperties = {
    color: '#4CAF50',
    textDecoration: 'none',
    fontSize: '16px'
};