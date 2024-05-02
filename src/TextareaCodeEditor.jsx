import { useEffect, useState, useContext, useRef } from "react";
import parse from "html-react-parser";
import EditorContext from "./EditorContext";
import { invoke } from "@tauri-apps/api/tauri";
import LazyLoad from "react-lazy-load";

export default function TextareaCodeEditor() {
  const { openFiles, currentFile, setOpenFiles } = useContext(EditorContext);
  const openFilesRef = useRef(openFiles);
  openFilesRef.current = openFiles;

  const currentFileRef = useRef(currentFile);
  currentFileRef.current = currentFile;

  const [codeArray, setCodeArray] = useState([]);
  const textareaRef = useRef(null);
  const editorRef = useRef(null);

  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    async function handleKeyDown(event) {
      const code = event.which || event.keyCode;
      let charCode = String.fromCharCode(code).toLowerCase();

      if ((event.ctrlKey || event.metaKey) && charCode === "s") {
        if (document.activeElement.tagName === "TEXTAREA") {
          event.preventDefault();
          let file = openFilesRef.current[currentFileRef.current];
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
    //getSuggestions();
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
      textarea.style.width = "calc( " + editor.offsetWidth + "px" + " + 25vw)";
    }
  };

  async function getSuggestions() {
    let text = textareaRef.current.value;
    let cursorPosition = textareaRef.current.selectionStart;
    let start = cursorPosition;
    let end = cursorPosition;
    while (start > 0 && text[start] !== " ") {
      start--;
    }

    while (end < text.length && text[end] !== " ") {
      end++;
    }

    let word = text.substring(start, end).trim().split(/\s+/)[0];

    let suggestions = await invoke("get_suggestions", {
      content: openFiles[currentFile]?.content || "",
      word: word,
    });

    setSuggestions(suggestions);
  }

  if (openFiles[currentFile]?.isBinary == true) {
    return (
      <h1 className="text-center  w-full h-full flex align-middle items-center justify-center">
        The file is not displayed in the text editor because it is either binary
        or uses an unsupported text encoding
      </h1>
    );
  }

  return (
    <div className="relative text-left p-0 overflow-auto text-base font-mono leading-relaxed w-full h-full flex ">
      <div className="w-10 flex-none h-full select-none">
        {codeArray.map((_, i) => (
          <LazyLoad height={26} key={i} once>
            <div>{i + 1}</div>
          </LazyLoad>
        ))}
      </div>
      <div>
        <textarea
          ref={textareaRef}
          wrap="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          autoCapitalize="off"
          placeholder="Please enter Code."
          className=" outline-none resize m-0 pl-10 border-0 bg-transparent whitespace-nowrap break-keep absolute top-0 left-0  h-fit w-full min-w-full p-0 min-h-20 opacity-60  text-base font-mono leading-relaxed overflow-hidden"
          value={openFiles[currentFile]?.content || ""}
          onChange={(e) => updateFileContent(e)}
          style={{
            WebkitTextFillColor: "transparent",
          }}
        ></textarea>
        <div className="m-0 border-0 bg-transparent p-0 whitespace-nowrap break-keep min-h-20 text-base font-mono leading-relaxed h-fit ">
          <pre className="m-0 p-0">
            <code ref={editorRef}>
              {codeArray.map((line, i) => (
                <div>
                  {line == "<span></span>" ? parse("&#8203;") : parse(line)}
                </div>
              ))}
              <span className="text-primary"></span>
              <span className="text-secondary"></span>
              <span className="text-accent"></span>
              <span className="text-accent underline"></span>
            </code>
          </pre>
        </div>
        <div className="absolute top-0 left-0 hidden">
          <p>Suggestions</p>
          {suggestions.map((suggestion, i) => (
            <div key={i}>{suggestion}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
