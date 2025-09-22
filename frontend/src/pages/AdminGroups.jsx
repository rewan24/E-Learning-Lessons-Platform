import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Toast from '../components/Toast';
import Modal from '../components/Modal';

function AdminGroups() {
  const [groups, setGroups] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupBookings, setGroupBookings] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [formData, setFormData] = useState({
    name: '',
    stage: 'GRADE6',
    capacity: 10,
    schedule: '',
    days: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [groupsRes, bookingsRes] = await Promise.all([
        api.get('groups/'),
        api.get('bookings/admin/')
      ]);
      
      setGroups(groupsRes.data.results || groupsRes.data);
      setBookings(bookingsRes.data.results || bookingsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('خطأ في تحميل البيانات', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('groups/create/', formData);
      setGroups([response.data, ...groups]);
      setShowCreateModal(false);
      resetForm();
      showToast('تم إنشاء المجموعة بنجاح', 'success');
      // Refresh data to get updated counts
      fetchData();
    } catch (error) {
      console.error('Error creating group:', error);
      const errorMessage = error.response?.data?.detail || error.response?.data?.error || 'خطأ في إنشاء المجموعة';
      showToast(errorMessage, 'error');
    }
  };

  const handleEditGroup = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`groups/${selectedGroup.id}/`, formData);
      setGroups(groups.map(group => group.id === selectedGroup.id ? response.data : group));
      setShowEditModal(false);
      setSelectedGroup(null);
      resetForm();
      showToast('تم تحديث المجموعة بنجاح', 'success');
      // Refresh data to get updated counts
      fetchData();
    } catch (error) {
      console.error('Error updating group:', error);
      const errorMessage = error.response?.data?.detail || error.response?.data?.error || 'خطأ في تحديث المجموعة';
      showToast(errorMessage, 'error');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!confirm('هل تريد حذف هذه المجموعة؟ سيتم حذف جميع الحجوزات المرتبطة بها.')) return;
    
    try {
      await api.delete(`groups/${groupId}/`);
      setGroups(groups.filter(group => group.id !== groupId));
      showToast('تم حذف المجموعة بنجاح', 'success');
      // Refresh data to get updated counts
      fetchData();
    } catch (error) {
      console.error('Error deleting group:', error);
      const errorMessage = error.response?.data?.detail || error.response?.data?.error || 'خطأ في حذف المجموعة';
      showToast(errorMessage, 'error');
    }
  };

  const showGroupBookings = (group) => {
    setSelectedGroup(group);
    const groupBookingsData = bookings.filter(booking => booking.group === group.id);
    setGroupBookings(groupBookingsData);
    setShowBookingsModal(true);
  };

  const openEditModal = (group) => {
    setSelectedGroup(group);
    setFormData({
      name: group.name,
      stage: group.stage,
      capacity: group.capacity,
      schedule: group.schedule,
      days: group.days
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      stage: 'GRADE6',
      capacity: 10,
      schedule: '',
      days: ''
    });
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">جاري التحميل...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--gray-50) 0%, var(--primary-50) 100%)',
      minHeight: '100vh',
      padding: '0'
    }}>
      <div className="container py-4">
        {/* Header */}
        <div className="text-center mb-5 animate-fade-in">
          <div className="d-flex align-items-center justify-content-center mb-3">
            <div
              className="bg-primary rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "60px", height: "60px" }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="m22 21-3-3m-3-2a3 3 0 1 0-6 0 3 3 0 0 0 6 0z"></path>
              </svg>
            </div>
          </div>
          <h1 className="display-4 fw-bold text-primary mb-3">إدارة المجموعات</h1>
          <p className="lead text-muted">إضافة وتعديل وحذف المجموعات التعليمية</p>
          
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary btn-lg px-4 py-2 rounded-pill shadow-lg"
            style={{
              background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%)',
              border: 'none',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(var(--primary-500), 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(var(--primary-500), 0.2)';
            }}
          >
            <i className="fas fa-plus me-2"></i>
            إضافة مجموعة جديدة
          </button>
        </div>

        {/* Statistics */}
        <div className="row mb-4">
          {[
            { icon: 'fas fa-chart-bar', number: groups.length, label: 'إجمالي المجموعات', color: 'primary' },
            { icon: 'fas fa-users', number: groups.filter(g => g.stage === 'GRADE6').length, label: 'مجموعات السادس الابتدائي', color: 'success' },
            { icon: 'fas fa-graduation-cap', number: groups.filter(g => g.stage === 'PREP').length, label: 'مجموعات الإعدادي', color: 'info' },
            { icon: 'fas fa-calendar-alt', number: bookings.length, label: 'إجمالي الحجوزات', color: 'warning' }
          ].map((stat, index) => (
            <div key={index} className="col-md-6 col-lg-3 mb-3">
              <div className={`card border-0 shadow-sm h-100 hover-lift`} style={{
                background: `linear-gradient(135deg, var(--${stat.color}-50) 0%, var(--${stat.color}-100) 100%)`,
                border: `1px solid var(--${stat.color}-200)`,
                transition: 'all 0.3s ease'
              }}>
                <div className="card-body text-center p-4">
                  <div className={`text-${stat.color} mb-3`} style={{ fontSize: '2.5rem' }}>
                    <i className={stat.icon}></i>
                  </div>
                  <h3 className={`fw-bold text-${stat.color} mb-2`} style={{ fontSize: '2rem' }}>
                    {stat.number}
                  </h3>
                  <p className="text-muted mb-0 small fw-medium">
                    {stat.label}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Groups Grid */}
        <div className="row">
          {groups.length === 0 ? (
            <div className="col-12">
              <div className="card border-0 shadow-sm text-center py-5">
                <div className="card-body">
                  <div className="text-muted mb-4" style={{ fontSize: '4rem' }}>
                    <i className="fas fa-users"></i>
                  </div>
                  <h5 className="text-muted mb-3">لا توجد مجموعات</h5>
                  <p className="text-muted mb-4">ابدأ بإضافة مجموعة جديدة لعرضها هنا</p>
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="btn btn-primary btn-lg px-4 py-2 rounded-pill"
                  >
                    <i className="fas fa-plus me-2"></i>
                    إضافة مجموعة جديدة
                  </button>
                </div>
              </div>
            </div>
          ) : (
            groups.map(group => {
              const groupBookingsCount = bookings.filter(b => b.group === group.id).length;
              const seatsLeft = group.capacity - groupBookingsCount;
              const isFull = seatsLeft <= 0;
              
              return (
                <div key={group.id} className="col-lg-6 col-xl-4 mb-4">
                  <div className="card border-0 shadow-sm h-100 hover-lift" style={{ transition: 'all 0.3s ease' }}>
                    <div className="card-header bg-white border-0 pb-0">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h5 className="card-title text-primary fw-bold mb-1">{group.name}</h5>
                          <p className="text-muted small mb-0">ID: {group.id}</p>
                        </div>
                        <span className={`badge rounded-pill px-3 py-2 ${group.stage === 'GRADE6' ? 'bg-primary' : 'bg-info'}`}>
                          {group.stage === 'GRADE6' ? 'سادس ابتدائي' : 'إعدادي'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="card-body">
                      <div className="row g-3 mb-3">
                        <div className="col-6">
                          <div className="text-center p-2 rounded" style={{ background: 'var(--primary-50)' }}>
                            <div className="text-primary">
                              <i className="fas fa-clock mb-1"></i>
                            </div>
                            <small className="text-muted d-block">المواعيد</small>
                            <small className="fw-bold">{group.schedule}</small>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="text-center p-2 rounded" style={{ background: 'var(--success-50)' }}>
                            <div className="text-success">
                              <i className="fas fa-calendar mb-1"></i>
                            </div>
                            <small className="text-muted d-block">الأيام</small>
                            <small className="fw-bold">{group.days}</small>
                          </div>
                        </div>
                      </div>
                      
                      <div className="row g-2 mb-3">
                        <div className="col-4">
                          <div className="text-center">
                            <div className="text-secondary mb-1">
                              <i className="fas fa-users"></i>
                            </div>
                            <div className="fw-bold text-secondary">{group.capacity}</div>
                            <small className="text-muted">السعة</small>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="text-center">
                            <div className="text-success mb-1">
                              <i className="fas fa-check-circle"></i>
                            </div>
                            <div className="fw-bold text-success">{groupBookingsCount}</div>
                            <small className="text-muted">محجوز</small>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="text-center">
                            <div className={`${seatsLeft > 0 ? 'text-warning' : 'text-danger'} mb-1`}>
                              <i className={`fas ${seatsLeft > 0 ? 'fa-exclamation-triangle' : 'fa-times-circle'}`}></i>
                            </div>
                            <div className={`fw-bold ${seatsLeft > 0 ? 'text-warning' : 'text-danger'}`}>{seatsLeft}</div>
                            <small className="text-muted">متبقي</small>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center mb-3">
                        <span className={`badge rounded-pill px-3 py-2 ${isFull ? 'bg-danger' : 'bg-success'}`}>
                          {isFull ? 'مكتملة' : 'متاحة'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="card-footer bg-white border-0 pt-0">
                      <div className="d-flex gap-2">
                        <button 
                          className="btn btn-outline-primary btn-sm flex-fill"
                          onClick={() => showGroupBookings(group)}
                          title="عرض الحجوزات"
                        >
                          <i className="fas fa-eye me-1"></i>
                          الحجوزات
                        </button>
                        <button 
                          className="btn btn-outline-warning btn-sm flex-fill"
                          onClick={() => openEditModal(group)}
                          title="تعديل"
                        >
                          <i className="fas fa-edit me-1"></i>
                          تعديل
                        </button>
                        <button 
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDeleteGroup(group.id)}
                          title="حذف"
                          style={{ minWidth: '45px' }}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Create Group Modal */}
      <Modal 
        show={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        title="إضافة مجموعة جديدة"
      >
        <form onSubmit={handleCreateGroup}>
          <div className="mb-3">
            <label className="form-label fw-bold">اسم المجموعة</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="مثال: مجموعة المتميزين"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">المرحلة الدراسية</label>
            <select
              className="form-select"
              name="stage"
              value={formData.stage}
              onChange={handleInputChange}
              required
            >
              <option value="GRADE6">سادس ابتدائي</option>
              <option value="PREP">إعدادي</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">السعة (عدد الطلاب)</label>
            <input
              type="number"
              className="form-control"
              name="capacity"
              value={formData.capacity}
              onChange={handleInputChange}
              min="1"
              max="50"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">المواعيد</label>
            <input
              type="text"
              className="form-control"
              name="schedule"
              value={formData.schedule}
              onChange={handleInputChange}
              placeholder="مثال: من 4:00 إلى 6:00 مساءً"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">الأيام</label>
            <input
              type="text"
              className="form-control"
              name="days"
              value={formData.days}
              onChange={handleInputChange}
              placeholder="مثال: السبت والاثنين والأربعاء"
              required
            />
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => setShowCreateModal(false)}
            >
              إلغاء
            </button>
            <button type="submit" className="btn btn-primary">
              <i className="fas fa-plus me-2"></i>
              إضافة المجموعة
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Group Modal */}
      <Modal 
        show={showEditModal} 
        onClose={() => setShowEditModal(false)}
        title={`تعديل مجموعة: ${selectedGroup?.name}`}
      >
        <form onSubmit={handleEditGroup}>
          <div className="mb-3">
            <label className="form-label fw-bold">اسم المجموعة</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">المرحلة الدراسية</label>
            <select
              className="form-select"
              name="stage"
              value={formData.stage}
              onChange={handleInputChange}
              required
            >
              <option value="GRADE6">سادس ابتدائي</option>
              <option value="PREP">إعدادي</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">السعة (عدد الطلاب)</label>
            <input
              type="number"
              className="form-control"
              name="capacity"
              value={formData.capacity}
              onChange={handleInputChange}
              min="1"
              max="50"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">المواعيد</label>
            <input
              type="text"
              className="form-control"
              name="schedule"
              value={formData.schedule}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">الأيام</label>
            <input
              type="text"
              className="form-control"
              name="days"
              value={formData.days}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => setShowEditModal(false)}
            >
              إلغاء
            </button>
            <button type="submit" className="btn btn-primary">
              <i className="fas fa-save me-2"></i>
              حفظ التعديلات
            </button>
          </div>
        </form>
      </Modal>

      {/* Group Bookings Modal */}
      <Modal 
        show={showBookingsModal} 
        onClose={() => setShowBookingsModal(false)}
        title={`حجوزات مجموعة: ${selectedGroup?.name}`}
        size="lg"
      >
        {groupBookings.length === 0 ? (
          <div className="text-center py-5">
            <div className="text-muted mb-4" style={{ fontSize: '4rem' }}>
              <i className="fas fa-inbox"></i>
            </div>
            <h5 className="text-muted mb-3">لا توجد حجوزات</h5>
            <p className="text-muted">لم يحجز أي طالب في هذه المجموعة بعد</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="fw-bold">اسم الطالب</th>
                  <th className="fw-bold">رقم الهاتف</th>
                  <th className="fw-bold">البريد الإلكتروني</th>
                  <th className="fw-bold">المرحلة</th>
                  <th className="fw-bold">تاريخ الحجز</th>
                </tr>
              </thead>
              <tbody>
                {groupBookings.map(booking => (
                  <tr key={booking.id}>
                    <td className="fw-bold text-primary">
                      {booking.student_details?.full_name || 'غير متوفر'}
                    </td>
                    <td>{booking.student_details?.phone || 'غير متوفر'}</td>
                    <td>{booking.student_details?.email || 'غير متوفر'}</td>
                    <td>
                      <span className={`badge rounded-pill px-3 py-2 ${booking.student_details?.stage === 'GRADE6' ? 'bg-primary' : 'bg-info'}`}>
                        {booking.student_details?.stage === 'GRADE6' ? 'سادس ابتدائي' : 'إعدادي'}
                      </span>
                    </td>
                    <td>
                      <span className="text-muted">
                        {new Date(booking.created_at).toLocaleDateString('ar-EG')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

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

export default AdminGroups;
