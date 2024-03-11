import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile, faFolder } from "@fortawesome/free-solid-svg-icons";
import { useState, useContext } from "react";
import { invoke } from "@tauri-apps/api/tauri";

import EditorContext from "./EditorContext";

export default function NewDirectory() {
  const { currentDirectory } = useContext(EditorContext);
  const [file, setFile] = useState("");

  async function createFile() {
    await invoke("create_directory", { path: currentDirectory + "/" + file });
  }

  return (
    <div>
      <FontAwesomeIcon icon={faFolder} />
      <input
        type="text"
        placeholder="New Folder"
        className="input input-bordered w-full max-w-xs input-xs"
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
