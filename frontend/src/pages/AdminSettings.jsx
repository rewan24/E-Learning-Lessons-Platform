import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Toast from '../components/Toast';

function AdminSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGroups: 0,
    totalStudents: 0,
    totalBookings: 0
  });

  const [systemSettings, setSystemSettings] = useState({
    platformName: 'منصة أ/ إيناس إبراهيم كناني التعليمية',
    platformDescription: 'تعليم متميز لطلاب السادس الابتدائي والإعدادي',
    contactEmail: 'admin@platform.com',
    contactPhone: '+201234567890',
    maxGroupCapacity: 50,
    enableRegistration: true,
    enableBookings: true,
    maintenanceMode: false
  });

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      setLoading(true);
      const [groupsRes, studentsRes, bookingsRes, usersRes] = await Promise.all([
        api.get('groups/'),
        api.get('students/'),
        api.get('bookings/admin/'),
        api.get('users/me/') // For demo, we'll use current user
      ]);

      setStats({
        totalGroups: (groupsRes.data.results || groupsRes.data).length,
        totalStudents: (studentsRes.data.results || studentsRes.data).length,
        totalBookings: (bookingsRes.data.results || bookingsRes.data).length,
        totalUsers: 1 // Demo value
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      showToast('خطأ في تحميل الإحصائيات', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Simulate saving process
      await new Promise(resolve => setTimeout(resolve, 1500));
      // In a real app, you would save these to your backend
      showToast('تم حفظ التغييرات بنجاح! ✅', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('خطأ في حفظ الإعدادات', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBackupData = async () => {
    try {
      setLoading(true);
      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 2000));
      showToast('تم إنشاء نسخة احتياطية بنجاح', 'success');
    } catch (error) {
      showToast('خطأ في إنشاء النسخة الاحتياطية', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async () => {
    try {
      setLoading(true);
      // Simulate cache clearing
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast('تم مسح التخزين المؤقت بنجاح', 'success');
    } catch (error) {
      showToast('خطأ في مسح التخزين المؤقت', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSystemSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  const quickActions = [
    {
      title: 'نسخة احتياطية',
      description: 'إنشاء نسخة احتياطية من البيانات',
      icon: '💾',
      action: handleBackupData,
      color: 'primary'
    },
    {
      title: 'مسح التخزين المؤقت',
      description: 'تحسين أداء النظام',
      icon: '🧹',
      action: handleClearCache,
      color: 'warning'
    },
    {
      title: 'تحديث الإحصائيات',
      description: 'إعادة تحميل إحصائيات النظام',
      icon: '🔄',
      action: fetchSystemStats,
      color: 'info'
    },
    {
      title: 'عرض السجلات',
      description: 'مراجعة نشاطات النظام',
      icon: '📋',
      action: () => showToast('ميزة السجلات قريباً', 'info'),
      color: 'secondary'
    }
  ];

  return (
    <div className="admin-settings">
      {/* Header */}
      <div className="admin-card">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="admin-card-title">
              ⚙️ إعدادات النظام
            </h1>
            <p className="text-muted mb-0">
              إدارة إعدادات المنصة والتحكم في النظام
            </p>
          </div>
        </div>
      </div>

      {/* System Statistics */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <span className="admin-stat-icon">👥</span>
          <div className="admin-stat-number">{stats.totalGroups}</div>
          <div className="admin-stat-label">المجموعات</div>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-icon">🎓</span>
          <div className="admin-stat-number">{stats.totalStudents}</div>
          <div className="admin-stat-label">الطلاب</div>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-icon">📅</span>
          <div className="admin-stat-number">{stats.totalBookings}</div>
          <div className="admin-stat-label">الحجوزات</div>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-icon">👤</span>
          <div className="admin-stat-number">{stats.totalUsers}</div>
          <div className="admin-stat-label">المستخدمين</div>
        </div>
      </div>

      <div className="row">
        {/* Platform Settings */}
        <div className="col-lg-8">
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">🏛️ إعدادات المنصة</h3>
            </div>
            <form onSubmit={handleSaveSettings}>
              <div className="row">
                <div className="col-md-6">
                  <div className="admin-form-group">
                    <label className="admin-form-label">اسم المنصة</label>
                    <input
                      type="text"
                      className="admin-form-control"
                      name="platformName"
                      value={systemSettings.platformName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="admin-form-group">
                    <label className="admin-form-label">البريد الإلكتروني</label>
                    <input
                      type="email"
                      className="admin-form-control"
                      name="contactEmail"
                      value={systemSettings.contactEmail}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">وصف المنصة</label>
                <textarea
                  className="admin-form-control"
                  name="platformDescription"
                  value={systemSettings.platformDescription}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="admin-form-group">
                    <label className="admin-form-label">رقم الهاتف</label>
                    <input
                      type="text"
                      className="admin-form-control"
                      name="contactPhone"
                      value={systemSettings.contactPhone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="admin-form-group">
                    <label className="admin-form-label">الحد الأقصى لسعة المجموعة</label>
                    <input
                      type="number"
                      className="admin-form-control"
                      name="maxGroupCapacity"
                      value={systemSettings.maxGroupCapacity}
                      onChange={handleInputChange}
                      min="1"
                      max="100"
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-4">
                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="enableRegistration"
                      checked={systemSettings.enableRegistration}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label">
                      تفعيل التسجيل للطلاب الجدد
                    </label>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="enableBookings"
                      checked={systemSettings.enableBookings}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label">
                      تفعيل حجز المجموعات
                    </label>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="maintenanceMode"
                      checked={systemSettings.maintenanceMode}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label">
                      وضع الصيانة
                    </label>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end">
                <button 
                  type="submit" 
                  className="admin-btn admin-btn-primary"
                  disabled={loading}
                >
                  {loading ? '⏳ جاري الحفظ...' : '💾 حفظ الإعدادات'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-lg-4">
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">⚡ إجراءات سريعة</h3>
            </div>
            <div className="d-flex flex-column gap-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className={`admin-btn admin-btn-${action.color} w-100 text-start`}
                  onClick={action.action}
                  disabled={loading}
                  style={{ padding: '15px' }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <span style={{ fontSize: '1.5rem' }}>{action.icon}</span>
                    <div>
                      <div className="fw-bold">{action.title}</div>
                      <small className="opacity-75">{action.description}</small>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">🖥️ حالة النظام</h3>
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
              <div className="d-flex justify-content-between align-items-center">
                <span>وضع الصيانة</span>
                <span className={`admin-badge ${systemSettings.maintenanceMode ? 'admin-badge-warning' : 'admin-badge-success'}`}>
                  {systemSettings.maintenanceMode ? 'مفعل' : 'معطل'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">ℹ️ معلومات النظام</h3>
        </div>
        <div className="row">
          <div className="col-md-3">
            <h6>إصدار المنصة</h6>
            <p className="text-muted">v1.0.0</p>
          </div>
          <div className="col-md-3">
            <h6>تاريخ آخر تحديث</h6>
            <p className="text-muted">{new Date().toLocaleDateString('ar-EG')}</p>
          </div>
          <div className="col-md-3">
            <h6>البيئة</h6>
            <p className="text-muted">الإنتاج</p>
          </div>
          <div className="col-md-3">
            <h6>المطور</h6>
            <p className="text-muted">فريق التطوير</p>
          </div>
        </div>
      </div>

      {/* Admin Tools */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">🛠️ أدوات المطور</h3>
        </div>
        <div className="row">
          <div className="col-md-6">
            <h6>إعادة تشغيل الخدمات</h6>
            <p className="text-muted mb-3">إعادة تشغيل خدمات النظام</p>
            <button 
              className="admin-btn admin-btn-warning"
              onClick={() => showToast('تم إعادة تشغيل الخدمات', 'success')}
            >
              🔄 إعادة تشغيل
            </button>
          </div>
          <div className="col-md-6">
            <h6>فحص التحديثات</h6>
            <p className="text-muted mb-3">البحث عن تحديثات جديدة للنظام</p>
            <button 
              className="admin-btn admin-btn-info"
              onClick={() => showToast('لا توجد تحديثات متاحة', 'info')}
            >
              🔍 فحص التحديثات
            </button>
          </div>
        </div>
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

export default AdminSettings;
