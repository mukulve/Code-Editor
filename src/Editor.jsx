import { useContext, useEffect, useRef } from "react";
import EditorContext from "./EditorContext";
import CodeEditor from "@uiw/react-textarea-code-editor";
import Terminal from "./Terminal";
import { Button, ButtonGroup } from "@nextui-org/react";
import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faPencilRuler } from "@fortawesome/free-solid-svg-icons";
import { Code } from "@nextui-org/react";
import { useElementSize } from "usehooks-ts";
import { invoke } from "@tauri-apps/api/tauri";
import { useDarkMode } from "usehooks-ts";

import LanguageIcon from "./LanguageIcon";

export default function Editor() {
  const { isDarkMode } = useDarkMode();

  const {
    closeFile,
    openFiles,
    currentOpenFile,
    setCurrentOpenFile,
    loading,
    currentPath,
  } = useContext(EditorContext);

  function updateFileContent(e) {
    openFiles[currentOpenFile].content = e.target.value;
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
      } else if ((event.ctrlKey || event.metaKey) && charCode === "\t") {
        event.preventDefault();
        setCurrentOpenFile(
          currentOpenFileRef.current + 1 >= openFilesRef.current.length
            ? 0
            : currentOpenFileRef.current + 1
        );
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const [buttonGroupRef, { height: buttonGroupH }] = useElementSize();
  const [breadCrumbsRef, { height: breadCrumbsH }] = useElementSize();

  if (currentPath == null) {
    return (
      <main className="relative flex flex-col gap-4 justify-center items-center justify-items-center h-screen w-full">
        <FontAwesomeIcon icon={faPencilRuler} className="text-4xl" />
        <Code>Open A Directory</Code>
        <Terminal />
      </main>
    );
  }

  if (loading) {
    return (
      <main className=" relative flex flex-col gap-4 justify-center items-center justify-items-center h-screen w-full">
        <FontAwesomeIcon icon={faPencilRuler} className="text-4xl" />
        <Code>Loading</Code>
        <Terminal />
      </main>
    );
  }

  if (currentOpenFile == null || openFiles.length == 0) {
    return (
      <main className=" relative flex flex-col gap-4 justify-center items-center justify-items-center h-screen w-full ">
        <FontAwesomeIcon icon={faPencilRuler} className="text-4xl" />
        <Code>No Open Files</Code>
        <Terminal />
      </main>
    );
  }

  return (
    <main className="w-full relative overflow-auto px-2">
      <div ref={buttonGroupRef} className="overflow-x-auto flex shrink-0">
        {openFiles.map((child, i) => (
          <Button
            size="sm"
            key={i}
            onClick={() => setCurrentOpenFile(i)}
            className="bg-background shrink-0 "
            endContent={
              <Button
                size="sm"
                isIconOnly
                className="bg-background"
                onClick={() => closeFile(i)}
              >
                <FontAwesomeIcon icon={faClose} />
              </Button>
            }
            startContent={<LanguageIcon language={child.path} />}
          >
            {child.name}
          </Button>
        ))}
      </div>
      <Breadcrumbs isDisabled ref={breadCrumbsRef} maxItems={2}>
        {openFiles[currentOpenFile].path
          .split(/[\/\\]/)
          .slice(1)
          .map((item, i) => (
            <BreadcrumbItem key={i}>{item}</BreadcrumbItem>
          ))}
      </Breadcrumbs>
      <div
        className="relative pb-[50vh] overflow-auto w-full"
        style={{
          height: `calc(100vh - ${breadCrumbsH + buttonGroupH}px)`,
          maxHeight: `calc(100vh - ${breadCrumbsH + buttonGroupH}px)`,
        }}
      >
        <CodeEditor
          padding={15}
          language={openFiles[currentOpenFile].path.split(".").pop()}
          className="bg-background text-base "
          data-color-mode={isDarkMode ? "dark" : "light"}
          value={openFiles[currentOpenFile].content}
          onInput={(e) => updateFileContent(e)}
        />
      </div>
      <Terminal />
    </main>
  );
}
