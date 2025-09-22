import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import Toast from '../components/Toast';

function AdminLayout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAdminAccess();
  }, []);

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
    <div className="admin-layout">
      {/* Admin Header */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <Link className="navbar-brand fw-bold" to="/admin">
            🎛️ لوحة تحكم الأدمن
          </Link>
          
          <div className="navbar-nav ms-auto">
            <div className="d-flex align-items-center gap-3">
              <span className="text-white">👤 مرحباً، {user?.username || 'الأدمن'}</span>
              <Link className="btn btn-outline-light btn-sm" to="/">
                🏠 العودة للموقع
              </Link>
              <button className="btn btn-danger btn-sm" onClick={handleLogout}>
                🚪 خروج
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="admin-container">
        {/* Admin Sidebar */}
        <aside className="admin-sidebar bg-light border-end">
          <div className="p-3">
            <h6 className="text-muted text-uppercase mb-3">الإدارة</h6>
            <ul className="nav nav-pills flex-column">
              <li className="nav-item mb-2">
                <Link 
                  to="/admin" 
                  className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
                >
                  📊 لوحة التحكم الرئيسية
                </Link>
              </li>
              <li className="nav-item mb-2">
                <Link 
                  to="/admin/groups" 
                  className={`nav-link ${location.pathname === '/admin/groups' ? 'active' : ''}`}
                >
                  👥 إدارة المجموعات
                </Link>
              </li>
              <li className="nav-item mb-2">
                <Link 
                  to="/admin/students" 
                  className={`nav-link ${location.pathname === '/admin/students' ? 'active' : ''}`}
                >
                  🎓 إدارة الطلاب
                </Link>
              </li>
              <li className="nav-item mb-2">
                <Link 
                  to="/admin/bookings" 
                  className={`nav-link ${location.pathname === '/admin/bookings' ? 'active' : ''}`}
                >
                  📅 إدارة الحجوزات
                </Link>
              </li>
            </ul>
            
            <hr />
            
            <h6 className="text-muted text-uppercase mb-3">الإعدادات</h6>
            <ul className="nav nav-pills flex-column">
              <li className="nav-item mb-2">
                <Link 
                  to="/admin/settings" 
                  className={`nav-link ${location.pathname === '/admin/settings' ? 'active' : ''}`}
                >
                  ⚙️ إعدادات النظام
                </Link>
              </li>
            </ul>
          </div>
        </aside>

        {/* Admin Content */}
        <main className="admin-content flex-grow-1 p-4">
          <Outlet />
        </main>
      </div>

      {/* Toast Notification */}
      <Toast 
        show={toast.show} 
        message={toast.message} 
        type={toast.type}
        onClose={() => setToast({ show: false, message: '', type: '' })}
      />

      <style>{`
        .admin-layout {
          min-height: 100vh;
        }
        
        .admin-container {
          display: flex;
          min-height: calc(100vh - 56px);
        }
        
        .admin-sidebar {
          width: 280px;
          min-height: calc(100vh - 56px);
          position: sticky;
          top: 0;
        }
        
        .admin-content {
          background-color: #f8f9fa;
        }
        
        .nav-link {
          color: #6c757d !important;
          border-radius: 8px;
          padding: 10px 15px;
          transition: all 0.2s ease;
        }
        
        .nav-link:hover {
          background-color: #e9ecef;
          color: #495057 !important;
        }
        
        .nav-link.active {
          background-color: #0d6efd !important;
          color: white !important;
        }
        
        @media (max-width: 768px) {
          .admin-container {
            flex-direction: column;
          }
          
          .admin-sidebar {
            width: 100%;
            position: relative;
          }
        }
      `}</style>
    </div>
  );
}

export default AdminLayout;
