import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (!token) {
      navigate("/forgot-password");
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);

    // Check password strength
    if (e.target.name === "password") {
      const password = e.target.value;
      let strength = 0;
      if (password.length >= 8) strength++;
      if (/[A-Z]/.test(password)) strength++;
      if (/[a-z]/.test(password)) strength++;
      if (/[0-9]/.test(password)) strength++;
      if (/[^A-Za-z0-9]/.test(password)) strength++;
      setPasswordStrength(strength);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("كلمات المرور غير متطابقة");
      setIsLoading(false);
      return;
    }

    try {
      await api.post("users/reset-password/", {
        token,
        email: formData.email,
        password: formData.password,
      });
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "حدث خطأ أثناء إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return "var(--danger-500)";
    if (passwordStrength <= 3) return "var(--warning-500)";
    return "var(--success-500)";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return "ضعيف";
    if (passwordStrength <= 3) return "متوسط";
    return "قوي";
  };

  if (success) {
    return (
      <>
        <Navbar />
        <div
          className="min-vh-100 d-flex align-items-center"
          style={{
            paddingTop: "80px",
            background:
              "linear-gradient(135deg, var(--success-50) 0%, var(--primary-50) 100%)",
          }}
        >
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-6 col-lg-5">
                <div className="glass-card shadow-xl rounded-xl overflow-hidden animate-fade-in">
                  <div className="card-header text-center">
                  <div className="d-flex align-items-center justify-content-center mb-3">
                    <div
                      className="bg-success rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: "60px", height: "60px" }}
                    >
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22,4 12,14.01 9,11.01"></polyline>
                      </svg>
                    </div>
                  </div>
                    <h3 className="mb-2 fw-bold text-white">تم بنجاح</h3>
                    <p className="mb-0 text-white opacity-75">
                      تم إعادة تعيين كلمة المرور بنجاح
                    </p>
                  </div>

                  <div className="card-body p-5 text-center">
                    <div className="mb-4">
                      <p className="text-muted">
                        يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.
                      </p>
                    </div>

                    <Link
                      to="/login"
                      className="btn btn-success btn-lg px-4"
                    >
                      تسجيل الدخول
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div
        className="min-vh-100 d-flex align-items-center"
        style={{
          paddingTop: "80px",
          background:
            "linear-gradient(135deg, var(--info-50) 0%, var(--primary-50) 100%)",
        }}
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div className="glass-card shadow-xl rounded-xl overflow-hidden animate-fade-in">
                <div className="card-header text-center">
                  <div className="d-flex align-items-center justify-content-center mb-3">
                    <div
                      className="bg-info rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: "60px", height: "60px" }}
                    >
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        <path d="M12 15l0 0"></path>
                      </svg>
                    </div>
                  </div>
                  <h3 className="mb-2 fw-bold text-white">إعادة تعيين كلمة المرور</h3>
                  <p className="mb-0 text-white opacity-75">
                    أدخل كلمة المرور الجديدة
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
                          <span>📧</span>
                          البريد الإلكتروني
                        </span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        className="form-control form-control-lg"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="أدخل بريدك الإلكتروني"
                        disabled={isLoading}
                      />
                      <small className="text-muted">
                        البريد الإلكتروني المرتبط بالحساب
                      </small>
                    </div>

                    <div className="mb-4">
                      <label className="form-label">
                        <span className="d-flex align-items-center gap-2">
                          <span>🔒</span>
                          كلمة المرور الجديدة
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
                          placeholder="أدخل كلمة المرور الجديدة"
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
                      {formData.password && (
                        <div className="mt-2">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <small className="text-muted">
                              قوة كلمة المرور:
                            </small>
                            <span
                              className="small fw-semibold"
                              style={{ color: getPasswordStrengthColor() }}
                            >
                              {getPasswordStrengthText()}
                            </span>
                          </div>
                          <div className="progress" style={{ height: "4px" }}>
                            <div
                              className="progress-bar transition-all"
                              style={{
                                width: `${(passwordStrength / 5) * 100}%`,
                                backgroundColor: getPasswordStrengthColor(),
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                      <small className="text-muted">
                        يجب أن تحتوي على 8 أحرف على الأقل
                      </small>
                    </div>

                    <div className="mb-4">
                      <label className="form-label">
                        <span className="d-flex align-items-center gap-2">
                          <span>🔒</span>
                          تأكيد كلمة المرور
                        </span>
                      </label>
                      <div className="position-relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          className="form-control form-control-lg pe-5"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          placeholder="أعد إدخال كلمة المرور"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={isLoading}
                          style={{
                            border: "none",
                            background: "none",
                            padding: "0.5rem",
                            zIndex: 10,
                          }}
                        >
                          {showConfirmPassword ? (
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

                    <button
                      type="submit"
                      className="btn btn-info btn-lg w-100 py-3 fw-semibold position-relative"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="loading-spinner">
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                          ></span>
                          جاري إعادة التعيين...
                        </span>
                      ) : (
                        <>
                          <span className="me-2">🔐</span>
                          إعادة تعيين كلمة المرور
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
                      تذكرت كلمة المرور؟{" "}
                      <Link
                        to="/login"
                        className="text-info fw-semibold text-decoration-none position-relative"
                      >
                        تسجيل الدخول
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

export default ResetPassword;
