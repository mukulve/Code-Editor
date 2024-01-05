import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import { NextUIProvider } from "@nextui-org/react";
import DarkModeProvider from "./DarkModeProvider";
import EditorProvider from "./EditorProvider";
import ErrorProvider from "./ErrorProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <NextUIProvider>
    <DarkModeProvider>
      <EditorProvider>
        <ErrorProvider>
          <App />
        </ErrorProvider>
      </EditorProvider>
    </DarkModeProvider>
  </NextUIProvider>
);
