import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import Toast from '../components/Toast';
import './AdminMainLayout.css';

function AdminMainLayout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  // Save current location to localStorage for better navigation experience
  useEffect(() => {
    if (location.pathname.startsWith('/admin/') && location.pathname !== '/admin') {
      localStorage.setItem('lastAdminPage', location.pathname);
    }
  }, [location.pathname]);

  // Redirect to last admin page if user visits /admin directly
  useEffect(() => {
    if (location.pathname === '/admin' || location.pathname === '/admin/') {
      const lastAdminPage = localStorage.getItem('lastAdminPage');
      if (lastAdminPage && lastAdminPage !== '/admin' && lastAdminPage !== '/admin/') {
        navigate(lastAdminPage, { replace: true });
      } else {
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [location.pathname, navigate]);

  const checkAdminAccess = async () => {
    try {
      const token = localStorage.getItem("access");
      if (!token) {
        showToast('يجب تسجيل الدخول أولاً', 'error');
        navigate('/login');
        return;
      }

      const response = await api.get('users/me/');
      const userData = response.data;
      
      if (!userData.is_staff && !userData.is_superuser) {
        showToast('ليس لديك صلاحية للوصول لهذه الصفحة', 'error');
        navigate('/');
        return;
      }
      
      setUser(userData);
    } catch (error) {
      console.error('Admin access check error:', error);
      if (error.response?.status === 401) {
        showToast('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى', 'error');
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");
        navigate('/login');
      } else {
        showToast('خطأ في التحقق من الصلاحيات', 'error');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    showToast('تم تسجيل الخروج بنجاح', 'success');
    navigate('/');
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  const menuItems = [
    {
      title: 'لوحة التحكم الرئيسية',
      icon: '📊',
      path: '/admin/dashboard',
      description: 'إحصائيات وتقارير عامة'
    },
    {
      title: 'إدارة المجموعات',
      icon: '👥',
      path: '/admin/groups',
      description: 'إضافة وتعديل وحذف المجموعات'
    },
    {
      title: 'إدارة الطلاب',
      icon: '🎓',
      path: '/admin/students',
      description: 'عرض ومتابعة بيانات الطلاب'
    },
    {
      title: 'إدارة الحجوزات',
      icon: '📅',
      path: '/admin/bookings',
      description: 'متابعة وإدارة حجوزات الطلاب'
    },
    {
      title: 'إعدادات النظام',
      icon: '⚙️',
      path: '/admin/settings',
      description: 'إعدادات عامة للنظام'
    }
  ];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">جاري التحميل...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-main-layout">
      {/* Admin Header */}
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        padding: '20px 0'
      }}>
        <div className="container-fluid">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h1 style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: 'white',
                margin: 0,
                marginBottom: '5px'
              }}>
                 لوحة التحكم
              </h1>
              <p style={{
                color: 'rgba(255, 255, 255, 0.9)',
                margin: 0,
                fontSize: '1rem'
              }}>
                إدارة شاملة للمنصة التعليمية - أ/ إيناس إبراهيم كناني
              </p>
            </div>
            <div style={{ textAlign: 'right', color: 'white' }}>
              <div style={{ 
                fontSize: '0.9rem', 
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '5px'
              }}>
                اليوم
              </div>
              <div style={{ 
                fontWeight: 'bold', 
                fontSize: '1.1rem' 
              }}>
                {new Date().toLocaleDateString('ar-EG')}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div style={{
        display: 'flex',
        minHeight: 'calc(100vh - 80px)',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative'
      }}>
        {/* Sidebar */}
        <aside style={{
          width: sidebarOpen ? '300px' : '300px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '0 20px 20px 0',
          margin: '20px 0 20px 20px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          overflow: 'hidden',
          position: sidebarOpen && window.innerWidth <= 768 ? 'fixed' : 'relative',
          top: sidebarOpen && window.innerWidth <= 768 ? '0' : 'auto',
          left: sidebarOpen && window.innerWidth <= 768 ? '0' : 'auto',
          height: sidebarOpen && window.innerWidth <= 768 ? 'calc(100vh - 80px)' : 'calc(100vh - 120px)',
          zIndex: 999,
          transform: window.innerWidth <= 768 && !sidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ 
            padding: '30px 0', 
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              padding: '0 20px'
            }}>
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    padding: '15px 20px',
                    textDecoration: 'none',
                    color: location.pathname === item.path ? 'white' : '#333',
                    borderRadius: '15px',
                    transition: 'all 0.3s ease',
                    marginBottom: '5px',
                    position: 'relative',
                    overflow: 'hidden',
                    background: location.pathname === item.path ? 
                      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 
                      'transparent',
                    boxShadow: location.pathname === item.path ? 
                      '0 5px 15px rgba(102, 126, 234, 0.3)' : 
                      'none'
                  }}
                  onMouseEnter={(e) => {
                    if (location.pathname !== item.path) {
                      e.target.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                      e.target.style.color = 'white';
                      e.target.style.transform = 'translateX(-5px)';
                      e.target.style.boxShadow = '0 5px 15px rgba(102, 126, 234, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (location.pathname !== item.path) {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#333';
                      e.target.style.transform = 'translateX(0)';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                >
                  <div style={{
                    fontSize: '1.5rem',
                    minWidth: '30px',
                    textAlign: 'center'
                  }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontWeight: '600',
                      fontSize: '1rem',
                      marginBottom: '3px'
                    }}>
                      {item.title}
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      opacity: '0.7'
                    }}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{
          flex: 1,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          margin: '20px 20px 20px 0',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          overflowY: 'auto',
          height: 'calc(100vh - 120px)'
        }}>
          <div style={{ padding: '30px' }}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && window.innerWidth <= 768 && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 998
          }}
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Toast Notification */}
      <Toast 
        show={toast.show} 
        message={toast.message} 
        type={toast.type}
        onClose={() => setToast({ show: false, message: '', type: '' })}
      />
    </div>
  );
}

export default AdminMainLayout;
