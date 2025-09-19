import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import LoadingSkeleton from "../components/LoadingSkeleton";
import api from "../services/api";

function Groups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [userBookings, setUserBookings] = useState([]);

  useEffect(() => {
    fetchGroups();
    fetchUserBookings();
  }, [searchTerm, stageFilter]);

  const fetchUserBookings = async () => {
    try {
      const token = localStorage.getItem("access");
      if (!token) {
        setUserBookings([]);
        return;
      }

      const response = await api.get("bookings/");
      if (response.data && Array.isArray(response.data)) {
        setUserBookings(response.data.map(booking => booking.group));
      } else {
        setUserBookings([]);
      }
    } catch (err) {
      // Silently handle auth errors
      setUserBookings([]);
    }
  };

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (stageFilter) params.append("stage", stageFilter);

      const response = await api.get(`groups/?${params.toString()}`);
      setGroups(response.data.results || response.data);
      setError(null);
    } catch (err) {
      setError("حدث خطأ في تحميل المجموعات");
      console.error("Error fetching groups:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStageDisplayName = (stage) => {
    const stageMap = {
      "GRADE6": "سادس ابتدائي",
      "PREP": "إعدادي"
    };
    return stageMap[stage] || stage;
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <>
      <Navbar />
      <div 
        className="min-vh-100 d-flex flex-column"
        style={{
          paddingTop: "80px",
          background: "linear-gradient(135deg, var(--gray-50) 0%, var(--primary-50) 100%)",
        }}
      >
        <div className="container py-5">
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
            <h1 className="display-4 fw-bold text-primary mb-3">المجموعات المتاحة</h1>
            <p className="lead text-muted">اختر المجموعة المناسبة لك وانضم إليها</p>
          </div>

          {/* Search and Filter */}
          <div className="row mb-4">
            <div className="col-md-8">
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control form-control-lg ps-5"
                  placeholder="ابحث عن مجموعة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="position-absolute top-50 start-0 translate-middle-y ms-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <select
                className="form-select form-select-lg"
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
              >
                <option value="">جميع المراحل</option>
                <option value="GRADE6">سادس ابتدائي</option>
                <option value="PREP">إعدادي</option>
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger d-flex align-items-center mb-4">
              <div className="bg-danger rounded-circle d-flex align-items-center justify-content-center me-3"
                   style={{ width: "24px", height: "24px", minWidth: "24px" }}>
                <span className="text-white" style={{ fontSize: "12px" }}>⚠</span>
              </div>
              <div>{error}</div>
            </div>
          )}

          {/* Groups Grid */}
          {filteredGroups.length === 0 ? (
            <div className="text-center py-5">
              <div className="text-muted mb-3">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="m22 21-3-3m-3-2a3 3 0 1 0-6 0 3 3 0 0 0 6 0z"></path>
                </svg>
              </div>
              <h4 className="text-muted">لا توجد مجموعات متاحة</h4>
              <p className="text-muted">جرب تغيير معايير البحث</p>
            </div>
          ) : (
            <div className="row">
              {filteredGroups.map((group, index) => (
                <div key={group.id} className="col-lg-6 col-xl-4 mb-4">
                  <div 
                    className="glass-card h-100 animate-fade-in" 
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="card-body p-4">
                      {/* Group Header */}
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                              <circle cx="9" cy="7" r="4"></circle>
                              <path d="m22 21-3-3m-3-2a3 3 0 1 0-6 0 3 3 0 0 0 6 0z"></path>
                            </svg>
                          </div>
                          <div>
                            {userBookings.includes(group.id) ? (
                              <span className="badge bg-primary mb-2">
                                مسجل
                              </span>
                            ) : (
                              <span className={`badge ${group.is_full ? 'bg-danger' : 'bg-success'} mb-2`}>
                                {group.is_full ? 'مكتملة' : 'متاحة'}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="badge bg-info text-dark">
                          {getStageDisplayName(group.stage)}
                        </span>
                      </div>

                      {/* Group Name */}
                      <h5 className="card-title fw-bold mb-3 text-primary">
                        {group.name}
                      </h5>

                      {/* Group Info */}
                      <div className="mb-3">
                        <div className="d-flex align-items-center mb-2 text-muted">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12,6 12,12 16,14"></polyline>
                          </svg>
                          <small>{group.schedule}</small>
                        </div>
                        <div className="d-flex align-items-center mb-2 text-muted">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                          <small>{group.days}</small>
                        </div>
                        <div className="d-flex align-items-center text-muted">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="m22 21-3-3m-3-2a3 3 0 1 0-6 0 3 3 0 0 0 6 0z"></path>
                          </svg>
                          <small>{group.seats_left} مقعد متبقي من {group.capacity}</small>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="progress" style={{ height: "8px" }}>
                          <div 
                            className={`progress-bar ${group.is_full ? 'bg-danger' : 'bg-success'}`}
                            style={{ width: `${((group.capacity - group.seats_left) / group.capacity) * 100}%` }}
                          ></div>
                        </div>
                        <small className="text-muted">
                          {group.capacity - group.seats_left} من {group.capacity} طلاب
                        </small>
                      </div>

                      {/* Action Button */}
                      <Link 
                        to={`/groups/${group.id}`}
                        className="btn btn-primary w-100 fw-semibold"
                      >
                        عرض التفاصيل
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ms-2">
                          <polyline points="15,18 9,12 15,6"></polyline>
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Groups;
