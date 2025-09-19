import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Toast from "../components/Toast";
import api from "../services/api";

function StudentRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    birth_date: "",
    stage: "",
    notes: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: "", type: "success" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = "الاسم الكامل مطلوب";
    }

    if (!formData.email.trim()) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "البريد الإلكتروني غير صحيح";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "رقم الهاتف مطلوب";
    } else if (!/^01[0-2,5][0-9]{8}$/.test(formData.phone)) {
      newErrors.phone = "رقم الهاتف المصري غير صحيح (مثال: 01012345678)";
    }

    if (!formData.stage) {
      newErrors.stage = "المرحلة الدراسية مطلوبة";
    }

    if (!formData.birth_date) {
      newErrors.birth_date = "تاريخ الميلاد مطلوب";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast("يرجى تصحيح الأخطاء في النموذج", "error");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("students/", formData);
      showToast("تم تسجيل الطالب بنجاح!", "success");
      
      // If user is logged in, redirect to groups, otherwise to login
      const token = localStorage.getItem("access");
      setTimeout(() => {
        if (token) {
          navigate("/groups");
        } else {
          navigate("/login");
        }
      }, 2000);
      
    } catch (err) {
      console.error("Registration error:", err);
      
      if (err.response?.data) {
        const serverErrors = err.response.data;
        
        // Handle field-specific errors
        if (typeof serverErrors === 'object') {
          setErrors(serverErrors);
        }
        
        // Show general error message
        const errorMessage = serverErrors.detail || 
                            serverErrors.error || 
                            Object.values(serverErrors)[0] ||
                            "حدث خطأ في التسجيل";
        showToast(errorMessage, "error");
      } else {
        showToast("حدث خطأ في الاتصال بالخادم", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

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
        className="min-vh-100 d-flex align-items-center"
        style={{
          paddingTop: "80px",
          background: "linear-gradient(135deg, var(--gray-50) 0%, var(--primary-50) 100%)",
        }}
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div className="glass-card shadow-xl rounded-xl overflow-hidden animate-fade-in">
                <div className="card-header text-center">
                  <div className="d-flex align-items-center justify-content-center mb-3">
                    <div
                      className="bg-primary rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: "60px", height: "60px" }}
                    >
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <line x1="19" y1="8" x2="19" y2="14"></line>
                        <line x1="22" y1="11" x2="16" y2="11"></line>
                      </svg>
                    </div>
                  </div>
                  <h3 className="mb-2 fw-bold text-white">تسجيل طالب جديد</h3>
                  <p className="mb-0 text-white opacity-75">
                    املأ البيانات التالية للتسجيل في المنصة
                  </p>
                </div>

                <div className="card-body p-5">
                  <form onSubmit={handleSubmit} className="form-modern">
                    <div className="row">
                      {/* Full Name */}
                      <div className="col-12 mb-4">
                        <label className="form-label">
                          <span className="d-flex align-items-center gap-2">
                            <span>👤</span>
                            الاسم الكامل
                          </span>
                        </label>
                        <input
                          type="text"
                          name="full_name"
                          className={`form-control form-control-lg ${errors.full_name ? 'is-invalid' : ''}`}
                          value={formData.full_name}
                          onChange={handleChange}
                          placeholder="أدخل الاسم الكامل"
                          disabled={isLoading}
                        />
                        {errors.full_name && (
                          <div className="invalid-feedback">{errors.full_name}</div>
                        )}
                      </div>

                      {/* Email */}
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
                          className={`form-control form-control-lg ${errors.email ? 'is-invalid' : ''}`}
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="example@domain.com"
                          disabled={isLoading}
                        />
                        {errors.email && (
                          <div className="invalid-feedback">{errors.email}</div>
                        )}
                      </div>

                      {/* Phone */}
                      <div className="col-md-6 mb-4">
                        <label className="form-label">
                          <span className="d-flex align-items-center gap-2">
                            <span>📱</span>
                            رقم الهاتف
                          </span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          className={`form-control form-control-lg ${errors.phone ? 'is-invalid' : ''}`}
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="01012345678"
                          disabled={isLoading}
                        />
                        {errors.phone && (
                          <div className="invalid-feedback">{errors.phone}</div>
                        )}
                      </div>

                      {/* Birth Date */}
                      <div className="col-md-6 mb-4">
                        <label className="form-label">
                          <span className="d-flex align-items-center gap-2">
                            <span>🎂</span>
                            تاريخ الميلاد
                          </span>
                        </label>
                        <input
                          type="date"
                          name="birth_date"
                          className={`form-control form-control-lg ${errors.birth_date ? 'is-invalid' : ''}`}
                          value={formData.birth_date}
                          onChange={handleChange}
                          disabled={isLoading}
                        />
                        {errors.birth_date && (
                          <div className="invalid-feedback">{errors.birth_date}</div>
                        )}
                      </div>

                      {/* Stage */}
                      <div className="col-md-6 mb-4">
                        <label className="form-label">
                          <span className="d-flex align-items-center gap-2">
                            <span>🎓</span>
                            المرحلة الدراسية
                          </span>
                        </label>
                        <select
                          name="stage"
                          className={`form-select form-select-lg ${errors.stage ? 'is-invalid' : ''}`}
                          value={formData.stage}
                          onChange={handleChange}
                          disabled={isLoading}
                        >
                          <option value="">اختر المرحلة</option>
                          <option value="GRADE6">سادس ابتدائي</option>
                          <option value="PREP">إعدادي</option>
                        </select>
                        {errors.stage && (
                          <div className="invalid-feedback">{errors.stage}</div>
                        )}
                      </div>

                      {/* Notes */}
                      <div className="col-12 mb-4">
                        <label className="form-label">
                          <span className="d-flex align-items-center gap-2">
                            <span>📝</span>
                            ملاحظات (اختياري)
                          </span>
                        </label>
                        <textarea
                          name="notes"
                          className="form-control"
                          rows="3"
                          value={formData.notes}
                          onChange={handleChange}
                          placeholder="أي ملاحظات إضافية..."
                          disabled={isLoading}
                        ></textarea>
                      </div>
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
                          جاري التسجيل...
                        </span>
                      ) : (
                        <>
                          <span className="me-2">✨</span>
                          تسجيل الطالب
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
                        className="text-primary fw-semibold text-decoration-none position-relative"
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

export default StudentRegistration;
