import { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClose,
  faFileCirclePlus,
  faFolderOpen,
} from "@fortawesome/free-solid-svg-icons";
import FileIcon from "./FileIcon";
import EditorContext from "./EditorContext";
import TextareaCodeEditor from "./TextareaCodeEditor";

function Editor() {
  const {
    openFiles,
    setCurrentFile,
    currentFile,
    closeFile,
    currentDirectory,
  } = useContext(EditorContext);

  if (currentDirectory == null) {
    return (
      <main className="h-full w-full artboard">
        <div className="p-4 flex flex-col gap-4 justify-center items-center h-full w-full">
          <FontAwesomeIcon icon={faFolderOpen} className="text-9xl" />
          <h1 className=" font-bold">Open a folder to start editing files</h1>
        </div>
      </main>
    );
  }

  if (openFiles.length == 0) {
    return (
      <main className="h-full w-full artboard">
        <div className="p-4 flex flex-col gap-4 justify-center items-center h-full w-full">
          <FontAwesomeIcon icon={faFileCirclePlus} className="text-9xl" />
          <h1 className=" font-bold">Open a file to start editing</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="h-full w-full artboard">
      <div
        className="flex w-full overflow-x-auto overflow-y-hidden"
        style={{ height: "32px" }}
      >
        {openFiles.map((file, i) => (
          <button
            key={file.path}
            className={`btn btn-sm flex-none ${
              currentFile == i ? "btn-primary" : ""
            }`}
            onClick={() => setCurrentFile(i)}
          >
            <FileIcon file={file} />
            {file.name}
            <button
              className={`btn btn-xs   ${
                currentFile == i ? "btn-primary" : ""
              }`}
              onClick={(e) => {
                e.stopPropagation();
                closeFile(i);
              }}
            >
              <FontAwesomeIcon icon={faClose} />
            </button>
          </button>
        ))}
      </div>
      <div
        className="overflow-scroll w-full"
        style={{
          height: "calc(100dvh - 45px - 30px - 32px)",
        }}
      >
        <TextareaCodeEditor />
        {/*
        
        <div className="absolute top-0 bg-base-200">
          <p>Suggestions</p>
          <p>hello</p>
        </div>
        */}
      </div>
    </main>
  );
}

export default Editor;
