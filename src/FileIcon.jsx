import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFile,
  faImage,
  faLock,
  faDatabase,
} from "@fortawesome/free-solid-svg-icons";
import {
  faJs,
  faRust,
  faPython,
  faJava,
  faRProject,
  faPhp,
  faMarkdown,
  faGolang,
  faCss3,
  faHtml5,
  faReact,
  faVuejs,
  faAngular,
  faNodeJs,
  faNpm,
  faGit,
  faSwift,
  faLinux,
} from "@fortawesome/free-brands-svg-icons";
export default function FileIcon({ file }) {
  if (file.name.endsWith(".js")) {
    return <FontAwesomeIcon icon={faJs} />;
  } else if (file.name.endsWith(".json")) {
    return <FontAwesomeIcon icon={faJs} />;
  } else if (file.name.endsWith(".jsx")) {
    return <FontAwesomeIcon icon={faReact} />;
  } else if (file.name.endsWith(".ts")) {
    return <FontAwesomeIcon icon={faJs} />;
  } else if (file.name.endsWith(".tsx")) {
    return <FontAwesomeIcon icon={faReact} />;
  } else if (file.name.endsWith(".rs")) {
    return <FontAwesomeIcon icon={faRust} />;
  } else if (file.name.endsWith(".py")) {
    return <FontAwesomeIcon icon={faPython} />;
  } else if (file.name.endsWith(".java")) {
    return <FontAwesomeIcon icon={faJava} />;
  } else if (file.name.endsWith(".jar")) {
    return <FontAwesomeIcon icon={faJava} />;
  } else if (file.name.endsWith(".class")) {
    return <FontAwesomeIcon icon={faJava} />;
  } else if (file.name.endsWith(".r")) {
    return <FontAwesomeIcon icon={faRProject} />;
  } else if (file.name.endsWith(".php")) {
    return <FontAwesomeIcon icon={faPhp} />;
  } else if (file.name.endsWith(".md")) {
    return <FontAwesomeIcon icon={faMarkdown} />;
  } else if (file.name.endsWith(".go")) {
    return <FontAwesomeIcon icon={faGolang} />;
  } else if (file.name.endsWith(".css")) {
    return <FontAwesomeIcon icon={faCss3} />;
  } else if (file.name.endsWith(".html")) {
    return <FontAwesomeIcon icon={faHtml5} />;
  } else if (file.name.endsWith(".vue")) {
    return <FontAwesomeIcon icon={faVuejs} />;
  } else if (file.name.endsWith(".angular")) {
    return <FontAwesomeIcon icon={faAngular} />;
  } else if (file.name.endsWith(".node")) {
    return <FontAwesomeIcon icon={faNodeJs} />;
  } else if (file.name.endsWith(".npm")) {
    return <FontAwesomeIcon icon={faNpm} />;
  } else if (file.name.endsWith(".git")) {
    return <FontAwesomeIcon icon={faGit} />;
  } else if (file.name.endsWith(".gitignore")) {
    return <FontAwesomeIcon icon={faGit} />;
  } else if (file.name.endsWith(".swift")) {
    return <FontAwesomeIcon icon={faSwift} />;
  } else if (file.name.endsWith(".sh")) {
    return <FontAwesomeIcon icon={faLinux} />;
  } else if (file.name.endsWith(".lock")) {
    return <FontAwesomeIcon icon={faLock} />;
  } else if (
    file.name.endsWith(".sql") ||
    file.name.endsWith(".sqlite") ||
    file.name.endsWith(".db") ||
    file.name.endsWith(".mdb") ||
    file.name.endsWith(".accdb") ||
    file.name.endsWith(".dbf") ||
    file.name.endsWith(".ibd") ||
    file.name.endsWith(".myd") ||
    file.name.endsWith(".myi") ||
    file.name.endsWith(".frm") ||
    file.name.endsWith(".ldb") ||
    file.name.endsWith(".sdb")
  ) {
    return <FontAwesomeIcon icon={faDatabase} />;
  } else if (
    file.name.endsWith(".svg") ||
    file.name.endsWith(".png") ||
    file.name.endsWith(".jpg") ||
    file.name.endsWith(".gif") ||
    file.name.endsWith(".webp") ||
    file.name.endsWith(".ico") ||
    file.name.endsWith(".icns") ||
    file.name.endsWith(".bmp") ||
    file.name.endsWith(".jpeg") ||
    file.name.endsWith(".tif") ||
    file.name.endsWith(".tiff") ||
    file.name.endsWith(".psd")
  ) {
    return <FontAwesomeIcon icon={faImage} />;
  }

  return <FontAwesomeIcon icon={faFile} />;
}
