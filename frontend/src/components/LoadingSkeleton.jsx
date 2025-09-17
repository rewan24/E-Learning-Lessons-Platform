import React from 'react';

// Generic Loading Skeleton Component
const LoadingSkeleton = ({
  width = "100%",
  height = "20px",
  borderRadius = "4px",
  className = ""
}) => (
  <div
    className={`loading-skeleton ${className}`}
    style={{
      width,
      height,
      borderRadius,
      background: `linear-gradient(90deg,
        var(--gray-200) 0%,
        var(--gray-100) 50%,
        var(--gray-200) 100%)`,
      backgroundSize: '200% 100%',
      animation: 'skeleton-loading 1.5s ease-in-out infinite'
    }}
  />
);

// Card Skeleton Component
export const CardSkeleton = () => (
  <div className="card glass-card p-4 animate-pulse">
    <div className="d-flex justify-content-center mb-3">
      <LoadingSkeleton width="60px" height="60px" borderRadius="50%" />
    </div>
    <LoadingSkeleton height="24px" className="mb-3" />
    <LoadingSkeleton height="16px" className="mb-2" />
    <LoadingSkeleton height="16px" width="80%" className="mx-auto" />
  </div>
);

// Profile Skeleton Component
export const ProfileSkeleton = () => (
  <div className="glass-card shadow-xl rounded-xl overflow-hidden">
    <div className="card-header text-center p-5">
      <div className="d-flex justify-content-center mb-3">
        <LoadingSkeleton width="120px" height="120px" borderRadius="50%" />
      </div>
      <LoadingSkeleton height="32px" width="200px" className="mx-auto mb-2" />
      <LoadingSkeleton height="16px" width="300px" className="mx-auto" />
    </div>

    <div className="card-body p-4">
      <div className="row g-3 mb-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="col-6 col-md-3">
            <div className="card border-0 h-100 text-center p-3">
              <LoadingSkeleton height="32px" width="32px" className="mx-auto mb-2" />
              <LoadingSkeleton height="20px" width="40px" className="mx-auto mb-1" />
              <LoadingSkeleton height="14px" width="80px" className="mx-auto" />
            </div>
          </div>
        ))}
      </div>

      <div className="row">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="col-md-6 mb-3">
            <div className="bg-light rounded-lg p-3">
              <LoadingSkeleton height="16px" width="120px" className="mb-2" />
              <LoadingSkeleton height="20px" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Form Skeleton Component
export const FormSkeleton = () => (
  <div className="glass-card shadow-xl rounded-xl overflow-hidden">
    <div className="card-header text-center p-4">
      <LoadingSkeleton width="60px" height="60px" borderRadius="50%" className="mx-auto mb-3" />
      <LoadingSkeleton height="28px" width="200px" className="mx-auto mb-2" />
      <LoadingSkeleton height="16px" width="250px" className="mx-auto" />
    </div>

    <div className="card-body p-5">
      <div className="row">
        <div className="col-md-6 mb-4">
          <LoadingSkeleton height="16px" width="100px" className="mb-2" />
          <LoadingSkeleton height="48px" />
        </div>
        <div className="col-md-6 mb-4">
          <LoadingSkeleton height="16px" width="120px" className="mb-2" />
          <LoadingSkeleton height="48px" />
        </div>
      </div>

      <LoadingSkeleton height="56px" className="mb-4" />
    </div>
  </div>
);

// List Skeleton Component
export const ListSkeleton = ({ items = 5 }) => (
  <div className="glass-card shadow-lg rounded-xl p-4">
    <LoadingSkeleton height="24px" width="150px" className="mb-4" />

    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="d-flex align-items-center gap-3 py-3 border-bottom">
        <LoadingSkeleton width="40px" height="40px" borderRadius="50%" />
        <div className="flex-grow-1">
          <LoadingSkeleton height="18px" width="200px" className="mb-1" />
          <LoadingSkeleton height="14px" width="120px" />
        </div>
      </div>
    ))}
  </div>
);

// Full Page Loading Component
export const FullPageLoading = ({ message = "جاري التحميل..." }) => (
  <div
    className="min-vh-100 d-flex align-items-center justify-content-center"
    style={{
      background: "linear-gradient(135deg, var(--gray-50) 0%, var(--primary-50) 100%)"
    }}
  >
    <div className="text-center">
      <div className="loading-spinner-large mb-4">
        <div className="spinner-ring">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
      <h5 className="text-muted mb-2">{message}</h5>
      <p className="text-muted small">يرجى الانتظار قليلاً</p>
    </div>
  </div>
);

