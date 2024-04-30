import EditorContext from "./EditorContext";
import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";
import { useLocalStorage } from "usehooks-ts";

export default function EditorProvider({ children }) {
  const [openFiles, setOpenFiles] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [currentDirectory, setCurrentDirectory] = useState(null);
  const [localCurrentDirectory, setLocalCurrentDirectory] = useLocalStorage(
    "currentDirectory",
    null
  );
  const [localLastOpenFiles, setLocalLastOpenFiles] = useLocalStorage(
    "openFiles",
    []
  );

  useEffect(() => {
    setLocalLastOpenFiles(openFiles);
  }, [openFiles]);

  useEffect(() => {
    if (localCurrentDirectory != null) {
      setCurrentDirectory(localCurrentDirectory);
    }

    if (localLastOpenFiles.length > 0) {
      setOpenFiles(localLastOpenFiles);
      setCurrentFile(0);
    }
  }, []);

  async function openFile(file) {
    for (let i = 0; i < openFiles.length; i++) {
      if (openFiles[i].path == file.path) {
        setCurrentFile(i);
        return;
      }
    }
    let readFileStruct = await invoke("read_file", { path: file.path });

    setOpenFiles((openFiles) => [
      ...openFiles,
      {
        path: file.path,
        name: file.name,
        content: readFileStruct.content,
        isBinary: readFileStruct.is_binary,
        extension: file.path.split(".").pop(),
      },
    ]);
    setCurrentFile(openFiles.length);
  }

  function closeFile(index) {
    let newOpenFiles = [...openFiles];
    newOpenFiles.splice(index, 1);

    if (newOpenFiles.length == 0) {
      setCurrentFile(null);
      setOpenFiles(newOpenFiles);
    } else {
      setOpenFiles(newOpenFiles);
      setCurrentFile(0);
    }
  }

  async function OpenFolder() {
    const selected = await open({
      directory: true,
      multiple: false,
    });
    if (Array.isArray(selected) || selected === null) {
      return;
    } else {
      setLocalCurrentDirectory(selected);
      setCurrentDirectory(selected);
    }
  }

  function isFileOpen(file) {
    for (let i = 0; i < openFiles.length; i++) {
      if (openFiles[i].path == file.path && i == currentFile) {
        return true;
      }
    }
    return false;
  }

  return (
    <EditorContext.Provider
      value={{
        openFile,
        openFiles,
        setCurrentFile,
        currentFile,
        closeFile,
        setOpenFiles,
        OpenFolder,
        currentDirectory,
        isFileOpen,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}
