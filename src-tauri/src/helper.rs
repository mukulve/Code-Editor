use tree_sitter::{Language, Point};

pub fn get_language_object(language: &str) -> Language {
    match language {
        "rust" => tree_sitter_rust::LANGUAGE.into(),
        "python" => tree_sitter_python::LANGUAGE.into(),
        "c" => tree_sitter_c::LANGUAGE.into(),
        "java" => tree_sitter_java::LANGUAGE.into(),
        "c_sharp" => tree_sitter_c_sharp::LANGUAGE.into(),
        "sequel" => tree_sitter_sequel::LANGUAGE.into(),
        _ => tree_sitter_typescript::LANGUAGE_TYPESCRIPT.into(),
    }
}

pub fn collect(node: tree_sitter::Node, _src: &str, out: &mut Vec<(usize, usize, String)>) {
    if node.child_count() == 0 {
        let kind = node.kind().to_string();
        out.push((node.start_byte(), node.end_byte(), kind));
    } else {
        let mut cursor = node.walk();
        for child in node.children(&mut cursor) {
            collect(child, _src, out);
        }
    }
}

pub fn escape_html(text: &str) -> String {
    text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
}

pub fn sanitize_class(kind: &str) -> String {
    kind.chars()
        .map(|c| {
            if c.is_ascii_alphanumeric() || c == '-' || c == '_' {
                c.to_string()
            } else {
                format!("_{}", c as u32)
            }
        })
        .collect()
}

pub fn calculate_edit(old_code: &str, new_code: &str) -> Option<tree_sitter::InputEdit> {
    let old_bytes = old_code.as_bytes();
    let new_bytes = new_code.as_bytes();

    let mut start = 0;
    let min_len = old_bytes.len().min(new_bytes.len());

    while start < min_len && old_bytes[start] == new_bytes[start] {
        start += 1;
    }

    let mut old_end = old_bytes.len();
    let mut new_end = new_bytes.len();

    while old_end > start && new_end > start && old_bytes[old_end - 1] == new_bytes[new_end - 1] {
        old_end -= 1;
        new_end -= 1;
    }

    if start == old_end && start == new_end {
        return None;
    }

    Some(tree_sitter::InputEdit {
        start_byte: start,
        old_end_byte: old_end,
        new_end_byte: new_end,
        start_position: byte_to_point(old_code, start),
        old_end_position: byte_to_point(old_code, old_end),
        new_end_position: byte_to_point(new_code, new_end),
    })
}

fn byte_to_point(text: &str, byte_offset: usize) -> Point {
    let mut row = 0;
    let mut last_newline_byte = 0;
    for (i, byte) in text.bytes().enumerate() {
        if i >= byte_offset {
            break;
        }
        if byte == b'\n' {
            row += 1;
            last_newline_byte = i + 1;
        }
    }
    let column = byte_offset - last_newline_byte;
    Point::new(row, column)
}