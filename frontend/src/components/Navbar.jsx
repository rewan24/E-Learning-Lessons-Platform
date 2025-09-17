import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Navbar.css";

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isAuthenticated = !!localStorage.getItem("access");

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
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

        {/* Desktop Navigation */}
        <div className="navbar-nav desktop-nav">
          <Link
            className={`nav-btn home-btn ${location.pathname === "/" ? "active" : ""}`}
            to="/"
          >
            <span className="nav-icon"></span>
            <span className="nav-text">الرئيسية</span>
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                className={`nav-link ${location.pathname === "/profile" ? "active" : ""}`}
                to="/profile"
              >
                <span className="nav-icon"></span>
                <span className="nav-text">الملف الشخصي</span>
              </Link>
              <button className="nav-btn logout-btn" onClick={handleLogout}>
                <span className="nav-icon"></span>
                <span className="nav-text">تسجيل خروج</span>
              </button>
            </>
          ) : (
            <>
              <Link
                className={`nav-btn register-btn ${location.pathname === "/register" ? "active" : ""}`}
                to="/register"
              >
                <span className="nav-icon"></span>
                <span className="nav-text">تسجيل</span>
              </Link>
              <Link
                className={`nav-btn login-btn ${location.pathname === "/login" ? "active" : ""}`}
                to="/login"
              >
                <span className="nav-icon"></span>
                <span className="nav-text">دخول</span>
              </Link>
            </>
          )}
        </div>

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

          {isAuthenticated ? (
            <>
              <Link
                className={`mobile-nav-link ${location.pathname === "/profile" ? "active" : ""}`}
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="nav-icon"></span>
                <span className="nav-text">الملف الشخصي</span>
              </Link>
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