// Error State Component
export const ErrorState = ({
  title = "حدث خطأ ما",
  message = "نعتذر، لم نتمكن من تحميل البيانات. يرجى المحاولة مرة أخرى.",
  onRetry,
  showRetry = true
}) => (
  <div className="text-center py-5">
    <div className="error-illustration mb-4">
      <div className="error-icon">
        <span style={{ fontSize: '4rem' }}>😔</span>
      </div>
    </div>

    <h4 className="text-dark fw-bold mb-3">{title}</h4>
    <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '400px' }}>
      {message}
    </p>

    {showRetry && onRetry && (
      <button
        className="btn btn-primary btn-lg px-4 py-2"
        onClick={onRetry}
      >
        <span className="me-2">🔄</span>
        المحاولة مرة أخرى
      </button>
    )}
  </div>
);

// Empty State Component
export const EmptyState = ({
  title = "لا توجد بيانات",
  message = "لم يتم العثور على أي عناصر لعرضها.",
  icon = "📭",
  action
}) => (
  <div className="text-center py-5">
    <div className="empty-illustration mb-4">
      <div className="empty-icon">
        <span style={{ fontSize: '4rem' }}>{icon}</span>
      </div>
    </div>

    <h4 className="text-dark fw-bold mb-3">{title}</h4>
    <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '400px' }}>
      {message}
    </p>

    {action && action}
  </div>
);

// Network Error Component
export const NetworkError = ({ onRetry }) => (
  <div className="glass-card p-5 text-center">
    <div className="mb-4">
      <span style={{ fontSize: '4rem' }}>📡</span>
    </div>
    <h4 className="text-danger fw-bold mb-3">مشكلة في الاتصال</h4>
    <p className="text-muted mb-4">
      يبدو أن هناك مشكلة في الاتصال بالإنترنت. تأكد من الاتصال وحاول مرة أخرى.
    </p>
    <button
      className="btn btn-primary"
      onClick={onRetry}
    >
      <span className="me-2">🔄</span>
      إعادة المحاولة
    </button>
  </div>
);

// Success State Component
export const SuccessState = ({
  title = "تم بنجاح!",
  message = "تمت العملية بنجاح.",
  onContinue,
  continueText = "متابعة"
}) => (
  <div className="text-center py-5">
    <div className="success-illustration mb-4">
      <div className="success-icon">
        <span style={{ fontSize: '4rem' }}>🎉</span>
      </div>
    </div>

    <h4 className="text-success fw-bold mb-3">{title}</h4>
    <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '400px' }}>
      {message}
    </p>

    {onContinue && (
      <button
        className="btn btn-success btn-lg px-4 py-2"
        onClick={onContinue}
      >
        <span className="me-2">✨</span>
        {continueText}
      </button>
    )}
  </div>
);

// CSS Styles (add to index.css)
const skeletonStyles = `
@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.loading-skeleton {
  display: block;
  overflow: hidden;
}

[data-theme="dark"] .loading-skeleton {
  background: linear-gradient(90deg,
    var(--gray-700) 0%,
    var(--gray-600) 50%,
    var(--gray-700) 100%) !important;
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

.loading-spinner-large {
  display: inline-block;
  position: relative;
}

.spinner-ring {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}

.spinner-ring div {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 64px;
  height: 64px;
  margin: 8px;
  border: 8px solid var(--primary-600);
  border-radius: 50%;
  animation: spinner-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: var(--primary-600) transparent transparent transparent;
}

.spinner-ring div:nth-child(1) { animation-delay: -0.45s; }
.spinner-ring div:nth-child(2) { animation-delay: -0.3s; }
.spinner-ring div:nth-child(3) { animation-delay: -0.15s; }

@keyframes spinner-ring {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon, .empty-icon, .success-icon {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
`;

// Export styles for injection
export const injectSkeletonStyles = () => {
  if (!document.getElementById('skeleton-styles')) {
    const style = document.createElement('style');
    style.id = 'skeleton-styles';
    style.textContent = skeletonStyles;
    document.head.appendChild(style);
  }
};

export default LoadingSkeleton;
