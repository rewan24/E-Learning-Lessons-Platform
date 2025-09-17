import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post("token/", formData);
      const data = response.data;

      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      // Set authorization header for future requests
      api.defaults.headers.common["Authorization"] = `Bearer ${data.access}`;

      // Get user info
      const userResponse = await api.get("users/me/");
      localStorage.setItem("user", JSON.stringify(userResponse.data));

      navigate("/profile");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "فشل تسجيل الدخول. يرجى التحقق من البيانات والمحاولة مرة أخرى."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div
        className="min-vh-100 d-flex align-items-center"
        style={{
          paddingTop: "80px",
          background:
            "linear-gradient(135deg, var(--gray-50) 0%, var(--primary-50) 100%)",
        }}
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div className="glass-card shadow-xl rounded-xl overflow-hidden animate-fade-in">
                <div className="card-header text-center">
                  <div className="d-flex align-items-center justify-content-center mb-3">
                    <div
                      className="bg-primary rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: "60px", height: "60px" }}
                    >
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                  </div>
                  <h3 className="mb-2 fw-bold text-white">تسجيل الدخول</h3>
                  <p className="mb-0 text-white opacity-75">
                    أهلاً بعودتك! سجل دخولك للمتابعة
                  </p>
                </div>

                <div className="card-body p-5">
                  {error && (
                    <div
                      className="alert alert-danger d-flex align-items-center mb-4 animate-slide-up"
                      role="alert"
                    >
                      <div
                        className="bg-danger rounded-circle d-flex align-items-center justify-content-center me-3"
                        style={{
                          width: "24px",
                          height: "24px",
                          minWidth: "24px",
                        }}
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
                  )}

                  <form onSubmit={handleSubmit} className="form-modern">
                    <div className="mb-4">
                      <label className="form-label">
                        <span className="d-flex align-items-center gap-2">
                          <span>👤</span>
                          اسم المستخدم
                        </span>
                      </label>
                      <input
                        type="text"
                        name="username"
                        className="form-control form-control-lg"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        placeholder="أدخل اسم المستخدم"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label">
                        <span className="d-flex align-items-center gap-2">
                          <span>🔒</span>
                          كلمة المرور
                        </span>
                      </label>
                      <div className="position-relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          className="form-control form-control-lg pe-5"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          placeholder="أدخل كلمة المرور"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                          style={{
                            border: "none",
                            background: "none",
                            padding: "0.5rem",
                            zIndex: 10,
                          }}
                        >
                          {showPassword ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6c757d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                              <line x1="1" y1="1" x2="23" y2="23"></line>
                            </svg>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6c757d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="mb-4 text-end">
                      <Link
                        to="/forgot-password"
                        className="text-primary fw-semibold text-decoration-none small"
                      >
                        نسيت كلمة المرور؟
                      </Link>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary btn-lg w-100 py-3 fw-semibold position-relative"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="loading-spinner">
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                          ></span>
                          جاري تسجيل الدخول...
                        </span>
                      ) : (
                        <>
                          <span className="me-2">🚀</span>
                          تسجيل الدخول
                        </>
                      )}
                    </button>
                  </form>

                  <div className="text-center mt-5">
                    <div className="d-flex align-items-center justify-content-center gap-3 mb-3">
                      <hr className="flex-grow-1" />
                      <span className="text-muted small">أو</span>
                      <hr className="flex-grow-1" />
                    </div>
                    <p className="mb-0 text-muted">
                      ليس لديك حساب؟{" "}
                      <Link
                        to="/register"
                        className="text-primary fw-semibold text-decoration-none position-relative"
                      >
                        إنشاء حساب جديد
                        <span
                          className="position-absolute bottom-0 start-0 w-100"
                          style={{
                            height: "1px",
                            background: "currentColor",
                            transform: "scaleX(0)",
                            transformOrigin: "right",
                            transition: "transform 0.3s",
                          }}
                        ></span>
                      </Link>
                    </p>
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

export default Login;
