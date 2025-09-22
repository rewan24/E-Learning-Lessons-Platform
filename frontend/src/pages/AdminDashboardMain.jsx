import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Toast from '../components/Toast';

function AdminDashboardMain() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalGroups: 0,
    totalStudents: 0,
    totalBookings: 0,
    activeGroups: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [groupsRes, studentsRes, bookingsRes] = await Promise.all([
        api.get('groups/'),
        api.get('students/'),
        api.get('bookings/admin/')
      ]);

      const groups = groupsRes.data.results || groupsRes.data;
      const students = studentsRes.data.results || studentsRes.data;
      const bookings = bookingsRes.data.results || bookingsRes.data;

      setStats({
        totalGroups: groups.length,
        totalStudents: students.length,
        totalBookings: bookings.length,
        activeGroups: groups.filter(group => group.capacity > 0).length
      });

      // Recent activities (last 5 bookings)
      const recentBookings = bookings
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
        .map(booking => ({
          id: booking.id,
          type: 'booking',
          title: `حجز جديد في مجموعة`,
          description: `${booking.student_details?.full_name || 'طالب'} حجز في مجموعة`,
          time: new Date(booking.created_at).toLocaleDateString('ar-EG'),
          icon: '📅'
        }));

      setRecentActivities(recentBookings);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showToast('خطأ في تحميل بيانات لوحة التحكم', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  const quickActions = [
    {
      title: 'إضافة مجموعة جديدة',
      description: 'إنشاء مجموعة تعليمية جديدة',
      icon: '➕',
      action: () => navigate('/admin/groups'),
      color: 'primary'
    },
    {
      title: 'عرض جميع الطلاب',
      description: 'إدارة ومتابعة الطلاب',
      icon: '👥',
      action: () => navigate('/admin/students'),
      color: 'success'
    },
    {
      title: 'إدارة الحجوزات',
      description: 'متابعة وإدارة الحجوزات',
      icon: '📋',
      action: () => navigate('/admin/bookings'),
      color: 'warning'
    },
    {
      title: 'إعدادات النظام',
      description: 'تخصيص إعدادات المنصة',
      icon: '⚙️',
      action: () => navigate('/admin/settings'),
      color: 'secondary'
    }
  ];

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-main">

      {/* Statistics Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <span className="admin-stat-icon">👥</span>
          <div className="admin-stat-number">{stats.totalGroups}</div>
          <div className="admin-stat-label">إجمالي المجموعات</div>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-icon">🎓</span>
          <div className="admin-stat-number">{stats.totalStudents}</div>
          <div className="admin-stat-label">إجمالي الطلاب</div>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-icon">📅</span>
          <div className="admin-stat-number">{stats.totalBookings}</div>
          <div className="admin-stat-label">إجمالي الحجوزات</div>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-icon">✅</span>
          <div className="admin-stat-number">{stats.activeGroups}</div>
          <div className="admin-stat-label">المجموعات النشطة</div>
        </div>
      </div>

      {/* Quick Actions */}
      {/* <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">
            ⚡ إجراءات سريعة
          </h3>
        </div>
        <div className="row">
          {quickActions.map((action, index) => (
            <div key={index} className="col-md-6 col-lg-3 mb-3">
              <div 
                className="admin-card text-center cursor-pointer"
                onClick={action.action}
                style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.08)';
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>
                  {action.icon}
                </div>
                <h5 className="fw-bold mb-2">{action.title}</h5>
                <p className="text-muted small mb-0">{action.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div> */}

      <div className="row">
        {/* Recent Activities */}
        <div className="col-lg-8">
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">
                📊 النشاطات الأخيرة
              </h3>
            </div>
            {recentActivities.length > 0 ? (
              <div className="list-group list-group-flush">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="list-group-item border-0 px-0">
                    <div className="d-flex align-items-center">
                      <div 
                        className="flex-shrink-0 me-3"
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.2rem'
                        }}
                      >
                        {activity.icon}
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1">{activity.title}</h6>
                        <p className="mb-1 text-muted small">{activity.description}</p>
                        <small className="text-muted">{activity.time}</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📭</div>
                <p className="text-muted">لا توجد نشاطات حديثة</p>
              </div>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="col-lg-4">
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">
                🖥️ حالة النظام
              </h3>
            </div>
            <div className="d-flex flex-column gap-3">
              <div className="d-flex justify-content-between align-items-center">
                <span>حالة الخادم</span>
                <span className="admin-badge admin-badge-success">متصل</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span>قاعدة البيانات</span>
                <span className="admin-badge admin-badge-success">تعمل</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span>آخر نسخة احتياطية</span>
                <span className="admin-badge admin-badge-primary">اليوم</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span>مساحة التخزين</span>
                <span className="admin-badge admin-badge-warning">75%</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Refresh Button */}
      <div 
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000
        }}
      >
        <button
          className="admin-btn admin-btn-primary"
          onClick={() => {
            setLoading(true);
            fetchDashboardData();
          }}
          style={{
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            fontSize: '1.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
          title="تحديث البيانات"
        >
          🔄
        </button>
      </div>

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

export default AdminDashboardMain;
