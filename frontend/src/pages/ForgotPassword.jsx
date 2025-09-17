import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await api.post("users/forgot-password/", { email });
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "حدث خطأ أثناء إرسال رابط إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setIsLoading(false);
    }
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
                    <h3 className="mb-2 fw-bold text-white">تم الإرسال بنجاح</h3>
                    <p className="mb-0 text-white opacity-75">
                      تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني
                    </p>
                  </div>

                  <div className="card-body p-5 text-center">
                    <div className="mb-4">
                      <p className="text-muted">
                        تحقق من صندوق الوارد الخاص بك واتبع التعليمات لإعادة تعيين كلمة المرور.
                      </p>
                    </div>

                    <div className="d-flex gap-3 justify-content-center">
                      <Link
                        to="/login"
                        className="btn btn-primary btn-lg px-4"
                      >
                        العودة لتسجيل الدخول
                      </Link>
                      <button
                        onClick={() => {
                          setSuccess(false);
                          setEmail("");
                        }}
                        className="btn btn-outline-primary btn-lg px-4"
                      >
                        إرسال مرة أخرى
                      </button>
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

  return (
    <>
      <Navbar />
      <div
        className="min-vh-100 d-flex align-items-center"
        style={{
          paddingTop: "80px",
          background:
            "linear-gradient(135deg, var(--warning-50) 0%, var(--primary-50) 100%)",
        }}
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div className="glass-card shadow-xl rounded-xl overflow-hidden animate-fade-in">
                <div className="card-header text-center">
                  <div className="d-flex align-items-center justify-content-center mb-3">
                    <div
                      className="bg-warning rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: "60px", height: "60px" }}
                    >
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <circle cx="12" cy="16" r="1"></circle>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    </div>
                  </div>
                  <h3 className="mb-2 fw-bold text-white">نسيت كلمة المرور</h3>
                  <p className="mb-0 text-white opacity-75">
                    أدخل بريدك الإلكتروني لإرسال رابط إعادة تعيين كلمة المرور
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
                        value={email}
                        onChange={handleChange}
                        required
                        placeholder="أدخل بريدك الإلكتروني"
                        disabled={isLoading}
                      />
                      <small className="text-muted">
                        سنرسل لك رابط إعادة تعيين كلمة المرور على هذا البريد
                      </small>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-warning btn-lg w-100 py-3 fw-semibold position-relative"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="loading-spinner">
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                          ></span>
                          جاري الإرسال...
                        </span>
                      ) : (
                        <>
                          <span className="me-2">📤</span>
                          إرسال رابط إعادة التعيين
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
                        className="text-warning fw-semibold text-decoration-none position-relative"
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

export default ForgotPassword;
