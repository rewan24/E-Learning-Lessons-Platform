import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Toast from '../components/Toast';
import Modal from '../components/Modal';

function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentBookings, setStudentBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsRes, bookingsRes, groupsRes] = await Promise.all([
        api.get('students/'),
        api.get('bookings/admin/'),
        api.get('groups/')
      ]);
      
      setStudents(studentsRes.data.results || studentsRes.data);
      setBookings(bookingsRes.data.results || bookingsRes.data);
      setGroups(groupsRes.data.results || groupsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('خطأ في تحميل البيانات', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showStudentDetails = (student) => {
    setSelectedStudent(student);
    const studBookings = bookings.filter(booking => booking.student === student.id);
    setStudentBookings(studBookings);
    setShowStudentModal(true);
  };

  const handleDeleteStudent = async (studentId) => {
    if (!confirm('هل تريد حذف هذا الطالب؟ سيتم حذف جميع حجوزاته أيضاً.')) return;
    
    try {
      await api.delete(`students/${studentId}/`);
      setStudents(students.filter(student => student.id !== studentId));
      showToast('تم حذف الطالب بنجاح', 'success');
      // Refresh data to get updated counts
      fetchData();
    } catch (error) {
      console.error('Error deleting student:', error);
      const errorMessage = error.response?.data?.detail || error.response?.data?.error || 'خطأ في حذف الطالب';
      showToast(errorMessage, 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  // Filter students based on search term and stage
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.phone?.includes(searchTerm);
    const matchesStage = !filterStage || student.stage === filterStage;
    return matchesSearch && matchesStage;
  });

  const getStudentBookingsCount = (studentId) => {
    return bookings.filter(booking => booking.student === studentId).length;
  };

  const getGroupName = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    return group ? group.name : 'مجموعة محذوفة';
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
              className="bg-success rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "60px", height: "60px" }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
          <h1 className="display-4 fw-bold text-success mb-3">إدارة الطلاب</h1>
          <p className="lead text-muted">عرض ومتابعة بيانات جميع الطلاب المسجلين</p>
        </div>

        {/* Statistics */}
        <div className="row mb-4">
          {[
            { icon: 'fas fa-users', number: students.length, label: 'إجمالي الطلاب', color: 'success' },
            { icon: 'fas fa-book-open', number: students.filter(s => s.stage === 'GRADE6').length, label: 'طلاب السادس الابتدائي', color: 'primary' },
            { icon: 'fas fa-graduation-cap', number: students.filter(s => s.stage === 'PREP').length, label: 'طلاب الإعدادي', color: 'info' },
            { icon: 'fas fa-calendar-check', number: bookings.length, label: 'إجمالي الحجوزات', color: 'warning' }
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

        {/* Search and Filter */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <div className="row">
              <div className="col-md-8">
                <div className="mb-3 mb-md-0">
                  <label className="form-label fw-bold text-muted">البحث عن طالب</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <i className="fas fa-search text-muted"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 ps-0"
                      placeholder="ابحث بالاسم أو البريد الإلكتروني أو رقم الهاتف..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div>
                  <label className="form-label fw-bold text-muted">تصفية حسب المرحلة</label>
                  <select
                    className="form-select"
                    value={filterStage}
                    onChange={(e) => setFilterStage(e.target.value)}
                  >
                    <option value="">جميع المراحل</option>
                    <option value="GRADE6">سادس ابتدائي</option>
                    <option value="PREP">إعدادي</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Students Table */}
      <div className="admin-table">
        <table className="table table-hover mb-0">
          <thead>
            <tr>
              <th>الاسم الكامل</th>
              <th>البريد الإلكتروني</th>
              <th>رقم الهاتف</th>
              <th>المرحلة</th>
              <th>عدد الحجوزات</th>
              <th>تاريخ التسجيل</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(student => {
              const bookingsCount = getStudentBookingsCount(student.id);
              
              return (
                <tr key={student.id}>
                  <td>
                    <div className="fw-bold">{student.full_name}</div>
                    <small className="text-muted">ID: {student.id}</small>
                  </td>
                  <td>{student.email || 'غير متوفر'}</td>
                  <td>{student.phone || 'غير متوفر'}</td>
                  <td>
                    <span className="admin-badge admin-badge-primary">
                      {student.stage === 'GRADE6' ? 'سادس ابتدائي' : 'إعدادي'}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-badge ${bookingsCount > 0 ? 'admin-badge-success' : 'admin-badge-secondary'}`}>
                      {bookingsCount}
                    </span>
                  </td>
                  <td>
                    {student.created_at ? 
                      new Date(student.created_at).toLocaleDateString('ar-EG') : 
                      'غير متوفر'
                    }
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => showStudentDetails(student)}
                        title="عرض التفاصيل"
                      >
                        👁️
                      </button>
                      <Link 
                        to={`/students/${student.id}`}
                        className="btn btn-sm btn-outline-info"
                        title="عرض الملف الشخصي"
                      >
                        👤
                      </Link>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteStudent(student.id)}
                        title="حذف الطالب"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {filteredStudents.length === 0 && (
          <div className="text-center py-5">
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>
              {searchTerm || filterStage ? '🔍' : '👥'}
            </div>
            <h5>
              {searchTerm || filterStage ? 'لا توجد نتائج' : 'لا يوجد طلاب'}
            </h5>
            <p className="text-muted">
              {searchTerm || filterStage ? 
                'جرب تغيير معايير البحث' : 
                'لم يسجل أي طالب في المنصة بعد'
              }
            </p>
          </div>
        )}
      </div>

      {/* Student Details Modal */}
      <Modal 
        show={showStudentModal} 
        onClose={() => setShowStudentModal(false)}
        title={`تفاصيل الطالب: ${selectedStudent?.full_name}`}
        size="lg"
      >
        {selectedStudent && (
          <div>
            {/* Student Info */}
            <div className="admin-card">
              <h5 className="admin-card-title">📋 معلومات الطالب</h5>
              <div className="row">
                <div className="col-md-6">
                  <p><strong>الاسم الكامل:</strong> {selectedStudent.full_name}</p>
                  <p><strong>البريد الإلكتروني:</strong> {selectedStudent.email || 'غير متوفر'}</p>
                  <p><strong>رقم الهاتف:</strong> {selectedStudent.phone || 'غير متوفر'}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>المرحلة:</strong> 
                    <span className="admin-badge admin-badge-primary ms-2">
                      {selectedStudent.stage === 'GRADE6' ? 'سادس ابتدائي' : 'إعدادي'}
                    </span>
                  </p>
                  <p><strong>تاريخ التسجيل:</strong> {
                    selectedStudent.created_at ? 
                      new Date(selectedStudent.created_at).toLocaleDateString('ar-EG') : 
                      'غير متوفر'
                  }</p>
                  <p><strong>ID:</strong> {selectedStudent.id}</p>
                </div>
              </div>
            </div>

            {/* Student Bookings */}
            <div className="admin-card">
              <h5 className="admin-card-title">📅 حجوزات الطالب ({studentBookings.length})</h5>
              {studentBookings.length > 0 ? (
                <div className="admin-table">
                  <table className="table table-striped mb-0">
                    <thead>
                      <tr>
                        <th>اسم المجموعة</th>
                        <th>المرحلة</th>
                        <th>المواعيد</th>
                        <th>تاريخ الحجز</th>
                        <th>الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentBookings.map(booking => {
                        const group = groups.find(g => g.id === booking.group);
                        return (
                          <tr key={booking.id}>
                            <td className="fw-bold">
                              {group ? group.name : 'مجموعة محذوفة'}
                            </td>
                            <td>
                              {group && (
                                <span className="admin-badge admin-badge-primary">
                                  {group.stage === 'GRADE6' ? 'سادس ابتدائي' : 'إعدادي'}
                                </span>
                              )}
                            </td>
                            <td>{group ? `${group.schedule} - ${group.days}` : 'غير متوفر'}</td>
                            <td>
                              {new Date(booking.created_at).toLocaleDateString('ar-EG')}
                            </td>
                            <td>
                              <span className="admin-badge admin-badge-success">
                                نشط
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>📭</div>
                  <p className="text-muted">لا توجد حجوزات لهذا الطالب</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="d-flex justify-content-end gap-2">
              <Link 
                to={`/students/${selectedStudent.id}`}
                className="admin-btn admin-btn-primary"
                onClick={() => setShowStudentModal(false)}
              >
                👤 عرض الملف الشخصي
              </Link>
              <button 
                className="admin-btn admin-btn-danger"
                onClick={() => {
                  setShowStudentModal(false);
                  handleDeleteStudent(selectedStudent.id);
                }}
              >
                🗑️ حذف الطالب
              </button>
            </div>
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
    </div>
  );
}

export default AdminStudents;
