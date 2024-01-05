import { useDarkMode } from "usehooks-ts";
import { Switch, Divider } from "@nextui-org/react";
export default function Settings() {
  const { isDarkMode, toggle, enable, disable } = useDarkMode();
  return (
    <>
      <h1 className="text-clip font-semibold ">Settings</h1>
      <div className="flex justify-between">
        <h1 className="text-clip font-semibold ">Dark Mode</h1>
        <Switch size="sm" onClick={toggle} defaultSelected={isDarkMode} />
      </div>
      <h1 className="mt-2">Made by Mukul with Tauri, Rust, React</h1>
    </>
  );
}
