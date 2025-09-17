/**
 * Modern UI Utilities and Hooks
 * Comprehensive utilities for modern web interactions
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// ========================================
// Theme Utilities
// ========================================

export const themeUtils = {
  getTheme: () => {
    return localStorage.getItem('theme') || 'light';
  },

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  },

  toggleTheme: () => {
    const current = themeUtils.getTheme();
    const newTheme = current === 'dark' ? 'light' : 'dark';
    themeUtils.setTheme(newTheme);
    return newTheme;
  },

  getSystemTheme: () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  },

  initTheme: () => {
    const saved = themeUtils.getTheme();
    if (saved !== 'light' && saved !== 'dark') {
      const systemTheme = themeUtils.getSystemTheme();
      themeUtils.setTheme(systemTheme);
    } else {
      themeUtils.setTheme(saved);
    }
  }
};

// ========================================
// Animation Utilities
// ========================================

export const animationUtils = {
  // Check if user prefers reduced motion
  prefersReducedMotion: () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Animate element with CSS classes
  animateElement: (element, animationClass, duration = 300) => {
    return new Promise((resolve) => {
      if (animationUtils.prefersReducedMotion()) {
        resolve();
        return;
      }

      element.classList.add(animationClass);

      const handleAnimationEnd = () => {
        element.classList.remove(animationClass);
        element.removeEventListener('animationend', handleAnimationEnd);
        resolve();
      };

      element.addEventListener('animationend', handleAnimationEnd);

      // Fallback timeout
      setTimeout(() => {
        element.classList.remove(animationClass);
        resolve();
      }, duration);
    });
  },

  // Smooth scroll to element
  scrollToElement: (element, options = {}) => {
    const defaultOptions = {
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    };

    element.scrollIntoView({ ...defaultOptions, ...options });
  },

  // Fade in elements on intersection
  observeElements: (selector, animationClass = 'fade-in', threshold = 0.1) => {
    if (animationUtils.prefersReducedMotion()) return;

    const elements = document.querySelectorAll(selector);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(animationClass);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold });

    elements.forEach(el => observer.observe(el));

    return observer;
  }
};

// ========================================
// DOM Utilities
// ========================================

export const domUtils = {
  // Get element dimensions and position
  getElementBounds: (element) => {
    const rect = element.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      bottom: rect.bottom + window.scrollY,
      right: rect.right + window.scrollX
    };
  },

  // Check if element is in viewport
  isInViewport: (element, threshold = 0) => {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;

    return (
      rect.top >= -threshold &&
      rect.left >= -threshold &&
      rect.bottom <= windowHeight + threshold &&
      rect.right <= windowWidth + threshold
    );
  },

  // Create ripple effect
  createRipple: (event, element, color = 'rgba(255, 255, 255, 0.3)') => {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: ${color};
      border-radius: 50%;
      transform: scale(0);
      animation: ripple-effect 0.6s ease-out;
      pointer-events: none;
      z-index: 1000;
    `;

    // Add ripple styles if not already added
    if (!document.getElementById('ripple-styles')) {
      const style = document.createElement('style');
      style.id = 'ripple-styles';
      style.textContent = `
        @keyframes ripple-effect {
          to {
            transform: scale(2);
            opacity: 0;
          }
        }
        .ripple-container {
          position: relative;
          overflow: hidden;
        }
      `;
      document.head.appendChild(style);
    }

    element.classList.add('ripple-container');
    element.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  },

  // Copy text to clipboard
  copyToClipboard: async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      } catch (fallbackErr) {
        document.body.removeChild(textArea);
        return false;
      }
    }
  }
};

// ========================================
// React Hooks
// ========================================

// Hook for managing local storage with React state
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  return [storedValue, setValue];
};

// Hook for tracking element visibility
export const useIntersection = (ref, options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [ref, options]);

  return isIntersecting;
};

// Hook for detecting outside clicks
export const useClickOutside = (ref, callback) => {
  useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback(event);
      }
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [ref, callback]);
};

// Hook for keyboard shortcuts
export const useKeyboard = (key, callback, options = {}) => {
  const { ctrl = false, alt = false, shift = false, meta = false } = options;

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        event.ctrlKey === ctrl &&
        event.altKey === alt &&
        event.shiftKey === shift &&
        event.metaKey === meta
      ) {
        event.preventDefault();
        callback(event);
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [key, callback, ctrl, alt, shift, meta]);
};

// Hook for debouncing values
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook for window size
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

// Hook for scroll position
export const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const updatePosition = () => {
      setScrollPosition(window.pageYOffset);
    };

    window.addEventListener('scroll', updatePosition);
    updatePosition();

    return () => window.removeEventListener('scroll', updatePosition);
  }, []);

  return scrollPosition;
};

// Hook for previous value
export const usePrevious = (value) => {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
};

// Hook for async operations
export const useAsync = (asyncFunction, immediate = true) => {
  const [loading, setLoading] = useState(immediate);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await asyncFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { execute, loading, data, error };
};

// Hook for form validation
export const useFormValidation = (initialState, validationRules) => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);

  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return '';

    for (const rule of rules) {
      if (typeof rule === 'function') {
        const error = rule(value, values);
        if (error) return error;
      }
    }

    return '';
  };

  const validateAll = () => {
    const newErrors = {};
    Object.keys(validationRules).forEach(field => {
      const error = validateField(field, values[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    const valid = Object.keys(newErrors).length === 0;
    setIsValid(valid);
    return valid;
  };

  const setValue = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Validate field
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const setValues = (newValues) => {
    setValues(newValues);
  };

  const reset = () => {
    setValues(initialState);
    setErrors({});
    setIsValid(false);
  };

  return {
    values,
    errors,
    isValid,
    setValue,
    setValues,
    validateAll,
    reset
  };
};

// ========================================
// Validation Helpers
// ========================================

export const validators = {
  required: (message = 'هذا الحقل مطلوب') => (value) => {
    return !value || value.toString().trim() === '' ? message : '';
  },

  minLength: (min, message) => (value) => {
    return value && value.length < min ? (message || `يجب أن يكون ${min} أحرف على الأقل`) : '';
  },

  maxLength: (max, message) => (value) => {
    return value && value.length > max ? (message || `يجب ألا يتجاوز ${max} حرف`) : '';
  },

  email: (message = 'البريد الإلكتروني غير صحيح') => (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return value && !emailRegex.test(value) ? message : '';
  },

  phone: (message = 'رقم الهاتف غير صحيح') => (value) => {
    const phoneRegex = /^[0-9+\-\s()]+$/;
    return value && !phoneRegex.test(value) ? message : '';
  },

  password: (message = 'كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل') => (value) => {
    return value && value.length < 8 ? message : '';
  },

  match: (fieldName, message) => (value, values) => {
    return value !== values[fieldName] ? (message || 'القيم غير متطابقة') : '';
  }
};

// ========================================
// Format Utilities
// ========================================

export const formatUtils = {
  // Format numbers for Arabic locale
  formatNumber: (number, options = {}) => {
    return new Intl.NumberFormat('ar-SA', options).format(number);
  },

  // Format currency
  formatCurrency: (amount, currency = 'SAR') => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  // Format dates for Arabic locale
  formatDate: (date, options = {}) => {
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };

    return new Intl.DateTimeFormat('ar-SA', { ...defaultOptions, ...options }).format(new Date(date));
  },

  // Format relative time (e.g., "منذ 5 دقائق")
  formatRelativeTime: (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

    if (diffInSeconds < 60) return 'الآن';
    if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
    if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
    if (diffInSeconds < 604800) return `منذ ${Math.floor(diffInSeconds / 86400)} يوم`;

    return formatUtils.formatDate(date);
  },

  // Truncate text with ellipsis
  truncateText: (text, maxLength = 100, suffix = '...') => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + suffix;
  },

  // Generate initials from name
  getInitials: (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  },

  // Generate random color based on string
  getColorFromString: (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = hash % 360;
    return `hsl(${hue}, 70%, 60%)`;
  }
};

// ========================================
// Performance Utilities
// ========================================

export const performanceUtils = {
  // Throttle function calls
  throttle: (func, delay) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, delay);
      }
    };
  },

  // Debounce function calls
  debounce: (func, delay) => {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  },

  // Lazy load images
  lazyLoadImage: (img, src, placeholder = '') => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const image = entry.target;
          image.src = src;
          image.classList.remove('lazy');
          observer.unobserve(image);
        }
      });
    });

    img.src = placeholder;
    img.classList.add('lazy');
    observer.observe(img);
  },

  // Preload resources
  preloadResource: (href, as = 'image') => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  }
};

// ========================================
// Accessibility Utilities
// ========================================

export const a11yUtils = {
  // Announce to screen readers
  announce: (message, priority = 'polite') => {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.style.position = 'absolute';
    announcer.style.left = '-10000px';
    announcer.style.width = '1px';
    announcer.style.height = '1px';
    announcer.style.overflow = 'hidden';

    document.body.appendChild(announcer);
    announcer.textContent = message;

    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  },

  // Trap focus within element
  trapFocus: (element) => {
    const focusableElements = element.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    element.addEventListener('keydown', handleTab);

    return () => {
      element.removeEventListener('keydown', handleTab);
    };
  },

  // Generate unique IDs for accessibility
  generateId: (prefix = 'ui') => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
};

export default {
  themeUtils,
  animationUtils,
  domUtils,
  formatUtils,
  performanceUtils,
  a11yUtils,
  validators
};
