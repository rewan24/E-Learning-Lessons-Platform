import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    completedLessons: 12,
    totalHours: 45,
    currentStreak: 7,
    achievements: 3,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("access");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:8000/api/users/me/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.detail || "فشل تحميل الملف الشخصي");
        }

        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div
          className="min-vh-100 d-flex align-items-center justify-content-center"
          style={{
            paddingTop: "80px",
            background:
              "linear-gradient(135deg, var(--gray-50) 0%, var(--primary-50) 100%)",
          }}
        >
          <div className="text-center">
            <div
              className="spinner-border text-primary mb-3"
              role="status"
              style={{ width: "3rem", height: "3rem" }}
            ></div>
            <h5 className="text-muted">جاري تحميل البيانات...</h5>
            <p className="text-muted small">يرجى الانتظار قليلاً</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div
        className="min-vh-100"
        style={{
          paddingTop: "80px",
          background:
            "linear-gradient(135deg, var(--gray-50) 0%, var(--primary-50) 100%)",
        }}
      >
        <div className="container py-5">
          {/* Profile Header */}
          <div className="row justify-content-center mb-5">
            <div className="col-lg-8">
              <div className="glass-card shadow-xl rounded-xl overflow-hidden animate-fade-in">
                <div
                  className="card-header text-center position-relative"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--primary-600), var(--secondary-600))",
                    padding: "3rem 2rem 2rem",
                  }}
                >
                  <div className="position-absolute top-0 end-0 p-3">
                    <span className="status-badge success">
                      <span>✓</span>
                      نشط
                    </span>
                  </div>

                  <div className="d-flex align-items-center justify-content-center mb-3">
                    <div
                      className="bg-white rounded-circle d-flex align-items-center justify-content-center shadow-lg"
                      style={{ width: "120px", height: "120px" }}
                    >
                      <span
                        className="text-primary fw-bold"
                        style={{ fontSize: "3rem" }}
                      >
                        {user?.username?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    </div>
                  </div>

                  <h3 className="mb-2 fw-bold text-white">
                    مرحباً، {user?.username || "المستخدم"}! 👋
                  </h3>
                  <p className="mb-0 text-white opacity-75">
                    إليك نظرة شاملة على ملفك الشخصي وإنجازاتك
                  </p>
                </div>

                <div className="card-body p-0">
                  {error && (
                    <div className="p-4">
                      <div
                        className="alert alert-danger d-flex align-items-center mb-0 animate-slide-up"
                        role="alert"
                      >
                        <div
                          className="bg-danger rounded-circle d-flex align-items-center justify-content-center me-3"
                          style={{ width: "24px", height: "24px" }}
                        >
                          <span
                            className="text-white"
                            style={{ fontSize: "12px" }}
                          >
                            ⚠
                          </span>
                        </div>
                        <div>{error}</div>
                      </div>
                    </div>
                  )}

                  <div className="p-4">
                    {/* Profile Information */}
                    {user && (
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <div className="bg-light rounded-lg p-3">
                            <label className="form-label fw-semibold d-flex align-items-center gap-2 mb-2">
                              <span>👤</span>
                              اسم المستخدم
                            </label>
                            <div className="fw-medium text-dark">
                              {user.username}
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6 mb-3">
                          <div className="bg-light rounded-lg p-3">
                            <label className="form-label fw-semibold d-flex align-items-center gap-2 mb-2">
                              <span>📧</span>
                              البريد الإلكتروني
                            </label>
                            <div className="fw-medium text-dark">
                              {user.email || (
                                <span className="text-muted fst-italic">
                                  غير محدد
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6 mb-3">
                          <div className="bg-light rounded-lg p-3">
                            <label className="form-label fw-semibold d-flex align-items-center gap-2 mb-2">
                              <span>📱</span>
                              رقم الهاتف
                            </label>
                            <div className="fw-medium text-dark">
                              {user.phone || (
                                <span className="text-muted fst-italic">
                                  غير محدد
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6 mb-3">
                          <div className="bg-light rounded-lg p-3">
                            <label className="form-label fw-semibold d-flex align-items-center gap-2 mb-2">
                              <span>📅</span>
                              تاريخ الانضمام
                            </label>
                            <div className="fw-medium text-dark">
                              <span className="text-muted fst-italic">
                                {new Date().toLocaleDateString("ar-SA")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {!user && !error && (
                      <div className="text-center py-5">
                        <div className="fs-1 mb-3">🤷‍♂️</div>
                        <h5 className="text-muted">لا توجد بيانات للعرض</h5>
                        <p className="text-muted small">
                          يرجى المحاولة مرة أخرى لاحقاً
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="row g-3 mt-4">
                      <div className="col-md-6">
                        <button
                          className="btn btn-outline-primary w-100 py-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
                          onClick={() => navigate("/")}
                        >
                          <span>🏠</span>
                          العودة للرئيسية
                        </button>
                      </div>
                      <div className="col-md-6">
                        <button
                          className="btn btn-outline-danger w-100 py-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
                          onClick={handleLogout}
                        >
                          <span>🚪</span>
                          تسجيل الخروج
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="row justify-content-center"></div>
        </div>
      </div>
    </>
  );
}

export default Profile;
