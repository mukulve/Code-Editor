import { Image } from "@nextui-org/react";

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
import file_type_git from "./assets/file_type_git.svg";
import file_type_image from "./assets/file_type_image.svg";
import file_type_ruby from "./assets/file_type_ruby.svg";
import file_type_toml from "./assets/file_type_toml.svg";
import file_type_yaml from "./assets/file_type_yaml.svg";
import file_type_xml from "./assets/file_type_xml.svg";
import file_type_binary from "./assets/file_type_binary.svg";

export default function LanguageIcon({ language }) {
  let lang = language.split(".").pop();
  if (lang === "c")
    return (
      <Image
        removeWrapper
        radius={"none"}
        width={16}
        height={16}
        src={file_type_c}
        className="inline-block mr-1"
      />
    );
  else if (lang === "cpp")
    return (
      <Image
        removeWrapper
        radius={"none"}
        width={16}
        height={16}
        src={file_type_cpp}
        className="inline-block mr-1"
      />
    );
  else if (lang === "cs")
    return (
      <Image
        removeWrapper
        radius={"none"}
        width={16}
        height={16}
        src={file_type_csharp}
        className="inline-block mr-1"
      />
    );
  else if (lang === "css")
    return (
      <Image
        removeWrapper
        radius={"none"}
        width={16}
        height={16}
        src={file_type_css}
        className="inline-block mr-1"
      />
    );
  else if (lang === "go")
    return (
      <Image
        removeWrapper
        radius={"none"}
        width={16}
        height={16}
        src={file_type_go}
        className="inline-block mr-1"
      />
    );
  else if (lang === "html")
    return (
      <Image
        removeWrapper
        radius={"none"}
        width={16}
        height={16}
        src={file_type_html}
        className="inline-block mr-1"
      />
    );
  else if (lang === "js")
    return (
      <Image
        removeWrapper
        radius={"none"}
        width={16}
        height={16}
        src={file_type_js_official}
        className="inline-block mr-1"
      />
    );
  else if (lang === "json")
    return (
      <Image
        removeWrapper
        radius={"none"}
        width={16}
        height={16}
        src={file_type_json}
        className="inline-block mr-1"
      />
    );
  else if (lang === "rs")
    return (
      <Image
        removeWrapper
        radius={"none"}
        width={16}
        height={16}
        src={file_type_rust}
        className="inline-block mr-1"
      />
    );
  else if (lang === "py")
    return (
      <Image
        removeWrapper
        radius={"none"}
        width={16}
        height={16}
        src={file_type_python}
        className="inline-block mr-1"
      />
    );
  else if (lang === "svg")
    return (
      <Image
        removeWrapper
        radius={"none"}
        width={16}
        height={16}
        src={file_type_svg}
        className="inline-block mr-1"
      />
    );
  else if (lang === "ts")
    return (
      <Image
        removeWrapper
        radius={"none"}
        width={16}
        height={16}
        src={file_type_typescript}
        className="inline-block mr-1"
      />
    );
  else if (lang === "jsx")
    return (
      <Image
        removeWrapper
        radius={"none"}
        width={16}
        height={16}
        src={file_type_reactjs}
        className="inline-block mr-1"
      />
    );
  else if (lang === "h")
    return (
      <Image
        removeWrapper
        radius={"none"}
        width={16}
        height={16}
        src={file_type_cheader}
        className="inline-block mr-1"
      />
    );
  else if (lang === "md")
    return (
      <Image
        removeWrapper
        radius={"none"}
        width={16}
        height={16}
        src={file_type_markdown}
        className="inline-block mr-1"
      />
    );
  else if (lang === "java")
    return (
      <Image
        removeWrapper
        radius={"none"}
        width={16}
        height={16}
        src={file_type_java}
        className="inline-block mr-1"
      />
    );
  else if (lang === "gitignore")
    return (
      <Image
        removeWrapper
        radius={"none"}
        width={16}
        height={16}
        src={file_type_git}
        className="inline-block mr-1"
      />
    );
  else if (
    lang === "png" ||
    lang === "jpg" ||
    lang === "jpeg" ||
    lang === "gelse if" ||
    lang === "webp" ||
    lang == "ico"
  )
    return (
      <Image
        removeWrapper
        radius={"none"}
        width={16}
        height={16}
        src={file_type_image}
        className="inline-block mr-1"
      />
    );
  else if (lang === "rb")
    return (
      <Image
        removeWrapper
        radius={"none"}
        width={16}
        height={16}
        src={file_type_ruby}
        className="inline-block mr-1"
      />
    );
  else if (lang === "toml")
    return (
      <Image
        removeWrapper
        radius={"none"}
        width={16}
        height={16}
        src={file_type_toml}
        className="inline-block mr-1"
      />
    );
  else if (lang === "yaml")
    return (
      <Image
        removeWrapper
        radius={"none"}
        width={16}
        height={16}
        src={file_type_yaml}
        className="inline-block mr-1"
      />
    );
  else if (lang === "xml")
    return (
      <Image
        removeWrapper
        radius={"none"}
        width={16}
        height={16}
        src={file_type_xml}
        className="inline-block mr-1"
      />
    );
  else if (lang === "bin" || lang === "exe" || lang === "dll")
    return (
      <Image
        removeWrapper
        radius={"none"}
        width={16}
        height={16}
        src={file_type_binary}
        className="inline-block mr-1"
      />
    );

  return (
    <Image
      removeWrapper
      radius={"none"}
      width={16}
      height={16}
      src={default_file}
      className="inline-block mr-1"
    />
  );
}
