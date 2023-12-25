import FileItem from "./FileItem";
import FileOrDirectory from "./FileOrDirectory";
import { useState } from "react";

import { Button } from "@nextui-org/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

export default function DirectoryItem({ directory }) {
  const [open, setOpen] = useState(false);

  return (
    <li>
      <Button
        onClick={() => setOpen(!open)}
        onContextMenu={(e) => {
          e.preventDefault();
        }}
        size="sm"
        className="bg-background text-clip font-semibold"
        startContent={
          open ? (
            <FontAwesomeIcon icon={faChevronDown} />
          ) : (
            <FontAwesomeIcon icon={faChevronRight} />
          )
        }
      >
        {directory.name}
      </Button>
      <div className="ml-2">
        {open && (
          <ul>
            {directory.children.map((child) => (
              <FileOrDirectory key={child.path} item={child} />
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}
