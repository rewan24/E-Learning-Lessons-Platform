import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Modal Component
const Modal = ({
  show = false,
  isOpen = false,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  footer,
  className = '',
  backdropClassName = '',
  contentClassName = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const modalOpen = show || isOpen;
    if (modalOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show, isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && closeOnEscape && (show || isOpen)) {
        handleClose();
      }
    };

    if (show || isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [show, isOpen, closeOnEscape]);

  const handleClose = () => {
    if (onClose) {
      setIsClosing(true);
      setTimeout(() => {
        setIsClosing(false);
        onClose();
      }, 300);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdropClick) {
      handleClose();
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'modal-sm';
      case 'lg': return 'modal-lg';
      case 'xl': return 'modal-xl';
      case 'full': return 'modal-full';
      default: return 'modal-md';
    }
  };

  if (!(show || isOpen) && !isVisible) return null;

  const modalContent = (
    <div
      className={`modal fade ${isVisible && !isClosing ? 'show' : ''} ${backdropClassName}`}
      style={{ 
        display: 'block', 
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(3px)'
      }}
      onClick={handleBackdropClick}
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className={`modal-dialog ${getSizeClass()} modal-dialog-centered ${className}`}
        style={{
          transform: isVisible && !isClosing ? 'scale(1)' : 'scale(0.9)',
          transition: 'all 0.3s ease'
        }}
      >
        <div className={`modal-content border-0 shadow-lg ${contentClassName}`} style={{
          borderRadius: '15px',
          overflow: 'hidden'
        }}>
          {(title || showCloseButton) && (
            <div className={`modal-header border-0 ${headerClassName}`} style={{
              background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%)',
              color: 'white',
              padding: '20px 25px'
            }}>
              {title && (
                <h5 className="modal-title fw-bold mb-0" id="modal-title" style={{ color: 'white' }}>
                  {title}
                </h5>
              )}
              {showCloseButton && (
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={handleClose}
                  aria-label="إغلاق"
                  style={{
                    filter: 'invert(1)',
                    opacity: 0.8
                  }}
                ></button>
              )}
            </div>
          )}

          <div className={`modal-body ${bodyClassName}`} style={{ padding: '25px' }}>
            {children}
          </div>

          {footer && (
            <div className={`modal-footer border-0 ${footerClassName}`} style={{
              background: 'var(--gray-50)',
              padding: '20px 25px'
            }}>
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// Confirmation Modal Component
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'تأكيد العملية',
  message = 'هل أنت متأكد من المتابعة؟',
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  confirmVariant = 'primary',
  cancelVariant = 'outline-secondary',
  icon = '❓',
  loading = false
}) => {
  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
  };

  const footer = (
    <div className="d-flex gap-3 justify-content-end w-100">
      <button
        type="button"
        className={`btn btn-${cancelVariant}`}
        onClick={onClose}
        disabled={loading}
      >
        {cancelText}
      </button>
      <button
        type="button"
        className={`btn btn-${confirmVariant}`}
        onClick={handleConfirm}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
            جاري المعالجة...
          </>
        ) : (
          confirmText
        )}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={footer}
    >
      <div className="text-center py-3">
        <div className="mb-3" style={{ fontSize: '3rem' }}>
          {icon}
        </div>
        <p className="text-muted mb-0">{message}</p>
      </div>
    </Modal>
  );
};

// Alert Modal Component
export const AlertModal = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  buttonText = 'حسناً'
}) => {
  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return { icon: '✅', buttonVariant: 'success' };
      case 'error':
        return { icon: '❌', buttonVariant: 'danger' };
      case 'warning':
        return { icon: '⚠️', buttonVariant: 'warning' };
      default:
        return { icon: 'ℹ️', buttonVariant: 'primary' };
    }
  };

  const { icon, buttonVariant } = getTypeConfig();

  const footer = (
    <div className="d-flex justify-content-center w-100">
      <button
        type="button"
        className={`btn btn-${buttonVariant}`}
        onClick={onClose}
      >
        {buttonText}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={footer}
      showCloseButton={false}
    >
      <div className="text-center py-3">
        <div className="mb-3" style={{ fontSize: '3rem' }}>
          {icon}
        </div>
        <p className="text-muted mb-0">{message}</p>
      </div>
    </Modal>
  );
};

// Loading Modal Component
export const LoadingModal = ({
  isOpen,
  title = 'جاري التحميل...',
  message = 'يرجى الانتظار'
}) => {
  return (
    <Modal
      isOpen={isOpen}
      size="sm"
      showCloseButton={false}
      closeOnBackdropClick={false}
      closeOnEscape={false}
    >
      <div className="text-center py-4">
        <div className="loading-spinner-large mb-4">
          <div className="spinner-ring">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
        <h5 className="text-dark mb-2">{title}</h5>
        <p className="text-muted small mb-0">{message}</p>
      </div>
    </Modal>
  );
};

