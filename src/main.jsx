import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import { NextUIProvider } from "@nextui-org/react";
import DarkModeProvider from "./DarkModeProvider";
import EditorProvider from "./EditorProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <NextUIProvider>
      <DarkModeProvider>
        <EditorProvider>
          <App />
        </EditorProvider>
      </DarkModeProvider>
    </NextUIProvider>
  </React.StrictMode>
);
