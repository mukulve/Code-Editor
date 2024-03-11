import { useContext, useState, useRef, useEffect } from "react";
import { useOnClickOutside } from "usehooks-ts";
import EditorContext from "./EditorContext";
import FileIcon from "./FileIcon";
import { invoke } from "@tauri-apps/api/tauri";

export default function FileItem({ file }) {
  const [open, setOpen] = useState(false);
  const [fileOpenInEditor, setFileOpenInEditor] = useState(false);
  const { openFile, isFileOpen, openFiles, currentFile } =
    useContext(EditorContext);
  const ref = useRef(null);

  useOnClickOutside(ref, () => setOpen(false));

  async function deleteFile() {
    await invoke("remove_file", { path: file.path });
    setOpen(false);
  }

  useEffect(() => {
    setFileOpenInEditor(isFileOpen(file));
  }, [openFiles, currentFile]);

  return (
    <li
      className="relative "
      onClick={() => openFile(file)}
      onContextMenu={(e) => {
        setOpen(!open);
        e.preventDefault();
      }}
    >
      <a
        className={`${
          fileOpenInEditor ? "bg-primary text-primary-content" : ""
        }`}
      >
        <FileIcon file={file} />
        {file.name}
      </a>
      {open && (
        <div
          ref={ref}
          className="hover:bg-primary shadow absolute  right-0 top-0 z-10 bg-primary  h-fit w-24 no-animation 	text-primary-content "
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="btn btn-xs w-full btn-ghost no-animation hover:bg-primary"
            onClick={deleteFile}
          >
            Delete
          </button>
        </div>
      )}
    </li>
  );
}
