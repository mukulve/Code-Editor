import { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import FileIcon from "./FileIcon";
import EditorContext from "./EditorContext";

export default function FileTabs() {
  const { openFiles, setCurrentFile, currentFile, closeFile } =
    useContext(EditorContext);

  return (
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
            className={`btn btn-xs   ${currentFile == i ? "btn-primary" : ""}`}
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
  );
}
