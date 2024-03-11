use crate::errors;

use std::process::Command;

#[tauri::command]
pub fn git_init(path: String) -> Result<(), errors::Error> {
    todo!()
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
pub fn git_history(path: String) -> Result<String, errors::Error> {
    let history = Command::new("git")
        .current_dir(path)
        .arg("log")
        .arg("--pretty=format:\"%s\"")
        .output()?;

    let output = String::from_utf8_lossy(&history.stdout).to_string();

    Ok(output)
}
