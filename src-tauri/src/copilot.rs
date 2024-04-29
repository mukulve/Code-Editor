use crate::{emit_event, errors};
use lazy_static::lazy_static;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;

lazy_static! {
    static ref ACCESSTOKEN: Arc<Mutex<Option<String>>> = Arc::new(Mutex::new(None));
}

// Based on https://github.com/B00TK1D/copilot-api/ written in Python
#[derive(Clone, serde::Serialize, serde::Deserialize)]
struct TokenJson {
    annotations_enabled: bool,
    chat_enabled: bool,
    chat_jetbrains_enabled: bool,
    code_quote_enabled: bool,
    codesearch: bool,
    copilot_ide_agent_chat_gpt4_small_prompt: bool,
    copilotignore_enabled: bool,
    expires_at: i32,
    individual: bool,
    nes_enabled: bool,
    prompt_8k: bool,
    public_suggestions: String,
    refresh_in: i32,
    sku: String,
    snippy_load_test_enabled: bool,
    telemetry: String,
    token: String,
    tracking_id: String,
    vsc_electron_fetcher: bool,
}

#[derive(Clone, serde::Serialize, serde::Deserialize)]
struct Extra {
    language: String,
}

impl Extra {
    fn new(language: String) -> Self {
        Self { language }
    }
}

#[derive(Clone, serde::Serialize, serde::Deserialize)]
struct CopilotJson {
    prompt: String,
    suffix: String,
    max_tokens: i32,
    temperature: i32,
    top_p: i32,
    n: i32,
    stop: Vec<char>,
    nwo: String,
    stream: bool,
    extra: Extra,
}

#[derive(Clone, serde::Serialize, serde::Deserialize)]
struct JsonChoice {
    text: String,
    index: i32,
    finish_reason: Option<String>,
    logprobs: Option<HashMap<String, f32>>,
}

#[derive(Clone, serde::Serialize, serde::Deserialize)]
struct JsonCompletion {
    id: String,
    created: i32,
    choices: Vec<JsonChoice>,
}

#[derive(Clone, serde::Serialize, serde::Deserialize)]
struct Setup {
    device_code: String,
    user_code: String,
    verification_uri: String,
    expires_in: i32,
    interval: i32,
}

#[derive(Clone, serde::Serialize, serde::Deserialize)]
struct Login {
    error: Option<String>,
    error_description: Option<String>,
    error_uri: Option<String>,
    access_token: Option<String>,
    token_type: Option<String>,
    scope: Option<String>,
}

impl CopilotJson {
    fn new(prompt: String, language: String) -> Self {
        Self {
            prompt,
            suffix: "".to_string(),
            max_tokens: 1000,
            temperature: 0,
            top_p: 1,
            n: 1,
            stop: vec!['\n'],
            nwo: "github/copilot.vim".to_string(),
            stream: true,
            extra: Extra::new(language),
        }
    }
}

async fn setup() -> Result<String, errors::Error> {
    if ACCESSTOKEN.lock().await.is_some() {
        return Ok(ACCESSTOKEN.lock().await.clone().unwrap());
    }

    let mut token = String::new();
    let client = reqwest::Client::new();
    let res = client
        .post("https://github.com/login/device/code")
        .header("accept", "application/json")
        .header("editor-version", "Neovim/0.6.1")
        .header("editor-plugin-version", "copilot.vim/1.16.0")
        .header("content-type", "application/json")
        .header("user-agent", "GithubCopilot/1.155.0")
        .body("{\"client_id\":\"Iv1.b507a08c87ecfe98\",\"scope\":\"read:user\"}")
        .send()
        .await?
        .text()
        .await?;

    let setup = serde_json::from_str::<Setup>(&res)?;
    let device_code = setup.device_code;
    let user_code = setup.user_code;
    let verification_uri = setup.verification_uri;

    println!(
        "Please visit {} and enter the code {}",
        verification_uri, user_code
    );

    emit_event(
        "copilot-event".to_string(),
        format!(
            "Please visit {} and enter the code {}",
            verification_uri, user_code
        ),
    )?;

    loop {
        //sleep for interval
        tokio::time::sleep(std::time::Duration::from_secs(10)).await;

        let res = client
            .post("https://github.com/login/oauth/access_token")
            .header("accept", "application/json")
            .header("editor-version", "Neovim/0.6.1")
            .header("editor-plugin-version", "copilot.vim/1.16.0")
            .header("content-type", "application/json")
            .header("user-agent", "GithubCopilot/1.155.0")
            .body(format!("{{\"client_id\":\"Iv1.b507a08c87ecfe98\",\"device_code\":\"{device_code}\",\"grant_type\":\"urn:ietf:params:oauth:grant-type:device_code\"}}"))
            .send()
            .await?
            .text()
            .await?;

        let login = serde_json::from_str::<Login>(&res)?;
        if login.access_token.is_some() {
            token = login.access_token.unwrap();
            break;
        }
    }

    emit_event("copilot-event".to_string(), "Logged in".to_string())?;

    ACCESSTOKEN.lock().await.replace(token.clone());

    Ok(token)
}

async fn get_token() -> Result<String, errors::Error> {
    let access_token = setup().await.unwrap();

    let client = reqwest::Client::new();
    let response = client
        .get("https://api.github.com/copilot_internal/v2/token")
        .header("authorization", format!("token {}", access_token))
        .header("editor-version", "Neovim/0.6.1")
        .header("editor-plugin-version", "copilot.vim/1.16.0")
        .header("user-agent", "GithubCopilot/1.155.0")
        .send()
        .await?
        .text()
        .await?;

    let json = serde_json::from_str::<TokenJson>(&response)?;
    Ok(json.token)
}

#[tauri::command]
pub async fn copilot(prompt: String, language: String) -> Result<String, errors::Error> {
    let token = get_token().await?;
    let client = reqwest::Client::new();
    let json = CopilotJson::new(prompt, language);

    let response = client
        .post("https://copilot-proxy.githubusercontent.com/v1/engines/copilot-codex/completions")
        .header("authorization", format!("Bearer {}", token))
        .json(&json)
        .send()
        .await?
        .text()
        .await?;

    println!("{}", response);

    let mut result = String::new();
    let response_splitted = response.split("\n").collect::<Vec<&str>>();
    for line in response_splitted {
        if line.starts_with("data: {") {
            let json_completion = line[6..].to_string();
            match serde_json::from_str::<JsonCompletion>(&json_completion) {
                Ok(completion) => {
                    let text = completion.choices[0].text.clone();
                    result.push_str(&text);
                }
                Err(_) => {
                    result.push_str("\n");
                }
            }
        }
    }
    Ok(result)
}
