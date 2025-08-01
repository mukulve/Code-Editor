mod helper;
mod structs;
mod terminal;
mod impls;
mod cache;
mod errors;

use crate::errors::GlobalError;
use crate::helper::{calculate_edit, collect, escape_html, get_language_object, sanitize_class};
use crate::structs::{DirEntry, Editor, File, Terminal};
use crate::terminal::{start_terminal, write_to_terminal};
use cached::proc_macro::cached;
use lazy_static::lazy_static;
use tauri::Manager;
use std::collections::HashMap;
use std::io::Read;
use std::sync::{Arc, Mutex};
use std::time::Instant;
use tree_sitter::{Parser, Tree};

lazy_static! {
    static ref PARSERS: Mutex<HashMap<String, Parser>> = Mutex::new(HashMap::new());
    static ref TREES: Mutex<HashMap<String, Tree>> = Mutex::new(HashMap::new());
    static ref FILE_CONTENTS: Mutex<HashMap<String, String>> = Mutex::new(HashMap::new());
    pub static ref APP_HANDLE: Mutex<Option<tauri::AppHandle>> = Mutex::new(None);

    pub static ref DIRECTORY_CACHE: Mutex<DirEntry> = Mutex::new(DirEntry::new());
    pub static ref FILES_CACHE: Mutex<HashMap<String, String>> = Mutex::new(HashMap::new());
}

#[tauri::command]
fn highlight_ast(code: String, language: String, path: String) -> Result<Vec<(usize, usize, String)>, GlobalError> {
    
    let mut parsers = PARSERS.lock().unwrap();
    let mut trees = TREES.lock().unwrap();
    let mut file_contents = FILE_CONTENTS.lock().unwrap();

    if !parsers.contains_key(&language) {
        let mut parser = Parser::new();
        let lang = get_language_object(&language);
        parser.set_language(&lang)?;
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
        return Ok(results);
    }

    return Ok(vec![]);
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

    if code.len() > 500000 {
        return escape_html(&code).replace("\n\n", "\n<span class=\"empty-line\"> </span>\n");
    }

    let spans = match  highlight_ast(code.clone(), language, path) {
        Ok(spans) => spans,
        Err(_) => return escape_html(&code).replace("\n\n", "\n<span class=\"empty-line\"> </span>\n"),
    };

    let mut html = String::with_capacity(code.len() * 2); 
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
    let directory = editor
        .get_directory_tree(&current_directory)
        .map_err(|e| e.to_string());
    directory
}

#[tauri::command]
fn read_file_content(path: String) -> Result<String, String> {
    let mut f = match  std::fs::File::open(path.clone()) {
        Ok(f) => f,
        Err(e) => {
            FILES_CACHE.lock().unwrap().remove(&path);
            return Err(format!("Failed to open file: {}", e));
        },
    };

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

#[tauri::command]
fn get_git_changes(editor: tauri::State<Arc<Mutex<Editor>>>) -> Result<Vec<String>, GlobalError> {
    let mut editor = editor.lock().unwrap();
    editor.get_git_changes()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let mut app_handle = APP_HANDLE.lock().unwrap();
            *app_handle = Some(app.app_handle().clone());
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .manage(Arc::new(Mutex::new(Editor::new())))
        .manage(Arc::new(Mutex::new(Terminal::new())))
        .invoke_handler(tauri::generate_handler![
            highlight_ast,
            get_opened_files,
            get_directory_tree,
            read_file_content,
            search_files,
            search_files_by_name,
            find_matches_in_file,
            highlight_html,
            change_directory,
            write_to_terminal,
            start_terminal,
            get_git_changes
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
