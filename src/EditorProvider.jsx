import EditorContext from "./EditorContext";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";
import { appDir } from "@tauri-apps/api/path";
import { useState, useEffect } from "react";

function EditorProvider({ children }) {
  const [openFiles, setOpenFiles] = useState([]);
  const [currentOpenFile, setCurrentOpenFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState(null);

  async function openFolder() {
    const selected = await open({
      directory: true,
      multiple: false,
      defaultPath: await appDir(),
    });
    if (Array.isArray(selected)) {
      return null;
    } else if (selected === null) {
      return null;
    } else {
      return selected;
    }
  }

  async function openFile(file) {
    //check if file is already open
    for (let i = 0; i < openFiles.length; i++) {
      if (openFiles[i].path == file.path) {
        setCurrentOpenFile(i);
        return;
      }
    }

    setLoading(true);
    let fileContent = await invoke("readFile", { path: file.path });
    setOpenFiles((openFiles) => [
      ...openFiles,
      { path: file.path, content: fileContent, name: file.name },
    ]);
    setCurrentOpenFile(openFiles.length);
    setLoading(false);
  }

  function closeFile(index) {
    setLoading(true);

    let newOpenFiles = [...openFiles];
    newOpenFiles.splice(index, 1);

    if (newOpenFiles.length == 0) {
      setCurrentOpenFile(null);
      setOpenFiles(newOpenFiles);
    } else {
      setOpenFiles(newOpenFiles);
      setCurrentOpenFile(0);
    }

    setLoading(false);
  }

  return (
    <EditorContext.Provider
      value={{
        openFile,
        closeFile,
        openFiles,
        currentOpenFile,
        setCurrentOpenFile,
        setOpenFiles,
        loading,
        openFolder,
        currentPath,
        setCurrentPath,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export default EditorProvider;
