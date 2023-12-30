mod logging;

use std::collections::HashSet;
use std::io::Write;
use std::path::Path;
use std::sync::{Arc, Mutex};

use std::{fs, thread};

use rayon::prelude::*;

use ignore::Walk;

use cached::proc_macro::cached;
use tokio::task::block_in_place;

use notify::{RecursiveMode, Watcher};

use lazy_static::lazy_static;
use tauri::api::dir::read_dir;
use tauri::api::file::read_binary;
use tauri::Manager;
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#[cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

lazy_static! {
    static ref WORKINGDIR: Mutex<String> = Mutex::new(".".to_string());
    static ref LOGS: Mutex<logging::Logs> = Mutex::new(logging::Logs { logs: Vec::new() });
}

#[tauri::command]
fn readDirectory(path: String) -> Result<Vec<tauri::api::dir::DiskEntry>, String> {
    LOGS.lock().unwrap().addLog("Reading directory".to_string());

    *WORKINGDIR.lock().unwrap() = path.clone();
    Ok(read_dir(path, true).unwrap())
}

#[tauri::command]
fn readFile(path: String) -> Result<String, String> {
    LOGS.lock().unwrap().addLog("Reading file".to_string());

    let file = read_binary(path);
    let content = match file {
        Ok(lines) => String::from_utf8_lossy(&lines).to_string(),
        Err(_) => "".to_string(),
    };
    Ok(content)
}

#[cached]
#[tauri::command]
fn searchDirectoryForString(path: String, term: String) -> Result<HashSet<String>, String> {
    LOGS.lock()
        .unwrap()
        .addLog("Searching Directory".to_string());

    let result = Arc::new(Mutex::new(HashSet::new()));
    let file_paths: Vec<_> = Walk::new(path)
        .into_iter()
        .par_bridge()
        .filter_map(|entry| entry.ok())
        .filter(|entry| entry.path().is_file())
        .filter(|entry| entry.path().extension().is_some())
        .map(|entry| entry.path().to_owned())
        .collect();

    file_paths.par_iter().for_each(|path| {
        let file = read_binary(path);
        let content = match file {
            Ok(lines) => String::from_utf8_lossy(&lines).to_string(),
            Err(_) => "".to_string(),
        };

        if content.find(&term).is_some() {
            result
                .lock()
                .unwrap()
                .insert(path.to_str().unwrap().to_string());
        }
    });

    let x = Ok(result.lock().unwrap().clone());
    x
}

#[tauri::command]
fn gitClone(src: String) {
    LOGS.lock().unwrap().addLog("Running git clone".to_string());

    let output = std::process::Command::new("git")
        .current_dir(WORKINGDIR.lock().unwrap().clone())
        .arg("clone")
        .arg(src)
        .output()
        .expect("failed to execute process");
}

#[tauri::command]
fn gitInit() {
    LOGS.lock().unwrap().addLog("Running git init".to_string());

    let output = std::process::Command::new("git")
        .current_dir(WORKINGDIR.lock().unwrap().clone())
        .arg("init")
        .output()
        .expect("failed to execute process");
}

#[tauri::command]
fn gitCommit(message: String) {
    LOGS.lock()
        .unwrap()
        .addLog("Running git commit".to_string());

    let output = std::process::Command::new("git")
        .current_dir(WORKINGDIR.lock().unwrap().clone())
        .arg("commit")
        .arg("-m")
        .arg(message)
        .output()
        .expect("failed to execute process");
}

#[tauri::command]
fn gitPush() {
    LOGS.lock().unwrap().addLog("Running git push".to_string());

    let output = std::process::Command::new("git")
        .current_dir(WORKINGDIR.lock().unwrap().clone())
        .arg("push")
        .arg("-u")
        .arg("origin")
        .arg("master")
        .output()
        .expect("failed to execute process");
}

