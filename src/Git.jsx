import { useState, useContext } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { Input, Button } from "@nextui-org/react";
import ErrorContext from "./ErrorContext";

export default function Git() {
  const [gitCloneUrl, setGitCloneUrl] = useState("");
  const [gitCommitMessage, setGitCommitMessage] = useState("");
  const { setError } = useContext(ErrorContext);

  async function gitClone() {
    try {
      await invoke("gitClone", {
        src: gitCloneUrl,
      });
    } catch (e) {
      setError(e);
    }
  }

  async function gitInit() {
    try {
      await invoke("gitInit", {});
    } catch (e) {
      setError(e);
    }
  }

  async function gitCommit() {
    try {
      await invoke("gitCommit", { message: gitCommitMessage });
    } catch (e) {
      setError(e);
    }
  }

  async function gitPush() {
    try {
      await invoke("gitPush", {});
    } catch (e) {
      setError(e);
    }
  }

  return (
    <div className="flex flex-col  items-start gap-2">
      <Input
        size="sm"
        value={gitCloneUrl}
        onValueChange={setGitCloneUrl}
        placeholder="https://URL/USER/REPO.git"
        endContent={
          <Button size="sm" onClick={gitClone}>
            Clone
          </Button>
        }
      />

      <Input
        size="sm"
        value={gitCommitMessage}
        onValueChange={setGitCommitMessage}
        placeholder="Initial Commit"
        endContent={
          <Button size="sm" onClick={gitCommit}>
            Commit
          </Button>
        }
      />

      <Button
        size="sm"
        variant="light"
        className="text-clip font-semibold  "
        onClick={gitInit}
      >
        Git Init
      </Button>

      <Button
        size="sm"
        variant="light"
        className="text-clip font-semibold  "
        onClick={gitPush}
      >
        Git Push
      </Button>
    </div>
  );
}
