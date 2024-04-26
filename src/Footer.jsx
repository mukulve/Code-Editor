import { useContext } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTableColumns } from "@fortawesome/free-solid-svg-icons";

import EditorContext from "./EditorContext";

export default function Footer({ sidePanelHandler, currentPanel }) {
  const { openFiles, currentFile } = useContext(EditorContext);

  return (
    <footer className="flex justify-center p-2 bg-base-200 text-base-content ">
      <div className="w-full">
        <p>{openFiles[currentFile]?.path.split(/[\/\\]/).pop() || ""}</p>
      </div>
      <div className="grid justify-items-center w-full">
        <button
          className="btn btn-xs text-center "
          onClick={() => sidePanelHandler(!currentPanel)}
        >
          <FontAwesomeIcon icon={faTableColumns} />
        </button>
      </div>
      <div className="w-full ">
        <p className="w-full text-right"></p>
      </div>
    </footer>
  );
}
