import { useState, useContext, useEffect, useCallback, useRef } from "react";
import EditorContext from "./EditorContext";
import ErrorContext from "./ErrorContext";
import { invoke } from "@tauri-apps/api/tauri";
import FileOrDirectory from "./FileOrDirectory";
import { Button, ButtonGroup, Code } from "@nextui-org/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFile,
  faFolder,
  faPlus,
  faRotateRight,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { listen } from "@tauri-apps/api/event";
import { debounce } from "lodash";

export default function FolderStructure() {
  const { setError } = useContext(ErrorContext);
  const { openFolder, currentPath, setCurrentPath } = useContext(EditorContext);
  const [directory, setDirectory] = useState([]);
  const [readingDirectory, setReadingDirectory] = useState(false);

  const currentPathRef = useRef();
  currentPathRef.current = currentPath;

  async function readDirectory() {
    setReadingDirectory(true);
    try {
      let folder = await openFolder();
      if (folder != null) {
        setCurrentPath(folder);
        setDirectory(await invoke("readDirectory", { path: folder }));
      }
    } catch (e) {
      setError(e);
    }
    setReadingDirectory(false);
  }

  async function rereadDirecotry() {
    setReadingDirectory(true);
    try {
      setDirectory(
        await invoke("readDirectory", { path: currentPathRef.current })
      );
    } catch (e) {
      setError(e);
    }
    setReadingDirectory(false);
  }

  useEffect(() => {
    if (currentPath != null) rereadDirecotry();
  }, []);

  async function createNewFile() {
    try {
      await invoke("createFile", { path: currentPath + "/newFile.txt" });
    } catch (e) {
      setError(e);
    }
  }

  async function createNewFolder() {
    try {
      await invoke("createDirectory", { path: currentPath + "/newFolder" });
    } catch (e) {
      setError(e);
    }
  }

  const FolderMapper = ({ data }) => (
    <ul>
      {data.map((item) => (
        <FileOrDirectory key={item.path} item={item} />
      ))}
    </ul>
  );

  const debouncedReadDirectory = useCallback(
    debounce(() => {
      console.log("debounced");
      rereadDirecotry();
      //readDirectory();
    }, 2000),
    []
  );

  listen("file-changed", debouncedReadDirectory);

  if (currentPath == null) {
    return (
      <div className="flex justify-center items-center justify-items-center h-full ">
        <Button color="primary" onClick={readDirectory} size="sm">
          Open Folder
        </Button>
      </div>
    );
  }

  if (readingDirectory) {
    return (
      <div className="flex justify-center items-center justify-items-center h-full ">
        <Code>Loading</Code>
      </div>
    );
  }

  if (currentPath != null) {
    return (
      <>
        <ButtonGroup size="sm" className="bg-background">
          <Button isIconOnly variant="light" onClick={createNewFile}>
            <FontAwesomeIcon icon={faFile} />
          </Button>
          <Button isIconOnly variant="light" onClick={createNewFolder}>
            <FontAwesomeIcon icon={faFolder} />
          </Button>
          {/**
          <Button isIconOnly variant="light">
            <FontAwesomeIcon icon={faSearch} />
          </Button>
           */}

          <Button isIconOnly variant="light" onClick={rereadDirecotry}>
            <FontAwesomeIcon icon={faRotateRight} />
          </Button>
          <Button isIconOnly variant="light" onClick={readDirectory}>
            <FontAwesomeIcon icon={faPlus} />
          </Button>
        </ButtonGroup>
        <FolderMapper data={directory} />
      </>
    );
  }
}
