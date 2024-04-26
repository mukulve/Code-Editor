import { useContext, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileCirclePlus,
  faFolderOpen,
} from "@fortawesome/free-solid-svg-icons";
import EditorContext from "./EditorContext";
import TextareaCodeEditor from "./TextareaCodeEditor";
import Terminal from "./Terminal";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import FileTabs from "./FileTabs";

export default function Editor() {
  const [assetUrl, setAssetUrl] = useState(null);
  const { openFiles, currentFile, currentDirectory } =
    useContext(EditorContext);

  const imagePreviewExtensions = [
    "jpg",
    "jpeg",
    "jfif",
    "pjpeg",
    "pjp",
    "ico",
    "cur",
    "gif",
    "apng",
    "png",
    "svg",
  ];
  const pdfPreviewExtensions = ["pdf"];
  const videoPreviewExtensions = ["mp4", "webm", "ogg"];

  async function openFile() {
    if (openFiles.length == 0) {
      return;
    }
    let path = openFiles[currentFile].path;
    const assetUrl = convertFileSrc(path);
    setAssetUrl(assetUrl);
  }

  useEffect(() => {
    openFile();
  }, [openFiles, currentFile]);

  if (currentDirectory == null) {
    return (
      <main className="h-full w-full artboard">
        <div className="p-4 flex flex-col gap-4 justify-center items-center h-full w-full">
          <FontAwesomeIcon icon={faFolderOpen} className="text-9xl" />
          <h1 className=" font-bold">Open a folder to start editing files</h1>
        </div>
      </main>
    );
  } else if (openFiles.length == 0) {
    return (
      <main className="h-full w-full artboard">
        <div className="p-4 flex flex-col gap-4 justify-center items-center h-full w-full">
          <FontAwesomeIcon icon={faFileCirclePlus} className="text-9xl" />
          <h1 className=" font-bold">Open a file to start editing</h1>
        </div>
      </main>
    );
  } else if (
    imagePreviewExtensions.includes(openFiles[currentFile].extension)
  ) {
    return (
      <main className="h-full w-full artboard">
        <FileTabs />
        <div
          className="overflow-scroll w-full relative pb-40 "
          style={{
            height: "calc(100dvh - 45px - 30px - 32px)",
          }}
        >
          <img
            src={assetUrl}
            alt={openFiles[currentFile].name}
            className="h-full w-full object-contain"
          />
          <Terminal />
        </div>
      </main>
    );
  } else if (pdfPreviewExtensions.includes(openFiles[currentFile].extension)) {
    return (
      <main className="h-full w-full artboard">
        <FileTabs />
        <div
          className="overflow-scroll w-full relative pb-40 "
          style={{
            height: "calc(100dvh - 45px - 30px - 32px)",
          }}
        >
          <embed
            src={assetUrl}
            type="application/pdf"
            className="h-full w-full object-contain"
          />
          <Terminal />
        </div>
      </main>
    );
  } else if (
    videoPreviewExtensions.includes(openFiles[currentFile].extension)
  ) {
    return (
      <main className="h-full w-full artboard">
        <FileTabs />
        <div
          className="overflow-scroll w-full relative pb-40 "
          style={{
            height: "calc(100dvh - 45px - 30px - 32px)",
          }}
        >
          <video
            src={assetUrl}
            controls
            className="h-full w-full object-contain"
          ></video>
          <Terminal />
        </div>
      </main>
    );
  } else {
    return (
      <main className="h-full w-full artboard">
        <FileTabs />
        <div
          className="overflow-scroll w-full relative pb-40 "
          style={{
            height: "calc(100dvh - 45px - 30px - 32px)",
          }}
        >
          <TextareaCodeEditor />
          <Terminal />
        </div>
      </main>
    );
  }
}
