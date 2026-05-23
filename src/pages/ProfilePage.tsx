// pages/ProfilePage.tsx
import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { fetchDocuments } from '../store/slices/documentsSlice';

export const ProfilePage = () => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.auth);
    const { list: documents } = useAppSelector(state => state.documents);
    
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState(user?.name || '');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    
    useEffect(() => {
        dispatch(fetchDocuments());
    }, [dispatch]);
    
    const handleUpdateName = () => {
        if (newName.trim() && newName !== user?.name) {
            // ЗАГЛУШКА - в реальном приложении был бы dispatch(updateUser({ name: newName }))
            setMessage({ type: 'success', text: 'Имя успешно обновлено!' });
            setIsEditingName(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };
    
    const handleChangePassword = () => {
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Пароли не совпадают' });
            return;
        }
        if (newPassword.length < 8) {
            setMessage({ type: 'error', text: 'Пароль должен быть не менее 8 символов' });
            return;
        }
        
        // ЗАГЛУШКА - в реальном приложении был бы dispatch(changePassword({ oldPassword, newPassword }))
        setMessage({ type: 'success', text: 'Пароль успешно изменён!' });
        setIsChangingPassword(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setMessage(null), 3000);
    };
    
    return (
        <div style={containerStyle}>
            <h1 style={titleStyle}>Профиль пользователя</h1>
            
            {message && (
                <div style={message.type === 'success' ? successStyle : errorStyle}>
                    {message.text}
                </div>
            )}
            
            {/* КАРТОЧКА С АВАТАРОМ И ИНФО */}
            <div style={cardStyle}>
                <div style={avatarStyle}>👤</div>
                <div style={infoStyle}>
                    <p><strong>Email:</strong> {user?.email}</p>
                    <p><strong>Дата регистрации:</strong> {new Date().toLocaleDateString()}</p>
                    <p><strong>Количество документов:</strong> {documents.length}</p>
                </div>
            </div>
            
            {/* ИЗМЕНЕНИЕ ИМЕНИ */}
            <div style={cardStyle}>
                <h3 style={sectionTitle}>Изменить имя</h3>
                {isEditingName ? (
                    <div style={inlineFormStyle}>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            style={inputStyle}
                            autoFocus
                        />
                        <button onClick={handleUpdateName} style={saveButtonStyle}>Сохранить</button>
                        <button onClick={() => setIsEditingName(false)} style={cancelButtonStyle}>Отмена</button>
                    </div>
                ) : (
                    <div style={infoRowStyle}>
                        <span><strong>Имя:</strong> {user?.name}</span>
                        <button onClick={() => setIsEditingName(true)} style={editButtonStyle}>✎ Редактировать</button>
                    </div>
                )}
            </div>
            
            {/* СМЕНА ПАРОЛЯ */}
            <div style={cardStyle}>
                <h3 style={sectionTitle}>Сменить пароль</h3>
                {isChangingPassword ? (
                    <div style={formStyle}>
                        <input
                            type="password"
                            placeholder="Текущий пароль"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            style={inputStyle}
                        />
                        <input
                            type="password"
                            placeholder="Новый пароль (мин. 8 символов)"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            style={inputStyle}
                        />
                        <input
                            type="password"
                            placeholder="Подтвердите пароль"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={inputStyle}
                        />
                        <div style={buttonGroupStyle}>
                            <button onClick={handleChangePassword} style={saveButtonStyle}>Сохранить</button>
                            <button onClick={() => setIsChangingPassword(false)} style={cancelButtonStyle}>Отмена</button>
                        </div>
                    </div>
                ) : (
                    <button onClick={() => setIsChangingPassword(true)} style={editButtonStyle}>
                        🔑 Изменить пароль
                    </button>
                )}
            </div>
        </div>
    );
};

// СТИЛИ
const containerStyle: React.CSSProperties = {
    maxWidth: '600px',
    margin: '0 auto'
};

const titleStyle: React.CSSProperties = {
    fontSize: '24px',
    marginBottom: '24px',
    color: '#333'
};

const cardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
};

const avatarStyle: React.CSSProperties = {
    fontSize: '64px',
    backgroundColor: '#f0f0f0',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px'
};

const infoStyle: React.CSSProperties = {
    flex: 1,
    lineHeight: '1.8'
};

const sectionTitle: React.CSSProperties = {
    fontSize: '18px',
    marginBottom: '16px',
    color: '#555'
};

const infoRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px'
};

const inlineFormStyle: React.CSSProperties = {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
};

const formStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
};

const buttonGroupStyle: React.CSSProperties = {
    display: 'flex',
    gap: '10px',
    marginTop: '8px'
};

const inputStyle: React.CSSProperties = {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    flex: 1
};

const editButtonStyle: React.CSSProperties = {
    padding: '6px 12px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
};

const saveButtonStyle: React.CSSProperties = {
    padding: '8px 16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
};

const cancelButtonStyle: React.CSSProperties = {
    padding: '8px 16px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
};

const successStyle: React.CSSProperties = {
    padding: '12px',
    backgroundColor: '#d4edda',
    color: '#155724',
    borderRadius: '8px',
    marginBottom: '20px'
};

const errorStyle: React.CSSProperties = {
    padding: '12px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderRadius: '8px',
    marginBottom: '20px'
};