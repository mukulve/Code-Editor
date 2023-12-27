import { useState, useContext } from "react";

import EditorContext from "./EditorContext";

import { invoke } from "@tauri-apps/api/tauri";

import FileOrDirectory from "./FileOrDirectory";
import Editor from "./Editor";

import { Button, ButtonGroup } from "@nextui-org/react";
import { Input } from "@nextui-org/react";
import { Divider } from "@nextui-org/react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCodeBranch,
  faCopy,
  faEye,
  faFile,
  faFolder,
  faGear,
  faPlus,
  faRotateRight,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";

import { listen } from "@tauri-apps/api/event";
import FileItem from "./FileItem";

function App() {
  const { openFolder, currentPath, setCurrentPath } = useContext(EditorContext);

  const [directory, setDirectory] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [asideCurrentTab, setAsideCurrentTab] = useState(0);

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

  async function searchDirectoryForString() {
    setSearchResults(
      await invoke("searchDirectoryForString", {
        path: currentPath,
        term: searchTerm,
      })
    );
  }

  async function createNewFile() {
    await invoke("createFile", { path: currentPath + "/newFile.txt" });
  }

  async function createNewFolder() {
    await invoke("createDirectory", { path: currentPath + "/newFolder" });
  }

  listen("file-changed", (event) => {
    console.log(event.payload);
    //readDirectory();
  });

  const FolderStructure = ({ data }) => (
    <ul>
      {data.map((item) => (
        <FileOrDirectory key={item.path} item={item} />
      ))}
    </ul>
  );

  return (
    <div className="flex gap-2">
      <aside className="min-w-52 w-52 flex h-screen">
        <div className="w-1/5 flex flex-col overflow-auto h-full gap-2">
          <button
            onClick={() => {
              setAsideCurrentTab(0);
            }}
          >
            <FontAwesomeIcon icon={faCopy} />
          </button>
          <button
            onClick={() => {
              setAsideCurrentTab(1);
            }}
          >
            <FontAwesomeIcon icon={faSearch} />
          </button>
          <button
            onClick={() => {
              setAsideCurrentTab(2);
            }}
          >
            <FontAwesomeIcon icon={faCodeBranch} />
          </button>
          <button
            onClick={() => {
              setAsideCurrentTab(3);
            }}
          >
            <FontAwesomeIcon icon={faEye} />
          </button>
          <button
            onClick={() => {
              setAsideCurrentTab(4);
            }}
          >
            <FontAwesomeIcon icon={faGear} />
          </button>
        </div>
        <div className="w-4/5 overflow-auto h-full ">
          {asideCurrentTab === 0 && (
            <>
              {currentPath == null && (
                <div className="flex justify-center items-center justify-items-center h-full ">
                  <Button color="primary" onClick={readDirectory} size="sm">
                    Open Folder
                  </Button>
                </div>
              )}
              {currentPath != null && (
                <>
                  <ButtonGroup size="sm" className="bg-background">
                    <Button isIconOnly variant="light" onClick={createNewFile}>
                      <FontAwesomeIcon icon={faFile} />
                    </Button>
                    <Button
                      isIconOnly
                      variant="light"
                      onClick={createNewFolder}
                    >
                      <FontAwesomeIcon icon={faFolder} />
                    </Button>
                    <Button isIconOnly variant="light">
                      <FontAwesomeIcon icon={faSearch} />
                    </Button>

                    <Button
                      isIconOnly
                      variant="light"
                      onClick={rereadDirecotry}
                    >
                      <FontAwesomeIcon icon={faRotateRight} />
                    </Button>
                    <Button isIconOnly variant="light" onClick={readDirectory}>
                      <FontAwesomeIcon icon={faPlus} />
                    </Button>
                  </ButtonGroup>
                  <FolderStructure data={directory} />
                </>
              )}
            </>
          )}
          {asideCurrentTab === 1 && (
            <>
              <Input
                size="sm"
                value={searchTerm}
                onValueChange={setSearchTerm}
                endContent={
                  <Button
                    size="sm"
                    isIconOnly
                    onClick={searchDirectoryForString}
                  >
                    <FontAwesomeIcon icon={faSearch} />
                  </Button>
                }
              />
              <h1 className="text-clip font-semibold ">
                Found '{searchTerm}' in '{searchResults.length}' files
              </h1>
              <ul>
                {searchResults.map((item) => (
                  <FileItem
                    key={item.path}
                    file={{ path: item, name: item.split("/").pop() }}
                  />
                ))}
              </ul>
            </>
          )}
          {asideCurrentTab === 2 && (
            <div className="flex flex-col  items-start">
              <Button
                size="sm"
                variant="light"
                className="text-clip font-semibold  "
              >
                Git Clone
              </Button>
              <Button
                size="sm"
                variant="light"
                className="text-clip font-semibold  "
              >
                Git Init
              </Button>
              <Button
                size="sm"
                variant="light"
                className="text-clip font-semibold  "
              >
                Git Commit
              </Button>
              <Button
                size="sm"
                variant="light"
                className="text-clip font-semibold  "
              >
                Git Push
              </Button>
              <Button
                size="sm"
                variant="light"
                className="text-clip font-semibold  "
              >
                Remove Git Repo
              </Button>
            </div>
          )}
          {asideCurrentTab === 3 && (
            <div>
              <h1 className="text-clip font-semibold ">Preview</h1>
            </div>
          )}
          {asideCurrentTab === 4 && (
            <div>
              <h1 className="text-clip font-semibold ">Settings</h1>
              <Divider className="my-4" />
              <h1>Made by Mukul with Tauri, Rust, React</h1>
            </div>
          )}
        </div>
      </aside>

      <Editor />
    </div>
  );
}

export default App;
