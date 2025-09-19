import { useState, useEffect, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';

// Toast Context
const ToastContext = createContext();

// Toast Provider Component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = ({
    type = 'info',
    title,
    message,
    duration = 5000,
    persistent = false
  }) => {
    const id = Date.now() + Math.random();
    const toast = { id, type, title, message, duration, persistent };

    setToasts(prev => [...prev, toast]);

    if (!persistent && duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAll = () => {
    setToasts([]);
  };

  const contextValue = {
    toasts,
    addToast,
    removeToast,
    clearAll,
    success: (title, message, options = {}) =>
      addToast({ type: 'success', title, message, ...options }),
    error: (title, message, options = {}) =>
      addToast({ type: 'error', title, message, persistent: true, ...options }),
    warning: (title, message, options = {}) =>
      addToast({ type: 'warning', title, message, ...options }),
    info: (title, message, options = {}) =>
      addToast({ type: 'info', title, message, ...options }),
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Individual Toast Component
const Toast = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Early return if toast is invalid
  if (!toast) {
    return null;
  }

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const getToastIcon = () => {
    if (!toast || !toast.type) {
      return 'ℹ️';
    }
    switch (toast.type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  };

  const getToastColor = () => {
    if (!toast || !toast.type) {
      return 'var(--primary-600)';
    }
    switch (toast.type) {
      case 'success': return 'var(--success-600)';
      case 'error': return 'var(--danger-600)';
      case 'warning': return 'var(--warning-600)';
      case 'info': return 'var(--primary-600)';
      default: return 'var(--primary-600)';
    }
  };

  const getToastBackground = () => {
    if (!toast || !toast.type) {
      return 'linear-gradient(135deg, var(--primary-50), var(--primary-100))';
    }
    switch (toast.type) {
      case 'success': return 'linear-gradient(135deg, var(--success-50), var(--success-100))';
      case 'error': return 'linear-gradient(135deg, var(--danger-50), var(--danger-100))';
      case 'warning': return 'linear-gradient(135deg, var(--warning-50), var(--warning-100))';
      case 'info': return 'linear-gradient(135deg, var(--primary-50), var(--primary-100))';
      default: return 'linear-gradient(135deg, var(--primary-50), var(--primary-100))';
    }
  };

  return (
    <div
      className={`toast-item ${isVisible ? 'toast-enter' : ''} ${isRemoving ? 'toast-exit' : ''}`}
      style={{
        '--toast-color': getToastColor(),
        '--toast-bg': getToastBackground(),
      }}
    >
      <div className="toast-content">
        <div className="toast-icon">
          {getToastIcon()}
        </div>

        <div className="toast-body">
          {toast && toast.title && (
            <div className="toast-title">{toast.title}</div>
          )}
          {toast && toast.message && (
            <div className="toast-message">{toast.message}</div>
          )}
        </div>

        <button
          className="toast-close"
          onClick={handleRemove}
          aria-label="إغلاق الإشعار"
        >
          ×
        </button>
      </div>

      {toast && !toast.persistent && toast.duration > 0 && (
        <div
          className="toast-progress"
          style={{
            '--duration': `${toast.duration}ms`,
            '--color': getToastColor()
          }}
        />
      )}
    </div>
  );
};

// Toast Container Component
const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  const toastPortal = (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          toast={toast}
          onRemove={removeToast}
        />
      ))}
    </div>
  );

  return createPortal(toastPortal, document.body);
};

// CSS Styles (add to index.css or import separately)
export const toastStyles = `
/* Toast Container */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
  pointer-events: none;
}

@media (max-width: 768px) {
  .toast-container {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
}

/* Toast Item */
.toast-item {
  background: var(--toast-bg);
  border: 1px solid color-mix(in srgb, var(--toast-color) 20%, transparent);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  pointer-events: auto;
  position: relative;
  overflow: hidden;
  transform: translateX(100%);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-width: 100%;
  border-right: 4px solid var(--toast-color);
}

.toast-item.toast-enter {
  transform: translateX(0);
  opacity: 1;
}

.toast-item.toast-exit {
  transform: translateX(100%);
  opacity: 0;
  margin-bottom: -80px;
}

/* Toast Content */
.toast-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  position: relative;
}

.toast-icon {
  font-size: 1.5rem;
  line-height: 1;
  margin-top: 2px;
  flex-shrink: 0;
}

.toast-body {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--toast-color);
  margin-bottom: 4px;
  line-height: 1.4;
}

.toast-message {
  font-size: 0.875rem;
  color: color-mix(in srgb, var(--toast-color) 80%, transparent);
  line-height: 1.5;
  word-wrap: break-word;
}

/* Close Button */
.toast-close {
  background: none;
  border: none;
  color: var(--toast-color);
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  margin: -4px -4px -4px 8px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  flex-shrink: 0;
  opacity: 0.6;
}

.toast-close:hover {
  opacity: 1;
  background: color-mix(in srgb, var(--toast-color) 10%, transparent);
  transform: scale(1.1);
}

/* Progress Bar */
.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: var(--color);
  border-radius: 0 0 var(--radius-xl) var(--radius-xl);
  animation: toast-progress var(--duration) linear forwards;
  opacity: 0.7;
}

@keyframes toast-progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* Dark Mode Support */
[data-theme="dark"] .toast-item {
  background: color-mix(in srgb, var(--toast-bg) 20%, var(--dark-bg-secondary));
  border: 1px solid color-mix(in srgb, var(--toast-color) 30%, transparent);
  box-shadow: var(--dark-shadow);
}

[data-theme="dark"] .toast-title {
  color: var(--dark-text-primary);
}

[data-theme="dark"] .toast-message {
  color: var(--dark-text-secondary);
}

[data-theme="dark"] .toast-close {
  color: var(--dark-text-secondary);
}

[data-theme="dark"] .toast-close:hover {
  color: var(--dark-text-primary);
  background: color-mix(in srgb, var(--toast-color) 20%, transparent);
}

/* Hover Effects */
.toast-item:hover {
  transform: translateX(-4px);
  box-shadow: var(--shadow-2xl);
}

.toast-item:hover .toast-progress {
  animation-play-state: paused;
}

/* RTL Support */
[dir="rtl"] .toast-container {
  right: auto;
  left: 20px;
}

[dir="rtl"] .toast-item {
  border-right: none;
  border-left: 4px solid var(--toast-color);
  transform: translateX(-100%);
}

[dir="rtl"] .toast-item.toast-enter {
  transform: translateX(0);
}

[dir="rtl"] .toast-item.toast-exit {
  transform: translateX(-100%);
}

[dir="rtl"] .toast-item:hover {
  transform: translateX(4px);
}

@media (max-width: 768px) {
  [dir="rtl"] .toast-container {
    left: 10px;
    right: 10px;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .toast-item {
    transition: opacity 0.2s ease;
    transform: none;
  }

  .toast-item.toast-enter {
    transform: none;
  }

  .toast-item.toast-exit {
    transform: none;
  }

  .toast-item:hover {
    transform: none;
  }

  .toast-progress {
    animation: none;
    display: none;
  }
}

/* High Contrast */
@media (prefers-contrast: high) {
  .toast-item {
    border-width: 2px;
  }

  .toast-close {
    border: 1px solid currentColor;
  }
}
`;

// Inject styles function
export const injectToastStyles = () => {
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = toastStyles;
    document.head.appendChild(style);
  }
};

export default Toast;
