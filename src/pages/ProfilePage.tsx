// pages/ProfilePage.tsx
export const ProfilePage = () => {
    return (
        <div style={containerStyle}>
            <h1>Профиль пользователя</h1>
            <div style={cardStyle}>
                <div style={avatarStyle}>👤</div>
                <div style={infoStyle}>
                    <p><strong>Имя:</strong> Тестовый Пользователь</p>
                    <p><strong>Email:</strong> test@example.com</p>
                    <p><strong>Дата регистрации:</strong> {new Date().toLocaleDateString()}</p>
                </div>
            </div>
            <p style={noteStyle}>
                * Здесь будет настройка профиля после подключения авторизации
            </p>
        </div>
    );
};

const containerStyle: React.CSSProperties = {
    maxWidth: '600px',
    margin: '0 auto'
};

const cardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    display: 'flex',
    gap: '24px',
    alignItems: 'center'
};

const avatarStyle: React.CSSProperties = {
    fontSize: '64px',
    backgroundColor: '#f0f0f0',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};

const infoStyle: React.CSSProperties = {
    flex: 1
};

const noteStyle: React.CSSProperties = {
    marginTop: '20px',
    padding: '12px',
    backgroundColor: '#fff3cd',
    borderRadius: '8px',
    color: '#856404'
};