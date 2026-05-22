// layouts/AppLayout.tsx - добавить импорт и кнопку
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { clearCurrentDocument } from '../store/slices/documentsSlice';
import { setShowDashboard } from '../store/slices/uiSlice';
import { logout } from '../store/slices/authSlice';
import { SaveIndicator } from '../components/SaveIndicator';

export const AppLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { saveStatus } = useAppSelector(state => state.ui);
    const { currentDocument } = useAppSelector(state => state.documents);
    const { user } = useAppSelector(state => state.auth);

    const handleLogout = async () => {
        await dispatch(logout());
        navigate('/login');
    };

    // ХЛЕБНЫЕ КРОШКИ (оставляем как есть)
    const getBreadcrumbs = () => {
        const pathnames = location.pathname.split('/').filter(x => x);
        if (pathnames[0] === 'dashboard') {
            return [{ name: 'Мои документы', path: '/dashboard' }];
        }
        if (pathnames[0] === 'documents' && pathnames[1]) {
            return [
                { name: 'Мои документы', path: '/dashboard' },
                { name: currentDocument?.name || 'Документ', path: location.pathname }
            ];
        }
        if (pathnames[0] === 'profile') {
            return [
                { name: 'Мои документы', path: '/dashboard' },
                { name: 'Профиль', path: '/profile' }
            ];
        }
        return [];
    };

    const breadcrumbs = getBreadcrumbs();

    return (
        <div style={layoutStyle}>
            <header style={headerStyle}>
                <div style={logoStyle}>
                    <Link to="/dashboard" style={logoLinkStyle}>📊 ASG Table</Link>
                </div>
                <div style={headerRightStyle}>
                    <SaveIndicator status={saveStatus} />
                    <div style={userInfoStyle}>
                        👤 {user?.name || 'Пользователь'}
                    </div>
                    <button onClick={handleLogout} style={logoutButtonStyle}>
                        🚪 Выйти
                    </button>
                </div>
            </header>

            <div style={contentStyle}>
                {breadcrumbs.length > 0 && (
                    <div style={breadcrumbsStyle}>
                        {breadcrumbs.map((crumb, index) => (
                            <span key={crumb.path}>
                                {index > 0 && <span style={separatorStyle}> / </span>}
                                {index === breadcrumbs.length - 1 ? (
                                    <span style={currentStyle}>{crumb.name}</span>
                                ) : (
                                    <Link to={crumb.path} style={crumbLinkStyle}>{crumb.name}</Link>
                                )}
                            </span>
                        ))}
                    </div>
                )}
                <Outlet />
            </div>
        </div>
    );
};

// ДОБАВИТЬ НОВЫЙ СТИЛЬ
const logoutButtonStyle: React.CSSProperties = {
    padding: '6px 12px',
    backgroundColor: '#ff4444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
};

// ОСТАЛЬНЫЕ СТИЛИ ТЕ ЖЕ...
const layoutStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5'
};

const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 24px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e0e0e0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
};

const logoStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 'bold'
};

const logoLinkStyle: React.CSSProperties = {
    color: '#4CAF50',
    textDecoration: 'none'
};

const headerRightStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
};

const userInfoStyle: React.CSSProperties = {
    padding: '6px 12px',
    backgroundColor: '#f0f0f0',
    borderRadius: '20px',
    fontSize: '14px',
    color: '#333'
};

const contentStyle: React.CSSProperties = {
    flex: 1,
    padding: '24px'
};

const breadcrumbsStyle: React.CSSProperties = {
    marginBottom: '20px',
    fontSize: '14px',
    color: '#666'
};

const crumbLinkStyle: React.CSSProperties = {
    color: '#4CAF50',
    textDecoration: 'none'
};

const separatorStyle: React.CSSProperties = {
    margin: '0 8px',
    color: '#ccc'
};

const currentStyle: React.CSSProperties = {
    color: '#333',
    fontWeight: '500'
};