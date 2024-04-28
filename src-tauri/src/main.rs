// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod copilot;
mod editor;
mod errors;
mod git;
mod io;
mod logging;
mod terminal;

use crate::copilot::copilot;
use crate::editor::{get_suggestions, highlight_code};
use crate::git::{
    does_git_exist, git_add, git_clone, git_commit, git_history, git_init, git_push, is_git_repo,
};
use crate::io::{
    copy_file, create_directory, create_file, detect_changes, move_file_or_directory,
    read_directory, read_file, remove_directory, remove_file, search_directory, write_to_file,
};
use crate::terminal::run_command;
use lazy_static::lazy_static;
use std::sync::Mutex;
use tauri::Manager;

lazy_static! {
    pub static ref LOGS: Mutex<logging::Logs> = Mutex::new(logging::Logs { logs: Vec::new() });
    pub static ref APPHANDLE: Mutex<Option<tauri::AppHandle>> = Mutex::new(None);
}

fn emit_event(event: String, payload: String) -> Result<(), errors::Error> {
    let binding = APPHANDLE.lock().unwrap();
    let app = binding.as_ref().unwrap();
    app.emit_all(event.as_str(), payload.as_str())?;
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle();
            APPHANDLE.lock().unwrap().replace(app_handle.clone());
            detect_changes();
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            copy_file,
            create_directory,
            create_file,
            move_file_or_directory,
            read_directory,
            read_file,
            remove_directory,
            remove_file,
            search_directory,
            write_to_file,
            git_add,
            git_commit,
            git_history,
            git_init,
            git_push,
            highlight_code,
            run_command,
            get_suggestions,
            does_git_exist,
            is_git_repo,
            git_clone,
            copilot
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
