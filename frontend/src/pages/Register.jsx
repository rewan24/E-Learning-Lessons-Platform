import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

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

    try {
      const response = await api.post("users/register/", formData);
      const data = response.data;

      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("user", JSON.stringify(data));

      // Set authorization header for future requests
      api.defaults.headers.common["Authorization"] = `Bearer ${data.access}`;

      navigate("/profile");
    } catch (err) {
      const errorMessage =
        err.response?.data?.username?.[0] ||
        err.response?.data?.email?.[0] ||
        err.response?.data?.phone?.[0] ||
        err.response?.data?.password?.[0] ||
        "حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.";
      setError(errorMessage);
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
            <div className="col-md-8 col-lg-6">
              <div className="glass-card shadow-xl rounded-xl overflow-hidden animate-fade-in">
                <div className="card-header text-center">
                  <div className="d-flex align-items-center justify-content-center mb-3">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: "60px",
                        height: "60px",
                        background:
                          "linear-gradient(135deg, var(--success-600), var(--success-700))",
                      }}
                    >
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                    </div>
                  </div>
                  <h3 className="mb-2 fw-bold text-white">إنشاء حساب جديد</h3>
                  <p className="mb-0 text-white opacity-75">
                    انضم إلينا وابدأ رحلتك التعليمية المتميزة
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
                    <div className="row">
                      <div className="col-md-6 mb-4">
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
                          placeholder="اختر اسم مستخدم فريد"
                          disabled={isLoading}
                        />
                        <small className="text-muted">
                          يجب أن يكون فريداً ولا يحتوي على مسافات
                        </small>
                      </div>

                      <div className="col-md-6 mb-4">
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
                          placeholder="example@email.com"
                          disabled={isLoading}
                        />
                        <small className="text-muted">
                          سنستخدمه لإرسال التحديثات والإشعارات
                        </small>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-4">
                        <label className="form-label">
                          <span className="d-flex align-items-center gap-2">
                            <span>📱</span>
                            رقم الهاتف
                          </span>
                        </label>
                        <input
                          type="text"
                          name="phone"
                          className="form-control form-control-lg"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="01XXXXXXXXX"
                          disabled={isLoading}
                        />
                        <small className="text-muted">
                          اختياري - للتواصل السريع
                        </small>
                      </div>

                      <div className="col-md-6 mb-4">
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
                            placeholder="كلمة مرور قوية"
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
                    </div>

                    <button
                      type="submit"
                      className="btn btn-success btn-lg w-100 py-3 fw-semibold position-relative"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="loading-spinner">
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                          ></span>
                          جاري إنشاء الحساب...
                        </span>
                      ) : (
                        <>
                          <span className="me-2">🚀</span>
                          إنشاء حساب
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
                      لديك حساب بالفعل؟{" "}
                      <Link
                        to="/login"
                        className="text-success fw-semibold text-decoration-none position-relative"
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

export default Register;
