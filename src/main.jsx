import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import EditorProvider from "./EditorProvider";
import InfoProvider from "./InfoProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <EditorProvider>
      <InfoProvider>
        <App />
      </InfoProvider>
    </EditorProvider>
  </React.StrictMode>
);
