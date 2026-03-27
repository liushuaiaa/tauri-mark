use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Memo {
    pub id: String,
    pub title: String,
    pub content: String,
    pub created_at: i64,
    pub updated_at: i64,
}

fn get_memo_file_path(app_handle: &tauri::AppHandle) -> PathBuf {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .expect("Failed to get app data dir");
    fs::create_dir_all(&app_dir).ok();
    app_dir.join("memos.json")
}

#[tauri::command]
fn get_memos(app_handle: tauri::AppHandle) -> Vec<Memo> {
    let path = get_memo_file_path(&app_handle);
    if !path.exists() {
        return vec![];
    }
    let data = fs::read_to_string(&path).unwrap_or_default();
    serde_json::from_str(&data).unwrap_or_default()
}

#[tauri::command]
fn save_memo(app_handle: tauri::AppHandle, memo: Memo) -> Result<(), String> {
    let path = get_memo_file_path(&app_handle);
    let mut memos: Vec<Memo> = if path.exists() {
        let data = fs::read_to_string(&path).map_err(|e| e.to_string())?;
        serde_json::from_str(&data).unwrap_or_default()
    } else {
        vec![]
    };

    if let Some(pos) = memos.iter().position(|m| m.id == memo.id) {
        memos[pos] = memo;
    } else {
        memos.push(memo);
    }

    let json = serde_json::to_string_pretty(&memos).map_err(|e| e.to_string())?;
    fs::write(&path, json).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn delete_memo(app_handle: tauri::AppHandle, id: String) -> Result<(), String> {
    let path = get_memo_file_path(&app_handle);
    if !path.exists() {
        return Ok(());
    }
    let data = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let mut memos: Vec<Memo> = serde_json::from_str(&data).unwrap_or_default();
    memos.retain(|m| m.id != id);
    let json = serde_json::to_string_pretty(&memos).map_err(|e| e.to_string())?;
    fs::write(&path, json).map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_memos, save_memo, delete_memo])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
