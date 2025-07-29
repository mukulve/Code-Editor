use portable_pty::{CommandBuilder, NativePtySystem, PtySize, PtySystem};
use std::sync::{Arc, Mutex};
use std::io::{Read, Write};
use tauri::{Emitter, State};

use crate::structs::Terminal;
use crate::APP_HANDLE;

#[tauri::command]
pub fn start_terminal(state: tauri::State<Arc<Mutex<Terminal>>>) {
    let state = Arc::clone(&state); 
    std::thread::spawn(move || {
        let pty_system = NativePtySystem::default();
        let pair = pty_system.openpty(PtySize {
            rows: 30,
            cols: 100,
            pixel_width: 0,
            pixel_height: 0,
        }).unwrap();

        let mut child = pair.slave.spawn_command(CommandBuilder::new("bash")).unwrap();
        let mut reader = pair.master.try_clone_reader().unwrap();
        let writer = pair.master.take_writer().unwrap();
        state.lock().unwrap().writer = Some(Arc::new(Mutex::new(writer)));

        let mut buf = [0u8; 1024];
        loop {
            if let Ok(size) = reader.read(&mut buf) {
                if size == 0 {
                    break;
                }
                let output = String::from_utf8_lossy(&buf[..size]).to_string();
                let app_guard = APP_HANDLE.lock().unwrap();
                if let Some(app) = app_guard.as_ref() {
                    app.emit("terminal-output", output).unwrap();
                }
            }
        }

        let _ = child.wait();
    });
}

#[tauri::command]
pub fn write_to_terminal(input: String, state: State<Arc<Mutex<Terminal>>>) {
    if let Some(writer) = &state.lock().unwrap().writer {
        let mut writer = writer.lock().unwrap();
        let _ = writer.write_all(input.as_bytes());
    }
}