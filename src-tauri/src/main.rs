mod errors;
mod logging;
use cached::proc_macro::cached;
use ignore::Walk;
use lazy_static::lazy_static;
//use notify::{RecursiveMode, Watcher};
use notify_debouncer_mini::{
    new_debouncer,
    notify::{RecursiveMode, Watcher},
    DebounceEventResult,
};
use rayon::prelude::*;
use std::collections::HashSet;
use std::path::Path;
use std::process::Stdio;
use std::sync::{Arc, Mutex};
use std::{fs, thread};
use tauri::api::dir::read_dir;
use tauri::api::file::read_binary;
use tauri::Manager;
use tokio::io::{AsyncBufReadExt, AsyncReadExt, AsyncWriteExt, BufReader};
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#[cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

lazy_static! {
    static ref WORKINGDIR: Mutex<String> = Mutex::new(".".to_string());
    static ref LOGS: Mutex<logging::Logs> = Mutex::new(logging::Logs { logs: Vec::new() });
    static ref APPHANDLE: Mutex<Option<tauri::AppHandle>> = Mutex::new(None);
}

#[tauri::command]
fn readDirectory(path: String) -> Result<Vec<tauri::api::dir::DiskEntry>, errors::Error> {
    addLog("Reading directory");

    *WORKINGDIR.lock().unwrap() = path.clone();
    Ok(read_dir(path, true)?)
}

#[tauri::command]
async fn readFile(path: String) -> Result<String, errors::Error> {
    addLog("Reading file");

    let mut f = tokio::fs::File::open(path).await?;
    let mut buffer = Vec::new();

    // read the whole file
    f.read_to_end(&mut buffer).await?;
    Ok(String::from_utf8_lossy(&buffer).to_string())
}

