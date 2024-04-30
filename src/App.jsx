import { invoke } from "@tauri-apps/api/tauri";
import { useState, useContext, useEffect, useRef } from "react";
import FileOrDirectory from "./FileOrDirectory";
import { themeChange } from "theme-change";
import CustomWindow from "./CustomWindow";
import SideTabs from "./SideTabs";
import Footer from "./Footer";
import ThemeDialog from "./ThemeDialog";
import Editor from "./Editor";
import NewFile from "./NewFile";
import NewDirectory from "./NewDirectory";
import InfiniteScroll from "react-infinite-scroller";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFile,
  faFolder,
  faRotateRight,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { listen } from "@tauri-apps/api/event";
import Git from "./Git";
import { debounce } from "lodash";

import EditorContext from "./EditorContext";
import Copilot from "./Copilot";

function App() {
  const { currentDirectory, OpenFolder } = useContext(EditorContext);

  const [directoryItems, setDirectoryItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [sidePanel, setSidePanel] = useState(true);

  const currentDirectoryRef = useRef();
  currentDirectoryRef.current = currentDirectory;

  async function readDirectory() {
    console.log("Reading directory");
    if (currentDirectoryRef.current == null) return;

    try {
      let folder = currentDirectoryRef.current;
      setDirectoryItems(await invoke("read_directory", { path: folder }));
    } catch {
      OpenFolder();
    }
  }

  async function searchDirectory() {
    if (currentDirectoryRef.current == null) return;
    let folder = currentDirectoryRef.current;
    setSearchResults(
      await invoke("search_directory", { path: folder, query: searchTerm })
    );
  }

  useEffect(() => {
    readDirectory();
  }, [currentDirectory]);

  useEffect(() => {
    const debouncedReadDirectory = debounce(readDirectory, 2000);

    const unlisten = listen("notify_event", () => {
      debouncedReadDirectory();
    });

    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  useEffect(() => {
    themeChange(false);
  }, []);

  return (
    <>
      <CustomWindow />

      <div
        className="flex mt-[30px] bg-base-200"
        style={{ height: "calc(100vh - 40px - 30px)" }}
      >
        <SideTabs tabHandler={setCurrentTab} />
        <aside
          className={`overflow-auto bg-base-200 flex-none ${
            sidePanel == false ? "w-0" : "w-56 max-w-56"
          }`}
        >
          {currentDirectory == null && (
            <div className="p-4 flex justify-center items-center h-full w-full">
              <button className="btn btn-xs" onClick={OpenFolder}>
                Open Folder
              </button>
            </div>
          )}

          {currentDirectory != null && currentTab == 0 && (
            <ul className="menu menu-xs bg-base-200 w-full ">
              <li className="menu-title flex flex-row justify-between items-center">
                <p>Explorer</p>
                <div>
                  <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-xs">
                      <FontAwesomeIcon icon={faFile} />
                    </div>
                    <ul
                      tabIndex={0}
                      className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                    >
                      <li>
                        <NewFile />
                      </li>
                    </ul>
                  </div>

                  <div className="dropdown dropdown-end ">
                    <div tabIndex={0} role="button" className="btn btn-xs">
                      <FontAwesomeIcon icon={faFolder} />
                    </div>
                    <ul
                      tabIndex={0}
                      className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                    >
                      <li>
                        <NewDirectory />
                      </li>
                    </ul>
                  </div>

                  <button className="btn btn-xs" onClick={OpenFolder}>
                    <FontAwesomeIcon icon={faRotateRight} />
                  </button>
                </div>
              </li>
              <InfiniteScroll
                loader={
                  <div className="loader" key={"loader"}>
                    Loading ...
                  </div>
                }
              >
                {directoryItems.map((item) => (
                  <FileOrDirectory key={item.path} item={item} />
                ))}
              </InfiniteScroll>
            </ul>
          )}

          {currentDirectory != null && currentTab == 1 && (
            <ul className="menu menu-xs  ">
              <li className="menu-title flex flex-row justify-between items-center">
                <p>Search</p>
                <div className="flex">
                  <input
                    type="text"
                    className="input input-bordered w-full input-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => searchDirectory()}
                  >
                    <FontAwesomeIcon icon={faSearch} className="text-lg" />
                  </button>
                </div>
              </li>
              <InfiniteScroll
                loader={
                  <div className="loader" key={"loader"}>
                    Loading ...
                  </div>
                }
              >
                {searchResults.map((item) => (
                  <FileOrDirectory key={item.path} item={item} />
                ))}
              </InfiniteScroll>
            </ul>
          )}

          {currentDirectory != null && currentTab == 2 && <Git />}

          {currentDirectory != null && currentTab == 3 && (
            <div className="menu  menu-xs h-full flex flex-col justify-between">
              <p className="menu-title">Settings</p>
              <footer className=" flex flex-col justify-center items-center gap-2">
                <p className="font-bold">Code Editor</p>
                <div className="grid grid-flow-col gap-2"></div>
              </footer>
            </div>
          )}

          {currentDirectory != null && currentTab == 4 && <Copilot />}
        </aside>
        <div className="flex-initial w-full overflow-hidden">
          <Editor />
        </div>
      </div>

      <Footer sidePanelHandler={setSidePanel} currentPanel={sidePanel} />
      <ThemeDialog />
    </>
  );
}

export default App;
