import { useContext, useState } from "react";
import { useClickAway } from "@uidotdev/usehooks";
import EditorContext from "./EditorContext";

export default function FileItem({ file }) {
  const { openFile, openFiles } = useContext(EditorContext);
  const [open, setOpen] = useState(false);
  const [event, setEvent] = useState({});

  const ref = useClickAway(() => {
    setOpen(false);
  });

  const handleOpenModal = () => {
    if (open === false) {
      setOpen(true);
    }
  };

  function getIcon(filename) {
    if (filename.endsWith(".js")) {
      return "devicon-javascript-plain colored";
    } else if (filename.endsWith(".py")) {
      return "devicon-python-plain colored";
    } else if (filename.endsWith(".html")) {
      return "devicon-html5-plain colored";
    } else if (filename.endsWith(".css")) {
      return "devicon-css3-plain colored";
    } else if (filename.endsWith(".java")) {
      return "devicon-java-plain colored";
    } else if (filename.endsWith(".php")) {
      return "devicon-php-plain colored";
    } else if (filename.endsWith(".c#")) {
      return "devicon-csharp-plain colored";
    } else if (filename.endsWith(".ruby")) {
      return "devicon-ruby-plain colored";
    } else if (filename.endsWith(".go")) {
      return "devicon-go-plain colored";
    } else if (filename.endsWith(".rs")) {
      return "devicon-rust-plain colored";
    } else if (filename.endsWith(".swift")) {
      return "devicon-swift-plain colored";
    } else if (filename.endsWith(".kotlin")) {
      return "devicon-kotlin-plain colored";
    } else if (filename.endsWith(".ts")) {
      return "devicon-typescript-plain colored";
    } else if (filename.endsWith(".sql")) {
      return "devicon-mysql-plain colored";
    } else if (filename.endsWith(".markdown")) {
      return "devicon-markdown-plain colored";
    } else if (filename.endsWith(".c")) {
      return "devicon-c-plain colored";
    } else if (filename.endsWith(".cpp")) {
      return "devicon-cplusplus-plain colored";
    } else {
      return "devicon-file-plain colored";
    }
  }
  const iconClass = getIcon(file.name);

  return (
    <>
      <li
        className="ml-4 text-clip  text-sm whitespace-nowrap"
        onClick={() => openFile(file)}
        onContextMenu={(e) => {
          //handleOpenModal();
          //console.log(e);
          //setEvent(e);
          e.preventDefault();
        }}
      >
        {/**
         * <i className={iconClass}></i>
         */}
        {file.name}
      </li>
      {open && (
        <div
          ref={ref}
          className={`absolute bg-background z-50 top-[${event.pageX}px] left-[${event.pageY}px]`}
        ></div>
      )}
    </>
  );
}
