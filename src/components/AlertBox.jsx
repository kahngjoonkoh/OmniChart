import { createContext, useContext, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';

const AlertContext = createContext();

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);

  const addAlert = (message, type = "info") => {
    const id = Date.now();
    setAlerts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeAlert(id), 5000);
  };

  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }

  const typeStyles = {
    info: "bg-blue-100 border-blue-400 text-blue-800",
    success: "bg-green-100 border-green-400 text-green-800",
    error: "bg-red-100 border-red-400 text-red-800",
    warning: "bg-yellow-100 border-yellow-400 text-yellow-800",
  };

  return (
    <AlertContext.Provider value={{ addAlert }}>
      {children}
      <div className="fixed left-1/2 top-[4.5rem] transform -translate-x-1/2 z-40 space-y-2 w-[400px]">
        <AnimatePresence>
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`w-[400px] border px-6 py-3 rounded shadow-lg relative ${typeStyles[alert.type]}`}
            >
              <span>{alert.message}</span>
              <button
                onClick={() => removeAlert(alert.id)}
                className="ml-4 text-xl font-bold absolute top-1 right-2 hover:text-red-500"
              >
                ×
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </AlertContext.Provider>
  )
}

export function useAlert() {
  return useContext(AlertContext);
}

export default AlertProvider;