#[tauri::command]
fn runTerminalCommand(command: String) -> Result<String, String> {
    LOGS.lock()
        .unwrap()
        .addLog("Running Terminal Command".to_string());

    let output = std::process::Command::new(command)
        .current_dir(WORKINGDIR.lock().unwrap().clone())
        .output()
        .expect("failed to execute process");

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

#[tauri::command]
fn createDirectory(path: String) {
    LOGS.lock()
        .unwrap()
        .addLog("Creating directory".to_string());

    fs::create_dir(path).unwrap();
}

#[tauri::command]
fn createFile(path: String) {
    LOGS.lock().unwrap().addLog("Creating file".to_string());

    fs::File::create(path).unwrap();
}

#[tauri::command]
fn copyFile(path: String, to: String) {
    LOGS.lock().unwrap().addLog("Copying file".to_string());

    fs::copy(path, to).unwrap();
}

#[tauri::command]
fn renameOrMoveFileOrDirectory(path: String, to: String) {
    LOGS.lock()
        .unwrap()
        .addLog("Renaming / moving file or directory".to_string());

    fs::rename(path, to).unwrap();
}

#[tauri::command]
fn removeFile(path: String) {
    LOGS.lock().unwrap().addLog("Removing file".to_string());

    fs::remove_file(path).unwrap();
}

#[tauri::command]
fn removeDirectoryAndContents(path: String) {
    LOGS.lock()
        .unwrap()
        .addLog("Removing directory".to_string());

    fs::remove_dir_all(path).unwrap();
}

#[tauri::command]
fn writeToFile(path: String, content: String) {
    LOGS.lock().unwrap().addLog("Writing file".to_string());

    let mut file = fs::File::create(path).unwrap();
    file.write_all(content.as_bytes()).unwrap();
}

fn emitEvent(app: tauri::AppHandle, event: &str, payload: &str) {
    LOGS.lock()
        .unwrap()
        .addLog("Emitting tauri event".to_string());

    app.emit_all(event, payload).unwrap();
}

#[tauri::command]
fn checkIfKanbanExists() -> bool {
    LOGS.lock()
        .unwrap()
        .addLog("Checking if kanban exists".to_string());

    let path = WORKINGDIR.lock().unwrap().clone();
    Path::new(&(path + "/mveditor/kanbanBoard.json")).exists()
}

#[tauri::command]
fn writeKanbanBoardToFile(content: String) {
    LOGS.lock()
        .unwrap()
        .addLog("Writing kaban to file".to_string());

    let path = WORKINGDIR.lock().unwrap().clone();
    if checkIfKanbanExists() == false {
        fs::create_dir(&(path.clone() + "/mveditor/")).unwrap();
    }
    let mut file = fs::File::create(&(path + "/mveditor/kanbanBoard.json")).unwrap();
    file.write_all(content.as_bytes()).unwrap();
}

#[tauri::command]
fn readKanbanBoardFromFile() -> Result<String, String> {
    LOGS.lock().unwrap().addLog("Reading kaban".to_string());

    let path = WORKINGDIR.lock().unwrap().clone();
    let file = read_binary(&(path + "/mveditor/kanbanBoard.json"));
    let content = match file {
        Ok(lines) => String::from_utf8_lossy(&lines).to_string(),
        Err(_) => "".to_string(),
    };
    Ok(content)
}

//use notify to watch for changes in a directory
fn watchDirectory(app: tauri::AppHandle) {
    let mut watcher =
        notify::recommended_watcher(move |res: Result<notify::Event, notify::Error>| match res {
            Ok(event) => {
                if event.kind.is_create() || event.kind.is_remove() {
                    emitEvent(app.clone(), "file-changed", "file changed");
                }
            }
            Err(e) => println!("watch error: {:?}", e),
        })
        .unwrap();

    thread::spawn(move || {
        let path = WORKINGDIR.lock().unwrap().clone();
        watcher
            .watch(Path::new(&path), RecursiveMode::Recursive)
            .unwrap();

        block_in_place(|| loop {
            thread::park();
        });
    });
}

#[tauri::command]
fn getLogs() -> Vec<logging::Log> {
    LOGS.lock().unwrap().getLogs().to_vec()
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle();
            watchDirectory(app_handle);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            readDirectory,
            readFile,
            searchDirectoryForString,
            gitInit,
            gitCommit,
            gitPush,
            gitClone,
            createDirectory,
            createFile,
            renameOrMoveFileOrDirectory,
            removeFile,
            removeDirectoryAndContents,
            copyFile,
            writeToFile,
            runTerminalCommand,
            checkIfKanbanExists,
            writeKanbanBoardToFile,
            readKanbanBoardFromFile,
            getLogs
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
