use std::{fs, path::PathBuf};

use notify::{Event, EventKind};
use rayon::iter::{ParallelBridge, ParallelIterator};
use ignore::Walk;

use crate::FILES_CACHE;

pub fn cache_files_in_directory(directory: PathBuf) {
    let entries = Walk::new(&directory)
        .into_iter()
        .par_bridge()
        .filter_map(|e| e.ok())
        .map(|e| {
            let path = e.path().as_os_str().to_string_lossy().into_owned();
            let content = fs::read_to_string(&path).unwrap_or_default();
            (path, content)
        })
        .collect::<Vec<(String, String)>>();

    let mut cache = FILES_CACHE.lock().unwrap();

    //clean out cache 
    let keys = cache.keys().cloned().collect::<Vec<String>>();
    for key in keys {
        if !entries.iter().any(|(path, _)| path == &key) {
            cache.remove(&key);
        }
    }

    // Insert or update changed files
    for (path, content) in entries {
        let key = path;

        match cache.get(&key) {
            Some(existing) if existing == &content => {
                // Skip unchanged file
            }
            _ => {
                cache.insert(key, content);
            }
        }
    }
}

pub fn update_cache_from_event(event: Event) {
    let mut cache = FILES_CACHE.lock().unwrap();

    for path in event.paths {
        let path_str = path.as_os_str().to_string_lossy().into_owned();

        match event.kind {
            EventKind::Modify(_) | EventKind::Create(_) => {
                if path.is_file() {
                    match fs::read_to_string(&path) {
                        Ok(content) => {
                            cache.insert(path_str, content);
                        }
                        Err(_) => {
                            cache.remove(&path_str);
                        }
                    }
                }
            }
            EventKind::Remove(_) => {
                cache.remove(&path_str);
            }
            _ => {
                
            }
        }
    }
}