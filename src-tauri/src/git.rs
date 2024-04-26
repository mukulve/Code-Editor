use crate::errors;

use git2::Repository;
use std::process::Command;

#[tauri::command]
pub fn git_init(path: String) -> Result<(), errors::Error> {
    let repo = Repository::init(path)?;
    repo.remotes()?;
    Ok(())
}

#[tauri::command]
pub fn git_add(path: String, file: String) -> Result<(), errors::Error> {
    todo!()
}

#[tauri::command]
pub fn git_commit(path: String, file: String) -> Result<(), errors::Error> {
    todo!()
}

#[tauri::command]
pub fn git_push(path: String, file: String) -> Result<(), errors::Error> {
    todo!()
}

#[tauri::command]
pub fn git_history(path: String) -> Result<Vec<String>, errors::Error> {
    let mut history = Vec::new();
    let repo = Repository::open(path)?;
    let mut revwalk = repo.revwalk()?;
    revwalk.push_head()?;
    revwalk.set_sorting(git2::Sort::TIME)?;
    for oid in revwalk {
        let oid = oid?;
        let commit = repo.find_commit(oid)?;
        let message = commit.message().unwrap_or("no message");
        history.push(format!("{}: {}", oid, message));
    }
    Ok(history)
}

#[tauri::command]
pub fn git_clone(url: String, path: String) -> Result<(), errors::Error> {
    let _repo = Repository::clone(url.as_str(), path.as_str())?;
    Ok(())
}

#[tauri::command]
pub fn does_git_exist() -> bool {
    Command::new("git").arg("--version").output().is_ok()
}

#[tauri::command]
pub fn is_git_repo(path: &str) -> bool {
    Repository::open(path).is_ok()
}
