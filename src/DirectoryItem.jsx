import FileOrDirectory from "./FileOrDirectory";
import { useState } from "react";

import { Button } from "@nextui-org/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";

import { Input } from "@nextui-org/react";

import { invoke } from "@tauri-apps/api/tauri";
import { useDarkMode } from "usehooks-ts";

import { useContext } from "react";
import ErrorContext from "./ErrorContext";

import default_folder from "./assets/default_folder.svg";
import default_folder_opened from "./assets/default_folder_opened.svg";

export default function DirectoryItem({ directory }) {
  const { setError } = useContext(ErrorContext);

  const { isDarkMode, toggle, enable, disable } = useDarkMode();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [open, setOpen] = useState(false);

  const [newName, setNewName] = useState(directory.path);
  const [newPath, setNewPath] = useState(directory.path);

  async function renameDirectory() {
    try {
      await invoke("renameOrMoveFileOrDirectory", {
        path: directory.path,
        to: newName,
      });
      onOpenChange();
    } catch (e) {
      setError(e);
    }
  }

  async function moveDirectory() {
    try {
      await invoke("renameOrMoveFileOrDirectory", {
        path: directory.path,
        to: newPath,
      });
      onOpenChange();
    } catch (e) {
      setError(e);
    }
  }

  async function deleteDirectory() {
    try {
      await invoke("removeDirectoryAndContents", {
        path: directory.path,
      });
      onOpenChange();
    } catch (e) {
      setError(e);
    }
  }

  return (
    <>
      <li>
        <Button
          disableRipple
          disableAnimation
          onClick={() => setOpen(!open)}
          onContextMenu={(e) => {
            onOpen();
            e.preventDefault();
          }}
          size="sm"
          className="bg-background text-clip font-semibold overflow-clip"
          startContent={
            open ? (
              <>
                <FontAwesomeIcon icon={faChevronDown} />
                <img
                  src={default_folder_opened}
                  className="inline-block w-4 h-4"
                />
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faChevronRight} />
                <img src={default_folder} className="inline-block w-4 h-4" />
              </>
            )
          }
        >
          {directory.name}
        </Button>
        <div className="ml-4">
          {open && (
            <ul>
              {directory.children.map((child) => (
                <FileOrDirectory key={child.path} item={child} />
              ))}
            </ul>
          )}
        </div>
      </li>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        classNames={{
          body: `${
            isDarkMode ? "dark" : ""
          } bg-background text-foreground flex flex-col gap-10 justify-center items-center`,
          base: `${isDarkMode ? "dark" : ""} bg-background text-foreground`,
          header: `${isDarkMode ? "dark" : ""} bg-background text-foreground`,
          footer: `${isDarkMode ? "dark" : ""} bg-background text-foreground`,
          closeButton: `${
            isDarkMode ? "dark" : ""
          } bg-background text-foreground`,
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h1 className="break-all">{directory.path}</h1>
              </ModalHeader>
              <ModalBody>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  size="sm"
                  placeholder="New Name"
                  endContent={
                    <Button size="sm" onClick={renameDirectory}>
                      Rename Directory
                    </Button>
                  }
                />
                <Input
                  value={newPath}
                  onChange={(e) => setNewPath(e.target.value)}
                  size="sm"
                  placeholder="New Path"
                  endContent={
                    <Button size="sm" onClick={moveDirectory}>
                      Move Directory
                    </Button>
                  }
                />
                <Button size="sm" onClick={deleteDirectory}>
                  Delete Directory And Contents
                </Button>
              </ModalBody>
              <ModalFooter></ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
