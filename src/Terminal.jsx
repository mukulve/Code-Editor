import { useContext, useState } from "react";

import ErrorContext from "./ErrorContext";
import { Input, Button, Kbd, Tabs, Tab } from "@nextui-org/react";

import { invoke } from "@tauri-apps/api/tauri";

export default function Terminal() {
  const [terminalCommand, setTerminalCommand] = useState("");
  const [commandResult, setCommandResult] = useState([]);
  const [log, setLog] = useState([]);
  const { setError } = useContext(ErrorContext);

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
    <div className="absolute bottom-0 left-0 w-full h-32 bg-background p-2 overflow-auto border-solid border-t border-text-foreground">
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
            value={terminalCommand}
            onChange={(e) => setTerminalCommand(e.target.value)}
          />
          <div className="flex flex-col-reverse">
            {commandResult.map((result, i) => (
              <p className="mt-2 break-all text-sm" key={i}>
                {result}
              </p>
            ))}
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
