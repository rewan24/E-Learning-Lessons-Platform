import Navbar from "./components/Navbar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "./services/api";
import "./App.css";

function App() {
  const [showGradesModal, setShowGradesModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in initially
    const token = localStorage.getItem("access");
    setIsLoggedIn(!!token);

    // Listen for storage changes to update login status
    const handleStorageChange = () => {
      const newToken = localStorage.getItem("access");
      setIsLoggedIn(!!newToken);
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events when login state changes within the same tab
    window.addEventListener('loginStateChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('loginStateChanged', handleStorageChange);
    };
  }, []);

  const handleShowModal = () => {
    setShowGradesModal(true);
  };

  const handleCloseModal = () => {
    setShowGradesModal(false);
  };

  const handleProfileClick = async (e) => {
    e.preventDefault();
    try {
      // Check if user is authenticated
      const token = localStorage.getItem("access");
      if (!token) {
        navigate("/login");
        return;
      }

      // Get current user data
      const userResponse = await api.get('users/me/');
      const userData = userResponse.data;
      
      // Check if user has a student record
      const studentsResponse = await api.get('students/');
      const studentsData = studentsResponse.data;
      
      // Find student record for current user
      const userStudent = studentsData.results?.find(student => student.user === userData.id) ||
                         studentsData.find?.(student => student.user === userData.id);
      
      if (userStudent) {
        navigate(`/students/${userStudent.id}`);
      } else {
        // If no student record, go to student registration
        navigate('/student-registration');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Fallback to login if error
      navigate('/login');
    }
  };

  return (
    <>
      <Navbar />

      {/* Enhanced Hero Section */}
      <header className="hero-section text-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10" style={{ marginTop: "60px" }}>
              <h1 className="animate-fade-in mb-4">مرحباً بكم في منصتنا</h1>
              <p className="lead animate-slide-up">
                موقع لحجز دروس اللغة الإنجليزية، سجّل الآن، اختر مجموعتك، واحجز
                مقعدك بسهولة لتبدأ رحلتك التعليمية معنا بثقة ونجاح.
              </p>
              <h3 className="text-white mb-4">أ/ إيناس إبراهيم كناني</h3>
              <div className="d-flex justify-content-center animate-fade-in">
                <a
                  href="/groups"
                  className="btn btn-primary btn-hero"
                >
                  عرض المجموعات
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-4 mb-5">
              <div className="card feature-card h-100">
                <div className="card-body">
                  <div className="feature-icon">
                    <span>📚</span>
                  </div>
                  <h5 className="card-title">مجموعات ومواعيد متنوعة</h5>
                  <p className="card-text">
                    اختر من بين عدد من المجموعات المجموعة المناسبة لك
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4 mb-5">
              <div className="card feature-card h-100">
                <div className="card-body">
                  <div className="feature-icon">
                    <span>🎯</span>
                  </div>
                  <h5 className="card-title">حجز سهل وسريع</h5>
                  <p className="card-text">
                    احجز دروسك بضغطة زر مع نظام حجوزات ذكي يراعي السعة والمواعيد
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4 mb-5">
              <div className="card feature-card h-100">
                <div className="card-body">
                  <div className="feature-icon">
                    <span>📊</span>
                  </div>
                  <h5 className="card-title">تتبع التقدم</h5>
                  <p className="card-text">
                    تابع تقدمك التعليمي واحصل على تقارير مفصلة عن أدائك وحضورك
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Call to Action Section - Only show if not logged in */}
      {!isLoggedIn && (
        <section className="cta-section text-center">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <h2 className="fw-bold mb-4">مستعد لبدء رحلتك معنا؟</h2>
                <div className="d-flex flex-column flex-md-row justify-content-center gap-4">
                  <a href="/student-registration" className="btn btn-primary btn-hero">
                    سجل كطالب جديد
                  </a>
                  <a href="/login" className="btn btn-outline-primary btn-hero">
                    دخول للحساب الحالي
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Enhanced Footer */}
      <footer className="footer-enhanced text-white">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-md-10">
              <p className="mb-5">
                موقع لحجز دروس اللغة الإنجليزية، سجّل الآن، اختر مجموعتك، واحجز
                مقعدك بسهولة لتبدأ رحلتك التعليمية معنا بثقة ونجاح.
              </p>

              <div className="footer-links">
                <a href="/">الرئيسية</a>
                <a href="/groups">المجموعات</a>
                <a href="/student-registration">تسجيل طالب</a>
                <a href="/login">دخول</a>
                <a href="#" onClick={handleProfileClick}>الملف الشخصي</a>
              </div>

              <div className="footer-contact">
                <p className="mb-2">
                  البريد الإلكتروني: enas.kenany123@gmail.com
                </p>
                <p className="mb-0">الهاتف: 01019081142</p>
              </div>

              <hr className="footer-divider" />

              <div className="text-center">
                <p className="mb-0">© 2025. جميع الحقوق محفوظة.</p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Grades Selection Modal */}
      {showGradesModal && (
        <>
          <div
            className="custom-modal-backdrop"
            onClick={handleCloseModal}
          ></div>
          <div className="custom-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">اختر الصف الدراسي:</h5>
                <button
                  type="button"
                  className="close-btn"
                  onClick={handleCloseModal}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="grades-grid">
                  <button
                    className="grade-btn"
                    onClick={() => {
                      console.log("Selected: السادس الابتدائي");
                      handleCloseModal();
                    }}
                  >
                    السادس الابتدائي
                  </button>
                  <button
                    className="grade-btn"
                    onClick={() => {
                      console.log("Selected: الاول الاعدادي");
                      handleCloseModal();
                    }}
                  >
                    الاول الاعدادي
                  </button>
                  <button
                    className="grade-btn"
                    onClick={() => {
                      console.log("Selected: الثاني الاعدادي");
                      handleCloseModal();
                    }}
                  >
                    الثاني الاعدادي
                  </button>
                  <button
                    className="grade-btn"
                    onClick={() => {
                      console.log("Selected: الثالث الاعدادي");
                      handleCloseModal();
                    }}
                  >
                    الثالث الاعدادي
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default App;
