import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faClose,
  faMaximize,
  faMinimize,
} from "@fortawesome/free-solid-svg-icons";
import { appWindow } from "@tauri-apps/api/window";
import { useContext, useRef } from "react";
import EditorContext from "./EditorContext";
import { invoke } from "@tauri-apps/api/tauri";

export default function CustomWindow() {
  const { openFiles, currentFile, currentDirectory, OpenFolder } =
    useContext(EditorContext);

  const openFilesRef = useRef(openFiles);
  openFilesRef.current = openFiles;

  const currentFileRef = useRef(currentFile);
  currentFileRef.current = currentFile;

  async function saveCurrentFile() {
    let file = openFilesRef.current[currentFileRef.current];

    if (file != null || file != undefined) {
      await invoke("write_to_file", {
        path: file.path,
        content: file.content,
      });
    }
  }

  return (
    <div
      data-tauri-drag-region
      className="h-[30px] select-none flex justify-between fixed top-0 left-0 right-0 z-50 items-center bg-base-200"
    >
      <div className="dropdown dropdown-bottom flex-none">
        <div tabIndex={0} role="button" className="btn btn-xs">
          <FontAwesomeIcon icon={faBars} />
        </div>
        <ul
          tabIndex={0}
          className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
        >
          <li onClick={saveCurrentFile}>Save</li>
          <div className="divider mt-1 mb-1"></div>
          <li onClick={OpenFolder}>Open Folder</li>
          <div className="divider mt-1 mb-1"></div>
          <li onClick={() => appWindow.close()}>Exit</li>
        </ul>
      </div>
      <div className="flex-none">
        <span className="text-xs font-bold">{currentDirectory}</span>
      </div>
      <div className="flex-none">
        <div className="btn btn-xs" onClick={() => appWindow.minimize()}>
          <FontAwesomeIcon icon={faMinimize} />
        </div>
        <div className="btn btn-xs" onClick={() => appWindow.toggleMaximize()}>
          <FontAwesomeIcon icon={faMaximize} />
        </div>
        <div className="btn btn-xs btn-error" onClick={() => appWindow.close()}>
          <FontAwesomeIcon icon={faClose} />
        </div>
      </div>
    </div>
  );
}
