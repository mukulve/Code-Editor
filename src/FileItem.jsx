import { useContext, useState } from "react";
import EditorContext from "./EditorContext";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import { Input } from "@nextui-org/react";

import { useDarkMode } from "usehooks-ts";

import { invoke } from "@tauri-apps/api/tauri";

export default function FileItem({ file }) {
  const { isDarkMode, toggle, enable, disable } = useDarkMode();

  const { openFile, openFiles } = useContext(EditorContext);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [newName, setNewName] = useState(file.path);
  const [newPath, setNewPath] = useState(file.path);

  async function renameFile() {
    await invoke("renameOrMoveFileOrDirectory", {
      path: file.path,
      to: newName,
    });
    onOpenChange();
  }

  async function moveFile() {
    await invoke("renameOrMoveFileOrDirectory", {
      path: file.path,
      to: newPath,
    });
    onOpenChange();
  }

  async function deleteFile() {
    await invoke("removeFile", {
      path: file.path,
    });
    onOpenChange();
  }

  return (
    <>
      <li
        className="ml-4 text-clip  text-sm whitespace-nowrap"
        onClick={() => openFile(file)}
        onContextMenu={(e) => {
          onOpen();
          e.preventDefault();
        }}
      >
        {file.name}
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
                <h1 className="break-all">{file.path}</h1>
              </ModalHeader>
              <ModalBody>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  size="sm"
                  placeholder="New Name"
                  endContent={
                    <Button size="sm" onClick={renameFile}>
                      Rename
                    </Button>
                  }
                />
                <Input
                  value={newPath}
                  onChange={(e) => setNewPath(e.target.value)}
                  size="sm"
                  placeholder="New Path"
                  endContent={
                    <Button size="sm" onClick={moveFile}>
                      Move File
                    </Button>
                  }
                />
                <Button size="sm" onClick={deleteFile}>
                  Delete
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
