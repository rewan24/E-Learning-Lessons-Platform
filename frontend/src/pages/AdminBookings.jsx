import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Toast from '../components/Toast';
import Modal from '../components/Modal';

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, groupsRes, studentsRes] = await Promise.all([
        api.get('bookings/admin/'),
        api.get('groups/'),
        api.get('students/')
      ]);
      
      setBookings(bookingsRes.data.results || bookingsRes.data);
      setGroups(groupsRes.data.results || groupsRes.data);
      setStudents(studentsRes.data.results || studentsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('خطأ في تحميل البيانات', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!confirm('هل تريد حذف هذا الحجز؟')) return;
    
    try {
      await api.delete(`bookings/${bookingId}/`);
      setBookings(bookings.filter(booking => booking.id !== bookingId));
      showToast('تم حذف الحجز بنجاح', 'success');
      // Refresh data to get updated counts
      fetchData();
    } catch (error) {
      console.error('Error deleting booking:', error);
      const errorMessage = error.response?.data?.detail || error.response?.data?.error || 'خطأ في حذف الحجز';
      showToast(errorMessage, 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  const getGroupName = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    return group ? group.name : 'مجموعة محذوفة';
  };

  const getGroupStage = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    return group ? group.stage : '';
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.full_name : 'طالب محذوف';
  };

  // Filter and sort bookings
  const filteredAndSortedBookings = bookings
    .filter(booking => {
      const studentName = booking.student_details?.full_name || '';
      const groupName = booking.group_details?.name || '';
      const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           groupName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesGroup = !filterGroup || booking.group.toString() === filterGroup;
      const matchesStage = !filterStage || booking.group_details?.stage === filterStage;
      
      return matchesSearch && matchesGroup && matchesStage;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'student':
          return (a.student_details?.full_name || '').localeCompare(b.student_details?.full_name || '');
        case 'group':
          return (a.group_details?.name || '').localeCompare(b.group_details?.name || '');
        default:
          return 0;
      }
    });

  const getBookingsByGroup = () => {
    const groupStats = {};
    bookings.forEach(booking => {
      const groupId = booking.group;
      if (!groupStats[groupId]) {
        groupStats[groupId] = {
          groupName: booking.group_details?.name || 'مجموعة محذوفة',
          count: 0,
          stage: booking.group_details?.stage || ''
        };
      }
      groupStats[groupId].count++;
    });
    return Object.values(groupStats).sort((a, b) => b.count - a.count);
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
      </div>
    );
  }

  const groupStats = getBookingsByGroup();

  return (
    <div className="admin-bookings">
      {/* Header */}
      <div className="admin-card">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="admin-card-title">
              📅 إدارة الحجوزات
            </h1>
            <p className="text-muted mb-0">
              متابعة وإدارة جميع حجوزات الطلاب في المجموعات
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <span className="admin-stat-icon">📊</span>
          <div className="admin-stat-number">{bookings.length}</div>
          <div className="admin-stat-label">إجمالي الحجوزات</div>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-icon">👥</span>
          <div className="admin-stat-number">{groups.length}</div>
          <div className="admin-stat-label">المجموعات المتاحة</div>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-icon">🎓</span>
          <div className="admin-stat-number">
            {new Set(bookings.map(b => b.student)).size}
          </div>
          <div className="admin-stat-label">الطلاب المحجوزين</div>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-icon">📈</span>
          <div className="admin-stat-number">
            {bookings.filter(b => {
              const today = new Date();
              const bookingDate = new Date(b.created_at);
              return bookingDate.toDateString() === today.toDateString();
            }).length}
          </div>
          <div className="admin-stat-label">حجوزات اليوم</div>
        </div>
      </div>

      {/* Top Groups */}
      <div className="admin-card">
        <h5 className="admin-card-title">🏆 أكثر المجموعات حجزاً</h5>
        <div className="row">
          {groupStats.slice(0, 4).map((stat, index) => (
            <div key={index} className="col-md-3 mb-3">
              <div className="admin-card text-center">
                <div className="h4 text-primary">{stat.count}</div>
                <div className="fw-bold">{stat.groupName}</div>
                <small className="text-muted">
                  {stat.stage === 'GRADE6' ? 'سادس ابتدائي' : 'إعدادي'}
                </small>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="admin-card">
        <div className="row">
          <div className="col-md-4">
            <div className="admin-form-group mb-3 mb-md-0">
              <label className="admin-form-label">البحث</label>
              <input
                type="text"
                className="admin-form-control"
                placeholder="ابحث باسم الطالب أو المجموعة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <div className="admin-form-group mb-3 mb-md-0">
              <label className="admin-form-label">المجموعة</label>
              <select
                className="admin-form-control"
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
              >
                <option value="">جميع المجموعات</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-md-2">
            <div className="admin-form-group mb-3 mb-md-0">
              <label className="admin-form-label">المرحلة</label>
              <select
                className="admin-form-control"
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
              >
                <option value="">جميع المراحل</option>
                <option value="GRADE6">سادس ابتدائي</option>
                <option value="PREP">إعدادي</option>
              </select>
            </div>
          </div>
          <div className="col-md-3">
            <div className="admin-form-group mb-0">
              <label className="admin-form-label">ترتيب حسب</label>
              <select
                className="admin-form-control"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">الأحدث أولاً</option>
                <option value="oldest">الأقدم أولاً</option>
                <option value="student">اسم الطالب</option>
                <option value="group">اسم المجموعة</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="admin-table">
        <table className="table table-hover mb-0">
          <thead>
            <tr>
              <th>الطالب</th>
              <th>المجموعة</th>
              <th>المرحلة</th>
              <th>المواعيد</th>
              <th>رقم الهاتف</th>
              <th>تاريخ الحجز</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedBookings.map(booking => (
              <tr key={booking.id}>
                <td>
                  <div className="fw-bold">
                    {booking.student_details?.full_name || 'غير متوفر'}
                  </div>
                  <small className="text-muted">
                    {booking.student_details?.email || 'غير متوفر'}
                  </small>
                </td>
                <td>
                  <div className="fw-bold">
                    {booking.group_details?.name || 'مجموعة محذوفة'}
                  </div>
                  <small className="text-muted">
                    {booking.group_details?.days || 'غير متوفر'}
                  </small>
                </td>
                <td>
                  <span className="admin-badge admin-badge-primary">
                    {booking.group_details?.stage === 'GRADE6' ? 'سادس ابتدائي' : 'إعدادي'}
                  </span>
                </td>
                <td>
                  {booking.group_details?.schedule || 'غير متوفر'}
                </td>
                <td>
                  {booking.student_details?.phone || 'غير متوفر'}
                </td>
                <td>
                  <div>
                    {new Date(booking.created_at).toLocaleDateString('ar-EG')}
                  </div>
                  <small className="text-muted">
                    {new Date(booking.created_at).toLocaleTimeString('ar-EG')}
                  </small>
                </td>
                <td>
                  <span className="admin-badge admin-badge-success">
                    نشط
                  </span>
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => showBookingDetails(booking)}
                      title="عرض التفاصيل"
                    >
                      👁️
                    </button>
                    <Link 
                      to={`/students/${booking.student}`}
                      className="btn btn-sm btn-outline-info"
                      title="ملف الطالب"
                    >
                      👤
                    </Link>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteBooking(booking.id)}
                      title="حذف الحجز"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredAndSortedBookings.length === 0 && (
          <div className="text-center py-5">
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>
              {searchTerm || filterGroup || filterStage ? '🔍' : '📅'}
            </div>
            <h5>
              {searchTerm || filterGroup || filterStage ? 'لا توجد نتائج' : 'لا توجد حجوزات'}
            </h5>
            <p className="text-muted">
              {searchTerm || filterGroup || filterStage ? 
                'جرب تغيير معايير البحث' : 
                'لم يقم أي طالب بحجز مجموعة بعد'
              }
            </p>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      <Modal 
        show={showBookingModal} 
        onClose={() => setShowBookingModal(false)}
        title="تفاصيل الحجز"
        size="lg"
      >
        {selectedBooking && (
          <div>
            <div className="row">
              {/* Student Info */}
              <div className="col-md-6">
                <div className="admin-card">
                  <h6 className="admin-card-title">👤 معلومات الطالب</h6>
                  <p><strong>الاسم:</strong> {selectedBooking.student_details?.full_name || 'غير متوفر'}</p>
                  <p><strong>البريد:</strong> {selectedBooking.student_details?.email || 'غير متوفر'}</p>
                  <p><strong>الهاتف:</strong> {selectedBooking.student_details?.phone || 'غير متوفر'}</p>
                  <p><strong>المرحلة:</strong> 
                    <span className="admin-badge admin-badge-primary ms-2">
                      {selectedBooking.student_details?.stage === 'GRADE6' ? 'سادس ابتدائي' : 'إعدادي'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Group Info */}
              <div className="col-md-6">
                <div className="admin-card">
                  <h6 className="admin-card-title">👥 معلومات المجموعة</h6>
                  <p><strong>الاسم:</strong> {selectedBooking.group_details?.name || 'غير متوفر'}</p>
                  <p><strong>المرحلة:</strong> 
                    <span className="admin-badge admin-badge-primary ms-2">
                      {selectedBooking.group_details?.stage === 'GRADE6' ? 'سادس ابتدائي' : 'إعدادي'}
                    </span>
                  </p>
                  <p><strong>المواعيد:</strong> {selectedBooking.group_details?.schedule || 'غير متوفر'}</p>
                  <p><strong>الأيام:</strong> {selectedBooking.group_details?.days || 'غير متوفر'}</p>
                </div>
              </div>
            </div>

            {/* Booking Info */}
            <div className="admin-card">
              <h6 className="admin-card-title">📅 معلومات الحجز</h6>
              <div className="row">
                <div className="col-md-6">
                  <p><strong>رقم الحجز:</strong> {selectedBooking.id}</p>
                  <p><strong>تاريخ الحجز:</strong> {new Date(selectedBooking.created_at).toLocaleDateString('ar-EG')}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>وقت الحجز:</strong> {new Date(selectedBooking.created_at).toLocaleTimeString('ar-EG')}</p>
                  <p><strong>الحالة:</strong> 
                    <span className="admin-badge admin-badge-success ms-2">نشط</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="d-flex justify-content-end gap-2">
              <Link 
                to={`/students/${selectedBooking.student}`}
                className="admin-btn admin-btn-primary"
                onClick={() => setShowBookingModal(false)}
              >
                👤 ملف الطالب
              </Link>
              <button 
                className="admin-btn admin-btn-danger"
                onClick={() => {
                  setShowBookingModal(false);
                  handleDeleteBooking(selectedBooking.id);
                }}
              >
                🗑️ حذف الحجز
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
  );
}

export default AdminBookings;