#[cached]
#[tauri::command]
fn searchDirectoryForString(path: String, term: String) -> Result<HashSet<String>, String> {
    addLog("Searching Directory");

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
async fn gitClone(src: String) -> Result<(), errors::Error> {
    addLog("Running git clone");

    let path = WORKINGDIR.lock().unwrap().clone();
    tokio::process::Command::new("git")
        .current_dir(path)
        .arg("clone")
        .arg(src)
        .output()
        .await?;
    Ok(())
}

#[tauri::command]
async fn gitInit() -> Result<(), errors::Error> {
    addLog("Running git init");

    let path = WORKINGDIR.lock().unwrap().clone();
    tokio::process::Command::new("git")
        .current_dir(path)
        .arg("init")
        .output()
        .await?;
    Ok(())
}

#[tauri::command]
async fn gitCommit(message: String) -> Result<(), errors::Error> {
    addLog("Running git commit");

    let path = WORKINGDIR.lock().unwrap().clone();
    tokio::process::Command::new("git")
        .current_dir(path)
        .arg("commit")
        .arg("-m")
        .arg(message)
        .output()
        .await?;
    Ok(())
}

#[tauri::command]
async fn gitPush() -> Result<(), errors::Error> {
    addLog("Running git push");
    let path = WORKINGDIR.lock().unwrap().clone();
    tokio::process::Command::new("git")
        .current_dir(path)
        .arg("push")
        .arg("-u")
        .arg("origin")
        .arg("master")
        .output()
        .await?;
    Ok(())
}

#[tauri::command]
async fn runTerminalCommand(command: String) -> Result<String, errors::Error> {
    addLog("Running Terminal Command");

    let mut output = String::new();
    let mut args: Vec<_> = command.split_whitespace().collect();
    let cmdMain = args.remove(0).to_string();
    let path = WORKINGDIR.lock().unwrap().clone();
    let mut cmd = tokio::process::Command::new(cmdMain);
    cmd.current_dir(path);
    cmd.args(args);
    cmd.stdout(Stdio::piped());
    let mut child = cmd.spawn()?;
    let stdout = child.stdout.take().unwrap();
    let mut reader = BufReader::new(stdout).lines();

    while let Some(line) = reader.next_line().await? {
        output.push_str(&(line + "\n"));
    }

    Ok(output)
}

#[tauri::command]
fn createDirectory(path: String) -> Result<(), errors::Error> {
    addLog("Creating directory");

    fs::create_dir(path)?;
    Ok(())
}

#[tauri::command]
fn createFile(path: String) -> Result<(), errors::Error> {
    addLog("Creating file");

    fs::File::create(path)?;
    Ok(())
}

#[tauri::command]
fn copyFile(path: String, to: String) -> Result<(), errors::Error> {
    addLog("Copying file");

    fs::copy(path, to)?;
    Ok(())
}

#[tauri::command]
fn renameOrMoveFileOrDirectory(path: String, to: String) -> Result<(), errors::Error> {
    addLog("Renaming / moving file or directory");

    fs::rename(path, to)?;
    Ok(())
}

#[tauri::command]
fn removeFile(path: String) -> Result<(), errors::Error> {
    addLog("Removing file");

    fs::remove_file(path)?;
    Ok(())
}

#[tauri::command]
fn removeDirectoryAndContents(path: String) -> Result<(), errors::Error> {
    addLog("Removing directory");

    fs::remove_dir_all(path)?;
    Ok(())
}

#[tauri::command]
async fn writeToFile(path: String, content: String) -> Result<(), errors::Error> {
    addLog("Writing file");

    let mut file = tokio::fs::File::create(path).await?;
    file.write_all(content.as_bytes()).await?;
    Ok(())
}

fn emitEvent(app: tauri::AppHandle, event: &str, payload: &str) -> Result<(), errors::Error> {
    addLog("Emitting tauri event");

    app.emit_all(event, payload)?;
    Ok(())
}

#[tauri::command]
fn checkIfKanbanExists() -> bool {
    addLog("Checking if kanban exists");

    let path = WORKINGDIR.lock().unwrap().clone();
    Path::new(&(path + "/mveditor/kanbanBoard.json")).exists()
}

#[tauri::command]
async fn writeKanbanBoardToFile(content: String) -> Result<(), errors::Error> {
    addLog("Writing kaban to file");

    let path = WORKINGDIR.lock().unwrap().clone();
    if checkIfKanbanExists() == false {
        fs::create_dir(&(path.clone() + "/mveditor/"))?;
    }
    writeToFile(path + "/mveditor/kanbanBoard.json", content).await?;
    Ok(())
}

#[tauri::command]
async fn readKanbanBoardFromFile() -> Result<String, errors::Error> {
    addLog("Reading kaban");

    let path = WORKINGDIR.lock().unwrap().clone();
    let content = readFile(path + "/mveditor/kanbanBoard.json").await?;
    Ok(content)
}

//use notify to watch for changes in a directory
fn watchDirectory(app: tauri::AppHandle) {
    addLog("Watching directory for changes");

    let mut debouncer = new_debouncer(
        std::time::Duration::from_secs(2),
        move |res: DebounceEventResult| match res {
            Ok(events) => events
                .iter()
                .for_each(|e| emitEvent(app.clone(), "file-changed", "file changed").unwrap()),
            Err(e) => println!("Error {:?}", e),
        },
    )
    .unwrap();

    thread::spawn(move || loop {
        let path = WORKINGDIR.lock().unwrap().clone();
        debouncer
            .watcher()
            .watch(Path::new(&path), RecursiveMode::Recursive)
            .unwrap();

        thread::sleep(std::time::Duration::from_secs(1));
        debouncer.watcher().unwatch(Path::new(&path)).unwrap_or(());
    });
}

#[tauri::command]
fn getLogs() -> Vec<logging::Log> {
    LOGS.lock().unwrap().getLogs().to_vec()
}

fn addLog(log: &str) {
    LOGS.lock().unwrap().addLog(log.to_string());
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle();
            APPHANDLE.lock().unwrap().replace(app_handle.clone());
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
