import { useState, lazy, Suspense } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartGantt,
  faCodeBranch,
  faCopy,
  faGear,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";

import { Resizable } from "re-resizable";
const KanbanBoard = lazy(() => import("./KanbanBoard"));
import Editor from "./Editor";
const Settings = lazy(() => import("./Settings"));
const Git = lazy(() => import("./Git"));
const FolderSearch = lazy(() => import("./FolderSearch"));
const FolderStructure = lazy(() => import("./FolderStructure"));

function App() {
  const [asideCurrentTab, setAsideCurrentTab] = useState(0);

  return (
    <div className="flex gap-2">
      <Resizable
        defaultSize={{
          width: "15rem",
          height: "100vh",
        }}
        enable={{
          top: false,
          right: true,
          bottom: false,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false,
        }}
        minWidth={200}
        maxWidth={600}
        className="border-solid border-r border-text-foreground"
      >
        <aside className=" flex ">
          <div className="min-w-10 max-w-12 flex flex-col overflow-auto h-full gap-2">
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
          <div className="w-full overflow-y-auto overflow-x-hidden h-screen px-2">
            <Suspense fallback={<div></div>}>
              {asideCurrentTab === 0 && <FolderStructure />}
              {asideCurrentTab === 1 && <FolderSearch />}
              {asideCurrentTab === 2 && <Git />}
              {asideCurrentTab === 3 && <KanbanBoard />}
              {asideCurrentTab === 4 && <Settings />}
            </Suspense>
          </div>
        </aside>
      </Resizable>

      <Editor />
    </div>
  );
}

export default App;
