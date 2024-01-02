import { useState, lazy, Suspense } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartGantt,
  faCodeBranch,
  faCopy,
  faGear,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";

import { listen } from "@tauri-apps/api/event";

const KanbanBoard = lazy(() => import("./KanbanBoard"));
import Editor from "./Editor";
const Settings = lazy(() => import("./Settings"));
const Git = lazy(() => import("./Git"));
const FolderSearch = lazy(() => import("./FolderSearch"));
const FolderStructure = lazy(() => import("./FolderStructure"));

function App() {
  const [asideCurrentTab, setAsideCurrentTab] = useState(0);

  listen("file-changed", (event) => {
    console.log(event.payload);
    //readDirectory();
  });

  return (
    <div className="flex gap-2">
      <aside className="min-w-60 w-60 flex h-screen">
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
            <FontAwesomeIcon icon={faChartGantt} />
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
          <Suspense fallback={<div></div>}>
            {asideCurrentTab === 0 && <FolderStructure />}
            {asideCurrentTab === 1 && <FolderSearch />}
            {asideCurrentTab === 2 && <Git />}
            {asideCurrentTab === 3 && <KanbanBoard />}
            {asideCurrentTab === 4 && <Settings />}
          </Suspense>
        </div>
      </aside>

      <Editor />
    </div>
  );
}

export default App;
