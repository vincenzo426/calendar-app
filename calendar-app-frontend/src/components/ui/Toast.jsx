// components/ui/Toast.jsx
import React, { useState, useEffect, createContext, useContext } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

// Contesto per la gestione dei toast
const ToastContext = createContext();

// Tipo di toast
const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Provider per la gestione dei toast
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  
  // Aggiunge un nuovo toast
  const addToast = (message, type = TOAST_TYPES.INFO, duration = 5000) => {
    const id = Date.now().toString();
    
    setToasts((prevToasts) => [
      ...prevToasts,
      { id, message, type, duration },
    ]);
    
    return id;
  };
  
  // Rimuove un toast specifico
  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };
  
  // Helper per i vari tipi di toast
  const success = (message, duration) => addToast(message, TOAST_TYPES.SUCCESS, duration);
  const error = (message, duration) => addToast(message, TOAST_TYPES.ERROR, duration);
  const warning = (message, duration) => addToast(message, TOAST_TYPES.WARNING, duration);
  const info = (message, duration) => addToast(message, TOAST_TYPES.INFO, duration);
  
  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, success, error, warning, info }}
    >
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Hook per utilizzare il contesto dei toast
export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast deve essere utilizzato all\'interno di un ToastProvider');
  }
  
  return context;
};

// Componente singolo toast
const Toast = ({ toast, onRemove }) => {
  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => {
        onRemove(toast.id);
      }, toast.duration);
      
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onRemove]);
  
  // Gestione stili in base al tipo di toast
  const getToastStyles = () => {
    switch (toast.type) {
      case TOAST_TYPES.SUCCESS:
        return {
          icon: <CheckCircle className="text-green-500" size={20} />,
          className: 'bg-green-50 border-green-200 text-green-800',
        };
      case TOAST_TYPES.ERROR:
        return {
          icon: <AlertCircle className="text-red-500" size={20} />,
          className: 'bg-red-50 border-red-200 text-red-800',
        };
      case TOAST_TYPES.WARNING:
        return {
          icon: <AlertTriangle className="text-amber-500" size={20} />,
          className: 'bg-amber-50 border-amber-200 text-amber-800',
        };
      case TOAST_TYPES.INFO:
      default:
        return {
          icon: <Info className="text-blue-500" size={20} />,
          className: 'bg-blue-50 border-blue-200 text-blue-800',
        };
    }
  };
  
  const styles = getToastStyles();
  
  return (
    <div
      className={`flex items-start p-3 rounded-md shadow border ${styles.className} mb-2`}
      role="alert"
    >
      <div className="flex-shrink-0 mr-3">{styles.icon}</div>
      <div className="flex-1">{toast.message}</div>
      <button
        onClick={() => onRemove(toast.id)}
        className="ml-3 text-gray-400 hover:text-gray-600 focus:outline-none"
        aria-label="Chiudi"
      >
        <X size={16} />
      </button>
    </div>
  );
};

// Componente contenitore di tutti i toast
export const ToastContainer = () => {
  const { toasts, removeToast } = useContext(ToastContext) || {
    toasts: [],
    removeToast: () => {},
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50 w-72">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};
