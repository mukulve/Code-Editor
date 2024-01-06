import default_file from "./assets/default_file.svg";
import file_type_c from "./assets/file_type_c.svg";
import file_type_cpp from "./assets/file_type_cpp.svg";
import file_type_csharp from "./assets/file_type_csharp.svg";
import file_type_css from "./assets/file_type_css.svg";
import file_type_go from "./assets/file_type_go.svg";
import file_type_html from "./assets/file_type_html.svg";
import file_type_js_official from "./assets/file_type_js_official.svg";
import file_type_json from "./assets/file_type_json.svg";
import file_type_rust from "./assets/file_type_rust.svg";
import file_type_python from "./assets/file_type_python.svg";
import file_type_svg from "./assets/file_type_svg.svg";
import file_type_typescript from "./assets/file_type_typescript.svg";
import file_type_reactjs from "./assets/file_type_reactjs.svg";
import file_type_cheader from "./assets/file_type_cheader.svg";
import file_type_markdown from "./assets/file_type_markdown.svg";
import file_type_java from "./assets/file_type_java.svg";

export default function LanguageIcon({ language }) {
  let lang = language.split(".").pop();
  if (lang === "c")
    return <img src={file_type_c} className="inline-block w-4 h-4 mr-1" />;
  if (lang === "cpp")
    return <img src={file_type_cpp} className="inline-block w-4 h-4 mr-1" />;
  if (lang === "cs")
    return <img src={file_type_csharp} className="inline-block w-4 h-4 mr-1" />;
  if (lang === "css")
    return <img src={file_type_css} className="inline-block w-4 h-4 mr-1" />;
  if (lang === "go")
    return <img src={file_type_go} className="inline-block w-4 h-4 mr-1" />;
  if (lang === "html")
    return <img src={file_type_html} className="inline-block w-4 h-4 mr-1" />;
  if (lang === "js")
    return (
      <img src={file_type_js_official} className="inline-block w-4 h-4 mr-1" />
    );
  if (lang === "json")
    return <img src={file_type_json} className="inline-block w-4 h-4 mr-1" />;
  if (lang === "rs")
    return <img src={file_type_rust} className="inline-block w-4 h-4 mr-1" />;
  if (lang === "py")
    return <img src={file_type_python} className="inline-block w-4 h-4 mr-1" />;
  if (lang === "svg")
    return <img src={file_type_svg} className="inline-block w-4 h-4 mr-1" />;
  if (lang === "ts")
    return (
      <img src={file_type_typescript} className="inline-block w-4 h-4 mr-1" />
    );
  if (lang === "jsx")
    return (
      <img src={file_type_reactjs} className="inline-block w-4 h-4 mr-1" />
    );
  if (lang === "h")
    return (
      <img src={file_type_cheader} className="inline-block w-4 h-4 mr-1" />
    );
  if (lang === "md")
    return (
      <img src={file_type_markdown} className="inline-block w-4 h-4 mr-1" />
    );
  if (lang === "java")
    return <img src={file_type_java} className="inline-block w-4 h-4 mr-1" />;

  return <img src={default_file} className="inline-block w-4 h-4 mr-1" />;
}
