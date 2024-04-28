import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import EditorProvider from "./EditorProvider";
import InfoProvider from "./InfoProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <EditorProvider>
    <InfoProvider>
      <App />
    </InfoProvider>
  </EditorProvider>
);
