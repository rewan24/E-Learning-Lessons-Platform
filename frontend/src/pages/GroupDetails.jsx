import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import LoadingSkeleton from "../components/LoadingSkeleton";
import Toast from "../components/Toast";
import api from "../services/api";

function GroupDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [userBookings, setUserBookings] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    fetchGroupDetails();
    fetchUserBookings();
  }, [id]);


  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      // Force fresh data by adding timestamp
      const response = await api.get(`groups/${id}/?t=${Date.now()}`);
      setGroup(response.data);
      setError(null);
    } catch (err) {
      setError("حدث خطأ في تحميل تفاصيل المجموعة");
      console.error("Error fetching group details:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBookings = async () => {
    try {
      const token = localStorage.getItem("access");
      if (!token) {
        setUserBookings([]);
        return;
      }

      const response = await api.get("bookings/");
      if (response.data && Array.isArray(response.data)) {
        const groupIds = response.data.map(booking => {
          // Handle both object and ID formats
          return typeof booking.group === 'object' ? booking.group.id : booking.group;
        });
        setUserBookings(groupIds);
      } else {
        setUserBookings([]);
      }
    } catch (err) {
      // Silently handle auth errors and user without student record
      setUserBookings([]);
      // Only log non-auth errors
      if (err.response?.status !== 401 && err.response?.status !== 400) {
        console.error("Error fetching user bookings:", err);
      }
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: "", type: "success" });
  };

  const handleJoinGroup = async () => {
    const token = localStorage.getItem("access");
    if (!token) {
      showToast("يجب تسجيل الدخول أولاً", "error");
      navigate("/login");
      return;
    }

    try {
      setBookingLoading(true);
      await api.post(`bookings/group/${id}/join/`);
      showToast("تم الانضمام إلى المجموعة بنجاح!", "success");
      
      // Add group to user bookings immediately
      setUserBookings(prev => [...prev, parseInt(id)]);
      
      // Update user bookings and group details
      await fetchUserBookings();
      await fetchGroupDetails();
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.detail ||
                          "حدث خطأ في الانضمام إلى المجموعة";
      showToast(errorMessage, "error");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      setBookingLoading(true);
      await api.post(`bookings/group/${id}/leave/`);
      showToast("تم مغادرة المجموعة بنجاح", "success");
      
      // Remove group from user bookings immediately
      setUserBookings(prev => prev.filter(groupId => groupId !== parseInt(id)));
      
      // Update user bookings and group details
      await fetchUserBookings();
      await fetchGroupDetails();
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
                          "حدث خطأ في مغادرة المجموعة";
      showToast(errorMessage, "error");
    } finally {
      setBookingLoading(false);
    }
  };

  const getStageDisplayName = (stage) => {
    const stageMap = {
      "GRADE6": "سادس ابتدائي",
      "PREP": "إعدادي"
    };
    return stageMap[stage] || stage;
  };

  const isUserEnrolled = userBookings.includes(parseInt(id));

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mt-5 pt-5">
          <LoadingSkeleton />
        </div>
      </>
    );
  }

  if (error || !group) {
    return (
      <>
        <Navbar />
        <div className="container mt-5 pt-5">
          <div className="text-center py-5">
            <div className="text-danger mb-3">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <h4 className="text-danger">{error || "المجموعة غير موجودة"}</h4>
            <button className="btn btn-primary mt-3" onClick={() => navigate("/groups")}>
              العودة إلى المجموعات
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Toast 
        show={toast.show} 
        message={toast.message} 
        type={toast.type} 
        onClose={hideToast} 
      />
      
      <div 
        className="min-vh-100 d-flex flex-column"
        style={{
          paddingTop: "80px",
          background: "linear-gradient(135deg, var(--gray-50) 0%, var(--primary-50) 100%)",
        }}
      >
        <div className="container py-5">
          {/* Back Button */}
          <div className="mb-4">
            <button 
              className="btn btn-outline-primary d-flex align-items-center"
              onClick={() => navigate("/groups")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2">
                <polyline points="9,18 15,12 9,6"></polyline>
              </svg>
              العودة إلى المجموعات
            </button>
          </div>

          <div className="row">
            {/* Group Details Card */}
            <div className="col-lg-8">
              <div className="glass-card animate-fade-in">
                <div className="card-body p-4">
                  {/* Header */}
                  <div className="d-flex justify-content-between align-items-start mb-4">
                    <div className="d-flex align-items-center">
                      <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="m22 21-3-3m-3-2a3 3 0 1 0-6 0 3 3 0 0 0 6 0z"></path>
                        </svg>
                      </div>
                      <div>
                        <h1 className="h3 fw-bold text-primary mb-1">{group.name}</h1>
                        <span className="badge bg-info text-dark fs-6">
                          {getStageDisplayName(group.stage)}
                        </span>
                      </div>
                    </div>
                    <div className="text-end">
                      <span className={`badge fs-6 ${group.is_full ? 'bg-danger' : 'bg-success'}`}>
                        {group.is_full ? 'مكتملة' : 'متاحة'}
                      </span>
                      {isUserEnrolled && (
                        <div className="mt-2">
                          <span className="badge bg-primary fs-6">مسجل</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Schedule & Details */}
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="d-flex align-items-center mb-3">
                        <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12,6 12,12 16,14"></polyline>
                          </svg>
                        </div>
                        <div>
                          <h6 className="fw-bold mb-1 text-primary">الموعد</h6>
                          <p className="mb-0 text-muted">{group.schedule}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-center mb-3">
                        <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                        </div>
                        <div>
                          <h6 className="fw-bold mb-1 text-primary">الأيام</h6>
                          <p className="mb-0 text-muted">{group.days}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Capacity */}
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="fw-bold text-primary mb-0">سعة المجموعة</h6>
                      <span className="text-muted">
                        {group.capacity - group.seats_left} من {group.capacity} طلاب
                      </span>
                    </div>
                    <div className="progress mb-2" style={{ height: "12px" }}>
                      <div 
                        className={`progress-bar ${group.is_full ? 'bg-danger' : 'bg-success'}`}
                        style={{ width: `${((group.capacity - group.seats_left) / group.capacity) * 100}%` }}
                      ></div>
                    </div>
                    <div className="d-flex justify-content-between">
                      <small className="text-muted">
                        {group.seats_left} مقعد متبقي
                      </small>
                      <small className="text-muted">
                        {((group.capacity - group.seats_left) / group.capacity * 100).toFixed(0)}% مكتمل
                      </small>
                    </div>
                  </div>

                  {/* Students List */}
                  {group.students && group.students.length > 0 && (
                    <div className="mb-4">
                      <h6 className="fw-bold text-primary mb-3">الطلاب المسجلين</h6>
                      <div className="row">
                        {group.students.map((student, index) => (
                          <div key={index} className="col-md-6 mb-2">
                            <div 
                              className="d-flex align-items-center cursor-pointer hover-shadow p-2 rounded"
                              onClick={() => {
                                if (student.id) {
                                  navigate(`/students/${student.id}`);
                                } else {
                                  alert("عذراً، لا يمكن عرض ملف الطالب في الوقت الحالي");
                                }
                              }}
                              style={{ 
                                transition: "all 0.3s ease",
                                border: "1px solid transparent"
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "rgba(13, 110, 253, 0.05)";
                                e.currentTarget.style.borderColor = "rgba(13, 110, 253, 0.2)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "transparent";
                                e.currentTarget.style.borderColor = "transparent";
                              }}
                            >
                              <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                  <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                              </div>
                              <div className="flex-grow-1">
                                <small className="text-primary fw-semibold d-block">{student.full_name}</small>
                                <small className="text-muted">انقر لعرض الملف الشخصي</small>
                              </div>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
                                <path d="m9 18 6-6-6-6"/>
                              </svg>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Panel */}
            <div className="col-lg-4">
              <div className="glass-card animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <div className="card-body p-4 text-center">
                  <div className="mb-4">
                    <div className={`bg-${group.is_full ? 'danger' : 'success'} bg-opacity-10 rounded-circle p-3 d-inline-flex`}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {group.is_full ? (
                          <>
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                          </>
                        ) : (
                          <>
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22,4 12,14.01 9,11.01"></polyline>
                          </>
                        )}
                      </svg>
                    </div>
                  </div>

                  <h5 className="fw-bold mb-3">
                    {isUserEnrolled ? "أنت مسجل في هذه المجموعة" : 
                     group.is_full ? "المجموعة مكتملة" : "انضم إلى المجموعة"}
                  </h5>

                  <p className="text-muted mb-4">
                    {isUserEnrolled ? "تم تسجيلك بنجاح! يمكنك مغادرة المجموعة إذا احتجت لذلك" :
                     group.is_full ? "لا يمكن الانضمام إلى هذه المجموعة حالياً" :
                     "انضم إلى هذه المجموعة واستمتع بالتعلم مع زملائك"}
                  </p>

                  {isUserEnrolled ? (
                    <div>
                      <button 
                        className="btn btn-secondary w-100 py-3 fw-semibold mb-3"
                        disabled={true}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22,4 12,14.01 9,11.01"></polyline>
                        </svg>
                        أنت مسجل في هذه المجموعة
                      </button>
                      <button 
                        className="btn btn-danger w-100 py-2 fw-semibold"
                        onClick={handleLeaveGroup}
                        disabled={bookingLoading}
                        style={{ fontSize: "0.9rem" }}
                      >
                        {bookingLoading ? (
                          <span className="loading-spinner">
                            <span className="spinner-border spinner-border-sm" role="status"></span>
                            جاري المغادرة...
                          </span>
                        ) : (
                          <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2">
                              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                              <polyline points="16,17 21,12 16,7"></polyline>
                              <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                            مغادرة المجموعة
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <button 
                      className={`btn w-100 py-3 fw-semibold ${group.is_full ? 'btn-secondary' : 'btn-success'}`}
                      onClick={handleJoinGroup}
                      disabled={group.is_full || bookingLoading}
                    >
                      {bookingLoading ? (
                        <span className="loading-spinner">
                          <span className="spinner-border spinner-border-sm" role="status"></span>
                          جاري الانضمام...
                        </span>
                      ) : group.is_full ? (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                          </svg>
                          المجموعة مكتملة
                        </>
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <line x1="19" y1="8" x2="19" y2="14"></line>
                            <line x1="22" y1="11" x2="16" y2="11"></line>
                          </svg>
                          انضم إلى المجموعة
                        </>
                      )}
                    </button>
                  )}

                  <div className="mt-3">
                    <small className="text-muted">
                      {group.seats_left} مقعد متبقي من {group.capacity}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default GroupDetails;
