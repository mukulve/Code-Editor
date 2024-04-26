import InfoContext from "./InfoContext";
import { listen } from "@tauri-apps/api/event";
import { useEffect, useState, useRef } from "react";

export default function EditorProvider({ children }) {
  const [alerts, setAlerts] = useState([]);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const unlisten = listen("alert_event", (e) => {
      setAlerts((alerts) => [...alerts, e.payload]);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        removeAlert();
      }, 2000);
    });

    return () => {
      unlisten.then((f) => f());
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const removeAlert = () => {
    let newAlerts = [...alerts];
    newAlerts.shift();
    setAlerts(newAlerts);
  };

  return (
    <InfoContext.Provider value={{}}>
      {children}
      <div className="toast toast-end stack">
        <div className="stack">
          {alerts.map((alert, i) => (
            <div className="alert alert-info" key={i}>
              <span>{alert}</span>
            </div>
          ))}
        </div>
      </div>
    </InfoContext.Provider>
  );
}
