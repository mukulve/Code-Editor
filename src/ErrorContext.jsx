import { createContext } from "react";
const ErrorContext = createContext({
  setError: () => {},
});
export default ErrorContext;
