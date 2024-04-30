import { invoke } from "@tauri-apps/api/tauri";
import { useState, useContext, useEffect, useRef } from "react";
import EditorContext from "./EditorContext";
import { path } from "@tauri-apps/api";

export default function GitHistory() {
  const { currentDirectory, OpenFolder } = useContext(EditorContext);
  const [gitHistory, setGitHistory] = useState([]);

  async function getGitHistory() {
    let history = await invoke("git_history", { path: currentDirectory });
    setGitHistory(history);
  }

  useEffect(() => {
    getGitHistory();
  }, []);

  return (
    <div>
      <p className="menu-title">Git History</p>
      <ul>
        {gitHistory.map((commit) => (
          <li key={commit} className="break-all">
            <p>{commit}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
