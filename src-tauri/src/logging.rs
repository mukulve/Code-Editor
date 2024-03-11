use std::time::SystemTime;
#[derive(Clone, serde::Serialize)]
pub struct Log {
    pub time: SystemTime,
    pub message: String,
}
#[derive(Clone, serde::Serialize)]
pub struct Logs {
    pub logs: Vec<Log>,
}

impl Logs {
    pub fn add_log(&mut self, content: String) {
        let time = SystemTime::now();
        let log = Log {
            time,
            message: content,
        };
        self.logs.push(log);
    }

    /// Returns a reference to the get logs of this [`Logs`].
    pub fn get_logs(&self) -> &Vec<Log> {
        &self.logs
    }
}
