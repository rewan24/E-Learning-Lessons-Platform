import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import "./Navbar.css";

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // Check if user is admin
    const checkAdminStatus = async () => {
      try {
        const token = localStorage.getItem("access");
        if (token) {
          const response = await api.get('users/me/');
          const currentUser = response.data;
          setIsAdmin(currentUser.is_staff || currentUser.is_superuser);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };
    
    checkAdminStatus();
  }, []);

  const handleProfileClick = async () => {
    try {
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
      // Fallback to regular profile
      navigate('/profile');
    }
  };

  const isAuthenticated = !!localStorage.getItem("access");

  const getUserInitial = () => {
    if (user && user.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return "U";
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    setUser(null);
    
    // Dispatch custom event to notify App component about logout
    window.dispatchEvent(new Event('loginStateChanged'));
    
    window.location.href = "/";
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={`modern-navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        {/* Brand/Logo */}
        <Link className="navbar-brand" to="/">
          <div className="brand-icon">
            <span className="icon">🎓</span>
          </div>
          <div className="brand-text">
            <span className="brand-title">أ/إيناس إبراهيم كناني</span>
            <span className="brand-subtitle">معلمة لغة إنجليزية متخصصة</span>
          </div>
        </Link>

        {/* User Actions & Menu */}
        <div className="navbar-right-section">
          {isAuthenticated && (
            <button 
              className="nav-btn user-avatar-btn"
              onClick={handleProfileClick}
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                borderRadius: "50%",
                width: "45px",
                height: "45px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
                fontSize: "18px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "scale(1.1)";
                e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.25)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "scale(1)";
                e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
              }}
              title="الملف الشخصي"
            >
              {getUserInitial()}
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            className={`mobile-menu-btn ${isMenuOpen ? "active" : ""}`}
            onClick={toggleMenu}
            aria-label="Toggle navigation"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`mobile-nav ${isMenuOpen ? "active" : ""}`}>
        <div className="mobile-nav-content">
          <Link
            className={`mobile-nav-btn home-btn ${location.pathname === "/" ? "active" : ""}`}
            to="/"
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="nav-icon"></span>
            <span className="nav-text">الرئيسية</span>
          </Link>

          <Link
            className={`mobile-nav-btn ${location.pathname.startsWith("/groups") ? "active" : ""}`}
            to="/groups"
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="nav-icon"></span>
            <span className="nav-text">المجموعات</span>
          </Link>

          <Link
            className={`mobile-nav-btn ${location.pathname === "/student-registration" ? "active" : ""}`}
            to="/student-registration"
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="nav-icon"></span>
            <span className="nav-text">تسجيل طالب</span>
          </Link>

          {isAuthenticated && isAdmin && (
            <Link
              className={`mobile-nav-btn ${location.pathname === "/admin" ? "active" : ""}`}
              to="/admin"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="nav-icon"></span>
              <span className="nav-text">لوحة التحكم</span>
            </Link>
          )}

          {isAuthenticated ? (
            <>
              <button
                className="mobile-nav-btn user-profile-btn"
                onClick={() => {
                  handleProfileClick();
                  setIsMenuOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}
              >
                <div
                  style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderRadius: "50%",
                    width: "35px",
                    height: "35px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "16px"
                  }}
                >
                  {getUserInitial()}
                </div>
                <span className="nav-text">الملف الشخصي</span>
              </button>
              <button
                className="mobile-nav-btn logout-btn"
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
              >
                <span className="nav-icon"></span>
                <span className="nav-text">تسجيل خروج</span>
              </button>
            </>
          ) : (
            <>
              <Link
                className={`mobile-nav-btn register-btn ${location.pathname === "/register" ? "active" : ""}`}
                to="/register"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="nav-icon"></span>
                <span className="nav-text">تسجيل</span>
              </Link>
              <Link
                className={`mobile-nav-btn login-btn ${location.pathname === "/login" ? "active" : ""}`}
                to="/login"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="nav-icon"></span>
                <span className="nav-text">دخول</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </nav>
  );
}

export default Navbar;
