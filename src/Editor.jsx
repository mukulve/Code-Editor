import { useContext, useEffect, useRef } from "react";
import EditorContext from "./EditorContext";
import CodeEditor from "@uiw/react-textarea-code-editor";
import Terminal from "./Terminal";
import { Button, ButtonGroup } from "@nextui-org/react";
import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { Code } from "@nextui-org/react";
import { useElementSize } from "usehooks-ts";
import { invoke } from "@tauri-apps/api/tauri";
import { useDarkMode } from "usehooks-ts";

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

  const [buttonGroupRef, { height: buttonGroupH }] = useElementSize();
  const [breadCrumbsRef, { height: breadCrumbsH }] = useElementSize();

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
    <main className="w-full relative overflow-auto">
      <ButtonGroup
        ref={buttonGroupRef}
        size="sm"
        className="bg-background overflow-x-auto max-w-full"
      >
        {openFiles.map((child, i) => (
          <Button
            key={i}
            onClick={() => setCurrentOpenFile(i)}
            className="bg-background shrink-0 "
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
      <Breadcrumbs isDisabled ref={breadCrumbsRef}>
        {openFiles[currentOpenFile].path
          .split("/")
          .slice(1)
          .map((item, i) => (
            <BreadcrumbItem key={i}>{item}</BreadcrumbItem>
          ))}
      </Breadcrumbs>
      <div
        className="relative pb-32 overflow-auto w-full"
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
