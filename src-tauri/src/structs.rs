use std::{path::PathBuf, time::SystemTime};

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
    //#[serde(skip_serializing, skip_deserializing)]
    //watcher: Option<Box<dyn Watcher>>,
}
