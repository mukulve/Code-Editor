import ErrorContext from "./ErrorContext";

import { useEffect, useState } from "react";
import { useInterval } from "usehooks-ts";
import { Code } from "@nextui-org/react";

function EditorProvider({ children }) {
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (error == null) return;
    setShowError(true);
  }, [error]);

  useInterval(
    () => {
      setShowError(false);
      setError(null);
    },
    showError ? 5000 : null
  );

  return (
    <ErrorContext.Provider value={{ setError }}>
      {showError && (
        <div className="fixed bottom-2 right-2 p-2  min-w-[25vw]  z-50 bg-background flex flex-col gap-2">
          <h1 className="text-clip font-semibold ">An Has Error Occured</h1>
          <Code color="danger" className="break-all">
            {error}
          </Code>
        </div>
      )}
      {children}
    </ErrorContext.Provider>
  );
}

export default EditorProvider;
