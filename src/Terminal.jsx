import { useContext, useEffect, useRef, useState } from "react";

import EditorContext from "./EditorContext";
import { Input, Button, Kbd, Code } from "@nextui-org/react";

import { invoke } from "@tauri-apps/api/tauri";

export default function Terminal() {
  const [terminalCommand, setTerminalCommand] = useState("");
  const [commandResult, setCommandResult] = useState([]);
  const {
    closeFile,
    openFiles,
    currentOpenFile,
    setCurrentOpenFile,
    setOpenFiles,
    loading,
    currentPath,
  } = useContext(EditorContext);

  async function callTerminalCommand() {
    if (terminalCommand == "") return;

    let result = await invoke("runTerminalCommand", {
      command: terminalCommand,
      path: currentPath,
    });
    setCommandResult((commandResult) => [...commandResult, result]);
    setTerminalCommand("");
  }

  return (
    <div className="absolute bottom-0 left-0 w-full h-32 bg-background p-2 ">
      {commandResult.map((result) => (
        <p className="mb-2 break-all">{result}</p>
      ))}
      <Input
        fullWidth
        size="sm"
        startContent={<h1>$</h1>}
        endContent={
          <Button
            size="sm"
            className="bg-background"
            isIconOnly
            onClick={callTerminalCommand}
          >
            <Kbd keys={["enter"]}></Kbd>
          </Button>
        }
        placeholder="Terminal"
        onChange={(e) => setTerminalCommand(e.target.value)}
      />
    </div>
  );
}
