use std::{fmt::Write, path::PathBuf, sync::{Arc, Mutex}, time::SystemTime};

use notify::RecommendedWatcher;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileVersion {
    pub content: String,
    pub timestamp: SystemTime,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct File {
    pub name: String,
    pub path: PathBuf,
    pub original_content: String,
    pub versions: Vec<FileVersion>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DirEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub children: Option<Vec<DirEntry>>,
}

#[derive(Serialize, Deserialize)]
pub struct Editor {
    pub current_directory: PathBuf,
    pub files_opened: Vec<File>,
    pub folders_opened: Vec<PathBuf>,
    pub current_file: Option<File>,
    pub files: Vec<File>,
    #[serde(skip_serializing, skip_deserializing)]
    pub watcher:  Option<FileWatcher>,
    #[serde(skip_serializing, skip_deserializing)]
    pub git:  Option<Git>,
}

pub struct Git {
    pub current_directory: PathBuf
}

pub struct FileWatcher {
    pub watcher: Option<RecommendedWatcher>,
    pub current_directory: PathBuf,
}

impl Default for FileWatcher {
    fn default() -> Self {
        FileWatcher {
            watcher: None,
            current_directory: PathBuf::new(),
        }
    }
}


pub struct Terminal {
    pub writer: Option<Arc<Mutex<Box<dyn std::io::Write + Send + 'static>>>>,
    // other fields...
}