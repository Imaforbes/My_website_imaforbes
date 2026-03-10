// src/components/ErrorMessage.jsx
// Reusable error message component

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiAlertTriangle,
  FiX,
  FiRefreshCw,
  FiWifi,
  FiWifiOff,
} from "react-icons/fi";

const ErrorMessage = ({
  error,
  onRetry,
  onDismiss,
  showIcon = true,
  className = "",
  variant = "error", // 'error', 'warning', 'info'
}) => {
  if (!error) return null;

  const getIcon = () => {
    if (error.type === "NETWORK_ERROR")
      return <FiWifiOff className="w-5 h-5" />;
    if (error.type === "SERVER_ERROR")
      return <FiRefreshCw className="w-5 h-5" />;
    return <FiAlertTriangle className="w-5 h-5" />;
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800";
      case "error":
      default:
        return "bg-red-50 border-red-200 text-red-800";
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={`rounded-lg border p-4 ${getVariantStyles()} ${className}`}
      >
        <div className="flex items-start">
          {showIcon && <div className="flex-shrink-0 mr-3">{getIcon()}</div>}

          <div className="flex-1">
            <h3 className="text-sm font-medium mb-1">
              {error.type === "NETWORK_ERROR" && "Error de conexión"}
              {error.type === "SERVER_ERROR" && "Error del servidor"}
              {error.type === "AUTH_ERROR" && "Error de autenticación"}
              {error.type === "VALIDATION_ERROR" && "Error de validación"}
              {![
                "NETWORK_ERROR",
                "SERVER_ERROR",
                "AUTH_ERROR",
                "VALIDATION_ERROR",
              ].includes(error.type) && "Error"}
            </h3>

            <p className="text-sm">{error.message}</p>

            {(onRetry || onDismiss) && (
              <div className="mt-3 flex gap-2">
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="inline-flex items-center gap-1 text-xs font-medium hover:underline"
                  >
                    <FiRefreshCw className="w-3 h-3" />
                    Reintentar
                  </button>
                )}

                {onDismiss && (
                  <button
                    onClick={onDismiss}
                    className="inline-flex items-center gap-1 text-xs font-medium hover:underline"
                  >
                    <FiX className="w-3 h-3" />
                    Cerrar
                  </button>
                )}
              </div>
            )}
          </div>

          {onDismiss && (
            <div className="flex-shrink-0 ml-3">
              <button
                onClick={onDismiss}
                className="hover:bg-black/10 rounded-full p-1 transition-colors"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Network status indicator
export const NetworkStatus = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <ErrorMessage
        error={{
          type: "NETWORK_ERROR",
          message:
            "Sin conexión a internet. Algunas funciones pueden no estar disponibles.",
        }}
        variant="warning"
        className="max-w-sm"
      />
    </div>
  );
};

// Toast notification for errors
export const ErrorToast = ({ error, onDismiss, duration = 5000 }) => {
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <ErrorMessage error={error} onDismiss={onDismiss} className="shadow-lg" />
    </div>
  );
};

export default ErrorMessage;
