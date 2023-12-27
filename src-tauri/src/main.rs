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
}

#[derive(Default)]
struct EditorState {
    path: Mutex<String>,
    folderStrucutre: Mutex<Vec<tauri::api::dir::DiskEntry>>,
    globalSearchResults: Mutex<HashSet<String>>,
    globalSearchResultsTerm: Mutex<String>,
    isDirectory: Mutex<bool>,
    isFile: Mutex<bool>,
}

/*

#[derive(Default)]
struct MyState {
    s: std::sync::Mutex<String>,
    t: std::sync::Mutex<Vec<tauri::api::dir::DiskEntry>>,
}
// remember to call `.manage(MyState::default())`

fn ...( state: tauri::State<'_, MyState>)
*/
#[tauri::command]
fn setWorkingDirectory(path: String, state: tauri::State<'_, EditorState>) {
    *state.path.lock().unwrap() = path;
}

#[tauri::command]
fn readDirectory(path: String) -> Result<Vec<tauri::api::dir::DiskEntry>, String> {
    *WORKINGDIR.lock().unwrap() = path.clone();
    Ok(read_dir(path, true).unwrap())
}

#[tauri::command]
fn readFile(path: String) -> Result<String, String> {
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
    let output = std::process::Command::new("git")
        .arg("clone")
        .arg(src)
        .output()
        .expect("failed to execute process");
}

#[tauri::command]
fn gitInit() {
    let output = std::process::Command::new("git")
        .arg("init")
        .output()
        .expect("failed to execute process");
}

#[tauri::command]
fn gitCommit(message: String) {
    let output = std::process::Command::new("git")
        .arg("commit")
        .arg("-m")
        .arg(message)
        .output()
        .expect("failed to execute process");
}

#[tauri::command]
fn gitPush() {
    let output = std::process::Command::new("git")
        .arg("push")
        .arg("-u")
        .arg("origin")
        .arg("master")
        .output()
        .expect("failed to execute process");
}

#[tauri::command]
fn runTerminalCommand(command: String, path: String) -> Result<String, String> {
    let output = std::process::Command::new(command)
        .current_dir(path)
        .output()
        .expect("failed to execute process");

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

#[tauri::command]
fn createDirectory(path: String) {
    fs::create_dir(path).unwrap();
}

#[tauri::command]
fn createFile(path: String) {
    fs::File::create(path).unwrap();
}

#[tauri::command]
fn copyFile(path: String, to: String) {
    fs::copy(path, to).unwrap();
}

#[tauri::command]
fn renameOrMoveFileOrDirectory(path: String, to: String) {
    fs::rename(path, to).unwrap();
}

#[tauri::command]
fn removeFile(path: String) {
    fs::remove_file(path).unwrap();
}

#[tauri::command]
fn removeDirectoryAndContents(path: String) {
    fs::remove_dir_all(path).unwrap();
}

#[tauri::command]
fn writeToFile(path: String, content: String) {
    let mut file = fs::File::create(path).unwrap();
    file.write_all(content.as_bytes()).unwrap();
}

fn emitEvent(app: tauri::AppHandle, event: &str, payload: &str) {
    app.emit_all(event, payload).unwrap();
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

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle();
            watchDirectory(app_handle);
            Ok(())
        })
        .manage(EditorState::default())
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
            setWorkingDirectory,
            runTerminalCommand
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
