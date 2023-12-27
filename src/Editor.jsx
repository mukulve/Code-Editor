import { useContext, useEffect, useRef } from "react";

import EditorContext from "./EditorContext";

import CodeEditor from "@uiw/react-textarea-code-editor";

import Terminal from "./Terminal";

import { Button, ButtonGroup } from "@nextui-org/react";
import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { Code } from "@nextui-org/react";

import { invoke } from "@tauri-apps/api/tauri";

export default function Editor() {
  const {
    closeFile,
    openFiles,
    currentOpenFile,
    setCurrentOpenFile,
    setOpenFiles,
    loading,
    currentPath,
  } = useContext(EditorContext);

  function updateFileContent(e) {
    //let newArr = [...openFiles];
    openFiles[currentOpenFile].content = e.target.value;
    //setOpenFiles(newArr);
    //console.log(newArr);
  }

  const openFilesRef = useRef();
  openFilesRef.current = openFiles;

  const currentOpenFileRef = useRef();
  currentOpenFileRef.current = currentOpenFile;

  useEffect(() => {
    async function handleKeyDown(event) {
      const code = event.which || event.keyCode;

      let charCode = String.fromCharCode(code).toLowerCase();

      if ((event.ctrlKey || event.metaKey) && charCode === "s") {
        event.preventDefault();
        await invoke("writeToFile", {
          path: openFilesRef.current[currentOpenFileRef.current].path,
          content: openFilesRef.current[currentOpenFileRef.current].content,
        });
        console.log(
          "saved" + openFilesRef.current[currentOpenFileRef.current].content
        );
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (currentPath == null) {
    return (
      <main className="flex justify-center items-center justify-items-center h-screen w-full">
        <Code>Open A Directory</Code>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="flex justify-center items-center justify-items-center h-screen w-full">
        <Code>Loading</Code>
      </main>
    );
  }

  if (currentOpenFile == null || openFiles.length == 0) {
    return (
      <main className="flex justify-center items-center justify-items-center h-screen w-full ">
        <Code>No Open Files</Code>
      </main>
    );
  }

  return (
    <main className="w-full relative ">
      <ButtonGroup size="sm" className="bg-background">
        {openFiles.map((child, i) => (
          <Button
            key={i}
            onClick={() => setCurrentOpenFile(i)}
            className="bg-background"
            endContent={
              <Button
                isIconOnly
                className="bg-background"
                onClick={() => closeFile(i)}
              >
                <FontAwesomeIcon icon={faClose} />
              </Button>
            }
          >
            {child.name}
          </Button>
        ))}
      </ButtonGroup>
      <Breadcrumbs isDisabled>
        {openFiles[currentOpenFile].path
          .split("/")
          .slice(1)
          .map((item, i) => (
            <BreadcrumbItem key={i}>{item}</BreadcrumbItem>
          ))}
      </Breadcrumbs>
      <div
        className="pb-32"
        style={{
          height: "calc(100vh - 65px)",
          maxHeight: "calc(100vh - 65px)",
          overflow: "auto",
        }}
      >
        <CodeEditor
          padding={15}
          language={openFiles[currentOpenFile].path.split(".").pop()}
          className="bg-background text-base"
          data-color-mode="light"
          value={openFiles[currentOpenFile].content}
          onInput={(e) => updateFileContent(e)}
        />
      </div>
      <Terminal />
    </main>
  );
}
