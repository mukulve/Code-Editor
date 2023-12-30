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
    pub fn addLog(&mut self, content: String) {
        let time = SystemTime::now();
        let log = Log {
            time: time,
            message: content,
        };
        self.logs.push(log);
    }

    pub fn getLogs(&self) -> &Vec<Log> {
        &self.logs
    }
}
