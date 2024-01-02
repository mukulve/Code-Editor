import { useList } from "@uidotdev/usehooks";
import { useState, useEffect, useContext } from "react";
import { Input, Button, ButtonGroup } from "@nextui-org/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk, faTrash } from "@fortawesome/free-solid-svg-icons";

import { invoke } from "@tauri-apps/api/tauri";

import EditorContext from "./EditorContext";

export default function KanbanBoard() {
  const { currentPath } = useContext(EditorContext);

  const [
    backlogs,
    {
      removeAt: removeAtBacklog,
      insertAt: insetAtBacklog,
      clear: clearBacklog,
    },
  ] = useList([]);

  const [
    todos,
    { removeAt: removeAtTodo, insertAt: insetAtTodo, clear: clearTodo },
  ] = useList([]);

  const [
    doings,
    { removeAt: removeAtDoing, insertAt: insetAtDoing, clear: clearDoing },
  ] = useList([]);
  const [
    dones,
    { removeAt: removeAtDone, insertAt: insetAtDone, clear: clearDone },
  ] = useList([]);

  const [newBacklog, setNewBacklog] = useState("");
  const [newTodo, setNewTodo] = useState("");
  const [newDoing, setNewDoing] = useState("");
  const [newDone, setNewDone] = useState("");

  async function checkIfKanbanExists() {
    let reuslt = await invoke("checkIfKanbanExists", {});
    return reuslt;
  }

  async function writeKanban() {
    let kandbanJson = {
      backlogs: backlogs.filter((x) => x != null && x != ""),
      todos: todos.filter((x) => x != null && x != ""),
      doings: doings.filter((x) => x != null && x != ""),
      dones: dones.filter((x) => x != null && x != ""),
    };

    await invoke("writeKanbanBoardToFile", {
      content: JSON.stringify(kandbanJson),
    });
  }

  async function readKanban() {
    console.log("Reading Kanban");
    let result = await invoke("readKanbanBoardFromFile", {});
    console.log(result);
    if (result) {
      let kanbanJson = JSON.parse(result);
      insetAtBacklog(0, ...kanbanJson.backlogs);
      insetAtTodo(0, ...kanbanJson.todos);
      insetAtDoing(0, ...kanbanJson.doings);
      insetAtDone(0, ...kanbanJson.dones);
    }
  }

  useEffect(() => {
    async function init() {
      let kanbanExists = await checkIfKanbanExists();
      if (kanbanExists) {
        await readKanban();
      }
    }
    init();
  }, [currentPath]);

  useEffect(() => {
    if (
      backlogs.length > 0 &&
      todos.length > 0 &&
      doings.length > 0 &&
      dones.length > 0
    ) {
      writeKanban();
    }
  }, [backlogs, todos, doings, dones]);

  async function clearKanban() {
    clearBacklog();
    clearTodo();
    clearDoing();
    clearDone();
  }

  return (
    <div>
      <ButtonGroup size="sm" className="bg-background">
        <Button isIconOnly variant="light" onClick={writeKanban}>
          <FontAwesomeIcon icon={faFloppyDisk} />
        </Button>
        <Button isIconOnly variant="light" onClick={clearKanban}>
          <FontAwesomeIcon icon={faTrash} />
        </Button>
      </ButtonGroup>
      <h1 className="text-clip font-semibold ">Backlog</h1>
      <Input
        size="sm"
        value={newBacklog}
        onValueChange={setNewBacklog}
        placeholder="Backlog Item"
        endContent={
          <Button size="sm" onClick={() => insetAtBacklog(0, newBacklog)}>
            Add
          </Button>
        }
      />
      <ul>
        {backlogs
          .filter((x) => x != null && x != "")
          .map((backlog, index) => (
            <li key={index} className="flex justify-between">
              {backlog}
              <Button
                isIconOnly
                onClick={() => removeAtBacklog(index)}
                color="light"
                size="sm"
              >
                <FontAwesomeIcon icon={faTrash} />
              </Button>
            </li>
          ))}
      </ul>
      <h1 className="text-clip font-semibold ">TODO</h1>
      <Input
        size="sm"
        value={newTodo}
        onValueChange={setNewTodo}
        placeholder="Todo Item "
        endContent={
          <Button size="sm" onClick={() => insetAtTodo(0, newTodo)}>
            Add
          </Button>
        }
      />
      <ul>
        {todos
          .filter((x) => x != null && x != "")
          .map((todo, index) => (
            <li key={index} className="flex justify-between">
              {todo}
              <Button
                isIconOnly
                onClick={() => removeAtTodo(index)}
                color="light"
                size="sm"
              >
                <FontAwesomeIcon icon={faTrash} />
              </Button>
            </li>
          ))}
      </ul>
      <h1 className="text-clip font-semibold ">Doing</h1>
      <Input
        size="sm"
        value={newDoing}
        onValueChange={setNewDoing}
        placeholder="Initial Commit"
        endContent={
          <Button size="sm" onClick={() => insetAtDoing(0, newDoing)}>
            Add
          </Button>
        }
      />
      <ul>
        {doings
          .filter((x) => x != null && x != "")
          .map((doing, index) => (
            <li key={index} className="flex justify-between">
              {doing}
              <Button
                isIconOnly
                onClick={() => removeAtDoing(index)}
                color="light"
                size="sm"
              >
                <FontAwesomeIcon icon={faTrash} />
              </Button>
            </li>
          ))}
      </ul>
      <h1 className="text-clip font-semibold ">Done</h1>
      <Input
        size="sm"
        value={newDone}
        onValueChange={setNewDone}
        placeholder="Initial Commit"
        endContent={
          <Button size="sm" onClick={() => insetAtDone(0, newDone)}>
            Add
          </Button>
        }
      />
      <ul>
        {dones
          .filter((x) => x != null && x != "")
          .map((done, index) => (
            <li key={index} className="flex justify-between">
              {done}
              <Button
                isIconOnly
                onClick={() => removeAtDone(index)}
                color="light"
                size="sm"
              >
                <FontAwesomeIcon icon={faTrash} />
              </Button>
            </li>
          ))}
      </ul>
    </div>
  );
}