// CSS Styles
export const modalStyles = `
/* Modal Backdrop */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10050;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 1rem;
}

.modal-backdrop-enter {
  opacity: 1;
  visibility: visible;
}

.modal-backdrop-exit {
  opacity: 0;
  visibility: hidden;
}

/* Modal Dialog */
.modal-dialog {
  position: relative;
  max-width: 100%;
  max-height: 100%;
  margin: auto;
  transform: scale(0.8) translateY(-20px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-dialog-enter {
  transform: scale(1) translateY(0);
}

.modal-dialog-exit {
  transform: scale(0.8) translateY(-20px);
}

/* Modal Sizes */
.modal-sm {
  max-width: 400px;
}

.modal-md {
  max-width: 500px;
}

.modal-lg {
  max-width: 800px;
}

.modal-xl {
  max-width: 1200px;
}

.modal-full {
  max-width: 95vw;
  max-height: 95vh;
}

/* Modal Content */
.modal-content {
  background: #fff;
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-2xl);
  border: 1px solid var(--gray-200);
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

/* Modal Header */
.modal-header {
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--gray-200);
  background: linear-gradient(135deg, var(--gray-50), var(--gray-100));
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  position: relative;
}

.modal-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-500), var(--secondary-500));
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-900);
  line-height: 1.4;
}

/* Modal Body */
.modal-body {
  padding: var(--spacing-xl);
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* Modal Footer */
.modal-footer {
  padding: var(--spacing-xl);
  border-top: 1px solid var(--gray-200);
  background: var(--gray-50);
  flex-shrink: 0;
}

/* Close Button */
.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  color: var(--gray-500);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  margin: -8px;
}

.modal-close:hover {
  color: var(--gray-700);
  background: var(--gray-200);
  transform: scale(1.1);
}

.modal-close:focus {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}

/* Dark Mode */
[data-theme="dark"] .modal-backdrop {
  background: rgba(0, 0, 0, 0.8);
}

[data-theme="dark"] .modal-content {
  background: var(--dark-bg-secondary);
  border-color: var(--dark-border);
  box-shadow: var(--dark-shadow);
}

[data-theme="dark"] .modal-header {
  background: linear-gradient(135deg, var(--dark-bg-tertiary), var(--dark-bg-secondary));
  border-color: var(--dark-border);
}

[data-theme="dark"] .modal-title {
  color: var(--dark-text-primary);
}

[data-theme="dark"] .modal-body {
  color: var(--dark-text-primary);
}

[data-theme="dark"] .modal-footer {
  background: var(--dark-bg-tertiary);
  border-color: var(--dark-border);
}

[data-theme="dark"] .modal-close {
  color: var(--dark-text-secondary);
}

[data-theme="dark"] .modal-close:hover {
  color: var(--dark-text-primary);
  background: var(--dark-bg-primary);
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .modal-backdrop {
    padding: 0.5rem;
  }

  .modal-dialog {
    margin: 0;
    max-height: 100%;
  }

  .modal-sm,
  .modal-md,
  .modal-lg,
  .modal-xl {
    max-width: 100%;
  }

  .modal-full {
    max-width: 100vw;
    max-height: 100vh;
    margin: 0;
  }

  .modal-content {
    max-height: 100vh;
    border-radius: 0;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: var(--spacing-lg);
  }

  .modal-title {
    font-size: 1.125rem;
  }
}

/* Scrollbar Styling */
.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: var(--gray-100);
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: var(--gray-400);
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: var(--gray-500);
}

[data-theme="dark"] .modal-body::-webkit-scrollbar-track {
  background: var(--dark-bg-tertiary);
}

[data-theme="dark"] .modal-body::-webkit-scrollbar-thumb {
  background: var(--dark-border);
}

[data-theme="dark"] .modal-body::-webkit-scrollbar-thumb:hover {
  background: var(--dark-text-muted);
}

/* Animation Performance */
.modal-backdrop,
.modal-dialog {
  will-change: opacity, transform;
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .modal-backdrop,
  .modal-dialog,
  .modal-close {
    transition: none;
  }

  .modal-dialog {
    transform: none;
  }

  .modal-dialog-enter,
  .modal-dialog-exit {
    transform: none;
  }
}

/* High Contrast */
@media (prefers-contrast: high) {
  .modal-content {
    border-width: 2px;
  }

  .modal-header,
  .modal-footer {
    border-width: 2px;
  }

  .modal-close {
    border: 1px solid currentColor;
  }
}
`;

// Inject styles function
export const injectModalStyles = () => {
  if (!document.getElementById('modal-styles')) {
    const style = document.createElement('style');
    style.id = 'modal-styles';
    style.textContent = modalStyles;
    document.head.appendChild(style);
  }
};

export default Modal;
