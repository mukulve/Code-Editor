import { useState, useContext } from "react";
import EditorContext from "./EditorContext";
import { invoke } from "@tauri-apps/api/tauri";
import { Input, Button } from "@nextui-org/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import FileItem from "./FileItem";
export default function FolderSearch() {
  const { currentPath } = useContext(EditorContext);

  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  async function searchDirectoryForString() {
    setSearchResults(
      await invoke("searchDirectoryForString", {
        path: currentPath,
        term: searchTerm,
      })
    );
  }

  return (
    <>
      <Input
        size="sm"
        value={searchTerm}
        onValueChange={setSearchTerm}
        endContent={
          <Button size="sm" isIconOnly onClick={searchDirectoryForString}>
            <FontAwesomeIcon icon={faSearch} />
          </Button>
        }
      />
      <h1 className="text-clip font-semibold ">
        Found '{searchTerm}' in '{searchResults.length}' files
      </h1>
      <ul>
        {searchResults.map((item) => (
          <FileItem
            key={item.path}
            file={{ path: item, name: item.split(/[\/\\]/).pop() }}
          />
        ))}
      </ul>
    </>
  );
}
