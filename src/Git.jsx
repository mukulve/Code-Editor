import GitHistory from "./GitHistory";
import { invoke } from "@tauri-apps/api/tauri";
import { useState, useContext, useEffect, useRef } from "react";
import EditorContext from "./EditorContext";

export default function Git() {
  const [gitCloneUrl, setGitCloneUrl] = useState("");
  const { currentDirectory } = useContext(EditorContext);

  const [doesGitExist, setDoesGitExist] = useState(false);
  const [isGitRepo, setIsGitRepo] = useState(false);

  async function doesGitExistFunction() {
    let git = await invoke("does_git_exist");
    setDoesGitExist(git);
  }

  async function isGitRepoFunction() {
    let git = await invoke("is_git_repo", { path: currentDirectory });
    setIsGitRepo(git);
  }

  async function gitInit() {
    await invoke("git_init", { path: currentDirectory });
  }

  async function gitClone() {
    await invoke("git_clone", {
      url: gitCloneUrl,
      path: currentDirectory,
    });
  }

  useEffect(() => {
    doesGitExistFunction();
    isGitRepoFunction();
  }, [currentDirectory]);

  if (doesGitExist == false) {
    return (
      <div className="menu  menu-xs w-full">
        <h1 className="menu-title">Git is not installed!</h1>
      </div>
    );
  } else if (isGitRepo == false) {
    return (
      <div className="menu  menu-xs w-full">
        <h1 className="menu-title">Not a git repository!</h1>
        <button className="btn btn-sm" onClick={gitInit}>
          Git Init
        </button>
        <div className="join">
          <input
            className="input input-sm join-item"
            placeholder="url"
            value={gitCloneUrl}
            onChange={(e) => setGitCloneUrl(e.target.value)}
          />
          <button
            className="btn btn-sm join-item btn-primary "
            onClick={gitClone}
          >
            Clone
          </button>
        </div>
      </div>
    );
  } else {
    return (
      <div className="menu  menu-xs w-full">
        <p className="menu-title">Git</p>
        <button className="btn btn-sm">Git Add</button>
        <button className="btn btn-sm"> Git Commit</button>
        <button className="btn btn-sm">Git Push</button>
        <GitHistory />
      </div>
    );
  }
}
