use crate::{emit_event, errors};
use cached::proc_macro::cached;
use ignore::Walk;
use lazy_static::lazy_static;
use memmap2::Mmap;
use notify_debouncer_full::{
    new_debouncer,
    notify::{RecursiveMode, Watcher},
    DebounceEventResult,
};
use rayon::iter::{ParallelBridge, ParallelIterator};
use std::{
    fs,
    io::Write,
    path::{Path, PathBuf},
    sync::{Arc, Mutex},
    time::Duration,
};
use tauri::api::dir::read_dir;

lazy_static! {
    static ref CURRENT_PATH: Arc<Mutex<String>> = Arc::new(Mutex::new(String::from(".")));
}

#[tauri::command]
pub fn read_directory(path: String) -> Result<Vec<tauri::api::dir::DiskEntry>, errors::Error> {
    emit_event("alert_event".to_string(), "Read Directory".to_string())?;
    *CURRENT_PATH.lock().unwrap() = path.clone();
    let mut dir = read_dir(path, true)?;
    dir.sort_by(|a, b| a.path.cmp(&b.path));
    Ok(dir)
}
#[derive(Clone, serde::Serialize)]
pub struct ReadFileStruct {
    path: String,
    content: String,
    is_binary: bool,
}

#[tauri::command]
pub fn read_file(path: String) -> Result<ReadFileStruct, errors::Error> {
    emit_event("alert_event".to_string(), "Read File".to_string())?;
    let file = std::fs::File::open(path.clone())?;
    let mmap = unsafe { Mmap::map(&file)? };

    let content = match String::from_utf8((&mmap).to_vec()) {
        Ok(content) => {
            return Ok(ReadFileStruct {
                path,
                content,
                is_binary: false,
            })
        }
        Err(_) => ReadFileStruct {
            path,
            content: String::from_utf8_lossy(&mmap).to_string(),
            is_binary: true,
        },
    };

    //let content = String::from_utf8_lossy(&mmap).to_string();
    Ok(content)
}

pub fn read_file_no_alert(path: String) -> Result<String, errors::Error> {
    let file = std::fs::File::open(path)?;
    let mmap = unsafe { Mmap::map(&file)? };
    let content = String::from_utf8_lossy(&mmap).to_string();
    Ok(content)
}

//We need this since tauri::api::dir::DiskEntry is non exhaustive
#[derive(Clone, serde::Serialize)]
pub struct SearchDirectoryStruct {
    pub path: PathBuf,
    pub name: Option<String>,
    pub children: Option<bool>,
}

#[tauri::command]
#[cached]
pub fn search_directory(path: String, query: String) -> Result<Vec<SearchDirectoryStruct>, ()> {
    emit_event("alert_event".to_string(), "Searching Directory".to_string()).unwrap();
    let results = Arc::new(Mutex::new(Vec::<SearchDirectoryStruct>::new()));

    Walk::new(path)
        .into_iter()
        .par_bridge()
        .filter_map(|e| e.ok())
        .filter(|e| e.path().is_file())
        .for_each(|entry| {
            let file_path = entry.path().to_str().unwrap().to_string();
            let content = read_file_no_alert(file_path.clone()).unwrap();
            if content.find(&query).is_some() {
                let tauri_struct = SearchDirectoryStruct {
                    path: entry.path().to_path_buf(),
                    name: entry.file_name().to_str().map(|s| s.to_string()),
                    children: None,
                };
                results.lock().unwrap().push(tauri_struct);
            }
        });

    let x = Ok(results.lock().unwrap().clone());
    x
}
pub fn detect_changes() {
    let debouncer = Arc::new(Mutex::new(
        new_debouncer(
            Duration::from_secs(5),
            None,
            |result: DebounceEventResult| match result {
                Ok(events) => events.iter().for_each(|event| {
                    emit_event(
                        "notify_event".to_string(),
                        event.event.info().unwrap_or("").to_string(),
                    )
                    .unwrap();
                }),
                Err(errors) => errors.iter().for_each(|error| println!("{error:?}")),
            },
        )
        .unwrap(),
    ));

    std::thread::spawn({
        let debouncer = Arc::clone(&debouncer);
        move || loop {
            let path = CURRENT_PATH.lock().unwrap().clone();
            let mut debouncer = debouncer.lock().unwrap();

            debouncer
                .watcher()
                .watch(Path::new(&path), RecursiveMode::Recursive)
                .unwrap();

            debouncer
                .cache()
                .add_root(Path::new(&path), RecursiveMode::Recursive);

            std::thread::sleep(Duration::from_secs(2));

            if path != *CURRENT_PATH.lock().unwrap() {
                emit_event("alert_event".to_string(), "Directory Changed".to_string()).unwrap();

                debouncer.cache().remove_root(Path::new(&path));
                debouncer.watcher().unwatch(Path::new(&path)).unwrap();
            }
        }
    });
}

#[tauri::command]
pub fn create_directory(path: String) -> Result<(), errors::Error> {
    emit_event("alert_event".to_string(), "Creating Directory".to_string())?;
    fs::create_dir(path)?;
    Ok(())
}

#[tauri::command]
pub fn create_file(path: String) -> Result<(), errors::Error> {
    emit_event("alert_event".to_string(), "Creating File".to_string())?;
    fs::File::create(path)?;
    Ok(())
}

#[tauri::command]
pub fn copy_file(path: String, to: String) -> Result<(), errors::Error> {
    emit_event("alert_event".to_string(), "Copying File".to_string())?;
    fs::copy(path, to)?;
    Ok(())
}

#[tauri::command]
pub fn move_file_or_directory(path: String, to: String) -> Result<(), errors::Error> {
    emit_event("alert_event".to_string(), "Renaming".to_string())?;
    fs::rename(path, to)?;
    Ok(())
}

#[tauri::command]
pub fn remove_file(path: String) -> Result<(), errors::Error> {
    emit_event("alert_event".to_string(), "Removing File".to_string())?;
    fs::remove_file(path)?;
    Ok(())
}

#[tauri::command]
pub fn remove_directory(path: String) -> Result<(), errors::Error> {
    emit_event("alert_event".to_string(), "Removing Directory".to_string())?;
    fs::remove_dir_all(path)?;
    Ok(())
}

#[tauri::command]
pub fn write_to_file(path: String, content: String) -> Result<(), errors::Error> {
    emit_event("alert_event".to_string(), "Writing File".to_string())?;
    let mut file = fs::File::create(path)?;
    file.write_all(content.as_bytes())?;
    Ok(())
}
