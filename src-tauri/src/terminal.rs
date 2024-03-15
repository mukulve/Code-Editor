use std::process::Command;

#[tauri::command]
pub fn run_command(command: String) -> Result<String, String> {
    let output = if cfg!(target_os = "windows") {
        let splitted_command = command.split_whitespace().collect::<Vec<&str>>();
        let mut command = vec!["/C"];
        command.extend(splitted_command);

        Command::new("cmd")
            .args(command)
            .output()
            .expect("failed to execute process")
    } else {
        let splitted_command = command.split_whitespace().collect::<Vec<&str>>();
        let mut command = vec!["-c"];
        command.extend(splitted_command);

        Command::new("sh")
            .args(command)
            .output()
            .expect("failed to execute process")
    };

    let stdout = String::from_utf8_lossy(&output.stdout).into_owned();
    let stderr = String::from_utf8_lossy(&output.stderr).into_owned();

    if output.status.success() {
        Ok(stdout)
    } else {
        Err(stderr)
    }
}
