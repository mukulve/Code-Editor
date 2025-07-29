mod helper;
mod structs;

use crate::helper::{calculate_edit, collect, escape_html, get_language_object, sanitize_class};
use crate::structs::{DirEntry, Editor, File, FileVersion};
use cached::proc_macro::{cached, once};
use lazy_static::lazy_static;
use notify::{RecursiveMode, Watcher};
use rayon::prelude::*;
use std::collections::HashMap;
use std::fs::{self};
use std::io::Read;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use std::time::SystemTime;
use tauri::menu::MenuBuilder;
use tree_sitter::{Parser, Tree};
use walkdir::WalkDir;

lazy_static! {
    static ref PARSERS: Mutex<HashMap<String, Parser>> = Mutex::new(HashMap::new());
    static ref TREES: Mutex<HashMap<String, Tree>> = Mutex::new(HashMap::new());
    static ref FILE_CONTENTS: Mutex<HashMap<String, String>> = Mutex::new(HashMap::new());
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
            //watcher: None,
        }
    }
}

impl Editor {
    fn new() -> Editor {
        let mut editor = Editor {
            current_directory: std::env::current_dir().unwrap(),
            folders_opened: Vec::new(),
            files_opened: Vec::new(),
            current_file: None,
            files: Vec::new(),
            // watcher: None,
        };

        //editor.setup_watcher();
        return editor;
    }

