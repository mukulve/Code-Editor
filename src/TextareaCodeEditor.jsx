import { useEffect, useState, useContext, useRef } from "react";
import parse from "html-react-parser";
import EditorContext from "./EditorContext";
import { invoke } from "@tauri-apps/api/tauri";

export default function TextareaCodeEditor() {
  const { openFiles, currentFile, setOpenFiles } = useContext(EditorContext);
  const openFilesRef = useRef(openFiles);
  openFilesRef.current = openFiles;

  const currentFileRef = useRef(currentFile);
  currentFileRef.current = currentFile;

  const [codeArray, setCodeArray] = useState([]);
  const textareaRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    async function handleKeyDown(event) {
      const code = event.which || event.keyCode;
      let charCode = String.fromCharCode(code).toLowerCase();

      if ((event.ctrlKey || event.metaKey) && charCode === "s") {
        if (document.activeElement.tagName === "TEXTAREA") {
          event.preventDefault();
          let file = openFilesRef.current[currentFileRef.current];
          console.log(file);
          await invoke("write_to_file", {
            path: file.path,
            content: file.content,
          });
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  async function toArray() {
    return await invoke("highlight_code", {
      content: openFiles[currentFile]?.content || "",
    });
  }

  useEffect(() => {
    adjustTextareaHeight();
  }, [codeArray]);

  useEffect(() => {
    const fetchArray = async () => {
      const array = await toArray();
      setCodeArray(array);
    };

    fetchArray();
  }, [openFiles, currentFile]);

  function updateFileContent(e) {
    let newOpenFiles = [...openFiles];
    newOpenFiles[currentFile].content = e.target.value;
    setOpenFiles(newOpenFiles);
  }

  const adjustTextareaHeight = () => {
    let textarea = textareaRef.current;
    let editor = editorRef.current;

    if (textarea && editor) {
      textarea.style.height =
        "calc( " + editor.offsetHeight + "px" + " + 25vh)";
      textarea.style.width = editor.offsetWidth + "px";
    }
  };

  return (
    <div className="relative text-left p-0 overflow-auto text-base font-mono leading-relaxed w-full h-full">
      <textarea
        ref={textareaRef}
        wrap="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        autoCapitalize="off"
        placeholder="Please enter Code."
        className="outline-none resize m-0 border-0 bg-transparent whitespace-nowrap break-keep absolute top-0 left-0  h-fit w-full min-w-full p-0 min-h-20 opacity-60  text-base font-mono leading-relaxed overflow-hidden"
        value={openFiles[currentFile]?.content || ""}
        onChange={(e) => updateFileContent(e)}
        style={{
          WebkitTextFillColor: "transparent",
        }}
      ></textarea>
      <div className="m-0 border-0 bg-transparent p-0 whitespace-nowrap break-keep min-h-20 text-base font-mono leading-relaxed h-fit ">
        <pre className="m-0 p-0">
          <code ref={editorRef}>
            {parse(codeArray.join("\n"))}
            <span class="text-primary"></span>
            <span class="text-secondary"></span>
            <span class="text-accent"></span>
          </code>
        </pre>
      </div>
    </div>
  );
}
