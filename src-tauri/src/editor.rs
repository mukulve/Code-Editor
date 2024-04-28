use std::sync::Arc;
use std::sync::Mutex;

use crate::errors;
use cached::proc_macro::cached;
use rayon::iter::IntoParallelRefIterator;
use rayon::iter::ParallelIterator;
use regex::Regex;
use std::collections::HashSet;

#[cached]
pub fn highlight_line(content: String) -> String {
    let declarations = vec!["fn", "let", "mut", "function", "var", "const", "pub"];
    let types = vec![
        "i32",
        "i64",
        "f32",
        "f64",
        "u32",
        "u64",
        "usize",
        "isize",
        "bool",
        "char",
        "void",
        "int",
        "str",
        "long",
        "double",
        "float",
        "unsigned",
        "signed",
        "short",
        "byte",
        "null",
        "nil",
        "true",
        "false",
        "undefined",
        "NaN",
        "Infinity",
        "enum",
        "struct",
        "union",
        "type",
        "interface",
        "class",
        "Option",
    ];
    let loops = vec!["for", "while", "loop", "do", "break", "continue"];
    let conditions = vec!["if", "else", "match", "case", "default", "switch"];
    let keywords = vec![
        "return",
        "yield",
        "await",
        "async",
        "try",
        "catch",
        "throw",
        "import",
        "export",
        "use",
        "from",
        "public",
        "mod",
        "pub",
        "public",
        "private",
        "protected",
        "static",
        "final",
    ];
    let operators = vec![
        "+", "-", "*", "/", "%", "++", "--", "==", "!=", ">", "<", ">=", "<=", "&&", "||", "!",
        "&", "|", "^", "<<", ">>", ">>>", "~", "=>", "=", "+=", "-=", "*=", "/=", "%=", "&=", "|=",
        "^=", "<<=", ">>=", ">>>=", ":", "?", "::", ".", ",", ";", "(", ")", "{", "}", "[", "]",
    ];

    let words = content
        .split(" ")
        .map(|f| f.to_owned())
        .collect::<Vec<String>>();
    let mut new_words = Vec::new();

    for word in words {
        if declarations.contains(&word.as_str()) || keywords.contains(&word.as_str()) {
            new_words.push(format!("<span class=\"text-primary\">{}</span>", word));
        } else if types.contains(&word.as_str())
            || loops.contains(&word.as_str())
            || conditions.contains(&word.as_str())
            || word.starts_with("\"")
            || word.ends_with("\"")
        {
            new_words.push(format!("<span class=\"text-secondary\">{}</span>", word));
        } else if operators.contains(&word.as_str()) || word.parse::<f64>().is_ok() {
            new_words.push(format!("<span class=\"text-accent\">{}</span>", word));
        } else if word.starts_with("http://") || word.starts_with("https://") {
            new_words.push(format!(
                "<span class=\"text-accent underline\">{}</span>",
                word
            ));
        } else {
            new_words.push(word);
        }
    }
    format!("<span>{}</span>", new_words.join(" "))
}

#[tauri::command]
#[cached]
pub fn highlight_code(content: String) -> Result<Vec<String>, ()> {
    let new_content = content
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\"", "&quot;");

    let regex = Regex::new(r"\r?\n").unwrap();

    let lines: Vec<String> = regex.split(&new_content).map(|f| f.to_owned()).collect();

    //check if the content is very large
    if lines.len() > 5000 {
        return Ok(lines);
    }

    let new_lines = lines
        .par_iter()
        .map(|f| highlight_line(f.to_string()))
        .collect();

    Ok(new_lines)
}

#[tauri::command]
#[cached]
pub fn get_suggestions(content: String, word: String) -> HashSet<String> {
    let suggestions = Arc::new(Mutex::new(HashSet::new()));
    let words = content
        .split_whitespace()
        .map(|f| f.to_owned())
        .map(|f| f.to_lowercase())
        .collect::<Vec<String>>();
    let word_lower = word.to_lowercase();

    words.par_iter().for_each(|w| {
        if w.starts_with(&word_lower) {
            suggestions.lock().unwrap().insert(w.to_owned());
        }
    });

    suggestions.lock().unwrap().remove(&word_lower);

    let x = suggestions.lock().unwrap().to_owned();
    x
}
