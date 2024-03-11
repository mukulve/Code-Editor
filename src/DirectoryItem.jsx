import FileOrDirectory from "./FileOrDirectory";
import { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFolderClosed,
  faFolderOpen,
} from "@fortawesome/free-solid-svg-icons";

import { useOnClickOutside } from "usehooks-ts";
import { invoke } from "@tauri-apps/api/tauri";

export default function DirectoryItem({ directory }) {
  const [open, setOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const ref = useRef(null);
  useOnClickOutside(ref, () => setContextOpen(false));

  async function deleteFolder() {
    await invoke("remove_directory", { path: directory.path });
    setContextOpen(false);
  }

  async function createFile() {
    await invoke("create_file", { path: directory.path + "/new_file" });
  }

  return (
    <li>
      <details>
        <summary
          onClick={() => setOpen(!open)}
          onContextMenu={(e) => {
            setContextOpen(!contextOpen);
            e.preventDefault();
          }}
        >
          {open ? (
            <FontAwesomeIcon icon={faFolderOpen} />
          ) : (
            <FontAwesomeIcon icon={faFolderClosed} />
          )}
          {directory.name}
        </summary>

        {open && (
          <ul className="menu menu-xs bg-base-200 max-w-xs w-full ">
            {directory.children.map((child) => (
              <FileOrDirectory key={child.path} item={child} />
            ))}
          </ul>
        )}
      </details>

      {contextOpen && (
        <div
          ref={ref}
          className="hover:bg-primary shadow absolute  right-0 top-0 z-10 bg-primary  h-fit w-36 no-animation flex flex-col text-primary-content"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="btn btn-xs w-full btn-ghost no-animation hover:bg-primary"
            onClick={createFile}
          >
            New File
          </button>
          <button
            className="btn btn-xs w-full btn-ghost no-animation hover:bg-primary"
            onClick={deleteFolder}
          >
            Delete Folder
          </button>
        </div>
      )}
    </li>
  );
}
