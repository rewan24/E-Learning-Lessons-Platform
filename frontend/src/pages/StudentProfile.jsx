import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import LoadingSkeleton from "../components/LoadingSkeleton";
import Navbar from "../components/Navbar";

function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudentProfile();
  }, [id]);

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`students/${id}/`);
      setStudent(response.data);

      // Fetch student's groups
      const bookingsResponse = await api.get(`bookings/?student=${id}`);
      if (bookingsResponse.data && Array.isArray(bookingsResponse.data)) {
        const groupIds = bookingsResponse.data.map(booking => booking.group);
        if (groupIds.length > 0) {
          // Fetch each group individually since we don't have a bulk endpoint
          const groupPromises = groupIds.map(groupId => 
            api.get(`groups/${groupId}/`).catch(err => {
              console.error(`Error fetching group ${groupId}:`, err);
              return null;
            })
          );
          const groupResponses = await Promise.all(groupPromises);
          const validGroups = groupResponses
            .filter(response => response && response.data)
            .map(response => response.data);
          setGroups(validGroups);
        }
      }
    } catch (err) {
      console.error("Error fetching student profile:", err);
      if (err.response?.status === 404) {
        setError("الطالب غير موجود");
      } else {
        setError("حدث خطأ في تحميل بيانات الطالب");
      }
    } finally {
      setLoading(false);
    }
  };


  const formatDate = (dateString) => {
    if (!dateString) return "غير محدد";
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return "غير محدد";
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getStageDisplayName = (stage) => {
    const stageNames = {
      'grade_1': 'أول ابتدائي',
      'grade_2': 'ثاني ابتدائي',
      'grade_3': 'ثالث ابتدائي',
      'grade_4': 'رابع ابتدائي',
      'grade_5': 'خامس ابتدائي',
      'grade_6': 'سادس ابتدائي',
      'prep_1': 'أول إعدادي',
      'prep_2': 'ثاني إعدادي',
      'prep_3': 'ثالث إعدادي',
      'sec_1': 'أول ثانوي',
      'sec_2': 'ثاني ثانوي',
      'sec_3': 'ثالث ثانوي'
    };
    return stageNames[stage] || stage;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container" style={{ paddingTop: "100px", paddingBottom: "50px" }}>
          <LoadingSkeleton />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="container" style={{ paddingTop: "100px", paddingBottom: "50px" }}>
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="alert alert-danger text-center">
                <h4>{error}</h4>
                <button className="btn btn-primary mt-3" onClick={() => navigate(-1)}>
                  العودة
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!student) {
    return (
      <>
        <Navbar />
        <div className="container" style={{ paddingTop: "100px", paddingBottom: "50px" }}>
          <div className="text-center">
            <h4>لم يتم العثور على بيانات الطالب</h4>
            <button className="btn btn-primary mt-3" onClick={() => navigate(-1)}>
              العودة
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container" style={{ paddingTop: "100px", paddingBottom: "50px" }}>
        {/* Header */}
        <div className="row mb-4">
          <div className="col">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h1 className="display-5 fw-bold text-primary mb-1">
                  ملف الطالب
                </h1>
                <p className="text-muted">معلومات تفصيلية عن الطالب ومجموعاته</p>
              </div>
              <button 
                className="btn btn-primary px-4 py-2"
                onClick={() => navigate(-1)}
                style={{
                  borderRadius: "25px",
                  fontWeight: "600",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}
              >
                العودة
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ms-2">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

      <div className="row">
        {/* Student Information */}
        <div className="col-lg-4">
          <div className="glass-card h-100">
            <div className="card-body p-4">
              {/* Avatar */}
              <div className="text-center mb-4">
                <div className="avatar-circle mx-auto mb-3" style={{
                  width: "120px",
                  height: "120px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2.5rem",
                  color: "white",
                  fontWeight: "bold"
                }}>
                  {student.full_name.charAt(0)}
                </div>
                <h3 className="fw-bold text-primary mb-1">{student.full_name}</h3>
                <span className="badge bg-primary">{getStageDisplayName(student.stage)}</span>
              </div>

              {/* Contact Information */}
              <div className="contact-info">
                <h5 className="fw-bold mb-3">معلومات الاتصال</h5>
                
                <div className="info-item mb-3">
                  <div className="d-flex align-items-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary me-3">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    <div>
                      <small className="text-muted d-block">البريد الإلكتروني</small>
                      <span>{student.email}</span>
                    </div>
                  </div>
                </div>

                <div className="info-item mb-3">
                  <div className="d-flex align-items-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary me-3">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <div>
                      <small className="text-muted d-block">رقم الهاتف</small>
                      <span>{student.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="info-item mb-3">
                  <div className="d-flex align-items-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary me-3">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <div>
                      <small className="text-muted d-block">تاريخ الميلاد</small>
                      <span>{formatDate(student.birth_date)}</span>
                      {student.birth_date && (
                        <small className="text-muted d-block">العمر: {calculateAge(student.birth_date)} سنة</small>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {student.notes && (
                <div className="mt-4">
                  <h5 className="fw-bold mb-3">ملاحظات</h5>
                  <div className="bg-light p-3 rounded">
                    <p className="mb-0 text-muted">{student.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Groups Information */}
        <div className="col-lg-8">
          <div className="glass-card">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2 text-primary">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="m22 21-3-3m-3-2a3 3 0 1 0-6 0 3 3 0 0 0 6 0z"></path>
                </svg>
                المجموعات المسجل بها ({groups.length})
              </h5>

              {groups.length === 0 ? (
                <div className="text-center py-5">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted mb-3">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="m22 21-3-3m-3-2a3 3 0 1 0-6 0 3 3 0 0 0 6 0z"></path>
                  </svg>
                  <h6 className="text-muted">لم يتم التسجيل في أي مجموعة بعد</h6>
                  <p className="text-muted mb-0">يمكن للطالب تصفح المجموعات المتاحة والانضمام إليها</p>
                </div>
              ) : (
                <div className="row">
                  {groups.map((group, index) => (
                    <div key={group.id} className="col-md-6 mb-4">
                      <div 
                        className="card h-100 border-0 shadow-sm hover-shadow cursor-pointer"
                        onClick={() => navigate(`/groups/${group.id}`)}
                        style={{ transition: "all 0.3s ease" }}
                      >
                        <div className="card-body p-4">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div className="d-flex align-items-center">
                              <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                  <circle cx="9" cy="7" r="4"></circle>
                                  <path d="m22 21-3-3m-3-2a3 3 0 1 0-6 0 3 3 0 0 0 6 0z"></path>
                                </svg>
                              </div>
                              <span className="badge bg-success">مسجل</span>
                            </div>
                            <span className="badge bg-info text-dark">
                              {getStageDisplayName(group.stage)}
                            </span>
                          </div>

                          <h6 className="card-title fw-bold mb-3 text-primary">
                            {group.name}
                          </h6>

                          <div className="group-details">
                            <div className="detail-item mb-2">
                              <small className="text-muted">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-1">
                                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                  <line x1="16" y1="2" x2="16" y2="6"></line>
                                  <line x1="8" y1="2" x2="8" y2="6"></line>
                                  <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                {group.days} | {group.schedule}
                              </small>
                            </div>
                            <div className="detail-item">
                              <small className="text-muted">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-1">
                                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                  <circle cx="9" cy="7" r="4"></circle>
                                  <line x1="19" y1="8" x2="19" y2="14"></line>
                                  <line x1="22" y1="11" x2="16" y2="11"></line>
                                </svg>
                                {group.seats_left} مقعد متبقي من {group.capacity}
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

export default StudentProfile;
