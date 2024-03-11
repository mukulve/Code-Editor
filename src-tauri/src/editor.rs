use crate::errors;
use cached::proc_macro::cached;
use regex::Regex;

#[tauri::command]
#[cached]
pub fn highlight_code(content: String) -> Result<Vec<String>, ()> {
    let new_content = content
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\"", "&quot;");
    let regex = Regex::new(r"\r?\n").unwrap();
    let declarations = vec!["fn", "let", "mut", "function", "var", "const"];
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
    ];
    let loops = vec!["for", "while", "loop", "do", "break", "continue"];
    let conditions = vec!["if", "else", "match", "case", "default", "switch"];
    let keywords = vec![
        "return", "yield", "await", "async", "try", "catch", "throw", "import", "export", "use",
        "from",
    ];
    let operators = vec![
        "+", "-", "*", "/", "%", "++", "--", "==", "!=", ">", "<", ">=", "<=", "&&", "||", "!",
        "&", "|", "^", "<<", ">>", ">>>", "~", "=>", "=", "+=", "-=", "*=", "/=", "%=", "&=", "|=",
        "^=", "<<=", ">>=", ">>>=", ":", "?", "::", ".", ",", ";", "(", ")", "{", "}", "[", "]",
    ];

    let lines: Vec<String> = regex.split(&new_content).map(|f| f.to_owned()).collect();
    let mut new_lines = Vec::new();

    for line in lines {
        let words = line
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
            {
                new_words.push(format!("<span class=\"text-secondary\">{}</span>", word));
            } else if operators.contains(&word.as_str()) || word.parse::<f64>().is_ok() {
                new_words.push(format!("<span class=\"text-accent\">{}</span>", word));
            } else {
                new_words.push(word);
            }
        }

        new_lines.push(format!("<span>{}</span>", new_words.join(" ")));
    }

    Ok(new_lines)
}
