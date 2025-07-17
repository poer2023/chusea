'use client';

import { useEffect } from 'react';
import { useSimpleUIStore } from '../stores/simple-stores';

// Toast helper function
export const toast = {
  success: (title: string, description?: string) => {
    const addToast = useSimpleUIStore.getState().addToast;
    addToast({
      type: 'success',
      title,
      description
    });
  },
  error: (title: string, description?: string) => {
    const addToast = useSimpleUIStore.getState().addToast;
    addToast({
      type: 'error',
      title,
      description
    });
  },
  warning: (title: string, description?: string) => {
    const addToast = useSimpleUIStore.getState().addToast;
    addToast({
      type: 'warning',
      title,
      description
    });
  },
  info: (title: string, description?: string) => {
    const addToast = useSimpleUIStore.getState().addToast;
    addToast({
      type: 'info',
      title,
      description
    });
  }
};

// Toast container component
export function ToastContainer() {
  const toasts = useSimpleUIStore((state) => state.toasts);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
}

// Individual toast component
interface ToastProps {
  id: string;
  type: string;
  title: string;
  description?: string;
}

function Toast({ id, type, title, description }: ToastProps) {
  const removeToast = useSimpleUIStore((state) => state.removeToast);

  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [id, removeToast]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-green-50 border-green-200 text-green-800',
          icon: (
            <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ),
        };
      case 'error':
        return {
          container: 'bg-red-50 border-red-200 text-red-800',
          icon: (
            <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          icon: (
            <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          ),
        };
      case 'info':
      default:
        return {
          container: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: (
            <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div
      className={`max-w-sm w-full border rounded-lg shadow-lg p-4 transition-all duration-300 ease-in-out transform animate-in slide-in-from-right ${styles.container}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">{styles.icon}</div>
        
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{title}</p>
          {description && (
            <p className="mt-1 text-sm opacity-90">{description}</p>
          )}
        </div>
        
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={() => removeToast(id)}
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition ease-in-out duration-150"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Progress toast for long operations
interface ProgressToastProps {
  id: string;
  title: string;
  progress: number;
  description?: string;
}

export function ProgressToast({ id, title, progress, description }: ProgressToastProps) {
  const removeToast = useSimpleUIStore((state) => state.removeToast);

  return (
    <div className="max-w-sm w-full bg-white border border-gray-200 rounded-lg shadow-lg p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        </div>
        
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          {description && (
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          )}
          
          <div className="mt-2">
            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{Math.round(progress)}% complete</p>
          </div>
        </div>
        
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={() => removeToast(id)}
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Action toast with custom action button
interface ActionToastProps {
  id: string;
  title: string;
  description?: string;
  actionLabel: string;
  onAction: () => void;
}

export function ActionToast({ id, title, description, actionLabel, onAction }: ActionToastProps) {
  const removeToast = useSimpleUIStore((state) => state.removeToast);

  const handleAction = () => {
    onAction();
    removeToast(id);
  };

  return (
    <div className="max-w-sm w-full bg-white border border-gray-200 rounded-lg shadow-lg p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          {description && (
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          )}
          
          <div className="mt-3 flex space-x-2">
            <button
              onClick={handleAction}
              className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {actionLabel}
            </button>
            <button
              onClick={() => removeToast(id)}
              className="text-xs text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              Dismiss
            </button>
          </div>
        </div>
        
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={() => removeToast(id)}
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}