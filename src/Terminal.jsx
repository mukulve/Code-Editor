import { useState, useContext } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import EditorContext from "./EditorContext";

export default function Terminal() {
  const { currentDirectory } = useContext(EditorContext);

  const [command, setCommand] = useState("");
  const [logs, setLogs] = useState([]);
  const [commandOutput, setCommandOutput] = useState([]);

  async function sendCommand() {
    try {
      const response = await invoke("run_command", {
        command: command,
        directory: currentDirectory,
      });
      setCommandOutput((commandOutput) => [...commandOutput, response]);
      setCommand("");
    } catch (e) {
      setCommandOutput((commandOutput) => [...commandOutput, e]);
    }
  }

  return (
    <div className="h-40 absolute bottom-0 left-0 w-full overflow-auto">
      <div role="tablist" className="tabs tabs-bordered border-b-gray-50">
        <input
          type="radio"
          name="my_tabs_1"
          role="tab"
          className="tab"
          aria-label="Logs"
        />
        <div role="tabpanel" className="tab-content p-2"></div>

        <input
          type="radio"
          name="my_tabs_1"
          role="tab"
          className="tab"
          aria-label="Terminal"
          checked
        />
        <div role="tabpanel" className="tab-content p-2">
          <div className="join  w-full">
            <input
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              className="input  join-item input-sm w-full"
              placeholder="Command..."
            />
            <button className="btn join-item btn-sm" onClick={sendCommand}>
              <kbd className="kbd kbd-sm">Enter</kbd>
            </button>
          </div>
          <div className="flex flex-col-reverse">
            {commandOutput.map((output, i) => (
              <div key={i} className="whitespace-pre-line ">
                {output}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
