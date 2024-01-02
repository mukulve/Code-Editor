import { useState, useContext } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { Input, Button } from "@nextui-org/react";
export default function Git() {
  const [gitCloneUrl, setGitCloneUrl] = useState("");
  const [gitCommitMessage, setGitCommitMessage] = useState("");

  async function gitClone() {
    await invoke("gitClone", {
      src: gitCloneUrl,
    });
  }

  async function gitInit() {
    await invoke("gitInit", {});
  }

  async function gitCommit() {
    await invoke("gitCommit", { message: gitCommitMessage });
  }

  async function gitPush() {
    await invoke("gitPush", {});
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