    fn setup_watcher(&mut self) {
        let watcher = notify::recommended_watcher(
            move |res: Result<notify::Event, notify::Error>| match res {
                Ok(event) => {
                    println!("Event: {:?}", event)
                }
                Err(e) => eprintln!("Error: {:?}", e),
            },
        )
        .unwrap();

        let mut boxed_watcher = Box::new(watcher);
        boxed_watcher
            .watch(&self.current_directory, RecursiveMode::Recursive)
            .unwrap();
        //self.watcher = Some(boxed_watcher);
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

    fn change_directory(&mut self, path: String) {
        self.current_directory = PathBuf::from(path);
        //self.setup_watcher();
    }

    fn search_files_by_name(&mut self, query: String) -> Vec<File> {
        let current_directory = self.current_directory.clone();

        WalkDir::new(&current_directory)
            .into_iter()
            .par_bridge()
            .filter_map(|e| e.ok())
            .map(|e| {
                let path = e.path().to_path_buf();
                let file_name = e
                    .path()
                    .file_name()
                    .map(|n| n.to_string_lossy().into_owned())
                    .unwrap();
                (path, file_name)
            })
            .filter(|e| e.1.contains(&query))
            .map(|e| {
                File::new(
                    e.0.file_name()
                        .map(|n| n.to_string_lossy().into_owned())
                        .unwrap_or_else(|| String::from("")),
                    e.0.to_path_buf(),
                    String::new(),
                )
            })
            .collect::<Vec<File>>()
    }

    fn search_files(&mut self, query: String) -> Vec<File> {
        let current_directory = self.current_directory.clone();

        WalkDir::new(&current_directory)
            .into_iter()
            .par_bridge()
            .filter_map(|e| e.ok())
            .map(|e| {
                let path = e.path();
                let content = fs::read_to_string(&path).unwrap_or_default();
                (e, content)
            })
            .filter(|e| e.1.contains(&query))
            .map(|e| {
                File::new(
                    e.0.file_name().to_string_lossy().into_owned(),
                    e.0.path().to_path_buf(),
                    String::new(),
                )
            })
            .collect::<Vec<File>>()
    }

    fn get_directory_tree<P: AsRef<Path>>(&mut self, path: P) -> std::io::Result<DirEntry> {
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
}

#[tauri::command]
#[cached]
fn highlight_ast(code: String, language: String, path: String) -> Vec<(usize, usize, String)> {
    let mut parsers = PARSERS.lock().unwrap();
    let mut trees = TREES.lock().unwrap();
    let mut file_contents = FILE_CONTENTS.lock().unwrap();

    if !parsers.contains_key(&language) {
        let mut parser = Parser::new();
        let lang = get_language_object(&language);
        parser.set_language(&lang).unwrap();
        parsers.insert(language.clone(), parser);
    }

    let old_code = file_contents.get(&path).cloned().unwrap_or_default();

    let old_tree_opt = trees.get_mut(&path);
    if let Some(tree) = old_tree_opt {
        if let Some(edit) = calculate_edit(&old_code, &code) {
            tree.edit(&edit);
        }
    }

    let parser = parsers.get_mut(&language).unwrap();
    let old_tree_ref = trees.get(&path);
    let new_tree = parser.parse(&code, old_tree_ref.map(|t| t));

    if let Some(tree) = new_tree {
        trees.insert(path.clone(), tree.clone());
        file_contents.insert(path.clone(), code.clone());
        let mut results = vec![];
        collect(tree.root_node(), &code, &mut results);
        return results;
    }

    return vec![];
}

#[tauri::command]
#[cached]
fn highlight_html(
    code: String,
    language: String,
    matches: Vec<usize>,
    query_len: usize,
    path: String,
) -> String {
    if code.is_empty() {
        return String::new();
    }

    if code.len() > 1000000 {
        return escape_html(&code).replace("\n\n", "\n<span class=\"empty-line\"> </span>\n");
    }

    let spans = highlight_ast(code.clone(), language, path);

    let mut html = String::new();
    let mut last_index = 0;

    let match_set: std::collections::HashSet<(usize, usize)> =
        matches.into_iter().map(|m| (m, m + query_len)).collect();

    for (start, end, kind) in spans {
        if start > last_index {
            let plain = &code[last_index..start];
            html.push_str(&escape_html(plain));
        }

        let raw = &code[start..end];
        let escaped = escape_html(raw);
        let is_match = match_set.contains(&(start, end));
        let class = sanitize_class(&kind);

        if is_match {
            html.push_str(&format!(
                r#"<span class="token {} find-match">{}</span>"#,
                class, escaped
            ));
        } else {
            html.push_str(&format!(
                r#"<span class="token {}">{}</span>"#,
                class, escaped
            ));
        }

        last_index = end;
    }

    if last_index < code.len() {
        html.push_str(&escape_html(&code[last_index..]));
    }

    html = html.replace("\n\n", "\n<span class=\"empty-line\"> </span>\n");

    html
}

#[tauri::command]
fn get_opened_files(editor: tauri::State<Arc<Mutex<Editor>>>) -> Vec<File> {
    let editor = editor.lock().unwrap();
    editor.files_opened.clone()
}

#[tauri::command]
fn get_directory_tree(editor: tauri::State<Arc<Mutex<Editor>>>) -> Result<DirEntry, String> {
    let mut editor = editor.lock().unwrap();
    let current_directory = editor.current_directory.clone();
    println!("current directory: {:#?}", current_directory);
    editor
        .get_directory_tree(&current_directory)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn read_file_content(path: String) -> Result<String, String> {
    let mut f = std::fs::File::open(path).unwrap();
    let mut buffer = String::new();

    match f.read_to_string(&mut buffer) {
        Ok(_) => (),
        Err(e) => return Err(format!("Failed to read file: {}", e)),
    };
    Ok(buffer)
}

#[tauri::command]
fn search_files(editor: tauri::State<Arc<Mutex<Editor>>>, query: String) -> Vec<File> {
    let mut editor = editor.lock().unwrap();
    editor.search_files(query)
}

#[tauri::command]
fn search_files_by_name(editor: tauri::State<Arc<Mutex<Editor>>>, query: String) -> Vec<File> {
    let mut editor = editor.lock().unwrap();
    editor.search_files_by_name(query)
}

#[tauri::command]
fn change_directory(editor: tauri::State<Arc<Mutex<Editor>>>, path: String) {
    let mut editor = editor.lock().unwrap();
    editor.change_directory(path)
}

#[tauri::command]
fn find_matches_in_file(content: String, query: String) -> Vec<usize> {
    if query.trim().is_empty() || content.is_empty() {
        return vec![];
    }

    let lower_content = content.to_lowercase();
    let lower_query = query.to_lowercase();
    let mut indices = Vec::new();
    let mut index = 0;

    while let Some(pos) = lower_content[index..].find(&lower_query) {
        let match_index = index + pos;
        indices.push(match_index);
        index = match_index + lower_query.len();

        if index >= lower_content.len() {
            break;
        }
    }

    indices
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let menu = MenuBuilder::new(app)
                .text("open", "Open")
                .text("close", "Close")
                .build()?;

            app.set_menu(menu)?;

            app.on_menu_event(move |app_handle: &tauri::AppHandle, event| {
                println!("menu event: {:?}", event.id());

                match event.id().0.as_str() {
                    "open" => {
                        println!("open event");
                    }
                    "close" => {
                        println!("close event");
                    }
                    _ => {
                        println!("unexpected menu event");
                    }
                }
            });

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .manage(Arc::new(Mutex::new(Editor::new())))
        .invoke_handler(tauri::generate_handler![
            highlight_ast,
            get_opened_files,
            get_directory_tree,
            read_file_content,
            search_files,
            search_files_by_name,
            find_matches_in_file,
            highlight_html,
            change_directory
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
