import { useState, useContext } from "react";

import EditorContext from "./EditorContext";

import { invoke } from "@tauri-apps/api/tauri";

import FileOrDirectory from "./FileOrDirectory";

import { Button, ButtonGroup } from "@nextui-org/react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFile,
  faFolder,
  faPlus,
  faRotateRight,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";

export default function FolderStructure() {
  const { openFolder, currentPath, setCurrentPath } = useContext(EditorContext);
  const [directory, setDirectory] = useState([]);

  async function readDirectory() {
    let folder = await openFolder();
    if (folder != null) {
      setCurrentPath(folder);
      setDirectory(await invoke("readDirectory", { path: folder }));
    }
  }

  async function rereadDirecotry() {
    setDirectory(await invoke("readDirectory", { path: currentPath }));
  }

  async function createNewFile() {
    await invoke("createFile", { path: currentPath + "/newFile.txt" });
  }

  async function createNewFolder() {
    await invoke("createDirectory", { path: currentPath + "/newFolder" });
  }

  const FolderMapper = ({ data }) => (
    <ul>
      {data.map((item) => (
        <FileOrDirectory key={item.path} item={item} />
      ))}
    </ul>
  );

  if (currentPath == null) {
    return (
      <div className="flex justify-center items-center justify-items-center h-full ">
        <Button color="primary" onClick={readDirectory} size="sm">
          Open Folder
        </Button>
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
          <Button isIconOnly variant="light">
            <FontAwesomeIcon icon={faSearch} />
          </Button>

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
