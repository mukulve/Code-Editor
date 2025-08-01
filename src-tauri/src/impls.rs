use std::{fs, path::{Path, PathBuf}, thread, time::SystemTime};

use git2::{Repository, Status, StatusOptions};
use notify::{RecursiveMode, Watcher};
use rayon::iter::{ParallelBridge, ParallelIterator};
use tauri::Emitter;
use walkdir::WalkDir;

use crate::{cache::{cache_files_in_directory, update_cache_from_event}, errors::GlobalError, structs::{DirEntry, Editor, File, FileVersion, FileWatcher, Git, Terminal}, APP_HANDLE, FILES_CACHE};

impl DirEntry {
    pub fn new() -> DirEntry {
        DirEntry {
            name: String::new(),
            path: String::new(),
            is_dir: false,  
            children: None
        }
    }
}


impl FileVersion {
    fn new(content: String) -> FileVersion {
        FileVersion {
            content,
            timestamp: SystemTime::now(),
        }
    }
}

impl File {
    fn new(name: String, path: PathBuf, content: String) -> File {
        File {
            name,
            path,
            original_content: content.clone(),
            versions: vec![FileVersion::new(content)],
        }
    }

    fn add_version(&mut self, content: String) {
        self.versions.push(FileVersion::new(content));
    }
}

impl std::fmt::Debug for Editor {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Editor")
            .field("current_directory", &self.current_directory)
            .field("files_opened", &self.files_opened)
            .field("current_file", &self.current_file)
            .field("files", &self.files)
            .field("watcher", &"<watcher>")
            .finish()
    }
}

impl Clone for Editor {
    fn clone(&self) -> Self {
        Editor {
            current_directory: self.current_directory.clone(),
            files_opened: self.files_opened.clone(),
            folders_opened: self.folders_opened.clone(),
            current_file: self.current_file.clone(),
            files: self.files.clone(),
            watcher: None,
            git: None
        }
    }
}

impl Terminal {
    pub fn new() -> Terminal {
        Terminal {
            writer: None,
        }
    }
}

impl Editor {
    pub fn new() -> Editor {
        let editor = Editor {
            current_directory: std::env::current_dir().unwrap(),
            folders_opened: Vec::new(),
            files_opened: Vec::new(),
            current_file: None,
            files: Vec::new(),
            watcher: Some(FileWatcher::new(std::env::current_dir().unwrap())),
            git: Some(Git::new(std::env::current_dir().unwrap()))
        };

        return editor;
    }

    fn open_file(&mut self, file: File) {
        self.files_opened.push(file.clone());
        self.current_file = Some(file);
    }

    fn read_file<P: AsRef<Path>>(&self, path: P) -> std::io::Result<String> {
        let path = path.as_ref();
        fs::read_to_string(path)
    }

    fn save_current_file(&mut self, content: String) {
        if let Some(ref mut file) = self.current_file {
            file.add_version(content);
        }
    }

    pub fn change_directory(&mut self, path: String) {
        let path_buffer = PathBuf::from(path.clone());
        self.current_directory = path_buffer.clone();

        self.watcher.as_mut().unwrap().change_directory(path_buffer.clone());
        self.git.as_mut().unwrap().change_directory(path_buffer);
    }

    pub fn search_files_by_name(&mut self, query: String) -> Vec<File> {
        let cache = FILES_CACHE.lock().unwrap();

        let mut results: Vec<File> = Vec::new();

        for (key, value) in cache.iter() {
            if key.contains(&query) {
                let full_path = PathBuf::from(key);
                let stripped_path = full_path
                    .strip_prefix(&self.current_directory)
                    .unwrap_or(&full_path);

                results.push(File::new(
                    stripped_path.display().to_string(),
                    full_path,
                    value.clone(),
                ));
            }
        }            

        results
    }

