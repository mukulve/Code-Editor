use std::io;

use thiserror::Error;
 
#[derive(Debug, Error)]
pub enum GlobalError {
    #[error(transparent)]
    File(#[from] io::Error),

    #[error(transparent)]
    Serde(#[from] serde_json::Error),

    #[error(transparent)]
    TreeSitter(#[from] tree_sitter::LanguageError),

    #[error(transparent)]
    Notify(#[from] notify::Error),

    #[error(transparent)]
    WalkDir(#[from] walkdir::Error),

    #[error(transparent)]
    Rayon(#[from] rayon::ThreadPoolBuildError),

    #[error(transparent)]
    Tauri(#[from] tauri::Error),

    #[error(transparent)]
    Git2(#[from] git2::Error),
}
 
 
impl serde::Serialize for GlobalError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}