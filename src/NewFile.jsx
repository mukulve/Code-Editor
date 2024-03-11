import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile } from "@fortawesome/free-solid-svg-icons";
import { useState, useContext } from "react";
import { invoke } from "@tauri-apps/api/tauri";

import EditorContext from "./EditorContext";

export default function NewFile() {
  const { currentDirectory } = useContext(EditorContext);
  const [file, setFile] = useState("");

  async function createFile() {
    await invoke("create_file", { path: currentDirectory + "/" + file });
  }

  return (
    <div className="flex align-middle items-center gap-2">
      <FontAwesomeIcon icon={faFile} />
      <input
        type="text"
        placeholder="New File"
        className="input input-bordered w-full max-w-xs input-xs "
        value={file}
        onChange={(e) => setFile(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            createFile();
            e.target.blur();
            setFile("");
          }
        }}
      />
    </div>
  );
}
