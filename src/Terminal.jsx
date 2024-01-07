import { useContext, useState } from "react";
import EditorContext from "./EditorContext";
import ErrorContext from "./ErrorContext";
import { Input, Button, Kbd, Tabs, Tab } from "@nextui-org/react";

import { invoke } from "@tauri-apps/api/tauri";
import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/react";
import { Resizable } from "re-resizable";

export default function Terminal() {
  const [terminalCommand, setTerminalCommand] = useState("");
  const [commandResult, setCommandResult] = useState([]);
  const [log, setLog] = useState([]);
  const { setError } = useContext(ErrorContext);
  const {
    closeFile,
    openFiles,
    currentOpenFile,
    setCurrentOpenFile,
    loading,
    currentPath,
  } = useContext(EditorContext);

  async function callTerminalCommand() {
    if (terminalCommand == "") return;

    try {
      let result = await invoke("runTerminalCommand", {
        command: terminalCommand,
      });
      setCommandResult((commandResult) => [...commandResult, result]);
      setTerminalCommand("");
    } catch (e) {
      setError(e);
    }
  }

  async function getLog() {
    let result = await invoke("getLogs", {});
    setLog(result);
  }

  function convertTime(time) {
    //{nanos_since_epoch: 547497557, secs_since_epoch: 1703949777}
    let date = new Date(time.secs_since_epoch * 1000);
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    let milliseconds = time.nanos_since_epoch / 1000000;
    let timeString =
      hours + ":" + minutes + ":" + seconds + "." + milliseconds.toFixed(3);
    return timeString;
  }

  return (
    <div className="absolute bottom-0 left-0 w-full  z-50 bg-background overflow-y-auto border-solid border-t border-text-foreground">
      <Resizable
        defaultSize={{
          width: "100%",
          height: "64px",
        }}
        enable={{
          top: true,
          right: false,
          bottom: false,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false,
        }}
        minHeight={50}
        maxHeight={"50vh"}
        className="p-2 "
      >
        <Tabs aria-label="Options" onSelectionChange={getLog} size="sm">
          <Tab key="log" title="Log">
            <div className="flex flex-col-reverse">
              {log.map((result, i) => (
                <p className="mt-2 break-all text-xs" key={i}>
                  {convertTime(result.time)} {result.message}
                </p>
              ))}
            </div>
          </Tab>
          <Tab key="terminal" title="Terminal">
            <Input
              fullWidth
              size="sm"
              startContent={
                <h1>
                  {currentPath == null
                    ? "$"
                    : ".../" + currentPath.split(/[\/\\]/).pop() + "$"}
                </h1>
              }
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
              value={terminalCommand}
              onChange={(e) => setTerminalCommand(e.target.value)}
            />
            <div className="flex flex-col-reverse">
              {commandResult.map((result, i) => (
                <p
                  className="mt-2 break-all text-sm whitespace-pre-line"
                  key={i}
                >
                  {result}
                </p>
              ))}
            </div>
          </Tab>
        </Tabs>
      </Resizable>
    </div>
  );
}
