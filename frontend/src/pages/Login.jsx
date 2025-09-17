import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "فشل تسجيل الدخول. يرجى التحقق من البيانات والمحاولة مرة أخرى.",
        );
      }

      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      // Get user info
      const userResponse = await fetch("http://127.0.0.1:8000/api/users/me/", {
        headers: {
          Authorization: `Bearer ${data.access}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        localStorage.setItem("user", JSON.stringify(userData));
      }

      navigate("/profile");
    } catch (err) {
      setError(err.message);
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
                      <span className="text-white fs-2"></span>
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
                      <input
                        type="password"
                        name="password"
                        className="form-control form-control-lg"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="أدخل كلمة المرور"
                        disabled={isLoading}
                      />
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
