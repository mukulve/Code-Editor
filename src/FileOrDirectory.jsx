import DirectoryItem from "./DirectoryItem";
import FileItem from "./FileItem";

export default function FileOrDirectory({ item }) {
  return item.children ? (
    <DirectoryItem directory={item} />
  ) : (
    <FileItem file={item} />
  );
}