    pub fn search_files(&mut self, query: String) -> Vec<File> {
        let cache = FILES_CACHE.lock().unwrap();

        let mut results: Vec<File> = Vec::new();

        for (key, value) in cache.iter() {
            if value.contains(&query) {
                let full_path = PathBuf::from(key);
                let stripped_path = full_path
                    .strip_prefix(&self.current_directory)
                    .unwrap_or(&full_path);

                results.push(File::new(
                    stripped_path.display().to_string(),
                    full_path,
                    value.clone(),
                ));
            }
        }            

        results
    }

    pub fn get_directory_tree<P: AsRef<Path>>(&mut self, path: P) -> std::io::Result<DirEntry> {
        let path = path.as_ref();
        let metadata = fs::metadata(path)?;

        let name = path
            .file_name()
            .map(|n| n.to_string_lossy().into_owned())
            .unwrap_or_else(|| path.to_string_lossy().into_owned());

        let is_dir = metadata.is_dir();
        let mut entry = DirEntry {
            name,
            path: path.to_string_lossy().into_owned(),
            is_dir,
            children: None,
        };

        if is_dir {
            let mut children = Vec::new();
            for entry in fs::read_dir(path)? {
                let entry = entry?;
                let child_path = entry.path();

                if let Ok(child) = self.get_directory_tree(&child_path) {
                    if child.name.starts_with('.') {
                        continue;
                    }
                    children.push(child);
                }
            }
            entry.children = Some(children);
        }

        Ok(entry)
    }

    pub fn get_git_changes(&mut self) -> Result<Vec<String>, GlobalError> {
        self.git.as_mut().unwrap().get_git_changes()
    }
}

impl Git { 
    pub fn new(initial_dir: PathBuf) -> Git {
        Git {
            current_directory: initial_dir
        }
    }

    pub fn change_directory(&mut self, new_path: PathBuf) {
        self.current_directory = new_path;
    }

    pub fn get_git_changes(&mut self) -> Result<Vec<String>, GlobalError> {
        let path = &self.current_directory;
        let repo = Repository::open(path)?;
        let mut status_opts = StatusOptions::new();
        status_opts.include_untracked(true).recurse_untracked_dirs(true);

        let statuses = repo.statuses(Some(&mut status_opts))?;
        let mut changed_files = Vec::new();

        for entry in statuses.iter() {
            let status = entry.status();
            if let Some(path) = entry.path() {
                // Filter only changed, staged, unstaged, untracked
                if status.contains(Status::WT_MODIFIED)
                    || status.contains(Status::WT_NEW)
                    || status.contains(Status::INDEX_MODIFIED)
                    || status.contains(Status::INDEX_NEW)
                    || status.contains(Status::WT_DELETED)
                    || status.contains(Status::INDEX_DELETED)
                {
                    changed_files.push(path.to_string());
                }
            }
        }

        Ok(changed_files)
    }
}

impl FileWatcher {
    pub fn new(initial_dir: PathBuf) -> Self {
        let mut fw = FileWatcher {
            watcher: None,
            current_directory: initial_dir,
        };
        fw.setup_watcher(); 
        fw
    }

    fn setup_watcher(&mut self) {
        if let Some(old_watcher) = self.watcher.take() {
            drop(old_watcher);
        }

        let dir = self.current_directory.clone();
        let dir_for_first_closure = dir.clone();

        thread::spawn(move || {
            cache_files_in_directory(dir_for_first_closure.clone());
        });

        let mut watcher = notify::recommended_watcher(
            move |res: Result<notify::Event, notify::Error>| match res {
                Ok(event) => {
                    
                    let app_guard = APP_HANDLE.lock().unwrap();
                    if let Some(app) = app_guard.as_ref() {
                        app.emit("directory-event", event.info()).unwrap();
                    }

                    thread::spawn(move || {
                        update_cache_from_event(event);
                    });
                },
                Err(e) => eprintln!("Error: {:?}", e),
            },
        )
        .expect("Failed to create watcher");

        watcher
            .watch(&dir, RecursiveMode::Recursive)
            .expect("Failed to start watching");

        self.watcher = Some(watcher);
    }

    pub fn change_directory(&mut self, new_path: PathBuf) {
        self.current_directory = new_path;
        self.setup_watcher();
    }
}
