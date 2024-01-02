import { useDarkMode } from "usehooks-ts";

export default function DarkModeProvider({ children }) {
  const { isDarkMode, toggle, enable, disable } = useDarkMode();

  return (
    <div
      className={`${isDarkMode ? "dark" : ""} text-foreground bg-background`}
    >
      {children}
    </div>
  );
}
